# 组件示例

在 Markdown 中直接使用 Vue 组件。

## 基础用法

在 `.md` 文件中直接编写 Vue 组件：

<script setup>
import { ref } from 'vue'

const count = ref(0)
</script>

<div class="counter-demo">
  <p>计数器：{{ count }}</p>
  <button @click="count++">+1</button>
</div>

<style>
.counter-demo {
  padding: 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  text-align: center;
}
.counter-demo button {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--vp-c-brand-1);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>

## 全局组件

在 `docs/.vitepress/theme/index.ts` 中注册的全局组件可以在所有 Markdown 文件中直接使用。

## 组件位置

自定义组件应放置在 `docs/.vitepress/theme/components/` 目录下。
