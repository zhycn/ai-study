---
title: 图像生成
description: Image Generation，AI 生成图像的技术
---

# 图像生成

你说一句话，AI 就给你画一张图。"一只戴墨镜的猫在海滩上喝椰汁"——这种以前需要专业画师才能画出来的画面，现在 AI 几秒钟就能生成，而且质量越来越高。

## 概述

图像生成（Image Generation）是指使用 AI 技术根据文本描述、参考图像或其他条件生成全新图像的技术。它是生成式 AI（Generative AI）最直观、最受关注的应用领域之一。

从 [DALL-E](https://openai.com/index/dall-e-3/) 的横空出世到 [Stable Diffusion](https://stability.ai/stable-diffusion) 的开源普及，再到 [Midjourney](https://www.midjourney.com/) 的艺术级输出，图像生成技术在短短几年内实现了从"能看"到"好用"的跨越。当前最先进的图像生成模型已经能够生成照片级真实感（Photorealistic）的图像，精确理解复杂的空间关系和物理规律。

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

| 参数           | 说明               | 典型值       |
| -------------- | ------------------ | ------------ |
| Guidance Scale | 文本提示的遵循程度 | 5-10         |
| Steps          | 去噪步数           | 20-50        |
| Scheduler      | 噪声调度算法       | DPM++、Euler |
| CFG            | 分类器自由引导     | 开启/关闭    |

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

- **[DALL-E](https://openai.com/index/dall-e-3/)**：将图像离散化为 token 序列，用 Transformer 自回归生成
- **Parti**：Google 的自回归图像生成模型
- **Emu**：Meta 的统一多模态自回归模型

自回归模型的优势在于与文本模型的架构统一，便于构建统一的多模态系统。

### 流匹配（Flow Matching）

流匹配是扩散模型的改进方案，通过直接学习数据分布之间的最优传输路径，减少生成步数：

- **SD3（Stable Diffusion 3）**：采用 Rectified Flow 技术
- **[FLUX](https://blackforestlabs.ai/)**：[Black-Forest Labs](https://blackforestlabs.ai/) 的开源模型，基于流匹配

## 主流模型与产品

### 闭源模型

| 模型                                           | 厂商                                      | 特点                            |
| ---------------------------------------------- | ----------------------------------------- | ------------------------------- |
| [DALL-E 3](https://openai.com/index/dall-e-3/) | OpenAI                                    | 文本理解能力强，与 GPT 生态集成 |
| [Midjourney v6](https://www.midjourney.com/)   | [Midjourney](https://www.midjourney.com/) | 艺术风格出色，社区活跃          |
| Imagen 3                                       | Google                                    | 照片级真实感，细节丰富          |
| Ideogram 2.0                                   | Ideogram                                  | 文字渲染能力强                  |

### 开源模型

| 模型                                                         | 厂商                                             | 参数量 | 特点                     |
| ------------------------------------------------------------ | ------------------------------------------------ | ------ | ------------------------ |
| [Stable Diffusion XL](https://stability.ai/stable-diffusion) | [Stability AI](https://stability.ai/)            | 2.6B   | 生态最完善的开源模型     |
| [FLUX.1](https://blackforestlabs.ai/)                        | [Black-Forest Labs](https://blackforestlabs.ai/) | 12B    | 当前开源最强，指令遵循好 |
| SD3 Medium                                                   | Stability AI                                     | 2B     | 流匹配架构               |
| PixArt-Σ                                                     | 上海人工智能实验室                               | 0.6B   | 轻量高效                 |

### 国内模型

| 模型             | 厂商     | 特点                     |
| ---------------- | -------- | ------------------------ |
| 通义万相         | 阿里巴巴 | 中文理解好，电商场景优化 |
| 文心一格         | 百度     | 中国风艺术风格           |
| 混元生图         | 腾讯     | 多风格支持               |
| 即梦（Dreamina） | 字节跳动 | 视频生成能力突出         |

## 实施步骤

### 从零搭建图像生成服务

**阶段 1：需求分析与模型选型**

| 需求场景       | 推荐模型            | 理由                      |
| -------------- | ------------------- | ------------------------- |
| 高质量艺术创作 | Midjourney / FLUX.1 | 艺术风格出色，细节丰富    |
| 电商产品图     | Stable Diffusion XL | 可控性强，支持 ControlNet |
| 实时生成       | SDXL Turbo / LCM    | 1-4 步出图，延迟低        |
| 定制化风格     | SD + LoRA 微调      | 轻量定制，成本低          |
| 中文场景优化   | 通义万相 / 文心一格 | 中文理解好，本土化        |

**阶段 2：环境搭建**

```bash
# 安装依赖
pip install diffusers transformers accelerate safetensors

# 下载模型（以 SDXL 为例）
huggingface-cli download stabilityai/stable-diffusion-xl-base-1.0

# 可选：安装 xformers 加速推理
pip install xformers
```

**阶段 3：基础生成管线**

```python
import torch
from diffusers import DiffusionPipeline, EulerDiscreteScheduler

# 加载 SDXL 模型
model_id = "stabilityai/stable-diffusion-xl-base-1.0"
pipe = DiffusionPipeline.from_pretrained(
    model_id,
    torch_dtype=torch.float16,
    use_safetensors=True,
    variant="fp16"
)
pipe.scheduler = EulerDiscreteScheduler.from_config(pipe.scheduler.config)
pipe.to("cuda")

# 基础生成
prompt = "一只橘猫坐在窗台上，窗外是雨中的东京街景，新海诚风格，柔和光线"
negative_prompt = "low quality, blurry, deformed, ugly, bad anatomy"

image = pipe(
    prompt=prompt,
    negative_prompt=negative_prompt,
    guidance_scale=7.5,
    num_inference_steps=30,
    width=1024,
    height=1024
).images[0]
image.save("output.png")
```

**阶段 4：高级控制（ControlNet + LoRA）**

```python
from diffusers import StableDiffusionXLControlNetPipeline, ControlNetModel
from diffusers import AutoencoderKL
import cv2
import numpy as np

# 加载 Depth ControlNet
controlnet = ControlNetModel.from_pretrained(
    "diffusers/controlnet-depth-sdxl-1.0",
    torch_dtype=torch.float16
)
vae = AutoencoderKL.from_pretrained(
    "madebyollin/sdxl-vae-fp16-fix",
    torch_dtype=torch.float16
)

pipe = StableDiffusionXLControlNetPipeline.from_pretrained(
    "stabilityai/stable-diffusion-xl-base-1.0",
    controlnet=controlnet,
    vae=vae,
    torch_dtype=torch.float16
).to("cuda")

# 使用深度图控制生成
depth_image = cv2.imread("depth_map.png")
result = pipe(
    prompt="现代简约风格客厅",
    image=depth_image,
    guidance_scale=7.5,
    num_inference_steps=30
).images[0]
```

**阶段 5：服务化部署**

```python
# 使用 FastAPI 部署图像生成服务
from fastapi import FastAPI
from pydantic import BaseModel
import torch
from diffusers import DiffusionPipeline

app = FastAPI()
pipe = DiffusionPipeline.from_pretrained("stabilityai/stable-diffusion-xl-base-1.0", torch_dtype=torch.float16).to("cuda")

class GenerateRequest(BaseModel):
    prompt: str
    negative_prompt: str = "low quality, blurry"
    guidance_scale: float = 7.5
    steps: int = 30
    width: int = 1024
    height: int = 1024

@app.post("/generate")
async def generate_image(req: GenerateRequest):
    image = pipe(
        prompt=req.prompt,
        negative_prompt=req.negative_prompt,
        guidance_scale=req.guidance_scale,
        num_inference_steps=req.steps,
        width=req.width,
        height=req.height
    ).images[0]
    # 返回图像...
    return {"status": "success"}
```

**阶段 6：监控与优化**

| 监控指标        | 目标值           | 优化手段                    |
| --------------- | ---------------- | --------------------------- |
| 生成延迟（P99） | < 10s            | TensorRT 编译、蒸馏模型     |
| 显存占用        | < 8GB            | FP16 推理、模型卸载         |
| 生成质量（FID） | < 20             | 调整参数、优化提示词        |
| 文本遵循度      | CLIP Score > 0.3 | 提高 Guidance Scale         |
| 服务可用性      | > 99.9%          | 多 GPU 负载均衡、自动扩缩容 |

## 主流框架对比

| 框架/模型           | 类型     | 参数量 | 生成速度       | 质量     | 适用场景             |
| ------------------- | -------- | ------ | -------------- | -------- | -------------------- |
| FLUX.1              | 开源     | 12B    | 中等（10-20s） | 最优     | 高质量图像生成       |
| Stable Diffusion XL | 开源     | 2.6B   | 快（5-10s）    | 优秀     | 通用场景，生态完善   |
| SDXL Turbo          | 开源     | 2.6B   | 极快（< 1s）   | 良好     | 实时交互应用         |
| DALL-E 3            | 闭源 API | -      | 中等（10-15s） | 优秀     | 文本理解要求高的场景 |
| Midjourney v6       | 闭源     | -      | 中等（30-60s） | 艺术最优 | 艺术创作、设计       |
| 通义万相            | 闭源 API | -      | 快（3-8s）     | 良好     | 中文场景、电商       |

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

| 指标        | 说明                         | 工具     |
| ----------- | ---------------------------- | -------- |
| FID         | 生成图像与真实图像的分布距离 | 越低越好 |
| CLIP Score  | 图像与文本提示的语义一致性   | 越高越好 |
| HPS v2      | 人类偏好评分                 | 越高越好 |
| ImageReward | 基于人类反馈的奖励模型       | 越高越好 |

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

## 常见问题与避坑

### FAQ

**Q1：生成的图像手指/肢体畸形怎么办？**

- 在负面提示词中添加 `extra limbs, bad anatomy, poorly drawn hands`
- 使用 ControlNet 的 OpenPose 或 Depth 模式控制人体结构
- 增加生成步数（Steps）和 Guidance Scale
- 尝试多次生成（Seed 随机化），选择最佳结果

**Q2：如何让模型生成指定的文字？**

- 使用 Ideogram 或 FLUX.1 等文字渲染能力强的模型
- 在提示词中用引号明确标注文字内容：`写着"Hello World"的招牌`
- 增加质量词：`typography, clear text, legible`
- 如果效果不佳，后期用图像编辑工具添加文字

**Q3：生成速度太慢如何优化？**

- 使用 FP16 半精度推理，显存减半，速度提升
- 安装 xformers 或启用 `--xformers` 优化注意力计算
- 使用蒸馏模型（SDXL Turbo、LCM），1-4 步出图
- 部署时使用 TensorRT 编译模型，推理加速 30%-50%

**Q4：如何保持生成风格的一致性？**

- 训练专属 LoRA 模型，固化品牌风格
- 使用 IP-Adapter 传入参考图像控制风格
- 固定提示词模板和随机种子（Seed）
- 使用 ControlNet 保持构图一致性

**Q5：商用需要注意哪些版权问题？**

- 开源模型需遵守对应许可证（如 CreativeML Open RAIL-M）
- 避免生成与知名 IP 高度相似的内容
- 部分云服务禁止生成内容的商业用途，需仔细阅读条款
- 建议建立内部审核流程，确保生成内容合规

::: warning 避坑指南

1. **不要忽视负面提示词**：合理设置负面提示词可大幅提升生成质量
2. **不要过度依赖单次生成**：图像生成有随机性，多次生成选择最佳
3. **不要忽略显存管理**：大模型需要 8GB+ 显存，注意模型卸载和半精度
4. **不要直接用于生产**：生成内容需人工审核，避免不当内容
5. **不要忽视版权风险**：商用前务必确认模型许可证和生成内容版权归属
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
