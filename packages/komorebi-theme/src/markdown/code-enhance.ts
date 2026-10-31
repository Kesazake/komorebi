/**
 * Sätteri hast 插件：代码块增强
 *
 * 1. 折叠：超过 N 行的代码块默认收起，显示前若干行
 * 2. 复制：在代码块右上角注入一个复制按钮
 *
 * 折叠用 checkbox + label 实现（纯 CSS），不用 details：
 * details 关闭时浏览器完全不渲染其内容，
 * 无法实现「折叠时仍显示预览行」的效果。
 *
 * 复制按钮的行为由 runtime 脚本处理（[data-copy-code]），
 * 插件只负责把按钮放进 DOM，保证 SSR 时按钮已存在、不会闪烁。
 */

import { defineHastPlugin } from 'satteri';

/** 超过此行数才折叠 */
const LINE_THRESHOLD = 15;
/** 折叠时可见行数 */
const PREVIEW_LINES = 8;

interface HastElementLike {
  type: 'element';
  tagName: string;
  properties: Record<string, unknown>;
  children: unknown[];
}

interface HastTextLike {
  type: 'text';
  value: string;
}

/**
 * 取元素的 class 列表。
 *
 * hast 里 class 可能以 `class` 或 `className` 存放，值可能是字符串、
 * 数组或逗号分隔的字符串，这里统一拆成数组。
 */
function getClasses(node: HastElementLike): string[] {
  const raw = node.properties?.class ?? node.properties?.className;
  if (Array.isArray(raw)) return raw.map(String);
  return String(raw ?? '')
    .split(/[\s,]+/)
    .filter(Boolean);
}

function isElement(node: unknown): node is HastElementLike {
  return (
    typeof node === 'object' &&
    node !== null &&
    (node as { type?: string }).type === 'element'
  );
}

/**
 * 统计代码块的行数。
 *
 * 优先数 span.line 的个数——shiki 每一行输出一个 span.line，
 * 这是最可靠的依据；数文本节点里的换行符会受换行节点是否已清理影响。
 */
function countLines(pre: HastElementLike): number {
  let lines = 0;
  const walk = (n: unknown) => {
    if (!isElement(n)) return;
    if (getClasses(n).includes('line')) lines += 1;
    for (const child of n.children) walk(child);
  };
  walk(pre);
  return Math.max(1, lines);
}

/** 复制按钮 */
function createCopyButton(): HastElementLike {
  return {
    type: 'element',
    tagName: 'button',
    properties: {
      type: 'button',
      class: 'code-copy',
      'data-copy-code': '',
      'aria-label': '复制代码',
      title: '复制代码',
    },
    children: [
      // 图标：两个重叠的方框（复制）
      {
        type: 'element',
        tagName: 'svg',
        properties: {
          width: '14',
          height: '14',
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '2',
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          'aria-hidden': 'true',
        },
        children: [
          {
            type: 'element',
            tagName: 'rect',
            properties: { x: '9', y: '9', width: '13', height: '13', rx: '2' },
            children: [],
          },
          {
            type: 'element',
            tagName: 'path',
            properties: {
              d: 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1',
            },
            children: [],
          },
        ],
      },
    ],
  };
}

/**
 * 折叠结构（不用 <details>）
 *
 * 为什么不用 <details>：关闭状态下浏览器完全不渲染非 summary 内容，
 * 无法实现"折叠时仍显示前 8 行"的预览效果。
 *
 * 改用 checkbox hack：
 *   <div class="code-collapse">
 *     <input type="checkbox" id="..." class="code-collapse__state">
 *     <pre>…</pre>
 *     <label for="..." class="code-collapse__toggle">展开全部</label>
 *   </div>
 *
 * checkbox 由 CSS :checked 控制 pre 的 max-height，纯 CSS、无 JS、可访问。
 */
let collapseSeq = 0;

function wrapCollapsible(pre: HastElementLike): HastElementLike {
  const id = `code-collapse-${++collapseSeq}`;

  return {
    type: 'element',
    tagName: 'div',
    properties: { class: 'code-collapse' },
    children: [
      {
        type: 'element',
        tagName: 'input',
        properties: {
          type: 'checkbox',
          id,
          class: 'code-collapse__state',
        },
        children: [],
      },
      pre,
      {
        type: 'element',
        tagName: 'label',
        properties: {
          for: id,
          class: 'code-collapse__toggle',
        },
        children: [
          {
            type: 'element',
            tagName: 'span',
            properties: { class: 'code-collapse__label-expand' },
            children: [{ type: 'text', value: '展开全部' }],
          },
          {
            type: 'element',
            tagName: 'span',
            properties: { class: 'code-collapse__label-collapse' },
            children: [{ type: 'text', value: '收起' }],
          },
        ],
      },
    ],
  };
}

/**
 * 复制节点树，丢弃 span.line 之间夹着的纯换行文本节点。
 *
 * shiki 输出形如：<span class="line">…</span>\n<span class="line">…</span>
 * 这些 \n 是普通文本节点，一旦把 .line 设为 display:block，
 * 它们就会各自撑出一个空行，行距翻倍。
 *
 * satteri 传入的节点是只读的，不能就地修改，
 * 因此在这里构造一棵过滤后的新树，交给 ctx.replaceNode。
 */
function cloneWithoutLineBreaks(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(cloneWithoutLineBreaks);
  if (!isElement(node)) return node;

  const children: unknown[] = [];
  for (const child of node.children) {
    const isBlankText =
      typeof child === 'object' &&
      child !== null &&
      (child as { type?: string }).type === 'text' &&
      /^\s*\n\s*$/.test(String((child as HastTextLike).value ?? ''));
    if (isBlankText) continue;
    children.push(cloneWithoutLineBreaks(child));
  }

  return {
    type: 'element',
    tagName: node.tagName,
    properties: { ...node.properties },
    children,
  };
}

export default function codeEnhance() {
  return defineHastPlugin({
    name: 'komorebi:code-enhance',
    element: {
      filter: ['pre'],
      visit(node, ctx) {
        if (!isElement(node)) return;

        if (!getClasses(node).includes('astro-code')) return;

        // span.line 之间的换行节点在 display:block 下会撑出空行，重建时清掉
        const pre = cloneWithoutLineBreaks(node) as HastElementLike;

        // 在代码块内部包一层容器，便于定位复制按钮
        const lineCount = countLines(pre);
        const needsCollapse = lineCount > LINE_THRESHOLD;

        // 语言标签要定位在代码块右侧的留白条里，
        // 那儿在滚动容器之外，所以把语言名提到外层容器上。
        const lang = pre.properties?.['data-language'];
        const wrapper: HastElementLike = {
          type: 'element',
          tagName: 'div',
          properties: {
            class: 'code-block',
            'data-line-count': String(lineCount),
            ...(lang ? { 'data-language': String(lang) } : {}),
          },
          children: [
            needsCollapse ? wrapCollapsible(pre) : pre,
            createCopyButton(),
          ],
        };

        ctx.replaceNode(node, wrapper as never);
      },
    },
  });
}

export { LINE_THRESHOLD, PREVIEW_LINES };
