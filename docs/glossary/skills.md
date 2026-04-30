---
title: Skills
description: Agent 可执行的技能集合
---

# Skills

## 概述

Skills（技能）是指 AI Agent 可以执行的具体能力单元，每个 Skill 定义了特定的输入输出格式和执行逻辑，使 Agent 能够灵活调用各种能力。

## 为什么重要

- **能力模块化**：将复杂能力拆分为可复用的技能单元
- **可扩展性**：易于添加新技能而不影响现有系统
- **标准化**：统一的技能接口便于集成和测试
- **组合性**：多个技能可以组合形成更强大的能力

## Skill 结构

- **名称**：唯一标识技能
- **描述**：说明技能功能和用途
- **参数**：输入参数定义
- **执行逻辑**：技能的具体实现
- **输出格式**：返回结果的格式规范

## 与其他概念的关系

- 是 [Agent](/glossary/agent) 能力的基础组件
- 与 [工具使用](/glossary/tool-use) 概念相关
- 通过 [Commands](/glossary/commands) 被用户触发

## 延伸阅读

- [Agent](/glossary/agent)
- [工具使用](/glossary/tool-use)
- [Commands](/glossary/commands)
