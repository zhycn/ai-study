---
title: Agent
description: AI Agent，AI 智能体
---

# Agent

## 概述

Agent（智能体）是指能够**感知环境、做出决策并执行行动**的 AI 系统。与传统的问答式 AI 不同，Agent 具有自主性（Autonomy）、反应性（Reactivity）和目标导向性（Pro-activeness），能够独立完成多步骤的复杂任务。

如果说大语言模型（LLM）是"大脑"，那么 Agent 就是给这个大脑装上了"眼睛"（感知）、"手脚"（工具调用）和"记忆"（上下文管理），使其能够真正与世界交互并完成任务。

Agent 的核心公式可以概括为：

```text
Agent = LLM + 规划（Planning）+ 记忆（Memory）+ 工具使用（Tool Use）
```

## 为什么重要

Agent 代表了 AI 从"对话工具"向"工作伙伴"的演进：

- **从被动到主动**：传统 AI 等待用户输入，Agent 可以主动感知环境、发起行动
- **复杂任务处理**：能够分解和执行人类需要多步骤才能完成的复杂任务
- **自动化工作流**：将重复性工作流程自动化，大幅提升效率
- **人机协作新范式**：人类定义目标，Agent 负责执行，形成新的协作模式
- **商业落地核心**：Agent 是目前 AI 技术商业化落地的主要形态

::: tip 提示
Agent 不是单一技术，而是多种技术的组合。理解 Agent 需要先理解 [大语言模型](/glossary/llm)、[提示词工程](/glossary/prompt-engineering)、[函数调用](/glossary/function-calling) 等基础概念。
:::

## 核心架构

### ReAct 架构

ReAct（Reasoning + Acting）是最经典的 Agent 架构，将推理和行动交替进行：

```text
思考（Thought）→ 行动（Action）→ 观察（Observation）→ 思考 → 行动 → 观察 → ...
```

示例：

```text
Thought: 用户想知道北京今天的天气，我需要调用天气查询工具
Action: weather_api(city="北京")
Observation: {"temperature": 25, "condition": "晴", "humidity": 45}
Thought: 获取到了天气数据，现在可以整理回复用户
Final Answer: 北京今天天气晴朗，气温 25°C，湿度 45%
```

### 核心组件

**1. 规划（Planning）**

Agent 将复杂任务分解为可执行的子任务：

- **任务分解（Task Decomposition）**：将大任务拆解为小步骤
- **自我反思（Self-Reflection）**：评估执行结果，调整后续计划
- **多路径探索**：当一条路径失败时，尝试替代方案

常用规划模式：

| 模式 | 说明 | 适用场景 |
|------|------|---------|
| 单步规划 | 一次生成完整计划 | 简单、确定性高的任务 |
| 迭代规划 | 边执行边调整计划 | 复杂、不确定性高的任务 |
| 反思规划 | 执行后反思并改进 | 需要高质量输出的任务 |

**2. 记忆（Memory）**

Agent 的记忆系统分为多个层次：

- **短期记忆（Short-term Memory）**：当前对话的上下文，通常由 LLM 的上下文窗口承载
- **长期记忆（Long-term Memory）**：跨会话的持久化记忆，通常通过向量数据库实现
- **工作记忆（Working Memory）**：当前任务的中间状态和变量

**3. 工具使用（Tool Use）**

Agent 通过调用外部工具扩展自身能力：

- **搜索工具**：网络搜索、知识库检索
- **计算工具**：代码执行、数学计算
- **API 工具**：调用第三方服务（天气、邮件、日历等）
- **文件工具**：读写文件、操作数据库

工具接入方式包括：

- [函数调用](/glossary/function-calling)：OpenAI、Anthropic 等厂商的原生方案
- [MCP](/glossary/mcp)：标准化的模型上下文协议
- 自定义工具注册：框架级别的工具管理

**4. 反思（Reflection）**

Agent 对自身行为进行评估和改进：

- **结果验证**：检查输出是否符合预期
- **错误分析**：识别失败原因
- **策略调整**：根据反思结果调整后续行为

## 主流框架

### LangGraph

LangChain 推出的 Agent 框架，基于图（Graph）结构定义 Agent 的工作流：

```python
from langgraph.graph import StateGraph, END

# 定义状态
class AgentState(TypedDict):
    messages: list
    next_action: str

# 构建图
graph = StateGraph(AgentState)
graph.add_node("agent", agent_node)
graph.add_node("tool", tool_node)
graph.add_edge("agent", "tool")
graph.add_edge("tool", "agent")
graph.add_conditional_edges("agent", should_continue, {"continue": "tool", "end": END})
```

特点：可视化工作流、支持循环和条件分支、与 LangChain 生态深度集成。

### AutoGen

Microsoft 推出的多 Agent 框架，支持多个 Agent 协作完成任务：

- **对话驱动**：Agent 之间通过对话协作
- **灵活拓扑**：支持多种 Agent 组织方式
- **人类参与**：允许人类在关键时刻介入

### CrewAI

面向任务的多 Agent 编排框架：

- **角色定义**：为每个 Agent 定义明确的角色和职责
- **任务分配**：将任务分配给最合适的 Agent
- **流程管理**：支持顺序、并行、层级等执行模式

### OpenAI Agents SDK

OpenAI 官方推出的轻量级 Agent 框架：

- **Handoffs**：Agent 之间的任务交接
- **Guardrails**：输入输出安全校验
- **Tracing**：内置执行追踪和调试

## 工程实践

### Agent 设计原则

1. **单一职责**：每个 Agent 专注于特定领域，避免过度复杂
2. **明确边界**：清晰定义 Agent 的能力范围和限制
3. **可观测性**：记录 Agent 的每一步决策和行动，便于调试
4. **安全优先**：对工具调用进行权限控制和结果验证
5. **优雅降级**：当 Agent 无法完成任务时，给出明确的说明

### 调试技巧

- **思维可视化**：输出 Agent 的思考过程（Thought-Action-Observation）
- **工具调用日志**：记录每次工具调用的输入和输出
- **断点调试**：在关键节点暂停，检查状态
- **回放功能**：重现 Agent 的完整执行过程

### 安全考量

::: warning 警告
Agent 具有执行实际操作的能力，安全风险远高于普通对话系统。
:::

- **工具权限控制**：限制 Agent 可以调用的工具和参数范围
- **人类审批（Human-in-the-loop）**：对敏感操作要求人工确认
- **沙箱执行**：在隔离环境中执行代码和命令
- **输出审查**：对 Agent 的输出进行安全审查
- **速率限制**：防止 Agent 过度调用外部服务

### 性能优化

- **缓存策略**：缓存常见查询的结果
- **并行执行**：当多个工具调用无依赖时并行执行
- **模型选择**：简单任务使用小模型，复杂任务使用大模型
- **上下文管理**：定期清理无关的上下文信息

## 与其他概念的关系

- Agent 的核心推理能力来自 [大语言模型](/glossary/llm)
- Agent 的行为逻辑通过 [提示词工程](/glossary/prompt-engineering) 定义
- Agent 通过 [函数调用](/glossary/function-calling) 或 [MCP](/glossary/mcp) 调用工具
- 多个 Agent 的协作形成 [工作流](/glossary/workflow)
- Agent 可以自主决定是否使用 [RAG](/glossary/rag) 检索知识
- [工具使用](/glossary/tool-use) 是 Agent 的核心能力之一

## 延伸阅读

- [ReAct 论文](https://arxiv.org/abs/2210.03629) - Reasoning + Acting 架构的原始论文
- [LangGraph 文档](https://langchain-ai.github.io/langgraph/)
- [AutoGen 文档](https://microsoft.github.io/autogen/)
- [CrewAI 文档](https://docs.crewai.com/)
- [OpenAI Agents SDK](https://platform.openai.com/docs/guides/agents-sdk)
- [大语言模型](/glossary/llm)
- [提示词工程](/glossary/prompt-engineering)
- [函数调用](/glossary/function-calling)
- [MCP](/glossary/mcp)
- [工作流](/glossary/workflow)
