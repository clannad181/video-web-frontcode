<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h1>{{ t('auth.registerTitle') }}</h1>
          <p>{{ t('auth.registerSubtitle') }}</p>
        </div>

        <form class="auth-form" @submit.prevent="handleRegister">
          <div class="form-group">
            <label>{{ t('auth.username') }}</label>
            <input
              v-model="form.username"
              type="text"
              :placeholder="t('auth.accountPlaceholder')"
              required
            />
          </div>

          <div class="form-group">
            <label>{{ t('auth.nickname') }}</label>
            <input
              v-model="form.nickname"
              type="text"
              :placeholder="t('auth.nicknamePlaceholder')"
              required
            />
          </div>

          <div class="form-group">
            <label>{{ t('auth.email') }}</label>
            <input
              v-model="form.email"
              type="email"
              :placeholder="t('auth.emailPlaceholder')"
              required
            />
          </div>

          <div class="form-group">
            <label>{{ t('auth.password') }}</label>
            <input
              v-model="form.password"
              type="password"
              :placeholder="t('auth.passwordPlaceholder')"
              required
            />
          </div>

          <div class="form-group">
            <label>{{ t('auth.confirmPassword') }}</label>
            <input
              v-model="form.confirmPassword"
              type="password"
              :placeholder="t('auth.confirmPasswordPlaceholder')"
              required
            />
            <p v-if="form.confirmPassword && form.password !== form.confirmPassword" class="error-hint">
              {{ t('auth.passwordMismatch') }}
            </p>
          </div>

          <button type="submit" class="btn-submit" :disabled="!isFormValid">
            {{ t('auth.register') }}
          </button>
        </form>

        <div class="auth-footer">
          {{ t('auth.hasAccount') }}
          <router-link to="/login">{{ t('auth.goLogin') }}</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()

const form = ref({
  username: '',
  nickname: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const isFormValid = computed(() => {
  return form.value.username &&
    form.value.nickname &&
    form.value.email &&
    form.value.password &&
    form.value.confirmPassword &&
    form.value.password === form.value.confirmPassword
})

const handleRegister = () => {
  if (!isFormValid.value) return
  console.log('注册:', form.value)
  router.push('/login')
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-input);
  padding: 20px;
  padding-top: 72px;
}

.auth-container {
  width: 100%;
  max-width: 400px;
}

.auth-card {
  background: var(--bg-card);
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.auth-header {
  text-align: center;
  margin-bottom: 32px;
}

.auth-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.auth-header p {
  font-size: 14px;
  color: var(--text-muted);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
}

.form-group input {
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  background: var(--bg-input);
  color: var(--text-primary);
}

.form-group input:focus {
  border-color: var(--color-primary);
}

.error-hint {
  font-size: 12px;
  color: #f56c6c;
  margin-top: 4px;
}

.btn-submit {
  padding: 14px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 8px;
}

.btn-submit:hover:not(:disabled) {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.auth-footer {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: var(--text-muted);
}

.auth-footer a {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
  margin-left: 4px;
}

.auth-footer a:hover {
  text-decoration: underline;
}
</style>
