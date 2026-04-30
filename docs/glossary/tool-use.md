---
title: 工具使用
description: Tool Use，Agent 调用外部工具的能力
---

# 工具使用

## 概述

工具使用（Tool Use）是指 AI Agent 调用外部工具或服务来扩展自身能力的技术，使 Agent 能够执行搜索、计算、API 调用等超出模型本身能力范围的任务。

## 为什么重要

- **能力扩展**：突破模型知识截止日期和计算能力的限制
- **实时信息**：获取最新信息和实时数据
- **执行行动**：不仅回答问题，还能执行实际操作
- **任务闭环**：完成端到端的复杂任务

## 核心工具类型

- **搜索工具**：获取实时信息和知识
- **计算工具**：执行精确的数学计算
- **API 工具**：调用外部服务和数据源
- **文件工具**：读写文件、操作数据库

## 与其他概念的关系

- 是构建 [Agent](/glossary/agent) 的核心能力之一
- 通过 [函数调用](/glossary/function-calling) 实现
- 与 [MCP](/glossary/mcp) 协议配合实现标准化工具调用

## 延伸阅读

- [函数调用](/glossary/function-calling)
- [MCP](/glossary/mcp)
- [Agent](/glossary/agent)
