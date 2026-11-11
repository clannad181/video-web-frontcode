<template>
  <div class="play-page">
    <!-- 播放器区 -->
    <div class="player-box">
      <video
        v-if="currentPlayUrl && !vipLockVisible"
        ref="videoRef"
        class="player-video"
        :src="currentPlayUrl"
        :poster="fileUrl(video?.coverUrl)"
        controls
        autoplay
        playsinline
        webkit-playsinline
        :key="currentPlayUrl"
        @timeupdate="handleTimeUpdate"
        @ended="handleEnded"
      />
      <div v-else class="player-placeholder">
        <template v-if="loadError && !video">
          <van-icon name="warning-o" size="44" />
          <span>视频信息加载失败</span>
          <van-button size="small" round type="primary" class="retry-btn" @click="reloadVideo">重新加载</van-button>
        </template>
        <template v-else-if="vipLockVisible">
          <van-icon name="lock" size="44" />
          <span>该视频需要大会员观看</span>
        </template>
        <template v-else>
          <van-icon name="play-circle-o" size="44" />
          <span>点击播放视频</span>
        </template>
      </div>
    </div>

    <!-- 大会员锁定条 -->
    <div v-if="vipLockVisible" class="vip-lock-tip">
      <van-icon name="crown" size="20" class="vip-lock-icon" />
      <div class="vip-lock-info">
        <span class="vip-lock-text">该视频需要大会员观看</span>
        <span class="vip-lock-sub">开通大会员后即可观看该剧集</span>
      </div>
      <van-button
        size="small"
        round
        type="primary"
        class="vip-lock-btn"
        color="#FF6699"
        @click="handleBuyVip"
      >充值大会员</van-button>
    </div>

    <div class="page-body">
      <!-- 标题 + UP主 -->
      <div v-if="video" class="video-head">
        <h1 class="video-title">{{ video.title }}</h1>
        <div class="up-row" v-if="video.uid">
          <div class="up-info" @click="goUp">
            <img class="up-avatar" :src="fileUrl(video.avatarUrl || video.userAvatar)" alt="" />
            <div class="up-meta">
              <span class="up-name">{{ video.nickName }}</span>
              <span class="up-stats">{{ formatCount(video.playCount || 0) }}播放</span>
            </div>
          </div>
          <van-button
            v-if="!isOwnVideo"
            size="small"
            round
            :type="isFollowed ? 'default' : 'primary'"
            :color="isFollowed ? undefined : '#FF6699'"
            @click="toggleFollow"
          >{{ isFollowed ? '已关注' : '+ 关注' }}</van-button>
        </div>
      </div>

      <!-- 三态：加载中 -->
      <van-loading v-if="pageLoading" class="page-loading" color="#FF6699">加载中…</van-loading>

      <!-- 操作栏 -->
      <div v-if="video" class="video-actions">
        <button class="action-btn" :class="{ active: isLiked }" @click="handleLike">
          <van-icon :name="isLiked ? 'good-job' : 'good-job-o'" size="20" />
          <em>{{ formatCount(currentEpisode?.likeCount || 0) }}</em>
        </button>
        <button class="action-btn" :class="{ active: isCoined }" @click="handleCoin">
          <van-icon name="gold-coin-o" size="20" />
          <em>{{ formatCount(currentEpisode?.coinCount || 0) }}</em>
        </button>
        <button class="action-btn" :class="{ active: isFavorited }" @click="handleFavorite">
          <van-icon :name="isFavorited ? 'star' : 'star-o'" size="20" />
          <em>{{ formatCount(currentEpisode?.favoriteCount || 0) }}</em>
        </button>
        <button class="action-btn" @click="handleShare">
          <van-icon name="share" size="19" />
        </button>
        <div class="action-spacer"></div>
        <button class="action-btn" @click="showReport = true">
          <van-icon name="warning-o" size="19" />
          <em>举报</em>
        </button>
      </div>

      <!-- 选集 -->
      <div v-if="video && episodes.length" class="episode-section">
        <div class="section-header">
          <h3>选集</h3>
          <span class="section-sub" v-if="episodes.length > 1">全{{ episodes.length }}集</span>
        </div>
        <div class="episode-grid">
          <button
            v-for="(ep, idx) in episodes"
            :key="idx"
            type="button"
            class="episode-item"
            :class="{ active: currentEpisodeIndex === idx, 'has-vip': ep.needVip }"
            @click="currentEpisodeIndex = idx"
          >
            <span v-if="ep.needVip" class="episode-ribbon">大会员</span>
            <span class="episode-label">{{ ep.title || `第${ep.episodeNumber || idx + 1}集` }}</span>
          </button>
        </div>
      </div>

      <!-- 简介 -->
      <div v-if="video && video.description" class="desc-section">
        <p class="desc-text" :class="{ collapsed: !descExpanded }">{{ video.description }}</p>
        <span v-if="video.description.length > 80" class="desc-toggle" @click="descExpanded = !descExpanded">
          {{ descExpanded ? '收起' : '展开' }}
        </span>
        <div v-if="video.tags?.length" class="desc-tags">
          <span v-for="tag in video.tags" :key="tag" class="tag-item">{{ tag }}</span>
        </div>
      </div>

      <!-- 评论 -->
      <div class="comment-section">
        <div class="section-header">
          <h3>评论</h3>
          <span class="section-sub">{{ commentTotal }}</span>
        </div>

        <div v-if="!isLoggedIn" class="login-prompt">
          <router-link :to="{ path: '/login', query: { redirect: $route.fullPath } }">登录</router-link>后参与评论
        </div>

        <div v-else class="comment-input">
          <van-field
            v-model="commentContent"
            rows="1"
            autosize
            type="textarea"
            maxlength="2000"
            placeholder="发一条友善的评论"
            show-word-limit
          />
          <van-button
            size="small"
            type="primary"
            color="#FF6699"
            :loading="submitting"
            :disabled="!commentContent.trim()"
            @click="submitComment"
          >发送</van-button>
        </div>

        <div v-if="comments.length" class="comment-list">
          <div v-for="c in comments" :key="c.id" class="comment-item">
            <img class="comment-avatar" :src="fileUrl(c.avatar || c.avatarUrl)" alt="" />
            <div class="comment-main">
              <div class="comment-author">{{ c.nickName || c.nickname || '用户' }}</div>
              <div class="comment-content">{{ c.content }}</div>
              <div class="comment-foot">
                <span class="comment-time">{{ formatDate(c.createTime) }}</span>
                <button class="comment-like" @click="handleLikeComment(c)">
                  <van-icon :name="c.liked ? 'good-job' : 'good-job-o'" size="13" />
                  {{ formatCount(c.likeCount || 0) }}
                </button>
              </div>
            </div>
          </div>
          <van-button
            v-if="hasMoreComments && !loadingComments"
            block plain size="small"
            class="load-more-comments"
            @click="loadMoreComments"
          >加载更多评论</van-button>
          <van-loading v-else-if="loadingComments" class="page-loading" color="#FF6699">加载中…</van-loading>
        </div>
        <van-empty v-else-if="!loadingComments" description="还没有评论，来抢沙发" image-size="70" />
      </div>

      <!-- 相关推荐 -->
      <div v-if="relatedVideos.length" class="related-section">
        <div class="section-header">
          <h3>相关推荐</h3>
        </div>
        <div class="related-list">
          <div
            v-for="rv in relatedVideos"
            :key="rv.id"
            class="related-item"
            @click="goRelated(rv)"
          >
            <div class="related-cover">
              <img :src="fileUrl(rv.coverUrl)" :alt="rv.title" loading="lazy" />
              <span v-if="rv.needVip" class="vip-badge related-vip">大会员</span>
              <span class="related-duration">{{ formatDuration(rv.totalDuration) }}</span>
            </div>
            <div class="related-info">
              <div class="related-title">{{ rv.title }}</div>
              <div class="related-meta">{{ rv.nickName }} · {{ formatCount(rv.playCount || 0) }}播放</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 举报弹层 -->
    <van-action-sheet
      v-model:show="showReport"
      title="举报稿件"
      cancel-text="取消"
      @cancel="showReport = false"
    >
      <div class="report-body">
        <van-field
          v-model="reportContent"
          rows="3"
          autosize
          type="textarea"
          maxlength="500"
          placeholder="请描述举报原因（选填）"
          show-word-limit
        />
        <van-button
          block
          type="danger"
          size="large"
          class="report-submit"
          :loading="reportSubmitting"
          @click="submitReport"
        >提交举报</van-button>
      </div>
    </van-action-sheet>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { formatCount, formatDuration, throttle } from '../utils/format'
import { formatDate } from '../utils/fileUpload'
import request from '../api/request'
import { fileUrl } from '../config'
import {
  followUser, unfollowUser, checkIsFollowed, getRelatedVideos,
  likeEpisode, coinEpisode, getEpisodeStatus, getFavoriteStatus,
  recordWatchHistory, getWatchHistoryList, getMyContributions
} from '../api/video'
import { getCommentTree, postComment, likeClientComment } from '../api/comment'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const video = ref(null)
const pageLoading = ref(true)
const loadError = ref(false)
const episodes = ref([])
const currentEpisodeIndex = ref(0)
const currentEpisode = ref(null)
const comments = ref([])
const commentContent = ref('')
const relatedVideos = ref([])
const isLiked = ref(false)
const isCoined = ref(false)
const isFavorited = ref(false)
const isFollowed = ref(false)
const descExpanded = ref(false)
const videoRef = ref(null)
const savedTime = ref(0)

const showReport = ref(false)
const reportContent = ref('')
const reportSubmitting = ref(false)

const commentPage = ref(1)
const commentTotal = ref(0)
const loadingComments = ref(false)
const hasMoreComments = ref(true)
const submitting = ref(false)

const isLoggedIn = computed(() => authStore.isLoggedIn)

const isOwnVideo = computed(() => {
  if (!isLoggedIn.value || !video.value || !authStore.user) return false
  return String(video.value.uid) === String(authStore.user.uid)
})

const currentPlayUrl = computed(() => {
  return fileUrl(currentEpisode.value?.playUrl || video.value?.currentEpisode?.playUrl || '')
})

const vipLockVisible = computed(() => {
  const ep = currentEpisode.value
  if (!video.value || !ep) return false
  const needVip = ep.needVip ?? video.value.needVip
  if (!needVip) return false
  return !(ep.playUrl || ep.playLink) && !currentPlayUrl.value
})

const handleBuyVip = () => {
  if (!isLoggedIn.value) {
    requireLogin()
    return
  }
  window.dispatchEvent(new CustomEvent('open-vip-dialog'))
}

const requireLogin = () => {
  router.push({ path: '/login', query: { redirect: route.fullPath } })
}

const applyVideoData = async (data) => {
  video.value = data
  if (data.episodes && data.episodes.length > 0) {
    episodes.value = [...data.episodes].sort((a, b) => a.episodeNumber - b.episodeNumber)

    const targetEpisodeId = route.params.episodeUid
    if (targetEpisodeId) {
      const idx = episodes.value.findIndex(
        e => String(e.id) === String(targetEpisodeId) || String(e.avid) === String(targetEpisodeId)
      )
      if (idx !== -1) {
        currentEpisodeIndex.value = idx
        currentEpisode.value = episodes.value[idx]
      } else if (data.currentEpisode) {
        const defaultIdx = episodes.value.findIndex(e => e.id === data.currentEpisode.id)
        if (defaultIdx !== -1) currentEpisodeIndex.value = defaultIdx
        currentEpisode.value = data.currentEpisode
      } else {
        currentEpisode.value = episodes.value[0]
      }
    } else if (data.currentEpisode) {
      const idx = episodes.value.findIndex(e => e.id === data.currentEpisode.id)
      if (idx !== -1) currentEpisodeIndex.value = idx
      currentEpisode.value = data.currentEpisode
    } else {
      currentEpisode.value = episodes.value[0]
    }
  } else if (data.isOngoing) {
    episodes.value = Array.from({ length: data.episodeCount || 5 }, (_, i) => ({
      title: `第${i + 1}集`
    }))
    currentEpisode.value = null
  } else {
    episodes.value = []
    currentEpisode.value = null
  }

  const ep = currentEpisode.value
  const epTitle = ep?.title || (ep?.episodeNumber ? `第${ep.episodeNumber}集` : '')
  document.title = epTitle ? `${epTitle} - ${video.value?.title || ''}` : `${video.value?.title || '视频播放'} - VideoHub`
}

const loadRelatedVideos = async (avid) => {
  if (!avid) {
    relatedVideos.value = []
    return
  }
  try {
    const res = await getRelatedVideos(avid)
    relatedVideos.value = res?.records || []
  } catch (e) {
    console.error('获取相关推荐失败:', e)
    relatedVideos.value = []
  }
}

const loadEpisodeStatus = async () => {
  if (!isLoggedIn.value) return
  const episodeUid = currentEpisode.value?.avid || currentEpisode.value?.id || route.params.episodeUid
  if (!episodeUid) return
  try {
    const [statusRes, favRes] = await Promise.all([
      getEpisodeStatus(episodeUid),
      getFavoriteStatus(episodeUid)
    ])
    if (statusRes) {
      isLiked.value = statusRes.isLiked
      isCoined.value = statusRes.isCoined
    }
    if (favRes) {
      isFavorited.value = favRes.isFavorited || false
    }
  } catch (e) {
    console.error('获取剧集状态失败:', e)
  }
}

const reportWatchProgress = (seconds) => {
  if (!isLoggedIn.value) return
  const videoUid = video.value?.avid || video.value?.id
  const episodeUid = currentEpisode.value?.avid || currentEpisode.value?.id
  if (videoUid && episodeUid) {
    recordWatchHistory({ videoId: videoUid, episodeId: episodeUid, watchedSeconds: Math.floor(seconds) })
  }
}

const reportProgress = throttle((e) => {
  reportWatchProgress(e.target.currentTime)
}, 30000)

const handleTimeUpdate = (e) => {
  reportProgress(e)
}

const handleEnded = () => {
  // 播完自动下一集
  if (currentEpisodeIndex.value < episodes.value.length - 1) {
    currentEpisodeIndex.value++
  }
}

const loadVideo = async () => {
  const videoUid = route.params.videoUid
  const episodeUid = route.params.episodeUid

  pageLoading.value = true
  loadError.value = false

  try {
    if (videoUid && episodeUid) {
      const res = await request.get(`/client/video/${videoUid}/episode/${episodeUid}`)
      const data = res.data || res
      await applyVideoData(data)

      const queryTime = route.query.t ? Number(route.query.t) : 0
      if (queryTime > 0) {
        savedTime.value = queryTime
        return
      }

      if (isLoggedIn.value) {
        try {
          const historyRes = await getWatchHistoryList({ page: 1, size: 100 })
          const historyList = historyRes?.records || []
          const currentHistory = historyList.find(item => {
            let itemVideoUid = item.videoAvid || item.videoId
            let itemEpisodeUid = item.episodeAvid || item.episodeId
            if (!itemVideoUid && item.playLink) {
              const match = item.playLink.match(/\/client\/video\/([^/]+)\/episode\/([^/]+)/)
              if (match) {
                itemVideoUid = match[1]
                itemEpisodeUid = match[2]
              }
            }
            return String(itemVideoUid) === String(videoUid) && String(itemEpisodeUid) === String(episodeUid)
          })
          if (currentHistory) {
            if (currentHistory.watchedSeconds) {
              savedTime.value = currentHistory.watchedSeconds
            } else if (currentHistory.watchProgress && currentHistory.duration) {
              savedTime.value = Math.floor(currentHistory.watchProgress * currentHistory.duration)
            }
          }
        } catch (e) {
          console.error('获取观看进度失败:', e)
        }
      }
      return
    }
    loadError.value = !video.value
  } catch (e) {
    console.error('获取播放信息失败:', e)
    if (video.value) {
      showToast('获取播放信息失败')
    } else {
      loadError.value = true
    }
  } finally {
    pageLoading.value = false
  }
}

const reloadVideo = () => loadVideo()

const loadComments = async (isLoadMore = false) => {
  const videoUid = video.value?.avid || video.value?.id || route.params.videoUid
  const episodeUid = currentEpisode.value?.avid || currentEpisode.value?.id || route.params.episodeUid
  if (!videoUid || !episodeUid) return

  loadingComments.value = true
  try {
    const res = await getCommentTree(videoUid, episodeUid, {
      page: commentPage.value,
      size: 10,
      sortBy: 'time'
    })
    if (res && res.records) {
      comments.value = isLoadMore ? [...comments.value, ...res.records] : res.records
      commentTotal.value = res.total || 0
      hasMoreComments.value = comments.value.length < commentTotal.value
    }
  } catch (e) {
    console.error('获取评论失败:', e)
    if (!isLoadMore) comments.value = []
  } finally {
    loadingComments.value = false
  }
}

const loadMoreComments = () => {
  if (loadingComments.value || !hasMoreComments.value) return
  commentPage.value++
  loadComments(true)
}

const submitComment = async () => {
  if (!commentContent.value.trim() || submitting.value) return
  const videoUid = video.value?.avid || video.value?.id
  const episodeUid = currentEpisode.value?.avid || currentEpisode.value?.id
  if (!videoUid || !episodeUid) return

  submitting.value = true
  try {
    const res = await postComment({
      videoUid: String(videoUid),
      episodeUid: String(episodeUid),
      content: commentContent.value.trim()
    })
    if (res) {
      commentContent.value = ''
      commentPage.value = 1
      await loadComments()
      showToast('评论成功')
    }
  } catch (e) {
    console.error('发表评论失败:', e)
    showToast(e.message || '评论失败')
  } finally {
    submitting.value = false
  }
}

const handleLikeComment = async (c) => {
  if (!isLoggedIn.value) { requireLogin(); return }
  try {
    const res = await likeClientComment(c.id)
    if (res) {
      c.liked = res.isActioned ?? !c.liked
      c.likeCount = res.count ?? (c.likeCount || 0) + (c.liked ? 1 : -1)
    }
  } catch (e) {
    showToast(e.message || '操作失败')
  }
}

const handleLike = async () => {
  if (!isLoggedIn.value) { requireLogin(); return }
  try {
    const episodeUid = currentEpisode.value?.avid || currentEpisode.value?.id
    if (!episodeUid) return
    const res = await likeEpisode(episodeUid)
    if (res) {
      isLiked.value = res.isActioned
      if (currentEpisode.value) currentEpisode.value.likeCount = res.count
    }
  } catch (e) {
    showToast(e.message || '点赞失败')
  }
}

const handleCoin = async () => {
  if (!isLoggedIn.value) { requireLogin(); return }
  if (isCoined.value) {
    showToast('该稿件的投币次数已用完')
    return
  }
  try {
    const episodeUid = currentEpisode.value?.avid || currentEpisode.value?.id
    if (!episodeUid) return
    const res = await coinEpisode(episodeUid)
    if (res) {
      isCoined.value = true
      if (currentEpisode.value) currentEpisode.value.coinCount = res.count
      showToast('投币成功')
    }
  } catch (e) {
    showToast(e.message || '投币失败')
  }
}

const handleFavorite = async () => {
  if (!isLoggedIn.value) { requireLogin(); return }
  try {
    const episodeUid = currentEpisode.value?.avid || currentEpisode.value?.id
    if (!episodeUid) return
    if (isFavorited.value) {
      await request.post('/client/favorite/remove', { episodeUid: String(episodeUid) })
      isFavorited.value = false
      showToast('已取消收藏')
    } else {
      await request.post('/client/favorite/add', { episodeUid: String(episodeUid) })
      isFavorited.value = true
      showToast('收藏成功')
    }
  } catch (e) {
    showToast(e.message || '操作失败')
  }
}

const handleShare = async () => {
  const url = window.location.href
  try {
    if (navigator.share) {
      await navigator.share({ title: video.value?.title, url })
    } else {
      await navigator.clipboard.writeText(url)
      showToast('链接已复制')
    }
  } catch {
    showToast('链接已复制')
  }
}

const submitReport = async () => {
  if (reportSubmitting.value) return
  reportSubmitting.value = true
  try {
    await request.post('/client/report/create', {
      targetType: 'video',
      targetId: String(video.value?.avid || video.value?.id),
      content: reportContent.value.trim() || '举报'
    })
    showToast('举报已提交')
    showReport.value = false
    reportContent.value = ''
  } catch (e) {
    showToast(e.message || '举报失败')
  } finally {
    reportSubmitting.value = false
  }
}

const toggleFollow = async () => {
  if (!isLoggedIn.value) { requireLogin(); return }
  try {
    if (isFollowed.value) {
      await unfollowUser(video.value.uid)
      isFollowed.value = false
      showToast('已取消关注')
    } else {
      await followUser(video.value.uid)
      isFollowed.value = true
      showToast('关注成功')
    }
  } catch (e) {
    showToast(e.message || '操作失败')
  }
}

const goUp = () => {
  if (video.value?.uid) router.push(`/up/${video.value.uid}`)
}

const goRelated = (rv) => {
  let path = ''
  if (rv.playLink) {
    path = rv.playLink
    try {
      const url = new URL(path)
      path = url.pathname
    } catch {}
    if (path.startsWith('/api')) path = path.slice(4)
  } else if (rv.videoUid && rv.episodeUid) {
    path = `/client/video/${rv.videoUid}/episode/${rv.episodeUid}`
  } else if (rv.episodeAvid && rv.videoAvid) {
    path = `/client/video/${rv.videoAvid}/episode/${rv.episodeAvid}`
  } else {
    path = `/client/video/${rv.id}/episode/${rv.currentEpisode?.id || rv.id}`
  }
  router.push(path)
}

const initPage = async () => {
  const videoUid = route.params.videoUid
  const episodeUid = route.params.episodeUid
  await loadVideo()

  if (video.value) {
    loadRelatedVideos(video.value.avid || video.value.id)
    loadComments()
    loadEpisodeStatus()
  }

  if (isLoggedIn.value && video.value) {
    try {
      const uid = video.value?.uid
      if (uid && !isOwnVideo.value) {
        const res = await checkIsFollowed(uid)
        isFollowed.value = res === true
      }
    } catch (e) {
      console.error('检查关注状态失败:', e)
    }
  }
}

onMounted(() => {
  initPage()
})

watch(() => route.params.episodeUid, async (newVal, oldVal) => {
  if (newVal && newVal !== oldVal) {
    commentPage.value = 1
    await loadVideo()
    if (video.value) {
      loadComments()
      loadEpisodeStatus()
      loadRelatedVideos(video.value.avid || video.value.id)
    }
  }
})

watch(currentEpisodeIndex, (newIdx) => {
  const ep = episodes.value[newIdx]
  if (!ep) return
  const videoUid = route.params.videoUid
  const episodeUid = ep.avid || ep.id
  if (videoUid && episodeUid && String(episodeUid) !== String(route.params.episodeUid)) {
    router.push(`/client/video/${videoUid}/episode/${episodeUid}`)
  }
})
</script>

<style scoped>
.play-page {
  min-height: 100vh;
  background: var(--bg1);
}

.player-box {
  position: sticky;
  top: 0;
  z-index: 30;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
}

.player-video {
  width: 100%;
  height: 100%;
  display: block;
  background: #000;
}

.player-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: #101014;
  color: #8a8f99;
  font-size: 13px;
}

.retry-btn {
  margin-top: 4px;
}

.vip-lock-tip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: linear-gradient(135deg, #FFF6E9 0%, var(--brand_pink_thin) 100%);
  border-bottom: 1px solid #FFE0EC;
}

.vip-lock-icon {
  color: #FF9838;
  flex-shrink: 0;
}

.vip-lock-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.vip-lock-text {
  font-size: 13px;
  font-weight: 600;
  color: var(--text1);
}

.vip-lock-sub {
  font-size: 11px;
  color: var(--text3);
}

.vip-lock-btn {
  flex-shrink: 0;
}

.page-body {
  padding: 12px 14px 32px;
}

.video-head {
  margin-bottom: 4px;
}

.video-title {
  font-size: 17px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--text1);
  word-break: break-all;
}

.up-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 10px;
}

.up-info {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  cursor: pointer;
}

.up-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  object-fit: cover;
  background: var(--graph_bg_thin);
  flex-shrink: 0;
}

.up-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.up-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text1);
}

.up-stats {
  font-size: 11px;
  color: var(--text3);
}

.page-loading {
  justify-content: center;
  padding: 40px 0;
}

.video-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  padding: 10px 0;
  border-bottom: 1px solid var(--line_light);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 8px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: var(--text2);
  font-size: 12px;
  cursor: pointer;
}

.action-btn.active {
  color: var(--brand_pink);
}

.action-btn em {
  font-style: normal;
}

.action-spacer {
  flex: 1;
}

.episode-section {
  padding: 14px 0;
  border-bottom: 1px solid var(--line-light);
}

.section-header {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 10px;
}

.section-header h3 {
  font-size: 15px;
  font-weight: 600;
  color: var(--text1);
}

.section-sub {
  font-size: 12px;
  color: var(--text3);
}

.episode-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.episode-item {
  position: relative;
  overflow: hidden;
  padding: 9px 4px;
  border: 1px solid var(--line_regular);
  border-radius: 8px;
  background: var(--bg2);
  color: var(--text2);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.episode-item.active {
  border-color: var(--brand_pink);
  background: var(--brand_pink_thin);
  color: var(--brand_pink);
  font-weight: 600;
}

.episode-label {
  position: relative;
  z-index: 1;
  display: block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

/* 右上角斜向丝带 */
.episode-ribbon {
  position: absolute;
  top: 8px;
  right: -22px;
  z-index: 2;
  width: 80px;
  padding: 1px 0;
  background: linear-gradient(135deg, #FFB199 0%, #FF6699 100%);
  color: #fff;
  font-size: 9px;
  font-weight: 600;
  text-align: center;
  transform: rotate(45deg);
  line-height: 1.4;
}

.desc-section {
  padding: 14px 0;
  border-bottom: 1px solid var(--line-light);
}

.desc-text {
  font-size: 13px;
  line-height: 1.7;
  color: var(--text2);
  white-space: pre-wrap;
  word-break: break-all;
}

.desc-text.collapsed {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.desc-toggle {
  font-size: 12px;
  color: var(--brand_pink);
  cursor: pointer;
}

.desc-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.tag-item {
  padding: 3px 9px;
  background: var(--graph_bg_thin);
  border-radius: 12px;
  font-size: 11px;
  color: var(--text3);
}

.comment-section {
  padding: 14px 0;
  border-bottom: 1px solid var(--line-light);
}

.login-prompt {
  padding: 18px 0;
  text-align: center;
  font-size: 13px;
  color: var(--text3);
  background: var(--bg2);
  border-radius: 8px;
}

.login-prompt a {
  color: var(--brand_blue);
}

.comment-input {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  margin-bottom: 14px;
}

.comment-input :deep(.van-field) {
  background: var(--bg2);
  border-radius: 8px;
  padding: 8px 12px;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item {
  display: flex;
  gap: 10px;
}

.comment-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  object-fit: cover;
  background: var(--graph_bg_thin);
  flex-shrink: 0;
}

.comment-main {
  flex: 1;
  min-width: 0;
}

.comment-author {
  font-size: 12px;
  color: var(--text3);
  margin-bottom: 4px;
}

.comment-content {
  font-size: 13px;
  line-height: 1.6;
  color: var(--text1);
  word-break: break-all;
}

.comment-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 5px;
}

.comment-time {
  font-size: 11px;
  color: var(--text4);
}

.comment-like {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  background: none;
  border: none;
  font-size: 11px;
  color: var(--text3);
  cursor: pointer;
}

.load-more-comments {
  margin-top: 4px;
}

.related-section {
  padding: 14px 0 0;
}

.related-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.related-item {
  display: flex;
  gap: 10px;
  cursor: pointer;
}

.related-cover {
  position: relative;
  width: 140px;
  flex-shrink: 0;
  aspect-ratio: 16 / 10;
  border-radius: 6px;
  overflow: hidden;
  background: var(--graph_bg_thin);
}

.related-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.related-vip {
  position: absolute;
  top: 4px;
  right: 4px;
}

.related-duration {
  position: absolute;
  right: 4px;
  bottom: 4px;
  padding: 1px 4px;
  background: rgba(0, 0, 0, 0.65);
  color: #fff;
  font-size: 10px;
  border-radius: 3px;
}

.related-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.related-title {
  font-size: 13px;
  line-height: 1.4;
  color: var(--text1);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.related-meta {
  font-size: 11px;
  color: var(--text3);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.report-body {
  padding: 16px 16px calc(24px + var(--sab));
}

.report-submit {
  margin-top: 14px;
}
</style>
