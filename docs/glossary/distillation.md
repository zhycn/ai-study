---
title: 蒸馏
description: Knowledge Distillation，将大模型知识迁移到小模型
---

# 蒸馏

## 概述

蒸馏（Knowledge Distillation）是将大模型（教师模型）的知识迁移到小模型（学生模型）的技术，使学生模型能够以更小的体积达到接近教师模型的性能。

## 为什么重要

- **模型压缩**：得到体积更小的模型
- **推理加速**：小模型推理更快
- **成本降低**：部署和推理成本降低
- **隐私保护**：数据可本地处理

## 蒸馏方法

- **软标签蒸馏**：学习教师模型的输出分布
- **特征蒸馏**：学习教师模型的中间特征
- **关系蒸馏**：学习样本间的关系
- **多教师蒸馏**：从多个教师学习

## 应用场景

- **边缘部署**：手机、IoT 设备部署
- **实时推理**：低延迟要求的场景
- **模型服务**：低成本模型服务
- **模型压缩**：通用模型压缩

## 与其他概念的关系

- 与 [量化](/glossary/quantization) 可结合使用
- 是 [成本优化](/glossary/cost-optimization) 的重要手段
- 需要 [模型评估](/glossary/model-evaluation) 验证效果

## 延伸阅读

- [量化](/glossary/quantization)
- [成本优化](/glossary/cost-optimization)
- [模型评估](/glossary/model-evaluation)
