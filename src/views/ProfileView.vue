<template>
  <div class="profile-page">
    <!-- 用户头部 -->
    <div class="profile-hero">
      <div class="profile-hero-bg"></div>
      <div class="profile-user">
        <div class="profile-avatar" @click="openEditProfile">
          <img v-if="avatarUrl" :src="avatarUrl" alt="" />
          <van-icon v-else name="user-circle-o" size="54" />
          <span v-if="user?.isVip" class="profile-vip-tag">大会员</span>
        </div>
        <div class="profile-meta">
          <div class="profile-name">{{ user?.nikeName || user?.nickname || '未登录' }}</div>
          <div class="profile-sign" @click="openEditProfile">{{ user?.descript || '这个人很懒，什么都没留下' }}</div>
        </div>
        <van-button
          size="small"
          round
          plain
          color="#FFFFFF"
          class="edit-btn"
          @click="openEditProfile"
        >编辑</van-button>
      </div>

      <div class="profile-stats">
        <div class="stat" @click="switchTab('follow')">
          <strong>{{ formatCount(followTotal) }}</strong>
          <span>关注</span>
        </div>
        <div class="stat" @click="switchTab('fans')">
          <strong>{{ formatCount(fansTotal) }}</strong>
          <span>粉丝</span>
        </div>
        <div class="stat" @click="openVip">
          <strong>{{ user?.isVip ? '已开通' : '未开通' }}</strong>
          <span>大会员</span>
        </div>
      </div>
    </div>

    <!-- 快捷入口 -->
    <div class="quick-grid">
      <div class="quick-item" @click="router.push('/history')">
        <van-icon name="clock-o" size="22" />
        <span>历史</span>
      </div>
      <div class="quick-item" @click="router.push('/messages')">
        <van-icon name="bell" size="22" />
        <span>消息</span>
      </div>
      <div class="quick-item" @click="router.push('/contribution')">
        <van-icon name="add-square" size="22" />
        <span>投稿</span>
      </div>
      <div class="quick-item" @click="openVip">
        <van-icon name="diamond" size="22" />
        <span>大会员</span>
      </div>
    </div>

    <!-- Tab 切换 -->
    <van-tabs v-model:active="activeTab" color="#FF6699" shrink sticky :offset-top="offsetTop" @change="switchTab">
      <van-tab title="投稿" name="submit">
        <van-loading v-if="loadingSubmit" class="page-loading" color="#FF6699">加载中…</van-loading>
        <div v-else-if="submitVideos.length" class="video-grid">
          <div v-for="v in submitVideos" :key="v.id" class="mine-card" @click="goMineVideo(v)">
            <div class="mine-cover">
              <img :src="fileUrl(v.coverUrl)" :alt="v.title" />
              <span v-if="v.needVip" class="vip-badge mine-vip">大会员</span>
            </div>
            <div class="mine-info">
              <div class="mine-title">{{ v.title }}</div>
              <div class="mine-meta">{{ formatCount(v.playCount || 0) }}播放</div>
            </div>
            <van-icon name="ellipsis" class="mine-more" @click.stop="openMenu(v)" />
          </div>
          <van-button
            size="small"
            plain
            type="primary"
            color="#FF6699"
            class="manage-btn"
            @click="router.push('/contribution')"
          >去创作中心管理</van-button>
        </div>
        <van-empty v-else description="还没有投稿">
          <van-button round type="primary" color="#FF6699" size="small" @click="router.push('/contribution')">去投稿</van-button>
        </van-empty>
      </van-tab>

      <van-tab title="收藏" name="favorites">
        <van-loading v-if="loadingFavorites" class="page-loading" color="#FF6699">加载中…</van-loading>
        <div v-else-if="favoriteVideos.length" class="video-grid">
          <VideoCard v-for="v in favoriteVideos" :key="v.id" :video="v" />
        </div>
        <van-empty v-else description="还没有收藏" />
      </van-tab>

      <van-tab title="关注" name="follow">
        <van-loading v-if="loadingFollowList" class="page-loading" color="#FF6699">加载中…</van-loading>
        <div v-else-if="followList.length" class="up-list">
          <div v-for="up in followList" :key="up.uid" class="up-item" @click="goUp(up)">
            <img class="up-avatar" :src="fileUrl(up.avatarUrl || up.avatar)" alt="" />
            <div class="up-info">
              <div class="up-name">{{ up.nickName || up.nickname }}</div>
              <div class="up-sign">{{ up.descript || '这个人很懒，什么都没留下' }}</div>
            </div>
            <van-button
              size="mini"
              round
              plain
              type="primary"
              color="#FF6699"
              @click.stop="unfollow(up)"
            >已关注</van-button>
          </div>
        </div>
        <van-empty v-else description="还没有关注任何人" />
      </van-tab>

      <van-tab title="粉丝" name="fans">
        <van-loading v-if="loadingFansList" class="page-loading" color="#FF6699">加载中…</van-loading>
        <div v-else-if="fansList.length" class="up-list">
          <div v-for="up in fansList" :key="up.uid" class="up-item" @click="goUp(up)">
            <img class="up-avatar" :src="fileUrl(up.avatarUrl || up.avatar)" alt="" />
            <div class="up-info">
              <div class="up-name">{{ up.nickName || up.nickname }}</div>
              <div class="up-sign">{{ up.descript || '这个人很懒，什么都没留下' }}</div>
            </div>
          </div>
        </div>
        <van-empty v-else description="还没有粉丝" />
      </van-tab>
    </van-tabs>

    <div class="logout-zone">
      <div class="logout-card">
        <van-button block plain size="small" color="#FF6699" round @click="handleLogout">退出登录</van-button>
      </div>
    </div>

    <!-- 编辑资料 -->
    <van-action-sheet v-model:show="showEditProfile" title="编辑资料" cancel-text="取消">
      <div class="edit-body">
        <div class="edit-avatar-wrap" @click="triggerAvatarUpload">
          <img v-if="editAvatar" :src="editAvatar" alt="" />
          <van-icon v-else name="user-circle-o" size="54" />
          <span class="edit-avatar-tip">点击更换头像</span>
          <input ref="avatarInput" type="file" accept="image/*" hidden @change="handleAvatarUpload" />
        </div>
        <van-cell-group inset>
          <van-field v-model="editForm.nikeName" label="昵称" placeholder="请输入昵称" />
          <van-field v-model="editForm.descript" label="签名" placeholder="介绍一下自己" type="textarea" rows="2" autosize />
        </van-cell-group>
        <van-button
          block
          type="primary"
          color="#FF6699"
          round
          class="save-btn"
          :loading="editSaving"
          @click="saveEditProfile"
        >保存</van-button>
      </div>
    </van-action-sheet>

    <!-- 投稿操作菜单 -->
    <van-action-sheet
      v-model:show="showMenu"
      :actions="menuActions"
      cancel-text="取消"
      @select="onMenuSelect"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { useAuthStore } from '../stores/auth'
import { getClientUserInfo } from '../api/auth'
import { fileUrl } from '../config'
import {
  getFavoriteFolderList, getFavoriteFolderDetail,
  getMyContributions, getFollowList, searchFans,
  unfollowUser, updateUserProfile, deleteMyContribution
} from '../api/video'
import { uploadFile } from '../utils/fileUpload'
import { formatCount } from '../utils/format'
import { handleVideoClick, handleUserClick } from '../utils/video'
import VideoCard from '../components/video/VideoCard.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const user = computed(() => authStore.user)
const avatarUrl = computed(() => fileUrl(user.value?.avatar || user.value?.avatarUrl || ''))

const activeTab = ref('submit')
const offsetTop = computed(() => 48)

const submitVideos = ref([])
const favoriteVideos = ref([])
const followList = ref([])
const fansList = ref([])
const followTotal = ref(0)
const fansTotal = ref(0)

const loadingSubmit = ref(false)
const loadingFavorites = ref(false)
const loadingFollowList = ref(false)
const loadingFansList = ref(false)

const showEditProfile = ref(false)
const editForm = ref({ nikeName: '', descript: '' })
const editAvatar = ref('')
const editSaving = ref(false)
const avatarInput = ref(null)

const showMenu = ref(false)
const menuTarget = ref(null)
const menuActions = [
  { name: '编辑稿件', value: 'edit' },
  { name: '管理选集', value: 'episodes' },
  { name: '删除', value: 'delete', color: '#ee0a24' }
]

const openVip = () => {
  window.dispatchEvent(new CustomEvent('open-vip-dialog'))
}

const loadUserInfo = async () => {
  try {
    const res = await getClientUserInfo()
    authStore.user = res
    localStorage.setItem('frontUser', JSON.stringify(res))
  } catch (e) {
    console.error('获取用户信息失败:', e)
  }
}

const loadSubmissions = async () => {
  loadingSubmit.value = true
  try {
    const res = await getMyContributions({ page: 1, size: 50 })
    submitVideos.value = res?.records || []
  } catch (e) {
    console.error('获取投稿失败:', e)
    submitVideos.value = []
  } finally {
    loadingSubmit.value = false
  }
}

const loadFavorites = async () => {
  loadingFavorites.value = true
  try {
    const folders = await getFavoriteFolderList()
    const list = Array.isArray(folders) ? folders : []
    if (list.length) {
      const detail = await getFavoriteFolderDetail({ favoriteFolderUid: list[0].uid || list[0].favoriteFolderUid, page: 1, size: 20 })
      favoriteVideos.value = detail?.records || detail?.list || []
    } else {
      favoriteVideos.value = []
    }
  } catch (e) {
    console.error('获取收藏失败:', e)
    favoriteVideos.value = []
  } finally {
    loadingFavorites.value = false
  }
}

const loadFollows = async () => {
  loadingFollowList.value = true
  try {
    const res = await getFollowList({ page: 1, size: 50 })
    followList.value = res?.records || []
    followTotal.value = res?.total || followList.value.length
  } catch (e) {
    console.error('获取关注失败:', e)
    followList.value = []
  } finally {
    loadingFollowList.value = false
  }
}

const loadFans = async () => {
  loadingFansList.value = true
  try {
    const res = await searchFans({ page: 1, size: 50 })
    fansList.value = res?.records || []
    fansTotal.value = res?.total || fansList.value.length
  } catch (e) {
    console.error('获取粉丝失败:', e)
    fansList.value = []
  } finally {
    loadingFansList.value = false
  }
}

const switchTab = (name) => {
  if (name === 'submit' && !submitVideos.value.length) loadSubmissions()
  if (name === 'favorites' && !favoriteVideos.value.length) loadFavorites()
  if (name === 'follow' && !followList.value.length) loadFollows()
  if (name === 'fans' && !fansList.value.length) loadFans()
}

const goUp = (up) => handleUserClick(up.uid, router)

const unfollow = async (up) => {
  try {
    await unfollowUser(up.uid)
    followList.value = followList.value.filter(u => u.uid !== up.uid)
    followTotal.value = Math.max(0, followTotal.value - 1)
    showToast('已取消关注')
  } catch (e) {
    showToast(e.message || '操作失败')
  }
}

const goMineVideo = (v) => {
  handleVideoClick({ ...v, videoAvid: v.avid || v.videoUid, episodeAvid: v.episodeAvid || v.currentEpisode?.avid || v.id }, router)
}

const openMenu = (v) => {
  menuTarget.value = v
  showMenu.value = true
}

const onMenuSelect = async (action) => {
  showMenu.value = false
  const v = menuTarget.value
  if (!v) return
  if (action.value === 'edit') {
    router.push({ path: '/contribution', query: { edit: v.avid || v.videoUid } })
  } else if (action.value === 'episodes') {
    router.push(`/contribution/episodes/${v.avid || v.videoUid}`)
  } else if (action.value === 'delete') {
    try {
      await showConfirmDialog({ title: '删除稿件', message: '确定删除该稿件吗？删除后不可恢复。' })
      await deleteMyContribution(v.avid || v.videoUid)
      submitVideos.value = submitVideos.value.filter(x => x.id !== v.id)
      showToast('已删除')
    } catch {}
  }
}

const openEditProfile = () => {
  editForm.value = {
    nikeName: user.value?.nikeName || user.value?.nickname || '',
    descript: user.value?.descript || user.value?.signature || ''
  }
  editAvatar.value = user.value?.avatar || ''
  showEditProfile.value = true
}

const triggerAvatarUpload = () => avatarInput.value?.click()

const handleAvatarUpload = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  try {
    const url = await uploadFile(file, () => {})
    editAvatar.value = url
  } catch {
    showToast('头像上传失败')
  }
}

const saveEditProfile = async () => {
  if (!editForm.value.nikeName.trim()) {
    showToast('请输入昵称')
    return
  }
  editSaving.value = true
  try {
    await updateUserProfile({
      nikeName: editForm.value.nikeName.trim(),
      descript: editForm.value.descript,
      avatar: editAvatar.value
    })
    if (authStore.user) {
      authStore.user.nikeName = editForm.value.nikeName.trim()
      authStore.user.descript = editForm.value.descript
      authStore.user.avatar = editAvatar.value
      localStorage.setItem('frontUser', JSON.stringify(authStore.user))
    }
    showToast('保存成功')
    showEditProfile.value = false
  } catch (e) {
    showToast(e.message || '保存失败')
  } finally {
    editSaving.value = false
  }
}

const handleLogout = async () => {
  try {
    await showConfirmDialog({ title: '退出登录', message: '确定要退出当前账号吗？' })
    authStore.logout()
    showToast('已退出登录')
    router.push('/')
  } catch {}
}

onMounted(async () => {
  if (!authStore.isLoggedIn) {
    router.replace({ path: '/login', query: { redirect: '/profile' } })
    return
  }
  await loadUserInfo()
  const tab = route.query.tab
  if (tab && ['submit', 'favorites', 'follow', 'fans'].includes(tab)) {
    activeTab.value = tab
  }
  switchTab(activeTab.value)
  // 粉丝数预加载
  try {
    const res = await searchFans({ page: 1, size: 1 })
    fansTotal.value = res?.total || 0
  } catch {}
})
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: var(--bg3);
  padding-top: calc(48px + var(--sat));
  padding-bottom: calc(70px + var(--sab));
}

.profile-hero {
  position: relative;
  padding: 18px 16px 16px;
  background: var(--bg1);
}

.profile-hero-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #FF8CB0 0%, #FF6699 60%, #FF9966 100%);
  opacity: 0.12;
}

.profile-user {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
}

.profile-avatar {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: visible;
  flex-shrink: 0;
  cursor: pointer;
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--brand_pink);
}

.profile-vip-tag {
  position: absolute;
  left: 50%;
  bottom: -6px;
  transform: translateX(-50%);
  padding: 1px 6px;
  background: linear-gradient(135deg, #FFB199 0%, #FF6699 100%);
  color: #fff;
  font-size: 9px;
  border-radius: 8px;
  white-space: nowrap;
}

.profile-meta {
  flex: 1;
  min-width: 0;
}

.profile-name {
  font-size: 17px;
  font-weight: 700;
  color: var(--text1);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.profile-sign {
  font-size: 12px;
  color: var(--text3);
  margin-top: 5px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.edit-btn {
  flex-shrink: 0;
  border-color: var(--brand_pink) !important;
  color: var(--brand_pink) !important;
}

.profile-stats {
  position: relative;
  display: flex;
  margin-top: 16px;
}

.stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  cursor: pointer;
}

.stat strong {
  font-size: 16px;
  color: var(--text1);
}

.stat span {
  font-size: 11px;
  color: var(--text3);
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin: 10px 12px;
  padding: 14px 8px;
  background: var(--bg1);
  border-radius: 12px;
}

.quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: var(--text2);
  font-size: 11px;
  cursor: pointer;
}

.quick-item:active {
  color: var(--brand_pink);
}

.page-loading {
  justify-content: center;
  padding: 50px 0;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px 10px;
  padding: 14px 12px;
}

.mine-card {
  position: relative;
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

.mine-cover {
  position: relative;
  aspect-ratio: 16 / 10;
  border-radius: 8px;
  overflow: hidden;
  background: var(--graph_bg_thin);
}

.mine-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mine-vip {
  position: absolute;
  top: 6px;
  right: 6px;
}

.mine-info {
  padding: 6px 2px 0;
}

.mine-title {
  font-size: 13px;
  line-height: 1.4;
  color: var(--text1);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.mine-meta {
  font-size: 11px;
  color: var(--text3);
  margin-top: 4px;
}

.mine-more {
  position: absolute;
  right: 0;
  bottom: 4px;
  padding: 4px;
  color: var(--text3);
}

.manage-btn {
  grid-column: span 2;
}

.up-list {
  padding: 4px 12px 16px;
}

.up-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--line-light);
  cursor: pointer;
}

.up-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  background: var(--graph_bg_thin);
  flex-shrink: 0;
}

.up-info {
  flex: 1;
  min-width: 0;
}

.up-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text1);
}

.up-sign {
  font-size: 12px;
  color: var(--text3);
  margin-top: 3px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.logout-zone {
  /* 与 tab 内容拉开距离，明确它是整页页脚而非某个 tab 的一部分 */
  margin-top: 20px;
  padding: 16px 14px calc(28px + var(--sab));
  background: var(--bg3);
  border-top: 1px solid var(--line_light);
}

.logout-card {
  padding: 14px;
  background: var(--bg1);
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.edit-body {
  padding: 16px 16px calc(24px + var(--sab));
}

.edit-avatar-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  margin-bottom: 16px;
  cursor: pointer;
}

.edit-avatar-wrap img {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
}

.edit-avatar-tip {
  font-size: 11px;
  color: var(--text3);
}

.save-btn {
  margin-top: 18px;
}
</style>
