# Markdown 扩展示例

本页面演示了 VitePress 提供的一些内置 Markdown 扩展功能。

## 语法高亮

VitePress 通过 [Shiki](https://github.com/shikijs/shiki) 提供语法高亮，并支持行高亮等额外功能：

**输入**

````md
```js{4}
export default {
  data () {
    return {
      msg: '高亮行！'
    }
  }
}
```
````

**输出**

```js{4}
export default {
  data () {
    return {
      msg: '高亮行！'
    }
  }
}
```

## 自定义容器

**输入**

```md
::: info
这是一条信息提示。
:::

::: tip
这是一条小贴士。
:::

::: warning
这是一条警告。
:::

::: danger
这是一条危险警告。
:::

::: details
这是一个可折叠的详情块。
:::
```

**输出**

::: info
这是一条信息提示。
:::

::: tip
这是一条小贴士。
:::

::: warning
这是一条警告。
:::

::: danger
这是一条危险警告。
:::

::: details
这是一个可折叠的详情块。
:::

## 更多

查看文档了解[完整的 Markdown 扩展列表](https://vitepress.dev/zh/guide/markdown)。
