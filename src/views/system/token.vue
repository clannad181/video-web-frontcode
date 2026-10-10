<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">{{ $t('令牌安全') }}</h2>
      <p class="page-desc">{{ $t('配置前台和后台的令牌策略与安全选项') }}</p>
    </div>

    <div class="token-layout">
      <div class="token-form-area">
        <el-card class="settings-card" v-loading="loading">
          <el-form
            ref="formRef"
            :model="form"
            label-width="180px"
            label-position="left"
          >
            <div class="form-section">
              <h3 class="section-title">{{ $t('前台令牌') }}</h3>
              <el-divider />
              <el-form-item :label="$t('Access Token 有效期')">
                <div class="token-config">
                  <el-slider
                    v-model="form.frontAccessTokenValue"
                    :min="1"
                    :max="72"
                    :step="1"
                    style="flex: 1; margin-right: 16px"
                    show-stops
                  />
                  <el-input-number v-model="form.frontAccessTokenValue" :min="1" :max="72" :step="1" />
                  <el-select v-model="form.frontAccessTokenUnit" style="width: 100px; margin-left: 8px">
                    <el-option :label="$t('分钟')" value="minutes" />
                    <el-option :label="$t('小时')" value="hours" />
                  </el-select>
                </div>
              </el-form-item>
              <el-form-item :label="$t('Refresh Token 有效期')">
                <div class="token-config">
                  <el-slider
                    v-model="form.frontRefreshTokenValue"
                    :min="1"
                    :max="90"
                    :step="1"
                    style="flex: 1; margin-right: 16px"
                    show-stops
                  />
                  <el-input-number v-model="form.frontRefreshTokenValue" :min="1" :max="90" :step="1" />
                  <el-select v-model="form.frontRefreshTokenUnit" style="width: 100px; margin-left: 8px">
                    <el-option :label="$t('天')" value="days" />
                    <el-option :label="$t('小时')" value="hours" />
                  </el-select>
                </div>
              </el-form-item>
            </div>

            <div class="form-section">
              <h3 class="section-title">{{ $t('后台令牌') }}</h3>
              <el-divider />
              <el-form-item :label="$t('Access Token 有效期')">
                <div class="token-config">
                  <el-slider
                    v-model="form.backAccessTokenValue"
                    :min="1"
                    :max="24"
                    :step="1"
                    style="flex: 1; margin-right: 16px"
                    show-stops
                  />
                  <el-input-number v-model="form.backAccessTokenValue" :min="1" :max="24" :step="1" />
                  <el-select v-model="form.backAccessTokenUnit" style="width: 100px; margin-left: 8px">
                    <el-option :label="$t('小时')" value="hours" />
                    <el-option :label="$t('分钟')" value="minutes" />
                  </el-select>
                </div>
              </el-form-item>
              <el-form-item :label="$t('Refresh Token 有效期')">
                <div class="token-config">
                  <el-slider
                    v-model="form.backRefreshTokenValue"
                    :min="1"
                    :max="30"
                    :step="1"
                    style="flex: 1; margin-right: 16px"
                    show-stops
                  />
                  <el-input-number v-model="form.backRefreshTokenValue" :min="1" :max="30" :step="1" />
                  <el-select v-model="form.backRefreshTokenUnit" style="width: 100px; margin-left: 8px">
                    <el-option :label="$t('天')" value="days" />
                    <el-option :label="$t('小时')" value="hours" />
                  </el-select>
                </div>
              </el-form-item>
            </div>

            <div class="form-section">
              <h3 class="section-title">{{ $t('续签策略') }}</h3>
              <el-divider />
              <el-form-item :label="$t('Token 自动续签')">
                <div class="switch-with-desc">
                  <el-switch v-model="form.autoRenew" :active-text="$t('启用')" :inactive-text="$t('禁用')" />
                  <span class="field-desc">{{ $t('Access Token 过期后自动使用 Refresh Token 续签') }}</span>
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

      <div class="token-diagram-area">
        <el-card class="diagram-card">
          <template #header>
            <span class="diagram-title">{{ $t('Token 工作流程') }}</span>
          </template>
          <div class="token-flow">
            <div class="flow-step client">
              <div class="step-icon">
                <el-icon :size="24"><Monitor /></el-icon>
              </div>
              <div class="step-label">{{ $t('客户端') }}</div>
            </div>

            <div class="flow-arrow">
              <div class="arrow-line"></div>
              <div class="arrow-label">{{ $t('发送凭证') }}</div>
              <div class="arrow-head">&#x25B6;</div>
            </div>

            <div class="flow-step server">
              <div class="step-icon">
                <el-icon :size="24"><Connection /></el-icon>
              </div>
              <div class="step-label">{{ $t('认证服务器') }}</div>
            </div>

            <div class="flow-arrow reverse">
              <div class="arrow-line"></div>
              <div class="arrow-label">{{ $t('签发 Token') }}</div>
              <div class="arrow-head">&#x25C0;</div>
            </div>

            <div class="flow-step tokens">
              <div class="token-pair">
                <div class="token-item access">
                  <div class="token-badge">AT</div>
                  <div class="token-info">
                    <span class="token-name">Access Token</span>
                    <span class="token-expire">{{ $t('有效期较短') }}</span>
                  </div>
                </div>
                <div class="token-item refresh">
                  <div class="token-badge">RT</div>
                  <div class="token-info">
                    <span class="token-name">Refresh Token</span>
                    <span class="token-expire">{{ $t('有效期较长') }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="flow-renew" v-if="form.autoRenew">
              <div class="renew-arrow">&#x21BB;</div>
              <div class="renew-label">{{ $t('自动续签') }}</div>
            </div>
          </div>

          <el-divider />

          <div class="token-stats">
            <div class="stat-item">
              <span class="stat-value">{{ form.issuedTokens || 0 }}</span>
              <span class="stat-label">{{ $t('已发放') }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ form.activeTokens || 0 }}</span>
              <span class="stat-label">{{ $t('活跃中') }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ form.algorithm || 'HS256' }}</span>
              <span class="stat-label">{{ $t('签名算法') }}</span>
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
import { Check, Monitor, Connection } from '@element-plus/icons-vue'
import { getTokenSettings, updateTokenSettings } from '@/api/system'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const formRef = ref(null)
const loading = ref(false)
const saving = ref(false)

const form = ref({
  frontAccessTokenValue: 2,
  frontAccessTokenUnit: 'hours',
  frontRefreshTokenValue: 7,
  frontRefreshTokenUnit: 'days',
  backAccessTokenValue: 8,
  backAccessTokenUnit: 'hours',
  backRefreshTokenValue: 30,
  backRefreshTokenUnit: 'days',
  autoRenew: true,
  algorithm: 'HS256',
  issuedTokens: 0,
  activeTokens: 0
})

onMounted(async () => {
  loading.value = true
  try {
    const res = await getTokenSettings()
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
    await updateTokenSettings(form.value)
    ElMessage.success(t('令牌设置已保存'))
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

.token-layout {
  display: flex;
  gap: 24px;
}

.token-form-area {
  flex: 1;
  min-width: 0;
}

.token-diagram-area {
  width: 360px;
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

.token-config {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
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

.diagram-card {
  border-radius: 8px;
  position: sticky;
  top: 24px;
}

.diagram-title {
  font-size: 16px;
  font-weight: 500;
}

.token-flow {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 0;
}

.flow-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.step-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;

  &.client {
    background: #ecf5ff;
    color: #409eff;
  }

  &.server {
    background: #f0f9eb;
    color: #67c23a;
  }

  &.tokens {
    width: auto;
    height: auto;
    background: none;
  }
}

.step-label {
  font-size: 13px;
  font-weight: 500;
  color: #303133;
}

.flow-arrow {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #909399;
  font-size: 12px;

  &.reverse {
    flex-direction: row-reverse;
  }
}

.arrow-line {
  width: 40px;
  height: 1px;
  background: #dcdfe6;
}

.arrow-label {
  white-space: nowrap;
}

.arrow-head {
  font-size: 10px;
}

.token-pair {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.token-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 8px;
  background: #f5f7fa;

  &.access {
    border-left: 3px solid #409eff;
  }

  &.refresh {
    border-left: 3px solid #67c23a;
  }
}

.token-badge {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #fff;

  .access & {
    background: #409eff;
  }

  .refresh & {
    background: #67c23a;
  }
}

.token-info {
  display: flex;
  flex-direction: column;
}

.token-name {
  font-size: 13px;
  font-weight: 500;
  color: #303133;
}

.token-expire {
  font-size: 11px;
  color: #909399;
}

.flow-renew {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #e6a23c;
  font-size: 12px;
  margin-top: 4px;
}

.renew-arrow {
  font-size: 18px;
}

.token-stats {
  display: flex;
  justify-content: space-around;
  padding-top: 8px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}
</style>
