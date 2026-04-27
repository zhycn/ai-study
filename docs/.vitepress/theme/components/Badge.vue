<template>
  <div class="vp-badge" :class="type">
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  type?: 'default' | 'tip' | 'warning' | 'danger'
}>()
</script>

<style scoped>
.vp-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1;
}

.vp-badge.default {
  background: var(--vp-c-default-soft);
  color: var(--vp-c-text-1);
}

.vp-badge.tip {
  background: var(--vp-c-green-soft);
  color: var(--vp-c-green-1);
}

.vp-badge.warning {
  background: var(--vp-c-yellow-soft);
  color: var(--vp-c-yellow-1);
}

.vp-badge.danger {
  background: var(--vp-c-red-soft);
  color: var(--vp-c-red-1);
}
</style>
