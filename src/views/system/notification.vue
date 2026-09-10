<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">通知设置</h2>
      <p class="page-desc">配置系统事件通知和通知方式</p>
    </div>

    <el-card class="settings-card" v-loading="loading">
      <el-form
        ref="formRef"
        :model="form"
        label-width="200px"
        label-position="left"
      >
        <div class="form-section">
          <h3 class="section-title">事件通知</h3>
          <el-divider />
          <el-form-item label="视频审核完成">
            <div class="switch-with-desc">
              <el-switch v-model="form.videoAuditComplete" active-text="启用" inactive-text="禁用" />
              <span class="field-desc">视频审核完成后通知上传者</span>
            </div>
          </el-form-item>
          <el-form-item label="评论被回复">
            <div class="switch-with-desc">
              <el-switch v-model="form.commentReplied" active-text="启用" inactive-text="禁用" />
              <span class="field-desc">用户的评论被回复时发送通知</span>
            </div>
          </el-form-item>
          <el-form-item label="评论被举报">
            <div class="switch-with-desc">
              <el-switch v-model="form.commentReported" active-text="启用" inactive-text="禁用" />
              <span class="field-desc">评论被举报时通知管理员</span>
            </div>
          </el-form-item>
          <el-form-item label="视频被举报">
            <div class="switch-with-desc">
              <el-switch v-model="form.videoReported" active-text="启用" inactive-text="禁用" />
              <span class="field-desc">视频被举报时通知管理员</span>
            </div>
          </el-form-item>
          <el-form-item label="用户注册">
            <div class="switch-with-desc">
              <el-switch v-model="form.userRegistered" active-text="启用" inactive-text="禁用" />
              <span class="field-desc">新用户注册时通知管理员</span>
            </div>
          </el-form-item>
        </div>

        <div class="form-section">
          <h3 class="section-title">通知方式</h3>
          <el-divider />
          <el-form-item label="站内通知">
            <div class="switch-with-desc">
              <el-switch v-model="form.siteNotification" active-text="启用" inactive-text="禁用" />
              <span class="field-desc">在系统内部消息中心显示通知</span>
            </div>
          </el-form-item>
          <el-form-item label="邮件通知">
            <div class="switch-with-desc">
              <el-switch v-model="form.emailNotification" active-text="启用" inactive-text="禁用" />
              <span class="field-desc">通过邮件发送通知信息</span>
            </div>
          </el-form-item>
        </div>

        <div class="form-actions">
          <el-button type="primary" :loading="saving" @click="handleSave">
            <el-icon v-if="!saving"><Check /></el-icon>
            保存设置
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
import { getNotificationSettings, updateNotificationSettings } from '@/api/system'

const formRef = ref(null)
const loading = ref(false)
const saving = ref(false)

const form = ref({
  videoAuditComplete: true,
  commentReplied: true,
  commentReported: true,
  videoReported: true,
  userRegistered: false,
  siteNotification: true,
  emailNotification: false
})

onMounted(async () => {
  loading.value = true
  try {
    const res = await getNotificationSettings()
    if (res.data) {
      form.value = { ...form.value, ...res.data }
    }
  } finally {
    loading.value = false
  }
})

const handleSave = async () => {
  saving.value = true
  try {
    await updateNotificationSettings(form.value)
    ElMessage.success('通知设置已保存')
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

.switch-with-desc {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-desc {
  font-size: 12px;
  color: #909399;
}

.form-actions {
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
  margin-top: 8px;
}
</style>
