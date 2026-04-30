---
title: 图像生成
description: Image Generation，AI 生成图像的技术
---

# 图像生成

## 概述

图像生成（Image Generation）是指使用 AI 技术根据文本描述、参考图像或其他条件生成全新图像的技术。它是生成式 AI（Generative AI）最直观、最受关注的应用领域之一。

从 DALL-E 的横空出世到 Stable Diffusion 的开源普及，再到 Midjourney 的艺术级输出，图像生成技术在短短几年内实现了从"能看"到"好用"的跨越。当前最先进的图像生成模型已经能够生成照片级真实感（Photorealistic）的图像，精确理解复杂的空间关系和物理规律。

图像生成的核心挑战在于：将高维的语义信息（文本描述）映射到同样高维的像素空间，同时保证生成结果的视觉质量和语义一致性。

## 为什么重要

- **创意民主化**：让不具备美术技能的人也能将创意可视化
- **效率革命**：将设计周期从数天缩短到数分钟
- **个性化内容**：按需生成定制化视觉内容
- **商业价值**：广告、电商、游戏、影视等行业的应用潜力巨大
- **多模态理解**：推动 AI 对视觉世界的理解能力

::: tip 提示
图像生成技术正在快速演进。2024 年以来，视频生成（Video Generation）和 3D 生成成为新的热点，图像生成正从静态向动态、从 2D 向 3D 扩展。
:::

## 核心技术原理

### 扩散模型（Diffusion Model）

扩散模型是当前图像生成的主流技术，其核心思想是**逐步添加噪声再逐步去噪**：

```text
训练阶段：
原始图像 → 逐步加噪 → 纯噪声
           (T 步)

生成阶段：
纯噪声 → 逐步去噪 → 生成图像
         (T 步，每步由神经网络预测噪声)
```

**前向过程（Forward Process）**：逐步向图像添加高斯噪声，直到变成纯噪声。

**反向过程（Reverse Process）**：训练一个神经网络（通常是 U-Net）学习每一步的去噪操作。

```python
# 使用 Diffusers 库生成图像的简化示例
from diffusers import StableDiffusionPipeline
import torch

# 加载预训练模型
pipe = StableDiffusionPipeline.from_pretrained(
    "stabilityai/stable-diffusion-xl-base-1.0",
    torch_dtype=torch.float16
)
pipe = pipe.to("cuda")

# 文本到图像生成
prompt = "一只戴着墨镜的猫在海滩上晒太阳，水彩画风格"
image = pipe(prompt, guidance_scale=7.5).images[0]
image.save("cat_on_beach.png")
```

扩散模型的关键参数：

| 参数 | 说明 | 典型值 |
|------|------|--------|
| Guidance Scale | 文本提示的遵循程度 | 5-10 |
| Steps | 去噪步数 | 20-50 |
| Scheduler | 噪声调度算法 | DPM++、Euler |
| CFG | 分类器自由引导 | 开启/关闭 |

### GAN（生成对抗网络）

GAN 由 Goodfellow 等于 2014 年提出，包含两个相互对抗的网络：

```text
生成器（Generator）：生成假图像，试图骗过判别器
判别器（Discriminator）：区分真图像和假图像

训练过程：
生成器 ← 判别器的反馈 → 判别器
（博弈优化，纳什均衡）
```

虽然 GAN 在扩散模型兴起前是图像生成的主流技术，但由于训练不稳定、模式崩溃（Mode Collapse）等问题，目前已逐渐被扩散模型取代。但在实时生成、风格迁移等场景仍有应用。

### 自回归模型（Autoregressive Model）

将图像视为像素或 token 序列，逐个生成：

- **DALL-E**：将图像离散化为 token 序列，用 Transformer 自回归生成
- **Parti**：Google 的自回归图像生成模型
- **Emu**：Meta 的统一多模态自回归模型

自回归模型的优势在于与文本模型的架构统一，便于构建统一的多模态系统。

### 流匹配（Flow Matching）

流匹配是扩散模型的改进方案，通过直接学习数据分布之间的最优传输路径，减少生成步数：

- **SD3（Stable Diffusion 3）**：采用 Rectified Flow 技术
- **FLUX**：Black-Forest Labs 的开源模型，基于流匹配

## 主流模型与产品

### 闭源模型

| 模型 | 厂商 | 特点 |
|------|------|------|
| DALL-E 3 | OpenAI | 文本理解能力强，与 GPT 生态集成 |
| Midjourney v6 | Midjourney | 艺术风格出色，社区活跃 |
| Imagen 3 | Google | 照片级真实感，细节丰富 |
| Ideogram 2.0 | Ideogram | 文字渲染能力强 |

### 开源模型

| 模型 | 厂商 | 参数量 | 特点 |
|------|------|--------|------|
| Stable Diffusion XL | Stability AI | 2.6B | 生态最完善的开源模型 |
| FLUX.1 | Black-Forest Labs | 12B | 当前开源最强，指令遵循好 |
| SD3 Medium | Stability AI | 2B | 流匹配架构 |
| PixArt-Σ | 上海人工智能实验室 | 0.6B | 轻量高效 |

### 国内模型

| 模型 | 厂商 | 特点 |
|------|------|------|
| 通义万相 | 阿里巴巴 | 中文理解好，电商场景优化 |
| 文心一格 | 百度 | 中国风艺术风格 |
| 混元生图 | 腾讯 | 多风格支持 |
| 即梦（Dreamina） | 字节跳动 | 视频生成能力突出 |

## 工程实践

### 提示词工程

图像生成的质量高度依赖提示词（Prompt）的设计：

```markdown
# 图像提示词的基本结构
[主体描述] + [环境/背景] + [风格/媒介] + [光照] + [构图] + [质量词]

# 示例
"一只橘色的波斯猫，坐在窗台上，窗外是雨中的东京街景，
新海诚动画风格，柔和的自然光，三分法构图，8K 分辨率，细节丰富"
```

**常用质量词**：

```text
masterpiece, best quality, ultra-detailed, photorealistic,
8K resolution, cinematic lighting, depth of field
```

**负面提示词（Negative Prompt）**：

```text
low quality, blurry, deformed, ugly, bad anatomy,
extra limbs, poorly drawn face, watermark, text
```

### 高级技术

**1. ControlNet**

通过额外条件控制生成过程：

- **Canny 边缘**：根据边缘图控制生成
- **Depth 深度**：根据深度图控制空间结构
- **OpenPose 姿态**：根据人体姿态控制人物动作
- **Segmentation 分割**：根据语义分割图控制区域内容

```python
# 使用 ControlNet 控制人物姿态
from diffusers import StableDiffusionControlNetPipeline, ControlNetModel
import cv2

# 加载姿态 ControlNet
controlnet = ControlNetModel.from_pretrained("lllyasviel/control_v11p_sd15_openpose")
pipe = StableDiffusionControlNetPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5", controlnet=controlnet
)

# 从参考图像提取姿态
pose_image = cv2.imread("reference_pose.png")
# 使用 OpenPose 提取骨骼点...

# 生成保持相同姿态的新图像
result = pipe(
    prompt="一个穿着西装的商务人士",
    image=pose_image,
    guidance_scale=7.5
).images[0]
```

**2. LoRA（Low-Rank Adaptation）**

轻量级微调方案，用于定制特定风格或角色：

- 仅训练少量参数（通常 10-100MB）
- 可在推理时动态加载和组合多个 LoRA
- 适合个人风格定制、品牌 IP 形象等场景

**3. IP-Adapter**

图像提示适配器，用参考图像而非文本来控制生成风格：

```text
参考图像 → IP-Adapter → 风格特征 → 生成器 → 保持参考风格的输出
```

### 评估指标

| 指标 | 说明 | 工具 |
|------|------|------|
| FID | 生成图像与真实图像的分布距离 | 越低越好 |
| CLIP Score | 图像与文本提示的语义一致性 | 越高越好 |
| HPS v2 | 人类偏好评分 | 越高越好 |
| ImageReward | 基于人类反馈的奖励模型 | 越高越好 |

### 性能优化

```text
推理加速：
- 半精度推理（FP16/BF16）
- TensorRT 编译优化
- 蒸馏模型（如 LCM、SDXL Turbo，1-4 步出图）
- 多 GPU 并行

显存优化：
- 梯度检查点（训练时）
- 模型卸载（CPU offload）
- 分块注意力（xformers）
```

::: warning 注意
图像生成涉及 [版权](/glossary/copyright) 和 [偏见](/glossary/bias) 问题。训练数据可能包含受版权保护的作品，生成结果可能强化社会偏见。企业应用时务必进行合规审查。
:::

## 与其他概念的关系

- 图像生成是 [生成式 AI](/glossary/generative-ai) 的核心应用之一
- 依赖 [多模态模型](/glossary/multimodal-model) 实现图文理解
- 与 [提示词工程](/glossary/prompt-engineering) 紧密相关
- 需要关注 [版权](/glossary/copyright) 合规性和 [偏见](/glossary/bias) 问题
- 图像理解（Image Understanding）是其逆向任务，涉及 [计算机视觉](/glossary/computer-vision)

## 延伸阅读

- [Diffusers 官方文档](https://huggingface.co/docs/diffusers)
- [Stable Diffusion 论文](https://arxiv.org/abs/2112.10752)
- [ControlNet 论文](https://arxiv.org/abs/2302.05543)
- [DALL-E 论文](https://arxiv.org/abs/2102.12092)
- [生成式 AI](/glossary/generative-ai)
- [多模态模型](/glossary/multimodal-model)
- [提示词工程](/glossary/prompt-engineering)
- [计算机视觉](/glossary/computer-vision)
