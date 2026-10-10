<template>
  <div class="video-page" v-if="video">
    <div class="page-container">
      <div class="video-header">
        <div class="video-info-section">
          <h1 v-if="currentEpisode?.title?.trim()" class="video-title">{{ currentEpisode?.title }}</h1>
          <h1 v-else class="video-title">{{ video.title }}</h1>
          <div class="video-meta">
            <span class="view-count">{{ formatCount(currentEpisode?.playCount || 0) }}次播放</span>
            <span class="separator">·</span>
            <span class="upload-time">{{ video.createTime }}</span>
          </div>
        </div>
        <div class="author-card">
          <div class="author-avatar" @click="goToUpProfile" style="cursor: pointer;">
            <img v-if="video.avatarUrl" :src="video.avatarUrl" :alt="video.nickName || 'UP主头像'" />
            <span v-else>{{ video.nickName?.charAt(0) }}</span>
          </div>
          <div class="author-content">
            <div class="author-info">
              <span class="author-name">{{ video.nickName }}</span>
              <span class="author-desc" v-if="video.descript">{{ video.descript }}</span>
            </div>
            <button v-if="!isOwnVideo" class="follow-btn" :class="{ followed: isFollowed }" @click="handleFollow">
              {{ isFollowed ? '已关注' : '+ 关注' }}
            </button>
          </div>
        </div>
      </div>

      <div class="content-container">
        <div class="left-container">
          <div class="player-box">
            <div class="player-wrapper">
              <videoPlay
                v-if="currentPlayUrl"
                :src="currentPlayUrl"
                :poster="video.coverUrl"
                :autoPlay="true"
                :loop="false"
                :muted="false"
                :volume="0.7"
                :control="true"
                color="#00a1d6"
                :speed="true"
                :pip="true"
                width="100%"
                height="100%"
                :key="currentPlayUrl"
                :currentTime="savedTime"
                @timeupdate="handleTimeUpdate"
              />
              <div v-else class="player-placeholder">
                <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                  <circle cx="12" cy="12" r="10" stroke-opacity="0.3"/>
                  <polygon points="10 8 16 12 10 16 10 8" fill="currentColor"/>
                </svg>
                <span>点击播放视频</span>
              </div>
            </div>
          </div>

          <div class="video-actions">
            <button class="action-btn" :class="{ active: isLiked }" @click="handleLike">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
              </svg>
              <em>{{ formatCount(currentEpisode?.likeCount || 0) }}</em>
            </button>
            <button class="action-btn" :class="{ active: isCoined }" @click="handleCoin">
              <svg width="28" height="28" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64z m0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z" fill="currentColor"/>
                <path d="M671.6 299h-59.5c-3 0-5.8 1.7-7.1 4.4l-90.6 180H511l-90.6-180c-1.4-2.7-4.1-4.4-7.1-4.4h-60.7c-1.3 0-2.6 0.3-3.8 1-3.9 2.1-5.3 7-3.2 10.9L457 515.7h-61.4c-4.4 0-8 3.6-8 8v29.9c0 4.4 3.6 8 8 8h81.7V603h-81.7c-4.4 0-8 3.6-8 8v29.9c0 4.4 3.6 8 8 8h81.7V717c0 4.4 3.6 8 8 8h54.3c4.4 0 8-3.6 8-8v-68.1h82c4.4 0 8-3.6 8-8V611c0-4.4-3.6-8-8-8h-82v-41.5h82c4.4 0 8-3.6 8-8v-29.9c0-4.4-3.6-8-8-8h-62l111.1-204.8c0.6-1.2 1-2.5 1-3.8-0.1-4.4-3.7-8-8.1-8z" fill="currentColor"/>
              </svg>
              <em>{{ formatCount(currentEpisode?.coinCount || 0) }}</em>
            </button>
            <button class="action-btn" :class="{ active: isFavorited }" @click="handleFavorite">
              <svg width="28" height="28" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                <path d="M317 856.1c-15.5 0-30.8-4.8-43.8-14-20.2-14.4-32-37.9-31.6-62.8l3.5-181.7L133 453.9c-15.3-19.5-20-45.4-12.5-69.1 7.5-23.7 26.2-42.2 49.9-49.4l173.9-52.9 102-151.1c13.9-20.6 37-33.1 61.9-33.3h0.6c24.6 0 47.7 12 61.8 32.3l104 149 0.5 0.4 174.8 49.9c23.9 6.8 42.9 25 50.8 48.6 7.9 23.6 3.6 49.5-11.4 69.3l-109.6 145 6.3 182.2c0.9 24.8-10.5 48.5-30.5 63.3-20 14.8-45.9 18.8-69.5 10.6l-171.7-59.5L343 851.5c-8.5 3.1-17.3 4.6-26 4.6zM509.5 173l-103 150.8c-9.6 14.3-24 25-40.6 30L192 406.6l111.6 144.5c10.7 13.6 16.3 30.7 16 47.9l-3.5 181.7L488 719.2c16.2-5.9 34.1-6.1 50.5-0.4l171.7 59.5-5.2-182.5c-0.6-17.3 4.8-34.4 15.2-48.1l109.6-145-175.3-51.3c-16.6-4.8-31.2-15.2-41.1-29.3L509.5 173z" fill="currentColor"/>
              </svg>
              <em>{{ formatCount(currentEpisode?.favoriteCount || 0) }}</em>
            </button>
            <button class="action-btn" @click="handleShare">
              <svg width="28" height="28" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                <path d="M550.528 544.128L640 539.776V678.4l178.005333-178.005333L640 322.389333v129.024l-72.618667 10.922667c-155.52 23.424-251.733333 73.557333-312.874666 164.437333 84.906667-50.602667 178.261333-76.928 296.021333-82.645333zM554.666667 629.376c-27.392 1.322667-53.034667 3.968-77.141334 7.808l-8.192 1.365333c-136.704 23.637333-224.810667 87.168-310.954666 176.128-26.154667 27.008-51.882667 59.648-51.882667 59.648-14.848 18.176-24.021333 14.037333-20.352-9.173333 0 0 4.394667-31.402667 11.690667-65.792C144.938667 577.066667 250.581333 423.68 554.666667 377.941333V209.066667a38.4 38.4 0 0 1 65.536-27.136l291.328 291.285333a38.4 38.4 0 0 1 0 54.314667l-291.328 291.285333A38.4 38.4 0 0 1 554.666667 791.637333v-162.261333z" fill="currentColor"/>
              </svg>
            </button>
            <div class="action-spacer"></div>
            <button class="action-btn" @click="handleReport">
              <svg width="28" height="28" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                <path d="M512 179.2l390.4 627.2H128l384-627.2m0-64c-19.2 0-44.8 12.8-51.2 32l-390.4 627.2c-25.6 44.8 6.4 96 51.2 96H896c51.2 0 83.2-57.6 51.2-96l-384-627.2c-6.4-19.2-32-32-51.2-32z" fill="currentColor"/>
                <path d="M512 640c-19.2 0-32-12.8-32-32v-192c0-19.2 12.8-32 32-32s32 12.8 32 32v192c0 19.2-12.8 32-32 32z" fill="currentColor"/>
                <path d="M512 723.2m-32 0a32 32 0 1 0 64 0 32 32 0 1 0-64 0Z" fill="currentColor"/>
              </svg>
              <em>举报稿件</em>
            </button>
          </div>

          <div class="video-desc-section" v-if="video.description || video.tags?.length">
            <div class="desc-content" v-if="video.description">
              <p class="desc-text" :class="{ collapsed: !descExpanded }">{{ video.description }}</p>
              <span class="desc-toggle" v-if="video.description.length > 100" @click="descExpanded = !descExpanded">
                {{ descExpanded ? '收起' : '展开' }}
              </span>
            </div>
            <div class="desc-tags" v-if="video.tags?.length">
              <span v-for="tag in video.tags" :key="tag" class="tag-item">{{ tag }}</span>
            </div>
          </div>

          <div class="comment-section" ref="commentSectionRef">
            <div class="section-header">
              <h3>评论</h3>
              <span class="comment-count" v-if="isLoggedIn">{{ comments.length }}</span>
            </div>

            <div v-if="!isLoggedIn" class="login-prompt">
              <router-link :to="{ path: '/login', query: { redirect: $route.fullPath } }">登录</router-link>后参与评论
            </div>

            <div v-if="isLoggedIn" class="comment-input-inline" ref="commentInputRef">
              <div class="input-avatar">
                <img v-if="currentUser?.avatar || currentUser?.avatarUrl" :src="currentUser.avatar || currentUser.avatarUrl" />
                <span v-else>{{ currentUser?.nickname?.charAt(0) || '?' }}</span>
              </div>
              <div class="input-area">
                <div class="reply-hint" v-if="replyingTo">
                  <span>回复 <strong>{{ replyingTo.nickName }}</strong></span>
                  <button class="cancel-reply" @click="cancelReply">×</button>
                </div>
                <div class="input-wrapper">
                  <textarea
                    v-model="commentContent"
                    :placeholder="replyingTo ? '回复 ' + replyingTo.nickName + '...' : '发一条友善的评论'"
                    rows="2"
                    maxlength="2000"
                  ></textarea>
                </div>
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
                    <button class="cancel-btn" v-if="commentContent.trim() || replyingTo" @click="commentContent = ''; replyingTo = null">取消</button>
                    <button class="submit-btn" :disabled="!commentContent.trim() || submitting" @click="submitComment">
                      {{ submitting ? '发布中...' : '发布' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="comment-list" v-if="isLoggedIn && comments.length">
              <div v-for="comment in comments" :key="comment.id" class="comment-list-item">
                <CommentItem 
                  :comment="comment" 
                  :comment-map="commentMap"
                  @like="handleLikeComment"
                  @reply="handleReply"
                />
                <div class="replies-list" v-if="getAllReplies(comment).length">
                  <CommentItem 
                    v-for="reply in getDisplayReplies(comment)" 
                    :key="reply.id"
                    :comment="reply"
                    :comment-map="commentMap"
                    @like="handleLikeComment"
                    @reply="handleReply"
                  />
                  <div class="replies-pagination" v-if="expandedComments[comment.id] && getAllReplies(comment).length > 5">
                    <button 
                      class="pagination-btn"
                      :disabled="(replyPages[comment.id] || 1) <= 1"
                      @click="goToPage(comment.id, (replyPages[comment.id] || 1) - 1)"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="15 18 9 12 15 6"/>
                      </svg>
                    </button>
                    <template v-for="page in getVisiblePages(comment.id, getAllReplies(comment).length)" :key="page">
                      <button 
                        v-if="page !== '...'"
                        class="pagination-btn"
                        :class="{ active: (replyPages[comment.id] || 1) === page }"
                        @click="goToPage(comment.id, page)"
                      >
                        {{ page }}
                      </button>
                      <span v-else class="pagination-ellipsis">...</span>
                    </template>
                    <button 
                      class="pagination-btn"
                      :disabled="(replyPages[comment.id] || 1) >= getTotalPages(getAllReplies(comment).length)"
                      @click="goToPage(comment.id, (replyPages[comment.id] || 1) + 1)"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </button>
                  </div>
                  <button 
                    v-if="getAllReplies(comment).length > 2 && !expandedComments[comment.id]"
                    class="expand-btn"
                    @click="toggleExpand(comment.id)"
                  >
                    展开 {{ getAllReplies(comment).length - 2 }} 条回复
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>
                  <button 
                    v-if="expandedComments[comment.id]"
                    class="expand-btn"
                    @click="toggleExpand(comment.id)"
                  >
                    收起回复
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="18 15 12 9 6 15"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div v-if="isLoggedIn && !comments.length && !loadingComments" class="empty-comments">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-opacity="0.3">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <p>暂无评论，快来抢沙发~</p>
            </div>
            <div v-if="loadingComments && comments.length" class="loading-more">
              <div class="loading-spinner"></div>
              <span>加载中...</span>
            </div>
            <div v-if="!hasMoreComments && comments.length && !loadingComments" class="no-more-comments">
              没有更多评论了
            </div>
          </div>
        </div>

        <div class="right-container">
          <div class="episode-section" :class="{ 'has-titles': hasEpisodeTitles }" v-if="episodes.length > 1">
            <div class="section-title">
              <span>选集</span>
              <span class="episode-total">{{ episodes.length }}集</span>
            </div>
            <div v-if="hasEpisodeTitles" class="episode-list">
              <button
                v-for="(ep, idx) in episodes"
                :key="ep.id"
                class="episode-list-item"
                :class="{ active: currentEpisodeIndex === idx }"
                @click="currentEpisodeIndex = idx"
              >
                <span v-if="currentEpisodeIndex === idx" class="playing-icon"></span>
                <span class="episode-title">{{ ep.title }}</span>
                <span class="episode-duration" v-if="ep.duration">{{ formatDuration(ep.duration) }}</span>
              </button>
            </div>
            <div v-else class="episode-grid">
              <button
                v-for="(ep, idx) in episodes"
                :key="ep.id"
                class="episode-btn"
                :class="{ active: currentEpisodeIndex === idx }"
                @click="currentEpisodeIndex = idx"
              >
                {{ ep.episodeNumber || idx + 1 }}
              </button>
            </div>
          </div>

          <div class="related-section">
            <div class="section-title">相关推荐</div>
            <div class="related-list">
              <router-link
                v-for="item in relatedVideos"
                :key="item.id"
                :to="`/video/${item.id}`"
                class="related-item"
                @click.prevent="handleRelatedClick(item)"
              >
                <div class="related-cover">
                  <img v-if="item.coverUrl" :src="item.coverUrl" />
                  <div v-else class="cover-placeholder"></div>
                  <span class="duration-tag">{{ formatDuration(item.totalDuration) }}</span>
                </div>
                <div class="related-info">
                  <div class="related-title">{{ item.title }}</div>
                  <div class="related-meta">
                    <span class="related-author">{{ item.nickName }}</span>
                  </div>
                </div>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <FloatingCommentBar 
    :is-logged-in="isLoggedIn" 
    :current-user="currentUser"
    :show="showFloatingComment"
    :replying-to="replyingTo"
    @submit="handleFloatingSubmit"
    @cancel-reply="cancelReply"
  />

<Teleport to="body">
  <Transition name="report-overlay" mode="out-in">
    <div v-if="showReportDialog" class="report-overlay" @click.self="showReportDialog = false">
      <Transition name="report-dialog" appear>
        <div v-if="showReportDialog" class="report-dialog">
            <div class="report-dialog-header">
              <h3>举报稿件</h3>
              <button class="report-close-btn" @click="showReportDialog = false">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div class="report-dialog-body">
              <div class="report-tip">请选择举报类型，为帮助审核人员更快处理，请补充违规内容出现位置</div>

              <div v-if="reportTypesLoading && !reportCategories.length" class="report-tip">举报类型加载中...</div>

              <div v-for="cat in reportCategories" :key="cat.label" class="report-category">
                <div class="category-label">{{ cat.label }}</div>
                <div class="category-grid">
                  <label
                    v-for="item in cat.items"
                    :key="item.tid"
                    class="type-chip"
                    :class="{ active: reportForm.reportType === item.tid }"
                  >
                    <input type="radio" :value="item.tid" v-model="reportForm.reportType" />
                    <span class="chip-dot">
                      <span class="chip-dot-inner"></span>
                    </span>
                    <span class="chip-name">{{ item.name }}</span>
                  </label>
                </div>
              </div>

              <div class="report-detail-section" v-if="selectedTypeInfo?.controls?.length">
                <div v-for="ctrl in selectedTypeInfo.controls" :key="ctrl.tid" class="detail-field">
                  <label class="detail-label">{{ ctrl.title }}</label>
                  <input
                    v-if="ctrl.component === 'input'"
                    v-model="reportForm.extraFields[ctrl.name]"
                    class="detail-input"
                    :placeholder="ctrl.placeholder"
                  />
                  <input
                    v-else-if="ctrl.component === 'link'"
                    v-model="reportForm.extraFields[ctrl.name]"
                    class="detail-input"
                    :placeholder="ctrl.placeholder"
                  />
                </div>
              </div>

              <div class="report-detail-section">
                <label class="detail-label">补充说明</label>
                <div v-if="selectedTypeInfo?.controls?.length" class="detail-hint">
                  请同时填写上方的「{{ selectedTypeInfo.controls.map(c => c.title || c.name).join('、') }}」，以便更快处理
                </div>
                <div class="report-textarea-wrap">
                  <textarea
                    v-model="reportForm.reason"
                    class="report-textarea"
                    :placeholder="reportForm.reportType ? '请描述详细信息，帮助我们更快处理' : '请先选择举报类型'"
                    maxlength="500"
                    rows="3"
                    :disabled="!reportForm.reportType"
                  ></textarea>
                  <span class="textarea-count">{{ (reportForm.reason || '').length }}/500</span>
                </div>
              </div>

              <div class="report-scope-section">
                <label class="detail-label">举报范围</label>
                <div class="report-scope-row">
                  <label class="scope-chip" :class="{ active: reportForm.reportScope === 'episode' }">
                    <input type="radio" value="episode" v-model="reportForm.reportScope" />
                    <span>当前剧集</span>
                  </label>
                  <label class="scope-chip" :class="{ active: reportForm.reportScope === 'video' }">
                    <input type="radio" value="video" v-model="reportForm.reportScope" />
                    <span>整个视频</span>
                  </label>
                </div>
              </div>
            </div>

            <div class="report-dialog-footer">
              <button class="report-btn report-btn-cancel" @click="showReportDialog = false">取消</button>
              <button
                class="report-btn report-btn-submit"
                :class="{ disabled: !reportForm.reportType, loading: reportSubmitting }"
                :disabled="!reportForm.reportType || reportSubmitting"
                @click="submitReport"
              >
                <svg v-if="reportSubmitting" class="btn-spinner" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                <span>{{ reportSubmitting ? '提交中...' : '提交举报' }}</span>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>

  <FavoriteFolderDialog
    v-model:visible="showFolderDialog"
    :episode-uid="currentEpisode?.avid || currentEpisode?.id"
    v-model:is-favorited="isFavorited"
    v-model:favorite-folder-uid="favoriteFolderUid"
    :favorite-count="currentEpisode?.favoriteCount || 0"
    @update:favorite-count="handleFavoriteCountUpdate"
  />
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { formatCount, formatDuration } from '../utils/format'
import { ElMessage } from 'element-plus'
import { throttle } from '../utils/format'
import request from '../api/request'
import { videoPlay } from 'vue3-video-play'
import 'vue3-video-play/dist/style.css'
import { followUser, unfollowUser, checkIsFollowed, getRelatedVideos, likeEpisode, coinEpisode, getEpisodeStatus, getFavoriteStatus, removeFavorite, recordWatchHistory, getWatchHistoryList } from '../api/video'
import { getCommentTree, postComment, likeClientComment } from '../api/comment'
import { createReport, getDict } from '../api/report'
import FavoriteFolderDialog from '../components/FavoriteFolderDialog.vue'
import FloatingCommentBar from '../components/FloatingCommentBar.vue'
import CommentItem from '../components/CommentItem.vue'
import EmojiPicker from '../components/EmojiPicker.vue'
import twemoji from 'twemoji'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const video = ref(null)
const episodes = ref([])
const currentEpisodeIndex = ref(0)
const comments = ref([])
const commentContent = ref('')
const relatedVideos = ref([])
const isLiked = ref(false)
const isCoined = ref(false)
const isFavorited = ref(false)
const favoriteFolderUid = ref('')
const showFolderDialog = ref(false)
const isFollowed = ref(false)
const descExpanded = ref(true)
const currentUser = ref(null)
const currentEpisode = ref(null)
const showFloatingComment = ref(false)
const commentSectionRef = ref(null)
const commentInputRef = ref(null)
const replyingTo = ref(null)
const submitting = ref(false)
const expandedComments = ref({})
const replyPages = ref({})
const REPLIES_PER_PAGE = 5

const savedTime = ref(0)
const currentTimeRef = ref(0)

const seekToSavedTime = (t) => {
  if (t <= 0) return
  let attempts = 0
  const trySeek = () => {
    const v = document.querySelector('video')
    if (v && v.readyState >= 1) {
      v.currentTime = t
    } else if (attempts < 20) {
      attempts++
      setTimeout(trySeek, 200)
    }
  }
  trySeek()
}

watch(savedTime, (t) => {
  if (t > 0) {
    nextTick(() => seekToSavedTime(t))
  }
})

const showReportDialog = ref(false)
const reportSubmitting = ref(false)
const reportForm = ref({
  reportType: null,
  reason: '',
  reportScope: 'episode',
  extraFields: {}
})
const REPORT_TYPE_GROUPS = [
  { typeCode: 'report_type_equity', label: '侵犯合法权益' },
  { typeCode: 'report_type_rule', label: '违反社区规则' }
]

const reportCategories = ref([])
const reportTypesLoading = ref(false)
let reportTypesLoaded = false

const loadReportTypes = async () => {
  if (reportTypesLoaded || reportTypesLoading.value) return
  reportTypesLoading.value = true
  try {
    const results = await Promise.all(REPORT_TYPE_GROUPS.map(g => getDict(g.typeCode)))
    reportCategories.value = REPORT_TYPE_GROUPS.map((g, i) => ({
      label: g.label,
      items: [...(results[i] || [])]
        .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
        .map(d => {
          const tid = Number(d.value)
          const normalizedTid = Number.isNaN(tid) ? d.value : tid
          return { tid: normalizedTid, name: d.label, controls: d.controls }
        })
    }))
    reportTypesLoaded = true
  } catch (e) {
    console.error('获取举报类型失败:', e)
    ElMessage.error('举报类型加载失败，请稍后重试')
  } finally {
    reportTypesLoading.value = false
  }
}

const toggleExpand = (commentId) => {
  const newState = { ...expandedComments.value }
  newState[commentId] = !newState[commentId]
  expandedComments.value = newState
  if (newState[commentId]) {
    const newPages = { ...replyPages.value }
    newPages[commentId] = 1
    replyPages.value = newPages
  }
}

const flattenComments = (commentsList) => {
  const result = []
  const traverse = (items) => {
    if (!items) return
    items.forEach(item => {
      result.push(item)
      if (item.replies) {
        traverse(item.replies)
      }
    })
  }
  traverse(commentsList)
  return result
}

const commentMap = computed(() => {
  const map = {}
  const addToList = (items) => {
    if (!items) return
    items.forEach(item => {
      map[item.id] = item
      if (item.replies) {
        addToList(item.replies)
      }
    })
  }
  addToList(comments.value)
  return map
})

const getAllReplies = (comment) => {
  const replies = []
  const traverse = (items) => {
    if (!items) return
    items.forEach(item => {
      replies.push(item)
      if (item.replies) {
        traverse(item.replies)
      }
    })
  }
  if (comment.replies) {
    traverse(comment.replies)
  }
  return replies
}

const getTotalPages = (totalReplies) => {
  return Math.ceil(totalReplies / REPLIES_PER_PAGE)
}

const getPaginatedReplies = (comment) => {
  const allReplies = getAllReplies(comment)
  const currentPage = replyPages.value[comment.id] || 1
  const startIndex = (currentPage - 1) * REPLIES_PER_PAGE
  const endIndex = startIndex + REPLIES_PER_PAGE
  const result = allReplies.slice(startIndex, endIndex)
  return result
}

const getDisplayReplies = (comment) => {
  const expanded = expandedComments.value[comment.id]
  if (expanded) {
    return getPaginatedReplies(comment)
  }
  return getAllReplies(comment).slice(0, 2)
}

const prevPage = (commentId) => {
  if (replyPages.value[commentId] > 1) {
    replyPages.value = { ...replyPages.value, [commentId]: replyPages.value[commentId] - 1 }
  }
}

const nextPage = (commentId, totalReplies) => {
  const totalPages = getTotalPages(totalReplies)
  const currentPage = replyPages.value[commentId] || 1
  if (currentPage < totalPages) {
    replyPages.value = { ...replyPages.value, [commentId]: currentPage + 1 }
  }
}

const goToPage = (commentId, page) => {
  replyPages.value = { ...replyPages.value, [commentId]: page }
}

const getVisiblePages = (commentId, totalReplies) => {
  const totalPages = getTotalPages(totalReplies)
  const currentPage = replyPages.value[commentId] || 1
  const pages = []
  
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    pages.push(1)
    if (currentPage > 4) {
      pages.push('...')
    }
    const start = Math.max(2, currentPage - 2)
    const end = Math.min(totalPages - 1, currentPage + 2)
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    if (currentPage < totalPages - 3) {
      pages.push('...')
    }
    pages.push(totalPages)
  }
  
  return pages
}

const isLoggedIn = computed(() => authStore.isLoggedIn)

const hasEpisodeTitles = computed(() => {
  return episodes.value.some(ep => ep.title && ep.title.trim())
})

const isOwnVideo = computed(() => {
  if (!isLoggedIn.value || !video.value || !authStore.user) return false
  return String(video.value.uid) === String(authStore.user.uid)
})

const currentPlayUrl = computed(() => {
  return currentEpisode.value?.playUrl || video.value?.currentEpisode?.playUrl || ''
})

const updateDocumentTitle = () => {
  const ep = currentEpisode.value
  const epTitle = ep?.title || (ep?.episodeNumber ? `第${ep.episodeNumber}集` : '')
  document.title = epTitle ? `${epTitle} - ${video.value?.title || ''}` : `${video.value?.title || '视频播放'} - VideoHub`
}

const applyVideoData = async (data) => {
  video.value = data
  if (data.episodes && data.episodes.length > 0) {
    episodes.value = [...data.episodes].sort((a, b) => a.episodeNumber - b.episodeNumber)
    
    const targetEpisodeId = route.params.episodeUid
    if (targetEpisodeId) {
      const idx = episodes.value.findIndex(e => String(e.id) === String(targetEpisodeId) || String(e.avid) === String(targetEpisodeId))
      if (idx !== -1) {
        currentEpisodeIndex.value = idx
        currentEpisode.value = episodes.value[idx]
      } else if (data.currentEpisode) {
        const defaultIdx = episodes.value.findIndex(e => e.id === data.currentEpisode.id)
        if (defaultIdx !== -1) {
          currentEpisodeIndex.value = defaultIdx
        }
        currentEpisode.value = data.currentEpisode
      } else {
        currentEpisode.value = episodes.value[0]
      }
    } else if (data.currentEpisode) {
      const idx = episodes.value.findIndex(e => e.id === data.currentEpisode.id)
      if (idx !== -1) {
        currentEpisodeIndex.value = idx
      }
      currentEpisode.value = data.currentEpisode
    } else {
      currentEpisode.value = episodes.value[0]
    }
  } else if (data.isOngoing) {
    episodes.value = Array.from({ length: data.episodeCount || 5 }, (_, i) => ({
      title: `第${i + 1}集`
    }))
    currentEpisode.value = null
  } else {
    episodes.value = []
    currentEpisode.value = null
  }

  updateDocumentTitle()

  try {
    const res = await getRelatedVideos(data.avid || data.id)
    relatedVideos.value = res?.records || []
  } catch (e) {
    console.error('获取相关推荐失败:', e)
    relatedVideos.value = []
  }
}

const loadEpisodeStatus = async () => {
  if (!isLoggedIn.value) return
  const episodeUid = currentEpisode.value?.avid || currentEpisode.value?.id
  if (!episodeUid) return
  try {
    const [statusRes, favRes] = await Promise.all([
      getEpisodeStatus(episodeUid),
      getFavoriteStatus(episodeUid)
    ])
    if (statusRes) {
      isLiked.value = statusRes.isLiked
      isCoined.value = statusRes.isCoined
    }
    if (favRes) {
      isFavorited.value = favRes.isFavorited || false
      favoriteFolderUid.value = favRes.favoriteFolderUid || ''
    }
  } catch (e) {
    console.error('获取剧集状态失败:', e)
  }
}

const reportWatchProgress = (seconds) => {
  if (!isLoggedIn.value) return
  const videoUid = video.value?.avid || video.value?.id
  const episodeUid = currentEpisode.value?.avid || currentEpisode.value?.id
  if (videoUid && episodeUid) {
    recordWatchHistory({ videoId: videoUid, episodeId: episodeUid, watchedSeconds: Math.floor(seconds) })
  }
}

const reportProgress = throttle((e) => {
  currentTimeRef.value = e.target.currentTime
  reportWatchProgress(e.target.currentTime)
}, 30000)

const handleTimeUpdate = (e) => {
  currentTimeRef.value = e.target.currentTime
  reportProgress(e)
}

const loadVideo = async () => {
  const videoUid = route.params.videoUid
  const episodeUid = route.params.episodeUid
  
  if (videoUid && episodeUid) {
    try {
      const res = await request.get(`/client/video/${videoUid}/episode/${episodeUid}`)
      const data = res.data || res
      await applyVideoData(data)
      
      // 优先使用 query 参数中的 t（从历史记录点击时传递的播放进度）
      const queryTime = route.query.t ? Number(route.query.t) : 0
      if (queryTime > 0) {
        savedTime.value = queryTime
        return
      }
      
      if (isLoggedIn.value) {
        try {
          const historyRes = await getWatchHistoryList({ page: 1, size: 100 })
          const historyList = historyRes?.records || []
          const currentHistory = historyList.find(item => {
            let itemVideoUid = item.videoAvid || item.videoId
            let itemEpisodeUid = item.episodeAvid || item.episodeId
            // 如果 videoAvid 为 null，从 playLink 中提取
            if (!itemVideoUid && item.playLink) {
              const match = item.playLink.match(/\/client\/video\/([^/]+)\/episode\/([^/]+)/)
              if (match) {
                itemVideoUid = match[1]
                itemEpisodeUid = match[2]
              }
            }
            return String(itemVideoUid) === String(videoUid) && String(itemEpisodeUid) === String(episodeUid)
          })
          if (currentHistory) {
            if (currentHistory.watchedSeconds) {
              savedTime.value = currentHistory.watchedSeconds
            } else if (currentHistory.watchProgress && currentHistory.duration) {
              savedTime.value = Math.floor(currentHistory.watchProgress * currentHistory.duration)
            }
          }
        } catch (e) {
          console.error('获取观看进度失败:', e)
        }
      }
      return
    } catch (e) {
      console.error('获取播放信息失败:', e)
    }
  }
}

const commentPage = ref(1)
const commentTotal = ref(0)
const commentSortBy = ref('time')
const loadingComments = ref(false)
const hasMoreComments = ref(true)

const loadComments = async (isLoadMore = false) => {
  const videoUid = video.value?.avid || video.value?.id
  const episodeUid = currentEpisode.value?.avid || currentEpisode.value?.id
  if (!videoUid || !episodeUid) return
  
  loadingComments.value = true
  try {
    const res = await getCommentTree(videoUid, episodeUid, {
      page: commentPage.value,
      size: 10,
      sortBy: commentSortBy.value
    })
    if (res && res.records) {
      if (isLoadMore) {
        comments.value = [...comments.value, ...res.records]
      } else {
        comments.value = res.records
      }
      commentTotal.value = res.total || 0
      hasMoreComments.value = comments.value.length < commentTotal.value
    }
  } catch (e) {
    console.error('获取评论失败:', e)
    if (!isLoadMore) {
      comments.value = []
    }
  } finally {
    loadingComments.value = false
  }
}

const loadMoreComments = () => {
  if (!isLoggedIn.value) return
  if (loadingComments.value || !hasMoreComments.value) return
  commentPage.value++
  loadComments(true)
}

const requireLogin = () => {
  router.push({ path: '/login', query: { redirect: route.fullPath } })
}

const handleLike = async () => {
  if (!isLoggedIn.value) { requireLogin(); return }
  try {
    const episodeUid = currentEpisode.value?.avid || currentEpisode.value?.id
    if (!episodeUid) return
    const res = await likeEpisode(episodeUid)
    if (res) {
      isLiked.value = res.isActioned
      if (currentEpisode.value) {
        currentEpisode.value.likeCount = res.count
      }
    }
  } catch (e) {
    console.error('点赞失败:', e)
    ElMessage.error(e.message || '点赞失败')
  }
}

const handleCoin = async () => {
  if (!isLoggedIn.value) { requireLogin(); return }
  if (isCoined.value) {
    ElMessage.warning('该稿件的投币次数已用完')
    return
  }
  try {
    const episodeUid = currentEpisode.value?.avid || currentEpisode.value?.id
    if (!episodeUid) return
    const res = await coinEpisode(episodeUid)
    if (res) {
      isCoined.value = res.isActioned
      if (currentEpisode.value) {
        currentEpisode.value.coinCount = res.count
      }
    }
  } catch (e) {
    console.error('投币失败:', e)
  }
}

const handleFavorite = async () => {
  if (!isLoggedIn.value) { requireLogin(); return }
  if (isFavorited.value) {
    try {
      await removeFavorite({ episodeUid: currentEpisode.value?.avid || currentEpisode.value?.id })
      isFavorited.value = false
      favoriteFolderUid.value = ''
      if (currentEpisode.value) {
        currentEpisode.value.favoriteCount = Math.max(0, (currentEpisode.value.favoriteCount || 0) - 1)
      }
      ElMessage.success('已取消收藏')
    } catch (e) {
      console.error('取消收藏失败:', e)
    }
  } else {
    showFolderDialog.value = true
  }
}

const handleFavoriteCountUpdate = (newCount) => {
  if (currentEpisode.value) {
    currentEpisode.value.favoriteCount = newCount
  }
}

const handleShare = async () => {
  const url = window.location.origin + route.fullPath
  try {
    await navigator.clipboard.writeText(url)
    ElMessage.success('链接已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败，请手动复制')
  }
}

const handleReport = () => {
  if (!isLoggedIn.value) { requireLogin(); return }
  showReportDialog.value = true
  loadReportTypes()
}

const selectedTypeInfo = computed(() => {
  for (const cat of reportCategories.value) {
    const found = cat.items.find(t => t.tid === reportForm.value.reportType)
    if (found) return found
  }
  return null
})

const resetReportForm = () => {
  reportForm.value = { reportType: null, reason: '', reportScope: 'episode', extraFields: {} }
}

const submitReport = async () => {
  if (!reportForm.value.reportType) return
  if (reportSubmitting.value) return
  reportSubmitting.value = true
  try {
    const videoUid = video.value?.avid || video.value?.id
    const episodeUid = currentEpisode.value?.avid || currentEpisode.value?.id
    const data = {
      videoUid: String(videoUid),
      reportType: reportForm.value.reportType,
      reason: reportForm.value.reason || undefined
    }
    if (reportForm.value.reportScope === 'episode' && episodeUid) {
      data.episodeUid = String(episodeUid)
    }
    const extra = reportForm.value.extraFields
    if (Object.keys(extra).length > 0) {
      data.extraFields = { ...extra }
    }
    await createReport(data)
    ElMessage.success('举报已提交，感谢您的反馈')
    showReportDialog.value = false
  } catch (e) {
    console.error('举报失败:', e)
    ElMessage.error(e.message || '举报提交失败，请稍后重试')
  } finally {
    reportSubmitting.value = false
  }
}

const handleRelatedClick = (item) => {
  let path = ''
  if (item.playLink) {
    path = item.playLink
    try {
      const url = new URL(path)
      path = url.pathname
    } catch {}
    if (path.startsWith('/api')) {
      path = path.slice(4)
    }
  } else {
    path = `/client/video/${item.id}/episode/${item.currentEpisode?.id || item.id}`
  }
  if (path) {
    window.open(path, '_blank')
  }
}

const goToUpProfile = () => {
  if (video.value?.uid) {
    router.push(`/up/${video.value.uid}`)
  }
}

const handleFollow = async () => {
  if (!isLoggedIn.value) { requireLogin(); return }
  try {
    if (isFollowed.value) {
      await unfollowUser(video.value.uid)
      isFollowed.value = false
    } else {
      await followUser(video.value.uid)
      isFollowed.value = true
    }
  } catch (e) {
    console.error('操作失败:', e)
  }
}

const handleLikeComment = async (comment) => {
  if (!isLoggedIn.value) return
  if (comment.liked) return
  
  try {
    await likeClientComment(comment.id)
    comment.likeCount = (comment.likeCount || 0) + 1
    comment.liked = true
  } catch (e) {
    console.error('点赞失败:', e)
    ElMessage.error(e.message || '点赞失败')
  }
}

const handleReply = (comment) => {
  if (!isLoggedIn.value) {
    window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`
    return
  }
  replyingTo.value = comment
  commentContent.value = ''
}

const cancelReply = () => {
  replyingTo.value = null
}

const insertEmoji = (emoji) => {
  commentContent.value += emoji
}

const submitComment = async () => {
  if (!commentContent.value.trim() || submitting.value) return
  
  const videoUid = video.value?.avid || video.value?.id
  const episodeUid = currentEpisode.value?.avid || currentEpisode.value?.id
  if (!videoUid || !episodeUid) return
  
  submitting.value = true
  try {
    const data = {
      videoUid: String(videoUid),
      episodeUid: String(episodeUid),
      content: commentContent.value.trim()
    }
    
    if (replyingTo.value) {
      data.parentId = replyingTo.value.id
    }
    
    const res = await postComment(data)
    if (res) {
      commentContent.value = ''
      replyingTo.value = null
      commentPage.value = 1
      await loadComments()
    }
  } catch (e) {
    console.error('发表评论失败:', e)
  } finally {
    submitting.value = false
  }
}

const handleFloatingSubmit = async (content, parentId) => {
  if (submitting.value) return
  
  const videoUid = video.value?.avid || video.value?.id
  const episodeUid = currentEpisode.value?.avid || currentEpisode.value?.id
  if (!videoUid || !episodeUid) return
  
  submitting.value = true
  try {
    const data = {
      videoUid: String(videoUid),
      episodeUid: String(episodeUid),
      content: content
    }
    
    if (parentId) {
      data.parentId = parentId
    }
    
    const res = await postComment(data)
    if (res) {
      replyingTo.value = null
      commentPage.value = 1
      await loadComments()
    }
  } catch (e) {
    console.error('发表评论失败:', e)
  } finally {
    submitting.value = false
  }
}

const checkCommentInputVisibility = () => {
  if (!commentInputRef.value || !isLoggedIn.value) {
    showFloatingComment.value = false
    return
  }
  const rect = commentInputRef.value.getBoundingClientRect()
  const isHidden = rect.bottom < 0
  showFloatingComment.value = isHidden
}

const handleScroll = throttle(() => {
  checkCommentInputVisibility()
  
  const scrollHeight = document.documentElement.scrollHeight
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
  const clientHeight = document.documentElement.clientHeight
  
  if (scrollTop + clientHeight >= scrollHeight - 200) {
    loadMoreComments()
  }
}, 300)

let twemojiObserver = null

const parseTwemoji = (el) => {
  if (!el) return
  twemoji.parse(el, { folder: 'svg', ext: '.svg', className: 'twemoji' })
}

onMounted(async () => {
  await authStore.init()
  await loadVideo()
  if (isLoggedIn.value) {
    loadComments()
    currentUser.value = authStore.user
    try {
      const uid = video.value?.uid
      if (uid && !isOwnVideo.value) {
        const res = await checkIsFollowed(uid)
        isFollowed.value = res === true
      }
    } catch (e) {
      console.error('检查关注状态失败:', e)
    }
    loadEpisodeStatus()
  }
  nextTick(() => {
    checkCommentInputVisibility()
  })
  window.addEventListener('scroll', handleScroll)

  twemojiObserver = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeType === 1) parseTwemoji(node)
      }
    }
  })
  // 只监听评论区容器，而不是整个document.body
  const commentContainer = commentSectionRef.value || document.body
  twemojiObserver.observe(commentContainer, { childList: true, subtree: true })
})

onUnmounted(() => {
  if (currentTimeRef.value > 0) {
    reportWatchProgress(currentTimeRef.value)
  }
  window.removeEventListener('scroll', handleScroll)
  twemojiObserver?.disconnect()
  document.title = 'VideoHub'
})

watch(() => [route.params.videoUid, route.params.episodeUid], async () => {
  await loadVideo()
  isLiked.value = false
  isCoined.value = false
  isFavorited.value = false
  favoriteFolderUid.value = ''
  isFollowed.value = false
  
  if (isLoggedIn.value) {
    loadComments()
    // 检查是否已关注（仅非自己投稿的视频）
    try {
      const uid = video.value?.uid
      if (uid && !isOwnVideo.value) {
        const res = await checkIsFollowed(uid)
        isFollowed.value = res === true
      }
    } catch (e) {
      console.error('检查关注状态失败:', e)
    }
    loadEpisodeStatus()
  }
})

watch(currentEpisodeIndex, async (newIdx) => {
  const ep = episodes.value[newIdx]
  if (!ep) return
  const videoUid = route.params.videoUid
  const episodeUid = ep.avid || ep.id
  if (videoUid && episodeUid) {
    router.push(`/client/video/${videoUid}/episode/${episodeUid}`)
  }
})
</script>

<style scoped>
.video-page {
  padding-top: var(--header-height);
  min-height: 100vh;
  background: #fff;
}

.video-page::before {
  content: '';
  position: fixed;
  top: var(--header-height);
  left: 0;
  right: 0;
  height: 5px;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.06) 0%, transparent 100%);
  pointer-events: none;
  z-index: 100;
}

.page-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px 0px 40px;
}

.video-header {
  display: flex;
  align-items: stretch;
  gap: 24px;
  margin-bottom: 16px;
}

.video-info-section {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.video-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text1);
  margin-bottom: 8px;
  line-height: 1.4;
  word-break: break-word;
}

.video-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text3);
}

.separator {
  color: var(--text4);
}

.author-card {
  flex-shrink: 0;
  width: 340px;
  padding: 12px 0px;
  background: transparent;
  border-radius: var(--radius-lg);
  display: flex;
  gap: 12px;
}

.author-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--brand_pink_thin);
  color: var(--brand_pink);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 600;
  flex-shrink: 0;
  align-self: center;
}

.author-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.author-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}

.author-info {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text1);
}

.author-desc {
  font-size: 12px;
  color: var(--text3);
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.follow-btn {
  width: 100%;
  padding: 6px 0;
  background: var(--brand_pink);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.follow-btn:hover {
  background: var(--brand_pink_hover);
}

.follow-btn.followed {
  background: var(--bg3);
  color: var(--text3);
}

.follow-btn.followed:hover {
  background: var(--graph_bg_thick);
}

.content-container {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 24px;
}

.left-container {
  min-width: 0;
}

.player-box {
  position: relative;
  background: #000;
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.player-wrapper {
  position: relative;
  aspect-ratio: 16/9;
}

.player-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.4);
  gap: 16px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  cursor: pointer;
  transition: opacity 0.3s;
}

.player-placeholder:hover {
  opacity: 0.9;
}

.player-placeholder span {
  font-size: 14px;
}

.video-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--line_regular);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: var(--text2);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  color: var(--text1);
}

.action-btn.active {
  color: var(--brand_pink);
}

.action-btn.active svg {
  fill: var(--brand_pink);
}

.action-btn em {
  font-style: normal;
  font-size: 12px;
}

.action-btn.active em {
  color: var(--brand_pink);
}

.action-spacer {
  flex: 1;
}

.video-desc-section {
  padding: 16px 0;
  border-bottom: 1px solid var(--line_regular);
}

.desc-content {
  position: relative;
}

.desc-text {
  font-size: 14px;
  color: var(--text2);
  line-height: 1.6;
  white-space: pre-wrap;
  margin: 0;
}

.desc-text.collapsed {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.desc-toggle {
  display: inline-block;
  font-size: 13px;
  color: var(--brand_blue);
  cursor: pointer;
  margin-top: 4px;
}

.desc-toggle:hover {
  color: var(--brand_blue_hover);
}

.desc-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.tag-item {
  padding: 6px 16px;
  background: var(--bg2);
  border-radius: var(--radius-md);
  font-size: 14px;
  color: var(--text3);
  cursor: pointer;
  transition: background 0.2s;
}

.tag-item:hover {
  background: var(--graph_bg_thick);
  color: var(--text2);
}

.comment-section {
  padding-top: 24px;
  position: relative;
  z-index: 10;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
}

.section-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text1);
}

.comment-count {
  font-size: 14px;
  color: var(--text3);
}

.login-prompt {
  padding: 24px;
  text-align: center;
  background: var(--bg2);
  border-radius: var(--radius-md);
  margin-bottom: 24px;
  font-size: 14px;
  color: var(--text3);
}

.login-prompt a {
  color: var(--brand_blue);
  text-decoration: none;
  font-weight: 500;
}

.login-prompt a:hover {
  text-decoration: underline;
}

.comment-input-inline {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  position: relative;
  z-index: 20;
}

.comment-input-inline .input-avatar {
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
}

.comment-input-inline .input-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.comment-input-inline .input-area {
  flex: 1;
}

.comment-input-inline .input-wrapper {
  background: var(--bg2);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  transition: all 0.3s;
}

.comment-input-inline .input-wrapper:focus-within {
  background: var(--bg1);
  box-shadow: 0 0 0 2px var(--brand_pink_thin);
}

.comment-input-inline .input-wrapper textarea {
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

.comment-input-inline .input-wrapper textarea::placeholder {
  color: var(--text4);
}

.comment-input-inline .reply-hint {
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

.comment-input-inline .reply-hint strong {
  color: var(--brand_blue);
}

.comment-input-inline .cancel-reply {
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

.comment-input-inline .cancel-reply:hover {
  background: rgba(0, 0, 0, 0.1);
  color: var(--text1);
}

.comment-input-inline .input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.comment-input-inline .footer-left {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
}

.comment-input-inline .emoji-picker-wrapper {
  position: relative;
}

.comment-input-inline .emoji-picker {
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

.comment-input-inline .emoji-picker:hover {
  background: var(--bg3);
  color: var(--brand_pink);
}

.comment-input-inline .char-limit {
  font-size: 12px;
  color: var(--text4);
}

.comment-input-inline .footer-right {
  display: flex;
  gap: 8px;
}

.comment-input-inline .cancel-btn {
  padding: 8px 16px;
  background: transparent;
  color: var(--text3);
  border: 1px solid var(--line_regular);
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.comment-input-inline .cancel-btn:hover {
  background: var(--bg3);
  color: var(--text2);
  border-color: var(--text4);
}

.comment-input-inline .submit-btn {
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

.comment-input-inline .submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(251, 114, 153, 0.4);
}

.comment-input-inline .submit-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(251, 114, 153, 0.3);
}

.comment-input-inline .submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}


.empty-comments {
  padding: 48px 0;
  text-align: center;
  color: var(--text4);
}

.empty-comments p {
  margin-top: 12px;
  font-size: 14px;
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px 0;
  color: #999;
  font-size: 13px;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #e0e0e0;
  border-top-color: #00a1d6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.no-more-comments {
  text-align: center;
  padding: 20px 0;
  color: #999;
  font-size: 13px;
}

.comment-list-item {
  border-bottom: 1px solid var(--line_light);
}

.comment-list-item:last-child {
  border-bottom: none;
}

.replies-list {
  padding: 0 0 0 52px;
  margin-top: 0;
}

.replies-list :deep(.comment-item) {
  padding: 10px 16px;
}

.replies-list :deep(.comment-item:last-child) {
  padding-bottom: 16px;
}

.replies-list :deep(.comment-avatar) {
  width: 24px;
  height: 24px;
}

.replies-list :deep(.avatar-text) {
  font-size: 10px;
}

.replies-list :deep(.comment-user) {
  font-size: 12px;
  color: #999;
}

.replies-list :deep(.comment-text) {
  font-size: 13px;
  color: #333;
}

.replies-list :deep(.reply-to a) {
  color: #00a1d6;
}

.replies-list :deep(.comment-time) {
  font-size: 11px;
  color: #999;
}

.replies-list :deep(.meta-btn) {
  font-size: 11px;
}

.replies-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 12px 0;
}

.pagination-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  padding: 0 6px;
  font-size: 13px;
  color: #606266;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled):not(.active) {
  color: #00a1d6;
  border-color: #00a1d6;
}

.pagination-btn.active {
  color: #fff;
  background: #00a1d6;
  border-color: #00a1d6;
}

.pagination-btn:disabled {
  color: #c0c4cc;
  cursor: not-allowed;
}

.pagination-ellipsis {
  color: #999;
  padding: 0 4px;
}

.expand-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #00a1d6;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px 0;
}

.expand-btn:hover {
  color: #00b5e5;
}

.right-container {
  align-self: start;
}

.episode-section {
  background: var(--bg1);
  border-radius: var(--radius-lg);
  padding: 16px;
  margin-bottom: 16px;
}

.episode-section.has-titles {
  background: var(--bg3);
  padding: 0;
}

.episode-section.has-titles .section-title {
  padding: 12px 16px;
  margin-bottom: 0;
  /* background: var(--bg1); */
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text1);
}

.episode-total {
  font-size: 13px;
  font-weight: 400;
  color: var(--text3);
}

.episode-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
}

.episode-btn {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg2);
  border: none;
  border-radius: var(--radius-sm);
  font-size: 14px;
  color: var(--text2);
  cursor: pointer;
  transition: all 0.2s;
}

.episode-btn:hover {
  background: var(--graph_bg_thick);
  color: var(--text1);
}

.episode-btn.active {
  background: var(--brand_pink);
  color: white;
}

.episode-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 360px;
  overflow-y: auto;
  padding: 0 4px 4px;
}

.episode-list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px;
  /* background: var(--bg1); */
  border: none;
  border-radius: var(--radius-sm);
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
}

.episode-list-item:hover {
  background: var(--graph_bg_thick);
}

.episode-list-item.active {
  background: var(--bg1);
  color: var(--text1);
}

.episode-title {
  flex: 1;
  font-size: 13px;
  color: var(--text2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.episode-list-item.active .episode-title {
  color: var(--text1);
}

.episode-duration {
  flex-shrink: 0;
  font-size: 12px;
  color: var(--text4);
}

.episode-list-item.active .episode-duration {
  color: var(--text3);
}

.playing-icon {
  flex-shrink: 0;
  display: inline-block;
  width: 12px;
  height: 12px;
  background-image: url(/playing.gif);
  background-repeat: no-repeat;
  background-size: 12px 12px;
  background-position: center;
}

.related-section {
  background: var(--bg1);
  border-radius: var(--radius-lg);
  padding: 16px;
}

.related-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.related-item {
  display: flex;
  gap: 10px;
  text-decoration: none;
  padding: 4px;
  margin: -4px;
  border-radius: var(--radius-md);
  transition: background 0.2s;
}

.related-item:hover {
  background: var(--bg2);
}

.related-cover {
  position: relative;
  width: 160px;
  height: 100px;
  border-radius: var(--radius-md);
  overflow: hidden;
  flex-shrink: 0;
  background: var(--bg3);
}

.related-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  background: var(--bg3);
}

.duration-tag {
  position: absolute;
  bottom: 6px;
  right: 6px;
  padding: 2px 6px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 11px;
  border-radius: 3px;
}

.related-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.related-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--text1);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.related-meta {
  font-size: 12px;
  color: var(--text3);
}

.related-author {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.video-desc-section {
  padding: 16px 0;
  border-bottom: 1px solid var(--line_regular);
}

.desc-content {
  position: relative;
}

.desc-text {
  font-size: 14px;
  color: var(--text2);
  line-height: 1.6;
  white-space: pre-wrap;
  margin: 0;
}

.desc-text.collapsed {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.desc-toggle {
  display: inline-block;
  font-size: 13px;
  color: var(--brand_blue);
  cursor: pointer;
  margin-top: 4px;
}

.desc-toggle:hover {
  color: var(--brand_blue_hover);
}

.desc-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.tag-item {
  padding: 6px 16px;
  background: var(--bg2);
  border-radius: var(--radius-md);
  font-size: 14px;
  color: var(--text3);
  cursor: pointer;
  transition: background 0.2s;
}

.tag-item:hover {
  background: var(--graph_bg_thick);
  color: var(--text2);
}

@media (max-width: 1200px) {
  .content-container {
    grid-template-columns: 1fr 300px;
    gap: 16px;
  }
  
  .author-card {
    width: 300px;
  }
}

@media (max-width: 992px) {
  .video-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .author-card {
    width: 100%;
  }
  
  .content-container {
    grid-template-columns: 1fr;
  }
  
  .right-container {
    order: 2;
  }
  
  .episode-grid {
    grid-template-columns: repeat(8, 1fr);
  }
  
  .episode-list {
    max-height: 280px;
  }
}

@media (max-width: 768px) {
  .page-container {
    padding: 12px 16px 24px;
  }
  
  .video-title {
    font-size: 18px;
  }
  
  .related-cover {
    width: 140px;
    height: 88px;
  }
  
  .episode-grid {
    grid-template-columns: repeat(6, 1fr);
  }

  .report-dialog {
    width: 100%;
    max-width: 100vw;
    max-height: 85vh;
    border-radius: 8px 8px 0 0;
    margin-top: auto;
  }

  .report-overlay {
    align-items: flex-end;
  }

  .report-scope-row {
    flex-direction: column;
  }

  .category-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 420px) {
  .category-grid {
    grid-template-columns: 1fr;
  }
}

.report-overlay {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
}

.report-dialog {
  width: 600px;
  max-width: calc(100vw - 40px);
  max-height: 80vh;
  background: var(--bg1);
  border-radius: 8px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.report-overlay-enter-active .report-dialog,
.report-overlay-leave-active .report-dialog {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.report-overlay-enter-from .report-dialog,
.report-overlay-leave-to .report-dialog {
  opacity: 0;
  transform: scale(0.95);
}

.report-overlay-enter-active,
.report-overlay-leave-active {
  transition: opacity 0.2s ease;
}

.report-overlay-enter-from,
.report-overlay-leave-to {
  opacity: 0;
}

.report-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--line_light);
  flex-shrink: 0;
}

.report-dialog-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text1);
}

.report-close-btn {
  width: 30px;
  height: 30px;
  border: none;
  background: transparent;
  border-radius: 4px;
  color: var(--text3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.report-close-btn:hover {
  background: var(--bg2);
  color: var(--text1);
}

.report-dialog-body {
  flex: 1;
  padding: 16px 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.report-tip {
  font-size: 12px;
  color: var(--text3);
  line-height: 1.5;
}

.report-category {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text3);
  padding-bottom: 4px;
  border-bottom: 1px solid var(--line_light);
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.type-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 13px;
  color: var(--text2);
  white-space: nowrap;
  overflow: hidden;
}

.type-chip:hover {
  background: var(--bg2);
  color: var(--text1);
}

.type-chip.active {
  background: rgba(255, 102, 153, 0.08);
  color: var(--brand_pink);
}

.type-chip input[type="radio"] {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.chip-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1.5px solid var(--line_bold);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.15s ease;
}

.type-chip:hover .chip-dot {
  border-color: var(--brand_pink);
}

.type-chip.active .chip-dot {
  border-color: var(--brand_pink);
}

.chip-dot-inner {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--brand_pink);
  transform: scale(0);
  transition: transform 0.15s ease;
}

.type-chip.active .chip-dot-inner {
  transform: scale(1);
}

.chip-name {
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.report-detail-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text1);
}

.detail-hint {
  font-size: 12px;
  color: var(--brand_pink);
  line-height: 1.5;
}

.detail-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--line_regular);
  border-radius: 4px;
  font-size: 13px;
  font-family: var(--font-family);
  color: var(--text1);
  background: var(--bg1);
  outline: none;
  transition: border-color 0.15s ease;
}

.detail-input::placeholder {
  color: var(--text4);
}

.detail-input:focus {
  border-color: var(--brand_pink);
}

.report-textarea-wrap {
  position: relative;
}

.report-textarea {
  width: 100%;
  padding: 8px 12px;
  padding-bottom: 26px;
  border: 1px solid var(--line_regular);
  border-radius: 4px;
  font-size: 13px;
  font-family: var(--font-family);
  color: var(--text1);
  background: var(--bg1);
  resize: none;
  outline: none;
  transition: border-color 0.15s ease;
  line-height: 1.5;
}

.report-textarea::placeholder {
  color: var(--text4);
}

.report-textarea:focus {
  border-color: var(--brand_pink);
}

.report-textarea:disabled {
  background: var(--bg2);
  cursor: not-allowed;
}

.textarea-count {
  position: absolute;
  bottom: 6px;
  right: 10px;
  font-size: 11px;
  color: var(--text4);
  pointer-events: none;
}

.report-scope-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.report-scope-row {
  display: flex;
  gap: 8px;
}

.scope-chip {
  display: inline-flex;
  align-items: center;
  padding: 6px 16px;
  border: 1px solid var(--line_regular);
  border-radius: 4px;
  font-size: 13px;
  color: var(--text2);
  cursor: pointer;
  transition: all 0.15s ease;
}

.scope-chip input[type="radio"] {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.scope-chip:hover {
  border-color: var(--brand_blue);
  color: var(--text1);
}

.scope-chip.active {
  border-color: var(--brand_blue);
  background: rgba(0, 174, 236, 0.06);
  color: var(--brand_blue);
}

.report-dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 12px 20px;
  border-top: 1px solid var(--line_light);
  flex-shrink: 0;
}

.report-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  font-family: var(--font-family);
  cursor: pointer;
  transition: all 0.15s ease;
  line-height: 1;
}

.report-btn-cancel {
  background: var(--bg2);
  color: var(--text2);
}

.report-btn-cancel:hover {
  background: var(--graph_bg_thick);
  color: var(--text1);
}

.report-btn-submit {
  background: var(--brand_pink);
  color: #fff;
}

.report-btn-submit:hover:not(.disabled):not(.loading) {
  background: var(--brand_pink_hover);
}

.report-btn-submit:active:not(.disabled):not(.loading) {
  background: var(--brand_pink_active);
}

.report-btn-submit.disabled,
.report-btn-submit.loading {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-spinner {
  animation: report-spin 0.8s linear infinite;
}

@keyframes report-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
