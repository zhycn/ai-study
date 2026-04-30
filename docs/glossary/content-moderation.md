---
title: 内容审核
description: Content Moderation，识别和过滤 AI 系统中的有害内容
---

# 内容审核

## 概述

**内容审核**（Content Moderation）是指在 AI 系统中识别、分类和过滤有害内容的实践，涵盖暴力、仇恨、色情、虚假信息、自残指导等不符合安全和道德标准的内容。在 LLM 应用中，内容审核通常作用于两个方向：对用户输入进行审核（防止恶意输入），对模型输出进行审核（防止有害输出）。

内容审核是 AI 安全体系中的关键防线，但它本身也面临诸多挑战：审核标准的主观性、文化差异、语境理解困难、以及审核系统被绕过的风险。

```
内容审核在 AI 系统中的位置:

用户输入 → [输入审核] → 安全的输入 → [模型处理] → 原始输出 → [输出审核] → 安全的输出
              ↓                                              ↓
          阻断/标记                                       阻断/替换/标记
          恶意输入                                       有害输出
```

::: info
内容审核不是" censorship（审查）"，而是保护用户安全和遵守法律要求的必要措施。好的审核系统应该在安全和表达自由之间找到平衡。
:::

## 为什么重要

- **用户安全**：防止用户接触到暴力、仇恨、自残指导等有害内容
- **合规要求**：各国法律对在线内容有不同要求，如欧盟 DSA、中国《网络信息内容生态治理规定》
- **品牌保护**：有害内容传播会严重损害平台声誉
- **风险管理**：避免因内容问题导致的法律诉讼和监管处罚
- **生态健康**：维护平台内容生态的良性发展

## 审核类型

### 输入审核（Input Moderation）

过滤和检测用户发送的恶意输入：

```python
class InputModerator:
    def __init__(self):
        self.toxicity_classifier = load_toxicity_model()
        self.injection_detector = PromptInjectionDetector()

    def moderate(self, text: str) -> dict:
        """审核用户输入"""
        results = {
            # 毒性检测
            "toxicity": self.toxicity_classifier.predict(text),
            # 提示词注入检测
            "injection": self.injection_detector.detect(text),
            # PII 检测（防止用户发送他人隐私信息）
            "pii": self.detect_pii(text),
            # 长度检查
            "too_long": len(text) > MAX_INPUT_LENGTH,
        }

        results["should_block"] = any([
            results["toxicity"]["is_toxic"] and results["toxicity"]["score"] > 0.9,
            results["injection"]["is_injection"],
            results["too_long"],
        ])

        return results
```

### 输出审核（Output Moderation）

过滤和检测模型生成的有害输出：

```python
class OutputModerator:
    CATEGORIES = {
        "violence": "暴力内容",
        "hate": "仇恨言论",
        "self_harm": "自残/自杀",
        "sexual": "性相关内容",
        "illegal": "违法活动",
        "misinformation": "严重误导信息",
    }

    def moderate(self, text: str) -> dict:
        """审核模型输出"""
        # 使用审核模型（如 OpenAI Moderation API）
        result = call_moderation_api(text)

        flagged_categories = [
            cat for cat, flagged in result.categories.items() if flagged
        ]

        return {
            "flagged": result.flagged,
            "categories": flagged_categories,
            "scores": result.category_scores,
            "action": self._decide_action(flagged_categories, result.category_scores),
        }

    def _decide_action(self, categories: list, scores: dict) -> str:
        """根据违规类别和分数决定处理方式"""
        high_severity = {"violence", "hate", "self_harm", "illegal"}
        if any(cat in high_severity for cat in categories):
            return "block"
        elif any(scores.get(cat, 0) > 0.7 for cat in categories):
            return "block"
        else:
            return "flag_for_review"
```

### 实时审核（Real-time Moderation）

在内容生成过程中实时检测和拦截：

```python
class RealTimeModerator:
    def __init__(self, chunk_size: int = 10):
        self.chunk_size = chunk_size
        self.buffer = ""

    def check_stream(self, token: str) -> dict:
        """在流式生成过程中实时审核"""
        self.buffer += token

        # 每积累一定数量的 token 审核一次
        if len(self.buffer) >= self.chunk_size:
            result = self.moderate(self.buffer)
            if result["should_block"]:
                return {"action": "stop", "reason": result["reason"]}
            self.buffer = ""  # 清空缓冲区

        return {"action": "continue"}
```

## 技术方法

### 规则引擎（Rule-based）

基于关键词、正则表达式和预定义规则：

```python
class RuleBasedModerator:
    def __init__(self):
        self.blocked_keywords = self._load_keywords()
        self.patterns = self._load_patterns()

    def _load_keywords(self) -> dict:
        return {
            "violence": ["杀人", "爆炸物", "毒药", ...],
            "hate_speech": ["种族歧视词汇", ...],
            "self_harm": ["自杀方法", "自残", ...],
        }

    def moderate(self, text: str) -> dict:
        text_lower = text.lower()
        for category, keywords in self.blocked_keywords.items():
            for keyword in keywords:
                if keyword in text_lower:
                    return {"flagged": True, "category": category, "method": "keyword"}

        for category, patterns in self.patterns.items():
            for pattern in patterns:
                if re.search(pattern, text):
                    return {"flagged": True, "category": category, "method": "regex"}

        return {"flagged": False}
```

::: tip
规则引擎的优点是透明、可控、低延迟，但缺点是容易被绕过（同义词、谐音、变体），且无法理解语境。通常作为第一道防线，与 ML 模型配合使用。
:::

### 机器学习分类器

训练专门的内容分类模型：

```python
from transformers import pipeline

class MLModerator:
    def __init__(self):
        # 使用预训练的内容审核模型
        self.classifier = pipeline(
            "text-classification",
            model="unitary/toxic-bert",
            return_all_scores=True,
        )

    def moderate(self, text: str) -> dict:
        results = self.classifier(text)[0]
        scores = {r["label"]: r["score"] for r in results}

        # 判断是否违规
        toxic_labels = ["toxic", "severe_toxic", "threat", "hate", "obscene"]
        max_toxic_score = max(scores.get(label, 0) for label in toxic_labels)

        return {
            "flagged": max_toxic_score > 0.5,
            "scores": scores,
            "max_toxic_score": max_toxic_score,
        }
```

### 大模型审核（LLM-as-a-Judge）

使用大语言模型作为审核器：

```python
MODERATION_PROMPT = """你是一个内容审核专家。请判断以下内容是否违规。

审核标准：
1. 暴力或威胁性内容
2. 仇恨言论或歧视
3. 色情或性暗示内容
4. 自残或自杀指导
5. 违法活动指导
6. 严重误导信息

内容：{text}

请以 JSON 格式返回审核结果：
{{
  "flagged": true/false,
  "categories": ["违规类别"],
  "severity": "low/medium/high",
  "reason": "违规原因"
}}"""

def llm_moderate(text: str, judge_model) -> dict:
    """使用 LLM 作为审核器"""
    prompt = MODERATION_PROMPT.format(text=text)
    response = judge_model.generate(prompt)
    return parse_json_response(response)
```

### 多模型审核（Ensemble Moderation）

结合多种审核方法提高准确率：

```python
class EnsembleModerator:
    def __init__(self):
        self.rule_moderator = RuleBasedModerator()
        self.ml_moderator = MLModerator()
        self.llm_moderator = LLMModerator()

    def moderate(self, text: str) -> dict:
        """多模型集成审核"""
        results = {
            "rule": self.rule_moderator.moderate(text),
            "ml": self.ml_moderator.moderate(text),
        }

        # 如果规则或 ML 模型明确判定，直接返回
        if results["rule"]["flagged"]:
            return {**results["rule"], "method": "rule", "confidence": "high"}
        if results["ml"]["flagged"] and results["ml"]["max_toxic_score"] > 0.8:
            return {**results["ml"], "method": "ml", "confidence": "high"}

        # 边界情况使用 LLM 审核
        if results["ml"]["max_toxic_score"] > 0.3:
            results["llm"] = self.llm_moderator.moderate(text)
            if results["llm"]["flagged"]:
                return {**results["llm"], "method": "ensemble", "confidence": "medium"}

        return {"flagged": False, "method": "ensemble", "confidence": "high"}
```

## 审核策略

### 分级处理策略

```
内容审核分级:

Level 1 - 自动阻断:
- 明确的违法内容（儿童色情、恐怖主义）
- 高置信度的仇恨言论和暴力威胁
- 已知的恶意模式（如提示词注入）

Level 2 - 自动替换:
- 轻度违规内容替换为安全回复
- "抱歉，我无法提供相关信息"

Level 3 - 标记人工审核:
- 中等置信度的违规判定
- 语境依赖的内容（讽刺、引用、学术讨论）
- 用户申诉的内容

Level 4 - 事后审核:
- 低优先级内容的批量审核
- 用户举报内容的处理
- 审核策略的持续优化
```

### 语境感知审核

```python
class ContextAwareModerator:
    def moderate_with_context(self, text: str, context: dict) -> dict:
        """考虑语境的审核"""
        # 基础审核
        base_result = self.base_moderator.moderate(text)

        if not base_result["flagged"]:
            return base_result

        # 考虑语境因素
        context_factors = {
            "is_educational": context.get("purpose") == "education",
            "is_research": context.get("purpose") == "research",
            "is_quoted": context.get("is_quote", False),
            "user_age": context.get("user_age"),
            "user_history": context.get("user_risk_level", "low"),
        }

        # 教育/研究场景可能放宽某些限制
        if context_factors["is_educational"] and base_result["severity"] == "low":
            return {**base_result, "action": "warn", "flagged": False}

        # 未成年人严格审核
        if context_factors.get("user_age", 18) < 18:
            return {**base_result, "action": "block", "flagged": True}

        return base_result
```

## 工程实践

### 审核系统架构

```
生产环境审核系统:

┌─────────────────────────────────────────────────────┐
│                    API Gateway                        │
└──────────────────────┬──────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│                  审核服务层                            │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐ │
│  │ 输入审核  │  │ 输出审核  │  │ 流式审核            │ │
│  └──────────┘  └──────────┘  └────────────────────┘ │
└──────────────────────┬──────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│                  审核引擎层                            │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐ │
│  │ 规则引擎  │  │ ML 模型  │  │ LLM 审核器          │ │
│  └──────────┘  └──────────┘  └────────────────────┘ │
└──────────────────────┬──────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│                  数据层                                │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐ │
│  │ 规则库    │  │ 审核日志  │  │ 人工审核队列        │ │
│  └──────────┘  └──────────┘  └────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### 审核策略配置

```yaml
# moderation_config.yaml
moderation:
  input:
    max_length: 4000
    blocked_patterns:
      - type: prompt_injection
        action: block
      - type: pii
        action: mask
    toxicity:
      threshold: 0.7
      action: block

  output:
    categories:
      violence:
        threshold: 0.5
        action: block
      hate:
        threshold: 0.5
        action: block
      self_harm:
        threshold: 0.3
        action: block_with_resources
      sexual:
        threshold: 0.7
        action: block
      misinformation:
        threshold: 0.8
        action: flag_for_review

  fallback:
    on_error: block  # 审核服务出错时的默认行为
    timeout_ms: 500
```

## 与其他概念的关系

- 内容审核是 [AI 安全](/glossary/ai-safety) 的输出防护层
- [提示词注入](/glossary/prompt-injection) 的防护需要输入审核配合
- [红队测试](/glossary/red-teaming) 用于评估审核系统的有效性
- [可解释性](/glossary/explainability) 帮助解释审核决策的原因
- [偏见](/glossary/bias) 可能导致审核系统对不同群体的不公平对待
- [对齐](/glossary/alignment) 训练可以减少模型产生需要审核的有害内容

## 延伸阅读

- [AI 安全](/glossary/ai-safety) — 内容审核在安全体系中的位置
- [提示词注入](/glossary/prompt-injection) — 输入审核的核心场景
- [红队测试](/glossary/red-teaming) — 评估审核系统
- [偏见](/glossary/bias) — 审核系统中的公平性问题
- [OpenAI Moderation API](https://platform.openai.com/docs/guides/moderation) — 官方审核 API
- [Perspective API](https://perspectiveapi.com/) — Google 的内容审核 API
- [AI and Content Moderation](https://www.unesco.org/en/articles/ai-and-content-moderation) — UNESCO 报告
