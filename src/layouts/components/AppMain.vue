<template>
  <div class="app-main">
    <router-view v-slot="{ Component }">
      <transition name="slide-fade" mode="out-in">
        <keep-alive>
          <component :is="Component" :key="route.path" />
        </keep-alive>
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<style lang="scss" scoped>
.app-main {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: var(--bg-color);

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.12);
    border-radius: 3px;

    &:hover {
      background: rgba(0, 0, 0, 0.2);
    }
  }
}

.slide-fade-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
