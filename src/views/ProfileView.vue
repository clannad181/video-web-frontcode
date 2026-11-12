<template>
  <div class="profile-page">
    <!-- 头部白卡：用户信息 + 数据 + 快捷入口 -->
    <div class="profile-card">
      <div class="profile-user">
        <div class="profile-avatar">
          <img v-if="avatarUrl" :src="avatarUrl" alt="" />
          <van-icon v-else name="user-circle-o" size="54" />
          <span v-if="user?.isVip" class="profile-vip-tag">大会员</span>
        </div>
        <div class="profile-meta">
          <div class="profile-name">{{ user?.nikeName || user?.nickname || '未登录' }}</div>
          <div class="profile-sign">{{ user?.descript || '这个人很懒，什么都没留下' }}</div>
        </div>
      </div>

      <div class="profile-stats">
        <div class="stat" @click="openSheet('follow')">
          <strong>{{ formatCount(followTotal) }}</strong>
          <span>关注</span>
        </div>
        <div class="stat" @click="openSheet('fans')">
          <strong>{{ formatCount(fansTotal) }}</strong>
          <span>粉丝</span>
        </div>
        <div class="stat stat-vip" @click="openVip">
          <strong>{{ user?.isVip ? '已开通' : '未开通' }}</strong>
          <span>大会员</span>
        </div>
      </div>

      <div class="card-sep"></div>

      <div class="quick-row">
        <div class="quick-item" @click="router.push('/history')">
          <span class="quick-icon"><van-icon name="clock-o" size="20" /></span>
          <span>历史</span>
        </div>
        <div class="quick-item" @click="router.push('/messages')">
          <span class="quick-icon"><van-icon name="bell" size="20" /></span>
          <span>消息</span>
        </div>
        <div class="quick-item" @click="router.push('/contribution')">
          <span class="quick-icon"><van-icon name="add-square" size="20" /></span>
          <span>投稿</span>
        </div>
        <div class="quick-item" @click="router.push('/favorites')">
          <span class="quick-icon"><van-icon name="star-o" size="20" /></span>
          <span>收藏</span>
        </div>
      </div>
    </div>

    <!-- 设置功能菜单 -->
    <div class="settings-card">
      <div class="set-item" @click="openEditProfile">
        <span class="set-icon" style="background: #ffeef4; color: #ff6699">
          <van-icon name="edit" size="18" />
        </span>
        <span class="set-label">个性设置</span>
        <van-icon name="arrow" class="set-arrow" />
      </div>
      <div class="set-item" @click="clearCache">
        <span class="set-icon" style="background: #e8f7ff; color: #00aeec">
          <van-icon name="delete-o" size="18" />
        </span>
        <span class="set-label">清除缓存</span>
        <van-icon name="arrow" class="set-arrow" />
      </div>
      <div class="set-item" @click="showToast('帮助与反馈功能开发中')">
        <span class="set-icon" style="background: #fff4e8; color: #ff976a">
          <van-icon name="chat-o" size="18" />
        </span>
        <span class="set-label">帮助与反馈</span>
        <van-icon name="arrow" class="set-arrow" />
      </div>
      <div class="set-item" @click="showAbout">
        <span class="set-icon" style="background: #e6faf8; color: #00b8a9">
          <van-icon name="info-o" size="18" />
        </span>
        <span class="set-label">关于 VideoHub</span>
        <van-icon name="arrow" class="set-arrow" />
      </div>
      <div class="set-item set-item--danger" @click="handleLogout">
        <span class="set-icon" style="background: #ffecec; color: #ff4d4f">
          <van-icon name="sign" size="18" />
        </span>
        <span class="set-label">退出登录</span>
        <van-icon name="arrow" class="set-arrow" />
      </div>
    </div>

    <!-- 关注 / 粉丝 弹层 -->
    <van-popup
      v-model:show="sheet.show"
      position="bottom"
      round
      class="sheet-popup"
      :style="{ height: '68%' }"
    >
      <div class="sheet-head">
        <span class="sheet-title">{{ sheet.title }}</span>
        <van-icon name="cross" size="18" color="#9499A0" @click="sheet.show = false" />
      </div>

      <div class="sheet-body hide-scrollbar">
        <van-loading
          v-if="sheet.type === 'follow' ? loadingFollowList : loadingFansList"
          class="page-loading"
          color="#FF6699"
        >加载中…</van-loading>
        <template v-else>
          <div v-if="sheetUsers.length" class="up-list">
            <div v-for="up in sheetUsers" :key="up.uid" class="up-item" @click="goUp(up)">
              <img class="up-avatar" :src="fileUrl(up.avatarUrl || up.avatar)" alt="" />
              <div class="up-info">
                <div class="up-name">{{ up.nickName || up.nickname }}</div>
                <div class="up-sign">{{ up.descript || '这个人很懒，什么都没留下' }}</div>
              </div>
              <van-button
                v-if="sheet.type === 'follow'"
                size="mini"
                round
                plain
                type="primary"
                color="#FF6699"
                @click.stop="unfollow(up)"
              >已关注</van-button>
            </div>
          </div>
          <van-empty v-else :description="sheet.type === 'follow' ? '还没有关注任何人' : '还没有粉丝'" />
        </template>
      </div>
    </van-popup>

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
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog, showDialog } from 'vant'
import { useAuthStore } from '../stores/auth'
import { getClientUserInfo } from '../api/auth'
import { fileUrl } from '../config'
import {
  getFollowList, searchFans,
  unfollowUser, updateUserProfile
} from '../api/video'
import { uploadFile } from '../utils/fileUpload'
import { formatCount } from '../utils/format'
import { handleUserClick } from '../utils/video'

const router = useRouter()
const authStore = useAuthStore()

const user = computed(() => authStore.user)
const avatarUrl = computed(() => fileUrl(user.value?.avatar || user.value?.avatarUrl || ''))

const followList = ref([])
const fansList = ref([])
const followTotal = ref(0)
const fansTotal = ref(0)

const loadingFollowList = ref(false)
const loadingFansList = ref(false)

const showEditProfile = ref(false)
const editForm = ref({ nikeName: '', descript: '' })
const editAvatar = ref('')
const editSaving = ref(false)
const avatarInput = ref(null)

/* 关注 / 粉丝 弹层 */
const sheet = reactive({ show: false, type: 'follow', title: '' })
const sheetUsers = computed(() => (sheet.type === 'fans' ? fansList.value : followList.value))

const openSheet = (type) => {
  sheet.type = type
  sheet.title = type === 'follow' ? '我的关注' : '我的粉丝'
  if (type === 'follow' && !followList.value.length) loadFollows()
  if (type === 'fans' && !fansList.value.length) loadFans()
  sheet.show = true
}

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

const clearCache = () => {
  try {
    sessionStorage.clear()
    showToast('缓存已清理')
  } catch {
    showToast('清理失败')
  }
}

const showAbout = () => {
  showDialog({
    title: '关于 VideoHub',
    message: 'VideoHub 移动端 v1.0.0\n一个轻量的视频分享与观看平台'
  }).catch(() => {})
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
  padding-top: calc(var(--header-h) + var(--sat));
  padding-bottom: calc(70px + var(--sab));
}

.profile-card {
  margin: 12px 12px 0;
  padding: 18px 16px 8px;
  background: var(--bg1);
  border-radius: 14px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
}

.profile-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.profile-avatar {
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  overflow: visible;
  flex-shrink: 0;
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
  background: linear-gradient(135deg, #ffb199 0%, #ff6699 100%);
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

.profile-stats {
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

/* 数据行内分隔 */
.stat + .stat {
  border-left: 1px solid var(--line_light);
}

.stat strong {
  font-size: 16px;
  color: var(--text1);
}

.stat span {
  font-size: 11px;
  color: var(--text3);
}

/* 大会员：头部唯一醒目入口 */
.stat-vip strong {
  background: linear-gradient(135deg, #ffb199 0%, #ff6699 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.card-sep {
  height: 1px;
  margin: 14px -16px 0;
  background: var(--line_light);
}

.quick-row {
  display: flex;
  padding: 12px 0 6px;
}

.quick-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: var(--text2);
  font-size: 11px;
  cursor: pointer;
}

.quick-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: var(--brand_pink_thin);
  color: var(--brand_pink);
  transition: transform 0.15s;
}

.quick-item:active .quick-icon {
  transform: scale(0.92);
}

.quick-item:active {
  color: var(--brand_pink);
}

/* ---------- 设置菜单 ---------- */
.settings-card {
  margin: 12px;
  padding: 4px 16px;
  background: var(--bg1);
  border-radius: 14px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
}

.set-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 0;
  font-size: 14px;
  color: var(--text1);
  cursor: pointer;
}

.set-item + .set-item {
  border-top: 1px solid var(--line_light);
}

.set-item:active {
  opacity: 0.7;
}

.set-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 9px;
  flex-shrink: 0;
}

.set-label {
  flex: 1;
  min-width: 0;
}

.set-arrow {
  color: var(--text4);
  font-size: 14px;
}

.set-item--danger .set-label {
  color: #ff4d4f;
}

/* ---------- 弹层 ---------- */
.sheet-popup {
  display: flex;
  flex-direction: column;
}

.sheet-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 10px;
  flex-shrink: 0;
}

.sheet-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text1);
}

.sheet-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 0 16px calc(20px + var(--sab));
}

.page-loading {
  justify-content: center;
  padding: 50px 0;
}

.up-list {
  padding: 4px 0 16px;
}

.up-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--line_light);
  cursor: pointer;
}

.up-item:last-child {
  border-bottom: none;
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

/* ---------- 编辑资料 ---------- */
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
