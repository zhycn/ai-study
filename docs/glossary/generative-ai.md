---
title: 生成式 AI
description: Generative AI，能够生成新内容的 AI 技术
---

# 生成式 AI

能"原创"的 AI——不仅能认东西，还能写文章、画画、谱曲、写代码。传统的 AI 是"鉴赏家"，只能判断"这张图是不是猫"；生成式 AI 是"创作者"，能凭空画出一只从未存在过的猫。ChatGPT、Midjourney 都是它的代表作。

## 概述

**生成式 AI**（Generative AI）是指能够创建全新内容（如文本、图像、音频、视频、代码等）的人工智能技术。与传统的**判别式 AI**（Discriminative AI）不同，生成式 AI 不仅能够识别和分类，还能够创造前所未有的内容。

生成式 AI 的核心是学习训练数据的分布，然后从该分布中采样生成新的样本。

:::tip 提示
判别式 AI 回答"这是什么？"（分类、检测），而生成式 AI 回答"能创造什么？"（生成、创作）。两者并非对立，而是互补的技术路线。
:::

## 演进历史

### 早期探索（1960s-1990s）

- **1966 年**：ELIZA 聊天机器人出现，基于规则匹配模拟对话，是最早的"生成式"程序
- **1980s**：基于规则的自然语言生成（NLG）系统出现，用于天气预报、体育报道等结构化场景
- **1990s**：统计方法开始应用于文本生成，n-gram 模型成为主流

### 神经网络生成模型（2010s）

- **2013 年**：变分自编码器（VAE）提出，开启深度生成模型时代
- **2014 年**：生成对抗网络（GAN）由 Goodfellow 提出，生成质量大幅提升
- **2015 年**：循环神经网络（RNN/LSTM）用于文本生成，能生成连贯的句子
- **2017 年**：Transformer 架构提出，为大规模文本生成奠定基础
- **2018 年**：GPT 发布，证明自回归语言模型能生成高质量文本

### 大模型爆发（2020s）

- **2020 年**：GPT-3（1750 亿参数）展现强大的**涌现能力**（Emergent Ability），无需微调即可完成多种任务
- **2021 年**：DALL-E 发布，实现文本到图像生成；Diffusion Model 开始崭露头角
- **2022 年**：Stable Diffusion 开源，图像生成进入大众时代；ChatGPT 发布，对话式 AI 引爆全球
- **2023 年**：GPT-4 实现多模态能力；Midjourney、Claude、Gemini 等竞相发展
- **2024 年**：Sora 等视频生成模型出现；开源模型（LLaMA、Mistral）快速追赶

### 当前趋势（2025 年-）

- **多模态融合**：文本、图像、音频、视频统一建模
- **Agent 化**：生成式 AI 从内容创作走向自主行动
- **端侧部署**：模型小型化，在手机、PC 等终端设备运行
- **可控生成**：通过 ControlNet、LoRA 等技术实现精细化控制

## 为什么重要

- **内容创作革命**：大幅降低创作门槛，使非专业人士也能产出高质量内容
- **生产力提升**：自动化内容生产，如代码生成、文档撰写、设计辅助
- **创意辅助**：激发人类创造力，提供灵感和参考
- **范式转变**：从"理解世界"到"创造世界"的 AI 能力跃迁
- **经济价值**：预计到 2030 年，生成式 AI 将为全球经济贡献数万亿美元

## 核心技术

### 自回归模型（Autoregressive Model）

通过预测下一个 Token 来生成序列，是当前文本生成的主流方法。

- **原理**：$P(x) = \prod_{t=1}^{T} P(x_t | x_{<t})$
- **代表模型**：GPT 系列、Claude、LLaMA
- **特点**：生成质量高，但自回归解码速度较慢
- **应用场景**：文本生成、代码生成、对话系统

### 扩散模型（Diffusion Model）

通过逐步去噪过程生成数据，是当前图像生成的主流方法。

- **前向过程**：逐步向数据添加噪声，直到变为纯噪声
- **反向过程**：学习从噪声中逐步恢复数据
- **代表模型**：DDPM、Stable Diffusion、DALL-E、Midjourney
- **特点**：生成质量高、多样性好，但推理速度较慢

### 变分自编码器（VAE）

通过编码器 - 解码器结构学习数据的潜在表示（Latent Representation）。

- **编码器**：将输入映射到潜在空间
- **解码器**：从潜在空间重建输入
- **特点**：潜在空间连续且平滑，适合插值和编辑

### 生成对抗网络（GAN）

通过生成器和判别器的对抗训练来生成数据。

- **生成器**（Generator）：生成逼真样本
- **判别器**（Discriminator）：区分真实样本和生成样本
- **代表模型**：StyleGAN、CycleGAN
- **特点**：生成质量高，但训练不稳定

### Transformer 架构

作为统一的生成架构，Transformer 已扩展到多模态生成。

- **Decoder-only**：GPT 系列，文本生成
- **Vision Transformer**：ViT，图像理解
- **多模态**：CLIP、Flamingo、GPT-4V

## 生成内容类型

### 文本生成

- **应用场景**：文章撰写、代码生成、对话系统、翻译、摘要
- **代表模型**：GPT-4、Claude、Gemini、LLaMA
- **关键技术**：提示词工程、思维链（Chain of Thought）、工具调用

### 图像生成

- **应用场景**：插画设计、产品图、艺术创作、图像编辑
- **代表模型**：Stable Diffusion、Midjourney、DALL-E、Flux
- **关键技术**：文本到图像（Text-to-Image）、图像到图像（Image-to-Image）、ControlNet

### 音频生成

- **应用场景**：音乐创作、语音合成、音效生成
- **代表模型**：Suno、Udio、ElevenLabs、MusicGen
- **关键技术**：文本到语音（TTS）、语音克隆、音乐生成

### 视频生成

- **应用场景**：短视频创作、动画制作、广告制作
- **代表模型**：Sora、Runway、Pika、Kling
- **关键技术**：文本到视频、图像到视频、视频编辑

### 代码生成

- **应用场景**：代码补全、代码解释、Bug 修复、测试生成
- **代表模型**：GitHub Copilot、Cursor、Claude、Code Llama
- **关键技术**：上下文感知、多文件理解、工具集成

## 主流框架与实现

### 大语言模型开发

```python
from openai import OpenAI

client = OpenAI()

response = client.chat.completions.create(
    model="gpt-4",
    messages=[
        {"role": "system", "content": "你是一个专业的助手"},
        {"role": "user", "content": "请解释什么是生成式 AI"}
    ],
    temperature=0.7,
    max_tokens=1000
)

print(response.choices[0].message.content)
```

### 图像生成

```python
from diffusers import StableDiffusionPipeline
import torch

pipe = StableDiffusionPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5",
    torch_dtype=torch.float16
)
pipe = pipe.to("cuda")

image = pipe(
    "a photo of an astronaut riding a horse on mars",
    guidance_scale=7.5,
    num_inference_steps=50
).images[0]

image.save("astronaut.png")
```

### 开源生态

- **Hugging Face**：模型库、数据集、训练框架
- **LangChain / LlamaIndex**：大模型应用框架
- **ComfyUI / WebUI**：Stable Diffusion 可视化界面
- **Ollama**：本地大模型运行工具
- **vLLM**：高性能推理服务

## 工程实践

### 提示词工程（Prompt Engineering）

- **系统提示**：设定角色和行为规范
- **少样本提示**（Few-shot Prompting）：提供示例引导输出
- **思维链**（Chain of Thought）：引导模型逐步推理
- **结构化输出**：使用 JSON Schema 等约束输出格式

### 生成质量控制

:::warning 注意

- **幻觉**（Hallucination）：模型可能生成看似合理但实际错误的信息
- **偏见**（Bias）：模型可能反映训练数据中的社会偏见
- **安全性**：需要防范提示注入（Prompt Injection）和越狱（Jailbreak）
- **版权**：生成内容的版权归属尚不明确，需谨慎使用
:::

### 部署与优化

- **推理加速**：量化（Quantization）、KV Cache、推测解码（Speculative Decoding）
- **成本控制**：模型路由、缓存、批处理
- **评估指标**：人工评估、自动评估（BLEU、ROUGE、BERTScore）
- **持续改进**：RLHF（基于人类反馈的强化学习）、DPO（直接偏好优化）

### RAG 增强生成

结合检索增强生成（RAG）可以显著提升生成内容的准确性和时效性：

1. 用户提问
2. 检索相关知识库
3. 将检索结果作为上下文
4. 模型基于增强上下文生成回答

详细参考：[RAG](/glossary/rag)

## 与其他概念的关系

- 生成式 AI 基于 [大语言模型](/glossary/llm) 和扩散模型等技术
- 使用 [提示词工程](/glossary/prompt-engineering) 优化生成效果
- 与 [多模态模型](/glossary/multimodal-model) 发展同步
- [RAG](/glossary/rag) 可以增强生成内容的准确性
- [Transformer](/glossary/transformer) 是生成式 AI 的核心架构
- 需要关注 [AI 安全](/glossary/ai-safety) 和 [幻觉](/glossary/hallucination) 问题

## 延伸阅读

- [大语言模型](/glossary/llm) — 了解生成式 AI 的核心技术
- [提示词工程](/glossary/prompt-engineering) — 了解如何优化生成效果
- [多模态模型](/glossary/multimodal-model) — 了解跨模态生成
- [RAG](/glossary/rag) — 了解检索增强生成
- [Transformer](/glossary/transformer) — 了解生成式 AI 的基础架构
- [AI 安全](/glossary/ai-safety) — 了解生成式 AI 的安全挑战
- [幻觉](/glossary/hallucination) — 了解生成式 AI 的常见问题
- [Generative AI with Large Language Models](https://www.deeplearning.ai/short-courses/generative-ai-with-llms/) — DeepLearning.AI 课程
- [Stable Diffusion 论文](https://arxiv.org/abs/2112.10752) — 扩散模型技术细节
