---
title: 推测解码 (Speculative Decoding)
description: Speculative Decoding，用小模型草稿加速大模型推理的无损加速技术
---

# 推测解码 (Speculative Decoding)

让大模型"先猜后验"的推理加速方法。先用一个小模型快速猜出后面几个 Token，再用大模型一次性验证对错。猜对了就省时间，猜错了也不影响结果，整体推理速度能提升 2-3 倍。

## 概述

**推测解码（Speculative Decoding）**是一种无损推理加速技术，通过引入小型**草稿模型（Draft Model）**预先生成候选 Token 序列，再由大型**目标模型（Target Model）**并行验证这些候选 Token 的接受概率。其核心优势在于：在不改变输出分布的前提下，显著减少自回归解码的串行步数。

传统自回归解码每生成一个 Token 都需要一次完整的前向传播，而推测解码将多个 Token 的生成合并为一次草稿推理加一次并行验证，大幅降低了**时间每输出 Token（Time Per Output Token, TPOT）**。

```text
传统解码（7 步串行）:
Target: [Prompt] → t₁ → t₂ → t₃ → t₄ → t₅ → t₆ → t₇

推测解码（3 步）:
Draft:  [Prompt] → d₁ → d₂ → d₃  （小模型快速草稿）
Target: [Prompt, d₁, d₂, d₃] → 并行验证 → 接受 3 个，拒绝 0 个
Draft:  [Prompt, d₁, d₂, d₃] → d₄ → d₅ → d₆
Target: [Prompt, d₁, d₂, d₃, d₄, d₅, d₆] → 并行验证 → 接受 2 个，拒绝 1 个
...
```

:::tip 提示
推测解码不同于 [量化](/glossary/quantization) 和 [蒸馏](/glossary/distillation)，它不修改模型参数或结构，而是改变**解码策略**。输出分布与原始目标模型完全一致，属于无损加速。
:::

## 为什么重要

**推理加速**：推测解码可将 LLM 的推理速度提升 2-3 倍，且加速效果随草稿模型质量提高而增加。对于 70B 以上的大模型，加速比更为显著。

**无损输出**：与量化、剪枝等近似压缩方法不同，推测解码保证输出分布与原始目标模型完全一致，不会引入精度损失。

**降低 TPOT**：自回归解码是内存带宽受限（Memory-Bound）操作，推测解码通过并行验证减少前向传播次数，有效降低 TPOT。

**部署友好**：无需重新训练或修改模型权重，只需额外加载一个小型草稿模型即可生效。草稿模型可与目标模型共享同一 GPU。

**成本优化**：更快的推理速度意味着更少的 GPU 时间和更低的云服务成本，直接降低 [成本优化](/glossary/cost-optimization) 压力。

## 核心原理

推测解码的数学基础是**自回归分解与并行验证**。目标模型的条件概率分布可以分解为：

```text
P(x₁, x₂, ..., xₙ | context) = Πᵢ P(xᵢ | context, x₁, ..., xᵢ₋₁)
```

### 草稿-验证流程

推测解码的每个循环包含两个阶段：

**草稿阶段（Draft Phase）**：
草稿模型自回归生成 K 个候选 Token：`d₁, d₂, ..., dₖ`

**验证阶段（Verification Phase）**：
目标模型对 `context + d₁, d₂, ..., dₖ` 进行一次前向传播，同时计算每个位置的概率分布 `P_target(x | context, d₁, ..., dᵢ₋₁)`

### 接受-拒绝机制

对于每个草稿 Token `dᵢ`，计算接受概率：

```text
αᵢ = min(1, P_target(dᵢ) / P_draft(dᵢ))
```

- 若 `αᵢ ≥ 1`（即 `P_target ≥ P_draft`）：无条件接受
- 若 `αᵢ < 1`：以概率 `αᵢ` 接受，否则拒绝并从目标分布中采样新 Token

接受概率公式保证了最终输出分布与目标模型的原始分布完全一致。

### 期望加速比

设草稿模型的接受率为 `γ`（即每个 Token 被接受的概率），每次验证 K 个 Token，则期望加速比为：

```text
Speedup ≈ (K + 1) / (1 + K × (1 - γ))
```

当 `γ → 1` 时，加速比趋近于 `K + 1`。实际应用中，接受率通常在 60%-90% 之间。

:::info 信息
推测解码的理论加速比受限于草稿模型与目标模型的**分布相似度**。两者越接近，接受率越高，加速效果越好。
:::

## 架构/方法详解

### 基础推测解码（Speculative Sampling）

Leviathan 等人在 2023 年提出的原始方案，使用独立的小型草稿模型：

```python
# 基础推测解码伪代码
def speculative_decode(target_model, draft_model, context, k=5):
    # 草稿阶段：生成 K 个候选 Token
    draft_tokens = []
    current_context = context
    for _ in range(k):
        token = draft_model.generate(current_context)
        draft_tokens.append(token)
        current_context = current_context + [token]
    
    # 验证阶段：目标模型并行验证
    target_probs = target_model.compute_probs(context, draft_tokens)
    draft_probs = draft_model.compute_probs(context, draft_tokens)
    
    # 接受-拒绝
    accepted_tokens = []
    for i, (d_tok, t_prob, d_prob) in enumerate(zip(draft_tokens, target_probs, draft_probs)):
        alpha = min(1, t_prob[d_tok] / d_prob[d_tok])
        if random() < alpha:
            accepted_tokens.append(d_tok)
        else:
            # 从目标分布采样新 Token
            new_token = sample_from(target_probs[i])
            accepted_tokens.append(new_token)
            break  # 拒绝后停止验证后续 Token
    
    return accepted_tokens
```

### 介导推测解码（Medusa）

**Medusa** 是一种无草稿模型的推测解码方案，通过在目标模型头部添加多个**解码头（Decoding Heads）**实现并行草稿生成。

每个解码头预测未来第 i 个位置的 Token，避免了加载额外模型：

```text
目标模型结构:
[Transformer Layers] → Head₀ (预测 t₁)
                     → Head₁ (预测 t₂)
                     → Head₂ (预测 t₃)
                     → Head₃ (预测 t₄)
```

Medusa 的优势：
- 无需额外加载草稿模型，节省显存
- 解码头与主干网络共享计算，效率更高
- 支持动态调整草稿长度

### 自我推测解码（Self-Speculative Decoding）

**自我推测解码**利用目标模型自身的早期层作为草稿模型：

```text
目标模型（32 层）:
层 1-8:   草稿推理（快速生成候选 Token）
层 9-32:  完整推理（验证候选 Token）
```

核心思想：早期层已经捕获了足够的语义信息来生成合理的草稿，而完整层负责精确验证。

自我推测解码的特点：
- 零额外模型，显存开销不变
- 草稿质量通常低于独立草稿模型
- 适合显存受限的部署场景

### EAGLE 算法

**EAGLE（Extrapolative Algorithm for Greater Language-model Efficiency）** 是一种高效的推测解码算法，通过特征外推（Feature Extrapolation）预测未来 Token：

```python
# EAGLE 核心思想
# 1. 使用目标模型的隐藏状态作为特征
# 2. 训练一个轻量级预测头来外推未来位置的隐藏状态
# 3. 从外推的隐藏状态生成候选 Token

hidden_states = target_model.get_hidden_states(context)
# 外推未来 K 步的隐藏状态
extrapolated_states = extrapolator(hidden_states, k=5)
# 从外推状态生成草稿 Token
draft_tokens = prediction_head(extrapolated_states)
```

EAGLE 相比基础推测解码的优势：
- 草稿质量更高，接受率提升 10-15%
- 预测头参数量极小（通常 < 10M）
- 训练成本低，只需少量数据

## 主流方案对比

不同推测解码方案在加速效果、实现复杂度和资源开销上各有侧重：

| 方案 | 草稿来源 | 额外显存 | 接受率 | 加速比 | 实现难度 |
|------|----------|----------|--------|--------|----------|
| 基础推测解码 | 独立小模型 | 中（需加载草稿模型） | 60-80% | 2-2.5x | 低 |
| Medusa | 多解码头 | 低（仅头部参数） | 50-70% | 1.8-2.2x | 中 |
| 自我推测 | 目标模型早期层 | 无 | 40-60% | 1.5-1.8x | 中 |
| EAGLE | 特征外推 | 极低 | 70-85% | 2.5-3x | 高 |
| Lookahead | n-gram 缓存 | 极低 | 30-50% | 1.3-1.5x | 低 |

:::tip 选择建议
- **追求最高加速**：选择 EAGLE，接受率最高
- **显存紧张**：选择自我推测解码，无需额外模型
- **快速部署**：选择基础推测解码，实现最简单
- **不想训练**：选择 Lookahead（基于 n-gram 缓存，无需训练）
:::

## 工程实践

### vLLM 中的推测解码

[vLLM](https://github.com/vllm-project/vllm) 从 v0.4.0 开始原生支持推测解码：

```python
from vllm import LLM, SamplingParams

llm = LLM(
    model="meta-llama/Llama-2-70b-hf",
    speculative_model="JackFram/llama-68m",  # 草稿模型
    num_speculative_tokens=5,                 # 每次草稿 Token 数
)

sampling_params = SamplingParams(temperature=0.7, max_tokens=100)
outputs = llm.generate(["Hello, my name is"], sampling_params)
```

vLLM 推测解码的关键配置：
- **speculative_model**：草稿模型路径，应与目标模型词表一致
- **num_speculative_tokens**：每次草稿生成的 Token 数，通常 3-8
- **speculative_disable_by_threshold**：当 prompt 长度超过阈值时禁用推测解码

### TGI 中的推测解码

[Hugging Face TGI](https://github.com/huggingface/text-generation-inference) 也支持推测解码：

```bash
# 启动 TGI 服务（启用推测解码）
text-generation-launcher \
  --model-id meta-llama/Llama-2-70b-hf \
  --speculative-draft JackFram/llama-68m \
  --num-speculative-tokens 5
```

### 草稿模型选择策略

选择合适的草稿模型对加速效果至关重要：

| 目标模型 | 推荐草稿模型 | 词表匹配 | 接受率预期 |
|----------|-------------|----------|------------|
| Llama-2-70B | Llama-2-7B | 完全匹配 | 70-80% |
| Llama-2-70B | TinyLlama-1.1B | 完全匹配 | 60-70% |
| Llama-3-70B | Llama-3-8B | 完全匹配 | 75-85% |
| Mistral-7B | TinyLlama-1.1B | 部分匹配 | 50-60% |

:::warning 注意
草稿模型与目标模型的词表必须兼容。如果词表不同，需要额外的 Token 映射层，会引入额外开销并降低接受率。
:::

### 动态草稿长度

固定草稿长度并非最优策略。动态调整草稿长度可根据上下文复杂度自适应：

```python
def dynamic_speculative_length(context, base_k=5, max_k=10):
    """根据上下文复杂度动态调整草稿长度"""
    # 简单启发式：上下文越长，草稿越短（避免累积误差）
    context_len = len(context)
    if context_len > 4096:
        return max(2, base_k - 2)
    elif context_len > 2048:
        return max(3, base_k - 1)
    return base_k
```

### 批处理场景下的推测解码

在批处理（Batch Processing）场景中，不同请求的接受率差异较大：

```python
# 批处理推测解码策略
def batch_speculative_decode(batch_requests):
    # 按接受率历史对请求分组
    high_accept = [r for r in batch_requests if r.history_accept_rate > 0.7]
    low_accept = [r for r in batch_requests if r.history_accept_rate <= 0.7]
    
    # 高接受率请求使用更长的草稿
    for req in high_accept:
        req.speculative_tokens = 8
    for req in low_accept:
        req.speculative_tokens = 3
    
    return execute_batch(batch_requests)
```

## 与其他概念的关系

推测解码是 [延迟优化](/glossary/latency-optimization) 的重要手段之一，与以下技术互补：

- **与 [量化](/glossary/quantization) 结合**：量化降低单次前向传播的时间，推测解码减少前向传播次数，两者叠加可实现 4-6 倍加速
- **与 [蒸馏](/glossary/distillation) 结合**：用蒸馏得到的小模型作为草稿模型，提高草稿质量
- **与 [批处理](/glossary/batch-processing) 结合**：在批处理场景中，推测解码的加速效果更加显著
- **与 [缓存](/glossary/caching) 结合**：KV Cache 复用减少重复计算，推测解码进一步加速新 Token 生成
- **与 [流式输出](/glossary/streaming) 结合**：推测解码降低 TPOT，流式输出改善感知延迟，两者协同提升用户体验

对于 [大语言模型](/glossary/llm) 的部署，推测解码是当前最有效的无损加速方案之一。

## 延伸阅读

- [延迟优化](/glossary/latency-optimization) — 推理延迟优化策略
- [量化](/glossary/quantization) — 模型量化技术
- [蒸馏](/glossary/distillation) — 知识蒸馏技术
- [批处理](/glossary/batch-processing) — 批处理推理
- [流式输出](/glossary/streaming) — 流式输出技术
- [Speculative Decoding 原始论文](https://arxiv.org/abs/2211.17192) — Leviathan et al., 2023
- [Medusa 论文](https://arxiv.org/abs/2401.10774) — 多解码头推测解码
- [EAGLE 论文](https://arxiv.org/abs/2406.16858) — 特征外推推测解码
- [vLLM 推测解码文档](https://docs.vllm.ai/en/latest/models/spec_decode.html) — vLLM 官方推测解码指南
- [Hugging Face 推测解码博客](https://huggingface.co/blog/assisted-generation) — Hugging Face 辅助生成技术博客
