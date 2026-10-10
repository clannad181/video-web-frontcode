<template>
  <div class="nf-page">
    <!-- 氛围背景（与登录页同族：暗色 + 光斑 + 网格） -->
    <div class="nf-bg" aria-hidden="true">
      <span class="nf-orb nf-orb-1" />
      <span class="nf-orb nf-orb-2" />
      <span class="nf-orb nf-orb-3" />
      <span class="nf-grid" />
    </div>

    <main class="nf-wrap">
      <!-- 签名元素：信号丢失的播放器窗口（测试卡 + 故障 404 + 死掉的控制条） -->
      <div class="nf-window">
        <div class="nf-chrome">
          <span class="nf-dots"><i /><i /><i /></span>
          <span class="nf-chrome-title">signal://lost</span>
        </div>

        <div class="nf-screen">
          <div class="nf-bars" aria-hidden="true">
            <i v-for="n in 7" :key="n" />
          </div>
          <div class="nf-scan" aria-hidden="true" />

          <div class="nf-signal">
            <span class="nf-signal-dot" />{{ $t('无信号') }}
          </div>

          <div class="nf-code">
            <span class="nf-code-ghost nf-code-ghost-a" aria-hidden="true">404</span>
            <span class="nf-code-ghost nf-code-ghost-b" aria-hidden="true">404</span>
            <span class="nf-code-main">404</span>
          </div>
        </div>

        <div class="nf-controls" aria-hidden="true">
          <svg class="nf-ctrl-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
          <span class="nf-time">00:00 / --:--</span>
          <span class="nf-track"><i /></span>
          <svg class="nf-ctrl-icon nf-muted" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.8 8.8 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z" />
          </svg>
        </div>
      </div>

      <!-- 文案与操作 -->
      <div class="nf-meta">
        <h1 class="nf-title">{{ $t('页面不存在') }}</h1>
        <p class="nf-path">
          <span class="nf-path-label">{{ $t('访问路径') }}</span>
          <code class="nf-path-value">{{ route.fullPath }}</code>
        </p>
        <p class="nf-desc">{{ $t('该地址没有对应的页面，请检查链接是否正确。') }}</p>
        <div class="nf-actions">
          <button type="button" class="nf-btn nf-btn-primary" @click="goHome">{{ $t('返回首页') }}</button>
          <button type="button" class="nf-btn nf-btn-ghost" @click="goBack">{{ $t('返回上一页') }}</button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
/**
 * 404 页面（catch-all 路由）
 * 独立渲染于 Layout 之外：已登录/未登录均可访问，不依赖菜单数据。
 */
import { useRoute, useRouter } from 'vue-router'
import { getToken } from '@/utils/auth'

const route = useRoute()
const router = useRouter()

/** 有会话回工作台，无会话回登录页 */
function goHome() {
  router.push(getToken() ? '/' : '/login')
}

/** 有历史栈则后退，否则回首页 */
function goBack() {
  if (window.history.length > 1) router.back()
  else goHome()
}
</script>

<style lang="scss" scoped>
// ========== 基础 ========== //
.nf-page {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 20px;
  position: relative;
  overflow: hidden;
  font-family: var(--font-family);

  // ---- 主题 token：默认暗色；系统浅色偏好时整体跟随 ----
  color-scheme: dark;
  --nf-bg: #0a0a1a;
  --nf-fg: #e8ecf6;
  --nf-grid: rgba(255, 255, 255, 0.035);
  --nf-orb-1: radial-gradient(circle, rgba(99, 102, 241, 0.28), transparent 65%);
  --nf-orb-2: radial-gradient(circle, rgba(251, 114, 153, 0.2), transparent 65%);
  --nf-orb-3: radial-gradient(circle, rgba(168, 85, 247, 0.16), transparent 65%);
  --nf-title: #f4f6ff;
  --nf-desc: rgba(232, 236, 246, 0.55);
  --nf-path-bg: rgba(255, 255, 255, 0.05);
  --nf-path-border: rgba(255, 255, 255, 0.1);
  --nf-path-label: rgba(232, 236, 246, 0.45);
  --nf-path-value: #fb9fb8;
  --nf-btn-text: rgba(232, 236, 246, 0.78);
  --nf-btn-bg: rgba(255, 255, 255, 0.04);
  --nf-btn-border: rgba(255, 255, 255, 0.16);
  --nf-btn-hover-bg: rgba(255, 255, 255, 0.08);
  --nf-btn-hover-border: rgba(255, 255, 255, 0.28);
  --nf-btn-hover-text: #f4f6ff;
  --nf-window-shadow: 0 24px 64px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(251, 114, 153, 0.06);

  background: var(--nf-bg);
  color: var(--nf-fg);
  animation: nf-page-in 0.4s ease-out both;
}

// 系统浅色偏好：页面环境切为浅色（播放器窗口保持深色设备质感）
@media (prefers-color-scheme: light) {
  .nf-page {
    color-scheme: light;
    --nf-bg: #edf0f6;
    --nf-fg: #1f2430;
    --nf-grid: rgba(20, 28, 50, 0.05);
    --nf-orb-1: radial-gradient(circle, rgba(99, 102, 241, 0.2), transparent 65%);
    --nf-orb-2: radial-gradient(circle, rgba(251, 114, 153, 0.16), transparent 65%);
    --nf-orb-3: radial-gradient(circle, rgba(168, 85, 247, 0.12), transparent 65%);
    --nf-title: #1e293b;
    --nf-desc: rgba(31, 36, 48, 0.6);
    --nf-path-bg: rgba(255, 255, 255, 0.78);
    --nf-path-border: rgba(20, 28, 50, 0.1);
    --nf-path-label: rgba(31, 36, 48, 0.45);
    --nf-path-value: #d63d75;
    --nf-btn-text: rgba(31, 36, 48, 0.75);
    --nf-btn-bg: rgba(255, 255, 255, 0.7);
    --nf-btn-border: rgba(20, 28, 50, 0.16);
    --nf-btn-hover-bg: rgba(255, 255, 255, 0.95);
    --nf-btn-hover-border: rgba(20, 28, 50, 0.32);
    --nf-btn-hover-text: #111827;
    --nf-window-shadow: 0 24px 64px rgba(30, 41, 80, 0.22), 0 0 0 1px rgba(251, 114, 153, 0.1);
  }
}

@keyframes nf-page-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

// ========== 背景 ========== //
.nf-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.nf-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(2px);
}
.nf-orb-1 {
  width: 480px;
  height: 480px;
  top: -140px;
  left: -100px;
  background: var(--nf-orb-1);
  animation: nf-drift-1 16s ease-in-out infinite alternate;
}
.nf-orb-2 {
  width: 420px;
  height: 420px;
  bottom: -120px;
  right: -80px;
  background: var(--nf-orb-2);
  animation: nf-drift-2 18s ease-in-out infinite alternate;
}
.nf-orb-3 {
  width: 300px;
  height: 300px;
  top: 55%;
  left: 12%;
  background: var(--nf-orb-3);
  animation: nf-drift-3 20s ease-in-out infinite alternate;
}

@keyframes nf-drift-1 { to { transform: translate(60px, 40px) scale(1.08); } }
@keyframes nf-drift-2 { to { transform: translate(-50px, -40px) scale(1.06); } }
@keyframes nf-drift-3 { to { transform: translate(40px, -50px); } }

.nf-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(var(--nf-grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--nf-grid) 1px, transparent 1px);
  background-size: 44px 44px;
  -webkit-mask-image: radial-gradient(ellipse at center, black 25%, transparent 78%);
  mask-image: radial-gradient(ellipse at center, black 25%, transparent 78%);
}

// ========== 主体 ========== //
.nf-wrap {
  position: relative;
  z-index: 1;
  width: min(520px, 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
}

// ========== 播放器窗口 ========== //
.nf-window {
  width: 100%;
  background: rgba(9, 14, 30, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  overflow: hidden;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: var(--nf-window-shadow);
  animation: nf-rise 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes nf-rise {
  from { opacity: 0; transform: translateY(18px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.nf-chrome {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.03);
}

.nf-dots {
  display: flex;
  gap: 6px;
  i {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.14);
  }
  i:nth-child(1) { background: #f56c6c; opacity: 0.75; }
  i:nth-child(2) { background: #e6a23c; opacity: 0.75; }
  i:nth-child(3) { background: #67c23a; opacity: 0.75; }
}

.nf-chrome-title {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11px;
  letter-spacing: 0.06em;
  color: rgba(232, 236, 246, 0.4);
}

// ---- 测试卡屏幕 ---- //
.nf-screen {
  position: relative;
  height: clamp(190px, 32vh, 250px);
  overflow: hidden;
}

.nf-bars {
  position: absolute;
  inset: 0;
  display: flex;
  i {
    flex: 1;
    transform: translateY(101%);
    animation: nf-bar-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    animation-delay: calc(0.22s + var(--i, 0) * 0.05s);
  }
  i:nth-child(1) { --i: 0; background: #fb7299; }
  i:nth-child(2) { --i: 1; background: #f6c453; }
  i:nth-child(3) { --i: 2; background: #00d0c0; }
  i:nth-child(4) { --i: 3; background: #67c23a; }
  i:nth-child(5) { --i: 4; background: #7c5cfc; }
  i:nth-child(6) { --i: 5; background: #f56c6c; }
  i:nth-child(7) { --i: 6; background: #409eff; }
}

@keyframes nf-bar-in {
  to { transform: translateY(0); }
}

// 屏幕压暗层，保证 404 可读（保留测试卡色条的辨识度）
.nf-screen::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at center, rgba(6, 8, 18, 0.3) 0%, rgba(6, 8, 18, 0.62) 100%),
    linear-gradient(rgba(10, 10, 26, 0.32), rgba(10, 10, 26, 0.32));
  z-index: 1;
}

.nf-scan {
  position: absolute;
  inset: 0;
  z-index: 2;
  background: repeating-linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.045) 0,
    rgba(255, 255, 255, 0.045) 1px,
    transparent 1px,
    transparent 3px
  );
  animation: nf-scan 2s linear infinite;
  pointer-events: none;
}

@keyframes nf-scan {
  to { background-position: 0 6px; }
}

// ---- 无信号标签 ---- //
.nf-signal {
  position: absolute;
  top: 12px;
  left: 14px;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 7px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11px;
  letter-spacing: 0.14em;
  color: rgba(232, 236, 246, 0.85);
  animation: nf-rise 0.5s 0.4s both;
}

.nf-signal-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #fb7299;
  box-shadow: 0 0 8px rgba(251, 114, 153, 0.9);
  animation: nf-blink 1.4s ease-in-out infinite;
}

@keyframes nf-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.2; }
}

// ---- 故障 404（签名） ---- //
.nf-code {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(76px, 17vw, 124px);
  font-weight: 800;
  letter-spacing: -0.05em;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.nf-code-main {
  position: relative;
  color: #f4f6ff;
  text-shadow: 0 6px 30px rgba(0, 0, 0, 0.45);
  animation: nf-code-in 0.5s 0.5s both, nf-code-flicker 6s 1s infinite;
}

@keyframes nf-code-in {
  from { opacity: 0; transform: scale(0.94); filter: blur(6px); }
  to { opacity: 1; transform: scale(1); filter: blur(0); }
}

// 进入后偶发一次 2 帧信号撕裂
@keyframes nf-code-flicker {
  0%, 86%, 100% { transform: scale(1) skewX(0); }
  87% { transform: scale(1.01) skewX(-2deg); }
  88% { transform: scale(1) skewX(0); }
}

.nf-code-ghost {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  mix-blend-mode: screen;
  opacity: 0.55;
  pointer-events: none;
}
.nf-code-ghost-a {
  color: #fb7299;
  animation: nf-glitch-a 6s 1s infinite;
}
.nf-code-ghost-b {
  color: #00d0c0;
  animation: nf-glitch-b 6s 1s infinite;
}

// 常态：极小偏移形成色差描边；每 6s 撕裂一次
@keyframes nf-glitch-a {
  0%, 86%, 100% { transform: translate(-3px, 1px); clip-path: inset(0 0 0 0); }
  87% { transform: translate(-9px, -2px); clip-path: inset(8% 0 56% 0); }
  89% { transform: translate(7px, 2px); clip-path: inset(46% 0 30% 0); }
  91% { transform: translate(-5px, 0); clip-path: inset(72% 0 6% 0); }
  93% { transform: translate(-3px, 1px); clip-path: inset(0 0 0 0); }
}
@keyframes nf-glitch-b {
  0%, 86%, 100% { transform: translate(3px, -1px); clip-path: inset(0 0 0 0); }
  87.5% { transform: translate(8px, 2px); clip-path: inset(52% 0 24% 0); }
  89.5% { transform: translate(-6px, -2px); clip-path: inset(16% 0 62% 0); }
  91.5% { transform: translate(4px, 1px); clip-path: inset(64% 0 14% 0); }
  93% { transform: translate(3px, -1px); clip-path: inset(0 0 0 0); }
}

// ---- 死掉的控制条 ---- //
.nf-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.02);
}

.nf-ctrl-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: rgba(232, 236, 246, 0.35);
}
.nf-muted { color: rgba(232, 236, 246, 0.22); }

.nf-time {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11px;
  color: rgba(232, 236, 246, 0.4);
  white-space: nowrap;
}

.nf-track {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: repeating-linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.14) 0,
    rgba(255, 255, 255, 0.14) 4px,
    transparent 4px,
    transparent 8px
  );
  overflow: hidden;
  i {
    display: block;
    width: 0%;
    height: 100%;
  }
}

// ========== 文案与操作 ========== //
.nf-meta {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 14px;
}

.nf-title {
  margin: 0;
  font-size: clamp(22px, 4.5vw, 26px);
  font-weight: 700;
  color: var(--nf-title);
  animation: nf-rise 0.5s 0.35s both;
}

.nf-path {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 100%;
  padding: 7px 12px;
  background: var(--nf-path-bg);
  border: 1px solid var(--nf-path-border);
  border-radius: 9px;
  animation: nf-rise 0.5s 0.45s both;
}

.nf-path-label {
  font-size: 11px;
  letter-spacing: 0.08em;
  color: var(--nf-path-label);
  flex-shrink: 0;
}

.nf-path-value {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12.5px;
  color: var(--nf-path-value);
  word-break: break-all;
  text-align: left;
}

.nf-desc {
  margin: 0;
  max-width: 400px;
  font-size: 14px;
  line-height: 1.7;
  color: var(--nf-desc);
  animation: nf-rise 0.5s 0.55s both;
}

.nf-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 4px;
  animation: nf-rise 0.5s 0.65s both;
}

.nf-btn {
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  padding: 10px 24px;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, border-color 0.2s ease;

  &:focus-visible {
    outline: 2px solid #fb7299;
    outline-offset: 2px;
  }
  &:active { transform: translateY(0) !important; }
}

.nf-btn-primary {
  color: #fff;
  border: none;
  background: linear-gradient(135deg, #fb7299, #7c5cfc);
  box-shadow: 0 8px 24px rgba(251, 114, 153, 0.28);
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 30px rgba(251, 114, 153, 0.38);
  }
}

.nf-btn-ghost {
  color: var(--nf-btn-text);
  background: var(--nf-btn-bg);
  border: 1px solid var(--nf-btn-border);
  &:hover {
    transform: translateY(-2px);
    background: var(--nf-btn-hover-bg);
    border-color: var(--nf-btn-hover-border);
    color: var(--nf-btn-hover-text);
  }
}

// ========== 适配与无障碍 ========== //
@media (max-width: 480px) {
  .nf-wrap { gap: 22px; }
  .nf-path { flex-direction: column; gap: 4px; align-items: flex-start; }
  .nf-actions { width: 100%; }
  .nf-btn { flex: 1; min-width: 130px; }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
