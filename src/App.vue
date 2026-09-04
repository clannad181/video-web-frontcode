<template>
  <div id="app" v-cloak :class="{ 'dark-mode': darkMode, 'compact-mode': compactMode }">
    <AppHeader v-if="!hideLayout" />
    <main class="main-content" :class="{ 'full-page': hideLayout }">
      <router-view :key="route.fullPath" v-slot="{ Component }">
        <Transition name="page-slide" mode="out-in">
          <component :is="Component" />
        </Transition>
      </router-view>
    </main>
    <AppFooter v-if="!hideLayout" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from './components/layout/AppHeader.vue'
import AppFooter from './components/layout/AppFooter.vue'
import { getDisplayConfig } from './api/client'

const route = useRoute()
const hideLayout = computed(() => route.meta?.hideLayout === true || route.name === 'Contribution' || route.name === 'EpisodeManagement')

const darkMode = ref(false)
const compactMode = ref(false)
const primaryColor = ref('')

const loadConfig = async () => {
  try {
    const cached = sessionStorage.getItem('displayConfig')
    let configMap = {}

    if (cached) {
      configMap = JSON.parse(cached)
    } else {
      const result = await getDisplayConfig()
      const configList = Array.isArray(result) ? result : (result?.data || [])
      configList.forEach(item => {
        configMap[item.key] = item.value
      })
      sessionStorage.setItem('displayConfig', JSON.stringify(configMap))
    }

    darkMode.value = configMap.darkMode === 'true'
    compactMode.value = configMap.compactMode === 'true'
    primaryColor.value = configMap.primaryColor || ''
    
    if (primaryColor.value) {
      document.documentElement.style.setProperty('--brand_pink', primaryColor.value)
    }
  } catch (e) {
    console.error('获取网站配置失败:', e)
  }
}

onMounted(() => {
  loadConfig()
})
</script>

<style>
.main-content {
  min-height: calc(100vh - 60px);
}

.main-content.full-page {
  min-height: 100vh;
  padding-top: 0;
}

.page-slide-enter-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.page-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.page-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.page-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
