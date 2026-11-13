<template>
  <div class="search-page">
    <!-- 顶栏：返回 + 圆角输入框 + 搜索按钮 -->
    <div class="search-topbar">
      <button class="topbar-back" type="button" aria-label="返回" @click="goBack">
        <van-icon name="arrow-left" size="20" />
      </button>
      <van-search
        v-model="keywordInput"
        class="topbar-input"
        shape="round"
        placeholder="搜索视频、UP主"
        background="transparent"
        @search="handleSearch"
        @clear="handleClear"
      />
      <button class="topbar-submit" type="button" @click="handleSearch">搜索</button>
    </div>

    <!-- 未搜索：搜索历史 + 热搜榜 -->
    <div v-if="!keyword" class="idle-panel">
      <section v-if="searchHistory.length" class="panel">
        <div class="panel-head">
          <h2>搜索历史</h2>
          <button class="panel-action" type="button" aria-label="清空历史" @click="clearHistory">
            <van-icon name="delete-o" size="16" />
          </button>
        </div>
        <div class="chip-wrap">
          <button
            v-for="h in searchHistory"
            :key="h"
            class="chip"
            type="button"
            @click="quickSearch(h)"
          >{{ h }}</button>
        </div>
      </section>

      <section class="panel">
        <div class="panel-head">
          <h2>热搜榜</h2>
        </div>
        <ol class="hot-list">
          <li v-for="(h, i) in hotList" :key="h" @click="quickSearch(h)">
            <span class="hot-rank" :class="{ top: i < 3 }">{{ i + 1 }}</span>
            <span class="hot-word">{{ h }}</span>
            <span v-if="i < 3" class="hot-badge">热</span>
          </li>
        </ol>
      </section>
    </div>

    <!-- 已输入关键词：筛选 + 结果 -->
    <template v-else>
      <div class="filter-card">
        <div class="type-tabs">
          <button
            type="button"
            class="type-tab"
            :class="{ active: searchType === 'video' }"
            @click="switchType('video')"
          >视频</button>
          <button
            type="button"
            class="type-tab"
            :class="{ active: searchType === 'up' }"
            @click="switchType('up')"
          >UP主</button>
        </div>
        <div class="sort-bar hide-scrollbar">
          <button
            v-for="opt in sortOptions[searchType]"
            :key="opt.value"
            type="button"
            class="sort-item"
            :class="{ active: sortType === opt.value }"
            @click="changeSort(opt.value)"
          >{{ opt.label }}</button>
        </div>
      </div>

      <van-loading v-if="loading && !results.length" class="page-loading" color="#FF6699">搜索中…</van-loading>

      <van-list
        v-else
        v-model:loading="loading"
        :finished="noMore"
        :finished-text="results.length ? '没有更多了' : undefined"
        loading-text="加载中…"
        :offset="150"
        @load="loadMore"
      >
        <!-- 视频结果 -->
        <div v-if="searchType === 'video'" class="video-grid">
          <VideoCard v-for="v in results" :key="v.id" :video="v" />
        </div>

        <!-- UP主结果 -->
        <div v-else class="up-list">
          <div v-for="up in results" :key="up.uid || up.id" class="up-item" @click="goUp(up)">
            <img class="up-avatar" :src="fileUrl(up.avatarUrl || up.avatar)" alt="" />
            <div class="up-info">
              <div class="up-name">{{ up.nickName || up.nickname }}</div>
              <div class="up-sign">{{ up.descript || up.signature || '这个人很懒，什么都没留下' }}</div>
              <div class="up-stats">粉丝 {{ formatCount(up.fansCount || up.followerCount || 0) }}</div>
            </div>
            <van-button
              v-if="up.uid !== myUid"
              size="mini"
              round
              :type="up.isFollowed ? 'default' : 'primary'"
              class="up-follow-btn"
              @click.stop="toggleFollow(up)"
            >{{ up.isFollowed ? '已关注' : '+ 关注' }}</van-button>
          </div>
        </div>

        <van-empty
          v-if="!results.length && searched"
          :description="searchType === 'video' ? '没有找到相关内容' : '没有找到相关UP主'"
        />
      </van-list>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { searchContent, followUser as followUserApi, unfollowUser as unfollowUserApi } from '../api/video'
import { formatCount } from '../utils/format'
import { fileUrl } from '../config'
import { useAuthStore } from '../stores/auth'
import VideoCard from '../components/video/VideoCard.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const myUid = computed(() => authStore.user?.uid)

const keywordInput = ref(String(route.query.q || ''))
const keyword = ref(String(route.query.q || ''))
const searchType = ref(route.query.type === 'up' ? 'up' : 'video')
const sortType = ref('latest')
const currentPage = ref(1)
const total = ref(0)
const pageSize = 20

const results = ref([])
const loading = ref(false)
const searched = ref(false)
const noMore = ref(false)

const sortOptions = {
  video: [
    { label: '综合排序', value: 'latest' },
    { label: '最多播放', value: 'hot' },
    { label: '最多收藏', value: 'favorite' }
  ],
  up: [
    { label: '粉丝最多', value: 'fans' },
    { label: '获赞最多', value: 'like' },
    { label: '播放最多', value: 'play' }
  ]
}

/* ---------- 搜索历史（localStorage） ---------- */
const HISTORY_KEY = 'frontSearchHistory'
const searchHistory = ref([])
try {
  searchHistory.value = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
} catch {
  searchHistory.value = []
}

const addHistory = (kw) => {
  const arr = [kw, ...searchHistory.value.filter((x) => x !== kw)].slice(0, 10)
  searchHistory.value = arr
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(arr))
  } catch {}
}

const clearHistory = async () => {
  try {
    await showConfirmDialog({ title: '清空搜索历史', message: '确定清空全部搜索历史吗？' })
    searchHistory.value = []
    localStorage.removeItem(HISTORY_KEY)
  } catch {}
}

/* ---------- 热搜榜 ---------- */
const hotList = [
  '年度动画混剪', '演唱会现场', '游戏高光时刻', '科技数码评测', '健身跟练',
  '美食教程', '鬼畜全明星', '舞蹈翻跳', '纪录片', '新番先导片'
]

/* ---------- 搜索核心 ---------- */
const runSearch = async (append = false) => {
  if (!keyword.value) {
    results.value = []
    total.value = 0
    searched.value = false
    return
  }
  loading.value = true
  try {
    const res = await searchContent({
      type: searchType.value,
      keyword: keyword.value,
      page: currentPage.value,
      size: pageSize,
      sortType: sortType.value
    })
    const rec = res?.records || []
    results.value = append ? [...results.value, ...rec] : rec
    total.value = res?.total || 0
    searched.value = true
    if (!rec.length || results.value.length >= total.value) noMore.value = true
  } catch (e) {
    console.error('搜索失败:', e)
    if (!append) results.value = []
    total.value = 0
    searched.value = true
    noMore.value = true
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  const kw = keywordInput.value.trim()
  keyword.value = kw
  if (kw) addHistory(kw)
  currentPage.value = 1
  noMore.value = false
  const sameQuery =
    String(route.query.q || '') === kw &&
    (route.query.type || 'video') === searchType.value
  if (sameQuery) {
    runSearch(false)
  } else {
    // 交给 route watcher 重置并发起搜索
    router.replace({ path: '/search', query: { q: kw || undefined, type: searchType.value } })
  }
}

const handleClear = () => {
  keyword.value = ''
  keywordInput.value = ''
  results.value = []
  total.value = 0
  searched.value = false
  noMore.value = false
  if (route.query.q) router.replace({ path: '/search' })
}

const quickSearch = (kw) => {
  keywordInput.value = kw
  handleSearch()
}

const switchType = (type) => {
  if (type === searchType.value) return
  searchType.value = type
  sortType.value = sortOptions[type][0].value
  currentPage.value = 1
  noMore.value = false
  results.value = []
  if (keyword.value) runSearch(false)
}

const changeSort = (sort) => {
  sortType.value = sort
  currentPage.value = 1
  noMore.value = false
  runSearch(false)
}

const loadMore = () => {
  // van-list 滚动到底触发，自身已做 loading 去重
  if (!keyword.value || noMore.value) return
  currentPage.value += 1
  runSearch(true)
}

const goBack = () => {
  if (window.history.state?.back) router.back()
  else router.push('/')
}

const goUp = (up) => {
  const uid = up.uid || up.userUid
  if (uid) router.push(`/up/${uid}`)
}

const toggleFollow = async (up) => {
  if (!authStore.isLoggedIn) {
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  const uid = up.uid || up.userUid
  try {
    if (up.isFollowed) {
      await unfollowUserApi(uid)
      up.isFollowed = false
      showToast('已取消关注')
    } else {
      await followUserApi(uid)
      up.isFollowed = true
      showToast('关注成功')
    }
  } catch (e) {
    showToast(e.message || '操作失败')
  }
}

watch(
  () => route.query,
  (q) => {
    keywordInput.value = String(q.q || '')
    keyword.value = String(q.q || '')
    if (q.type === 'up' || q.type === 'video') searchType.value = q.type
    currentPage.value = 1
    noMore.value = false
    results.value = []
    if (keyword.value) runSearch(false)
    else searched.value = false
  },
  { immediate: true }
)

onMounted(() => {
  // 进入页面且无关键词时自动聚焦输入框
  if (!keyword.value) {
    setTimeout(() => {
      document.querySelector('.search-topbar .van-search input')?.focus()
    }, 350)
  }
})
</script>

<style scoped>
.search-page {
  min-height: 100vh;
  background: var(--bg3);
}

/* 顶栏 */
.search-topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: calc(8px + var(--sat)) 10px 8px;
  background: var(--bg1);
}

.topbar-back {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--text1);
  cursor: pointer;
}

.topbar-back:active {
  background: var(--graph_bg_thin);
}

.topbar-input {
  flex: 1;
  min-width: 0;
  padding: 0;
}

.topbar-input :deep(.van-search__content) {
  background: var(--graph_bg_thin);
}

.topbar-submit {
  flex-shrink: 0;
  height: 32px;
  padding: 0 6px;
  border: none;
  background: none;
  color: var(--brand_pink);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.topbar-submit:active {
  opacity: 0.6;
}

/* 未搜索面板 */
.idle-panel {
  padding-bottom: 32px;
}

.panel {
  margin: 12px;
  padding: 12px 14px;
  background: var(--bg1);
  border-radius: 12px;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.panel-head h2 {
  font-size: 14px;
  font-weight: 700;
  color: var(--text1);
}

.panel-action {
  border: none;
  background: none;
  color: var(--text4);
  padding: 4px;
  cursor: pointer;
}

.chip-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  max-width: 100%;
  height: 30px;
  padding: 0 12px;
  border: none;
  border-radius: 15px;
  background: var(--graph_bg_thin);
  color: var(--text2);
  font-size: 12px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  cursor: pointer;
}

.chip:active {
  background: var(--brand_pink_thin);
}

.hot-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.hot-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 2px;
  font-size: 13px;
  color: var(--text1);
  cursor: pointer;
}

.hot-list li:active .hot-word {
  color: var(--brand_pink);
}

.hot-rank {
  flex-shrink: 0;
  width: 18px;
  text-align: center;
  font-size: 14px;
  font-weight: 800;
  font-style: italic;
  color: var(--text4);
}

.hot-rank.top {
  color: var(--brand_pink);
}

.hot-word {
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.hot-badge {
  flex-shrink: 0;
  margin-left: auto;
  font-size: 10px;
  color: var(--brand_pink);
  background: var(--brand_pink_thin);
  border-radius: 4px;
  padding: 1px 5px;
}

/* 筛选区 */
.filter-card {
  background: var(--bg1);
  padding-bottom: 10px;
  border-radius: 0 0 12px 12px;
}

.type-tabs {
  display: flex;
  margin: 0 12px 10px;
  padding: 3px;
  background: var(--graph_bg_thin);
  border-radius: 10px;
}

.type-tab {
  flex: 1;
  height: 30px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text2);
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.type-tab.active {
  background: var(--bg1);
  color: var(--brand_pink);
  font-weight: 600;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.sort-bar {
  display: flex;
  gap: 8px;
  padding: 0 12px;
  overflow-x: auto;
}

.sort-item {
  flex: 0 0 auto;
  height: 26px;
  padding: 0 12px;
  border: none;
  border-radius: 13px;
  background: var(--graph_bg_thin);
  color: var(--text3);
  font-size: 12px;
  cursor: pointer;
}

.sort-item.active {
  background: var(--brand_pink_thin);
  color: var(--brand_pink);
  font-weight: 600;
}

/* 结果 */
.page-loading {
  justify-content: center;
  padding: 60px 0;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px 10px;
  padding: 14px 12px;
}

.up-list {
  padding: 4px 12px 16px;
}

.up-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--line_light);
}

.up-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  background: var(--graph_bg_thin);
}

.up-info {
  flex: 1;
  min-width: 0;
}

.up-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text1);
}

.up-sign {
  font-size: 12px;
  color: var(--text3);
  margin-top: 3px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.up-stats {
  font-size: 11px;
  color: var(--text4);
  margin-top: 3px;
}

.up-follow-btn {
  flex-shrink: 0;
}
</style>
