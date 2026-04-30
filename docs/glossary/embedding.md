---
title: Embedding
description: 将文本转换为向量表示的技术
---

# Embedding

## 概述

Embedding（嵌入）是将文本、图像、音频等数据转换为密集向量表示的技术，使得语义相似的内容在向量空间中距离更近。

## 为什么重要

- **语义表示**：将离散的文本转换为连续的数学表示
- **相似度计算**：便于计算文本之间的相似性
- **向量检索**：支撑 [RAG](/glossary/rag) 的向量搜索
- **模型输入**：是语言模型的输入格式

## 主要类型

- **词嵌入**：单词的向量表示
- **句嵌入**：句子级别的向量表示
- **上下文嵌入**：考虑上下文的动态表示
- **多模态嵌入**：跨模态的统一表示

## 与其他概念的关系

- 输出存储在 [向量数据库](/glossary/vector-database) 中
- 是 [RAG](/glossary/rag) 系统的核心技术
- 依赖 [Transformer](/glossary/transformer) 架构

## 延伸阅读

- [RAG](/glossary/rag)
- [向量数据库](/glossary/vector-database)
- [Transformer](/glossary/transformer)
