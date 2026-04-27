---
description: 全面验收 VitePress 项目
agent: build
---

作为验收员对 VitePress 项目进行全面检查。

执行步骤：

1. 检查 .vitepress/config.mts 配置完整性
   - 站点元数据（title、description、lang）
   - base、cleanUrls、sitemap
   - head 标签（favicon、OG、字体）
   - themeConfig（nav、sidebar、search）
2. 检查主题和组件
   - custom.css 品牌色
   - 组件是否正常注册
3. 检查文档链接
   - 内部链接是否有效
   - 外部链接格式是否正确
4. 运行验证命令
   - `pnpm docs:build`
   - `pnpm lint:check`
   - `pnpm type-check`
5. 检查构建产物
6. 列出所有问题并按严重程度分级（严重/中等/轻微）

示例：`/vp:audit`
