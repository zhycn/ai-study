---
title: 温度
description: Temperature，控制模型输出随机性的参数
---

# 温度

## 概述

温度（Temperature）是大语言模型生成文本时的核心超参数，用于控制输出分布的随机性程度。温度参数通过缩放 logits（未归一化的预测分数），改变 softmax 后各 [Token](/glossary/token) 的概率分布，从而影响生成结果的确定性和创造性。

温度是开发者最容易调节的生成参数之一，合理设置温度可以在创造性与准确性之间取得平衡。

## 为什么重要

- **创造性控制**：调节输出的多样性和创意程度
- **一致性控制**：影响输出的稳定性和可重复性
- **场景适配**：不同应用场景需要不同的温度设置
- **调试工具**：帮助理解和调试模型的生成行为

::: tip
温度参数的默认值通常为 1.0。大多数 API 允许的范围是 0.0 到 2.0，但实际有效范围通常在 0.0 到 1.5 之间。
:::

## 核心技术原理

### 数学原理

温度通过缩放 logits 来改变概率分布：

$$P(x_i) = \frac{\exp(z_i / T)}{\sum_j \exp(z_j / T)}$$

其中：
- $z_i$ 是第 $i$ 个 Token 的 logits（未归一化分数）
- $T$ 是温度参数
- $P(x_i)$ 是第 $i$ 个 Token 的生成概率

```python
import numpy as np

def softmax_with_temperature(logits, temperature=1.0):
    """带温度的 softmax"""
    scaled_logits = logits / temperature
    exp_logits = np.exp(scaled_logits - np.max(scaled_logits))
    return exp_logits / np.sum(exp_logits)

# 示例 logits
logits = np.array([2.0, 1.0, 0.1, -0.5])

print("原始 logits:", logits)
print("T=0.1:", softmax_with_temperature(logits, 0.1))
print("T=1.0:", softmax_with_temperature(logits, 1.0))
print("T=2.0:", softmax_with_temperature(logits, 2.0))
```

输出：
```
原始 logits: [2.0, 1.0, 0.1, -0.5]
T=0.1: [0.9997, 0.0003, 0.0, 0.0]    # 几乎确定选择第一个
T=1.0: [0.643, 0.236, 0.096, 0.025]  # 原始概率分布
T=2.0: [0.448, 0.272, 0.173, 0.107]  # 分布更均匀
```

### 温度对概率分布的影响

| 温度值 | 效果 | 概率分布 | 适用场景 |
|--------|------|----------|----------|
| **0.0** | 完全确定 | 100% 选择最高概率 Token | 代码生成、精确翻译 |
| **0.1-0.3** | 高度确定 | 极高概率选择最优 Token | 数据提取、格式化输出 |
| **0.4-0.7** | 平衡 | 保留一定多样性 | 问答、对话、一般任务 |
| **0.8-1.0** | 创造性 | 显著的概率分散 | 创意写作、头脑风暴 |
| **>1.0** | 高度随机 | 接近均匀分布 | 诗歌、实验性创作 |

```
温度变化对概率分布的可视化:

T=0.1  ████░░░░░░░░░░░░░░░░  (高度集中)
T=0.5  ████████░░░░░░░░░░░░  (适度分散)
T=1.0  ███████████░░░░░░░░░  (原始分布)
T=2.0  ████████████████░░░░  (更加分散)
```

## 与其他采样策略的关系

温度通常与其他采样策略配合使用：

### Top-p（Nucleus Sampling，核采样）

只从累积概率达到阈值 $p$ 的最小 Token 集合中采样：

```python
def top_p_sampling(logits, temperature=1.0, top_p=0.9):
    """Top-p 采样"""
    probs = softmax_with_temperature(logits, temperature)

    # 按概率降序排序
    sorted_indices = np.argsort(-probs)
    sorted_probs = probs[sorted_indices]

    # 计算累积概率
    cumulative_probs = np.cumsum(sorted_probs)

    # 找到累积概率 >= top_p 的最小集合
    cutoff_index = np.searchsorted(cumulative_probs, top_p)
    cutoff_index = min(cutoff_index + 1, len(probs))

    # 只保留 top-p 集合中的 Token
    mask = np.zeros_like(probs)
    mask[sorted_indices[:cutoff_index]] = 1
    filtered_probs = probs * mask
    filtered_probs /= filtered_probs.sum()

    return np.random.choice(len(probs), p=filtered_probs)
```

### Top-k 采样

只从概率最高的 $k$ 个 Token 中采样：

```python
def top_k_sampling(logits, temperature=1.0, top_k=50):
    """Top-k 采样"""
    probs = softmax_with_temperature(logits, temperature)

    # 只保留 top-k
    top_k_indices = np.argsort(-probs)[:top_k]
    filtered_probs = np.zeros_like(probs)
    filtered_probs[top_k_indices] = probs[top_k_indices]
    filtered_probs /= filtered_probs.sum()

    return np.random.choice(len(probs), p=filtered_probs)
```

### 策略组合

| 组合 | 效果 | 推荐场景 |
|------|------|----------|
| **T=0 + greedy** | 完全确定 | 代码、翻译、数据提取 |
| **T=0.7 + top_p=0.9** | 平衡质量与多样性 | 通用对话、问答 |
| **T=0.9 + top_k=40** | 创造性输出 | 创意写作、故事生成 |
| **T=1.0 + top_p=0.95** | 高度多样 | 头脑风暴、诗歌 |

::: warning
同时使用 top-p 和 top-k 时，top-k 先执行，top-p 后执行。两者结合可能导致采样空间过小，输出过于单一。
:::

## 工程实践

### API 调用示例

```python
from openai import OpenAI

client = OpenAI()

def generate_with_temperature(prompt, temperature=0.7):
    """使用指定温度生成文本"""
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        temperature=temperature,
        top_p=0.9,
        max_tokens=500
    )
    return response.choices[0].message.content

# 不同温度的效果对比
prompt = "写一个关于 AI 的短故事"

for temp in [0.1, 0.5, 0.7, 1.0]:
    result = generate_with_temperature(prompt, temperature=temp)
    print(f"温度 {temp}: {result[:100]}...")
```

### 温度选择指南

```python
def recommend_temperature(task_type):
    """根据任务类型推荐温度"""
    recommendations = {
        "code_generation": {"temperature": 0.1, "top_p": 0.1},
        "translation": {"temperature": 0.3, "top_p": 0.9},
        "summarization": {"temperature": 0.3, "top_p": 0.9},
        "qa": {"temperature": 0.5, "top_p": 0.9},
        "chat": {"temperature": 0.7, "top_p": 0.9},
        "creative_writing": {"temperature": 0.9, "top_p": 0.95},
        "brainstorming": {"temperature": 1.0, "top_p": 0.95},
        "data_extraction": {"temperature": 0.0, "top_p": 1.0},
    }
    return recommendations.get(task_type, {"temperature": 0.7, "top_p": 0.9})

# 使用示例
config = recommend_temperature("code_generation")
response = client.chat.completions.create(
    model="gpt-4",
    messages=[...],
    **config
)
```

### 调试技巧

```python
def analyze_temperature_effect(prompt, n_trials=5):
    """分析温度对输出多样性的影响"""
    results = {}
    for temp in [0.1, 0.3, 0.5, 0.7, 1.0]:
        outputs = set()
        for _ in range(n_trials):
            output = generate_with_temperature(prompt, temperature=temp)
            outputs.add(output)

        # 计算唯一输出比例
        uniqueness = len(outputs) / n_trials
        results[temp] = {
            "uniqueness": uniqueness,
            "avg_length": np.mean([len(o) for o in outputs])
        }

    return results
```

## 与其他概念的关系

- 温度作用于 [Token](/glossary/token) 级别的概率分布
- 高温度增加 [幻觉](/glossary/hallucination) 的概率
- [思维链](/glossary/chain-of-thought) 推理通常使用较低温度以保证推理一致性
- [基准测试](/glossary/benchmark) 评估时通常使用 T=0 以确保结果可复现

## 延伸阅读

- [Token](/glossary/token) — 温度作用于 Token 概率分布
- [幻觉](/glossary/hallucination) — 温度对幻觉率的影响
- [思维链](/glossary/chain-of-thought) — 推理任务的温度设置
- [基准测试](/glossary/benchmark) — 评估中的温度控制
- [The Curious Case of Neural Text Degeneration](https://arxiv.org/abs/1904.09751) — Top-p 采样原始论文
