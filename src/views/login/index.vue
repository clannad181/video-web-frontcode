<template>
  <div class="login-wrapper">
    <!-- 动态背景 -->
    <div class="login-bg">
      <div class="bg-orb bg-orb-1"></div>
      <div class="bg-orb bg-orb-2"></div>
      <div class="bg-orb bg-orb-3"></div>
      <div class="bg-grid"></div>
    </div>

    <!-- 粒子效果 -->
    <div class="particles">
      <span v-for="n in 20" :key="n" :style="getParticleStyle(n)"></span>
    </div>

    <!-- 登录卡片 -->
    <div class="login-card" :class="{ show: showCard }">
      <!-- 顶部发光条 -->
      <div class="card-glow-bar"></div>

      <!-- Logo区域 -->
      <div class="login-header">
        <div class="logo-icon">
          <svg viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="12" fill="url(#grad)" />
            <path d="M18 14L34 24L18 34V14Z" fill="white" />
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="48" y2="48">
                <stop stop-color="#6366f1" />
                <stop offset="1" stop-color="#a855f7" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h1 class="login-title">Video Admin</h1>
        <p class="login-subtitle">{{ $t('视频内容管理平台') }}</p>
      </div>

      <!-- 登录表单 -->
      <div class="login-form">
        <!-- Tab切换 -->
        <div class="tab-bar">
          <div
            class="tab-item"
            :class="{ active: activeTab === 'account' }"
            @click="activeTab = 'account'"
          >
            {{ $t('账号登录') }}
          </div>
          <div
            class="tab-item"
            :class="{ active: activeTab === 'email' }"
            @click="activeTab = 'email'"
          >
            {{ $t('邮箱登录') }}
          </div>
          <div class="tab-indicator" :class="{ right: activeTab === 'email' }"></div>
        </div>

        <!-- 账号登录 -->
        <div v-show="activeTab === 'account'" class="form-content">
          <div class="input-group">
            <div class="input-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <input
              v-model="accountForm.username"
              type="text"
              :placeholder="$t('请输入用户名')"
              class="form-input"
              @keyup.enter="handleLogin"
            />
          </div>
          <div v-if="errors.username" class="error-text">{{ errors.username ? $t(errors.username) : '' }}</div>

          <div class="input-group">
            <div class="input-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <input
              v-model="accountForm.password"
              :type="showPassword ? 'text' : 'password'"
              :placeholder="$t('请输入密码')"
              class="form-input"
              @keyup.enter="handleLogin"
            />
            <div class="input-eye" @click="showPassword = !showPassword">
              <svg v-if="!showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            </div>
          </div>
          <div v-if="errors.password" class="error-text">{{ errors.password ? $t(errors.password) : '' }}</div>

          <div class="captcha-group">
            <div class="input-group captcha-input">
              <div class="input-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                </svg>
              </div>
              <input
                v-model="accountForm.captcha"
                type="text"
                :placeholder="$t('验证码')"
                class="form-input"
                maxlength="6"
                @keyup.enter="handleLogin"
              />
            </div>
            <div class="captcha-box" @click="refreshCaptcha" :title="$t('点击刷新验证码')">
              <div v-if="captchaLoading" class="captcha-loading">
                <div class="spinner"></div>
              </div>
              <img v-else-if="captchaImage" :src="captchaImage" class="captcha-img" />
              <canvas v-else ref="captchaCanvas" width="120" height="40"></canvas>
            </div>
          </div>
          <div v-if="errors.captcha" class="error-text">{{ errors.captcha ? $t(errors.captcha) : '' }}</div>

          <div class="form-options">
            <label class="checkbox-wrapper">
              <input type="checkbox" v-model="rememberMe" />
              <span class="checkbox-custom"></span>
              <span class="checkbox-label">{{ $t('记住我') }}</span>
            </label>
            <a href="javascript:void(0)" class="forgot-link">{{ $t('忘记密码?') }}</a>
          </div>
        </div>

        <!-- 邮箱登录 -->
        <div v-show="activeTab === 'email'" class="form-content">
          <div class="input-group">
            <div class="input-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <input
              v-model="emailForm.email"
              type="email"
              :placeholder="$t('请输入邮箱')"
              class="form-input"
            />
          </div>
          <div v-if="errors.email" class="error-text">{{ errors.email ? $t(errors.email) : '' }}</div>

          <div class="input-group code-group">
            <div class="input-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <input
              v-model="emailForm.code"
              type="text"
              :placeholder="$t('请输入验证码')"
              class="form-input"
              maxlength="6"
              @keyup.enter="handleLogin"
            />
            <button
              class="send-code-btn"
              :disabled="countdown > 0 || sendingCode"
              @click="sendCode"
            >
              <span v-if="sendingCode" class="btn-loader-small"></span>
              <span v-else>{{ countdown > 0 ? `${countdown}s` : t('获取验证码') }}</span>
            </button>
          </div>
          <div v-if="errors.code" class="error-text">{{ errors.code ? $t(errors.code) : '' }}</div>
        </div>

        <!-- 登录按钮 -->
        <button class="login-btn" :class="{ loading: isLoading }" @click="handleLogin" :disabled="isLoading">
          <span v-if="isLoading" class="btn-loader"></span>
          <span v-else>{{ $t('登 录') }}</span>
        </button>

        <!-- 错误提示 -->
        <div v-if="loginError" class="login-error">
          <span class="error-icon">!</span>
          {{ loginError ? $t(loginError) : '' }}
        </div>
      </div>

      <!-- 底部 -->
      <div class="login-footer">
        <span>Video Admin &copy; 2026</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { getCaptcha, sendEmailCode } from '@/api/auth'
import SparkMD5 from 'spark-md5'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const activeTab = ref('account')
const showPassword = ref(false)
const rememberMe = ref(false)
const showCard = ref(false)
const isLoading = ref(false)
const loginError = ref('')
const countdown = ref(0)
const sendingCode = ref(false)
const captchaCanvas = ref(null)
const captchaImage = ref('')
const captchaLoading = ref(false)
const captchaKey = ref('')

const accountForm = reactive({
  username: 'admin',
  password: '123456',
  captcha: ''
})

const emailForm = reactive({
  email: '',
  code: ''
})

const errors = reactive({
  username: '',
  password: '',
  captcha: '',
  email: '',
  code: ''
})

function md5(str) {
  return SparkMD5.hash(str)
}

function generateCaptchaKey() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

async function fetchCaptcha(captchaType = 'img_captcha', email = '') {
  captchaLoading.value = true
  try {
    const key = generateCaptchaKey()
    const res = await getCaptcha(key, captchaType, email)
    if (res.code === 200 && res.data) {
      captchaKey.value = res.data.key || key
      if (res.data.captcha) {
        captchaImage.value = res.data.captcha
      }
    }
  } catch (e) {
    console.error('获取验证码失败', e)
    generateCanvasCaptcha()
  } finally {
    captchaLoading.value = false
  }
}

function generateCanvasCaptcha() {
  const canvas = captchaCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  const width = canvas.width
  const height = canvas.height

  ctx.fillStyle = '#1e293b'
  ctx.fillRect(0, 0, width, height)

  for (let i = 0; i < 6; i++) {
    ctx.strokeStyle = `hsla(${Math.random() * 360}, 70%, 60%, 0.3)`
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(Math.random() * width, Math.random() * height)
    ctx.lineTo(Math.random() * width, Math.random() * height)
    ctx.stroke()
  }

  const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    const char = CHARS[Math.floor(Math.random() * CHARS.length)]
    code += char
    ctx.save()
    ctx.font = `bold ${16 + Math.random() * 3}px monospace`
    ctx.fillStyle = `hsl(${Math.random() * 360}, 80%, 65%)`
    ctx.textBaseline = 'middle'
    ctx.translate(15 + i * 18, height / 2)
    ctx.rotate((Math.random() - 0.5) * 0.4)
    ctx.fillText(char, 0, 0)
    ctx.restore()
  }

  for (let i = 0; i < 30; i++) {
    ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.3})`
    ctx.beginPath()
    ctx.arc(Math.random() * width, Math.random() * height, 1, 0, Math.PI * 2)
    ctx.fill()
  }
}

function refreshCaptcha() {
  captchaImage.value = ''
  const captchaType = activeTab.value === 'account' ? 'img_captcha' : 'email_captcha'
  const email = activeTab.value === 'email' ? emailForm.email : ''
  fetchCaptcha(captchaType, email)
}

function getParticleStyle(n) {
  return particleStyles.value[n - 1] || {}
}

const particleStyles = ref([])
for (let i = 0; i < 20; i++) {
  const size = 2 + Math.random() * 3
  particleStyles.value.push({
    width: size + 'px',
    height: size + 'px',
    left: Math.random() * 100 + '%',
    top: Math.random() * 100 + '%',
    animationDuration: (15 + Math.random() * 25) + 's',
    animationDelay: Math.random() * 10 + 's'
  })
}

function clearErrors() {
  errors.username = ''
  errors.password = ''
  errors.captcha = ''
  errors.email = ''
  errors.code = ''
}

function validateAccount() {
  clearErrors()
  let valid = true

  if (!accountForm.username.trim()) {
    errors.username = '请输入用户名' // i18n-key
    valid = false
  }
  if (!accountForm.password) {
    errors.password = '请输入密码' // i18n-key
    valid = false
  }
  if (!accountForm.captcha.trim()) {
    errors.captcha = '请输入验证码' // i18n-key
    valid = false
  }

  return valid
}

function validateEmail() {
  clearErrors()
  let valid = true

  if (!emailForm.email.trim()) {
    errors.email = '请输入邮箱' // i18n-key
    valid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailForm.email)) {
    errors.email = '邮箱格式不正确' // i18n-key
    valid = false
  }
  if (!emailForm.code.trim()) {
    errors.code = '请输入验证码' // i18n-key
    valid = false
  }

  return valid
}

async function handleLogin() {
  if (isLoading.value) return
  loginError.value = ''

  const isValid = activeTab.value === 'account' ? validateAccount() : validateEmail()
  if (!isValid) return

  isLoading.value = true
  try {
    let loginData
    if (activeTab.value === 'account') {
      loginData = {
        key: captchaKey.value,
        captcha: accountForm.captcha,
        loginType: 'img_captcha',
        loginSystem: 0,
        username: accountForm.username,
        password: md5(accountForm.password)
      }
    } else {
      loginData = {
        key: captchaKey.value,
        captcha: emailForm.code,
        loginType: 'email_captcha',
        loginSystem: 0,
        email: emailForm.email
      }
    }

    await userStore.login(loginData)
  } catch (e) {
    let msg = t('登录失败，请重试')
    if (e?.response?.data?.message) {
      msg = e.response.data.message
    } else if (e?.response?.data?.msg) {
      msg = e.response.data.msg
    } else if (e?.message) {
      msg = e.message
    }
    loginError.value = msg
    refreshCaptcha()
    accountForm.captcha = ''
  } finally {
    isLoading.value = false
  }
}

let timer = null
async function sendCode() {
  if (countdown.value > 0 || sendingCode.value) return

  if (!emailForm.email.trim()) {
    errors.email = '请输入邮箱' // i18n-key
    return
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailForm.email)) {
    errors.email = '邮箱格式不正确' // i18n-key
    return
  }

  errors.email = ''
  sendingCode.value = true
  try {
    const key = generateCaptchaKey()
    captchaKey.value = key
    await sendEmailCode(emailForm.email)
    ElMessage.success(t('验证码已发送'))
    countdown.value = 60
    timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) clearInterval(timer)
    }, 1000)
  } catch (e) {
    ElMessage.error(t('发送验证码失败'))
  } finally {
    sendingCode.value = false
  }
}

onMounted(() => {
  fetchCaptcha()
  nextTick(() => {
    requestAnimationFrame(() => {
      showCard.value = true
    })
  })
})
</script>

<style scoped>
.login-wrapper {
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;

  /* ---- 主题 token：默认暗色；系统浅色偏好时整体跟随 ---- */
  color-scheme: dark;
  --lp-fg: #cbd5e1;
  --lp-bg: #0a0a1a;
  --lp-grid: rgba(255, 255, 255, 0.02);
  --lp-particle: rgba(255, 255, 255, 0.5);
  --lp-orb-1: rgba(99, 102, 241, 0.3);
  --lp-orb-2: rgba(168, 85, 247, 0.25);
  --lp-orb-3: rgba(236, 72, 153, 0.2);
  --lp-card-bg: rgba(15, 23, 42, 0.85);
  --lp-card-border: rgba(255, 255, 255, 0.08);
  --lp-card-shadow: 0 0 0 1px rgba(255, 255, 255, 0.05), 0 25px 50px rgba(0, 0, 0, 0.5);
  --lp-title: #f1f5f9;
  --lp-tabbar-bg: rgba(255, 255, 255, 0.05);
  --lp-field-bg: rgba(255, 255, 255, 0.05);
  --lp-field-bg-focus: rgba(255, 255, 255, 0.08);
  --lp-field-border: rgba(255, 255, 255, 0.08);
  --lp-field-border-hover: rgba(99, 102, 241, 0.4);
  --lp-input-text: #f1f5f9;
  --lp-spinner-track: rgba(255, 255, 255, 0.1);
  --lp-sendcode-bg: rgba(99, 102, 241, 0.2);
  --lp-sendcode-bg-hover: rgba(99, 102, 241, 0.3);
  --lp-sendcode-text: #a5b4fc;
  --lp-sendcode-text-hover: #c7d2fe;
  --lp-loader-track: rgba(165, 180, 252, 0.3);
  --lp-loader-top: #a5b4fc;
  --lp-check-border: rgba(255, 255, 255, 0.2);
  --lp-link-hover: #a5b4fc;
  --lp-error: #f87171;

  background: var(--lp-bg);
  color: var(--lp-fg);
  overflow: hidden;
}

@media (prefers-color-scheme: light) {
  .login-wrapper {
    color-scheme: light;
    --lp-fg: #334155;
    --lp-bg: #edf0f6;
    --lp-grid: rgba(20, 28, 50, 0.05);
    --lp-particle: rgba(60, 70, 110, 0.35);
    --lp-orb-1: rgba(99, 102, 241, 0.22);
    --lp-orb-2: rgba(168, 85, 247, 0.16);
    --lp-orb-3: rgba(236, 72, 153, 0.14);
    --lp-card-bg: rgba(255, 255, 255, 0.92);
    --lp-card-border: rgba(20, 28, 50, 0.08);
    --lp-card-shadow: 0 0 0 1px rgba(255, 255, 255, 0.6), 0 25px 50px rgba(30, 41, 80, 0.14);
    --lp-title: #1e293b;
    --lp-tabbar-bg: rgba(20, 28, 50, 0.05);
    --lp-field-bg: rgba(241, 245, 249, 0.9);
    --lp-field-bg-focus: #ffffff;
    --lp-field-border: rgba(20, 28, 50, 0.1);
    --lp-field-border-hover: rgba(99, 102, 241, 0.55);
    --lp-input-text: #1e293b;
    --lp-spinner-track: rgba(20, 28, 50, 0.12);
    --lp-sendcode-bg: rgba(99, 102, 241, 0.12);
    --lp-sendcode-bg-hover: rgba(99, 102, 241, 0.2);
    --lp-sendcode-text: #4f46e5;
    --lp-sendcode-text-hover: #4338ca;
    --lp-loader-track: rgba(99, 102, 241, 0.3);
    --lp-loader-top: #4f46e5;
    --lp-check-border: rgba(20, 28, 50, 0.3);
    --lp-link-hover: #4f46e5;
    --lp-error: #dc2626;
  }
}

.login-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  animation: orbFloat 20s ease-in-out infinite;
}

.bg-orb-1 {
  width: 500px;
  height: 500px;
  background: var(--lp-orb-1);
  top: -150px;
  left: -100px;
}

.bg-orb-2 {
  width: 400px;
  height: 400px;
  background: var(--lp-orb-2);
  bottom: -100px;
  right: -50px;
  animation-delay: -7s;
}

.bg-orb-3 {
  width: 300px;
  height: 300px;
  background: var(--lp-orb-3);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: -14s;
}

@keyframes orbFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(30px, -30px) scale(1.05); }
  50% { transform: translate(-20px, 20px) scale(0.95); }
  75% { transform: translate(20px, 10px) scale(1.02); }
}

.bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(var(--lp-grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--lp-grid) 1px, transparent 1px);
  background-size: 50px 50px;
}

.particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.particles span {
  position: absolute;
  width: 3px;
  height: 3px;
  background: var(--lp-particle);
  border-radius: 50%;
  animation: particleFloat linear infinite;
}

@keyframes particleFloat {
  0% { transform: translateY(0) translateX(0); opacity: 0; }
  10% { opacity: 0.6; }
  90% { opacity: 0.6; }
  100% { transform: translateY(-100vh) translateX(50px); opacity: 0; }
}

.login-card {
  position: relative;
  width: 400px;
  padding: 40px 36px 32px;
  background: var(--lp-card-bg);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid var(--lp-card-border);
  box-shadow: var(--lp-card-shadow);
  z-index: 10;
  opacity: 0;
  transform: translateY(30px) scale(0.95);
  transition: all 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

.login-card.show {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.card-glow-bar {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 3px;
  background: linear-gradient(90deg, transparent, #6366f1, #a855f7, #6366f1, transparent);
  border-radius: 0 0 4px 4px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo-icon {
  display: inline-block;
  margin-bottom: 16px;
}

.logo-icon svg {
  width: 56px;
  height: 56px;
}

.login-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--lp-title);
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}

.login-subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 0;
  letter-spacing: 2px;
}

.tab-bar {
  display: flex;
  position: relative;
  background: var(--lp-tabbar-bg);
  border-radius: 10px;
  padding: 4px;
  margin-bottom: 28px;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 10px 0;
  font-size: 14px;
  color: #64748b;
  cursor: pointer;
  transition: color 0.3s;
  position: relative;
  z-index: 1;
}

.tab-item.active {
  color: #f1f5f9;
}

.tab-indicator {
  position: absolute;
  top: 4px;
  left: 4px;
  width: calc(50% - 4px);
  height: calc(100% - 8px);
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 8px;
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.tab-indicator.right {
  transform: translateX(100%);
}

.form-content {
  min-height: 200px;
}

.input-group {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--lp-field-bg);
  border: 1px solid var(--lp-field-border);
  border-radius: 12px;
  margin-bottom: 20px;
  transition: all 0.3s;
}

.input-group:focus-within {
  border-color: rgba(99, 102, 241, 0.5);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  background: var(--lp-field-bg-focus);
}

.input-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  flex-shrink: 0;
}

.input-icon svg {
  width: 18px;
  height: 18px;
  color: #475569;
}

.form-input {
  flex: 1;
  height: 48px;
  background: transparent;
  border: none;
  color: var(--lp-input-text);
  font-size: 14px;
  outline: none;
}

.form-input::placeholder {
  color: #475569;
}

.input-eye {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  cursor: pointer;
  color: #475569;
  transition: color 0.2s;
}

.input-eye:hover {
  color: #64748b;
}

.input-eye svg {
  width: 18px;
  height: 18px;
}

.error-text {
  color: var(--lp-error);
  font-size: 12px;
  margin-top: -14px;
  margin-bottom: 16px;
  padding-left: 16px;
}

.captcha-group {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  height: 52px;
}

.captcha-input {
  width: 180px;
  margin-bottom: 0;
}

.captcha-box {
  width: 132px;
  height: 52px;
  margin-left: auto;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid var(--lp-field-border);
  transition: all 0.3s;
  flex-shrink: 0;
  background: var(--lp-field-bg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.captcha-box:hover {
  border-color: var(--lp-field-border-hover);
  background: var(--lp-field-bg-focus);
}

.captcha-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.captcha-loading {
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--lp-spinner-track);
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.code-group {
  margin-bottom: 20px;
}

.send-code-btn {
  flex-shrink: 0;
  height: 48px;
  padding: 0 16px;
  background: var(--lp-sendcode-bg);
  border: none;
  border-radius: 0 12px 12px 0;
  color: var(--lp-sendcode-text);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.send-code-btn:hover:not(:disabled) {
  background: var(--lp-sendcode-bg-hover);
  color: var(--lp-sendcode-text-hover);
}

.send-code-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-loader-small {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid var(--lp-loader-track);
  border-top-color: var(--lp-loader-top);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-wrapper input {
  display: none;
}

.checkbox-custom {
  width: 16px;
  height: 16px;
  border: 1px solid var(--lp-check-border);
  border-radius: 4px;
  position: relative;
  transition: all 0.2s;
}

.checkbox-wrapper input:checked + .checkbox-custom {
  background: #6366f1;
  border-color: #6366f1;
}

.checkbox-wrapper input:checked + .checkbox-custom::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 2px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-label {
  font-size: 13px;
  color: #64748b;
}

.forgot-link {
  font-size: 13px;
  color: #64748b;
  text-decoration: none;
  transition: color 0.2s;
}

.forgot-link:hover {
  color: var(--lp-link-hover);
}

.login-btn {
  width: 100%;
  height: 50px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 4px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.login-btn:hover:not(.loading):not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(99, 102, 241, 0.4);
}

.login-btn:active:not(.loading):not(:disabled) {
  transform: translateY(0);
}

.login-btn.loading,
.login-btn:disabled {
  cursor: not-allowed;
  opacity: 0.8;
}

.btn-loader {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.login-footer {
  text-align: center;
  margin-top: 28px;
  color: #334155;
  font-size: 12px;
}

.login-error {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 10px 14px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  color: #ef4444;
  font-size: 13px;
  line-height: 1.4;
}

.login-error .error-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}

@media (max-width: 480px) {
  .login-card {
    width: calc(100vw - 32px);
    padding: 32px 24px 24px;
  }

  .login-title {
    font-size: 24px;
  }

  .captcha-box {
    width: 110px;
  }
}
</style>
