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
const sidebarStyle = ref('dark')

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
    sidebarStyle.value = configMap.sidebarStyle || 'dark'

    if (primaryColor.value) {
      const root = document.documentElement
      root.style.setProperty('--brand_pink', primaryColor.value)

      const r = parseInt(primaryColor.value.slice(1, 3), 16)
      const g = parseInt(primaryColor.value.slice(3, 5), 16)
      const b = parseInt(primaryColor.value.slice(5, 7), 16)

      const lighten = (amt) => {
        const nr = Math.min(255, r + Math.round((255 - r) * amt))
        const ng = Math.min(255, g + Math.round((255 - g) * amt))
        const nb = Math.min(255, b + Math.round((255 - b) * amt))
        return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`
      }

      const darken = (amt) => {
        const nr = Math.max(0, Math.round(r * (1 - amt)))
        const ng = Math.max(0, Math.round(g * (1 - amt)))
        const nb = Math.max(0, Math.round(b * (1 - amt)))
        return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`
      }

      root.style.setProperty('--brand_pink_thin', `rgba(${r}, ${g}, ${b}, 0.1)`)
      root.style.setProperty('--brand_pink_hover', lighten(0.2))
      root.style.setProperty('--brand_pink_active', darken(0.15))
      root.style.setProperty('--color-primary', primaryColor.value)
      root.style.setProperty('--color-primary-hover', lighten(0.2))
      root.style.setProperty('--color-primary-light', `rgba(${r}, ${g}, ${b}, 0.1)`)
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
