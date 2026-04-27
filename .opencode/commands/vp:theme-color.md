---
description: 修改品牌色配置
agent: build
---

修改 VitePress 的品牌色配置。

如果用户未提供颜色，询问：

1. 新的品牌色是什么？（提供色值或描述）
2. 是否需要同时调整深色模式的颜色？

修改位置：

- docs/.vitepress/theme/custom.css 中的 CSS 变量
  - --vp-c-brand-1, --vp-c-brand-2, --vp-c-brand-3, --vp-c-brand-soft
  - .dark 下的对应变量
- docs/.vitepress/config.mts 中的 theme-color meta 标签
- PWA manifest 中的 theme_color（如果启用）

同时更新渐变色和阴影相关颜色。

示例：`/vp:theme-color` 或 `/vp:theme-color #3eaf7c`
