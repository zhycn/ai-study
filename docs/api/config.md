# 配置 API

VitePress 配置 API 参考。

## defineConfig

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  // 站点级配置
  title: '站点标题',
  description: '站点描述',
  base: '/path/',

  // 主题级配置
  themeConfig: {
    nav: [],
    sidebar: {},
    search: {}
  }
})
```

## 常用配置项

| 配置项        | 类型              | 说明           |
| ------------- | ----------------- | -------------- |
| `title`       | `string`          | 站点标题       |
| `description` | `string`          | 站点描述       |
| `base`        | `string`          | 部署基础路径   |
| `lang`        | `string`          | 站点语言       |
| `themeConfig` | `ThemeConfig`     | 主题配置       |
| `markdown`    | `MarkdownOptions` | Markdown 配置  |
| `head`        | `HeadConfig[]`    | 额外 head 标签 |
