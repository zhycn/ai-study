---
title: Data-Centric AI
description: 以数据为核心的 AI 开发范式
---

# Data-Centric AI

一种"改数据比改模型更重要"的 AI 开发思路。过去大家拼命调模型结构、改算法，现在发现把数据弄干净、弄高质量，效果提升反而更明显。

## 概述

Data-Centric AI（以数据为中心的 AI）是一种将数据质量而非模型复杂度作为系统性能主要驱动力的开发范式。由吴恩达（Andrew Ng）在 2021 年正式提出，主张在模型架构相对固定的前提下，通过系统性地改进训练数据的质量、覆盖度和标注一致性来提升 AI 系统表现。

与传统 Model-Centric AI（以模型为中心）形成鲜明对比：后者聚焦于设计更复杂的网络结构、调整超参数、尝试新算法；前者则认为在成熟架构（如 [Transformer](/glossary/transformer)）已经足够强大的背景下，数据才是决定上限的关键因素。

::: info 提出背景
吴恩达在 "Data-Centric AI Competition" 中做了一个经典实验：固定模型和代码，只允许参赛者改进数据，结果不同团队的性能差异可达 30% 以上，证明数据质量的提升空间远大于模型调优。
:::

## 为什么重要

- **性能瓶颈转移**：当模型架构趋于成熟（如 Transformer 成为统一架构），数据质量成为性能差异的主要来源
- **成本效益更高**：改进数据通常比训练更大模型的成本更低、回报更可控
- **可解释性更强**：数据层面的改进（如修正错误标注）比模型内部调参更容易理解和审计
- **长尾问题**（Long-Tail Problem）：真实场景中的边缘案例（Edge Cases）只能通过扩充和修正数据来解决
- **数据飞轮**（Data Flywheel）：高质量数据 → 更好模型 → 更多用户 → 更多数据 → 持续迭代

## 核心原理

### Model-Centric vs Data-Centric 对比

| 维度 | Model-Centric AI | Data-Centric AI |
|------|------------------|-----------------|
| 优化对象 | 模型架构、超参数、损失函数 | 数据质量、标注一致性、覆盖度 |
| 固定变量 | 训练数据 | 模型代码和架构 |
| 迭代方式 | 换模型、调参数、改算法 | 清洗数据、补充样本、修正标注 |
| 适用场景 | 数据充足且质量高 | 数据噪声大、标注不一致、长尾分布 |
| 典型工具 | PyTorch、TensorFlow、优化工具 | 数据标注平台、数据增强、主动学习 |

### 数据质量的四个维度

**一致性**（Consistency）：相同类型的样本应有统一的标注标准。标注人员之间的一致性（Inter-Annotator Agreement）是衡量数据质量的核心指标。

```python
# 计算标注者间一致性（Cohen's Kappa）
from sklearn.metrics import cohen_kappa_score

annotator_a = [1, 0, 1, 1, 0, 1, 0, 0]
annotator_b = [1, 0, 1, 0, 0, 1, 1, 0]

kappa = cohen_kappa_score(annotator_a, annotator_b)
print(f"标注一致性 Kappa: {kappa:.3f}")
# Kappa > 0.8 表示高度一致，0.6-0.8 表示中等一致
```

**覆盖度**（Coverage）：训练数据应覆盖目标应用场景的所有重要子群体和边缘情况。如果数据分布与实际部署环境不匹配，模型在长尾场景下会表现糟糕。

**准确性**（Accuracy）：标注错误会直接传导给模型。研究表明，即使只有 5% 的标注噪声，也可能导致模型性能下降 10-30%。

**多样性**（Diversity）：数据应包含足够的变化（如不同光照、角度、方言、文体），以确保模型的泛化能力。

### 数据迭代流程

```text
收集初始数据 → 训练基准模型 → 错误分析 → 识别数据问题
     ↑                                          ↓
     ← 重新标注/补充数据 ← 制定数据改进策略 ← 优先级排序
```

::: tip
错误分析（Error Analysis）是 Data-Centric AI 的核心环节。通过系统性地分析模型在哪些样本上出错，可以精准定位数据问题（如某类标注不一致、某场景数据缺失），而非盲目地增加数据量。
:::

## 数据改进技术

### 数据清洗与标注修正

```python
# 识别潜在的错误标注（基于模型预测与标注的不一致）
def find_label_errors(features, labels, model, threshold=0.9):
    """找出可能是错误标注的样本"""
    predictions = model.predict_proba(features)
    confidence = predictions.max(axis=1)
    predicted_labels = predictions.argmax(axis=1)

    # 高置信度预测但与标注不一致的样本
    errors = (confidence > threshold) & (predicted_labels != labels)
    return errors

# 使用 cleanlab 库自动检测标签错误
from cleanlab.filter import find_label_issues

issues = find_label_issues(labels, pred_probs, return_indices_ranked_by="self_confidence")
print(f"发现 {len(issues)} 个潜在标注错误")
```

### 数据增强（Data Augmentation）

针对数据不足的类别或场景，通过变换生成新样本：

```python
# 文本数据增强示例
import nlpaug.augmenter.word as naw

# 同义词替换
syn_aug = naw.SynonymAug(aug_src='wordnet', aug_p=0.3)
text = "The model performs well on the benchmark"
augmented = syn_aug.augment(text)
# 输出: "The model performs good on the benchmark"

# 回译增强（中英回译）
back_aug = naw.BackTranslationAug(
    from_model_name='transformer.wmt19.en-de',
    to_model_name='transformer.wmt19.de-en'
)
```

```python
# 图像数据增强示例
from torchvision import transforms

augment = transforms.Compose([
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(15),
    transforms.ColorJitter(brightness=0.2, contrast=0.2),
    transforms.RandomResizedCrop(224, scale=(0.8, 1.0)),
])
```

### 主动学习（Active Learning）

让模型自己"挑"最有价值的样本让人工标注，最大化标注效率：

```python
class ActiveLearningLoop:
    def __init__(self, model, unlabeled_pool, budget=100):
        self.model = model
        self.pool = unlabeled_pool
        self.budget = budget

    def uncertainty_sampling(self, top_k=None):
        """不确定性采样：选择模型最不确定的样本"""
        k = top_k or self.budget
        predictions = self.model.predict_proba(self.pool)
        entropy = -np.sum(predictions * np.log(predictions + 1e-10), axis=1)
        return np.argsort(entropy)[-k:]

    def run_iteration(self):
        # 选择样本 → 人工标注 → 加入训练集 → 重新训练
        indices = self.uncertainty_sampling()
        selected = self.pool[indices]
        new_labels = human_annotate(selected)  # 人工标注
        self.add_to_training(selected, new_labels)
        self.model.retrain()
```

::: warning
主动学习依赖模型自身的不确定性估计。如果模型校准不佳（Calibration Poor），不确定性采样可能选出噪声样本而非有价值的样本。建议配合温度缩放（Temperature Scaling）等校准技术使用。
:::

### 合成数据（Synthetic Data）

利用大模型生成训练数据，补充稀缺场景：

```python
from openai import OpenAI

client = OpenAI()

def generate_synthetic_examples(prompt_template, n=50):
    """使用 LLM 生成合成训练数据"""
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "你是一个数据生成专家。"},
            {"role": "user", "content": prompt_template}
        ],
        n=n,
        temperature=0.7
    )
    return [choice.message.content for choice in response.choices]

# 示例：生成边缘案例
prompt = """请生成 10 个医疗问诊中容易被误诊的复杂病例，
包含症状描述和正确诊断。要求：症状不典型、容易与其他疾病混淆。"""
```

## 应用场景

### 工业质检

在制造业缺陷检测中，缺陷样本往往稀少且标注标准不一。Data-Centric AI 方法：

1. 统一标注规范，定义清晰的缺陷类别边界
2. 针对漏检率高的缺陷类型，补充样本或合成数据
3. 定期审查标注一致性，修正历史错误标注
4. 建立数据版本管理，追踪每次数据改进的效果

### 医疗 AI

医疗数据面临标注专家稀缺、标注一致性低、隐私限制等挑战：

- **多专家交叉验证**：同一影像由多位医生独立标注，取共识
- **困难样本聚焦**：模型不确定的病例交由资深专家复核
- **数据去偏**：确保训练数据覆盖不同人群、设备、医院

### 自动驾驶

长尾场景（罕见但危险的交通情况）是自动驾驶的核心挑战：

```text
真实数据收集 → 场景分类 → 识别低覆盖场景 → 针对性补充
     ↓                                    ↑
仿真数据生成 ← 场景参数化 ← 边缘场景定义 ← 错误分析
```

### 大语言模型训练

Data-Centric AI 在大模型预训练和 [微调](/glossary/fine-tuning) 中同样关键：

- **数据过滤**：从海量网页数据中筛选高质量文本
- **去重**：消除训练集中的重复内容，防止过拟合
- **毒性内容过滤**：移除有害、偏见、虚假信息
- **指令数据构造**：设计多样化、高质量的指令-回答对

## 工程实践

### 数据版本控制

```python
# 使用 DVC 进行数据版本管理
import dvc.api

# 记录数据集版本
# dvc add data/training_dataset.csv
# git add data/training_dataset.csv.dvc
# git commit -m "v2.1: 修正医疗影像标注不一致问题"

# 在代码中引用特定版本
with dvc.api.open(
    'data/training_dataset.csv',
    repo='https://github.com/org/ai-project',
    rev='v2.1'
) as f:
    df = pd.read_csv(f)
```

### 数据质量监控

```python
class DataQualityMonitor:
    def __init__(self, reference_stats):
        self.reference = reference_stats  # 参考数据集的统计信息

    def check_drift(self, new_data):
        """检测数据分布漂移"""
        checks = {}
        checks["label_distribution"] = self._check_label_drift(new_data)
        checks["feature_statistics"] = self._check_feature_drift(new_data)
        checks["missing_rate"] = self._check_missing_rate(new_data)
        return checks

    def _check_label_drift(self, new_data):
        from scipy.stats import ks_2samp
        stat, p_value = ks_2samp(self.reference["labels"], new_data["labels"])
        return {"p_value": p_value, "drift_detected": p_value < 0.05}
```

::: tip
数据漂移（Data Drift）是生产环境中模型性能下降的常见原因。建议定期运行数据质量检查，当检测到显著漂移时触发数据更新和模型重训练流程。
:::

### 数据改进效果评估

```python
def evaluate_data_improvement(baseline_metrics, new_metrics):
    """评估数据改进的效果"""
    improvements = {}
    for metric in baseline_metrics:
        delta = new_metrics[metric] - baseline_metrics[metric]
        improvements[metric] = {
            "before": baseline_metrics[metric],
            "after": new_metrics[metric],
            "delta": delta,
            "significant": abs(delta) > 0.01  # 1% 以上视为显著
        }
    return improvements
```

## 与其他概念的关系

- [微调](/glossary/fine-tuning) 的质量高度依赖于微调数据的构建方式
- [模型评估](/glossary/model-evaluation) 需要区分"模型能力不足"和"数据质量问题"
- [幻觉](/glossary/hallucination) 的部分根因是训练数据中的矛盾信息或知识缺失
- [对齐](/glossary/alignment) 本质上是通过高质量偏好数据引导模型行为
- [Embedding](/glossary/embedding) 的质量取决于训练数据的多样性和覆盖度

## 延伸阅读

- [微调](/glossary/fine-tuning) — 数据质量直接影响微调效果
- [模型评估](/glossary/model-evaluation) — 区分模型问题与数据问题
- [幻觉](/glossary/hallucination) — 训练数据质量与幻觉的关系
- [对齐](/glossary/alignment) — 基于偏好数据的对齐方法
- [Data-Centric AI Competition](https://decap.vision/) — 吴恩达主办的数据中心 AI 竞赛
- [Hidden Technical Debt in Machine Learning Systems](https://papers.nips.cc/paper/2015/hash/86df7dcfd896fcaf2674f757a2463ba-Abstract.html) — 数据在 ML 系统中的核心地位
- [Cleanlab](https://github.com/cleanlab/cleanlab) — 自动检测标签错误的开源工具
