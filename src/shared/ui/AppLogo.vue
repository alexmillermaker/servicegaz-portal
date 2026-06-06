<template>
  <div class="app-logo">
    <img
      src="/servisgaz-logo.png"
      class="app-logo__img"
      alt="СЕРВИСГАЗ"
      draggable="false"
    />
    <div class="app-logo__divider" />
    <div class="app-logo__text">
      <span class="app-logo__name">UNITorg SG</span>
      <span v-if="subtitle" class="app-logo__sub">{{ subtitle }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ subtitle?: string }>()
</script>

<style scoped>
.app-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  user-select: none;
  -webkit-user-select: none;
}
.app-logo__img {
  height: 28px;
  width: auto;
  object-fit: contain;
  flex-shrink: 0;
  /* Предотвращаем долгое нажатие вызывающее save image */
  pointer-events: none;
}
.app-logo__divider {
  width: 1px;
  height: 22px;
  background: var(--c-border-2);
  flex-shrink: 0;
}
.app-logo__text {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.app-logo__name {
  font-size: 14px;
  font-weight: 700;
  color: var(--c-accent);
  letter-spacing: -0.02em;
  line-height: 1.2;
}
.app-logo__sub {
  font-size: 10px;
  color: var(--c-text-3);
  line-height: 1.3;
  white-space: nowrap;
}
</style>
