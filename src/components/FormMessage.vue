<script setup>
defineProps({
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['info', 'success', 'error'].includes(value),
  },
  message: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div class="form-message" :class="`form-message--${type}`" role="status" aria-live="polite">
    <i
      class="pi"
      :class="{
        'pi-info-circle': type === 'info',
        'pi-check-circle': type === 'success',
        'pi-exclamation-circle': type === 'error',
      }"
      aria-hidden="true"
    ></i>
    <span>{{ message }}</span>
  </div>
</template>

<style scoped>
.form-message {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  border-radius: 10px;
  padding: 0.8rem 0.9rem;
  font-weight: 650;
}

.form-message--info {
  color: var(--info);
  background: var(--info-soft);
}

.form-message--success {
  color: var(--success);
  background: var(--success-soft);
}

.form-message--error {
  color: var(--danger);
  background: var(--danger-soft);
}

i {
  margin-top: 0.2rem;
}
</style>
