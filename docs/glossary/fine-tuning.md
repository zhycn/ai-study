---
title: 微调
description: Fine-tuning，模型微调
---

# 微调

让"全科医生"变成"专科医生"的过程。大模型什么都懂一点，但不够专业。微调就是用某个领域的专业数据再训练它一下，让它在医疗、法律、编程等特定领域表现得更加精准靠谱。

## 概述

微调（Fine-tuning）是在**预训练模型（Pre-trained Model）**基础上，使用特定领域或任务的数据进行进一步训练，使模型适应特定需求的技术。

大语言模型通过海量数据的预训练获得了通用的语言理解和生成能力，但这种"通才"能力在面对特定领域任务时往往不够精准。微调就像是让一个"全科医生"进修成为"专科医生"——在已有知识基础上，针对特定领域进行深度学习。

微调是**迁移学习（Transfer Learning）**在 NLP 领域的典型应用，其核心理念是：与其从头训练一个模型，不如在已有模型的基础上进行适配。

## 为什么重要

微调在 AI 工程实践中具有不可替代的价值：

- **领域适配**：让通用模型掌握医疗、法律、金融等专业领域的术语和知识
- **风格定制**：调整模型的输出风格，使其符合品牌调性或特定场景需求
- **指令跟随**：通过指令微调（Instruction Tuning）提升模型理解和遵循复杂指令的能力
- **对齐人类偏好**：通过 RLHF（Reinforcement Learning from Human Feedback）等技术，使模型输出更符合人类价值观
- **性能提升**：在特定任务上，微调模型的效果通常远超仅靠提示词工程（Prompt Engineering）能达到的水平

::: tip 提示
微调不是万能药。在决定微调之前，先评估是否可以通过优化提示词或使用 RAG 来解决问题。微调适合以下场景：需要特定的输出格式/风格、提示词工程遇到瓶颈、需要模型内化领域知识。
:::

## 微调类型

### 按参数范围分类

**全参数微调（Full Fine-tuning）**

更新模型的所有参数。效果最好，但成本最高：

- 需要大量计算资源（多张 GPU）
- 训练时间长
- 容易过拟合（Overfitting）
- 适合有充足资源和数据的团队

**参数高效微调（PEFT，Parameter-Efficient Fine-Tuning）**

只更新模型的一小部分参数，大幅降低训练成本：

| 方法          | 原理                          | 参数量     | 适用场景         |
| ------------- | ----------------------------- | ---------- | ---------------- |
| LoRA          | 在权重矩阵旁路添加低秩矩阵    | 0.1%-1%    | 通用场景，最流行 |
| QLoRA         | 量化 + LoRA，4-bit 量化后微调 | 0.1%-1%    | 资源受限场景     |
| Prefix Tuning | 在输入前添加可训练的前缀向量  | 0.01%-0.1% | 生成任务         |
| Prompt Tuning | 只优化提示词的嵌入表示        | 0.001%     | 分类任务         |
| Adapter       | 在层间插入小型可训练模块      | 1%-3%      | 多任务学习       |

### 按训练目标分类

**监督微调（SFT，Supervised Fine-Tuning）**

使用输入-输出配对数据进行训练，让模型学习特定的映射关系。是最常见的微调方式。

**指令微调（Instruction Tuning）**

使用指令-响应对进行训练，提升模型理解和遵循指令的能力。ChatGPT 等对话模型的核心训练步骤。

**偏好对齐（Preference Alignment）**

- **RLHF**：通过人类反馈的强化学习，使模型输出更符合人类偏好
- **DPO**：直接偏好优化（Direct Preference Optimization），无需训练奖励模型
- **ORPO**：机会比率偏好优化（Odds Ratio Preference Optimization），更高效的对齐方法

## 典型流程

### 1. 选择基础模型

根据任务需求选择合适的基础模型：

- **模型大小**：7B、13B、70B 等，越大效果越好但成本越高
- **模型架构**：Llama、Mistral、Qwen 等
- **预训练数据**：了解模型的训练数据分布，选择与目标领域相关的模型

### 2. 准备数据集

数据质量直接决定微调效果：

```json
[
  {
    "messages": [
      { "role": "system", "content": "你是一个专业的客服助手" },
      { "role": "user", "content": "如何退货？" },
      { "role": "assistant", "content": "退货流程如下：1. 登录账号..." }
    ]
  }
]
```

数据准备要点：

- **数据量**：SFT 通常需要 1000-10000 条高质量样本
- **数据质量**：宁缺毋滥，低质量数据会导致模型性能下降
- **数据分布**：覆盖各种场景和边界情况
- **格式统一**：确保所有样本遵循相同的格式

### 3. 配置训练参数

关键超参数：

| 参数          | 说明          | 推荐值              |
| ------------- | ------------- | ------------------- |
| Learning Rate | 学习率        | 1e-5 ~ 5e-4         |
| Epochs        | 训练轮数      | 1-3（避免过拟合）   |
| Batch Size    | 批次大小      | 根据显存调整        |
| Max Length    | 最大序列长度  | 根据任务需求        |
| LoRA Rank     | LoRA 秩       | 8-64                |
| LoRA Alpha    | LoRA 缩放系数 | 通常为 Rank 的 2 倍 |

### 4. 执行训练

使用训练框架执行微调：

```bash
# 使用 LLaMA-Factory 进行 LoRA 微调
llamafactory-cli train \
  --model_name_or_path meta-llama/Llama-3-8B \
  --dataset my_data.json \
  --stage sft \
  --lora_rank 16 \
  --lora_alpha 32 \
  --learning_rate 2e-4 \
  --num_train_epochs 3 \
  --output_dir ./output
```

### 5. 评估效果

使用测试集评估微调效果：

- **自动评估**：BLEU、ROUGE、Perplexity 等指标
- **人工评估**：抽样检查输出质量
- **对比评估**：与基础模型和提示词方案对比

### 6. 部署上线

- **合并权重**：将 LoRA 权重合并到基础模型
- **量化压缩**：使用 GGUF、AWQ 等格式压缩模型
- **服务部署**：使用 vLLM、TGI 等推理框架部署

## 主流框架

| 框架              | 特点                                          | 适用场景                 |
| ----------------- | --------------------------------------------- | ------------------------ |
| **LLaMA-Factory** | 一站式微调平台，支持多种模型和方法            | 快速上手，适合大多数场景 |
| **Axolotl**       | 配置驱动，社区活跃                            | 灵活的训练配置           |
| **TRL**           | Hugging Face 官方库，与 Transformers 深度集成 | 需要深度定制             |
| **Unsloth**       | 优化训练速度，显存占用低                      | 资源受限场景             |
| **OpenRLHF**      | 分布式 RLHF 训练                              | 大规模偏好对齐           |

## 与其他概念的关系

- 微调基于 [大语言模型](/glossary/llm) 的预训练权重进行
- 是 [迁移学习](/glossary/transfer-learning) 在 NLP 领域的典型应用
- 与 [RAG](/glossary/rag) 互补：RAG 解决知识更新问题，微调解决风格和能力适配问题
- 当 [提示词工程](/glossary/prompt-engineering) 遇到瓶颈时，微调是下一步选择
- [蒸馏](/glossary/distillation) 可以将微调后的大模型压缩为小模型
- 微调后的模型可以作为 [Agent](/glossary/agent) 的推理引擎

## 延伸阅读

- [LoRA 论文](https://arxiv.org/abs/2106.09685) - Low-Rank Adaptation 的原始论文
- [QLoRA 论文](https://arxiv.org/abs/2305.14314) - 高效微调方法
- [LLaMA-Factory 文档](https://github.com/hiyouga/LLaMA-Factory)
- [Hugging Face TRL 文档](https://huggingface.co/docs/trl)
- [Unsloth 文档](https://github.com/unslothai/unsloth)
- [大语言模型](/glossary/llm)
- [RAG 检索增强生成](/glossary/rag)
- [提示词工程](/glossary/prompt-engineering)
- [迁移学习](/glossary/transfer-learning)
