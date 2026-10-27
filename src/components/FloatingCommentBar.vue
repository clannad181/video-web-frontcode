<template>
  <div class="floating-comment-bar" v-if="isLoggedIn && show">
    <div class="comment-bar-inner">
      <div class="input-avatar">
        <img v-if="currentUser?.avatar || currentUser?.avatarUrl" :src="fileUrl(currentUser.avatar || currentUser.avatarUrl)" :alt="currentUser?.nickname || '我的头像'" />
        <span v-else>{{ currentUser?.nickname?.charAt(0) || '?' }}</span>
      </div>
      <div class="input-wrapper">
        <div class="reply-hint" v-if="replyingTo">
          <span>回复 <strong>{{ replyingTo.nickName }}</strong></span>
          <button class="cancel-reply" @click="cancelReply">×</button>
        </div>
        <textarea
          ref="textareaRef"
          v-model="commentContent"
          :placeholder="replyingTo ? '回复 ' + replyingTo.nickName + '...' : '发一条友善的评论'"
          rows="2"
          maxlength="2000"
          @input="autoResize"
          @keydown.enter.exact.prevent="submit"
        ></textarea>
        <div class="input-footer">
          <div class="footer-left">
            <div class="emoji-picker-wrapper">
              <EmojiPicker @select="insertEmoji">
                <div class="emoji-picker">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                    <line x1="9" y1="9" x2="9.01" y2="9"/>
                    <line x1="15" y1="9" x2="15.01" y2="9"/>
                  </svg>
                </div>
              </EmojiPicker>
            </div>
            <span class="char-limit">{{ commentContent.length }}/2000</span>
          </div>
          <div class="footer-right">
            <button class="cancel-btn" v-if="commentContent.trim() || replyingTo" @click="cancel">取消</button>
            <button class="submit-btn" :disabled="!commentContent.trim()" @click="submit">发布</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import EmojiPicker from './EmojiPicker.vue'
import twemoji from 'twemoji'
import { fileUrl } from '../config'

const props = defineProps({
  isLoggedIn: {
    type: Boolean,
    default: false
  },
  currentUser: {
    type: Object,
    default: null
  },
  show: {
    type: Boolean,
    default: false
  },
  replyingTo: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['submit', 'cancel-reply'])

const commentContent = ref('')
const textareaRef = ref(null)

const autoResize = () => {
  const textarea = textareaRef.value
  if (!textarea) return
  textarea.style.height = 'auto'
  textarea.style.height = textarea.scrollHeight + 'px'
}

const insertEmoji = (emoji) => {
  commentContent.value += emoji
}

const submit = () => {
  if (!commentContent.value.trim()) return
  const parentId = props.replyingTo?.id || undefined
  emit('submit', commentContent.value, parentId)
  commentContent.value = ''
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
  }
}

const cancel = () => {
  commentContent.value = ''
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
  }
}

const cancelReply = () => {
  emit('cancel-reply')
}

let observer = null

const parseTwemoji = (el) => {
  if (!el) return
  twemoji.parse(el, { folder: 'svg', ext: '.svg', className: 'twemoji' })
}

onMounted(() => {
  observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeType === 1) parseTwemoji(node)
      }
    }
  })
  // 只监听组件自身的元素，而不是整个document.body
  const container = document.querySelector('.floating-comment-bar') || document.body
  observer.observe(container, { childList: true, subtree: true })
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>

<style scoped>
.floating-comment-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: #fff;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.08);
  padding: 12px 0;
}

.comment-bar-inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.input-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--brand_pink_thin);
  color: var(--brand_pink);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 500;
  margin-top: 4px;
}

.input-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.input-wrapper {
  flex: 1;
  background: var(--bg2);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  transition: all 0.3s;
}

.input-wrapper:focus-within {
  background: var(--bg1);
  box-shadow: 0 0 0 2px var(--brand_pink_thin);
}

.input-wrapper textarea {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: var(--text1);
  line-height: 1.5;
  resize: none;
  min-height: 42px;
}

.input-wrapper textarea::placeholder {
  color: var(--text4);
}

.reply-hint {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  margin-bottom: 8px;
  background: var(--brand_blue_thin);
  border-radius: var(--radius-md);
  font-size: 13px;
  color: var(--text2);
}

.reply-hint strong {
  color: var(--brand_blue);
}

.cancel-reply {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: transparent;
  border: none;
  font-size: 18px;
  color: var(--text3);
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.2s;
}

.cancel-reply:hover {
  background: rgba(0, 0, 0, 0.1);
  color: var(--text1);
}

.input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
}

.emoji-picker-wrapper {
  position: relative;
}

.emoji-picker {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  color: var(--text3);
  transition: all 0.2s;
}

.emoji-picker:hover {
  background: var(--bg3);
  color: var(--brand_pink);
}

.char-limit {
  font-size: 12px;
  color: var(--text4);
}

.footer-right {
  display: flex;
  gap: 8px;
}

.cancel-btn {
  padding: 8px 16px;
  background: transparent;
  color: var(--text3);
  border: 1px solid var(--line_regular);
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: var(--bg3);
  color: var(--text2);
  border-color: var(--text4);
}

.submit-btn {
  padding: 8px 24px;
  background: linear-gradient(135deg, var(--brand_pink) 0%, #ff6b9d 100%);
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(251, 114, 153, 0.3);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(251, 114, 153, 0.4);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(251, 114, 153, 0.3);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}
</style>
