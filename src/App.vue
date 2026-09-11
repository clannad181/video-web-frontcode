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
  appStore.applyDarkModeClass()
})
</script>

<style lang="scss">
#app {
  min-height: 100vh;
  background-color: var(--bg-color);
  color: var(--text-primary);
}
</style>
