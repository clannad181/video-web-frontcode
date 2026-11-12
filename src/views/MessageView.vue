<template>
  <div class="message-page">
    <div class="page-head">
      <div class="page-head-row">
        <h1>消息中心</h1>
        <van-button
          size="mini"
          plain
          round
          :loading="readAllLoading"
          :disabled="!unreadCount"
          @click="handleReadAll"
        >全部已读</van-button>
      </div>
      <div class="msg-tabs hide-scrollbar">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          type="button"
          class="msg-tab"
          :class="{ active: activeTab === tab.value }"
          @click="switchTab(tab.value)"
        >{{ tab.label }}</button>
      </div>
    </div>

    <van-loading v-if="loading && !messages.length" class="page-loading" color="#FF6699">加载中…</van-loading>

    <template v-else-if="messages.length">
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="msg-item"
        :class="{ unread: msg.isRead === 0 }"
        @click="handleMessageClick(msg)"
      >
        <div class="msg-icon" :class="`type-${msg.type}`">
          <van-icon :name="typeIcon(msg.type)" size="19" />
        </div>
        <div class="msg-content">
          <div class="msg-header">
            <span class="msg-title">{{ msg.title }}</span>
            <span class="msg-time">{{ formatTime(msg.createTime) }}</span>
          </div>
          <div class="msg-desc">{{ msg.content }}</div>
          <div v-if="msg.bizAvid || msg.playLink" class="msg-action">查看视频 →</div>
        </div>
        <span v-if="msg.isRead === 0" class="unread-dot"></span>
      </div>

      <div class="list-end">
        <van-button
          v-if="!noMore && !loading"
          plain size="small"
          round
          @click="fetchMessages(true)"
        >加载更多</van-button>
        <span v-else>没有更多了</span>
      </div>
    </template>

    <van-empty v-else description="暂无消息">
      <span class="empty-desc">当有新消息时，将会在这里显示</span>
    </van-empty>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { getMessageList, getUnreadCount, markAsRead, markAllAsRead } from '../api/message'

const router = useRouter()
const PAGE_SIZE = 20

const messages = ref([])
const loading = ref(false)
const noMore = ref(false)
const currentPage = ref(1)
const total = ref(0)
const unreadCount = ref(0)
const activeTab = ref(0)
const readAllLoading = ref(false)

const tabs = [
  { label: '全部', value: 0 },
  { label: '未读', value: -1 },
  { label: '视频发布', value: 1 },
  { label: '审核通知', value: 2 },
  { label: '下架通知', value: 3 },
  { label: '评论消息', value: 5 },
  { label: '举报消息', value: 6 }
]

const typeIcon = (type) => {
  const map = { 1: 'play-circle-o', 2: 'description', 3: 'warning-o', 5: 'chat-o', 6: 'flag-o' }
  return map[type] || 'bell'
}

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
  if (msg.playLink) {
    router.push(msg.playLink)
  } else if (msg.bizAvid) {
    showToast('已标记为已读')
  }
}

const handleReadAll = async () => {
  if (readAllLoading.value) return
  readAllLoading.value = true
  try {
    await markAllAsRead()
    messages.value.forEach(m => { m.isRead = 1 })
    unreadCount.value = 0
    showToast('已全部标记为已读')
  } catch (e) {
    showToast(e.message || '操作失败')
  } finally {
    readAllLoading.value = false
  }
}

const formatTime = (time) => {
  if (!time) return ''
  const d = new Date(time)
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  if (d.toDateString() === now.toDateString()) {
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`
  }
  return `${d.getMonth() + 1}-${d.getDate()}`
}

onMounted(() => {
  fetchMessages()
  fetchUnreadCount()
})
</script>

<style scoped>
.message-page {
  min-height: 100vh;
  background: var(--bg3);
  padding-top: calc(var(--header-h) + var(--sat));
  padding-bottom: calc(70px + var(--sab));
}

.page-head {
  position: sticky;
  top: calc(var(--header-h) + var(--sat));
  z-index: 20;
  background: var(--bg1);
  padding-top: 10px;
}

.page-head-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px 8px;
}

.page-head h1 {
  font-size: 18px;
  font-weight: 700;
  color: var(--text1);
}

.msg-tabs {
  display: flex;
  gap: 8px;
  padding: 0 14px 10px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.msg-tab {
  flex: 0 0 auto;
  height: 26px;
  padding: 0 12px;
  border: none;
  border-radius: 13px;
  background: var(--graph_bg_thin);
  color: var(--text2);
  font-size: 12px;
  cursor: pointer;
}

.msg-tab.active {
  background: var(--brand_pink);
  color: #fff;
}

.page-loading {
  justify-content: center;
  padding: 60px 0;
}

.msg-item {
  display: flex;
  gap: 10px;
  padding: 14px;
  background: var(--bg1);
  border-bottom: 1px solid var(--line-light);
  cursor: pointer;
  position: relative;
}

.msg-item.unread {
  background: #FFF9FB;
}

.msg-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  flex-shrink: 0;
  background: var(--graph_bg_thin);
  color: var(--text2);
}

.msg-icon.type-1 { background: var(--brand_pink_thin); color: var(--brand_pink); }
.msg-icon.type-2 { background: #E8F6FF; color: #00AEEC; }
.msg-icon.type-3 { background: #FFF3E0; color: #FF9838; }
.msg-icon.type-5 { background: #E8F6FF; color: #00AEEC; }
.msg-icon.type-6 { background: var(--brand_pink_thin); color: var(--brand_pink); }

.msg-content {
  flex: 1;
  min-width: 0;
}

.msg-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.msg-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text1);
}

.msg-time {
  font-size: 11px;
  color: var(--text4);
  flex-shrink: 0;
}

.msg-desc {
  font-size: 12px;
  line-height: 1.6;
  color: var(--text2);
  margin-top: 4px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.msg-action {
  font-size: 12px;
  color: var(--brand_pink);
  margin-top: 6px;
}

.unread-dot {
  position: absolute;
  top: 14px;
  right: 12px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--brand_pink);
}

.list-end {
  padding: 16px 0 32px;
  text-align: center;
  font-size: 12px;
  color: var(--text4);
}

.empty-desc {
  display: block;
  margin-top: 8px;
  font-size: 12px;
  color: var(--text4);
}
</style>
