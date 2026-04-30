---
title: 函数调用
description: Function Calling，让模型调用外部工具的能力
---

# 函数调用

让 AI 从"光说不练"变成"说到做到"的能力。模型发现需要查天气、算数学、搜新闻时，能主动调用相应的工具或程序去执行，而不是只能干巴巴地生成文字。

## 概述

函数调用（Function Calling）是让大语言模型能够**调用外部函数或 API** 的技术。通过向模型提供函数的签名和描述，模型可以在需要时决定调用哪个函数、传入什么参数，并将函数执行结果融入后续的回复生成中。

函数调用是 AI 从"纯文本生成"走向"实际行动执行"的关键一步。它让模型不再局限于生成文字，而是能够查询实时数据、操作外部系统、执行计算任务，真正实现"说到做到"。

这项技术最早由 OpenAI 在 2023 年 6 月引入 ChatGPT API，随后 Anthropic、Google 等厂商也相继推出了各自的实现方案。

## 为什么重要

函数调用彻底改变了 AI 应用的能力边界：

- **突破知识限制**：模型可以获取训练数据之外的实时信息（天气、股价、新闻等）
- **执行实际操作**：发送邮件、创建日程、操作数据库、调用 API
- **精确计算**：将数学计算委托给代码引擎，避免模型的计算错误
- **任务闭环**：实现从"理解意图"到"执行操作"的完整闭环
- **结构化输出**：通过函数参数定义，强制模型输出结构化的 JSON 数据

::: tip 提示
函数调用不是让模型直接执行代码，而是让模型**决定**调用哪个函数以及传入什么参数。实际的函数执行由应用程序完成。
:::

## 工作原理

### 调用流程

```text
┌─────────────────────────────────────────────────────────┐
│ 1. 定义函数                                               │
│    向模型提供函数名、描述、参数 schema                      │
├─────────────────────────────────────────────────────────┤
│ 2. 用户提问                                               │
│    用户发送包含任务意图的消息                               │
├─────────────────────────────────────────────────────────┤
│ 3. 模型决策                                               │
│    模型判断是否需要调用函数，以及调用哪个函数                 │
├─────────────────────────────────────────────────────────┤
│ 4. 生成参数                                               │
│    模型根据用户输入生成函数调用的参数（JSON 格式）           │
├─────────────────────────────────────────────────────────┤
│ 5. 执行函数                                               │
│    应用程序解析模型输出，执行实际的函数调用                  │
├─────────────────────────────────────────────────────────┤
│ 6. 返回结果                                               │
│    将函数执行结果作为新的消息加入对话上下文                   │
├─────────────────────────────────────────────────────────┤
│ 7. 生成回复                                               │
│    模型基于函数结果生成最终的用户回复                        │
└─────────────────────────────────────────────────────────┘
```

### 代码示例

```python
from openai import OpenAI

client = OpenAI()

# 定义可用函数
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "获取指定城市的天气信息",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {
                        "type": "string",
                        "description": "城市名称，如 '北京'、'上海'"
                    },
                    "unit": {
                        "type": "string",
                        "enum": ["celsius", "fahrenheit"],
                        "description": "温度单位"
                    }
                },
                "required": ["city"]
            }
        }
    }
]

# 第一轮：模型决定是否调用函数
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "北京今天天气怎么样？"}],
    tools=tools,
)

# 检查模型是否请求调用函数
if response.choices[0].message.tool_calls:
    tool_call = response.choices[0].message.tool_calls[0]

    # 执行实际的函数调用
    if tool_call.function.name == "get_weather":
        args = json.loads(tool_call.function.arguments)
        result = fetch_weather(args["city"], args.get("unit", "celsius"))

    # 第二轮：将结果返回给模型
    final_response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "user", "content": "北京今天天气怎么样？"},
            response.choices[0].message,
            {
                "role": "tool",
                "tool_call_id": tool_call.id,
                "content": json.dumps(result)
            }
        ],
        tools=tools,
    )
```

## 函数描述最佳实践

函数描述的质量直接影响模型的调用准确率：

**好的函数描述**

```json
{
  "name": "search_database",
  "description": "在用户订单数据库中搜索符合条件的订单记录。仅用于查询，不修改数据。",
  "parameters": {
    "type": "object",
    "properties": {
      "user_id": {
        "type": "string",
        "description": "用户 ID，格式为 'USR-' 加 8 位数字"
      },
      "status": {
        "type": "string",
        "enum": ["pending", "shipped", "delivered", "cancelled"],
        "description": "订单状态过滤条件"
      },
      "date_from": {
        "type": "string",
        "format": "date",
        "description": "起始日期，ISO 8601 格式"
      }
    },
    "required": ["user_id"]
  }
}
```

**描述要点**

- **函数名**：使用清晰的动词 + 名词格式（`get_weather`、`search_database`）
- **描述**：说明函数的用途、限制和注意事项
- **参数描述**：每个参数都要有清晰的描述，包括格式、取值范围、是否必填
- **枚举值**：尽可能使用 `enum` 约束参数的取值范围

## 多函数调用

模型可以在单次响应中调用多个函数：

```json
{
  "tool_calls": [
    {
      "function": {
        "name": "get_weather",
        "arguments": "{\"city\": \"北京\"}"
      }
    },
    {
      "function": {
        "name": "get_weather",
        "arguments": "{\"city\": \"上海\"}"
      }
    }
  ]
}
```

适用场景：用户请求涉及多个独立查询时，模型可以并行调用多个函数。

## 技术对比

| 特性     | OpenAI Function Calling | Anthropic Tool Use | [MCP](/glossary/mcp) |
| -------- | ----------------------- | ------------------ | -------------------- |
| 标准化   | OpenAI 专有             | Anthropic 专有     | 开放标准             |
| 函数发现 | 通过 API 参数传递       | 通过提示词传递     | Server 自动发现      |
| 传输方式 | API 请求/响应           | API 请求/响应      | 多种传输层           |
| 资源访问 | 仅工具调用              | 仅工具调用         | 工具 + 资源 + 提示   |
| 互操作性 | 绑定 OpenAI             | 绑定 Anthropic     | 跨厂商               |

::: info 说明
Function Calling 和 Tool Use 本质上是同一概念的不同实现。MCP 则是一个更上层的协议，旨在标准化整个工具接入生态。
:::

## 工程实践

### 错误处理

函数调用可能失败，需要完善的错误处理机制：

```python
try:
    result = execute_function(tool_call)
    tool_result = json.dumps(result)
except Exception as e:
    # 将错误信息返回给模型，让其尝试其他方式
    tool_result = json.dumps({"error": str(e)})

# 将结果（或错误）返回给模型
```

### 安全考量

::: warning 警告
函数调用赋予模型执行实际操作的能力，必须做好安全防护。
:::

- **参数验证**：对模型生成的参数进行严格校验
- **权限控制**：限制模型可以调用的函数范围
- **敏感操作确认**：删除、转账等敏感操作需要用户确认
- **速率限制**：防止模型过度调用外部 API
- **超时处理**：为函数调用设置合理的超时时间

### 调试技巧

- **日志记录**：记录每次函数调用的决策、参数和结果
- **模型思维输出**：开启模型的 reasoning 输出，理解其调用决策
- **模拟测试**：使用 mock 函数测试模型的调用逻辑
- **可视化工具**：使用 LangSmith、Weights & Biases 等工具追踪调用链

## 实施步骤

### 步骤 1：定义可用函数

为每个需要暴露给模型的功能定义函数签名：

```python
tools = [
    {
        'type': 'function',
        'function': {
            'name': 'get_weather',
            'description': '获取指定城市的实时天气信息',
            'parameters': {
                'type': 'object',
                'properties': {
                    'city': {
                        'type': 'string',
                        'description': '城市名称，如"北京"、"上海"'
                    },
                    'unit': {
                        'type': 'string',
                        'enum': ['celsius', 'fahrenheit'],
                        'description': '温度单位，默认摄氏度'
                    }
                },
                'required': ['city']
            }
        }
    },
    {
        'type': 'function',
        'function': {
            'name': 'search_orders',
            'description': '在订单数据库中搜索符合条件的订单',
            'parameters': {
                'type': 'object',
                'properties': {
                    'user_id': {'type': 'string', 'description': '用户 ID'},
                    'status': {
                        'type': 'string',
                        'enum': ['pending', 'shipped', 'delivered'],
                        'description': '订单状态'
                    }
                },
                'required': ['user_id']
            }
        }
    }
]
```

### 步骤 2：实现函数执行逻辑

```python
import requests

def get_weather(city: str, unit: str = 'celsius') -> dict:
    """查询天气 API"""
    url = f'https://api.weather.com/v1/{city}'
    params = {'unit': unit}
    response = requests.get(url, params=params)
    return response.json()

def search_orders(user_id: str, status: str = None) -> list:
    """查询订单数据库"""
    url = 'https://api.example.com/orders'
    params = {'user_id': user_id}
    if status:
        params['status'] = status
    response = requests.get(url, params=params)
    return response.json()

# 函数注册表
FUNCTION_REGISTRY = {
    'get_weather': get_weather,
    'search_orders': search_orders,
}
```

### 步骤 3：构建调用循环

```python
import json

def handle_function_calling(user_message: str, tools: list) -> str:
    """处理函数调用完整流程"""
    messages = [{'role': 'user', 'content': user_message}]

    # 第一轮：模型决定是否调用函数
    response = client.chat.completions.create(
        model='gpt-4o',
        messages=messages,
        tools=tools,
    )

    assistant_message = response.choices[0].message
    messages.append(assistant_message)

    # 检查是否需要调用函数
    if not assistant_message.tool_calls:
        return assistant_message.content

    # 执行函数调用
    for tool_call in assistant_message.tool_calls:
        func_name = tool_call.function.name
        func_args = json.loads(tool_call.function.arguments)

        try:
            # 执行实际函数
            func = FUNCTION_REGISTRY[func_name]
            result = func(**func_args)
            tool_result = json.dumps(result, ensure_ascii=False)
        except Exception as e:
            tool_result = json.dumps({'error': str(e)})

        # 将结果返回给模型
        messages.append({
            'role': 'tool',
            'tool_call_id': tool_call.id,
            'content': tool_result
        })

    # 第二轮：模型基于函数结果生成最终回复
    final_response = client.chat.completions.create(
        model='gpt-4o',
        messages=messages,
        tools=tools,
    )

    return final_response.choices[0].message.content
```

### 步骤 4：处理多轮函数调用

某些场景需要多次调用函数才能完成任务：

```python
def handle_multi_turn(user_message: str, tools: list, max_turns: int = 5) -> str:
    """支持多轮函数调用"""
    messages = [{'role': 'user', 'content': user_message}]

    for _ in range(max_turns):
        response = client.chat.completions.create(
            model='gpt-4o',
            messages=messages,
            tools=tools,
        )

        assistant_message = response.choices[0].message
        messages.append(assistant_message)

        if not assistant_message.tool_calls:
            return assistant_message.content

        for tool_call in assistant_message.tool_calls:
            func_name = tool_call.function.name
            func_args = json.loads(tool_call.function.arguments)
            result = FUNCTION_REGISTRY[func_name](**func_args)

            messages.append({
                'role': 'tool',
                'tool_call_id': tool_call.id,
                'content': json.dumps(result, ensure_ascii=False)
            })

    return '达到最大调用次数限制'
```

### 步骤 5：测试与验证

```python
# 测试用例
test_cases = [
    {'input': '北京今天天气？', 'expected_function': 'get_weather'},
    {'input': '查一下我的订单', 'expected_function': 'search_orders'},
    {'input': '你好', 'expected_function': None},  # 不应调用函数
]

for case in test_cases:
    result = handle_function_calling(case['input'], tools)
    print(f"输入: {case['input']}")
    print(f"输出: {result}")
    print('---')
```

## 最佳实践

### 函数设计原则

- **单一职责**：每个函数只做一件事
- **清晰命名**：使用 `动词_名词` 格式（`get_weather`、`search_orders`）
- **详细描述**：说明用途、限制、注意事项
- **参数约束**：使用 `enum`、`format` 等约束参数取值
- **错误处理**：函数失败时返回结构化错误信息

### 安全考量

::: warning 警告
函数调用赋予模型执行实际操作的能力，必须做好安全防护。
:::

- **参数验证**：对模型生成的参数进行严格校验
- **权限控制**：限制模型可调用的函数集合
- **敏感操作确认**：删除、转账等操作需用户手动确认
- **速率限制**：防止模型过度调用外部 API
- **超时处理**：为函数调用设置合理的超时时间

### 调试技巧

- **日志记录**：记录每次函数调用的决策、参数和结果
- **模型思维输出**：开启 reasoning 输出，理解调用决策
- **模拟测试**：使用 mock 函数测试调用逻辑
- **可视化工具**：使用 LangSmith 等工具追踪调用链

## 常见问题与避坑

### FAQ

**Q1：模型什么时候会调用函数，什么时候直接回答？**

模型会根据用户问题和函数描述自动判断。如果问题与某个函数的功能相关，模型倾向于调用该函数；如果问题可以直接回答（如闲聊），模型不会调用函数。可以通过提示词引导："如果需要查询实时信息，请调用相应工具"。

**Q2：函数调用失败怎么办？**

::: tip 建议
永远不要假设函数调用一定成功。
:::

- 捕获异常并返回结构化错误信息给模型
- 模型收到错误后可能尝试重新调用或换一种方式回答
- 设置最大重试次数，避免无限循环

**Q3：可以限制模型只能调用特定函数吗？**

可以。在 API 请求中只传入允许使用的函数定义。不同场景使用不同的工具集合：

```python
# 客服场景只允许查询类函数
customer_service_tools = [search_orders, get_order_status]

# 管理场景允许更多操作
admin_tools = [search_orders, cancel_order, refund]
```

**Q4：函数参数太多会影响调用准确率吗？**

会。参数越多，模型生成正确参数的难度越大。建议：

- 只保留必要参数，其他使用默认值
- 为每个参数提供清晰的描述和示例
- 使用 `enum` 约束取值范围
- 复杂参数考虑拆分为多个函数

**Q5：Function Calling 和 MCP 选哪个？**

- **Function Calling**：适合简单场景，工具数量少且固定
- **MCP**：适合构建可扩展的工具生态，支持工具复用和跨应用共享

两者可以配合使用：MCP 负责工具标准化接入，Function Calling 负责模型调用决策。

### 常见陷阱

| 陷阱         | 表现                     | 解决方案                     |
| ------------ | ------------------------ | ---------------------------- |
| 函数描述模糊 | 模型调用错误的函数       | 提供清晰、具体的描述         |
| 参数缺少描述 | 模型生成错误的参数值     | 每个参数都要详细描述         |
| 未处理空调用 | 模型不调用函数时程序崩溃 | 检查 `tool_calls` 是否为空   |
| 无限循环     | 模型反复调用同一函数     | 设置最大调用次数             |
| 并发冲突     | 多函数调用结果顺序混乱   | 使用 `tool_call_id` 匹配结果 |

## 与其他概念的关系

- 函数调用是 [Agent](/glossary/agent) 实现工具使用的核心机制
- [MCP](/glossary/mcp) 提供了比函数调用更标准化的工具接入方案
- [工作流](/glossary/workflow) 通过函数调用连接各个执行节点
- 函数描述的设计依赖 [提示词工程](/glossary/prompt-engineering) 的技巧
- [工具使用](/glossary/tool-use) 是函数调用的上层抽象

## 延伸阅读

- [OpenAI Function Calling 文档](https://platform.openai.com/docs/guides/function-calling)
- [Anthropic Tool Use 文档](https://docs.anthropic.com/en/docs/build-with-claude/tool-use)
- [Google Gemini Function Calling](https://ai.google.dev/gemini-api/docs/function-calling)
- [LangChain Tools 文档](https://python.langchain.com/docs/concepts/tools)
- [Agent 智能体](/glossary/agent)
- [MCP](/glossary/mcp)
- [工作流](/glossary/workflow)
- [提示词工程](/glossary/prompt-engineering)
