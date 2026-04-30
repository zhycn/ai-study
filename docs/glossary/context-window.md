---
title: 上下文窗口
description: Context Window，模型一次能处理的文本长度
---

# 上下文窗口

AI 一次性能"记住"多少内容。就像人的短期记忆有限，一次只能记住几句话一样，AI 也有自己的记忆上限。窗口越大，一次能处理的文字就越多，能理解更长的文章和更复杂的对话。

## 概述

上下文窗口（Context Window）是指语言模型在单次推理过程中能够处理的最大 [Token](/glossary/token) 数量。它定义了模型能"看到"的输入文本范围，包括用户提示词、系统指令、历史对话以及模型自身的输出。

上下文窗口是衡量模型能力的关键指标之一。更大的上下文窗口意味着模型能够处理更长的文档、理解更复杂的任务、维持更长的对话历史。

## 为什么重要

- **记忆容量**：决定了模型在单次交互中能"记住"多少信息
- **任务范围**：长上下文窗口使模型能够处理整本书、长代码文件、完整对话历史
- **成本控制**：上下文越长，计算成本越高，需要权衡性能与费用
- **技术挑战**：扩展上下文窗口而不损失精度是当前研究热点

::: tip
主流模型的上下文窗口：GPT-4 Turbo 为 128K Token，Claude 3 为 200K Token，Gemini 1.5 Pro 高达 1M Token。
:::

## 核心技术原理

### 注意力机制与上下文长度

上下文窗口的限制本质上来自 [注意力机制](/glossary/attention) 的计算复杂度。标准自注意力的时间和空间复杂度均为 $O(n^2)$，其中 $n$ 是序列长度。

```text
序列长度 n    注意力矩阵大小 n²    内存占用（FP32）
1,024         1,048,576           ~4 MB
4,096         16,777,216          ~64 MB
128,000       16,384,000,000      ~64 GB
1,000,000     1,000,000,000,000   ~4 TB
```

::: warning
当上下文窗口从 4K 扩展到 128K 时，注意力矩阵的规模增加 1024 倍。这就是为什么长上下文处理需要特殊的优化技术。
:::

### KV Cache（键值缓存）

在自回归生成中，每一步都会产生新的 Token，需要重新计算注意力。KV Cache 通过缓存历史 Token 的 Key 和 Value 矩阵，避免重复计算：

```python
# KV Cache 伪代码
class KVCache:
    def __init__(self, max_length, num_heads, head_dim):
        self.keys = torch.zeros(max_length, num_heads, head_dim)
        self.values = torch.zeros(max_length, num_heads, head_dim)
        self.current_length = 0

    def update(self, new_key, new_value):
        self.keys[self.current_length] = new_key
        self.values[self.current_length] = new_value
        self.current_length += 1
        return self.keys[:self.current_length], self.values[:self.current_length]
```

KV Cache 的内存占用为 $O(n \cdot d \cdot h)$，其中 $n$ 是序列长度，$d$ 是头维度，$h$ 是注意力头数。对于长上下文，KV Cache 可能成为内存瓶颈。

### 位置编码

模型需要知道每个 Token 在序列中的位置。常见的位置编码方案：

| 方案                     | 说明                        | 支持的外推性 |
| ------------------------ | --------------------------- | ------------ |
| **绝对位置编码**         | 每个位置有固定的向量        | 差           |
| **RoPE（旋转位置编码）** | 通过旋转矩阵编码相对位置    | 好           |
| **ALiBi**                | 注意力偏置随距离线性衰减    | 优秀         |
| **YaRN**                 | RoPE 的扩展，支持超长上下文 | 优秀         |

```python
# RoPE 简化实现
def apply_rotary_emb(x, freqs_cos, freqs_sin):
    """应用旋转位置编码"""
    x_even = x[..., ::2]
    x_odd = x[..., 1::2]
    return torch.cat([
        x_even * freqs_cos - x_odd * freqs_sin,
        x_even * freqs_sin + x_odd * freqs_cos
    ], dim=-1)
```

## 应用场景

### 长文档分析

大上下文窗口使模型能够处理完整文档：

| 场景         | 所需上下文     | 说明               |
| ------------ | -------------- | ------------------ |
| 合同审查     | 20K-50K Token  | 完整法律文档分析   |
| 代码库理解   | 50K-100K Token | 多文件代码上下文   |
| 学术论文摘要 | 30K-80K Token  | 完整论文阅读与总结 |
| 会议记录分析 | 100K+ Token    | 数小时会议内容处理 |

### 多轮对话系统

```python
# 对话上下文管理
class ConversationManager:
    def __init__(self, max_context_tokens: int = 128000):
        self.max_tokens = max_context_tokens
        self.history = []

    def add_message(self, role: str, content: str):
        self.history.append({"role": role, "content": content})

    def get_context(self) -> list[dict]:
        """获取适合上下文窗口的对话历史"""
        # 计算 Token 数
        total = sum(count_tokens(msg["content"]) for msg in self.history)
        if total <= self.max_tokens * 0.8:
            return self.history
        # 超出时压缩历史
        return self.compress_history()
```

### RAG 检索增强

在 RAG 系统中，上下文窗口决定了能注入多少检索结果：

```
用户查询 -> 向量检索 -> Top-K 文档块 -> 组装到上下文窗口 -> LLM 生成
                                    ↑
                          窗口大小决定了 K 的最大值
```

### 代码助手

IDE 中的 AI 助手需要足够的上下文来理解代码：

```python
# 代码助手上下文组成
code_context = {
    "current_file": "当前编辑的文件",      # 5K-20K Token
    "related_files": "相关导入和调用文件",  # 20K-50K Token
    "error_message": "错误信息",           # 1K-5K Token
    "chat_history": "对话历史",            # 5K-20K Token
}
# 总计: 31K-95K Token，需要大上下文窗口
```

## 扩展技术

### 上下文扩展训练

通过继续预训练（Continued Pre-training）或微调（Fine-tuning），将模型从短上下文扩展到长上下文：

```python
# 上下文扩展训练策略
training_config = {
    "base_context": 4096,       # 原始上下文长度
    "target_context": 32768,    # 目标上下文长度
    "interpolation_factor": 8,  # 位置编码插值因子
    "learning_rate": 1e-5,      # 较小的学习率
    "epochs": 1,                # 通常只需少量 epoch
}
```

### 滑动窗口注意力

将长序列分割为固定大小的窗口，每个 Token 只关注窗口内的其他 Token：

```text
完整序列: [T1, T2, T3, T4, T5, T6, T7, T8]
窗口大小: 4

窗口 1: [T1, T2, T3, T4]  -> 注意力计算
窗口 2: [T3, T4, T5, T6]  -> 注意力计算
窗口 3: [T5, T6, T7, T8]  -> 注意力计算
```

### 分层上下文管理

将上下文分为不同层级，采用不同的处理策略：

```python
class HierarchicalContext:
    def __init__(self, model):
        self.model = model
        self.short_term = []    # 最近对话（完整保留）
        self.long_term = []     # 历史摘要（压缩存储）
        self.knowledge_base = [] # 外部知识（按需检索）

    def build_prompt(self, query):
        # 组合不同层级的上下文
        context = (
            self.long_term +      # 历史摘要
            self.short_term +     # 最近对话
            self.retrieve_knowledge(query)  # 相关知识
        )
        return format_prompt(context, query)
```

## 工程实践

### 上下文窗口管理策略

```python
def manage_context(messages, max_tokens=128000):
    """智能管理对话上下文"""
    import tiktoken
    enc = tiktoken.get_encoding("cl100k_base")

    # 计算当前 Token 数量
    total_tokens = sum(len(enc.encode(m["content"])) for m in messages)

    if total_tokens <= max_tokens * 0.8:
        return messages  # 安全范围内

    # 超过阈值，压缩上下文
    compressed = []
    # 保留系统消息和最近几条对话
    for msg in messages:
        if msg["role"] == "system":
            compressed.append(msg)
        elif msg["role"] == "user" and len(compressed) < 3:
            compressed.append(msg)

    # 中间对话用摘要替代
    if len(messages) > 5:
        summary = summarize(messages[1:-3])
        compressed.insert(1, {"role": "system", "content": f"历史摘要: {summary}"})

    return compressed
```

### RAG 中的分块策略

在检索增强生成中，需要将长文档切分为适合上下文窗口的块：

```python
def chunk_document(text, chunk_size=500, overlap=50):
    """将文档切分为重叠的块"""
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)
        start = end - overlap  # 重叠部分保持上下文连贯
    return chunks
```

::: info
分块大小需要根据模型的上下文窗口和任务需求调整。过小的块可能丢失上下文，过大的块可能浪费 Token 并降低检索精度。
:::

## 与其他概念的关系

- 上下文窗口限制了可输入的 [Token](/glossary/token) 总数
- 窗口内的 Token 通过 [注意力机制](/glossary/attention) 建立关联
- [RAG](/glossary/rag) 通过外部检索突破上下文窗口的限制
- [幻觉](/glossary/hallucination) 在长上下文中更容易发生（"迷失中间"现象）

## 延伸阅读

- [Token](/glossary/token) — 上下文窗口的计量单位
- [注意力机制](/glossary/attention) — 上下文处理的核心机制
- [RAG](/glossary/rag) — 突破上下文窗口限制的检索增强方案
- [幻觉](/glossary/hallucination) — 长上下文中的"迷失中间"问题
- [RoFormer: Enhanced Transformer with Rotary Position Embedding](https://arxiv.org/abs/2104.09864) — RoPE 位置编码
- [Lost in the Middle](https://arxiv.org/abs/2307.03172) — 长上下文中的信息位置效应
