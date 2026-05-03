---
title: 版本管理 (Versioning)
description: Versioning，模型和提示词的版本控制
---

# 版本管理 (Versioning)

给 AI 应用的各个部分"打标签、做记录"——用的哪个模型版本、提示词改过几次、配置怎么调的。出了问题时能追溯"之前还好好的，改了什么之后就不行了"。

## 概述

版本管理（Versioning）是指对 AI 应用中的模型版本、提示词版本、配置版本、数据集版本等进行系统化管理和追踪的工程实践。

与传统软件的版本管理不同，AI 应用的版本管理面临独特挑战：

- **模型版本**：LLM 提供商频繁更新模型，同一模型名称可能对应不同底层版本
- **提示词版本**：提示词的微小改动可能显著影响输出质量
- **非确定性输出**：相同输入和配置可能产生不同输出，需要额外的可复现性管理
- **配置复杂性**：温度、最大 Token、系统提示等参数组合形成巨大的配置空间

::: tip
AI 应用的版本管理 = 代码版本管理（Git）+ 模型版本管理 + 提示词版本管理 + 配置版本管理 + 数据集版本管理。五者缺一不可。
:::

## 为什么重要

- **可回溯**：当生产环境出现问题时，能够快速定位是哪个版本引入的变更
- **可回滚**：发现问题后可以快速回滚到稳定版本，最小化影响范围
- **实验管理**：支持 A/B 测试、灰度发布等实验，对比不同版本的效果
- **团队协作**：多人协作修改提示词和配置时避免冲突和覆盖
- **合规审计**：满足监管要求，记录所有变更的历史
- **知识沉淀**：版本历史是团队的知识库，记录每次变更的原因和效果

## 实施步骤

### 第一步：建立版本管理规范

采用语义化版本（Semantic Versioning）：

```
主版本号.次版本号.修订号
  MAJOR     MINOR    PATCH

MAJOR: 不兼容的重大变更（如更换模型架构）
MINOR: 向后兼容的功能新增（如新增提示词模板）
PATCH: 向后兼容的问题修复（如修复提示词错误）
```

### 第二步：模型版本锁定

```python
class ModelVersionLock:
    """锁定模型版本，避免自动升级导致的意外变更"""

    def __init__(self, model_name, pinned_version):
        self.model_name = model_name
        self.pinned_version = pinned_version

    def get_model(self):
        return self.pinned_version


# 使用
gpt4 = ModelVersionLock("gpt-4", "gpt-4-0125-preview")
model = gpt4.get_model()  # 总是返回固定版本
```

### 第三步：提示词版本管理

将提示词存储在 Git 中，使用 YAML 格式：

```yaml
# prompts/customer-support/v1.0.0.yaml
name: customer-support
version: 1.0.0
created: 2024-01-15
author: alice
change_log: 初始版本
template: |
  你是客服助手，负责回答用户问题。
  请保持友好、专业的态度。
  用户问题：{question}
```

### 第四步：配置版本管理

```python
MODEL_CONFIGS = {
    "customer-support": {
        "v1.0.0": {
            "model": "gpt-4o-mini",
            "temperature": 0.7,
            "max_tokens": 500,
            "system_prompt": "customer-support:v1.0.0",
        },
        "v1.1.0": {
            "model": "gpt-4o-mini",
            "temperature": 0.5,
            "max_tokens": 500,
            "system_prompt": "customer-support:v1.1.0",
        },
    },
}
```

### 第五步：数据集版本管理

使用 DVC（Data Version Control）管理数据集版本：

```bash
dvc init
dvc add data/training-set.json
git add data/training-set.json.dvc
git commit -m "Add dataset v1.0.0"
```

### 第六步：建立变更审批流程

生产环境的版本变更应遵循：提交变更请求 → 评估影响 → 审批 → 灰度发布 → 全量上线。

## 最佳实践

- **版本锁定**：生产环境锁定模型版本，避免自动升级导致意外变更
- **提示词即代码**：将提示词存储在 Git 中，享受代码版本管理的所有好处
- **环境隔离**：开发、预发、生产环境使用不同的配置
- **A/B 测试**：新版本先做小流量测试，验证效果后再全量上线
- **回滚准备**：确保可以随时回滚到上一个稳定版本
- **变更日志**：详细记录每次变更的原因和效果

## 常见问题与避坑

### Q1：为什么需要版本管理？

AI 应用的输出受多个因素影响：模型版本、提示词、配置参数。没有版本管理，当生产环境出现问题时，无法追溯"之前还好好的，改了什么之后就不行了"。

### Q2：提示词版本如何与代码版本关联？

- 将提示词存储在代码仓库中（如 prompts/ 目录）
- 在代码中引用提示词版本号而非最新
- 每次代码发布时，记录对应的提示词版本

### Q3：模型提供商自动更新模型怎么办？

- 使用具体版本号而非模型别名（如 gpt-4-0125-preview 而非 gpt-4）
- 定期评估新模型版本，主动升级而非被动接受
- 在 [可观测性](/glossary/observability) 中按模型版本分组监控

### Q4：版本变更后缓存如何处理？

模型或提示词版本变更时，旧缓存可能返回过时结果：

- 缓存键中包含版本号
- 版本变更时按模式清除相关缓存
- 设置合理的 TTL 避免缓存长期不更新

### Q5：如何管理多环境配置？

```python
ENVIRONMENTS = {
    "development": {"model": "gpt-4o-mini", "temperature": 0.9},
    "staging": {"model": "gpt-4o", "temperature": 0.7},
    "production": {"model": "gpt-4o", "temperature": 0.5},
}
```

使用环境变量或配置中心管理，避免硬编码。

## 语义化版本参考

版本号递增规则：

```python
def bump_version(version, bump_type):
    """递增版本号"""
    major, minor, patch = map(int, version.split("."))

    if bump_type == "major":
        return f"{major + 1}.0.0"
    elif bump_type == "minor":
        return f"{major}.{minor + 1}.0"
    elif bump_type == "patch":
        return f"{major}.{minor}.{patch + 1}"
```

## 工具生态

| 工具                                      | 用途                 | 特点                    |
| ----------------------------------------- | -------------------- | ----------------------- |
| **Git**                                   | 代码和配置版本控制   | 行业标准，生态完善      |
| **DVC**                                   | 数据集版本控制       | 与 Git 集成，支持大文件 |
| **[MLflow](https://mlflow.org/)**         | 机器学习生命周期管理 | 实验追踪、模型注册      |
| **LangFuse**                              | 提示词版本管理       | 开源 LLM 可观测性平台   |
| **PromptLayer**                           | 提示词版本与追踪     | 商业平台，集成丰富      |
| **[Weights & Biases](https://wandb.ai/)** | 实验管理与模型版本   | ML 团队常用             |

## 与其他概念的关系

- 版本管理与 [可观测性](/glossary/observability) 结合，实现按版本维度的性能对比
- [模型评估](/glossary/model-evaluation) 结果按版本存储，支持版本间效果对比
- 提示词版本变更需要更新 [缓存](/glossary/caching)，避免旧版本缓存污染
- 版本管理是 A/B 测试的基础，支持不同版本的流量分配
- [模型评估](/glossary/model-evaluation) 确保版本变更不会导致性能回退
- 版本历史为 [成本优化](/glossary/cost-optimization) 提供决策依据

## 延伸阅读

- [模型评估](/glossary/model-evaluation) — 版本变更后的效果验证
- [可观测性](/glossary/observability) — 按版本维度的性能监控
- [缓存](/glossary/caching) — 版本变更时的缓存失效策略
- [成本优化](/glossary/cost-optimization) — 版本选择与成本的关系
- [Semantic Versioning 规范](https://semver.org/) — 语义化版本标准
- [DVC 文档](https://dvc.org/doc) — 数据集版本控制工具
- [MLflow 文档](https://mlflow.org/docs/latest/index.html) — 机器学习生命周期管理
