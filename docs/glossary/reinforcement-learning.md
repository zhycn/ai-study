---
title: 强化学习
description: Reinforcement Learning (RL)，通过与环境交互学习最优决策策略
---

# 强化学习

让 AI 通过"试错"来学习的方法。就像训练小狗——做对了给奖励，做错了不给奖励甚至惩罚，久而久之它就学会了该怎么做。AlphaGo 下围棋就是靠这个方法，自己跟自己下了几百万盘棋练出来的。

## 概述

**强化学习**（Reinforcement Learning，RL）是机器学习的一个重要分支，研究智能体（Agent）如何在与环境（Environment）的交互中学习最优策略（Policy），以最大化累积奖励（Cumulative Reward）。

与监督学习（Supervised Learning）和无监督学习（Unsupervised Learning）不同，强化学习具有以下特点：

- **试错学习**（Trial and Error）：智能体通过尝试不同行动，从成功和失败中学习
- **延迟奖励**（Delayed Reward）：当前行动的回报可能在未来才显现
- **序列决策**（Sequential Decision Making）：当前决策影响未来状态和可选行动
- **探索与利用**（Exploration vs. Exploitation）：需要平衡尝试新行动和利用已知好行动

:::tip 直观理解
强化学习可以类比为训练宠物：做对了给奖励（正奖励），做错了给惩罚（负奖励）。宠物通过不断尝试，学会哪些行为会得到奖励，从而形成最优行为策略。与监督学习不同，老师不会直接告诉宠物"正确答案"，而是通过奖励信号间接引导。
:::

## 为什么重要

- **决策智能**：RL 是解决序列决策问题的天然框架，适用于游戏、机器人、自动驾驶等场景
- **无需标注数据**：通过与环境交互自动生成训练数据，不依赖人工标注
- **通用学习范式**：从 Atari 游戏到蛋白质折叠，RL 展现了跨领域的通用性
- **LLM 对齐关键**：**基于人类反馈的强化学习**（RLHF）是当前大语言模型对齐的核心技术
- **Agent 基石**：[Agent](/glossary/agent) 的自主决策能力建立在 RL 理论基础之上

## 核心概念与数学框架

### 马尔可夫决策过程（MDP）

强化学习问题通常建模为**马尔可夫决策过程**（Markov Decision Process，MDP），由五元组定义：

```
MDP = (S, A, P, R, γ)
```

- **S**（State，状态空间）：环境的所有可能状态
- **A**（Action，动作空间）：智能体可采取的所有行动
- **P**（Transition Probability，状态转移概率）：P(s'|s, a) 表示在状态 s 采取动作 a 后转移到状态 s' 的概率
- **R**（Reward，奖励函数）：R(s, a) 表示在状态 s 采取动作 a 获得的即时奖励
- **γ**（Discount Factor，折扣因子）：0 ≤ γ ≤ 1，衡量未来奖励的重要性

### 核心概念

| 概念             | 英文                      | 描述                                                          |
| ---------------- | ------------------------- | ------------------------------------------------------------- |
| **策略**         | Policy (π)                | 从状态到动作的映射，π(a\|s) 表示在状态 s 选择动作 a 的概率    |
| **价值函数**     | Value Function (V)        | V(s) 表示从状态 s 开始，遵循策略 π 能获得的期望累积奖励       |
| **动作价值函数** | Action-Value Function (Q) | Q(s, a) 表示在状态 s 采取动作 a 后，遵循策略 π 的期望累积奖励 |
| **优势函数**     | Advantage Function (A)    | A(s, a) = Q(s, a) - V(s)，衡量动作 a 相对于平均水平的优势     |
| **回报**         | Return (G)                | G*t = Σ γ^k · R*{t+k+1}，从时刻 t 开始的折扣累积奖励          |

### 探索与利用

```
探索（Exploration）：尝试未知动作，可能发现更好的策略
利用（Exploitation）：选择当前已知最好的动作，获取最大即时奖励
```

常见探索策略：

- **ε-greedy**：以概率 ε 随机探索，以概率 1-ε 选择最优动作
- **Softmax（Boltzmann）**：按动作价值的指数分布选择动作
- **UCB**（Upper Confidence Bound）：选择上置信界最大的动作
- **熵正则化**（Entropy Regularization）：在目标函数中加入策略熵，鼓励探索

## 主要算法

### 基于价值的方法（Value-Based Methods）

通过学习价值函数来间接学习策略：

#### Q-Learning

经典的无模型（Model-Free）强化学习算法：

```python
# Q-Learning 核心更新公式
# Q(s, a) ← Q(s, a) + α · [R + γ · max_a' Q(s', a') - Q(s, a)]

import numpy as np

class QLearningAgent:
    def __init__(self, n_states, n_actions, alpha=0.1, gamma=0.9, epsilon=0.1):
        self.q_table = np.zeros((n_states, n_actions))
        self.alpha = alpha      # 学习率
        self.gamma = gamma      # 折扣因子
        self.epsilon = epsilon  # 探索率

    def choose_action(self, state):
        if np.random.random() < self.epsilon:
            return np.random.randint(n_actions)  # 探索
        return np.argmax(self.q_table[state])     # 利用

    def update(self, state, action, reward, next_state):
        best_next = np.max(self.q_table[next_state])
        td_error = reward + self.gamma * best_next - self.q_table[state, action]
        self.q_table[state, action] += self.alpha * td_error
```

#### Deep Q-Network（DQN）

将深度学习引入 Q-Learning，解决高维状态空间问题：

- **经验回放**（Experience Replay）：存储 (s, a, r, s') 元组，随机采样打破相关性
- **目标网络**（Target Network）：定期复制 Q 网络参数，稳定训练
- **适用场景**：Atari 游戏、离散动作空间

```python
import torch.nn as nn

class DQN(nn.Module):
    def __init__(self, input_dim, n_actions):
        super().__init__()
        self.network = nn.Sequential(
            nn.Linear(input_dim, 128),
            nn.ReLU(),
            nn.Linear(128, 128),
            nn.ReLU(),
            nn.Linear(128, n_actions)
        )

    def forward(self, x):
        return self.network(x)
```

### 基于策略的方法（Policy-Based Methods）

直接优化策略函数：

#### REINFORCE（策略梯度）

```
∇J(θ) = E[∇log π(a|s; θ) · G_t]
```

- 直接参数化策略 π(a|s; θ)，通过梯度上升最大化期望回报
- 优点：可处理连续动作空间，策略可学习为随机策略
- 缺点：方差大，收敛慢

#### PPO（Proximal Policy Optimization）

当前最流行的策略梯度算法，兼顾稳定性和效率：

```python
# PPO 核心思想：限制策略更新幅度，避免大步长导致性能崩溃
# 裁剪目标函数：
# L^CLIP(θ) = E[min(r(θ)·A, clip(r(θ), 1-ε, 1+ε)·A)]
# 其中 r(θ) = π_new(a|s) / π_old(a|s) 是概率比率

from stable_baselines3 import PPO

# 使用 Stable Baselines3 训练 PPO
model = PPO(
    policy="MlpPolicy",
    env=env,
    learning_rate=3e-4,
    n_steps=2048,
    batch_size=64,
    n_epochs=10,
    gamma=0.99,
    gae_lambda=0.95,
    clip_range=0.2,
    verbose=1,
)
model.learn(total_timesteps=1_000_000)
```

### Actor-Critic 方法

结合价值方法和策略方法的优点：

- **Actor**（演员）：负责选择动作（策略网络）
- **Critic**（评论家）：负责评估动作好坏（价值网络）
- **优势**：Critic 提供低方差的梯度估计，加速 Actor 学习

常见变体：A2C（Advantage Actor-Critic）、A3C（Asynchronous Advantage Actor-Critic）、SAC（Soft Actor-Critic）、TD3（Twin Delayed DDPG）

### 算法对比

| 算法       | 类型         | 动作空间  | 样本效率 | 稳定性 | 典型应用     |
| ---------- | ------------ | --------- | -------- | ------ | ------------ |
| Q-Learning | Value-Based  | 离散      | 低       | 中     | 简单游戏     |
| DQN        | Value-Based  | 离散      | 中       | 中     | Atari 游戏   |
| REINFORCE  | Policy-Based | 连续/离散 | 低       | 低     | 理论研究     |
| PPO        | Actor-Critic | 连续/离散 | 高       | 高     | 机器人、RLHF |
| SAC        | Actor-Critic | 连续      | 高       | 高     | 机器人控制   |
| DDPG       | Actor-Critic | 连续      | 中       | 低     | 连续控制     |

## RLHF：大语言模型对齐

**基于人类反馈的强化学习**（Reinforcement Learning from Human Feedback，RLHF）是将强化学习应用于大语言模型对齐的关键技术：

### 三阶段流程

```
阶段 1: 监督微调（SFT）
  预训练模型 + 高质量指令数据 → 指令跟随模型

阶段 2: 奖励模型训练（Reward Model）
  人类对多个输出排序 → 训练奖励模型打分

阶段 3: RL 优化（PPO）
  语言模型作为 Agent，奖励模型作为环境 → PPO 优化策略
```

```python
# RLHF 简化流程示意
# 1. 给定 prompt，模型生成 response
# 2. 奖励模型对 response 打分
# 3. PPO 根据奖励信号更新模型参数
# 4. 同时加入 KL 散度惩罚，防止偏离原始模型太远

# 目标函数：
# max E[reward(response) - β · KL(π_new || π_SFT)]
# β 控制偏离原始模型的程度
```

:::warning 注意
RLHF 训练成本高、实现复杂。当前有多种替代方案：

- **DPO**（Direct Preference Optimization）：直接从偏好数据优化，无需奖励模型和 RL
- **ORPO**（Odds Ratio Preference Optimization）：在 SFT 阶段直接融入偏好优化
- **RLAIF**（RL from AI Feedback）：用 AI 替代人类标注，降低标注成本
  :::

## 主流框架与实现

### OpenAI Gym / Gymnasium

强化学习的标准环境接口：

```python
import gymnasium as gym

env = gym.make("CartPole-v1")
state, info = env.reset()

for _ in range(1000):
    action = env.action_space.sample()  # 随机策略
    state, reward, terminated, truncated, info = env.step(action)
    if terminated or truncated:
        break

env.close()
```

### 其他重要框架

- **Stable Baselines3**：基于 PyTorch 的 RL 算法实现，API 友好
- **Ray RLlib**：分布式强化学习框架，适合大规模训练
- **CleanRL**：高质量、单文件的 RL 算法实现，适合学习
- **Tianshou**：字节跳动开源的 RL 框架，基于 PyTorch
- **PettingZoo**：多智能体强化学习环境

## 工程实践

### 调试技巧

强化学习 notoriously 难以调试，以下技巧可帮助定位问题：

1. **从简单环境开始**：先用 CartPole 等简单环境验证算法正确性
2. **监控关键指标**：累积奖励、策略熵、价值损失、梯度范数
3. **确定性测试**：固定随机种子，确保结果可复现
4. **基线对比**：与随机策略或简单启发式策略对比
5. **可视化**：绘制学习曲线、注意力图、策略分布

### 常见陷阱

:::warning 注意

- **奖励设计不当**：奖励函数定义错误会导致智能体学到意外行为（Reward Hacking）
- **训练不稳定**：RL 对学习率、batch size 等超参数极其敏感
- **过拟合环境**：智能体可能记住环境而非学习通用策略
- **评估偏差**：训练期间的评估可能受随机性影响，需多次运行取平均
- **样本效率低**：模型需要大量交互才能学习，仿真环境可加速
  :::

### 超参数调优

| 超参数     | 典型范围    | 影响                        |
| ---------- | ----------- | --------------------------- |
| 学习率     | 1e-5 ~ 1e-3 | 过大导致不稳定，过小收敛慢  |
| 折扣因子 γ | 0.9 ~ 0.999 | 越大越关注长期奖励          |
| 探索率 ε   | 0.01 ~ 0.3  | 影响探索与利用的平衡        |
| Batch Size | 32 ~ 4096   | 大 batch 更稳定但样本效率低 |
| GAE λ      | 0.9 ~ 0.95  | 偏差-方差权衡               |

## 与其他概念的关系

- RL 是 [Agent](/glossary/agent) 自主决策能力的理论基础
- [RLHF](/glossary/alignment) 是 [大语言模型](/glossary/llm) 对齐的核心技术
- [深度学习](/glossary/deep-learning) 与 RL 结合形成深度强化学习（Deep RL）
- RL 与 [规划](/glossary/planning) 结合可提升决策的长远性
- 多智能体 RL（Multi-Agent RL）是 [多智能体系统](/glossary/multi-agent) 的重要方法
- 离线 RL（Offline RL）利用已有数据集学习，无需实时交互

## 延伸阅读

- [Agent](/glossary/agent) — 了解智能体的完整能力栈
- [对齐](/glossary/alignment) — 了解 RLHF 和模型对齐技术
- [大语言模型](/glossary/llm) — 了解 RLHF 的应用场景
- [规划](/glossary/planning) — 了解与 RL 互补的决策方法
- [多智能体](/glossary/multi-agent) — 了解多智能体强化学习
- [Reinforcement Learning: An Introduction](http://incompleteideas.net/book/the-book-2nd.html) — Sutton & Barto 经典教材
- [Spinning Up in Deep RL](https://spinningup.openai.com/) — OpenAI 入门教程
- [CleanRL](https://github.com/vwxyzjn/cleanrl) — 高质量 RL 算法实现
