---
description: 自动修复代码格式问题
agent: build
---

自动修复项目的 lint 和格式问题。

执行步骤：

1. `pnpm lint` - ESLint 自动修复
2. `pnpm format` - Prettier 格式化
3. 运行 `pnpm lint:check` 和 `pnpm format:check` 验证
4. 报告修复的文件数量和剩余问题

如果有无法自动修复的问题，列出详细信息。

示例：`/vp:fix`
