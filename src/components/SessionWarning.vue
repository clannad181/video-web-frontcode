<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="show" class="session-warning-overlay">
        <div class="session-warning-modal">
          <div class="warning-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h3 class="warning-title">会话即将过期</h3>
          <p class="warning-text">
            您已长时间未操作，将在 <span class="countdown">{{ countdown }}</span> 秒后自动登出
          </p>
          <div class="warning-actions">
            <button class="btn-continue" @click="$emit('continue')">继续使用</button>
            <button class="btn-logout" @click="$emit('logout')">立即登出</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({
  show: Boolean,
  countdown: Number
})

defineEmits(['continue', 'logout'])
</script>

<style scoped>
.session-warning-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.session-warning-modal {
  background: #1e293b;
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  max-width: 400px;
  width: 90%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
}

.warning-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 20px;
  color: #f59e0b;
}

.warning-icon svg {
  width: 100%;
  height: 100%;
}

.warning-title {
  font-size: 20px;
  font-weight: 600;
  color: #f1f5f9;
  margin: 0 0 12px 0;
}

.warning-text {
  font-size: 14px;
  color: #94a3b8;
  margin: 0 0 28px 0;
  line-height: 1.6;
}

.countdown {
  color: #f59e0b;
  font-weight: 600;
  font-size: 18px;
}

.warning-actions {
  display: flex;
  gap: 12px;
}

.btn-continue,
.btn-logout {
  flex: 1;
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-continue {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
}

.btn-continue:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.btn-logout {
  background: rgba(255, 255, 255, 0.05);
  color: #94a3b8;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-logout:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
