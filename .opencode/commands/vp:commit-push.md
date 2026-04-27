---
description: 提交更改并推送到远程仓库
agent: build
---

将当前更改提交并推送到 Git 远程仓库。

执行步骤：

1. `git status` 查看变更文件
2. `git diff` 查看具体改动
3. 询问用户提交信息（如未提供）
4. `git add .` 添加所有变更
5. `git commit -m "提交信息"` 提交
6. `git push` 推送到远程

如果当前分支没有跟踪远程分支，提示设置上游分支。

示例：`/vp:commit-push`
