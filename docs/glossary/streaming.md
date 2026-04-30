---
title: 流式输出
description: Streaming，实时逐字输出响应
---

# 流式输出

## 概述

流式输出（Streaming）是指 AI 模型在生成完整回复前，以流式方式逐字或逐词输出，让用户提前看到部分结果。

## 为什么重要

- **体验提升**：用户无需等待完整响应
- **感知速度**：降低感知的等待时间
- **早期干预**：用户可提前终止生成
- **长文本友好**：长输出场景尤为重要

## 技术实现

- **Server-Sent Events**：服务端推送
- **WebSocket**：双向实时通信
- **Chunked Transfer**：分块传输
- **流式解析**：前端逐步渲染

## 应用场景

- **对话系统**：聊天机器人
- **代码生成**：实时显示代码
- **内容创作**：长文写作辅助
- **搜索增强**：实时显示搜索结果

## 与其他概念的关系

- 是 [延迟优化](/glossary/latency-optimization) 的重要手段
- 与 [缓存](/glossary/caching) 策略配合
- 影响 [可观测性](/glossary/observability) 监控方式

## 延伸阅读

- [延迟优化](/glossary/latency-optimization)
- [缓存](/glossary/caching)
