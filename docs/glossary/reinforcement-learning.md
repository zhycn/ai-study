---
title: 强化学习
description: Reinforcement Learning (RL)，通过与环境交互学习最优策略
---

# 强化学习

## 概述

强化学习（Reinforcement Learning，RL）是机器学习的一个分支，通过智能体与环境交互，学习在不同状态下采取最优行动以获得最大奖励。

## 为什么重要

- **决策智能**：学习最优决策
- **自主学习**：无需人工标注数据
- **通用能力**：适用于多种场景
- **对齐训练**：RLHF 是 LLM 对齐的关键

## 核心概念

- **智能体**：学习和决策的主体
- **环境**：智能体交互的对象
- **状态**：环境的当前情况
- **动作**：智能体的行为
- **奖励**：动作的反馈信号

## 主要算法

- **Q-learning**：值函数方法
- **Policy Gradient**：策略梯度方法
- **Actor-Critic**：演员-评论家方法
- **PPO**：近端策略优化

## 应用场景

- **游戏**：AlphaGo、星际争霸
- **机器人**：动作控制
- **推荐系统**：个性化推荐
- **LLM 对齐**：RLHF 训练

## 与其他概念的关系

- [RLHF](/glossary/alignment) 用于 [大语言模型](/glossary/llm) 对齐
- 与 [Agent](/glossary/agent) 技术密切相关
- 使用 [深度学习](/glossary/deep-learning) 近似值函数

## 延伸阅读

- [Agent](/glossary/agent)
- [对齐](/glossary/alignment)
- [大语言模型](/glossary/llm)
