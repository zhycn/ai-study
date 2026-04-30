---
title: 成本优化
description: Cost Optimization，降低 AI 应用运营成本
---

# 成本优化

用 AI 很贵？这个领域就是教你怎么花最少的钱达到最好的效果——比如用缓存减少重复调用、选合适大小的模型、压缩提示词长度等，在不影响质量的前提下把钱花在刀刃上。

## 概述

成本优化（Cost Optimization）是指通过技术手段和策略选择，系统性地降低 AI 应用运营成本的实践。AI 应用的成本结构与传统软件不同，主要包含 API 调用费用（按 [Token](/glossary/token) 计费）、计算资源费用（GPU/CPU）、数据存储费用以及开发维护人力成本。

随着 AI 应用从原型走向生产环境，成本优化从"可选项"变为"必选项"。一个设计不佳的 AI 应用，其 API 成本可能远超基础设施成本，直接影响商业可行性。

::: tip
成本优化不是单纯地"省钱"，而是在保证质量的前提下找到最优的成本效益比。过度优化可能导致用户体验下降，需要在成本与质量之间找到平衡点。
:::

## 为什么重要

- **商业可行性**：降低 AI 应用落地门槛，使产品定价具有竞争力
- **规模化前提**：没有成本优化，用户增长意味着成本线性增长，无法实现规模经济
- **竞争优势**：同等质量下成本更低的产品具有定价优势
- **可持续性**：长期运营的必要性，避免"用得起，养不起"的困境
- **资源效率**：促使团队更精细地设计架构和选择模型

## 成本构成分析

### API 调用成本

| 成本项     | 计费方式                | 优化方向                 |
| ---------- | ----------------------- | ------------------------ |
| 输入 Token | 按输入 Token 数计费     | 压缩提示词、减少上下文   |
| 输出 Token | 按输出 Token 数计费     | 限制最大输出、精炼回答   |
| 模型选择   | 不同模型单价不同        | 按任务选择性价比最优模型 |
| 调用次数   | 部分 API 按调用次数计费 | 缓存、批处理减少调用     |

### 基础设施成本

| 成本项     | 计费方式         | 优化方向               |
| ---------- | ---------------- | ---------------------- |
| GPU 实例   | 按实例规格和时长 | 按需实例、Spot 实例    |
| 向量数据库 | 按存储和查询量   | 索引优化、分级存储     |
| 缓存服务   | 按内存和流量     | 合理设置 TTL、压缩数据 |
| 网络带宽   | 按流量或带宽     | CDN 加速、压缩传输     |

### 隐性成本

- **开发人力**：复杂的优化策略增加开发和维护成本
- **监控成本**：成本优化需要额外的监控和分析基础设施
- **试错成本**：模型选择和参数调优的试验成本

## 主要优化策略

### 1. 模型选择优化

```python
# 根据任务复杂度选择模型
MODEL_ROUTING = {
    "simple_classification": "gpt-4o-mini",    # 简单分类，低成本
    "summarization": "gpt-4o-mini",            # 摘要，低成本
    "creative_writing": "gpt-4o",              # 创意写作，高质量
    "complex_reasoning": "gpt-4",              # 复杂推理，最强模型
    "code_generation": "claude-sonnet-4-20250514",  # 代码生成
}

def select_model(task_type):
    """根据任务类型选择最合适的模型"""
    return MODEL_ROUTING.get(task_type, "gpt-4o-mini")
```

::: tip
不要对所有任务都使用最强模型。80% 的日常任务可能只需要中等模型，只有 20% 的复杂任务需要顶级模型。这种"模型路由"策略可以节省 40%-60% 的 API 成本。
:::

### 2. 提示词优化

```python
# 优化前：冗余的提示词
BAD_PROMPT = """
你是一个非常有用的 AI 助手。你有很多年的经验，擅长回答各种问题。
你的回答应该尽量准确、详细、有帮助。
请注意，你应该用中文回答用户的问题。
用户的问题是：{question}
"""

# 优化后：精简的提示词
GOOD_PROMPT = """用中文回答：{question}"""

# Token 对比：
# BAD_PROMPT: ~65 tokens
# GOOD_PROMPT: ~8 tokens
# 节省: ~88%
```

提示词优化技巧：

- **去除冗余**：删除不必要的角色设定和礼貌用语
- **精简指令**：用简洁的语言表达核心需求
- **结构化输出**：要求 JSON 等结构化格式，减少多余文本
- **上下文裁剪**：只保留与当前任务相关的上下文

### 3. 缓存策略

```python
class CostAwareCache:
    """成本感知缓存"""

    def __init__(self, cache, cost_threshold=0.01):
        self.cache = cache
        self.cost_threshold = cost_threshold  # 低于此成本不缓存（不划算）

    def get_or_compute(self, prompt, model, compute_fn):
        cached = self.cache.get(prompt)
        if cached:
            return cached, "cache_hit"

        result = compute_fn(prompt)

        # 估算本次调用的成本
        cost = estimate_cost(prompt, result, model)
        if cost > self.cost_threshold:
            # 成本较高，值得缓存
            self.cache.set(prompt, result)

        return result, "cache_miss"
```

缓存是成本优化最有效的手段之一。对于高频重复查询，缓存命中率可达 30%-70%。详见 [缓存](/glossary/caching)。

### 4. 批处理

使用批处理 API 而非实时 API，通常可节省 50% 成本：

```python
# 实时 API：$10/1M input tokens
# 批处理 API：$5/1M input tokens（50% 折扣）

# 适合批处理的场景：
# - 离线数据分析
# - 批量内容生成
# - 定时报告生成
# - 模型评估测试
```

详见 [批处理](/glossary/batch-processing)。

### 5. 上下文窗口优化

```python
def optimize_context(messages, max_tokens=8192):
    """优化上下文窗口使用"""
    import tiktoken

    enc = tiktoken.get_encoding("cl100k_base")

    # 计算当前 Token 数
    total_tokens = sum(
        len(enc.encode(msg["content"]))
        for msg in messages
    )

    if total_tokens <= max_tokens:
        return messages

    # 保留系统消息和最近的消息
    system_msg = next((m for m in messages if m["role"] == "system"), None)
    recent_messages = []
    remaining = max_tokens - (len(enc.encode(system_msg["content"])) if system_msg else 0)

    for msg in reversed(messages):
        if msg["role"] == "system":
            continue
        msg_tokens = len(enc.encode(msg["content"]))
        if remaining >= msg_tokens:
            recent_messages.insert(0, msg)
            remaining -= msg_tokens
        else:
            # 截断中间消息
            truncated = truncate_message(msg, remaining, enc)
            if truncated:
                recent_messages.insert(0, truncated)
            break

    result = []
    if system_msg:
        result.append(system_msg)
    result.extend(recent_messages)

    return result
```

### 6. 输出长度控制

```python
# 限制最大输出 Token 数
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": prompt}],
    max_tokens=500,        # 限制最大输出
    temperature=0.7,
)

# 在提示词中明确要求简洁
prompt = """请用不超过 100 字回答：{question}"""
```

## 成本监控与分析

### 成本追踪

```python
class CostTracker:
    """成本追踪器"""

    def __init__(self):
        self.daily_costs = {}

    def record(self, model, input_tokens, output_tokens, cost):
        date = datetime.now().strftime("%Y-%m-%d")
        if date not in self.daily_costs:
            self.daily_costs[date] = {}

        if model not in self.daily_costs[date]:
            self.daily_costs[date][model] = {
                "input_tokens": 0,
                "output_tokens": 0,
                "cost": 0,
                "calls": 0,
            }

        usage = self.daily_costs[date][model]
        usage["input_tokens"] += input_tokens
        usage["output_tokens"] += output_tokens
        usage["cost"] += cost
        usage["calls"] += 1

    def get_trend(self, days=7):
        """获取成本趋势"""
        trend = []
        for i in range(days):
            date = (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d")
            daily = self.daily_costs.get(date, {})
            total = sum(m["cost"] for m in daily.values())
            trend.append({"date": date, "cost": total})
        return trend
```

### 成本告警

```python
def check_cost_alerts(tracker, thresholds):
    """成本告警检查"""
    today = datetime.now().strftime("%Y-%m-%d")
    daily = tracker.daily_costs.get(today, {})
    total_cost = sum(m["cost"] for m in daily.values())

    alerts = []
    for name, threshold in thresholds.items():
        if total_cost >= threshold:
            alerts.append({
                "type": name,
                "current": total_cost,
                "threshold": threshold,
                "message": f"今日成本 ${total_cost:.2f} 已达{name}阈值 ${threshold:.2f}",
            })

    return alerts

# 使用
thresholds = {
    "warning": 50,    # 警告阈值
    "critical": 100,  # 严重阈值
}
alerts = check_cost_alerts(tracker, thresholds)
```

## 与其他概念的关系

- [缓存](/glossary/caching) 是成本优化最有效的手段，直接减少 API 调用
- [批处理](/glossary/batch-processing) API 通常比实时 API 便宜 50%
- [模型评估](/glossary/model-evaluation) 帮助找到性价比最优的模型
- [Token](/glossary/token) 是 API 成本的基本计量单位
- [可观测性](/glossary/observability) 提供成本追踪和分析的基础设施
- [量化](/glossary/quantization) 降低本地部署模型的计算成本

## 延伸阅读

- [缓存](/glossary/caching) — 减少重复调用降低成本
- [批处理](/glossary/batch-processing) — 批量处理享受折扣
- [模型评估](/glossary/model-evaluation) — 选择性价比最优模型
- [Token](/glossary/token) — 成本的基本计量单位
- [量化](/glossary/quantization) — 降低本地推理成本
- [OpenAI 定价页面](https://openai.com/api/pricing/) — OpenAI 模型定价
- [Anthropic 定价页面](https://www.anthropic.com/pricing) — Claude 模型定价
