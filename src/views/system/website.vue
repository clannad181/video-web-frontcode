<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">网站设置</h2>
      <p class="page-desc">管理网站的基本信息和全局配置</p>
    </div>

    <el-card class="settings-card" v-loading="loading">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        label-position="left"
      >
        <div class="form-section">
          <h3 class="section-title">基本信息</h3>
          <el-divider />
          <el-form-item label="网站名称" prop="siteName">
            <el-input v-model="form.siteName" placeholder="请输入网站名称" maxlength="50" show-word-limit />
          </el-form-item>
          <el-form-item label="网站描述" prop="siteDescription">
            <el-input
              v-model="form.siteDescription"
              type="textarea"
              :rows="3"
              placeholder="请输入网站描述"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
          <el-form-item label="网站地址" prop="siteUrl">
            <el-input v-model="form.siteUrl" placeholder="https://example.com" />
          </el-form-item>
          <el-form-item label="默认语言" prop="defaultLanguage">
            <el-select v-model="form.defaultLanguage" placeholder="请选择默认语言" style="width: 100%">
              <el-option label="中文" value="zh-CN" />
              <el-option label="English" value="en" />
            </el-select>
          </el-form-item>
          <el-form-item label="时区选择" prop="timezone">
            <el-select v-model="form.timezone" placeholder="请选择时区" style="width: 100%" filterable>
              <el-option label="(UTC+8:00) 中国标准时间" value="Asia/Shanghai" />
              <el-option label="(UTC+9:00) 日本标准时间" value="Asia/Tokyo" />
              <el-option label="(UTC+0:00) 格林威治标准时间" value="UTC" />
              <el-option label="(UTC-5:00) 美国东部时间" value="America/New_York" />
              <el-option label="(UTC-8:00) 美国太平洋时间" value="America/Los_Angeles" />
              <el-option label="(UTC+1:00) 中欧时间" value="Europe/Berlin" />
              <el-option label="(UTC+0:00) 英国时间" value="Europe/London" />
            </el-select>
          </el-form-item>
        </div>

        <div class="form-section">
          <h3 class="section-title">品牌标识</h3>
          <el-divider />
          <el-form-item label="网站Logo">
            <div class="upload-area">
              <el-upload
                class="logo-uploader"
                :show-file-list="false"
                :before-upload="beforeLogoUpload"
                :on-change="handleLogoChange"
                accept="image/*"
              >
                <img v-if="form.logo" :src="form.logo" class="logo-preview" />
                <div v-else class="logo-placeholder">
                  <el-icon><Plus /></el-icon>
                  <span>点击上传Logo</span>
                </div>
              </el-upload>
              <p class="upload-tip">建议尺寸 200x200，支持 JPG/PNG 格式</p>
            </div>
          </el-form-item>
        </div>

        <div class="form-section">
          <h3 class="section-title">其他信息</h3>
          <el-divider />
          <el-form-item label="备案信息" prop="icp">
            <el-input v-model="form.icp" placeholder="请输入ICP备案号" />
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
import { ref, onMounted, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Check } from '@element-plus/icons-vue'
import { getSystemSettings, updateSystemSettings } from '@/api/system'

const formRef = ref(null)
const loading = ref(false)
const saving = ref(false)

const form = ref({
  siteName: '',
  siteDescription: '',
  siteUrl: '',
  defaultLanguage: 'zh-CN',
  timezone: 'Asia/Shanghai',
  logo: '',
  icp: ''
})

const rules = reactive({
  siteName: [{ required: true, message: '请输入网站名称', trigger: 'blur' }],
  siteUrl: [{ type: 'url', message: '请输入有效的URL地址', trigger: 'blur' }]
})

onMounted(async () => {
  loading.value = true
  try {
    const res = await getSystemSettings()
    if (res.data) {
      form.value = { ...form.value, ...res.data }
    }
  } finally {
    loading.value = false
  }
})

const beforeLogoUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isImage) ElMessage.error('请上传图片文件')
  if (!isLt2M) ElMessage.error('图片大小不能超过 2MB')
  return isImage && isLt2M
}

const handleLogoChange = (file) => {
  if (file.raw) {
    form.value.logo = URL.createObjectURL(file.raw)
  }
}

const handleSave = async () => {
  if (!formRef.value) return
  await formRef.value.validate()
  saving.value = true
  try {
    await updateSystemSettings(form.value)
    ElMessage.success('网站设置已保存')
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

.upload-area {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.logo-uploader {
  :deep(.el-upload) {
    border: 1px dashed #dcdfe6;
    border-radius: 8px;
    cursor: pointer;
    overflow: hidden;
    transition: border-color 0.2s;

    &:hover {
      border-color: #409eff;
    }
  }
}

.logo-preview {
  width: 120px;
  height: 120px;
  display: block;
  object-fit: contain;
}

.logo-placeholder {
  width: 120px;
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #c0c4cc;

  .el-icon {
    font-size: 28px;
  }

  span {
    font-size: 12px;
  }
}

.upload-tip {
  font-size: 12px;
  color: #c0c4cc;
  margin: 0;
}

.form-actions {
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
  margin-top: 8px;
}
</style>
