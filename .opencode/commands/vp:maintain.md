---
description: 维护项目元信息和文档
agent: build
---

维护项目的元信息和各类文档。

如果用户未指定任务，询问：

1. 要维护哪些内容？
2. 是否有新的变更需要记录？

维护范围：

1. README.md
   - 项目描述是否最新
   - 快速开始是否准确
   - 特性列表是否完整
2. CHANGELOG.md
   - 记录最近的变更
   - 按版本分类
   - 遵循 Keep a Changelog 格式
3. CONTRIBUTING.md
   - 贡献指南是否清晰
   - 开发流程是否准确
4. OpenCode 配置
   - .opencode/ 目录结构是否合理
   - 自定义命令是否需要同步
5. AGENTS.md
   - 项目上下文是否最新
   - 编码规范是否需要更新
   - 项目结构描述是否准确
6. package.json
   - description、keywords
   - scripts 是否完整

执行步骤：

1. 分析当前状态
2. 对比最近的 git 变更
3. 提出更新建议
4. 用户确认后执行更新

示例：`/vp:maintain` 或 `/vp:maintain 更新 CHANGELOG`
