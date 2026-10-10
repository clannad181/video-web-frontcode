<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">{{ $t('审核设置') }}</h2>
      <p class="page-desc">{{ $t('配置内容审核策略和敏感词过滤规则') }}</p>
    </div>

    <el-card class="settings-card" v-loading="loading">
      <el-form
        ref="formRef"
        :model="form"
        label-width="200px"
        label-position="left"
      >
        <div class="form-section">
          <h3 class="section-title">{{ $t('内容审核') }}</h3>
          <el-divider />
          <el-form-item :label="$t('视频审核')">
            <div class="switch-with-desc">
              <el-switch v-model="form.videoAudit" :active-text="$t('启用')" :inactive-text="$t('禁用')" />
              <span class="field-desc">{{ $t('开启后，新发布的视频需审核通过后才会公开显示；关闭则视频发布无需审核') }}</span>
            </div>
          </el-form-item>
          <el-form-item :label="$t('评论审核')">
            <div class="switch-with-desc">
              <el-switch v-model="form.commentAudit" :active-text="$t('启用')" :inactive-text="$t('禁用')" />
              <span class="field-desc">{{ $t('开启后，新发布的评论需审核通过后才会显示；关闭则评论发布无需审核') }}</span>
            </div>
          </el-form-item>
          <el-form-item :label="$t('自动驳回违规内容')">
            <div class="switch-with-desc">
              <el-switch v-model="form.autoReject" :active-text="$t('启用')" :inactive-text="$t('禁用')" />
              <span class="field-desc">{{ $t('开启后，包含违规内容的提交将被自动驳回') }}</span>
            </div>
          </el-form-item>
        </div>

        <div class="form-section">
          <h3 class="section-title">{{ $t('敏感词过滤') }}</h3>
          <el-divider />
          <el-form-item :label="$t('敏感词过滤')">
            <div class="switch-with-desc">
              <el-switch v-model="form.sensitiveWordFilter" :active-text="$t('启用')" :inactive-text="$t('禁用')" />
              <span class="field-desc">{{ $t('开启后，系统将自动检测并过滤内容中的敏感词') }}</span>
            </div>
          </el-form-item>
          <el-form-item :label="$t('敏感词列表')">
            <div class="sensitive-words-area">
              <div class="tag-list" v-if="form.sensitiveWords.length">
                <el-tag
                  v-for="(word, index) in form.sensitiveWords"
                  :key="index"
                  closable
                  @close="removeWord(index)"
                  type="danger"
                  effect="plain"
                >
                  {{ word }}
                </el-tag>
              </div>
              <div class="word-input-row">
                <el-input
                  v-model="newWord"
                  :placeholder="$t('输入敏感词后按 Enter 添加')"
                  @keyup.enter="addWord"
                />
                <el-button type="danger" plain @click="addWord" :disabled="!newWord.trim()">{{ $t('添加') }}</el-button>
              </div>
              <p class="field-hint">{{ $t('输入敏感词后按 Enter 键添加，点击标签上的 X 可删除') }}</p>
            </div>
          </el-form-item>
        </div>

        <div class="form-section">
          <h3 class="section-title">{{ $t('审核通知') }}</h3>
          <el-divider />
          <el-form-item :label="$t('审核完成通知上传者')">
            <div class="switch-with-desc">
              <el-switch v-model="form.notifyOnAudit" :active-text="$t('启用')" :inactive-text="$t('禁用')" />
              <span class="field-desc">{{ $t('审核完成后向视频上传者发送通知') }}</span>
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
import { useI18n } from 'vue-i18n'
import { getAuditConfig, updateAuditConfig } from '@/api/system'

const { t } = useI18n()

const formRef = ref(null)
const loading = ref(false)
const saving = ref(false)
const newWord = ref('')

const form = ref({
  videoAudit: true,
  commentAudit: true,
  autoReject: false,
  sensitiveWordFilter: true,
  sensitiveWords: [],
  notifyOnAudit: true
})

onMounted(async () => {
  loading.value = true
  try {
    const res = await getAuditConfig()
    if (res.data) {
      form.value = { ...form.value, ...res.data }
    }
  } finally {
    loading.value = false
  }
})

const addWord = () => {
  const word = newWord.value.trim()
  if (word && !form.value.sensitiveWords.includes(word)) {
    form.value.sensitiveWords.push(word)
    newWord.value = ''
  }
}

const removeWord = (index) => {
  form.value.sensitiveWords.splice(index, 1)
}

const handleSave = async () => {
  saving.value = true
  try {
    await updateAuditConfig(form.value)
    ElMessage.success(t('审核设置已保存'))
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

.sensitive-words-area {
  width: 100%;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.word-input-row {
  display: flex;
  gap: 8px;
}

.field-hint {
  font-size: 12px;
  color: #c0c4cc;
  margin: 8px 0 0 0;
}

.form-actions {
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
  margin-top: 8px;
}
</style>
