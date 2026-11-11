<template>
  <div class="login-page">
    <div class="login-hero">
      <svg viewBox="0 0 32 32" width="56" height="56">
        <rect width="32" height="32" rx="8" fill="#fff" />
        <path d="M12 9L23 16L12 23V9Z" fill="#FF6699" />
      </svg>
      <h1>VideoHub</h1>
      <p>发现精彩，分享感动</p>
    </div>

    <div class="login-card">
      <h2 class="login-title">欢迎登录</h2>

      <van-tabs v-model:active="loginType" type="card" color="#FF6699" class="login-tabs">
        <van-tab title="账号登录" name="password" />
        <van-tab title="邮箱登录" name="email" />
      </van-tabs>

      <!-- 账号登录 -->
      <template v-if="loginType === 'password'">
        <van-cell-group inset>
          <van-field
            v-model="form.username"
            placeholder="请输入账号"
            left-icon="user-o"
          />
          <van-field
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            left-icon="lock"
          />
          <van-field
            v-model="form.captcha"
            placeholder="请输入验证码"
            left-icon="shield-o"
          >
            <template #button>
              <img v-if="captchaImg" :src="captchaImg" class="captcha-img" @click="refreshCaptcha" />
              <span v-else class="captcha-refresh" @click="refreshCaptcha">获取验证码</span>
            </template>
          </van-field>
        </van-cell-group>
      </template>

      <!-- 邮箱登录 -->
      <template v-else>
        <van-cell-group inset>
          <van-field
            v-model="form.email"
            type="email"
            placeholder="请输入邮箱"
            left-icon="envelop-o"
          />
          <van-field
            v-model="form.emailCaptcha"
            placeholder="请输入邮箱验证码"
            left-icon="shield-o"
          >
            <template #button>
              <van-button
                size="small"
                type="primary"
                color="#FF6699"
                :disabled="captchaCooldown > 0"
                @click="sendEmailCaptcha"
              >{{ captchaCooldown > 0 ? `${captchaCooldown}s` : '发送验证码' }}</van-button>
            </template>
          </van-field>
        </van-cell-group>
      </template>

      <div class="login-extra">
        <van-checkbox v-model="form.remember" icon-size="16px" checked-color="#FF6699">记住我</van-checkbox>
        <a class="forgot-link" href="javascript:;" @click="forgotPassword">忘记密码？</a>
      </div>

      <van-button
        type="primary"
        color="#FF6699"
        round
        block
        class="login-btn"
        :loading="isLoading"
        @click="handleLogin"
      >登 录</van-button>

      <div class="login-foot">
        还没有账号？
        <router-link to="/register">立即注册</router-link>
      </div>

      <div class="back-home" @click="router.push('/')">返回首页</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import { getClientCaptcha, clientLogin, getClientUserInfo } from '../api/auth'
import { useAuthStore } from '../stores/auth'
import md5 from 'md5'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const loginType = ref('password')
const captchaImg = ref('')
const captchaKey = ref('')
const captchaCooldown = ref(0)
const isLoading = ref(false)
let cooldownTimer = null

const form = ref({
  username: '',
  password: '',
  captcha: '',
  email: '',
  emailCaptcha: '',
  remember: false
})

const forgotPassword = () => {
  showToast('忘记密码功能开发中，敬请期待')
}

const refreshCaptcha = async () => {
  try {
    const res = await getClientCaptcha({ captchaType: 'img_captcha', email: form.value.username || 'test@example.com' })
    if (res) {
      captchaImg.value = res.captcha || (res.img ? (res.img.startsWith('data:') ? res.img : `data:image/png;base64,${res.img}`) : '')
      captchaKey.value = res.key || ''
    }
  } catch (e) {
    console.error('获取验证码失败:', e)
  }
}

const sendEmailCaptcha = async () => {
  if (!form.value.email) return showToast('请输入邮箱')
  try {
    await getClientCaptcha({ captchaType: 'email_captcha', email: form.value.email })
    showToast('验证码已发送')
    captchaCooldown.value = 60
    cooldownTimer = setInterval(() => {
      captchaCooldown.value--
      if (captchaCooldown.value <= 0) clearInterval(cooldownTimer)
    }, 1000)
  } catch (e) {
    showToast('发送验证码失败')
  }
}

const handleLogin = async () => {
  if (isLoading.value) return
  try {
    let loginData = {}
    if (loginType.value === 'password') {
      if (!form.value.username || !form.value.password || !form.value.captcha) return showToast('请填写完整信息')
      loginData = { username: form.value.username, password: md5(form.value.password), key: captchaKey.value, captcha: form.value.captcha, loginType: 'img_captcha' }
    } else {
      if (!form.value.email || !form.value.emailCaptcha) return showToast('请填写完整信息')
      loginData = { email: form.value.email, captcha: form.value.emailCaptcha, loginType: 'email_captcha' }
    }
    isLoading.value = true
    const res = await clientLogin(loginData)
    if (res) {
      let userInfo = null
      try { userInfo = await getClientUserInfo() } catch {}
      authStore.login(res.accessToken, res.refreshToken, userInfo)
      showToast('登录成功')
      router.push(route.query.redirect || '/')
    }
  } catch (e) {
    showToast(e.message || '登录失败')
    refreshCaptcha()
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  refreshCaptcha()
})

onUnmounted(() => {
  if (cooldownTimer) clearInterval(cooldownTimer)
})
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(160deg, #FF8CB0 0%, #FF6699 45%, #FF9966 100%);
  display: flex;
  flex-direction: column;
}

.login-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: calc(56px + var(--sat)) 0 32px;
  color: #fff;
}

.login-hero h1 {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: 1px;
}

.login-hero p {
  font-size: 13px;
  opacity: 0.9;
}

.login-card {
  flex: 1;
  background: var(--bg1);
  border-radius: 20px 20px 0 0;
  padding: 24px 16px calc(32px + var(--sab));
  margin-top: auto;
}

.login-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text1);
  margin-bottom: 16px;
  padding-left: 4px;
}

.login-tabs {
  margin-bottom: 16px;
}

.captcha-img {
  height: 32px;
  border-radius: 4px;
  cursor: pointer;
}

.captcha-refresh {
  font-size: 12px;
  color: var(--brand_pink);
  cursor: pointer;
}

.login-extra {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 12px;
}

.forgot-link {
  font-size: 13px;
  color: var(--text2);
}

.login-btn {
  margin-top: 4px;
}

.login-foot {
  text-align: center;
  font-size: 13px;
  color: var(--text2);
  margin-top: 18px;
}

.login-foot a {
  color: var(--brand_pink);
  font-weight: 600;
}

.back-home {
  text-align: center;
  font-size: 12px;
  color: var(--text4);
  margin-top: 16px;
  cursor: pointer;
}
</style>
