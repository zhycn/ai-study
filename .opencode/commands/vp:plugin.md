---
description: 添加新的 VitePress 插件
agent: build
---

为 VitePress 项目添加新的插件。

如果用户未提供插件名，询问：

1. 要添加什么插件？（描述功能或提供包名）
2. 插件的配置选项是什么？

执行步骤：

1. 安装插件包（pnpm add -D）
2. 在 docs/.vitepress/config.mts 中导入
3. 添加到 vite.plugins 或 markdown.config
4. 添加必要的 head 标签（如果需要）
5. 验证构建是否正常

常见插件：

- @vite-pwa/vitepress - PWA 支持
- vitepress-plugin-sitemap - 站点地图
- @mdit/plugin-\* - Markdown 扩展

示例：`/vp:plugin` 或 `/vp:plugin @mdit/plugin-markdown-custom`
