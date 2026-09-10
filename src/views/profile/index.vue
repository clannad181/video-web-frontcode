<template>
  <div class="profile-page">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card shadow="never" class="profile-card fade-in">
          <div class="profile-header">
            <div class="avatar-wrap">
              <el-avatar :size="120" class="profile-avatar">
                {{ (form.nickname || 'A').charAt(0) }}
              </el-avatar>
              <label class="avatar-upload-btn">
                <input type="file" accept=".jpg,.jpeg,.png" @change="handleAvatarChange" hidden />
                <el-icon :size="16"><Camera /></el-icon>
              </label>
            </div>
            <h2 class="profile-name">{{ form.nickname || form.username }}</h2>
            <p class="profile-email">{{ form.email }}</p>
            <div class="profile-tags">
              <el-tag type="danger" effect="dark" round size="small">管理员</el-tag>
              <el-tag type="warning" effect="dark" round size="small">VIP 会员</el-tag>
            </div>
          </div>
          <el-divider />
          <div class="profile-stats">
            <div class="stat-item">
              <span class="stat-value">128</span>
              <span class="stat-label">登录次数</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">32</span>
              <span class="stat-label">操作记录</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">15</span>
              <span class="stat-label">天前修改</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="16">
        <el-card shadow="never" class="form-card fade-in" style="animation-delay: 0.1s">
          <el-tabs v-model="activeTab" class="profile-tabs">
            <el-tab-pane label="基本信息" name="info">
              <el-form
                ref="infoFormRef"
                :model="form"
                :rules="infoRules"
                label-width="80px"
                class="info-form"
              >
                <el-form-item label="昵称" prop="nickname">
                  <el-input v-model="form.nickname" placeholder="请输入昵称" maxlength="20" show-word-limit />
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                  <div class="email-input-group">
                    <el-input v-model="form.email" placeholder="请输入邮箱" />
                    <el-button type="primary" plain :disabled="codeCountdown > 0" @click="sendCode">
                      {{ codeCountdown > 0 ? `${codeCountdown}s` : '获取验证码' }}
                    </el-button>
                  </div>
                </el-form-item>
                <el-form-item v-if="showEmailCode" label="验证码" prop="emailCode">
                  <el-input v-model="form.emailCode" placeholder="请输入验证码" maxlength="6" />
                </el-form-item>
                <el-form-item label="性别">
                  <el-radio-group v-model="form.gender">
                    <el-radio :value="1">男</el-radio>
                    <el-radio :value="2">女</el-radio>
                    <el-radio :value="0">保密</el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="签名">
                  <el-input
                    v-model="form.signature"
                    type="textarea"
                    :rows="3"
                    placeholder="写点什么介绍下自己..."
                    maxlength="100"
                    show-word-limit
                  />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" :loading="saving" @click="handleSaveInfo">保存修改</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <el-tab-pane label="安全设置" name="security">
              <div class="security-section">
                <h4 class="section-title">修改密码</h4>
                <el-form
                  ref="pwdFormRef"
                  :model="pwdForm"
                  :rules="pwdRules"
                  label-width="100px"
                  class="security-form"
                >
                  <el-form-item label="当前密码" prop="oldPassword">
                    <el-input v-model="pwdForm.oldPassword" type="password" placeholder="请输入当前密码" show-password />
                  </el-form-item>
                  <el-form-item label="新密码" prop="newPassword">
                    <el-input v-model="pwdForm.newPassword" type="password" placeholder="请输入新密码" show-password />
                  </el-form-item>
                  <el-form-item label="确认密码" prop="confirmPassword">
                    <el-input v-model="pwdForm.confirmPassword" type="password" placeholder="请再次输入新密码" show-password />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" :loading="pwdSaving" @click="handleChangePassword">修改密码</el-button>
                  </el-form-item>
                </el-form>
              </div>

              <el-divider />

              <div class="security-section">
                <h4 class="section-title">更换邮箱</h4>
                <el-form
                  ref="emailFormRef"
                  :model="emailForm"
                  :rules="emailRules"
                  label-width="100px"
                  class="security-form"
                >
                  <el-form-item label="当前邮箱">
                    <span class="current-email">{{ form.email }}</span>
                  </el-form-item>
                  <el-form-item label="新邮箱" prop="newEmail">
                    <el-input v-model="emailForm.newEmail" placeholder="请输入新邮箱" />
                  </el-form-item>
                  <el-form-item label="验证码" prop="code">
                    <div class="email-input-group">
                      <el-input v-model="emailForm.code" placeholder="请输入验证码" maxlength="6" />
                      <el-button type="primary" plain :disabled="emailCodeCountdown > 0" @click="sendEmailCode">
                        {{ emailCodeCountdown > 0 ? `${emailCodeCountdown}s` : '获取验证码' }}
                      </el-button>
                    </div>
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" :loading="emailSaving" @click="handleChangeEmail">确认更换</el-button>
                  </el-form-item>
                </el-form>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Camera } from '@element-plus/icons-vue'

const activeTab = ref('info')
const saving = ref(false)
const pwdSaving = ref(false)
const emailSaving = ref(false)
const showEmailCode = ref(false)
const codeCountdown = ref(0)
const emailCodeCountdown = ref(0)

const infoFormRef = ref(null)
const pwdFormRef = ref(null)
const emailFormRef = ref(null)

const form = reactive({
  username: 'admin',
  nickname: '管理员',
  email: 'admin@example.com',
  gender: 1,
  signature: '这是个人简介，介绍一下自己吧',
  avatar: ''
})

const pwdForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const emailForm = reactive({
  newEmail: '',
  code: ''
})

const validateConfirmPwd = (rule, value, callback) => {
  if (value !== pwdForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const infoRules = {
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
}

const pwdRules = {
  oldPassword: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码至少 6 位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirmPwd, trigger: 'blur' }
  ]
}

const emailRules = {
  newEmail: [
    { required: true, message: '请输入新邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  code: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
}

const startCountdown = (target) => {
  target.value = 60
  const timer = setInterval(() => {
    target.value--
    if (target.value <= 0) clearInterval(timer)
  }, 1000)
}

const sendCode = () => {
  showEmailCode.value = true
  startCountdown(codeCountdown)
  ElMessage.success('验证码已发送')
}

const sendEmailCode = () => {
  startCountdown(emailCodeCountdown)
  ElMessage.success('验证码已发送')
}

const handleAvatarChange = (e) => {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    form.avatar = ev.target.result
    ElMessage.success('头像已更新')
  }
  reader.readAsDataURL(file)
}

const handleSaveInfo = async () => {
  await infoFormRef.value.validate()
  saving.value = true
  try {
    await new Promise(r => setTimeout(r, 600))
    ElMessage.success('保存成功')
  } finally {
    saving.value = false
  }
}

const handleChangePassword = async () => {
  await pwdFormRef.value.validate()
  pwdSaving.value = true
  try {
    await new Promise(r => setTimeout(r, 600))
    ElMessage.success('密码修改成功')
    pwdForm.oldPassword = ''
    pwdForm.newPassword = ''
    pwdForm.confirmPassword = ''
  } finally {
    pwdSaving.value = false
  }
}

const handleChangeEmail = async () => {
  await emailFormRef.value.validate()
  emailSaving.value = true
  try {
    await new Promise(r => setTimeout(r, 600))
    form.email = emailForm.newEmail
    ElMessage.success('邮箱更换成功')
    emailForm.newEmail = ''
    emailForm.code = ''
  } finally {
    emailSaving.value = false
  }
}

onMounted(() => {})
</script>

<style lang="scss" scoped>
.profile-page {
  padding: 0;
}

.profile-card {
  border-radius: 12px;
  border: 1px solid #f2f3f5;
}

.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 0;
}

.avatar-wrap {
  position: relative;
  margin-bottom: 16px;
}

.profile-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 42px;
  font-weight: 700;
  border: 4px solid #f2f3f5;
}

.avatar-upload-btn {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #409eff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 2px solid #fff;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.1);
  }
}

.profile-name {
  font-size: 20px;
  font-weight: 700;
  color: #303133;
  margin: 0 0 4px;
}

.profile-email {
  font-size: 13px;
  color: #909399;
  margin: 0 0 12px;
}

.profile-tags {
  display: flex;
  gap: 8px;
}

.profile-stats {
  display: flex;
  justify-content: space-around;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: #303133;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

.form-card {
  border-radius: 12px;
  border: 1px solid #f2f3f5;
}

.profile-tabs {
  :deep(.el-tabs__header) {
    margin: 0 0 20px -4px;
  }

  :deep(.el-tabs__nav-wrap::after) {
    height: 1px;
  }

  :deep(.el-tabs__active-bar) {
    height: 3px;
    border-radius: 3px;
  }
}

.info-form {
  max-width: 480px;
}

.email-input-group {
  display: flex;
  gap: 8px;
  width: 100%;

  .el-input { flex: 1; }
}

.security-section {
  max-width: 480px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 20px;
  padding-left: 10px;
  border-left: 3px solid #409eff;
}

.security-form {
  margin-top: 16px;
}

.current-email {
  font-size: 14px;
  color: #606266;
  line-height: 32px;
}

@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
