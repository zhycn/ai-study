---
title: 长上下文 (Long Context)
description: Long Context，扩展模型上下文窗口至百万级 Token
---

# 长上下文 (Long Context)

让 AI 一次性能"读完"整本书、整份代码库或数小时会议记录的能力。上下文越长，AI 能同时把握的信息就越多，理解就越全面。

## 概述

**长上下文**（Long Context）是指语言模型能够有效处理远超传统长度限制（通常 4K-8K [Token](/glossary/token)）的输入序列的能力。随着模型上下文窗口扩展到 128K、200K 甚至 1M Token，长上下文处理已成为大语言模型的核心竞争力之一。

长上下文不仅仅是"能输入更多字"，更关键的是模型能否在长文本中**有效定位、理解和利用**相关信息。研究表明，许多模型在长上下文下会出现"迷失中间"（Lost in the Middle）现象——对文本开头和结尾的信息处理较好，但对中间部分的信息容易忽略。

::: info 上下文窗口演进
2023 年初，主流模型上下文窗口为 4K-8K Token。到 2024 年，GPT-4 Turbo 达到 128K，Claude 3 达到 200K，Gemini 1.5 Pro 更是实现了 1M Token（约 70 万汉字）的上下文。上下文长度在一年内增长了 100 倍以上。
:::

## 为什么重要

- **完整文档理解**：无需分块即可处理整篇论文、合同、代码文件，保持全局上下文
- **复杂任务分解**：在长上下文中同时提供任务描述、参考资料、示例和约束条件
- **多轮对话记忆**：维持数百轮对话的连贯性，无需摘要压缩或上下文截断
- **多文档推理**：同时输入多份文档进行交叉引用和综合分析
- **减少信息损失**：避免分块（Chunking）导致的上下文断裂和语义丢失

## 核心原理

### 注意力复杂度瓶颈

标准自注意力机制的计算复杂度为 $O(n^2)$，其中 $n$ 是序列长度：

```text
序列长度    注意力矩阵大小    显存占用（FP16）
4,096       16M              ~32 MB
32,768      1,073M           ~2 GB
128,000     16,384M          ~32 GB
1,000,000   1,000,000M       ~2 TB
```

::: warning
当序列长度从 4K 扩展到 1M 时，注意力矩阵规模增加约 60,000 倍。这就是为什么长上下文需要专门的优化技术，而非简单扩大原始架构。
:::

### 长上下文训练挑战

**数据稀缺**：互联网上高质量的长文本（如书籍、长文档）远少于短文本，预训练数据分布偏向短序列。

**外推困难**（Extrapolation）：在短上下文上训练的模型，直接推理长上下文时性能急剧下降。位置编码的外推能力成为关键瓶颈。

**注意力稀释**：在长序列中，每个 Token 的注意力权重被分散到更多位置上，导致关键信息的注意力信号变弱。

### 位置编码与外推

| 位置编码方案        | 外推能力 | 长上下文支持     | 代表模型         |
| ------------------- | -------- | ---------------- | ---------------- |
| **正弦编码**        | 差       | 不支持           | 原始 Transformer |
| **RoPE**            | 中等     | 需插值扩展       | Llama 2（4K）    |
| **RoPE + NTK 插值** | 好       | 支持 32K+        | Llama 2 扩展版   |
| **RoPE + YaRN**     | 优秀     | 支持 128K+       | Llama 3          |
| **ALiBi**           | 优秀     | 天然支持长上下文 | MPT、BLOOM       |

```python
# NTK 插值扩展 RoPE 上下文
def apply_ntk_scaled_rope(q, k, seq_len, base=10000, scale_factor=4):
    """使用 NTK 感知的 RoPE 缩放"""
    # 缩放 base 频率
    scaled_base = base * (scale_factor ** (dim / (dim - 2)))
    inv_freq = 1.0 / (scaled_base ** (torch.arange(0, dim, 2) / dim))

    # 生成位置索引
    t = torch.arange(seq_len, device=q.device)
    freqs = torch.outer(t, inv_freq)

    # 应用旋转
    q_rotated = apply_rotary_emb(q, freqs)
    k_rotated = apply_rotary_emb(k, freqs)
    return q_rotated, k_rotated
```

## 关键技术

### 上下文扩展训练

通过在长序列数据上继续预训练（Continued Pre-training），将模型从短上下文扩展到长上下文：

```python
# 上下文扩展训练配置
context_extension_config = {
    "base_context": 4096,        # 原始训练上下文
    "target_context": 32768,     # 目标上下文
    "interpolation": "ntk-aware", # 位置编码插值方法
    "learning_rate": 1e-5,       # 较小学习率，避免灾难性遗忘
    "batch_size": 1,             # 长序列需要减小 batch
    "gradient_accumulation": 8,  # 累积梯度模拟大 batch
    "data_mix": {
        "long_text": 0.6,        # 60% 长文本数据
        "code": 0.2,             # 20% 代码数据（天然较长）
        "normal": 0.2,           # 20% 普通数据（防遗忘）
    }
}
```

### 注意力优化

**FlashAttention** 通过 IO 感知算法将注意力计算复杂度从 $O(n^2)$ 的显存占用降低到 $O(n)$：

```python
# 使用 FlashAttention
from flash_attn import flash_attn_func

# 标准注意力：显存 O(n²)
# standard_attn = F.scaled_dot_product_attention(q, k, v)

# FlashAttention：显存 O(n)，速度提升 2-4 倍
flash_attn = flash_attn_func(q, k, v, dropout_p=0.0, causal=True)
```

**滑动窗口注意力**（Sliding Window Attention）限制每个 Token 只关注局部窗口内的其他 Token：

```text
完整注意力: 每个 Token 关注所有位置 → O(n²)
滑动窗口:   每个 Token 只关注窗口内 → O(n × window_size)

窗口大小 = 4096 时:
序列 128K → 标准: 16,384M 操作 → 滑动窗口: 524M 操作（31 倍减少）
```

**稀疏注意力**（Sparse Attention）仅计算部分位置对的注意力：

```python
# 稀疏注意力模式
sparse_patterns = {
    "local": "局部窗口内的注意力",
    "global": "特定 Token（如 [CLS]）关注全局",
    "strided": "固定步长的远程注意力",
    "random": "随机采样的远程注意力",
}
```

### 上下文压缩

当输入超出模型处理能力时，智能压缩保留关键信息：

```python
class ContextCompressor:
    def __init__(self, llm_client, max_tokens=32000):
        self.client = llm_client
        self.max_tokens = max_tokens

    def compress(self, documents, query):
        """压缩文档集合，保留与查询相关的信息"""
        if self.count_tokens(documents) <= self.max_tokens:
            return documents

        # 策略 1：按相关性排序，截断不相关部分
        ranked = self.rank_by_relevance(documents, query)
        compressed = self.truncate_to_limit(ranked, self.max_tokens)

        # 策略 2：对超出部分进行摘要
        if self.count_tokens(compressed) > self.max_tokens:
            overflow = compressed[self.max_tokens:]
            summary = self.client.summarize(overflow)
            compressed = compressed[:self.max_tokens//2] + summary

        return compressed
```

## 长上下文评估

### [Needle In A Haystack](https://github.com/gkamradt/LLMTest_NeedleInAHaystack)（大海捞针）

最经典的长上下文能力测试：在长文本中隐藏一个关键信息（"针"），测试模型能否在不同位置找到它：

```python
def needle_in_haystack_test(model, haystack_length, needle_positions):
    """大海捞针测试"""
    results = {}
    for pos in needle_positions:
        # 在指定位置插入关键信息
        context = build_context_with_needle(haystack_length, pos)
        response = model.generate(context + "\n问题: 针的内容是什么？")
        results[pos] = check_accuracy(response, expected_needle)
    return results

# 典型结果模式:
# 开头位置: 准确率 95%+
# 中间位置: 准确率 60-80%（"迷失中间"现象）
# 结尾位置: 准确率 90%+
```

::: tip
"迷失中间"（Lost in the Middle）现象表明：模型对长文本开头和结尾的信息处理较好，但对中间部分容易忽略。在构建 Prompt 时，应将关键信息放在开头或结尾，而非中间。
:::

### 长上下文评估基准

| 基准                                                                              | 测试内容       | 最大长度      | 特点                     |
| --------------------------------------------------------------------------------- | -------------- | ------------- | ------------------------ |
| **[Needle In A Haystack](https://github.com/gkamradt/LLMTest_NeedleInAHaystack)** | 信息检索       | 1M+ Token     | 简单直观，测试定位能力   |
| **RULER**                                                                         | 多跳推理、聚合 | 128K Token    | 综合评估多种长上下文任务 |
| **LongBench**                                                                     | 6 类任务       | 15K-64K Token | 多语言、多任务           |
| **InfiniteBench**                                                                 | 10 类任务      | 2M Token      | 超长上下文测试           |
| **NeedleBench**                                                                   | 多针检索       | 1M+ Token     | 测试多信息点聚合能力     |

### 评估代码示例

```python
from transformers import pipeline

def evaluate_long_context(model_name, task="retrieval"):
    """评估模型长上下文能力"""
    pipe = pipeline("text-generation", model=model_name)

    # 生成不同长度的测试上下文
    lengths = [4096, 16384, 65536, 131072]
    results = {}

    for length in lengths:
        context = generate_test_context(length)
        prompt = build_prompt(context, task)

        response = pipe(prompt, max_new_tokens=100)
        accuracy = evaluate_response(response[0]["generated_text"])
        results[length] = accuracy

    return results
```

## 应用场景

### 代码库理解

```python
# 代码助手长上下文场景
code_context = {
    "project_structure": "整个项目的目录树",          # 1-2K Token
    "entry_point": "main.py 完整代码",               # 5-10K Token
    "related_modules": "所有相关模块",                # 50-100K Token
    "test_files": "相关测试文件",                     # 10-20K Token
    "documentation": "README 和文档",                 # 5-10K Token
    "error_context": "错误信息和堆栈跟踪",            # 1-5K Token
    "user_question": "用户的具体问题",                # 1-2K Token
}
# 总计: 73-149K Token，需要 128K+ 上下文窗口
```

### 法律合同审查

```text
输入: 完整合同文档（50-200 页，约 50K-200K Token）
任务:
  1. 识别关键条款和风险点
  2. 检查条款之间的一致性
  3. 与标准模板对比差异
  4. 生成审查报告

优势: 模型能同时看到所有条款，发现跨章节的矛盾和不一致
```

### 长视频/音频理解

结合多模态模型，长上下文支持对长视频或音频的完整理解：

```text
视频转录文本: 2 小时会议 → ~60K Token
关键帧描述:   每 30 秒一帧 → ~240 帧描述
任务: 生成会议纪要、提取行动项、识别关键决策
```

### 多文档综合分析

```python
# 多文档分析 Prompt 构造
def build_multi_doc_prompt(query, documents, max_tokens=128000):
    """构造多文档分析 Prompt"""
    system = "你是一个专业的文档分析助手。请基于以下文档回答问题。"

    # 估算每个文档的 Token 数
    doc_tokens = [count_tokens(doc) for doc in documents]
    total = sum(doc_tokens)

    if total <= max_tokens * 0.7:
        # 所有文档都能放入上下文
        context = "\n\n".join(f"文档 {i+1}:\n{doc}" for i, doc in enumerate(documents))
    else:
        # 需要选择性包含
        context = select_relevant_documents(query, documents, max_tokens)

    return f"{system}\n\n{context}\n\n问题: {query}"
```

## 工程实践

### 上下文管理策略

```python
class LongContextManager:
    def __init__(self, max_tokens=128000, safety_margin=0.9):
        self.max_tokens = max_tokens
        self.limit = int(max_tokens * safety_margin)

    def build_context(self, system_prompt, history, documents, query):
        """智能构建长上下文"""
        parts = []
        tokens_used = 0

        # 1. 系统提示（必须保留）
        system_tokens = count_tokens(system_prompt)
        parts.append(("system", system_prompt))
        tokens_used += system_tokens

        # 2. 最近对话历史（优先保留）
        for msg in reversed(history):
            msg_tokens = count_tokens(msg["content"])
            if tokens_used + msg_tokens < self.limit * 0.3:
                parts.insert(1, (msg["role"], msg["content"]))
                tokens_used += msg_tokens
            else:
                break

        # 3. 相关文档
        remaining = self.limit - tokens_used
        for doc in rank_documents_by_relevance(documents, query):
            doc_tokens = count_tokens(doc)
            if doc_tokens <= remaining:
                parts.append(("document", doc))
                remaining -= doc_tokens

        # 4. 用户问题（必须保留）
        parts.append(("query", query))

        return format_parts(parts)
```

### 分块与检索的权衡

当上下文窗口不足以容纳所有信息时，需要在"全量输入"和"检索增强"之间做权衡：

```text
场景 A: 上下文窗口 > 总文档量
  → 直接全部输入，无需分块

场景 B: 上下文窗口 ≈ 总文档量
  → 压缩/摘要后输入

场景 C: 上下文窗口 << 总文档量
  → 使用 RAG 检索相关片段
```

::: tip
随着上下文窗口不断扩大，RAG 和长上下文的边界正在模糊。理想情况下，当窗口足够大时，可以直接输入全部知识；但在实际工程中，RAG 仍然是处理超大规模知识库的必要手段。
:::

### 性能监控

```python
class LongContextMonitor:
    def __init__(self):
        self.metrics = {
            "context_length": [],
            "attention_sparsity": [],
            "response_quality": [],
            "latency": [],
        }

    def record(self, context_tokens, latency, quality_score):
        self.metrics["context_length"].append(context_tokens)
        self.metrics["latency"].append(latency)
        self.metrics["response_quality"].append(quality_score)

    def check_degradation(self, threshold=0.1):
        """检查长上下文下的性能衰减"""
        short_ctx = self.metrics["response_quality"][:10]  # 短上下文
        long_ctx = self.metrics["response_quality"][-10:]  # 长上下文

        avg_short = sum(short_ctx) / len(short_ctx)
        avg_long = sum(long_ctx) / len(long_ctx)

        degradation = (avg_short - avg_long) / avg_short
        return {
            "degradation": degradation,
            "acceptable": degradation < threshold,
        }
```

## 与其他概念的关系

- [上下文窗口](/glossary/context-window) 是长上下文的物理上限
- [注意力机制](/glossary/attention) 的优化是长上下文的核心技术
- [Token](/glossary/token) 是上下文长度的计量单位
- [RAG](/glossary/rag) 与长上下文是互补的信息注入方式
- [幻觉](/glossary/hallucination) 在长上下文中更容易发生（信息稀释导致）
- [KV Cache](/glossary/caching) 的显存占用随上下文长度线性增长

## 延伸阅读

- [上下文窗口](/glossary/context-window) — 上下文长度的基本概念
- [注意力机制](/glossary/attention) — 长上下文优化的核心技术
- [Token](/glossary/token) — 上下文长度的计量单位
- [RAG](/glossary/rag) — 与长上下文的互补方案
- [幻觉](/glossary/hallucination) — 长上下文中的信息稀释问题
- [Lost in the Middle](https://arxiv.org/abs/2307.03172) — 长上下文信息位置效应研究
- [FlashAttention](https://arxiv.org/abs/2205.14135) — 高效注意力计算
- [RULER Benchmark](https://github.com/salesforce/RULER) — 长上下文评估基准
