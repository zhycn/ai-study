---
title: Token
description: 模型处理文本的基本单位
---

# Token

## 概述

Token（词元）是语言模型处理文本时的基本单位。它可以是一个完整的单词、单词的一部分、单个字符，甚至是标点符号或特殊标记。现代大语言模型并不直接理解原始文本，而是先将文本切分为 Token 序列，再将每个 Token 映射为向量表示，最终在神经网络中进行计算。

理解 Token 是理解大语言模型工作原理的第一步。无论是输入提示词还是模型生成的输出，本质上都是 Token 序列的变换过程。

## 为什么重要

Token 在 AI 开发中扮演着多重关键角色：

- **计算基础**：模型的所有计算都以 Token 为基本单元，注意力机制、前馈网络等操作都在 Token 级别进行
- **成本计算**：主流 API（如 OpenAI、Claude、Gemini）均按 Token 数量计费，理解 Token 有助于预估和控制成本
- **上下文限制**：模型的上下文窗口以 Token 数量衡量，直接影响能处理的文本长度
- **语义粒度**：Token 化的方式决定了模型理解文本的精细程度，影响生成质量

::: tip
一个英文单词通常对应 1-2 个 Token，而中文一个汉字通常对应 1 个 Token。但具体数量取决于所使用的 Tokenizer。
:::

## 核心技术：Tokenization

### 什么是 Tokenization

Tokenization（分词/词元化）是将原始文本切分为 Token 序列的过程。不同的 Tokenization 策略会显著影响模型的性能和效率。

### 主流 Tokenization 算法

#### BPE（Byte-Pair Encoding，字节对编码）

BPE 是最常用的子词 Tokenization 算法之一。它从字符级别开始，迭代合并出现频率最高的字符对，逐步构建词表。

```python
# BPE 简化的工作示例
# 初始词表: ['h', 'e', 'l', 'o', ' ', 'w', 'r', 'd']
# 合并 "l" + "o" -> "lo"（高频出现）
# 合并 "lo" + " " -> "lo "（继续合并）
# 最终: "hello world" -> ["hell", "o", " ", "world"]
```

BPE 的优势在于能够平衡词表大小和未知词（OOV，Out-of-Vocabulary）问题。常见实现包括 GPT 系列使用的 `tiktoken`。

#### WordPiece

WordPiece 与 BPE 类似，但合并策略基于语言模型似然度而非简单的频率统计。BERT 和早期的 Transformer 模型使用此算法。

```
# WordPiece 示例
"playing" -> ["play", "##ing"]
"unhappy" -> ["un", "##happy"]
```

`##` 前缀表示该 Token 是前一个 Token 的延续。

#### SentencePiece

SentencePiece 将输入文本视为 Unicode 字符序列，不依赖预分词，支持多语言统一处理。Google 的 T5 和 LLaMA 系列使用此算法。

```
# SentencePiece 示例（使用 unigram 模型）
"自然语言处理" -> ["▁自然", "语言", "处理"]
```

`▁`（下划线）表示子词起始位置。

### Tokenizer 的实际使用

```python
import tiktoken

# 使用 OpenAI 的 cl100k_base 编码器（GPT-4 系列）
enc = tiktoken.get_encoding("cl100k_base")

text = "Hello, world! 你好世界！"
tokens = enc.encode(text)

print(f"文本: {text}")
print(f"Token IDs: {tokens}")
print(f"Token 数量: {len(tokens)}")
print(f"解码: {enc.decode(tokens)}")
```

输出示例：
```
文本: Hello, world! 你好世界！
Token IDs: [15339, 11, 1917, 0, 24532, 236, 21367, 24532, 236, 109]
Token 数量: 10
解码: Hello, world! 你好世界！
```

::: warning
不同模型使用不同的 Tokenizer，Token 数量不可直接跨模型比较。预估成本时应使用对应模型的 Tokenizer 进行计算。
:::

## 应用场景

### API 调用成本估算

```python
def estimate_cost(prompt: str, model: str = "gpt-4") -> float:
    """估算 API 调用成本"""
    enc = tiktoken.encoding_for_model(model)
    prompt_tokens = len(enc.encode(prompt))

    # GPT-4 定价（示例）
    prices = {
        "gpt-4": {"input": 0.03, "output": 0.06},  # 每 1K Token
    }

    price = prices.get(model, prices["gpt-4"])
    estimated_output = prompt_tokens * 1.5  # 粗略估算
    cost = (prompt_tokens / 1000 * price["input"] +
            estimated_output / 1000 * price["output"])
    return cost
```

### 上下文窗口管理

当输入文本超过模型的上下文窗口时，需要采取截断或分块策略：

```python
def truncate_to_context(text: str, max_tokens: int = 8192) -> str:
    """将文本截断到模型上下文窗口内"""
    enc = tiktoken.get_encoding("cl100k_base")
    tokens = enc.encode(text)

    if len(tokens) <= max_tokens:
        return text

    # 保留开头和结尾，中间截断
    head_tokens = max_tokens // 2
    tail_tokens = max_tokens - head_tokens
    return enc.decode(tokens[:head_tokens] + tokens[-tail_tokens:])
```

### 流式输出处理

在流式生成场景中，模型逐个 Token 返回结果：

```python
# 伪代码：处理流式 Token 输出
async def handle_stream(response):
    full_text = ""
    async for chunk in response:
        token = chunk.choices[0].delta.content
        if token:
            full_text += token
            # 实时更新 UI
            yield full_text
```

## 与其他概念的关系

- Token 数量受 [上下文窗口](/glossary/context-window) 限制，决定了单次交互能处理的文本长度
- Token 经过 Embedding 层转换为向量，是 [Embedding](/glossary/embedding) 的直接输入
- Token 之间的依赖关系通过 [注意力机制](/glossary/attention) 建模
- Token 化策略影响 [幻觉](/glossary/hallucination) 的产生概率，罕见 Token 更容易导致错误生成

## 延伸阅读

- [上下文窗口](/glossary/context-window) — 理解模型能处理的 Token 数量上限
- [Embedding](/glossary/embedding) — Token 如何被转换为向量表示
- [注意力机制](/glossary/attention) — Token 之间如何建立关联
- [幻觉](/glossary/hallucination) — Token 级别的不确定性如何导致错误输出
- [Attention Is All You Need](https://arxiv.org/abs/1706.03762) — Transformer 原始论文
- [tiktoken 文档](https://github.com/openai/tiktoken) — OpenAI 的 Tokenizer 库
