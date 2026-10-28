import { defineConfig } from 'komorebi-theme';

export default defineConfig({
  title: '今朝酒',
  tagline: '明日愁来明日愁',
  repositoryUrl: 'https://kesazake.top',
  // 第一个为默认配色，>1 个时渲染切换开关
  palette: ['moon', 'sun'],
  customCss: ['./src/styles/fonts.css'],
});
