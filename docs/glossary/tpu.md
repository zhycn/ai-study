---
title: TPU
description: Tensor Processing Unit，张量处理器，Google 专用 AI 芯片
---

# TPU

## 概述

TPU（Tensor Processing Unit，张量处理器）是 Google 专门为机器学习工作负载设计的专用集成电路（ASIC），用于加速 AI 模型的训练和推理。

## 为什么重要

- **专用设计**：专为神经网络计算优化
- **高能效**：相比 GPU 更高的能耗比
- **云服务**：通过 Google Cloud 提供
- **大规模部署**：支撑 Google 内部 AI 服务

## TPU 特点

- **矩阵运算**：专门优化矩阵乘法
- **脉动阵列**：高效数据复用
- **稀疏支持**：原生支持稀疏模型
- **v4/ v5e**：最新代际产品

## 与 GPU 对比

| 特性 | TPU | GPU |
|------|-----|-----|
| 架构 | 专用 ASIC | 通用并行 |
| 灵活性 | 较低 | 较高 |
| 生态 | TensorFlow/JAX | CUDA 生态 |
| 可用性 | Google Cloud | 多云 |

## 延伸阅读

- [GPU](/glossary/gpu)
- [深度学习](/glossary/deep-learning)
