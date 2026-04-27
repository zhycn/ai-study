---
description: 启动开发服务器并预览
agent: build
---

启动 VitePress 开发服务器。

执行步骤：

1. 检查 node_modules 是否存在，不存在则运行 `pnpm install`
2. 执行 `pnpm docs:dev`
3. 提示用户访问 http://localhost:5173
4. 询问是否需要自动打开浏览器

如果构建失败，分析错误并给出修复建议。

示例：`/vp:dev`
