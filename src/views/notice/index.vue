<template>
  <div class="notice-center">
    <el-card shadow="never" class="notice-card fade-in">
      <template #header>
        <div class="card-header">
          <span class="header-title">{{ $t('通知中心') }}</span>
          <el-button text type="primary" @click="handleReadAll" :icon="Check">
            {{ $t('全部已读') }}
          </el-button>
        </div>
      </template>

      <el-tabs v-model="activeTab" class="notice-tabs" @tab-change="fetchData">
        <el-tab-pane :label="$t('全部')" name="all" />
        <el-tab-pane name="unread">
          <template #label>
            <span class="tab-label">
              {{ $t('未读') }}
              <el-badge v-if="unreadCount > 0" :value="unreadCount" :max="99" class="unread-badge" />
            </span>
          </template>
        </el-tab-pane>
        <el-tab-pane :label="$t('系统通知')" name="system" />
        <el-tab-pane :label="$t('审核通知')" name="audit" />
        <el-tab-pane :label="$t('互动通知')" name="interaction" />
      </el-tabs>

      <div v-loading="loading" class="notice-list">
        <div v-if="!tableData.length" class="empty-state">
          <el-empty :description="$t('暂无通知')" :image-size="100" />
        </div>
        <div
          v-for="(item, idx) in tableData"
          :key="item.id"
          class="notice-item"
          :class="{ unread: !item.isRead }"
          :style="{ animationDelay: `${idx * 0.05}s` }"
          @click="showDetail(item)"
        >
          <div class="notice-icon-wrap" :class="`icon-${item.type}`">
            <el-icon :size="18">
              <Monitor v-if="item.type === 'system'" />
              <CircleCheckFilled v-else-if="item.type === 'audit'" />
              <ChatDotRound v-else />
            </el-icon>
          </div>
          <div class="notice-body">
            <div class="notice-header">
              <span class="notice-title">{{ item.title }}</span>
              <span v-if="!item.isRead" class="unread-dot" />
            </div>
            <p class="notice-preview">{{ item.content }}</p>
            <span class="notice-time">{{ item.createTime }}</span>
          </div>
          <div class="notice-actions" @click.stop>
            <el-button
              v-if="!item.isRead"
              type="primary"
              link
              size="small"
              @click="handleRead(item)"
            >
              {{ $t('标为已读') }}
            </el-button>
            <el-popconfirm
              :title="$t('确定删除此通知？')"
              :confirm-button-text="$t('确定')"
              :cancel-button-text="$t('取消')"
              @confirm="handleDelete(item.id)"
            >
              <template #reference>
                <el-button type="danger" link size="small">{{ $t('删除') }}</el-button>
              </template>
            </el-popconfirm>
          </div>
        </div>
      </div>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          layout="total, prev, pager, next"
          background
          @change="fetchData"
        />
      </div>
    </el-card>

    <el-drawer
      v-model="detailVisible"
      :title="$t('通知详情')"
      size="480px"
      class="detail-drawer"
    >
      <div v-if="detailData" class="detail-content">
        <div class="detail-icon-wrap" :class="`icon-${detailData.type}`">
          <el-icon :size="28">
            <Monitor v-if="detailData.type === 'system'" />
            <CircleCheckFilled v-else-if="detailData.type === 'audit'" />
            <ChatDotRound v-else />
          </el-icon>
        </div>
        <h3 class="detail-title">{{ detailData.title }}</h3>
        <span class="detail-time">{{ detailData.createTime }}</span>
        <div class="detail-body">{{ detailData.content }}</div>
        <div class="detail-footer">
          <el-button
            v-if="!detailData.isRead"
            type="primary"
            @click="handleRead(detailData)"
          >
            {{ $t('标为已读') }}
          </el-button>
          <el-popconfirm
            :title="$t('确定删除此通知？')"
            @confirm="handleDelete(detailData.id)"
          >
            <template #reference>
              <el-button type="danger" plain>{{ $t('删除') }}</el-button>
            </template>
          </el-popconfirm>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { Check, Monitor, CircleCheckFilled, ChatDotRound } from '@element-plus/icons-vue'
import { getNoticeList, readNotice, readAllNotices, deleteNotice } from '@/api/notice'

const { t } = useI18n()

const loading = ref(false)
const tableData = ref([])
const activeTab = ref('all')
const pagination = ref({ page: 1, pageSize: 10, total: 0 })
const detailVisible = ref(false)
const detailData = ref(null)

const unreadCount = computed(() => {
  return tableData.value.filter(n => !n.isRead).length
})

const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
      type: activeTab.value
    }
    const res = await getNoticeList(params)
    tableData.value = res.data.list
    pagination.value.total = res.data.total
  } finally {
    loading.value = false
  }
}

const handleRead = async (item) => {
  await readNotice(item.id)
  item.isRead = true
  ElMessage.success(t('已标为已读'))
}

const handleReadAll = async () => {
  await readAllNotices()
  tableData.value.forEach(r => r.isRead = true)
  ElMessage.success(t('全部已读'))
}

const handleDelete = async (id) => {
  await deleteNotice(id)
  ElMessage.success(t('删除成功'))
  fetchData()
}

const showDetail = (item) => {
  detailData.value = item
  detailVisible.value = true
  if (!item.isRead) {
    handleRead(item)
  }
}

onMounted(fetchData)
</script>

<style lang="scss" scoped>
.notice-center {
  padding: 0;
}

.notice-card {
  border-radius: 12px;
  border: 1px solid #f2f3f5;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.notice-tabs {
  margin-bottom: 16px;

  :deep(.el-tabs__header) {
    margin: 0 0 0 -4px;
  }

  :deep(.el-tabs__nav-wrap::after) {
    height: 1px;
  }

  :deep(.el-tabs__active-bar) {
    height: 3px;
    border-radius: 3px;
  }
}

.tab-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.unread-badge {
  :deep(.el-badge__content) {
    font-size: 10px;
  }
}

.notice-list {
  min-height: 300px;
}

.empty-state {
  padding: 60px 0;
}

.notice-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s ease;
  animation: fadeSlideUp 0.4s ease both;

  &:hover {
    background: #f9fafb;
    transform: translateX(4px);
  }

  &.unread {
    background: #f0f9ff;
    border: 1px solid #e0f2fe;

    &:hover {
      background: #e0f2fe;
    }
  }
}

.notice-icon-wrap {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &.icon-system { background: rgba(64, 158, 255, 0.1); color: #409eff; }
  &.icon-audit { background: rgba(103, 194, 58, 0.1); color: #67c23a; }
  &.icon-interaction { background: rgba(245, 158, 11, 0.1); color: #e6a23c; }
}

.notice-body {
  flex: 1;
  min-width: 0;
}

.notice-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.notice-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.unread-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #409eff;
  flex-shrink: 0;
}

.notice-preview {
  font-size: 13px;
  color: #909399;
  line-height: 1.5;
  margin: 0 0 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notice-time {
  font-size: 12px;
  color: #c0c4cc;
}

.notice-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex-shrink: 0;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding: 4px 0;
}

.detail-content {
  padding: 0 8px;
}

.detail-icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;

  &.icon-system { background: rgba(64, 158, 255, 0.1); color: #409eff; }
  &.icon-audit { background: rgba(103, 194, 58, 0.1); color: #67c23a; }
  &.icon-interaction { background: rgba(245, 158, 11, 0.1); color: #e6a23c; }
}

.detail-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px;
}

.detail-time {
  font-size: 13px;
  color: #909399;
  display: block;
  margin-bottom: 20px;
}

.detail-body {
  font-size: 14px;
  color: #606266;
  line-height: 1.8;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

.detail-footer {
  display: flex;
  gap: 8px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #f2f3f5;
}

@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
