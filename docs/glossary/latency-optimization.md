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

## 实施步骤

### 第一步：测量当前延迟基线

使用 [可观测性](/glossary/observability) 工具测量各环节延迟：

```python
from prometheus_client import Histogram

ttft_histogram = Histogram("ttft_seconds", "Time to first token", buckets=[0.1, 0.2, 0.5, 1.0, 2.0, 5.0])
```

识别瓶颈环节：网络传输、模型推理、检索、后处理。

### 第二步：设定延迟目标

根据业务场景设定目标：

| 场景     | TTFT 目标 | 端到端目标 |
| -------- | --------- | ---------- |
| 实时对话 | < 500ms   | < 3s       |
| 内容生成 | < 1s      | < 10s      |
| 离线分析 | < 5s      | 无严格要求 |

### 第三步：实施流式输出

启用流式模式，将 TTFT 从秒级降至数百毫秒：

```python
response = client.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": prompt}],
    stream=True,  # 启用流式
)
```

### 第四步：引入缓存

对高频查询启用缓存，命中时延迟降至毫秒级。详见 [缓存](/glossary/caching)。

### 第五步：优化模型选择

根据延迟要求选择模型：

```python
MODEL_LATENCY = {
    "gpt-4o-mini": {"ttft_ms": 300, "tps": 150},
    "gpt-4o": {"ttft_ms": 500, "tps": 100},
    "claude-haiku": {"ttft_ms": 400, "tps": 120},
}
```

### 第六步：并行化和异步处理

```python
async def async_pipeline(user_input):
    # 并行执行独立任务
    context_task = retrieve_context(user_input)
    embedding_task = get_embedding(user_input)
    context, embedding = await asyncio.gather(context_task, embedding_task)

    # 依赖前序结果的任务
    response = await generate_response(user_input, context)
    return response
```

### 第七步：持续监控和优化

- 监控 TTFT、TPS、P99 延迟
- 定期审查延迟预算分配
- 根据监控数据调整优化策略

## 最佳实践

- **TTFT 是关键指标**：用户感知的"快慢"主要取决于首字响应时间
- **流式输出优先**：对所有对话场景启用流式输出
- **缓存高频查询**：缓存命中提供极低延迟的响应路径
- **异步并行处理**：独立任务并行执行，减少总延迟
- **设置延迟预算**：为各环节分配延迟预算，便于定位瓶颈
- **实现降级策略**：超时或故障时降级到缓存或简化回答

## 常见问题与避坑

### Q1：如何定位延迟瓶颈？

使用分布式追踪（如 OpenTelemetry）记录各环节耗时：

- 网络传输时间
- 检索时间（RAG 场景）
- 模型推理时间（TTFT + 生成时间）
- 后处理时间

通过追踪数据识别耗时最长的环节。

### Q2：流式输出能减少总延迟吗？

不能。流式输出改善的是**感知延迟**（TTFT），而非总生成时间。模型仍然需要相同的时间生成完整回复，但用户可以在生成过程中就开始阅读。

### Q3：更快的模型一定更贵吗？

通常如此，但不绝对：

- GPT-4o-mini 比 GPT-4 更快且更便宜
- Claude Haiku 比 Claude Sonnet 更快且更便宜

通过 [模型评估](/glossary/model-evaluation) 找到延迟和成本的最优平衡点。

### Q4：如何优化向量检索的延迟？

- 使用 HNSW 等近似最近邻算法
- 减少向量维度（如从 1536 降到 384）
- 增加缓存命中率
- 使用更小的索引（如 IVF 而非 HNSW）

### Q5：延迟优化和成本优化如何平衡？

两者存在权衡关系：

- 更快的模型通常更贵
- 缓存同时改善延迟和成本（最佳选择）
- 流式输出改善延迟但不影响成本
- 通过模型路由在不同场景选择最优策略

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
