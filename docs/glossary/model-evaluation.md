---
title: 模型评估
description: Model Evaluation，评估模型性能的方法论
---

# 模型评估

给 AI 模型"体检打分"的系统方法。不是凭感觉说"这个模型好"，而是用科学的测试题目、评分标准来客观衡量它到底多聪明、多靠谱，帮你选对模型或者发现问题在哪。

## 概述

模型评估（Model Evaluation）是系统性地衡量 AI 模型性能的方法论与实践体系，涵盖评估指标设计、测试集构建、评估流程执行、结果分析与报告生成等完整环节。

在 AI 工程化落地过程中，模型评估是连接模型研发与生产部署的关键桥梁。无论是选择预训练模型、微调后的模型，还是对比不同供应商的 API，都需要依赖科学的评估体系来做出决策。

模型评估不同于 [基准测试](/glossary/benchmark)——基准测试是标准化的公开测试集，而模型评估更强调针对具体业务场景定制评估方案。

## 为什么重要

- **性能量化**：将主观的"模型好不好"转化为客观的可度量指标，消除直觉偏差
- **模型选择**：为特定应用场景选择最合适的模型，避免"大材小用"或"力不从心"
- **迭代依据**：指导模型优化方向，明确哪些维度需要改进、哪些已经达标
- **质量保证**：确保上线模型满足业务需求，防止性能回退（Regression）
- **成本控制**：评估性能与成本的平衡点，找到性价比最优的方案
- **风险管控**：提前发现模型在边界场景、对抗输入下的脆弱性

::: tip
模型评估应该贯穿整个 AI 应用生命周期：选型阶段做横向对比，开发阶段做回归测试，上线后做持续监控。评估不是一次性工作，而是持续的过程。
:::

## 核心评估维度

### 准确性指标

准确性是模型评估最基础的维度，但不同类型的任务需要不同的准确性度量：

| 任务类型 | 评估指标                   | 说明                           |
| -------- | -------------------------- | ------------------------------ |
| 分类任务 | 准确率、精确率、召回率、F1 | 衡量分类正确性                 |
| 生成任务 | BLEU、ROUGE、METEOR        | 衡量生成文本与参考文本的相似度 |
| 问答任务 | Exact Match、F1            | 衡量答案是否精确匹配           |
| 代码生成 | pass@k                     | k 次尝试中通过测试的比例       |
| 排序任务 | NDCG、MRR                  | 衡量排序质量                   |

### 语义质量指标

传统 n-gram 匹配指标（如 BLEU）无法捕捉语义层面的质量，需要引入更高级的评估方法：

- **BERTScore**：利用预训练语言模型的上下文表示计算语义相似度
- **LLM-as-a-Judge**：使用更强的 LLM 评估生成质量，支持多维度评分
- **人类评估**：最终的质量标准，但成本高、耗时长

```python
# LLM-as-a-Judge 评估示例
JUDGE_PROMPT = """作为公正的评估者，请对以下模型回答进行评分：

问题：{question}
参考回答：{reference}
模型回答：{prediction}

请从以下维度评分（1-5 分）：
1. 准确性：回答是否正确、无事实错误
2. 完整性：是否覆盖了问题的所有方面
3. 有用性：回答是否对用户有实际帮助
4. 安全性：是否包含有害或不当内容

请以 JSON 格式输出评分和理由。"""
```

::: warning
LLM-as-a-Judge 存在位置偏差（倾向于第一个回答）和自偏好偏差（倾向于与自己相似的模型）。建议多次评估取平均，或使用多个不同的裁判模型。
:::

### 效率指标

在生产环境中，效率往往与准确性同等重要：

- **TTFT（Time to First Token）**：从发送请求到收到第一个 Token 的时间，直接影响用户感知
- **TPS（Tokens Per Second）**：Token 生成速度，影响长文本输出的流畅度
- **端到端延迟**：完整请求-响应周期的时间
- **吞吐量**：单位时间内处理的请求数
- **资源消耗**：GPU 显存、CPU 使用率、内存占用

### 安全与鲁棒性指标

- **对抗鲁棒性**：面对对抗性输入时的表现稳定性
- **提示注入抵抗**：抵抗 [提示注入](/glossary/prompt-injection) 攻击的能力
- **内容安全**：生成有害内容的比例
- **偏见检测**：是否存在性别、种族、文化等方面的偏见

## 主流评估框架

### [RAGAS](https://docs.ragas.io/)

RAGAS（Retrieval-Augmented Generation Assessment）是专为 RAG 系统设计的评估框架：

```python
from ragas import evaluate
from ragas.metrics import faithfulness, answer_relevancy, context_precision

# 评估 RAG 系统
result = evaluate(
    dataset=evaluation_dataset,
    metrics=[faithfulness, answer_relevancy, context_precision]
)

print(result)
# 输出各指标的分数
```

核心指标：

- **Faithfulness（忠实度）**：答案是否忠实于检索到的上下文
- **Answer Relevancy（答案相关性）**：答案是否直接回答问题
- **Context Precision（上下文精确度）**：检索结果中有多少是相关的
- **Context Recall（上下文召回率）**：检索结果覆盖了多少正确答案

### [DeepEval](https://docs.confident-ai.com/)

DeepEval 是 Python 编写的单元测试风格的 LLM 评估框架：

```python
from deepeval import assert_test
from deepeval.test_case import LLMTestCase
from deepeval.metrics import AnswerRelevancyMetric, FaithfulnessMetric

# 定义测试用例
test_case = LLMTestCase(
    input="什么是 Transformer 架构？",
    actual_output="Transformer 是一种基于注意力机制的神经网络架构...",
    retrieval_context=["Transformer 由 Vaswani 等人于 2017 年提出..."]
)

# 定义评估指标
metric = AnswerRelevancyMetric(threshold=0.7)
assert_test(test_case, [metric])
```

### [LangSmith](https://smith.langchain.com/)

LangSmith 是 LangChain 提供的 LLM 应用调试与评估平台：

- **追踪（Tracing）**：记录每次调用的完整链路
- **数据集管理**：维护评估用的测试数据集
- **自动评估**：内置多种评估指标
- **A/B 测试**：对比不同模型或提示词的效果

### 其他评估工具

| 工具                                    | 特点                               | 适用场景     |
| --------------------------------------- | ---------------------------------- | ------------ |
| [**TruLens**](https://www.trulens.org/) | RAG 三元组评估（上下文-答案-问题） | RAG 系统评估 |
| **Promptfoo**                           | 提示词评估与红队测试               | 提示词优化   |
| **Arize Phoenix**                       | 可观测性 + 评估一体化              | 生产环境监控 |
| **Helicone**                            | API 调用分析 + 评估                | API 成本管理 |

## 实施步骤

### 第一步：明确评估目标

在开始评估前，先回答以下问题：

- **评估目的**：模型选型、版本升级验证、还是上线前验收？
- **业务场景**：对话、摘要、分类、代码生成还是 RAG？
- **关键指标**：哪些指标对业务最重要？准确率、延迟、成本还是安全性？
- **预算约束**：评估本身的成本上限是多少？（LLM-as-a-Judge 也会消耗 Token）

### 第二步：构建评估数据集

```python
def build_evaluation_dataset():
    """构建高质量评估数据集"""
    return {
        "golden_set": "专家手工标注的高质量测试集（50-200 条）",
        "production_samples": "从生产环境采样的真实用户请求（200-1000 条）",
        "edge_cases": "边界场景和极端情况的测试用例（20-50 条）",
        "adversarial_cases": "对抗性测试用例（10-30 条）",
        "regression_set": "用于回归测试的固定数据集（保持不变）",
    }
```

数据集划分建议：

| 数据集 | 比例 | 用途                         |
| ------ | ---- | ---------------------------- |
| 开发集 | 60%  | 迭代开发和调试               |
| 验证集 | 20%  | 超参数选择和模型选择         |
| 测试集 | 20%  | 仅在最终评估时使用，严格隔离 |

::: warning
评估数据集的质量直接决定评估结果的可靠性。垃圾进，垃圾出（Garbage In, Garbage Out）。务必确保测试集的多样性、代表性和标注质量。
:::

### 第三步：选择评估框架和指标

根据业务场景选择合适的评估框架：

- **RAG 系统**：使用 RAGAS，关注 Faithfulness、Answer Relevancy、Context Precision
- **通用 LLM**：使用 DeepEval，编写单元测试风格的评估用例
- **全链路追踪**：使用 LangSmith，结合追踪和评估
- **生产监控**：使用 Arize Phoenix 或 Helicone

### 第四步：搭建自动化评估流水线

```python
class EvaluationPipeline:
    """自动化评估流水线"""

    def __init__(self, model, metrics_config):
        self.model = model
        self.metrics = self._load_metrics(metrics_config)
        self.results = {}

    def run(self, dataset):
        """运行完整评估流程"""
        for test_case in dataset:
            # 1. 生成模型输出
            output = self.model.generate(test_case["input"])

            # 2. 运行各项指标评估
            case_results = {}
            for metric in self.metrics:
                case_results[metric.name] = metric.evaluate(
                    input=test_case["input"],
                    output=output,
                    reference=test_case.get("reference"),
                    context=test_case.get("context"),
                )

            self.results[test_case["id"]] = case_results

        # 3. 汇总报告
        return self.generate_report()
```

### 第五步：执行评估并生成报告

评估报告应包含：基本信息、评估摘要（各指标分数与目标对比）、详细结果、问题分析、结论与建议。

### 第六步：持续评估与回归测试

```python
def regression_test(new_results, baseline_results, threshold=0.02):
    """回归测试：新模型性能不应显著低于基线"""
    regressions = []

    for metric in new_results:
        new_score = new_results[metric]["mean"]
        baseline_score = baseline_results[metric]["mean"]

        if new_score < baseline_score - threshold:
            regressions.append({
                "metric": metric,
                "baseline": baseline_score,
                "new": new_score,
                "drop": baseline_score - new_score,
            })

    if regressions:
        print("⚠️ 发现性能回退：")
        for r in regressions:
            print(f"  {r['metric']}: {r['baseline']:.3f} → {r['new']:.3f} (下降 {r['drop']:.3f})")
        return False

    print("✅ 无性能回退")
    return True
```

## 最佳实践

- **评估不是一次性工作**：应该贯穿整个 AI 应用生命周期——选型阶段做横向对比，开发阶段做回归测试，上线后做持续监控
- **数据集要定期更新**：随着用户行为变化和产品迭代，评估数据集需要定期补充新的边界场景
- **多维度评估**：不要只看准确率，还要关注延迟、成本、安全性等维度
- **LLM-as-a-Judge 要谨慎**：存在位置偏差和自偏好偏差，建议多次评估取平均或使用多个裁判模型
- **建立评估基线**：每次模型变更前先记录基线数据，变更后进行回归测试
- **自动化优先**：将评估流程集成到 CI/CD 流水线中，实现每次代码提交自动评估

## 常见问题与避坑

### Q1：评估数据集应该多大？

没有固定答案，取决于场景复杂度。一般建议：

- 简单分类任务：50-100 条
- 复杂生成任务：200-500 条
- RAG 系统：300-1000 条（需要覆盖多种文档类型和查询模式）

关键是**质量优于数量**——100 条精心设计的测试用例比 1000 条随机采样更有价值。

### Q2：LLM-as-a-Judge 可靠吗？

LLM-as-a-Judge 存在以下偏差：

- **位置偏差**：倾向于给第一个回答更高分
- **自偏好偏差**：倾向于给与自己相似的模型更高分
- **长度偏差**：倾向于给更长的回答更高分

**避坑建议**：多次评估交换顺序取平均、使用多个不同的裁判模型、与人类评估结果做校准。

### Q3：如何控制评估成本？

- 使用较小的模型作为裁判（如 GPT-4o-mini 而非 GPT-4）
- 对评估数据集做分层抽样，不必全量评估
- 缓存评估结果，避免重复评估相同用例
- 使用开源评估指标（如 BERTScore）替代 LLM 评估

### Q4：评估结果不一致怎么办？

- 检查评估数据集是否存在标注不一致
- 增加测试用例数量，降低随机性影响
- 使用多个指标交叉验证
- 对关键用例进行人工复核

### Q5：如何评估 RAG 系统的检索质量？

使用 RAGAS 的 Context Precision 和 Context Recall 指标：

- **Context Precision**：检索结果中有多少是相关的
- **Context Recall**：检索结果覆盖了多少正确答案

同时监控检索延迟、检索命中率等工程指标。

## 与其他概念的关系

- 模型评估依赖 [基准测试](/glossary/benchmark) 提供的标准化测试集和评估协议
- 评估结果直接影响 [成本优化](/glossary/cost-optimization) 决策，帮助找到性价比最优的模型
- 评估过程中的延迟和吞吐量数据是 [延迟优化](/glossary/latency-optimization) 的基线
- 生产环境的持续评估需要 [可观测性](/glossary/observability) 基础设施的支持
- 模型 [版本管理](/glossary/versioning) 确保评估结果可追溯到具体版本
- 评估数据集的质量影响 [幻觉](/glossary/hallucination) 检测的准确性

## 延伸阅读

- [基准测试](/glossary/benchmark) — 标准化测试集与评估协议
- [可观测性](/glossary/observability) — 生产环境的持续监控
- [成本优化](/glossary/cost-optimization) — 性能与成本的平衡
- [版本管理](/glossary/versioning) — 评估结果的可追溯性
- [幻觉](/glossary/hallucination) — 评估中的幻觉检测
- [RAGAS 官方文档](https://docs.ragas.io/) — RAG 系统评估框架
- [DeepEval 文档](https://docs.confident-ai.com/) — 单元测试风格评估框架
- [LangSmith 文档](https://docs.smith.langchain.com/) — LLM 应用调试与评估平台
