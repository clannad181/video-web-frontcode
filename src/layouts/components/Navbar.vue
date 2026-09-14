<template>
  <div class="topbar">
    <div class="topbar-left">
      <div class="hamburger" @click="appStore.toggleSidebar">
        <el-icon :size="20"><Fold v-if="!appStore.sidebar.collapsed" /><Expand v-else /></el-icon>
      </div>
      <div class="breadcrumb">
        <span class="bc-home">🏠</span>
        <span class="bc-sep">/</span>
        <span class="bc-current">{{ route.meta?.title || $t('common.dashboard') }}</span>
      </div>
    </div>

    <div class="topbar-center">
      <div class="search-box" :class="{ focused: searchFocused }">
        <el-icon class="search-icon" :class="{ active: searchFocused }"><Search /></el-icon>
        <input
          v-model="searchQuery"
          class="search-input"
          :placeholder="$t('common.searchPlaceholder') || '搜索视频、用户、评论...'"
          @focus="searchFocused = true"
          @blur="searchFocused = false"
        />
        <kbd v-show="!searchFocused" class="search-shortcut">Ctrl+K</kbd>
      </div>
    </div>

    <div class="topbar-right">
      <div class="action-btn" @click="toggleLanguage">
        <span class="lang-text">{{ appStore.language === 'zh-cn' ? '中文' : 'EN' }}</span>
      </div>

      <div class="action-btn" @click="appStore.toggleDarkMode">
        <el-icon :size="18">
          <Sunny v-if="appStore.darkMode" />
          <Moon v-else />
        </el-icon>
      </div>

      <div class="action-btn" @click="router.push('/notice')">
        <el-icon :size="18"><Bell /></el-icon>
        <span class="notif-dot" />
      </div>

      <div class="user-trigger" ref="userTriggerRef" @click="showDropdown = !showDropdown" @mouseenter="handleAvatarMouseEnter" @mouseleave="handleAvatarMouseLeave">
        <div class="avatar-ring">
          <div class="avatar-inner">
            <img
              v-if="avatarUrl"
              :src="avatarUrl"
              class="avatar-img"
              @error="e => e.target.style.display='none'"
            />
            <span v-else class="avatar-text">{{ initials }}</span>
          </div>
        </div>
        <span class="user-name">{{ userStore.userInfo?.nikeName || 'Admin' }}</span>
        <el-icon class="arrow" :class="{ open: showDropdown }"><ArrowDown /></el-icon>
      </div>

      <transition name="dropdown">
        <div v-if="showDropdown" class="user-dropdown" ref="dropdownRef">
          <div class="dd-header">
            <div class="dd-name">{{ userStore.userInfo?.nikeName || 'Admin' }}</div>
            <div class="dd-role">{{ userStore.userInfo?.roleName || '管理员' }}</div>
          </div>
          <div class="dd-divider" />
          <div class="dd-item" @click="openProfileModal">
            <el-icon><User /></el-icon>编辑资料
          </div>
          <div class="dd-item" @click="router.push('/settings')">
            <el-icon><Setting /></el-icon>系统设置
          </div>
          <div class="dd-divider" />
          <div class="dd-item danger" @click="handleLogout">
            <el-icon><SwitchButton /></el-icon>登出
          </div>
        </div>
      </transition>
    </div>

    <teleport to="body">
      <transition name="modal-fade">
        <div v-if="profileVisible" class="profile-overlay" @click.self="profileVisible = false">
          <div class="profile-modal">
            <div class="modal-header">
              <span>个人中心</span>
              <el-icon class="close-btn" @click="profileVisible = false"><Close /></el-icon>
            </div>
            <div class="modal-body">
              <div class="profile-layout">
                <div class="profile-left">
                  <div class="avatar-upload" @click="fileInputRef?.click()">
                    <img v-if="profileForm.avatarPreview || avatarUrl" :src="profileForm.avatarPreview || avatarUrl" class="preview-img" />
                    <div v-else class="preview-placeholder">{{ initials }}</div>
                    <div class="upload-overlay">
                      <el-icon :size="28"><Upload /></el-icon>
                      <span class="overlay-text">点击上传</span>
                    </div>
                  </div>
                  <input ref="fileInputRef" type="file" accept="image/*" style="display:none" @change="handleAvatarUpload" />
                  <div class="profile-username">{{ userStore.userInfo?.userName || 'administer' }}</div>
                  <div class="profile-email-text">{{ userStore.userInfo?.email || 'user@example.com' }}</div>
                  <button class="view-avatar-btn" @click="showFullAvatar = true">查看头像</button>
                </div>
                <div class="profile-right">
                  <div class="form-group">
                    <label class="form-label">用户名</label>
                    <el-input :model-value="userStore.userInfo?.userName" disabled size="large" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">昵称</label>
                    <el-input v-model="profileForm.nikeName" placeholder="请输入昵称" size="large" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">邮箱</label>
                    <el-input v-model="profileForm.email" :disabled="!profileForm.emailEditing" placeholder="请输入邮箱" size="large" />
                    <span v-if="!profileForm.emailEditing" class="edit-email-link" @click="profileForm.emailEditing = true">修改邮箱</span>
                  </div>
                  <div v-if="profileForm.emailEditing" class="form-group">
                    <div class="code-row">
                      <el-input v-model="profileForm.emailCode" placeholder="请输入验证码" size="large" />
                      <el-button class="code-btn" size="large" :disabled="codeCountdown > 0" @click="handleSendCode">
                        {{ codeCountdown > 0 ? `${codeCountdown}s` : '获取验证码' }}
                      </el-button>
                    </div>
                  </div>
                  <div class="form-group">
                    <label class="form-label">角色</label>
                    <el-input :model-value="userStore.userInfo?.roleName" disabled size="large" />
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <el-button size="large" @click="profileVisible = false">取消</el-button>
              <el-button size="large" type="primary" :loading="profileSaving" class="confirm-btn" @click="handleSaveProfile">确认</el-button>
            </div>
          </div>
        </div>
      </transition>
      <transition name="modal-fade">
        <div v-if="showFullAvatar" class="full-avatar-overlay" @click="showFullAvatar = false">
          <img :src="profileForm.avatarPreview || avatarUrl" class="full-avatar-img" />
        </div>
      </transition>
      <transition name="modal-fade">
        <div v-if="showAvatarTooltip" class="avatar-tooltip-overlay" @click="showAvatarTooltip = false">
          <div class="avatar-tooltip">
            <img :src="avatarUrl" class="avatar-tooltip-img" />
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { logout as logoutApi, getUserInfo as getUserInfoApi, sendEmailCode } from '@/api/auth'
import { clearAuth, setUserInfo } from '@/utils/auth'

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()
const userStore = useUserStore()
const fileBaseUrl = import.meta.env.VITE_FILE_BASE_URL || ''

const searchQuery = ref('')
const searchFocused = ref(false)
const showDropdown = ref(false)
const profileVisible = ref(false)
const showFullAvatar = ref(false)
const profileSaving = ref(false)
const codeCountdown = ref(0)
let codeTimer = null

// 头像悬浮计时器
let avatarHoverTimer = null
const showAvatarTooltip = ref(false)

const userTriggerRef = ref(null)
const dropdownRef = ref(null)
const fileInputRef = ref(null)

const avatarUrl = computed(() => {
  const av = userStore.userInfo?.avatar || userStore.userInfo?.avater
  return av ? fileBaseUrl + av : ''
})

const initials = computed(() => {
  return (userStore.userInfo?.nikeName || 'A')[0].toUpperCase()
})

const profileForm = ref({
  nikeName: '',
  email: '',
  emailEditing: false,
  emailCode: '',
  emailKey: '',
  avatarPreview: '',
  avatarUrl: '',
  uploadProgress: 0
})

function toggleLanguage() {
  const newLang = appStore.language === 'zh-cn' ? 'en' : 'zh-cn'
  appStore.setLanguage(newLang)
}

function openProfileModal() {
  showDropdown.value = false
  profileForm.value = {
    nikeName: userStore.userInfo?.nikeName || '',
    email: userStore.userInfo?.email || '',
    emailEditing: false,
    emailCode: '',
    emailKey: '',
    avatarPreview: '',
    avatarUrl: userStore.userInfo?.avatar || userStore.userInfo?.avater || '',
    uploadProgress: 0
  }
  profileVisible.value = true
}

async function handleAvatarUpload(e) {
  const file = e.target.files[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    ElMessage.warning('请选择图片文件')
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.warning('图片大小不能超过5MB')
    return
  }
  const reader = new FileReader()
  reader.onload = (ev) => {
    profileForm.value.avatarPreview = ev.target.result
  }
  reader.readAsDataURL(file)

  const formData = new FormData()
  formData.append('file', file)
  profileForm.value.uploadProgress = 1
  try {
    const { default: request } = await import('@/utils/request')
    const res = await request.post('/admin/file/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (e.total) profileForm.value.uploadProgress = Math.round((e.loaded / e.total) * 100)
      }
    })
    if (res.code === 200) {
      profileForm.value.avatarUrl = res.data?.url || res.data?.path || ''
      ElMessage.success('头像上传成功')
    }
  } catch {
    ElMessage.error('头像上传失败')
  } finally {
    setTimeout(() => { profileForm.value.uploadProgress = 0 }, 1000)
  }
}

async function handleSendCode() {
  if (!profileForm.value.email) {
    ElMessage.warning('请先输入邮箱')
    return
  }
  try {
    const key = `email_${Date.now()}`
    profileForm.value.emailKey = key
    await sendEmailCode(profileForm.value.email)
    ElMessage.success('验证码已发送')
    codeCountdown.value = 60
    codeTimer = setInterval(() => {
      codeCountdown.value--
      if (codeCountdown.value <= 0) clearInterval(codeTimer)
    }, 1000)
  } catch {
    ElMessage.error('发送验证码失败')
  }
}

async function handleSaveProfile() {
  if (!profileForm.value.nikeName) {
    ElMessage.warning('请输入昵称')
    return
  }
  profileSaving.value = true
  try {
    const { default: request } = await import('@/utils/request')
    const payload = {
      id: userStore.userInfo?.id,
      nikeName: profileForm.value.nikeName
    }
    if (profileForm.value.avatarUrl) payload.avatar = profileForm.value.avatarUrl
    if (profileForm.value.emailEditing && profileForm.value.emailCode) {
      payload.email = profileForm.value.email
      payload.key = profileForm.value.emailKey
      payload.captcha = profileForm.value.emailCode
    }
    const res = await request.post('/admin/user/update', payload)
    if (res.code === 200) {
      const userRes = await getUserInfoApi()
      if (userRes.code === 200) {
        userStore.userInfo = userRes.data
        setUserInfo(userRes.data)
      }
      window.dispatchEvent(new CustomEvent('user-updated'))
      ElMessage.success('保存成功')
      profileVisible.value = false
    } else {
      ElMessage.error(res.data?.message || '保存失败')
    }
  } catch {
    ElMessage.error('保存失败')
  } finally {
    profileSaving.value = false
  }
}

async function handleLogout() {
  showDropdown.value = false
  try {
    await logoutApi()
  } catch {
    console.log('登出接口失败')
  }
  clearAuth()
  localStorage.removeItem('expandedMenus')
  sessionStorage.clear()
  userStore.userInfo = null
  userStore.user = null
  router.push('/login')
}

function handleClickOutside(e) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target) && userTriggerRef.value && !userTriggerRef.value.contains(e.target)) {
    showDropdown.value = false
  }
}

// 头像悬浮事件处理
function handleAvatarMouseEnter() {
  avatarHoverTimer = setTimeout(() => {
    showAvatarTooltip.value = true
  }, 5000)
}

function handleAvatarMouseLeave() {
  if (avatarHoverTimer) {
    clearTimeout(avatarHoverTimer)
    avatarHoverTimer = null
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (codeTimer) clearInterval(codeTimer)
  if (avatarHoverTimer) clearTimeout(avatarHoverTimer)
})
</script>

<style lang="scss" scoped>
.topbar {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  background: var(--card-bg, rgba(255, 255, 255, 0.85));
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-color, rgba(0, 0, 0, 0.06));
  position: sticky;
  top: 0;
  z-index: 999;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.el-button{
    border-radius: 10px !important;
}

.hamburger {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  color: #606266;
  transition: all 0.25s;
  &:hover {
    background: rgba(251, 114, 153, 0.08);
    color: #fb7299;
  }
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #909399;
}
.bc-sep { color: #c0c4cc; }
.bc-current { color: #303133; font-weight: 500; }

.topbar-center {
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 0 20px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  max-width: 480px;
  height: 36px;
  padding: 0 14px;
  background: var(--bg-color, #f5f7fa);
  border: 2px solid transparent;
  border-radius: 999px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  &.focused {
    background: var(--card-bg, #fff);
    border-color: #fb7299;
    box-shadow: 0 0 0 4px rgba(251, 114, 153, 0.15);
  }
}

.search-icon {
  color: #c0c4cc;
  font-size: 15px;
  flex-shrink: 0;
  transition: color 0.2s;
  &.active { color: #fb7299; }
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 13px;
  color: var(--text-primary, #303133);
  outline: none;
  &::placeholder { color: #c0c4cc; }
}

.search-shortcut {
  font-size: 11px;
  color: #c0c4cc;
  background: var(--card-bg, #fff);
  border: 1px solid var(--border-color, #e4e7ed);
  border-radius: 4px;
  padding: 1px 6px;
  font-family: monospace;
  flex-shrink: 0;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.action-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  color: #606266;
  transition: all 0.25s;
  position: relative;
  &:hover {
    background: #f5f7fa;
    color: #fb7299;
  }
}

.lang-text {
  font-size: 13px;
  font-weight: 600;
}

.notif-dot {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  background: #f56c6c;
  border-radius: 50%;
  border: 2px solid #fff;
  animation: dot-pulse 2s ease-in-out infinite;
}
@keyframes dot-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.3); }
}

.user-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px 4px 4px;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.25s;
  &:hover { background: #f5f7fa; }
}

.avatar-ring {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  padding: 2px;
  background: linear-gradient(135deg, #fb7299, #7c5cfc);
  transition: all 0.3s;
  .user-trigger:hover & {
    transform: scale(1.1);
    box-shadow: 0 0 12px rgba(251, 114, 153, 0.4);
  }
}

.avatar-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: var(--card-bg, #fff);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-text {
  font-size: 14px;
  font-weight: 700;
  color: #fb7299;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary, #303133);
}

.arrow {
  font-size: 12px;
  color: var(--text-secondary, #909399);
  transition: transform 0.25s;
  &.open { transform: rotate(180deg); }
}

.user-dropdown {
  position: absolute;
  top: 56px;
  right: 20px;
  width: 200px;
  background: var(--card-bg, #fff);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  padding: 8px 0;
  z-index: 1000;
  border: 1px solid var(--border-color, #f0f2f5);
}

.dd-header {
  padding: 12px 16px 8px;
}
.dd-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #303133);
}
.dd-role {
  font-size: 12px;
  color: var(--text-secondary, #909399);
  margin-top: 2px;
}

.dd-divider {
  height: 1px;
  background: var(--border-color, #f0f2f5);
  margin: 4px 0;
}

.dd-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  font-size: 14px;
  color: var(--text-primary, #303133);
  cursor: pointer;
  transition: all 0.2s;
  &:hover { background: var(--bg-color, #f5f7fa); }
  &.danger {
    color: #f56c6c;
    &:hover { background: rgba(245, 108, 108, 0.1); }
  }
}

.dropdown-enter-active { animation: dd-in 0.2s ease-out; }
.dropdown-leave-active { animation: dd-in 0.15s ease-in reverse; }
@keyframes dd-in {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

.profile-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.profile-modal {
  width: 700px;
  max-width: 90vw;
  max-height: 85vh;
  background: var(--card-bg, #fff);
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 32px;
  font-size: 18px;
  font-weight: 700;
  color: #1a1a2e;
  border-bottom: 1px solid #ebeef5;
}
.close-btn {
  cursor: pointer;
  color: #c0c4cc;
  font-size: 20px;
  transition: color 0.2s;
  &:hover { color: #606266; }
}

.modal-body {
  padding: 32px;
  overflow-y: auto;
}

.profile-layout {
  display: flex;
  gap: 40px;
}

.profile-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 160px;
  flex-shrink: 0;
}

.avatar-upload {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  border: 3px solid #e4e7ed;
  transition: border-color 0.3s;
  &:hover {
    border-color: #00bcd4;
  }
  &:hover .upload-overlay { opacity: 1; }
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #fb7299, #7c5cfc);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  font-weight: 700;
  color: #fff;
}

.upload-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  opacity: 0;
  transition: opacity 0.25s ease;
  gap: 6px;
}

.overlay-text {
  font-size: 12px;
  font-weight: 500;
}

.profile-username {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a2e;
  margin-top: 16px;
}

.profile-email-text {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

.view-avatar-btn {
  margin-top: 16px;
  font-size: 13px;
  font-weight: 500;
  color: #00bcd4;
  background: none;
  border: 1.5px solid #00bcd4;
  border-radius: 20px;
  padding: 6px 18px;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    background: rgba(0, 188, 212, 0.08);
  }
}

.profile-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-width: 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
}

.profile-modal :deep(.el-input__wrapper) {
  border-radius: 10px;
  background-color: #f5f7fa;
  box-shadow: none;
  border: 1px solid #e4e7ed;
  padding: 0 14px;
  height: 42px;
  transition: border-color 0.2s;
}

.profile-modal :deep(.el-input__wrapper:hover) {
  border-color: #c0c4cc;
}

.profile-modal :deep(.el-input.is-disabled .el-input__wrapper) {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  box-shadow: none;
  cursor: default;
}

.profile-modal :deep(.el-input__inner) {
  font-size: 14px;
  color: #303133;
  height: 40px;
  line-height: 40px;
}

.profile-modal :deep(.el-input.is-disabled .el-input__inner) {
  color: #a8abb2;
  -webkit-text-fill-color: #a8abb2;
}

.profile-modal :deep(.el-input__inner::placeholder) {
  color: #c0c4cc;
}

.edit-email-link {
  font-size: 13px;
  font-weight: 600;
  color: #00bcd4;
  cursor: pointer;
  display: inline-block;
  transition: opacity 0.2s;
  &:hover { opacity: 0.75; }
}

.code-row {
  display: flex;
  gap: 10px;
  width: 100%;
  .el-input { flex: 1; }
}

.code-btn {
  flex-shrink: 0;
  border-radius: 10px;
  background: #00bcd4;
  border-color: #00bcd4;
  color: #fff;
  font-weight: 600;
  padding: 0 18px;
  &:hover, &:focus {
    background: #00a5bb;
    border-color: #00a5bb;
    color: #fff;
  }
  &:disabled {
    background: #b2ebf2;
    border-color: #b2ebf2;
    color: #fff;
  }
}

.confirm-btn {
  background: #00bcd4;
  border-color: #00bcd4;
  border-radius: 10px;
  font-weight: 600;
  &:hover, &:focus {
    background: #00a5bb;
    border-color: #00a5bb;
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 32px;
  border-top: 1px solid #ebeef5;
}

.modal-fade-enter-active { animation: modal-in 0.25s ease-out; }
.modal-fade-leave-active { animation: modal-in 0.2s ease-in reverse; }
@keyframes modal-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.full-avatar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  cursor: pointer;
}
.full-avatar-img {
  max-width: 90vw;
  max-height: 90vh;
  border-radius: 8px;
  object-fit: contain;
}

.avatar-tooltip-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2500;
  cursor: pointer;
}

.avatar-tooltip {
  background: transparent;
  border-radius: 16px;
  box-shadow: none;
  animation: tooltip-in 0.3s ease-out;
}

.avatar-tooltip-img {
  max-width: 80vw;
  max-height: 80vh;
  border-radius: 8px;
  object-fit: contain;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

@keyframes tooltip-in {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
</style>
