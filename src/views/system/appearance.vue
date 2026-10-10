<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">{{ $t('外观设置') }}</h2>
      <p class="page-desc">{{ $t('自定义系统的主题、颜色和布局样式') }}</p>
    </div>

    <div class="appearance-layout">
      <div class="appearance-form-area">
        <el-card class="settings-card" v-loading="loading">
          <el-form
            ref="formRef"
            :model="form"
            label-width="120px"
            label-position="left"
          >
            <div class="form-section">
              <h3 class="section-title">{{ $t('主题配色') }}</h3>
              <el-divider />
              <el-form-item :label="$t('主题色')">
                <div class="color-picker-row">
                  <el-color-picker v-model="form.primaryColor" show-alpha />
                  <div class="preset-colors">
                    <div
                      v-for="color in presetColors"
                      :key="color"
                      class="color-dot"
                      :class="{ active: form.primaryColor === color }"
                      :style="{ background: color }"
                      @click="form.primaryColor = color"
                    />
                  </div>
                </div>
              </el-form-item>
            </div>

            <div class="form-section">
              <h3 class="section-title">{{ $t('深色模式') }}</h3>
              <el-divider />
              <el-form-item :label="$t('深色模式')">
                <div class="switch-with-desc">
                  <el-switch v-model="form.darkMode" :active-text="$t('启用')" :inactive-text="$t('禁用')" />
                  <span class="field-desc">{{ $t('切换为深色主题，减少眼部疲劳') }}</span>
                </div>
              </el-form-item>
            </div>

            <div class="form-section">
              <h3 class="section-title">{{ $t('布局设置') }}</h3>
              <el-divider />
              <el-form-item :label="$t('紧凑模式')">
                <div class="switch-with-desc">
                  <el-switch v-model="form.compactMode" :active-text="$t('启用')" :inactive-text="$t('禁用')" />
                  <span class="field-desc">{{ $t('减少元素间距，在屏幕内显示更多内容') }}</span>
                </div>
              </el-form-item>
              <el-form-item :label="$t('侧边栏主题')">
                <el-radio-group v-model="form.sidebarTheme">
                  <el-radio-button value="dark">{{ $t('深色') }}</el-radio-button>
                  <el-radio-button value="light">{{ $t('浅色') }}</el-radio-button>
                </el-radio-group>
              </el-form-item>
              <el-form-item :label="$t('字体大小')">
                <div class="inline-field">
                  <el-slider
                    v-model="form.fontSize"
                    :min="12"
                    :max="18"
                    :step="1"
                    style="flex: 1; margin-right: 16px"
                    show-stops
                    show-input
                  />
                  <span class="field-unit">px</span>
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

      <div class="preview-area">
        <el-card class="preview-card">
          <template #header>
            <span class="preview-title">{{ $t('实时预览') }}</span>
          </template>
          <div class="preview-panel" :class="{ dark: form.darkMode }">
            <div class="preview-sidebar" :class="form.sidebarTheme">
              <div class="preview-logo">V</div>
              <div class="preview-menu-items">
                <div class="preview-menu-item active">
                  <span class="menu-dot"></span>{{ $t('仪表盘') }}
                </div>
                <div class="preview-menu-item">
                  <span class="menu-dot"></span>{{ $t('内容管理') }}
                </div>
                <div class="preview-menu-item">
                  <span class="menu-dot"></span>{{ $t('用户管理') }}
                </div>
              </div>
            </div>
            <div class="preview-main">
              <div class="preview-header" :style="{ backgroundColor: form.primaryColor }">
                <span>Video Admin</span>
              </div>
              <div class="preview-content">
                <div class="preview-card-row">
                  <div class="preview-stat-card" :style="{ borderTopColor: form.primaryColor }">
                    <div class="stat-number">1,234</div>
                    <div class="stat-label">{{ $t('用户数') }}</div>
                  </div>
                  <div class="preview-stat-card" :style="{ borderTopColor: form.primaryColor }">
                    <div class="stat-number">5,678</div>
                    <div class="stat-label">{{ $t('视频数') }}</div>
                  </div>
                </div>
                <div class="preview-text-line" :style="{ fontSize: form.fontSize + 'px' }">
                  {{ $t('示例文本内容') }}
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Check } from '@element-plus/icons-vue'
import { getAppearanceSettings, updateAppearanceSettings } from '@/api/system'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const formRef = ref(null)
const loading = ref(false)
const saving = ref(false)

const presetColors = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399', '#00bfff', '#ff69b4']

const form = ref({
  primaryColor: '#409eff',
  darkMode: false,
  compactMode: false,
  sidebarTheme: 'dark',
  fontSize: 14
})

onMounted(async () => {
  loading.value = true
  try {
    const res = await getAppearanceSettings()
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
    await updateAppearanceSettings(form.value)
    ElMessage.success(t('外观设置已保存'))
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

.appearance-layout {
  display: flex;
  gap: 24px;
}

.appearance-form-area {
  flex: 1;
  min-width: 0;
}

.preview-area {
  width: 400px;
  flex-shrink: 0;
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

.color-picker-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.preset-colors {
  display: flex;
  gap: 8px;
}

.color-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;

  &:hover {
    transform: scale(1.15);
  }

  &.active {
    border-color: #303133;
    box-shadow: 0 0 0 2px #fff, 0 0 0 4px currentColor;
  }
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

.inline-field {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.field-unit {
  font-size: 14px;
  color: #606266;
}

.form-actions {
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
  margin-top: 8px;
}

.preview-card {
  border-radius: 8px;
  position: sticky;
  top: 24px;
}

.preview-title {
  font-size: 16px;
  font-weight: 500;
}

.preview-panel {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
  height: 320px;
  display: flex;
  background: #fff;
  transition: background 0.3s;

  &.dark {
    background: #1d2129;
    color: #fff;

    .preview-main {
      background: #293038;
    }

    .preview-content {
      background: #293038;
    }

    .preview-text-line {
      color: #cfd3dc;
    }
  }
}

.preview-sidebar {
  width: 120px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  padding: 12px 0;
  transition: background 0.3s;

  &.dark {
    background: #21262d;
    color: #cfd3dc;
  }

  &.light {
    background: #f5f7fa;
    color: #303133;
    border-right: 1px solid #e4e7ed;
  }
}

.preview-logo {
  width: 32px;
  height: 32px;
  margin: 0 auto 12px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  color: #fff;
  background: #409eff;
}

.preview-menu-items {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 8px;
}

.preview-menu-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  transition: background 0.2s;

  &.active {
    background: rgba(64, 158, 255, 0.15);
    color: #409eff;
  }
}

.menu-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.5;
}

.preview-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: #f5f7fa;
  transition: background 0.3s;
}

.preview-header {
  height: 36px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
}

.preview-content {
  flex: 1;
  padding: 12px;
  background: #f5f7fa;
  transition: background 0.3s;
}

.preview-card-row {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.preview-stat-card {
  flex: 1;
  background: #fff;
  border-radius: 6px;
  padding: 10px;
  border-top: 3px solid #409eff;
}

.preview-panel.dark .preview-stat-card {
  background: #363d45;
}

.stat-number {
  font-size: 16px;
  font-weight: 700;
  color: #303133;
}

.preview-panel.dark .stat-number {
  color: #e5eaf3;
}

.stat-label {
  font-size: 10px;
  color: #909399;
}

.preview-text-line {
  padding: 8px 12px;
  background: #fff;
  border-radius: 4px;
  font-size: 14px;
  color: #606266;
  transition: font-size 0.2s;
}

.preview-panel.dark .preview-text-line {
  background: #363d45;
  color: #cfd3dc;
}
</style>
