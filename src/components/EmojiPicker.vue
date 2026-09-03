<template>
  <div class="emoji-picker" ref="pickerRef">
    <div class="emoji-trigger" @click="toggle">
      <slot>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
          <line x1="9" y1="9" x2="9.01" y2="9"/>
          <line x1="15" y1="9" x2="15.01" y2="9"/>
        </svg>
      </slot>
    </div>
    <Transition name="emoji-pop">
      <div v-if="open" class="emoji-panel">
        <div class="emoji-grid">
          <button
            v-for="(emoji, i) in emojis"
            :key="i"
            class="emoji-item"
            :title="emoji.char"
            @click="select(emoji.char)"
          >
            <img :src="emoji.url" :alt="emoji.char" width="24" height="24" draggable="false" />
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import twemoji from 'twemoji'

const emit = defineEmits(['select'])

const open = ref(false)
const pickerRef = ref(null)

const toggle = () => { open.value = !open.value }

const select = (char) => {
  emit('select', char)
  open.value = false
}

const handleClickOutside = (e) => {
  if (pickerRef.value && !pickerRef.value.contains(e.target)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', handleClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', handleClickOutside))

const TWEMOJI_BASE = 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/'

const rawEmojis = [
  '😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃',
  '😉','😊','😇','🥰','😍','🤩','😘','😗','😚','😙',
  '🥲','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🫢',
  '🤫','🤔','🫡','🤐','🤨','😐','😑','😶','🫥','😏',
  '😒','🙄','😬','🤥','😌','😔','😪','🤤','😴','😷',
  '🤒','🤕','🤢','🤮','🥵','🥶','🥴','😵','🤯','🤠',
  '🥳','🥸','😎','🤓','🧐','😕','🫤','😟','🙁','😮',
  '😯','😲','😳','🥺','🥹','😦','😧','😨','😰','😥',
  '😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱',
  '😤','😡','😠','🤬','😈','👿','💀','☠️','💩','🤡',
  '👹','👺','👻','👽','👾','🤖','😺','😸','😹','😻',
  '👋','🤚','🖐️','✋','🖖','🫱','🫲','🫳','🫴','👌',
  '🤌','🤏','✌️','🤞','🫰','🤟','🤘','🤙','👈','👉',
  '👆','🖕','👇','☝️','🫵','👍','👎','✊','👊','🤛',
  '🤜','👏','🙌','🫶','👐','🤲','🤝','🙏','💪','🦾',
  '❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔',
  '💕','💞','💓','💗','💖','💘','💝','💟','⭐','🌟',
  '✨','⚡','🔥','💥','❄️','🌈','☀️','🌤️','🍕','🍔',
  '🍟','🌭','🍿','🧂','🥓','🥚','🍳','🧇','🥞','🧈',
  '🍞','🥐','🥖','🥨','🧀','🥗','🥙','🥪','☕','🍵',
  '🧃','🥤','🍶','🍺','🍻','🥂','🍷','🍸','🎉','🎊',
  '🎈','🎁','🎄','🎃','🎗️','🏆','🥇','🥈','🎵','🎶',
  '🎤','🎧','🎸','🎹','🥁','🎺','🎻','🪗','👀','🗣️'
]

const emojis = rawEmojis.map(char => {
  const codePoint = twemoji.convert.toCodePoint(char)
  return { char, url: TWEMOJI_BASE + codePoint + '.svg' }
})
</script>

<style scoped>
.emoji-picker {
  position: relative;
  display: inline-flex;
}

.emoji-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  color: var(--text3);
  transition: all 0.2s;
}

.emoji-trigger:hover {
  color: var(--brand_pink);
  background: var(--graph_bg_thin);
}

.emoji-panel {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  width: 320px;
  max-height: 320px;
  background: var(--bg1);
  border: 1px solid var(--line_regular);
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  overflow-y: auto;
  z-index: 100;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  padding: 8px;
  gap: 2px;
}

.emoji-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  padding: 0;
  border: none;
  background: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s, transform 0.15s;
}

.emoji-item:hover {
  background: var(--graph_bg_thin);
  transform: scale(1.2);
}

.emoji-item img {
  width: 22px;
  height: 22px;
  pointer-events: none;
}

.emoji-pop-enter-active,
.emoji-pop-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.emoji-pop-enter-from,
.emoji-pop-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
