---
title: 幻觉
description: Hallucination，模型生成看似合理但实际错误的内容
---

# 幻觉

AI"一本正经地胡说八道"的现象。它说出来的话听起来很有道理、语气很自信，但内容完全是编的。就像一个特别会忽悠的人，能把假话说得跟真的一样，这是目前 AI 最让人头疼的问题之一。

## 概述

幻觉（Hallucination）是指 AI 模型生成看似合理、流畅，但实际上不准确、虚假或完全虚构的内容的现象。这是大语言模型最核心的技术挑战之一，也是限制其在关键场景（如医疗、法律、金融）应用的主要障碍。

幻觉不同于简单的"错误"——它的特点是输出在语言上自然流畅、逻辑上看似合理，但事实基础完全错误。这种"自信的胡说"比明显的错误更具误导性。

## 为什么重要

- **可靠性**：幻觉直接影响 AI 输出在实际应用中的可信度
- **风险控制**：在医疗、法律、金融等关键场景，幻觉可能导致严重后果
- **质量评估**：幻觉率是评估模型能力的核心指标之一
- **技术挑战**：完全消除幻觉仍是未解决的开放问题

::: warning
研究表明，即使是最新的 GPT-4 和 Claude 3，在特定任务上的幻觉率仍可达 10-30%。在要求 100% 准确性的场景中，必须引入额外的验证机制。
:::

## 幻觉类型

### 事实性幻觉（Factual Hallucination）

模型生成与客观事实不符的内容：

```
用户: "爱因斯坦在哪一年获得了诺贝尔奖？"
模型: "爱因斯坦在 1921 年获得了诺贝尔物理学奖。"  # 正确
模型: "爱因斯坦在 1905 年获得了诺贝尔物理学奖。"  # 幻觉（1905 是奇迹年，但获奖是 1921 年）
```

### 编造内容（Fabrication）

模型虚构不存在的引用、数据、人物或事件：

```
用户: "请推荐几篇关于 Transformer 优化的论文"
模型: "推荐以下论文：
1. 'Efficient Transformer Training' by Smith et al., NeurIPS 2023  # 可能不存在
2. 'Scaling Laws for Attention' by Johnson et al., ICML 2024      # 可能不存在"
```

### 逻辑性幻觉（Logical Hallucination）

模型在推理过程中出现前后矛盾：

```
用户: "我有 3 个苹果，吃了 1 个，又买了 2 个，现在有几个？"
模型: "你有 3 个苹果，吃了 1 个后剩 2 个，又买了 2 个，所以现在有 3 个。"  # 错误，应该是 4 个
```

### 指令跟随幻觉（Instruction-following Hallucination）

模型声称遵循了指令，但实际上没有：

```
用户: "请用中文回答"
模型: "Sure, I'd be happy to help!"  # 没有遵循语言指令
```

## 产生原因

### 训练数据缺陷

模型从互联网文本中学习，而互联网包含大量错误信息、过时内容和虚构故事。模型无法区分事实和虚构。

```
训练数据中的矛盾:
- 来源 A: "Python 由 Guido van Rossum 于 1991 年创建"
- 来源 B: "Python 由 Guido van Rossum 于 1989 年开始开发"
- 来源 C: "Python 是 Larry Page 发明的"  # 错误信息
```

### 自回归生成的误差累积

模型逐个 [Token](/glossary/token) 生成文本，早期生成的错误会影响后续所有内容：

```
正确: "巴黎是法国的首都" -> "法国位于欧洲" -> "欧洲是世界第二大洲"
幻觉: "巴黎是德国的首都" -> "德国位于非洲" -> "非洲是世界最大洲"（误差累积）
```

### 过度泛化

模型将训练数据中的模式过度推广到新场景：

```
训练模式: "X 公司收购了 Y 公司"（常见新闻模式）
用户输入: "微软和 OpenAI"
幻觉输出: "微软收购了 OpenAI"  # 实际是投资关系，非收购
```

## 缓解方法

### RAG（检索增强生成）

通过外部知识库提供事实依据，减少模型"凭空编造"：

```python
from openai import OpenAI

client = OpenAI()

def rag_response(query, knowledge_base):
    # 1. 检索相关知识
    relevant_docs = retrieve(query, knowledge_base)

    # 2. 构建带上下文的提示
    context = "\n".join(relevant_docs)
    prompt = f"""基于以下信息回答问题：
{context}

问题：{query}

如果信息不足，请明确说明"根据提供的信息无法回答"。"""

    # 3. 生成回答
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content
```

### 提示工程

使用特定提示策略减少幻觉：

```python
# 减少幻觉的提示模板
ANTI_HALLUCINATION_PROMPT = """请基于以下信息回答问题：

{context}

问题：{question}

回答要求：
1. 仅使用上述信息中的内容
2. 如果信息不足以回答问题，请说"根据提供的信息无法确定"
3. 不要编造任何数据、引用或事实
4. 对于不确定的内容，请使用"可能"、"据推测"等限定词"""
```

### 事实核查与验证

引入外部验证机制：

```python
def fact_check(response, knowledge_base):
    """对模型输出进行事实核查"""
    # 提取声明
    claims = extract_claims(response)

    # 逐一验证
    verified_claims = []
    for claim in claims:
        is_supported = verify_against_kb(claim, knowledge_base)
        verified_claims.append({
            "claim": claim,
            "supported": is_supported,
            "confidence": calculate_confidence(claim, knowledge_base)
        })

    return verified_claims
```

### [对齐](/glossary/alignment) 训练

通过 RLHF 等对齐技术，训练模型在不确定时承认不知道：

```
训练示例:
用户: "XYZ 公司的 CEO 是谁？"（XYZ 是虚构公司）

未对齐模型: "XYZ 公司的 CEO 是 John Smith。"  # 幻觉
对齐模型: "我无法找到关于 XYZ 公司的信息，无法确定其 CEO 是谁。"  # 正确
```

::: tip
结合多种方法效果最佳：RAG 提供事实依据 + 提示工程引导行为 + 对齐训练提升可靠性 + 事实核查提供安全保障。
:::

## 评估幻觉

### 常见评估指标

| 指标                             | 说明                       |
| -------------------------------- | -------------------------- |
| **事实一致性（Factuality）**     | 输出与已知事实的匹配程度   |
| **忠实度（Faithfulness）**       | 输出是否忠实于提供的上下文 |
| **幻觉率（Hallucination Rate）** | 包含幻觉的生成样本比例     |

### 自动化评估工具

```python
# 使用 RAGAS 评估幻觉
from ragas.metrics import faithfulness
from ragas import evaluate

# 评估数据集
dataset = {
    "question": ["问题1", "问题2"],
    "answer": ["回答1", "回答2"],
    "contexts": [["上下文1"], ["上下文2"]]
}

result = evaluate(dataset, metrics=[faithfulness])
print(f"忠实度得分: {result['faithfulness']}")
```

## 与其他概念的关系

- [Token](/glossary/token) 级别的生成不确定性是幻觉的微观来源
- [上下文窗口](/glossary/context-window) 过长时会出现"迷失中间"现象，增加幻觉概率
- [RAG](/glossary/rag) 是减少幻觉最有效的工程手段
- [对齐](/glossary/alignment) 训练让模型学会在不确定时拒绝回答
- [温度](/glossary/temperature) 参数影响幻觉概率，高温度增加创造性但也增加幻觉

## 延伸阅读

- [Token](/glossary/token) — 幻觉产生的微观机制
- [上下文窗口](/glossary/context-window) — 长上下文中的幻觉问题
- [RAG](/glossary/rag) — 通过检索减少幻觉
- [对齐](/glossary/alignment) — 训练模型减少幻觉
- [温度](/glossary/temperature) — 输出随机性对幻觉的影响
- [Survey on Hallucination in LLMs](https://arxiv.org/abs/2311.05232) — 幻觉综述论文
- [RAGAS 评估框架](https://github.com/explodinggradients/ragas) — 自动化评估工具
