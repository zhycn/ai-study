---
description: 配置网站字体
agent: build
---

配置 VitePress 的字体设置。

如果用户未提供字体，询问：

1. 基础字体族？（如 Noto Sans SC、Inter、Roboto）
2. 代码字体族？（如 JetBrains Mono、Fira Code、Source Code Pro）
3. 字体来源？（Google Fonts、本地字体）

修改位置：

- docs/.vitepress/config.mts 的 head 标签（Google Fonts 链接）
- docs/.vitepress/theme/custom.css 的 CSS 变量
  - --vp-font-family-base
  - --vp-font-family-mono

示例：`/vp:font` 或 `/vp:font "Inter" "Fira Code"`
