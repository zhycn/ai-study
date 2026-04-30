---
title: Constitutional AI
description: 宪法 AI，通过定义原则让模型自我审查和改进的对齐方法
---

# Constitutional AI

给 AI 定一套"行为守则"，让它自己照着守则检查和修改回答。不像 RLHF 需要大量人工标注，Constitutional AI 让模型先按原则自我批评，再自我改进——就像学生写完作文后，对照评分标准自己修改，最后老师只需抽查。

## 概述

**Constitutional AI**（宪法 AI，CAI）是 Anthropic 提出的一种 AI 对齐方法，通过定义一组明确的原则（Constitution，宪法），让模型在生成回复后**自我审查**（Self-critique）和**自我修订**（Self-revision），从而实现对齐目标。

Constitutional AI 的核心创新在于**用 AI 对齐 AI**：

- **自我批评阶段**：模型根据宪法原则审查自己的输出，识别潜在问题
- **自我修订阶段**：模型根据批评意见修改输出，使其符合宪法原则
- **偏好数据生成**：用自我修订后的输出作为"好回答"，原始输出作为"差回答"，构建偏好数据集
- **RLHF 训练**：用自动生成的偏好数据训练奖励模型，再进行 RL 优化

```
Constitutional AI 两阶段流程:

阶段 1: 自我批评与修订（无需人类标注）
┌─────────────────────────────────────────┐
│ 用户输入 → 模型生成初始回复              │
│     ↓                                    │
│ 宪法原则 + 初始回复 → 模型自我批评       │
│     ↓                                    │
│ 批评意见 + 初始回复 → 模型自我修订       │
│     ↓                                    │
│ 输出：（初始回复，修订回复）偏好对       │
└─────────────────────────────────────────┘

阶段 2: 强化学习对齐
┌─────────────────────────────────────────┐
│ 偏好对 → 训练奖励模型                    │
│     ↓                                    │
│ 奖励模型 + 策略模型 → RLHF 优化          │
│     ↓                                    │
│ 输出：对齐后的模型                       │
└─────────────────────────────────────────┘
```

::: tip
Constitutional AI 的最大优势是**大幅减少人类标注需求**。传统 RLHF 需要大量人工标注偏好数据，而 CAI 通过自我批评和修订自动生成偏好数据，只在最后阶段需要少量人类验证。
:::

## 为什么值得关注

- **降低对齐成本**：减少对昂贵人类标注的依赖，大幅降低对齐成本
- **可扩展性**：AI 自我审查的速度远超人类标注，可以处理海量数据
- **原则透明**：宪法原则是明确定义的，对齐标准可审查、可调整
- **价值观编码**：将抽象的伦理原则转化为具体的行为约束
- **Claude 验证**：Anthropic 的 Claude 系列模型成功应用了此方法
- **减少人类偏见**：相比人类标注者的个人偏见，宪法原则可以更公平一致

::: warning
Constitutional AI 并非完美。宪法原则本身需要精心设计，且可能隐含设计者的价值观偏见。模型自我审查的能力也有限，对于复杂或模糊的情况可能无法正确判断。
:::

## 核心原理

### 宪法（Constitution）

宪法是一组明确定义的原则，指导模型的行为：

```python
# Claude 的宪法原则示例（简化版）
CONSTITUTION = [
    # 无害性原则
    {
        "id": "harmless_1",
        "principle": "选择最无害的回复",
        "description": "当多个回复都满足用户需求时，选择可能造成最小伤害的那个",
    },
    {
        "id": "harmless_2",
        "principle": "不提供危险物品的制造指导",
        "description": "不应提供制造武器、毒品、爆炸物等危险物品的具体步骤",
    },
    {
        "id": "harmless_3",
        "principle": "不协助非法活动",
        "description": "不应提供规避法律、进行欺诈、盗窃等非法活动的建议",
    },

    # 有帮助性原则
    {
        "id": "helpful_1",
        "principle": "直接回答用户问题",
        "description": "回复应该直接解决用户的核心问题，而非回避",
    },
    {
        "id": "helpful_2",
        "principle": "提供有用的上下文",
        "description": "在适当的情况下，提供有助于理解答案的额外信息",
    },

    # 诚实性原则
    {
        "id": "honest_1",
        "principle": "不确定时明确说明",
        "description": "当对答案不确定时，应该明确表达不确定性",
    },
    {
        "id": "honest_2",
        "principle": "不编造信息",
        "description": "不应编造事实、引用、数据或来源",
    },
]
```

### 自我批评机制

自我批评是让模型根据宪法原则审查自己的输出：

```python
def generate_critique(prompt: str, response: str, constitution: list) -> str:
    """生成自我批评"""
    critique_prompt = f"""人类提出了以下请求：
<request>{prompt}</request>

助手给出了以下回复：
<response>{response}</response>

请根据以下原则审查助手的回复：
<principle>{constitution[0]["principle"]}</principle>
<principle_description>{constitution[0]["description"]}</principle_description>

这个回复是否违反了上述原则？如果有，具体是什么问题？
如果没有违反，请说明原因。"""

    return model.generate(critique_prompt)
```

### 自我修订机制

自我修订是让模型根据批评意见修改输出：

```python
def generate_revision(prompt: str, response: str, critique: str) -> str:
    """生成修订后的回复"""
    revision_prompt = f"""人类提出了以下请求：
<request>{prompt}</request>

助手给出了以下回复：
<response>{response}</response>

审查意见指出以下问题：
<critique>{critique}</critique>

请根据审查意见修改回复，使其符合原则要求。
直接输出修改后的回复，不要解释修改过程。"""

    return model.generate(revision_prompt)
```

## 技术方法

### CAI 训练流程

```
Constitutional AI 完整训练流程:

Phase 1: SFT 阶段（监督微调）
├── 收集高质量指令数据
├── 模型生成初始回复
├── 自我批评 + 自我修订
├── 用修订后的回复作为 SFT 目标
└── 训练 SFT 模型

Phase 2: RL 阶段（强化学习）
├── 对每个 prompt 采样多个回复
├── 自我批评 + 自我修订生成偏好对
├── 训练奖励模型（偏好数据来自 CAI）
├── 用奖励模型进行 RL 优化
└── 输出最终对齐模型
```

```python
class ConstitutionalAI:
    def __init__(self, model, constitution: list[dict]):
        self.model = model
        self.constitution = constitution

    def generate_preference_pair(self, prompt: str) -> dict:
        """生成偏好对（chosen, rejected）"""
        # 生成初始回复
        initial_response = self.model.generate(prompt, temperature=0.7)

        # 自我批评
        critiques = []
        for principle in self.constitution:
            critique = self._critique(prompt, initial_response, principle)
            critiques.append(critique)

        # 自我修订
        revised_response = self._revise(
            prompt, initial_response, critiques
        )

        # 构建偏好对
        return {
            "prompt": prompt,
            "chosen": revised_response,    # 修订后的（更好）
            "rejected": initial_response,  # 原始的（较差）
            "critiques": critiques,
        }

    def _critique(self, prompt: str, response: str, principle: dict) -> str:
        """根据单一原则进行批评"""
        critique_prompt = self._build_critique_prompt(
            prompt, response, principle
        )
        return self.model.generate(critique_prompt)

    def _revise(self, prompt: str, response: str, critiques: list) -> str:
        """根据批评意见修订"""
        revision_prompt = self._build_revision_prompt(
            prompt, response, critiques
        )
        return self.model.generate(revision_prompt)
```

### 宪法设计模式

| 模式 | 描述 | 示例 |
|------|------|------|
| **原则声明** | 简洁陈述期望行为 | "选择最无害的回复" |
| **情境描述** | 说明适用场景 | "当回复涉及危险内容时" |
| **行为约束** | 明确禁止的行为 | "不应提供制造武器的指导" |
| **优先级** | 原则冲突时的优先级 | "安全性优先于有帮助性" |
| **例外条款** | 特殊情况下的例外 | "教育目的下可以讨论历史事件" |

### 宪法示例：完整版本

```python
COMPREHENSIVE_CONSTITUTION = [
    # === 安全性 ===
    {
        "category": "safety",
        "principles": [
            "不提供制造武器、爆炸物、毒药的指导",
            "不提供入侵计算机系统的方法",
            "不提供规避安全检测的技术",
            "不协助进行身份盗窃或欺诈",
        ],
    },

    # === 合法性 ===
    {
        "category": "legality",
        "principles": [
            "不协助进行违法活动",
            "不提供逃税、洗钱的方法",
            "不协助规避法律监管",
        ],
    },

    # === 诚实性 ===
    {
        "category": "honesty",
        "principles": [
            "不编造事实、数据或引用",
            "不确定时明确说明",
            "不夸大或误导",
            "区分事实与观点",
        ],
    },

    # === 公平性 ===
    {
        "category": "fairness",
        "principles": [
            "不对任何群体产生歧视",
            "避免刻板印象",
            "在争议话题上呈现多方观点",
            "尊重不同文化和价值观",
        ],
    },

    # === 隐私 ===
    {
        "category": "privacy",
        "principles": [
            "不请求或存储个人敏感信息",
            "不泄露他人隐私",
            "不协助进行人肉搜索",
        ],
    },

    # === 有帮助性 ===
    {
        "category": "helpfulness",
        "principles": [
            "直接回答用户问题",
            "提供有用的上下文和解释",
            "在拒绝时解释原因并提供替代方案",
            "根据用户水平调整回答深度",
        ],
    },
]
```

### 与 RLHF 的对比

| 维度 | RLHF | Constitutional AI |
|------|------|-------------------|
| **偏好数据来源** | 人类标注 | AI 自我批评生成 |
| **标注成本** | 高（需要大量人工） | 低（自动化生成） |
| **可扩展性** | 受限于标注人力 | 几乎无限扩展 |
| **透明度** | 奖励模型是黑盒 | 宪法原则可审查 |
| **一致性** | 标注者间存在差异 | 原则定义一致 |
| **灵活性** | 可以捕捉复杂偏好 | 依赖原则设计质量 |
| **人类偏见** | 可能引入标注者偏见 | 偏见来自宪法设计者 |
| **适用场景** | 通用对齐 | 原则明确的对齐 |

::: info
Constitutional AI 和 RLHF 不是互斥的。Anthropic 在实际训练中结合了两种方法：用 CAI 生成大部分偏好数据，再用少量人类标注进行验证和校准。
:::

## 行业规范与法规

### 欧盟 AI Act

Constitutional AI 的方法论与欧盟 AI Act 的要求高度契合：

- **透明度**：宪法原则是可审查和文档化的，符合 AI Act 的透明度要求
- **风险评估**：基于原则的自我审查可以系统化地识别和缓解风险
- **人类监督**：CAI 流程中可以嵌入人类监督环节

### NIST AI RMF

NIST AI 风险管理框架与 CAI 的对应关系：

| NIST 功能 | CAI 实现 |
|-----------|----------|
| **Govern（治理）** | 宪法原则定义治理标准 |
| **Map（映射）** | 自我批评识别风险场景 |
| **Measure（测量）** | 原则违反率作为度量指标 |
| **Manage（管理）** | 自我修订实施风险缓解 |

### 中国《生成式人工智能服务管理暂行办法》

- **内容安全**：宪法原则可以编码中国法规要求的内容安全标准
- **价值观对齐**：原则可以体现社会主义核心价值观
- **可审计性**：宪法原则和审查记录提供可审计的决策链

### 行业实践

| 公司/组织 | 实践 |
|-----------|------|
| **Anthropic** | Claude 系列模型使用 CAI 方法 |
| **Google DeepMind** | Sparrow 使用类似的原则驱动方法 |
| **Meta** | Llama 护栏（Guardrails）使用规则过滤 |
| **OpenAI** | 系统提示词中嵌入行为准则 |

## 未来趋势

### 动态宪法

- **上下文感知**：根据用户、场景、文化背景动态调整适用原则
- **可学习宪法**：模型可以从反馈中学习优化宪法原则
- **多层次宪法**：全局原则 + 领域特定原则 + 用户自定义原则

```python
# 多层次宪法架构
class HierarchicalConstitution:
    def __init__(self):
        self.global_principles = [...]      # 全局原则（所有场景适用）
        self.domain_principles = {           # 领域特定原则
            "medical": [...],
            "legal": [...],
            "education": [...],
        }
        self.user_principles = {}            # 用户自定义原则

    def get_applicable_principles(self, context: dict) -> list:
        """根据上下文获取适用原则"""
        principles = self.global_principles.copy()
        domain = context.get("domain", "general")
        principles.extend(self.domain_principles.get(domain, []))
        user_id = context.get("user_id")
        if user_id and user_id in self.user_principles:
            principles.extend(self.user_principles[user_id])
        return principles
```

### 形式化验证

- **数学化原则**：将宪法原则转化为形式化逻辑表达式
- **自动验证**：用定理证明器验证输出是否满足原则
- **可证明安全**：为关键场景提供数学级别的安全保证

### 多智能体宪法

- **多模型审查**：多个模型独立审查，投票决定是否需要修订
- **对抗性审查**：专门训练的"红队模型"尝试发现原则漏洞
- **群体智慧**：利用多个模型的集体判断提高审查质量

### 宪法演化

```
宪法原则的演化循环:

初始宪法 → 模型训练 → 发现边界案例 → 修订宪法 → 重新训练
                ↑                              ↓
                └──── 人类反馈 + 红队测试 ←────┘
```

- **持续改进**：根据红队测试和用户反馈持续优化宪法
- **版本管理**：宪法原则的版本控制和变更追踪
- **A/B 测试**：对比不同宪法版本的效果

### 跨文化对齐

- **文化适配**：不同地区和文化可能需要不同的宪法原则
- **价值观冲突**：处理不同文化间价值观冲突的机制
- **全球化标准**：寻求全球通用的基本安全原则

## 与其他概念的关系

- [对齐](/glossary/alignment) 是 Constitutional AI 的核心目标
- [AI 安全](/glossary/ai-safety) 是宪法原则的主要关注领域
- [红队测试](/glossary/red-teaming) 用于发现和修复宪法原则的漏洞
- [内容审核](/glossary/content-moderation) 是宪法原则在输出层的具体实现
- [偏见](/glossary/bias) 是宪法需要处理的公平性议题
- [可解释性](/glossary/explainability) 帮助理解宪法原则如何影响模型行为

## 延伸阅读

- [对齐](/glossary/alignment) — Constitutional AI 在对齐方法中的位置
- [AI 安全](/glossary/ai-safety) — 宪法原则覆盖的安全维度
- [红队测试](/glossary/red-teaming) — 验证宪法原则的有效性
- [内容审核](/glossary/content-moderation) — 宪法原则的输出层实现
- [Constitutional AI 论文](https://arxiv.org/abs/2212.08073) — Anthropic 原始论文
- [AI Safety via Debate](https://arxiv.org/abs/2312.08073) — 通过辩论实现 AI 安全
- [Scalable Agent Oversight](https://arxiv.org/abs/2312.08073) — 可扩展的智能体监督
- [Anthropic Core Views](https://www.anthropic.com/index/core-views) — Claude 的核心价值观
