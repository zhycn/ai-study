<template>
  <div class="vp-card" :class="type">
    <div class="vp-card-icon">
      {{ icon }}
    </div>
    <h3 class="vp-card-title">
      {{ title }}
    </h3>
    <p class="vp-card-details">
      {{ details }}
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  details: string
  type?: 'info' | 'tip' | 'warning' | 'danger'
  icon?: string
}>()
</script>

<style scoped>
.vp-card {
  padding: 1.5rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  transition:
    border-color 0.25s,
    box-shadow 0.25s;
}

.vp-card:hover {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.vp-card-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.vp-card-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
  color: var(--vp-c-text-1);
}

.vp-card-details {
  margin: 0;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
}

.vp-card.info {
  border-left: 4px solid var(--vp-c-brand-1);
}

.vp-card.tip {
  border-left: 4px solid var(--vp-c-green-1);
}

.vp-card.warning {
  border-left: 4px solid var(--vp-c-yellow-1);
}

.vp-card.danger {
  border-left: 4px solid var(--vp-c-red-1);
}
</style>
