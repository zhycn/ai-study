---
title: 向量数据库
description: Vector Database，存储和检索向量数据的数据库系统
---

# 向量数据库

## 概述

**向量数据库**（Vector Database）是专门用于存储和检索高维向量数据的数据库系统。与传统关系型数据库不同，向量数据库的核心能力是**近似最近邻搜索**（Approximate Nearest Neighbor, ANN），能够在海量向量中快速找到与查询向量最相似的数据。

向量数据库是 [RAG](/glossary/rag) 系统的核心基础设施，也是语义搜索、推荐系统、图像检索等 AI 应用的关键组件。

:::tip 为什么需要向量数据库？
传统数据库擅长精确匹配和范围查询，但无法高效处理"找出与这个向量最相似的 10 个向量"这类语义相似度查询。向量数据库通过专用索引算法解决了这一问题。
:::

## 为什么重要

- **语义检索**：支持基于语义相似度的搜索，突破关键词匹配的局限
- **高效查询**：处理亿级向量的毫秒级检索，满足生产环境延迟要求
- **可扩展性**：支持大规模数据存储和分布式部署
- **AI 原生**：专为 AI 应用设计，与 Embedding 模型无缝集成
- **多模态支持**：统一处理文本、图像、音频等不同模态的向量表示

## 核心技术/架构

### 向量索引算法

向量数据库的性能核心在于索引算法，主流方案包括：

| 算法 | 全称 | 特点 | 适用场景 |
|------|------|------|----------|
| **HNSW** | Hierarchical Navigable Small World | 多层图结构，查询速度快 | 高召回率要求的场景 |
| **IVF** | Inverted File Index | 聚类 + 倒排，内存占用低 | 大规模数据集 |
| **PQ** | Product Quantization | 向量压缩，节省存储 | 内存受限场景 |
| **LSH** | Locality-Sensitive Hashing | 哈希映射，理论保证 | 近似搜索 |

**HNSW** 是当前最流行的索引算法，通过构建多层导航图实现高效搜索：
- 上层节点稀疏，快速定位大致区域
- 下层节点密集，精确查找最近邻
- 查询复杂度为 O(log N)，远优于暴力搜索的 O(N)

### 相似度度量

向量数据库支持多种距离度量方式：

```python
# 常见相似度度量
import numpy as np

def cosine_similarity(a, b):
    """余弦相似度：衡量方向一致性，范围 [-1, 1]"""
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

def euclidean_distance(a, b):
    """欧氏距离：衡量空间中的绝对距离"""
    return np.linalg.norm(a - b)

def dot_product(a, b):
    """内积：同时考虑方向和大小"""
    return np.dot(a, b)
```

- **余弦相似度**（Cosine Similarity）：最常用，对向量长度不敏感
- **欧氏距离**（Euclidean Distance）：适合衡量绝对距离
- **内积**（Dot Product）：适合归一化后的向量

### 系统架构

典型向量数据库的架构分层：

```
┌─────────────────────────────────────────┐
│              API 层                      │
│   REST / gRPC / SDK (Python/Java/Go)    │
├─────────────────────────────────────────┤
│              服务层                      │
│   查询路由 / 负载均衡 / 元数据管理       │
├─────────────────────────────────────────┤
│              索引层                      │
│   HNSW / IVF / PQ 索引构建与查询         │
├─────────────────────────────────────────┤
│              存储层                      │
│   内存 / 磁盘 / 对象存储 / 分布式存储    │
└─────────────────────────────────────────┘
```

## 主流产品与实现

### 托管服务

- **Pinecone**：全托管向量数据库，开箱即用，支持 Serverless 模式，适合快速原型开发
- **Milvus Cloud**（Zilliz）：基于开源 Milvus 的托管服务，支持大规模分布式部署

### 开源方案

- **Milvus**：CNCF 孵化项目，功能最全面的开源向量数据库，支持分布式部署和多种索引类型
- **Weaviate**：Go 语言开发，内置向量化和模块扩展能力，支持 GraphQL 查询
- **Chroma**：Python 原生，轻量级，适合本地开发和小型项目
- **Qdrant**：Rust 开发，高性能，支持过滤和 payload 存储
- **Faiss**（Meta）：底层索引库，非完整数据库，常被其他项目集成

### 传统数据库扩展

- **pgvector**（PostgreSQL）：PostgreSQL 的向量扩展，适合已有 PG 生态的团队
- **Elasticsearch**：通过 dense_vector 类型支持向量搜索
- **Redis**：Redis Stack 提供向量搜索模块

:::info 选型建议
- 快速验证/小规模：Chroma、pgvector
- 生产环境/大规模：Milvus、Qdrant、Pinecone
- 已有 PG 生态：优先 pgvector，减少运维复杂度
:::

## 工程实践

### 基础使用示例

```python
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

# 初始化客户端
client = QdrantClient(url="http://localhost:6333")

# 创建集合
client.create_collection(
    collection_name="documents",
    vectors_config=VectorParams(size=768, distance=Distance.COSINE),
)

# 插入向量
points = [
    PointStruct(id=1, vector=[0.1, 0.2, ...], payload={"text": "文档内容"}),
]
client.upsert(collection_name="documents", points=points)

# 相似性搜索
results = client.search(
    collection_name="documents",
    query_vector=[0.15, 0.25, ...],
    limit=5,
)
```

### 索引调优

```python
# HNSW 参数调优
hnsw_config = {
    "m": 16,           # 最大连接数，越大精度越高但内存占用越大
    "ef_construct": 100,  # 构建时的搜索深度
    "ef": 50,          # 查询时的搜索深度，越大越精确但越慢
}

# 查询精度与延迟的权衡
# ef=10:  延迟低，召回率约 90%
# ef=50:  延迟中，召回率约 97%
# ef=100: 延迟高，召回率约 99%
```

### 混合搜索

结合向量搜索和传统过滤：

```python
# 带过滤条件的向量搜索
results = client.search(
    collection_name="documents",
    query_vector=query_embedding,
    query_filter=Filter(
        must=[
            FieldCondition(key="category", match=MatchValue(value="tech")),
            FieldCondition(key="date", range=Range(gte="2024-01-01")),
        ]
    ),
    limit=10,
)
```

### 性能优化

- **批量操作**：使用批量插入替代单条插入，提升吞吐量
- **索引预热**：服务启动后预先加载索引到内存
- **分区策略**：按业务维度分区，减少单次搜索范围
- **缓存策略**：对高频查询结果进行缓存

:::warning 注意事项
- 向量维度必须与 Embedding 模型输出一致
- 索引构建是 CPU 密集型操作，建议在离线阶段完成
- 定期监控索引的召回率和延迟指标
:::

## 与其他概念的关系

- 与 [Embedding](/glossary/embedding) 紧密配合，Embedding 模型生成向量，向量数据库负责存储和检索
- 是 [RAG](/glossary/rag) 系统的核心组件，提供知识检索能力
- 与 [知识图谱](/glossary/knowledge-graph) 互补，向量数据库擅长语义相似度，知识图谱擅长关系推理
- 在 [Agent](/glossary/agent) 架构中作为长期记忆存储

## 延伸阅读

- [RAG](/glossary/rag) — 检索增强生成系统
- [Embedding](/glossary/embedding) — 文本向量化表示
- [知识图谱](/glossary/knowledge-graph) — 结构化知识表示
- [Agent](/glossary/agent) — AI 智能体
- [Milvus 官方文档](https://milvus.io/docs)
- [HNSW 论文](https://arxiv.org/abs/1603.09320)
