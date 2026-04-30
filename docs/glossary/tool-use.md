---
title: 工具使用
description: Tool Use，Agent 调用外部工具的能力
---

# 工具使用

让 AI 不再"光说不练"，而是能真正动手干活——搜索网页、查数据库、执行代码、发邮件等。就像给一个聪明的顾问配备了电脑和手机，他不仅能给你建议，还能帮你实际操作。

> 面向开发者的技术实战文章

## 概述

**工具使用（Tool Use）** 是 AI Agent 调用外部工具或服务来扩展自身能力的核心技术。它使 Agent 能够执行搜索、计算、API 调用、代码执行等超出大语言模型本身能力范围的任务。

大语言模型本质上是**文本生成器**，它们有明确的局限性：知识有截止日期、无法执行实时操作、数学计算不可靠、无法访问私有数据。工具使用通过让模型"动手"而不仅是"动口"，从根本上扩展了 Agent 的能力边界。

> 💡 核心理解
>
> 工具使用让 Agent 从"知道什么"进化到"能做什么"。没有工具使用的 Agent 是一个知识渊博的顾问，有了工具使用的 Agent 是一个能执行任务的助手。

## 为什么需要

### 突破 LLM 的固有局限

**知识时效性** LLM 的训练数据有截止日期，无法获取最新信息。通过搜索工具，Agent 可以访问实时数据。

**计算不可靠** LLM 不擅长精确计算。通过计算器工具，Agent 可以获得准确的数学结果。

**无法执行操作** LLM 只能生成文本，不能执行实际操作。通过 API 工具，Agent 可以发送邮件、更新数据库、调用服务。

**无法访问私有数据** LLM 无法访问企业内部数据。通过数据库工具，Agent 可以查询内部信息。

### 核心价值

**能力扩展** 工具使用是 Agent 能力的主要扩展方式。每个工具都是 Agent 的一个"新器官"，赋予它新的感知或行动能力。

**实时信息** 通过搜索和 API 工具，Agent 可以获取实时数据，回答"今天天气如何"、"某股票当前价格"等时效性问题。

**精确计算** 将计算任务委托给专业工具，避免 LLM 的"算术幻觉"。

**任务闭环** 工具使用使 Agent 能够完成端到端的复杂任务，从信息收集到决策到执行，形成完整闭环。

## 核心原理

### 函数调用（Function Calling）

**函数调用（Function Calling）** 是当前最主流的工具使用实现方式。其核心流程是：

1. 向 LLM 提供可用工具的**描述**（名称、参数、用途）
2. LLM 决定是否需要调用工具，以及调用哪个工具、传入什么参数
3. 外部系统执行工具调用，将结果返回给 LLM
4. LLM 基于工具结果生成最终响应

```python
from openai import OpenAI

client = OpenAI()

# 定义工具描述
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_current_weather",
            "description": "获取指定城市的当前天气",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "城市名称，如北京、上海"
                    },
                    "unit": {
                        "type": "string",
                        "enum": ["celsius", "fahrenheit"]
                    }
                },
                "required": ["location"]
            }
        }
    }
]

# 第一次调用：LLM 决定是否使用工具
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "北京今天天气怎么样？"}],
    tools=tools
)

# 检查是否需要调用工具
if response.choices[0].message.tool_calls:
    tool_call = response.choices[0].message.tool_calls[0]
    args = json.loads(tool_call.function.arguments)

    # 执行工具
    result = get_current_weather(args["location"], args.get("unit", "celsius"))

    # 将结果返回给 LLM
    second_response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "user", "content": "北京今天天气怎么样？"},
            response.choices[0].message,
            {"role": "tool", "tool_call_id": tool_call.id, "content": json.dumps(result)}
        ],
        tools=tools
    )
    print(second_response.choices[0].message.content)
```

> 🔗 相关词条：[函数调用](/glossary/function-calling)

### ReAct 模式

**ReAct（Reasoning + Acting）** 模式将推理和行动交错进行，是工具使用的经典范式。

```python
def react_agent(task: str, tools: dict[str, Callable], max_steps: int = 10) -> str:
    history = []

    for step in range(max_steps):
        # 生成思考
        thought = generate_thought(task, history)
        history.append(f"思考：{thought}")

        # 决定是否使用工具
        action, action_input = decide_action(thought, tools)

        if action == "finish":
            return action_input  # 最终答案

        # 执行工具
        observation = tools[action](action_input)
        history.append(f"行动：{action}({action_input})")
        history.append(f"观察：{observation}")

        # 检查是否陷入循环
        if detect_loop(history):
            history.append("检测到循环，尝试不同的方法")

    return "达到最大步骤数，未能完成任务"
```

ReAct 模式的关键优势：

- **可解释性**：每个步骤都有明确的思考过程
- **灵活性**：可以根据观察结果动态调整策略
- **可调试**：出问题时可以看到哪一步出了问题

### 工具描述工程

工具描述的质量直接影响 LLM 选择和使用工具的准确性。好的工具描述应该：

**清晰的名称** 使用动词开头，明确表达工具的功能。

**详细的参数说明** 每个参数的类型、含义、示例值都要清楚。

**使用场景说明** 告诉 LLM 什么时候应该使用这个工具。

```python
# 好的工具描述示例
good_tool = {
    "name": "search_documentation",
    "description": "在技术文档中搜索特定主题。当用户询问 API 用法、配置方法或最佳实践时使用。",
    "parameters": {
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": "搜索关键词，建议使用具体的技术术语而非模糊描述"
            },
            "language": {
                "type": "string",
                "description": "目标编程语言，如 python、javascript、go",
                "enum": ["python", "javascript", "go", "java", "rust"]
            },
            "max_results": {
                "type": "integer",
                "description": "返回结果的最大数量，默认 5",
                "default": 5
            }
        },
        "required": ["query"]
    }
}

# 差的工具描述（避免这样写）
bad_tool = {
    "name": "search",
    "description": "搜索东西",
    "parameters": {
        "q": {"type": "string"}
    }
}
```

### 工具组合与链式调用

复杂任务通常需要多个工具的组合使用。

```python
class ToolChain:
    def __init__(self):
        self.tools: list[Tool] = []

    def add_tool(self, tool: Tool):
        self.tools.append(tool)

    async def execute(self, task: str) -> Any:
        context = {"task": task, "results": {}}

        for tool in self.tools:
            # 每个工具可以访问前面工具的结果
            input_data = tool.prepare_input(context)
            result = await tool.execute(input_data)
            context["results"][tool.name] = result

        return context["results"]

# 使用示例：数据处理流水线
chain = ToolChain()
chain.add_tool(WebScraperTool())    # 1. 抓取网页数据
chain.add_tool(DataCleanerTool())   # 2. 清洗数据
chain.add_tool(AnalyzerTool())      # 3. 分析数据
chain.add_tool(ReporterTool())      # 4. 生成报告

result = await chain.execute("分析某网站的访问量趋势")
```

## 主流框架与实现

### LangChain Tools

[LangChain](https://python.langchain.com/) 提供了丰富的工具生态和统一的工具接口。

```python
from langchain_core.tools import tool
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain_openai import ChatOpenAI

# 使用装饰器定义工具
@tool
def calculator(expression: str) -> str:
    """计算数学表达式。输入如 '2 + 2' 或 'sqrt(16)'"""
    return str(eval(expression))

@tool
def search(query: str) -> str:
    """在互联网上搜索信息"""
    return search_web(query)

# 创建 Agent
llm = ChatOpenAI(model="gpt-4o")
tools = [calculator, search]
agent = create_tool_calling_agent(llm, tools, prompt)
executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

# 执行
result = executor.invoke({"input": "计算 2 的 10 次方，然后搜索 Python 3.12 的新特性"})
```

LangChain 内置工具：

- `WikipediaQueryRun` — 维基百科搜索
- `ArxivQueryRun` — 学术论文搜索
- `PythonREPLTool` — Python 代码执行
- `ShellTool` — Shell 命令执行
- `SQLDatabaseToolkit` — 数据库查询

### MCP（Model Context Protocol）

[MCP](https://modelcontextprotocol.io/) 是 Anthropic 推出的开放协议，旨在标准化 AI 应用与外部数据源的连接方式。

```python
# MCP Server 示例：提供文件读取能力
from mcp.server.fastmcp import FastMCP
from pathlib import Path

mcp = FastMCP("file-tools")

@mcp.tool()
def read_file(path: str) -> str:
    """读取指定路径的文件内容"""
    return Path(path).read_text()

@mcp.tool()
def list_directory(path: str) -> list[str]:
    """列出指定目录下的文件和子目录"""
    return [str(p) for p in Path(path).iterdir()]

if __name__ == "__main__":
    mcp.run()
```

MCP 的核心优势：

- **标准化**：统一的协议，不同客户端和服务端可以互操作
- **安全性**：明确的权限模型，用户控制 Agent 可以访问的资源
- **生态**：越来越多的工具和平台开始支持 MCP

> 🔗 相关词条：[MCP](/glossary/mcp)

### OpenAI Function Calling

OpenAI 原生支持的函数调用能力，是目前最广泛使用的工具使用方案。

```python
import openai

# 定义多个工具
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "获取天气信息",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {"type": "string"},
                    "date": {"type": "string", "description": "日期，格式 YYYY-MM-DD"}
                },
                "required": ["location"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "send_email",
            "description": "发送邮件",
            "parameters": {
                "type": "object",
                "properties": {
                    "to": {"type": "string"},
                    "subject": {"type": "string"},
                    "body": {"type": "string"}
                },
                "required": ["to", "subject", "body"]
            }
        }
    }
]

# LLM 自动选择最合适的工具
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "明天北京天气怎么样？如果下雨的话，给 zhangsan@example.com 发个提醒"}],
    tools=tools
)
```

## 实施步骤

### 步骤 1：定义工具描述

工具描述质量直接影响 LLM 的选择准确性：

```python
tool_definition = {
    "type": "function",
    "function": {
        "name": "search_database",
        "description": "在数据库中搜索记录。当用户需要查询数据时使用。",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "搜索关键词"},
                "limit": {"type": "integer", "description": "返回结果数量", "default": 10}
            },
            "required": ["query"]
        }
    }
}
```

### 步骤 2：实现工具执行逻辑

```python
def search_database(query: str, limit: int = 10) -> list[dict]:
    """执行数据库搜索"""
    # 实现搜索逻辑
    return db.search(query, limit=limit)
```

### 步骤 3：集成到 Agent 循环

```python
def agent_loop(user_input: str, tools: dict, llm: Any) -> str:
    messages = [{"role": "user", "content": user_input}]

    while True:
        response = llm.chat(messages, tools=tools)

        if response.tool_calls:
            # 执行工具调用
            for tool_call in response.tool_calls:
                result = tools[tool_call.name](**tool_call.args)
                messages.append({"role": "tool", "content": result})
        else:
            return response.content
```

### 步骤 4：添加工具验证

```python
def validate_tool_result(tool_name: str, result: Any) -> bool:
    """验证工具返回结果"""
    if tool_name == "search_database":
        return isinstance(result, list)
    elif tool_name == "calculator":
        return isinstance(result, (int, float))
    return True
```

### 步骤 5：实现错误处理与重试

```python
async def execute_tool_with_retry(tool: Tool, input_data: dict, max_retries: int = 3):
    for attempt in range(max_retries):
        try:
            result = await tool.execute(input_data)
            if validate_tool_result(tool.name, result):
                return result
        except Exception as e:
            if attempt == max_retries - 1:
                raise
```

## 主流框架对比

| 框架/协议                   | 类型     | 特点                   | 适用场景       |
| --------------------------- | -------- | ---------------------- | -------------- |
| **OpenAI Function Calling** | API 原生 | 简单易用、广泛支持     | OpenAI 生态    |
| **LangChain Tools**         | 框架     | 丰富内置工具、统一接口 | 快速原型       |
| **MCP**                     | 开放协议 | 标准化、跨平台         | 通用工具集成   |
| **Anthropic Tool Use**      | API 原生 | Claude 专用            | Anthropic 生态 |

## 最佳实践

### 工具选择策略

当有多个工具可用时，LLM 可能选择错误的工具。以下策略可以提高选择准确性：

**工具分组** 将工具按功能分组，先选组再选具体工具。

```python
# 工具分组示例
tool_groups = {
    "搜索": [web_search, doc_search, code_search],
    "计算": [calculator, unit_converter, date_calculator],
    "通信": [send_email, send_sms, post_to_slack],
    "数据": [query_database, read_file, write_file]
}

# 先让 LLM 选择组，再选择具体工具
def two_stage_tool_selection(task: str) -> Tool:
    group = llm.select_group(task, list(tool_groups.keys()))
    return llm.select_tool(task, tool_groups[group])
```

**工具优先级** 为工具设置优先级，避免 LLM 选择次优工具。

**示例驱动** 在工具描述中加入使用示例，帮助 LLM 理解何时使用该工具。

### 错误处理与重试

工具调用可能失败，需要完善的错误处理机制。

```python
class ToolExecutor:
    def __init__(self, max_retries: int = 3):
        self.max_retries = max_retries

    async def execute_with_retry(self, tool: Tool, input_data: Any) -> Any:
        last_error = None

        for attempt in range(self.max_retries):
            try:
                result = await tool.execute(input_data)

                # 验证结果
                if tool.validate_result(result):
                    return result
                else:
                    raise ToolValidationError("工具返回结果格式不正确")

            except ToolTimeoutError:
                last_error = ToolTimeoutError(f"工具 {tool.name} 执行超时")
                logger.warning(f"工具 {tool.name} 第 {attempt + 1} 次超时")

            except ToolError as e:
                last_error = e
                logger.warning(f"工具 {tool.name} 第 {attempt + 1} 次失败：{e}")

                # 如果是不可恢复的错误，直接返回
                if not e.is_recoverable():
                    break

        # 所有重试失败，将错误信息返回给 LLM
        return f"工具执行失败：{last_error}。请尝试其他方法。"
```

### 安全沙箱

工具调用可能带来安全风险，特别是代码执行和文件系统操作。

```python
import subprocess
import tempfile
from pathlib import Path

class SandboxedExecutor:
    def __init__(self, timeout: int = 30, max_memory_mb: int = 256):
        self.timeout = timeout
        self.max_memory_mb = max_memory_mb

    def execute_python(self, code: str) -> str:
        """在沙箱中执行 Python 代码"""
        with tempfile.TemporaryDirectory() as tmpdir:
            # 写入临时文件
            script_path = Path(tmpdir) / "script.py"
            script_path.write_text(code)

            # 使用 subprocess 限制资源
            try:
                result = subprocess.run(
                    ["python", str(script_path)],
                    capture_output=True,
                    text=True,
                    timeout=self.timeout,
                    cwd=tmpdir,
                    # 限制网络访问（通过命名空间隔离）
                )
                return result.stdout if result.returncode == 0 else f"错误：{result.stderr}"
            except subprocess.TimeoutExpired:
                return "错误：代码执行超时"
```

> ⚠️ 安全警告：永远不要在无沙箱的环境中执行 LLM 生成的代码。代码执行工具应该运行在隔离的容器中，限制网络访问、文件系统访问和资源使用。

### 工具缓存

对于相同的工具调用，缓存结果可以显著降低成本和延迟。

```python
from functools import lru_cache
import hashlib

class ToolCache:
    def __init__(self, max_size: int = 1000, ttl: int = 3600):
        self.cache: dict[str, tuple[Any, float]] = {}
        self.max_size = max_size
        self.ttl = ttl  # 缓存有效期（秒）

    def _make_key(self, tool_name: str, input_data: Any) -> str:
        content = f"{tool_name}:{json.dumps(input_data, sort_keys=True)}"
        return hashlib.sha256(content.encode()).hexdigest()

    def get(self, tool_name: str, input_data: Any) -> Any | None:
        key = self._make_key(tool_name, input_data)
        if key in self.cache:
            result, timestamp = self.cache[key]
            if time.time() - timestamp < self.ttl:
                return result
            else:
                del self.cache[key]
        return None

    def set(self, tool_name: str, input_data: Any, result: Any):
        key = self._make_key(tool_name, input_data)
        if len(self.cache) >= self.max_size:
            # 清除最旧的缓存
            oldest_key = min(self.cache, key=lambda k: self.cache[k][1])
            del self.cache[oldest_key]
        self.cache[key] = (result, time.time())
```

## 常见问题与避坑

### Q1：工具描述写不好怎么办？

- 使用**动词开头**的命名（如 `search_database` 而非 `database`）
- 添加**使用场景说明**
- 提供**参数示例**
- 让 LLM 帮你优化工具描述

### Q2：工具调用陷入死循环怎么办？

- 设置**最大调用次数**限制
- 检测**重复调用**相同工具
- 添加**终止条件**判断

### Q3：工具执行太慢怎么办？

- 使用**异步调用**
- 设置合理的**超时时间**
- 对结果进行**缓存**

### Q4：如何保证工具调用安全？

- 使用**沙箱环境**执行代码
- 限制**文件系统访问**权限
- 验证**输入参数**合法性
- 记录所有**操作日志**

### Q5：工具太多 LLM 选不准怎么办？

- **分组管理**：先选类别再选具体工具
- **动态加载**：只加载当前场景需要的工具
- **提供示例**：在描述中加入使用示例

:::warning 常见陷阱

- **描述模糊**：LLM 无法理解何时使用该工具
- **缺乏验证**：工具返回错误结果未被检测
- **忽视安全**：代码执行工具未做沙箱隔离
- **过度调用**：简单问题也调用工具增加成本
  :::

## 与其他概念的关系

**核心依赖**：

- [Agent](/glossary/agent) — 工具使用是 Agent 的核心能力之一，没有工具使用的 Agent 能力受限
- [函数调用](/glossary/function-calling) — 函数调用是工具使用的底层技术实现
- [MCP](/glossary/mcp) — MCP 是工具使用的标准化协议

**应用场景**：

- [自主 Agent](/glossary/autonomous-agent) — 自主 Agent 需要丰富的工具集来独立完成复杂任务
- [多 Agent 系统](/glossary/multi-agent) — 不同 Agent 可以使用不同的工具集，实现专业化分工

**技术基础**：

- [规划](/glossary/planning) — 规划能力决定 Agent 何时、如何使用工具
- [记忆](/glossary/memory) — 记忆工具调用的历史结果，避免重复调用

## 延伸阅读

- [函数调用](/glossary/function-calling)
- [MCP](/glossary/mcp)
- [Agent](/glossary/agent)
- [OpenAI Function Calling 文档](https://platform.openai.com/docs/guides/function-calling)
- [LangChain Tools 文档](https://python.langchain.com/docs/modules/agents/tools)
- [ReAct 论文](https://arxiv.org/abs/2210.03629)
