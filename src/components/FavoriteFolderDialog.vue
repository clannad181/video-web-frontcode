<template>
  <Teleport to="body">
    <Transition name="fav-overlay" mode="out-in">
      <div v-if="visible" class="fav-overlay" @click.self="handleClose">
        <Transition name="fav-dialog" appear>
          <div v-if="visible" class="fav-dialog">
            <div class="fav-dialog-header">
              <h3>{{ isFavorited ? '管理收藏' : '添加到收藏' }}</h3>
              <button class="fav-close-btn" @click="handleClose">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div class="fav-dialog-body">
              <div v-if="loading" class="fav-loading">
                <div class="loading-spinner"></div>
                <span>加载中...</span>
              </div>

              <template v-else>
                <div class="fav-folder-list">
                  <label
                    v-for="folder in folders"
                    :key="folder.folderUid"
                    class="fav-folder-row"
                    :class="{ active: selectedFolderUids.includes(folder.folderUid) }"
                  >
                    <input
                      type="checkbox"
                      :value="folder.folderUid"
                      v-model="selectedFolderUids"
                    />
                    <span class="folder-check">
                      <svg v-if="selectedFolderUids.includes(folder.folderUid)" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    </span>
                    <span class="folder-info">
                      <span class="folder-name">
                        {{ folder.name }}
                        <em v-if="folder.isDefault" class="folder-default-tag">默认</em>
                        <em v-if="folder.isPrivate" class="folder-private-tag">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                          私密
                        </em>
                      </span>
                      <span class="folder-count">{{ folder.count }}个内容</span>
                    </span>
                  </label>
                </div>

                <div class="fav-create-section">
                  <button v-if="!showCreateForm" class="fav-create-btn" @click="showCreateForm = true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    新建收藏夹
                  </button>
                  <div v-else class="fav-create-form">
                    <input
                      v-model="newFolderName"
                      class="fav-create-input"
                      placeholder="收藏夹名称（最多20字）"
                      maxlength="20"
                      @keydown.enter="handleCreateFolder"
                      ref="createInputRef"
                    />
                    <label class="fav-private-check">
                      <input type="checkbox" v-model="newFolderPrivate" />
                      <span class="check-box">
                        <svg v-if="newFolderPrivate" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                      </span>
                      <span>设为私密</span>
                    </label>
                    <div class="fav-create-actions">
                      <button class="fav-create-cancel" @click="cancelCreate">取消</button>
                      <button
                        class="fav-create-confirm"
                        :disabled="!newFolderName.trim() || creating"
                        @click="handleCreateFolder"
                      >{{ creating ? '创建中...' : '创建' }}</button>
                    </div>
                  </div>
                </div>
              </template>
            </div>

            <div class="fav-dialog-footer">
              <button class="fav-btn fav-btn-cancel" @click="handleClose">取消</button>
              <button
                v-if="isFavorited"
                class="fav-btn fav-btn-remove"
                :disabled="submitting"
                @click="handleRemove"
              >取消收藏</button>
              <button
                class="fav-btn fav-btn-confirm"
                :disabled="submitting"
                @click="handleConfirm"
              >{{ submitting ? '处理中...' : '确定' }}</button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { getFavoriteFolderList, createFavoriteFolder, addFavorite, removeFavorite } from '../api/video'

const props = defineProps({
  visible: { type: Boolean, default: false },
  episodeUid: { type: String, default: '' },
  isFavorited: { type: Boolean, default: false },
  favoriteFolderUid: { type: String, default: '' },
  favoriteCount: { type: Number, default: 0 }
})

const emit = defineEmits(['update:visible', 'update:isFavorited', 'update:favoriteCount', 'update:favoriteFolderUid'])

const loading = ref(false)
const submitting = ref(false)
const creating = ref(false)
const folders = ref([])
const selectedFolderUids = ref([])
const showCreateForm = ref(false)
const newFolderName = ref('')
const newFolderPrivate = ref(false)
const createInputRef = ref(null)

watch(() => props.visible, async (val) => {
  if (val) {
    selectedFolderUids.value = props.favoriteFolderUid ? [props.favoriteFolderUid] : []
    await loadFolders()
  }
})

const loadFolders = async () => {
  loading.value = true
  try {
    const res = await getFavoriteFolderList()
    if (res && res.length > 0) {
      folders.value = res
      if (!selectedFolderUids.value.length) {
        const defaultFolder = res.find(f => f.isDefault)
        if (defaultFolder) {
          selectedFolderUids.value = [defaultFolder.folderUid]
        }
      }
    } else {
      folders.value = [{ folderUid: '', name: '默认收藏夹', isDefault: true, isPrivate: false, count: 0 }]
      selectedFolderUids.value = ['']
    }
  } catch (e) {
    console.error('获取收藏夹列表失败:', e)
    ElMessage.error(e.message || '获取收藏夹列表失败')
  } finally {
    loading.value = false
  }
}

const handleCreateFolder = async () => {
  const name = newFolderName.value.trim()
  if (!name || creating.value) return
  creating.value = true
  try {
    const res = await createFavoriteFolder({ name, isPrivate: newFolderPrivate.value })
    ElMessage.success('收藏夹创建成功')
    newFolderName.value = ''
    newFolderPrivate.value = false
    showCreateForm.value = false
    await loadFolders()
    if (res && res.folderUid) {
      selectedFolderUids.value.push(res.folderUid)
    }
  } catch (e) {
    console.error('创建收藏夹失败:', e)
    ElMessage.error(e.message || '创建收藏夹失败')
  } finally {
    creating.value = false
  }
}

const cancelCreate = () => {
  showCreateForm.value = false
  newFolderName.value = ''
  newFolderPrivate.value = false
}

const handleConfirm = async () => {
  if (!selectedFolderUids.value.length || submitting.value) return
  submitting.value = true
  try {
    for (const uid of selectedFolderUids.value) {
      const data = { episodeUid: props.episodeUid }
      if (uid) {
        data.folderUid = uid
      }
      await addFavorite(data)
    }
    ElMessage.success('收藏成功')
    emit('update:isFavorited', true)
    emit('update:favoriteCount', (props.favoriteCount || 0) + selectedFolderUids.value.length)
    emit('update:visible', false)
  } catch (e) {
    console.error('收藏失败:', e)
    ElMessage.error(e.message || '收藏失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

const handleRemove = async () => {
  if (submitting.value) return
  submitting.value = true
  try {
    await removeFavorite({ episodeUid: props.episodeUid })
    ElMessage.success('已取消收藏')
    emit('update:isFavorited', false)
    emit('update:favoriteFolderUid', '')
    emit('update:favoriteCount', Math.max(0, (props.favoriteCount || 0) - 1))
    emit('update:visible', false)
  } catch (e) {
    console.error('取消收藏失败:', e)
    ElMessage.error(e.message || '取消收藏失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

const handleClose = () => {
  emit('update:visible', false)
}
</script>

<style scoped>
.fav-overlay {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
}

.fav-dialog {
  width: 420px;
  max-width: calc(100vw - 40px);
  max-height: 80vh;
  background: var(--bg1);
  border-radius: 8px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.fav-overlay-enter-active .fav-dialog,
.fav-overlay-leave-active .fav-dialog {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.fav-overlay-enter-from .fav-dialog,
.fav-overlay-leave-to .fav-dialog {
  opacity: 0;
  transform: scale(0.95);
}

.fav-overlay-enter-active,
.fav-overlay-leave-active {
  transition: opacity 0.2s ease;
}

.fav-overlay-enter-from,
.fav-overlay-leave-to {
  opacity: 0;
}

.fav-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--line_light);
  flex-shrink: 0;
}

.fav-dialog-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text1);
}

.fav-close-btn {
  width: 30px;
  height: 30px;
  border: none;
  background: transparent;
  border-radius: 4px;
  color: var(--text3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.fav-close-btn:hover {
  background: var(--bg2);
  color: var(--text1);
}

.fav-dialog-body {
  flex: 1;
  padding: 16px 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 120px;
}

.fav-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 32px 0;
  color: var(--text3);
  font-size: 13px;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--line_regular);
  border-top-color: var(--brand_pink);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.fav-folder-list {
  display: flex;
  flex-direction: column;
}

.fav-folder-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.fav-folder-row:hover {
  background: var(--bg2);
}

.fav-folder-row.active {
  background: rgba(0, 174, 236, 0.06);
}

.fav-folder-row input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.folder-check {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1.5px solid var(--line_bold);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s ease;
  color: transparent;
}

.fav-folder-row:hover .folder-check {
  border-color: var(--brand_blue);
}

.fav-folder-row.active .folder-check {
  border-color: var(--brand_blue);
  background: var(--brand_blue);
  color: #fff;
}

.folder-info {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.folder-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text1);
  display: flex;
  align-items: center;
  gap: 6px;
}

.folder-default-tag {
  font-style: normal;
  font-size: 11px;
  font-weight: 500;
  color: var(--brand_blue);
  background: rgba(0, 174, 236, 0.1);
  padding: 1px 6px;
  border-radius: 3px;
}

.folder-private-tag {
  font-style: normal;
  font-size: 11px;
  font-weight: 500;
  color: var(--text3);
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.folder-count {
  font-size: 12.5px;
  color: var(--text3);
  flex-shrink: 0;
}

.fav-create-section {
  border-top: 1px solid var(--line_light);
  padding-top: 12px;
}

.fav-create-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: none;
  border: 1px dashed var(--line_bold);
  border-radius: 6px;
  color: var(--text2);
  font-size: 13px;
  font-family: var(--font-family);
  cursor: pointer;
  transition: all 0.15s ease;
  width: 100%;
  justify-content: center;
}

.fav-create-btn:hover {
  border-color: var(--brand_blue);
  color: var(--brand_blue);
}

.fav-create-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.fav-create-input {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid var(--line_regular);
  border-radius: 6px;
  font-size: 13.5px;
  font-family: var(--font-family);
  color: var(--text1);
  outline: none;
  transition: border-color 0.15s ease;
}

.fav-create-input::placeholder {
  color: var(--text4);
}

.fav-create-input:focus {
  border-color: var(--brand_blue);
}

.fav-private-check {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text2);
  cursor: pointer;
  user-select: none;
}

.fav-private-check input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.check-box {
  width: 16px;
  height: 16px;
  border: 1.5px solid var(--line_bold);
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s ease;
  color: transparent;
}

.fav-private-check:hover .check-box {
  border-color: var(--brand_blue);
}

.fav-private-check input:checked + .check-box {
  border-color: var(--brand_blue);
  background: var(--brand_blue);
  color: #fff;
}

.fav-create-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.fav-create-cancel,
.fav-create-confirm {
  padding: 6px 16px;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  font-family: var(--font-family);
  cursor: pointer;
  transition: all 0.15s ease;
}

.fav-create-cancel {
  background: var(--bg2);
  color: var(--text2);
}

.fav-create-cancel:hover {
  background: var(--graph_bg_thick);
}

.fav-create-confirm {
  background: var(--brand_blue);
  color: #fff;
}

.fav-create-confirm:hover:not(:disabled) {
  background: var(--brand_blue_hover);
}

.fav-create-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.fav-dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 12px 20px;
  border-top: 1px solid var(--line_light);
  flex-shrink: 0;
}

.fav-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  font-family: var(--font-family);
  cursor: pointer;
  transition: all 0.15s ease;
  line-height: 1;
}

.fav-btn-cancel {
  background: var(--bg2);
  color: var(--text2);
}

.fav-btn-cancel:hover {
  background: var(--graph_bg_thick);
  color: var(--text1);
}

.fav-btn-remove {
  background: transparent;
  color: var(--text3);
  border: 1px solid var(--line_regular);
}

.fav-btn-remove:hover:not(:disabled) {
  color: #f56c6c;
  border-color: #f56c6c;
}

.fav-btn-remove:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.fav-btn-confirm {
  background: var(--brand_blue);
  color: #fff;
}

.fav-btn-confirm:hover:not(:disabled) {
  background: var(--brand_blue_hover);
}

.fav-btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .fav-dialog {
    width: 100%;
    max-width: 100vw;
    max-height: 85vh;
    border-radius: 8px 8px 0 0;
    margin-top: auto;
  }

  .fav-overlay {
    align-items: flex-end;
  }
}
</style>
