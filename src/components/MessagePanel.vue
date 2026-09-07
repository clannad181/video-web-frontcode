<template>
  <div class="message-panel" v-show="visible" @mouseenter="$emit('panel-enter')" @mouseleave="$emit('panel-leave')">
    <div class="panel-header">
      <div class="panel-title">
        <h4>消息通知</h4>
        <span v-if="unreadCount > 0" class="unread-badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
      </div>
      <button v-if="unreadCount > 0" class="read-all-btn" @click="handleReadAll" :disabled="readAllLoading">
        {{ readAllLoading ? '处理中...' : '全部已读' }}
      </button>
    </div>

    <div class="panel-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="tab-btn"
        :class="{ active: activeTab === tab.value }"
        @click="switchTab(tab.value)"
      >
        {{ tab.label }}
        <span v-if="tab.count > 0" class="tab-count">{{ tab.count > 99 ? '99+' : tab.count }}</span>
      </button>
    </div>

    <div class="panel-content" ref="contentRef" @scroll="handleScroll">
      <div v-if="loading && messages.length === 0" class="loading-state">
        <div class="loading-spinner"></div>
      </div>

      <div v-else-if="messages.length > 0" class="message-list">
        <div
          v-for="msg in messages"
          :key="msg.id"
          class="message-item"
          :class="{ unread: msg.isRead === 0 }"
          @click="handleMessageClick(msg)"
        >
          <div class="message-icon" :class="'type-' + msg.type">
            <svg v-if="msg.type === 1" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="23 7 16 12 23 17 23 7"/>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
            <svg v-else-if="msg.type === 2" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            <svg v-else-if="msg.type === 3" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <svg v-else-if="msg.type === 5" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <svg v-else-if="msg.type === 6" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
              <line x1="4" y1="22" x2="4" y2="15"/>
            </svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
          </div>
          <div class="message-body">
            <div class="message-title">{{ msg.title }}</div>
            <div class="message-content">{{ msg.content }}</div>
            <div class="message-time">{{ formatTime(msg.createTime) }}</div>
          </div>
          <div v-if="msg.isRead === 0" class="unread-dot"></div>
        </div>
      </div>

      <div v-else class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-opacity="0.3">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        <p>暂无消息</p>
      </div>

      <div v-if="loading && messages.length > 0" class="loading-more">
        <div class="loading-spinner small"></div>
      </div>
      <div v-if="!loading && noMore && messages.length > 0" class="no-more">没有更多了</div>
    </div>

    <div class="panel-footer">
      <router-link to="/messages" class="view-all-link" @click="$emit('panel-leave')">
        查看全部消息
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </router-link>
    </div>
  </div>

  <!-- 消息详情弹窗 -->
  <Teleport to="body">
    <Transition name="msg-overlay">
      <div v-if="showDetailDialog" class="msg-overlay" @click.self="showDetailDialog = false">
        <Transition name="msg-dialog" appear>
          <div v-if="showDetailDialog" class="msg-dialog">
            <div class="msg-dialog-header">
              <div class="msg-dialog-title">
                <div class="msg-dialog-icon" :class="'type-' + detailMessage?.type">
                  <svg v-if="detailMessage?.type === 1" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="23 7 16 12 23 17 23 7"/>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                  </svg>
                  <svg v-else-if="detailMessage?.type === 2" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                  <svg v-else-if="detailMessage?.type === 3" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <svg v-else-if="detailMessage?.type === 5" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  <svg v-else-if="detailMessage?.type === 6" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                    <line x1="4" y1="22" x2="4" y2="15"/>
                  </svg>
                  <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="16" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                  </svg>
                </div>
                <span>{{ detailMessage?.title }}</span>
              </div>
              <button class="msg-dialog-close" @click="showDetailDialog = false">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div class="msg-dialog-body">
              <div class="msg-detail-content">{{ detailMessage?.content }}</div>
              <div class="msg-detail-time">发布时间：{{ detailMessage?.createTime }}</div>
            </div>
            <div class="msg-dialog-footer">
              <button v-if="detailMessage?.bizAvid" class="msg-btn msg-btn-primary" @click="handleDetailAction">
                查看视频
              </button>
              <button class="msg-btn msg-btn-default" @click="showDetailDialog = false">关闭</button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getMessageList, getUnreadCount, markAsRead, markAllAsRead } from '../api/message'
import { useAuthStore } from '../stores/auth'

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['panel-enter', 'panel-leave', 'update:unread-count'])

const router = useRouter()
const authStore = useAuthStore()

const messages = ref([])
const loading = ref(false)
const noMore = ref(false)
const currentPage = ref(1)
const total = ref(0)
const unreadCount = ref(0)
const activeTab = ref(0)
const readAllLoading = ref(false)
const contentRef = ref(null)
const showDetailDialog = ref(false)
const detailMessage = ref(null)

const PAGE_SIZE = 10

const tabs = computed(() => [
  { label: '全部', value: 0, count: 0 },
  { label: '未读', value: -1, count: unreadCount.value }
])

const fetchMessages = async (isLoadMore = false) => {
  if (loading.value) return
  if (isLoadMore && noMore.value) return

  loading.value = true
  try {
    const params = {
      page: isLoadMore ? currentPage.value + 1 : 1,
      size: PAGE_SIZE
    }
    if (activeTab.value === -1) {
      params.isRead = 0
    }

    const res = await getMessageList(params)
    const records = res?.records || []

    if (isLoadMore) {
      messages.value = [...messages.value, ...records]
      currentPage.value++
    } else {
      messages.value = records
      currentPage.value = 1
    }
    total.value = res?.total || 0
    noMore.value = messages.value.length >= total.value || records.length < PAGE_SIZE
  } catch (e) {
    console.error('获取消息列表失败:', e)
  } finally {
    loading.value = false
  }
}

const fetchUnreadCount = async () => {
  try {
    const res = await getUnreadCount()
    unreadCount.value = res || 0
    emit('update:unread-count', unreadCount.value)
  } catch (e) {
    console.error('获取未读数失败:', e)
  }
}

const switchTab = (tab) => {
  activeTab.value = tab
  noMore.value = false
  fetchMessages()
}

const handleMessageClick = async (msg) => {
  if (msg.isRead === 0) {
    try {
      await markAsRead(msg.avid)
      msg.isRead = 1
      unreadCount.value = Math.max(0, unreadCount.value - 1)
      emit('update:unread-count', unreadCount.value)
    } catch (e) {
      console.error('标记已读失败:', e)
    }
  }

  detailMessage.value = msg
  showDetailDialog.value = true
}

const handleDetailAction = () => {
  if (detailMessage.value?.playLink) {
    router.push(detailMessage.value.playLink)
    showDetailDialog.value = false
    emit('panel-leave')
  } else if (detailMessage.value?.bizAvid) {
    router.push(`/client/video/${detailMessage.value.bizAvid}`)
    showDetailDialog.value = false
    emit('panel-leave')
  }
}

const handleReadAll = async () => {
  if (readAllLoading.value) return
  readAllLoading.value = true
  try {
    await markAllAsRead()
    messages.value.forEach(msg => { msg.isRead = 1 })
    unreadCount.value = 0
    emit('update:unread-count', 0)
    ElMessage.success('全部标记已读成功')
  } catch (e) {
    ElMessage.error(e.message || '操作失败')
  } finally {
    readAllLoading.value = false
  }
}

const handleScroll = () => {
  if (!contentRef.value) return
  const { scrollTop, scrollHeight, clientHeight } = contentRef.value
  if (scrollTop + clientHeight >= scrollHeight - 20) {
    fetchMessages(true)
  }
}

const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now - date

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`

  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month}-${day}`
}

watch(() => props.visible, (val) => {
  if (val && authStore.isLoggedIn) {
    fetchMessages()
    fetchUnreadCount()
  }
})

onMounted(() => {
  if (props.visible && authStore.isLoggedIn) {
    fetchUnreadCount()
  }
})
</script>

<style scoped>
.message-panel {
  position: absolute;
  top: calc(100% + 12px);
  left: 50%;
  transform: translateX(-50%);
  width: 380px;
  max-height: 520px;
  background: var(--bg1);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--line_light);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1003;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--line_light);
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.panel-title h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text1);
}

.unread-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: var(--brand_pink);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  border-radius: 9px;
}

.read-all-btn {
  padding: 6px 12px;
  background: transparent;
  border: none;
  color: var(--brand_pink);
  font-size: 13px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.read-all-btn:hover:not(:disabled) {
  opacity: 0.8;
}

.read-all-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.panel-tabs {
  display: flex;
  gap: 4px;
  padding: 12px 20px;
  border-bottom: 1px solid var(--line_light);
}

.tab-btn {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: var(--text3);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  background: var(--bg2);
  color: var(--text1);
}

.tab-btn.active {
  background: rgba(255, 102, 153, 0.1);
  color: var(--brand_pink);
  font-weight: 500;
}

.tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  background: var(--brand_pink);
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  border-radius: 8px;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  min-height: 200px;
  max-height: 340px;
}

.message-list {
  padding: 8px 0;
}

.message-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 20px;
  cursor: pointer;
  transition: background 0.2s;
  position: relative;
}

.message-item:hover {
  background: var(--bg2);
}

.message-item.unread {
  background: rgba(255, 102, 153, 0.03);
}

.message-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.message-icon.type-1 {
  background: rgba(0, 174, 236, 0.1);
  color: var(--brand_blue);
}

.message-icon.type-2 {
  background: rgba(255, 102, 153, 0.1);
  color: var(--brand_pink);
}

.message-icon.type-3 {
  background: rgba(245, 108, 108, 0.1);
  color: #f56c6c;
}

.message-icon.type-4 {
  background: rgba(230, 162, 60, 0.1);
  color: #e6a23c;
}

.message-icon.type-5 {
  background: rgba(102, 177, 255, 0.1);
  color: #67b1ff;
}

.message-icon.type-6 {
  background: rgba(245, 108, 108, 0.1);
  color: #f56c6c;
}

.message-body {
  flex: 1;
  min-width: 0;
}

.message-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text1);
  margin-bottom: 4px;
  line-height: 1.4;
}

.message-content {
  font-size: 13px;
  color: var(--text3);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.message-time {
  font-size: 12px;
  color: var(--text4);
  margin-top: 6px;
}

.unread-dot {
  position: absolute;
  top: 18px;
  left: 10px;
  width: 8px;
  height: 8px;
  background: var(--brand_pink);
  border-radius: 50%;
}

.loading-state,
.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.loading-spinner {
  width: 28px;
  height: 28px;
  border: 3px solid var(--line_regular);
  border-top-color: var(--brand_pink);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.loading-spinner.small {
  width: 20px;
  height: 20px;
  border-width: 2px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
  gap: 12px;
  color: var(--text3);
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

.no-more {
  text-align: center;
  padding: 16px;
  color: var(--text4);
  font-size: 13px;
}

.panel-footer {
  padding: 12px 20px;
  border-top: 1px solid var(--line_light);
  text-align: center;
}

.view-all-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--brand_pink);
  font-size: 14px;
  text-decoration: none;
  transition: opacity 0.2s;
}

.view-all-link:hover {
  opacity: 0.8;
}

/* 消息详情弹窗 */
.msg-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.msg-overlay-enter-active,
.msg-overlay-leave-active {
  transition: opacity 0.2s ease;
}

.msg-overlay-enter-from,
.msg-overlay-leave-to {
  opacity: 0;
}

.msg-dialog {
  width: 480px;
  max-width: 90vw;
  background: var(--bg1);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.msg-dialog-enter-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.msg-dialog-leave-active {
  transition: all 0.2s ease;
}

.msg-dialog-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}

.msg-dialog-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.msg-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--line_light);
}

.msg-dialog-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 600;
  color: var(--text1);
}

.msg-dialog-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.msg-dialog-icon.type-1 {
  background: rgba(0, 174, 236, 0.1);
  color: var(--brand_blue);
}

.msg-dialog-icon.type-2 {
  background: rgba(255, 102, 153, 0.1);
  color: var(--brand_pink);
}

.msg-dialog-icon.type-3 {
  background: rgba(245, 108, 108, 0.1);
  color: #f56c6c;
}

.msg-dialog-icon.type-4 {
  background: rgba(230, 162, 60, 0.1);
  color: #e6a23c;
}

.msg-dialog-icon.type-5 {
  background: rgba(102, 177, 255, 0.1);
  color: #67b1ff;
}

.msg-dialog-icon.type-6 {
  background: rgba(245, 108, 108, 0.1);
  color: #f56c6c;
}

.msg-dialog-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: var(--text3);
  cursor: pointer;
  transition: all 0.2s;
}

.msg-dialog-close:hover {
  background: var(--bg2);
  color: var(--text1);
}

.msg-dialog-body {
  padding: 24px;
}

.msg-detail-content {
  font-size: 15px;
  color: var(--text2);
  line-height: 1.8;
  white-space: pre-wrap;
  word-break: break-word;
}

.msg-detail-time {
  margin-top: 16px;
  font-size: 13px;
  color: var(--text4);
}

.msg-dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid var(--line_light);
}

.msg-btn {
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.msg-btn-primary {
  background: var(--brand_pink);
  color: #fff;
}

.msg-btn-primary:hover {
  background: var(--brand_pink_hover);
}

.msg-btn-default {
  background: var(--bg2);
  color: var(--text2);
}

.msg-btn-default:hover {
  background: var(--bg3);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
