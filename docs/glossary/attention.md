---
title: 注意力机制
description: Attention Mechanism，Transformer 的核心机制
---

# 注意力机制

## 概述

注意力机制（Attention Mechanism）是一种让模型在处理序列数据时，能够动态地关注输入中最相关部分的技术。它通过计算输入元素之间的关联权重，使模型能够"聚焦"于对当前任务最重要的信息。

注意力机制是 [Transformer](/glossary/transformer) 架构的核心，也是现代大语言模型能够理解长文本、捕捉复杂语义关系的根本原因。没有注意力机制，就没有今天的 GPT、Claude、Gemini 等大模型。

## 为什么重要

- **长距离依赖**：有效捕捉序列中任意距离的依赖关系，克服了 RNN 的梯度消失问题
- **并行计算**：所有位置的注意力计算可以并行执行，大幅提升训练效率
- **可解释性**：注意力权重可视化可帮助理解模型"关注"了什么
- **通用性**：已广泛应用于 NLP、计算机视觉、多模态等领域

::: tip
2017 年的论文《Attention Is All You Need》证明了仅靠注意力机制就能构建强大的序列模型，无需依赖传统的 RNN 或 CNN 结构。
:::

## 核心技术原理

### Scaled Dot-Product Attention

注意力机制的核心公式：

$$\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V$$

其中：
- **Q（Query，查询）**：表示当前要处理的位置"想知道什么"
- **K（Key，键）**：表示每个位置"能提供什么"
- **V（Value，值）**：表示每个位置的实际内容
- **$d_k$**：Key 的维度，$\sqrt{d_k}$ 用于缩放防止 softmax 饱和

```python
import torch
import torch.nn.functional as F

def scaled_dot_product_attention(Q, K, V):
    """缩放点积注意力"""
    d_k = Q.size(-1)
    # 计算 Q 和 K 的点积
    scores = torch.matmul(Q, K.transpose(-2, -1))
    # 缩放
    scores = scores / (d_k ** 0.5)
    # softmax 归一化
    weights = F.softmax(scores, dim=-1)
    # 加权求和
    output = torch.matmul(weights, V)
    return output, weights
```

### Multi-Head Attention（多头注意力）

单一注意力头可能只捕捉到一种类型的关系。多头注意力将 Q、K、V 投影到多个子空间，并行计算注意力，最后拼接结果：

```python
class MultiHeadAttention(nn.Module):
    def __init__(self, d_model, num_heads):
        super().__init__()
        self.num_heads = num_heads
        self.d_k = d_model // num_heads

        self.W_Q = nn.Linear(d_model, d_model)
        self.W_K = nn.Linear(d_model, d_model)
        self.W_V = nn.Linear(d_model, d_model)
        self.W_O = nn.Linear(d_model, d_model)

    def forward(self, x):
        Q = self.W_Q(x)
        K = self.W_K(x)
        V = self.W_V(x)

        # 分割多头
        Q = Q.view(-1, self.num_heads, self.d_k)
        K = K.view(-1, self.num_heads, self.d_k)
        V = V.view(-1, self.num_heads, self.d_k)

        # 并行计算注意力
        output, weights = scaled_dot_product_attention(Q, K, V)

        # 拼接多头输出
        output = output.view(-1, self.num_heads * self.d_k)
        return self.W_O(output)
```

::: info
GPT-3 使用 96 个注意力头，每个头处理 128 维的子空间，总维度为 12,288。更多注意力头意味着模型能同时关注不同类型的语义关系。
:::

### 自注意力与交叉注意力

| 类型 | 说明 | 应用场景 |
|------|------|----------|
| **自注意力（Self-Attention）** | Q、K、V 来自同一序列 | 编码器内部、解码器内部 |
| **交叉注意力（Cross-Attention）** | Q 来自一个序列，K、V 来自另一个序列 | 编码器-解码器之间、多模态融合 |

### Causal Attention（因果注意力）

在自回归生成中，模型只能看到当前位置之前的 Token，不能"偷看"未来。这通过上三角掩码（Causal Mask）实现：

```python
def causal_mask(size):
    """生成因果掩码"""
    mask = torch.tril(torch.ones(size, size))
    # 将上三角设为 -inf，softmax 后变为 0
    mask = mask.masked_fill(mask == 0, float('-inf'))
    return mask

# 应用因果掩码
scores = scores + causal_mask(seq_len)
```

## 工程实践

### 注意力可视化

```python
import matplotlib.pyplot as plt
import seaborn as sns

def visualize_attention(weights, tokens):
    """可视化注意力权重"""
    fig, ax = plt.subplots(figsize=(10, 8))
    sns.heatmap(weights.cpu().numpy(),
                xticklabels=tokens,
                yticklabels=tokens,
                cmap='viridis',
                ax=ax)
    ax.set_title('Attention Weights')
    plt.show()

# 示例
tokens = ["The", "cat", "sat", "on", "the", "mat"]
# weights 形状: [num_heads, seq_len, seq_len]
visualize_attention(weights[0], tokens)  # 可视化第一个头
```

### 长序列优化

标准注意力机制的计算复杂度为 $O(n^2)$，处理长序列时成本高昂。常见优化方案：

| 方法 | 思路 | 复杂度 |
|------|------|--------|
| **滑动窗口注意力** | 只关注局部窗口内的 Token | $O(n \cdot w)$ |
| **稀疏注意力** | 只计算部分 Token 对的注意力 | $O(n \log n)$ |
| **线性注意力** | 使用核函数近似 softmax | $O(n)$ |
| **Flash Attention** | IO 感知的精确注意力算法 | $O(n^2)$ 但常数更小 |

```python
# 使用 Flash Attention（需要 flash-attn 库）
from flash_attn import flash_attn_func

# 输入形状: [batch, seq_len, num_heads, head_dim]
output = flash_attn_func(Q, K, V, causal=True)
```

::: warning
Flash Attention 需要 GPU 支持且仅适用于特定硬件。在 CPU 或旧版 GPU 上需回退到标准实现。
:::

## 与其他概念的关系

- 注意力机制是 [Transformer](/glossary/transformer) 架构的核心组件
- 注意力计算的对象是 [Token](/glossary/token) 的 [Embedding](/glossary/embedding) 向量
- [上下文窗口](/glossary/context-window) 的大小直接影响注意力矩阵的规模
- [思维链](/glossary/chain-of-thought) 推理依赖注意力机制在 Token 间传递信息

## 延伸阅读

- [Token](/glossary/token) — 注意力机制的输入单元
- [Embedding](/glossary/embedding) — 注意力计算的向量基础
- [Transformer](/glossary/transformer) — 包含注意力机制的完整架构
- [思维链](/glossary/chain-of-thought) — 注意力机制在推理中的应用
- [Attention Is All You Need](https://arxiv.org/abs/1706.03762) — Transformer 原始论文
- [FlashAttention](https://arxiv.org/abs/2205.14135) — 高效注意力实现
