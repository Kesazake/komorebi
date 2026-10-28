---
title: blog的部署
published: 2026-04-06
pinned: false
description: blog的部署过程
tags: [技术]
category: 技术
licenseName: "CC BY-NC-SA 4.0"
draft: true
---

## 搜索到的文档

搭建博客的时候，没有浏览很多教学视频，在朋友的推荐下选择了Astro，随后在Astro的主题中选择了 [Firefly](https://astro.build/themes/details/firefly/)

作者撰写了非常详细的 [使用文档](https://docs-firefly.cuteleaf.cn/zh/) ，按照文档一步步操作，非常顺利的完成了配置和部署。

虽然文档只给出了环境要求而没有指导如何安装，但其实问一下AI就可以很好的完成。

作者的使用文档很详细，所以我实在没有什么可以再写的了。

## 使用到的命令

克隆项目原始仓库  

```(bash)
git clone https://github.com/CuteLeaf/Firefly.git
```

绑定自己的仓库  

```(bash)
git remote set-url origin (自己的仓库地址)
```

暂存修改

```(bash)
git add .
```

提交

```(bash)
git commit -m "(提交信息)"
```

推送

```(bash)
git push -u origin main  # 首次
git push                 # 后续
```
