---
description: 构建生产版本并检查产物
agent: build
---

构建 VitePress 生产版本并验证输出。

执行步骤：

1. 运行 `pnpm docs:build`
2. 检查构建产物目录 docs/.vitepress/dist/
3. 验证关键文件是否存在（index.html、404.html、sitemap.xml、assets/）
4. 报告构建时间和产物大小

如果构建失败，分析错误原因并提供修复方案。

示例：`/vp:build`
