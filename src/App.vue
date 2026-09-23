<template>
  <div id="app">
    <router-view />
    <SessionWarning
      :show="sessionWarning.showWarning.value"
      :countdown="sessionWarning.countdown.value"
      @continue="sessionWarning.handleContinue"
      @logout="sessionWarning.handleLogout"
    />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { useSessionTimeout } from '@/composables/useSessionTimeout'
import SessionWarning from '@/components/SessionWarning.vue'

const appStore = useAppStore()
const sessionWarning = useSessionTimeout()

onMounted(() => {
  appStore.applyDarkModeClass(false)
  applyLocalAppearance()
})

// 本地保存的外观设置优先生效（本地保存 > 接口默认）
function applyLocalAppearance() {
  try {
    const raw = localStorage.getItem('app_settings')
    if (!raw) return
    const s = JSON.parse(raw)
    if (s.primaryColor) document.documentElement.style.setProperty('--color-primary', s.primaryColor)
    if (s.darkMode !== undefined) appStore.setDarkMode(!!s.darkMode, false)
    if (s.compactMode !== undefined) document.documentElement.classList.toggle('compact-mode', !!s.compactMode)
    if (s.sidebarStyle) appStore.setSidebarStyle(s.sidebarStyle)
  } catch { /* ignore */ }
}
</script>

<style lang="scss">
#app {
  min-height: 100vh;
  background-color: var(--bg-color);
  color: var(--text-primary);
}
</style>
