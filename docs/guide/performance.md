# 性能优化指南

VitePress 已经很快了，但你还可以通过以下方式进一步优化。

## 图片优化

### 使用 WebP 格式

WebP 比 PNG/JPEG 小 25-35%，质量相当。

```md
![描述](/images/screenshots/example.webp)
```

### 懒加载

VitePress 默认启用图片懒加载：

```ts
markdown: {
  image: {
    lazyLoading: true
  }
}
```

### 指定尺寸

为图片指定宽高可以避免布局偏移：

```md
<img src="/images/example.png" width="800" height="600" />
```

## 构建优化

### 代码分割

大型组件可以使用动态导入：

```vue
<script setup>
import { defineAsyncComponent } from 'vue'

const HeavyComponent = defineAsyncComponent(() => import('./HeavyComponent.vue'))
</script>
```

### 减少全局组件

只在需要时注册组件，而不是全局注册。

### 使用静态数据

对于不需要变更的数据，使用 `.ts` 文件而不是 frontmatter。

## SEO 优化

### 预渲染

VitePress 默认生成静态 HTML，无需额外配置。

### Sitemap

已内置 sitemap 生成：

```ts
sitemap: {
  hostname: 'https://your-domain.com'
}
```

### 结构化数据

在 frontmatter 中添加 JSON-LD：

```yaml
---
head:
  - - script
    - type: application/ld+json
    - |
      {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "文章标题"
      }
---
```
