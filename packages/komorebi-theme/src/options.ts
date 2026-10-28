import type { Theme } from 'giscus';

export interface KomorebiThemeLabels {
  latestPostsHeading: string;
  latestPostsMore: string;
  latestPostsEmptyPrefix: string;
  latestPostsEmptyLink: string;
  latestPostsEmptySuffix: string;
  footerRss: string;
}

export interface KomorebiNavLink {
  href: string;
  label: string;
}

export interface KomorebiFriend {
  name: string;
  url: string;
  avatar: string;
  description: string;
}

export type ExternalLinkIndicator = string | { html: string } | false;

export interface GiscusOptions {
  repo: `${string}/${string}`;
  repoId: string;
  category?: string;
  categoryId?: string;
  mapping?: 'url' | 'pathname' | 'title' | 'og:title' | 'specific' | 'number';
  term?: string;
  strict?: boolean;
  reactionsEnabled?: boolean;
  emitMetadata?: boolean;
  inputPosition?: 'top' | 'bottom';
  lang?: string;
  theme?: string | { preset: Theme };
}

export type CommentsConfig = false | GiscusOptions;

/** 内置配色方案 */
export type KomorebiPalette = 'sun' | 'moon';

export interface ResolvedKomorebiPalette {
  /** 写入 <html data-palette>，对应 palettes.css 中的选择器 */
  name: KomorebiPalette;
  /** <meta name="theme-color">，浏览器地址栏颜色 */
  themeColor: string;
}

export interface KomorebiThemeOptions {
  title?: string;
  tagline?: string;
  repositoryUrl?: string;
  locale?: string;
  pagination?: {
    pageSize?: number;
  };
  home?: {
    eyebrow?: string;
    title?: string;
    description?: string;
  };
  externalLinks?:
    | false
    | {
        autoTarget?: boolean;
        indicator?: ExternalLinkIndicator;
      };
  nav?: KomorebiNavLink[];
  friends?: KomorebiFriend[];
  customCss?: string[];
  comments?: CommentsConfig;
  labels?: Partial<KomorebiThemeLabels>;
  /** 配色方案，默认 'sun' */
  palette?: KomorebiPalette;
  /** 覆盖 <meta name="theme-color">，默认由 palette 决定 */
  themeColor?: string;
}

export interface ResolvedKomorebiThemeOptions {
  title: string;
  tagline: string;
  repositoryUrl?: string;
  locale: string;
  pagination: {
    pageSize: number;
  };
  home: {
    eyebrow: string;
    title: string;
    description: string;
  };
  externalLinks:
    | false
    | {
        autoTarget: boolean;
        indicator: ExternalLinkIndicator;
      };
  nav: KomorebiNavLink[];
  friends: KomorebiFriend[];
  customCss: string[];
  comments: false | GiscusOptions;
  labels: KomorebiThemeLabels;
  palette: ResolvedKomorebiPalette;
}

const defaultLabels: KomorebiThemeLabels = {
  latestPostsHeading: '最近写了什么',
  latestPostsMore: '查看全部 →',
  latestPostsEmptyPrefix: '暂时还没有公开文章，先去',
  latestPostsEmptyLink: '关于页面',
  latestPostsEmptySuffix: '看看吧。',
  footerRss: '订阅 RSS',
};

export function homeLink(label?: string): KomorebiNavLink {
  return { href: '/', label: label ?? '首页' };
}

export function blogLink(label?: string): KomorebiNavLink {
  return { href: '/blog', label: label ?? '文章' };
}

export function archiveLink(label?: string): KomorebiNavLink {
  return { href: '/archive', label: label ?? '归档' };
}

export function aboutLink(label?: string): KomorebiNavLink {
  return { href: '/about', label: label ?? '关于' };
}

export function friendsLink(label?: string): KomorebiNavLink {
  return { href: '/friends', label: label ?? '友链' };
}

export function navLinks(extra?: KomorebiNavLink[]): KomorebiNavLink[] {
  return [
    homeLink(),
    blogLink(),
    archiveLink(),
    friendsLink(),
    ...(extra ?? []),
    aboutLink(),
  ];
}

/** 各配色的浏览器 UI 颜色 */
const paletteThemeColors: Record<KomorebiPalette, string> = {
  sun: '#f7f2ea',
  moon: '#17181b',
};

export function defineConfig(
  options: KomorebiThemeOptions,
): KomorebiThemeOptions {
  return options;
}

export function resolveThemeOptions(
  options: KomorebiThemeOptions = {},
): ResolvedKomorebiThemeOptions {
  const labels: KomorebiThemeLabels = {
    ...defaultLabels,
    ...options.labels,
  };

  const nav = options.nav ?? navLinks();

  return {
    title: options.title ?? '木漏れ日',
    tagline: options.tagline ?? '',
    ...(options.repositoryUrl !== undefined
      ? { repositoryUrl: options.repositoryUrl }
      : {}),
    locale: options.locale ?? 'zh-CN',
    pagination: {
      pageSize: options.pagination?.pageSize ?? 10,
    },
    home: {
      eyebrow: options.home?.eyebrow ?? '欢迎来到这里',
      title: options.home?.title ?? 'Hi~',
      description:
        options.home?.description ??
        '欢迎来到我的博客，希望你能在这里读到一些值得停留下来的内容。',
    },
    externalLinks:
      options.externalLinks === false
        ? false
        : {
            autoTarget: options.externalLinks?.autoTarget ?? true,
            indicator: options.externalLinks?.indicator ?? 'mdi:launch',
          },
    nav,
    friends: options.friends ?? [],
    customCss: options.customCss ?? [],
    comments: resolveComments(options.comments),
    labels,
    palette: resolvePalette(options),
  };
}

function resolvePalette(
  options: KomorebiThemeOptions,
): ResolvedKomorebiPalette {
  const name = options.palette ?? 'sun';
  return {
    name,
    themeColor: options.themeColor ?? paletteThemeColors[name],
  };
}

function resolveComments(
  comments: CommentsConfig | undefined,
): false | GiscusOptions {
  if (!comments) return false;
  return {
    ...comments,
    mapping: comments.mapping ?? 'pathname',
  };
}
