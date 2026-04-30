---
description: 维护词条目录结构
agent: build
---

维护 `docs/glossary/` 的目录结构、分类表和侧边栏配置。

如果用户未指定任务，询问：

1. 要执行什么操作？（重新分类、添加分类、移除词条、同步结构）

执行步骤：

1. 分析当前结构：
   - 读取 `docs/glossary/index.md` 的分类表
   - 读取 `docs/.vitepress/config.mts` 的侧边栏配置
   - 扫描 `docs/glossary/` 实际文件
2. 检查不一致：
   - index.md 中有但文件不存在的词条
   - 文件存在但 index.md 中未列出的词条
   - 侧边栏配置与 index.md 不一致的条目
3. 根据用户选择执行：
   - **重新分类**：调整词条所属分类
   - **添加分类**：在 index.md 和 config.mts 中新增分类组
   - **移除词条**：从 index.md 和 config.mts 中移除（保留文件）
   - **同步结构**：自动修复所有不一致

输出格式：

```
## 结构变更

### 新增分类
- 分类名: X 个词条

### 移动词条
- 词条A: 原分类 → 新分类

### 移除词条
- 词条B (从分类C)
```

用户确认后执行变更。

示例：`/ct:structure` 或 `/ct:structure sync`
