<template>
  <div class="video-card" @click="handleClick">
    <div class="video-card__cover">
      <img :src="fileUrl(video.coverUrl)" :alt="video.title" loading="lazy" />
      <span v-if="video.needVip" class="vip-badge video-card__vip">大会员</span>
      <span class="video-card__duration">{{ formatDuration(video.totalDuration) }}</span>
      <div class="video-card__stats">
        <span><van-icon name="play" size="11" />{{ formatCount(video.playCount) }}</span>
        <span><van-icon name="chat" size="11" />{{ formatCount(video.favoriteCount) }}</span>
      </div>
    </div>
    <div class="video-card__info">
      <div class="video-card__title">{{ video.title }}</div>
      <div class="video-card__meta">
        <span class="video-card__author">{{ video.nickName }}</span>
        <span class="video-card__date">{{ formatDate(video.createTime) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { formatDuration, formatCount, formatDate } from '../../utils/fileUpload'
import { fileUrl } from '../../config'
import { handleVideoClick } from '../../utils/video'

const props = defineProps({
  video: { type: Object, required: true }
})

const router = useRouter()

const handleClick = () => {
  handleVideoClick(props.video, router)
}
</script>

<style scoped>
.video-card {
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

.video-card__cover {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  border-radius: 8px;
  overflow: hidden;
  background: var(--graph_bg_thin);
}

.video-card__cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-card__vip {
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 2;
}

.video-card__duration {
  position: absolute;
  right: 6px;
  bottom: 6px;
  padding: 1px 5px;
  background: rgba(0, 0, 0, 0.65);
  color: #fff;
  font-size: 10px;
  border-radius: 3px;
}

.video-card__stats {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  gap: 10px;
  padding: 14px 6px 5px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
  color: #fff;
  font-size: 10px;
}

.video-card__stats span {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.video-card__info {
  padding: 6px 2px 0;
}

.video-card__title {
  font-size: 13px;
  line-height: 1.4;
  color: var(--text1);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  word-break: break-all;
}

.video-card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-top: 4px;
}

.video-card__author {
  font-size: 11px;
  color: var(--text3);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.video-card__date {
  font-size: 10px;
  color: var(--text4);
  flex-shrink: 0;
}
</style>
