<template>
  <div class="up-page">
    <div class="up-hero">
      <div class="up-hero-bg"></div>
      <div v-if="loading" class="up-loading">
        <van-loading color="#FF6699" />
      </div>
      <template v-else-if="upInfo">
        <div class="up-main">
          <img class="up-avatar" :src="fileUrl(upInfo.avatarUrl || upInfo.avatar)" alt="" />
          <div class="up-meta">
            <div class="up-name">{{ upInfo.nickName || upInfo.nickname }}</div>
            <div class="up-sign">{{ upInfo.descript || '这个人很懒，什么都没留下' }}</div>
            <div class="up-stats">
              <span>{{ formatCount(upInfo.fansCount || 0) }} 粉丝</span>
              <span>{{ formatCount(upInfo.videoCount || 0) }} 投稿</span>
            </div>
          </div>
        </div>
        <div class="up-actions">
          <van-button
            size="small"
            round
            :type="upInfo.isFollowed ? 'default' : 'primary'"
            :color="upInfo.isFollowed ? undefined : '#FF6699'"
            @click="toggleFollow"
          >{{ upInfo.isFollowed ? '已关注' : '+ 关注' }}</van-button>
        </div>
      </template>
    </div>

    <div class="up-body">
      <div class="section-title">TA的投稿</div>

      <van-loading v-if="loadingVideos && !videos.length" class="page-loading" color="#FF6699">加载中…</van-loading>

      <div v-else-if="videos.length" class="video-grid">
        <VideoCard v-for="v in videos" :key="v.id" :video="v" />
      </div>

      <van-empty v-else description="还没有投稿" image-size="80" />

      <div v-if="videos.length" class="list-end">
        <van-button
          v-if="hasMore && !loadingMore"
          plain size="small"
          round
          @click="loadVideos()"
        >加载更多</van-button>
        <span v-else>没有更多了</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { getUserInfoByUid } from '../api/auth'
import { getUserVideos, followUser, unfollowUser } from '../api/video'
import { formatCount } from '../utils/format'
import { fileUrl } from '../config'
import { useAuthStore } from '../stores/auth'
import VideoCard from '../components/video/VideoCard.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const upInfo = ref(null)
const videos = ref([])
const loading = ref(true)
const loadingVideos = ref(false)

const page = ref(1)
const pageSize = 10
const hasMore = ref(true)
const loadingMore = ref(false)

const loadUpInfo = async () => {
  loading.value = true
  try {
    const res = await getUserInfoByUid(route.params.uid)
    upInfo.value = res
  } catch (e) {
    console.error('获取UP主信息失败:', e)
    upInfo.value = null
  } finally {
    loading.value = false
  }
}

const loadVideos = async (reset = false) => {
  if (loadingMore.value || (!hasMore.value && !reset)) return

  if (reset) {
    page.value = 1
    hasMore.value = true
    videos.value = []
  }

  loadingMore.value = true
  loadingVideos.value = page.value === 1
  try {
    const res = await getUserVideos({ userUid: route.params.uid, page: page.value, size: pageSize })
    const newVideos = res?.records || res || []

    if (reset) {
      videos.value = newVideos
    } else {
      videos.value = [...videos.value, ...newVideos]
    }

    if (newVideos.length < pageSize) {
      hasMore.value = false
    } else {
      page.value++
    }
  } catch (e) {
    console.error('获取投稿视频失败:', e)
    if (reset) videos.value = []
  } finally {
    loadingVideos.value = false
    loadingMore.value = false
  }
}

const toggleFollow = async () => {
  if (!authStore.isLoggedIn) {
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  try {
    const uid = upInfo.value.uid
    if (upInfo.value.isFollowed) {
      await unfollowUser(uid)
      upInfo.value.isFollowed = false
      upInfo.value.fansCount = Math.max(0, (upInfo.value.fansCount || 1) - 1)
      showToast('已取消关注')
    } else {
      await followUser(uid)
      upInfo.value.isFollowed = true
      upInfo.value.fansCount = (upInfo.value.fansCount || 0) + 1
      showToast('关注成功')
    }
  } catch (e) {
    showToast(e.message || '操作失败')
  }
}

onMounted(() => {
  loadUpInfo()
  loadVideos()
})
</script>

<style scoped>
.up-page {
  min-height: 100vh;
  background: var(--bg3);
  padding-top: calc(48px + var(--sat));
  padding-bottom: calc(70px + var(--sab));
}

.up-hero {
  position: relative;
  padding: 22px 16px;
  background: var(--bg1);
}

.up-hero-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #FF8CB0 0%, #FF6699 60%, #FF9966 100%);
  opacity: 0.12;
}

.up-loading {
  display: flex;
  justify-content: center;
  padding: 24px 0;
  position: relative;
}

.up-main {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
}

.up-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--brand_pink);
  flex-shrink: 0;
  background: var(--graph_bg_thin);
}

.up-meta {
  flex: 1;
  min-width: 0;
}

.up-name {
  font-size: 18px;
  font-weight: 700;
  color: var(--text1);
}

.up-sign {
  font-size: 12px;
  color: var(--text3);
  margin-top: 5px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.up-stats {
  display: flex;
  gap: 14px;
  margin-top: 7px;
  font-size: 12px;
  color: var(--text2);
}

.up-actions {
  position: relative;
  display: flex;
  justify-content: flex-end;
  margin-top: -34px;
}

.up-body {
  padding: 14px 12px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text1);
  margin-bottom: 10px;
}

.page-loading {
  justify-content: center;
  padding: 50px 0;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px 10px;
}

.list-end {
  padding: 16px 0;
  text-align: center;
  font-size: 12px;
  color: var(--text4);
}
</style>
