---
title: 流式输出 (Streaming)
description: Streaming，实时逐字输出响应
---

# 流式输出 (Streaming)

AI 回答时不是等全部写完才显示，而是边写边显示，像打字一样一个字一个字蹦出来。这样你不用干等几秒钟，马上就能看到开头，体验好很多。

## 概述

流式输出（Streaming）是一种数据传输模式，AI 模型在生成完整回复之前，以流式方式逐字或逐 Token 地将部分结果推送给客户端，让用户能够实时看到生成过程，而非等待完整响应。

在传统 HTTP 请求-响应模式中，客户端必须等待服务器处理完整个请求后才能收到响应。对于 LLM 这种需要数秒甚至数十秒生成完整回复的场景，用户会感到明显的等待焦虑。流式输出通过"边生成边传输"的方式，将首字响应时间（TTFT）从数秒降低到数百毫秒，显著改善用户体验。

::: tip
流式输出改善的是用户的**感知延迟**，而非实际的总生成时间。模型仍然需要相同的时间生成完整回复，但用户可以在生成过程中就开始阅读内容。
:::

## 为什么重要

- **体验提升**：用户无需等待完整响应，首字响应时间（TTFT）从秒级降至毫秒级
- **感知速度**：人类对"正在发生"的等待焦虑远低于"完全静止"的等待
- **早期干预**：用户可以在生成过程中判断回答方向是否正确，提前终止不相关的生成
- **长文本友好**：对于代码生成、长文写作等场景，流式输出让用户逐步接收内容，避免长时间空白
- **资源优化**：用户提前终止时可以节省后续 Token 的生成成本
- **实时交互**：支持更自然的对话体验，接近人类实时对话的节奏

## 技术实现

### Server-Sent Events（SSE）

SSE 是流式输出最常用的传输协议，基于 HTTP 的单向服务器推送：

```python
# FastAPI + SSE 实现
from fastapi import FastAPI
from fastapi.responses import StreamingResponse

app = FastAPI()

async def generate_stream(prompt: str):
    """流式生成响应"""
    async for chunk in call_llm_streaming(prompt):
        # SSE 格式：data: <内容>\n\n
        yield f"data: {json.dumps({'content': chunk})}\n\n"

@app.post("/chat/stream")
async def stream_chat(request: ChatRequest):
    return StreamingResponse(
        generate_stream(request.prompt),
        media_type="text/event-stream"
    )
```

前端处理 SSE：

```javascript
const eventSource = new EventSource('/chat/stream?prompt=' + encodeURIComponent(prompt))

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data)
  appendToUI(data.content)
}

eventSource.onerror = () => {
  eventSource.close()
  console.error('Stream error')
}
```

### WebSocket

WebSocket 提供双向实时通信，适合需要客户端-服务端频繁交互的场景：

```python
# FastAPI WebSocket 实现
from fastapi import WebSocket

@app.websocket("/chat/ws")
async def websocket_chat(websocket: WebSocket):
    await websocket.accept()

    while True:
        message = await websocket.receive_text()

        async for chunk in call_llm_streaming(message):
            await websocket.send_text(json.dumps({
                "type": "chunk",
                "content": chunk
            }))

        # 发送完成信号
        await websocket.send_text(json.dumps({"type": "done"}))
```

### HTTP Chunked Transfer Encoding

分块传输编码，将响应体分多次发送：

```python
# Flask 实现分块传输
from flask import Response, stream_with_context

@app.route('/chat/stream', methods=['POST'])
def stream_chat():
    def generate():
        for chunk in call_llm_streaming(request.json['prompt']):
            yield chunk

    return Response(
        stream_with_context(generate()),
        mimetype='text/plain'
    )
```

### 流式 API 调用示例

```python
import openai

# OpenAI 流式调用
def stream_response(prompt):
    response = openai.OpenAI().chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        stream=True  # 启用流式模式
    )

    full_text = ""
    for chunk in response:
        delta = chunk.choices[0].delta
        if delta.content:
            full_text += delta.content
            yield delta.content  # 逐块返回

    return full_text

# 使用
for chunk in stream_response("解释量子计算"):
    print(chunk, end="", flush=True)
```

## 前端流式渲染

### React 实现

```tsx
import { useState } from 'react'

function ChatStream({ prompt }: { prompt: string }) {
  const [response, setResponse] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)

  const handleStream = async () => {
    setIsStreaming(true)
    setResponse('')

    const res = await fetch('/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    })

    const reader = res.body?.getReader()
    const decoder = new TextDecoder()

    while (reader) {
      const { done, value } = await reader.read()
      if (done) break

      const text = decoder.decode(value)
      // 解析 SSE 格式
      const lines = text.split('\n')
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6))
          setResponse((prev) => prev + data.content)
        }
      }
    }

    setIsStreaming(false)
  }

  return (
    <div>
      <button onClick={handleStream} disabled={isStreaming}>
        {isStreaming ? '生成中...' : '开始对话'}
      </button>
      <div className="response">{response}</div>
    </div>
  )
}
```

### Markdown 实时渲染

流式输出 Markdown 内容时，需要处理未闭合的语法：

````typescript
function StreamingMarkdown({ content }: { content: string }) {
  // 处理未闭合的代码块
  const safeContent = content.split('```').length % 2 === 0
    ? content
    : content + '\n```\n'; // 临时闭合

  // 处理未闭合的粗体/斜体
  // ...类似处理

  return <ReactMarkdown>{safeContent}</ReactMarkdown>;
}
````

## 主流框架对比

| 框架/协议          | 特点                           | 适用场景                  | 浏览器支持 |
| ------------------ | ------------------------------ | ------------------------- | ---------- |
| **SSE**            | 基于 HTTP 的单向推送，实现简单 | 服务端→客户端单向流式     | 原生支持   |
| **WebSocket**      | 双向实时通信，功能强大         | 需要客户端→服务端频繁交互 | 原生支持   |
| **HTTP Chunked**   | 分块传输编码，兼容性好         | 简单的流式响应            | 原生支持   |
| **gRPC Streaming** | 高性能 RPC 框架                | 微服务间流式通信          | 需额外库   |
| **WebTransport**   | 基于 QUIC，低延迟              | 对延迟极度敏感的场景      | 部分支持   |

## 实施步骤

### 第一步：选择传输协议

- **单向推送**（AI 回答用户）：选择 SSE，实现简单、浏览器原生支持
- **双向交互**（实时对话、工具调用）：选择 WebSocket
- **微服务间通信**：选择 gRPC Streaming

### 第二步：实现服务端流式接口

```python
from fastapi import FastAPI
from fastapi.responses import StreamingResponse

app = FastAPI()


async def generate_stream(prompt: str):
    """流式生成响应"""
    async for chunk in call_llm_streaming(prompt):
        yield f"data: {json.dumps({'content': chunk})}\n\n"


@app.post("/chat/stream")
async def stream_chat(request: ChatRequest):
    return StreamingResponse(generate_stream(request.prompt), media_type="text/event-stream")
```

### 第三步：实现客户端流式接收

```javascript
const eventSource = new EventSource('/chat/stream?prompt=' + encodeURIComponent(prompt))

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data)
  appendToUI(data.content)
}

eventSource.onerror = () => {
  eventSource.close()
}
```

### 第四步：处理错误和中断

- 服务端：捕获异常并发送错误事件
- 客户端：处理 onerror 事件，提供重试机制
- 实现中断接口，允许用户提前终止生成

### 第五步：处理 Markdown 渲染

流式输出 Markdown 时需要处理未闭合的语法（如代码块、粗体），在渲染前做安全检查。

### 第六步：监控流式指标

通过 [可观测性](/glossary/observability) 监控：

- TTFT（首字响应时间）
- TPS（Token 生成速度）
- 流式中断率
- 完整响应率

## 最佳实践

- **优先使用 SSE**：对于 AI 回答场景，SSE 比 WebSocket 更简单且足够
- **处理未闭合语法**：流式渲染 Markdown 时，临时闭合未完成的代码块和格式标记
- **实现中断机制**：允许用户提前终止生成，节省 Token 成本
- **错误处理要完善**：流式场景下错误处理更复杂，需要发送结构化错误事件
- **连接复用**：保持 HTTP 连接复用，减少握手开销
- **缓存结合**：缓存命中时模拟流式输出，保持一致的用户体验

## 常见问题与避坑

### Q1：SSE 和 WebSocket 如何选择？

- **SSE**：适合服务端→客户端单向推送，基于 HTTP，自动重连，实现简单
- **WebSocket**：适合双向通信，支持客户端→服务端消息，但需要处理心跳和重连

AI 对话场景如果只需要服务端推送回答，选 SSE；如果需要实时工具调用或多人协作，选 WebSocket。

### Q2：流式输出如何缓存？

缓存命中时可以模拟流式输出：

```python
# 缓存命中：逐词返回，模拟流式效果
for word in cached_response.split(" "):
    yield word + " "
    await asyncio.sleep(0.03)  # 模拟生成速度
```

### Q3：如何处理流式输出中的错误？

在流式过程中发生错误时，不能直接抛出异常（连接已建立），应该：

- 发送结构化错误事件：`{"type": "error", "code": "...", "message": "..."}`
- 然后发送完成事件：`{"type": "done"}`
- 客户端根据错误类型决定是否重试

### Q4：Nginx 反向代理下 SSE 不工作怎么办？

Nginx 默认会缓冲响应，导致 SSE 无法实时推送。需要配置：

```nginx
location /chat/stream {
    proxy_buffering off;
    proxy_cache off;
    proxy_pass http://backend;
}
```

### Q5：流式输出如何影响可观测性？

传统请求-响应指标（如总延迟）不再适用，需要关注：

- TTFT 而非总延迟
- TPS 而非吞吐量
- 流式中断率
- 需要特殊的指标聚合方式

## 与其他概念的关系

- 流式输出是 [延迟优化](/glossary/latency-optimization) 的核心手段，显著降低感知延迟
- 流式输出与 [缓存](/glossary/caching) 结合：缓存命中时可模拟流式输出
- 流式输出影响 [可观测性](/glossary/observability) 的指标设计，需要 TTFT、TPS 等流式指标
- 流式中断可以节省 Token 消耗，间接支持 [成本优化](/glossary/cost-optimization)
- 流式输出的实现需要关注 [Token](/glossary/token) 级别的生成过程
- [批处理](/glossary/batch-processing) 与流式输出是两种不同的处理模式，分别适用于离线和实时场景

## 延伸阅读

- [延迟优化](/glossary/latency-optimization) — 流式输出如何降低感知延迟
- [缓存](/glossary/caching) — 缓存命中时的流式模拟
- [可观测性](/glossary/observability) — 流式场景下的监控指标
- [成本优化](/glossary/cost-optimization) — 流式中断节省成本
- [批处理](/glossary/batch-processing) — 实时 vs 离线处理模式对比
- [MDN SSE 文档](https://developer.mozilla.org/zh-CN/docs/Web/API/Server-sent_events) — Server-Sent Events 标准
- [OpenAI 流式 API 文档](https://platform.openai.com/docs/api-reference/chat/create#chat-create-stream) — OpenAI 流式调用指南
