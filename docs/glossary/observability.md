---
title: 可观测性
description: Observability，监控和追踪 AI 应用运行状态
---

# 可观测性

## 概述

可观测性（Observability）是指通过日志、指标、追踪等手段，全面了解 AI 应用运行状态的能力，是保障系统稳定性的关键。

## 为什么重要

- **问题定位**：快速定位和诊断问题
- **性能分析**：了解系统性能瓶颈
- **用户洞察**：了解用户使用模式
- **主动预警**：提前发现潜在问题

## 三大支柱

- **日志**：记录系统事件和状态
- **指标**：量化的系统性能数据
- **追踪**：请求的完整调用链路

## AI 场景特殊指标

- **Token 消耗**：API 调用消耗
- **延迟分布**：不同 percentile 延迟
- **错误率**：各类错误比例
- **模型表现**：上线模型的实际效果

## 工具生态

- **OpenTelemetry**：标准化可观测
- **Prometheus**：指标收集
- **Grafana**：可视化
- **LangSmith**：LLM 应用追踪

## 延伸阅读

- [延迟优化](/glossary/latency-optimization)
- [成本优化](/glossary/cost-optimization)
