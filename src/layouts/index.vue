<template>
  <div class="layout" :class="{ 'sidebar-collapsed': appStore.sidebar.collapsed, 'dark-mode': appStore.darkMode }">
    <Sidebar />
    <div
      class="main-container"
      :style="{ marginLeft: appStore.sidebar.collapsed ? '64px' : '220px' }"
    >
      <Navbar />
      <AppMain />
    </div>
  </div>
</template>

<script setup>
import Sidebar from './components/Sidebar.vue'
import Navbar from './components/Navbar.vue'
import AppMain from './components/AppMain.vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
</script>

<style lang="scss" scoped>
.layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background-color: var(--bg-color);
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
