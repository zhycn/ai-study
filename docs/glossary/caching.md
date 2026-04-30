---
title: 缓存
description: Caching，减少重复调用、降低成本的技术
---

# 缓存

## 概述

缓存（Caching）是存储计算结果以供后续使用的技术，避免重复计算，显著降低延迟和成本。

## 为什么重要

- **成本降低**：避免重复 API 调用
- **延迟降低**：直接从缓存返回结果
- **稳定性**：减少下游服务压力
- **可扩展性**：支持更高并发

## 缓存策略

- **完全缓存**：相同输入直接返回结果
- **语义缓存**：语义相似也返回缓存
- **分层缓存**：多级缓存提高命中率
- **TTL**：设置缓存过期时间

## 实现方式

- **内存缓存**：本地快速访问
- **Redis**：分布式缓存
- **向量缓存**：缓存 [Embedding](/glossary/embedding) 结果
- **Prompt 缓存**：缓存常用提示词

## 与其他概念的关系

- 是 [成本优化](/glossary/cost-optimization) 的重要手段
- 与 [流式输出](/glossary/streaming) 配合使用
- 需要考虑 [版本管理](/glossary/versioning)

## 延伸阅读

- [成本优化](/glossary/cost-optimization)
- [版本管理](/glossary/versioning)
