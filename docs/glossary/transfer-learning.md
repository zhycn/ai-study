---
title: 迁移学习
description: Transfer Learning，将在一个任务上学到的知识迁移应用到另一个相关任务
---

# 迁移学习

"举一反三"的学习方法。先让 AI 在一个大任务上学会基本功，再把它调到一个小任务上微调一下就能用了。就像学会了骑自行车的人，学骑电动车特别快——已有的经验可以迁移到新任务上。

## 概述

**迁移学习**（Transfer Learning）是一种机器学习范式，将在**源域**（Source Domain）和**源任务**（Source Task）上学到的知识，迁移应用到**目标域**（Target Domain）和**目标任务**（Target Task）中，以提升目标任务的学习效率和性能。

迁移学习的核心假设是：源任务和目标任务之间存在某种共享结构或知识，使得在源任务上的学习成果可以加速目标任务的学习。

:::tip 直观理解
迁移学习类似于人类的学习过程：学会了骑自行车的人，更容易学会骑摩托车；掌握了英语的人，学习德语会比零基础更快。已有的知识为新知识的学习提供了"起点"和"先验"。
:::

## 为什么重要

- **数据效率**：目标任务通常数据稀缺，迁移学习可大幅减少所需标注数据
- **训练加速**：从预训练权重开始，收敛速度比从头训练快数倍至数十倍
- **性能提升**：在小数据集上，迁移学习几乎总是优于从头训练
- **知识复用**：避免重复学习通用特征（如边缘、纹理、语法），聚焦任务特有知识
- **大模型基石**：**预训练-微调**（Pretrain-Finetune）范式是当前所有大模型的标准工作流

## 核心原理

迁移学习之所以有效，基于以下理论基础：

### 共享表示假设

不同任务之间往往存在**共享的底层结构**：

- **视觉任务**：边缘、纹理、形状等底层特征在不同视觉任务中通用
- **语言任务**：语法、语义、上下文关系在不同 NLP 任务中共享
- **跨领域**：某些抽象概念（如情感极性、逻辑关系）在不同领域间可迁移

### 为什么迁移学习有效

1. **特征复用**：预训练模型已经学习了通用的特征提取器，目标任务只需学习任务特定的分类头
2. **更好的初始化**：预训练权重提供了比随机初始化更好的起点，优化过程更容易找到好的解
3. **正则化效果**：预训练模型的参数已经编码了先验知识，相当于隐式的正则化，减少过拟合风险
4. **数据效率**：在目标任务数据稀缺时，预训练知识提供了有效的归纳偏置（Inductive Bias）

### 迁移学习的理论度量

- **域差异**（Domain Divergence）：源域和目标域数据分布之间的距离，常用 A-distance 衡量
- **任务相似度**（Task Similarity）：源任务和目标任务的相关程度，影响迁移效果
- **负迁移**（Negative Transfer）：当源任务和目标任务差异过大时，迁移反而降低性能。选择与目标任务相关的预训练模型至关重要

### 迁移学习的数学表述

给定源域 $D_S$ 和源任务 $T_S$，目标域 $D_T$ 和目标任务 $T_T$，迁移学习的目标是：

$$\text{利用 } D_S \text{ 和 } T_S \text{ 的知识，提升 } D_T \text{ 上 } T_T \text{ 的学习效果}$$

其中 $D_S \neq D_T$ 或 $T_S \neq T_T$（或两者都不同）。

## 迁移学习的分类

### 按迁移方式分类

| 类型               | 英文                      | 描述                         | 示例                       |
| ------------------ | ------------------------- | ---------------------------- | -------------------------- |
| **基于实例的迁移** | Instance-Based Transfer   | 对源域数据加权后用于目标任务 | 跨领域情感分析             |
| **基于特征的迁移** | Feature-Based Transfer    | 学习域不变的共享特征表示     | 跨语言文本分类             |
| **基于参数的迁移** | Parameter-Based Transfer  | 共享模型参数或先验分布       | ImageNet 预训练 → 医学图像 |
| **基于关系的迁移** | Relational-Based Transfer | 迁移数据之间的关系或逻辑规则 | 社交网络 → 引文网络        |

### 按场景设置分类

| 场景           | 英文                  | 源域与目标域关系           | 典型方法                    |
| -------------- | --------------------- | -------------------------- | --------------------------- |
| **归纳迁移**   | Inductive Transfer    | 任务不同，域相同或不同     | 微调（Fine-tuning）         |
| **直推迁移**   | Transductive Transfer | 任务相同，域不同           | 域适应（Domain Adaptation） |
| **无监督迁移** | Unsupervised Transfer | 任务不同，域不同，均无标签 | 自监督预训练                |

## 核心技术方法

### 预训练-微调范式（Pretrain-Finetune）

当前最主流的迁移学习方式：

```
阶段 1: 预训练（Pretraining）
  大规模无标注/弱标注数据 → 学习通用表征

阶段 2: 微调（Fine-tuning）
  目标任务的小规模标注数据 → 适配特定任务
```

```python
from transformers import AutoModelForSequenceClassification, AutoTokenizer

# 步骤 1: 加载预训练模型
model_name = "bert-base-chinese"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name, num_labels=3)

# 步骤 2: 冻结底层参数（可选，适用于数据极少的场景）
for param in model.bert.parameters():
    param.requires_grad = False

# 步骤 3: 只训练分类头（线性探测，Linear Probing）
# 或者：不冻结，全量微调（Full Fine-tuning）

# 步骤 4: 在目标任务数据上训练
# ... 标准训练循环 ...
```

### 微调策略对比

| 策略                                         | 描述                           | 适用场景                  | 计算成本 | 性能         |
| -------------------------------------------- | ------------------------------ | ------------------------- | -------- | ------------ |
| **线性探测**（Linear Probing）               | 冻结预训练模型，只训练新分类头 | 数据极少（<100 样本）     | 极低     | 较低         |
| **部分微调**（Partial Fine-tuning）          | 冻结底层，微调高层             | 数据较少（100-1000 样本） | 低       | 中           |
| **全量微调**（Full Fine-tuning）             | 更新所有参数                   | 数据充足（>1000 样本）    | 高       | 最高         |
| [**LoRA**](https://arxiv.org/abs/2106.09685) | 低秩适配，只训练少量适配参数   | 大模型微调                | 低       | 接近全量微调 |
| **提示微调**（Prompt Tuning）                | 只训练 prompt 向量             | 大语言模型                | 极低     | 依赖模型能力 |

### LoRA（Low-Rank Adaptation）

大模型时代最流行的参数高效微调（Parameter-Efficient Fine-Tuning，PEFT）方法：

```python
from peft import LoraConfig, get_peft_model
from transformers import AutoModelForCausalLM

# 加载基础模型
model = AutoModelForCausalLM.from_pretrained("meta-llama/Llama-2-7b-hf")

# 配置 LoRA
lora_config = LoraConfig(
    r=16,              # 低秩矩阵的秩
    lora_alpha=32,     # 缩放因子
    target_modules=["q_proj", "v_proj"],  # 要适配的模块
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM",
)

# 应用 LoRA
model = get_peft_model(model, lora_config)
model.print_trainable_parameters()
# trainable params: 0.08% of total params
```

LoRA 的核心思想：不直接更新原始权重 W，而是学习低秩增量 ΔW = BA，其中 B ∈ R^{d×r}，A ∈ R^{r×k}，r ≪ min(d, k)。

```
W' = W + ΔW = W + BA
```

### 域适应（Domain Adaptation）

当源域和目标域的数据分布不同时，需要减少域间差异：

```python
# 域适应的核心思想：学习域不变特征
# 方法 1: 对抗域适应（Adversarial Domain Adaptation）
#   - 特征提取器 + 任务分类器 + 域判别器
#   - 域判别器试图区分源域/目标域特征
#   - 特征提取器试图"欺骗"域判别器
#   - 最终学到域不变的特征表示

# 方法 2: 自训练（Self-Training）
#   - 用源域数据训练模型
#   - 对目标域无标签数据生成伪标签
#   - 用伪标签数据迭代训练
```

### 知识蒸馏（Knowledge Distillation）

将大模型（教师模型）的知识迁移到小模型（学生模型）：

```python
import torch.nn.functional as F

def distillation_loss(student_logits, teacher_logits, labels, temperature=2.0, alpha=0.5):
    # 硬损失：学生输出与真实标签的交叉熵
    hard_loss = F.cross_entropy(student_logits, labels)

    # 软损失：学生输出与教师输出的 KL 散度
    soft_loss = F.kl_div(
        F.log_softmax(student_logits / temperature, dim=1),
        F.softmax(teacher_logits / temperature, dim=1),
        reduction="batchmean",
    ) * (temperature ** 2)

    return alpha * hard_loss + (1 - alpha) * soft_loss
```

:::info 提示
知识蒸馏与迁移学习有交叉但不完全相同：

- **迁移学习**：关注跨任务/跨域的知识迁移
- **知识蒸馏**：关注模型间的知识传递（通常任务相同）
- 两者可结合使用：先在源任务上预训练，再蒸馏到目标模型
  :::

## 主流框架与实现

### [Hugging Face Transformers](https://huggingface.co/docs/transformers/) + PEFT

大模型迁移学习的标准工具链：

```python
from transformers import TrainingArguments, Trainer
from peft import LoraConfig, get_peft_model, TaskType

# 1. 加载预训练模型和 tokenizer
model = AutoModelForCausalLM.from_pretrained("Qwen/Qwen2.5-7B")

# 2. 应用 LoRA
peft_config = LoraConfig(
    task_type=TaskType.CAUSAL_LM,
    r=16,
    lora_alpha=32,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
    lora_dropout=0.05,
)
model = get_peft_model(model, peft_config)

# 3. 训练
training_args = TrainingArguments(
    output_dir="./output",
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4,
    learning_rate=2e-4,
    num_train_epochs=3,
    fp16=True,
)

trainer = Trainer(model=model, args=training_args, train_dataset=dataset)
trainer.train()

# 4. 保存和合并
model.save_pretrained("./lora-adapter")
# 合并回基础模型
merged_model = model.merge_and_unload()
```

### 其他重要框架

- **[PyTorch](https://pytorch.org/)**：基础深度学习框架，迁移学习的底层实现
- **[timm](https://github.com/huggingface/pytorch-image-models)**：PyTorch 图像模型库，丰富的预训练视觉模型
- **OpenCLIP**：开源 CLIP 实现，视觉-语言迁移学习
- **Sentence Transformers**：文本 Embedding 迁移学习

## 工程实践

### 迁移学习工作流

```
1. 选择预训练模型
   ├── 任务匹配：选择与目标任务相似的预训练任务
   ├── 语言匹配：中文任务选择中文预训练模型
   └── 规模匹配：根据数据和算力选择模型大小

2. 数据准备
   ├── 目标任务数据收集和标注
   ├── 数据质量检查（迁移学习对数据质量更敏感）
   └── 数据增强（小数据场景尤为重要）

3. 微调策略选择
   ├── 数据量 < 100：线性探测或提示微调
   ├── 数据量 100-1000：部分微调或 LoRA
   └── 数据量 > 1000：全量微调

4. 训练与调优
   ├── 使用较小的学习率（通常为预训练学习率的 1/10 ~ 1/100）
   ├── 使用学习率预热（Warmup）
   └── 监控验证集性能，防止过拟合

5. 评估与部署
   ├── 在独立测试集上评估
   ├── 与从头训练的基线对比
   └── 导出模型，优化推理性能
```

### 学习率设置

迁移学习的学习率设置与从头训练不同：

```python
# 差异化学习率：底层用小学习率，顶层用大学习率
optimizer = torch.optim.AdamW([
    {"params": model.bert.encoder.parameters(), "lr": 1e-5},   # 底层：小学习率
    {"params": model.bert.pooler.parameters(), "lr": 5e-5},    # 中层：中学习率
    {"params": model.classifier.parameters(), "lr": 1e-4},     # 顶层：大学习率
])
```

:::warning 注意

- **灾难性遗忘**（Catastrophic Forgetting）：微调可能导致模型忘记预训练阶段学到的通用知识。使用较小的学习率和 LoRA 可缓解
- **过拟合风险**：小数据集上全量微调容易过拟合，建议使用正则化、早停（Early Stopping）或参数高效微调
- **负迁移**（Negative Transfer）：当源任务和目标任务差异过大时，迁移可能反而降低性能。选择与目标任务相关的预训练模型
  :::

### 预训练模型选择指南

| 任务类型     | 推荐预训练模型                     | 理由                 |
| ------------ | ---------------------------------- | -------------------- |
| 中文文本分类 | BERT-base-chinese、RoBERTa-wwm-ext | 中文理解能力强       |
| 英文 NLP     | BERT、RoBERTa、DeBERTa             | 英文生态最成熟       |
| 图像分类     | ResNet、EfficientNet、ViT          | 预训练模型丰富       |
| 目标检测     | DETR、DINO、YOLO 预训练权重        | 专门针对检测任务优化 |
| 多模态       | CLIP、BLIP、Qwen-VL                | 视觉-语言联合理解    |
| 代码生成     | CodeBERT、StarCoder、CodeQwen      | 代码理解能力强       |

## 与其他概念的关系

- [微调](/glossary/fine-tuning) 是迁移学习最核心的技术手段
- [蒸馏](/glossary/distillation) 是模型间知识迁移的重要方法
- [大语言模型](/glossary/llm) 的预训练-微调范式是迁移学习的典型应用
- [深度学习](/glossary/deep-learning) 使迁移学习在视觉和语言领域取得突破
- [Embedding](/glossary/embedding) 是迁移学习中知识表示的载体
- LoRA 等参数高效微调方法是迁移学习在大模型时代的新发展

## 延伸阅读

- [微调](/glossary/fine-tuning) — 了解迁移学习的核心操作
- [蒸馏](/glossary/distillation) — 了解模型间的知识迁移
- [大语言模型](/glossary/llm) — 了解预训练-微调范式的最新应用
- [深度学习](/glossary/deep-learning) — 了解迁移学习的方法论基础
- [Embedding](/glossary/embedding) — 了解知识表示的向量形式
- [A Survey on Transfer Learning](https://arxiv.org/abs/1911.02685) — 迁移学习综述论文
- [PEFT 文档](https://huggingface.co/docs/peft) — 参数高效微调官方文档
- [LoRA 论文](https://arxiv.org/abs/2106.09685) — LoRA 原始论文
