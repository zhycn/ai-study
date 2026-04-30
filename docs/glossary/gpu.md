---
title: GPU
description: Graphics Processing Unit，图形处理器，AI 训练与推理的核心硬件
---

# GPU

本来是用来打游戏渲染画面的显卡，后来发现特别适合跑 AI 计算。因为它有成千上万个小核心可以同时干活，而 AI 训练正好需要大量并行计算。现在 AI 这么火，GPU 成了最抢手的硬件，价格一路飙升。

## 概述

**GPU**（Graphics Processing Unit，图形处理器）最初专为图形渲染和并行计算设计，凭借其数千个计算核心的大规模并行架构，已成为 AI 模型训练和推理的核心硬件。

与 CPU（Central Processing Unit）不同，GPU 拥有更多的算术逻辑单元（ALU）和更简单的控制逻辑，特别适合处理**数据并行**（Data Parallelism）和**计算密集型**（Compute-Intensive）任务。

:::info GPU 为什么适合 AI？
神经网络的核心运算是**矩阵乘法**（Matrix Multiplication），这是一种高度并行的计算。GPU 的数千个核心可以同时执行大量相同的运算，完美匹配深度学习的需求。
:::

## 为什么需要 GPU

- **并行计算**：数千个 CUDA 核心同时计算，吞吐量远超 CPU
- **深度学习基石**：现代神经网络训练的必要硬件，没有 GPU 就没有深度学习革命
- **推理加速**：生产环境中加速模型推理，降低响应延迟
- **生态成熟**：CUDA 生态提供了完善的工具链和库支持
- **持续演进**：从图形渲染到 AI 计算，GPU 架构不断迭代升级

## 核心原理

### GPU 架构演进

```
Fermi (2010) → Kepler (2012) → Maxwell (2014) → Pascal (2016)
    → Volta (2017) → Turing (2018) → Ampere (2020)
    → Hopper (2022) → Blackwell (2024)
```

关键架构特性：

| 架构          | 代表产品 | 关键技术                  | AI 特性              |
| ------------- | -------- | ------------------------- | -------------------- |
| **Volta**     | V100     | Tensor Core 首次引入      | 混合精度训练         |
| **Ampere**    | A100     | 第三代 Tensor Core        | BF16、TF32 支持      |
| **Hopper**    | H100     | Transformer Engine        | FP8 精度、NVLink 4.0 |
| **Blackwell** | B200     | 第二代 Transformer Engine | FP4 精度、分布式推理 |

### CUDA 编程模型

**CUDA**（Compute Unified Device Architecture）是 NVIDIA 的并行计算平台和编程模型：

```python
import torch

# 检查 GPU 可用性
print(torch.cuda.is_available())  # True
print(torch.cuda.device_count())  # GPU 数量
print(torch.cuda.get_device_name(0))  # GPU 型号

# 将数据和模型移动到 GPU
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = MyModel().to(device)
data = data.to(device)

# 多 GPU 数据并行
if torch.cuda.device_count() > 1:
    model = torch.nn.DataParallel(model)
```

核心概念：

- **Thread**（线程）：最基本的执行单元
- **Block**（线程块）：一组线程，共享内存
- **Grid**（线程网格）：一组线程块
- **Warp**（线程束）：32 个线程的调度单元

### 内存层次结构

```
┌──────────────────────────────────────┐
│          Global Memory (HBM)         │  ← 大容量，高带宽
│          40GB - 192GB                │
├──────────────────────────────────────┤
│          L2 Cache                    │  ← 跨 SM 共享
├──────────────────────────────────────┤
│     Shared Memory / L1 Cache         │  ← Block 内共享
│     (per SM)                         │
├──────────────────────────────────────┤
│     Registers                        │  ← Thread 私有
└──────────────────────────────────────┘
```

- **HBM**（High Bandwidth Memory）：高带宽内存，GPU 的主存
- **共享内存**（Shared Memory）：线程块内共享，速度极快
- **寄存器**（Register）：每个线程私有，最快但容量有限

## 主流方案对比

### 数据中心 GPU

| 产品            | 架构   | 显存       | FP16 算力   | 适用场景        |
| --------------- | ------ | ---------- | ----------- | --------------- |
| **NVIDIA H100** | Hopper | 80GB HBM3  | 1979 TFLOPS | 大模型训练      |
| **NVIDIA A100** | Ampere | 80GB HBM2e | 312 TFLOPS  | 通用 AI 训练    |
| **NVIDIA L40S** | Ada    | 48GB GDDR6 | 366 TFLOPS  | 推理 + 轻量训练 |
| **AMD MI300X**  | CDNA 3 | 192GB HBM3 | 1300 TFLOPS | 大模型推理      |

### 消费级 GPU

| 产品         | 架构   | 显存 | 适用场景       |
| ------------ | ------ | ---- | -------------- |
| **RTX 4090** | Ada    | 24GB | 本地推理、微调 |
| **RTX 4080** | Ada    | 16GB | 轻量推理       |
| **RTX 3090** | Ampere | 24GB | 性价比推理     |

### 云 GPU 服务

- **AWS**：p5（H100）、p4d（A100）、g5（A10G）实例
- **Google Cloud**：A2（A100）、G2（L4）实例
- **Azure**：ND H100 v5、NC A100 v4 实例
- **国内云厂商**：阿里云、腾讯云、火山引擎均提供 GPU 实例

## 选型建议

### 按场景选型

| 场景 | 推荐方案 | 理由 |
| ---- | -------- | ---- |
| 大模型训练 | H100/A100 | 算力最强，多卡 NVLink 互联成熟 |
| 本地推理 | RTX 4090（24GB） | 消费级最强，可运行 13B 量化模型 |
| 轻量推理 | RTX 4080/L4 | 成本低，功耗小 |
| 成本敏感 | A10G/RTX 3090 | 性价比高，二手市场充足 |
| 云端训练 | AWS p5/GCP A2 | 弹性伸缩，按需付费 |

### GPU vs TPU 对比

| 维度 | GPU | TPU |
| ---- | --- | --- |
| 架构 | 通用并行处理器 | 专用 ASIC |
| 灵活性 | 高，支持各种算子 | 较低，适合规则计算 |
| 生态 | CUDA 生态，框架支持广泛 | TensorFlow/JAX 为主 |
| 可用性 | AWS/GCP/Azure/本地 | 仅 Google Cloud |
| 大模型训练 | NVLink 多卡方案成熟 | TPU Pod 集群优势明显 |
| 推理部署 | 选择多，边缘部署方便 | v5e 性价比高 |

:::tip 选型原则
大多数场景首选 GPU，生态成熟、灵活性强。只有在使用 TensorFlow/JAX 且工作负载以矩阵运算为主时，才考虑 TPU。
:::

## 工程实践

### 多卡训练

```python
import torch.distributed as dist
from torch.nn.parallel import DistributedDataParallel as DDP

# 初始化进程组
dist.init_process_group(backend="nccl")

# 使用 DDP 包装模型
model = DDP(model, device_ids=[local_rank])

# 分布式采样器
sampler = torch.utils.data.distributed.DistributedSampler(dataset)
dataloader = DataLoader(dataset, sampler=sampler, batch_size=64)
```

### 显存优化

```python
# 混合精度训练
from torch.cuda.amp import autocast, GradScaler

scaler = GradScaler()
with autocast():
    output = model(input)
    loss = criterion(output, target)
scaler.scale(loss).backward()
scaler.step(optimizer)
scaler.update()

# 梯度累积（模拟更大 batch size）
accumulation_steps = 4
for i, (input, target) in enumerate(dataloader):
    loss = model(input) / accumulation_steps
    loss.backward()
    if (i + 1) % accumulation_steps == 0:
        optimizer.step()
        optimizer.zero_grad()
```

### 性能监控

```bash
# 查看 GPU 使用情况
nvidia-smi

# 持续监控
watch -n 1 nvidia-smi

# 使用 nvtop 查看更详细的信息
nvtop

# PyTorch 性能分析
torch.cuda.memory_summary()
```

### 常见问题排查

| 问题             | 原因                 | 解决方案                                |
| ---------------- | -------------------- | --------------------------------------- |
| **CUDA OOM**     | 显存不足             | 减小 batch size、使用梯度累积、混合精度 |
| **GPU 利用率低** | CPU 瓶颈或数据加载慢 | 增加 DataLoader workers、使用预取       |
| **多卡通信慢**   | PCIe 带宽瓶颈        | 使用 NVLink、优化通信频率               |
| **训练不稳定**   | 学习率过大           | 调整学习率、使用梯度裁剪                |

:::warning 注意事项
- 定期清理未使用的缓存：`torch.cuda.empty_cache()`
- 避免频繁的 CPU-GPU 数据传输
- 多卡训练时确保每张卡的 batch size 合理
:::

## 与其他概念的关系

- 与 [TPU](/glossary/tpu) 对比：GPU 更通用灵活，TPU 专为矩阵运算优化
- 是训练 [大语言模型](/glossary/llm) 的核心硬件基础设施
- [模型优化](/glossary/quantization) 技术可以降低 GPU 显存需求
- 多 GPU 分布式训练涉及 [成本优化](/glossary/cost-optimization) 考量

## 延伸阅读

- [TPU](/glossary/tpu) — Google 专用 AI 芯片
- [大语言模型](/glossary/llm) — 大语言模型基础
- [模型优化](/glossary/quantization) — 模型量化与压缩
- [成本优化](/glossary/cost-optimization) — AI 成本优化策略
- [NVIDIA CUDA 文档](https://docs.nvidia.com/cuda/)
- [PyTorch 分布式训练指南](https://pytorch.org/tutorials/intermediate/ddp_tutorial.html)
