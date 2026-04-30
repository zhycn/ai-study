---
title: 可观测性
description: Observability，监控和追踪 AI 应用运行状态
---

# 可观测性

给 AI 应用装上"监控仪表盘"，随时了解它运行得怎么样——花了多少钱、回答质量如何、有没有出错。出了问题能快速定位原因，而不是瞎猜。

## 概述

可观测性（Observability）是指通过日志（Logs）、指标（Metrics）、追踪（Traces）等手段，全面了解系统内部运行状态的能力。对于 AI 应用而言，可观测性不仅是传统 IT 运维的延伸，还需要应对 LLM 调用成本高、响应时间长、输出不确定等独特挑战。

可观测性与监控（Monitoring）的区别在于：监控是"已知未知"——你预先定义好要检查什么；而可观测性是"未知未知"——当出现从未见过的问题时，你仍然有足够的信息去诊断和定位。

::: tip
在 AI 应用中，可观测性 = 传统可观测性（基础设施 + 应用层）+ AI 专属可观测性（Token 消耗、模型表现、提示词版本、检索质量等）。
:::

## 为什么重要

- **问题定位**：AI 应用的调用链路复杂（用户 → 前端 → 后端 → LLM API → 向量数据库 → 外部工具），快速定位故障点是保障 SLA 的关键
- **成本管控**：LLM API 调用按 Token 计费，没有可观测性就无法追踪和优化成本
- **性能优化**：识别延迟瓶颈，区分是网络延迟、模型推理延迟还是检索延迟
- **质量保障**：监控模型输出质量的变化趋势，及时发现性能退化
- **合规审计**：记录所有 AI 交互，满足数据隐私和合规要求
- **用户洞察**：分析用户行为模式，优化产品体验

## 三大支柱

### 日志（Logs）

日志是系统事件的离散记录，用于追踪具体发生了什么：

```python
import logging

# AI 应用日志最佳实践
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)s | %(name)s | %(message)s'
)

logger = logging.getLogger("ai-app")

def log_llm_call(prompt, response, metadata):
    """记录 LLM 调用日志"""
    logger.info("LLM call completed", extra={
        "model": metadata.get("model"),
        "prompt_tokens": metadata.get("prompt_tokens"),
        "completion_tokens": metadata.get("completion_tokens"),
        "latency_ms": metadata.get("latency_ms"),
        "cost_usd": metadata.get("cost_usd"),
        "trace_id": metadata.get("trace_id"),
    })
```

日志级别建议：

- **DEBUG**：详细的调试信息（开发环境）
- **INFO**：关键操作记录（生产环境默认级别）
- **WARN**：潜在问题，如接近速率限制
- **ERROR**：调用失败、超时等

### 指标（Metrics）

指标是量化的系统性能数据，用于趋势分析和告警：

| 指标类别 | 具体指标             | 告警阈值示例  |
| -------- | -------------------- | ------------- |
| 延迟指标 | TTFT、TPS、P99 延迟  | P99 > 5s      |
| 错误指标 | 错误率、超时率       | 错误率 > 1%   |
| 成本指标 | Token 消耗、API 费用 | 日费用 > $100 |
| 质量指标 | 用户满意度、重试率   | 重试率 > 5%   |
| 容量指标 | 并发请求数、队列长度 | 并发 > 100    |

```python
from prometheus_client import Counter, Histogram, Gauge

# Prometheus 指标定义
llm_calls_total = Counter('llm_calls_total', 'Total LLM API calls', ['model', 'status'])
llm_latency = Histogram('llm_latency_seconds', 'LLM API latency', ['model'])
llm_tokens = Counter('llm_tokens_total', 'Total tokens consumed', ['model', 'type'])
llm_cost = Counter('llm_cost_usd', 'Total API cost in USD', ['model'])
active_requests = Gauge('active_requests', 'Number of active requests')

# 记录指标
def record_llm_call(model, latency, prompt_tokens, completion_tokens, cost, status):
    llm_calls_total.labels(model=model, status=status).inc()
    llm_latency.labels(model=model).observe(latency)
    llm_tokens.labels(model=model, type='prompt').inc(prompt_tokens)
    llm_tokens.labels(model=model, type='completion').inc(completion_tokens)
    llm_cost.labels(model=model).inc(cost)
```

### 追踪（Traces）

追踪记录请求的完整调用链路，用于理解请求在各组件间的流转：

```text
用户请求 → API Gateway → 应用服务 → LLM API
                          ↓
                    向量数据库检索
                          ↓
                    工具调用（可选）
```

使用 OpenTelemetry 实现分布式追踪：

```python
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter

# 配置追踪
trace.set_tracer_provider(TracerProvider())
tracer = trace.get_tracer("ai-app")

exporter = OTLPSpanExporter(endpoint="http://otel-collector:4317")
trace.get_tracer_provider().add_span_processor(BatchSpanProcessor(exporter))

# 使用追踪
@tracer.start_as_current_span("process_user_query")
def process_user_query(user_input):
    with tracer.start_as_current_span("retrieve_context") as span:
        context = retrieve_from_vector_db(user_input)
        span.set_attribute("retrieved_chunks", len(context))

    with tracer.start_as_current_span("generate_response") as span:
        response = call_llm(user_input, context)
        span.set_attribute("model", response.model)
        span.set_attribute("tokens", response.usage.total_tokens)

    return response
```

## AI 场景特殊指标

### Token 经济与成本追踪

```python
class TokenTracker:
    """Token 消耗追踪器"""

    def __init__(self):
        self.daily_usage = {}

    def record(self, model, prompt_tokens, completion_tokens, cost):
        date = datetime.now().strftime("%Y-%m-%d")
        if date not in self.daily_usage:
            self.daily_usage[date] = {}

        if model not in self.daily_usage[date]:
            self.daily_usage[date][model] = {
                "prompt_tokens": 0,
                "completion_tokens": 0,
                "cost": 0,
                "calls": 0,
            }

        usage = self.daily_usage[date][model]
        usage["prompt_tokens"] += prompt_tokens
        usage["completion_tokens"] += completion_tokens
        usage["cost"] += cost
        usage["calls"] += 1

    def get_daily_report(self, date):
        """生成日报"""
        report = self.daily_usage.get(date, {})
        total_cost = sum(m["cost"] for m in report.values())
        total_tokens = sum(m["prompt_tokens"] + m["completion_tokens"] for m in report.values())

        return {
            "models": report,
            "total_cost": total_cost,
            "total_tokens": total_tokens,
        }
```

### 模型表现监控

- **输出长度分布**：监控生成文本长度的变化趋势
- **截断率**：因达到最大 Token 限制而被截断的比例
- **重试率**：因错误或超时导致的重试比例
- **用户反馈**：点赞/踩、满意度评分

### 检索质量监控（RAG 场景）

- **检索延迟**：向量检索的平均和 P99 延迟
- **检索命中率**：找到相关文档的比例
- **上下文相关性**：检索结果与问题的相关度
- **文档覆盖率**：检索结果覆盖答案关键信息的比例

## 工具生态

### OpenTelemetry

OpenTelemetry（OTel）是 CNCF 旗下的开源可观测性标准：

```yaml
# otel-collector-config.yaml
receivers:
  otlp:
    protocols:
      grpc:
      http:

processors:
  batch:
  attributes:
    actions:
      - key: service.name
        value: 'ai-assistant'
        action: upsert

exporters:
  prometheus:
    endpoint: '0.0.0.0:8889'
  otlp/jaeger:
    endpoint: 'jaeger:4317'
    tls:
      insecure: true

service:
  pipelines:
    metrics:
      receivers: [otlp]
      processors: [batch]
      exporters: [prometheus]
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp/jaeger]
```

### LLM 专属可观测性平台

| 平台              | 特点                            | 适用场景         |
| ----------------- | ------------------------------- | ---------------- |
| **LangSmith**     | LangChain 生态集成，追踪 + 评估 | LangChain 用户   |
| **LangFuse**      | 开源，支持多框架，成本追踪      | 需要自托管的团队 |
| **Arize Phoenix** | 可观测性 + 评估 + 漂移检测      | 生产级 ML 系统   |
| **Helicone**      | API 代理模式，零代码集成        | 快速接入         |
| **Braintrust**    | 评估驱动的可观测性              | 重视评估的团队   |

### 可视化与告警

```yaml
# Grafana 告警规则示例
groups:
  - name: ai-app-alerts
    rules:
      - alert: HighErrorRate
        expr: rate(llm_calls_total{status="error"}[5m]) / rate(llm_calls_total[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: 'LLM 错误率超过 5%'

      - alert: HighLatency
        expr: histogram_quantile(0.99, rate(llm_latency_seconds_bucket[5m])) > 5
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: 'LLM P99 延迟超过 5 秒'

      - alert: HighDailyCost
        expr: sum(increase(llm_cost_usd[1d])) > 100
        for: 0m
        labels:
          severity: info
        annotations:
          summary: '日 API 费用超过 $100'
```

## 实施步骤

### 第一步：确定可观测性目标

明确你需要监控什么：

- **成本追踪**：Token 消耗、API 费用、各模型的使用占比
- **性能监控**：TTFT、TPS、P99 延迟、错误率
- **质量监控**：用户满意度、重试率、输出长度分布
- **安全合规**：敏感信息脱敏、审计日志、数据隐私

### 第二步：选择可观测性平台

根据团队需求选择合适的平台：

| 需求 | 推荐方案 |
| ---- | -------- |
| LangChain 生态用户 | LangSmith |
| 需要自托管、开源 | LangFuse |
| 生产级 ML 系统 | Arize Phoenix |
| 快速接入、零代码 | Helicone |
| 评估驱动 | Braintrust |

### 第三步：集成 OpenTelemetry SDK

```python
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter

# 配置追踪
trace.set_tracer_provider(TracerProvider())
tracer = trace.get_tracer("ai-app")

exporter = OTLPSpanExporter(endpoint="http://otel-collector:4317")
trace.get_tracer_provider().add_span_processor(BatchSpanProcessor(exporter))
```

### 第四步：定义关键指标

```python
from prometheus_client import Counter, Histogram, Gauge

# 核心指标
llm_calls_total = Counter("llm_calls_total", "Total LLM API calls", ["model", "status"])
llm_latency = Histogram("llm_latency_seconds", "LLM API latency", ["model"])
llm_tokens = Counter("llm_tokens_total", "Total tokens consumed", ["model", "type"])
llm_cost = Counter("llm_cost_usd", "Total API cost in USD", ["model"])
```

### 第五步：配置告警规则

```yaml
groups:
  - name: ai-app-alerts
    rules:
      - alert: HighErrorRate
        expr: rate(llm_calls_total{status="error"}[5m]) / rate(llm_calls_total[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
```

### 第六步：搭建可视化仪表盘

使用 Grafana 创建仪表盘，展示：
- 实时请求量和错误率
- 各模型的延迟分布（P50、P95、P99）
- Token 消耗趋势和成本分析
- 缓存命中率和用户满意度

## 最佳实践

- **结构化日志**：所有日志使用 JSON 格式，包含 trace_id 便于关联分析
- **敏感信息脱敏**：在采集、存储、展示各阶段做好脱敏，遵守 GDPR 等法规
- **合理采样**：全量采集成本高昂，使用头部采样、尾部采样或自适应采样策略
- **版本关联**：将可观测性数据与模型版本、提示词版本关联，便于按版本对比
- **告警分级**：区分 critical、warning、info 级别，避免告警疲劳
- **定期审查**：每周审查告警规则和仪表盘，确保监控指标与业务目标一致

## 常见问题与避坑

### Q1：可观测性和监控有什么区别？

- **监控（Monitoring）**：已知未知——预先定义好要检查什么（如 CPU 使用率是否超过 80%）
- **可观测性（Observability）**：未知未知——当出现从未见过的问题时，仍有足够信息去诊断

AI 应用需要两者结合：监控已知指标，可观测性帮助诊断未知问题。

### Q2：如何控制可观测性成本？

- **采样策略**：不要全量采集，使用尾部采样保留错误和高延迟请求
- **数据保留策略**：原始日志保留 7 天，聚合指标保留 90 天
- **按需采集**：开发环境全量采集，生产环境采样采集
- **选择合适平台**：开源方案（LangFuse）比商业方案成本更低

### Q3：流式输出如何监控？

流式场景需要特殊指标：
- **TTFT**：首字响应时间（而非总延迟）
- **TPS**：Token 生成速度
- **流式中断率**：连接意外断开的比例
- **完整响应率**：成功完成流式输出的比例

### Q4：如何处理敏感信息？

```python
def sanitize_prompt(prompt: str) -> str:
    """脱敏提示词中的敏感信息"""
    import re

    prompt = re.sub(r"[\w.-]+@[\w.-]+\.\w+", "[EMAIL]", prompt)
    prompt = re.sub(r"\b1[3-9]\d{9}\b", "[PHONE]", prompt)
    prompt = re.sub(r"sk-[a-zA-Z0-9]{20,}", "[API_KEY]", prompt)

    return prompt
```

在记录日志前务必脱敏，避免泄露用户隐私。

### Q5：多模型场景如何对比分析？

- 在指标中添加 model 标签
- 在 Grafana 中按 model 分组展示
- 定期生成各模型的成本-性能对比报告
- 结合 [模型评估](/glossary/model-evaluation) 数据做综合决策

## 与其他概念的关系

- 可观测性数据是 [延迟优化](/glossary/latency-optimization) 的依据，没有测量就没有优化
- Token 消耗追踪直接支撑 [成本优化](/glossary/cost-optimization) 决策
- [模型评估](/glossary/model-evaluation) 在生产环境的持续执行依赖可观测性基础设施
- [流式输出](/glossary/streaming) 场景下的可观测性需要特殊处理（流式指标聚合）
- [版本管理](/glossary/versioning) 与可观测性结合，实现按版本维度的性能对比
- [缓存](/glossary/caching) 命中率是可观测性的重要指标

## 延伸阅读

- [延迟优化](/glossary/latency-optimization) — 基于可观测性数据进行优化
- [成本优化](/glossary/cost-optimization) — Token 消耗追踪与成本管控
- [模型评估](/glossary/model-evaluation) — 生产环境的持续评估
- [流式输出](/glossary/streaming) — 流式场景下的可观测性
- [OpenTelemetry 官方文档](https://opentelemetry.io/docs/) — 可观测性标准
- [LangFuse 文档](https://langfuse.com/docs) — 开源 LLM 可观测性平台
- [LangSmith 文档](https://docs.smith.langchain.com/) — LangChain 可观测性工具
