<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">默认设置</h2>
      <p class="page-desc">配置系统中各项功能的默认值</p>
    </div>

    <el-card class="settings-card" v-loading="loading">
      <el-form
        ref="formRef"
        :model="form"
        label-width="140px"
        label-position="left"
      >
        <div class="form-section">
          <h3 class="section-title">用户设置</h3>
          <el-divider />
          <el-form-item label="默认角色">
            <el-select v-model="form.defaultRole" placeholder="请选择默认角色" style="width: 100%">
              <el-option label="普通用户" value="user" />
              <el-option label="内容编辑" value="editor" />
              <el-option label="审核员" value="reviewer" />
            </el-select>
          </el-form-item>
          <el-form-item label="新用户默认启用">
            <div class="switch-with-desc">
              <el-switch v-model="form.userEnabled" active-text="启用" inactive-text="禁用" />
              <span class="field-desc">新注册的用户账号默认为启用状态</span>
            </div>
          </el-form-item>
        </div>

        <div class="form-section">
          <h3 class="section-title">内容设置</h3>
          <el-divider />
          <el-form-item label="默认分类">
            <el-select v-model="form.defaultCategory" placeholder="视频未指定分类时的兜底分类" style="width: 100%">
              <el-option label="未分类" value="uncategorized" />
              <el-option label="综合" value="general" />
              <el-option label="热门" value="popular" />
              <el-option label="推荐" value="recommended" />
            </el-select>
          </el-form-item>
          <el-form-item label="默认视频状态">
            <el-select v-model="form.defaultVideoStatus" placeholder="请选择默认视频状态" style="width: 100%">
              <el-option label="待发布" value="pending" />
              <el-option label="已发布" value="published" />
              <el-option label="草稿" value="draft" />
            </el-select>
          </el-form-item>
        </div>

        <div class="form-section">
          <h3 class="section-title">互动设置</h3>
          <el-divider />
          <el-form-item label="评论默认状态">
            <el-select v-model="form.defaultCommentStatus" placeholder="请选择评论默认状态" style="width: 100%">
              <el-option label="正常" value="normal" />
              <el-option label="待审核" value="pending" />
            </el-select>
          </el-form-item>
          <el-form-item label="弹幕默认状态">
            <el-select v-model="form.defaultDanmakuStatus" placeholder="请选择弹幕默认状态" style="width: 100%">
              <el-option label="正常" value="normal" />
              <el-option label="待审核" value="pending" />
            </el-select>
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
import { getDefaultSettings, updateDefaultSettings } from '@/api/system'

const formRef = ref(null)
const loading = ref(false)
const saving = ref(false)

const form = ref({
  defaultRole: 'user',
  userEnabled: true,
  defaultCategory: 'uncategorized',
  defaultVideoStatus: 'pending',
  defaultCommentStatus: 'normal',
  defaultDanmakuStatus: 'normal'
})

onMounted(async () => {
  loading.value = true
  try {
    const res = await getDefaultSettings()
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
    await updateDefaultSettings(form.value)
    ElMessage.success('默认设置已保存')
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
