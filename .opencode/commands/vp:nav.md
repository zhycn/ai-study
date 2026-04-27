---
description: 添加或修改导航栏菜单
agent: build
---

配置 VitePress 的导航栏（nav）。

如果用户未提供参数，询问：

1. 添加还是修改？
2. 菜单项文本是什么？
3. 链接地址是什么？
4. 是否需要下拉菜单？

修改位置：

- docs/.vitepress/config.mts 的 themeConfig.nav
- 支持简单链接和下拉菜单（items 数组）

示例：

```ts
{ text: '指南', link: '/guide/' }
{ text: '更多', items: [{ text: 'GitHub', link: '...' }] }
```

示例：`/vp:nav` 或 `/vp:nav 添加博客链接 /blog`
