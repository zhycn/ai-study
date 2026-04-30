---
title: API
description: Application Programming Interface，应用程序编程接口，AI 服务对外提供能力的标准方式
---

# API

不同软件之间"对话"的接口。你想在自己的程序里用 ChatGPT 的能力，不用自己训练模型，只要调一下 OpenAI 的 API 就行。就像点外卖——你不用自己做饭，只要下个订单，饭就送到你手上了。

## 概述

**API**（Application Programming Interface，应用程序编程接口）是不同软件系统之间进行数据交换和功能调用的接口规范。在 AI 领域，API 是将大语言模型、图像生成、语音识别等 AI 能力封装为可调用服务的标准方式。

通过 API，开发者无需自行部署和维护复杂的 AI 模型，只需发送 HTTP 请求即可调用强大的 AI 能力，大幅降低了 AI 应用的开发门槛。

:::tip API 的核心价值
API 将复杂的 AI 模型封装为简单的接口调用，开发者只需关注**输入什么**和**得到什么**，无需关心模型内部的实现细节。
:::

## 为什么重要

- **服务化**：将 AI 能力封装为标准化服务，开箱即用
- **降低门槛**：无需 GPU 和模型部署经验即可使用 AI 能力
- **标准化**：统一的调用方式，便于集成和替换
- **弹性伸缩**：云服务商自动处理并发和扩展
- **计费基础**：按调用量或 token 数计费，成本可控

## 核心技术/架构

### API 设计风格

| 风格          | 特点                         | 适用场景           |
| ------------- | ---------------------------- | ------------------ |
| **RESTful**   | 基于 HTTP 方法，资源导向     | 大多数 AI API      |
| **GraphQL**   | 客户端按需查询，减少过度获取 | 复杂数据查询       |
| **gRPC**      | 基于 Protobuf，高性能        | 内部服务通信       |
| **WebSocket** | 双向实时通信                 | 流式输出、实时对话 |

### 认证方式

```bash
# Bearer Token 认证（最常见）
curl https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer sk-xxx" \
  -H "Content-Type: application/json"

# API Key 认证
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: sk-ant-xxx" \
  -H "Content-Type: application/json"
```

常见认证方式：

- **API Key**：最简单的认证，直接在请求头中携带
- **Bearer Token**（JWT）：基于令牌的认证，支持过期和刷新
- **OAuth 2.0**：第三方授权，适合多租户场景
- **签名认证**：请求签名防篡改，安全性最高

### 请求/响应模式

```
客户端                          服务端
  │                               │
  ├── POST /chat/completions ────▶│
  │   {model, messages, ...}      │
  │                               │
  │                               │ (模型推理)
  │                               │
  │◀── {choices: [...]} ──────────┤
  │                               │
```

## 主流产品与实现

### 大语言模型 API

| 服务商        | API 端点                            | 模型           | 特点           |
| ------------- | ----------------------------------- | -------------- | -------------- |
| **OpenAI**    | `api.openai.com`                    | GPT-4o, o1, o3 | 生态最完善     |
| **Anthropic** | `api.anthropic.com`                 | Claude 3.5/4   | 长上下文，安全 |
| **Google**    | `generativelanguage.googleapis.com` | Gemini 2.0     | 多模态原生     |
| **智谱**      | `open.bigmodel.cn`                  | GLM-4          | 国产大模型     |
| **月之暗面**  | `api.moonshot.cn`                   | Kimi           | 长文本处理     |

### 多模态 API

- **图像生成**：DALL-E 3、Midjourney、Stable Diffusion API
- **图像理解**：GPT-4 Vision、Gemini Vision、Claude Vision
- **语音合成**（TTS）：OpenAI TTS、ElevenLabs
- **语音识别**（ASR）：OpenAI Whisper、Google Speech-to-Text

### API 网关与代理

- **LiteLLM**：统一接口调用多家 LLM 提供商
- **One API**：开源 API 网关，支持多模型路由
- **API 网关**：Kong、APISIX 等通用网关

## 工程实践

### OpenAI API 调用示例

```python
from openai import OpenAI

client = OpenAI(api_key="sk-xxx")

# 对话补全
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "你是一个专业的助手"},
        {"role": "user", "content": "请解释什么是 RAG"},
    ],
    temperature=0.7,
    max_tokens=1000,
)

print(response.choices[0].message.content)
```

### 流式输出

```python
# 流式响应，逐步输出结果
stream = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "写一首诗"}],
    stream=True,  # 启用流式输出
)

for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)
```

### 错误处理与重试

```python
import time
from openai import OpenAI, APIError, RateLimitError

client = OpenAI()

def call_with_retry(func, max_retries=3, base_delay=1):
    """带指数退避的重试机制"""
    for attempt in range(max_retries):
        try:
            return func()
        except RateLimitError as e:
            if attempt == max_retries - 1:
                raise
            delay = base_delay * (2 ** attempt)
            print(f"速率限制，等待 {delay} 秒后重试...")
            time.sleep(delay)
        except APIError as e:
            print(f"API 错误: {e}")
            raise

# 使用重试机制调用
response = call_with_retry(
    lambda: client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": "你好"}],
    )
)
```

### 成本监控

```python
# 计算 token 消耗和成本
def calculate_cost(prompt_tokens, completion_tokens, model="gpt-4o"):
    """计算 API 调用成本"""
    pricing = {
        "gpt-4o": {"input": 2.50, "output": 10.00},  # 每百万 token 美元
        "gpt-4o-mini": {"input": 0.15, "output": 0.60},
        "claude-3-5-sonnet": {"input": 3.00, "output": 15.00},
    }

    prices = pricing.get(model, {"input": 0, "output": 0})
    input_cost = (prompt_tokens / 1_000_000) * prices["input"]
    output_cost = (completion_tokens / 1_000_000) * prices["output"]

    return {
        "input_cost": f"${input_cost:.4f}",
        "output_cost": f"${output_cost:.4f}",
        "total": f"${input_cost + output_cost:.4f}",
    }

# 使用示例
usage = response.usage
cost = calculate_cost(usage.prompt_tokens, usage.completion_tokens)
print(f"本次调用成本: {cost['total']}")
```

### 最佳实践

- **设置超时**：避免请求无限等待
- **合理设置 max_tokens**：防止生成过长响应浪费成本
- **使用流式输出**：提升用户体验，减少感知延迟
- **缓存结果**：对相同查询缓存响应结果
- **监控配额**：设置告警防止超额消费
- **降级策略**：主模型不可用时切换到备用模型

:::warning 安全注意事项

- **绝不**在前端代码中暴露 API Key
- 使用环境变量或密钥管理服务存储密钥
- 定期轮换 API Key
- 设置使用配额和告警
- 验证和清理用户输入，防止注入攻击
  :::

## 与其他概念的关系

- 是使用 [大语言模型](/glossary/llm) 的主要方式，无需本地部署
- API 调用计费直接涉及 [成本优化](/glossary/cost-optimization) 策略
- 通过 [函数调用](/glossary/function-calling) 扩展 API 的能力边界
- [Embedding](/glossary/embedding) API 提供向量化能力，配合 [向量数据库](/glossary/vector-database) 使用
- [Agent](/glossary/agent) 通过 API 调用外部工具和服务

## 延伸阅读

- [大语言模型](/glossary/llm) — 大语言模型基础
- [成本优化](/glossary/cost-optimization) — AI 成本优化策略
- [函数调用](/glossary/function-calling) — 函数调用能力
- [Embedding](/glossary/embedding) — 文本向量化
- [向量数据库](/glossary/vector-database) — 向量存储与检索
- [OpenAI API 文档](https://platform.openai.com/docs/api-reference)
- [Anthropic API 文档](https://docs.anthropic.com/en/api/getting-started)
