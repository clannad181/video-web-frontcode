<template>
  <div class="contribution-page">
    <CreatorHeader />
    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          {{ activeMenu === 'submit' ? '投稿视频' : activeMenu === 'contributions' ? '稿件管理' : '数据概览' }}
        </h1>
      </div>

      <div class="contribution-layout">
        <aside class="sidebar-menu">
          <div class="sidebar-top">
            <button class="new-contribution-btn" @click="goSubmit">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              投稿
            </button>
          </div>

          <nav class="sidebar-nav">
            <div class="nav-group">
              <div class="nav-group-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="7" height="7"/>
                  <rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                </svg>
                内容管理
              </div>
              <div class="nav-submenu">
                <a class="nav-subitem" :class="{ active: activeMenu === 'contributions' }" @click.prevent="switchMenu('contributions')">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                  稿件管理
                </a>
              </div>
            </div>

            <div class="nav-group">
              <div class="nav-group-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="8" y1="6" x2="21" y2="6"/>
                  <line x1="8" y1="12" x2="21" y2="12"/>
                  <line x1="8" y1="18" x2="21" y2="18"/>
                  <line x1="3" y1="6" x2="3.01" y2="6"/>
                  <line x1="3" y1="12" x2="3.01" y2="12"/>
                  <line x1="3" y1="18" x2="3.01" y2="18"/>
                </svg>
                数据中心
              </div>
              <div class="nav-submenu">
                <a class="nav-subitem" :class="{ active: activeMenu === 'stats' }" @click.prevent="switchMenu('stats')">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 20V10"/>
                    <path d="M12 20V4"/>
                    <path d="M6 20v-6"/>
                  </svg>
                  数据概览
                </a>
              </div>
            </div>
          </nav>

          <div v-if="activeMenu === 'submit'" class="sidebar-tips">
            <div class="tips-card">
              <div class="tips-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="16" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                投稿须知
              </div>
              <ul class="tips-list">
                <li>视频标题不能为空，最多80个字</li>
                <li>请选择合适的视频分类</li>
                <li>封面图建议尺寸16:9</li>
                <li>支持从视频中截取封面</li>
                <li>连载中可后续添加剧集</li>
                <li>投稿后需审核通过才会发布</li>
              </ul>
            </div>
          </div>
        </aside>

        <div class="contribution-content">
          <ContributionList 
            v-if="activeMenu === 'contributions'"
            ref="listRef"
            :initial-page="route.query.page ? parseInt(route.query.page) : 1"
            :initial-status="route.query.status || ''"
            :initial-search="route.query.search || ''"
            @edit="handleEdit"
            @delete="handleDelete"
            @manage-episodes="handleManageEpisodes"
          />

          <SubmitForm 
            v-if="activeMenu === 'submit'"
            ref="submitFormRef"
            :edit-video-uid="editingVideoUid"
            @cancel-edit="cancelEdit"
            @submitted="onSubmitted"
            @capture-cover="handleCaptureCover"
          />

          <StatsOverview v-if="activeMenu === 'stats'" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import CreatorHeader from '../components/layout/CreatorHeader.vue'
import ContributionList from '../components/contribution/ContributionList.vue'
import SubmitForm from '../components/contribution/SubmitForm.vue'
import StatsOverview from '../components/contribution/StatsOverview.vue'
import { deleteMyContribution } from '../api/video'

const router = useRouter()
const route = useRoute()

const activeMenu = ref('contributions')
const editingVideoUid = ref('')
const listRef = ref(null)
const submitFormRef = ref(null)

const switchMenu = (menu) => {
  activeMenu.value = menu
  editingVideoUid.value = ''
}

const goSubmit = () => {
  editingVideoUid.value = ''
  activeMenu.value = 'submit'
}

const handleEdit = async (item) => {
  editingVideoUid.value = item.videoUid || item.avid
  activeMenu.value = 'submit'
}

const handleDelete = async (item) => {
  try {
    await ElMessageBox.confirm('确定要删除这个投稿吗？删除后无法恢复', '删除确认', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteMyContribution(item.videoUid || item.avid)
    ElMessage.success('删除成功')
    listRef.value?.loadList()
  } catch (e) {
    if (e !== 'cancel') {
      console.error('删除投稿失败:', e)
      ElMessage.error('删除投稿失败')
    }
  }
}

const handleManageEpisodes = (item) => {
  const query = {
    page: route.query.page || 1,
    status: route.query.status || '',
    search: route.query.search || ''
  }
  router.push({ path: `/contribution/episodes/${item.videoUid || item.avid}`, query })
}

const handleCaptureCover = () => {
  submitFormRef.value?.captureCoverFromVideo()
}

const cancelEdit = () => {
  editingVideoUid.value = ''
  activeMenu.value = 'contributions'
}

const onSubmitted = () => {
  editingVideoUid.value = ''
  activeMenu.value = 'contributions'
  listRef.value?.loadList()
}
</script>

<style scoped>
.contribution-page {
  min-height: 100vh;
  background: var(--bg3);
}

.page-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px 32px;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 24px;
  font-weight: 700;
  color: var(--text1);
  margin: 0;
}

.page-title svg {
  color: var(--brand_pink);
}

.contribution-layout {
  display: flex;
  gap: 24px;
}

.sidebar-menu {
  width: 220px;
  flex-shrink: 0;
}

.sidebar-top {
  margin-bottom: 16px;
}

.new-contribution-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, var(--brand_pink) 0%, #ff8cb0 100%);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(255, 102, 153, 0.3);
}

.new-contribution-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 102, 153, 0.4);
}

.sidebar-nav {
  background: var(--bg1);
  border-radius: 12px;
  padding: 12px;
  box-shadow: var(--shadow-sm);
}

.nav-group {
  margin-bottom: 8px;
}

.nav-group:last-child {
  margin-bottom: 0;
}

.nav-group-title {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text2);
}

.nav-submenu {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-subitem {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px 10px 36px;
  font-size: 14px;
  color: var(--text3);
  text-decoration: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-subitem:hover {
  background: var(--bg2);
  color: var(--text1);
}

.nav-subitem.active {
  background: rgba(255, 102, 153, 0.1);
  color: var(--brand_pink);
  font-weight: 500;
}

.sidebar-tips {
  margin-top: 16px;
}

.tips-card {
  background: var(--bg1);
  border-radius: 12px;
  padding: 16px;
  box-shadow: var(--shadow-sm);
}

.tips-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text1);
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--line_light);
}

.tips-title svg {
  color: var(--brand_pink);
}

.tips-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tips-list li {
  position: relative;
  padding: 6px 0 6px 16px;
  font-size: 13px;
  color: var(--text3);
  line-height: 1.5;
}

.tips-list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 12px;
  width: 6px;
  height: 6px;
  background: var(--brand_pink);
  border-radius: 50%;
  opacity: 0.6;
}

.contribution-content {
  flex: 1;
  min-width: 0;
}

@media (max-width: 1200px) {
  .contribution-layout {
    flex-direction: column;
  }
  
  .sidebar-menu {
    width: 100%;
  }
  
  .sidebar-nav {
    display: flex;
    gap: 16px;
  }
  
  .nav-group {
    flex: 1;
    margin-bottom: 0;
  }
}

@media (max-width: 768px) {
  .page-content {
    padding: 16px;
  }
  
  .sidebar-nav {
    flex-direction: column;
  }
}
</style>
