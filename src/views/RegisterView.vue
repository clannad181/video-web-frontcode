<template>
  <div class="register-page">
    <div class="register-hero">
      <svg viewBox="0 0 32 32" width="56" height="56">
        <rect width="32" height="32" rx="8" fill="#fff" />
        <path d="M12 9L23 16L12 23V9Z" fill="#FF6699" />
      </svg>
      <h1>VideoHub</h1>
      <p>注册账号，开始创作</p>
    </div>

    <div class="register-card">
      <h2 class="register-title">欢迎注册</h2>

      <van-cell-group inset>
        <van-field v-model="form.username" placeholder="请输入账号" left-icon="user-o" />
        <van-field v-model="form.nickname" placeholder="请输入昵称" left-icon="smile-o" />
        <van-field v-model="form.email" type="email" placeholder="请输入邮箱" left-icon="envelop-o" />
        <van-field
          v-model="form.captcha"
          placeholder="请输入邮箱验证码"
          left-icon="shield-o"
        >
          <template #button>
            <van-button
              size="small"
              type="primary"
              color="#FF6699"
              :disabled="captchaCountdown > 0"
              @click="handleSendCaptcha"
            >{{ captchaCountdown > 0 ? `${captchaCountdown}s` : '发送验证码' }}</van-button>
          </template>
        </van-field>
        <van-field v-model="form.password" type="password" placeholder="请输入密码" left-icon="lock" />
        <van-field v-model="form.confirmPassword" type="password" placeholder="请确认密码" left-icon="lock" />
      </van-cell-group>

      <van-button
        type="primary"
        color="#FF6699"
        round
        block
        class="register-btn"
        :loading="isLoading"
        :disabled="!isFormValid"
        @click="handleRegister"
      >注 册</van-button>

      <div class="register-foot">
        已有账号？
        <router-link :to="{ path: '/login', query: $route.query }">直接登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { clientRegister, getClientUserInfo, sendRegisterCaptcha } from '../api/auth'
import { useAuthStore } from '../stores/auth'
import md5 from 'md5'

const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(false)

const form = ref({
  username: '',
  nickname: '',
  email: '',
  password: '',
  confirmPassword: '',
  captcha: ''
})

const captchaKey = ref('')
const captchaCountdown = ref(0)
const captchaTimer = ref(null)

const isFormValid = computed(() => {
  return form.value.username &&
    form.value.nickname &&
    form.value.email &&
    form.value.password &&
    form.value.confirmPassword &&
    form.value.captcha &&
    captchaKey.value &&
    form.value.password === form.value.confirmPassword
})

const handleRegister = async () => {
  if (isLoading.value || !isFormValid.value) return

  if (form.value.password !== form.value.confirmPassword) {
    return showToast('两次输入的密码不一致')
  }

  try {
    isLoading.value = true
    const res = await clientRegister({
      userName: form.value.username,
      nikeName: form.value.nickname,
      email: form.value.email,
      password: md5(form.value.password),
      key: captchaKey.value,
      captcha: form.value.captcha
    })
    if (res && res.accessToken) {
      let userInfo = null
      try { userInfo = await getClientUserInfo() } catch {}
      authStore.login(res.accessToken, res.refreshToken, userInfo)
      showToast('注册成功')
      router.push('/')
    }
  } catch (e) {
    showToast(e.message || '注册失败')
  } finally {
    isLoading.value = false
  }
}

const handleSendCaptcha = async () => {
  if (!form.value.email) return showToast('请输入邮箱')
  if (captchaCountdown.value > 0) return

  try {
    const res = await sendRegisterCaptcha(form.value.email)
    if (res) {
      captchaKey.value = res.key || res
      captchaCountdown.value = 60
      showToast('验证码已发送到您的邮箱')
      captchaTimer.value = setInterval(() => {
        captchaCountdown.value--
        if (captchaCountdown.value <= 0) {
          clearInterval(captchaTimer.value)
          captchaTimer.value = null
        }
      }, 1000)
    }
  } catch (e) {
    showToast(e.message || '发送验证码失败')
  }
}

onUnmounted(() => {
  if (captchaTimer.value) clearInterval(captchaTimer.value)
})
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: linear-gradient(160deg, #FF8CB0 0%, #FF6699 45%, #FF9966 100%);
  display: flex;
  flex-direction: column;
}

.register-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: calc(var(--header-h) + var(--sat)) 0 28px;
  color: #fff;
}

.register-hero h1 {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: 1px;
}

.register-hero p {
  font-size: 13px;
  opacity: 0.9;
}

.register-card {
  flex: 1;
  background: var(--bg1);
  border-radius: 20px 20px 0 0;
  padding: 24px 16px calc(32px + var(--sab));
  margin-top: auto;
}

.register-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text1);
  margin-bottom: 16px;
  padding-left: 4px;
}

.register-btn {
  margin-top: 20px;
}

.register-foot {
  text-align: center;
  font-size: 13px;
  color: var(--text2);
  margin-top: 18px;
}

.register-foot a {
  color: var(--brand_pink);
  font-weight: 600;
}
</style>
