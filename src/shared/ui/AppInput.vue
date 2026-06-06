<script setup lang="ts">
defineProps<{
  modelValue: string
  label?: string
  placeholder?: string
  type?: string
  error?: string
  hint?: string
  disabled?: boolean
  maxlength?: number
}>()

defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <div class="app-input" :class="{ 'app-input--error': error, 'app-input--disabled': disabled }">
    <label v-if="label" class="app-input__label">{{ label }}</label>
    <div class="app-input__wrap">
      <slot name="prefix" />
      <input
        :type="type ?? 'text'"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :maxlength="maxlength"
        class="app-input__field"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <slot name="suffix" />
    </div>
    <span v-if="error" class="app-input__error">{{ error }}</span>
    <span v-else-if="hint" class="app-input__hint">{{ hint }}</span>
  </div>
</template>

<style scoped>
.app-input { display: flex; flex-direction: column; gap: var(--gap-xs); }

.app-input__label {
  font-size: var(--fs-sm);
  font-weight: 500;
  color: var(--c-text-2);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.app-input__wrap {
  display: flex;
  align-items: center;
  background: var(--c-surface);
  border: 1.5px solid var(--c-border);
  border-radius: var(--r-md);
  min-height: var(--touch-target);
  transition: border-color var(--dur-fast);
  overflow: hidden;
}
.app-input__wrap:focus-within {
  border-color: var(--c-accent);
  box-shadow: 0 0 0 3px var(--c-accent-dim);
}
.app-input--error .app-input__wrap {
  border-color: var(--c-danger);
}
.app-input--error .app-input__wrap:focus-within {
  box-shadow: 0 0 0 3px var(--c-danger-dim);
}

.app-input__field {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--c-text);
  font-size: var(--fs-md);
  padding: 0 var(--gap-md);
  height: var(--touch-target);
  width: 100%;
}
.app-input__field::placeholder { color: var(--c-text-3); }
.app-input__field:disabled { opacity: 0.5; cursor: not-allowed; }

.app-input__error {
  font-size: var(--fs-sm);
  color: var(--c-danger);
}
.app-input__hint {
  font-size: var(--fs-sm);
  color: var(--c-text-3);
}

.app-input--disabled { opacity: 0.6; pointer-events: none; }
</style>
