---
title: 思维链
description: Chain of Thought (CoT)，引导模型逐步推理的技术
---

# 思维链

## 概述

思维链（Chain of Thought，CoT）是一种提示工程技术，通过引导模型展示推理过程，逐步得出最终答案，显著提升模型的推理能力。

## 为什么重要

- **推理提升**：大幅增强模型的数学和逻辑推理能力
- **可解释性**：展示推理过程，增加输出可理解性
- **复杂任务**：处理需要多步骤的复杂问题
- **简单有效**：只需改变提示方式，无需额外训练

## 实现方式

- **零样本 CoT**：使用"让我们一步步思考"等触发语
- **Few-shot CoT**：提供推理示例
- **自洽性**：生成多个答案取多数
- **增强 CoT**：结合外部工具验证推理

## 与其他概念的关系

- 基于 [注意力机制](/glossary/attention) 实现
- 与 [提示词工程](/glossary/prompt-engineering) 紧密相关
- 可与 [RAG](/glossary/rag) 结合使用

## 延伸阅读

- [提示词工程](/glossary/prompt-engineering)
- [注意力机制](/glossary/attention)
- [RAG](/glossary/rag)
