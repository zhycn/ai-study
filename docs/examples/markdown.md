# Markdown 扩展示例

本页面演示了 VitePress 提供的 Markdown 扩展功能。

## 语法高亮

```js{4,6-8}
export default {
  data() {
    return {
      msg: '高亮行！',
      items: [1, 2, 3]
    }
  }
}
```

## 自定义容器

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

## 代码组

::: code-group

```bash [npm]
npm install vitepress
```

```bash [pnpm]
pnpm add vitepress
```

```bash [yarn]
yarn add vitepress
```

:::

## 代码块文件名

```js:src/main.js
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
```

## 网格布局

::: card-grid

<Card title="快速开始" details="了解如何快速上手 VitePress Starter 模板" type="info" icon="🚀" />

<Card title="配置指南" details="掌握站点配置、主题定制和插件扩展" type="tip" icon="⚙️" />

<Card title="组件示例" details="在 Markdown 中直接使用 Vue 组件" type="warning" icon="🧩" />

:::

## 步骤引导

::: steps

### 安装依赖

运行 `pnpm install` 安装所有依赖。

### 启动开发服务器

运行 `pnpm docs:dev` 启动本地开发。

### 开始编写

在 `docs/` 目录下创建你的 Markdown 文件。

:::

## 导入代码片段

你可以从文件中导入代码片段：

<<< @/../package.json{json}

## 表格

| 特性       | 说明              | 状态 |
| ---------- | ----------------- | ---- |
| 本地搜索   | 内置中文搜索支持  | ✅   |
| RSS 订阅   | 自动生成 RSS feed | ✅   |
| 自定义组件 | 全局 Vue 组件注册 | ✅   |
| PWA        | 离线访问支持      | 🔜   |
