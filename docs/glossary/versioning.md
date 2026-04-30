---
title: 版本管理
description: Versioning，模型和提示词的版本控制
---

# 版本管理

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

## 版本类型

### 模型版本管理

```python
# 模型版本标识
MODEL_VERSIONS = {
    "gpt-4": {
        "versions": ["gpt-4-0613", "gpt-4-1106-preview", "gpt-4-0125-preview"],
        "latest": "gpt-4-0125-preview",
    },
    "claude-3": {
        "versions": ["claude-3-haiku-20240307", "claude-3-sonnet-20240229", "claude-3-opus-20240229"],
        "latest": "claude-3-opus-20240229",
    },
}

# 模型版本锁定
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

### 提示词版本管理

```python
# 提示词版本控制
class PromptVersionManager:
    """提示词版本管理器"""

    def __init__(self, storage):
        self.storage = storage  # Git、数据库等

    def create_version(self, name, template, change_log):
        """创建新版本"""
        version = {
            "name": name,
            "template": template,
            "version": self._next_version(name),
            "created_at": datetime.now(),
            "change_log": change_log,
            "author": get_current_user(),
        }
        self.storage.save(version)
        return version

    def get_version(self, name, version=None):
        """获取指定版本"""
        if version:
            return self.storage.get(f"{name}:{version}")
        return self.storage.get(f"{name}:latest")

    def compare_versions(self, name, v1, v2):
        """比较两个版本的差异"""
        prompt_v1 = self.get_version(name, v1)
        prompt_v2 = self.get_version(name, v2)

        return {
            "v1": prompt_v1["template"],
            "v2": prompt_v2["template"],
            "diff": diff(prompt_v1["template"], prompt_v2["template"]),
        }

    def _next_version(self, name):
        """生成下一个版本号"""
        latest = self.storage.get(f"{name}:latest")
        if not latest:
            return "1.0.0"
        return bump_version(latest["version"])
```

提示词版本存储在 Git 中：

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

### 配置版本管理

```python
# 配置版本化
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
            "temperature": 0.5,  # 降低温度，更稳定的输出
            "max_tokens": 500,
            "system_prompt": "customer-support:v1.1.0",
        },
    },
}
```

### 数据集版本管理

使用 DVC（Data Version Control）管理数据集版本：

```bash
# 初始化 DVC
dvc init

# 追踪数据集
dvc add data/training-set.json
dvc add data/evaluation-set.json

# 提交到 Git
git add data/training-set.json.dvc data/evaluation-set.json.dvc
git commit -m "Add dataset v1.0.0"

# 切换到特定版本
git checkout v1.0.0
dvc checkout
```

## 语义化版本

AI 应用推荐使用语义化版本（Semantic Versioning）：

```
主版本号.次版本号.修订号
  MAJOR     MINOR    PATCH

MAJOR: 不兼容的重大变更（如更换模型架构）
MINOR: 向后兼容的功能新增（如新增提示词模板）
PATCH: 向后兼容的问题修复（如修复提示词错误）
```

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

| 工具                 | 用途                 | 特点                    |
| -------------------- | -------------------- | ----------------------- |
| **Git**              | 代码和配置版本控制   | 行业标准，生态完善      |
| **DVC**              | 数据集版本控制       | 与 Git 集成，支持大文件 |
| **MLflow**           | 机器学习生命周期管理 | 实验追踪、模型注册      |
| **LangFuse**         | 提示词版本管理       | 开源 LLM 可观测性平台   |
| **PromptLayer**      | 提示词版本与追踪     | 商业平台，集成丰富      |
| **Weights & Biases** | 实验管理与模型版本   | ML 团队常用             |

## 工程实践

### 环境隔离

```python
# 环境配置
ENVIRONMENTS = {
    "development": {
        "model": "gpt-4o-mini",
        "temperature": 0.9,  # 开发环境允许更多创造性
        "base_url": "https://api.openai.com/v1",
    },
    "staging": {
        "model": "gpt-4o",
        "temperature": 0.7,
        "base_url": "https://api.openai.com/v1",
    },
    "production": {
        "model": "gpt-4o",
        "temperature": 0.5,  # 生产环境更保守
        "base_url": "https://api.openai.com/v1",
    },
}

def get_config(environment):
    """获取环境配置"""
    return ENVIRONMENTS.get(environment, ENVIRONMENTS["development"])
```

### A/B 测试

```python
class ABTestManager:
    """A/B 测试管理器"""

    def __init__(self):
        self.experiments = {}

    def create_experiment(self, name, variants, traffic_split):
        """创建 A/B 测试实验"""
        self.experiments[name] = {
            "variants": variants,
            "traffic_split": traffic_split,  # 如 {"A": 0.5, "B": 0.5}
            "metrics": [],
        }

    def get_variant(self, experiment_name, user_id):
        """根据用户 ID 分配变体"""
        experiment = self.experiments[experiment_name]
        hash_value = hash(user_id) % 100

        cumulative = 0
        for variant, weight in experiment["traffic_split"].items():
            cumulative += weight * 100
            if hash_value < cumulative:
                return variant

    def record_metric(self, experiment_name, user_id, metric_name, value):
        """记录指标"""
        # 实现指标记录逻辑
        pass
```

### 变更审批流程

```python
class VersionChangeRequest:
    """版本变更请求"""

    def __init__(self, component, from_version, to_version, reason):
        self.component = component
        self.from_version = from_version
        self.to_version = to_version
        self.reason = reason
        self.status = "pending"  # pending, approved, rejected, deployed
        self.approver = None
        self.evaluation_results = None

    def submit_for_review(self):
        self.status = "pending"
        notify_reviewers(self)

    def approve(self, approver):
        self.status = "approved"
        self.approver = approver

    def deploy(self):
        if self.status != "approved":
            raise ValueError("变更未获批准")
        self.status = "deployed"
        deploy_version(self.component, self.to_version)
```

::: warning
生产环境的版本变更应遵循变更管理流程：提交变更请求 → 评估影响 → 审批 → 灰度发布 → 全量上线。避免直接修改生产配置。
:::

### 回滚策略

```python
class RollbackManager:
    """回滚管理器"""

    def __init__(self, version_store):
        self.version_store = version_store
        self.rollback_history = []

    def rollback(self, component, target_version=None):
        """回滚到指定版本"""
        current = self.version_store.get_current_version(component)

        if target_version is None:
            # 回滚到上一个版本
            target_version = self.version_store.get_previous_version(component)

        self.version_store.set_version(component, target_version)

        self.rollback_history.append({
            "component": component,
            "from": current,
            "to": target_version,
            "at": datetime.now(),
        })

        notify_team(f"已回滚 {component} 到 {target_version}")
```

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
