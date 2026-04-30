---
title: MCP
description: Model Context Protocol，模型上下文协议
---

# MCP

AI 世界的"USB 接口"。以前每个 AI 应用要连接不同的工具都得单独开发接口，MCP 制定了一个统一标准，让各种工具和数据源都能像插 U 盘一样即插即用，大大简化了 AI 应用的开发。

## 概述

MCP（Model Context Protocol，模型上下文协议）是由 Anthropic 于 2024 年提出的**开放标准协议**，用于规范 AI 模型与外部系统、工具和数据源之间的连接方式。

MCP 的目标是解决 AI 应用开发中的一个核心问题：**如何让模型安全、标准化地访问外部资源**。在 MCP 出现之前，每个 AI 应用都需要自行实现与各种工具的连接逻辑，导致大量的重复工作和兼容性问题。MCP 通过定义统一的协议，使得工具提供者只需实现一次 MCP Server，即可被所有支持 MCP 的 AI 应用使用。

可以将 MCP 理解为 **AI 领域的 USB-C** —— 一种标准化的接口，让不同的设备和系统能够即插即用。

## 为什么重要

MCP 的出现对 AI 生态具有深远影响：

- **标准化**：终结了工具接入的"碎片化"时代，统一的协议降低了集成成本
- **安全性**：内置安全机制，模型只能访问用户明确授权的资源
- **互操作性**：不同厂商的模型和应用可以共享同一套工具生态
- **开发者体验**：工具提供者只需实现一次 MCP Server，即可服务所有 MCP 客户端
- **生态效应**：随着 MCP 的普及，工具生态将快速扩张，形成网络效应

::: tip 提示
MCP 是一个开放标准，由 [MCP 社区](https://modelcontextprotocol.io)维护，不属于任何单一公司。Anthropic 是发起者，但协议的设计目标是成为行业通用标准。
:::

## 核心架构

### 协议模型

MCP 采用 **Client-Server 架构**，包含三个核心角色：

```text
┌─────────────┐     MCP Protocol     ┌─────────────┐
│    Host     │ ◄──────────────────► │   Client    │
│  (AI 应用)   │                      │  (协议客户端) │
└─────────────┘                      └──────┬──────┘
                                            │
                                    MCP Protocol
                                            │
                                      ┌─────┴─────┐
                                      │  Server   │
                                      │ (工具提供者) │
                                      └───────────┘
```

**Host（宿主）**

- AI 应用程序本身（如 Claude Desktop、IDE 插件）
- 负责管理 MCP Client 的生命周期
- 处理用户权限和授权

**Client（客户端）**

- 与 MCP Server 通信的协议实现
- 通常嵌入在 Host 中
- 一个 Host 可以连接多个 Client

**Server（服务器）**

- 提供工具（Tools）、资源（Resources）和提示模板（Prompts）
- 可以是本地进程或远程服务
- 每个 Server 专注于特定领域的能力

### 三大核心能力

**1. 工具（Tools）**

Server 向模型暴露的可执行操作：

```json
{
  "name": "get_weather",
  "description": "获取指定城市的天气信息",
  "inputSchema": {
    "type": "object",
    "properties": {
      "city": { "type": "string", "description": "城市名称" }
    },
    "required": ["city"]
  }
}
```

模型可以：

- 发现可用的工具列表
- 理解工具的参数和用途
- 请求调用特定工具
- 获取工具执行结果

**2. 资源（Resources）**

Server 提供的可读数据源：

- 文件系统内容
- 数据库记录
- API 响应数据
- 文档内容

资源支持 URI 寻址，模型可以请求读取特定资源。

**3. 提示模板（Prompts）**

Server 提供的可复用提示模板：

- 预定义的工作流提示
- 领域特定的指令模板
- 带参数化的提示片段

### 通信协议

MCP 基于 **JSON-RPC 2.0** 协议，支持多种传输层：

- **stdio**：标准输入输出，适用于本地进程
- **HTTP + SSE**：适用于远程服务
- **WebSocket**：适用于双向实时通信

消息类型：

| 类型         | 说明               |
| ------------ | ------------------ |
| Request      | 客户端发起的请求   |
| Response     | 服务端的响应       |
| Notification | 单向通知，无需响应 |

## 与 Function Calling 的对比

| 特性     | Function Calling                         | MCP                                      |
| -------- | ---------------------------------------- | ---------------------------------------- |
| 标准性质 | 厂商自定义（OpenAI、Anthropic 各有实现） | 开放标准                                 |
| 工具发现 | 需要在提示词中手动定义                   | 自动发现 Server 提供的工具               |
| 传输方式 | 通过 API 请求传递                        | 支持多种传输层（stdio、HTTP、WebSocket） |
| 资源访问 | 仅支持工具调用                           | 支持工具、资源、提示模板                 |
| 生态系统 | 封闭，绑定特定厂商                       | 开放，跨厂商互操作                       |
| 安全模型 | 依赖应用层实现                           | 协议内置权限控制                         |

::: info 说明
Function Calling 和 MCP 不是互斥的。Function Calling 是模型层面的能力，MCP 是工具接入的协议层。两者可以配合使用：MCP 负责工具的标准化接入，Function Calling 负责模型的调用决策。
:::

## 工程实践

### 创建 MCP Server

使用 TypeScript 创建一个简单的 MCP Server：

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'

const server = new McpServer({
  name: 'weather-server',
  version: '1.0.0'
})

// 注册工具
server.tool('get_weather', { city: z.string().describe('城市名称') }, async ({ city }) => {
  // 实现天气查询逻辑
  const data = await fetchWeather(city)
  return {
    content: [{ type: 'text', text: JSON.stringify(data) }]
  }
})

// 启动服务
const transport = new StdioServerTransport()
await server.connect(transport)
```

### 配置 MCP Client

在 AI 应用中配置 MCP Server 连接：

```json
{
  "mcpServers": {
    "weather": {
      "command": "node",
      "args": ["/path/to/weather-server.js"]
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allowed/dir"]
    }
  }
}
```

### 安全最佳实践

::: warning 警告
MCP Server 可以访问本地文件系统和执行命令，安全配置至关重要。
:::

- **最小权限原则**：只授予 Server 必要的访问权限
- **路径限制**：限制文件系统 Server 只能访问特定目录
- **用户确认**：对敏感操作要求用户手动确认
- **审计日志**：记录所有工具调用和资源访问
- **隔离执行**：在沙箱环境中运行不受信任的 Server

### 官方 Server 示例

MCP 社区提供了多个官方 Server 实现：

| Server                | 功能                  |
| --------------------- | --------------------- |
| `server-filesystem`   | 文件系统访问          |
| `server-git`          | Git 仓库操作          |
| `server-github`       | GitHub API 集成       |
| `server-google-drive` | Google Drive 访问     |
| `server-postgres`     | PostgreSQL 数据库查询 |
| `server-puppeteer`    | 浏览器自动化          |
| `server-slack`        | Slack 集成            |

## 与其他概念的关系

- MCP 为 [Agent](/glossary/agent) 提供了标准化的工具接入方式
- 与 [函数调用](/glossary/function-calling) 互补，MCP 负责工具接入，函数调用负责调用决策
- [工作流](/glossary/workflow) 可以通过 MCP 接入各种外部服务
- MCP 的资源能力可以与 [RAG](/glossary/rag) 结合，提供动态知识检索
- 工具的描述格式依赖 [提示词工程](/glossary/prompt-engineering) 的技巧

## 延伸阅读

- [MCP 官方网站](https://modelcontextprotocol.io)
- [MCP 规范文档](https://spec.modelcontextprotocol.io)
- [MCP GitHub 仓库](https://github.com/modelcontextprotocol)
- [MCP Server 示例集合](https://github.com/modelcontextprotocol/servers)
- [Anthropic MCP 介绍博客](https://www.anthropic.com/news/model-context-protocol)
- [Agent 智能体](/glossary/agent)
- [函数调用](/glossary/function-calling)
- [工作流](/glossary/workflow)
