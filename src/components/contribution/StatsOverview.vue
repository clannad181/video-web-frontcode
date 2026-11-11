<template>
  <div class="stats-overview">
    <van-loading v-if="loading" class="page-loading" color="#FF6699">加载中…</van-loading>

    <template v-else>
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-icon play"><van-icon name="play-circle-o" size="20" /></div>
          <div class="stat-body">
            <strong>{{ formatCount(stats.totalPlayCount) }}</strong>
            <span>总播放</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon fav"><van-icon name="star-o" size="20" /></div>
          <div class="stat-body">
            <strong>{{ formatCount(stats.totalFavoriteCount) }}</strong>
            <span>总收藏</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon coin"><van-icon name="gold-coin-o" size="20" /></div>
          <div class="stat-body">
            <strong>{{ formatCount(stats.totalCoinCount) }}</strong>
            <span>总投币</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon like"><van-icon name="good-job-o" size="20" /></div>
          <div class="stat-body">
            <strong>{{ formatCount(stats.totalLikeCount) }}</strong>
            <span>总点赞</span>
          </div>
        </div>
      </div>

      <div class="stats-section" v-if="stats.hotVideos.length">
        <div class="section-title">热门稿件</div>
        <div class="rank-list">
          <div v-for="(v, i) in stats.hotVideos" :key="v.id" class="rank-item">
            <span class="rank-no" :class="{ top: i < 3 }">{{ i + 1 }}</span>
            <div class="rank-info">
              <div class="rank-title">{{ v.title }}</div>
              <div class="rank-meta">{{ formatCount(v.playCount || 0) }}播放</div>
            </div>
          </div>
        </div>
      </div>

      <van-empty
        v-if="!stats.hotVideos.length && !stats.totalPlayCount"
        description="暂无数据"
        image-size="80"
      />
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getStatsDataCenter } from '../../api/video'
import { formatCount } from '../../utils/format'

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
.page-loading {
  justify-content: center;
  padding: 50px 0;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding: 12px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 12px;
  background: var(--bg1);
  border-radius: 12px;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: var(--brand_pink_thin);
  color: var(--brand_pink);
}

.stat-icon.fav { background: #FFF3E0; color: #FF9838; }
.stat-icon.coin { background: #E8F6FF; color: #00AEEC; }
.stat-icon.like { background: #E8F8EE; color: #07c160; }

.stat-body {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.stat-body strong {
  font-size: 17px;
  color: var(--text1);
}

.stat-body span {
  font-size: 11px;
  color: var(--text3);
}

.stats-section {
  padding: 6px 12px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text1);
  margin-bottom: 8px;
}

.rank-list {
  display: flex;
  flex-direction: column;
  background: var(--bg1);
  border-radius: 12px;
  overflow: hidden;
}

.rank-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-bottom: 1px solid var(--line-light);
}

.rank-item:last-child {
  border-bottom: none;
}

.rank-no {
  width: 22px;
  text-align: center;
  font-size: 14px;
  font-weight: 700;
  color: var(--text4);
  flex-shrink: 0;
}

.rank-no.top {
  color: var(--brand_pink);
}

.rank-info {
  flex: 1;
  min-width: 0;
}

.rank-title {
  font-size: 13px;
  color: var(--text1);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.rank-meta {
  font-size: 11px;
  color: var(--text3);
  margin-top: 3px;
}
</style>
