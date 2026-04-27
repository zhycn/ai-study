# AI Study 品牌改造实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将 VitePress Starter 模板改造为 AI Study 个人知识库站点

**Architecture:** 轻量换皮方案，保留 VitePress 基础设施（PWA、搜索、组件、CI/CD），替换品牌标识、配色、导航和内容结构

**Tech Stack:** VitePress 2.x, Vue 3, TypeScript, pnpm

---

### Task 1: 更新 package.json 品牌信息

**Files:**
- Modify: `package.json`

**Step 1: 修改 package.json**

将 name 改为 `ai-study`，description 改为 `AI 学习笔记与资源整理，基于 VitePress 2.x 构建`，keywords 改为 `["ai", "llm", "study", "notes", "vitepress"]`。

**Step 2: 验证**

Run: `pnpm install`
Expected: 无错误

**Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: rename package to ai-study"
```

---

### Task 2: 更新 VitePress 配置 — 站点标识与品牌色

**Files:**
- Modify: `docs/.vitepress/config.mts`
- Modify: `docs/.vitepress/theme/custom.css`

**Step 1: 更新 config.mts 中的站点标识**

- title: `'AI Study'`
- description: `'AI 学习笔记与资源整理'`
- base: `'/ai-study/'`
- sitemap.hostname: `'https://zhycn.github.io/ai-study/'`
- PWA manifest: name `'AI Study'`, short_name `'AI Study'`, description `'AI 学习笔记与资源整理'`, icon src `'/ai-study/favicon.svg'`
- og:site_name: `'AI Study'`
- editLink.pattern: `'https://github.com/zhycn/ai-study/edit/main/docs/:path'`
- socialLinks: `[{ icon: 'github', link: 'https://github.com/zhycn/ai-study' }]`
- footer.message: `'基于 MIT 许可发布'`, footer.copyright: `'Copyright © 2026 zhycn'`

**Step 2: 更新 custom.css 品牌色**

亮色模式：
```css
--vp-c-brand-1: #6366f1;
--vp-c-brand-2: #4f46e5;
--vp-c-brand-3: #4338ca;
--vp-c-brand-soft: #6366f118;
--vp-home-hero-name-background: linear-gradient(135deg, #6366f1 10%, #4f46e5 100%);
--vp-home-hero-image-background-image: linear-gradient(135deg, #6366f122 10%, #4f46e522 100%);
```

暗色模式：
```css
--vp-c-brand-1: #818cf8;
--vp-c-brand-2: #6366f1;
--vp-c-brand-3: #4f46e5;
--vp-c-brand-soft: #818cf818;
```

head 中 theme-color 改为 `#6366f1`，msapplication-TileColor 改为 `#6366f1`。

**Step 3: 验证**

Run: `pnpm docs:build`
Expected: 构建成功

**Step 4: Commit**

```bash
git add docs/.vitepress/config.mts docs/.vitepress/theme/custom.css
git commit -m "feat: update site branding to AI Study with indigo theme"
```

---

### Task 3: 更新导航栏与侧边栏

**Files:**
- Modify: `docs/.vitepress/config.mts`

**Step 1: 替换导航栏**

```typescript
nav: [
  { text: '首页', link: '/' },
  { text: 'Prompt', link: '/prompt/' },
  { text: 'RAG', link: '/rag/' },
  { text: 'Agent', link: '/agent/' },
  { text: '微调', link: '/finetuning/' },
  { text: '资源', link: '/resources/' },
  { text: 'GitHub', link: 'https://github.com/zhycn/ai-study' }
]
```

**Step 2: 替换侧边栏**

```typescript
sidebar: {
  '/prompt/': [
    {
      text: 'Prompt Engineering',
      collapsed: false,
      items: [
        { text: '概览', link: '/prompt/' },
        { text: '基础技巧', link: '/prompt/basics' },
        { text: '高级技巧', link: '/prompt/advanced' }
      ]
    }
  ],
  '/rag/': [
    {
      text: 'RAG',
      collapsed: false,
      items: [
        { text: '概览', link: '/rag/' },
        { text: 'RAG 基础', link: '/rag/basics' },
        { text: '进阶实践', link: '/rag/advanced' }
      ]
    }
  ],
  '/agent/': [
    {
      text: 'AI Agent',
      collapsed: false,
      items: [
        { text: '概览', link: '/agent/' },
        { text: '框架对比', link: '/agent/framework' },
        { text: '实战案例', link: '/agent/practice' }
      ]
    }
  ],
  '/finetuning/': [
    {
      text: '模型微调',
      collapsed: false,
      items: [
        { text: '概览', link: '/finetuning/' },
        { text: 'SFT 监督微调', link: '/finetuning/sft' },
        { text: 'LoRA / QLoRA', link: '/finetuning/lora' }
      ]
    }
  ],
  '/resources/': [
    {
      text: '资源整理',
      collapsed: false,
      items: [
        { text: '资源导航', link: '/resources/' },
        { text: '常用工具', link: '/resources/tools' },
        { text: '课程推荐', link: '/resources/courses' },
        { text: '论文追踪', link: '/resources/papers' }
      ]
    }
  ]
}
```

**Step 3: 验证**

Run: `pnpm docs:build`
Expected: 构建成功（可能会有 404 警告，因为内容文件尚未创建）

**Step 4: Commit**

```bash
git add docs/.vitepress/config.mts
git commit -m "feat: update nav and sidebar for AI Study content structure"
```

---

### Task 4: 更新首页

**Files:**
- Modify: `docs/index.md`

**Step 1: 重写首页**

```yaml
---
layout: home

hero:
  name: 'AI Study'
  text: '学习笔记与资源整理'
  tagline: 记录 AI 实战经验，整理优质学习资源
  actions:
    - theme: brand
      text: 开始探索
      link: /prompt/
    - theme: alt
      text: 资源导航
      link: /resources/

features:
  - title: Prompt Engineering
    details: 提示词设计技巧与实战模式
  - title: RAG
    details: 检索增强生成的架构与优化
  - title: AI Agent
    details: 智能体框架选型与开发实践
  - title: 模型微调
    details: SFT、LoRA 等微调方法实践
  - title: 工具与资源
    details: AI 开发工具链、课程、论文精选
  - title: 学习路径
    details: 从入门到进阶的系统化学习指南
---
```

**Step 2: Commit**

```bash
git add docs/index.md
git commit -m "feat: update homepage for AI Study"
```

---

### Task 5: 删除旧内容文件

**Files:**
- Delete: `docs/guide/` 目录
- Delete: `docs/api/` 目录
- Delete: `docs/examples/` 目录
- Delete: `docs/markdown-examples.md`
- Delete: `docs/api-examples.md`
- Delete: `CODE_OF_CONDUCT.md`
- Delete: `CONTRIBUTING.md`

**Step 1: 删除文件**

```bash
rm -rf docs/guide docs/api docs/examples docs/markdown-examples.md docs/api-examples.md CODE_OF_CONDUCT.md CONTRIBUTING.md
```

**Step 2: Commit**

```bash
git add -A
git commit -m "chore: remove VitePress Starter template content"
```

---

### Task 6: 创建新内容目录与占位文件

**Files:**
- Create: `docs/prompt/index.md`
- Create: `docs/prompt/basics.md`
- Create: `docs/prompt/advanced.md`
- Create: `docs/rag/index.md`
- Create: `docs/rag/basics.md`
- Create: `docs/rag/advanced.md`
- Create: `docs/agent/index.md`
- Create: `docs/agent/framework.md`
- Create: `docs/agent/practice.md`
- Create: `docs/finetuning/index.md`
- Create: `docs/finetuning/sft.md`
- Create: `docs/finetuning/lora.md`
- Create: `docs/resources/index.md`
- Create: `docs/resources/tools.md`
- Create: `docs/resources/courses.md`
- Create: `docs/resources/papers.md`

**Step 1: 创建目录**

```bash
mkdir -p docs/prompt docs/rag docs/agent docs/finetuning docs/resources
```

**Step 2: 创建占位文件**

每个文件的 frontmatter 包含标题，正文为简短占位描述：

- `docs/prompt/index.md`:
```yaml
---
title: Prompt Engineering
---

# Prompt Engineering

提示词工程是与大语言模型交互的核心技能。本栏目记录 Prompt 设计的基础技巧与高级实战模式。

## 内容规划

- [基础技巧](./basics) — Zero-shot、Few-shot、CoT 等基础提示策略
- [高级技巧](./advanced) — 自我反思、多轮对话、结构化输出等进阶模式
```

- `docs/prompt/basics.md`:
```yaml
---
title: 基础技巧
---

# 基础技巧

待完善...
```

- `docs/prompt/advanced.md`:
```yaml
---
title: 高级技巧
---

# 高级技巧

待完善...
```

其他目录同理，每个 index.md 包含分类概览和内容规划链接，子页面为占位内容。

- `docs/rag/index.md`:
```yaml
---
title: RAG
---

# RAG

检索增强生成（Retrieval-Augmented Generation）是让 LLM 结合外部知识库的重要范式。本栏目记录 RAG 架构设计与优化实践。

## 内容规划

- [RAG 基础](./basics) — RAG 架构原理与基础实现
- [进阶实践](./advanced) — 向量检索优化、Rerank、混合检索等
```

- `docs/rag/basics.md`:
```yaml
---
title: RAG 基础
---

# RAG 基础

待完善...
```

- `docs/rag/advanced.md`:
```yaml
---
title: 进阶实践
---

# 进阶实践

待完善...
```

- `docs/agent/index.md`:
```yaml
---
title: AI Agent
---

# AI Agent

AI Agent 是具备自主规划和工具调用能力的智能体。本栏目记录 Agent 框架选型与开发实战。

## 内容规划

- [框架对比](./framework) — LangChain、LlamaIndex、CrewAI 等框架对比
- [实战案例](./practice) — Agent 开发实战经验与踩坑记录
```

- `docs/agent/framework.md`:
```yaml
---
title: 框架对比
---

# 框架对比

待完善...
```

- `docs/agent/practice.md`:
```yaml
---
title: 实战案例
---

# 实战案例

待完善...
```

- `docs/finetuning/index.md`:
```yaml
---
title: 模型微调
---

# 模型微调

模型微调是让预训练模型适应特定任务的关键技术。本栏目记录 SFT、LoRA 等微调方法的实践经验。

## 内容规划

- [SFT 监督微调](./sft) — 全量微调与数据准备
- [LoRA / QLoRA](./lora) — 参数高效微调方法
```

- `docs/finetuning/sft.md`:
```yaml
---
title: SFT 监督微调
---

# SFT 监督微调

待完善...
```

- `docs/finetuning/lora.md`:
```yaml
---
title: LoRA / QLoRA
---

# LoRA / QLoRA

待完善...
```

- `docs/resources/index.md`:
```yaml
---
title: 资源整理
---

# 资源整理

精选 AI 学习与开发中的优质资源，持续更新。

## 内容规划

- [常用工具](./tools) — AI 开发工具链推荐
- [课程推荐](./courses) — 系统化学习课程
- [论文追踪](./papers) — 重要论文阅读笔记
```

- `docs/resources/tools.md`:
```yaml
---
title: 常用工具
---

# 常用工具

待完善...
```

- `docs/resources/courses.md`:
```yaml
---
title: 课程推荐
---

# 课程推荐

待完善...
```

- `docs/resources/papers.md`:
```yaml
---
title: 论文追踪
---

# 论文追踪

待完善...
```

**Step 3: 验证**

Run: `pnpm docs:build`
Expected: 构建成功

**Step 4: Commit**

```bash
git add docs/prompt docs/rag docs/agent docs/finetuning docs/resources
git commit -m "feat: add AI Study content structure with placeholder pages"
```

---

### Task 7: 更新 README.md

**Files:**
- Modify: `README.md`

**Step 1: 重写 README.md**

```markdown
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
```

**Step 2: Commit**

```bash
git add README.md
git commit -m "docs: rewrite README for AI Study project"
```

---

### Task 8: 更新 CHANGELOG.md

**Files:**
- Modify: `CHANGELOG.md`

**Step 1: 在 [Unreleased] 下添加改造记录**

在 `### Changed` 下添加：
- 品牌色从橙色 (#e8740c) 改为科技紫 (#6366f1)
- 站点从 VitePress Starter 改造为 AI Study
- 部署路径从 /VitePress-starter/ 改为 /ai-study/

在 `### Added` 下添加：
- AI Study 内容目录结构（Prompt/RAG/Agent/微调/资源）

在 `### Removed` 下添加：
- VitePress Starter 模板示例内容

**Step 2: Commit**

```bash
git add CHANGELOG.md
git commit -m "docs: update CHANGELOG for AI Study rebrand"
```

---

### Task 9: 更新 AGENTS.md

**Files:**
- Modify: `AGENTS.md`

**Step 1: 重写 AGENTS.md**

更新项目描述、目录结构、部署信息等，与新的 AI Study 项目一致。关键修改点：

- 描述改为 AI Study
- 部署 base 改为 `/ai-study/`
- 目录结构反映新的内容目录
- GitHub 仓库链接改为 `zhycn/ai-study`
- 移除对已删除文件的引用

**Step 2: Commit**

```bash
git add AGENTS.md
git commit -m "docs: update AGENTS.md for AI Study"
```

---

### Task 10: 更新 CI/CD 配置

**Files:**
- Modify: `.github/workflows/deploy.yml`

**Step 1: 检查并更新 deploy.yml**

确认 base 路径与 config.mts 一致为 `/ai-study/`。如有硬编码的 `/VitePress-starter/` 路径需替换。

**Step 2: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: update deploy workflow for ai-study"
```

---

### Task 11: 最终验证

**Step 1: 运行完整验证链**

```bash
pnpm lint:check
pnpm type-check
pnpm docs:build
```

Expected: 全部通过

**Step 2: 本地预览**

```bash
pnpm docs:preview
```

检查首页、导航、侧边栏、品牌色是否正确。
