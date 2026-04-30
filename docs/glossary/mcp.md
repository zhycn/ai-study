---
title: MCP
description: Model Context Protocol，模型上下文协议
---

# MCP

## 概述

MCP（Model Context Protocol，模型上下文协议）是由 Anthropic 提出的开放协议，旨在标准化 AI 模型与外部数据源、工具和服务之间的交互方式。它类似于 USB-C 接口，让不同系统能够即插即用地与 AI 模型连接。

## 为什么重要

在 MCP 出现之前，每个 AI 应用都需要单独编写代码来连接不同的数据源和工具。MCP 通过统一的协议解决了这个问题：

- **标准化连接**：一次集成，多处可用
- **安全性**：用户完全控制数据访问权限
- **生态开放**：开发者可以构建通用的 MCP 服务器和客户端

## 核心架构

- **MCP Host**：AI 应用（如 Claude Desktop、IDE 插件）
- **MCP Client**：协议客户端，负责与服务器通信
- **MCP Server**：提供数据或工具的服务端

## 与其他概念的关系

- 是 [Agent](/agent/) 获取外部能力的标准通道
- 与 [提示词工程](/glossary/prompt-engineering) 配合使用
- 可扩展 [AI](/glossary/ai) 的应用边界

## 延伸阅读

- [AI Agent 智能体](/agent/)
- [资源与工具](/resources/tools)
