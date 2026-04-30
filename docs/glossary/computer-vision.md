---
title: 计算机视觉
description: Computer Vision (CV)，让计算机理解和处理图像与视频
---

# 计算机视觉

让电脑拥有"眼睛"的技术。不仅能看到图片上的像素点，还能认出里面的人脸、物体、场景，甚至理解正在发生什么。手机相册自动分类、停车场的车牌识别、自动驾驶汽车认路，靠的都是它。

## 概述

**计算机视觉**（Computer Vision，CV）是人工智能的重要分支，致力于让计算机能够从图像和视频中获取、处理和理解视觉信息。简而言之，CV 的目标是赋予机器"看"的能力——不仅是记录像素，更要理解场景中的对象、关系和动态变化。

计算机视觉涵盖三个层次的理解：

- **感知层**（Perception）：识别图像中的基本元素（边缘、角点、纹理）
- **理解层**（Understanding）：识别对象、场景、动作，理解语义内容
- **推理层**（Reasoning）：理解对象之间的关系、推断场景意图、预测未来状态

:::tip 提示
计算机视觉的核心挑战在于**语义鸿沟**（Semantic Gap）：底层像素数据与高层语义理解之间存在巨大差距。同一物体在不同光照、角度、遮挡条件下，像素值可能完全不同，但人类能轻易识别。
:::

## 为什么重要

- **视觉信息主导**：人类获取的信息约 80% 来自视觉，互联网内容中图像和视频占比持续增长
- **产业应用广泛**：安防监控、自动驾驶、医疗影像、工业质检、零售分析等核心场景
- **多模态融合**：视觉与语言结合（Vision-Language Model）是当前 AI 最前沿方向
- **自动化替代**：在质检、分拣、监控等场景替代人工，提升效率和一致性
- **创意工具**：AI 图像/视频生成正在改变内容创作行业

## CV 发展历程

### 传统方法时代（1960s-2010s）

基于手工设计特征（Hand-crafted Features）和经典机器学习：

- **1960s**：MIT 夏季视觉项目，CV 领域开端
- **1999 年**：SIFT（尺度不变特征变换）提出，成为特征提取经典算法
- **2005 年**：HOG（方向梯度直方图）+ SVM 用于行人检测
- **2010 年**：ImageNet 数据集发布，包含 1400 万张标注图像
- **局限**：特征设计依赖专家经验，泛化能力有限

### CNN 时代（2012-2020）

卷积神经网络（Convolutional Neural Network）统治 CV 领域：

- **2012 年**：AlexNet 在 ImageNet 竞赛中夺冠，误差率从 26% 降至 16%
- **2014 年**：VGGNet（更深的网络）、GoogLeNet/Inception（多尺度卷积）
- **2015 年**：ResNet（残差网络），解决超深网络训练难题，达 152 层
- **2015 年**：Fast R-CNN、Faster R-CNN，目标检测里程碑
- **2017 年**：Mask R-CNN，实例分割（Instance Segmentation）
- **2019 年**：EfficientNet，神经架构搜索（NAS）自动设计网络

### Transformer 时代（2020 年-至今）

Vision Transformer（ViT）将 Transformer 引入视觉领域：

- **2020 年**：ViT 证明纯 Transformer 架构在图像分类上可超越 CNN
- **2021 年**：Swin Transformer，引入层次化和滑动窗口，适合密集预测任务
- **2021 年**：CLIP（Contrastive Language-Image Pre-training），视觉-语言对比学习
- **2022 年**：SAM（Segment Anything Model），通用图像分割基础模型
- **2022 年至今**：多模态大模型（GPT-4V、Gemini、Qwen-VL）爆发

## 核心技术任务

### 图像理解任务

| 任务         | 英文                  | 描述                             | 典型输出                     |
| ------------ | --------------------- | -------------------------------- | ---------------------------- |
| **图像分类** | Image Classification  | 识别图像所属类别                 | 类别标签 + 置信度            |
| **目标检测** | Object Detection      | 定位并识别图像中的多个对象       | 边界框（Bounding Box）+ 类别 |
| **语义分割** | Semantic Segmentation | 像素级分类，每个像素归属一个类别 | 分割掩码（Mask）             |
| **实例分割** | Instance Segmentation | 区分同一类别的不同实例           | 每个实例的独立掩码           |
| **全景分割** | Panoptic Segmentation | 语义分割 + 实例分割的统一        | 所有像素的完整标注           |

### 视频理解任务

| 任务         | 英文               | 描述                       |
| ------------ | ------------------ | -------------------------- |
| **动作识别** | Action Recognition | 识别视频中的动作类别       |
| **目标跟踪** | Object Tracking    | 在视频序列中持续跟踪目标   |
| **视频分割** | Video Segmentation | 视频中逐帧的像素级分割     |
| **行为分析** | Behavior Analysis  | 理解视频中人物的行为和意图 |

### 图像生成与编辑

| 任务         | 英文             | 描述                         |
| ------------ | ---------------- | ---------------------------- |
| **图像生成** | Image Generation | 从零生成逼真或风格化图像     |
| **图像修复** | Image Inpainting | 填补图像中的缺失区域         |
| **风格迁移** | Style Transfer   | 将一幅画的风格应用到另一幅图 |
| **超分辨率** | Super Resolution | 提升图像分辨率               |
| **图像编辑** | Image Editing    | 根据指令修改图像内容         |

## 关键技术与算法

### 卷积神经网络（CNN）

CNN 是计算机视觉的基石，核心思想是利用**卷积操作**（Convolution）提取局部特征：

```python
import torch.nn as nn

class SimpleCNN(nn.Module):
    def __init__(self, num_classes=10):
        super().__init__()
        self.features = nn.Sequential(
            # 卷积层：提取特征
            nn.Conv2d(3, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),
            # 更深的卷积层
            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),
        )
        self.classifier = nn.Sequential(
            nn.AdaptiveAvgPool2d(1),
            nn.Flatten(),
            nn.Linear(128, num_classes),
        )

    def forward(self, x):
        x = self.features(x)
        return self.classifier(x)
```

CNN 的核心组件：

- **卷积层**（Convolution Layer）：通过卷积核（Kernel）提取局部特征，具有平移不变性
- **池化层**（Pooling Layer）：下采样，减少参数量，增强鲁棒性
- **归一化层**（Normalization Layer）：BatchNorm、LayerNorm，加速训练
- **残差连接**（Residual Connection）：解决深层网络梯度消失

### Vision Transformer（ViT）

ViT 将图像切分为固定大小的 Patch，作为序列输入 Transformer：

```python
# ViT 核心思想：图像 → Patch 序列 → Transformer
# 1. 将 224x224 图像切分为 16x16 的 Patch → 196 个 Patch
# 2. 每个 Patch 展平并线性投影为向量
# 3. 添加位置编码（Position Embedding）
# 4. 输入 Transformer Encoder
```

ViT 与 CNN 的对比：

| 特性       | CNN                      | ViT                    |
| ---------- | ------------------------ | ---------------------- |
| 归纳偏置   | 强（局部性、平移不变性） | 弱（需更多数据学习）   |
| 感受野     | 逐层扩大                 | 全局（自注意力）       |
| 数据需求   | 较少                     | 较多（需大规模预训练） |
| 计算复杂度 | O(N)                     | O(N²)，N 为 Patch 数量 |
| 可解释性   | 较直观                   | 注意力图可可视化       |

### 扩散模型（Diffusion Model）

扩散模型是当前图像生成的主流方法：

- **前向过程**（Forward Process）：逐步向图像添加噪声，最终变为纯噪声
- **反向过程**（Reverse Process）：训练网络逐步去噪，从噪声恢复图像
- **代表模型**：DDPM、Stable Diffusion、DALL-E 3、Midjourney

```python
# Stable Diffusion 使用示例（diffusers 库）
from diffusers import StableDiffusionPipeline

pipe = StableDiffusionPipeline.from_pretrained("runwayml/stable-diffusion-v1-5")
image = pipe(
    prompt="a photo of an astronaut riding a horse on mars",
    negative_prompt="blurry, low quality",
    num_inference_steps=50,
).images[0]
image.save("astronaut_horse.png")
```

## 主流框架与实现

### OpenCV

计算机视觉最基础的库，提供图像处理、视频分析等功能：

```python
import cv2
import numpy as np

# 读取和处理图像
img = cv2.imread("image.jpg")
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# 边缘检测
edges = cv2.Canny(gray, 100, 200)

# 目标检测（Haar Cascade）
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
faces = face_cascade.detectMultiScale(gray, 1.1, 4)
```

### 深度学习框架

- **PyTorch + torchvision**：研究和开发首选，模型库丰富
- **TensorFlow + tf.keras**：适合大规模部署和生产环境
- **MMDetection**（OpenMMLab）：目标检测工具箱，算法覆盖全面
- **Detectron2**（Meta）：检测和分割框架
- **timm**（PyTorch Image Models）：预训练模型集合

### 推理部署

- **ONNX Runtime**：跨平台推理引擎
- **TensorRT**：NVIDIA GPU 推理优化
- **OpenVINO**：Intel CPU/GPU/VPU 推理优化
- **NCNN / MNN / TNN**：移动端推理框架

## 工程实践

### 数据准备

图像数据的质量直接决定模型性能上限：

```python
# 常见数据增强策略
from torchvision import transforms

train_transform = transforms.Compose([
    transforms.RandomResizedCrop(224),       # 随机裁剪缩放
    transforms.RandomHorizontalFlip(),       # 随机水平翻转
    transforms.ColorJitter(0.2, 0.2, 0.2),   # 颜色抖动
    transforms.RandomRotation(15),           # 随机旋转
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],  # ImageNet 统计值
                         std=[0.229, 0.224, 0.225]),
])
```

:::warning 注意

- **类别不平衡**：使用重采样、类别权重、Focal Loss 等方法处理
- **标注质量**：标注错误会直接限制模型性能，建议进行标注审核
- **数据泄露**：确保训练集和测试集无重叠，避免过拟合评估
  :::

### 模型选择指南

| 场景     | 推荐方案                       | 理由                     |
| -------- | ------------------------------ | ------------------------ |
| 图像分类 | ResNet、EfficientNet、ConvNeXt | 成熟稳定，预训练模型丰富 |
| 目标检测 | YOLO 系列、DETR、RT-DETR       | 速度与精度平衡           |
| 图像分割 | SAM、Mask2Former、SegFormer    | 通用分割能力强           |
| 实时推理 | YOLOv8/v10、MobileNet          | 轻量高效                 |
| 图像生成 | Stable Diffusion、FLUX         | 开源生态成熟             |

### 性能优化

1. **模型压缩**：量化（INT8/FP16）、剪枝（Pruning）、知识蒸馏（Distillation）
2. **推理加速**：TensorRT、ONNX Runtime、算子融合（Operator Fusion）
3. **批处理**：动态 Batch Size，最大化 GPU 利用率
4. **缓存策略**：对重复请求或相似输入进行结果缓存

### 评估指标

| 任务 | 指标                                  | 说明                       |
| ---- | ------------------------------------- | -------------------------- |
| 分类 | 准确率（Accuracy）、Top-1/Top-5       | 整体分类正确率             |
| 检测 | mAP（mean Average Precision）         | 不同 IoU 阈值下的平均精度  |
| 分割 | IoU（Intersection over Union）、Dice  | 预测掩码与真实掩码的重叠度 |
| 生成 | FID（Fréchet Inception Distance）、IS | 生成图像的质量和多样性     |

## 与其他概念的关系

- 计算机视觉是 [多模态模型](/glossary/multimodal-model) 的视觉基础
- [深度学习](/glossary/deep-learning) 是 CV 的主流方法论
- [图像生成](/glossary/image-generation) 是 CV 的重要分支
- [Transformer](/glossary/transformer) 架构正逐步替代 CNN 成为 CV 新范式
- CV 与 [NLP](/glossary/nlp) 结合形成视觉-语言模型（Vision-Language Model）
- [GPU](/glossary/gpu) 是 CV 模型训练和推理的核心硬件

## 延伸阅读

- [多模态模型](/glossary/multimodal-model) — 了解视觉与语言的融合
- [深度学习](/glossary/deep-learning) — 了解 CV 的方法论基础
- [图像生成](/glossary/image-generation) — 了解 AI 图像生成技术
- [Transformer](/glossary/transformer) — 了解 ViT 的架构基础
- [NLP](/glossary/nlp) — 了解视觉-语言模型的文本侧
- [Deep Learning for Computer Vision](https://www.deeplearningbook.org/) — 经典教材 CV 相关章节
- [OpenMMLab](https://openmmlab.com/) — 开源 CV 算法工具箱
- [Papers With Code - CV](https://paperswithcode.com/area/computer-vision) — CV 最新论文与代码
