<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h1>{{ t('auth.loginTitle') }}</h1>
          <p>{{ t('auth.loginSubtitle') }}</p>
        </div>

        <div class="login-type-tabs">
          <button 
            :class="['tab-btn', { active: loginType === 'password' }]"
            @click="loginType = 'password'"
          >
            账号密码登录
          </button>
          <button 
            :class="['tab-btn', { active: loginType === 'email' }]"
            @click="loginType = 'email'"
          >
            邮箱登录
          </button>
        </div>

        <form class="auth-form" @submit.prevent="handleLogin">
          <!-- 账号密码登录 -->
          <template v-if="loginType === 'password'">
            <div class="form-group">
              <label>{{ t('auth.account') }}</label>
              <input
                v-model="form.username"
                type="text"
                :placeholder="t('auth.accountPlaceholder')"
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

            <div class="form-group captcha-group">
              <label>{{ t('auth.imageCaptcha') }}</label>
              <div class="captcha-row">
                <input
                  v-model="form.captcha"
                  type="text"
                  :placeholder="t('auth.imageCaptchaPlaceholder')"
                />
                <div class="captcha-img" @click="refreshCaptcha">
                  <img v-if="captchaImg" :src="captchaImg" alt="验证码" />
                  <span v-else>{{ t('auth.clickRefresh') }}</span>
                </div>
              </div>
            </div>
          </template>

          <!-- 邮箱登录 -->
          <template v-if="loginType === 'email'">
            <div class="form-group">
              <label>邮箱</label>
              <input
                v-model="form.email"
                type="email"
                placeholder="请输入邮箱"
                required
              />
            </div>

            <div class="form-group captcha-group">
              <label>邮箱验证码</label>
              <div class="captcha-row">
                <input
                  v-model="form.emailCaptcha"
                  type="text"
                  placeholder="请输入邮箱验证码"
                />
                <button 
                  type="button" 
                  class="send-captcha-btn"
                  :disabled="captchaCooldown > 0"
                  @click="sendEmailCaptcha"
                >
                  {{ captchaCooldown > 0 ? `${captchaCooldown}s后重试` : '获取验证码' }}
                </button>
              </div>
            </div>
          </template>

          <div class="form-options">
            <label class="remember-me">
              <input type="checkbox" v-model="form.remember" />
              {{ t('auth.rememberMe') }}
            </label>
            <a href="#" class="forgot-pwd">{{ t('auth.forgotPassword') }}</a>
          </div>

          <button type="submit" class="btn-submit">
            {{ t('auth.login') }}
          </button>
        </form>

        <div class="auth-footer">
          {{ t('auth.noAccount') }}
          <router-link to="/register">{{ t('auth.goRegister') }}</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getClientCaptcha, clientLogin, getClientUserInfo } from '../api/auth'
import { useAuthStore } from '../stores/auth'
import { ElMessage } from 'element-plus'
import md5 from 'md5'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const loginType = ref('password')
const captchaImg = ref('')
const captchaKey = ref('')
const captchaCooldown = ref(0)
let cooldownTimer = null

const form = ref({
  username: '',
  password: '',
  captcha: '',
  email: '',
  emailCaptcha: '',
  remember: false
})

const refreshCaptcha = async () => {
  try {
    console.log('开始获取验证码...')
    const res = await getClientCaptcha({ 
      captchaType: 'img_captcha',
      email: form.value.username || 'test@example.com' 
    })
    console.log('验证码响应:', res)
    if (res) {
      // API返回格式: { captcha: "data:image/png;base64,...", key: "..." }
      if (res.captcha) {
        captchaImg.value = res.captcha
        console.log('验证码图片已设置')
      } else if (res.img) {
        captchaImg.value = res.img.startsWith('data:') ? res.img : `data:image/png;base64,${res.img}`
      }
      captchaKey.value = res.key || ''
      console.log('captchaKey:', captchaKey.value)
    }
  } catch (e) {
    console.error('获取验证码失败:', e)
  }
}

const sendEmailCaptcha = async () => {
  if (!form.value.email) {
    ElMessage.warning('请输入邮箱')
    return
  }
  try {
    const res = await getClientCaptcha({ 
      captchaType: 'email_captcha',
      email: form.value.email 
    })
    if (res) {
      ElMessage.success('验证码已发送')
      captchaCooldown.value = 60
      cooldownTimer = setInterval(() => {
        captchaCooldown.value--
        if (captchaCooldown.value <= 0) {
          clearInterval(cooldownTimer)
        }
      }, 1000)
    }
  } catch (e) {
    console.error('发送验证码失败:', e)
    ElMessage.error('发送验证码失败，请重试')
  }
}

const handleLogin = async () => {
  try {
    let loginData = {}
    
    if (loginType.value === 'password') {
      if (!form.value.username || !form.value.password || !form.value.captcha) {
        ElMessage.warning('请填写完整信息')
        return
      }
      loginData = {
        username: form.value.username,
        password: md5(form.value.password),
        key: captchaKey.value,
        captcha: form.value.captcha,
        loginType: 'img_captcha'
      }
    } else {
      if (!form.value.email || !form.value.emailCaptcha) {
        ElMessage.warning('请填写完整信息')
        return
      }
      loginData = {
        email: form.value.email,
        captcha: form.value.emailCaptcha,
        loginType: 'email_captcha'
      }
    }
    
    console.log('登录数据:', loginData)
    const res = await clientLogin(loginData)
    console.log('登录响应:', res)
    
    if (res) {
      // 获取用户信息
      let userInfo = null
      try {
        userInfo = await getClientUserInfo()
      } catch (e) {
        console.error('获取用户信息失败:', e)
      }
      
      // 使用 auth store 统一管理登录状态
      authStore.login(res.accessToken, res.refreshToken, userInfo)
      
      ElMessage.success('登录成功')
      
      // 返回之前的页面
      const redirect = route.query.redirect || '/'
      router.push(redirect)
    }
  } catch (e) {
    console.error('登录失败:', e)
    ElMessage.error(e.message || '登录失败，请重试')
    refreshCaptcha()
  }
}

onMounted(() => {
  refreshCaptcha()
})
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-input);
  padding: 20px;
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

.login-type-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 12px;
}

.tab-btn {
  flex: 1;
  padding: 10px;
  background: none;
  border: none;
  font-size: 14px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 8px;
}

.tab-btn:hover {
  background: var(--bg-input);
}

.tab-btn.active {
  color: var(--color-primary);
  font-weight: 600;
  background: rgba(255, 102, 153, 0.1);
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

.captcha-row {
  display: flex;
  gap: 12px;
  width: 100%;
}

.captcha-row input {
  flex: 1;
  min-width: 0;
}

.captcha-img {
  width: 120px;
  height: 44px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  background: var(--bg-input);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color);
  flex-shrink: 0;
}

.captcha-img img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.captcha-img span {
  font-size: 12px;
  color: var(--text-muted);
}

.send-captcha-btn {
  padding: 0 16px;
  height: 44px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.send-captcha-btn:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.send-captcha-btn:disabled {
  background: var(--text-muted);
  cursor: not-allowed;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  cursor: pointer;
}

.remember-me input {
  width: 16px;
  height: 16px;
  accent-color: var(--color-primary);
}

.forgot-pwd {
  color: var(--color-primary);
  text-decoration: none;
}

.forgot-pwd:hover {
  text-decoration: underline;
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

.btn-submit:hover {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
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
