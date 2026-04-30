---
title: 偏见
description: Bias，AI 模型中的系统性不公平倾向
---

# 偏见

## 概述

**偏见**（Bias）在 AI 语境中指模型由于训练数据、算法设计或部署环境等原因，对特定群体、个体或场景产生的系统性不公平倾向。这种不公平可能表现为歧视性输出、资源分配不均、机会不平等，甚至加剧社会中已有的不平等。

AI 偏见不是模型"有意"的歧视，而是训练数据中社会偏见的反映、算法设计中的盲点、或评估指标的不完善所导致的系统性偏差。

```
偏见的传播链:

社会偏见 → 训练数据中的偏见 → 模型学习偏见 → 模型输出偏见 → 强化社会偏见
                                              ↓
                                        影响现实决策
                                        （招聘、贷款、司法）
```

::: warning
AI 偏见的危害不仅在于对个体的不公平对待，更在于它可能以"算法客观"的外衣，将社会偏见合法化和系统化。由于算法决策往往不透明，偏见可能长期存在而不被发现。
:::

## 为什么重要

- **公平性**：AI 系统应该对所有用户公平，不因种族、性别、年龄等因素区别对待
- **法律风险**：歧视性 AI 决策可能违反反歧视法律，如美国《民权法案》、欧盟《AI Act》
- **社会影响**：AI 越来越多地用于招聘、贷款、司法等关键决策，偏见会造成真实伤害
- **信任损害**：用户一旦发现 AI 存在偏见，会对整个系统失去信任
- **商业损失**：偏见事件会导致品牌声誉受损、用户流失、法律纠纷

## 偏见类型

### 数据偏见（Data Bias）

训练数据本身存在代表性不足或分布不均：

```python
# 数据偏见示例
training_data = {
    "gender_distribution": {"male": 0.75, "female": 0.25},  # 性别不平衡
    "age_distribution": {"18-30": 0.60, "31-50": 0.30, "51+": 0.10},  # 年龄偏向年轻人
    "geographic_distribution": {"north_america": 0.70, "other": 0.30},  # 地域偏向
}

# 结果：模型在女性、中老年、非北美用户上表现更差
```

### 历史偏见（Historical Bias）

训练数据反映了社会中已有的不平等：

```text
场景: 招聘 AI 系统
历史数据: 过去 10 年科技公司男性员工比例远高于女性
模型学习: "男性"与"适合技术岗位"存在关联
结果: 模型倾向于给男性候选人更高分
```

::: warning
Amazon 曾在 2018 年废弃了一个内部招聘 AI 工具，因为它系统性地降低包含"women's"一词的简历评分（如"women's chess club captain"），反映了科技行业男性主导的历史偏见。
:::

### 算法偏见（Algorithmic Bias）

算法设计或优化目标本身引入的偏见：

```python
# 算法偏见示例
# 如果优化目标是"整体准确率"，模型可能牺牲少数群体的准确率

# 整体准确率 95%，但:
# - 群体 A（占 90%）: 准确率 98%
# - 群体 B（占 10%）: 准确率 65%
# 整体看起来很好，但对群体 B 严重不公平
```

### 评估偏见（Evaluation Bias）

评估数据集不能代表真实使用场景：

```text
问题: 人脸识别系统在浅色皮肤上准确率 99%，在深色皮肤上准确率 85%
原因: 评估数据集主要由浅色皮肤人群组成
影响: 系统上线后对深色皮肤用户不公平
```

### 部署偏见（Deployment Bias）

模型部署环境与训练环境不匹配：

```text
训练环境: 城市地区的医疗数据
部署环境: 农村地区的诊所
问题: 疾病谱、医疗条件、人口特征不同，模型表现下降
```

### 表示偏见（Representation Bias）

模型对某些群体的表示能力不足：

```text
场景: 文本生成模型
问题: 对非标准方言、少数族裔语言的生成质量明显低于标准语言
影响: 这些群体无法平等地享受 AI 服务
```

## 偏见检测

### 公平性指标

| 指标 | 英文 | 定义 |
|------|------|------|
| **人口统计均等** | Demographic Parity | 不同群体的正面结果比例相同 |
| **均等机会** | Equal Opportunity | 不同群体的真正例率相同 |
| **均等赔率** | Equalized Odds | 不同群体的真正例率和假正例率都相同 |
| **预测均等** | Predictive Parity | 不同群体的预测值具有相同的校准度 |

```python
def calculate_fairness_metrics(model, data, sensitive_attribute):
    """计算公平性指标"""
    groups = data.groupby(sensitive_attribute)
    metrics = {}

    for group_name, group_data in groups:
        predictions = model.predict(group_data)
        actuals = group_data["label"]

        metrics[group_name] = {
            "demographic_parity": predictions.mean(),  # 正面结果比例
            "true_positive_rate": recall_score(actuals, predictions),  # 真正例率
            "false_positive_rate": fpr(actuals, predictions),  # 假正例率
            "accuracy": accuracy_score(actuals, predictions),
        }

    # 计算组间差异
    disparities = {
        "demographic_parity_diff": max(m["demographic_parity"] for m in metrics.values())
        - min(m["demographic_parity"] for m in metrics.values()),
        "tpr_diff": max(m["true_positive_rate"] for m in metrics.values())
        - min(m["true_positive_rate"] for m in metrics.values()),
    }

    return metrics, disparities
```

### 偏见审计工具

```python
# 使用 AI Fairness 360 (AIF360) 进行偏见审计
from aif360.datasets import BinaryLabelDataset
from aif360.metrics import BinaryLabelDatasetMetric

# 加载数据
dataset = BinaryLabelDataset(
    df=data,
    label_names=["income"],
    protected_attribute_names=["race", "sex"],
)

# 计算偏见指标
metric = BinaryLabelDatasetMetric(dataset, unprivileged_groups=[{"race": 1}], privileged_groups=[{"race": 0}])

print(f"统计均等差异: {metric.statistical_parity_difference()}")
print(f"不同影响比: {metric.disparate_impact()}")
```

## 缓解方法

### 数据层面

| 方法 | 描述 | 适用场景 |
|------|------|---------|
| **重采样**（Resampling） | 对少数群体过采样，多数群体欠采样 | 数据分布不均 |
| **数据增强**（Data Augmentation） | 为少数群体生成合成数据 | 少数群体数据不足 |
| **数据重新加权**（Reweighting） | 为不同样本分配不同权重 | 需要保持原始数据量 |
| **数据清理**（Data Cleaning） | 移除数据中的偏见标签和特征 | 历史偏见明显 |

### 算法层面

```python
# 对抗去偏见（Adversarial Debiasing）
import torch

class DebiasingModel(torch.nn.Module):
    def __init__(self, input_dim, hidden_dim):
        super().__init__()
        # 主任务预测器
        self.predictor = torch.nn.Sequential(
            torch.nn.Linear(input_dim, hidden_dim),
            torch.nn.ReLU(),
            torch.nn.Linear(hidden_dim, 1),
        )
        # 对抗分类器（预测敏感属性）
        self.adversary = torch.nn.Sequential(
            torch.nn.Linear(hidden_dim, hidden_dim // 2),
            torch.nn.ReLU(),
            torch.nn.Linear(hidden_dim // 2, 1),
        )

    def forward(self, x):
        representation = self.predictor[:-1](x)
        prediction = self.predictor[-1](representation)
        sensitive_pred = self.adversary(representation)
        return prediction, sensitive_pred

    def loss(self, prediction, label, sensitive_pred, sensitive_label, alpha=0.1):
        """主任务损失 - α × 对抗损失"""
        task_loss = torch.nn.functional.binary_cross_entropy_with_logits(prediction, label)
        adversarial_loss = torch.nn.functional.binary_cross_entropy_with_logits(sensitive_pred, sensitive_label)
        return task_loss - alpha * adversarial_loss  # 减号：让对抗分类器越差越好
```

### 后处理层面

```python
def equalize_odds_postprocess(predictions, labels, sensitive_attribute, target_tpr=0.8):
    """
    等赔率后处理:
    调整不同群体的决策阈值，使真正例率相同
    """
    groups = predictions.groupby(sensitive_attribute)
    thresholds = {}

    for group_name, group_preds in groups:
        group_labels = labels[group_preds.index]
        # 找到使 TPR = target_tpr 的阈值
        threshold = find_threshold_for_tpr(group_preds, group_labels, target_tpr)
        thresholds[group_name] = threshold

    # 应用不同阈值
    adjusted_predictions = predictions.copy()
    for group_name, threshold in thresholds.items():
        mask = sensitive_attribute == group_name
        adjusted_predictions[mask] = (predictions[mask] >= threshold).astype(int)

    return adjusted_predictions
```

### 提示工程层面

```python
# 通过提示词减少 LLM 偏见
DEBIASING_PROMPT = """在回答以下问题时，请注意：
1. 避免基于性别、种族、年龄、宗教等的刻板印象
2. 呈现多元观点和经历
3. 使用包容性语言
4. 如果问题涉及不同群体，确保公平对待

问题：{question}"""
```

## 主流框架与工具

| 工具 | 开发者 | 功能 |
|------|--------|------|
| **AI Fairness 360** | IBM | 全面的公平性指标和缓解算法 |
| **Fairlearn** | Microsoft | 公平性评估和缓解工具包 |
| **What-If Tool** | Google | 交互式模型公平性分析 |
| **SHAP / LIME** | 社区 | 模型解释，帮助发现偏见来源 |
| **HolisticBias** | Meta | LLM 偏见评估基准 |

## 工程实践

### 偏见检测 Checklist

```
AI 系统偏见检测清单:

□ 数据审计
  ├── 训练数据的人口统计学分布是否均衡？
  ├── 是否存在历史偏见的痕迹？
  ├── 标注过程是否引入主观偏见？
  └── 测试集是否覆盖所有关键群体？

□ 模型评估
  ├── 按敏感属性分组评估性能指标
  ├── 计算公平性指标（人口统计均等、均等机会等）
  ├── 检查不同群体的错误类型分布
  └── 进行反事实公平性测试

□ 持续监控
  ├── 生产环境中按群体监控模型表现
  ├── 收集用户反馈中的偏见报告
  ├── 定期重新评估公平性指标
  └── 建立偏见事件响应机制
```

### 负责任 AI 实践

```python
class ResponsibleAIPipeline:
    def __init__(self):
        self.fairness_checker = FairnessChecker()
        self.bias_mitigator = BiasMitigator()

    def train_with_fairness(self, data, model_config):
        """集成公平性检查的训练流程"""
        # 1. 数据偏见检查
        data_report = self.fairness_checker.audit_data(data)
        if data_report["has_bias"]:
            data = self.bias_mitigator.mitigate_data(data, data_report)

        # 2. 训练模型
        model = train_model(data, model_config)

        # 3. 模型公平性评估
        fairness_report = self.fairness_checker.audit_model(model, data)

        # 4. 如果公平性不达标，应用缓解措施
        if not fairness_report["is_fair"]:
            model = self.bias_mitigator.mitigate_model(model, data, fairness_report)

        return model, fairness_report
```

## 与其他概念的关系

- 偏见检测是 [AI 安全](/glossary/ai-safety) 的重要维度
- [红队测试](/glossary/red-teaming) 用于主动发现模型偏见
- [对齐](/glossary/alignment) 训练可以减少模型的偏见输出
- [可解释性](/glossary/explainability) 帮助理解偏见的来源和机制
- [内容审核](/glossary/content-moderation) 可以过滤偏见性输出
- [数据隐私](/glossary/data-privacy) 与偏见检测在敏感属性处理上有交叉

## 延伸阅读

- [AI 安全](/glossary/ai-safety) — 偏见在安全框架中的位置
- [红队测试](/glossary/red-teaming) — 主动发现偏见
- [可解释性](/glossary/explainability) — 理解偏见来源
- [对齐](/glossary/alignment) — 减少偏见输出
- [AI Fairness 360](https://aif360.mybluemix.net/) — IBM 公平性工具包
- [Fairlearn](https://fairlearn.org/) — Microsoft 公平学习工具
- [Gender Shades](http://gendershades.org/) — 人脸识别偏见研究
- [On the Dangers of Stochastic Parrots](https://dl.acm.org/doi/10.1145/3442188.3445922) — LLM 偏见经典论文
