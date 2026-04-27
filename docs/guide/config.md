# 配置指南

VitePress 提供了丰富的配置选项。

## 站点配置

编辑 `docs/.vitepress/config.mts` 修改站点元信息：

```ts
export default defineConfig({
  lang: 'zh-CN',
  title: 'VitePress Starter',
  description: '开箱即用的 VitePress 文档站点'
})
```

## 主题配置

### 导航栏

```ts
themeConfig: {
  nav: [
    { text: '首页', link: '/' },
    { text: '指南', link: '/guide/getting-started' },
    { text: 'API', link: '/api/config' },
    { text: '示例', link: '/examples/markdown' },
    { text: 'GitHub', link: 'https://github.com/zhycn/VitePress-starter' }
  ]
}
```

### 侧边栏

```ts
themeConfig: {
  sidebar: {
    '/guide/': [
      {
        text: '入门',
        items: [
          { text: '快速开始', link: '/guide/getting-started' },
          { text: '配置指南', link: '/guide/config' }
        ]
      }
    ]
  }
}
```

## 自定义样式

编辑 `docs/.vitepress/theme/custom.css` 覆盖 CSS 变量：

```css
:root {
  --vp-c-brand-1: #e8740c;
  --vp-c-brand-2: #d06808;
}
```

## 自定义主题

编辑 `docs/.vitepress/theme/index.ts` 扩展默认主题：

```ts
import DefaultTheme from 'vitepress/theme'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // 注册全局组件
  }
}
```
