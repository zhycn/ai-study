# 多版本文档

VitePress 支持通过目录结构管理多版本文档。

## 目录结构

```
docs/
├── guide/              # 当前版本 (latest)
├── v1/                 # v1.x 文档
│   ├── guide/
│   └── api/
├── v2/                 # v2.x 文档
│   ├── guide/
│   └── api/
└── index.md
```

## 配置路由重写

```ts
export default defineConfig({
  rewrites: {
    'v1/:rest*': 'v1/:rest*',
    'v2/:rest*': 'v2/:rest*'
  },
  themeConfig: {
    nav: [
      { text: '最新', link: '/guide/getting-started' },
      {
        text: '历史版本',
        items: [
          { text: 'v1.x', link: '/v1/guide/getting-started' },
          { text: 'v2.x', link: '/v2/guide/getting-started' }
        ]
      }
    ]
  }
})
```

## 版本选择器组件

在 `theme/components/VersionSelect.vue` 中创建版本选择器：

```vue
<template>
  <select @change="navigate">
    <option value="/guide/">最新</option>
    <option value="/v1/guide/">v1.x</option>
    <option value="/v2/guide/">v2.x</option>
  </select>
</template>
```

## 部署注意事项

- 每个版本独立构建和部署
- 使用子目录区分版本
- 确保 `base` 配置正确
