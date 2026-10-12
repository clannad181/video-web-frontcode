<template>
  <div class="login-page">
    <!-- 动态渐变背景 -->
    <div class="animated-bg">
      <div class="gradient-layer"></div>
      <div class="wave-layer">
        <svg class="wave wave-1" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="rgba(255,255,255,0.1)" d="M0,96L48,112C96,128,192,160,288,165.3C384,171,480,149,576,128C672,107,768,85,864,90.7C960,96,1056,128,1152,138.7C1248,149,1344,139,1392,133.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"/>
        </svg>
        <svg class="wave wave-2" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="rgba(255,255,255,0.05)" d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,128C672,107,768,117,864,138.7C960,160,1056,192,1152,186.7C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"/>
        </svg>
      </div>
      <div class="particles">
        <div class="particle" v-for="i in 20" :key="i" :style="particleStyles[i - 1]"></div>
      </div>
    </div>

    <!-- 登录容器 -->
    <div class="login-container" :class="{ 'show': isLoaded }">
      <!-- 左侧品牌区 -->
      <div class="brand-side">
        <div class="brand-content">
          <div class="logo">
            <svg viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="12" fill="white"/>
              <path d="M18 14L34 24L18 34V14Z" fill="url(#logo-grad)"/>
              <defs>
                <linearGradient id="logo-grad" x1="18" y1="14" x2="34" y2="34">
                  <stop offset="0%" stop-color="#FF6699"/>
                  <stop offset="100%" stop-color="#FF8CB0"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1>VideoHub</h1>
          <p>发现精彩，分享感动</p>
          
          <div class="brand-features">
            <div class="feature" v-for="(item, index) in features" :key="index" :style="{ animationDelay: `${index * 0.15}s` }">
              <span class="feature-icon" v-html="item.icon"></span>
              <span class="feature-text">{{ item.text }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧表单区 -->
      <div class="form-side">
        <div class="form-wrapper">
          <h2>欢迎登录</h2>
          <p class="subtitle">登录后享受更多精彩内容</p>

          <!-- 登录方式切换 -->
          <div class="tabs">
            <button :class="{ active: loginType === 'password' }" @click="loginType = 'password'">账号登录</button>
            <button :class="{ active: loginType === 'email' }" @click="loginType = 'email'">邮箱登录</button>
            <div class="tab-bg" :class="{ move: loginType === 'email' }"></div>
          </div>

          <form @submit.prevent="handleLogin">
            <!-- 账号密码 -->
            <template v-if="loginType === 'password'">
              <div class="input-group">
                <div class="input-box" :class="{ focus: focusField === 'username' }">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  <input v-model="form.username" type="text" placeholder="请输入账号" required 
                    @focus="focusField = 'username'" @blur="focusField = ''"/>
                </div>
              </div>

              <div class="input-group">
                <div class="input-box" :class="{ focus: focusField === 'password' }">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input v-model="form.password" type="password" placeholder="请输入密码" required
                    @focus="focusField = 'password'" @blur="focusField = ''"/>
                </div>
              </div>

              <div class="input-group captcha-group">
                <div class="input-box captcha-input" :class="{ focus: focusField === 'captcha' }">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input v-model="form.captcha" type="text" placeholder="验证码" 
                    @focus="focusField = 'captcha'" @blur="focusField = ''"/>
                </div>
                <div class="captcha-img" @click="refreshCaptcha">
                  <img v-if="captchaImg" :src="captchaImg" alt="验证码"/>
                  <span v-else>加载中</span>
                </div>
              </div>
            </template>

            <!-- 邮箱登录 -->
            <template v-else>
              <div class="input-group">
                <div class="input-box" :class="{ focus: focusField === 'email' }">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <input v-model="form.email" type="email" placeholder="请输入邮箱" required
                    @focus="focusField = 'email'" @blur="focusField = ''"/>
                </div>
              </div>

              <div class="input-group">
                <div class="input-box" :class="{ focus: focusField === 'emailCaptcha' }">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  <input v-model="form.emailCaptcha" type="text" placeholder="请输入验证码"
                    @focus="focusField = 'emailCaptcha'" @blur="focusField = ''"/>
                  <button type="button" class="code-btn" :disabled="captchaCooldown > 0" @click="sendEmailCaptcha">
                    {{ captchaCooldown > 0 ? `${captchaCooldown}s` : '获取验证码' }}
                  </button>
                </div>
              </div>
            </template>

            <!-- 选项 -->
            <div class="options">
              <label class="remember">
                <input type="checkbox" v-model="form.remember"/>
                <span class="check"></span>
                记住我
              </label>
              <a href="#">忘记密码？</a>
            </div>

            <!-- 按钮 -->
            <button type="submit" class="submit-btn" :disabled="isLoading">
              <span v-if="!isLoading">登 录</span>
              <span v-else class="loading-text">
                <i class="spinner"></i> 登录中...
              </span>
            </button>
          </form>

          <!-- 底部 -->
          <div class="footer">
            <div class="divider"><span>其他登录方式</span></div>
            <div class="social">
              <button class="social-btn wechat" title="微信登录" @click="handleSocialLogin('微信')">
                <IconWechat :size="22" />
              </button>
              <button class="social-btn qq" title="QQ登录" @click="handleSocialLogin('QQ')">
                <IconQQ :size="22" />
              </button>
              <button class="social-btn weibo" title="微博登录" @click="handleSocialLogin('微博')">
                <IconWeibo :size="22" />
              </button>
              <button class="social-btn google" title="谷歌登录" @click="handleSocialLogin('谷歌')">
                <IconGoogle :size="22" />
              </button>
            </div>
            <p class="register-link">还没有账号？<router-link to="/register">立即注册</router-link></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getClientCaptcha, clientLogin, getClientUserInfo } from '../api/auth'
import { useAuthStore } from '../stores/auth'
import { ElMessage } from 'element-plus'
import { IconWechat, IconQQ, IconWeibo, IconGoogle } from '../icons'
import md5 from 'md5'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const loginType = ref('password')
const captchaImg = ref('')
const captchaKey = ref('')
const captchaCooldown = ref(0)
const isLoading = ref(false)
const focusField = ref('')
const isLoaded = ref(false)
let cooldownTimer = null

const features = [
  { icon: '🎬', text: '海量高清视频' },
  { icon: '💬', text: '互动弹幕评论' },
  { icon: '📤', text: '一键投稿分享' }
]

const form = ref({
  username: '',
  password: '',
  captcha: '',
  email: '',
  emailCaptcha: '',
  remember: false
})

const particleStyles = Array.from({ length: 20 }, () => ({
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  animationDelay: `${Math.random() * 5}s`,
  animationDuration: `${8 + Math.random() * 7}s`,
  width: `${4 + Math.random() * 6}px`,
  height: `${4 + Math.random() * 6}px`
}))

const handleSocialLogin = (type) => {
  ElMessage.info(`${type}登录功能开发中，敬请期待`)
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
  if (!form.value.email) return ElMessage.warning('请输入邮箱')
  try {
    await getClientCaptcha({ captchaType: 'email_captcha', email: form.value.email })
    ElMessage.success('验证码已发送')
    captchaCooldown.value = 60
    cooldownTimer = setInterval(() => {
      captchaCooldown.value--
      if (captchaCooldown.value <= 0) clearInterval(cooldownTimer)
    }, 1000)
  } catch (e) {
    ElMessage.error('发送验证码失败')
  }
}

const handleLogin = async () => {
  if (isLoading.value) return
  try {
    let loginData = {}
    if (loginType.value === 'password') {
      if (!form.value.username || !form.value.password || !form.value.captcha) return ElMessage.warning('请填写完整信息')
      loginData = { username: form.value.username, password: md5(form.value.password), key: captchaKey.value, captcha: form.value.captcha, loginType: 'img_captcha' }
    } else {
      if (!form.value.email || !form.value.emailCaptcha) return ElMessage.warning('请填写完整信息')
      loginData = { email: form.value.email, captcha: form.value.emailCaptcha, loginType: 'email_captcha' }
    }
    isLoading.value = true
    const res = await clientLogin(loginData)
    if (res) {
      let userInfo = null
      try { userInfo = await getClientUserInfo() } catch {}
      authStore.login(res.accessToken, res.refreshToken, userInfo)
      ElMessage.success('登录成功')
      router.push(route.query.redirect || '/')
    }
  } catch (e) {
    ElMessage.error(e.message || '登录失败')
    refreshCaptcha()
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  refreshCaptcha()
  setTimeout(() => { isLoaded.value = true }, 100)
})

onUnmounted(() => {
  if (cooldownTimer) clearInterval(cooldownTimer)
})
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: #f5f7fa;
}

/* 动态背景 */
.animated-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.gradient-layer {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #FF6699 0%, #FF8CB0 25%, #FFB380 50%, #FFCC66 75%, #FF6699 100%);
  background-size: 400% 400%;
  animation: gradient-flow 15s ease infinite;
}

@keyframes gradient-flow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.wave-layer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 200px;
}

.wave {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 200%;
  height: 100%;
}

.wave-1 {
  animation: wave-flow 12s linear infinite;
}

.wave-2 {
  animation: wave-flow 16s linear infinite reverse;
}

@keyframes wave-flow {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.particles {
  position: absolute;
  inset: 0;
}

.particle {
  position: absolute;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  animation: particle-float linear infinite;
}

@keyframes particle-float {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.6; }
  50% { transform: translateY(-30px) scale(1.2); opacity: 0.3; }
}

/* 登录容器 */
.login-container {
  position: relative;
  z-index: 1;
  display: flex;
  width: 900px;
  min-height: 520px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  opacity: 0;
  transform: translateY(30px) scale(0.95);
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.login-container.show {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* 左侧品牌区 */
.brand-side {
  flex: 1;
  padding: 50px 40px;
  background: linear-gradient(135deg, #FF6699 0%, #FF8CB0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.brand-side::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%);
}

.brand-content {
  position: relative;
  z-index: 1;
  text-align: center;
  color: white;
}

.logo {
  width: 72px;
  height: 72px;
  margin: 0 auto 24px;
}

.logo svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 4px 12px rgba(0,0,0,0.15));
}

.brand-content h1 {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
  letter-spacing: 2px;
}

.brand-content > p {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 40px;
}

.brand-features {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.feature {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  background: rgba(255,255,255,0.15);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  animation: slide-in 0.5s ease-out both;
  transition: transform 0.3s ease, background 0.3s ease;
}

.feature:hover {
  transform: translateX(8px);
  background: rgba(255,255,255,0.25);
}

@keyframes slide-in {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}

.feature-icon {
  font-size: 20px;
}

.feature-text {
  font-size: 14px;
  font-weight: 500;
}

/* 右侧表单区 */
.form-side {
  flex: 1;
  padding: 50px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-wrapper {
  width: 100%;
  max-width: 320px;
}

.form-wrapper h2 {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 14px;
  color: #999;
  margin-bottom: 28px;
}

/* 标签切换 */
.tabs {
  display: flex;
  position: relative;
  background: #f5f5f5;
  border-radius: 10px;
  padding: 4px;
  margin-bottom: 24px;
}

.tabs button {
  flex: 1;
  padding: 12px;
  background: none;
  border: none;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: color 0.3s;
  position: relative;
  z-index: 1;
}

.tabs button.active {
  color: #FF6699;
}

.tab-bg {
  position: absolute;
  top: 4px;
  left: 4px;
  width: calc(50% - 4px);
  height: calc(100% - 8px);
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab-bg.move {
  transform: translateX(100%);
}

/* 输入框 */
.input-group {
  margin-bottom: 16px;
}

.input-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
  height: 50px;
  background: #f8f8f8;
  border: 2px solid transparent;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.input-box.focus {
  background: white;
  border-color: #FF6699;
  box-shadow: 0 0 0 4px rgba(255, 102, 153, 0.1);
}

.input-box svg {
  color: #ccc;
  flex-shrink: 0;
  transition: color 0.3s;
}

.input-box.focus svg {
  color: #FF6699;
}

.input-box input {
  flex: 1;
  height: 100%;
  border: none;
  background: none;
  font-size: 14px;
  color: #333;
  outline: none;
}

.input-box input::placeholder {
  color: #ccc;
}

/* 验证码 */
.captcha-group {
  display: flex;
  gap: 10px;
  width: 100%;
}

.captcha-input {
  flex: 1;
  min-width: 0;
}

.captcha-img {
  width: 100px;
  height: 50px;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s;
  border: 1px solid #eee;
}

.captcha-img:hover {
  border-color: #FF6699;
}

.captcha-img img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.captcha-img span {
  font-size: 12px;
  color: #999;
}

/* 邮箱验证码按钮 */
.code-btn {
  padding: 8px 12px;
  background: none;
  border: none;
  color: #FF6699;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.3s;
  flex-shrink: 0;
}

.code-btn:hover:not(:disabled) {
  color: #FF8CB0;
}

.code-btn:disabled {
  color: #ccc;
  cursor: not-allowed;
}

/* 选项 */
.options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  font-size: 13px;
}

.remember {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #666;
}

.remember input {
  display: none;
}

.check {
  width: 16px;
  height: 16px;
  border: 2px solid #ddd;
  border-radius: 4px;
  position: relative;
  transition: all 0.3s;
}

.remember input:checked + .check {
  background: #FF6699;
  border-color: #FF6699;
}

.remember input:checked + .check::after {
  content: '';
  position: absolute;
  left: 4px;
  top: 1px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.options a {
  color: #999;
  text-decoration: none;
  transition: color 0.3s;
}

.options a:hover {
  color: #FF6699;
}

/* 提交按钮 */
.submit-btn {
  width: 100%;
  height: 48px;
  background: linear-gradient(135deg, #FF6699 0%, #FF8CB0 100%);
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255, 102, 153, 0.35);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 底部 */
.footer {
  margin-top: 32px;
}

.divider {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #eee;
}

.divider span {
  font-size: 12px;
  color: #ccc;
  white-space: nowrap;
}

.social {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 20px;
}

.social-btn {
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 10px;
  background: #f5f5f5;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.social-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.register-link {
  text-align: center;
  font-size: 13px;
  color: #999;
}

.register-link a {
  color: #FF6699;
  text-decoration: none;
  font-weight: 500;
}

.register-link a:hover {
  color: #FF8CB0;
}

/* 响应式 */
@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
    width: 95%;
    max-width: 400px;
    min-height: auto;
  }

  .brand-side {
    padding: 30px;
  }

  .brand-features {
    display: none;
  }

  .form-side {
    padding: 30px;
  }

  .captcha-group {
    flex-direction: column;
  }

  .captcha-img {
    width: 100%;
    height: 50px;
  }
}

/* 减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .gradient-layer,
  .wave,
  .particle,
  .feature {
    animation: none;
  }
  
  .login-container {
    transition: none;
  }
}
</style>
