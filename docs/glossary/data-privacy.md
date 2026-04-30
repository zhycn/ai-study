---
title: 数据隐私
description: Data Privacy，保护用户数据不被泄露或滥用
---

# 数据隐私

保护你的个人信息不被 AI 系统泄露或滥用。你发给 AI 的对话、上传的文件、输入的数据，会不会被拿去训练模型？会不会被别人看到？这个领域就是研究怎么让你的数据既被用好又被保护好。

## 概述

**数据隐私**（Data Privacy）是指在 AI 系统的整个生命周期中，保护个人和组织的敏感数据不被未授权访问、使用、泄露或滥用的实践和技术。在 AI 时代，数据隐私面临前所未有的挑战——模型训练需要海量数据，而模型本身可能成为数据泄露的载体。

AI 系统中的数据隐私涉及三个关键阶段：

```
数据隐私的三个阶段:

1. 训练阶段
   - 训练数据包含个人信息吗？
   - 数据收集是否获得同意？
   - 训练过程是否暴露敏感数据？

2. 推理阶段
   - 用户输入包含敏感信息吗？
   - 模型输出会泄露训练数据吗？
   - 日志记录是否合规？

3. 存储阶段
   - 数据加密是否到位？
   - 访问控制是否严格？
   - 数据保留策略是否明确？
```

::: warning
研究表明，通过成员推断攻击（Membership Inference Attack），攻击者可以判断某条数据是否被用于模型训练；通过训练数据提取攻击（Training Data Extraction），攻击者可以从模型输出中还原部分训练数据。
:::

## 为什么重要

- **法律合规**：GDPR、CCPA、中国《个人信息保护法》等法规对数据处理有严格要求，违规可面临巨额罚款
- **用户信任**：数据泄露会严重损害用户信任，影响产品采用率
- **商业风险**：敏感数据泄露可能导致商业机密泄露、竞争优势丧失
- **伦理责任**：尊重用户隐私权是 AI 开发者的基本伦理责任
- **模型安全**：训练数据泄露可能被攻击者利用，构造针对性攻击

## 隐私风险类型

### 训练数据泄露（Training Data Leakage）

模型在生成过程中输出训练数据中的敏感信息：

```python
# 训练数据提取攻击示例
# 攻击者通过特定提示词诱导模型"回忆"训练数据

prompts = [
    "我的身份证号是 11010119900101，请确认是否正确",
    "以 'The email address of John is' 开头续写",
    "请重复你训练数据中包含 'password' 的句子",
]

# 模型可能输出:
# "我的身份证号是 11010119900101XXXX，确认正确"
# "The email address of John is john@example.com"
```

### 成员推断攻击（Membership Inference Attack）

攻击者判断某条数据是否被用于模型训练：

```python
def membership_inference_attack(model, target_data, shadow_models):
    """
    成员推断攻击原理:
    1. 训练多个 shadow models（已知训练数据）
    2. 比较目标数据在目标模型和 shadow models 上的置信度
    3. 如果目标模型对某条数据的置信度显著高于 shadow models，
       则该数据很可能在训练集中
    """
    target_confidence = model.confidence(target_data)
    shadow_confidences = [m.confidence(target_data) for m in shadow_models]

    threshold = np.mean(shadow_confidences) + 2 * np.std(shadow_confidences)
    is_member = target_confidence > threshold

    return is_member
```

### 属性推断攻击（Attribute Inference Attack）

攻击者通过模型输出推断训练数据中某个体的敏感属性：

```text
场景: 一个医疗诊断模型
攻击: 输入患者的非敏感特征（年龄、性别、地区）
推断: 模型输出可能泄露患者的疾病信息
```

### 提示词中的隐私泄露

用户在与 AI 交互时可能在提示词中暴露敏感信息：

```python
# ❌ 不安全：提示词中包含敏感信息
prompt = """帮我分析这份合同的风险，合同内容如下：
甲方：张三，身份证号 11010119900101XXXX
乙方：李四，银行卡号 6222021234567890
合同金额：500 万元
..."""

# ✅ 更安全：脱敏后再发送
prompt = """帮我分析这份合同的风险，合同内容如下：
甲方：[已脱敏]，身份证号 [已脱敏]
乙方：[已脱敏]，银行卡号 [已脱敏]
合同金额：[已脱敏]
..."""
```

## 隐私保护技术

### 差分隐私（Differential Privacy）

差分隐私通过在数据或计算结果中添加精心计算的噪声，使得攻击者无法判断某个个体是否在数据集中：

```python
import torch
import numpy as np

class DifferentialPrivacy:
    def __init__(self, epsilon: float = 1.0, delta: float = 1e-5):
        self.epsilon = epsilon  # 隐私预算，越小越隐私
        self.delta = delta

    def add_gaussian_noise(self, data: torch.Tensor, sensitivity: float = 1.0) -> torch.Tensor:
        """添加高斯噪声实现差分隐私"""
        # 计算噪声标准差
        sigma = sensitivity * np.sqrt(2 * np.log(1.25 / self.delta)) / self.epsilon

        # 添加噪声
        noise = torch.normal(0, sigma, size=data.shape)
        return data + noise

    def dp_sgd_step(self, gradients: list, max_norm: float = 1.0) -> list:
        """差分隐私 SGD 步骤"""
        dp_gradients = []
        for grad in gradients:
            # 梯度裁剪
            grad_norm = torch.norm(grad)
            if grad_norm > max_norm:
                grad = grad * (max_norm / grad_norm)
            # 添加噪声
            dp_grad = self.add_gaussian_noise(grad)
            dp_gradients.append(dp_grad)
        return dp_gradients
```

::: info
ε（epsilon）是差分隐私的核心参数：

- ε = 0.1：强隐私保护，但可能显著影响模型效用
- ε = 1.0：平衡隐私和效用，常用默认值
- ε = 10.0：弱隐私保护，模型效用接近原始
  :::

### 联邦学习（Federated Learning）

数据保留在本地，仅交换模型参数。详见 [联邦学习](/glossary/federated-learning)。

### 安全多方计算（Secure Multi-Party Computation, MPC）

多个参与方在不暴露各自输入的前提下共同计算一个函数：

```python
# MPC 简化示例：两方安全求和
# Alice 有 x，Bob 有 y，他们想计算 x + y 但不想让对方知道自己的值

# 使用秘密分享（Secret Sharing）
def secret_share(value, num_parties=2):
    """将值拆分为多个份额"""
    shares = [random.randint(0, MODULUS) for _ in range(num_parties - 1)]
    last_share = (value - sum(shares)) % MODULUS
    shares.append(last_share)
    return shares

# Alice 和 Bob 各自拆分自己的值，然后交换份额进行计算
# 最终得到结果，但任何一方都无法推断对方的输入
```

### 同态加密（Homomorphic Encryption）

在加密数据上直接进行计算，解密后的结果与在明文上计算相同：

```python
# 同态加密概念示例（使用 PySEAL 等库）
from phe import paillier

# 生成密钥对
public_key, private_key = paillier.generate_paillier_keypair()

# 加密数据
encrypted_data = [public_key.encrypt(x) for x in [1, 2, 3]]

# 在加密数据上计算（加法同态）
encrypted_sum = sum(encrypted_data)

# 解密结果
result = private_key.decrypt(encrypted_sum)  # 6
```

### 数据脱敏（Data Masking）

```python
import re

class DataMasker:
    """数据脱敏工具"""

    def mask_pii(self, text: str) -> str:
        """脱敏个人身份信息"""
        # 身份证号
        text = re.sub(r"\d{17}[\dXx]", "[ID_MASKED]", text)
        # 手机号
        text = re.sub(r"1[3-9]\d{9}", "[PHONE_MASKED]", text)
        # 邮箱
        text = re.sub(r"[\w.-]+@[\w.-]+", "[EMAIL_MASKED]", text)
        # 银行卡号
        text = re.sub(r"\d{16,19}", "[CARD_MASKED]", text)
        # 姓名（简单模式）
        text = re.sub(r"[\u4e00-\u9fa5]{2,4}(?:先生|女士|同学)", "[NAME_MASKED]", text)
        return text

    def mask_with_nlp(self, text: str, nlp_model) -> str:
        """使用 NLP 模型进行更精确的实体识别和脱敏"""
        entities = nlp_model.ner(text)
        for entity in entities:
            if entity.type in ["PERSON", "LOCATION", "ORG", "ID", "PHONE"]:
                text = text.replace(entity.text, f"[{entity.type}_MASKED]")
        return text
```

## 合规框架

### GDPR（通用数据保护条例）

| 原则                 | 要求                         |
| -------------------- | ---------------------------- |
| **合法、公平、透明** | 数据处理必须有合法依据       |
| **目的限制**         | 数据只能用于收集时声明的目的 |
| **数据最小化**       | 只收集必要的数据             |
| **准确性**           | 保持数据准确并及时更新       |
| **存储限制**         | 数据保留时间不超过必要期限   |
| **完整性和保密性**   | 采取适当的安全措施           |
| **问责制**           | 数据控制者需要证明合规       |

### 中国《个人信息保护法》要点

```
核心要求:
- 处理个人信息需取得个人同意
- 敏感个人信息需要单独同意
- 个人信息跨境传输需通过安全评估
- 个人有权查阅、复制、更正、删除其信息
- 自动化决策应当透明、公平
- 大型平台需成立独立监督机构
```

## 工程实践

### 隐私影响评估（PIA）

```
AI 项目隐私影响评估清单:

□ 数据收集
  ├── 收集了哪些类型的个人信息？
  ├── 是否有敏感个人信息？
  ├── 收集的法律依据是什么？
  └── 是否获得用户明确同意？

□ 数据处理
  ├── 数据如何存储和加密？
  ├── 谁有权访问数据？
  └── 数据是否跨境传输？

□ 模型训练
  ├── 训练数据是否已脱敏？
  ├── 是否使用差分隐私？
  └── 模型是否可能泄露训练数据？

□ 用户权利
  ├── 用户如何行使删除权？
  ├── 用户如何获取数据副本？
  └── 是否有自动化决策的申诉渠道？
```

### 隐私保护的数据处理流程

```python
class PrivacyPreservingPipeline:
    def __init__(self):
        self.masker = DataMasker()
        self.dp = DifferentialPrivacy(epsilon=1.0)

    def process(self, raw_data: list) -> dict:
        """隐私保护的数据处理流程"""
        # 1. 数据脱敏
        masked_data = [self.masker.mask_pii(item) for item in raw_data]

        # 2. 数据最小化：只保留必要字段
        minimized_data = [self.minimize(item) for item in masked_data]

        # 3. 差分隐私处理（如用于统计分析）
        if self.needs_dp(minimized_data):
            minimized_data = self.apply_dp(minimized_data)

        return {
            "processed_data": minimized_data,
            "privacy_level": "differential_privacy",
            "epsilon": self.dp.epsilon,
        }
```

## 未来趋势

### 隐私增强技术（PETs）的演进

隐私增强技术正在从理论研究走向工业应用：

- **差分隐私标准化**：Apple、Google 等公司已在生产环境部署
- **联邦学习商业化**：医疗、金融等敏感行业开始采用
- **同态加密性能提升**：新算法使计算开销降低 10-100 倍

### 隐私计算基础设施

云服务商正在构建专用隐私计算平台：

- **可信执行环境（TEE）**：Intel SGX、AMD SEV 等硬件级隐私保护
- **隐私计算即服务**：AWS、Azure 提供托管隐私计算服务
- **跨机构数据协作**：在保护隐私前提下实现数据价值共享

### 自动化合规工具

- **隐私影响评估自动化**：AI 辅助识别数据处理中的隐私风险
- **数据血缘追踪**：自动记录数据从收集到删除的全生命周期
- **合规代码生成**：根据法规要求自动生成数据处理代码

### 数据主权与本地化

- **数据本地化要求**：越来越多国家要求数据存储在境内
- **跨境传输机制**：标准合同条款（SCC）、约束性企业规则（BCR）
- **个人数据钱包**：用户自主控制个人数据的存储和授权

### 大模型时代的隐私挑战

- **模型记忆问题**：大模型可能记住并泄露训练数据中的个人信息
- **机器遗忘（Machine Unlearning）**：如何从已训练模型中"删除"特定数据
- **合成数据隐私**：使用合成数据训练模型时的隐私边界

::: info
隐私保护不是"零和博弈"。通过合理的技术架构和流程设计，可以在保护用户隐私的同时充分发挥 AI 的价值。关键在于"Privacy by Design"（隐私设计）理念的贯彻。
:::

## 与其他概念的关系

- [联邦学习](/glossary/federated-learning) 是保护数据隐私的重要训练范式
- [AI 安全](/glossary/ai-safety) 包含数据隐私保护的维度
- [版权](/glossary/copyright) 与数据隐私在训练数据使用上有交叉
- [对齐](/glossary/alignment) 训练可以让模型更好地保护用户隐私
- [提示词注入](/glossary/prompt-injection) 可能导致用户输入中的隐私信息泄露

## 延伸阅读

- [联邦学习](/glossary/federated-learning) — 数据不出本地的训练方式
- [AI 安全](/glossary/ai-safety) — 数据隐私在安全框架中的位置
- [GDPR 官方文本](https://gdpr.eu/) — 欧盟通用数据保护条例
- [中国《个人信息保护法》](https://www.npc.gov.cn/npc/c30834/202108/7c9af12f51334a73b56d7938f99a788a.shtml) — 全文
- [Differential Privacy](https://www.microsoft.com/en-us/research/publication/differential-privacy/) — 微软差分隐私介绍
- [Membership Inference Attacks](https://arxiv.org/abs/1610.05820) — 成员推断攻击原始论文
