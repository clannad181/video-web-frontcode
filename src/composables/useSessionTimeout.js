import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'

export function useSessionTimeout(timeout = 30 * 60 * 1000, warningTime = 60 * 1000) {
  const router = useRouter()
  const route = useRoute()
  const userStore = useUserStore()

  const showWarning = ref(false)
  const countdown = ref(warningTime / 1000)

  let idleTimer = null
  let warningTimer = null
  let countdownInterval = null

  const EVENTS = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click']

  function resetIdleTimer() {
    clearTimeout(idleTimer)
    clearTimeout(warningTimer)
    clearInterval(countdownInterval)
    showWarning.value = false
    countdown.value = warningTime / 1000

    idleTimer = setTimeout(() => {
      showWarning.value = true
      countdown.value = warningTime / 1000
      countdownInterval = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          clearInterval(countdownInterval)
          handleLogout()
        }
      }, 1000)
    }, timeout)
  }

  function handleLogout() {
    showWarning.value = false
    userStore.logoutAction()
  }

  function handleContinue() {
    showWarning.value = false
    resetIdleTimer()
  }

  function handleEvents() {
    if (!showWarning.value) {
      resetIdleTimer()
    }
  }

  function shouldMonitor() {
    return route.path !== '/login' && route.path !== '/register'
  }

  function startMonitoring() {
    if (shouldMonitor()) {
      EVENTS.forEach(event => {
        document.addEventListener(event, handleEvents, { passive: true })
      })
      resetIdleTimer()
    }
  }

  function stopMonitoring() {
    EVENTS.forEach(event => {
      document.removeEventListener(event, handleEvents)
    })
    clearTimeout(idleTimer)
    clearTimeout(warningTimer)
    clearInterval(countdownInterval)
    showWarning.value = false
  }

  watch(
    () => route.path,
    () => {
      stopMonitoring()
      if (shouldMonitor()) {
        startMonitoring()
      }
    }
  )

  onMounted(() => {
    startMonitoring()
  })

  onUnmounted(() => {
    stopMonitoring()
  })

  return {
    showWarning,
    countdown,
    handleLogout,
    handleContinue
  }
}
