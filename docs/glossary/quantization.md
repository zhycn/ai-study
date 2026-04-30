---
title: 量化
description: Quantization，降低模型精度以减少体积和加速推理
---

# 量化

## 概述

量化（Quantization）是将模型参数从高精度（如 FP32）转换为低精度（如 INT8、INT4）表示的技术，以减少模型体积和加速推理。

## 为什么重要

- **体积减少**：大幅减小模型文件大小
- **推理加速**：低精度计算更快
- **成本降低**：降低部署成本
- **边缘部署**：使模型可在边缘设备运行

## 量化类型

- **训练后量化（PTQ）**：训练完成后量化
- **量化感知训练（QAT）**：训练时模拟量化
- **动态量化**：推理时动态量化
- **静态量化**：提前量化

## 精度级别

- **FP32**：32 位浮点（原始精度）
- **FP16**：16 位浮点（半精度）
- **INT8**：8 位整数（常用）
- **INT4**：4 位整数（极致压缩）

## 与其他概念的关系

- 是 [成本优化](/glossary/cost-optimization) 的重要手段
- 与 [蒸馏](/glossary/distillation) 可结合使用
- 需要平衡精度和性能

## 延伸阅读

- [成本优化](/glossary/cost-optimization)
- [蒸馏](/glossary/distillation)
- [延迟优化](/glossary/latency-optimization)
