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
        <div class="particle" v-for="i in 20" :key="i" :style="getParticleStyle(i)"></div>
      </div>
    </div>

    <!-- 注册容器 -->
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
          <p>加入我们，开启精彩旅程</p>
          
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
          <h2>创建账号</h2>
          <p class="subtitle">注册后享受更多精彩内容</p>

          <form @submit.prevent="handleRegister">
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
              <div class="input-box" :class="{ focus: focusField === 'nickname' }">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <input v-model="form.nickname" type="text" placeholder="请输入昵称" required
                  @focus="focusField = 'nickname'" @blur="focusField = ''"/>
              </div>
            </div>

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
              <div class="input-box" :class="{ focus: focusField === 'password' }">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input v-model="form.password" type="password" placeholder="请输入密码" required
                  @focus="focusField = 'password'" @blur="focusField = ''"/>
              </div>
            </div>

            <div class="input-group">
              <div class="input-box" :class="{ focus: focusField === 'confirmPassword' }">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input v-model="form.confirmPassword" type="password" placeholder="请确认密码" required
                  @focus="focusField = 'confirmPassword'" @blur="focusField = ''"/>
              </div>
              <p v-if="form.confirmPassword && form.password !== form.confirmPassword" class="error-hint">
                两次输入的密码不一致
              </p>
            </div>

            <!-- 按钮 -->
            <button type="submit" class="submit-btn" :disabled="isLoading || !isFormValid">
              <span v-if="!isLoading">注 册</span>
              <span v-else class="loading-text">
                <i class="spinner"></i> 注册中...
              </span>
            </button>
          </form>

          <!-- 底部 -->
          <div class="footer">
            <p class="register-link">已有账号？<router-link to="/login">立即登录</router-link></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { clientRegister, getClientUserInfo } from '../api/auth'
import { useAuthStore } from '../stores/auth'
import { ElMessage } from 'element-plus'
import md5 from 'md5'

const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(false)
const focusField = ref('')
const isLoaded = ref(false)

const features = [
  { icon: '🎬', text: '海量高清视频' },
  { icon: '💬', text: '互动弹幕评论' },
  { icon: '📤', text: '一键投稿分享' }
]

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

const getParticleStyle = (i) => ({
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  animationDelay: `${Math.random() * 5}s`,
  animationDuration: `${8 + Math.random() * 7}s`,
  width: `${4 + Math.random() * 6}px`,
  height: `${4 + Math.random() * 6}px`
})

const handleRegister = async () => {
  if (isLoading.value || !isFormValid.value) return
  
  if (form.value.password !== form.value.confirmPassword) {
    return ElMessage.warning('两次输入的密码不一致')
  }
  
  try {
    isLoading.value = true
    const registerData = {
      username: form.value.username,
      nickname: form.value.nickname,
      email: form.value.email,
      password: md5(form.value.password)
    }
    
    const res = await clientRegister(registerData)
    if (res) {
      ElMessage.success('注册成功，请登录')
      router.push('/login')
    }
  } catch (e) {
    ElMessage.error(e.message || '注册失败')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  setTimeout(() => { isLoaded.value = true }, 100)
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

/* 注册容器 */
.login-container {
  position: relative;
  z-index: 1;
  display: flex;
  width: 900px;
  min-height: 580px;
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

.error-hint {
  font-size: 12px;
  color: #f56c6c;
  margin-top: 6px;
  margin-left: 4px;
}

/* 提交按钮 */
.submit-btn {
  width: 100%;
  height: 50px;
  margin-top: 8px;
  background: linear-gradient(135deg, #FF6699 0%, #FF8CB0 100%);
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.submit-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #FF8CB0 0%, #FF6699 100%);
  opacity: 0;
  transition: opacity 0.3s;
}

.submit-btn:hover:not(:disabled)::before {
  opacity: 1;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.submit-btn span {
  position: relative;
  z-index: 1;
}

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  vertical-align: middle;
  margin-right: 8px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 底部 */
.footer {
  margin-top: 24px;
  text-align: center;
}

.register-link {
  font-size: 14px;
  color: #999;
  margin: 0;
}

.register-link a {
  color: #FF6699;
  text-decoration: none;
  font-weight: 500;
}

.register-link a:hover {
  text-decoration: underline;
}

/* 响应式 */
@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
    width: 90%;
    max-width: 400px;
  }
  
  .brand-side {
    padding: 30px;
    min-height: auto;
  }
  
  .brand-features {
    display: none;
  }
  
  .form-side {
    padding: 30px;
  }
}
</style>
