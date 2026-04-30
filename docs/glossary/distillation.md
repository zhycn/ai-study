---
title: 蒸馏
description: Knowledge Distillation，将大模型知识迁移到小模型
---

# 蒸馏

让"大老师教小徒弟"的模型压缩方法。先用一个又大又强的模型（老师）去训练一个小模型（徒弟），让小模型学会大模型的本领。最后小模型虽然体积小很多，但能力接近大模型，部署起来更省钱更快。

## 概述

**知识蒸馏（Knowledge Distillation, KD）**是一种模型压缩技术，通过让小型**学生模型（Student Model）**学习大型**教师模型（Teacher Model）**的输出行为，使学生在保持较小体积的同时获得接近教师的性能。

该概念由 Geoffrey Hinton 等人在 2015 年提出，核心思想是：教师模型的输出不仅包含正确的类别信息，还包含了类别之间的**相对关系**（即"暗知识"Dark Knowledge）。学生模型通过学习这些额外信息，可以获得比直接从原始标签训练更好的泛化能力。

```text
教师模型（大、准确、慢）
    ↓ 输出软标签（Soft Labels）
学生模型（小、快速、接近教师精度）
```

:::tip 提示
蒸馏不同于 [量化](/glossary/quantization) 和 [剪枝](/glossary/pruning)，它生成的是一个全新的、更小的模型，而不是对原有模型进行压缩。蒸馏后的模型可以独立部署，不依赖教师模型。
:::

## 为什么重要

**模型压缩**：蒸馏可以将数百亿参数的模型压缩到数亿参数，体积减少 10-100 倍，同时保持 90% 以上的原始性能。

**推理加速**：小模型的推理速度显著提升。一个 7B 参数的蒸馏模型相比原始 70B 模型，推理速度可提升 5-10 倍。

**成本降低**：更小的模型意味着更低的 GPU 需求和更少的内存占用，直接降低部署和推理成本。

**隐私保护**：蒸馏后的小模型可以在本地设备运行，无需将数据发送到云端，满足数据隐私要求。

**知识迁移**：蒸馏不仅压缩模型，还可以将多个教师模型的知识融合到一个学生模型中，实现知识集成。

## 核心原理

知识蒸馏的本质是**信息迁移与分布匹配**。教师模型输出的概率分布比硬标签（Hard Label）包含更多信息量。

### 暗知识（Dark Knowledge）

Hinton 提出的核心洞察：教师模型的输出不仅告诉学生"正确答案是什么"，还暗示了"哪些错误答案更相似"。

```text
输入：猫的图片
硬标签：[猫=1, 狗=0, 汽车=0]
教师软输出：[猫=0.8, 狗=0.15, 汽车=0.05]
```

软输出中的 `狗=0.15` 比 `汽车=0.05` 高，说明猫和狗在特征空间更相似。这种**类别间的相对关系**就是暗知识，能帮助学生模型更好地泛化。

### 损失函数设计

蒸馏的核心是组合损失函数：

```text
L_total = α × L_hard + (1 - α) × T² × L_soft
```

其中：
- **L_hard**：学生输出与真实标签的交叉熵损失
- **L_soft**：学生输出与教师输出的 KL 散度（Kullback-Leibler Divergence）
- **T²**：温度平方项，用于缩放梯度幅度（因为 softmax 对温度求导后梯度会缩小 T 倍）
- **α**：硬损失权重，通常 0.3-0.7

### 容量瓶颈（Capacity Bottleneck）

学生模型必须具有足够的容量来吸收教师知识。如果学生模型过小：
- 无法拟合教师输出的复杂分布
- 蒸馏效果甚至不如直接用硬标签训练
- 经验法则：学生参数量 ≥ 教师的 1/10

### 蒸馏的三种层次

| 层次 | 迁移内容 | 信息量 | 实现难度 |
|------|----------|--------|----------|
| 响应层（Response） | 输出层 logits | 中 | 低 |
| 特征层（Feature） | 中间层特征图 | 高 | 中 |
| 关系层（Relation） | 样本间关系结构 | 最高 | 高 |

层次越深，迁移的信息越丰富，但对学生模型架构的要求也越高。

## 核心技术/方法

### 响应蒸馏（Response-based）

**响应蒸馏**是最经典的蒸馏方式，学生模型直接学习教师模型的输出层响应（logits）。

核心损失函数由两部分组成：

```python
# 蒸馏损失 = 硬标签损失 + 软标签损失
loss = alpha * hard_loss(student_logits, labels) + \
       (1 - alpha) * soft_loss(student_logits, teacher_logits, temperature)
```

其中：

- **硬损失（Hard Loss）**：学生模型输出与真实标签的交叉熵
- **软损失（Soft Loss）**：学生模型输出与教师模型输出的 KL 散度
- **α（Alpha）**：硬损失和软损失的权重系数
- **温度（Temperature, T）**：控制输出分布平滑度的超参数

### 特征蒸馏（Feature-based）

**特征蒸馏**让学生模型学习教师模型中间层的特征表示，而不仅仅是最终输出。

常见的特征蒸馏方法：

- **FitNets**：学生中间层回归教师中间层（需要添加回归层适配维度）
- **注意力迁移（Attention Transfer）**：学生学习教师的注意力图
- **特征模仿（Feature Imitation）**：最小化学生与教师特征图的差异

```python
# 特征蒸馏示例
import torch.nn.functional as F

def feature_distillation_loss(student_features, teacher_features):
    # 使用 MSE 或余弦相似度
    return F.mse_loss(student_features, teacher_features)

# 总损失
total_loss = task_loss + \
             lambda_feat * feature_distillation_loss(s_feat, t_feat) + \
             lambda_resp * response_distillation_loss(s_logits, t_logits)
```

特征蒸馏特别适合学生模型与教师模型架构差异较大的场景。

### 关系蒸馏（Relation-based）

**关系蒸馏**让学生模型学习教师模型中样本之间的关系结构，如样本间的距离、角度或相似性。

典型方法：

- **相似性保持（Similarity Preservation）**：保持样本对的相似性关系
- **对比蒸馏（Contrastive Distillation）**：通过对比学习传递知识
- **图蒸馏（Graph-based KD）**：学习样本图结构

关系蒸馏在少样本学习和领域适应场景中表现优异。

### 温度参数（Temperature）

**温度参数 T** 是蒸馏中的关键超参数，用于软化输出分布：

```text
softened_prob_i = exp(logit_i / T) / Σ_j exp(logit_j / T)
```

温度参数的作用：

- **T = 1**：原始 softmax 输出
- **T > 1**：输出分布更平滑，类别间差异缩小，"暗知识"更明显
- **T 过大**：分布过于均匀，失去区分度

:::info 信息
Hinton 原始论文中推荐的温度值为 T=20，但实际应用中 T=2-8 更为常见。温度值需要根据具体任务和模型大小进行调整。
:::

## 主流方案对比

不同蒸馏方法在效果、成本和适用场景上各有特点：

| 方案 | 教师模型 | 学生模型 | 训练成本 | 精度保持 | 适用场景 |
|------|----------|----------|----------|----------|----------|
| 响应蒸馏（KD） | 任意 | 任意 | 低 | 85-95% | 通用场景 |
| 特征蒸馏（FitNets） | 任意 | 需适配层 | 中 | 90-97% | 架构差异大 |
| 自蒸馏 | 自身早期版本 | 自身 | 低 | 90-98% | 无外部教师 |
| 多教师蒸馏 | 多个模型 | 任意 | 高 | 92-98% | 知识融合 |
| 在线蒸馏 | 同批次学生 | 同批次学生 | 中 | 88-95% | 端到端训练 |
| 数据免费蒸馏 | 无需原始数据 | 任意 | 中 | 80-90% | 隐私保护场景 |

:::tip 选择建议
- **有充足数据**：选择响应蒸馏或特征蒸馏，效果最好
- **无外部大模型**：选择自蒸馏，成本低且有效
- **多模型集成**：选择多教师蒸馏，融合不同模型优势
- **数据隐私敏感**：选择数据免费蒸馏（Data-Free KD），用生成数据替代
:::

## 主流框架与实现

### Hugging Face DistilBERT

DistilBERT 是知识蒸馏在 NLP 领域的经典应用，将 BERT 的参数量减少 40%，同时保持 97% 的性能。

```python
# DistilBERT 蒸馏配置要点
# 1. 学生模型：移除 BERT 的 pooler 和第二个 Transformer 层
# 2. 损失函数：三重损失
#    - 语言模型损失（MLM）
#    - 蒸馏损失（Cosine Embedding Loss）
#    - 硬标签损失（Cross-Entropy）
# 3. 温度参数：T=8（用于蒸馏损失）
# 4. 权重：α=0.5（硬损失），β=0.5（蒸馏损失）
```

DistilBERT 的蒸馏策略：

- **数据**：使用与 BERT 预训练相同的语料
- **教师**：预训练好的 BERT-base
- **学生**：6 层 Transformer（教师为 12 层）
- **训练**：90k 步，batch size=64

### TinyLlama 蒸馏流程

对于 LLM 的蒸馏，典型流程如下：

```python
# LLM 蒸馏伪代码
from transformers import AutoModelForCausalLM, AutoTokenizer

# 加载教师和学生模型
teacher = AutoModelForCausalLM.from_pretrained("large-model")
student = AutoModelForCausalLM.from_pretrained("small-model")
tokenizer = AutoTokenizer.from_pretrained("large-model")

# 蒸馏训练
for batch in dataloader:
    # 教师推理（可预先计算并缓存）
    with torch.no_grad():
        teacher_outputs = teacher(batch)
        teacher_logits = teacher_outputs.logits / temperature

    # 学生推理
    student_outputs = student(batch)
    student_logits = student_outputs.logits / temperature

    # 计算蒸馏损失
    loss = kl_divergence(
        F.log_softmax(student_logits, dim=-1),
        F.softmax(teacher_logits, dim=-1)
    )

    loss.backward()
    optimizer.step()
```

:::warning 注意
LLM 蒸馏需要大量计算资源。建议：

1. 预先计算并缓存教师模型的输出，避免每次训练都运行教师模型
2. 使用梯度累积（Gradient Accumulation）模拟大 batch size
3. 考虑使用 DeepSpeed 或 FSDP 进行分布式训练
:::

### 自蒸馏（Self-Distillation）

**自蒸馏**是一种特殊的蒸馏方式，教师模型和学生模型是同一个模型的不同版本（如不同训练轮数或不同正则化强度）。

自蒸馏的优势：

- 不需要额外的大模型作为教师
- 可以迭代进行，逐步提升性能
- 实现简单，成本低

```python
# 自蒸馏示例：使用模型的早期 checkpoint 作为教师
teacher = load_checkpoint("epoch_10.pth")
student = load_checkpoint("current.pth")

# 学生继续训练，同时学习教师的输出
```

## 工程实践

### 蒸馏训练流程

推荐的蒸馏工作流：

1. **准备教师模型**：选择或训练一个高性能的教师模型
2. **设计学生模型**：根据部署需求设计学生架构（层数、隐藏维度等）
3. **生成教师输出**：在训练数据上运行教师模型，缓存输出（可选）
4. **配置损失函数**：确定硬损失、软损失的权重和温度参数
5. **蒸馏训练**：使用蒸馏损失训练学生模型
6. **评估与迭代**：在验证集上评估，调整超参数

### 学生模型设计

学生模型的设计直接影响蒸馏效果：

| 策略     | 说明                                 | 适用场景     |
| -------- | ------------------------------------ | ------------ |
| 减少层数 | 保持每层维度，减少 Transformer 层数  | 计算资源受限 |
| 减少维度 | 保持层数，减少隐藏层维度             | 内存受限     |
| 两者结合 | 同时减少层数和维度                   | 极致压缩     |
| 架构变换 | 使用不同架构（如 Transformer → RNN） | 特殊部署需求 |

经验法则：学生模型的参数量应为教师模型的 1/4 到 1/10，过小会导致"容量瓶颈"（Capacity Bottleneck），无法有效学习教师知识。

### 损失函数组合

蒸馏的损失函数通常由多个部分组成：

```python
# 通用蒸馏损失函数
def distillation_loss(student_outputs, teacher_outputs, labels,
                      alpha=0.5, temperature=4.0):
    # 硬标签损失
    hard_loss = F.cross_entropy(student_outputs.logits, labels)

    # 软标签损失（KL 散度）
    soft_student = F.log_softmax(student_outputs.logits / temperature, dim=-1)
    soft_teacher = F.softmax(teacher_outputs.logits / temperature, dim=-1)
    soft_loss = F.kl_div(soft_student, soft_teacher, reduction='batchmean') * (temperature ** 2)

    # 组合损失
    return alpha * hard_loss + (1 - alpha) * soft_loss
```

关键参数调优建议：

- **α（硬损失权重）**：0.3-0.7，任务越复杂，软损失权重应越高
- **T（温度）**：2-8，教师模型越大，可使用更高的温度
- **学习率**：通常比原始训练小 2-5 倍

## 与其他概念的关系

蒸馏与 [量化](/glossary/quantization) 和 [剪枝](/glossary/pruning) 可以组合使用，形成完整的模型压缩流水线：

```
原始大模型
    ↓ 蒸馏
小型模型（结构压缩）
    ↓ 剪枝
稀疏小型模型（参数精简）
    ↓ 量化
量化稀疏小型模型（精度压缩）
```

蒸馏得到的模型可以进一步进行量化和剪枝，实现多重压缩。对于 [大语言模型](/glossary/llm)，蒸馏是减少参数量最有效的方法之一。

蒸馏也是 [延迟优化](/glossary/latency-optimization) 和 [成本优化](/glossary/cost-optimization) 的重要技术手段。在 [模型评估](/glossary/model-evaluation) 环节，需要对比蒸馏前后模型在目标任务上的性能。

## 延伸阅读

- [量化](/glossary/quantization) — 模型量化技术
- [剪枝](/glossary/pruning) — 模型剪枝技术
- [延迟优化](/glossary/latency-optimization) — 推理延迟优化策略
- [成本优化](/glossary/cost-optimization) — AI 部署成本优化
- [大语言模型](/glossary/llm) — LLM 基础知识
- [DistilBERT 论文](https://arxiv.org/abs/1910.01108) — BERT 蒸馏的经典工作
- [Hinton 蒸馏论文](https://arxiv.org/abs/1503.02531) — 知识蒸馏原始论文
- [TinyLlama 项目](https://github.com/jzhang38/TinyLlama) — 小型 LLM 蒸馏实践
- [Hugging Face 蒸馏指南](https://huggingface.co/docs/transformers/en/training#distillation) — 官方蒸馏训练文档
