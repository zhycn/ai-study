# AI Study 品牌改造设计

## 概述

将 VitePress Starter 模板改造为 AI Study 个人知识库站点。采用方案 A（轻量换皮）：只替换品牌标识和内容结构，保留基础设施。

## 需求确认

| 维度 | 决定 |
|------|------|
| 定位 | AI 学习笔记/知识库 |
| 内容范围 | AI 实战经验 + 资源整合与学习笔记 |
| 品牌色 | 科技紫/蓝系 |
| 部署地址 | `zhycn.github.io/ai-study/` |
| GitHub 仓库 | `zhycn/ai-study` |
| 内容分类 | 按技术方向 |

## 设计段 1：品牌与基础配置

**站点标识：**
- 标题：`AI Study`
- 描述：`AI 学习笔记与资源整理`
- 仓库：`zhycn/ai-study`
- 部署 base：`/ai-study/`
- sitemap hostname：`https://zhycn.github.io/ai-study/`

**品牌色（科技紫/蓝）：**
- 亮色模式主色：`#6366f1` (Indigo-500)
- 暗色模式主色：`#818cf8` (Indigo-400)
- 渐变：`135deg #6366f1 → #4f46e5`

**package.json：**
- name: `ai-study`
- description: `AI 学习笔记与资源整理，基于 VitePress 2.x 构建`
- keywords: `ai, llm, study, notes, vitepress`

**PWA manifest：** 同步更新 name/short_name/description/icons 路径

**保留不变：** PWA 机制、搜索配置、KaTeX、自定义容器、Card/Badge 组件、ESLint/Prettier、git hooks、CI/CD 流程结构

## 设计段 2：内容目录与导航结构

**导航栏：**
```
首页 | Prompt | RAG | Agent | 微调 | 资源 | GitHub
```

**目录结构（docs/ 下）：**
```
docs/
  index.md                    # 首页
  prompt/                     # Prompt Engineering
    index.md                  # 分类概览
    basics.md                 # 基础技巧
    advanced.md               # 高级技巧
  rag/                        # RAG
    index.md                  # 分类概览
    basics.md                 # RAG 基础
    advanced.md               # 进阶实践
  agent/                      # AI Agent
    index.md                  # 分类概览
    framework.md              # 框架对比
    practice.md               # 实战案例
  finetuning/                 # 微调
    index.md                  # 分类概览
    sft.md                    # SFT 监督微调
    lora.md                   # LoRA/QLoRA
  resources/                  # 资源整理
    index.md                  # 资源导航
    tools.md                  # 常用工具
    courses.md                # 课程推荐
    papers.md                 # 论文追踪
```

**侧边栏：** 每个技术方向独立一个侧边栏组，`/resources/` 单独一组

**首页 features：**
- Prompt Engineering — 提示词设计技巧与实战模式
- RAG — 检索增强生成的架构与优化
- AI Agent — 智能体框架选型与开发实践
- 模型微调 — SFT、LoRA 等微调方法实践
- 工具与资源 — AI 开发工具链、课程、论文精选
- 学习路径 — 从入门到进阶的系统化学习指南

## 设计段 3：删除与保留清单

**删除：**
- `docs/guide/` 整个目录
- `docs/api/` 整个目录
- `docs/examples/` 整个目录
- `docs/markdown-examples.md`
- `docs/api-examples.md`
- `CODE_OF_CONDUCT.md`
- `CONTRIBUTING.md`

**保留不变：**
- `docs/.vitepress/theme/` 整个目录
- `docs/.vitepress/config.mts`（修改内容，保留结构）
- `docs/.vitepress/env.d.ts`
- `docs/public/favicon.svg`
- `.github/workflows/deploy.yml`（需更新 base 路径）
- `.github/renovate.json`
- `.opencode/commands/`
- `eslint.config.js`, `tsconfig.json`, `.prettierrc`, `.editorconfig`
- `LICENSE`（MIT）
- `pnpm-lock.yaml`

**需更新：**
- `README.md` — 重写为 AI Study 项目说明
- `CHANGELOG.md` — 添加本次改造记录
- `AGENTS.md` — 更新项目描述和目录结构
