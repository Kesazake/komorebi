/**
 * Sätteri hast 插件：把带 alt 的图片转换为 figure + figcaption
 *
 * 背景：Markdown 的 `![图注](x.png)` 只输出 `<img alt="图注">`，
 * 而 <img> 是替换元素，不渲染 ::before / ::after，
 * 所以纯 CSS 无法把 alt 显示成可见文字。
 *
 * 方案：在 HAST 阶段替换节点
 *   <img src alt="图注">
 *     ↓
 *   <figure>
 *     <img src alt="">
 *     <figcaption>图注</figcaption>
 *   </figure>
 *
 * alt 清空的原因：figcaption 已提供可见文字，
 * 保留 alt 会让屏幕阅读器重复朗读（WAI 推荐）。
 *
 * 注意：「图片是否独占段落」不做判断，交由作者在 Markdown 里自行安排。
 */

import type { Element } from 'hast';
import { defineHastPlugin } from 'satteri';

/** 只需要用到的 hast 节点形态 */
interface HastElementLike {
  type: 'element';
  tagName: string;
  properties: Record<string, unknown>;
  children: unknown[];
}

function isImg(node: unknown): node is Element {
  return (
    typeof node === 'object' &&
    node !== null &&
    (node as { type?: string }).type === 'element' &&
    (node as { tagName?: string }).tagName === 'img'
  );
}

export default function rehypeLikeFigure() {
  return defineHastPlugin({
    name: 'komorebi:figure',
    element: {
      filter: ['img'],
      visit(node, ctx) {
        if (!isImg(node)) return;

        const alt = node.properties?.alt;

        // 没有 alt 或为空：保持原样
        if (alt === undefined || alt === null || String(alt).trim() === '') {
          return;
        }

        const figure: HastElementLike = {
          type: 'element',
          tagName: 'figure',
          properties: {},
          children: [
            {
              type: 'element',
              tagName: 'img',
              properties: { ...node.properties, alt: '' },
              children: [],
            },
            {
              type: 'element',
              tagName: 'figcaption',
              properties: {},
              children: [{ type: 'text', value: String(alt) }],
            },
          ],
        };

        // 用一个节点替换 img 本身
        ctx.replaceNode(node, figure as never);
      },
    },
  });
}
