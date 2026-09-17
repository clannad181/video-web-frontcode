<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">视频管理</h1>
      <p class="page-subtitle">管理平台所有视频内容，支持搜索、筛选、排序和批量操作</p>
    </div>

    <div class="filter-card">
      <div class="filter-grid">
        <div class="filter-item">
          <label class="filter-label">视频ID</label>
          <input v-model="filter.id" class="filter-input" placeholder="输入视频ID" @keyup.enter="onSearch" />
        </div>
        <div class="filter-item">
          <label class="filter-label">视频标题</label>
          <input v-model="filter.title" class="filter-input" placeholder="搜索视频标题" @keyup.enter="onSearch" />
        </div>
        <div class="filter-item">
          <label class="filter-label">分类</label>
          <select v-model="filter.categoryId" class="filter-select">
            <option value="">全部分类</option>
            <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
        <div class="filter-item">
          <label class="filter-label">视频状态</label>
          <select v-model="filter.videoStatus" class="filter-select">
            <option value="">全部</option>
            <option :value="0">草稿</option>
            <option :value="1">待发布</option>
            <option :value="2">已发布</option>
            <option :value="3">已下架</option>
          </select>
        </div>
        <div class="filter-item">
          <label class="filter-label">UP主昵称</label>
          <input v-model="filter.username" class="filter-input" placeholder="输入UP主昵称" @keyup.enter="onSearch" />
        </div>
        <div class="filter-item">
          <label class="filter-label">UID</label>
          <input v-model="filter.userId" class="filter-input" placeholder="输入用户ID" @keyup.enter="onSearch" />
        </div>
        <div class="filter-item">
          <label class="filter-label">连载状态</label>
          <select v-model="filter.serialStatus" class="filter-select">
            <option value="">全部</option>
            <option :value="1">连载中</option>
            <option :value="0">已完结</option>
          </select>
        </div>
        <div class="filter-actions">
          <button class="btn btn-secondary" @click="onReset">重置</button>
          <button class="btn btn-primary" @click="onSearch">搜索</button>
          <button class="btn btn-primary" @click="openAdd">+ 新增视频</button>
        </div>
      </div>
    </div>

    <div class="table-card">
      <div class="table-wrap" v-loading="loading">
        <table class="data-table">
          <thead>
            <tr>
              <th class="col-index">#</th>
              <th class="col-id">视频ID</th>
              <th class="col-cover">封面</th>
              <th class="col-title">标题</th>
              <th class="col-user">UP主</th>
              <th class="col-category">分类</th>
              <th class="col-episodes">集数</th>
              <th class="col-sortable" @click="toggleSort('duration')">总时长<span class="sort-icon"><i class="arrow-up" :class="{ active: sortField === 'duration' && sortOrder === 'asc' }"></i><i class="arrow-down" :class="{ active: sortField === 'duration' && sortOrder === 'desc' }"></i></span></th>
              <th class="col-sortable" @click="toggleSort('viewCount')">播放量<span class="sort-icon"><i class="arrow-up" :class="{ active: sortField === 'viewCount' && sortOrder === 'asc' }"></i><i class="arrow-down" :class="{ active: sortField === 'viewCount' && sortOrder === 'desc' }"></i></span></th>
              <th class="col-sortable" @click="toggleSort('favoriteCount')">收藏<span class="sort-icon"><i class="arrow-up" :class="{ active: sortField === 'favoriteCount' && sortOrder === 'asc' }"></i><i class="arrow-down" :class="{ active: sortField === 'favoriteCount' && sortOrder === 'desc' }"></i></span></th>
              <th class="col-serial">连载</th>
              <th class="col-audit">审核状态</th>
              <th class="col-status">视频状态</th>
              <th class="col-sortable" @click="toggleSort('createTime')">创建时间<span class="sort-icon"><i class="arrow-up" :class="{ active: sortField === 'createTime' && sortOrder === 'asc' }"></i><i class="arrow-down" :class="{ active: sortField === 'createTime' && sortOrder === 'desc' }"></i></span></th>
              <th class="col-action">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="tableData.length === 0 && !loading">
              <td colspan="15" class="empty-cell"><div class="empty-state"><p>暂无数据</p></div></td>
            </tr>
            <tr v-for="(row, index) in tableData" :key="row.id" class="table-row">
              <td class="col-index">{{ (pagination.page - 1) * pagination.pageSize + index + 1 }}</td>
              <td class="col-id mono">{{ row.avid || '-' }}</td>
              <td class="col-cover">
                <img v-if="row.cover" :src="row.cover" class="cover-thumb" @click="previewCover(row.cover)" />
                <div v-else class="cover-empty"><el-icon :size="16"><VideoPlay /></el-icon></div>
              </td>
              <td class="col-title">
                <div class="title-cell" @mouseenter="showTitleTip($event, row.title)" @mouseleave="hideTitleTip">
                  <span class="title-text">{{ row.title }}</span>
                </div>
              </td>
              <td class="col-user">
                <div class="user-cell">
                  <img v-if="row.avatar" :src="row.avatar" class="user-avatar" />
                  <div v-else class="user-avatar avatar-fb">{{ (row.username || '?')[0].toUpperCase() }}</div>
                  <span class="user-name">{{ row.username }}</span>
                </div>
              </td>
              <td class="col-category">{{ row.categoryName || '-' }}</td>
              <td class="col-episodes">{{ row.episodeCount || '-' }}</td>
              <td class="col-data mono">{{ formatDuration(row.duration) }}</td>
              <td class="col-data mono">{{ formatNumber(row.viewCount) }}</td>
              <td class="col-data mono">{{ formatNumber(row.favoriteCount) }}</td>
              <td class="col-serial"><span class="badge" :class="row.serialStatus === 1 ? 'badge-green' : 'badge-gray'">{{ row.serialStatus === 1 ? '连载中' : '已完结' }}</span></td>
              <td class="col-audit"><span class="badge" :class="auditBadgeCls(row.auditStatus)">{{ auditLbl(row.auditStatus) }}</span></td>
              <td class="col-status"><span class="badge" :class="statusBadgeCls(row.videoStatus)">{{ statusLbl(row.videoStatus) }}</span></td>
              <td class="col-data mono">{{ row.createTime }}</td>
              <td class="col-action">
                <div class="action-group">
                  <button class="act-btn act-blue" @click="openDetail(row)">详情</button>
                  <button class="act-btn act-amber" @click="openEdit(row)">编辑</button>
                  <button class="act-btn act-green" @click="openEpisode(row)">剧集</button>
                  <button class="act-btn act-red" @click="handleDelete(row)">删除</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pagination">
        <div class="page-info">共 {{ pagination.total }} 个视频</div>
        <div class="page-btns">
          <button class="pg-btn" :disabled="pagination.page <= 1" @click="goPage(pagination.page - 1)">&#8249;</button>
          <template v-for="p in visiblePages" :key="p">
            <span v-if="p === '...'" class="pg-ellipsis">...</span>
            <button v-else class="pg-btn" :class="{ active: p === pagination.page }" @click="goPage(p)">{{ p }}</button>
          </template>
          <button class="pg-btn" :disabled="pagination.page >= totalPages" @click="goPage(pagination.page + 1)">&#8250;</button>
        </div>
        <div class="page-size">每页 <select v-model.number="pagination.pageSize" class="size-sel" @change="onPageSizeChange"><option :value="10">10</option><option :value="20">20</option><option :value="50">50</option></select> 条</div>
      </div>
    </div>

    <!-- Detail Modal -->
    <teleport to="body">
      <transition name="modal-fade">
        <div v-if="detailVisible" class="modal-overlay" @click.self="detailVisible = false">
          <div class="modal-card modal-wide" @click.stop>
            <div class="modal-header"><h3>视频详情</h3><button class="modal-close" @click="detailVisible = false">&times;</button></div>
            <div class="modal-body" v-loading="detailLoading">
              <div class="detail-layout" v-if="detailData">
                <div class="detail-left">
                  <div class="player-box">
                    <DPlayer v-if="currentPlayUrl" :src="currentPlayUrl" :title="detailData.title" :poster="detailData.cover" height="100%" />
                    <div v-else class="player-empty"><el-icon :size="48" color="#555"><VideoPlay /></el-icon><p>暂无播放源</p></div>
                  </div>
                  <div class="detail-desc"><h4>简介</h4><p>{{ detailData.description || '暂无简介' }}</p></div>
                  <div class="detail-tags" v-if="detailData.tags?.length"><span v-for="(tag, i) in detailData.tags" :key="i" class="tag-pill">{{ tag }}</span></div>
                  <div class="detail-eps" v-if="detailData.episodes?.length > 1">
                    <h4>剧集</h4>
                    <div class="ep-pills"><button v-for="(ep, i) in detailData.episodes" :key="ep.id || i" class="ep-pill" :class="{ active: detailActiveEp === i }" @click="detailActiveEp = i">{{ ep.title || '第' + (i+1) + '集' }}</button></div>
                  </div>
                </div>
                <div class="detail-right">
                  <div class="detail-title-row"><span class="detail-vtitle">{{ detailData.title }}</span><span class="badge" :class="auditBadgeCls(detailData.auditStatus)">{{ auditLbl(detailData.auditStatus) }}</span></div>
                  <div class="detail-user">
                    <img v-if="detailData.avatar" :src="detailData.avatar" class="user-avatar" />
                    <div v-else class="user-avatar avatar-fb">{{ (detailData.username || '?')[0].toUpperCase() }}</div>
                    <div><div class="user-name">{{ detailData.username }}</div><div class="user-uid">UID: {{ detailData.userId }}</div></div>
                  </div>
                  <div class="info-grid">
                    <div class="info-item"><span class="il">分类</span><span class="iv">{{ detailData.categoryName || '-' }}</span></div>
                    <div class="info-item"><span class="il">集数</span><span class="iv">{{ detailData.episodes?.length || '-' }}</span></div>
                    <div class="info-item"><span class="il">总时长</span><span class="iv mono">{{ formatDuration(detailData.duration) }}</span></div>
                    <div class="info-item"><span class="il">播放</span><span class="iv mono">{{ formatNumber(curEpData?.viewCount ?? detailData.viewCount) }}</span></div>
                    <div class="info-item"><span class="il">收藏</span><span class="iv mono">{{ formatNumber(curEpData?.favoriteCount ?? detailData.favoriteCount) }}</span></div>
                    <div class="info-item"><span class="il">点赞</span><span class="iv mono">{{ formatNumber(curEpData?.likeCount ?? detailData.likeCount) }}</span></div>
                    <div class="info-item"><span class="il">投币</span><span class="iv mono">{{ formatNumber(curEpData?.coinCount ?? detailData.coinCount) }}</span></div>
                    <div class="info-item"><span class="il">观看人数</span><span class="iv mono">{{ formatNumber(curEpData?.viewCount ?? detailData.viewCount) }}</span></div>
                  </div>
                  <div class="info-item full"><span class="il">创建时间</span><span class="iv">{{ detailData.createTime }}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- Edit/Add Modal -->
    <teleport to="body">
      <transition name="modal-fade">
        <div v-if="editVisible" class="modal-overlay" @click.self="closeEdit">
          <div class="modal-card modal-wide" @click.stop>
            <div class="modal-header"><h3>{{ isEditing ? '编辑视频' : '新增视频' }}</h3><button class="modal-close" @click="closeEdit">&times;</button></div>
            <div class="modal-body">
              <div class="form-grid">
                <div class="fg full"><label class="fl required">视频标题</label><input v-model="editForm.title" class="fi" placeholder="请输入视频标题" maxlength="80" /></div>
                <div class="fg"><label class="fl required">分类</label><select v-model="editForm.categoryId" class="fs"><option value="">请选择分类</option><option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option></select></div>
                <div class="fg">
                  <label class="fl">封面</label>
                  <div class="cover-upload" @click="$refs.coverInput.click()">
                    <input ref="coverInput" type="file" accept="image/*" style="display:none" @change="onCoverChange" />
                    <img v-if="editForm.coverUrl" :src="editForm.coverUrl" class="cover-preview" />
                    <div v-else class="cover-ph"><el-icon :size="24"><Plus /></el-icon><span>上传封面</span></div>
                  </div>
                  <span class="form-tip">建议 16:9 比例，最大 10MB</span>
                </div>
                <div class="fg">
                  <label class="fl">连载状态</label>
                  <div class="toggle-wrap" @click="editForm.isOngoing = editForm.isOngoing ? 0 : 1">
                    <div class="toggle-track" :class="{ active: editForm.isOngoing }"><div class="toggle-thumb"></div></div>
                    <span class="toggle-text">{{ editForm.isOngoing ? '连载中' : '已完结' }}</span>
                  </div>
                </div>
                <div class="fg full">
                  <label class="fl">标签</label>
                  <div class="tags-wrap">
                    <span v-for="(tag, i) in editForm.tags" :key="i" class="tag-pill">{{ tag }}<button class="tag-rm" @click="editForm.tags.splice(i, 1)">&times;</button></span>
                    <input v-model="tagInput" class="tag-input" placeholder="回车添加" @keyup.enter="addTag" />
                  </div>
                </div>
                <div class="fg full"><label class="fl">简介</label><textarea v-model="editForm.description" class="fta" rows="3" placeholder="选填"></textarea></div>
              </div>
              <div class="ep-section">
                <div class="ep-header"><h4>剧集列表</h4><button class="btn btn-sm btn-primary" @click="addEditEpisode">+ 添加剧集</button></div>
                <div v-if="editForm.episodes.length === 0" class="ep-empty">暂无剧集</div>
                <div v-for="(ep, i) in editForm.episodes" :key="i" class="ep-card">
                  <div class="ep-card-top"><span class="ep-num">第 {{ ep.episodeNumber || editForm.episodes.length - i }} 集</span><button class="ep-rm" @click="editForm.episodes.splice(i, 1)">&times;</button></div>
                  <input v-model="ep.title" class="fi" placeholder="剧集标题" />
                  <div class="ep-upload">
                    <input :ref="el => { epRefs[i] = el }" type="file" accept="video/*" style="display:none" @change="e => onEpFileChange(e, i)" />
                    <button class="btn btn-sm btn-outline" @click="epRefs[i]?.click()">选择视频文件</button>
                    <span v-if="ep.fileName" class="file-name">{{ ep.fileName }}</span>
                    <span v-if="ep.duration" class="ep-dur">时长: {{ formatDuration(ep.duration) }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="closeEdit">取消</button>
              <button class="btn btn-secondary" @click="onSave(0)">存草稿</button>
              <button class="btn btn-primary" @click="onSave(1)">确定</button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- Episode Management Modal -->
    <teleport to="body">
      <transition name="modal-fade">
        <div v-if="episodeVisible" class="modal-overlay" @click.self="episodeVisible = false">
          <div class="modal-card" style="width:700px" @click.stop>
            <div class="modal-header"><h3>剧集 - {{ episodeVideo?.title }}</h3><button class="modal-close" @click="episodeVisible = false">&times;</button></div>
            <div class="modal-body">
              <div class="ep-section">
                <div class="ep-header"><h4>剧集列表</h4><button v-if="episodeVideo?.serialStatus === 1" class="btn btn-sm btn-primary" @click="addEpManage">+ 添加剧集</button></div>
                <div v-if="episodeList.length === 0" class="ep-empty">暂无剧集</div>
                <div v-for="(ep, i) in episodeList" :key="i" class="ep-card">
                  <div class="ep-card-top"><span class="ep-num">第 {{ ep.episodeNumber || episodeList.length - i }} 集</span><button class="ep-rm" @click="episodeList.splice(i, 1)">&times;</button></div>
                  <input v-model="ep.title" class="fi" placeholder="剧集标题" />
                  <div class="ep-upload">
                    <input :ref="el => { emRefs[i] = el }" type="file" accept="video/*" style="display:none" @change="e => onEmFileChange(e, i)" />
                    <button class="btn btn-sm btn-outline" @click="emRefs[i]?.click()">选择视频文件</button>
                    <span v-if="ep.fileName" class="file-name">{{ ep.fileName }}</span>
                    <span v-if="ep.duration" class="ep-dur">时长: {{ formatDuration(ep.duration) }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer"><button class="btn btn-secondary" @click="episodeVisible = false">取消</button><button class="btn btn-primary" @click="onSaveEpisodes">保存</button></div>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- Cover Preview -->
    <teleport to="body">
      <transition name="modal-fade">
        <div v-if="coverPreviewVisible" class="cover-overlay" @click="coverPreviewVisible = false">
          <button class="cover-close" @click="coverPreviewVisible = false">&times;</button>
          <img :src="coverPreviewUrl" class="cover-lg" @click.stop />
        </div>
      </transition>
    </teleport>

    <!-- Title Tooltip -->
    <teleport to="body">
      <div v-if="titleTip.visible" class="title-tooltip" :style="{ left: titleTip.x + 'px', top: titleTip.y + 'px' }">{{ titleTip.text }}</div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { VideoPlay, Plus } from '@element-plus/icons-vue'
import { formatDuration, formatNumber } from '@/utils/format'
import { getVideoList, getVideoDetail, createVideo, updateVideo, deleteVideo, saveEpisodes } from '@/api/video'
import { getCategoryList } from '@/api/category'
import { uploadFile } from '@/utils/upload'
import DPlayer from '@/components/DPlayer.vue'

const route = useRoute()
const loading = ref(false)
const tableData = ref([])
const categories = ref([])

const filter = reactive({ id: '', title: '', categoryId: '', videoStatus: '', username: '', userId: '', serialStatus: '' })
const sortField = ref('')
const sortOrder = ref('')
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

const totalPages = computed(() => Math.ceil(pagination.total / pagination.pageSize) || 1)
const visiblePages = computed(() => {
  const t = totalPages.value, c = pagination.page
  if (t <= 7) return Array.from({ length: t }, (_, i) => i + 1)
  const pages = [1]
  if (c > 3) pages.push('...')
  for (let i = Math.max(2, c - 1); i <= Math.min(t - 1, c + 1); i++) pages.push(i)
  if (c < t - 2) pages.push('...')
  pages.push(t)
  return pages
})

const auditLbl = (s) => ['未审核', '部分审核', '审核通过'][s] || '未知'
const auditBadgeCls = (s) => ['badge-amber', 'badge-blue', 'badge-green'][s] || ''
const statusLbl = (s) => ['草稿', '待发布', '已发布', '已下架'][s] || '未知'
const statusBadgeCls = (s) => ['badge-gray', 'badge-amber', 'badge-green', 'badge-red'][s] || ''

const buildParams = () => {
  const p = { current: pagination.page, size: pagination.pageSize }
  if (filter.id) p.id = filter.id
  if (filter.title) p.title = filter.title
  if (filter.categoryId) p.categoryId = filter.categoryId
  if (filter.videoStatus !== '') p.videoStatus = filter.videoStatus
  if (filter.username) p.nickName = filter.username
  if (filter.userId) p.uid = filter.userId
  if (filter.serialStatus !== '') p.isOngoing = filter.serialStatus === 1
  if (sortField.value) { p.field = sortField.value; p.descOrAsc = sortOrder.value }
  if (route.query.videoId) p.id = route.query.videoId
  return p
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getVideoList(buildParams())
    const records = res.data.records || res.data.list || []
    tableData.value = records.map(r => ({
      ...r,
      cover: r.coverUrl,
      username: r.nickName,
      avatar: r.avatarUrl,
      duration: r.totalDuration,
      viewCount: r.playCount,
      auditStatus: r.reviewStatus,
      serialStatus: r.isOngoing ? 1 : 0
    }))
    pagination.total = res.data.total || 0
  } catch (e) { console.error(e) } finally { loading.value = false }
}

const onSearch = () => { pagination.page = 1; fetchData() }
const onReset = () => {
  Object.assign(filter, { id: '', title: '', categoryId: '', videoStatus: '', username: '', userId: '', serialStatus: '' })
  sortField.value = ''; sortOrder.value = ''
  onSearch()
}
const toggleSort = (field) => {
  if (sortField.value !== field) { sortField.value = field; sortOrder.value = 'desc' }
  else if (sortOrder.value === 'desc') { sortOrder.value = 'asc' }
  else { sortField.value = ''; sortOrder.value = '' }
  onSearch()
}
const goPage = (p) => { if (p >= 1 && p <= totalPages.value) { pagination.page = p; fetchData() } }
const onPageSizeChange = () => { pagination.page = 1; fetchData() }

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除视频「${row.title}」吗？`, '删除确认', { type: 'warning' })
    .then(async () => { await deleteVideo(row.id); ElMessage.success('删除成功'); fetchData() }).catch(() => {})
}

const detailVisible = ref(false)
const detailLoading = ref(false)
const detailData = ref(null)
const detailActiveEp = ref(0)
const currentPlayUrl = computed(() => {
  if (!detailData.value) return ''
  const eps = detailData.value.episodes
  if (eps?.length) return eps[detailActiveEp.value]?.playUrl || eps[detailActiveEp.value]?.url || detailData.value.videoUrl || ''
  return detailData.value.videoUrl || ''
})
const curEpData = computed(() => detailData.value?.episodes?.[detailActiveEp.value] || null)

const openDetail = async (row) => {
  detailVisible.value = true; detailLoading.value = true; detailActiveEp.value = 0
  try {
    const res = await getVideoDetail(row.id)
    const d = res.data
    d.episodes = (d.episodes || []).sort((a, b) => (a.sortOrder ?? a.id) - (b.sortOrder ?? b.id))
    detailData.value = d
  } catch (e) { console.error(e) } finally { detailLoading.value = false }
}

const editVisible = ref(false)
const isEditing = ref(false)
const editForm = reactive({ title: '', categoryId: '', coverUrl: '', description: '', isOngoing: 0, tags: [], episodes: [] })
const tagInput = ref('')
const epRefs = ref({})

const resetEditForm = () => {
  Object.assign(editForm, { title: '', categoryId: '', coverUrl: '', description: '', isOngoing: 0, tags: [], episodes: [] })
  tagInput.value = ''
}

const openAdd = () => { isEditing.value = false; resetEditForm(); editVisible.value = true }
const openEdit = async (row) => {
  isEditing.value = true; resetEditForm()
  try {
    const res = await getVideoDetail(row.id)
    const d = res.data
    Object.assign(editForm, {
      title: d.title, categoryId: d.categoryId, coverUrl: d.cover || '',
      description: d.description || '', isOngoing: d.serialStatus || 0,
      tags: d.tags || [],
      episodes: (d.episodes || []).map(e => ({ id: e.id, episodeNumber: e.episodeNumber, title: e.title, duration: e.duration, playUrl: e.playUrl || '', fileName: '' }))
    })
  } catch (e) { console.error(e) }
  editVisible.value = true
}
const closeEdit = () => { editVisible.value = false }

const addTag = () => {
  const v = tagInput.value.trim()
  if (v && !editForm.tags.includes(v)) editForm.tags.push(v)
  tagInput.value = ''
}
const addEditEpisode = () => {
  const max = editForm.episodes.reduce((m, e) => Math.max(m, e.episodeNumber || 0), 0)
  editForm.episodes.push({ episodeNumber: max + 1, title: '', duration: 0, playUrl: '', fileName: '' })
}
const onCoverChange = async (e) => {
  const file = e.target.files?.[0]; if (!file) return
  try { const r = await uploadFile(file, { category: 'image' }); editForm.coverUrl = r.url; ElMessage.success('封面上传成功') } catch (err) { ElMessage.error(err.message || '上传失败') }
}
const onEpFileChange = async (e, i) => {
  const file = e.target.files?.[0]; if (!file) return
  const ep = editForm.episodes[i]; ep.fileName = file.name
  try { const r = await uploadFile(file, { category: 'video' }); ep.playUrl = r.url; ep.duration = r.duration || 0; ElMessage.success('视频上传成功') } catch (err) { ep.fileName = ''; ElMessage.error(err.message || '上传失败') }
}
const onSave = async (videoStatus) => {
  if (!editForm.title) return ElMessage.warning('请填写视频标题')
  if (!editForm.categoryId) return ElMessage.warning('请选择分类')
  const payload = {
    title: editForm.title, categoryId: editForm.categoryId, coverUrl: editForm.coverUrl,
    description: editForm.description, isOngoing: editForm.isOngoing, videoStatus,
    tags: editForm.tags,
    episodes: editForm.episodes.map((e, i) => ({ id: e.id, episodeNumber: e.episodeNumber || editForm.episodes.length - i, title: e.title, duration: e.duration, playUrl: e.playUrl, sort: i }))
  }
  try {
    if (isEditing.value) { await updateVideo(payload); ElMessage.success('更新成功') }
    else { await createVideo(payload); ElMessage.success(videoStatus === 0 ? '草稿保存成功' : '保存成功') }
    editVisible.value = false; fetchData()
  } catch (e) { ElMessage.error(e.message || '保存失败') }
}

const episodeVisible = ref(false)
const episodeVideo = ref(null)
const episodeList = ref([])
const emRefs = ref({})

const openEpisode = async (row) => {
  episodeVideo.value = row
  try {
    const res = await getVideoDetail(row.id)
    episodeList.value = (res.data.episodes || [])
      .sort((a, b) => (b.episodeNumber || b.sort || 0) - (a.episodeNumber || a.sort || 0))
      .map(e => ({ id: e.id, episodeNumber: e.episodeNumber, title: e.title, duration: e.duration, playUrl: e.playUrl || '', fileName: '' }))
  } catch (e) { episodeList.value = [] }
  episodeVisible.value = true
}
const addEpManage = () => {
  const max = episodeList.value.reduce((m, e) => Math.max(m, e.episodeNumber || 0), 0)
  episodeList.value.unshift({ episodeNumber: max + 1, title: '', duration: 0, playUrl: '', fileName: '' })
}
const onEmFileChange = async (e, i) => {
  const file = e.target.files?.[0]; if (!file) return
  const ep = episodeList.value[i]; ep.fileName = file.name
  try { const r = await uploadFile(file, { category: 'video' }); ep.playUrl = r.url; ep.duration = r.duration || 0 } catch (err) { ep.fileName = '' }
}
const onSaveEpisodes = async () => {
  try {
    await saveEpisodes({
      videoId: episodeVideo.value.id,
      episodes: episodeList.value.map((e, i) => ({ id: e.id, episodeNumber: e.episodeNumber, title: e.title, duration: e.duration, playUrl: e.playUrl, sort: i }))
    })
    ElMessage.success('剧集保存成功'); episodeVisible.value = false; fetchData()
  } catch (e) { ElMessage.error(e.message || '保存失败') }
}

const coverPreviewVisible = ref(false)
const coverPreviewUrl = ref('')
const previewCover = (url) => { if (url) { coverPreviewUrl.value = url; coverPreviewVisible.value = true } }

const titleTip = reactive({ visible: false, text: '', x: 0, y: 0 })
let titleTipTimer = null
const showTitleTip = (e, text) => {
  clearTimeout(titleTipTimer)
  const rect = e.target.getBoundingClientRect()
  titleTip.x = rect.left
  titleTip.y = rect.bottom + 6
  titleTip.text = text
  titleTip.visible = true
}
const hideTitleTip = () => {
  titleTipTimer = setTimeout(() => { titleTip.visible = false }, 100)
}

onMounted(async () => {
  try { const res = await getCategoryList(); categories.value = res.data.list || [] } catch (e) { console.error('分类加载失败', e) }
  if (route.query.videoId) filter.id = route.query.videoId
  fetchData()
})
</script>

<style lang="scss" scoped>
.page-container { padding: 0; }
.page-header { margin-bottom: 20px; }
.page-title { font-size: 22px; font-weight: 700; color: var(--el-text-color-primary, #303133); margin: 0 0 4px; }
.page-subtitle { font-size: 13px; color: var(--el-text-color-secondary, #909399); margin: 0; }

.filter-card { background: var(--el-bg-color, #fff); border-radius: 12px; padding: 20px; margin-bottom: 16px; border: 1px solid var(--el-border-color-lighter, #e4e7ed); }
.filter-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 16px; }
.filter-item { display: flex; flex-direction: column; gap: 6px; }
.filter-label { font-size: 12px; color: var(--el-text-color-secondary, #909399); font-weight: 500; }
.filter-input, .filter-select { height: 36px; border-radius: 8px; border: 2px solid transparent; padding: 0 12px; font-size: 13px; background: var(--el-fill-color-light, #f5f7fa); outline: none; transition: all 0.2s; color: var(--el-text-color-regular, #303133); &:focus { border-color: var(--el-color-primary, #fb7299); background: #fff; } }
.filter-select { cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23909399' d='M6 8L1 3h10z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 10px center; padding-right: 28px; }
.filter-actions { display: flex; align-items: flex-end; gap: 8px; justify-content: flex-end; }

.btn { height: 36px; padding: 0 20px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; border: 1px solid transparent; transition: all 0.2s; display: inline-flex; align-items: center; gap: 4px;
  &.btn-primary { background: var(--el-color-primary, #fb7299); color: #fff; border-color: var(--el-color-primary, #fb7299); &:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(251,114,153,0.35); } }
  &.btn-secondary { background: var(--el-fill-color-light, #f5f7fa); color: var(--el-text-color-regular, #303133); border-color: var(--el-border-color, #dcdfe6); &:hover { background: var(--el-fill-color, #ebedf0); } }
  &.btn-outline { background: transparent; color: var(--el-color-primary, #fb7299); border-color: var(--el-color-primary, #fb7299); &:hover { background: rgba(251,114,153,0.05); } }
  &.btn-sm { height: 30px; padding: 0 14px; font-size: 12px; }
}

.table-card { background: var(--el-bg-color, #fff); border-radius: 12px; border: 1px solid var(--el-border-color-lighter, #e4e7ed); overflow: hidden; }
.table-wrap { overflow-x: auto; background: var(--el-bg-color, #fff); }
.data-table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 13px; min-width: 1500px;
  th { padding: 12px 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--el-text-color-secondary, #909399); background: var(--el-fill-color-lighter, #fafafa); font-weight: 600; white-space: nowrap; border-bottom: 1px solid var(--el-border-color-lighter, #e4e7ed); user-select: none; position: sticky; top: 0; z-index: 1; }
  td { padding: 12px 12px; border-bottom: 1px solid var(--el-border-color-lighter, #f2f3f5); vertical-align: middle; background: var(--el-bg-color, #fff); }
  .table-row:hover td { background: var(--el-fill-color-lighter, #fafafa); }
  .col-index { width: 50px; text-align: center; white-space: nowrap; }
  .col-id { width: 130px; text-align: center; white-space: nowrap; }
  .col-cover { width: 140px; text-align: center; }
  .col-title { min-width: 260px; }
  .col-user { width: 180px; white-space: nowrap; }
  .col-category { width: 90px; text-align: center; white-space: nowrap; }
  .col-episodes { width: 70px; text-align: center; white-space: nowrap; }
  .col-data { width: 100px; text-align: center; white-space: nowrap; }
  .col-serial { width: 90px; text-align: center; white-space: nowrap; }
  .col-audit { width: 100px; text-align: center; white-space: nowrap; }
  .col-status { width: 100px; text-align: center; white-space: nowrap; }
  .col-action { width: 200px; text-align: center; white-space: nowrap; position: sticky; right: 0; z-index: 3; background: var(--el-bg-color, #fff); box-shadow: -2px 0 6px rgba(0,0,0,0.06); }
  .table-row:hover .col-action { background: var(--el-fill-color-lighter, #fafafa); }
  .col-sortable { cursor: pointer; &:hover { color: var(--el-color-primary, #fb7299); } }
}

.mono { font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 12px; }
.cover-thumb { width: 120px; height: 68px; border-radius: 6px; object-fit: contain; cursor: pointer; transition: transform 0.2s; display: block; &:hover { transform: scale(1.05); } }
.cover-empty { width: 120px; height: 68px; border-radius: 6px; background: var(--el-fill-color-light, #f5f7fa); display: flex; align-items: center; justify-content: center; color: #c0c4cc; flex-shrink: 0; }
.title-cell { max-width: 260px; }
.title-text { font-weight: 500; color: var(--el-text-color-primary, #303133); display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; cursor: default; }
.user-cell { display: flex; align-items: center; gap: 10px; }
.user-avatar { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; }
.avatar-fb { width: 36px; height: 36px; border-radius: 50%; background: var(--el-color-primary-light-9, #fce4ec); color: var(--el-color-primary, #fb7299); display: inline-flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; flex-shrink: 0; }
.user-name { font-size: 13px; color: var(--el-text-color-regular, #303133); }

.badge { display: inline-block; padding: 2px 10px; border-radius: 100px; font-size: 11px; font-weight: 500; white-space: nowrap;
  &.badge-green { color: #4caf50; background: rgba(76,175,80,0.1); }
  &.badge-blue { color: #409eff; background: rgba(64,158,255,0.1); }
  &.badge-amber { color: #e6a23c; background: rgba(230,162,60,0.1); }
  &.badge-red { color: #f56c6c; background: rgba(245,108,108,0.1); }
  &.badge-gray { color: #909399; background: rgba(144,147,153,0.1); }
}

.sort-icon { display: inline-flex; flex-direction: column; margin-left: 4px; vertical-align: middle; gap: 1px;
  i { display: block; width: 0; height: 0; border-left: 4px solid transparent; border-right: 4px solid transparent; opacity: 0.3;
    &.arrow-up { border-bottom: 5px solid currentColor; &.active { opacity: 1; } }
    &.arrow-down { border-top: 5px solid currentColor; &.active { opacity: 1; } }
  }
}

.action-group { display: flex; gap: 6px; justify-content: center; white-space: nowrap; }
.act-btn { padding: 3px 10px; border-radius: 6px; font-size: 12px; font-weight: 500; cursor: pointer; border: none; transition: all 0.2s;
  &.act-blue { color: #00a1d6; background: rgba(0,161,214,0.1); &:hover { color: #fff; background: #00a1d6; } }
  &.act-amber { color: #e6a23c; background: rgba(230,162,60,0.1); &:hover { color: #fff; background: #e6a23c; } }
  &.act-green { color: #67c23a; background: rgba(103,194,58,0.1); &:hover { color: #fff; background: #67c23a; } }
  &.act-red { color: #f56c6c; background: rgba(245,108,108,0.1); &:hover { color: #fff; background: #f56c6c; } }
}

.pagination { display: flex; align-items: center; justify-content: space-between; padding: 16px 0; }
.page-info { font-size: 13px; color: var(--el-text-color-secondary, #909399); }
.page-btns { display: flex; align-items: center; gap: 4px; }
.pg-btn { width: 32px; height: 32px; border-radius: 6px; border: 1px solid var(--el-border-color, #dcdfe6); background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 13px; transition: all 0.2s; &:hover:not(:disabled) { border-color: var(--el-color-primary, #fb7299); color: var(--el-color-primary, #fb7299); } &:disabled { opacity: 0.4; cursor: not-allowed; } &.active { background: var(--el-color-primary, #fb7299); color: #fff; border-color: var(--el-color-primary, #fb7299); } }
.pg-ellipsis { width: 32px; text-align: center; color: var(--el-text-color-secondary, #909399); }
.page-size { font-size: 13px; color: var(--el-text-color-secondary, #909399); display: flex; align-items: center; gap: 6px; }
.size-sel { height: 32px; border-radius: 6px; border: 1px solid var(--el-border-color, #dcdfe6); padding: 0 8px; font-size: 13px; background: #fff; cursor: pointer; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); z-index: 2000; display: flex; align-items: center; justify-content: center; }
.modal-card { background: var(--el-bg-color, #fff); border-radius: 12px; width: 700px; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
.modal-wide { width: 900px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--el-border-color-lighter, #e4e7ed);
  h3 { margin: 0; font-size: 16px; font-weight: 600; }
}
.modal-close { background: none; border: none; font-size: 22px; cursor: pointer; color: var(--el-text-color-secondary, #909399); padding: 4px 8px; border-radius: 4px; &:hover { background: var(--el-fill-color-light, #f5f7fa); } }
.modal-body { padding: 24px; overflow-y: auto; flex: 1; }
.modal-footer { padding: 16px 24px; border-top: 1px solid var(--el-border-color-lighter, #e4e7ed); display: flex; justify-content: flex-end; gap: 8px; }

.detail-layout { display: flex; gap: 24px; }
.detail-left { flex: 1; min-width: 0; }
.detail-right { width: 300px; flex-shrink: 0; }
.player-box { width: 100%; aspect-ratio: 16/9; border-radius: 8px; overflow: hidden; background: #000; margin-bottom: 16px; }
.player-empty { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; color: #555; p { margin: 0; font-size: 13px; } }
.detail-desc { margin-bottom: 12px; h4 { font-size: 13px; color: var(--el-text-color-secondary, #909399); margin: 0 0 6px; } p { font-size: 13px; color: var(--el-text-color-regular, #303133); margin: 0; line-height: 1.6; } }
.detail-tags { margin-bottom: 12px; display: flex; flex-wrap: wrap; gap: 6px; }
.tag-pill { display: inline-flex; align-items: center; gap: 4px; padding: 2px 12px; border-radius: 100px; font-size: 12px; background: var(--el-fill-color-light, #f5f7fa); border: 1px solid var(--el-border-color-lighter, #e4e7ed); }
.detail-eps { h4 { font-size: 13px; color: var(--el-text-color-secondary, #909399); margin: 0 0 8px; } }
.ep-pills { display: flex; flex-wrap: wrap; gap: 6px; }
.ep-pill { padding: 4px 14px; border-radius: 6px; border: 1px solid var(--el-border-color, #dcdfe6); background: #fff; cursor: pointer; font-size: 12px; transition: all 0.2s; &:hover { border-color: var(--el-color-primary, #fb7299); } &.active { background: var(--el-color-primary, #fb7299); color: #fff; border-color: var(--el-color-primary, #fb7299); } }
.detail-title-row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.detail-vtitle { font-size: 16px; font-weight: 600; }
.detail-user { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
.user-uid { font-size: 12px; color: var(--el-text-color-secondary, #909399); }
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px; }
.info-item { display: flex; flex-direction: column; gap: 2px; padding: 8px 12px; background: var(--el-fill-color-lighter, #fafafa); border-radius: 8px; &.full { grid-column: 1 / -1; } }
.il { font-size: 11px; color: var(--el-text-color-secondary, #909399); }
.iv { font-size: 13px; color: var(--el-text-color-primary, #303133); font-weight: 500; }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
.fg { display: flex; flex-direction: column; gap: 6px; &.full { grid-column: 1 / -1; } }
.fl { font-size: 12px; color: var(--el-text-color-secondary, #909399); font-weight: 500; &.required::before { content: '*'; color: #f56c6c; margin-right: 4px; } }
.fi { height: 36px; border-radius: 8px; border: 2px solid transparent; padding: 0 12px; font-size: 13px; background: var(--el-fill-color-light, #f5f7fa); outline: none; transition: all 0.2s; color: var(--el-text-color-regular, #303133); &:focus { border-color: var(--el-color-primary, #fb7299); background: #fff; } }
.fs { height: 36px; border-radius: 8px; border: 2px solid transparent; padding: 0 12px; font-size: 13px; background: var(--el-fill-color-light, #f5f7fa); outline: none; cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23909399' d='M6 8L1 3h10z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 10px center; padding-right: 28px; color: var(--el-text-color-regular, #303133); &:focus { border-color: var(--el-color-primary, #fb7299); background-color: #fff; } }
.fta { border-radius: 8px; border: 2px solid transparent; padding: 10px 12px; font-size: 13px; background: var(--el-fill-color-light, #f5f7fa); outline: none; resize: vertical; font-family: inherit; color: var(--el-text-color-regular, #303133); &:focus { border-color: var(--el-color-primary, #fb7299); background: #fff; } }
.form-tip { font-size: 11px; color: var(--el-text-color-secondary, #909399); }

.cover-upload { width: 160px; height: 90px; border-radius: 8px; border: 2px dashed var(--el-border-color, #dcdfe6); cursor: pointer; overflow: hidden; transition: border-color 0.2s; &:hover { border-color: var(--el-color-primary, #fb7299); } }
.cover-preview { width: 100%; height: 100%; object-fit: cover; }
.cover-ph { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; color: var(--el-text-color-secondary, #909399); span { font-size: 12px; } }

.toggle-wrap { display: flex; align-items: center; gap: 10px; cursor: pointer; }
.toggle-track { width: 44px; height: 24px; border-radius: 12px; background: var(--el-border-color, #dcdfe6); position: relative; transition: background 0.2s; &.active { background: var(--el-color-primary, #fb7299); } }
.toggle-thumb { width: 20px; height: 20px; border-radius: 50%; background: #fff; position: absolute; top: 2px; left: 2px; transition: transform 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.2); .active & { transform: translateX(20px); } }
.toggle-text { font-size: 13px; color: var(--el-text-color-regular, #303133); }

.tags-wrap { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.tag-rm { background: none; border: none; color: var(--el-text-color-secondary, #909399); cursor: pointer; font-size: 14px; padding: 0 2px; &:hover { color: #f56c6c; } }
.tag-input { height: 28px; border: none; outline: none; font-size: 13px; background: transparent; min-width: 80px; }

.ep-section { border-top: 1px solid var(--el-border-color-lighter, #e4e7ed); padding-top: 16px; }
.ep-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; h4 { margin: 0; font-size: 14px; } }
.ep-empty { text-align: center; padding: 32px; color: var(--el-text-color-secondary, #909399); font-size: 13px; }
.ep-card { background: var(--el-fill-color-lighter, #fafafa); border-radius: 12px; padding: 16px; margin-bottom: 12px; display: flex; flex-direction: column; gap: 10px; }
.ep-card-top { display: flex; justify-content: space-between; align-items: center; }
.ep-num { font-size: 13px; font-weight: 600; color: var(--el-text-color-primary, #303133); }
.ep-rm { background: none; border: none; font-size: 18px; cursor: pointer; color: var(--el-text-color-secondary, #909399); padding: 2px 6px; border-radius: 4px; &:hover { color: #f56c6c; background: rgba(245,108,108,0.1); } }
.ep-upload { display: flex; align-items: center; gap: 10px; }
.file-name { font-size: 12px; color: var(--el-text-color-secondary, #909399); }
.ep-dur { font-size: 12px; color: var(--el-color-primary, #fb7299); margin-left: auto; }

.cover-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px); z-index: 3000; display: flex; align-items: center; justify-content: center; }
.cover-close { position: absolute; top: 20px; right: 20px; background: rgba(255,255,255,0.2); border: none; color: #fff; font-size: 24px; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; &:hover { background: rgba(255,255,255,0.3); } }
.cover-lg { max-width: 90vw; max-height: 90vh; border-radius: 8px; object-fit: contain; }

.title-tooltip { position: fixed; z-index: 4000; max-width: 400px; padding: 8px 14px; background: rgba(0,0,0,0.85); color: #fff; font-size: 13px; line-height: 1.5; border-radius: 6px; pointer-events: none; word-break: break-all; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }

.empty-cell { text-align: center; padding: 48px 0 !important; }
.empty-state { display: flex; flex-direction: column; align-items: center; gap: 8px; color: var(--el-text-color-secondary, #909399); p { margin: 0; font-size: 14px; } }

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s ease; .modal-card { transition: transform 0.2s ease, opacity 0.2s ease; } }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; .modal-card { transform: scale(0.95) translateY(10px); opacity: 0; } }
</style>
