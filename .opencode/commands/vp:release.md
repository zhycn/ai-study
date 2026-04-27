---
description: 创建新版本并发布 release
agent: build
---

创建项目的新版本。

执行步骤：

1. 检查当前版本号（package.json）
2. 询问版本号类型（patch、minor、major）
3. 更新 package.json 版本号
4. 更新 CHANGELOG.md
5. 创建 git tag
6. 提示用户执行 git push --tags

如果 CHANGELOG.md 不存在，先创建。

示例：`/vp:release`
