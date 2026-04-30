---
title: 剪枝
description: Pruning，移除模型中不重要的参数以减小体积
---

# 剪枝

给 AI 模型"修剪枝叶"的技术。神经网络里有很多参数其实没啥用，删掉它们几乎不影响性能，但能让模型变小变快。就像修剪果树，剪掉多余的枝条，树反而长得更好。

## 概述

**剪枝（Pruning）**是通过移除神经网络中不重要的参数、神经元或层来减少模型复杂度的技术。其核心假设是：大型神经网络中存在大量冗余参数，移除这些参数对模型性能影响甚微。

剪枝的概念可以追溯到 1989 年 Yann LeCun 提出的 Optimal Brain Damage 算法，但直到深度学习模型规模爆炸式增长后，剪枝才重新成为研究热点。对于现代 [大语言模型](/glossary/llm)，剪枝是减少参数量和计算量的重要手段之一。

```text
原始模型：████████████████████████████████ 100% 参数
剪枝后：  ████░░░░████░░░░██░░░░████░░░░ 60% 参数（移除 40%）
```

:::tip 提示
剪枝与 [量化](/glossary/quantization) 和 [蒸馏](/glossary/distillation) 不同：剪枝直接移除参数（减少参数数量），量化降低参数精度（改变表示方式），蒸馏生成新的小模型（知识迁移）。三者可以组合使用。
:::

## 为什么重要

**模型压缩**：剪枝可以移除 30%-90% 的参数，显著减少模型体积。对于 70B 参数的模型，50% 剪枝可减少 35B 参数。

**推理加速**：减少的参数意味着更少的计算量。结构化剪枝可以直接转化为推理速度的提升，因为硬件可以跳过被剪枝的部分。

**防止过拟合**：剪枝本质上是一种正则化（Regularization）技术，通过减少模型容量来降低过拟合风险。

**可解释性**：剪枝可以揭示模型中真正重要的部分，帮助理解模型的决策机制。

**绿色 AI**：减少计算需求意味着更低的能耗，符合可持续发展的目标。

## 核心技术/方法

### 非结构化剪枝（Unstructured Pruning）

**非结构化剪枝**将单个权重参数置为零，不考虑参数的物理位置。这是最简单的剪枝方式。

```python
# PyTorch 非结构化剪枝示例
import torch.nn.utils.prune as prune

model = load_model()
linear_layer = model.fc1

# 对权重进行 L1 非结构化剪枝，移除 30% 的参数
prune.l1_unstructured(linear_layer, name='weight', amount=0.3)

# 剪枝后，原始权重被替换为 'weight_orig' 和 'weight_mask'
# 前向传播时自动应用掩码
```

非结构化剪枝的优缺点：

- **优点**：精度高，可以精细地移除最不重要的参数
- **缺点**：产生稀疏矩阵，需要专门的稀疏计算库才能加速，通用硬件上可能反而变慢

### 结构化剪枝（Structured Pruning）

**结构化剪枝**移除整个结构单元，如神经元、通道、滤波器或整个层。剪枝后的模型保持密集结构，可以直接在标准硬件上加速。

常见的结构化剪枝粒度：

| 粒度         | 移除单元            | 加速效果 | 精度影响 |
| ------------ | ------------------- | -------- | -------- |
| 神经元级     | 整个神经元/通道     | 高       | 中       |
| 滤波器级     | 整个卷积核          | 高       | 中       |
| 头级（Head） | 整个注意力头        | 高       | 低       |
| 层级         | 整个 Transformer 层 | 极高     | 高       |

```python
# LLM 注意力头剪枝示例
def prune_attention_heads(model, layer_idx, heads_to_prune):
    """剪枝指定的注意力头"""
    attention = model.transformer.h[layer_idx].attn
    # 移除指定的注意力头
    attention.prune_heads(heads_to_prune)
    return model

# 剪枝第 5 层的第 0、3、7 号注意力头
model = prune_attention_heads(model, layer_idx=5, heads_to_prune={0, 3, 7})
```

对于 Transformer 模型，结构化剪枝通常按以下优先级进行：

1. **注意力头剪枝**：移除冗余的注意力头
2. **FFN 神经元剪枝**：移除前馈网络中不活跃的神经元
3. **层剪枝**：移除整个 Transformer 层

### 重要性评估标准

剪枝的核心问题是如何判断哪些参数是"不重要"的。常见的评估标准：

**幅度剪枝（Magnitude Pruning）**：
最直观的方法，假设绝对值小的参数不重要。

```python
# 基于幅度的重要性评分
importance = torch.abs(weight)
# 移除重要性最低的 30%
threshold = torch.quantile(importance, 0.3)
mask = importance > threshold
```

**梯度剪枝（Gradient-based Pruning）**：
考虑参数对损失的梯度，梯度小的参数对输出影响小。

**Hessian 剪枝（Hessian-based Pruning）**：
使用 Hessian 矩阵（二阶导数）评估参数的重要性，比幅度剪枝更精确但计算成本高。

**激活剪枝（Activation-based Pruning）**：
基于激活值的大小判断神经元的重要性，激活值低的神经元可能冗余。

:::info 信息
对于 LLM，研究表明幅度剪枝（Magnitude Pruning）已经是一个相当有效的基线方法。更复杂的重要性评估方法带来的收益往往有限。
:::

### 迭代剪枝流程

**一次性剪枝（One-shot Pruning）**直接移除目标比例的参数，简单但可能导致精度大幅下降。

**迭代剪枝（Iterative Pruning）**采用"剪枝-微调-剪枝"的循环策略，逐步增加剪枝比例：

```text
原始模型 → 剪枝 20% → 微调 → 剪枝 20% → 微调 → ... → 达到目标稀疏度
```

迭代剪枝的优势：

- 每次剪枝幅度小，模型有时间适应
- 通过微调恢复精度
- 最终可以达到更高的剪枝比例

推荐的迭代剪枝流程：

```python
# 迭代剪枝伪代码
target_sparsity = 0.6  # 目标稀疏度 60%
pruning_steps = 6      # 分 6 步
pruning_rate = target_sparsity / pruning_steps

model = load_pretrained_model()

for step in range(pruning_steps):
    # 1. 评估参数重要性
    importance = compute_importance(model)

    # 2. 剪枝当前比例的参数
    current_sparsity = (step + 1) * pruning_rate
    model = apply_pruning(model, importance, current_sparsity)

    # 3. 微调恢复精度
    model = fine_tune(model, train_data, epochs=2)

    # 4. 评估
    accuracy = evaluate(model, val_data)
    print(f"Step {step+1}: sparsity={current_sparsity:.2f}, accuracy={accuracy:.4f}")
```

## 主流框架与实现

### PyTorch 剪枝 API

PyTorch 提供了 `torch.nn.utils.prune` 模块：

```python
import torch.nn.utils.prune as prune

# 非结构化剪枝
prune.l1_unstructured(module, name='weight', amount=0.3)

# 结构化剪枝（按行/列）
prune.ln_structured(module, name='weight', amount=0.3, n=2, dim=0)

# 随机剪枝（基线对比）
prune.random_unstructured(module, name='weight', amount=0.3)

# 永久化剪枝（移除 mask，直接修改权重）
prune.remove(module, name='weight')
```

PyTorch 剪枝 API 的限制：主要针对 CNN 和全连接层，对 Transformer 的支持有限。

### NVIDIA 剪枝工具

NVIDIA 提供了自动混合精度和剪枝工具：

```python
# NVIDIA 自动剪枝示例
from apex import amp

# 配置自动剪枝
model, optimizer = amp.initialize(
    model, optimizer,
    opt_level='O1',  # 混合精度训练
)

# 使用 NVIDIA 的剪枝工具
from nvidia.modelopt import prune
pruned_model = prune(model, sparsity=0.5, method='magnitude')
```

NVIDIA 工具链的优势是与 TensorRT 深度集成，剪枝后的模型可以直接部署到 TensorRT 推理引擎。

### LLM 剪枝方案

针对大语言模型的专用剪枝方案：

**ShortGPT**：
通过注意力头的重要性评分，自动识别并移除冗余的 Transformer 层。

```python
# ShortGPT 剪枝流程
# 1. 计算每层的重要性分数
layer_importance = compute_layer_importance(model, calibration_data)

# 2. 排序并选择要保留的层
top_k_layers = torch.topk(layer_importance, k=target_layers)

# 3. 构建剪枝后的模型
pruned_model = create_pruned_model(model, top_k_layers.indices)

# 4. 微调恢复精度
pruned_model = fine_tune(pruned_model, train_data)
```

**LLM-Pruner**：
支持结构化剪枝，可以按注意力头、FFN 神经元等粒度进行剪枝，并提供微调脚本。

**Sheared LLaMA**：
结合剪枝和继续预训练，将 LLaMA-2 7B 剪枝到 1.3B，性能优于从头训练的 1.3B 模型。

## 工程实践

### 剪枝流程

推荐的剪枝工作流：

1. **基线评估**：在验证集上评估原始模型的性能
2. **选择剪枝策略**：根据部署需求选择结构化或非结构化剪枝
3. **确定剪枝比例**：从保守比例开始（如 20%），逐步增加
4. **执行剪枝**：应用剪枝算法
5. **微调恢复**：使用训练数据微调剪枝后的模型
6. **评估对比**：对比剪枝前后的性能和速度
7. **迭代优化**：如果精度损失过大，降低剪枝比例或增加微调轮数

### 稀疏张量加速

非结构化剪枝产生的稀疏模型需要专门的加速库：

| 库           | 支持平台   | 加速效果 |
| ------------ | ---------- | -------- |
| **SparseML** | CPU/GPU    | 2-3x     |
| **TensorRT** | NVIDIA GPU | 1.5-2x   |
| **oneDNN**   | Intel CPU  | 1.5-2x   |
| **cuSPARSE** | NVIDIA GPU | 2-4x     |

:::warning 注意
非结构化剪枝在通用硬件上的加速效果有限。如果目标是推理加速，优先选择结构化剪枝。非结构化剪枝更适合存储压缩场景。
:::

### 剪枝与微调结合

剪枝后的模型必须经过微调才能恢复精度。微调的关键要点：

**学习率**：使用比原始训练小的学习率（通常为 1/10 到 1/100）

**数据量**：微调数据量不需要与原始训练相同，通常 10%-50% 的数据即可

**训练轮数**：剪枝后的微调通常需要较少的轮数（2-10 轮）

**损失函数**：可以结合蒸馏损失，让剪枝后的模型学习原始模型的输出

```python
# 剪枝 + 蒸馏微调
def pruned_distillation_loss(student, teacher, batch, alpha=0.5, T=4.0):
    # 硬标签损失
    hard_loss = F.cross_entropy(student(batch).logits, batch.labels)

    # 蒸馏损失（从原始教师模型）
    with torch.no_grad():
        teacher_logits = teacher(batch).logits
    soft_loss = F.kl_div(
        F.log_softmax(student(batch).logits / T, dim=-1),
        F.softmax(teacher_logits / T, dim=-1)
    ) * (T ** 2)

    return alpha * hard_loss + (1 - alpha) * soft_loss
```

## 与其他概念的关系

剪枝与 [量化](/glossary/quantization) 和 [蒸馏](/glossary/distillation) 是模型压缩的三大支柱：

```text
原始大模型
    ↓ 蒸馏（可选）
小型模型
    ↓ 剪枝
稀疏小型模型
    ↓ 量化
量化稀疏小型模型（极致压缩）
```

组合策略建议：

- **蒸馏 + 剪枝**：先蒸馏得到小模型，再剪枝进一步优化
- **剪枝 + 量化**：先剪枝减少参数，再量化降低精度，效果叠加
- **三者结合**：蒸馏 → 剪枝 → 量化，实现最大压缩比

剪枝是 [延迟优化](/glossary/latency-optimization) 和 [成本优化](/glossary/cost-optimization) 的重要手段。结构化剪枝可以直接转化为推理速度的提升，而 [模型评估](/glossary/model-evaluation) 是验证剪枝效果的必要环节。

## 延伸阅读

- [量化](/glossary/quantization) — 模型量化技术
- [蒸馏](/glossary/distillation) — 知识蒸馏技术
- [延迟优化](/glossary/latency-optimization) — 推理延迟优化策略
- [成本优化](/glossary/cost-optimization) — AI 部署成本优化
- [大语言模型](/glossary/llm) — LLM 基础知识
- [Optimal Brain Damage 论文](https://proceedings.neurips.cc/paper/1989/file/6cda8910dcc49f4a84e5b49140f4e3a1-Paper.pdf) — 剪枝的开创性工作
- [The Lottery Ticket Hypothesis 论文](https://arxiv.org/abs/1803.03635) — 幸运彩票假说
- [LLM-Pruner GitHub](https://github.com/horseee/LLM-Pruner) — LLM 结构化剪枝工具
- [SparseML GitHub](https://github.com/neuralmagic/sparseml) — 稀疏模型训练和部署库
