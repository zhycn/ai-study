---
description: 添加自定义 CSS 样式
agent: build
---

为 VitePress 主题添加自定义 CSS。

如果用户未提供样式，询问：

1. 要修改哪些元素？（特定组件、全局样式、自定义类）
2. 只在深色模式生效还是都生效？

修改位置：

- docs/.vitepress/theme/custom.css
- 使用 VitePress 内置 CSS 变量
- 必要时添加新的 CSS 变量到 :root

支持：

- 覆盖默认主题样式
- 添加新的自定义类
- 深色模式适配（.dark 选择器）
- 响应式样式（@media）

示例：`/vp:css` 或 `/vp:css "修改代码块背景色"`
