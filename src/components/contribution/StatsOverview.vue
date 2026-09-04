<template>
  <div class="stats-overview">
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon stat-icon--play">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ formatCount(stats.totalPlayCount) }}</div>
          <div class="stat-label">总播放量</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon--fav">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ formatCount(stats.totalFavoriteCount) }}</div>
          <div class="stat-label">总收藏数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon--coin">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.94s4.18 1.36 4.18 3.85c0 1.89-1.44 2.98-3.12 3.19z"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ formatCount(stats.totalCoinCount) }}</div>
          <div class="stat-label">总投币数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon--like">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ formatCount(stats.totalLikeCount) }}</div>
          <div class="stat-label">总点赞数</div>
        </div>
      </div>
    </div>

    <div class="ranking-section">
      <div class="ranking-card">
        <h3 class="ranking-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 20V10"/>
            <path d="M12 20V4"/>
            <path d="M6 20v-6"/>
          </svg>
          热门视频 TOP5
        </h3>
        <div v-if="stats.hotVideos?.length" class="ranking-list">
          <div v-for="(video, index) in stats.hotVideos.slice(0, 5)" :key="video.videoUid" class="ranking-item">
            <span class="rank" :class="'rank-' + (index + 1)">{{ index + 1 }}</span>
            <div class="ranking-info">
              <div class="ranking-title-text">{{ video.title }}</div>
              <div class="ranking-meta">
                <span>{{ video.categoryName }}</span>
                <span>{{ video.episodeCount }}P</span>
                <span>{{ formatDuration(video.duration) }}</span>
              </div>
            </div>
            <span class="ranking-count">{{ formatCount(video.playCount) }}次播放</span>
          </div>
        </div>
        <div v-else class="ranking-empty">暂无数据</div>
      </div>

      <div class="ranking-card">
        <h3 class="ranking-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          人气视频 TOP5
        </h3>
        <div v-if="stats.favoriteVideos?.length" class="ranking-list">
          <div v-for="(video, index) in stats.favoriteVideos.slice(0, 5)" :key="video.videoUid" class="ranking-item">
            <span class="rank" :class="'rank-' + (index + 1)">{{ index + 1 }}</span>
            <div class="ranking-info">
              <div class="ranking-title-text">{{ video.title }}</div>
              <div class="ranking-meta">
                <span>{{ video.categoryName }}</span>
                <span>{{ video.episodeCount }}P</span>
                <span>{{ formatDuration(video.duration) }}</span>
              </div>
            </div>
            <span class="ranking-count">{{ formatCount(video.favoriteCount) }}次收藏</span>
          </div>
        </div>
        <div v-else class="ranking-empty">暂无数据</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getStatsDataCenter } from '../../api/video'
import { formatCount, formatDuration } from '../../utils/format'

const stats = ref({
  totalPlayCount: 0,
  totalFavoriteCount: 0,
  totalCoinCount: 0,
  totalLikeCount: 0,
  hotVideos: [],
  favoriteVideos: []
})
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    const res = await getStatsDataCenter()
    stats.value = {
      totalPlayCount: res?.totalPlayCount || 0,
      totalFavoriteCount: res?.totalFavoriteCount || 0,
      totalCoinCount: res?.totalCoinCount || 0,
      totalLikeCount: res?.totalLikeCount || 0,
      hotVideos: res?.hotVideos || [],
      favoriteVideos: res?.favoriteVideos || []
    }
  } catch (e) {
    console.error('获取数据概览失败:', e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.stats-overview {
  animation: fadeIn 0.4s ease;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--bg1);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.stat-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  flex-shrink: 0;
}

.stat-icon--play {
  background: linear-gradient(135deg, rgba(255, 102, 153, 0.15) 0%, rgba(255, 140, 176, 0.15) 100%);
  color: var(--brand_pink);
}

.stat-icon--fav {
  background: linear-gradient(135deg, rgba(255, 77, 79, 0.15) 0%, rgba(255, 119, 102, 0.15) 100%);
  color: #ff4d4f;
}

.stat-icon--coin {
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.15) 0%, rgba(255, 213, 79, 0.15) 100%);
  color: #ffc107;
}

.stat-icon--like {
  background: linear-gradient(135deg, rgba(0, 174, 236, 0.15) 0%, rgba(64, 197, 241, 0.15) 100%);
  color: var(--brand_blue);
}

.stat-content {
  min-width: 0;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--text1);
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: var(--text3);
  margin-top: 4px;
}

.ranking-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.ranking-card {
  background: var(--bg1);
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--shadow-sm);
}

.ranking-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text1);
  margin: 0 0 16px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--line_light);
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 8px;
  transition: background 0.2s ease;
}

.ranking-item:hover {
  background: var(--bg2);
}

.rank {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
  background: var(--bg3);
  color: var(--text3);
}

.rank-1 {
  background: linear-gradient(135deg, #FF6699 0%, #FF8CB0 100%);
  color: #fff;
}

.rank-2 {
  background: linear-gradient(135deg, #FF8CB0 0%, #FFB3CC 100%);
  color: #fff;
}

.rank-3 {
  background: linear-gradient(135deg, #FFB3CC 0%, #FFD6E5 100%);
  color: var(--brand_pink);
}

.ranking-info {
  flex: 1;
  min-width: 0;
}

.ranking-title-text {
  font-size: 14px;
  font-weight: 500;
  color: var(--text1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 4px;
}

.ranking-meta {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: var(--text4);
}

.ranking-count {
  font-size: 13px;
  color: var(--text3);
  flex-shrink: 0;
}

.ranking-empty {
  text-align: center;
  padding: 40px;
  color: var(--text4);
  font-size: 14px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 1200px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .ranking-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }
}
</style>
