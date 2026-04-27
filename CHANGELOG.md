# Changelog

所有重要的项目变更都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，版本遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

### Added

- AI Study 内容目录结构（Prompt/RAG/Agent/微调/资源）
- PWA 支持（`@vite-pwa/vitepress`）
- 25 个 OpenCode 自定义命令（`vp:*` 前缀）
- `AGENTS.md` AI 代理指令文件

### Changed

- 品牌色从橙色 (#e8740c) 改为科技紫 (#6366f1)
- 站点从 VitePress Starter 改造为 AI Study
- 部署路径从 /VitePress-starter/ 改为 /ai-study/
- 品牌色配置优化（light/dark 模式）
- 搜索分词优化（支持中文）
- favicon 路径修正

### Removed

- VitePress Starter 模板示例内容
- RSS 订阅支持（`vitepress-plugin-rss` 存在兼容性问题）

## [1.0.0] - 2026-04-27

### Added

- 基础 VitePress 2.x 模板
- 中文本地搜索配置
- GitHub Actions 自动部署
- Renovate 依赖自动更新
- ESLint + TypeScript 配置
- 自定义 Vue 组件示例（Card、Badge）
- 404 页面定制
- 贡献指南和行为准则
- SEO 优化（Open Graph、Twitter Card）
- KaTeX 数学公式支持
- 自定义 Markdown 容器（card-grid、steps）

[Unreleased]: https://github.com/zhycn/ai-study/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/zhycn/ai-study/releases/tag/v1.0.0
