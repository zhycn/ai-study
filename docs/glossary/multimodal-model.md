---
title: 多模态模型
description: Multimodal Model，能处理文本、图像、音频等多种模态的模型
---

# 多模态模型

能同时"看、听、读、说"的 AI。以前的模型只会处理文字，多模态模型则能同时理解文字、图片、声音甚至视频，就像一个既能看书又能看图还能听音乐的全能学生。

## 概述

**多模态模型**（Multimodal Model）是指能够同时处理和理解多种**模态**（Modality）——如文本、图像、音频、视频、3D 结构等——的 AI 模型。与仅处理单一模态的模型不同，多模态模型能够跨模态理解、推理和生成，更接近人类感知世界的方式。

多模态 AI 的核心挑战在于**异构数据的对齐与融合**：不同模态的数据具有不同的表示形式、语义粒度和信息密度。例如，一张图像包含数百万像素的视觉信息，而描述它的文本可能只有短短几个词。如何建立跨模态的语义桥梁，是多模态研究的核心问题。

:::info 什么是模态？
模态（Modality）指信息的存在形式或感知通道。常见模态包括：文本（语言模态）、图像（视觉模态）、音频（听觉模态）、视频（视听模态）、深度图/点云（3D 模态）等。
:::

## 为什么重要

多模态模型代表了 AI 发展的重要方向，原因如下：

- **更接近人类认知**：人类通过视觉、听觉、语言等多种感官理解世界，多模态模型模拟了这一过程
- **信息互补增强**：不同模态携带互补信息，融合后能提升理解准确性。例如，视频中的语音和画面互相补充
- **更自然的人机交互**：支持语音对话、图像理解、手势识别等多模态交互方式
- **应用场景广泛**：自动驾驶（视觉 + 激光雷达）、医疗影像（影像 + 病历）、智能客服（语音 + 文本）、内容创作（文生图、文生视频）
- **技术融合趋势**：单一模态模型的性能瓶颈促使研究者探索多模态融合

## 核心原理

### 模态异构性挑战

不同模态的数据具有本质差异：

- **表示形式**：文本是离散符号序列，图像是连续像素矩阵，音频是时间序列波形
- **语义粒度**：一个词可能对应图像中的局部区域或全局场景
- **信息密度**：图像包含百万级像素，但语义信息可能仅需几个词描述
- **时间维度**：音频和视频具有时间动态性，文本和图像是静态的

### 跨模态对齐（Cross-Modal Alignment）

多模态模型的核心是将不同模态映射到统一的语义空间，使相关概念在向量空间中靠近。对齐方式主要有两种：

1. **隐式对齐**：通过对比学习（Contrastive Learning）使匹配的模态对在嵌入空间中靠近，如 CLIP
2. **显式对齐**：通过投影层（Projection Layer）将视觉特征映射到语言空间，如 LLaVA

### 多模态融合范式

$$P(\text{输出} | \text{文本}, \text{图像}) = f_{\text{LLM}}(\text{Embed}_{\text{text}} \oplus \text{Project}(\text{Encode}_{\text{vision}}(\text{图像})))$$

其中 $\oplus$ 表示序列拼接，$\text{Project}$ 将视觉特征投影到语言嵌入空间。

## 核心技术架构

### 模态编码器

每种模态需要专门的编码器提取特征：

| 模态 | 编码器                    | 代表模型           |
| ---- | ------------------------- | ------------------ |
| 文本 | Transformer Decoder       | LLM（Llama、Qwen） |
| 图像 | Vision Transformer（ViT） | CLIP ViT、SigLIP   |
| 音频 | Conformer / Whisper       | Whisper、Wav2Vec   |
| 视频 | Video Transformer         | VideoMAE、CLIP-ViT |

### 跨模态对齐技术

多模态模型的核心在于如何将不同模态的特征对齐到统一的语义空间：

#### 1. 对比学习对齐（Contrastive Alignment）

通过对比损失函数，使匹配的图文对在嵌入空间中靠近，不匹配的远离：

$$\mathcal{L} = -\log\frac{\exp(\text{sim}(I, T) / \tau)}{\sum_{T'}\exp(\text{sim}(I, T') / \tau)}$$

其中 $\tau$ 为温度参数，控制分布的尖锐程度。

- **CLIP**（OpenAI）：4 亿图文对训练，开创了对齐范式
- **SigLIP**（Google）：使用 Sigmoid 损失替代 softmax，训练更稳定

#### 2. 投影层对齐（Projection Alignment）

将视觉特征投影到语言模型的嵌入空间：

- **线性投影**（Linear Projection）：简单的全连接层
- **MLP 投影**：多层感知机，更强的非线性映射
- **Q-Former**（BLIP-2）：通过查询 Transformer 提取视觉特征

#### 3. 原生多模态训练（Native Multimodal Training）

从预训练阶段就使用多模态数据，而非后期拼接：

- **Gemini**（Google）：原生多模态架构，所有模态共享同一套 Transformer
- **FLAME**：统一多模态 Token 化

### 多模态融合策略

```text
早期融合（Early Fusion）→ 模态在输入层拼接
中期融合（Intermediate Fusion）→ 各模态独立编码后融合
晚期融合（Late Fusion）→ 各模态独立处理后决策层融合
```

| 策略     | 优点           | 缺点     | 适用场景   |
| -------- | -------------- | -------- | ---------- |
| 早期融合 | 跨模态交互充分 | 计算量大 | 图文理解   |
| 中期融合 | 平衡交互与效率 | 设计复杂 | 视频理解   |
| 晚期融合 | 各模态独立优化 | 交互有限 | 多模态分类 |

## 主流模型与实现

### 主流多模态架构对比

| 架构       | 对齐方式         | 代表模型             | 优点                     | 缺点               |
| ---------- | ---------------- | -------------------- | ------------------------ | ------------------ |
| 对比学习   | 隐式（嵌入空间） | CLIP、SigLIP         | 训练简单，零样本能力强   | 细粒度理解弱       |
| 投影层     | 显式（特征映射） | LLaVA、Qwen-VL       | 细粒度理解强，可指令微调 | 需要高质量指令数据 |
| 原生多模态 | 统一 Token 化    | Gemini、FLAME        | 模态交互充分，性能上限高 | 训练成本极高       |
| Q-Former   | 查询桥接         | BLIP-2、InstructBLIP | 视觉 Token 少，推理高效  | 信息有损           |

### 图文理解模型

- **GPT-4V/4o**（OpenAI）：强大的图像理解能力，支持 OCR、图表分析、视觉推理
- **Claude 3.5/4**（Anthropic）：优秀的图表和文档理解能力
- **Gemini 2.0**（Google）：原生多模态，支持图像、视频、音频

### 开源多模态模型

- **LLaVA**（Large Language-and-Vision Assistant）：开源多模态标杆，基于 Llama + CLIP
- **Qwen-VL**（阿里）：中文多模态能力突出，支持高分辨率图像
- **InternVL**（上海 AI Lab）：视觉编码能力强，支持多图像理解
- **MiniCPM-V**：轻量级多模态模型，适合端侧部署

### 文生图模型

- **[DALL-E 3](https://openai.com/index/dall-e-3/)**（OpenAI）：与 GPT-4 集成，文本理解能力强
- **[Midjourney](https://www.midjourney.com/)**：艺术风格突出，社区活跃
- **[Stable Diffusion](https://stability.ai/stable-diffusion) 3/XL**（[Stability AI](https://stability.ai/)）：开源可控生成
- **[FLUX](https://blackforestlabs.ai/)**（[Black Forest Labs](https://blackforestlabs.ai/)）：高质量开源文生图

### 文生视频模型

- **[Sora](https://openai.com/sora/)**（OpenAI）：高质量视频生成，支持 60 秒视频
- **Kling**（快手）：国产视频生成模型
- **[Runway](https://runwayml.com/) Gen-3**：专业视频创作工具

## 工程实践

### 多模态 RAG

将检索增强生成（RAG）扩展到多模态场景：

```text
用户查询 → 多模态检索（文本 + 图像）→ 多模态上下文注入 → LLM 生成回答
```

关键挑战：

- **多模态索引**：如何对图像/视频建立可检索的索引
- **跨模态检索**：用文本检索图像，或用图像检索文本
- **上下文窗口管理**：多模态数据占用大量 Token

### 多模态微调

- **LoRA/QLoRA**：低秩适配，仅训练投影层和少量参数
- **指令微调**（Instruction Tuning）：使用多模态指令数据微调
- **全量微调**：对视觉编码器和 LLM 同时微调，成本高但效果好

### 部署优化

| 挑战         | 方案                         |
| ------------ | ---------------------------- |
| 显存占用大   | 量化（INT8/INT4）、模型并行  |
| 推理延迟高   | KV Cache、投机采样、模型蒸馏 |
| 多模态预处理 | 异步图像编码、缓存视觉特征   |
| 端侧部署     | 模型压缩、NPU 加速、小模型   |

:::warning 多模态安全
多模态模型面临独特的安全挑战：视觉越狱（Visual Jailbreak）通过在图像中嵌入恶意指令绕过安全限制。部署时需加强多模态安全审查。
:::

## 与其他概念的关系

- 基于 [Transformer](/glossary/transformer) 架构，通常结合 ViT 和 LLM
- 是 [生成式 AI](/glossary/generative-ai) 的重要分支，支持图文、音视频生成
- 使用 [Embedding](/glossary/embedding) 实现跨模态语义对齐
- 依赖 [大语言模型](/glossary/llm) 作为语言理解和生成的核心
- 可通过 [微调](/glossary/fine-tuning) 适配特定多模态任务
- 与 [开源模型](/glossary/open-source-model) 结合（如 LLaVA、Qwen-VL）降低使用门槛

## 延伸阅读

- [生成式 AI](/glossary/generative-ai)
- [Transformer 架构](/glossary/transformer)
- [Embedding 技术](/glossary/embedding)
- [Learning Transferable Visual Models from Natural Language Supervision](https://arxiv.org/abs/2103.00020) — CLIP 论文
- [Visual Instruction Tuning](https://arxiv.org/abs/2304.08485) — LLaVA 论文
- [Awesome Multimodal Machine Learning](https://github.com/pliang279/awesome_multimodal) — 多模态资源汇总
