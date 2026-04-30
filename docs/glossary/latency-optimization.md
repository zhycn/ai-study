---
title: 延迟优化
description: Latency Optimization，减少响应时间
---

# 延迟优化

## 概述

延迟优化是指通过各种技术手段减少 AI 应用的响应时间，提升用户体验的系统性工程。

## 为什么重要

- **用户体验**：低延迟是良好体验的基础
- **业务指标**：影响留存和转化
- **实时应用**：实时场景的必要条件
- **竞争优势**：快速响应带来竞争优势

## 优化策略

- **流式输出**：实时返回部分结果
- **缓存预热**：提前加载常用资源
- **模型选择**：使用更快的模型
- **异步处理**：非核心流程异步化
- **边缘计算**：在靠近用户处处理

## 关键指标

- **TTFT**：首个 Token 生成时间
- **TPS**：Token 每秒生成数
- **P50/P99**：不同百分位延迟
- **端到端延迟**：完整请求响应时间

## 与其他概念的关系

- 与 [流式输出](/glossary/streaming) 紧密相关
- 是 [可观测性](/glossary/observability) 的重要指标
- 需要权衡 [成本优化](/glossary/cost-optimization)

## 延伸阅读

- [流式输出](/glossary/streaming)
- [可观测性](/glossary/observability)
- [成本优化](/glossary/cost-optimization)
