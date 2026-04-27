---
description: 检查部署配置并指导部署
agent: build
---

检查并配置 VitePress 的部署设置。

执行步骤：

1. 检查 .github/workflows/deploy.yml 是否存在
2. 检查 config.mts 中的 base 配置是否正确
3. 检查 sitemap.hostname 是否设置
4. 验证 GitHub Pages 配置

支持的部署平台：

- GitHub Pages（已配置）
- Vercel
- Netlify
- Cloudflare Pages

如果未配置，询问目标平台并生成相应配置。

示例：`/vp:deploy`
