---
title: 基准测试
description: Benchmark，评估模型能力的标准测试
---

# 基准测试

## 概述

基准测试（Benchmark）是用于评估 AI 模型能力的标准化测试集和评估方法。通过在统一的数据集和评估协议下测试，可以客观比较不同模型在各种任务上的性能表现。

基准测试是 AI 领域进步的"标尺"。没有统一的基准，就无法判断模型是否在真正进步，也无法为特定场景选择合适的模型。

## 为什么重要

- **性能评估**：客观量化模型在各项任务上的能力水平
- **模型选择**：帮助开发者根据任务需求选择最合适的模型
- **迭代优化**：为模型研发提供明确的改进方向和目标
- **行业标准**：建立社区共识，推动技术公平竞争
- **透明度**：让非技术用户也能理解模型能力

::: tip
模型在基准测试上的表现并非绝对真理。"Goodhart 定律"指出：当一个指标成为目标时，它就不再是好指标。过度优化基准分数可能导致"基准过拟合"（Benchmark Overfitting）。
:::

## 常见基准测试

### 综合能力基准

| 基准 | 全称 | 任务类型 | 题目数 | 评估方式 |
|------|------|----------|--------|----------|
| **MMLU** | Massive Multitask Language Understanding | 57 个学科的多选题 | 14,042 | 准确率 |
| **AGIEval** | AGI Evaluation | 标准化考试（SAT、LSAT 等） | 4,548 | 准确率 |
| **C-Eval** | Chinese Evaluation | 中文多学科测试 | 13,487 | 准确率 |
| **CMMLU** | Chinese MMLU | 中文版 MMLU | 11,814 | 准确率 |

### 推理能力基准

| 基准 | 全称 | 任务类型 | 题目数 | 评估方式 |
|------|------|----------|--------|----------|
| **GSM8K** | Grade School Math 8K | 小学数学应用题 | 8,792 | 精确匹配 |
| **MATH** | Mathematics Aptitude Test | 高中到大学数学 | 12,500 | 精确匹配 |
| **BBH** | Big-Bench Hard | 23 个困难推理任务 | 6,511 | 准确率 |
| **ARC** | AI2 Reasoning Challenge | 科学推理题 | 7,787 | 准确率 |

### 代码能力基准

| 基准 | 全称 | 任务类型 | 题目数 | 评估方式 |
|------|------|----------|--------|----------|
| **HumanEval** | Human Evaluation | Python 函数补全 | 164 | pass@1 |
| **MBPP** | Mostly Basic Python Problems | Python 编程题 | 974 | pass@1 |
| **LiveCodeBench** | Live Code Benchmark | 实时编程竞赛题 | 持续更新 | pass@1 |
| **SWE-bench** | Software Engineering Bench | 真实 GitHub Issue | 2,294 | Issue 解决率 |

### 安全与对齐基准

| 基准 | 全称 | 任务类型 | 评估方式 |
|------|------|----------|----------|
| **TruthfulQA** | Truthful Question Answering | 检测模型是否生成虚假信息 | 准确率 × 信息量 |
| **RealToxicityPrompts** | Real Toxicity Prompts | 测量生成内容的毒性 | 毒性分数 |
| **BBQ** | Bias Benchmark for QA | 检测社会偏见 | 偏见分数 |
| **XSTest** | eXplanation Safety Test | 测试安全拒绝行为 | 假阳性/假阴性率 |

## 评估指标

### pass@k

代码生成任务的核心指标，表示 k 次尝试中至少有一次通过测试的概率：

```python
import numpy as np
from math import comb

def pass_at_k(n, c, k):
    """
    计算 pass@k
    n: 总生成样本数
    c: 通过测试的样本数
    k: 尝试次数
    """
    if n - c < k:
        return 1.0
    return 1.0 - comb(n - c, k) / comb(n, k)

# 示例: 生成 10 个代码样本，6 个通过测试
n, c = 10, 6
print(f"pass@1: {pass_at_k(n, c, 1):.3f}")  # 0.600
print(f"pass@10: {pass_at_k(n, c, 10):.3f}") # 0.986
```

### 精确匹配（Exact Match）

生成答案与标准答案完全一致的比例：

```python
def exact_match(prediction, reference):
    """精确匹配评估"""
    return normalize(prediction) == normalize(reference)

def normalize(text):
    """标准化文本"""
    import re
    text = text.lower().strip()
    text = re.sub(r'[^\w\s]', '', text)  # 移除标点
    return text

# 示例
print(exact_match("42", "42"))       # True
print(exact_match("42.0", "42"))     # True (标准化后)
print(exact_match("the answer is 42", "42"))  # False
```

### 基于 LLM 的评估

使用更强的模型评估生成质量：

```python
LLM_JUDGE_PROMPT = """请评估以下回答的质量：

问题：{question}
参考回答：{reference}
模型回答：{prediction}

请从以下维度评分（1-5 分）：
1. 准确性：回答是否正确
2. 完整性：是否覆盖了问题的所有方面
3. 清晰度：表达是否清晰易懂
4. 相关性：是否直接回答了问题

请给出每个维度的分数和简短理由。"""
```

::: warning
LLM 作为评估器存在偏差：倾向于给自己同架构的模型更高分数。建议使用多个评估器或人工评估交叉验证。
:::

## 工程实践

### 本地基准测试

```python
class BenchmarkRunner:
    """基准测试运行器"""

    def __init__(self, model, benchmark_name):
        self.model = model
        self.benchmark_name = benchmark_name
        self.results = []

    def run(self, dataset, prompt_template):
        """运行基准测试"""
        for item in dataset:
            prompt = prompt_template.format(
                question=item["question"],
                options=item.get("options", "")
            )

            response = self.model.generate(
                prompt,
                temperature=0.0,  # 基准测试使用零温度
                max_tokens=100
            )

            prediction = extract_answer(response)
            is_correct = prediction == item["answer"]

            self.results.append({
                "question_id": item["id"],
                "prediction": prediction,
                "correct": is_correct
            })

        return self.compute_metrics()

    def compute_metrics(self):
        """计算评估指标"""
        total = len(self.results)
        correct = sum(1 for r in self.results if r["correct"])
        accuracy = correct / total if total > 0 else 0

        return {
            "benchmark": self.benchmark_name,
            "accuracy": accuracy,
            "correct": correct,
            "total": total
        }
```

### 基准测试报告

```python
def generate_report(results):
    """生成基准测试报告"""
    print("=" * 60)
    print("模型基准测试报告")
    print("=" * 60)

    for result in results:
        print(f"\n{result['benchmark']}:")
        print(f"  准确率: {result['accuracy']:.1%}")
        print(f"  正确: {result['correct']}/{result['total']}")

    # 计算平均分
    avg_accuracy = np.mean([r['accuracy'] for r in results])
    print(f"\n平均准确率: {avg_accuracy:.1%}")
    print("=" * 60)

# 示例输出:
# ============================================================
# 模型基准测试报告
# ============================================================
#
# MMLU:
#   准确率: 86.4%
#   正确: 12127/14042
#
# GSM8K:
#   准确率: 92.1%
#   正确: 8098/8792
#
# HumanEval:
#   准确率: 87.8%
#   正确: 144/164
#
# 平均准确率: 88.8%
# ============================================================
```

### 避免基准过拟合

```python
# 使用隔离的测试集
def setup_benchmark_evaluation():
    """设置防过拟合的评估流程"""
    return {
        "development_set": "用于调试和开发",
        "validation_set": "用于超参数选择",
        "test_set": "仅在最终评估时使用，严格隔离",
        "holdout_set": "完全保密，仅用于最终发布",
    }

# 建议:
# 1. 开发阶段只用 development set
# 2. 调参使用 validation set
# 3. test set 仅在模型最终确定后评估一次
# 4. holdout set 由第三方保管，用于公开发布
```

## 基准测试的局限性

### 数据污染（Data Contamination）

模型可能在预训练时已经见过测试数据：

```
问题: 测试集中的题目出现在训练数据中
后果: 模型"记住"了答案，而非真正学会了解决问题
检测: 使用新收集的、模型训练后产生的数据
```

### 评估偏差

不同评估方法可能导致不同结论：

```
同一模型:
- 严格精确匹配: 75%
- 宽松匹配(允许同义词): 82%
- LLM 评估: 88%
- 人工评估: 85%
```

### 能力覆盖不全

基准测试无法覆盖所有实际使用场景：

```
基准测试覆盖:
✓ 知识问答
✓ 数学推理
✓ 代码生成
✗ 长文档理解
✗ 多轮对话连贯性
✗ 工具使用能力
✗ 创造性任务
```

## 与其他概念的关系

- 基准测试评估 [大语言模型](/glossary/llm) 的综合能力
- [对齐](/glossary/alignment) 效果通过安全基准测试衡量
- [幻觉](/glossary/hallucination) 率是 TruthfulQA 等基准的核心指标
- [思维链](/glossary/chain-of-thought) 在 GSM8K、MATH 等推理基准上效果显著
- 基准测试通常使用 [温度](/glossary/temperature) = 0 以确保可复现性

## 延伸阅读

- [大语言模型](/glossary/llm) — 基准测试的主要评估对象
- [对齐](/glossary/alignment) — 安全基准测试评估对齐效果
- [幻觉](/glossary/hallucination) — TruthfulQA 等基准检测幻觉
- [思维链](/glossary/chain-of-thought) — CoT 在推理基准上的表现
- [温度](/glossary/temperature) — 基准测试中的温度控制
- [MMLU 论文](https://arxiv.org/abs/2009.03300) — MMLU 基准介绍
- [HumanEval 论文](https://arxiv.org/abs/2107.03374) — 代码评估基准
- [Open LLM Leaderboard](https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard) — HuggingFace 开源模型排行榜
