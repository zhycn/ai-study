---
title: 延迟优化
description: Latency Optimization，减少响应时间
---

# 延迟优化

让 AI 回答更快的各种技术手段。用户可不想等十几秒才看到第一个字，延迟优化就是从网络、模型、缓存等各个环节想办法，让响应速度从"等一等"变成"秒回"。

## 概述

延迟优化（Latency Optimization）是指通过各种技术手段系统性地减少 AI 应用的响应时间，提升用户体验和系统效率的工程实践。

在 AI 应用中，延迟由多个环节组成：网络传输、请求排队、模型推理、后处理等。优化延迟需要识别瓶颈环节，针对性地采取措施。不同类型的 AI 应用对延迟的要求不同：对话应用要求秒级响应，而离线分析可以接受分钟级延迟。

理解延迟的构成是优化的第一步。AI 应用的延迟主要来自：

- **TTFT（Time to First Token）**：从发送请求到收到第一个 Token 的时间
- **TPS（Tokens Per Second）**：Token 生成速度
- **端到端延迟**：完整请求-响应周期的总时间

::: tip
TTFT 是影响用户体验最关键的指标。用户感知到的"快慢"主要取决于首字响应时间，而非总生成时间。这也是 [流式输出](/glossary/streaming) 能显著改善体验的原因。
:::

## 为什么重要

- **用户体验**：低延迟是良好用户体验的基础。研究表明，响应时间超过 2 秒会导致用户流失率显著上升
- **业务指标**：延迟直接影响留存率、转化率和用户满意度
- **实时应用**：语音对话、实时翻译等场景对延迟有严格要求（通常 < 500ms）
- **竞争优势**：更快的响应速度带来差异化竞争优势
- **系统效率**：低延迟意味着更高的吞吐量，单位时间内处理更多请求

## 关键延迟指标

| 指标           | 全称                  | 说明                      | 目标值     |
| -------------- | --------------------- | ------------------------- | ---------- |
| **TTFT**       | Time to First Token   | 首字响应时间              | < 1s       |
| **TPOT**       | Time Per Output Token | 每个输出 Token 的生成时间 | < 50ms     |
| **TPS**        | Tokens Per Second     | 每秒生成的 Token 数       | > 20       |
| **P50 延迟**   | 中位延迟              | 50% 请求的延迟            | < 2s       |
| **P99 延迟**   | 尾部延迟              | 99% 请求的延迟            | < 5s       |
| **端到端延迟** | End-to-End Latency    | 完整请求-响应时间         | 视场景而定 |

## 优化策略

### 1. 流式输出

流式输出是降低感知延迟最有效的手段：

```python
# 非流式：用户需要等待完整响应（可能 5-10 秒）
response = client.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": prompt}],
    stream=False
)
# TTFT = 总延迟 = 5-10s

# 流式：用户数百毫秒内看到第一个字
response = client.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": prompt}],
    stream=True
)
# TTFT = 200-500ms，总延迟不变但体验大幅提升
```

详见 [流式输出](/glossary/streaming)。

### 2. 缓存预热

```python
class CacheWarmer:
    """缓存预热器"""

    def __init__(self, cache, warmup_queries):
        self.cache = cache
        self.warmup_queries = warmup_queries

    def warmup(self):
        """预热缓存：提前加载高频查询"""
        for query in self.warmup_queries:
            if self.cache.get(query) is None:
                result = call_llm(query)
                self.cache.set(query, result, ttl=7200)

    def schedule_warmup(self, interval=3600):
        """定时预热"""
        while True:
            self.warmup()
            time.sleep(interval)
```

### 3. 模型选择与路由

```python
# 延迟感知的模型路由
MODEL_LATENCY = {
    "gpt-4o-mini": {"ttft_ms": 300, "tps": 150},
    "gpt-4o": {"ttft_ms": 500, "tps": 100},
    "gpt-4": {"ttft_ms": 800, "tps": 50},
    "claude-haiku": {"ttft_ms": 400, "tps": 120},
    "claude-sonnet": {"ttft_ms": 600, "tps": 80},
}

def select_model_by_latency_requirement(max_ttft_ms):
    """根据延迟要求选择模型"""
    candidates = [
        (name, specs)
        for name, specs in MODEL_LATENCY.items()
        if specs["ttft_ms"] <= max_ttft_ms
    ]

    if not candidates:
        return "gpt-4o-mini"  # 默认

    # 选择最快的
    return min(candidates, key=lambda x: x[1]["ttft_ms"])[0]
```

### 4. 异步处理

```python
import asyncio

async def async_pipeline(user_input):
    """异步处理流水线"""
    # 并行执行独立任务
    context_task = retrieve_context(user_input)
    embedding_task = get_embedding(user_input)

    # 等待并行任务完成
    context, embedding = await asyncio.gather(
        context_task,
        embedding_task,
    )

    # 依赖前序结果的任务
    response = await generate_response(user_input, context)

    # 后处理可以异步进行
    asyncio.create_task(log_interaction(user_input, response))

    return response
```

### 5. 边缘计算

```text
┌─────────────────────────────────────────────────────┐
│                    用户请求                           │
└──────────────────────┬──────────────────────────────┘
                       ▼
              ┌─────────────────┐
              │  边缘节点 (CDN)  │  ← 缓存命中：10-50ms
              │  就近响应        │
              └────────┬────────┘
                       │ Miss
                       ▼
              ┌─────────────────┐
              │  区域服务器      │  ← 区域处理：100-300ms
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │  中心 LLM API   │  ← 完整调用：500-5000ms
              └─────────────────┘
```

### 6. 请求优化

```python
# 减少不必要的请求参数
def optimize_request(prompt):
    """优化请求参数"""
    return {
        "model": "gpt-4o-mini",      # 选择更快的模型
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 500,           # 限制最大输出
        "temperature": 0.7,          # 适当的温度
        # 移除不必要的参数
        # "presence_penalty": 0,     # 默认值，无需指定
        # "frequency_penalty": 0,    # 默认值，无需指定
    }
```

## 延迟优化技术栈

### 推理加速框架

| 框架             | 特点                   | 适用场景             |
| ---------------- | ---------------------- | -------------------- |
| **vLLM**         | PagedAttention，高吞吐 | 本地部署批量推理     |
| **TensorRT-LLM** | NVIDIA GPU 优化        | NVIDIA GPU 推理      |
| **TGI**          | HuggingFace 官方框架   | HuggingFace 模型部署 |
| **Ollama**       | 轻量级，易用           | 本地开发和小规模部署 |

### 网络优化

```python
# 连接复用
import httpx

# 创建持久化客户端
client = httpx.AsyncClient(
    timeout=30.0,
    limits=httpx.Limits(
        max_connections=100,
        max_keepalive_connections=20,
    ),
)

# 复用连接，减少握手开销
async def make_request(prompt):
    response = await client.post(
        "https://api.openai.com/v1/chat/completions",
        json={"model": "gpt-4o-mini", "messages": [{"role": "user", "content": prompt}]},
    )
    return response.json()
```

### speculative decoding（投机解码）

```text
传统解码:
Draft Model → Token 1 → Token 2 → Token 3 → ... (串行)

投机解码:
Draft Model → Token 1 → Token 2 → Token 3 → ... (快速草稿)
                 ↓
Target Model → 验证多个 Token (并行验证)

效果: 2-3x 加速，取决于草稿模型质量
```

## 工程实践

### 延迟监控

```python
from prometheus_client import Histogram

# 延迟指标
ttft_histogram = Histogram('ttft_seconds', 'Time to first token',
                           buckets=[0.1, 0.2, 0.5, 1.0, 2.0, 5.0])
tps_gauge = Gauge('tokens_per_second', 'Tokens generated per second')

async def measure_latency(prompt):
    start = time.time()

    async for chunk in call_llm_streaming(prompt):
        if chunk.is_first:
            ttft = time.time() - start
            ttft_histogram.observe(ttft)

        yield chunk

    total_time = time.time() - start
    total_tokens = chunk.total_tokens
    tps = total_tokens / total_time
    tps_gauge.set(tps)
```

### 延迟预算分配

```python
# 端到端延迟预算分配（目标：2s）
LATENCY_BUDGET = {
    "network_request": 0.1,       # 100ms 网络传输
    "context_retrieval": 0.3,     # 300ms 向量检索
    "llm_ttft": 0.5,             # 500ms 首字响应
    "llm_generation": 0.8,       # 800ms Token 生成
    "post_processing": 0.1,      # 100ms 后处理
    "buffer": 0.2,               # 200ms 缓冲
    # 总计: 2.0s
}
```

### 降级策略

```python
async def generate_with_fallback(prompt, timeout=3.0):
    """带降级的生成策略"""
    try:
        # 尝试快速模型
        return await asyncio.wait_for(
            call_llm("gpt-4o-mini", prompt),
            timeout=timeout
        )
    except asyncio.TimeoutError:
        # 超时降级：使用缓存或返回简化回答
        cached = cache.get(prompt)
        if cached:
            return cached
        return "抱歉，服务繁忙，请稍后重试。"
```

## 与其他概念的关系

- [流式输出](/glossary/streaming) 是降低感知延迟的核心手段
- [缓存](/glossary/caching) 提供极低延迟的响应路径
- [可观测性](/glossary/observability) 提供延迟测量和监控的基础设施
- [成本优化](/glossary/cost-optimization) 与延迟优化存在权衡关系（更快的模型通常更贵）
- [批处理](/glossary/batch-processing) 是延迟优化的反面——牺牲延迟换取成本和效率
- [模型评估](/glossary/model-evaluation) 包含延迟指标的评估

## 延伸阅读

- [流式输出](/glossary/streaming) — 降低感知延迟的核心技术
- [缓存](/glossary/caching) — 极低延迟的响应路径
- [可观测性](/glossary/observability) — 延迟监控与测量
- [成本优化](/glossary/cost-optimization) — 延迟与成本的权衡
- [批处理](/glossary/batch-processing) — 牺牲延迟换取效率
- [vLLM 文档](https://docs.vllm.ai/) — 高性能推理框架
- [TensorRT-LLM 文档](https://nvidia.github.io/TensorRT-LLM/) — NVIDIA 推理加速
