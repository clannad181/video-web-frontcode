<template>
  <div class="layout" :class="{ 'sidebar-collapsed': appStore.sidebar.collapsed }">
    <Sidebar />
    <div
      class="main-container"
      :style="{ marginLeft: appStore.sidebar.collapsed ? '72px' : '240px' }"
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
  transition: background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin-left: 240px;
  background-color: var(--bg-color);
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
