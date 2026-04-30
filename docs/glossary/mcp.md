---
title: MCP
description: Model Context Protocol，模型上下文协议
---

# MCP

## 概述

MCP（Model Context Protocol，模型上下文协议）是由 Anthropic 提出的标准化协议，用于 AI 模型与外部系统、工具的安全连接。

## 为什么重要

- **标准化**：统一的工具接入方式
- **安全性**：安全的工具调用机制
- **可扩展性**：易于扩展新工具
- **互操作性**：不同系统间互操作

## 协议特点

- **JSON-RPC**：基于 JSON-RPC 2.0
- **工具描述**：标准化的工具描述格式
- **资源管理**：标准化的资源访问
- **提示模板**：可复用的提示模板

## 组成部件

- **Host**：AI 应用主程序
- **Client**：与 Server 通信的客户端
- **Server**：提供工具和资源的外部服务

## 应用场景

- **文件系统**：访问本地文件
- **数据库**：查询数据库
- **Web 搜索**：进行网络搜索
- **代码执行**：运行代码

## 与其他概念的关系

- 与 [函数调用](/glossary/function-calling) 功能类似但更标准化
- 是 [Agent](/glossary/agent) 接入工具的标准方式
- 类似于 [OpenAI](/glossary/api) 的 Function Calling

## 延伸阅读

- [Agent](/glossary/agent)
- [函数调用](/glossary/function-calling)
- [Anthropic MCP 文档](https://modelcontextprotocol.io)
