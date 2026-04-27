---
description: 创建新的文档页面
agent: build
---

在 docs/ 目录下创建新的文档页面。

如果用户未指定路径，询问：

1. 页面标题是什么？
2. 放在哪个目录？（/guide/、/api/、/examples/ 或根目录）
3. 是否需要侧边栏分组？

创建时自动生成：

- 标准 frontmatter（title、description、layout）
- 页面标题（# 标题）
- 基础内容结构
- 末尾添加"最后更新"注释

示例：`/vp:new-page` 或 `/vp:new-page docs/guide/deployment.md`
