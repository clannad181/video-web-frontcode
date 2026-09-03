<template>
  <div class="history-page">
    <div class="history-container">
      <div class="history-header">
        <h2 class="history-title">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          观看历史
        </h2>
        <div class="history-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            v-model="keyword"
            type="text"
            placeholder="搜索观看记录..."
            @keydown.enter="handleSearch"
          />
        </div>
      </div>

      <div v-if="loading && groups.length === 0" class="loading-state">
        <div class="loading-spinner"></div>
      </div>

      <div v-else-if="groups.length > 0" class="history-content">
        <div class="timeline-list" ref="timelineRef">
          <div
            v-for="group in groups"
            :key="group.date"
            class="timeline-row"
            :id="'date-' + group.date"
            :data-date="group.date"
          >
            <div class="timeline-info">
              <div class="node-date">{{ formatDateHeader(group.date) }}</div>
              <div class="node-count">{{ group.items.length }} 条</div>
            </div>
            <div class="timeline-track">
              <div
                class="node-dot"
                @click="scrollToDate(group.date)"
              ></div>
              <div class="node-line"></div>
            </div>
            <div class="timeline-body">
              <div class="date-header">
                <span class="date-text">{{ formatDateHeader(group.date) }}</span>
                <span class="date-count">{{ group.items.length }} 条</span>
              </div>
              <div class="video-grid">
                <div
                  v-for="item in group.items"
                  :key="item.id"
                  class="video-card"
                  @click="handleVideoClick(item)"
                >
                  <a class="video-card__wrap">
                    <div class="video-card__image">
                      <img :src="item.videoCover" :alt="item.videoTitle" loading="lazy" class="video-card__cover" />
                      <div class="video-card__delete" @click="handleDelete($event, item)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </div>
                      <div class="video-card__mask">
                        <div class="video-card__stats">
                          <div class="video-card__stats--left">
                            <span class="video-card__stats--item">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                            </span>
                          </div>
                          <span class="video-card__stats__duration">{{ item.watchedTime }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="video-card__info">
                      <a class="video-card__info--tit">{{ item.videoTitle }}</a>
                      <div v-if="item.episodeNumber > 1" class="video-card__info--episode">第{{ item.episodeNumber }}集</div>
                      <div class="video-card__info--meta">
                        <span v-if="item.nickName" class="video-card__info--author">
                          <IconUp :size="16" color="var(--text4)" />
                          {{ item.nickName }}
                        </span>
                        <span class="video-card__info--date">{{ formatWatchTime(item.watchTime) }}</span>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="loading" class="load-more">
          <div class="loading-spinner small"></div>
          <span>加载中...</span>
        </div>
        <div v-if="noMore" class="load-end">没有更多了</div>
      </div>

      <div v-else class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity="0.2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        <p>暂无观看记录</p>
        <span class="empty-hint">快去观看感兴趣的视频吧</span>
      </div>
    </div>

    <transition name="fade">
      <div v-if="showBackTop" class="back-top" @click="scrollToTop">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="18 15 12 9 6 15"/>
        </svg>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { searchWatchHistory, deleteWatchHistory } from '../api/video'
import IconUp from '../icons/IconUp.vue'

const router = useRouter()

const formatDate = (date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const groups = ref([])
const loading = ref(false)
const noMore = ref(false)
const currentPage = ref(1)
const PAGE_SIZE = 10
const keyword = ref('')
const timelineRef = ref(null)
const showBackTop = ref(false)

const now = new Date()
const endDate = ref(formatDate(now))
const startDate = ref(formatDate(new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())))

const loadHistory = async (page = 1) => {
  if (loading.value) return
  loading.value = true
  try {
    const res = await searchWatchHistory({
      page,
      size: PAGE_SIZE,
      keyword: keyword.value || undefined,
      startDate: startDate.value || undefined,
      endDate: endDate.value || undefined
    })
    const records = res?.records || []
    const flatList = []
    for (const month of records) {
      for (const day of (month.days || [])) {
        flatList.push({ date: day.date, items: day.items || [] })
      }
    }
    const resTotal = res?.total || 0
    if (page === 1) {
      groups.value = flatList
    } else {
      groups.value = [...groups.value, ...flatList]
    }
    currentPage.value = page
    if (page >= resTotal || flatList.length === 0) {
      noMore.value = true
    }
  } catch (e) {
    console.error('获取观看历史失败:', e)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  noMore.value = false
  loadHistory(1)
}

const updateTimeline = () => {
  if (!timelineRef.value) return
  const rows = timelineRef.value.querySelectorAll('.timeline-row')
  const NAV_HEIGHT = 70
  const STACK_GAP = 20
  const MAX_STACK = 5

  let timelineLeft = 0
  for (const row of rows) {
    const dot = row.querySelector('.node-dot')
    if (dot) {
      const dotRect = dot.getBoundingClientRect()
      timelineLeft = dotRect.left
      break
    }
  }

  for (const row of rows) {
    row.classList.remove('stacked', 'active')
    row.style.position = ''
    row.style.top = ''
    row.style.zIndex = ''
    const dot = row.querySelector('.node-dot')
    const info = row.querySelector('.timeline-info')
    if (dot) {
      dot.style.opacity = ''
      dot.style.pointerEvents = ''
      dot.style.transform = ''
    }
    if (info) {
      info.style.opacity = ''
      info.style.pointerEvents = ''
      info.style.transform = ''
    }
  }

  let stackedCount = 0
  for (const row of rows) {
    const rect = row.getBoundingClientRect()
    if (rect.top + rect.height < NAV_HEIGHT + 30) {
      row.classList.add('stacked')
      const dot = row.querySelector('.node-dot')
      const info = row.querySelector('.timeline-info')
      if (dot) { dot.style.opacity = '0'; dot.style.pointerEvents = 'none' }
      if (info) { info.style.opacity = '0'; info.style.pointerEvents = 'none' }
      stackedCount++
    }
  }

  let closestRow = null
  let closestDist = Infinity
  for (const row of rows) {
    if (row.classList.contains('stacked')) continue
    const rect = row.getBoundingClientRect()
    const rowCenter = rect.top + rect.height / 2
    const dist = Math.abs(rowCenter - NAV_HEIGHT)
    if (dist < closestDist) {
      closestDist = dist
      closestRow = row
    }
  }
  if (closestRow) {
    closestRow.classList.add('active')
  }

  const existingClones = document.querySelectorAll('.stack-clone, .stack-clone-wrapper, .stack-clone-line')
  existingClones.forEach(c => c.remove())

  const stackedRows = []
  for (const row of rows) {
    if (row.classList.contains('stacked')) stackedRows.push(row)
  }
  const visibleStacked = stackedRows.slice(-MAX_STACK)

  let lastCloneBottom = NAV_HEIGHT + 8
  let cloneCount = 0
  for (const row of visibleStacked) {
    const info = row.querySelector('.timeline-info')
    if (!info) continue

    const dotWrapper = document.createElement('div')
    dotWrapper.className = 'stack-clone-wrapper'
    dotWrapper.style.cssText = `
      position: fixed; top: ${NAV_HEIGHT + 8 + cloneCount * STACK_GAP}px;
      left: ${timelineLeft}px; width: 14px; height: 14px;
      margin-bottom: ${STACK_GAP}px;
      z-index: ${200 - cloneCount};
      cursor: pointer; pointer-events: auto;
    `

    const dotClone = document.createElement('div')
    dotClone.className = 'stack-clone'
    dotClone.style.cssText = `
      width: 14px; height: 14px;
      border-radius: 50%; background: var(--bg2); border: 2px solid var(--line_regular);
      opacity: 0.8; transform: scale(0.7);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    `
    dotWrapper.appendChild(dotClone)

    if (cloneCount < visibleStacked.length - 1) {
      const lineClone = document.createElement('div')
      lineClone.className = 'stack-clone-line'
      lineClone.style.cssText = `
        position: absolute; top: 20px; left: 50%;
        width: 2px; height: ${STACK_GAP - 14}px;
        background: linear-gradient(180deg, var(--brand_pink) 0%, var(--line_regular) 100%);
        transform: translateX(-50%);
        border-radius: 1px;
      `
      dotWrapper.appendChild(lineClone)
    }

    dotWrapper.addEventListener('mouseenter', () => {
      dotClone.style.borderColor = 'var(--brand_pink)'
      dotClone.style.background = 'var(--brand_pink)'
      dotClone.style.boxShadow = '0 0 0 6px rgba(249, 168, 37, 0.2)'
      dotClone.style.transform = 'scale(1.3)'
    })
    dotWrapper.addEventListener('mouseleave', () => {
      dotClone.style.borderColor = 'var(--line_regular)'
      dotClone.style.background = 'var(--bg2)'
      dotClone.style.boxShadow = 'none'
      dotClone.style.transform = 'scale(0.7)'
    })
    const date = row.dataset.date
    dotWrapper.addEventListener('click', () => scrollToDate(date))
    document.body.appendChild(dotWrapper)

    lastCloneBottom = NAV_HEIGHT + 8 + cloneCount * STACK_GAP + 14 + STACK_GAP

    const infoClone = document.createElement('div')
    infoClone.className = 'stack-clone'
    infoClone.style.cssText = `
      position: fixed; top: ${NAV_HEIGHT + 5 + cloneCount * STACK_GAP}px;
      right: calc(100% - ${timelineLeft - 18}px); margin-bottom: ${STACK_GAP}px;
      z-index: ${199 - cloneCount};
      opacity: 0.7; font-size: 13px; color: var(--text1);
      white-space: nowrap; pointer-events: none; text-align: right;
    `
    infoClone.textContent = info.querySelector('.node-date')?.textContent || ''
    document.body.appendChild(infoClone)

    cloneCount++
  }

  if (cloneCount > 0) {
    let firstNonStackedRow = null
    for (const row of rows) {
      if (row.classList.contains('stacked')) continue
      firstNonStackedRow = row
      break
    }
    if (firstNonStackedRow) {
      const dot = firstNonStackedRow.querySelector('.node-dot')
      const info = firstNonStackedRow.querySelector('.timeline-info')
      if (dot && info) {
        const dotRect = dot.getBoundingClientRect()
        if (dotRect.top < lastCloneBottom) {
          const offset = lastCloneBottom - dotRect.top
          dot.style.transform = `translateY(${offset}px)`
          info.style.transform = `translateY(${offset}px)`
        }
      }
    }
  }
}

const handleScroll = () => {
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
  const scrollHeight = document.documentElement.scrollHeight
  const clientHeight = document.documentElement.clientHeight
  showBackTop.value = scrollTop > 400
  if (scrollTop + clientHeight >= scrollHeight - 200) {
    if (!noMore.value && !loading.value) {
      loadHistory(currentPage.value + 1)
    }
  }
  updateTimeline()
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const scrollToDate = (date) => {
  const el = document.getElementById('date-' + date)
  if (el) {
    const y = el.getBoundingClientRect().top + window.scrollY - 80
    window.scrollTo({ top: y, behavior: 'smooth' })
  }
}

const handleVideoClick = (item) => {
  if (item.videoAvid && item.episodeAvid) {
    window.open(`/client/video/${item.videoAvid}/episode/${item.episodeAvid}`, '_blank')
  }
}

const handleDelete = async (e, item) => {
  e.stopPropagation()
  try {
    await deleteWatchHistory({
      videoUid: item.videoAvid,
      episodeUid: item.episodeAvid || undefined
    })
    for (const group of groups.value) {
      const idx = group.items.findIndex(i => i.id === item.id)
      if (idx !== -1) {
        group.items.splice(idx, 1)
        break
      }
    }
    groups.value = groups.value.filter(g => g.items.length > 0)
  } catch (e) {
    console.error('删除记录失败:', e)
  }
}

const formatWatchTime = (time) => {
  if (!time) return ''
  const timePart = time.replace(/.*\s/, '').replace(/:\d{2}$/, '')
  const datePart = time.replace(/\s.*/, '').replace(/^\d{4}[-/]/, '')
  const now = new Date()
  const today = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const yesterday = new Date(now - 86400000)
  const yesterdayStr = `${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`
  if (datePart === today) return `今天 ${timePart}`
  if (datePart === yesterdayStr) return `昨天 ${timePart}`
  return `${datePart} ${timePart}`
}

const formatDateHeader = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diff = Math.floor((today - target) / (1000 * 60 * 60 * 24))

  if (diff === 0) return '今天'
  if (diff === 1) return '昨天'
  if (diff < 7) return `${diff}天前`
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  if (year !== now.getFullYear()) return `${year}年${month}月${day}日`
  return `${month}月${day}日`
}

onMounted(() => {
  loadHistory()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.querySelectorAll('.stack-clone').forEach(c => c.remove())
})
</script>

<style scoped>
.history-page {
  min-height: 100vh;
  background: var(--bg1);
}

.history-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 90px 60px 60px;
}

.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--line_light);
}

.history-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  font-weight: 600;
  color: var(--text1);
  margin: 0;
}

.history-title svg {
  color: var(--brand_pink);
}

.history-search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--bg2);
  border: 1px solid var(--line_light);
  border-radius: 20px;
  transition: border-color 0.2s;
}

.history-search:focus-within {
  border-color: var(--brand_pink);
}

.history-search svg {
  color: var(--text3);
  flex-shrink: 0;
}

.history-search input {
  border: none;
  background: none;
  outline: none;
  font-size: 14px;
  color: var(--text1);
  width: 180px;
}

.history-search input::placeholder {
  color: var(--text4);
}

.timeline-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding-left: 100px;
  position: relative;
}

.timeline-row {
  display: flex;
  gap: 0;
  position: relative;
}

.timeline-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 90px;
  min-width: 90px;
  flex-shrink: 0;
  z-index: 9;
  padding-right: 12px;
  text-align: right;
  padding-top: 18px;
}

.timeline-track {
  position: relative;
  width: 20px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.node-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--bg2);
  border: 2px solid var(--line_regular);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  z-index: 100;
  cursor: pointer;
  margin-top: 18px;
}

.node-dot:hover {
  border-color: var(--brand_pink);
  background: var(--brand_pink);
  box-shadow: 0 0 0 6px rgba(249, 168, 37, 0.2);
  transform: scale(1.3);
}

.timeline-row:first-child .node-dot,
.timeline-row.active .node-dot {
  border-color: var(--brand_pink);
  background: var(--brand_pink);
  box-shadow: 0 0 0 6px rgba(249, 168, 37, 0.2);
  transform: scale(1.2);
}

.node-date {
  font-size: 14px;
  font-weight: 500;
  color: var(--text1);
  white-space: nowrap;
}

.timeline-row:hover .node-date {
  color: var(--brand_pink);
}

.node-count {
  font-size: 12px;
  color: var(--text4);
  white-space: nowrap;
}

.node-line {
  width: 2px;
  flex: 1;
  background: linear-gradient(180deg, var(--brand_pink) 0%, var(--line_regular) 100%);
  margin-top: 6px;
  min-height: 20px;
  border-radius: 1px;
}

.timeline-row:last-child .node-line {
  display: none;
}

.timeline-body {
  flex: 1;
  min-width: 0;
  padding-bottom: 36px;
}

.timeline-row:last-child .timeline-body {
  padding-bottom: 0;
}

.date-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 10px;
  padding-top: 4px;
  border-bottom: 1px solid var(--line_light);
}

.date-text {
  font-size: 16px;
  font-weight: 600;
  color: var(--text1);
}

.date-count {
  font-size: 12px;
  color: var(--text4);
  padding: 2px 8px;
  background: var(--bg2);
  border-radius: 10px;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.video-card {
  display: flex;
  flex-direction: column;
}

.video-card__wrap {
  display: block;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  text-decoration: none;
  transition: transform 0.3s, box-shadow 0.3s;
}

.video-card__wrap:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.video-card__image {
  position: relative;
  padding-top: 56.25%;
  background: var(--bg3);
}

.video-card__delete {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 3;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s;
  color: #fff;
}

.video-card__wrap:hover .video-card__delete {
  opacity: 1;
}

.video-card__delete:hover {
  background: var(--brand_pink);
  transform: scale(1.1);
}

.video-card__cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.video-card__wrap:hover .video-card__cover {
  transform: scale(1.06);
}

.video-card__mask {
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 2;
  width: 100%;
  height: 42px;
  padding: 18px 10px 8px;
  background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.85));
}

.video-card__stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.video-card__stats--left {
  display: flex;
  gap: 14px;
}

.video-card__stats--item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
}

.video-card__stats__duration {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(0, 0, 0, 0.4);
  padding: 2px 6px;
  border-radius: 4px;
}

.video-card__info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 10px;
}

.video-card__info--tit {
  font-size: 14px;
  font-weight: 500;
  color: var(--text1);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-decoration: none;
  transition: color 0.2s;
}

.video-card__info--tit:hover {
  color: var(--brand_pink);
}

.video-card__info--episode {
  font-size: 12px;
  color: var(--brand_pink);
  background: rgba(249, 168, 37, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  align-self: flex-start;
}

.video-card__info--meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.video-card__info--author {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  line-height: 1;
  color: var(--text3);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.video-card__info--date {
  font-size: 13px;
  color: var(--text3);
  flex-shrink: 0;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
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

/* 淡入淡出过渡 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.load-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px;
  color: var(--text3);
  font-size: 13px;
}

.load-end {
  text-align: center;
  padding: 24px;
  color: var(--text3);
  font-size: 13px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px;
  gap: 16px;
  color: var(--text3);
}

.empty-state p {
  font-size: 14px;
  margin: 0;
}

.empty-hint {
  font-size: 13px;
  color: var(--text4);
}

.back-top {
  position: fixed;
  bottom: 40px;
  right: 40px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--bg2);
  border: 1px solid var(--line_regular);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 100;
  transition: all 0.3s;
  color: var(--text2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.back-top:hover {
  background: var(--brand_pink);
  border-color: var(--brand_pink);
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(249, 168, 37, 0.3);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 1200px) {
  .video-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .history-container {
    padding: 90px 16px 40px;
  }

  .history-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .history-search {
    width: 100%;
  }

  .history-search input {
    width: 100%;
  }

  .timeline-list {
    padding-left: 0;
  }

  .video-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
