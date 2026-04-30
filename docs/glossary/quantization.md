---
title: 量化
description: Quantization，降低模型精度以减少体积和加速推理
---

# 量化

给 AI 模型"瘦身"的技术。把模型里每个参数的高精度数字换成低精度数字，模型体积能缩小好几倍，运行也更快，而性能几乎不下降。就像把高清照片压缩成普通画质，肉眼几乎看不出区别，但文件小了很多。

## 概述

**量化（Quantization）**是将模型参数和激活值从高精度数据类型（如 32 位浮点数 FP32）转换为低精度数据类型（如 8 位整数 INT8、4 位整数 INT4）的技术。它是模型压缩（Model Compression）的核心手段之一，能够在尽可能保持模型精度的前提下，显著减少模型体积、降低内存占用并加速推理过程。

对于现代大语言模型（LLM）而言，量化几乎是部署的必经之路。一个 70B 参数的模型在 FP16 精度下需要约 140GB 显存，而通过 INT4 量化后可降至约 35GB，使得在消费级 GPU 上运行成为可能。

:::tip 提示
量化不同于 [蒸馏](/glossary/distillation) 和 [剪枝](/glossary/pruning)，它不改变模型结构或参数数量，而是改变每个参数的**表示精度**。三者可以组合使用以达到最佳压缩效果。
:::

## 为什么重要

量化在 AI 工程实践中扮演着不可替代的角色，主要体现在以下几个维度：

**体积缩减**：INT8 量化可将模型体积减少至原来的 1/4，INT4 量化可进一步减少至 1/8。这使得原本需要多张 GPU 才能加载的模型，现在可以在单张消费级显卡上运行。

**推理加速**：低精度计算在现代硬件上具有专用加速单元。NVIDIA GPU 的 Tensor Core 支持 INT8 和 FP16 混合精度计算，推理速度可提升 2-4 倍。

**内存带宽优化**：模型推理通常是内存带宽受限（Memory-Bound）而非计算受限（Compute-Bound）。量化减少了数据传输量，有效缓解了内存带宽瓶颈。

**边缘部署**：量化使模型能够在资源受限的边缘设备上运行，如手机（Core ML、NNAPI）、IoT 设备和嵌入式系统。

**成本优化**：更小的模型意味着更少的 GPU 实例、更低的云成本和更高的吞吐量，直接降低 [成本优化](/glossary/cost-optimization) 压力。

## 核心原理

量化的数学本质是**数值映射与误差最小化**。将连续的高精度浮点数空间离散化为低精度的有限集合。

### 线性量化公式

最基础的线性量化通过缩放因子和平移量实现精度转换：

```text
x_int = round(x_fp32 / scale) + zero_point
x_fp32 ≈ (x_int - zero_point) × scale
```

其中：
- **scale（缩放因子）**：决定量化粒度，计算公式为 `scale = (max_val - min_val) / (2^n - 1)`
- **zero_point（零点）**：确保浮点数的 0 精确映射到整数空间，避免对称量化时的精度损失
- **n**：量化位数（如 8、4）

### 量化误差来源

量化引入的误差主要来自三个方面：

1. **舍入误差（Rounding Error）**：连续值映射到离散网格时的固有损失
2. **截断误差（Clipping Error）**：超出量化范围的异常值被强制截断
3. **累积误差（Accumulation Error）**：多层网络中量化误差的逐层叠加

### 对称量化 vs 非对称量化

**对称量化（Symmetric Quantization）**：
- 零点固定为 0，量化范围关于原点对称
- 计算公式简化为 `x_int = round(x_fp32 / scale)`
- 适用于权重量化（权重通常近似正态分布）

**非对称量化（Asymmetric Quantization）**：
- 零点根据数据分布动态计算
- 能更好地处理非对称分布（如 ReLU 后的激活值）
- 计算公式包含 zero_point 偏移

### 逐层量化 vs 逐通道量化

| 策略 | 粒度 | 精度 | 开销 | 适用场景 |
|------|------|------|------|----------|
| 逐层量化（Per-Tensor） | 整个张量统一参数 | 较低 | 最小 | 激活值量化 |
| 逐通道量化（Per-Channel） | 每个输出通道独立参数 | 较高 | 中等 | 权重量化 |
| 逐组量化（Per-Group） | 将张量分块，每组独立参数 | 最高 | 较大 | INT4 极致压缩 |

逐通道量化能更好地处理不同通道间的数值分布差异，是 INT8 量化的推荐方案。

## 核心技术/方法

### 训练后量化（PTQ）

**训练后量化（Post-Training Quantization, PTQ）**是最常用的量化方式，无需重新训练模型，直接在训练好的权重上应用量化。

PTQ 的核心步骤：

1. **校准（Calibration）**：使用少量代表性数据（通常 128-512 条）统计激活值的分布
2. **确定量化参数**：计算缩放因子（Scale）和零点（Zero Point）
3. **应用量化**：将 FP32 权重和激活值映射到 INT8 范围

```python
import torch
import torch.quantization

# PyTorch PTQ 示例
model = load_fp32_model()
model.eval()

# 配置量化
model.qconfig = torch.quantization.get_default_qconfig('fbgemm')

# 校准：准备量化模块
torch.quantization.prepare(model, inplace=True)

# 使用校准数据运行推理
for data in calibration_dataset:
    model(data)

# 转换量化模型
torch.quantization.convert(model, inplace=True)
```

PTQ 的优势是简单快速，但缺点是精度损失较大，尤其对于对精度敏感的模型。

### 量化感知训练（QAT）

**量化感知训练（Quantization-Aware Training, QAT）**在训练过程中模拟量化噪声，使模型学会适应低精度表示。

QAT 的关键机制：

- **伪量化节点（Fake Quantization）**：在前向传播中插入模拟量化操作的节点，模拟舍入误差
- **直通估计器（Straight-Through Estimator, STE）**：在反向传播时绕过量化节点的不可导问题，直接传递梯度

```python
# PyTorch QAT 示例
model = load_fp32_model()
model.train()

# 配置 QAT
model.qconfig = torch.quantization.get_default_qat_qconfig('fbgemm')

# 准备 QAT 模型
torch.quantization.prepare_qat(model, inplace=True)

# 在量化感知状态下微调
optimizer = torch.optim.Adam(model.parameters(), lr=1e-5)
for epoch in range(num_epochs):
    for data, labels in train_loader:
        optimizer.zero_grad()
        outputs = model(data)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

# 转换为量化模型
torch.quantization.convert(model.eval(), inplace=True)
```

QAT 通常能获得比 PTQ 更好的精度，但需要额外的训练时间和计算资源。

:::warning 注意
QAT 需要精心调整学习率和训练轮数。学习率过大可能导致量化噪声无法被模型适应，过小则训练时间过长。通常建议使用比原始训练小 10-100 倍的学习率。
:::

### 动态量化 vs 静态量化

**动态量化（Dynamic Quantization）**在推理时动态计算激活值的量化参数。权重在转换时已量化，但激活值在每次推理时根据实际数据范围重新量化。

**静态量化（Static Quantization）**在转换阶段通过校准数据预先确定激活值的量化参数，推理时直接使用。

| 特性           | 动态量化               | 静态量化          |
| -------------- | ---------------------- | ----------------- |
| 激活值量化时机 | 推理时动态计算         | 校准时预先确定    |
| 精度           | 较高                   | 略低              |
| 速度           | 略慢（需计算量化参数） | 更快              |
| 适用场景       | NLP 序列模型           | CV 模型、部署优化 |

## 精度级别

### FP32 → FP16/BF16

**FP16（Half Precision）**使用 16 位表示浮点数，范围约为 ±65504。它是量化的入门级别，体积减半且现代 GPU 原生支持。

**BF16（Brain Floating Point）**同样是 16 位，但采用与 FP32 相同的 8 位指数，仅减少尾数位。BF16 的动态范围与 FP32 一致，更适合深度学习训练。

```text
FP32: 1 bit sign | 8 bits exponent | 23 bits mantissa
FP16: 1 bit sign | 5 bits exponent | 10 bits mantissa
BF16: 1 bit sign | 8 bits exponent |  7 bits mantissa
```

FP16/BF16 通常被视为"无损量化"，大多数模型转换后精度损失可忽略不计。

### INT8 量化

**INT8 量化**将 FP32 值线性映射到 [-128, 127] 的整数范围。映射公式：

```text
INT8_value = round(FP32_value / scale) + zero_point
FP32_value = (INT8_value - zero_point) * scale
```

其中 `scale` 是缩放因子，`zero_point` 是零点偏移（通常为 0 或接近 0 的整数）。

INT8 量化的关键挑战是**异常值（Outliers）**处理。LLM 中某些激活值可能远大于正常范围，直接量化会导致精度严重损失。解决方案包括：

- **平滑量化（SmoothQuant）**：将激活值中的异常部分迁移到权重中
- **分组量化（Group-wise Quantization）**：对不同的权重组使用不同的量化参数

### INT4/FP4 极致压缩

**INT4 量化**将参数压缩到 4 位（[-8, 7] 或 [0, 15]），体积仅为 FP16 的 1/4。这是当前 LLM 部署中最流行的极致压缩方案。

主流 INT4 算法：

- **GPTQ**：基于逐层贪心优化的量化方法，精度高但量化速度慢
- **AWQ（Activation-Aware Weight Quantization）**：通过激活值感知保护重要权重，推理速度优于 GPTQ
- **QLoRA**：结合 INT4 量化与 LoRA 微调，使在单张 GPU 上微调 65B 模型成为可能

:::info 信息
QLoRA 使用 4-bit NormalFloat（NF4）数据类型，这是一种信息论最优的 4 位量化格式，专门针对正态分布的权重设计。
:::

## 主流方案对比

不同量化算法在精度、速度和适用场景上各有侧重：

| 方案 | 类型 | 精度 | 量化速度 | 推理速度 | 适用场景 |
|------|------|------|----------|----------|----------|
| PTQ（训练后量化） | 无需训练 | 中 | 极快（分钟级） | 快 | 快速部署、精度要求不高 |
| QAT（量化感知训练） | 需要微调 | 高 | 慢（小时/天级） | 最快 | 精度敏感场景 |
| GPTQ | PTQ 变种 | 高 | 慢 | 快 | LLM INT4 量化 |
| AWQ | PTQ 变种 | 高 | 中 | 最快 | LLM INT4 部署 |
| SmoothQuant | PTQ 变种 | 高 | 中 | 快 | 处理激活异常值 |
| QLoRA | 微调结合 | 极高 | 中 | 中 | LLM 高效微调 |

:::tip 选择建议
- **快速验证**：选择 PTQ（INT8），几分钟即可完成
- **生产部署**：选择 QAT 或 AWQ，精度损失最小
- **LLM 部署**：选择 AWQ 或 GPTQ（INT4），兼顾精度和显存
- **LLM 微调**：选择 QLoRA，单卡即可微调大模型
:::

## 主流框架与实现

### PyTorch 量化

PyTorch 提供了一套完整的量化工具链：

```python
# 后端选择
torch.backends.quantized.engine = 'fbgemm'  # x86 CPU
torch.backends.quantized.engine = 'qnnpack' # ARM CPU

# 量化配置
qconfig = torch.quantization.QConfig(
    activation=torch.quantization.MinMaxObserver,
    weight=torch.quantization.PerChannelMinMaxObserver
)
```

PyTorch 2.x 引入了 `torch.export` 和 `torch._inductor` 量化流程，支持更灵活的量化策略。

### llama.cpp 量化

[llama.cpp](https://github.com/ggerganov/llama.cpp) 是最流行的 LLM 量化推理框架，支持多种量化格式：

| 格式   | 描述           | 大小（7B 模型） |
| ------ | -------------- | --------------- |
| Q4_0   | 4-bit 基础量化 | ~3.5 GB         |
| Q4_K_M | 4-bit 混合质量 | ~3.8 GB         |
| Q5_K_M | 5-bit 混合质量 | ~4.5 GB         |
| Q8_0   | 8-bit 量化     | ~6.7 GB         |
| IQ4_XS | 4-bit 极致压缩 | ~3.1 GB         |

K-quants（如 Q4_K_M）使用混合精度策略，对重要层使用更高精度，是当前推荐的量化格式。

### AWQ/GPTQ 算法

**GPTQ（GPT Quantization）**：

```python
# AutoGPTQ 使用示例
from auto_gptq import AutoGPTQForCausalLM, BaseQuantizeConfig

quantize_config = BaseQuantizeConfig(
    bits=4,
    group_size=128,
    desc_act=False
)

model = AutoGPTQForCausalLM.from_pretrained(
    "model_path",
    quantize_config=quantize_config
)

model.quantize(calibration_data)
model.save_quantized("quantized_model_path")
```

**AWQ（Activation-Aware Weight Quantization）**：
AWQ 的核心思想是识别并保护对模型输出影响最大的权重（基于激活值统计），对这些权重使用更高精度量化。

## 工程实践

### 量化流程

推荐的量化工作流：

1. **选择量化格式**：根据目标硬件和精度要求选择（FP16 → INT8 → INT4）
2. **准备校准数据**：选择 128-512 条代表性数据，覆盖模型的典型使用场景
3. **执行量化**：使用合适的框架和算法进行量化
4. **精度评估**：在验证集上对比量化前后模型的性能
5. **迭代优化**：如果精度损失过大，尝试 QAT 或调整量化参数

### 精度恢复技巧

当量化导致精度下降时，可尝试以下策略：

- **增加校准数据量**：更多数据有助于更准确地估计量化参数
- **使用混合精度**：对敏感层（如最后一层、嵌入层）保持 FP16 精度
- **分组量化**：使用更小的 group_size（如 64 或 32）提高量化精度
- **量化微调**：在量化后进行少量轮数的微调（如 QLoRA）

:::warning 注意
量化后的模型在特定任务上的精度可能下降 1-5%。对于对精度要求极高的场景（如医疗、金融），建议仔细评估后再决定是否量化。
:::

### 硬件适配

不同硬件对量化格式的支持不同：

| 硬件                 | 推荐格式         | 说明             |
| -------------------- | ---------------- | ---------------- |
| NVIDIA GPU (Ampere+) | INT8, FP16, BF16 | Tensor Core 加速 |
| NVIDIA GPU (Hopper)  | FP8              | H100 支持 FP8    |
| Apple Silicon        | INT8, FP16       | Core ML / Metal  |
| CPU (x86)            | INT8             | AVX-512 VNNI     |
| CPU (ARM)            | INT8             | NEON 指令集      |

## 与其他概念的关系

量化与 [蒸馏](/glossary/distillation) 和 [剪枝](/glossary/pruning) 并称为模型压缩的三大技术。它们可以组合使用：

- **蒸馏 + 量化**：先蒸馏得到小模型，再量化进一步压缩
- **剪枝 + 量化**：先剪枝移除冗余参数，再量化降低精度
- **三者结合**：蒸馏 → 剪枝 → 量化，实现极致压缩

量化是 [延迟优化](/glossary/latency-optimization) 和 [成本优化](/glossary/cost-optimization) 的重要手段。对于 [大语言模型](/glossary/llm) 的部署，量化几乎是必选项。

在 [GPU](/glossary/gpu) 资源受限的场景下，量化可以显著降低硬件门槛，使原本需要 A100 的模型在 RTX 4090 上即可运行。

## 延伸阅读

- [蒸馏](/glossary/distillation) — 知识蒸馏技术
- [剪枝](/glossary/pruning) — 模型剪枝技术
- [延迟优化](/glossary/latency-optimization) — 推理延迟优化策略
- [成本优化](/glossary/cost-optimization) — AI 部署成本优化
- [大语言模型](/glossary/llm) — LLM 基础知识
- [SmoothQuant 论文](https://arxiv.org/abs/2211.10438) — 激活值感知的量化方法
- [GPTQ 论文](https://arxiv.org/abs/2210.17323) — 精确的 LLM 量化算法
- [AWQ 论文](https://arxiv.org/abs/2306.00978) — 激活值感知的权重量化
- [llama.cpp GitHub](https://github.com/ggerganov/llama.cpp) — 流行的 LLM 量化推理框架
