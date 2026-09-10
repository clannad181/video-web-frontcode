<template>
  <div id="app" :class="{ 'dark-mode': appStore.darkMode }">
    <router-view />
  </div>
</template>

<script setup>
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
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
