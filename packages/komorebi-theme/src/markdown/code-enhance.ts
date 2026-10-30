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

function isElement(node: unknown): node is HastElementLike {
  return (
    typeof node === 'object' &&
    node !== null &&
    (node as { type?: string }).type === 'element'
  );
}

/** 统计代码块的行数：遍历所有 text 节点，累加换行符 */
function countLines(node: HastElementLike): number {
  let lines = 0;
  const walk = (n: unknown) => {
    if (!isElement(n)) {
      if (
        typeof n === 'object' &&
        n !== null &&
        (n as { type?: string }).type === 'text'
      ) {
        const value = String((n as HastTextLike).value ?? '');
        lines += value.split('\n').length - 1;
      }
      return;
    }
    for (const child of n.children) walk(child);
  };
  walk(node);
  // 至少一行
  return Math.max(1, lines + 1);
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

export default function codeEnhance() {
  return defineHastPlugin({
    name: 'komorebi:code-enhance',
    element: {
      filter: ['pre'],
      visit(node, ctx) {
        if (!isElement(node)) return;

        const classes = node.properties?.class;
        const classList = Array.isArray(classes)
          ? classes.map(String)
          : String(classes ?? '').split(/\s+/);
        if (!classList.includes('astro-code')) return;

        // 在代码块内部包一层容器，便于定位复制按钮
        const lineCount = countLines(node);
        const needsCollapse = lineCount > LINE_THRESHOLD;

        const wrapper: HastElementLike = {
          type: 'element',
          tagName: 'div',
          properties: {
            class: 'code-block',
            'data-line-count': String(lineCount),
          },
          children: [
            needsCollapse ? wrapCollapsible(node) : node,
            createCopyButton(),
          ],
        };

        ctx.replaceNode(node, wrapper as never);
      },
    },
  });
}

export { LINE_THRESHOLD, PREVIEW_LINES };
