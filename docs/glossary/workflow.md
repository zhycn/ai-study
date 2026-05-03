---
title: AI 工作流
description: AI Workflows，AI 任务的自动化流程编排
---

# AI 工作流

把 AI 任务拆成一道道工序，像工厂流水线一样自动完成。比如先让 AI 总结文章，再翻译，最后排版——每一步自动衔接，不需要人工干预，高效又省心。

## 概述

工作流（Workflow）是指将 AI 任务**分解为多个步骤**，并通过自动化的流程将这些步骤串联起来的技术方案。与单次模型调用不同，工作流定义了完整的执行逻辑：从输入处理、模型调用、条件判断、工具执行到结果输出。

可以将工作流理解为 AI 应用的"流水线"——每个节点负责特定的处理步骤，数据在节点之间流转，最终完成复杂的业务逻辑。

工作流与 [Agent](/glossary/agent) 的区别在于：

- **工作流**：流程是预定义的、确定性的，开发者明确知道每一步会做什么
- **Agent**：流程是动态的、由模型自主决策的，开发者定义目标而非具体步骤

在实际应用中，两者经常结合使用：工作流定义整体框架，Agent 在关键节点自主决策。

## 为什么重要

工作流是将 AI 能力落地为生产级应用的关键基础设施：

- **自动化**：将重复性的 AI 任务自动化，减少人工干预
- **可复用**：一次构建，多次复用，降低开发和维护成本
- **可观测**：每个步骤都可监控、记录和调试，便于问题定位
- **可扩展**：易于添加新步骤、替换组件或调整流程
- **质量保证**：通过步骤间的验证和检查点，确保输出质量
- **团队协作**：工作流是团队间沟通和协作的通用语言

::: tip 提示
当任务流程明确、步骤固定时，优先使用工作流；当任务需要灵活决策、动态规划时，考虑使用 Agent。两者也可以混合使用。
:::

## 核心组件

### 节点类型

**触发器（Trigger）**

工作流的启动条件：

- **API 触发**：通过 HTTP 请求启动
- **定时触发**：按 Cron 表达式定时执行
- **事件触发**：响应特定事件（文件上传、消息到达等）
- **手动触发**：用户手动启动

**处理器（Processor）**

执行具体任务的节点：

- **LLM 调用**：调用大语言模型生成内容
- **工具执行**：调用外部 API 或执行代码
- **数据处理**：格式转换、过滤、聚合等操作
- **RAG 检索**：从知识库中检索相关信息

**路由器（Router）**

根据条件决定执行路径：

- **条件分支**：基于输入内容或前一步结果选择不同路径
- **并行执行**：同时执行多个无依赖的步骤
- **循环迭代**：对列表中的每个元素执行相同操作

**存储器（Storage）**

保存中间结果和状态：

- **上下文变量**：在步骤之间传递数据
- **缓存**：缓存重复查询的结果
- **持久化存储**：将结果保存到数据库或文件系统

### 工作流模式

**顺序模式（Sequential）**

最简单的模式，步骤按顺序依次执行：

```text
输入 → 步骤 A → 步骤 B → 步骤 C → 输出
```

适用场景：翻译、摘要、内容审核等线性处理任务。

**并行模式（Parallel）**

多个步骤同时执行，最后汇总结果：

```text
         ┌→ 步骤 A ─┐
输入 ────┼→ 步骤 B ─┼→ 汇总 → 输出
         └→ 步骤 C ─┘
```

适用场景：多模型对比、批量处理、独立子任务。

**条件模式（Conditional）**

根据条件选择执行路径：

```text
         ┌→ 路径 A（条件 1）
输入 ────┼→ 路径 B（条件 2）
         └→ 路径 C（默认）
```

适用场景：分类后处理、异常处理、多语言路由。

**循环模式（Iterative）**

重复执行直到满足条件：

```text
输入 → 处理 → 检查条件 ── 满足 ──→ 输出
              ↑         │
              └── 不满足 ─┘
```

适用场景：内容优化迭代、搜索增强、多轮对话。

**Map-Reduce 模式**

先分散处理再汇总：

```text
输入 → 分块 → [处理块1, 处理块2, ...] → 汇总 → 输出
```

适用场景：长文档处理、大规模数据分析。

## 主流框架

### [LangGraph](https://docs.langchain.com/oss/python/langgraph/overview)

LangChain 推出的基于图的工作流框架：

```python
from langgraph.graph import StateGraph, END

# 定义状态
class WorkflowState(TypedDict):
    query: str
    search_results: list
    answer: str

# 构建工作流
workflow = StateGraph(WorkflowState)
workflow.add_node("search", search_node)
workflow.add_node("generate", generate_node)
workflow.add_node("verify", verify_node)

workflow.set_entry_point("search")
workflow.add_edge("search", "generate")
workflow.add_edge("generate", "verify")
workflow.add_conditional_edges("verify",
    lambda s: "generate" if s["needs_retry"] else END
)
```

特点：支持循环和条件分支、状态管理、可视化调试。

### Dify

开源的 LLM 应用开发平台，提供可视化的工作流编排：

- **可视化编辑**：拖拽式构建工作流
- **内置组件**：丰富的预置节点（LLM、HTTP、代码、知识库等）
- **模板市场**：开箱即用的工作流模板
- **API 发布**：一键将工作流发布为 API

### Coze

字节跳动推出的 AI Bot 开发平台：

- **工作流编排**：可视化构建复杂逻辑
- **插件生态**：丰富的第三方插件
- **多端发布**：支持发布到多个平台

### Temporal

分布式工作流编排引擎（非 AI 专用，但广泛用于 AI 场景）：

- **持久化执行**：工作流状态持久化，支持长时间运行
- **容错机制**：自动重试、超时处理
- **可观测性**：完整的执行历史和指标

## 工程实践

### 工作流设计原则

1. **单一职责**：每个节点只做一件事，保持逻辑清晰
2. **幂等性**：同一输入多次执行应产生相同结果
3. **容错设计**：每个节点都要考虑失败情况和恢复策略
4. **可观测性**：记录每个节点的输入、输出和执行时间
5. **版本管理**：工作流定义纳入版本控制，支持回滚

### 错误处理策略

| 策略                          | 说明                 | 适用场景           |
| ----------------------------- | -------------------- | ------------------ |
| 重试（Retry）                 | 失败后自动重试       | 网络超时、临时故障 |
| 降级（Fallback）              | 使用备用方案         | 主服务不可用       |
| 跳过（Skip）                  | 跳过失败节点继续执行 | 非关键步骤         |
| 终止（Abort）                 | 立即终止工作流       | 关键步骤失败       |
| 人工介入（Human-in-the-loop） | 等待人工处理         | 需要人工判断的场景 |

### 性能优化

- **缓存**：缓存 LLM 调用结果和外部 API 响应
- **并行化**：无依赖的节点并行执行
- **流式输出**：使用流式响应减少用户等待时间
- **异步执行**：长时间运行的任务异步执行，通过回调通知结果

### 监控与调试

```text
工作流执行追踪示例：

[2024-01-15 10:00:00] Trigger: API call received
[2024-01-15 10:00:01] Node "search": started
[2024-01-15 10:00:03] Node "search": completed (2.1s)
[2024-01-15 10:00:03] Node "generate": started
[2024-01-15 10:00:08] Node "generate": completed (5.3s)
[2024-01-15 10:00:08] Node "verify": started
[2024-01-15 10:00:09] Node "verify": passed, workflow completed
Total duration: 9.2s
```

## 实施步骤

### 步骤 1：需求分析与流程设计

明确工作流的目标和执行逻辑：

```yaml
# workflow_design.yaml
workflow:
  name: content_processing_pipeline
  description: 内容处理流水线
  trigger: api # 触发方式
  steps:
    - name: fetch_content
      type: http
      description: 从 CMS 获取待处理内容
    - name: summarize
      type: llm
      description: 生成内容摘要
    - name: translate
      type: llm
      description: 翻译为目标语言
    - name: format
      type: code
      description: 格式化输出
    - name: publish
      type: http
      description: 发布到目标平台
```

### 步骤 2：选择工作流框架

根据需求选择合适的框架：

| 需求     | 推荐框架                                                              | 优势                   |
| -------- | --------------------------------------------------------------------- | ---------------------- |
| 快速原型 | Dify / Coze                                                           | 可视化编排，开箱即用   |
| 代码控制 | [LangGraph](https://docs.langchain.com/oss/python/langgraph/overview) | 灵活的图结构，支持循环 |
| 生产级   | Temporal                                                              | 持久化执行，容错机制   |
| 云原生   | AWS Step Functions                                                    | 与 AWS 生态深度集成    |

### 步骤 3：实现工作流

使用 LangGraph 实现内容处理工作流：

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict

# 1. 定义状态
class ContentState(TypedDict):
    raw_content: str
    summary: str
    translated: str
    formatted: str
    published_url: str
    errors: list

# 2. 定义节点
def fetch_content(state: ContentState) -> ContentState:
    """获取原始内容"""
    content = fetch_from_cms()
    return {'raw_content': content}

def summarize(state: ContentState) -> ContentState:
    """生成摘要"""
    summary = llm_summarize(state['raw_content'])
    return {'summary': summary}

def translate(state: ContentState) -> ContentState:
    """翻译内容"""
    translated = llm_translate(state['raw_content'], target_lang='zh')
    return {'translated': translated}

def format_output(state: ContentState) -> ContentState:
    """格式化输出"""
    formatted = format_markdown(
        summary=state['summary'],
        translated=state['translated']
    )
    return {'formatted': formatted}

def publish(state: ContentState) -> ContentState:
    """发布内容"""
    url = publish_to_platform(state['formatted'])
    return {'published_url': url}

# 3. 构建工作流
workflow = StateGraph(ContentState)
workflow.add_node('fetch', fetch_content)
workflow.add_node('summarize', summarize)
workflow.add_node('translate', translate)
workflow.add_node('format', format_output)
workflow.add_node('publish', publish)

# 4. 定义执行顺序
workflow.set_entry_point('fetch')
workflow.add_edge('fetch', 'summarize')
workflow.add_edge('summarize', 'translate')
workflow.add_edge('translate', 'format')
workflow.add_edge('format', 'publish')
workflow.add_edge('publish', END)

# 5. 编译并执行
app = workflow.compile()
result = app.invoke({
    'raw_content': '',
    'summary': '',
    'translated': '',
    'formatted': '',
    'published_url': '',
    'errors': []
})
```

### 步骤 4：添加条件分支

```python
def verify_quality(state: ContentState) -> str:
    """验证内容质量，决定是否需要重新生成"""
    quality_score = evaluate_quality(state['formatted'])
    if quality_score < 0.8:
        return 'regenerate'
    return 'publish'

# 添加条件边
workflow.add_conditional_edges(
    'format',
    verify_quality,
    {
        'regenerate': 'summarize',  # 质量不达标，重新生成
        'publish': 'publish'
    }
)
```

### 步骤 5：添加错误处理

```python
def handle_error(node_name: str, error: Exception) -> dict:
    """统一错误处理"""
    return {
        'errors': [f'{node_name}: {str(error)}']
    }

# 为每个节点添加 try-catch
def safe_summarize(state: ContentState) -> ContentState:
    try:
        return summarize(state)
    except Exception as e:
        return handle_error('summarize', e)
```

### 步骤 6：监控与优化

```text
# 工作流执行日志示例
[2024-01-15 10:00:00] Workflow started: content_processing_pipeline
[2024-01-15 10:00:01] Node "fetch": completed (1.2s)
[2024-01-15 10:00:04] Node "summarize": completed (3.1s)
[2024-01-15 10:00:07] Node "translate": completed (3.5s)
[2024-01-15 10:00:08] Node "format": completed (0.3s)
[2024-01-15 10:00:08] Quality check: passed (score: 0.92)
[2024-01-15 10:00:10] Node "publish": completed (1.8s)
[2024-01-15 10:00:10] Workflow completed. Total: 10.0s
```

## 最佳实践

### 工作流设计原则

- **单一职责**：每个节点只做一件事
- **幂等性**：同一输入多次执行产生相同结果
- **容错设计**：每个节点考虑失败场景和恢复策略
- **可观测性**：记录输入、输出、执行时间
- **版本管理**：工作流定义纳入版本控制

### 错误处理策略

| 策略             | 说明             | 适用场景           |
| ---------------- | ---------------- | ------------------ |
| 重试（Retry）    | 失败后自动重试   | 网络超时、临时故障 |
| 降级（Fallback） | 使用备用方案     | 主服务不可用       |
| 跳过（Skip）     | 跳过失败节点继续 | 非关键步骤         |
| 终止（Abort）    | 立即终止工作流   | 关键步骤失败       |
| 人工介入         | 等待人工处理     | 需要人工判断       |

### 性能优化

- **缓存**：缓存 LLM 调用和外部 API 响应
- **并行化**：无依赖节点并行执行
- **流式输出**：减少用户等待时间
- **异步执行**：长时间任务异步处理

## 常见问题与避坑

### FAQ

**Q1：工作流和 Agent 应该选哪个？**

::: tip 决策建议

- 流程明确、步骤固定 → 工作流
- 需要动态决策、灵活规划 → Agent
- 复杂场景 → 工作流 + Agent 混合
  :::

| 维度     | 工作流     | Agent    |
| -------- | ---------- | -------- |
| 流程     | 预定义     | 动态生成 |
| 可预测性 | 高         | 低       |
| 调试难度 | 低         | 高       |
| 适用场景 | 标准化流程 | 复杂决策 |

**Q2：工作流执行时间太长怎么办？**

- **并行化**：无依赖的节点并行执行
- **缓存**：缓存重复查询的结果
- **异步执行**：长时间任务异步处理，通过回调通知
- **流式输出**：逐步返回结果，减少感知延迟
- **模型选择**：简单任务使用小模型，复杂任务用大模型

**Q3：如何处理工作流中的状态管理？**

- 使用框架提供的状态管理机制（如 [LangGraph](https://docs.langchain.com/oss/python/langgraph/overview) 的 StateGraph）
- 状态对象应包含所有必要的中间结果
- 避免在状态中存储大量数据，使用引用或 ID
- 对于长时间运行的工作流，使用持久化存储

**Q4：工作流版本如何管理？**

- 将工作流定义文件纳入 Git 版本控制
- 使用语义化版本号（如 `v1.2.0`）
- 保留历史版本，支持回滚
- 使用 CI/CD 自动化测试和部署

**Q5：如何测试工作流？**

- **单元测试**：测试每个节点的输入输出
- **集成测试**：测试完整工作流执行
- **Mock 外部依赖**：使用模拟数据测试异常场景
- **性能测试**：测试高并发下的表现

### 常见陷阱

| 陷阱         | 表现                           | 解决方案               |
| ------------ | ------------------------------ | ---------------------- |
| 节点职责不清 | 单个节点逻辑复杂               | 拆分节点，单一职责     |
| 状态膨胀     | 状态对象包含过多数据           | 只存储必要中间结果     |
| 错误传播     | 一个节点失败导致整个工作流崩溃 | 添加错误处理和降级策略 |
| 循环依赖     | 节点之间形成循环等待           | 检查并消除依赖环       |
| 缺乏监控     | 出问题后难以定位               | 添加完整日志和指标     |

## 与其他概念的关系

- 工作流可以编排多个 [Agent](/glossary/agent) 协同完成任务
- 工作流中的 LLM 节点依赖 [提示词工程](/glossary/prompt-engineering) 优化效果
- 工作流通过 [函数调用](/glossary/function-calling) 或 [MCP](/glossary/mcp) 连接外部工具
- 工作流可以集成 [RAG](/glossary/rag) 节点实现知识增强
- [微调](/glossary/fine-tuning) 后的模型可以作为工作流中的专用节点

## 延伸阅读

- [LangGraph 文档](https://docs.langchain.com/oss/python/langgraph/overview)
- [Dify 文档](https://docs.dify.ai/)
- [Temporal 文档](https://docs.temporal.io/)
- [AWS Step Functions](https://aws.amazon.com/step-functions/)
- [Agent 智能体](/glossary/agent)
- [提示词工程](/glossary/prompt-engineering)
- [函数调用](/glossary/function-calling)
- [MCP](/glossary/mcp)
- [RAG 检索增强生成](/glossary/rag)
