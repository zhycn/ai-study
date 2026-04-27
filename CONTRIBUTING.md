# 贡献指南

感谢你对 VitePress Starter 的关注！我们欢迎所有形式的贡献。

## 开始之前

1. Fork 本仓库
2. 克隆到本地：`git clone https://github.com/YOUR_USERNAME/VitePress-starter.git`
3. 安装依赖：`pnpm install`
4. 创建分支：`git checkout -b feature/your-feature`

## 开发

```bash
pnpm docs:dev
```

## 提交 PR

- 确保代码通过 lint 检查：`pnpm lint:check`
- 确保类型检查通过：`pnpm type-check`
- 确保格式正确：`pnpm format:check`
- 确保构建成功：`pnpm docs:build`
- 提交信息遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范
- 描述清楚改动的目的和影响

## 代码风格

- 遵循 ESLint 和 Prettier 配置
- 组件使用 PascalCase 命名
- 文件使用 kebab-case 命名

## AI 辅助开发

本项目包含 `AGENTS.md` 文件，为 AI 编码代理（如 OpenCode、Claude Code）提供项目上下文和开发规范。使用 `/vp:` 前缀可触发 25 个自定义命令辅助开发。

## 许可

提交即表示你同意你的贡献将在 MIT 许可下发布。
