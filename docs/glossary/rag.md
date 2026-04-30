---
title: RAG
description: Retrieval-Augmented Generation，检索增强生成
---

# RAG

## 概述

RAG（Retrieval-Augmented Generation，检索增强生成）是一种结合信息检索和文本生成的技术，通过检索外部知识来增强大语言模型的回答。

## 为什么重要

- **知识更新**：解决知识截止问题
- **减少幻觉**：基于真实文档回答
- **可解释性**：答案可追溯来源
- **成本效率**：无需重新训练模型

## 核心流程

1. **文档处理**：将知识库文档分块
2. **向量化**：将文本块转为向量
3. **存储**：存入向量数据库
4. **检索**：根据问题检索相关文档
5. **增强**：将检索结果加入提示
6. **生成**：让模型基于增强上下文生成

## 关键技术

- **分块策略**：如何分割文档
- **向量化模型**：文本转向量
- **向量检索**：相似度搜索
- **重排序**：优化检索结果

## 与其他概念的关系

- 使用 [向量数据库](/glossary/vector-database) 存储向量
- 使用 [Embedding](/glossary/embedding) 将文本转为向量
- 与 [知识图谱](/glossary/knowledge-graph) 可结合使用

## 延伸阅读

- [向量数据库](/glossary/vector-database)
- [Embedding](/glossary/embedding)
- [知识图谱](/glossary/knowledge-graph)
- [提示词工程](/glossary/prompt-engineering)
