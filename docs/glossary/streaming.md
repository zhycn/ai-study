---
title: 流式输出
description: Streaming，实时逐字输出响应
---

# 流式输出

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

## 应用场景

| 场景         | 流式输出的价值                           |
| ------------ | ---------------------------------------- |
| **对话系统** | 用户实时看到回复生成，体验接近真人对话   |
| **代码生成** | 开发者可以边生成边阅读，提前判断代码方向 |
| **内容创作** | 长文写作时逐步呈现内容，减少等待焦虑     |
| **搜索增强** | 实时显示检索和生成过程，增加透明度       |
| **数据分析** | 逐步展示分析结果和图表生成过程           |

## 工程实践

### 错误处理

流式场景下的错误处理比传统请求-响应更复杂：

```python
async def stream_with_error_handling(prompt):
    """流式输出中的错误处理"""
    try:
        async for chunk in call_llm_streaming(prompt):
            yield json.dumps({"type": "chunk", "data": chunk})
    except openai.RateLimitError:
        yield json.dumps({
            "type": "error",
            "code": "rate_limit",
            "message": "请求过于频繁，请稍后重试"
        })
    except openai.APITimeoutError:
        yield json.dumps({
            "type": "error",
            "code": "timeout",
            "message": "请求超时，请重试"
        })
    except Exception as e:
        yield json.dumps({
            "type": "error",
            "code": "internal_error",
            "message": "服务异常，请稍后重试"
        })
    finally:
        yield json.dumps({"type": "done"})
```

### 中断处理

```python
class StreamController:
    """流式输出控制器，支持中断"""

    def __init__(self):
        self.aborted = False

    def abort(self):
        self.aborted = True

    async def stream(self, prompt):
        async for chunk in call_llm_streaming(prompt):
            if self.aborted:
                yield json.dumps({"type": "aborted"})
                return
            yield json.dumps({"type": "chunk", "data": chunk})

        yield json.dumps({"type": "done"})
```

### 流式输出的缓存策略

```python
async def stream_with_cache(prompt, cache):
    """流式输出与缓存结合"""
    cached = cache.get(prompt)
    if cached:
        # 缓存命中：模拟流式输出
        words = cached.split(" ")
        for i, word in enumerate(words):
            yield word + (" " if i < len(words) - 1 else "")
            await asyncio.sleep(0.03)  # 模拟生成速度
        return

    # 缓存未命中：真实流式调用
    response = ""
    async for chunk in call_llm_streaming(prompt):
        response += chunk
        yield chunk

    # 完整响应后缓存
    cache.set(prompt, response)
```

::: warning
流式输出场景下的 [可观测性](/glossary/observability) 需要特殊处理。传统的请求-响应指标（如总延迟）不再适用，需要关注 TTFT、TPS、流式中断率等流式专属指标。
:::

### 性能优化

- **连接复用**：保持 HTTP 连接复用，减少握手开销
- **缓冲优化**：合理设置缓冲区大小，平衡延迟和吞吐量
- **CDN 加速**：对于静态流式内容，可使用 CDN 边缘节点
- **协议选择**：SSE 适合单向推送，WebSocket 适合双向交互

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
