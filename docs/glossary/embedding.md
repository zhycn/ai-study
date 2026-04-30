---
title: Embedding
description: 将文本转换为向量表示的技术
---

# Embedding

把文字、图片等内容变成一串数字（向量）的技术。变成数字后，意思相近的内容在数字空间里距离就近，意思相差远的就远。这样电脑就能用数学方法来理解"苹果和梨比较像，苹果和汽车差很远"这种事。

## 概述

Embedding（嵌入）是一种将离散数据（如文本、图像、音频）映射到连续向量空间的技术。在自然语言处理中，Embedding 将 Token 转换为固定维度的稠密向量（Dense Vector），使得语义相似的文本在向量空间中距离更近。

Embedding 是大语言模型的基石之一。模型通过 Embedding 层将输入的 Token ID 转换为可计算的向量表示，后续的所有神经网络操作都基于这些向量进行。

## 为什么重要

- **语义表示**：将离散的符号转换为连续的数学表示，使计算机能够"理解"语义
- **相似度计算**：通过向量距离（余弦相似度、欧氏距离等）量化文本之间的语义相似性
- **向量检索**：支撑 [RAG](/glossary/rag) 系统的核心，实现高效的语义搜索
- **降维表达**：将高维稀疏的 One-Hot 编码压缩为低维稠密向量，大幅提升计算效率

::: tip
传统 One-Hot 编码下，词汇表大小为 50,000 时每个词需要 50,000 维的稀疏向量。而 Embedding 通常仅需 768-4096 维的稠密向量，且能捕捉语义关系。
:::

## 核心技术原理

### 从 One-Hot 到 Dense Vector

One-Hot 编码将每个词表示为一个仅在对应位置为 1、其余为 0 的向量。这种表示无法捕捉词与词之间的关系。

```text
# One-Hot 编码示例（词汇表: ["cat", "dog", "bird"]）
"cat"  -> [1, 0, 0]
"dog"  -> [0, 1, 0]
"bird" -> [0, 0, 1]
# 问题：无法表达 "cat" 和 "dog" 都是动物这一语义关系
```

Embedding 通过学习一个嵌入矩阵，将每个 Token 映射为稠密向量：

```text
# Embedding 示例（3 维向量，实际通常 768+ 维）
"cat"  -> [0.2,  0.8, -0.1]
"dog"  -> [0.3,  0.7,  0.0]
"bird" -> [-0.5, 0.1,  0.9]
# "cat" 和 "dog" 向量更接近，反映语义相似性
```

### Word2Vec 与静态 Embedding

Word2Vec 是早期的词嵌入技术，包含两种架构：

- **CBOW（Continuous Bag of Words）**：根据上下文词预测目标词
- **Skip-gram**：根据目标词预测上下文词

```python
# Gensim 使用 Word2Vec 示例
from gensim.models import Word2Vec

sentences = [["cat", "say", "meow"], ["dog", "say", "woof"]]
model = Word2Vec(sentences, vector_size=100, window=5, min_count=1)

# 语义类比：king - man + woman ≈ queen
vector = model.wv["king"] - model.wv["man"] + model.wv["woman"]
similar = model.wv.similar_by_vector(vector, topn=1)
```

::: warning
Word2Vec 等静态 Embedding 为每个词分配固定向量，无法处理一词多义（Polysemy）。例如 "bank" 在 "river bank" 和 "bank account" 中含义不同，但静态 Embedding 只能给出一个向量。
:::

### 上下文 Embedding（动态嵌入）

现代大语言模型使用上下文感知的 Embedding，同一个 Token 在不同上下文中会获得不同的向量表示。

```python
# 使用 Hugging Face Transformers 获取上下文 Embedding
from transformers import AutoTokenizer, AutoModel
import torch

tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")
model = AutoModel.from_pretrained("bert-base-uncased")

text1 = "I deposited money in the bank"
text2 = "I sat by the river bank"

for text in [text1, text2]:
    inputs = tokenizer(text, return_tensors="pt")
    outputs = model(**inputs)
    # "bank" 在两个句子中的 Embedding 不同
    bank_idx = inputs["input_tokens"].index("bank")
    bank_embedding = outputs.last_hidden_state[0, bank_idx]
    print(f"'{text}' 中 'bank' 的 Embedding: {bank_embedding[:5]}...")
```

### 相似度计算

```python
import numpy as np

def cosine_similarity(vec_a, vec_b):
    """计算余弦相似度"""
    dot_product = np.dot(vec_a, vec_b)
    norm_a = np.linalg.norm(vec_a)
    norm_b = np.linalg.norm(vec_b)
    return dot_product / (norm_a * norm_b)

# 示例
cat_vec = np.array([0.2, 0.8, -0.1])
dog_vec = np.array([0.3, 0.7, 0.0])
bird_vec = np.array([-0.5, 0.1, 0.9])

print(f"cat-dog 相似度: {cosine_similarity(cat_vec, dog_vec):.3f}")
print(f"cat-bird 相似度: {cosine_similarity(cat_vec, bird_vec):.3f}")
```

## 应用场景

### 语义搜索

```python
# 使用 Embedding 实现语义搜索
from openai import OpenAI

client = OpenAI()

def get_embedding(text):
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=text
    )
    return response.data[0].embedding

# 构建文档索引
documents = [
    "Python 是一种流行的编程语言",
    "机器学习需要大量数据",
    "深度学习使用神经网络"
]
doc_embeddings = [get_embedding(doc) for doc in documents]

# 搜索查询
query = "如何用 Python 实现 AI"
query_embedding = get_embedding(query)

# 找到最相似的文档
similarities = [cosine_similarity(query_embedding, doc_emb)
                for doc_emb in doc_embeddings]
best_match = documents[similarities.index(max(similarities))]
```

### 聚类与分类

Embedding 可用于文档聚类、情感分析、主题分类等任务：

```python
from sklearn.cluster import KMeans

# 对文档 Embedding 进行聚类
kmeans = KMeans(n_clusters=3, random_state=42)
clusters = kmeans.fit_predict(doc_embeddings)

for doc, cluster in zip(documents, clusters):
    print(f"文档: {doc} -> 聚类: {cluster}")
```

### RAG 系统中的 Embedding

在检索增强生成（RAG）系统中，Embedding 用于将知识库文档向量化，实现语义检索：

```text
用户问题 -> Embedding -> 向量检索 -> 相关文档 -> 输入 LLM -> 生成回答
```

具体流程参见 [RAG](/glossary/rag) 词条。

## 工程实践

### Embedding 模型选择

不同场景应选择合适的 Embedding 模型：

| 模型                   | 维度 | 最大输入 | 适用场景       |
| ---------------------- | ---- | -------- | -------------- |
| text-embedding-3-small | 1536 | 8191     | 通用语义搜索   |
| text-embedding-3-large | 3072 | 8191     | 高精度语义匹配 |
| bge-large-zh           | 1024 | 512      | 中文场景优化   |
| m3e                    | 1024 | 512      | 中文多任务     |
| nomic-embed-text       | 768  | 8192     | 开源长文本     |

```python
# 根据场景选择 Embedding 模型
def select_embedding_model(task: str, language: str = "en") -> str:
    """选择适合的 Embedding 模型"""
    if language == "zh":
        return "bge-large-zh" if task == "search" else "m3e"
    if task == "search":
        return "text-embedding-3-small"
    if task == "classification":
        return "text-embedding-3-large"
    return "text-embedding-3-small"
```

### 向量存储与检索

```python
import numpy as np

class SimpleVectorStore:
    """简单的向量存储与检索"""

    def __init__(self, dimension: int):
        self.vectors = []
        self.metadata = []
        self.dimension = dimension

    def add(self, vector: list[float], meta: dict):
        """添加向量"""
        self.vectors.append(np.array(vector))
        self.metadata.append(meta)

    def search(self, query_vector: list[float], top_k: int = 5) -> list[dict]:
        """检索最相似的向量"""
        query = np.array(query_vector)
        similarities = [
            np.dot(v, query) / (np.linalg.norm(v) * np.linalg.norm(query))
            for v in self.vectors
        ]
        top_indices = np.argsort(similarities)[-top_k:][::-1]
        return [
            {"metadata": self.metadata[i], "score": float(similarities[i])}
            for i in top_indices
        ]
```

### Embedding 缓存策略

Embedding 计算成本较高，建议对相同输入进行缓存：

```python
import hashlib
import json

class EmbeddingCache:
    """Embedding 缓存"""

    def __init__(self):
        self.cache = {}

    def _hash(self, text: str) -> str:
        return hashlib.md5(text.encode()).hexdigest()

    def get(self, text: str) -> list[float] | None:
        return self.cache.get(self._hash(text))

    def set(self, text: str, embedding: list[float]):
        self.cache[self._hash(text)] = embedding

    def get_batch(self, texts: list[str]) -> tuple[list[list[float]], list[str]]:
        """批量获取，返回 (缓存结果, 需要计算的文本)"""
        cached = []
        to_compute = []
        for text in texts:
            emb = self.get(text)
            if emb:
                cached.append((text, emb))
            else:
                to_compute.append(text)
        return cached, to_compute
```

::: tip
对于大规模生产系统，建议使用专业的向量数据库（如 Milvus、Pinecone、Weaviate）而非内存存储。它们提供分布式索引、持久化和高级检索功能。
:::

## 与其他概念的关系

- [Token](/glossary/token) 是 Embedding 的输入，每个 Token 通过嵌入层转换为向量
- Embedding 的质量直接影响 [注意力机制](/glossary/attention) 的计算效果
- 向量化的文档存储在 [向量数据库](/glossary/vector-database) 中，支撑语义检索
- [RAG](/glossary/rag) 系统依赖 Embedding 实现文档检索和语义匹配

## 延伸阅读

- [Token](/glossary/token) — Embedding 的输入单元
- [注意力机制](/glossary/attention) — 基于 Embedding 的向量计算
- [RAG](/glossary/rag) — Embedding 在检索增强生成中的应用
- [向量数据库](/glossary/vector-database) — Embedding 的存储与检索
- [Efficient Estimation of Word Representations in Vector Space](https://arxiv.org/abs/1301.3781) — Word2Vec 原始论文
- [Sentence-BERT](https://arxiv.org/abs/1908.10084) — 句子级 Embedding 模型
