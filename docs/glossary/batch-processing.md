---
title: 批处理 (Batch Processing)
description: Batch Processing，批量处理大量请求
---

# 批处理 (Batch Processing)

把一堆任务攒起来一起处理，而不是来一个处理一个。虽然不能立刻得到结果，但价格便宜很多——就像快递集中发货比单个寄便宜一样，适合不着急但量大的场景。

## 概述

批处理（Batch Processing）是指将多个独立的请求或任务收集起来，合并为一个批次进行集中处理的模式。与实时处理（Real-time Processing）不同，批处理不追求即时响应，而是通过积累一定数量的任务后统一处理，以换取更高的处理效率和更低的单位成本。

在 AI 应用中，批处理广泛应用于离线数据分析、大规模内容生成、模型推理加速等场景。许多 LLM API 提供商（如 OpenAI 的 Batch API）专门提供批处理接口，价格通常比实时 API 低 50% 左右。

::: tip
批处理的核心权衡是**延迟 vs 成本/效率**。如果任务可以接受延迟完成，批处理通常能显著降低成本并提高吞吐量。
:::

## 为什么重要

- **成本降低**：批处理 API 通常有显著折扣（如 OpenAI Batch API 便宜 50%），大规模处理时节省可观
- **效率提升**：批量处理减少网络往返开销，提高整体吞吐量
- **资源优化**：模型推理引擎对批量输入有专门的优化（如批量矩阵运算），GPU 利用率更高
- **限流规避**：避开实时 API 的速率限制（Rate Limit），通过批处理在低峰期完成任务
- **可预测性**：批处理任务的完成时间和成本更可预测，便于规划和预算管理

## 批处理模式

### 队列积压模式（Queue Accumulation）

等待任务积累到一定数量后触发批处理：

```python
import asyncio
from collections import deque

class BatchProcessor:
    """队列积压模式批处理器"""

    def __init__(self, batch_size=100, max_wait=60):
        self.batch_size = batch_size
        self.max_wait = max_wait  # 最大等待时间（秒）
        self.queue = deque()
        self.processing = False

    async def submit(self, task):
        """提交任务到队列"""
        self.queue.append(task)

        if len(self.queue) >= self.batch_size and not self.processing:
            await self.process_batch()

    async def process_batch(self):
        """处理一批任务"""
        self.processing = True
        batch = []

        while self.queue and len(batch) < self.batch_size:
            batch.append(self.queue.popleft())

        try:
            results = await self.execute_batch(batch)
            for task, result in zip(batch, results):
                task.set_result(result)
        except Exception as e:
            for task in batch:
                task.set_exception(e)
        finally:
            self.processing = False

    async def execute_batch(self, batch):
        """执行批处理（子类实现）"""
        raise NotImplementedError
```

### 时间窗口模式（Time Window）

固定时间窗口内收集任务，窗口结束时统一处理：

```python
class TimeWindowBatch:
    """时间窗口模式批处理器"""

    def __init__(self, window_size=300, max_batch=1000):
        self.window_size = window_size  # 5 分钟
        self.max_batch = max_batch
        self.buffer = []
        self.timer = None

    def submit(self, task):
        self.buffer.append(task)

        if not self.timer:
            self.timer = asyncio.get_event_loop().call_later(
                self.window_size,
                self.flush
            )

        if len(self.buffer) >= self.max_batch:
            self.flush()

    def flush(self):
        if not self.buffer:
            return

        batch = self.buffer[:]
        self.buffer.clear()
        self.timer = None

        # 提交批处理任务
        submit_batch_job(batch)
```

### 动态批处理（Dynamic Batching）

根据系统负载动态调整批次大小：

```python
class DynamicBatcher:
    """动态批处理器"""

    def __init__(self, min_batch=10, max_batch=200, target_latency=5.0):
        self.min_batch = min_batch
        self.max_batch = max_batch
        self.target_latency = target_latency
        self.current_batch_size = min_batch
        self.latency_history = []

    def adjust_batch_size(self, actual_latency):
        """根据实际延迟调整批次大小"""
        self.latency_history.append(actual_latency)

        if len(self.latency_history) >= 10:
            avg_latency = sum(self.latency_history[-10:]) / 10

            if avg_latency < self.target_latency * 0.8:
                # 延迟远低于目标，增大批次
                self.current_batch_size = min(
                    self.current_batch_size + 10,
                    self.max_batch
                )
            elif avg_latency > self.target_latency * 1.2:
                # 延迟超过目标，减小批次
                self.current_batch_size = max(
                    self.current_batch_size - 10,
                    self.min_batch
                )

        return self.current_batch_size
```

## 主流批处理服务

### OpenAI Batch API

OpenAI 提供的异步批处理 API，价格比实时 API 低 50%：

```python
import openai

# 创建批处理任务
client = openai.OpenAI()

# 1. 准备请求文件（JSONL 格式）
# requests.jsonl:
# {"custom_id": "req-1", "method": "POST", "url": "/v1/chat/completions",
#  "body": {"model": "gpt-4", "messages": [{"role": "user", "content": "Hello"}]}}
# {"custom_id": "req-2", ...}

# 2. 上传文件
file = client.files.create(
    file=open("requests.jsonl", "rb"),
    purpose="batch"
)

# 3. 创建批处理任务
batch = client.batches.create(
    input_file_id=file.id,
    endpoint="/v1/chat/completions",
    completion_window="24h"  # 24 小时内完成
)

# 4. 轮询状态
while batch.status not in ["completed", "failed"]:
    batch = client.batches.retrieve(batch.id)
    time.sleep(60)

# 5. 获取结果
if batch.status == "completed":
    result_file = client.files.content(batch.output_file_id)
    # 处理结果...
```

### 本地批量推理

使用 vLLM 等框架进行本地批量推理：

```python
from vllm import LLM, SamplingParams

# 初始化模型
llm = LLM(model="meta-llama/Llama-3-8B")

# 准备批量输入
prompts = [
    "解释量子力学的基本原理",
    "写一首关于春天的诗",
    "Python 中如何实现装饰器",
    # ... 更多 prompts
]

# 批量推理
sampling_params = SamplingParams(
    temperature=0.7,
    max_tokens=512,
)

outputs = llm.generate(prompts, sampling_params)

for output in outputs:
    print(f"Prompt: {output.prompt}")
    print(f"Generated: {output.outputs[0].text}\n")
```

## 实施步骤

### 第一步：识别适合批处理的场景

以下场景适合使用批处理：

- 离线数据分析（如批量文本分类）
- 大规模内容生成（如批量生成产品描述）
- 模型评估测试（如批量运行测试用例）
- 定时报告生成（如每日摘要）

判断标准：任务可以接受延迟完成（分钟/小时级），且数量较大（> 100 条）。

### 第二步：选择批处理服务

| 需求 | 推荐方案 |
| ---- | -------- |
| 使用 OpenAI API | OpenAI Batch API（50% 折扣） |
| 本地部署模型 | vLLM 批量推理 |
| 需要任务队列 | Celery + Redis |
| 云原生方案 | AWS Batch、Google Cloud Batch |

### 第三步：准备批处理输入

```python
# OpenAI Batch API 使用 JSONL 格式
# requests.jsonl:
# {"custom_id": "req-1", "method": "POST", "url": "/v1/chat/completions",
#  "body": {"model": "gpt-4", "messages": [{"role": "user", "content": "Hello"}]}}
```

### 第四步：提交批处理任务

```python
import openai

client = openai.OpenAI()

# 上传文件
file = client.files.create(file=open("requests.jsonl", "rb"), purpose="batch")

# 创建批处理任务
batch = client.batches.create(
    input_file_id=file.id,
    endpoint="/v1/chat/completions",
    completion_window="24h",
)
```

### 第五步：监控任务状态

轮询任务状态，处理完成后的结果文件。

### 第六步：处理结果和错误

解析结果文件，处理成功和失败的请求，对失败请求进行重试。

## 最佳实践

- **合理设置批次大小**：太小无法享受批量优化，太大可能增加延迟
- **做好错误重试**：批处理中部分请求失败是常态，实现指数退避重试
- **混合架构**：实时路径处理交互式请求，批处理路径处理离线任务
- **结果存储**：将批处理结果持久化，支持后续查询和分析
- **成本监控**：跟踪批处理的实际成本节省，验证优化效果
- **数据分片**：超大批次按时间或类型分片，便于并行处理和错误隔离

## 常见问题与避坑

### Q1：批处理和实时处理如何选择？

- **实时处理**：交互式对话、需要即时反馈的场景
- **批处理**：离线分析、大批量任务、可以接受延迟的场景

路由决策参考：
```python
def route_request(request):
    if request.is_interactive:
        return "realtime"
    elif request.batch_size > 100 or request.deadline > 3600:
        return "batch"
    return "realtime"
```

### Q2：批处理任务失败了怎么办？

- 检查输入文件格式是否正确（JSONL 每行一个合法 JSON）
- 查看错误日志，定位失败的具体请求
- 对失败请求单独重试
- 使用 `batch_with_retry` 实现自动重试

### Q3：批处理的最大批次大小是多少？

- OpenAI Batch API：单个文件最大 100MB，最多 50,000 个请求
- vLLM：取决于 GPU 显存，通常可以同时处理数十到数百个 prompt
- 建议将超大批次拆分为多个小批次，便于并行和错误处理

### Q4：如何估算批处理的完成时间？

- OpenAI Batch API：承诺 24 小时内完成，通常几小时内完成
- 本地 vLLM：取决于模型大小、GPU 数量和批次大小
- 建议在实际使用前做小规模测试，建立时间估算模型

### Q5：批处理如何与流式输出结合？

批处理和流式输出是两种不同的模式：
- 批处理：离线、高吞吐、延迟完成
- 流式输出：实时、低延迟、逐字返回

两者可以结合使用：批处理完成后，用户查询结果时使用流式输出展示。

## 与其他概念的关系

- 批处理是 [成本优化](/glossary/cost-optimization) 的重要手段，批处理 API 通常有显著折扣
- 批处理与 [流式输出](/glossary/streaming) 是互补模式，分别适用于离线和实时场景
- 批处理任务的执行状态和结果需要 [可观测性](/glossary/observability) 监控
- 批处理结果的评估是 [模型评估](/glossary/model-evaluation) 的一部分
- 批处理任务的配置和输入数据需要 [版本管理](/glossary/versioning) 确保可追溯

## 延伸阅读

- [成本优化](/glossary/cost-optimization) — 批处理如何降低 API 成本
- [流式输出](/glossary/streaming) — 实时处理 vs 批处理
- [可观测性](/glossary/observability) — 批处理任务监控
- [模型评估](/glossary/model-evaluation) — 批处理结果评估
- [OpenAI Batch API 文档](https://platform.openai.com/docs/guides/batch) — OpenAI 批处理使用指南
- [vLLM 文档](https://docs.vllm.ai/) — 高性能批量推理框架
