---
title: 自然语言处理
description: Natural Language Processing (NLP)，让计算机理解和生成人类语言
---

# 自然语言处理

## 概述

**自然语言处理**（Natural Language Processing，NLP）是人工智能和语言学的交叉学科，致力于让计算机能够理解、解释和生成人类语言。作为 AI 最古老也最具挑战的领域之一，NLP 的目标是弥合人类自然语言与计算机形式语言之间的鸿沟。

NLP 涵盖两个主要方向：

- **自然语言理解**（Natural Language Understanding，NLU）：让计算机"读懂"文本，提取语义信息
- **自然语言生成**（Natural Language Generation，NLG）：让计算机"写出"文本，生成连贯内容

:::tip 提示
NLP 的核心挑战在于人类语言的**歧义性**（Ambiguity）和**上下文依赖性**（Context Dependency）。同一句话在不同语境下可能有完全不同的含义，这是计算机理解自然语言的最大障碍。
:::

## 为什么重要

- **人机交互变革**：从命令行到图形界面，再到自然语言对话，NLP 让人机交互更加直观
- **信息爆炸应对**：每天产生海量文本数据，NLP 是实现信息筛选、摘要、检索的关键技术
- **全球化桥梁**：机器翻译打破语言壁垒，促进跨文化交流
- **产业赋能**：智能客服、内容审核、舆情分析、法律文书审查等场景深度依赖 NLP
- **大模型基石**：[大语言模型](/glossary/llm) 的核心能力建立在 NLP 数十年研究基础之上

## NLP 发展历程

### 规则时代（1950s-1980s）

早期 NLP 依赖人工编写的语法规则和词典：

- **1950 年**：图灵测试（Turing Test）提出，成为 AI 能力的经典评判标准
- **1960s**：ELIZA 聊天机器人，基于模式匹配和规则回复
- **1970s**：基于形式语法（Formal Grammar）的句法分析器
- **局限**：规则难以覆盖语言的复杂性和多样性，维护成本极高

### 统计时代（1990s-2010s）

引入统计学方法，从数据中自动学习语言模式：

- **N-gram 模型**：基于词序列的统计语言模型
- **隐马尔可夫模型**（Hidden Markov Model，HMM）：序列标注任务
- **条件随机场**（Conditional Random Field，CRF）：更强大的序列标注模型
- **支持向量机**（SVM）：文本分类任务
- **突破**：IBM 的统计机器翻译（Statistical Machine Translation，SMT）系统

### 深度学习时代（2013-2017）

神经网络方法大幅超越传统统计方法：

- **2013 年**：Word2Vec 提出，开启**词嵌入**（Word Embedding）时代
- **2014 年**：Seq2Seq（Sequence-to-Sequence）模型，端到端序列建模
- **2014 年**：注意力机制（Attention Mechanism）引入机器翻译
- **2015 年**：CNN/RNN 用于文本分类、命名实体识别等任务
- **2017 年**：[Transformer](/glossary/transformer) 架构提出，彻底改变 NLP 范式

### 大模型时代（2018 年-至今）

预训练语言模型（Pre-trained Language Model）成为主流：

- **2018 年**：BERT（双向编码器），刷新多项 NLP 任务记录
- **2018 年**：GPT（生成式预训练），开启自回归语言模型路线
- **2019 年**：GPT-2（15 亿参数），展现强大的零样本（Zero-shot）能力
- **2020 年**：GPT-3（1750 亿参数），**涌现能力**（Emergent Ability）引发关注
- **2022 年至今**：指令微调（Instruction Tuning）、[RLHF](/glossary/alignment)、多模态融合

## 核心技术任务

### 基础层任务

| 任务 | 英文 | 描述 |
|------|------|------|
| **分词** | Tokenization | 将文本切分为基本单元（词、子词、字符） |
| **词性标注** | Part-of-Speech Tagging | 为每个词标注语法类别（名词、动词等） |
| **命名实体识别** | Named Entity Recognition (NER) | 识别文本中的人名、地名、机构名等实体 |
| **句法分析** | Syntactic Parsing | 分析句子的语法结构（依存树、成分树） |
| **词义消歧** | Word Sense Disambiguation | 确定多义词在上下文中的具体含义 |

### 理解层任务

| 任务 | 英文 | 描述 |
|------|------|------|
| **文本分类** | Text Classification | 将文本归入预定义类别（情感分析、主题分类） |
| **信息抽取** | Information Extraction | 从非结构化文本中提取结构化信息 |
| **关系抽取** | Relation Extraction | 识别实体之间的语义关系 |
| **文本蕴含** | Natural Language Inference (NLI) | 判断两个文本之间的逻辑关系（蕴含、矛盾、中立） |
| **问答系统** | Question Answering (QA) | 根据问题从文本或知识库中检索/生成答案 |

### 生成层任务

| 任务 | 英文 | 描述 |
|------|------|------|
| **机器翻译** | Machine Translation (MT) | 将文本从一种语言转换为另一种语言 |
| **文本摘要** | Text Summarization | 将长文本压缩为简洁的摘要 |
| **对话生成** | Dialogue Generation | 生成自然的多轮对话回复 |
| **代码生成** | Code Generation | 根据自然语言描述生成程序代码 |
| **文本改写** | Text Paraphrasing | 保持语义不变的情况下改写表达 |

## 关键技术与算法

### 文本表示（Text Representation）

文本表示是 NLP 的基础，经历了以下演进：

```
One-Hot 编码 → TF-IDF → Word2Vec/GloVe → ELMo → BERT → 大语言模型
```

- **One-Hot 编码**：每个词用独立维度表示，无法捕捉语义相似性
- **TF-IDF**：词频-逆文档频率，衡量词的重要性
- **Word2Vec**：通过 CBOW 或 Skip-gram 学习稠密向量表示，支持语义运算（如 king - man + woman ≈ queen）
- **ELMo**：上下文相关的词表示，同一词在不同语境下有不同向量
- **BERT 及后续**：深度上下文表示，每个 token 的表示依赖于完整上下文

### Transformer 在 NLP 中的应用

[Transformer](/glossary/transformer) 已成为 NLP 的统一架构：

```python
from transformers import AutoTokenizer, AutoModelForSequenceClassification

# 使用预训练模型进行文本分类
tokenizer = AutoTokenizer.from_pretrained("bert-base-chinese")
model = AutoModelForSequenceClassification.from_pretrained("bert-base-chinese", num_labels=2)

text = "这部电影非常精彩，推荐观看！"
inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=128)
outputs = model(**inputs)
prediction = outputs.logits.argmax(dim=-1)  # 0: 负面, 1: 正面
```

### 提示工程（Prompt Engineering）

在大模型时代，**提示工程**成为 NLP 的新范式：

- **零样本提示**（Zero-shot Prompting）：直接给出任务描述，无需示例
- **少样本提示**（Few-shot Prompting）：提供少量示例引导模型
- **思维链**（Chain-of-Thought，CoT）：引导模型逐步推理
- **指令微调**（Instruction Tuning）：用指令-输出对微调模型

:::warning 注意
提示工程的效果高度依赖于模型能力和提示词设计。对于关键业务场景，建议结合传统 NLP 方法（如规则校验、后处理）以确保输出稳定性。
:::

## 主流框架与实现

### Hugging Face Transformers

当前最流行的 NLP 库，提供数千个预训练模型：

```python
from transformers import pipeline

# 零样本分类
classifier = pipeline("zero-shot-classification")
result = classifier(
    "这是一篇关于人工智能的技术文章",
    candidate_labels=["科技", "体育", "财经", "娱乐"]
)
# 输出: {'labels': ['科技', ...], 'scores': [0.95, ...]}

# 文本生成
generator = pipeline("text-generation", model="gpt2")
generator("人工智能正在改变", max_length=50)
```

### 其他重要框架

- **spaCy**：工业级 NLP 库，擅长分词、NER、依存句法分析
- **NLTK**：经典 NLP 教学和研究库
- **Jieba**：中文分词工具
- **HanLP**：多语言 NLP 工具包，中文支持优秀
- **OpenNMT**：开源神经机器翻译框架

## 工程实践

### 中文 NLP 特殊挑战

中文与英文等拉丁语系语言有显著差异：

1. **分词歧义**：「结婚的和尚未结婚的」可以有不同的分词方式
2. **无显式边界**：中文词之间没有空格分隔
3. **一词多义**：汉字组合灵活，语义丰富
4. **繁简转换**：需要处理繁体和简体两种书写系统
5. **领域差异**：医疗、法律、金融等领域术语差异大

### 数据准备

```python
# 数据增强示例：回译（Back Translation）
from transformers import pipeline

translator_zh_en = pipeline("translation_zh_to_en")
translator_en_zh = pipeline("translation_en_to_zh")

def back_translate(text):
    en = translator_zh_en(text, max_length=512)[0]["translation_text"]
    zh = translator_en_zh(en, max_length=512)[0]["translation_text"]
    return zh

# 原始: "这家餐厅的服务很好"
# 回译: "这家餐厅的服务态度很好"
```

### 模型选择指南

| 场景 | 推荐方案 | 理由 |
|------|---------|------|
| 资源受限 | 小模型（BERT-base、TinyBERT） | 推理速度快，部署成本低 |
| 通用 NLP 任务 | 中等模型（RoBERTa-large、DeBERTa） | 性能与成本平衡 |
| 复杂理解任务 | 大语言模型 + 提示 | 零样本/少样本能力强 |
| 高准确率要求 | 大模型 + 规则后处理 | 结合两者优势 |
| 多语言场景 | XLM-R、mBART | 原生多语言支持 |

### 评估指标

- **分类任务**：准确率（Accuracy）、精确率（Precision）、召回率（Recall）、F1 分数
- **生成任务**：BLEU、ROUGE、METEOR、BERTScore
- **问答任务**：Exact Match（EM）、F1
- **人类评估**：流畅度（Fluency）、相关性（Relevance）、有用性（Usefulness）

:::info 提示
自动评估指标（如 BLEU、ROUGE）与人类判断并不完全一致。对于面向用户的产品，建议定期进行人工评估。
:::

## 与其他概念的关系

- NLP 是 [大语言模型](/glossary/llm) 的上游学科，LLM 是 NLP 的最新成果
- NLP 使用 [Embedding](/glossary/embedding) 技术将文本转换为向量表示
- [Transformer](/glossary/transformer) 架构的提出是 NLP 领域的里程碑
- [注意力机制](/glossary/attention) 是 Transformer 的核心，也是现代 NLP 的基础
- NLP 与 [计算机视觉](/glossary/computer-vision) 结合形成多模态理解能力
- [提示工程](/glossary/prompt-engineering) 是大模型时代 NLP 的新方法论
- [知识图谱](/glossary/knowledge-graph) 为 NLP 提供结构化知识支持

## 延伸阅读

- [大语言模型](/glossary/llm) — 了解 NLP 的最新成果
- [Transformer](/glossary/transformer) — 了解现代 NLP 的核心架构
- [注意力机制](/glossary/attention) — 了解 Transformer 的关键组件
- [Embedding](/glossary/embedding) — 了解文本向量表示
- [提示工程](/glossary/prompt-engineering) — 了解大模型时代的 NLP 方法
- [Speech Recognition](/glossary/speech-recognition) — 了解语音到文本的转换
- [Speech to Text](https://openai.com/research/whisper) — OpenAI Whisper 语音识别模型
- [NLP 课程](https://web.stanford.edu/~jurafsky/slp3/) — Dan Jurafsky 经典教材
- [Hugging Face Course](https://huggingface.co/course) — Transformers 库官方教程
