<template>
  <div class="not-found-page">
    <div class="not-found-content">
      <h1 class="error-code">404</h1>
      <p class="error-message">{{ t('notFound.message') }}</p>
      <router-link to="/" class="btn-home">{{ t('notFound.backHome') }}</router-link>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<style scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.not-found-content {
  text-align: center;
}

.error-code {
  font-size: 120px;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 16px;
  line-height: 1;
}

.error-message {
  font-size: 18px;
  color: var(--text-muted);
  margin-bottom: 32px;
}

.btn-home {
  display: inline-block;
  padding: 14px 32px;
  background: var(--color-primary);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-home:hover {
  background: var(--color-primary-hover);
  transform: translateY(-2px);
}
</style>
