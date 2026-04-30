---
title: 缓存
description: Caching，减少重复调用、降低成本的技术
---

# 缓存

## 概述

缓存（Caching）是一种将计算结果或数据副本存储在快速访问介质中的技术，当相同或相似的请求再次到来时，直接从缓存中返回结果，避免重复计算或外部调用。

在 AI 应用中，缓存是降低 [Token](/glossary/token) 消耗、减少 API 调用成本、提升响应速度的最有效手段之一。由于 LLM API 调用通常有较高的延迟和成本，缓存的收益尤为显著。

与传统 Web 缓存不同，AI 缓存需要处理文本语义的相似性判断、模型版本兼容性、以及生成结果的确定性等问题。

## 为什么重要

- **成本降低**：避免重复的 LLM API 调用，直接节省 Token 费用。对于高频重复查询，缓存可节省 30%-70% 的 API 成本
- **延迟降低**：缓存命中时毫秒级返回，相比 LLM API 的秒级响应，延迟降低 1-3 个数量级
- **稳定性提升**：减少对下游 LLM API 的依赖，在 API 故障或限流时仍能提供部分服务
- **可扩展性增强**：缓存层可以承受远高于 LLM API 的并发压力，保护后端服务
- **用户体验改善**：低延迟响应提升用户感知，尤其是对实时性要求高的场景

::: tip
缓存是 [成本优化](/glossary/cost-optimization) 和 [延迟优化](/glossary/latency-optimization) 的交叉点——同时实现降本和提速。
:::

## 缓存策略

### 精确缓存（Exact Cache）

精确缓存基于输入内容的精确匹配：

```python
import hashlib
import json

class ExactCache:
    """精确匹配缓存"""

    def __init__(self, store):
        self.store = store  # Redis、Memcached 等

    def _make_key(self, model, prompt, params):
        """生成缓存键"""
        content = json.dumps({
            "model": model,
            "prompt": prompt,
            "params": params,
        }, sort_keys=True)
        return f"llm:{hashlib.sha256(content.encode()).hexdigest()}"

    def get(self, model, prompt, params):
        key = self._make_key(model, prompt, params)
        return self.store.get(key)

    def set(self, model, prompt, params, response, ttl=3600):
        key = self._make_key(model, prompt, params)
        self.store.set(key, json.dumps(response), ex=ttl)
```

适用场景：FAQ、固定模板的问答、确定性输出任务。

### 语义缓存（Semantic Cache）

语义缓存基于输入内容的语义相似度判断，即使措辞不同但语义相近也能命中缓存：

```python
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

class SemanticCache:
    """语义相似度缓存"""

    def __init__(self, embedding_model, store, threshold=0.95):
        self.embedding_model = embedding_model
        self.store = store
        self.threshold = threshold

    def _get_embedding(self, text):
        return self.embedding_model.encode(text)

    def search(self, query, model, params):
        """搜索语义相似的缓存"""
        query_embedding = self._get_embedding(query)

        # 在向量数据库中搜索相似缓存
        results = self.store.search(
            vector=query_embedding,
            filter={"model": model, "params": params},
            top_k=5
        )

        for result in results:
            if result.similarity >= self.threshold:
                return result.response

        return None

    def store(self, query, response, model, params):
        """存储到语义缓存"""
        embedding = self._get_embedding(query)
        self.store.upsert(
            vector=embedding,
            metadata={
                "query": query,
                "response": response,
                "model": model,
                "params": params,
            }
        )
```

::: warning
语义缓存的阈值设置需要权衡：阈值过高会降低命中率，阈值过低可能返回不相关的结果。建议根据业务场景调优，并通过 [可观测性](/glossary/observability) 监控缓存命中率和用户满意度。
:::

### 分层缓存（Multi-Level Cache）

```text
┌─────────────────────────────────────────────────┐
│                   用户请求                        │
└──────────────────────┬──────────────────────────┘
                       ▼
              ┌─────────────────┐
              │   L1: 本地缓存   │  ← 进程内，微秒级
              │   (In-Memory)   │
              └────────┬────────┘
                       │ Miss
                       ▼
              ┌─────────────────┐
              │   L2: 分布式缓存 │  ← Redis，毫秒级
              │   (Redis)       │
              └────────┬────────┘
                       │ Miss
                       ▼
              ┌─────────────────┐
              │   L3: 语义缓存   │  ← 向量检索，10ms 级
              │   (Vector DB)   │
              └────────┬────────┘
                       │ Miss
                       ▼
              ┌─────────────────┐
              │   LLM API       │  ← 秒级
              └─────────────────┘
```

### TTL 与缓存失效策略

| 策略 | 说明 | 适用场景 |
|------|------|---------|
| **固定 TTL** | 设置统一的过期时间 | 通用场景 |
| **分级 TTL** | 根据数据类型设置不同 TTL | 多类型数据混合 |
| **主动失效** | 数据更新时主动清除缓存 | 数据变更频繁 |
| **惰性失效** | 访问时检查是否过期 | 读多写少场景 |
| **版本失效** | 模型或提示词版本变更时失效 | [版本管理](/glossary/versioning) 场景 |

## 实现方式

### 内存缓存

适合单进程、小规模场景：

```python
from functools import lru_cache
from cachetools import TTLCache

# Python 内置 LRU 缓存
@lru_cache(maxsize=1024)
def cached_llm_call(prompt: str) -> str:
    return call_llm_api(prompt)

# TTLCache：带过期时间的缓存
cache = TTLCache(maxsize=1000, ttl=3600)  # 1 小时过期

def get_with_cache(prompt):
    if prompt in cache:
        return cache[prompt]

    result = call_llm_api(prompt)
    cache[prompt] = result
    return result
```

### Redis 分布式缓存

适合多实例、高并发场景：

```python
import redis
import json

class RedisCache:
    """Redis 缓存实现"""

    def __init__(self, redis_url="redis://localhost:6379"):
        self.redis = redis.from_url(redis_url)

    def get(self, key):
        data = self.redis.get(key)
        return json.loads(data) if data else None

    def set(self, key, value, ttl=3600):
        self.redis.setex(key, ttl, json.dumps(value))

    def delete(self, key):
        self.redis.delete(key)

    def clear_pattern(self, pattern):
        """按模式清除缓存（如模型版本变更时）"""
        keys = self.redis.keys(pattern)
        if keys:
            self.redis.delete(*keys)
```

### 向量缓存

缓存 [Embedding](/glossary/embedding) 结果，避免重复向量化：

```python
class EmbeddingCache:
    """Embedding 结果缓存"""

    def __init__(self, redis_client, embedding_model):
        self.redis = redis_client
        self.model = embedding_model

    def get_embedding(self, text):
        import hashlib
        key = f"emb:{hashlib.md5(text.encode()).hexdigest()}"

        cached = self.redis.get(key)
        if cached:
            return json.loads(cached)

        # 计算 Embedding
        embedding = self.model.encode(text).tolist()
        self.redis.setex(key, 86400, json.dumps(embedding))  # 24 小时
        return embedding
```

### Prompt 缓存

缓存常用的提示词模板和系统提示：

```python
class PromptCache:
    """提示词模板缓存"""

    def __init__(self):
        self.templates = {}
        self.version_map = {}

    def register_template(self, name, template, version="1.0.0"):
        """注册提示词模板"""
        self.templates[name] = template
        self.version_map[name] = version

    def render(self, name, **kwargs):
        """渲染提示词模板"""
        if name not in self.templates:
            raise ValueError(f"Template '{name}' not found")

        template = self.templates[name]
        return template.format(**kwargs)

    def update_template(self, name, new_template, new_version):
        """更新提示词模板（旧版本仍保留）"""
        old_version = self.version_map[name]
        # 保留旧版本
        self.templates[f"{name}:{old_version}"] = self.templates[name]
        # 设置新版本
        self.templates[name] = new_template
        self.version_map[name] = new_version
```

## 工程实践

### 缓存预热

```python
def warmup_cache(frequent_queries, cache):
    """预热缓存：提前加载高频查询结果"""
    for query in frequent_queries:
        if cache.get(query) is None:
            result = call_llm_api(query)
            cache.set(query, result, ttl=7200)  # 2 小时
            print(f"Warmed up: {query[:50]}...")
```

### 缓存穿透防护

```python
class CacheWithNullMarker:
    """防止缓存穿透：缓存空结果"""

    def __init__(self, cache, null_ttl=60):
        self.cache = cache
        self.null_ttl = null_ttl
        self.NULL_MARKER = "__NULL__"

    def get(self, key):
        result = self.cache.get(key)
        if result == self.NULL_MARKER:
            return None  # 确认无数据
        return result

    def set(self, key, value, ttl=3600):
        if value is None:
            self.cache.set(key, self.NULL_MARKER, ex=self.null_ttl)
        else:
            self.cache.set(key, value, ex=ttl)
```

### 缓存与流式输出的结合

```python
async def streaming_with_cache(user_input, cache):
    """流式输出与缓存的结合"""
    # 先检查精确缓存
    cached = cache.get(user_input)
    if cached:
        # 缓存命中：模拟流式输出
        for chunk in cached.split(" "):
            yield chunk + " "
            await asyncio.sleep(0.05)  # 模拟流式延迟
        return

    # 缓存未命中：调用 API 并流式返回
    response = ""
    async for chunk in call_llm_streaming(user_input):
        response += chunk
        yield chunk

    # 完整响应后存入缓存
    cache.set(user_input, response)
```

## 与其他概念的关系

- 缓存是 [成本优化](/glossary/cost-optimization) 的核心手段之一，直接减少 API 调用
- 缓存命中提供极低延迟，是 [延迟优化](/glossary/latency-optimization) 的有效策略
- 缓存失效需要与 [版本管理](/glossary/versioning) 联动，确保模型或提示词变更后缓存及时更新
- [流式输出](/glossary/streaming) 场景中，缓存命中时可以模拟流式返回以提升用户体验
- 语义缓存依赖 [Embedding](/glossary/embedding) 技术进行相似度判断
- 缓存命中率和性能数据是 [可观测性](/glossary/observability) 的重要监控指标

## 延伸阅读

- [成本优化](/glossary/cost-optimization) — 缓存如何降低 API 成本
- [延迟优化](/glossary/latency-optimization) — 缓存对延迟的改善
- [版本管理](/glossary/versioning) — 缓存失效与版本变更的联动
- [流式输出](/glossary/streaming) — 缓存命中时的流式模拟
- [Embedding](/glossary/embedding) — 语义缓存的基础技术
- [Redis 官方文档](https://redis.io/docs/) — 分布式缓存实现
- [GPTCache 项目](https://github.com/zilliztech/GPTCache) — 专为 LLM 设计的语义缓存库
