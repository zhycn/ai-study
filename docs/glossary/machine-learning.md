---
title: 机器学习
description: Machine Learning，让计算机从数据中自动学习的技术
---

# 机器学习

## 概述

**机器学习**（Machine Learning，ML）是人工智能的核心分支，研究如何让计算机系统从数据中自动学习模式和规律，从而在没有显式编程的情况下做出预测或决策。

用 Arthur Samuel 的经典定义来说：机器学习是"赋予计算机无需显式编程即可学习的能力"（Field of study that gives computers the ability to learn without being explicitly programmed）。

:::tip 提示
机器学习与传统编程的核心区别在于：传统编程是"规则 + 数据 → 答案"，而机器学习是"数据 + 答案 → 规则"。模型从历史数据中学习规律，然后应用于新数据。
:::

## 为什么重要

- **数据驱动决策**：从海量数据中提取有价值的模式和洞察，支撑科学决策
- **自动化**：替代人工完成重复性、规律性强的任务，如垃圾邮件过滤、信用评分
- **处理复杂问题**：对于规则难以明确定义的问题（如图像识别、语音识别），机器学习是有效的解决方案
- **持续进化**：模型可以随着新数据的到来不断更新和优化
- **AI 的基础**：现代 AI 的突破，包括深度学习和大语言模型，都建立在机器学习的基础之上

## 学习范式

### 监督学习（Supervised Learning）

从**标注数据**（Labeled Data）中学习输入到输出的映射关系。

| 任务类型 | 描述 | 常见算法 | 应用场景 |
|---------|------|---------|---------|
| **分类**（Classification） | 预测离散类别 | 逻辑回归、SVM、决策树、随机森林 | 垃圾邮件检测、疾病诊断 |
| **回归**（Regression） | 预测连续值 | 线性回归、岭回归、XGBoost | 房价预测、销量预测 |

**核心流程**：
1. 收集标注数据集 `(X, y)`
2. 选择模型和损失函数
3. 训练模型，最小化预测误差
4. 在测试集上评估泛化能力

### 无监督学习（Unsupervised Learning）

从**无标注数据**（Unlabeled Data）中发现隐藏的结构和模式。

| 任务类型 | 描述 | 常见算法 | 应用场景 |
|---------|------|---------|---------|
| **聚类**（Clustering） | 将数据分组 | K-Means、DBSCAN、层次聚类 | 用户分群、异常检测 |
| **降维**（Dimensionality Reduction） | 减少特征数量 | PCA、t-SNE、UMAP | 数据可视化、特征压缩 |
| **密度估计**（Density Estimation） | 估计数据分布 | 高斯混合模型 | 异常检测 |

### 半监督学习（Semi-supervised Learning）

结合少量标注数据和大量无标注数据进行学习，在标注成本高的场景下非常实用。

### 强化学习（Reinforcement Learning）

智能体（Agent）通过与环境交互，根据**奖励信号**（Reward Signal）学习最优策略。

- **核心概念**：状态（State）、动作（Action）、奖励（Reward）、策略（Policy）
- **经典算法**：Q-Learning、策略梯度（Policy Gradient）、PPO
- **应用场景**：游戏 AI（AlphaGo）、机器人控制、推荐系统

:::info 了解
强化学习与监督学习的区别：监督学习有明确的"正确答案"，而强化学习通过试错和奖励信号来学习，没有直接的监督信号。
:::

## 核心算法

### 经典算法

- **线性回归**（Linear Regression）：最简单的回归算法，假设输入和输出之间存在线性关系
- **逻辑回归**（Logistic Regression）：用于二分类问题，输出概率值
- **决策树**（Decision Tree）：基于树结构的分类和回归方法，可解释性强
- **随机森林**（Random Forest）：多棵决策树的集成，通过投票或平均提高准确性
- **支持向量机**（Support Vector Machine，SVM）：寻找最优超平面分隔不同类别
- **K 近邻**（K-Nearest Neighbors，KNN）：基于距离的惰性学习方法

### 集成学习（Ensemble Learning）

- **Bagging**：Bootstrap 抽样 + 并行训练，如随机森林
- **Boosting**：串行训练，每轮关注前一轮的错误样本，如 AdaBoost、GBDT、XGBoost、LightGBM
- **Stacking**：用多个基模型的预测作为新特征，训练元模型

### 特征工程（Feature Engineering）

- **特征提取**：从原始数据中提取有意义的特征
- **特征选择**：选择最相关的特征，去除冗余和噪声
- **特征转换**：标准化、归一化、独热编码等

## 主流框架与实现

### Python 生态

- **scikit-learn**：最流行的传统机器学习库，提供丰富的算法和工具
  ```python
  from sklearn.ensemble import RandomForestClassifier
  from sklearn.model_selection import train_test_split

  X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
  model = RandomForestClassifier(n_estimators=100)
  model.fit(X_train, y_train)
  accuracy = model.score(X_test, y_test)
  ```

- **XGBoost**：高效的梯度提升库，在结构化数据竞赛中表现优异
- **LightGBM**：Microsoft 开发的快速梯度提升框架，适合大规模数据
- **CatBoost**：Yandex 开发，原生支持类别特征

### 模型评估

- **分类指标**：准确率（Accuracy）、精确率（Precision）、召回率（Recall）、F1 分数、ROC-AUC
- **回归指标**：均方误差（MSE）、平均绝对误差（MAE）、R² 分数
- **交叉验证**（Cross-Validation）：K 折交叉验证评估模型稳定性

## 工程实践

### 机器学习项目流程

1. **问题定义**：明确业务目标，确定是分类、回归还是其他任务
2. **数据收集**：获取相关数据，确保数据质量和代表性
3. **探索性数据分析**（EDA）：理解数据分布、相关性和异常值
4. **数据预处理**：处理缺失值、异常值、类别不平衡
5. **特征工程**：构造、选择、转换特征
6. **模型训练**：选择合适的算法，训练模型
7. **模型评估**：使用交叉验证和独立测试集评估
8. **模型调优**：网格搜索、随机搜索、贝叶斯优化调参
9. **模型部署**：将模型集成到生产系统
10. **监控与维护**：监控模型性能，处理数据漂移

### 关键注意事项

:::warning 注意
- **数据泄露**（Data Leakage）：确保测试集信息不会泄露到训练过程中
- **类别不平衡**（Class Imbalance）：使用过采样、欠采样或调整类别权重
- **过拟合与欠拟合**：通过正则化、交叉验证、早停等策略平衡
- **基线模型**：始终从简单模型开始，建立性能基线
:::

### MLOps 最佳实践

- **版本控制**：使用 DVC 等工具管理数据和模型版本
- **实验追踪**：使用 MLflow、Weights & Biases 记录实验
- **自动化流水线**：构建可复现的训练和部署流水线
- **模型监控**：持续监控模型性能，检测数据漂移和概念漂移

## 与其他概念的关系

- 机器学习是 [AI](/glossary/ai) 的核心实现方法
- [深度学习](/glossary/deep-learning) 是机器学习的一个子集，使用深层神经网络
- [神经网络](/glossary/neural-network) 是机器学习的重要算法族
- [强化学习](/glossary/reinforcement-learning) 是机器学习的另一重要范式
- [迁移学习](/glossary/transfer-learning) 利用已有知识加速新任务学习
- [联邦学习](/glossary/federated-learning) 在保护隐私的前提下进行分布式机器学习

## 延伸阅读

- [深度学习](/glossary/deep-learning) — 了解机器学习的深层神经网络方法
- [神经网络](/glossary/neural-network) — 了解机器学习的基本算法单元
- [强化学习](/glossary/reinforcement-learning) — 了解基于奖励的学习范式
- [迁移学习](/glossary/transfer-learning) — 了解知识迁移的方法
- [Pattern Recognition and Machine Learning](https://www.microsoft.com/en-us/research/people/cmbishop/prml-book/) — Christopher Bishop 经典教材
- [Hands-On Machine Learning](https://github.com/ageron/handson-ml3) — Aurélien Géron 实战指南
- [scikit-learn 官方文档](https://scikit-learn.org/) — 机器学习算法实现
