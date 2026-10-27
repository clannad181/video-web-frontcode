<template>
  <div class="comment-item">
    <div class="comment-avatar">
      <img v-if="comment.avatar" :src="fileUrl(comment.avatar)" :alt="comment.nickName || '用户头像'" />
      <span v-else class="avatar-text">{{ comment.nickName?.charAt(0) || '?' }}</span>
    </div>
    <div class="comment-content">
      <div class="comment-main">
        <span class="comment-user">{{ comment.nickName || '匿名用户' }}</span>
        <span class="reply-to" v-if="replyToUser">回复 <a @click.prevent>{{ replyToUser }}</a></span>
        <span class="comment-text" v-html="parsedContent"></span>
      </div>
      <div class="comment-meta">
        <span class="comment-time">{{ comment.createTime }}</span>
        <div class="comment-actions">
          <button class="meta-btn" :class="{ liked: comment.liked }" @click="handleLike">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
            </svg>
            <span v-if="comment.likeCount">{{ comment.likeCount }}</span>
          </button>
          <button class="meta-btn" @click="handleReply">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import twemoji from 'twemoji'
import { fileUrl } from '../config'

const props = defineProps({
  comment: {
    type: Object,
    required: true
  },
  commentMap: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['like', 'reply'])

const parsedContent = computed(() => {
  if (!props.comment.content) return ''
  const escaped = props.comment.content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  return twemoji.parse(escaped, {
    folder: 'svg',
    ext: '.svg',
    className: 'twemoji'
  })
})

const replyToUser = computed(() => {
  if (!props.comment.parentId || props.comment.parentId === 0) return null
  const parentComment = props.commentMap[props.comment.parentId]
  if (!parentComment) return null
  if (parentComment.parentId && parentComment.parentId !== 0) {
    return parentComment.nickName || null
  }
  return null
})

const handleLike = () => {
  emit('like', props.comment)
}

const handleReply = () => {
  emit('reply', props.comment)
}
</script>

<style scoped>
.comment-item {
  display: flex;
  gap: 12px;
  padding: 16px 0;
}

.comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background: linear-gradient(135deg, #fb7299 0%, #fc9db9 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.comment-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-text {
  font-size: 16px;
  font-weight: 500;
}

.comment-content {
  flex: 1;
  min-width: 0;
}

.comment-main {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0;
  line-height: 1.6;
  word-break: break-word;
}

.comment-user {
  font-size: 13px;
  font-weight: 500;
  color: #999;
  margin-right: 6px;
  flex-shrink: 0;
}

.reply-to {
  font-size: 13px;
  color: #999;
  margin-right: 6px;
  flex-shrink: 0;
}

.reply-to a {
  color: #00a1d6;
  cursor: pointer;
  text-decoration: none;
}

.reply-to a:hover {
  color: #00b5e5;
}

.comment-text {
  font-size: 14px;
  color: #222;
  word-break: break-word;
}

.comment-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 8px;
}

.comment-time {
  font-size: 12px;
  color: #999;
}

.comment-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.meta-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #999;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}

.meta-btn:hover {
  color: #00a1d6;
}

.meta-btn.liked {
  color: #fb7299;
}

.meta-btn.liked svg {
  fill: #fb7299;
}
</style>
