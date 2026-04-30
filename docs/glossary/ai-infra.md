---
title: AI Infra
description: AI 基础设施，支撑 AI 模型训练、部署和运维的技术栈
---

# AI Infra

就是让 AI 能跑起来的"地基"。从训练大模型的 GPU 集群，到部署模型的推理服务，再到监控模型性能的工具链，AI Infra 涵盖了 AI 项目从实验到上线全流程需要的所有基础设施。没有好的 AI Infra，再厉害的模型也只能停留在笔记本上。

## 概述

**AI Infra**（AI Infrastructure，AI 基础设施）是指支撑 AI 模型全生命周期管理的技术栈和工具链，涵盖**数据处理、模型训练、模型部署、监控运维**等各个环节。

AI Infra 的核心目标是让 AI 团队能够高效、可靠、规模化地将模型从实验环境推向生产环境。

```text
AI Infra = 计算资源 + 数据平台 + 训练框架 + 部署服务 + 监控运维 + MLOps
```

:::tip 提示
AI Infra 不是单一工具，而是一个生态系统。选择合适的 AI Infra 方案需要考虑团队规模、技术栈、预算和长期维护成本。
:::

## 为什么需要

- **规模化训练**：大模型需要分布式计算集群，手动管理不可行
- **工程效率**：自动化流水线减少重复工作，加速迭代
- **可复现性**：记录实验配置和数据版本，确保结果可复现
- **生产可靠性**：高可用部署、自动扩缩容、故障恢复
- **成本控制**：优化资源利用率，避免 GPU 闲置浪费
- **合规与安全**：数据治理、模型审计、访问控制

## 核心原理

### AI 基础设施架构

完整的 AI Infra 包含以下层次：

```text
┌─────────────────────────────────────────────────────┐
│                  应用层                              │  ← AI 应用、API、Dashboard
├─────────────────────────────────────────────────────┤
│                  服务层                              │  ← 模型服务、特征服务、数据服务
│           (Model Serving, Feature Store)             │
├─────────────────────────────────────────────────────┤
│                  平台层                              │  ← 训练平台、实验管理、流水线
│         (Training Platform, Experiment Tracking)     │
├─────────────────────────────────────────────────────┤
│                  数据层                              │  ← 数据湖、特征库、向量数据库
│         (Data Lake, Feature Store, Vector DB)        │
├─────────────────────────────────────────────────────┤
│                  计算层                              │  ← GPU 集群、Kubernetes、调度器
│         (GPU Cluster, K8s, Scheduler)                │
├─────────────────────────────────────────────────────┤
│                  基础设施层                           │  ← 云服务器、网络、存储
│         (Cloud, Network, Storage)                    │
└─────────────────────────────────────────────────────┘
```

### 关键组件

**1. 计算资源管理**

- **GPU 集群编排**：Kubernetes + GPU Operator 管理 GPU 资源
- **任务调度**：Slurm、KubeFlow、Volcano 等调度训练任务
- **弹性扩缩容**：根据负载自动调整计算资源
- **多租户隔离**：不同团队共享集群，资源隔离

**2. 数据管理**

- **数据版本控制**（Data Versioning）：DVC、LakeFS 管理数据集版本
- **特征存储**（Feature Store）：Feast、Tecton 管理特征工程
- **数据流水线**：Airflow、Prefect 自动化数据处理
- **数据质量监控**：Great Expectations、Deequ 验证数据质量

**3. 实验管理**

- **实验追踪**（Experiment Tracking）：MLflow、Weights & Biases 记录实验
- **超参优化**（Hyperparameter Optimization）：Optuna、Ray Tune 自动调参
- **模型注册**（Model Registry）：管理模型版本和生命周期
- **模型评估**：自动化评估流水线，对比模型性能

**4. 模型部署**

- **模型服务**（Model Serving）：vLLM、Triton、BentoML 提供推理服务
- **API 网关**：管理请求路由、限流、认证
- **A/B 测试**：灰度发布，对比新旧模型效果
- **边缘部署**：将模型部署到边缘设备

**5. 监控运维**

- **性能监控**：Prometheus + Grafana 监控资源使用
- **模型监控**：Evidently、WhyLabs 监控模型漂移
- **日志管理**：ELK Stack、Loki 集中管理日志
- **告警系统**：根据阈值自动告警

## 主流方案对比

### 训练平台

| 方案                 | 类型   | 特点                           | 适用场景             |
| -------------------- | ------ | ------------------------------ | -------------------- |
| **KubeFlow**         | 开源   | 基于 K8s，生态完善，学习曲线陡 | 企业级训练平台       |
| **Ray**              | 开源   | 分布式计算框架，灵活性强       | 分布式训练、超参搜索 |
| **Slurm**            | 开源   | HPC 标准，适合大规模集群       | 超算中心、科研机构   |
| **AWS SageMaker**    | 云服务 | 全托管，功能全面，成本高       | 企业快速上手         |
| **Google Vertex AI** | 云服务 | 与 GCP 深度集成，AutoML 强     | Google 生态用户      |
| **Azure ML**         | 云服务 | 与 Azure 生态集成，企业友好    | Microsoft 生态用户   |

### 模型服务

| 方案                        | 特点                                 | 适用场景            |
| --------------------------- | ------------------------------------ | ------------------- |
| **vLLM**                    | 高吞吐 LLM 推理，PagedAttention 优化 | 大语言模型服务      |
| **Triton Inference Server** | NVIDIA 出品，支持多框架，GPU 优化    | 通用模型服务        |
| **BentoML**                 | 开发者友好，支持多模型编排           | 应用级模型服务      |
| **Seldon Core**             | K8s 原生，企业级功能完善             | K8s 环境部署        |
| **TorchServe**              | PyTorch 官方，简单易用               | PyTorch 模型部署    |
| **TensorFlow Serving**      | TF 官方，生产级稳定                  | TensorFlow 模型部署 |

### MLOps 平台

| 方案                   | 核心功能                     | 特点                  |
| ---------------------- | ---------------------------- | --------------------- |
| **MLflow**             | 实验追踪、模型注册、项目打包 | 轻量级，生态广泛      |
| **Weights & Biases**   | 实验追踪、可视化、协作       | 界面友好，适合团队    |
| **Kubeflow Pipelines** | 流水线编排、实验管理         | K8s 原生，适合大规模  |
| **DVC**                | 数据版本控制、流水线         | 类 Git 体验，数据管理 |
| **Feast**              | 特征存储                     | 统一特征管理          |
| **Evidently AI**       | 模型监控、漂移检测           | 开源，可视化好        |

### 计算资源方案

| 方案              | 类型 | 优势                   | 劣势                 |
| ----------------- | ---- | ---------------------- | -------------------- |
| **自建 GPU 集群** | 本地 | 长期成本低，数据可控   | 初始投入大，运维复杂 |
| **公有云 GPU**    | 云端 | 弹性伸缩，按需付费     | 长期使用成本高       |
| **混合云**        | 混合 | 灵活平衡成本和性能     | 架构复杂             |
| **GPU 云服务**    | 云端 | 专为 AI 优化，性价比高 | 选择较少             |
| **Spot 实例**     | 云端 | 成本降低 60-90%        | 可能被中断           |

:::info 选型建议
初创团队推荐云服务（SageMaker/Vertex AI）快速验证。成熟团队建议自建 K8s + KubeFlow 或 Ray 集群，长期成本更低。LLM 服务优先选择 vLLM，通用推理选择 Triton。
:::

## 选型建议

### 按团队规模选型

| 团队规模 | 推荐方案                | 理由                   |
| -------- | ----------------------- | ---------------------- |
| 1-3 人   | 云服务 + MLflow         | 最小运维负担，快速上手 |
| 3-10 人  | K8s + KubeFlow + MLflow | 平衡灵活性和复杂度     |
| 10-50 人 | 自建集群 + 完整 MLOps   | 需要标准化流程         |
| 50+ 人   | 自研平台 + 开源组件     | 需要定制化能力         |

### 按业务场景选型

| 场景       | 核心需求               | 推荐技术栈                       |
| ---------- | ---------------------- | -------------------------------- |
| 大模型训练 | 大规模 GPU、分布式训练 | K8s + Slurm + DeepSpeed/Megatron |
| 推荐系统   | 低延迟推理、特征服务   | Triton + Feast + Redis           |
| 计算机视觉 | GPU 推理、批处理       | Triton + K8s + S3                |
| NLP 服务   | 高吞吐 LLM 推理        | vLLM + K8s + API Gateway         |
| 实时决策   | 毫秒级延迟、高可用     | 边缘部署 + 负载均衡              |

## 工程实践

### GPU 集群管理

```yaml
# Kubernetes GPU 节点配置示例
apiVersion: v1
kind: Node
metadata:
  labels:
    accelerator: nvidia-tesla-v100
    nvidia.com/gpu.present: 'true'
spec:
  taints:
    - key: nvidia.com/gpu
      value: 'true'
      effect: NoSchedule
---
# GPU 训练任务
apiVersion: batch/v1
kind: Job
metadata:
  name: training-job
spec:
  template:
    spec:
      containers:
        - name: trainer
          image: pytorch/pytorch:2.0.1-cuda11.7-cudnn8-runtime
          command: ['python', 'train.py']
          resources:
            limits:
              nvidia.com/gpu: 4 # 使用 4 张 GPU
          env:
            - name: NCCL_DEBUG
              value: INFO
      restartPolicy: Never
```

### 实验追踪

```python
import mlflow
import mlflow.pytorch
from sklearn.metrics import accuracy_score

# 1. 设置实验
mlflow.set_experiment("image_classification")

# 2. 开始运行
with mlflow.start_run():
    # 记录参数
    mlflow.log_param("learning_rate", 0.001)
    mlflow.log_param("batch_size", 32)
    mlflow.log_param("epochs", 100)

    # 训练模型
    model = train_model()

    # 记录指标
    mlflow.log_metric("train_loss", train_loss)
    mlflow.log_metric("val_accuracy", val_accuracy)

    # 记录模型
    mlflow.pytorch.log_model(model, "model")

    # 记录 artifacts
    mlflow.log_artifact("confusion_matrix.png")
```

### 模型服务部署

```python
# 使用 vLLM 部署 LLM 服务
from vllm import LLM, SamplingParams

# 1. 初始化模型
llm = LLM(
    model="meta-llama/Llama-3-8B-Instruct",
    tensor_parallel_size=4,  # 使用 4 张 GPU
    gpu_memory_utilization=0.9,
    max_num_seqs=256
)

# 2. 配置采样参数
sampling_params = SamplingParams(
    temperature=0.7,
    top_p=0.9,
    max_tokens=512
)

# 3. 批量推理
prompts = ["你好，请介绍一下自己", "什么是机器学习？"]
outputs = llm.generate(prompts, sampling_params)

# 4. 输出结果
for output in outputs:
    print(output.outputs[0].text)
```

### 模型监控

```python
from evidently.report import Report
from evidently.metric_preset import DataDriftPreset, TargetDriftPreset
import pandas as pd

# 1. 准备数据
reference_data = pd.read_csv('reference.csv')  # 训练数据
current_data = pd.read_csv('current.csv')      # 当前生产数据

# 2. 生成监控报告
report = Report(metrics=[
    DataDriftPreset(),
    TargetDriftPreset()
])

report.run(reference_data=reference_data, current_data=current_data)

# 3. 保存报告
report.save_html('drift_report.html')

# 4. 检查是否有漂移
drift_detected = report.as_dict()['metrics'][0]['result']['dataset_drift']
if drift_detected:
    print("警告：检测到数据漂移，需要重新训练模型！")
```

### CI/CD for ML

```yaml
# GitHub Actions ML CI/CD 示例
name: ML Pipeline
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run data validation
        run: python validate_data.py

      - name: Run unit tests
        run: pytest tests/

      - name: Train model
        run: python train.py --config configs/prod.yaml

      - name: Evaluate model
        run: python evaluate.py --threshold 0.85

      - name: Register model
        if: success()
        run: mlflow models register --model-uri runs:/...

      - name: Deploy to staging
        if: success()
        run: kubectl apply -f k8s/staging/
```

## 与其他概念的关系

- AI Infra 为 [大语言模型](/glossary/llm) 的训练和部署提供基础设施
- 模型服务依赖 [GPU](/glossary/gpu)、[TPU](/glossary/tpu) 等计算资源
- 模型部署需要考虑 [延迟优化](/glossary/latency-optimization) 和 [成本优化](/glossary/cost-optimization)
- 向量数据库是 AI Infra 中 [RAG](/glossary/rag) 架构的关键组件
- 模型监控涉及 [可观测性](/glossary/observability) 和 [模型评估](/glossary/model-evaluation)
- [流式输出](/glossary/streaming) 和 [批处理](/glossary/batch-processing) 是 AI Infra 的两种服务模式

## 延伸阅读

- [KubeFlow 官方文档](https://www.kubeflow.org/docs/)
- [MLflow 官方文档](https://mlflow.org/docs/latest/index.html)
- [vLLM 项目](https://github.com/vllm-project/vllm)
- [NVIDIA Triton 文档](https://docs.nvidia.com/deeplearning/triton-inference-server/user-guide/docs/)
- [Ray 官方文档](https://docs.ray.io/en/latest/)
- [MLOps 成熟度模型](https://learn.microsoft.com/en-us/azure/architecture/example-end-to-end-mlops/mlops-maturity-model)
- [大语言模型](/glossary/llm)
- [GPU](/glossary/gpu)
- [可观测性](/glossary/observability)
