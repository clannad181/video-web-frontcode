<template>
  <div
    class="sidebar"
    :class="{
      collapsed: appStore.sidebar.collapsed,
      'light-theme': !appStore.darkMode
    }"
  >
    <div class="logo-section">
      <div class="logo-icon">
        <svg viewBox="0 0 32 32" class="logo-svg">
          <defs>
            <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#00a1d6;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#fb7299;stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect rx="8" ry="8" width="32" height="32" fill="url(#logoGrad)" />
          <polygon points="13,9 13,23 24,16" fill="white" />
        </svg>
      </div>
      <transition name="fade-text">
        <span v-show="!appStore.sidebar.collapsed" class="logo-title">Video Admin</span>
      </transition>
    </div>

    <el-scrollbar class="menu-scrollbar">
      <el-menu
        :default-active="activeMenu"
        :collapse="appStore.sidebar.collapsed"
        :collapse-transition="false"
        router
        unique-opened
        background-color="transparent"
        text-color="rgba(255,255,255,0.65)"
        active-text-color="#ffffff"
      >
        <template v-for="item in menuList" :key="item.path">
          <el-sub-menu
            v-if="item.children && item.children.length > 1"
            :index="item.path"
          >
            <template #title>
              <el-icon class="menu-icon">
                <component :is="item.meta?.icon || 'Document'" />
              </el-icon>
              <span class="menu-text">{{ item.meta?.title }}</span>
            </template>
            <el-menu-item
              v-for="child in item.children"
              :key="child.path"
              :index="child.path"
              class="sub-menu-item"
            >
              <span class="sub-dot"></span>
              <span class="menu-text">{{ child.meta?.title }}</span>
            </el-menu-item>
          </el-sub-menu>

          <el-menu-item
            v-else
            :index="item.children?.[0]?.path || item.path"
            class="single-menu-item"
          >
            <el-icon class="menu-icon">
              <component :is="item.meta?.icon || item.children?.[0]?.meta?.icon || 'Document'" />
            </el-icon>
            <span class="menu-text">{{ item.children?.[0]?.meta?.title || item.meta?.title }}</span>
          </el-menu-item>
        </template>
      </el-menu>
    </el-scrollbar>

    <div class="collapse-btn" @click="appStore.toggleSidebar">
      <el-icon :size="18">
        <Fold v-if="!appStore.sidebar.collapsed" />
        <Expand v-else />
      </el-icon>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { constantRoutes } from '@/router'

const route = useRoute()
const appStore = useAppStore()

const activeMenu = computed(() => route.path)

const menuList = computed(() => {
  return constantRoutes.filter(
    (r) => r.path !== '/login' && r.path !== '/profile' && r.redirect !== undefined
  )
})
</script>

<style lang="scss" scoped>
.sidebar {
  width: 220px;
  height: 100vh;
  background: linear-gradient(180deg, #1d1e3a 0%, #304156 100%);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);

  &.collapsed {
    width: 64px;
  }

  &.light-theme {
    background: linear-gradient(180deg, #f5f7fa 0%, #ffffff 100%);

    .logo-section {
      background: rgba(0, 0, 0, 0.02);
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    }

    .logo-title {
      color: #303133;
    }

    .el-menu {
      :deep(.el-menu-item),
      :deep(.el-sub-menu__title) {
        color: #606266;

        &:hover {
          color: #409eff;
          background-color: rgba(64, 158, 255, 0.08) !important;
        }

        &.is-active {
          color: #409eff;
          background-color: rgba(64, 158, 255, 0.1) !important;
        }
      }

      :deep(.el-sub-menu .el-menu-item) {
        color: #909399;

        &:hover {
          color: #409eff;
          background-color: rgba(64, 158, 255, 0.06) !important;
        }

        &.is-active {
          color: #409eff;
          background-color: rgba(64, 158, 255, 0.08) !important;
        }
      }
    }

    .collapse-btn {
      border-top: 1px solid rgba(0, 0, 0, 0.06);
      color: #606266;

      &:hover {
        background-color: rgba(64, 158, 255, 0.08);
        color: #409eff;
      }
    }

    .sub-dot {
      background-color: #c0c4cc;
    }
  }
}

.logo-section {
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  background: rgba(0, 0, 0, 0.15);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
  gap: 10px;
  overflow: hidden;
}

.logo-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  animation: logoFloat 3s ease-in-out infinite;
}

@keyframes logoFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}

.logo-svg {
  width: 32px;
  height: 32px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.logo-title {
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  white-space: nowrap;
  letter-spacing: 0.5px;
  background: linear-gradient(135deg, #00a1d6, #fb7299);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.fade-text-enter-active,
.fade-text-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-text-enter-from,
.fade-text-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

.menu-scrollbar {
  flex: 1;
  overflow: hidden;
}

.el-menu {
  border-right: none;
  padding: 8px 0;

  :deep(.el-menu-item),
  :deep(.el-sub-menu__title) {
    height: 44px;
    line-height: 44px;
    margin: 2px 8px;
    border-radius: 8px;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      background-color: rgba(255, 255, 255, 0.12) !important;
      transform: translateX(2px);
    }

    &.is-active {
      background: linear-gradient(135deg, #409eff, #337ecc) !important;
      color: #ffffff !important;
      box-shadow: 0 2px 8px rgba(64, 158, 255, 0.35);
      position: relative;

      &::before {
        content: '';
        position: absolute;
        left: -8px;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 20px;
        background: #00a1d6;
        border-radius: 0 2px 2px 0;
      }
    }
  }

  :deep(.el-sub-menu .el-menu-item) {
    min-width: auto;
    height: 40px;
    line-height: 40px;
    padding-left: 52px !important;
    margin: 1px 8px;
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.55);
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      color: #ffffff;
      background-color: rgba(255, 255, 255, 0.08) !important;
    }

    &.is-active {
      color: #ffffff;
      background-color: rgba(64, 158, 255, 0.2) !important;
    }
  }

  :deep(.el-sub-menu .el-sub-menu__icon-arrow) {
    transition: transform 0.3s ease;
  }

  :deep(.el-menu--collapse) {
    .el-menu-item,
    .el-sub-menu__title {
      margin: 2px 8px;
      padding: 0 !important;
      display: flex;
      justify-content: center;
    }
  }
}

.menu-icon {
  font-size: 18px;
  transition: transform 0.2s ease;
}

.menu-text {
  font-size: 14px;
}

.sub-menu-item {
  .sub-dot {
    display: inline-block;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.3);
    margin-right: 8px;
    transition: all 0.25s ease;
    flex-shrink: 0;
  }

  &.is-active .sub-dot {
    background-color: #ffffff;
    box-shadow: 0 0 6px rgba(255, 255, 255, 0.5);
  }

  &:hover .sub-dot {
    background-color: #ffffff;
  }
}

.collapse-btn {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.45);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.25s ease;
  flex-shrink: 0;

  &:hover {
    background-color: rgba(255, 255, 255, 0.08);
    color: #ffffff;
  }

  .el-icon {
    transition: transform 0.3s ease;
  }
}
</style>
