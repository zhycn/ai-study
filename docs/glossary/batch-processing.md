---
title: 批处理
description: Batch Processing，批量处理大量请求
---

# 批处理

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

## 工程实践

### 批处理任务管理

```python
class BatchJobManager:
    """批处理任务管理器"""

    def __init__(self):
        self.jobs = {}

    def create_job(self, name, tasks, config):
        """创建批处理任务"""
        job = {
            "id": f"job-{uuid4().hex[:8]}",
            "name": name,
            "tasks": tasks,
            "config": config,
            "status": "pending",  # pending, running, completed, failed
            "created_at": datetime.now(),
            "started_at": None,
            "completed_at": None,
            "results": [],
            "errors": [],
        }
        self.jobs[job["id"]] = job
        return job["id"]

    def get_job_status(self, job_id):
        """查询任务状态"""
        job = self.jobs.get(job_id)
        if not job:
            return None

        total = len(job["tasks"])
        completed = len(job["results"])
        failed = len(job["errors"])

        return {
            "id": job["id"],
            "status": job["status"],
            "progress": f"{completed}/{total}",
            "completion_rate": completed / total if total > 0 else 0,
            "error_rate": failed / total if total > 0 else 0,
        }

    def get_results(self, job_id):
        """获取任务结果"""
        job = self.jobs.get(job_id)
        return {
            "results": job["results"],
            "errors": job["errors"],
        } if job else None
```

### 错误重试机制

```python
async def batch_with_retry(tasks, max_retries=3):
    """批处理中的错误重试"""
    results = []
    failed_tasks = tasks[:]

    for attempt in range(max_retries + 1):
        if not failed_tasks:
            break

        batch_results = await execute_batch(failed_tasks)
        successful = []
        failed_tasks = []

        for task, result in zip(failed_tasks, batch_results):
            if result.success:
                successful.append(result)
            elif attempt < max_retries:
                failed_tasks.append(task)
            else:
                results.append({"task": task, "error": result.error})

        results.extend(successful)

        if failed_tasks:
            await asyncio.sleep(2 ** attempt)  # 指数退避

    return results
```

### 批处理与实时处理的混合架构

```text
┌──────────────────────────────────────────────────────┐
│                    用户请求                            │
└──────────────┬───────────────────────┬───────────────┘
               ▼                       ▼
      ┌────────────────┐     ┌────────────────┐
      │  实时处理路径   │     │  批处理路径     │
      │  (低延迟)      │     │  (高吞吐)       │
      └───────┬────────┘     └───────┬────────┘
              ▼                      ▼
      ┌────────────────┐     ┌────────────────┐
      │  流式输出       │     │  任务队列       │
      │  即时响应       │     │  定时执行       │
      └────────────────┘     └───────┬────────┘
                                     ▼
                              ┌────────────────┐
                              │  结果存储       │
                              │  异步通知       │
                              └────────────────┘
```

路由决策：

```python
def route_request(request):
    """路由决策：实时 vs 批处理"""
    if request.is_interactive:
        return "realtime"  # 交互式对话走实时路径
    elif request.batch_size > 100:
        return "batch"     # 大批量任务走批处理
    elif request.deadline > 3600:
        return "batch"     # 截止时间宽松走批处理
    else:
        return "realtime"  # 默认实时处理
```

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
