# 运行时 API

VitePress 运行时 API 参考。

## useData

获取当前页面的站点、主题和页面数据。

```vue
<script setup>
import { useData } from 'vitepress'

const { site, theme, page, frontmatter } = useData()
</script>
```

## useRoute

获取当前路由信息。

```vue
<script setup>
import { useRoute } from 'vitepress'

const route = useRoute()
</script>
```

## useRouter

获取路由器实例。

```vue
<script setup>
import { useRouter } from 'vitepress'

const router = useRouter()
router.go('/guide/getting-started')
</script>
```
