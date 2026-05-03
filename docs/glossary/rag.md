---
title: RAG
description: Retrieval-Augmented Generation，检索增强生成
---

# RAG

就是让 AI 回答问题之前，先去"翻书查资料"。就像开卷考试允许带参考书，AI 先找到相关资料再回答，答案自然更靠谱，不会瞎编。

## 概述

RAG（Retrieval-Augmented Generation，检索增强生成）是一种**结合信息检索与文本生成**的技术架构。其核心思想是：在模型生成回答之前，先从外部知识库中检索与问题相关的文档片段，将这些检索结果作为上下文补充到提示词中，从而让模型基于真实、最新的信息生成回答。

RAG 由 Facebook AI Research（FAIR）于 2020 年提出，最初用于解决开放域问答中的知识更新问题。随着大语言模型的普及，RAG 已成为企业级 AI 应用中最主流的技术方案之一。

## 为什么重要

RAG 解决了大语言模型的几个核心痛点：

- **知识截止（Knowledge Cutoff）**：模型训练数据有截止时间，无法回答之后的事件。RAG 通过检索外部知识，让模型"实时"获取最新信息
- **幻觉问题（Hallucination）**：模型可能编造看似合理但实际错误的信息。RAG 强制模型基于检索到的真实文档作答，大幅降低幻觉率
- **领域知识缺失**：通用模型缺乏企业私有知识。RAG 允许接入内部文档、数据库等私有数据源
- **可解释性与可追溯性**：RAG 可以明确标注答案来源，便于验证和审计
- **成本效益**：相比微调（Fine-tuning），RAG 无需重新训练模型，部署和维护成本更低

::: tip 提示
RAG 不是微调的替代品，而是互补方案。当需要模型学习特定输出风格或格式时，微调更合适；当需要模型访问动态更新的知识时，RAG 更合适。
:::

## 核心架构

### 标准 RAG 流程

```text
用户问题 → 向量化 → 向量检索 → 检索结果 → 构建提示词 → LLM 生成 → 返回答案
                              ↑
                        向量数据库
                              ↑
                        文档分块 → 向量化
```

### 关键组件

**1. 文档处理（Document Processing）**

将原始文档转换为可检索的格式：

- **格式解析**：处理 PDF、Word、HTML、Markdown 等不同格式
- **文本清洗**：去除噪声、统一编码、处理特殊字符
- **元数据提取**：保留文档标题、作者、时间等元信息

**2. 分块策略（Chunking Strategy）**

将长文档分割为适当大小的文本块：

| 策略         | 说明                        | 适用场景           |
| ------------ | --------------------------- | ------------------ |
| 固定长度分块 | 按字符数或 token 数均匀分割 | 通用场景           |
| 语义分块     | 按段落、章节等语义边界分割  | 结构化文档         |
| 重叠分块     | 相邻块之间保留一定重叠      | 避免关键信息被截断 |
| 递归分块     | 先大后小，递归分割          | 复杂文档结构       |

::: warning 注意
分块大小直接影响检索效果。块太小会丢失上下文，块太大会引入噪声。常见设置为 500-1000 个 token，重叠 10%-20%。
:::

**3. 向量化（Embedding）**

使用 Embedding 模型将文本块转换为向量表示。向量化质量直接决定检索效果。

**4. 向量存储（Vector Storage）**

将向量及其元数据存入向量数据库，支持高效的相似度搜索。常用方案包括：

- **专用向量数据库**：[Milvus](https://milvus.io/)、[Pinecone](https://www.pinecone.io/)、[Weaviate](https://weaviate.io/)、[Qdrant](https://qdrant.tech/)
- **传统数据库扩展**：PostgreSQL（[pgvector](https://github.com/pgvector/pgvector)）、Elasticsearch
- **嵌入式方案**：[Chroma](https://www.trychroma.com/)、[FAISS](https://github.com/facebookresearch/faiss)（适合小规模场景）

**5. 检索（Retrieval）**

根据用户问题的向量，在向量数据库中检索最相关的文档块：

- **稠密检索（Dense Retrieval）**：基于向量相似度（余弦相似度、内积）
- **稀疏检索（Sparse Retrieval）**：基于关键词匹配（BM25）
- **混合检索（Hybrid Retrieval）**：结合稠密和稀疏检索的优势

**6. 重排序（Reranking）**

对检索结果进行二次排序，提升 Top-K 结果的相关性：

- **交叉编码器（Cross-Encoder）**：精度高但速度慢
- **轻量级重排模型**：如 BGE-Reranker、Cohere Rerank
- **规则重排**：基于时间、权重等业务规则

**7. 生成（Generation）**

将检索结果与用户问题组合成提示词，交由 LLM 生成最终回答。提示词设计直接影响生成质量。

## 实施步骤

### 步骤 1：需求分析与技术选型

在构建 RAG 系统之前，明确以下问题：

- **知识源类型**：PDF、Word、网页、数据库还是 API？
- **检索精度要求**：需要精确匹配还是可以容忍一定误差？
- **响应延迟要求**：实时交互还是离线批处理？
- **数据更新频率**：静态知识库还是动态更新？

**技术栈选型建议**：

| 场景     | 推荐方案                                                                                                                 |
| -------- | ------------------------------------------------------------------------------------------------------------------------ |
| 快速原型 | [LangChain](https://python.langchain.com/) + [Chroma](https://www.trychroma.com/) + OpenAI Embedding                     |
| 生产环境 | [LlamaIndex](https://docs.llamaindex.ai/) + [Milvus](https://milvus.io/)/[Qdrant](https://qdrant.tech/) + 自建 Embedding |
| 企业级   | [Haystack](https://haystack.deepset.ai/) + Elasticsearch + 混合检索                                                      |
| 轻量部署 | [LangChain](https://python.langchain.com/) + [FAISS](https://github.com/facebookresearch/faiss) + 本地 Embedding 模型    |

### 步骤 2：文档处理与分块

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import DirectoryLoader

# 1. 加载文档
loader = DirectoryLoader('./docs/', glob='**/*.md')
documents = loader.load()

# 2. 分块处理
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,        # 每块约 500 token
    chunk_overlap=50,      # 重叠 50 token，避免信息截断
    length_function=len,
    separators=['\n\n', '\n', '。', '！', '？', ' ', '']
)
chunks = text_splitter.split_documents(documents)

print(f'文档总数: {len(documents)}')
print(f'分块总数: {len(chunks)}')
```

::: tip 提示
分块大小建议 300-800 token，重叠 10%-20%。结构化文档优先使用语义分块（按标题、段落分割）。
:::

### 步骤 3：向量化与存储

```python
from langchain_openai import OpenAIEmbeddings
from langchain_qdrant import [Qdrant](https://qdrant.tech/)VectorStore

# 1. 初始化 Embedding 模型
embeddings = OpenAIEmbeddings(model='text-embedding-3-small')

# 2. 创建向量存储
vector_store = [Qdrant](https://qdrant.tech/)VectorStore.from_documents(
    chunks,
    embeddings,
    collection_name='knowledge_base',
    url='http://localhost:6333'
)

# 3. 验证存储
print(f'向量数据库中的文档数: {vector_store.similarity_search("测试查询", k=1)}')
```

### 步骤 4：构建检索与生成链路

```python
from langchain_openai import ChatOpenAI
from langchain.chains import RetrievalQA
from langchain_core.prompts import PromptTemplate

# 1. 定义提示词模板
prompt_template = """你是专业的知识助手。请仅基于以下参考资料回答问题。
如果资料中没有相关信息，请明确告知。

参考资料：
{context}

问题：{question}

回答："""

prompt = PromptTemplate(
    template=prompt_template,
    input_variables=['context', 'question']
)

# 2. 构建 RAG 链路
llm = ChatOpenAI(model='gpt-4o-mini', temperature=0)
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type='stuff',
    retriever=vector_store.as_retriever(search_kwargs={'k': 3}),
    chain_type_kwargs={'prompt': prompt}
)

# 3. 执行查询
result = qa_chain.invoke({'query': '如何配置 RAG 系统的分块策略？'})
print(result['result'])
```

### 步骤 5：评估与优化

```python
from ragas import evaluate
from ragas.metrics import faithfulness, answer_relevancy, context_precision
from datasets import Dataset

# 准备评估数据
eval_data = {
    'questions': ['RAG 是什么？', '如何选择 Embedding 模型？'],
    'answers': [result1, result2],  # 系统生成的回答
    'contexts': [[ctx1], [ctx2]],    # 检索到的上下文
    'ground_truths': ['标准答案1', '标准答案2']
}

dataset = Dataset.from_dict(eval_data)

# 执行评估
scores = evaluate(
    dataset,
    metrics=[faithfulness, answer_relevancy, context_precision]
)
print(scores)
```

### 步骤 6：生产部署

- **缓存策略**：对高频查询结果进行缓存
- **监控告警**：监控检索延迟、生成质量、错误率
- **A/B 测试**：对比不同分块策略、Embedding 模型的效果
- **持续更新**：建立文档更新流水线，定期重建索引

## 进阶架构

### Naive RAG → Advanced RAG → Modular RAG

RAG 技术经历了三个发展阶段：

**Naive RAG（基础 RAG）**

最简单的"检索-生成"流程，存在检索不精确、生成质量不稳定等问题。

**Advanced RAG（进阶 RAG）**

引入预处理和后处理优化：

- **预处理优化**：更好的分块策略、索引优化、元数据增强
- **后处理优化**：重排序、上下文压缩、冗余消除

**Modular RAG（模块化 RAG）**

将 RAG 拆解为可组合的模块，支持灵活的架构定制：

- **搜索模块**：支持多种检索方式的组合
- **记忆模块**：引入对话历史和用户偏好
- **路由模块**：根据问题类型选择不同的处理路径
- **预测模块**：预测是否需要检索、检索什么内容

### Graph RAG

将知识图谱（Knowledge Graph）与 RAG 结合，利用实体关系网络提升检索的准确性和推理能力。适用于需要理解实体间复杂关系的场景。

### Agentic RAG

将 Agent 引入 RAG 流程，让 Agent 自主决定：

- 是否需要检索
- 检索什么内容
- 如何组合多个检索结果
- 是否需要多轮检索

## 工程实践

### 评估指标

| 指标         | 说明                         | 工具                                                                        |
| ------------ | ---------------------------- | --------------------------------------------------------------------------- |
| 上下文相关性 | 检索结果与问题的相关程度     | [RAGAS](https://docs.ragas.io/)、[DeepEval](https://docs.confident-ai.com/) |
| 上下文召回率 | 检索结果覆盖正确答案的比例   | [RAGAS](https://docs.ragas.io/)、[TruLens](https://www.trulens.org/)        |
| 答案忠实度   | 答案是否忠实于检索到的上下文 | [RAGAS](https://docs.ragas.io/)、[DeepEval](https://docs.confident-ai.com/) |
| 答案相关性   | 答案是否直接回答问题         | [RAGAS](https://docs.ragas.io/)、[TruLens](https://www.trulens.org/)        |

### 常见问题与解决方案

| 问题                 | 原因                         | 解决方案                               |
| -------------------- | ---------------------------- | -------------------------------------- |
| 检索不到相关内容     | 分块不合理、Embedding 质量差 | 优化分块策略、更换 Embedding 模型      |
| 检索结果过多噪声     | 块太大、检索阈值过低         | 减小块大小、调整相似度阈值、引入重排序 |
| 答案与检索结果不一致 | 提示词设计不当               | 在提示词中强调"仅基于提供的信息回答"   |
| 响应延迟高           | 检索链路长、模型大           | 缓存热门查询、使用更小的模型、异步检索 |

### 技术栈推荐

```text
文档处理：[Unstructured](https://unstructured.io/)、[LangChain](https://python.langchain.com/) Document Loaders
分块：[LangChain](https://python.langchain.com/) Text Splitters、[LlamaIndex](https://docs.llamaindex.ai/) Node Parser
Embedding：OpenAI text-embedding-3、BGE、Jina Embeddings
向量数据库：[Milvus](https://milvus.io/)、[Qdrant](https://qdrant.tech/)、[pgvector](https://github.com/pgvector/pgvector)
重排序：BGE-Reranker、Cohere Rerank
框架：[LangChain](https://python.langchain.com/)、[LlamaIndex](https://docs.llamaindex.ai/)、[Haystack](https://haystack.deepset.ai/)
评估：[RAGAS](https://docs.ragas.io/)、[DeepEval](https://docs.confident-ai.com/)、[TruLens](https://www.trulens.org/)
```

## 与其他概念的关系

- RAG 依赖 [Embedding](/glossary/embedding) 技术将文本转换为向量
- 使用 [向量数据库](/glossary/vector-database) 存储和检索向量
- 检索结果的呈现依赖 [提示词工程](/glossary/prompt-engineering) 的技巧
- [Agent](/glossary/agent) 可以自主决定何时使用 RAG 检索
- 与 [知识图谱](/glossary/knowledge-graph) 结合形成 Graph RAG
- 当 RAG 无法满足需求时，可考虑 [微调](/glossary/fine-tuning) 模型

## 延伸阅读

- [RAG 论文（Lewis et al., 2020）](https://arxiv.org/abs/2005.11401)
- [[RAGAS](https://docs.ragas.io/) 评估框架](https://docs.ragas.io/)
- [[LangChain](https://python.langchain.com/) RAG 教程](https://python.langchain.com/docs/tutorials/rag/)
- [[LlamaIndex](https://docs.llamaindex.ai/) 文档](https://docs.llamaindex.ai/)
- [Graph RAG 论文](https://arxiv.org/abs/2404.16130)
- [Embedding 技术](/glossary/embedding)
- [向量数据库](/glossary/vector-database)
- [提示词工程](/glossary/prompt-engineering)
- [Agent 智能体](/glossary/agent)
