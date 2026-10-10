<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">{{ $t('安全设置') }}</h2>
      <p class="page-desc">{{ $t('管理密码策略、登录安全和访问控制') }}</p>
    </div>

    <el-card class="settings-card" v-loading="loading">
      <el-form
        ref="formRef"
        :model="form"
        label-width="160px"
        label-position="left"
      >
        <div class="form-section">
          <h3 class="section-title">{{ $t('密码策略') }}</h3>
          <el-divider />
          <el-form-item :label="$t('密码最小长度')">
            <div class="inline-field">
              <el-slider
                v-model="form.passwordMinLength"
                :min="6"
                :max="32"
                :step="1"
                style="flex: 1; margin-right: 16px"
                show-stops
              />
              <el-input-number v-model="form.passwordMinLength" :min="6" :max="32" :step="1" />
            </div>
          </el-form-item>
          <el-form-item :label="$t('必须包含大写字母')">
            <el-switch v-model="form.passwordRequireUppercase" :active-text="$t('启用')" :inactive-text="$t('禁用')" />
          </el-form-item>
          <el-form-item :label="$t('必须包含小写字母')">
            <el-switch v-model="form.passwordRequireLowercase" :active-text="$t('启用')" :inactive-text="$t('禁用')" />
          </el-form-item>
          <el-form-item :label="$t('必须包含数字')">
            <el-switch v-model="form.passwordRequireNumber" :active-text="$t('启用')" :inactive-text="$t('禁用')" />
          </el-form-item>
          <el-form-item :label="$t('必须包含特殊字符')">
            <el-switch v-model="form.passwordRequireSpecial" :active-text="$t('启用')" :inactive-text="$t('禁用')" />
          </el-form-item>
        </div>

        <div class="form-section">
          <h3 class="section-title">{{ $t('登录安全') }}</h3>
          <el-divider />
          <el-form-item :label="$t('两步验证')">
            <div class="switch-with-desc">
              <el-switch v-model="form.twoFactorAuth" :active-text="$t('启用')" :inactive-text="$t('禁用')" />
              <span class="field-desc">{{ $t('启用后，用户登录时需要进行额外的身份验证') }}</span>
            </div>
          </el-form-item>
          <el-form-item :label="$t('登录通知')">
            <div class="switch-with-desc">
              <el-switch v-model="form.loginNotification" :active-text="$t('启用')" :inactive-text="$t('禁用')" />
              <span class="field-desc">{{ $t('新设备登录时发送邮件通知管理员') }}</span>
            </div>
          </el-form-item>
        </div>

        <div class="form-section">
          <h3 class="section-title">{{ $t('会话控制') }}</h3>
          <el-divider />
          <el-form-item :label="$t('会话超时时间')">
            <div class="inline-field">
              <el-input-number v-model="form.sessionTimeout" :min="5" :max="1440" :step="5" />
              <el-select v-model="form.sessionTimeoutUnit" style="width: 100px; margin-left: 8px">
                <el-option :label="$t('分钟')" value="minutes" />
                <el-option :label="$t('小时')" value="hours" />
              </el-select>
              <span class="field-hint">{{ $t('无操作后自动退出') }}</span>
            </div>
          </el-form-item>
        </div>

        <div class="form-section">
          <h3 class="section-title">{{ $t('登录锁定') }}</h3>
          <el-divider />
          <el-form-item :label="$t('连续登录失败锁定')">
            <div class="inline-field">
              <span class="field-label">{{ $t('失败') }}</span>
              <el-input-number v-model="form.lockAfterAttempts" :min="3" :max="20" :step="1" />
              <span class="field-label">{{ $t('次后锁定') }}</span>
              <el-input-number v-model="form.lockDuration" :min="5" :max="1440" :step="5" style="margin-left: 16px" />
              <el-select v-model="form.lockDurationUnit" style="width: 100px; margin-left: 8px">
                <el-option :label="$t('分钟')" value="minutes" />
                <el-option :label="$t('小时')" value="hours" />
              </el-select>
            </div>
          </el-form-item>
        </div>

        <div class="form-section">
          <h3 class="section-title">{{ $t('IP 白名单') }}</h3>
          <el-divider />
          <el-form-item :label="$t('白名单列表')">
            <div class="ip-whitelist">
              <div class="tag-list" v-if="form.ipWhitelist.length">
                <el-tag
                  v-for="(ip, index) in form.ipWhitelist"
                  :key="index"
                  closable
                  @close="removeIp(index)"
                  type="success"
                  effect="plain"
                >
                  {{ ip }}
                </el-tag>
              </div>
              <div class="ip-input-row">
                <el-input
                  v-model="newIp"
                  :placeholder="$t('输入IP地址后回车添加')"
                  @keyup.enter="addIp"
                />
                <el-button type="primary" plain @click="addIp" :disabled="!newIp.trim()">{{ $t('添加') }}</el-button>
              </div>
              <p class="field-hint">{{ $t('留空则不限制IP访问，多个IP用回车分隔') }}</p>
            </div>
          </el-form-item>
        </div>

        <div class="form-actions">
          <el-button type="primary" :loading="saving" @click="handleSave">
            <el-icon v-if="!saving"><Check /></el-icon>
            {{ $t('保存设置') }}
          </el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Check } from '@element-plus/icons-vue'
import { getSecuritySettings, updateSecuritySettings } from '@/api/system'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const formRef = ref(null)
const loading = ref(false)
const saving = ref(false)
const newIp = ref('')

const form = ref({
  passwordMinLength: 8,
  passwordRequireUppercase: true,
  passwordRequireLowercase: true,
  passwordRequireNumber: true,
  passwordRequireSpecial: false,
  twoFactorAuth: false,
  loginNotification: true,
  sessionTimeout: 120,
  sessionTimeoutUnit: 'minutes',
  lockAfterAttempts: 5,
  lockDuration: 30,
  lockDurationUnit: 'minutes',
  ipWhitelist: []
})

onMounted(async () => {
  loading.value = true
  try {
    const res = await getSecuritySettings()
    if (res.data) {
      form.value = { ...form.value, ...res.data }
    }
  } finally {
    loading.value = false
  }
})

const addIp = () => {
  const ip = newIp.value.trim()
  if (ip && !form.value.ipWhitelist.includes(ip)) {
    form.value.ipWhitelist.push(ip)
    newIp.value = ''
  }
}

const removeIp = (index) => {
  form.value.ipWhitelist.splice(index, 1)
}

const handleSave = async () => {
  saving.value = true
  try {
    await updateSecuritySettings(form.value)
    ElMessage.success(t('安全设置已保存'))
  } finally {
    saving.value = false
  }
}
</script>

<style lang="scss" scoped>
.page-container {
  padding: 0;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #1d2129;
  margin: 0 0 8px 0;
}

.page-desc {
  font-size: 14px;
  color: #86909c;
  margin: 0;
}

.settings-card {
  border-radius: 8px;

  :deep(.el-card__body) {
    padding: 32px;
  }
}

.form-section {
  margin-bottom: 8px;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #1d2129;
  margin: 0 0 4px 0;
}

.inline-field {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.field-label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}

.field-hint {
  font-size: 12px;
  color: #c0c4cc;
  margin: 4px 0 0 0;
}

.switch-with-desc {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-desc {
  font-size: 12px;
  color: #909399;
}

.ip-whitelist {
  width: 100%;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.ip-input-row {
  display: flex;
  gap: 8px;
}

.form-actions {
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
  margin-top: 8px;
}
</style>
