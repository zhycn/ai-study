---
title: 神经网络
description: Neural Network，模拟人脑神经元结构的计算模型
---

# 神经网络

模仿人脑神经元连接方式设计的数学模型，是深度学习的"基本零件"。就像人脑里几百亿个神经元互相传递信号一样，神经网络里也有许多"人工神经元"手拉手协作，通过不断调整彼此之间的"默契度"来学会完成任务。

## 概述

**神经网络**（Neural Network，NN）是受人脑神经元结构启发而设计的计算模型，是深度学习和现代人工智能的核心算法基础。

神经网络由大量相互连接的**神经元**（Neuron）组成，通过调整连接权重来学习输入到输出的映射关系。单个神经元的能力有限，但大量神经元的组合可以逼近任意复杂函数，这一性质被称为**通用近似定理**（Universal Approximation Theorem）。

:::tip 提示
虽然神经网络受生物神经元启发，但现代人工神经元与生物神经元在结构和功能上有很大差异。神经网络更应被视为一种强大的数学函数逼近器，而非对人脑的精确模拟。
:::

## 演进历史

### 理论萌芽（1940s-1950s）

- **1943 年**：McCulloch 和 Pitts 提出第一个神经元数学模型（MCP 神经元），用阈值逻辑单元模拟生物神经元
- **1949 年**：Hebb 提出**赫布学习规则**（Hebbian Learning），"一起激活的神经元连接会增强"
- **1958 年**：Rosenblatt 提出**感知机**（Perceptron），是第一个可训练的神经网络模型，能实现简单线性分类

### 第一次低谷与突破（1960s-1980s）

- **1969 年**：Minsky 和 Papert 指出感知机无法解决 XOR 问题，神经网络研究进入第一次寒冬
- **1974 年**：Werbos 提出反向传播（Backpropagation）思想，但未受关注
- **1986 年**：Rumelhart、Hinton 和 Williams 重新发现反向传播算法，多层网络训练成为可能
- **1989 年**：LeCun 将**卷积神经网络**（CNN）应用于手写数字识别（LeNet），在工业界取得成功

### 多样化发展（1990s-2000s）

- **1997 年**：Hochreiter 和 Schmidhuber 提出**LSTM**（长短期记忆网络），解决序列建模中的梯度消失问题
- **1998 年**：LeCun 发表 LeNet-5，CNN 在支票识别中大规模商用
- 这一时期，SVM 等传统机器学习方法占据主流，神经网络因算力和数据限制发展缓慢

### 深度学习革命（2006 年-至今）

- **2006 年**：Hinton 提出深度信念网络（DBN），"深度学习"一词正式诞生
- **2011 年**：ReLU 激活函数被证明比 Sigmoid/Tanh 更适合深层网络训练
- **2012 年**：AlexNet 在 ImageNet 竞赛中夺冠，GPU 加速的 CNN 展现压倒性优势
- **2014 年**：GAN（生成对抗网络）提出，开启生成模型新方向
- **2015 年**：ResNet（残差网络）提出，通过残差连接训练上百层网络
- **2017 年**：Transformer 架构提出，自注意力机制取代 RNN 成为序列建模主流
- **2020 年至今**：大模型时代，神经网络参数规模从亿级跃升至万亿级

## 为什么重要

- **通用近似能力**：理论上可以逼近任意连续函数，具有极强的表达能力
- **自动特征学习**：能够从原始数据中自动学习有用的特征表示
- **并行计算友好**：矩阵运算天然适合 GPU 等并行硬件加速
- **端到端学习**：可以直接从原始输入到最终输出进行优化
- **多任务通用**：同一架构可应用于分类、回归、生成等多种任务

## 神经元模型

### 人工神经元（Artificial Neuron）

人工神经元是神经网络的基本计算单元，模拟生物神经元的工作方式：

```
输入 (x₁, x₂, ..., xₙ)
       ↓
权重 (w₁, w₂, ..., wₙ)
       ↓
加权求和: z = Σ(wᵢ × xᵢ) + b
       ↓
激活函数: a = f(z)
       ↓
输出
```

数学表达：

$$a = f\left(\sum_{i=1}^{n} w_i x_i + b\right)$$

其中：

- $x_i$：输入信号
- $w_i$：连接权重
- $b$：偏置（Bias）
- $f$：激活函数（Activation Function）

### 常见激活函数

| 激活函数       | 公式                            | 特点                         | 适用场景       |
| -------------- | ------------------------------- | ---------------------------- | -------------- |
| **Sigmoid**    | $\frac{1}{1+e^{-x}}$            | 输出 (0,1)，易梯度消失       | 二分类输出层   |
| **Tanh**       | $\frac{e^x-e^{-x}}{e^x+e^{-x}}$ | 输出 (-1,1)，零中心化        | 隐藏层（历史） |
| **ReLU**       | $\max(0, x)$                    | 计算简单，缓解梯度消失       | 隐藏层（主流） |
| **Leaky ReLU** | $\max(\alpha x, x)$             | 解决 ReLU 死亡问题           | 隐藏层         |
| **GELU**       | $x \cdot \Phi(x)$               | 平滑非线性，Transformer 常用 | 大模型隐藏层   |
| **Softmax**    | $\frac{e^{x_i}}{\sum e^{x_j}}$  | 输出概率分布                 | 多分类输出层   |

## 网络结构

### 基本组成

- **输入层**（Input Layer）：接收输入数据，不进行计算
- **隐藏层**（Hidden Layer）：进行特征提取和转换，可以有多层
- **输出层**（Output Layer）：产生最终输出
- **连接权重**（Weights）：神经元之间的连接强度，是模型学习的参数

### 前向传播（Forward Propagation）

数据从输入层经过隐藏层逐层传递到输出层的过程：

```python
import torch
import torch.nn as nn

class SimpleNeuralNetwork(nn.Module):
    def __init__(self, input_size, hidden_size, output_size):
        super().__init__()
        self.layer1 = nn.Linear(input_size, hidden_size)
        self.activation = nn.ReLU()
        self.layer2 = nn.Linear(hidden_size, output_size)

    def forward(self, x):
        x = self.layer1(x)      # 线性变换
        x = self.activation(x)  # 非线性激活
        x = self.layer2(x)      # 输出层
        return x
```

## 训练方法

### 反向传播（Backpropagation）

反向传播是训练神经网络的核心算法，通过链式法则（Chain Rule）高效计算梯度。

**训练流程**：

1. **前向传播**：计算模型输出
2. **计算损失**：使用损失函数衡量预测与真实的差距
3. **反向传播**：从输出层向输入层逐层计算梯度
4. **参数更新**：使用优化器更新权重

```python
# 训练步骤示例
loss = criterion(outputs, labels)   # 计算损失
loss.backward()                      # 反向传播，计算梯度
optimizer.step()                     # 更新参数
optimizer.zero_grad()                # 清空梯度
```

### 梯度下降（Gradient Descent）

| 变体                                 | 描述                 | 特点             |
| ------------------------------------ | -------------------- | ---------------- |
| **批量梯度下降**（BGD）              | 使用全部数据计算梯度 | 稳定但慢         |
| **随机梯度下降**（SGD）              | 每次使用一个样本     | 快但波动大       |
| **小批量梯度下降**（Mini-batch SGD） | 每次使用一批样本     | 平衡速度和稳定性 |

### 优化器（Optimizer）

- **SGD + Momentum**：引入动量加速收敛
- **Adam**：自适应学习率，最常用的优化器
- **AdamW**：Adam + 权重衰减修正，大模型训练首选
- **LAMB / LARS**：适合超大 batch size 训练

### 正则化技术

- **L2 正则化**（权重衰减）：限制权重大小，防止过拟合
- **Dropout**：训练时随机失活神经元
- **Batch Normalization**：对每层输出进行归一化
- **早停**（Early Stopping）：验证集性能不再提升时停止训练

## 经典架构

### 多层感知机（MLP）

最基础的神经网络结构，由多个全连接层组成。

```python
class MLP(nn.Module):
    def __init__(self):
        super().__init__()
        self.network = nn.Sequential(
            nn.Linear(784, 256),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Linear(128, 10)
        )

    def forward(self, x):
        return self.network(x)
```

### 卷积神经网络（CNN）

通过卷积核提取局部特征，适合处理图像等网格数据。

- **核心操作**：卷积（Convolution）、池化（Pooling）
- **经典架构**：LeNet、AlexNet、VGG、ResNet
- **详细参考**：[计算机视觉](/glossary/computer-vision)

### 循环神经网络（RNN）

具有记忆功能，适合处理序列数据。

- **变体**：LSTM、GRU
- **局限**：难以并行，长序列梯度消失
- **详细参考**：[自然语言处理](/glossary/nlp)

### Transformer

基于自注意力机制，当前最主流的架构。

- **核心**：自注意力（Self-Attention）、多头注意力（Multi-Head Attention）
- **优势**：全局依赖、高度并行
- **详细参考**：[Transformer](/glossary/transformer)、[注意力机制](/glossary/attention)

## 主流框架与实现

### [PyTorch](https://pytorch.org/)

```python
import torch.nn as nn

# 快速构建神经网络
model = nn.Sequential(
    nn.Linear(784, 256),
    nn.ReLU(),
    nn.Linear(256, 10)
)

# 或使用模块化定义
class CustomNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 64, kernel_size=3),
            nn.BatchNorm2d(64),
            nn.ReLU(),
            nn.MaxPool2d(2)
        )
        self.classifier = nn.Linear(64 * 14 * 14, 10)

    def forward(self, x):
        x = self.features(x)
        x = x.view(x.size(0), -1)
        return self.classifier(x)
```

### 其他框架

- **[TensorFlow](https://www.tensorflow.org/) / [Keras](https://keras.io/)**：`tf.keras.Sequential` 快速构建
- **[JAX](https://jax.readthedocs.io/)**：函数式编程风格，高性能
- **PaddlePaddle**：`paddle.nn.Layer` 定义网络

## 工程实践

### 网络设计原则

1. **从简单开始**：先用简单网络建立基线，再增加复杂度
2. **深度 vs 宽度**：增加深度通常比增加宽度更有效，但需注意梯度问题
3. **残差连接**：深层网络必备，解决梯度消失和退化问题
4. **归一化层**：加速训练，提高稳定性

### 常见问题与解决方案

:::warning 注意

- **梯度消失**：使用 ReLU、残差连接、归一化层
- **梯度爆炸**：梯度裁剪（Gradient Clipping）、权重初始化
- **过拟合**：增加数据、Dropout、正则化、早停
- **欠拟合**：增加网络容量、减少正则化、训练更久
- **训练不稳定**：检查学习率、数据质量、梯度范数
  :::

### 调试技巧

- **检查数据**：确保数据格式、范围、标签正确
- **小规模验证**：先用少量数据过拟合，验证模型能够学习
- **可视化**：绘制损失曲线、梯度分布、激活值分布
- **梯度检查**：确保反向传播计算的梯度正确

## 与其他概念的关系

- 神经网络是 [深度学习](/glossary/deep-learning) 的基础
- 神经网络是 [机器学习](/glossary/machine-learning) 的重要算法族
- [注意力机制](/glossary/attention) 是 Transformer 神经网络的核心组件
- 神经网络支撑 [大语言模型](/glossary/llm) 的实现
- [卷积神经网络](/glossary/computer-vision) 是计算机视觉的核心
- [Transformer](/glossary/transformer) 是当前最主流的神经网络架构

## 延伸阅读

- [深度学习](/glossary/deep-learning) — 了解神经网络的深层应用
- [机器学习](/glossary/machine-learning) — 了解神经网络的上位概念
- [注意力机制](/glossary/attention) — 了解现代神经网络的核心机制
- [Transformer](/glossary/transformer) — 了解当前主流架构
- [大语言模型](/glossary/llm) — 了解神经网络的重要应用
- [Neural Networks and Deep Learning](http://neuralnetworksanddeeplearning.com/) — Michael Nielsen 免费在线教材
- [3Blue1Brown 神经网络系列](https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi) — 神经网络可视化讲解
- [PyTorch 官方教程](https://pytorch.org/tutorials/beginner/basics/intro.html) — 神经网络实现入门
