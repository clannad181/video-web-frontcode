<template>
  <div class="messages-page">
    <AppHeader />
    <div class="page-content">
      <div class="page-header">
        <div class="header-left">
          <h1 class="page-title">消息中心</h1>
          <p class="page-subtitle">管理和查看您的所有通知</p>
        </div>
        <div class="header-stats" v-if="unreadCount > 0">
          <div class="stat-card">
            <span class="stat-number">{{ unreadCount }}</span>
            <span class="stat-label">未读消息</span>
          </div>
        </div>
      </div>

      <div class="messages-container">
        <aside class="sidebar">
          <div class="sidebar-section">
            <div class="section-title">消息分类</div>
            <nav class="sidebar-nav">
              <a class="nav-item" :class="{ active: activeTab === 0 }" @click.prevent="switchTab(0)">
                <span class="nav-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <path d="M3 9h18"/>
                    <path d="M9 21V9"/>
                  </svg>
                </span>
                <span class="nav-text">全部消息</span>
              </a>
              <a class="nav-item" :class="{ active: activeTab === -1 }" @click.prevent="switchTab(-1)">
                <span class="nav-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 8v4"/>
                    <path d="M12 16h.01"/>
                  </svg>
                </span>
                <span class="nav-text">未读消息</span>
                <span v-if="unreadCount > 0" class="nav-badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
              </a>
            </nav>
          </div>

          <div class="sidebar-section">
            <div class="section-title">消息类型</div>
            <nav class="sidebar-nav">
              <a class="nav-item" :class="{ active: activeTab === 1 }" @click.prevent="switchTab(1)">
                <span class="nav-icon type-1">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="23 7 16 12 23 17 23 7"/>
                    <rect x="1" y="5" width="15" height="14" rx="2"/>
                  </svg>
                </span>
                <span class="nav-text">视频发布</span>
              </a>
              <a class="nav-item" :class="{ active: activeTab === 2 }" @click.prevent="switchTab(2)">
                <span class="nav-icon type-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                </span>
                <span class="nav-text">审核通知</span>
              </a>
              <a class="nav-item" :class="{ active: activeTab === 3 }" @click.prevent="switchTab(3)">
                <span class="nav-icon type-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </span>
                <span class="nav-text">下架通知</span>
              </a>
              <a class="nav-item" :class="{ active: activeTab === 5 }" @click.prevent="switchTab(5)">
                <span class="nav-icon type-5">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </span>
                <span class="nav-text">评论消息</span>
              </a>
              <a class="nav-item" :class="{ active: activeTab === 6 }" @click.prevent="switchTab(6)">
                <span class="nav-icon type-6">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                    <line x1="4" y1="22" x2="4" y2="15"/>
                  </svg>
                </span>
                <span class="nav-text">举报消息</span>
              </a>
            </nav>
          </div>

          <!-- <div class="sidebar-actions">
            <button v-if="unreadCount > 0" class="action-btn" @click="handleReadAll" :disabled="readAllLoading">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 11 12 14 22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
              {{ readAllLoading ? '处理中...' : '全部已读' }}
            </button>
          </div> -->
        </aside>

        <main class="main-content">
          <div class="content-header">
            <h2 class="content-title">{{ getTabTitle() }}</h2>
            <span class="content-count">共 {{ total }} 条</span>
          </div>

          <div class="messages-list" ref="contentRef" @scroll="handleScroll">
            <div v-if="loading && messages.length === 0" class="loading-state">
              <div class="loading-spinner"></div>
              <span>加载中...</span>
            </div>

            <template v-else-if="messages.length > 0">
              <TransitionGroup name="message-item">
                <div
                  v-for="msg in messages"
                  :key="msg.id"
                  class="message-item"
                  :class="{ unread: msg.isRead === 0 }"
                  @click="handleMessageClick(msg)"
                >
                  <div class="item-icon" :class="'type-' + msg.type">
                    <svg v-if="msg.type === 1" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polygon points="23 7 16 12 23 17 23 7"/>
                      <rect x="1" y="5" width="15" height="14" rx="2"/>
                    </svg>
                    <svg v-else-if="msg.type === 2" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                    </svg>
                    <svg v-else-if="msg.type === 3" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    <svg v-else-if="msg.type === 5" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    <svg v-else-if="msg.type === 6" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                      <line x1="4" y1="22" x2="4" y2="15"/>
                    </svg>
                    <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="16" x2="12" y2="12"/>
                      <line x1="12" y1="8" x2="12.01" y2="8"/>
                    </svg>
                  </div>
                  <div class="item-content">
                    <div class="item-header">
                      <span class="item-title">{{ msg.title }}</span>
                      <span class="item-time">{{ formatTime(msg.createTime) }}</span>
                    </div>
                    <div class="item-desc">{{ msg.content }}</div>
                    <div v-if="msg.bizAvid" class="item-action">
                      <span class="action-link">查看视频 →</span>
                    </div>
                  </div>
                  <div v-if="msg.isRead === 0" class="unread-dot"></div>
                </div>
              </TransitionGroup>

              <div v-if="loading && messages.length > 0" class="loading-more">
                <div class="loading-spinner small"></div>
                <span>加载中...</span>
              </div>
              <div v-else-if="noMore" class="no-more">
                <span class="no-more-line"></span>
                <span class="no-more-text">没有更多了</span>
                <span class="no-more-line"></span>
              </div>
            </template>

            <div v-else class="empty-state">
              <div class="empty-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </div>
              <p class="empty-title">暂无消息</p>
              <p class="empty-desc">当有新消息时，将会在这里显示</p>
            </div>
          </div>
        </main>
      </div>
    </div>

    <!-- 消息详情弹窗 -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showDetailDialog" class="modal-overlay" @click.self="showDetailDialog = false">
          <Transition name="modal-content" appear>
            <div v-if="showDetailDialog" class="modal-dialog">
              <div class="modal-header">
                <div class="modal-title-group">
                  <div class="modal-icon" :class="'type-' + detailMessage?.type">
                    <svg v-if="detailMessage?.type === 1" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polygon points="23 7 16 12 23 17 23 7"/>
                      <rect x="1" y="5" width="15" height="14" rx="2"/>
                    </svg>
                    <svg v-else-if="detailMessage?.type === 2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                    </svg>
                    <svg v-else-if="detailMessage?.type === 3" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    <svg v-else-if="detailMessage?.type === 5" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    <svg v-else-if="detailMessage?.type === 6" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                      <line x1="4" y1="22" x2="4" y2="15"/>
                    </svg>
                    <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="16" x2="12" y2="12"/>
                      <line x1="12" y1="8" x2="12.01" y2="8"/>
                    </svg>
                  </div>
                  <h3 class="modal-title">{{ detailMessage?.title }}</h3>
                </div>
                <button class="modal-close" @click="showDetailDialog = false">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              <div class="modal-body">
                <div class="modal-content-text">{{ detailMessage?.content }}</div>
                <div class="modal-meta">
                  <span class="meta-tag">{{ getTypeName(detailMessage?.type) }}</span>
                  <span class="meta-time">{{ detailMessage?.createTime }}</span>
                </div>
              </div>
              <div class="modal-footer">
                <button v-if="detailMessage?.bizAvid" class="btn btn-primary" @click="handleDetailAction">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                  查看视频
                </button>
                <button class="btn btn-ghost" @click="showDetailDialog = false">关闭</button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import AppHeader from '../components/layout/AppHeader.vue'
import { getMessageList, getUnreadCount, markAsRead, markAllAsRead } from '../api/message'
import { useAuthStore } from '../stores/auth'
import { useMessageWebSocket } from '../composables/useMessageWebSocket'
import config from '../config'

const router = useRouter()
const authStore = useAuthStore()
const { connect, disconnect, onMessage } = useMessageWebSocket()

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

const PAGE_SIZE = 20

const tabTitles = {
  0: '全部消息',
  '-1': '未读消息',
  1: '视频发布',
  2: '审核通知',
  3: '下架通知',
  5: '评论消息',
  6: '举报消息'
}

const typeNames = {
  1: '视频发布',
  2: '审核通知',
  3: '下架通知',
  5: '评论消息',
  6: '举报消息'
}

const getTabTitle = () => tabTitles[activeTab.value] || '全部消息'
const getTypeName = (type) => typeNames[type] || '系统通知'

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
    } else if (activeTab.value > 0) {
      params.type = activeTab.value
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
  } else if (detailMessage.value?.bizAvid) {
    router.push(`/client/video/${detailMessage.value.bizAvid}`)
    showDetailDialog.value = false
  }
}

const handleReadAll = async () => {
  if (readAllLoading.value) return
  readAllLoading.value = true
  try {
    await markAllAsRead()
    messages.value.forEach(msg => { msg.isRead = 1 })
    unreadCount.value = 0
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
  if (scrollTop + clientHeight >= scrollHeight - 100) {
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

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  
  if (year === now.getFullYear()) {
    return `${month}-${day} ${hours}:${minutes}`
  }
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

const handleNewMessage = (msg) => {
  if (msg && msg.avid) {
    const newMessage = {
      id: msg.id || Date.now(),
      avid: msg.avid,
      title: msg.title || '新消息',
      content: msg.content || '',
      type: msg.type || 4,
      isRead: 0,
      createTime: msg.createTime || new Date().toISOString(),
      bizAvid: msg.bizAvid || null
    }
    
    messages.value.unshift(newMessage)
    total.value++
    unreadCount.value++
    
    if (activeTab.value === -1) {
      fetchMessages()
    }
  }
}

onMounted(() => {
  if (authStore.isLoggedIn) {
    fetchMessages()
    fetchUnreadCount()
    if (config.websocket.enabled) {
      connect()
      onMessage(handleNewMessage)
    }
  }
})

onUnmounted(() => {
  if (config.websocket.enabled) {
    disconnect()
  }
})
</script>

<style scoped>
.messages-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
}

.page-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 88px 40px 40px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 32px;
}

.header-left {
  flex: 1;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text1);
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 15px;
  color: var(--text4);
  margin: 0;
}

.header-stats {
  display: flex;
  gap: 16px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 28px;
  background: linear-gradient(135deg, var(--brand_pink) 0%, #ff8cb0 100%);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(255, 102, 153, 0.3);
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  color: #fff;
  line-height: 1;
}

.stat-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  margin-top: 6px;
}

.messages-container {
  display: flex;
  gap: 24px;
}

.sidebar {
  width: 240px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sidebar-section {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text4);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
  padding-left: 4px;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 10px;
  color: var(--text3);
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background: var(--bg2);
  color: var(--text1);
}

.nav-item.active {
  background: linear-gradient(135deg, rgba(255, 102, 153, 0.12) 0%, rgba(255, 102, 153, 0.08) 100%);
  color: var(--brand_pink);
}

.nav-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--bg2);
  flex-shrink: 0;
}

.nav-item.active .nav-icon {
  background: var(--brand_pink);
  color: #fff;
}

.nav-icon.type-1 { background: rgba(0, 174, 236, 0.1); color: var(--brand_blue); }
.nav-icon.type-2 { background: rgba(255, 102, 153, 0.1); color: var(--brand_pink); }
.nav-icon.type-3 { background: rgba(245, 108, 108, 0.1); color: #f56c6c; }
.nav-icon.type-4 { background: rgba(230, 162, 60, 0.1); color: #e6a23c; }
.nav-icon.type-5 { background: rgba(102, 177, 255, 0.1); color: #67b1ff; }
.nav-icon.type-6 { background: rgba(245, 108, 108, 0.1); color: #f56c6c; }

.nav-item.active .nav-icon.type-1,
.nav-item.active .nav-icon.type-2,
.nav-item.active .nav-icon.type-3,
.nav-item.active .nav-icon.type-4,
.nav-item.active .nav-icon.type-5,
.nav-item.active .nav-icon.type-6 {
  background: var(--brand_pink);
  color: #fff;
}

.nav-text {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
}

.nav-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: var(--brand_pink);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  border-radius: 10px;
}

.sidebar-actions {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.action-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 20px;
  background: linear-gradient(135deg, var(--brand_pink) 0%, #ff8cb0 100%);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(255, 102, 153, 0.3);
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(255, 102, 153, 0.4);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.main-content {
  flex: 1;
  min-width: 0;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 28px;
  border-bottom: 1px solid var(--line_light);
}

.content-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text1);
  margin: 0;
}

.content-count {
  font-size: 14px;
  color: var(--text4);
}

.messages-list {
  height: calc(100vh - 280px);
  overflow-y: auto;
  padding: 16px;
}

.message-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
  margin-bottom: 8px;
  background: var(--bg2);
}

.message-item:hover {
  background: var(--bg3);
  transform: translateX(4px);
}

.message-item.unread {
  background: linear-gradient(135deg, rgba(255, 102, 153, 0.06) 0%, rgba(255, 102, 153, 0.03) 100%);
  border-left: 3px solid var(--brand_pink);
}

.item-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.item-icon.type-1 {
  background: linear-gradient(135deg, rgba(0, 174, 236, 0.15) 0%, rgba(0, 174, 236, 0.08) 100%);
  color: var(--brand_blue);
}

.item-icon.type-2 {
  background: linear-gradient(135deg, rgba(255, 102, 153, 0.15) 0%, rgba(255, 102, 153, 0.08) 100%);
  color: var(--brand_pink);
}

.item-icon.type-3 {
  background: linear-gradient(135deg, rgba(245, 108, 108, 0.15) 0%, rgba(245, 108, 108, 0.08) 100%);
  color: #f56c6c;
}

.item-icon.type-4 {
  background: linear-gradient(135deg, rgba(230, 162, 60, 0.15) 0%, rgba(230, 162, 60, 0.08) 100%);
  color: #e6a23c;
}

.item-icon.type-5 {
  background: linear-gradient(135deg, rgba(102, 177, 255, 0.15) 0%, rgba(102, 177, 255, 0.08) 100%);
  color: #67b1ff;
}

.item-icon.type-6 {
  background: linear-gradient(135deg, rgba(245, 108, 108, 0.15) 0%, rgba(245, 108, 108, 0.08) 100%);
  color: #f56c6c;
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.item-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text1);
}

.item-time {
  font-size: 13px;
  color: var(--text4);
  flex-shrink: 0;
}

.item-desc {
  font-size: 14px;
  color: var(--text3);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-action {
  margin-top: 12px;
}

.action-link {
  font-size: 13px;
  color: var(--brand_pink);
  font-weight: 500;
}

.unread-dot {
  position: absolute;
  top: 24px;
  left: 12px;
  width: 8px;
  height: 8px;
  background: var(--brand_pink);
  border-radius: 50%;
  box-shadow: 0 0 0 3px rgba(255, 102, 153, 0.2);
}

.message-item-enter-active,
.message-item-leave-active {
  transition: all 0.3s ease;
}

.message-item-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.message-item-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.loading-state,
.loading-more {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 60px;
  color: var(--text3);
}

.loading-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--line_regular);
  border-top-color: var(--brand_pink);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-spinner.small {
  width: 24px;
  height: 24px;
  border-width: 2px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 40px;
  gap: 16px;
}

.empty-icon {
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(255, 102, 153, 0.1) 0%, rgba(255, 102, 153, 0.05) 100%);
  border-radius: 50%;
  color: var(--brand_pink);
  opacity: 0.6;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text2);
  margin: 0;
}

.empty-desc {
  font-size: 14px;
  color: var(--text4);
  margin: 0;
}

.no-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 24px;
}

.no-more-line {
  flex: 1;
  height: 1px;
  background: var(--line_light);
}

.no-more-text {
  font-size: 13px;
  color: var(--text4);
  white-space: nowrap;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-dialog {
  width: 540px;
  max-width: 90vw;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.modal-content-enter-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-content-leave-active {
  transition: all 0.2s ease;
}

.modal-content-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}

.modal-content-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 28px;
  border-bottom: 1px solid var(--line_light);
}

.modal-title-group {
  display: flex;
  align-items: center;
  gap: 16px;
}

.modal-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.modal-icon.type-1 {
  background: linear-gradient(135deg, rgba(0, 174, 236, 0.15) 0%, rgba(0, 174, 236, 0.08) 100%);
  color: var(--brand_blue);
}

.modal-icon.type-2 {
  background: linear-gradient(135deg, rgba(255, 102, 153, 0.15) 0%, rgba(255, 102, 153, 0.08) 100%);
  color: var(--brand_pink);
}

.modal-icon.type-3 {
  background: linear-gradient(135deg, rgba(245, 108, 108, 0.15) 0%, rgba(245, 108, 108, 0.08) 100%);
  color: #f56c6c;
}

.modal-icon.type-4 {
  background: linear-gradient(135deg, rgba(230, 162, 60, 0.15) 0%, rgba(230, 162, 60, 0.08) 100%);
  color: #e6a23c;
}

.modal-icon.type-5 {
  background: linear-gradient(135deg, rgba(102, 177, 255, 0.15) 0%, rgba(102, 177, 255, 0.08) 100%);
  color: #67b1ff;
}

.modal-icon.type-6 {
  background: linear-gradient(135deg, rgba(245, 108, 108, 0.15) 0%, rgba(245, 108, 108, 0.08) 100%);
  color: #f56c6c;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text1);
  margin: 0;
}

.modal-close {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 10px;
  color: var(--text4);
  cursor: pointer;
  transition: all 0.2s;
}

.modal-close:hover {
  background: var(--bg2);
  color: var(--text1);
}

.modal-body {
  padding: 28px;
}

.modal-content-text {
  font-size: 16px;
  color: var(--text2);
  line-height: 1.8;
  white-space: pre-wrap;
  word-break: break-word;
}

.modal-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--line_light);
}

.meta-tag {
  padding: 6px 14px;
  background: var(--bg2);
  border-radius: 8px;
  font-size: 13px;
  color: var(--text3);
  font-weight: 500;
}

.meta-time {
  font-size: 13px;
  color: var(--text4);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 28px;
  border-top: 1px solid var(--line_light);
}

.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, var(--brand_pink) 0%, #ff8cb0 100%);
  color: #fff;
  box-shadow: 0 4px 16px rgba(255, 102, 153, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(255, 102, 153, 0.4);
}

.btn-ghost {
  background: var(--bg2);
  color: var(--text2);
}

.btn-ghost:hover {
  background: var(--bg3);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 1200px) {
  .messages-container {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
  }
  
  .sidebar-section,
  .sidebar-actions {
    flex: 1;
    min-width: 200px;
  }
}

@media (max-width: 768px) {
  .page-content {
    padding: 80px 16px 24px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 20px;
  }
  
  .header-stats {
    width: 100%;
  }
  
  .stat-card {
    flex: 1;
  }
  
  .sidebar {
    flex-direction: column;
  }
  
  .sidebar-section,
  .sidebar-actions {
    min-width: 100%;
  }
  
  .messages-list {
    height: calc(100vh - 400px);
  }
}
</style>
