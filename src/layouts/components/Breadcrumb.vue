<template>
  <el-breadcrumb separator="/" class="app-breadcrumb">
    <transition-group name="breadcrumb-fade">
      <el-breadcrumb-item
        v-for="(item, index) in breadcrumbs"
        :key="item.path"
      >
        <div class="breadcrumb-item" :class="{ 'is-link': !isLast(index) }">
          <el-icon v-if="index === 0" class="breadcrumb-home-icon">
            <HomeFilled />
          </el-icon>
          <router-link
            v-if="!isLast(index) && item.meta?.title"
            :to="item.path"
            class="breadcrumb-link"
          >
            {{ item.meta.title }}
          </router-link>
          <span v-else-if="item.meta?.title" class="breadcrumb-text">
            {{ item.meta.title }}
          </span>
        </div>
      </el-breadcrumb-item>
    </transition-group>
  </el-breadcrumb>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const breadcrumbs = ref([])

const isLast = (index) => index === breadcrumbs.value.length - 1

const getBreadcrumbs = () => {
  const matched = route.matched.filter((item) => item.meta && item.meta.title)
  const homeRoute = { path: '/', meta: { title: '首页' } }
  breadcrumbs.value = [homeRoute, ...matched]
}

watch(() => route.path, getBreadcrumbs, { immediate: true })
</script>

<style lang="scss" scoped>
.app-breadcrumb {
  line-height: 64px;
  margin-left: 4px;
}

.breadcrumb-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
}

.breadcrumb-home-icon {
  font-size: 14px;
  color: var(--primary-color);
}

.breadcrumb-link {
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: var(--primary-color);
  }
}

.breadcrumb-text {
  color: var(--text-primary);
  font-weight: 500;
}

.breadcrumb-fade-enter-active {
  transition: all 0.3s ease-out;
}

.breadcrumb-fade-leave-active {
  transition: all 0.2s ease-in;
}

.breadcrumb-fade-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.breadcrumb-fade-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

:deep(.el-breadcrumb__separator) {
  color: var(--text-secondary) !important;
  font-weight: 400 !important;
}
</style>
