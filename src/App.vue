<template>
  <div id="app" :class="{ 'dark-mode': appStore.darkMode }">
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
import { useAppStore } from '@/stores/app'
import { useSessionTimeout } from '@/composables/useSessionTimeout'
import SessionWarning from '@/components/SessionWarning.vue'

const appStore = useAppStore()
const sessionWarning = useSessionTimeout()
</script>

<style lang="scss">
#app {
  min-height: 100vh;
}

.dark-mode {
  --el-bg-color: #1d1e1f;
  --el-text-color-primary: #e5eaf3;
}
</style>
