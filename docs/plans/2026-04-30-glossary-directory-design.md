# AI 词条目录设计文档

## 概述

在 `docs/glossary/` 目录下创建 AI 领域基础概念词条集，作为用户入门入口。

## 目录结构

```
docs/glossary/
├── index.md              # 词条总览/导航页
├── ai.md                 # 人工智能 (AI)
├── prompt-engineering.md # 提示词工程
├── mcp.md                # Model Context Protocol (MCP)
└── ...                   # 后续扩展
```

## 命名规范

- 使用概念的标准名称作为文件名
- 多词概念用 kebab-case 连接
- 缩写概念在文件名中小写

## 导航配置

```typescript
nav: [
  { text: '首页', link: '/' },
  { text: '词条', link: '/glossary/' },
  { text: 'Prompt', link: '/prompt/' },
  // ...
]
```

## 词条内容结构

- 标题：概念名称
- 概述：简短定义
- 为什么重要：在 AI 领域的意义
- 与其他概念的关系：链接到相关概念和目录
- 延伸阅读：链接到详细专题目录
