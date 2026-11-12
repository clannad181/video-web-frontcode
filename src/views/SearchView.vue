<template>
  <div class="search-page">
    <div class="search-topbar">
      <van-search
        v-model="keywordInput"
        shape="round"
        placeholder="搜索视频、UP主"
        background="transparent"
        @search="handleSearch"
        @clear="handleClear"
      />
      <div class="search-tabs">
        <button
          type="button"
          class="search-tab"
          :class="{ active: searchType === 'video' }"
          @click="switchType('video')"
        >视频</button>
        <button
          type="button"
          class="search-tab"
          :class="{ active: searchType === 'up' }"
          @click="switchType('up')"
        >UP主</button>
      </div>
    </div>

    <div v-if="searchType === 'video'" class="sort-bar hide-scrollbar">
      <button
        v-for="opt in sortOptions.video"
        :key="opt.value"
        type="button"
        class="sort-item"
        :class="{ active: sortType === opt.value }"
        @click="changeSort(opt.value)"
      >{{ opt.label }}</button>
    </div>

    <van-loading v-if="loading && !results.length" class="page-loading" color="#FF6699">搜索中…</van-loading>

    <template v-else>
      <!-- 视频结果 -->
      <div v-if="searchType === 'video'">
        <div v-if="results.length" class="video-grid">
          <VideoCard v-for="v in results" :key="v.id" :video="v" />
        </div>
        <van-empty v-else-if="searched" description="没有找到相关内容" />
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
        <van-empty v-if="!results.length && searched" description="没有找到相关UP主" />
      </div>
    </template>

    <!-- 分页 -->
    <div v-if="totalPages > 1 && !loading" class="pagination">
      <van-button
        size="small"
        :disabled="currentPage <= 1"
        @click="changePage(currentPage - 1)"
      >上一页</van-button>
      <span class="pagination-info">{{ currentPage }} / {{ totalPages }}</span>
      <van-button
        size="small"
        :disabled="currentPage >= totalPages"
        @click="changePage(currentPage + 1)"
      >下一页</van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
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

const totalPages = computed(() => Math.ceil(total.value / pageSize))

const handleSearch = () => {
  keyword.value = keywordInput.value.trim()
  currentPage.value = 1
  router.replace({ path: '/search', query: { q: keyword.value || undefined, type: searchType.value } })
  doSearch()
}

const handleClear = () => {
  keyword.value = ''
  results.value = []
  searched.value = false
}

const switchType = (type) => {
  searchType.value = type
  sortType.value = sortOptions[type][0].value
  currentPage.value = 1
  if (keyword.value) doSearch()
}

const changeSort = (sort) => {
  sortType.value = sort
  currentPage.value = 1
  doSearch()
}

const changePage = (page) => {
  currentPage.value = page
  doSearch()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const doSearch = async () => {
  if (!keyword.value) return
  loading.value = true
  try {
    const res = await searchContent({
      type: searchType.value,
      keyword: keyword.value || undefined,
      page: currentPage.value,
      size: pageSize,
      sortType: sortType.value
    })
    results.value = res?.records || []
    total.value = res?.total || 0
    searched.value = true
  } catch (e) {
    console.error('搜索失败:', e)
    results.value = []
    total.value = 0
    searched.value = true
  } finally {
    loading.value = false
  }
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

onMounted(() => {
  if (keyword.value) doSearch()
  else searched.value = true
})

watch(() => route.query, (q) => {
  keywordInput.value = String(q.q || '')
  keyword.value = String(q.q || '')
  if (q.type === 'up' || q.type === 'video') searchType.value = q.type
  currentPage.value = 1
  if (keyword.value) doSearch()
})
</script>

<style scoped>
.search-page {
  min-height: 100vh;
  background: var(--bg3);
  padding-top: calc(var(--header-h) + var(--sat));
}

.search-topbar {
  position: sticky;
  top: calc(var(--header-h) + var(--sat));
  z-index: 20;
  background: var(--bg1);
  padding-top: 4px;
}

.search-tabs {
  display: flex;
  gap: 8px;
  padding: 0 12px 10px;
}

.search-tab {
  height: 28px;
  padding: 0 16px;
  border: none;
  border-radius: 14px;
  background: var(--graph_bg_thin);
  color: var(--text2);
  font-size: 13px;
  cursor: pointer;
}

.search-tab.active {
  background: var(--brand_pink);
  color: #fff;
}

.sort-bar {
  display: flex;
  gap: 14px;
  padding: 10px 12px;
  background: var(--bg1);
  border-bottom: 1px solid var(--line_light);
  overflow-x: auto;
}

.sort-item {
  flex: 0 0 auto;
  background: none;
  border: none;
  font-size: 13px;
  color: var(--text3);
  padding: 0;
  cursor: pointer;
}

.sort-item.active {
  color: var(--brand_pink);
  font-weight: 600;
}

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

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 16px 0 32px;
}

.pagination-info {
  font-size: 13px;
  color: var(--text2);
}
</style>
