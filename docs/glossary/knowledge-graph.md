---
title: 知识图谱
description: Knowledge Graph，以图结构表示实体及其关系的结构化知识表示方式
---

# 知识图谱

## 概述

**知识图谱**（Knowledge Graph）是一种以图结构（Graph Structure）表示实体（Entity）及其关系（Relation）的结构化知识表示方式。它由节点（实体）和边（关系）组成，将现实世界的知识组织为机器可理解和可推理的形式。

知识图谱的概念由 Google 在 2012 年首次提出并应用于搜索引擎，如今已成为智能问答、推荐系统、语义搜索等领域的核心基础设施。

:::tip 知识图谱 vs 向量数据库
知识图谱擅长**精确的关系推理**和**可解释的知识查询**，而向量数据库擅长**语义相似度检索**。两者在 [RAG](/glossary/rag) 系统中可以互补使用。
:::

## 为什么重要

- **结构化知识**：将非结构化知识组织为机器可理解的图结构
- **关系推理**：支持多跳查询（Multi-hop Query）和路径推理
- **可解释性**：知识来源和推理过程可追溯，满足合规要求
- **知识整合**：融合多源异构数据，消除信息孤岛
- **语义理解**：提供上下文和背景知识，增强 AI 系统的理解能力

## 核心技术/架构

### 数据模型

知识图谱的核心数据模型是**RDF 三元组**（Resource Description Framework Triple）：

```
(头实体, 关系, 尾实体)
(Head Entity, Relation, Tail Entity)
```

例如：`(乔布斯, 创立, 苹果公司)`

扩展模型包括：
- **属性图**（Property Graph）：节点和边都可以携带属性
- **OWL 本体**（Web Ontology Language）：定义概念层次和约束
- **RDF Schema**：定义词汇表和类层次

### 构建流程

知识图谱的构建通常包含以下步骤：

```
原始数据 → 信息抽取 → 知识融合 → 知识存储 → 知识应用
```

1. **信息抽取**（Information Extraction）
   - **命名实体识别**（NER）：识别文本中的人名、地名、机构名等
   - **关系抽取**（Relation Extraction）：识别实体间的关系
   - **属性抽取**（Attribute Extraction）：提取实体的属性值

2. **知识融合**（Knowledge Fusion）
   - **实体对齐**（Entity Alignment）：识别不同数据源中的同一实体
   - **实体消歧**（Entity Disambiguation）：区分同名不同义的实体
   - **知识合并**：融合多个知识源

3. **知识存储**
   - **图数据库**：Neo4j、NebulaGraph、JanusGraph
   - **RDF 存储**：Virtuoso、Apache Jena
   - **混合存储**：图数据库 + 搜索引擎

### 查询语言

```sparql
# SPARQL 查询示例：查找苹果公司的创始人
PREFIX ex: <http://example.org/>
SELECT ?founder WHERE {
  ex:AppleCompany ex:founder ?founder .
}
```

```cypher
# Cypher 查询示例（Neo4j）：查找与某人相关的所有公司
MATCH (p:Person {name: "乔布斯"})-[:FOUNDED]->(c:Company)
RETURN c.name, c.foundedYear
```

- **SPARQL**：W3C 标准，适用于 RDF 数据
- **Cypher**（Neo4j）：声明式图查询语言，语法直观
- **Gremlin**（Apache TinkerPop）：图遍历语言，支持多种图数据库

## 主流产品与实现

### 图数据库

| 产品 | 语言 | 特点 | 适用场景 |
|------|------|------|----------|
| **Neo4j** | Java | 最成熟的图数据库，Cypher 查询语言 | 通用图应用 |
| **NebulaGraph** | C++ | 分布式架构，支持超大规模图 | 大规模知识图谱 |
| **JanusGraph** | Java | 基于 Apache TinkerPop，后端可插拔 | 灵活部署 |
| **TigerGraph** | C++ | 原生并行图计算，GSQL 查询语言 | 实时图分析 |

### 知识图谱平台

- **Google Knowledge Graph**：Google 搜索引擎背后的知识图谱，包含数十亿实体
- **Wikidata**：维基百科的结构化数据，开放且可编辑
- **DBpedia**：从 Wikipedia 提取的结构化知识
- **CN-DBpedia**：中文知识图谱，包含千万级实体

### 构建工具

- **DeepDive**（Stanford）：从非结构化文本中抽取知识
- **OpenIE**：开放信息抽取工具
- **spaCy**：NLP 工具包，支持 NER 和关系抽取
- **HanLP**：中文 NLP 工具包

## 工程实践

### 使用 Neo4j 构建知识图谱

```python
from neo4j import GraphDatabase

class KnowledgeGraph:
    def __init__(self, uri, user, password):
        self.driver = GraphDatabase.driver(uri, auth=(user, password))
    
    def add_entity(self, name, entity_type):
        """添加实体节点"""
        with self.driver.session() as session:
            session.run(
                "MERGE (e:%s {name: $name})" % entity_type,
                name=name
            )
    
    def add_relation(self, from_entity, relation, to_entity):
        """添加实体间关系"""
        with self.driver.session() as session:
            session.run(
                "MATCH (a {name: $from}), (b {name: $to}) "
                "MERGE (a)-[r:%s]->(b)" % relation,
                from=from_entity, to=to_entity
            )
    
    def query_relations(self, entity_name):
        """查询实体的所有关系"""
        with self.driver.session() as session:
            result = session.run(
                "MATCH (a {name: $name})-[r]->(b) "
                "RETURN type(r) as relation, b.name as target",
                name=entity_name
            )
            return [record.data() for record in result]
```

### 与 LLM 结合：GraphRAG

**GraphRAG** 将知识图谱与 [RAG](/glossary/rag) 结合，提升检索质量：

```
用户查询 → 实体识别 → 图查询 → 子图检索 → LLM 生成回答
```

优势：
- **多跳推理**：通过图遍历获取间接关联的知识
- **结构化上下文**：为 LLM 提供结构化的背景信息
- **减少幻觉**：基于事实图谱生成，降低 LLM 幻觉风险

### 性能优化

- **索引策略**：为高频查询的属性创建索引
- **缓存子图**：对热点查询结果进行缓存
- **分区存储**：按实体类型或业务域分区
- **批量导入**：使用 CSV 批量导入替代逐条插入

:::warning 常见陷阱
- 避免过度建模：不要把所有数据都塞进知识图谱
- 注意数据质量：垃圾进，垃圾出（GIGO）
- 定期更新：知识会过时，需要建立更新机制
:::

## 与其他概念的关系

- 与 [向量数据库](/glossary/vector-database) 互补，知识图谱提供精确关系，向量数据库提供语义相似度
- 可作为 [RAG](/glossary/rag) 的知识源，形成 GraphRAG 架构
- 为 [大语言模型](/glossary/llm) 提供外部知识，减少幻觉
- 支撑智能问答、推荐系统等应用场景
- 与 [Agent](/glossary/agent) 结合，提供结构化知识推理能力

## 延伸阅读

- [向量数据库](/glossary/vector-database) — 向量存储与检索
- [RAG](/glossary/rag) — 检索增强生成
- [大语言模型](/glossary/llm) — 大语言模型基础
- [Agent](/glossary/agent) — AI 智能体
- [Neo4j 官方文档](https://neo4j.com/docs/)
- [GraphRAG 论文](https://arxiv.org/abs/2404.16130)
