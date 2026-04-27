---
outline: deep
---

# 运行时 API 示例

本页面演示了 VitePress 提供的一些运行时 API 的使用方法。

主要的 `useData()` API 可以用来访问当前页面的站点、主题和页面数据。它在 `.md` 和 `.vue` 文件中都可以使用：

**输入**

````md
```vue
<script setup>
import { useData } from 'vitepress'

const { theme, page, frontmatter } = useData()
</script>

## 运行结果 ### 主题数据

<pre>{{ theme }}</pre>

### 页面数据

<pre>{{ page }}</pre>

### 页面 Frontmatter

<pre>{{ frontmatter }}</pre>
```
````

**输出**

<script setup>
import { useData } from 'vitepress'

const { site, theme, page, frontmatter } = useData()
</script>

## 运行结果

### 主题数据

<pre>{{ theme }}</pre>

### 页面数据

<pre>{{ page }}</pre>

### 页面 Frontmatter

<pre>{{ frontmatter }}</pre>

## 更多

查看文档了解[完整的运行时 API 列表](https://vitepress.dev/zh/reference/runtime-api#usedata)。
