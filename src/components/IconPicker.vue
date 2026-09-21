<template>
  <teleport to="body">
    <transition name="icon-picker-fade">
      <div v-if="visible" class="icon-picker-overlay" @click.self="emit('close')">
        <div class="icon-picker-card" @click.stop>
          <div class="icon-picker-header">
            <h3>选择图标</h3>
            <button class="icon-picker-close" @click="emit('close')">&times;</button>
          </div>
          <div class="icon-picker-search">
            <input v-model="keyword" class="icon-search-input" placeholder="搜索图标..." autofocus />
          </div>
          <div class="icon-picker-grid">
            <div
              v-for="name in filteredIcons"
              :key="name"
              class="icon-picker-item"
              :class="{ active: modelValue === name }"
              @click="selectIcon(name)"
            >
              <el-icon :size="20"><component :is="name" /></el-icon>
              <span class="icon-item-name">{{ name }}</span>
            </div>
            <div v-if="filteredIcons.length === 0" class="icon-picker-empty">未找到匹配的图标</div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import * as ElementPlusIcons from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  visible: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'close'])

const keyword = ref('')

const iconNames = Object.keys(ElementPlusIcons)

const filteredIcons = computed(() => {
  if (!keyword.value) return iconNames
  const kw = keyword.value.toLowerCase()
  return iconNames.filter(name => name.toLowerCase().includes(kw))
})

function selectIcon(name) {
  emit('update:modelValue', name)
  emit('close')
}

watch(() => props.visible, (v) => {
  if (v) keyword.value = ''
})
</script>

<style lang="scss" scoped>
.icon-picker-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2100;
}

.icon-picker-card {
  background: var(--card-bg, #fff);
  border-radius: 16px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.2);
  width: 560px;
  max-height: 520px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.icon-picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 12px;
  flex-shrink: 0;
  h3 {
    margin: 0;
    font-size: 17px;
    font-weight: 600;
    color: var(--text-primary, #303133);
  }
}

.icon-picker-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: var(--text-secondary, #909399);
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s;
  &:hover {
    color: var(--text-primary, #303133);
    background: var(--bg-color, #f5f7fa);
  }
}

.icon-picker-search {
  padding: 0 24px 12px;
  flex-shrink: 0;
}

.icon-search-input {
  width: 100%;
  height: 38px;
  border-radius: 10px;
  border: 1.5px solid var(--border-color, #e4e7ed);
  padding: 0 14px;
  font-size: 13px;
  background: var(--bg-color, #f5f7fa);
  color: var(--text-primary, #303133);
  outline: none;
  transition: all 0.25s ease;
  box-sizing: border-box;
  &:focus {
    background: var(--card-bg, #fff);
    border-color: var(--color-primary, #fb7299);
    box-shadow: 0 0 0 3px rgba(251, 114, 153, 0.1);
  }
}

.icon-picker-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 4px;
  padding: 0 24px 20px;
  overflow-y: auto;
  flex: 1;
}

.icon-picker-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  border-radius: var(--radius-md, 8px);
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-primary, #303133);
  border: 2px solid transparent;
  &:hover {
    background: var(--bg-color, #f5f7fa);
  }
  &.active {
    border-color: var(--color-primary, #fb7299);
    background: rgba(251, 114, 153, 0.08);
    color: var(--color-primary, #fb7299);
  }
}

.icon-item-name {
  font-size: 11px;
  color: var(--text-secondary, #909399);
  text-align: center;
  word-break: break-all;
  line-height: 1.2;
  max-height: 2.4em;
  overflow: hidden;
}

.icon-picker-empty {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px 0;
  color: var(--text-secondary, #909399);
  font-size: 13px;
}

// Animation
.icon-picker-fade-enter-active {
  transition: opacity 0.2s ease;
  .icon-picker-card {
    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease;
  }
}
.icon-picker-fade-leave-active {
  transition: opacity 0.15s ease;
  .icon-picker-card {
    transition: transform 0.15s ease, opacity 0.15s ease;
  }
}
.icon-picker-fade-enter-from {
  opacity: 0;
  .icon-picker-card { transform: scale(0.9); opacity: 0; }
}
.icon-picker-fade-leave-to {
  opacity: 0;
  .icon-picker-card { transform: scale(0.95); opacity: 0; }
}

html.dark-mode {
  .icon-picker-card { background: var(--card-bg); }
  .icon-search-input { background: var(--bg-color); color: var(--text-primary); &:focus { background: var(--card-bg); } }
  .icon-picker-item { &:hover { background: var(--hover-bg); } }
}
</style>
