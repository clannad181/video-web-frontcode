<template>
  <div class="d-player" :class="{ 'd-player--light-off': lightOff }">
    <div class="d-player-wrap" ref="playerWrapRef">
      <vue3VideoPlay
        v-bind="playerOptions"
        :src="src"
        :type="type"
        :title="title"
        :poster="poster"
        :width="width"
        :height="height"
        :autoPlay="autoPlay"
        :loop="loop"
        :volume="volume"
        :speedRate="speedRate"
        :control="showControl"
        :controlBtns="controlBtns"
        :ligthOff="lightOff"
        :mirror="mirror"
        :speed="true"
        @play="onPlay"
        @pause="onPause"
        @ended="onEnded"
        @timeupdate="onTimeupdate"
        @canplay="onCanplay"
        @waiting="onWaiting"
        @playing="onPlaying"
        @loadedmetadata="onLoadedmetadata"
        @volumechange="onVolumechange"
        @ratechange="onRatechange"
        @mirrorChange="onMirrorChange"
        @loopChange="onLoopChange"
        @lightOffChange="onLightOffChange"
      />
    </div>

    <!-- <div class="d-player-topbar" v-if="showTopbar">
      <div class="d-player-topbar__left">
        <span class="d-player-topbar__title">{{ title }}</span>
      </div>
      <div class="d-player-topbar__right">
        <span class="d-player-topbar__clock">{{ currentTime }}</span>
      </div>
    </div> -->

    <!-- <transition name="fade">
      <div class="d-player-status" v-if="statusVisible">
        <div class="d-player-status__icon">
          <el-icon :size="32">
            <component :is="statusIcon" />
          </el-icon>
        </div>
        <div class="d-player-status__text">{{ statusText }}</div>
      </div>
    </transition> -->
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { VideoPlay, VideoPause, Mute, Microphone } from '@element-plus/icons-vue'
import dayjs from 'dayjs'

const props = defineProps({
  src: { type: String, required: true },
  type: { type: String, default: 'video/mp4' },
  title: { type: String, default: '' },
  poster: { type: String, default: '' },
  width: { type: String, default: '100%' },
  height: { type: String, default: '100%' },
  autoPlay: { type: Boolean, default: false },
  loop: { type: Boolean, default: false },
  volume: { type: Number, default: 0.3 },
  speedRate: { type: Array, default: () => ['0.5', '0.75', '1.0', '1.25', '1.5', '2.0'] },
  showTopbar: { type: Boolean, default: true },
  showControl: { type: Boolean, default: true },
  controlBtns: {
    type: Array,
    default: () => ['audioTrack', 'quality', 'speedRate', 'volume', 'setting', 'pip', 'pageFullScreen', 'fullScreen']
  },
  currentTime: { type: Number, default: 0 }
})

const emit = defineEmits(['play', 'pause', 'ended', 'timeupdate', 'canplay', 'loaded'])

const playerWrapRef = ref(null)
const clockTimer = ref(null)
const currentTime = ref(dayjs().format('HH:mm:ss'))
const statusVisible = ref(false)
const statusText = ref('')
const statusIcon = ref(VideoPlay)
const lightOff = ref(false)
const mirror = ref(false)

let statusTimeout = null

const playerOptions = reactive({
  color: '#fb7299',
  muted: false,
  webFullScreen: false,
  speed: true,
  playsinline: false,
  preload: 'auto'
})

function showStatus(text, icon = VideoPlay) {
  statusText.value = text
  statusIcon.value = icon
  statusVisible.value = true
  clearTimeout(statusTimeout)
  statusTimeout = setTimeout(() => {
    statusVisible.value = false
  }, 1500)
}

function onPlay() {
  showStatus('播放', VideoPlay)
  emit('play')
}

function onPause() {
  showStatus('暂停', VideoPause)
  emit('pause')
}

function onEnded() {
  emit('ended')
}

function onTimeupdate(e) {
  emit('timeupdate', e)
}

function onCanplay() {
  emit('canplay')
}

function onWaiting() {
  showStatus('缓冲中...', Loading)
}

function onPlaying() {
  showStatus('播放中', VideoPlay)
}

function onLoadedmetadata(e) {
  emit('loaded', e)
}

function onVolumechange(e) {
  const vol = e.target.volume
  const muted = e.target.muted
  if (muted || vol === 0) {
    showStatus('静音', Mute)
  } else {
    showStatus(`音量 ${Math.round(vol * 100)}%`, Microphone)
  }
}

function onRatechange(e) {
  const rate = e.target.playbackRate
  showStatus(`倍速 ${rate}x`)
}

function onMirrorChange(val) {
  mirror.value = val
  showStatus(val ? '镜像开启' : '镜像关闭')
}

function onLoopChange(val) {
  showStatus(val ? '循环开启' : '循环关闭')
}

function onLightOffChange(val) {
  lightOff.value = val
  showStatus(val ? '关灯模式' : '开灯模式')
}

function updateClock() {
  currentTime.value = dayjs().format('HH:mm:ss')
}

onMounted(() => {
  clockTimer.value = setInterval(updateClock, 1000)
})

onUnmounted(() => {
  clearInterval(clockTimer.value)
  clearTimeout(statusTimeout)
})

function getVideoEl() {
  return playerWrapRef.value?.querySelector('video') || null
}

defineExpose({ getVideoEl })
</script>

<style lang="scss" scoped>
.d-player {
  position: relative;
  width: 100%;
  height: 100%;
  background: #000;
  border-radius: 8px;
  overflow: hidden;

  &--light-off {
    box-shadow: 0 0 60px rgba(0, 0, 0, 0.8);
  }
}

.d-player-wrap {
  width: 100%;
  height: 100%;

  :deep(.vue3-video-play) {
    width: 100% !important;
    height: 100% !important;
  }

  :deep(video) {
    width: 100% !important;
    height: 100% !important;
    object-fit: contain;
  }
}

.d-player-topbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 40px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.6), transparent);
  z-index: 10;
  pointer-events: none;

  &__title {
    font-size: 14px;
    color: #fff;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 70%;
  }

  &__clock {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.8);
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    letter-spacing: 1px;
  }
}

.d-player-status {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 32px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  z-index: 20;
  pointer-events: none;

  &__icon {
    color: #fb7299;
  }

  &__text {
    font-size: 14px;
    color: #fff;
    font-weight: 500;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
