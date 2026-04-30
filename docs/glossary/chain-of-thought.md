---
title: 思维链
description: Chain of Thought (CoT)，引导模型逐步推理的技术
---

# 思维链

让 AI "把解题步骤一步步写出来"的技巧。就像数学考试要求写过程一样，让 AI 先推理再给答案，准确率会大幅提升。特别是对付复杂的逻辑题、数学题，"慢慢想"比"直接猜"靠谱得多。

## 概述

思维链（Chain of Thought，CoT）是一种 [提示词工程](/glossary/prompt-engineering) 技术，通过引导模型展示逐步推理过程，显著提升其在数学推理、逻辑分析、复杂问题解决等任务上的表现。

思维链的核心理念是：让模型"把思考过程说出来"。就像人类在解决复杂问题时会逐步推导一样，CoT 让模型在给出最终答案之前，先生成中间推理步骤。

## 为什么重要

- **推理能力飞跃**：在数学、逻辑推理任务上，CoT 可将准确率提升 20-50%
- **可解释性**：展示推理过程，帮助开发者理解和调试模型行为
- **错误定位**：通过检查推理步骤，可以精确定位模型在哪一步出错
- **零成本提升**：无需额外训练，仅通过改变提示方式即可提升性能

::: tip
2022 年 Google 的研究发现，仅通过在提示中添加"Let's think step by step"（让我们一步步思考），大语言模型在 GSM8K 数学基准上的准确率就从 17.9% 提升到 54.3%。
:::

## 核心技术原理

### 零样本 CoT（Zero-Shot CoT）

最简单的方式是在提示末尾添加触发语：

```python
ZERO_SHOT_COT_PROMPT = """问题：一个商店有 23 个苹果。如果他们用了 20 个做午餐，
然后又买了 6 个，他们有多少个苹果？

让我们一步步思考。"""

# 模型输出示例:
# 1. 商店最初有 23 个苹果
# 2. 用了 20 个做午餐，剩下 23 - 20 = 3 个
# 3. 又买了 6 个，现在有 3 + 6 = 9 个
# 答案是 9 个苹果。
```

常见的零样本触发语：

- "让我们一步步思考"
- "请逐步解释你的推理过程"
- "先分析再给出答案"

### Few-shot CoT

提供包含推理步骤的示例：

```python
FEW_SHOT_COT_PROMPT = """问题：罗杰有 5 个网球。他又买了 2 罐网球，每罐 3 个。
他现在有多少个网球？
解答：罗杰最初有 5 个网球。2 罐 x 每罐 3 个 = 6 个网球。
5 + 6 = 11。答案是 11。

问题：自助餐厅有 23 个苹果。如果他们用了 20 个做午餐，
然后又买了 6 个，他们有多少个苹果？
解答："""

# 模型输出:
# 自助餐厅最初有 23 个苹果。用了 20 个后剩下 23 - 20 = 3 个。
# 又买了 6 个，现在有 3 + 6 = 9 个。答案是 9。
```

### Self-Consistency（自洽性）

生成多个推理路径，选择最一致的答案：

```python
def self_consistency(prompt, model, n_paths=5):
    """自洽性解码"""
    answers = []
    for _ in range(n_paths):
        # 使用非零温度生成多样化推理
        response = model.generate(
            prompt,
            temperature=0.7,  # 增加多样性
            max_tokens=1000
        )
        # 提取最终答案
        answer = extract_answer(response)
        answers.append(answer)

    # 选择出现最多的答案
    from collections import Counter
    most_common = Counter(answers).most_common(1)[0]
    return most_common[0], most_common[1] / n_paths  # 答案, 置信度
```

::: info
自洽性通过多次采样增加找到正确推理路径的概率，但代价是更高的计算成本（n 倍 Token 消耗）。
:::

### Tree of Thoughts（思维树）

将 CoT 扩展为树状搜索结构，在每一步评估多个可能的推理方向：

```text
问题: "用 3, 3, 8, 8 通过四则运算得到 24"

根节点
├── 8 / 3 = 2.67 ... [评估: 不接近 24, 剪枝]
├── 8 * 3 = 24 ... [评估: 已得到 24! 但还剩 3, 8 未使用]
└── 8 / (3 - 8/3) = 24 ... [评估: 有效解!]
    └── 答案: 8 / (3 - 8/3) = 8 / (1/3) = 24 ✓
```

## 应用场景

### 数学推理

```python
MATH_COT_PROMPT = """请解决以下数学问题，展示完整的推理过程：

问题：计算 ∫₀¹ x² dx

解答步骤：
1. 首先，识别这是一个定积分问题
2. 求原函数：∫x²dx = x³/3 + C
3. 应用牛顿-莱布尼茨公式：F(1) - F(0)
4. F(1) = 1³/3 = 1/3
5. F(0) = 0³/3 = 0
6. 结果：1/3 - 0 = 1/3

答案：1/3"""
```

### 代码调试

```python
DEBUG_COT_PROMPT = """分析以下代码中的 bug，逐步推理问题所在：

def find_max(numbers):
    max_num = 0
    for num in numbers:
        if num > max_num:
            max_num = num
    return max_num

# 测试: find_max([-5, -3, -1]) 返回 0，但应该返回 -1

请逐步分析：
1. 代码的意图是什么？
2. 实际行为是什么？
3. 差异在哪里？
4. 如何修复？"""
```

### 逻辑推理

```python
LOGIC_COT_PROMPT = """解决以下逻辑谜题：

有 A、B、C 三个人，其中一人总是说真话，一人总是说假话，
一人有时说真话有时说假话。

A 说："B 总是说真话。"
B 说："C 有时说真话有时说假话。"
C 说："A 总是说假话。"

请逐步推理每个人的身份。"""
```

## 工程实践

### CoT 提示模板

```python
class CoTPromptBuilder:
    """思维链提示构建器"""

    def __init__(self, task_type="general"):
        self.task_type = task_type
        self.templates = {
            "math": "请逐步解决以下数学问题，展示每一步的计算过程：\n\n问题：{question}\n\n解答：",
            "code": "请分析以下代码问题，逐步推理解决方案：\n\n问题：{question}\n\n分析：",
            "logic": "请逐步推理以下逻辑问题：\n\n问题：{question}\n\n推理过程：",
            "general": "请逐步思考以下问题：\n\n问题：{question}\n\n让我们一步步思考：",
        }

    def build(self, question):
        template = self.templates.get(self.task_type, self.templates["general"])
        return template.format(question=question)

# 使用示例
builder = CoTPromptBuilder(task_type="math")
prompt = builder.build("计算 15% of 200")
```

### 提取推理步骤

```python
import re

def extract_reasoning_steps(response):
    """从 CoT 响应中提取推理步骤"""
    # 匹配数字步骤标记
    steps = re.split(r'(?=\d+\.\s)', response)
    steps = [s.strip() for s in steps if s.strip()]

    # 提取最终答案
    answer_match = re.search(r'答案[：:]\s*(.+)', response)
    answer = answer_match.group(1) if answer_match else None

    return {
        "steps": steps,
        "answer": answer,
        "num_steps": len(steps)
    }

# 示例
response = """1. 首先计算 15% = 0.15
2. 然后 0.15 × 200 = 30
答案：30"""

result = extract_reasoning_steps(response)
# {'steps': ['首先计算 15% = 0.15', '然后 0.15 × 200 = 30'], 'answer': '30', 'num_steps': 2}
```

### 与 RAG 结合

```python
def rag_with_cot(query, knowledge_base):
    """结合 RAG 和 CoT 的回答生成"""
    # 1. 检索相关知识
    context = retrieve(query, knowledge_base)

    # 2. 构建 CoT 提示
    prompt = f"""基于以下信息，逐步推理并回答问题：

相关信息：
{context}

问题：{query}

请逐步推理："""

    # 3. 生成回答
    return generate(prompt, temperature=0.3)  # 低温度保证推理一致性
```

::: warning
CoT 会显著增加 Token 消耗，因为模型需要生成完整的推理过程。在成本敏感的场景中，可以考虑仅在复杂任务中启用 CoT，或在获取推理后仅返回最终答案给用户。
:::

## 与其他概念的关系

- CoT 依赖 [注意力机制](/glossary/attention) 在推理步骤间传递信息
- 是 [提示词工程](/glossary/prompt-engineering) 的高级技术
- 推理过程需要足够的 [上下文窗口](/glossary/context-window) 空间
- 通常使用较低的 [温度](/glossary/temperature) 保证推理一致性
- 推理步骤可用于检测和减少 [幻觉](/glossary/hallucination)

## 延伸阅读

- [注意力机制](/glossary/attention) — CoT 推理的底层机制
- [提示词工程](/glossary/prompt-engineering) — CoT 所属的更大技术范畴
- [上下文窗口](/glossary/context-window) — 推理步骤需要足够的上下文空间
- [温度](/glossary/temperature) — 推理任务的温度设置建议
- [幻觉](/glossary/hallucination) — CoT 如何帮助减少幻觉
- [Chain of Thought Prompting Elicits Reasoning](https://arxiv.org/abs/2201.11903) — CoT 原始论文
- [Tree of Thoughts](https://arxiv.org/abs/2305.10601) — 思维树扩展
