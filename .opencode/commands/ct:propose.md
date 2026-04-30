---
description: 策划新词条
agent: build
---

策划并创建新的 AI 词条。

如果用户未提供词条名称，询问：

1. 词条名称是什么？（中文或英文）
2. 一句话简介是什么？
3. 属于哪个分类？（基础概念、模型与架构、核心技术、交互与工程、关键概念、工具与基础设施、Agent 生态、工程与实践、安全与伦理、行业与应用、模型优化）

执行步骤：

1. 检查词条是否已存在（文件名去重）
2. 确定文件名：使用 kebab-case，如 `prompt-engineering.md`
3. 确定分类：如果用户未指定，根据词条内容推荐
4. 创建词条文件，包含：
   - 标准 frontmatter（title、description）
   - 一级标题（# 词条名）
   - 预留章节结构（概述、为什么重要、与其他概念的关系、延伸阅读）
5. 更新 `docs/glossary/index.md`，在对应分类表格中添加新词条
6. 更新 `docs/.vitepress/config.mts` 侧边栏配置

文件名规范：

- 使用概念的标准名称
- 多词概念用 kebab-case 连接
- 缩写概念在文件名中小写（如 `mcp.md`、`llm.md`）

示例：`/ct:propose` 或 `/ct:propose 知识图谱 Knowledge Graph`
