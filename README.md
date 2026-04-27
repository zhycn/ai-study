# VitePress Starter

开箱即用的 VitePress 文档站点模板，基于 VitePress 2.x 构建。

## 特性

- **极速开发体验** - Vite 驱动，瞬间启动，HMR 即时更新
- **Markdown 增强** - 语法高亮、自定义容器、代码分组、Vue 组件嵌入
- **开箱即用** - 本地搜索、PWA 支持、SEO 优化、GitHub Actions 部署
- **高度可定制** - 品牌色、自定义主题、Vue 组件、插件扩展
- **现代化工程** - TypeScript、ESLint、Prettier、Renovate 自动依赖更新

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

访问 http://localhost:5173 预览。

### 构建

```bash
pnpm docs:build
```

构建产物输出至 `docs/.vitepress/dist`。

### 代码质量

```bash
pnpm lint              # ESLint 自动修复
pnpm lint:check        # ESLint 检查
pnpm format            # Prettier 格式化
pnpm format:check      # Prettier 检查
pnpm type-check        # TypeScript 类型检查
```

### 预览

```bash
pnpm docs:preview
```

### 格式化

```bash
pnpm format          # 格式化所有文件
pnpm format:check    # 检查格式
```

## 项目结构

```
├── docs/
│   ├── .vitepress/
│   │   ├── config.mts          # 站点配置
│   │   ├── env.d.ts            # 类型声明
│   │   ├── theme/
│   │   │   ├── index.ts        # 主题入口
│   │   │   ├── custom.css      # 自定义样式
│   │   │   └── components/     # 全局 Vue 组件
│   │   └── cache/              # 构建缓存（git 忽略）
│   ├── public/                 # 静态资源
│   ├── guide/                  # 指南文档
│   ├── api/                    # API 文档
│   ├── examples/               # 示例文档
│   └── index.md                # 首页
├── .opencode/
│   └── commands/               # OpenCode 自定义命令（25 个 vp:* 命令）
├── .github/
│   ├── renovate.json           # 依赖自动更新
│   └── workflows/
│       └── deploy.yml          # GitHub Pages 部署
├── package.json
├── tsconfig.json
├── eslint.config.js
├── AGENTS.md                   # AI 代理指令
└── README.md
```

## 部署

本项目已配置 GitHub Actions，推送到 `main` 分支自动部署至 GitHub Pages。

也可部署至 Vercel、Netlify、Cloudflare Pages 等平台。

## 许可

MIT
