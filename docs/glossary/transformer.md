---
title: Transformer
description: 现代 AI 模型的核心架构
---

# Transformer

当今几乎所有 AI 模型的"骨架"。它最大的本事是读一段话时能同时注意到里面所有词之间的关系，而不是像以前那样一个字一个字挨着读。正是这个设计让 ChatGPT 等 AI 变得如此聪明。

## 概述

**Transformer** 是一种基于**自注意力机制**（Self-Attention Mechanism）的深度学习架构，由 Google 研究团队在 2017 年的论文《Attention Is All You Need》中首次提出。它彻底改变了自然语言处理（NLP）领域，并逐步扩展到计算机视觉（CV）、语音识别、蛋白质结构预测等多个领域，成为现代 AI 模型的**统一架构**。

与传统的循环神经网络（Recurrent Neural Network，RNN）和卷积神经网络（Convolutional Neural Network，CNN）不同，Transformer 完全基于注意力机制，能够并行处理整个序列，大幅提升了训练效率和长距离依赖建模能力。

:::info 命名由来
"Transformer" 意为"变换器"，因为它通过注意力机制将输入序列变换（Transform）为输出序列。这一命名简洁地概括了架构的核心功能。
:::

## 为什么重要

Transformer 之所以成为 AI 领域的基石架构，原因在于：

- **并行计算能力**：摆脱了 RNN 的序列依赖，所有位置可以同时计算，训练速度提升数倍至数十倍
- **长距离依赖建模**：自注意力机制使任意两个位置之间的信息传递路径长度为 O(1)，有效解决长序列遗忘问题
- **架构统一性**：同一架构可应用于 NLP、CV、Audio 等不同领域，实现**多模态统一**
- **可扩展性**（Scalability）：模型规模可从百万参数扩展到万亿参数，性能持续提升
- **生态繁荣**：基于 Transformer 衍生出 BERT、GPT、T5、ViT 等数百种变体，形成庞大的模型家族

## 核心原理

### 注意力机制的本质

传统 RNN 按顺序处理序列，信息传递路径长度为 $O(n)$，导致长距离依赖难以捕捉。Transformer 的自注意力机制让任意两个位置之间的信息传递路径缩短为 $O(1)$，从根本上解决了长程依赖问题。

### 缩放点积注意力（Scaled Dot-Product Attention）

注意力机制的核心公式：

$$\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V$$

其中除以 $\sqrt{d_k}$ 的原因是：当 $d_k$ 较大时，点积结果方差增大，softmax 容易进入梯度饱和区。缩放因子使点积方差保持在 1 附近，确保训练稳定。

### 并行计算优势

RNN 的序列依赖导致无法并行计算，而 Transformer 的自注意力可以同时对整个序列进行矩阵运算：

- **训练阶段**：所有 Token 的表示可以同时计算，GPU 利用率大幅提升
- **推理阶段**：虽然生成仍是自回归的，但 KV Cache 技术可避免重复计算

### 位置信息注入

由于自注意力对输入顺序不敏感（置换不变性），必须显式注入位置信息。主流方案从固定的正弦函数演进到可学习的 RoPE，使模型既能感知绝对位置，又能捕捉相对位置关系。

## 核心技术架构

### 整体结构

原始 Transformer 采用 **Encoder-Decoder** 结构：

```text
输入 → Encoder（N 层）→ Decoder（N 层）→ 输出
```

- **Encoder**：负责理解输入序列，提取特征表示
- **Decoder**：基于 Encoder 的输出和已生成的部分，自回归地生成输出序列

### 核心组件

#### 1. 自注意力机制（Self-Attention）

自注意力是 Transformer 的核心，计算公式为：

$$\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V$$

其中：

- **Q**（Query，查询）：当前位置的查询向量
- **K**（Key，键）：所有位置的键向量，用于匹配
- **V**（Value，值）：所有位置的值向量，携带实际信息
- **d_k**：Key 向量的维度，用于缩放防止 softmax 饱和

:::tip 直观理解
将自注意力类比为信息检索：Q 是搜索关键词，K 是文档索引，V 是文档内容。注意力分数决定了从每个位置"检索"多少信息。
:::

#### 2. 多头注意力（Multi-Head Attention）

将 Q、K、V 分别投影到多个子空间，并行计算注意力，最后拼接：

$$\text{MultiHead}(Q, K, V) = \text{Concat}(\text{head}_1, ..., \text{head}_h)W^O$$

其中 $\text{head}_i = \text{Attention}(QW_i^Q, KW_i^K, VW_i^V)$。

#### 3. 位置编码（Positional Encoding）

由于 Transformer 没有序列顺序的概念，需要显式注入位置信息：

- **正弦位置编码**（Sinusoidal Positional Encoding）：原始论文使用，基于正弦/余弦函数
- **旋转位置编码**（Rotary Positional Embedding，RoPE）：当前主流，支持外推和相对位置
- **ALiBi**（Attention with Linear Biases）：通过注意力偏置实现，外推能力更强

#### 4. 前馈网络（Feed-Forward Network，FFN）

对每个位置的特征进行非线性变换：

$$\text{FFN}(x) = \max(0, xW_1 + b_1)W_2 + b_2$$

现代变体常用 SwiGLU 激活函数替代 ReLU：$\text{SwiGLU}(x) = \text{Swish}(xW_1) \otimes (xW_2)$。

#### 5. 层归一化与残差连接

- **层归一化**（Layer Normalization）：稳定训练，加速收敛
- **残差连接**（Residual Connection）：解决深层网络梯度消失

### 位置编码对比

| 编码方式   | 外推能力 | 计算效率 | 主流应用         |
| ---------- | -------- | -------- | ---------------- |
| 正弦编码   | 差       | 高       | 原始 Transformer |
| RoPE       | 中       | 高       | Llama、Qwen      |
| ALiBi      | 强       | 高       | MPT、BLOOM       |
| 学习型编码 | 差       | 中       | T5               |

## 主流变体架构

### Encoder-only 架构

仅使用 Encoder 部分，擅长**理解任务**：

- **BERT**（Google）：双向编码，通过 Masked Language Model 预训练
- **RoBERTa**（Meta）：改进 BERT 训练策略
- **XLM-R**（Meta）：多语言理解

### Decoder-only 架构

仅使用 Decoder 部分，擅长**生成任务**，当前 LLM 的主流选择：

- **GPT 系列**（OpenAI）：自回归语言模型
- **Llama 系列**（Meta）：开源 LLM 代表
- **Qwen 系列**（阿里）：中文能力突出

### Encoder-Decoder 架构

完整结构，擅长**序列到序列**（Seq2Seq）任务：

- **T5**（Google）：统一文本到文本框架
- **BART**（Meta）：去噪自编码器预训练

### 架构变体对比

| 架构 | 注意力方向 | 代表模型 | 适用场景 | 优缺点 |
|------|------------|----------|----------|--------|
| Encoder-only | 双向 | BERT、RoBERTa | 分类、NER、检索 | 理解能力强，无法生成 |
| Decoder-only | 单向（因果） | GPT、Llama、Qwen | 文本生成、对话 | 通用性强，训练高效 |
| Encoder-Decoder | 双向 + 交叉 | T5、BART | 翻译、摘要 | 生成质量高，训练成本高 |
| MoE | 单向 + 路由 | Mixtral、DeepSeek V3 | 大规模生成 | 参数大、计算小，路由复杂 |

### 混合专家架构（MoE）

**混合专家**（Mixture of Experts，MoE）将 FFN 替换为多个专家网络，每次只激活部分专家，实现"大模型参数、小模型计算"：

- **Mixtral 8x7B**（Mistral AI）：8 个专家，每次激活 2 个
- **DeepSeek V3**（深度求索）：多 token 预测 + MoE
- **Qwen MoE**：阿里开源 MoE 系列

## 工程实践

### 推理优化

Transformer 推理的主要瓶颈在于**自注意力计算**和**KV Cache 显存占用**：

```python
# KV Cache 示例：避免重复计算
# 不使用 KV Cache：每个 Token 重新计算所有历史
# 使用 KV Cache：缓存历史的 K、V 矩阵，仅计算新 Token
past_key_values = model(inputs, past_key_values=past_key_values)
```

常见优化技术：

| 技术                                 | 原理                         | 收益                      |
| ------------------------------------ | ---------------------------- | ------------------------- |
| **FlashAttention**                   | 优化注意力计算的 IO 效率     | 速度提升 2-4 倍，显存减少 |
| **PagedAttention**                   | 类似虚拟内存的 KV Cache 管理 | 吞吐量提升 20 倍+         |
| **量化**（Quantization）             | 降低权重精度                 | 显存减少 2-4 倍           |
| **投机采样**（Speculative Decoding） | 小模型草稿 + 大模型验证      | 加速 2-3 倍               |

### 训练优化

- **混合精度训练**（Mixed Precision Training）：FP16/BF16 + FP32 混合
- **梯度累积**（Gradient Accumulation）：模拟大 batch size
- **ZeRO**（Zero Redundancy Optimizer）：DeepSpeed 的分布式训练优化
- **激活检查点**（Activation Checkpointing）：用计算换显存

### 上下文扩展

原始 Transformer 的上下文长度受限于注意力计算的 O(n²) 复杂度。扩展方法：

- **RoPE 插值**：线性/NTK 插值扩展上下文
- **滑动窗口注意力**（Sliding Window Attention）：仅关注局部窗口
- **线性注意力**（Linear Attention）：将复杂度降至 O(n)

## 与其他概念的关系

- 是 [大语言模型](/glossary/llm) 的基础架构
- 核心是 [注意力机制](/glossary/attention)，决定了模型的序列建模能力
- 支撑 [多模态模型](/glossary/multimodal-model) 的发展（如 ViT、CLIP）
- 通过 [Embedding](/glossary/embedding) 层将离散输入转换为连续向量
- 衍生出 [开源模型](/glossary/open-source-model)（Llama、Qwen）和 [闭源模型](/glossary/proprietary-model)（GPT、Claude）两大阵营

## 延伸阅读

- [大语言模型](/glossary/llm)
- [注意力机制](/glossary/attention)
- [多模态模型](/glossary/multimodal-model)
- [Attention Is All You Need](https://arxiv.org/abs/1706.03762) — Transformer 原始论文
- [FlashAttention 论文](https://arxiv.org/abs/2205.14135) — 高效注意力计算
- [The Illustrated Transformer](https://jalammar.github.io/illustrated-transformer/) — 可视化讲解
- [Transformer 架构演进综述](https://arxiv.org/abs/2306.01901)
