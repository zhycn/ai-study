---
title: 注意力机制
description: Attention Mechanism，Transformer 的核心机制
---

# 注意力机制

## 概述

注意力机制（Attention Mechanism）是让模型在处理信息时动态关注最相关部分的技术，是 [Transformer](/glossary/transformer) 架构的核心组成部分。

## 为什么重要

- **长距离依赖**：有效处理长文本中的依赖关系
- **并行计算**：支持高效并行训练
- **可解释性**：可视化注意力权重理解模型行为
- **通用性**：已应用到各种 AI 任务

## 主要类型

- **自注意力**：输入序列内部的关系
- **交叉注意力**：不同序列之间的关系
- **多头注意力**：并行多个注意力头
- **稀疏注意力**：只关注部分位置

## 与其他概念的关系

- 是 [Transformer](/glossary/transformer) 的核心组件
- 支撑 [思维链](/glossary/chain-of-thought) 推理
- 是 [大语言模型](/glossary/llm) 的基础技术

## 延伸阅读

- [Transformer](/glossary/transformer)
- [大语言模型](/glossary/llm)
- [思维链](/glossary/chain-of-thought)
