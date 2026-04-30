---
title: 开源模型
description: Open Source Model，开放权重和架构的 AI 模型
---

# 开源模型

公开"配方"和"做法"的 AI 模型，任何人都能下载、查看、修改和使用。就像开源软件一样，开发者可以自由研究它是怎么工作的、根据自己的需求调整，甚至部署到自己的电脑上，不用依赖任何公司。

## 概述

**开源模型**（Open Source Model）是指模型权重、架构代码和训练方法对公众开放的 AI 模型。用户可以自由下载、修改、微调和部署这些模型，无需依赖第三方 API 服务。

开源模型的定义存在争议。严格意义上的"开源"应遵循 OSI（Open Source Initiative）定义，包括开放权重、训练数据、代码和完整的复现能力。但目前业界常说的"开源"多指**开放权重**（Open Weights），即仅公开模型参数，训练数据和完整代码可能不公开。

:::info 开源 vs 开放权重

- **开放权重**（Open Weights）：仅公开模型参数，如 Llama 系列
- **完全开源**（Fully Open Source）：公开权重、代码、训练数据和完整训练流程，如 OLMo、Falcon
- 本文中的"开源模型"主要指开放权重模型，涵盖当前主流实践
  :::

## 为什么重要

开源模型在 AI 生态中扮演着不可替代的角色：

- **自主可控**：数据不出域，满足金融、医疗、政务等对数据隐私要求严格的行业需求
- **可定制化**：可根据特定领域数据进行微调（Fine-Tuning），打造专属模型
- **成本优化**：避免 API 调用费用，大规模使用时成本显著低于闭源方案
- **透明可审查**：模型行为可审计，有助于发现偏见、安全漏洞和合规问题
- **社区生态**：活跃的开源社区推动工具链（vLLM、Ollama、LM Studio）和模型快速迭代
- **技术民主化**：降低 AI 使用门槛，使中小企业和开发者也能享受前沿 AI 能力

## 核心原理

### 开放权重的价值

开源模型的核心优势在于**可审查性**和**可定制性**：

- **可审查性**：权重公开使研究者能够分析模型内部表示、发现潜在偏见和安全漏洞
- **可定制性**：开发者可根据特定领域数据进行微调，无需从头训练
- **可复现性**：研究结果可被独立验证，推动科学进步

### 开源训练范式

开源模型通常遵循以下训练路径：

1. **数据收集与清洗**：从 Common Crawl、GitHub、Wikipedia 等公开来源构建训练语料
2. **分词器训练**（Tokenizer Training）：使用 SentencePiece 或 TikToken 构建词表
3. **自监督预训练**：在海量文本上训练下一个 Token 预测任务
4. **指令微调**：使用高质量指令数据（如 ShareGPT、Alpaca）训练模型遵循指令
5. **偏好对齐**：通过 DPO、ORPO 等方法使模型输出符合人类偏好

### 开源生态飞轮

```text
模型发布 → 社区微调 → 工具链完善 → 应用落地 → 反馈改进 → 新版本发布
```

开源模型的价值不仅在于权重本身，更在于围绕它形成的生态系统。

## 核心技术路线

### 模型架构

当前主流开源模型大多采用以下架构：

- **Decoder-only Transformer**：与 GPT 系列相同的架构，适合自回归生成
- **混合专家**（Mixture of Experts，MoE）：如 Mixtral、DeepSeek V3，实现"大参数、小计算"
- **RoPE 位置编码**（Rotary Positional Embedding）：支持长上下文和外推
- **SwiGLU 激活函数**：替代传统 ReLU，提升模型表达能力

### 训练范式

```text
预训练（Pre-training）→ 指令微调（SFT）→ 人类对齐（DPO/ORPO）→ 领域适配
```

1. **预训练**：在海量多语言、多领域文本上进行自监督学习
2. **指令微调**（Supervised Fine-Tuning，SFT）：使用高质量指令数据训练模型遵循指令
3. **人类对齐**：通过 DPO（Direct Preference Optimization）或 ORPO（Odds Ratio Preference Optimization）替代 RLHF，降低对齐成本
4. **领域适配**：针对特定领域（代码、医疗、法律）继续预训练或微调

### 开源训练框架

| 框架              | 特点                        | 适用场景     |
| ----------------- | --------------------------- | ------------ |
| **LLaMA-Factory** | 支持 100+ 模型，WebUI 界面  | 快速微调     |
| **Axolotl**       | 配置驱动，支持多种对齐方法  | 生产级训练   |
| **Unsloth**       | 优化显存，训练速度提升 2 倍 | 资源受限环境 |
| **DeepSpeed**     | 分布式训练，ZeRO 优化       | 大规模训练   |
| **Megatron-LM**   | NVIDIA 分布式训练框架       | 超大规模训练 |

## 主流开源模型

### 主流开源模型对比

| 模型系列        | 最大参数   | 上下文 | 协议                   | 生态成熟度 | 中文能力 |
| --------------- | ---------- | ------ | ---------------------- | ---------- | -------- |
| Llama 3.1       | 405B       | 128K   | 自定义（7 亿用户限制） | 最成熟     | 一般     |
| Qwen 2.5        | 72B        | 256K   | Apache 2.0             | 成熟       | 优秀     |
| DeepSeek V3     | 671B(MoE)  | 128K   | 自定义                 | 快速增长   | 优秀     |
| Mistral/Mixtral | 8x22B(MoE) | 128K   | Apache 2.0             | 成熟       | 较弱     |
| Gemma 2         | 27B        | 8K     | 自定义                 | 增长中     | 一般     |

### Llama 系列（Meta）

Meta 的 Llama 系列是开源 LLM 的标杆：

- **Llama 3.1**：8B/70B/405B 三尺寸，支持 128K 上下文
- **Llama 3.3**：70B 指令微调版，性能接近 GPT-4
- **Llama 4**（规划中）：多模态 + MoE 架构

:::tip Llama 生态
Llama 拥有最完善的开源生态：量化格式（GGUF）、推理框架（llama.cpp）、微调工具（LLaMA-Factory）、评测基准（LM Evaluation Harness）等工具链齐全。
:::

### Qwen 系列（阿里）

- **Qwen 2.5**：0.5B 到 72B 多尺寸，中文能力突出
- **Qwen 2.5-Coder**：代码能力专项优化
- **Qwen 2.5-Math**：数学推理能力增强
- **Qwen-VL**：多模态理解

### DeepSeek 系列（深度求索）

- **DeepSeek V3**：671B 参数 MoE 架构，每次激活 37B
- **DeepSeek R1**：推理模型，通过强化学习提升逻辑推理能力
- **DeepSeek-Coder**：代码生成和理解

### Mistral 系列（Mistral AI）

- **Mistral 7B**：高效小模型，性能超越 Llama 2 13B
- **Mixtral 8x7B/8x22B**：MoE 架构，多专家路由
- **Mistral Large**：旗舰模型

### 其他值得关注

- **OLMo**（Allen AI）：完全开源，公开训练数据和代码
- **Gemma**（Google）：基于 Gemini 技术的轻量开源版
- **Phi**（Microsoft）：小模型大能力，适合端侧部署
- **Yi**（零一万物）：中英双语能力强

## 开源协议

选择合适的开源协议对模型使用至关重要：

| 协议             | 商用              | 修改 | 分发 | 限制            |
| ---------------- | ----------------- | ---- | ---- | --------------- |
| **Apache 2.0**   | ✅                | ✅   | ✅   | 保留版权声明    |
| **MIT**          | ✅                | ✅   | ✅   | 最宽松          |
| **Llama 3 协议** | ✅（月活 < 7 亿） | ✅   | ✅   | 用户数限制      |
| **Qwen 协议**    | ✅                | ✅   | ✅   | 类似 Apache 2.0 |
| **CC BY-NC 4.0** | ❌                | ✅   | ✅   | 禁止商用        |
| **GPL 3.0**      | ✅                | ✅   | ✅   | 衍生作品需开源  |

:::warning 协议合规
使用开源模型前务必仔细阅读许可证条款。部分模型（如 Llama）对月活跃用户数有限制，部分模型（如 CC BY-NC）禁止商业用途。违规使用可能面临法律风险。
:::

## 工程实践

### 本地部署

```bash
# 使用 Ollama 快速部署
ollama run llama3.1:8b

# 使用 vLLM 高性能服务
vllm serve Qwen/Qwen2.5-7B-Instruct \
  --tensor-parallel-size 2 \
  --max-model-len 8192

# 使用 llama.cpp 量化推理
./llama-cli -m qwen2.5-7b.Q4_K_M.gguf -p "你好"
```

### 模型量化

量化是降低开源模型部署成本的关键技术：

| 量化格式 | 精度  | 显存占用（7B） | 质量损失 |
| -------- | ----- | -------------- | -------- |
| FP16     | 16 位 | 14 GB          | 无       |
| INT8     | 8 位  | 7 GB           | 极小     |
| Q4_K_M   | 4 位  | 4 GB           | 小       |
| Q2_K     | 2 位  | 2.5 GB         | 明显     |

### 微调实践

```yaml
# Axolotl 配置示例
base_model: Qwen/Qwen2.5-7B-Instruct
model_type: AutoModelForCausalLM
tokenizer_type: AutoTokenizer

load_in_8bit: true # 8 位加载节省显存
load_in_4bit: false

datasets:
  - path: data/instruction.json
    type: alpaca

adapter: lora # 使用 LoRA 高效微调
lora_r: 16
lora_alpha: 32
lora_dropout: 0.05
```

### 选型建议

```text
快速验证/个人使用 → 7B-14B 模型 + 消费级 GPU（RTX 4090）
生产环境/中等规模 → 70B 模型 + 多 GPU 服务器
大规模/企业级     → 闭源 API 或 405B 模型 + GPU 集群
端侧/边缘部署     → 1B-3B 模型 + INT4 量化
```

## 与其他概念的关系

- 与 [闭源模型](/glossary/proprietary-model) 对应，各有适用场景
- 基于 [Transformer](/glossary/transformer) 架构，是其开源实现
- 通过 [微调](/glossary/fine-tuning) 适配特定领域任务
- 可部署在自有 [GPU](/glossary/gpu) 或 CPU 上
- 是 [大语言模型](/glossary/llm) 生态的重要组成部分
- 多模态方向延伸出 [多模态模型](/glossary/multimodal-model)（如 LLaVA、Qwen-VL）

## 延伸阅读

- [闭源模型对比](/glossary/proprietary-model)
- [Transformer 架构](/glossary/transformer)
- [微调实践指南](/glossary/fine-tuning)
- [Llama 3 论文](https://arxiv.org/abs/2407.21783)
- [Hugging Face 开源模型库](https://huggingface.co/models)
- [Open LLM Leaderboard](https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard) — 开源模型排行榜
