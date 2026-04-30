---
title: TPU
description: Tensor Processing Unit，张量处理器，Google 专用 AI 加速芯片
---

# TPU

Google 专门为 AI 计算定制的芯片。如果说 GPU 是"万能工具"，TPU 就是"专用工具"——它只做 AI 计算这一件事，但做得更快、更省电。缺点是只能用在 Google 的云服务上，不像 GPU 那么灵活。

## 概述

**TPU**（Tensor Processing Unit，张量处理器）是 Google 专门为机器学习工作负载设计的**专用集成电路**（Application-Specific Integrated Circuit, ASIC）。与通用 GPU 不同，TPU 从架构层面针对神经网络的核心运算——矩阵乘法和卷积——进行了深度优化。

TPU 于 2016 年首次在 Google I/O 大会上公开，已迭代至第五代（v5），广泛应用于 Google 内部的搜索、翻译、AlphaGo 等 AI 服务，并通过 Google Cloud 对外提供算力。

:::tip TPU vs GPU
TPU 是**专用芯片**，为特定计算模式优化，能效比更高但灵活性较低；GPU 是**通用并行处理器**，灵活性强且生态更成熟。选择取决于具体需求。
:::

## 为什么需要 TPU

- **专用设计**：从晶体管级别为神经网络计算优化，减少不必要的硬件开销
- **高能效比**：相同算力下功耗显著低于 GPU，降低运营成本
- **大规模集群**：TPU Pod 支持数千芯片互联，适合超大规模模型训练
- **Google 生态**：与 TensorFlow、JAX 深度集成，原生支持
- **成本优势**：Google Cloud TPU 定价通常低于同等算力的 GPU 实例

## 核心原理

### 架构设计

TPU 的核心架构包含以下关键组件：

```
┌─────────────────────────────────────────────────┐
│                  TPU Chip                        │
│  ┌───────────────────────────────────────────┐  │
│  │           Matrix Unit (MXU)               │  │  ← 核心计算单元
│  │         脉动阵列 (Systolic Array)          │  │
│  └───────────────────────────────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │  Vector Unit │  │  Activation │  │  HBM    │ │
│  │  (向量单元)  │  │  Function   │  │  内存   │ │
│  └─────────────┘  └─────────────┘  └─────────┘ │
└─────────────────────────────────────────────────┘
```

**脉动阵列**（Systolic Array）是 TPU 的核心创新：

- 数据在阵列中像脉搏一样流动，每个处理单元执行一次乘加运算
- 数据复用率极高，减少内存访问瓶颈
- 适合矩阵乘法这种规则的计算模式

### TPU 代际演进

| 代际        | 发布时间 | 算力 (FP16/BF16) | 内存       | 关键特性           |
| ----------- | -------- | ---------------- | ---------- | ------------------ |
| **TPU v1**  | 2016     | 92 TFLOPS        | 8GB        | 仅推理，8-bit 量化 |
| **TPU v2**  | 2017     | 180 TFLOPS       | 16GB HBM   | 支持训练           |
| **TPU v3**  | 2018     | 420 TFLOPS       | 32GB HBM   | 双芯封装，液冷     |
| **TPU v4**  | 2021     | 275 TFLOPS       | 32GB HBM2E | 光互联，可配置     |
| **TPU v5p** | 2023     | 459 TFLOPS       | 95GB HBM2E | 高性能训练         |
| **TPU v5e** | 2023     | 197 TFLOPS       | 16GB HBM   | 高性价比推理       |

### TPU Pod

**TPU Pod** 是 TPU 的大规模互联架构：

- **v4 Pod**：4096 个芯片，1.1 EFLOPS 算力
- **v5p Pod**：8960 个芯片，4 EFLOPS 算力
- 芯片间通过**光交换网络**（Optical Circuit Switch）互联
- 支持训练万亿参数模型

## 主流方案对比

### Google Cloud TPU 实例

| 实例类型 | TPU 版本 | vCPU | 内存  | 适用场景   |
| -------- | -------- | ---- | ----- | ---------- |
| **v5p**  | TPU v5p  | 208  | 480GB | 大模型训练 |
| **v5e**  | TPU v5e  | 24   | 96GB  | 推理、微调 |
| **v4**   | TPU v4   | 96   | 384GB | 通用训练   |
| **v2**   | TPU v2   | 96   | 334GB | 轻量训练   |

### 框架支持

- **TensorFlow**：原生支持，最佳兼容性
- **JAX**：Google 推荐的深度学习框架，TPU 优先
- **PyTorch**：通过 `torch_xla` 支持 TPU

```python
# 使用 JAX 在 TPU 上运行
import jax
import jax.numpy as jnp

# 检查 TPU 设备
print(jax.devices())  # [TpuDevice(id=0), TpuDevice(id=1), ...]

# 简单的矩阵运算
@jax.jit
def matmul(a, b):
    return jnp.dot(a, b)

key = jax.random.PRNGKey(0)
a = jax.random.normal(key, (1000, 1000))
b = jax.random.normal(key, (1000, 1000))
result = matmul(a, b)
```

```python
# 使用 PyTorch/XLA 在 TPU 上运行
import torch_xla.core.xla_model as xm

device = xm.xla_device()
model = MyModel().to(device)
data = data.to(device)

# 训练循环
optimizer.step()
xm.mark_step()  # 同步 TPU 执行
```

## 工程实践

### JAX + TPU 训练示例

```python
import jax
import jax.numpy as jnp
from flax import linen as nn
import optax

# 定义模型
class SimpleMLP(nn.Module):
    @nn.compact
    def __call__(self, x):
        x = nn.Dense(128)(x)
        x = nn.relu(x)
        x = nn.Dense(10)(x)
        return x

# 初始化模型
model = SimpleMLP()
params = model.init(jax.random.PRNGKey(0), jnp.ones((1, 784)))

# 定义损失函数
@jax.jit
def loss_fn(params, batch):
    logits = model.apply(params, batch["image"])
    return optax.softmax_cross_entropy_with_integer_labels(
        logits, batch["label"]
    ).mean()

# 训练步骤
@jax.jit
def train_step(params, batch, opt_state):
    grads = jax.grad(loss_fn)(params, batch)
    updates, opt_state = optimizer.update(grads, opt_state)
    params = optax.apply_updates(params, updates)
    return params, opt_state

# 使用多 TPU 并行
@jax.pmap
def parallel_train_step(params, batch, opt_state):
    return train_step(params, batch, opt_state)
```

### 性能优化策略

- **XLA 编译**（Accelerated Linear Algebra）：JAX/TensorFlow 自动使用 XLA 优化计算图
- **批量大小调优**：TPU 适合大 batch size，通常 256-4096
- **混合精度**：使用 bfloat16 提升吞吐量
- **数据预取**：保持 TPU 计算单元满载

```python
# XLA 编译优化
@jax.jit  # Just-In-Time 编译
def forward(params, x):
    return model.apply(params, x)

# 使用 pmap 进行数据并行
@jax.pmap
def parallel_forward(params, x):
    return model.apply(params, x)

# 在多 TPU 上运行
params = jax.pmap(lambda x: x)(params)  # 复制参数到所有设备
```

## 选型建议

### 何时选择 TPU

- 使用 TensorFlow 或 JAX 框架
- 训练大规模模型，需要 TPU Pod 集群
- 追求高性价比的推理服务
- 工作负载以矩阵运算为主

### TPU vs GPU 选型决策

| 维度           | TPU                  | GPU                     |
| -------------- | -------------------- | ----------------------- |
| **架构**       | 专用 ASIC            | 通用并行处理器          |
| **灵活性**     | 较低，适合规则计算   | 较高，支持各种算子      |
| **生态**       | TensorFlow/JAX 为主  | CUDA 生态，框架支持广泛 |
| **可用性**     | 仅 Google Cloud      | AWS/GCP/Azure/本地      |
| **大模型训练** | TPU Pod 集群优势明显 | NVLink 多卡方案成熟     |
| **推理部署**   | v5e 性价比高         | 选择更多，边缘部署方便  |
| **成本**       | 通常更低             | 按需选择多              |

:::tip 选型原则
大多数场景首选 GPU，生态成熟、灵活性强。只有在使用 TensorFlow/JAX 且追求大规模集群训练时，才考虑 TPU。
:::

:::warning 注意事项
- TPU 不支持某些自定义算子，需确认框架兼容性
- PyTorch 对 TPU 的支持通过 XLA，可能有性能损耗
- TPU 仅在 Google Cloud 可用，存在供应商锁定风险
- 调试工具不如 GPU 生态完善
:::

## 与其他概念的关系

- 与 [GPU](/glossary/gpu) 是竞争关系，各有优劣，取决于具体场景
- 是训练 [大语言模型](/glossary/llm) 的重要硬件选项之一
- 与 [模型优化](/glossary/quantization) 结合可进一步提升推理效率
- TPU Pod 的大规模训练涉及 [成本优化](/glossary/cost-optimization) 策略

## 延伸阅读

- [GPU](/glossary/gpu) — 图形处理器
- [大语言模型](/glossary/llm) — 大语言模型基础
- [模型优化](/glossary/quantization) — 模型量化与压缩
- [成本优化](/glossary/cost-optimization) — AI 成本优化策略
- [Google TPU 官方文档](https://cloud.google.com/tpu/docs)
- [JAX 官方文档](https://jax.readthedocs.io/)
