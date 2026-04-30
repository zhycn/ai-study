---
title: RLVR
description: Reinforcement Learning with Verifiable Rewards，使用可验证奖励信号的强化学习方法
---

# RLVR

让 AI 通过"对答案"来学习的方法。不像人类反馈那样主观，RLVR 用数学题的标准答案、代码的测试用例通过率等客观标准来给模型打分，训练信号更干净、更可靠。就像学生做题后直接看标准答案，而不是等老师主观评分。

## 概述

**RLVR**（Reinforcement Learning with Verifiable Rewards，可验证奖励强化学习）是一种使用**客观可验证信号**作为奖励的强化学习方法。与传统 RLHF 依赖人类主观偏好标注不同，RLVR 利用数学答案正确性、代码执行通过率、逻辑推理可验证性等确定性信号来优化模型。

RLVR 的核心优势在于奖励信号的**确定性**和**可扩展性**：

- **确定性**：答案对错是客观事实，不依赖标注者主观判断
- **可扩展性**：自动验证无需人工标注，可以大规模生成训练数据
- **低成本**：相比人类标注，自动验证的成本几乎为零
- **高质量**：避免人类标注中的噪声和不一致性

```
RLVR vs RLHF 奖励信号对比:

RLHF:
  人类标注偏好 → 训练奖励模型 → 主观评分
  问题：标注成本高、一致性差、奖励模型可能学偏

RLVR:
  客观验证规则 → 直接计算奖励 → 确定性评分
  优势：零人工成本、100% 一致、无奖励模型偏差
```

::: tip
RLVR 不是要替代 RLHF，而是互补。RLVR 适用于有明确正确答案的任务（数学、代码、逻辑推理），RLHF 适用于开放性任务（创意写作、对话）。两者结合可以覆盖更广泛的应用场景。
:::

## 为什么值得关注

- **DeepSeek-R1 验证**：DeepSeek-R1 论文证明纯 RLVR 可以涌现出强大的推理能力，无需 SFT 预热
- **成本优势**：相比 RLHF 的人类标注，RLVR 的自动验证成本降低数个数量级
- **数据可扩展**：可以自动生成海量高质量训练数据，突破人类标注的规模瓶颈
- **奖励黑客免疫**：客观验证信号难以被模型"欺骗"，避免 Reward Hacking 问题
- **推理能力突破**：在数学、代码、科学推理等任务上展现出超越 RLHF 的效果
- **简化训练流程**：无需训练奖励模型，无需复杂的 PPO 实现，训练更稳定

::: warning
RLVR 的适用范围有限。它只适用于有明确验证标准的任务。对于开放性问题（如"写一篇好文章"），仍然需要 RLHF 或其他基于人类偏好的方法。
:::

## 核心原理

### 可验证奖励的定义

可验证奖励（Verifiable Reward）是指可以通过确定性规则自动计算的奖励信号：

```python
# 可验证奖励的核心特征
class VerifiableReward:
    def __init__(self):
        self.properties = {
            "deterministic": True,      # 相同输入总是产生相同奖励
            "objective": True,          # 不依赖主观判断
            "computable": True,         # 可以自动计算
            "scalable": True,           # 可以大规模应用
        }

    def compute(self, response, ground_truth) -> float:
        """计算奖励：0 或 1（或连续值）"""
        raise NotImplementedError
```

### 奖励信号类型

| 奖励类型 | 英文 | 验证方式 | 示例 |
|----------|------|----------|------|
| **精确匹配** | Exact Match | 字符串比较 | 数学题答案 `42` |
| **执行验证** | Execution-based | 运行代码/程序 | 代码通过单元测试 |
| **规则验证** | Rule-based | 逻辑规则检查 | 格式正确、约束满足 |
| **外部工具** | Tool-based | 调用验证器/API | 定理证明器、求解器 |
| **自一致性** | Self-consistency | 多次采样一致性 | 多次推理结果一致 |

### 数学框架

RLVR 的目标函数与标准 RL 相同，但奖励函数有特殊结构：

```
目标：max E_{π}[R(x, y) - β·KL(π || π_ref)]

其中：
- x: 输入（问题/指令）
- y: 模型输出
- R(x, y): 可验证奖励函数
- π_ref: 参考策略（防止偏离太远）
- β: KL 惩罚系数

关键区别：R(x, y) 是确定性函数，而非学习的奖励模型
```

```python
# RLVR 奖励函数示例
def math_reward(response: str, answer: str) -> float:
    """数学题奖励：提取答案并比较"""
    extracted = extract_final_answer(response)
    return 1.0 if normalize(extracted) == normalize(answer) else 0.0

def code_reward(response: str, test_cases: list) -> float:
    """代码奖励：运行测试用例"""
    try:
        code = extract_code_block(response)
        passed = sum(run_test(code, tc) for tc in test_cases)
        return passed / len(test_cases)  # 返回通过率
    except Exception:
        return 0.0
```

## 技术方法

### GRPO（Group Relative Policy Optimization）

DeepSeek-R1 使用的核心算法，是 PPO 的简化变体：

```python
# GRPO 核心思想：同组样本的相对优势
def grpo_advantage(rewards: list[float], index: int) -> float:
    """计算组内相对优势"""
    mean_reward = sum(rewards) / len(rewards)
    std_reward = (sum((r - mean_reward)**2 for r in rewards) / len(rewards)) ** 0.5
    if std_reward < 1e-8:
        return 0.0
    return (rewards[index] - mean_reward) / std_reward

# GRPO 相比 PPO 的优势：
# 1. 无需价值网络（Value Network）
# 2. 用组内均值替代价值估计
# 3. 实现更简单，训练更稳定
```

::: info
GRPO 的关键创新：对同一个问题采样多个输出，用这些输出的平均奖励作为基线（Baseline），计算每个输出的相对优势。这避免了 PPO 中需要额外训练价值网络的复杂度。
:::

### 训练流程

```
RLVR 训练流程（以 DeepSeek-R1 为例）:

阶段 1: 数据准备
├── 收集可验证问题（数学题、代码题、逻辑题）
├── 准备标准答案/测试用例
└── 构建提示词模板

阶段 2: 强化学习训练
├── 对每个问题采样 G 个输出（G 通常为 4-16）
├── 用验证器计算每个输出的奖励
├── 计算组内相对优势（GRPO）
├── 更新策略模型（PPO 风格裁剪）
└── 加入 KL 惩罚，防止偏离参考模型

阶段 3: 迭代优化
├── 定期评估验证集性能
├── 调整超参数（学习率、KL 系数、采样数）
└── 持续训练直到收敛
```

```python
# RLVR 训练循环简化版
class RLVRTrainer:
    def __init__(self, model, ref_model, verifier, beta=0.04):
        self.model = model          # 策略模型
        self.ref_model = ref_model  # 参考模型（固定）
        self.verifier = verifier    # 验证器
        self.beta = beta            # KL 惩罚系数

    def train_step(self, batch: list[dict]):
        """单步训练"""
        all_losses = []

        for item in batch:
            prompt = item["prompt"]
            ground_truth = item["answer"]

            # 采样 G 个输出
            outputs = [self.model.sample(prompt) for _ in range(G)]

            # 计算奖励
            rewards = [
                self.verifier.verify(out, ground_truth)
                for out in outputs
            ]

            # 计算优势（GRPO）
            advantages = compute_group_advantages(rewards)

            # 计算损失
            for i, (output, adv) in enumerate(zip(outputs, advantages)):
                log_prob = self.model.log_prob(prompt, output)
                ref_log_prob = self.ref_model.log_prob(prompt, output)
                kl = log_prob - ref_log_prob

                # PPO 裁剪 + KL 惩罚
                ratio = torch.exp(log_prob - old_log_probs[i])
                clipped_ratio = torch.clamp(ratio, 1 - eps, 1 + eps)
                loss = -min(ratio * adv, clipped_ratio * adv) + self.beta * kl

                all_losses.append(loss)

        # 反向传播
        sum(all_losses).backward()
        optimizer.step()
```

### 答案提取与规范化

RLVR 的关键挑战是从模型输出中正确提取答案：

```python
import re

def extract_math_answer(response: str) -> str:
    """从数学推理中提取最终答案"""
    # 匹配 \boxed{...} 格式
    boxed = re.search(r'\\boxed\{(.+?)\}', response)
    if boxed:
        return boxed.group(1).strip()

    # 匹配"答案是 X"格式
    patterns = [
        r'答案是[：:]?\s*(.+?)[。\n]',
        r'the\s+answer\s+is[：:]?\s*(.+?)[。\n]',
        r'最终答案[：:]?\s*(.+?)[。\n]',
    ]
    for pattern in patterns:
        match = re.search(pattern, response, re.IGNORECASE)
        if match:
            return match.group(1).strip()

    # 回退：取最后一个数字
    numbers = re.findall(r'-?\d+\.?\d*', response)
    return numbers[-1] if numbers else ""

def normalize_answer(answer: str) -> str:
    """规范化答案用于比较"""
    answer = answer.lower().strip()
    answer = re.sub(r'[,，\s]+', '', answer)  # 移除分隔符
    answer = re.sub(r'\\frac\{(\d+)\}\{(\d+)\}', r'\1/\2', answer)  # 分数
    return answer
```

### 代码验证

```python
import subprocess
import tempfile

def verify_code(solution: str, test_cases: list[dict]) -> dict:
    """验证代码解决方案"""
    code = extract_code_block(solution)
    if not code:
        return {"passed": 0, "total": len(test_cases), "score": 0.0}

    passed = 0
    for tc in test_cases:
        try:
            # 在沙箱中执行
            result = run_in_sandbox(code, tc["input"])
            if result == tc["expected"]:
                passed += 1
        except Exception:
            pass  # 执行失败视为未通过

    return {
        "passed": passed,
        "total": len(test_cases),
        "score": passed / len(test_cases),
    }

def run_in_sandbox(code: str, input_data: str, timeout: int = 5) -> str:
    """在沙箱中安全执行代码"""
    with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=True) as f:
        f.write(code + f"\nprint(solution({input_data}))")
        f.flush()
        result = subprocess.run(
            ['python', f.name],
            capture_output=True, text=True, timeout=timeout
        )
        return result.stdout.strip()
```

### 关键超参数

| 超参数 | 符号 | 典型值 | 影响 |
|--------|------|--------|------|
| **KL 惩罚系数** | β | 0.01-0.1 | 控制偏离参考模型的程度 |
| **采样数** | G | 4-16 | 每组采样输出数量，影响优势估计质量 |
| **裁剪范围** | ε | 0.1-0.3 | PPO 裁剪范围，影响更新步长 |
| **学习率** | α | 1e-6-1e-5 | 策略更新速度 |
| **温度** | T | 0.7-1.0 | 采样多样性，过高导致无效输出 |

## 行业规范与法规

### 研究伦理

RLVR 训练涉及的研究伦理考量：

- **数据来源**：数学题、代码题等训练数据的版权和许可
- **验证公平性**：确保验证器对不同语言、文化背景的问题无偏见
- **能力评估**：避免仅用可验证任务评估模型整体能力

### 安全考量

::: warning
RLVR 训练出的模型虽然在可验证任务上表现优异，但在开放性任务上可能缺乏安全对齐。建议将 RLVR 与 RLHF 或 Constitutional AI 结合使用，确保模型在推理能力增强的同时保持安全可控。
:::

- **能力-安全平衡**：RLVR 专注于能力提升，安全对齐需要额外步骤
- **验证器安全**：验证器本身可能被对抗性输入攻击
- **沙箱逃逸**：代码验证需要严格的沙箱隔离

### 行业标准

| 标准/框架 | 相关内容 |
|-----------|----------|
| **MLCommons** | 模型推理能力基准测试（包含数学、代码） |
| **BIG-bench** | 包含可验证推理任务的基准 |
| **OpenCompass** | 综合模型评估平台，支持可验证任务 |
| **LiveCodeBench** | 实时代码能力评估基准 |

## 未来趋势

### 验证信号扩展

RLVR 的验证信号正在从简单的对错判断向更复杂的方向扩展：

- **部分正确性**：不仅判断对错，还评估推理步骤的正确性
- **过程奖励**（Process Reward）：对推理过程中的每一步给予奖励
- **多粒度验证**：从答案级验证到步骤级、逻辑级验证
- **形式化验证**：使用定理证明器验证数学推理的严格性

### 自我改进循环

```
自我改进训练循环:

模型生成答案 → 验证器评分 → 模型更新 → 生成更难问题的答案
                    ↑                              ↓
                    └──── 模型自己生成训练数据 ←────┘
```

- **自我训练**（Self-training）：模型生成数据，验证器筛选，再训练自己
- **课程学习**（Curriculum Learning）：从简单到难自动调整训练数据难度
- **能力涌现**：随着训练进行，模型可能涌现出训练数据中未直接教授的能力

### 与 SFT 的关系

DeepSeek-R1-Zero 的发现引发了对 SFT 必要性的重新思考：

- **零 SFT 训练**：直接从基座模型开始 RLVR 训练，无需 SFT 预热
- **SFT + RLVR**：SFT 提供基础能力，RLVR 进一步提升推理质量
- **混合策略**：对不同类型任务采用不同策略

### 多模态 RLVR

- **视觉推理**：几何题、图表分析的自动验证
- **多模态代码**：生成带 UI 的代码并自动测试
- **科学实验**：模拟实验环境，验证科学推理

### 与其他对齐方法的融合

```
未来对齐架构:

基座模型
    │
    ├── SFT（可选）→ 基础指令跟随
    │
    ├── RLVR → 推理能力提升（数学、代码、逻辑）
    │
    └── RLHF/Constitutional AI → 安全对齐、价值观对齐
            │
            ↓
        对齐完成的模型
```

## 与其他概念的关系

- [强化学习](/glossary/reinforcement-learning) 是 RLVR 的理论基础
- [对齐](/glossary/alignment) 中的 RLHF 是 RLVR 的对比方法
- [Agent](/glossary/agent) 的工具调用结果可作为 RLVR 的验证信号
- [思维链](/glossary/chain-of-thought) 是 RLVR 训练出的重要能力
- [基准测试](/glossary/benchmark) 提供 RLVR 所需的验证数据集
- [模型评估](/glossary/model-evaluation) 衡量 RLVR 训练效果

## 延伸阅读

- [强化学习](/glossary/reinforcement-learning) — RLVR 的理论基础
- [对齐](/glossary/alignment) — RLHF 与 RLVR 的对比
- [思维链](/glossary/chain-of-thought) — RLVR 训练出的推理能力
- [Agent](/glossary/agent) — 工具调用与可验证奖励
- [DeepSeek-R1 论文](https://github.com/deepseek-ai/DeepSeek-R1) — RLVR 的里程碑工作
- [GRPO 算法详解](https://arxiv.org/abs/2402.03300) — Group Relative Policy Optimization
- [Process Reward Model](https://arxiv.org/abs/2312.08935) — 过程奖励模型
- [Let's Verify Step by Step](https://arxiv.org/abs/2309.11495) — 逐步验证方法
