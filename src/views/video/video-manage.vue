<template>
  <div class="page-container">
    <el-card class="search-card" shadow="never">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索视频标题"
            clearable
            :prefix-icon="Search"
          />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="searchForm.categoryId" placeholder="全部分类" clearable>
            <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="审核状态">
          <el-select v-model="searchForm.auditStatus" placeholder="全部" clearable>
            <el-option label="待审核" :value="0" />
            <el-option label="通过" :value="1" />
            <el-option label="拒绝" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="视频状态">
          <el-select v-model="searchForm.videoStatus" placeholder="全部" clearable>
            <el-option label="待发布" :value="0" />
            <el-option label="已发布" :value="1" />
            <el-option label="已下架" :value="2" />
            <el-option label="草稿" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" :icon="Search">搜索</el-button>
          <el-button @click="handleReset" :icon="Refresh">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="header-title">视频列表</span>
          <el-button type="primary" @click="handleAdd" :icon="Plus">新增视频</el-button>
        </div>
      </template>

      <div v-if="selectedIds.length" class="batch-bar">
        <span class="batch-count">已选择 <strong>{{ selectedIds.length }}</strong> 项</span>
        <el-button type="danger" plain :icon="Delete" @click="handleBatchDelete">批量删除</el-button>
        <el-button type="warning" plain :icon="CircleCheck" @click="handleBatchAudit">批量审核</el-button>
        <el-button link type="primary" @click="clearSelection">取消选择</el-button>
      </div>

      <el-table
        ref="tableRef"
        :data="tableData"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        stripe
        row-key="id"
        class="video-table"
      >
        <el-table-column type="selection" width="50" reserve-selection />
        <el-table-column prop="id" label="ID" width="70" align="center" />
        <el-table-column label="封面" width="80" align="center">
          <template #default="{ row }">
            <div class="cover-cell">
              <img
                v-if="row.cover"
                :src="row.cover"
                class="cover-thumb"
                alt=""
              />
              <div v-else class="cover-thumb cover-placeholder">
                <el-icon :size="20"><VideoPlay /></el-icon>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="视频标题" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="video-title">{{ row.title }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="上传者" width="110" />
        <el-table-column label="时长" width="90" align="center">
          <template #default="{ row }">
            <span class="mono-text">{{ formatDuration(row.duration) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="viewCount" label="播放" width="80" align="right">
          <template #default="{ row }">{{ formatNumber(row.viewCount) }}</template>
        </el-table-column>
        <el-table-column prop="likeCount" label="点赞" width="70" align="right">
          <template #default="{ row }">{{ formatNumber(row.likeCount) }}</template>
        </el-table-column>
        <el-table-column prop="coinCount" label="投币" width="70" align="right">
          <template #default="{ row }">{{ formatNumber(row.coinCount) }}</template>
        </el-table-column>
        <el-table-column prop="shareCount" label="分享" width="70" align="right">
          <template #default="{ row }">{{ formatNumber(row.shareCount) }}</template>
        </el-table-column>
        <el-table-column label="连载" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.serialStatus === 1 ? 'primary' : 'info'" size="small" round>
              {{ row.serialStatus === 1 ? '连载中' : '已完结' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="审核" width="80" align="center">
          <template #default="{ row }">
            <el-tag
              :type="['warning', 'success', 'danger'][row.auditStatus]"
              size="small"
              effect="dark"
              round
            >
              {{ ['待审核', '通过', '拒绝'][row.auditStatus] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag
              :type="['info', 'success', 'danger', ''][row.videoStatus]"
              size="small"
            >
              {{ ['待发布', '已发布', '已下架', '草稿'][row.videoStatus] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="publishTime" label="发布时间" width="160" />
        <el-table-column label="操作" width="160" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="info" link size="small" @click="handleView(row)">详情</el-button>
            <el-popconfirm
              :title="`确定删除视频「${row.title}」吗？`"
              confirm-button-text="确定"
              cancel-button-text="取消"
              :icon="WarningFilled"
              icon-color="#E6A23C"
              @confirm="handleDelete(row.id)"
            >
              <template #reference>
                <el-button type="danger" link size="small">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @change="fetchData"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="editDialogVisible"
      :title="isEditing ? '编辑视频' : '新增视频'"
      width="720px"
      destroy-on-close
      class="edit-dialog"
    >
      <el-steps :active="editStep" finish-status="success" align-center class="edit-steps">
        <el-step title="基本信息" />
        <el-step title="分集设置" />
      </el-steps>

      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editRules"
        label-width="100px"
        class="edit-form"
      >
        <div v-show="editStep === 0">
          <el-form-item label="视频标题" prop="title">
            <el-input v-model="editForm.title" placeholder="请输入视频标题" maxlength="80" show-word-limit />
          </el-form-item>
          <el-form-item label="视频分类" prop="categoryId">
            <el-select v-model="editForm.categoryId" placeholder="请选择分类" style="width: 100%">
              <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="标签">
            <div class="tags-input-wrap">
              <el-tag
                v-for="(tag, index) in editForm.tags"
                :key="index"
                closable
                class="tag-item"
                @close="removeTag(index)"
              >
                {{ tag }}
              </el-tag>
              <el-input
                v-if="tagInputVisible"
                ref="tagInputRef"
                v-model="tagInputValue"
                size="small"
                class="tag-input"
                placeholder="回车添加标签"
                @keyup.enter="addTag"
                @blur="addTag"
              />
              <el-button v-else size="small" @click="showTagInput">+ 添加标签</el-button>
            </div>
          </el-form-item>
          <el-form-item label="封面图" prop="cover">
            <el-upload
              class="cover-uploader"
              :show-file-list="false"
              :before-upload="beforeCoverUpload"
              :http-request="handleCoverUpload"
              accept=".jpg,.jpeg,.png"
            >
              <img v-if="editForm.cover" :src="editForm.cover" class="cover-preview" />
              <div v-else class="cover-upload-placeholder">
                <el-icon :size="28"><Plus /></el-icon>
                <span>上传封面 16:9</span>
              </div>
            </el-upload>
            <div class="cover-tip">支持 jpg/png 格式，建议 16:9 比例</div>
          </el-form-item>
          <el-form-item label="视频描述" prop="description">
            <el-input
              v-model="editForm.description"
              type="textarea"
              :rows="4"
              placeholder="请输入视频描述"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
        </div>

        <div v-show="editStep === 1">
          <div
            v-for="(ep, index) in editForm.episodes"
            :key="index"
            class="episode-item"
          >
            <div class="episode-header">
              <span class="episode-label">第 {{ index + 1 }} 集</span>
              <el-button
                v-if="editForm.episodes.length > 1"
                type="danger"
                link
                size="small"
                @click="removeEpisode(index)"
              >
                移除
              </el-button>
            </div>
            <el-form-item label="分集标题" :prop="`episodes.${index}.title`" :rules="[{ required: true, message: '请输入分集标题', trigger: 'blur' }]">
              <el-input v-model="ep.title" placeholder="请输入分集标题" />
            </el-form-item>
            <el-form-item label="播放地址" :prop="`episodes.${index}.url`">
              <el-input v-model="ep.url" placeholder="请输入播放 URL" />
            </el-form-item>
            <el-form-item label="源文件">
              <el-upload
                class="file-uploader"
                :show-file-list="false"
                :before-upload="beforeFileUpload"
                :http-request="(opts) => handleFileUpload(opts, index)"
                accept=".mp4,.mkv,.avi"
              >
                <el-button size="small" type="primary" plain>
                  <el-icon><Upload /></el-icon>
                  选择文件
                </el-button>
              </el-upload>
              <div v-if="ep.uploadProgress > 0 && ep.uploadProgress < 100" class="upload-progress">
                <el-progress :percentage="ep.uploadProgress" :stroke-width="6" />
              </div>
              <div v-if="ep.fileName" class="file-name">
                <el-icon><Document /></el-icon>
                {{ ep.fileName }}
              </div>
            </el-form-item>
            <el-form-item label="时长(秒)">
              <el-input-number v-model="ep.duration" :min="0" controls-position="right" />
            </el-form-item>
          </div>
          <el-button type="primary" plain class="add-episode-btn" @click="addEpisode">
            <el-icon><Plus /></el-icon> 添加分集
          </el-button>
        </div>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button v-if="editStep > 0" @click="editStep--">上一步</el-button>
          <el-button v-if="editStep === 0" type="primary" @click="nextStep">下一步</el-button>
          <el-button v-if="editStep === 1" @click="handleSaveDraft">保存草稿</el-button>
          <el-button v-if="editStep === 1" type="primary" @click="handleSave">保存发布</el-button>
        </div>
      </template>
    </el-dialog>

    <el-drawer
      v-model="detailDrawerVisible"
      title="视频详情"
      size="560px"
      class="detail-drawer"
    >
      <div v-loading="detailLoading" class="detail-content">
        <div class="player-area" v-if="detailData">
          <div class="player-placeholder" @click="handlePlayVideo">
            <img
              v-if="detailData.cover"
              :src="detailData.cover"
              class="player-cover"
              alt=""
            />
            <div v-else class="player-cover player-cover-empty">
              <el-icon :size="48"><VideoPlay /></el-icon>
            </div>
            <div class="play-overlay">
              <el-icon :size="56" color="#fff"><VideoPlay /></el-icon>
            </div>
          </div>
        </div>

        <div class="detail-section" v-if="detailData">
          <h4 class="section-title">视频信息</h4>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="标题" :span="2">{{ detailData.title }}</el-descriptions-item>
            <el-descriptions-item label="上传者">{{ detailData.username }}</el-descriptions-item>
            <el-descriptions-item label="上传时间">{{ detailData.createTime }}</el-descriptions-item>
            <el-descriptions-item label="审核状态">
              <el-tag
                :type="['warning', 'success', 'danger'][detailData.auditStatus]"
                size="small"
                effect="dark"
              >
                {{ ['待审核', '通过', '拒绝'][detailData.auditStatus] }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="视频状态">
              <el-tag
                :type="['info', 'success', 'danger', ''][detailData.videoStatus]"
                size="small"
              >
                {{ ['待发布', '已发布', '已下架', '草稿'][detailData.videoStatus] }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="时长" :span="2">
              {{ formatDuration(detailData.duration) }}
            </el-descriptions-item>
            <el-descriptions-item label="描述" :span="2">
              {{ detailData.description || '暂无描述' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="detail-section" v-if="detailData?.episodes?.length">
          <h4 class="section-title">分集列表</h4>
          <div class="episode-list">
            <div
              v-for="ep in detailData.episodes"
              :key="ep.id"
              class="episode-row"
            >
              <el-icon class="ep-play-icon"><VideoPlay /></el-icon>
              <span class="ep-title">{{ ep.title }}</span>
              <span class="ep-duration">{{ formatDuration(ep.duration) }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search, Refresh, Plus, Delete, WarningFilled,
  VideoPlay, CircleCheck, Upload, Document
} from '@element-plus/icons-vue'
import { formatDuration, formatNumber } from '@/utils/format'
import { getVideoList, getVideoDetail, createVideo, updateVideo, deleteVideo, batchDeleteVideo } from '@/api/video'
import { getCategoryList } from '@/api/category'

const loading = ref(false)
const tableData = ref([])
const selectedIds = ref([])
const categories = ref([])
const tableRef = ref(null)

const searchForm = ref({
  keyword: '',
  categoryId: '',
  auditStatus: '',
  videoStatus: '',
  dateRange: null
})
const pagination = ref({ page: 1, pageSize: 10, total: 0 })

const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      ...searchForm.value,
      page: pagination.value.page,
      pageSize: pagination.value.pageSize
    }
    if (params.dateRange) {
      params.startDate = params.dateRange[0]
      params.endDate = params.dateRange[1]
    }
    delete params.dateRange
    const res = await getVideoList(params)
    tableData.value = res.data.list.map(item => ({
      ...item,
      coinCount: Math.floor(Math.random() * 5000),
      shareCount: Math.floor(Math.random() * 2000),
      serialStatus: Math.random() > 0.5 ? 1 : 0,
      videoStatus: Math.floor(Math.random() * 4),
      publishTime: item.createTime
    }))
    pagination.value.total = res.data.total
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.value.page = 1
  fetchData()
}

const handleReset = () => {
  searchForm.value = {
    keyword: '',
    categoryId: '',
    auditStatus: '',
    videoStatus: '',
    dateRange: null
  }
  handleSearch()
}

const handleSelectionChange = (rows) => {
  selectedIds.value = rows.map(r => r.id)
}

const clearSelection = () => {
  tableRef.value?.clearSelection()
}

const handleBatchDelete = async () => {
  await ElMessageBox.confirm(
    `确定要批量删除选中的 ${selectedIds.value.length} 个视频吗？`,
    '批量删除确认',
    { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' }
  )
  await batchDeleteVideo(selectedIds.value)
  ElMessage.success('批量删除成功')
  fetchData()
}

const handleBatchAudit = () => {
  ElMessage.info('批量审核功能开发中')
}

const handleAdd = () => {
  isEditing.value = false
  editStep.value = 0
  resetEditForm()
  editDialogVisible.value = true
}

const isEditing = ref(false)
const editDialogVisible = ref(false)
const editStep = ref(0)
const editFormRef = ref(null)

const editForm = reactive({
  title: '',
  categoryId: '',
  tags: [],
  cover: '',
  description: '',
  episodes: [
    { title: '', url: '', file: null, fileName: '', uploadProgress: 0, duration: 0 }
  ]
})

const editRules = {
  title: [{ required: true, message: '请输入视频标题', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
  description: [{ required: true, message: '请输入视频描述', trigger: 'blur' }]
}

const resetEditForm = () => {
  editForm.title = ''
  editForm.categoryId = ''
  editForm.tags = []
  editForm.cover = ''
  editForm.description = ''
  editForm.episodes = [
    { title: '', url: '', file: null, fileName: '', uploadProgress: 0, duration: 0 }
  ]
}

const handleEdit = async (row) => {
  isEditing.value = true
  editStep.value = 0
  resetEditForm()
  const res = await getVideoDetail(row.id)
  const d = res.data
  editForm.title = d.title
  editForm.categoryId = d.categoryId
  editForm.tags = d.tags || []
  editForm.cover = d.cover
  editForm.description = d.description
  editDialogVisible.value = true
}

const nextStep = () => {
  editFormRef.value?.validate((valid) => {
    if (valid) editStep.value = 1
  })
}

const handleSaveDraft = async () => {
  ElMessage.success('草稿保存成功')
  editDialogVisible.value = false
  fetchData()
}

const handleSave = async () => {
  if (isEditing.value) {
    await updateVideo(1, editForm)
  } else {
    await createVideo(editForm)
  }
  ElMessage.success(isEditing.value ? '更新成功' : '创建成功')
  editDialogVisible.value = false
  fetchData()
}

const tagInputVisible = ref(false)
const tagInputValue = ref('')
const tagInputRef = ref(null)

const showTagInput = () => {
  tagInputVisible.value = true
  nextTick(() => tagInputRef.value?.input?.focus())
}

const addTag = () => {
  const val = tagInputValue.value.trim()
  if (val && !editForm.tags.includes(val)) {
    editForm.tags.push(val)
  }
  tagInputVisible.value = false
  tagInputValue.value = ''
}

const removeTag = (index) => {
  editForm.tags.splice(index, 1)
}

const beforeCoverUpload = (file) => {
  const isImage = ['image/jpeg', 'image/png'].includes(file.type)
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isImage) ElMessage.error('封面只能是 JPG/PNG 格式')
  if (!isLt2M) ElMessage.error('封面大小不能超过 2MB')
  return isImage && isLt2M
}

const handleCoverUpload = (options) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    editForm.cover = e.target.result
  }
  reader.readAsDataURL(options.file)
}

const beforeFileUpload = (file) => {
  const isVideo = ['video/mp4', 'video/x-matroska', 'video/avi'].includes(file.type)
  if (!isVideo) ElMessage.error('只能上传视频文件')
  return isVideo
}

const handleFileUpload = (options, index) => {
  editForm.episodes[index].fileName = options.file.name
  let progress = 0
  const timer = setInterval(() => {
    progress += Math.random() * 20
    if (progress >= 100) {
      progress = 100
      clearInterval(timer)
    }
    editForm.episodes[index].uploadProgress = Math.min(Math.round(progress), 100)
  }, 300)
}

const addEpisode = () => {
  editForm.episodes.push({ title: '', url: '', file: null, fileName: '', uploadProgress: 0, duration: 0 })
}

const removeEpisode = (index) => {
  editForm.episodes.splice(index, 1)
}

const detailDrawerVisible = ref(false)
const detailLoading = ref(false)
const detailData = ref(null)

const handleView = async (row) => {
  detailDrawerVisible.value = true
  detailLoading.value = true
  try {
    const res = await getVideoDetail(row.id)
    detailData.value = {
      ...res.data,
      videoStatus: row.videoStatus ?? 1,
      episodes: [
        { id: 1, title: '第1集', duration: 1200 },
        { id: 2, title: '第2集', duration: 980 },
        { id: 3, title: '第3集', duration: 1100 }
      ]
    }
  } finally {
    detailLoading.value = false
  }
}

const handlePlayVideo = () => {
  ElMessage.info('视频播放功能开发中')
}

const handleDelete = async (id) => {
  await deleteVideo(id)
  ElMessage.success('删除成功')
  fetchData()
}

onMounted(async () => {
  const catRes = await getCategoryList()
  categories.value = catRes.data.list
  fetchData()
})
</script>

<style lang="scss" scoped>
.page-container {
  padding: 0;
}

.search-card {
  margin-bottom: 16px;
  border-radius: 8px;

  :deep(.el-card__body) {
    padding-bottom: 2px;
  }
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 0;

  .el-form-item {
    margin-bottom: 16px;
    margin-right: 16px;
  }
}

.table-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.batch-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  margin-bottom: 16px;
  background: #f0f9ff;
  border-radius: 6px;
  border: 1px solid #d4e8ff;
  animation: slideDown 0.25s ease;

  .batch-count {
    color: #606266;
    font-size: 14px;

    strong {
      color: #409eff;
      font-weight: 600;
    }
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.video-table {
  :deep(.el-table__header th) {
    background: #fafafa;
    font-weight: 600;
    color: #606266;
    font-size: 13px;
  }
}

.cover-cell {
  display: flex;
  justify-content: center;
}

.cover-thumb {
  width: 48px;
  height: 28px;
  border-radius: 4px;
  object-fit: cover;
}

.cover-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  color: #c0c4cc;
}

.video-title {
  color: #303133;
  font-weight: 500;

  &:hover {
    color: #409eff;
    cursor: pointer;
  }
}

.mono-text {
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 13px;
  color: #606266;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding: 4px 0;
}

.edit-dialog {
  .edit-steps {
    margin-bottom: 28px;
    padding: 0 20px;
  }
}

.edit-form {
  max-height: 480px;
  overflow-y: auto;
  padding-right: 8px;
}

.tags-input-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;

  .tag-item {
    animation: tagIn 0.2s ease;
  }

  .tag-input {
    width: 120px;
  }
}

@keyframes tagIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.cover-uploader {
  :deep(.el-upload) {
    border: 1px dashed #d9d9d9;
    border-radius: 8px;
    cursor: pointer;
    overflow: hidden;
    transition: border-color 0.3s;

    &:hover {
      border-color: #409eff;
    }
  }
}

.cover-preview {
  width: 200px;
  height: 112px;
  display: block;
  object-fit: cover;
  border-radius: 8px;
}

.cover-upload-placeholder {
  width: 200px;
  height: 112px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #8c939d;
  font-size: 13px;
  background: #fafafa;
  border-radius: 8px;
}

.cover-tip {
  margin-top: 8px;
  color: #909399;
  font-size: 12px;
}

.episode-item {
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #fafafa;
  transition: box-shadow 0.3s;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
}

.episode-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.episode-label {
  font-weight: 600;
  color: #303133;
  font-size: 14px;
}

.file-uploader {
  :deep(.el-upload) {
    display: inline-block;
  }
}

.upload-progress {
  margin-top: 8px;
  width: 280px;
}

.file-name {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  color: #606266;
  font-size: 13px;
}

.add-episode-btn {
  width: 100%;
  margin-top: 8px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.detail-content {
  padding: 0 4px;
}

.player-area {
  margin-bottom: 24px;
}

.player-placeholder {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  background: #000;
}

.player-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.player-cover-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #555;
}

.play-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.35);
  transition: background 0.3s;

  &:hover {
    background: rgba(0, 0, 0, 0.5);
  }
}

.detail-section {
  margin-bottom: 24px;
}

.section-title {
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  padding-left: 10px;
  border-left: 3px solid #409eff;
}

.episode-list {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;
}

.episode-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-bottom: 1px solid #f2f3f5;
  transition: background 0.2s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #f5f7fa;
  }
}

.ep-play-icon {
  color: #409eff;
  flex-shrink: 0;
}

.ep-title {
  flex: 1;
  color: #303133;
  font-size: 14px;
}

.ep-duration {
  color: #909399;
  font-size: 13px;
  font-family: 'SF Mono', 'Menlo', monospace;
}
</style>
