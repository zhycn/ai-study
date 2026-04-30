---
title: 规划
description: Planning，Agent 分解任务、制定执行策略的能力
---

# 规划

## 概述

规划（Planning）是指 AI Agent 将复杂任务分解为可执行的子步骤，并制定合理执行策略的能力。这是 Agent 实现目标导向行为的核心能力。

## 为什么重要

- **任务分解**：将抽象目标转化为具体可执行步骤
- **策略制定**：选择最优的任务执行路径
- **动态调整**：根据执行结果调整后续计划
- **长期目标**：处理需要多步骤完成的复杂任务

## 核心技术

- **任务分解**：将复杂任务拆分为原子子任务
- **依赖分析**：确定子任务之间的依赖关系
- **路径规划**：找到从当前状态到目标状态的路径
- **反思机制**：根据执行结果优化计划

## 与其他概念的关系

- 是 [自主 Agent](/glossary/autonomous-agent) 的核心能力
- 与 [思维链](/glossary/chain-of-thought) 技术相关
- 依赖 [记忆](/glossary/memory) 保持任务上下文

## 延伸阅读

- [Agent](/glossary/agent)
- [思维链](/glossary/chain-of-thought)
- [记忆](/glossary/memory)
