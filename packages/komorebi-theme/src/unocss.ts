import {
  presetAttributify,
  presetIcons,
  presetTypography,
  presetWind4,
  transformerDirectives,
} from 'unocss';

export function createKomorebiUnoOptions(
  filesystem: string[],
  safelist: string[] = [],
) {
  return {
    injectReset: true,
    content: {
      filesystem,
    },
    safelist,
    presets: [
      presetWind4(),
      presetAttributify(),
      presetIcons({
        extraProperties: {
          display: 'inline-block',
          'vertical-align': '-0.1em',
          'margin-inline-start': '0.15em',
          height: '1cap',
          width: 'auto',
          'aspect-ratio': '1',
        },
      }),
      presetTypography({
        cssExtend: {
          ':is(h2, h3, h4)[id]': {
            'scroll-margin-top': '7rem',
          },
          p: {
            'margin-top': '1.5rem',
            'margin-bottom': '1.5rem',
          },
          a: {
            color: 'var(--color-link)',
            'font-weight': '500',
            'text-decoration': 'underline',
            'text-decoration-color': 'var(--color-link-decoration)',
            'text-underline-offset': '0.25rem',
          },
          strong: {
            'font-weight': '600',
            color: 'var(--color-blockquote-text)',
          },
          em: {
            color: 'var(--color-em-text)',
          },
          blockquote: {
            'margin-top': '2rem',
            'margin-bottom': '2rem',
            'border-inline-start-width': '4px',
            'border-inline-start-color': 'var(--color-quote-border)',
            'border-radius': '0 24px 24px 0',
            background: 'var(--color-quote-bg)',
            padding: '1.25rem 1.5rem',
            'font-style': 'normal',
            'font-weight': '400',
            color: 'var(--color-quote-text)',
            quotes: 'none',
          },
          'blockquote p': {
            margin: '0',
          },
          'blockquote p:first-of-type::before': {
            content: 'none',
          },
          'blockquote p:last-of-type::after': {
            content: 'none',
          },
          h2: {
            'margin-top': '4rem',
            'margin-bottom': '1.5rem',
            'font-size': '2.25rem',
            'line-height': '1.1',
            'font-weight': '700',
            'letter-spacing': '-0.025em',
            color: 'var(--color-text-strong)',
          },
          h3: {
            'margin-top': '3rem',
            'margin-bottom': '1rem',
            'font-size': '1.5rem',
            'line-height': '1.25',
            'font-weight': '600',
            'letter-spacing': '-0.025em',
            color: 'var(--color-text-strong)',
          },
          h4: {
            'margin-top': '2.5rem',
            'margin-bottom': '0.75rem',
            'font-size': '1.25rem',
            'line-height': '1.4',
            'font-weight': '600',
            color: 'var(--color-text-strong)',
          },
          hr: {
            'margin-top': '3rem',
            'margin-bottom': '3rem',
            height: '1px',
            border: '0',
            background: 'var(--color-hr)',
          },
          img: {
            'margin-top': '2rem',
            'margin-bottom': '2rem',
            // 用 max-width 而非 width：小图保持原始尺寸，大图缩放到容器宽度
            'max-width': '100%',
            height: 'auto',
            'margin-inline': 'auto',
            'border-radius': '24px',
            border: '1px solid var(--color-img-border)',
            'box-shadow': '0 24px 60px -36px var(--color-img-shadow)',
          },
          ul: {
            'margin-top': '1.5rem',
            'margin-bottom': '1.5rem',
            'padding-left': '1.5rem',
            'list-style-type': 'disc',
          },
          ol: {
            'margin-top': '1.5rem',
            'margin-bottom': '1.5rem',
            'padding-left': '1.5rem',
            'list-style-type': 'decimal',
          },
          li: {
            'padding-left': '0.25rem',
          },
          'li + li': {
            'margin-top': '0.75rem',
          },
          'li > p:first-child:last-child': {
            margin: '0',
          },
          code: {
            'border-radius': '0.5rem',
            'background-color': 'var(--color-inline-code-bg)',
            padding: '0.25rem 0.5rem',
            'font-size': '0.9em',
            'font-weight': '500',
            color: 'var(--color-inline-code-text)',
          },
          'code::before': {
            content: 'none',
          },
          'code::after': {
            content: 'none',
          },
          ':not(pre) > code': {
            'white-space': 'normal',
            'overflow-wrap': 'anywhere',
            'word-break': 'break-word',
            '-webkit-box-decoration-break': 'clone',
            'box-decoration-break': 'clone',
          },
          pre: {
            'margin-top': '2rem',
            'margin-bottom': '2rem',
            'overflow-x': 'auto',
            'border-radius': '24px',
            border: '1px solid var(--color-code-border)',
            padding: '1.5rem',
            'font-size': '0.95rem',
            'line-height': '1.75rem',
            color: 'inherit',
            'background-color': 'transparent',
            'box-shadow': '0 20px 44px -34px var(--color-code-shadow)',
          },
          'pre code': {
            padding: '0',
            'background-color': 'transparent',
            'font-size': 'inherit',
            'font-weight': 'inherit',
            color: 'inherit',
          },
          table: {
            display: 'table',
            width: '100%',
            'min-width': '100%',
            'max-width': '100%',
            'table-layout': 'fixed',
            'border-collapse': 'separate',
            'border-spacing': '0',
            overflow: 'hidden',
            'margin-top': '2rem',
            'margin-bottom': '2rem',
            'border-radius': '20px',
            border: '1px solid var(--color-code-border)',
            background: 'transparent',
          },
          thead: {
            'border-bottom-width': '0',
            background: 'transparent',
          },
          'tbody tr': {
            'border-bottom-width': '0',
          },
          tfoot: {
            'border-top-width': '0',
          },
          th: {
            background: 'var(--color-table-head-bg)',
            padding: '0.75rem 1rem',
            'text-align': 'left',
            'font-size': '0.875rem',
            'line-height': '1.75rem',
            'font-weight': '600',
            color: 'var(--color-text-strong)',
            'white-space': 'normal',
            'word-break': 'break-word',
          },
          td: {
            'border-top': '1px solid var(--color-table-border)',
            background: 'var(--color-table-cell-bg)',
            padding: '0.75rem 1rem',
            'font-size': '0.875rem',
            'line-height': '1.75rem',
            'white-space': 'normal',
            'word-break': 'break-word',
          },
        },
      }),
    ],
    transformers: [transformerDirectives()],
  };
}
