---
title: 联邦学习
description: Federated Learning，在保护数据隐私的前提下实现分布式协作训练
---

# 联邦学习

## 概述

**联邦学习**（Federated Learning，FL）是一种分布式机器学习范式，允许多个参与方（客户端）在**不共享原始数据**的前提下协作训练模型。各参与方将数据保留在本地，仅交换模型参数或梯度更新，由中央服务器（或去中心化网络）聚合这些更新以构建全局模型。

联邦学习的核心理念可以概括为：**数据不动模型动**——数据保留在本地，模型在各方之间流转和聚合。

:::tip 提示
联邦学习与传统的集中式训练形成鲜明对比：
- **集中式训练**：所有数据收集到中央服务器 → 训练模型 → 数据隐私风险高
- **联邦学习**：模型下发到各客户端 → 本地训练 → 仅上传模型更新 → 数据不出本地
:::

## 为什么重要

- **隐私保护**：原始数据始终保留在本地，从根本上降低数据泄露风险
- **合规要求**：满足 GDPR、《个人信息保护法》等数据保护法规的要求
- **打破数据孤岛**：多个机构可以在不共享数据的前提下联合建模
- **边缘智能**：利用海量终端设备的算力和数据，实现端侧模型训练
- **数据主权**：各参与方保持对自身数据的完全控制权

## 联邦学习架构

### 基本工作流程

```
┌─────────────┐     1. 下发全局模型     ┌──────────┐
│             │ ──────────────────────→ │ 客户端 A  │
│             │                         │ (本地数据) │
│             │ ←────────────────────── │          │
│             │   2. 上传模型更新        └──────────┘
│   中央服务器 │
│  (聚合器)    │                         ┌──────────┐
│             │ ←────────────────────── │          │
│             │   2. 上传模型更新        │ 客户端 B  │
│             │ ──────────────────────→ │ (本地数据) │
└─────────────┘     1. 下发全局模型     └──────────┘

3. 服务器聚合所有更新 → 更新全局模型 → 重复步骤 1-3
```

### 标准算法：FedAvg

**联邦平均**（Federated Averaging，FedAvg）是最经典的联邦学习算法：

```python
# FedAvg 伪代码
# 服务器端:
def federated_learning(n_rounds, n_clients, frac=0.1):
    global_model = initialize_model()

    for round in range(n_rounds):
        # 1. 选择参与本轮的客户端子集
        selected_clients = random.sample(clients, int(n_clients * frac))

        # 2. 下发全局模型到各客户端
        for client in selected_clients:
            client.set_model(global_model)

        # 3. 各客户端本地训练
        updates = []
        for client in selected_clients:
            update = client.train()  # 本地训练，返回模型更新
            updates.append((update, client.n_samples))

        # 4. 加权聚合（按样本数加权）
        global_model = weighted_average(updates)

    return global_model

# 客户端:
class FederatedClient:
    def train(self, local_epochs=5):
        model = self.get_model()
        optimizer = torch.optim.SGD(model.parameters(), lr=0.01)

        for epoch in range(local_epochs):
            for batch in self.local_data:
                loss = compute_loss(model, batch)
                loss.backward()
                optimizer.step()

        return model.state_dict()  # 返回模型参数
```

### 架构类型

| 架构 | 英文 | 描述 | 适用场景 |
|------|------|------|---------|
| **横向联邦学习** | Horizontal FL | 各参与方特征空间相同，样本重叠少 | 多家银行联合风控 |
| **纵向联邦学习** | Vertical FL | 各参与方样本重叠多，特征空间不同 | 银行+电商联合建模 |
| **联邦迁移学习** | Federated Transfer Learning | 样本和特征重叠都少 | 跨行业联合建模 |

## 核心技术挑战与解决方案

### Non-IID 数据问题

联邦学习中，各客户端的数据通常**非独立同分布**（Non-Independent and Identically Distributed，Non-IID），这是联邦学习面临的最大挑战：

```
客户端 A: 主要包含猫的图片（宠物店）
客户端 B: 主要包含狗的图片（宠物医院）
客户端 C: 主要包含汽车图片（4S 店）
→ 各客户端数据分布差异巨大
```

**解决方案**：

| 方法 | 描述 | 效果 |
|------|------|------|
| **FedProx** | 在本地目标函数中加入近端正则项，限制本地模型偏离全局模型 | 缓解 Non-IID 影响 |
| **SCAFFOLD** | 使用控制变量校正客户端梯度，减少客户端漂移 | 加速收敛 |
| **数据增强** | 在客户端本地进行数据增强，增加数据多样性 | 改善本地数据分布 |
| **个性化联邦学习** | 允许各客户端保留一定个性化，不完全统一 | 平衡全局与局部性能 |

```python
# FedProx 本地目标函数
# min L_local(θ) + (μ/2) · ||θ - θ_global||²
# μ 是近端项系数，控制本地模型偏离全局模型的程度
```

### 通信效率

联邦学习的通信开销是主要瓶颈：

| 优化技术 | 描述 | 压缩率 |
|---------|------|--------|
| **梯度压缩**（Gradient Compression） | 量化、稀疏化梯度 | 10x-100x |
| **模型剪枝**（Model Pruning） | 只传输重要参数 | 2x-10x |
| **知识蒸馏**（Knowledge Distillation） | 传输 logits 而非完整模型 | 视任务而定 |
| **异步聚合**（Asynchronous Aggregation） | 不等待所有客户端，收到即聚合 | 减少等待时间 |
| **客户端选择**（Client Selection） | 选择网络条件好的客户端参与 | 减少通信失败 |

### 隐私保护增强

虽然联邦学习不直接共享原始数据，但模型更新仍可能泄露信息（如通过梯度反演攻击）：

```python
# 差分隐私（Differential Privacy，DP）
# 在上传的模型更新中添加噪声

import torch

def add_noise(update, epsilon=1.0, delta=1e-5, sensitivity=1.0):
    """为模型更新添加差分隐私噪声"""
    # 计算噪声标准差
    sigma = sensitivity * (2 * torch.log(1.25 / delta)) ** 0.5 / epsilon

    # 添加高斯噪声
    noisy_update = update + torch.normal(0, sigma, size=update.shape)
    return noisy_update
```

**隐私保护技术栈**：

| 技术 | 英文 | 描述 | 开销 |
|------|------|------|------|
| **差分隐私** | Differential Privacy (DP) | 添加噪声，提供数学隐私保证 | 可能降低模型精度 |
| **安全多方计算** | Secure Multi-Party Computation (MPC) | 多方协作计算，不暴露中间结果 | 通信和计算开销大 |
| **同态加密** | Homomorphic Encryption (HE) | 在加密数据上直接计算 | 计算开销极大 |
| **可信执行环境** | Trusted Execution Environment (TEE) | 硬件级安全隔离 | 需要特定硬件支持 |

## 主流框架与实现

### Flower

最流行的联邦学习框架之一，支持 PyTorch、TensorFlow 等：

```python
import flwr as fl
import torch
import torch.nn as nn

# 定义客户端
class FlowerClient(fl.client.NumPyClient):
    def __init__(self, model, trainloader):
        self.model = model
        self.trainloader = trainloader

    def get_parameters(self, config):
        return [val.cpu().numpy() for _, val in self.model.state_dict().items()]

    def fit(self, parameters, config):
        # 设置全局模型参数
        params_dict = zip(self.model.state_dict().keys(), parameters)
        state_dict = {k: torch.tensor(v) for k, v in params_dict}
        self.model.load_state_dict(state_dict, strict=True)

        # 本地训练
        train(self.model, self.trainloader, epochs=1)

        return self.get_parameters(config={}), len(self.trainloader), {}

    def evaluate(self, parameters, config):
        # 本地评估
        params_dict = zip(self.model.state_dict().keys(), parameters)
        state_dict = {k: torch.tensor(v) for k, v in params_dict}
        self.model.load_state_dict(state_dict, strict=True)

        loss, accuracy = evaluate(self.model, self.testloader)
        return float(loss), len(self.testloader), {"accuracy": float(accuracy)}

# 启动联邦学习
fl.client.start_numpy_client(
    server_address="127.0.0.1:8080",
    client=FlowerClient(model, trainloader),
)
```

### 其他重要框架

- **FedML**：支持多种联邦学习场景的开源库
- **PySyft**（OpenMined）：专注于隐私保护的联邦学习框架
- **TensorFlow Federated**（TFF）：Google 的联邦学习框架
- **FATE**（微众银行）：企业级联邦学习平台，支持纵向联邦学习

## 工程实践

### 联邦学习部署架构

```
生产环境典型部署:

┌─────────────────────────────────────────────────┐
│                  中央服务器                        │
│  ┌─────────┐  ┌──────────┐  ┌────────────────┐  │
│  │ 聚合服务  │  │ 监控面板  │  │ 客户端管理      │  │
│  └─────────┘  └──────────┘  └────────────────┘  │
└──────────────────────┬──────────────────────────┘
                       │ HTTPS/gRPC
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
   ┌─────────┐   ┌─────────┐   ┌─────────┐
   │ 客户端 A │   │ 客户端 B │   │ 客户端 C │
   │ (手机)   │   │ (医院)   │   │ (银行)   │
   └─────────┘   └─────────┘   └─────────┘
```

### 实施 checklist

```
□ 数据评估
  ├── 各参与方数据规模和分布分析
  ├── Non-IID 程度评估
  └── 数据质量检查

□ 网络评估
  ├── 客户端网络连接稳定性
  ├── 带宽和延迟评估
  └── 离线/掉线处理策略

□ 安全评估
  ├── 通信加密（TLS）
  ├── 客户端身份认证
  ├── 差分隐私参数设置
  └── 模型更新审计

□ 性能评估
  ├── 通信轮次预估
  ├── 客户端计算能力评估
  └── 模型收敛速度预估
```

### 常见陷阱

:::warning 注意
- **系统异构性**（System Heterogeneity）：各客户端的计算能力、网络条件差异巨大，需要设计容错机制
- **客户端掉线**（Client Dropout）：训练过程中客户端可能随时离线，需要支持异步聚合
- **恶意客户端**（Byzantine Clients）：部分客户端可能上传恶意更新，需要鲁棒聚合策略（如 Krum、Median）
- **隐私泄露风险**：模型更新仍可能泄露信息，需结合差分隐私或安全多方计算
- **评估困难**：无法集中评估，需要在各客户端分别评估并聚合结果
:::

### 应用场景

| 场景 | 描述 | 技术要点 |
|------|------|---------|
| **移动端键盘预测** | Google Gboard 输入法，在手机上本地训练输入预测模型 | 海量客户端、强 Non-IID |
| **医疗联合建模** | 多家医院联合训练疾病诊断模型，患者数据不出院 | 纵向联邦学习、高隐私要求 |
| **金融风控** | 多家银行联合训练反欺诈模型 | 纵向联邦学习、合规要求 |
| **物联网** | 边缘设备协作训练，如智能家居 | 资源受限、网络不稳定 |
| **智能汽车** | 多辆车协作训练自动驾驶模型 | 移动场景、通信受限 |

## 与其他概念的关系

- 联邦学习与 [数据隐私](/glossary/data-privacy) 紧密相关，是隐私保护计算的重要技术
- 联邦学习使用 [机器学习](/glossary/machine-learning) 算法作为底层训练方法
- 联邦学习可与 [微调](/glossary/fine-tuning) 结合，在本地对预训练模型进行个性化微调
- 联邦学习是 [分布式训练](/glossary/deep-learning) 的一种特殊形式
- 联邦学习可与 [量化](/glossary/quantization) 结合，减少通信开销
- 联邦学习为 [大语言模型](/glossary/llm) 的隐私保护训练提供了可能方向

## 延伸阅读

- [数据隐私](/glossary/data-privacy) — 了解联邦学习的隐私保护动机
- [微调](/glossary/fine-tuning) — 了解联邦学习中的个性化微调
- [机器学习](/glossary/machine-learning) — 了解联邦学习的底层算法
- [量化](/glossary/quantization) — 了解减少通信开销的技术
- [Communication-Efficient Learning of Deep Networks from Decentralized Data](https://arxiv.org/abs/1602.05629) — FedAvg 原始论文
- [Advances and Open Problems in Federated Learning](https://arxiv.org/abs/1912.04977) — 联邦学习综述
- [Flower 框架](https://flower.ai/) — 联邦学习开源框架
- [FATE 平台](https://fate.fedai.org/) — 企业级联邦学习平台
