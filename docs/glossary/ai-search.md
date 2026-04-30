---
title: AI 搜索
description: AI Search，AI 增强的搜索引擎
---

# AI 搜索

## 概述

AI 搜索（AI Search）是指利用人工智能技术增强传统搜索能力的技术范式。与传统搜索引擎返回链接列表不同，AI 搜索能够理解用户意图，综合多个信息源，直接生成结构化的答案。

AI 搜索代表了搜索体验的根本性转变：从"寻找信息"到"获取答案"。用户不再需要逐个点击链接、阅读页面、提取关键信息，而是直接获得综合后的答案，并附带信息来源引用。

AI 搜索的核心技术架构可以概括为：

```text
AI 搜索 = 查询理解 + 语义检索 + 答案生成 + 来源引用
```

## 为什么重要

- **意图理解**：从关键词匹配升级为语义理解，能处理复杂、模糊、多意图的查询
- **答案直达**：从"十个蓝色链接"到"一个综合答案"，大幅缩短信息获取路径
- **多源综合**：自动整合多个信息源，提供全面、多角度的回答
- **对话式交互**：支持多轮追问，逐步深入探索话题
- **行业变革**：对传统搜索引擎（Google、百度）构成颠覆性挑战

::: tip 提示
AI 搜索不是要完全替代传统搜索。对于导航型查询（如"GitHub 登录"）和事务型查询（如"淘宝"），传统搜索的链接列表仍然更高效。AI 搜索最适合信息型和探索型查询。
:::

## 核心技术架构

### 查询理解（Query Understanding）

AI 搜索的第一步是深入理解用户的查询意图：

**查询改写（Query Rewriting）**

```text
原始查询："最好的笔记本电脑推荐"
改写后：["2024 年最佳笔记本电脑", "笔记本电脑购买指南", "笔记本电脑评测对比"]
```

**意图分类**

| 意图类型 | 示例 | 处理策略 |
|---------|------|---------|
| 信息型 | "量子计算是什么" | 检索知识性内容 |
| 导航型 | "GitHub 登录" | 直接返回目标链接 |
| 事务型 | "购买 iPhone 16" | 返回商品链接 |
| 比较型 | "React vs Vue" | 检索对比性内容 |

**查询分解**

将复杂查询分解为多个子查询：

```text
原始查询："GPT-4 和 Claude 3 在代码生成方面哪个更好？"
分解为:
1. "GPT-4 代码生成能力"
2. "Claude 3 代码生成能力"
3. "GPT-4 vs Claude 3 代码生成对比评测"
```

### 检索增强（Retrieval Augmentation）

AI 搜索的检索层结合了多种检索技术：

**混合检索（Hybrid Retrieval）**

```text
用户查询
    ├── 稠密检索（Dense Retrieval）
    │       └── 向量相似度搜索（Embedding）
    ├── 稀疏检索（Sparse Retrieval）
    │       └── BM25 关键词匹配
    └── 知识图谱检索
            └── 实体关系查询
                    ↓
              结果融合与重排序
```

**实时网络搜索**

与传统 RAG 检索静态知识库不同，AI 搜索需要实时抓取互联网内容：

```python
# AI 搜索的检索流程（伪代码）
def ai_search(query: str) -> dict:
    # 1. 查询改写和扩展
    expanded_queries = rewrite_query(query)
    
    # 2. 并行检索多个源
    results = parallel_map(
        lambda q: web_search(q, top_k=10),
        expanded_queries
    )
    
    # 3. 去重和重排序
    unique_results = deduplicate(results)
    ranked_results = rerank(query, unique_results)
    
    # 4. 抓取页面内容
    contents = fetch_contents(ranked_results[:5])
    
    # 5. 生成综合答案
    answer = llm.generate(
        prompt=f"基于以下信息回答: {query}\n\n{contents}",
        temperature=0.3
    )
    
    # 6. 提取引用来源
    citations = extract_citations(answer, ranked_results)
    
    return {"answer": answer, "citations": citations}
```

### 答案生成（Answer Generation）

使用 LLM 综合检索结果生成答案：

**生成策略**

| 策略 | 说明 | 适用场景 |
|------|------|---------|
| 直接综合 | 基于检索结果直接生成答案 | 事实性问题 |
| 分步推理 | 逐步推理后给出答案 | 复杂问题 |
| 多视角 | 从不同角度分别阐述 | 争议性话题 |
| 结构化 | 生成表格、列表等结构化输出 | 对比类问题 |

**引用标注**

AI 搜索必须标注信息来源，增强可信度和可追溯性：

```markdown
GPT-4 在代码生成方面表现出色，特别是在 Python 和 JavaScript 等主流语言上。
根据 HumanEval 基准测试，GPT-4 的 pass@1 准确率达到 67%[1]。

Claude 3 Opus 在代码生成方面同样优秀，在某些场景下甚至超过 GPT-4[2]。
Anthropic 报告称 Claude 3 在代码相关任务上比 Claude 2 提升了 50%[3]。

综合来看，两者在代码生成方面各有优势：
- GPT-4: 主流语言支持更广，生态系统更成熟
- Claude 3: 长上下文处理更好，代码理解能力更强

来源:
[1] OpenAI GPT-4 技术报告
[2] Anthropic Claude 3 技术报告
[3] 第三方对比评测
```

## 主流产品

### AI 搜索引擎

| 产品 | 厂商 | 特点 |
|------|------|------|
| Perplexity AI | Perplexity | 最早的 AI 搜索引擎之一，引用标注完善 |
| Google AI Overviews | Google | 整合到 Google 搜索中的 AI 答案 |
| Bing Copilot | Microsoft | 集成到 Edge 浏览器和 Bing 搜索 |
| 天工 AI 搜索 | 昆仑万维 | 中文 AI 搜索 |
| 知乎直答 | 知乎 | 基于知乎社区内容的 AI 搜索 |
| 秘塔 AI 搜索 | 秘塔科技 | 中文学术搜索 |
| Kimi 搜索 | 月之暗面 | 长文本理解能力强 |

### 技术栈

```text
检索层：
- 搜索引擎 API：Tavily、SerpAPI、Bing Search API
- 网页抓取：Jina Reader、Firecrawl、Crawl4AI
- 向量数据库：Pinecone、Qdrant、Weaviate

生成层：
- LLM：GPT-4o、Claude、Gemini
- 框架：LangChain、LlamaIndex

评估：
- 答案质量：RAGAS、DeepEval
- 引用准确性：人工评估 + 自动化检查
```

## 工程实践

### 降低幻觉策略

::: warning 警告
AI 搜索最大的风险是"幻觉"——生成看似合理但实际错误的信息。必须采取多重措施降低幻觉风险。
:::

**1. 严格基于检索结果**

```python
# 在提示词中强调仅基于检索结果回答
prompt = f"""基于以下检索到的信息回答问题。
如果信息不足以回答问题，请明确告知。
不要使用训练数据中的知识，仅使用以下信息。

问题: {query}

检索到的信息:
{retrieved_context}

回答:"""
```

**2. 事实验证**

```text
生成答案 → 提取事实声明 → 独立验证每个声明 → 标记不可靠内容
```

**3. 置信度标注**

为答案的每个部分标注置信度，让用户判断可信程度。

### 延迟优化

AI 搜索的延迟通常较高（3-10 秒），优化策略：

```text
1. 流式输出：先显示检索到的来源，再生成答案
2. 并行检索：同时查询多个搜索引擎和知识库
3. 缓存策略：缓存热门查询的答案
4. 渐进式渲染：先展示摘要，再逐步补充细节
5. 模型选择：简单问题用小模型，复杂问题用大模型
```

### 评估框架

| 维度 | 指标 | 说明 |
|------|------|------|
| 答案质量 | 准确性、完整性、相关性 | 人工评估 + LLM-as-a-Judge |
| 引用质量 | 引用准确性、来源权威性 | 人工抽查 |
| 响应速度 | 首字延迟、总延迟 | 性能监控 |
| 用户满意度 | 点赞/点踩、追问率 | 用户行为分析 |

## 与其他概念的关系

- AI 搜索的核心技术基于 [RAG](/glossary/rag) 架构
- 使用 [Embedding](/glossary/embedding) 实现语义检索
- 答案生成依赖 [大语言模型](/glossary/llm)
- 与 [对话系统](/glossary/conversational-ai) 有技术重叠，但搜索更强调信息检索
- [知识图谱](/glossary/knowledge-graph) 可增强实体理解和关系推理
- 需要关注生成内容的准确性和 [AI 安全](/glossary/ai-safety)

## 延伸阅读

- [Perplexity AI](https://www.perplexity.ai/)
- [RAG 技术详解](/glossary/rag)
- [Embedding 技术](/glossary/embedding)
- [大语言模型](/glossary/llm)
- [对话系统](/glossary/conversational-ai)
- [知识图谱](/glossary/knowledge-graph)
