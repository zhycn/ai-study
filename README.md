# AI Study

AI 学习笔记与资源整理，基于 VitePress 2.x 构建。

## 栏目

- **Prompt Engineering** — 提示词设计技巧与实战模式
- **RAG** — 检索增强生成的架构与优化
- **AI Agent** — 智能体框架选型与开发实践
- **模型微调** — SFT、LoRA 等微调方法实践
- **资源整理** — 工具、课程、论文精选

## 快速开始

### 环境要求

- Node.js >= 20
- pnpm >= 10

### 安装

```bash
pnpm install
```

### 开发

```bash
pnpm docs:dev
```

### 构建

```bash
pnpm docs:build
```

### 代码质量

```bash
pnpm lint              # ESLint 自动修复
pnpm lint:check        # ESLint 检查
pnpm format            # Prettier 格式化
pnpm format:check      # Prettier 检查
pnpm type-check        # TypeScript 类型检查
```

## 部署

推送 `main` 分支自动部署至 GitHub Pages：https://zhycn.github.io/ai-study/

## 许可

MIT
