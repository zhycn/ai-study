---
title: 大语言模型
description: Large Language Model (LLM)，基于海量文本训练的语言模型
---

# 大语言模型

就是 AI 的"大脑"，ChatGPT、文心一言这些产品背后都是它在干活。它读了互联网上几乎所有的文字，学会了像人一样说话、写文章、写代码，甚至能帮你分析问题出主意。

## 概述

**大语言模型**（Large Language Model，LLM）是指基于海量文本数据训练、拥有数十亿至数万亿参数的语言模型，能够理解、生成和处理人类语言。LLM 的核心突破在于通过**缩放定律**（Scaling Law）——随着模型参数量、训练数据量和计算量的增加，模型展现出前所未有的语言理解和推理能力。

现代 LLM 大多基于 [Transformer](/glossary/transformer) 架构的 Decoder-only 变体，通过自回归（Autoregressive）方式逐 Token 预测下一个词。这种简单而强大的范式，使 LLM 成为当前 AI 领域最具影响力的技术之一。

:::tip 什么是 Token？
Token 是 LLM 处理文本的基本单位，可以是词、子词或字符。例如英文 "unbelievable" 可能被拆分为 "un"、"believ"、"able" 三个 Token。中文通常按字或词拆分。
:::

## 为什么重要

大语言模型之所以成为 AI 领域的核心，源于以下几个关键因素：

- **通用智能的曙光**：LLM 展现出类似人类的语言理解、逻辑推理和知识迁移能力，被部分研究者认为是**通用人工智能**（Artificial General Intelligence，AGI）的早期形态
- **广泛的应用场景**：从对话系统、内容创作、代码生成到数据分析，LLM 几乎能处理所有基于语言的任务
- **技术范式的转变**：LLM 带来了 **Prompt as Code** 的新范式——通过自然语言提示词（Prompt）而非传统编程来驱动 AI 完成任务
- **涌现能力**（Emergent Abilities）：当模型规模达到临界点时，会突然展现出训练目标之外的能力，如思维链推理（Chain-of-Thought）、代码理解和多步规划

## 核心技术架构

### Transformer 架构

LLM 的基础是 Transformer 架构，其核心组件包括：

1. **自注意力机制**（Self-Attention Mechanism）：计算序列中每个位置与其他位置的关系，捕捉长距离依赖
2. **多头注意力**（Multi-Head Attention）：并行运行多个注意力头，捕捉不同维度的语义关系
3. **前馈神经网络**（Feed-Forward Network，FFN）：对每个位置的特征进行非线性变换
4. **层归一化**（Layer Normalization）：稳定训练过程，加速收敛
5. **残差连接**（Residual Connection）：解决深层网络的梯度消失问题

### 训练流程

LLM 的训练通常分为三个阶段：

```
预训练（Pre-training）→ 监督微调（SFT）→ 人类对齐（Alignment）
```

1. **预训练**（Pre-training）：在海量无标注文本上进行**自监督学习**（Self-Supervised Learning），目标是预测下一个 Token。这一阶段赋予模型语言能力和世界知识
2. **监督微调**（Supervised Fine-Tuning，SFT）：使用高质量指令-回答对进行微调，使模型学会遵循指令
3. **人类对齐**（Alignment）：通过 **RLHF**（Reinforcement Learning from Human Feedback，基于人类反馈的强化学习）或 **DPO**（Direct Preference Optimization，直接偏好优化）使模型输出符合人类偏好

:::warning 训练成本
训练一个 70B 参数的 LLM 需要数千张 GPU 运行数周，成本高达数百万美元。这也是为什么大多数开发者选择使用预训练模型或开源模型进行微调。
:::

### 推理优化

在生产环境中，LLM 推理面临以下挑战及优化方案：

| 优化技术                              | 原理                             | 效果                   |
| ------------------------------------- | -------------------------------- | ---------------------- |
| **KV Cache**                          | 缓存历史 Token 的 Key-Value 矩阵 | 减少重复计算，加速生成 |
| **量化**（Quantization）              | 降低权重精度（FP16 → INT8/INT4） | 减少显存占用 2-4 倍    |
| **投机采样**（Speculative Decoding）  | 用小模型草稿，大模型验证         | 加速 2-3 倍            |
| **连续批处理**（Continuous Batching） | 动态处理不同长度的请求           | 提升吞吐量 10 倍+      |

## 主流模型与实现

### 闭源模型

- **GPT-4/4o**（OpenAI）：多模态能力，支持文本、图像输入，实时语音交互
- **Claude 3.5/4**（Anthropic）：以安全性和长上下文著称，支持 200K Token 上下文
- **Gemini 2.0**（Google）：原生多模态架构，深度集成 Google 生态

### 开源模型

- **Llama 3/4**（Meta）：8B/70B/400B 多尺寸，生态最完善的开源系列
- **Qwen 2.5/3**（阿里）：中文能力突出，支持 256K 上下文
- **DeepSeek V3/R1**（深度求索）：MoE 架构，推理模型 R1 展现强大逻辑能力
- **Mistral**（Mistral AI）：高效小模型，适合边缘部署

### 模型选择建议

```
快速原型/生产环境 → 闭源 API（GPT-4o、Claude）
数据敏感/定制需求 → 开源模型（Llama、Qwen）+ 本地部署
成本敏感/高并发   → 小参数开源模型（8B-14B）+ 量化
```

## 工程实践

### 上下文窗口管理

LLM 的上下文窗口（Context Window）限制了单次交互能处理的 Token 数量。常见策略：

- **截断**：保留最新的 N 个 Token
- **摘要压缩**：用 LLM 对历史对话生成摘要
- **RAG**（检索增强生成）：将相关知识检索后注入 Prompt，而非依赖长上下文
- **滑动窗口**：维护固定大小的对话历史

### 提示词工程

**提示词工程**（Prompt Engineering）是与 LLM 交互的核心技能。有效模式包括：

- **系统提示**（System Prompt）：设定角色和行为边界
- **少样本提示**（Few-Shot Prompting）：提供 2-5 个示例引导输出格式
- **思维链**（Chain-of-Thought，CoT）：要求模型逐步推理
- **结构化输出**：要求模型输出 JSON/XML 等格式，便于程序解析

:::tip 提示词最佳实践

1. 明确角色和任务目标
2. 提供具体示例而非抽象描述
3. 使用分隔符区分不同部分
4. 指定输出格式和约束条件
5. 对关键步骤要求模型"逐步思考"
   :::

### 评估与测试

评估 LLM 能力的主要方法：

- **基准测试**（Benchmark）：MMLU（多学科理解）、HumanEval（代码能力）、GSM8K（数学推理）
- **人工评估**：对输出质量进行主观评分
- **自动化评估**：使用 LLM-as-a-Judge 模式，用强模型评估弱模型输出

## 与其他概念的关系

- 基于 [Transformer](/glossary/transformer) 架构，是其 Decoder-only 变体的典型应用
- 是 [生成式 AI](/glossary/generative-ai) 的核心技术，驱动文本、代码等内容生成
- 依赖 [注意力机制](/glossary/attention) 实现序列建模
- 通过 [Embedding](/glossary/embedding) 将文本转换为向量表示
- 使用 [提示词工程](/glossary/prompt-engineering) 优化交互效果
- 分为 [开源模型](/glossary/open-source-model) 和 [闭源模型](/glossary/proprietary-model) 两大阵营
- 正向 [多模态模型](/glossary/multimodal-model) 演进，支持图像、音频等多模态输入

## 延伸阅读

- [Transformer 架构详解](/glossary/transformer)
- [注意力机制原理](/glossary/attention)
- [提示词工程实践](/glossary/prompt-engineering)
- [开源模型生态](/glossary/open-source-model)
- [Attention is All You Need](https://arxiv.org/abs/1706.03762) — Transformer 原始论文
- [Scaling Laws for Neural Language Models](https://arxiv.org/abs/2001.08361) — 缩放定律论文
- [OpenAI GPT-4 技术报告](https://arxiv.org/abs/2303.08774)
