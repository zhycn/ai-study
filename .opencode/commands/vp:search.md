---
description: 配置搜索功能
agent: build
---

配置 VitePress 的搜索功能。

如果用户未提供参数，询问：

1. 使用哪种搜索？（本地搜索 local / Algolia）
2. 如果是 Algolia，提供 appId、apiKey、indexName

修改位置：

- docs/.vitepress/config.mts 的 themeConfig.search

本地搜索配置：

```ts
search: {
  provider: 'local',
  options: {
    locales: { root: { translations: { ... } } },
    miniSearch: { ... }
  }
}
```

Algolia 配置：

```ts
search: {
  provider: 'algolia',
  options: { appId, apiKey, indexName }
}
```

示例：`/vp:search` 或 `/vp:search algolia`
