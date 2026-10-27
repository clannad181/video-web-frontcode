<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">{{ $t('商品管理') }}</h1>
      <p class="page-subtitle">{{ $t('管理商品上下架、价格与图片') }}</p>
    </div>

    <div class="filter-card">
      <div class="filter-grid">
        <div class="filter-item">
          <label class="filter-label">{{ $t('商品名称') }}</label>
          <input v-model="query.name" class="filter-input" :placeholder="$t('请输入商品名称')" @keyup.enter="search" />
        </div>
        <div class="filter-item">
          <label class="filter-label">{{ $t('商品分类') }}</label>
          <div class="select-wrap" :class="{ open: categoryOpen }">
            <select v-model="query.categoryId" class="filter-select" @mousedown="categoryOpen = true" @blur="categoryOpen = false">
              <option value="">{{ $t('全部') }}</option>
              <option v-for="c in categoryOptions" :key="c.id" :value="c.id">{{ c.label }}</option>
            </select>
          </div>
        </div>
        <div class="filter-item">
          <label class="filter-label">{{ $t('状态') }}</label>
          <div class="select-wrap" :class="{ open: statusOpen }">
            <select v-model="query.status" class="filter-select" @mousedown="statusOpen = true" @blur="statusOpen = false">
              <option value="">{{ $t('全部') }}</option>
              <option :value="0">{{ $t('下架') }}</option>
              <option :value="1">{{ $t('上架') }}</option>
            </select>
          </div>
        </div>
      </div>
      <div class="filter-actions">
        <button class="btn btn-secondary" @click="resetQuery">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
          {{ $t('重置') }}
        </button>
        <button class="btn btn-primary" @click="search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
          {{ $t('搜索') }}
        </button>
      </div>
      <div class="filter-bottom">
        <button class="btn btn-add" @click="openAddModal">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
          {{ $t('新增商品') }}
        </button>
      </div>
    </div>

    <div class="table-card">
      <div class="table-wrap" v-loading="loading">
        <table class="data-table">
          <thead>
            <tr>
              <th class="col-index">#</th>
              <th>{{ $t('主图') }}</th>
              <th>{{ $t('商品名称') }}</th>
              <th>{{ $t('商品分类') }}</th>
              <th>{{ $t('原价') }}</th>
              <th>{{ $t('优惠价') }}</th>
              <th>{{ $t('排序') }}</th>
              <th>{{ $t('状态') }}</th>
              <th>{{ $t('创建时间') }}</th>
              <th class="sticky-col">{{ $t('操作') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="records.length === 0 && !loading">
              <td colspan="10" class="empty-row">{{ $t('暂无数据') }}</td>
            </tr>
            <tr v-for="(row, idx) in records" :key="row.id" class="table-row">
              <td class="col-index">{{ (query.page - 1) * query.size + idx + 1 }}</td>
              <td>
                <img v-if="row.cover" class="goods-cover" :src="row.cover" />
                <div v-else class="goods-cover goods-cover-ph">{{ $t('暂无数据') }}</div>
              </td>
              <td class="name-cell">{{ row.name }}</td>
              <td class="cell-muted">{{ row.categoryLabel || '-' }}</td>
              <td><span class="price">{{ '¥ ' + row.originalPrice }}</span></td>
              <td><span class="price price-discount">{{ row.discountPrice != null ? '¥ ' + row.discountPrice : '-' }}</span></td>
              <td><span class="sort-num">{{ row.sort }}</span></td>
              <td>
                <span class="status-badge" :class="row.status === 1 ? 'badge-on' : 'badge-off'">
                  {{ row.status === 1 ? $t('上架') : $t('下架') }}
                </span>
              </td>
              <td class="cell-muted">{{ row.createTime }}</td>
              <td class="sticky-col">
                <div class="action-group">
                  <button class="btn-action btn-detail" @click="openDetail(row)">{{ $t('详情') }}</button>
                  <button class="btn-action btn-edit" @click="openEditModal(row)">{{ $t('编辑') }}</button>
                  <button class="btn-action btn-delete" @click="confirmDelete(row)">{{ $t('删除') }}</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="total > 0" class="pagination-wrap">
        <div class="page-info">{{ $t('共 {total} 条', { total }) }}</div>
        <div class="page-btns">
          <button class="pg-btn" :disabled="query.page <= 1" @click="goPage(query.page - 1)">&#8249;</button>
          <template v-for="p in pageNumbers" :key="p">
            <span v-if="p === '...'" class="pg-ellipsis">...</span>
            <button v-else class="pg-btn" :class="{ active: p === query.page }" @click="goPage(p)">{{ p }}</button>
          </template>
          <button class="pg-btn" :disabled="query.page >= totalPages" @click="goPage(query.page + 1)">&#8250;</button>
        </div>
        <select v-model.number="query.size" class="page-size-sel" @change="onPageSizeChange">
          <option :value="10">{{ $t('10 条/页') }}</option>
          <option :value="20">{{ $t('20 条/页') }}</option>
          <option :value="50">{{ $t('50 条/页') }}</option>
        </select>
      </div>
    </div>

    <!-- 新增/编辑商品弹窗 -->
    <teleport to="body">
      <transition name="modal-fade">
        <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
          <div class="modal-card modal-md" @click.stop>
            <div class="modal-header">
              <h3>{{ isEdit ? $t('编辑商品') : $t('新增商品') }}</h3>
              <button class="modal-close" @click="closeModal">&times;</button>
            </div>
            <div class="modal-body">
              <div class="fg">
                <label class="fl">{{ $t('商品分类') }} <span class="req">*</span></label>
                <select v-model="editForm.categoryId" class="fi">
                  <option value="">{{ $t('请选择商品分类') }}</option>
                  <option v-for="c in categoryOptions" :key="c.id" :value="c.id">{{ c.label }}</option>
                </select>
              </div>
              <div class="fg">
                <label class="fl">{{ $t('商品名称') }} <span class="req">*</span></label>
                <input v-model="editForm.name" class="fi" :placeholder="$t('请输入商品名称')" />
              </div>
              <div class="form-row">
                <div class="fg half">
                  <label class="fl">{{ $t('原价') }} <span class="req">*</span></label>
                  <input v-model.number="editForm.originalPrice" class="fi" type="number" min="0" step="0.01" :placeholder="$t('请输入原价')" />
                </div>
                <div class="fg half">
                  <label class="fl">{{ $t('优惠价') }}</label>
                  <input v-model.number="editForm.discountPrice" class="fi" type="number" min="0" step="0.01" :placeholder="$t('请输入优惠价')" />
                </div>
              </div>
              <div class="form-row">
                <div class="fg half">
                  <label class="fl">{{ $t('状态') }}</label>
                  <div class="seg-row">
                    <button type="button" class="seg-btn" :class="{ active: editForm.status === 0 }" @click="editForm.status = 0">{{ $t('下架') }}</button>
                    <button type="button" class="seg-btn" :class="{ active: editForm.status === 1 }" @click="editForm.status = 1">{{ $t('上架') }}</button>
                  </div>
                </div>
                <div class="fg half">
                  <label class="fl">{{ $t('排序') }}</label>
                  <input v-model.number="editForm.sort" class="fi" type="number" min="0" :placeholder="$t('请输入排序值')" />
                </div>
              </div>
              <div class="fg">
                <label class="fl">{{ $t('商品主图') }}</label>
                <div class="img-uploader">
                  <div class="cover-upload" @click="$refs.coverInput.click()">
                    <input ref="coverInput" type="file" accept="image/*" style="display:none" @change="onCoverChange" />
                    <img v-if="editForm.cover" :src="editForm.cover" class="cover-preview" />
                    <div v-else class="cover-ph">
                      <span>{{ coverUploading ? '...' : $t('上传主图') }}</span>
                    </div>
                  </div>
                  <button v-if="editForm.cover" class="btn btn-sm btn-outline btn-danger-text" @click.stop="editForm.cover = ''">{{ $t('更换头像') }}</button>
                </div>
              </div>
              <div class="fg">
                <label class="fl">{{ $t('商品详情图') }}</label>
                <div class="img-list">
                  <div v-for="(img, i) in editForm.images" :key="img + i" class="img-thumb">
                    <img :src="img" />
                    <span class="img-remove" @click="editForm.images.splice(i, 1)">&times;</span>
                  </div>
                  <div class="img-add" @click="$refs.imagesInput.click()">
                    <input ref="imagesInput" type="file" accept="image/*" multiple style="display:none" @change="onImagesChange" />
                    <span>{{ imagesUploading ? '...' : $t('上传详情图') }}</span>
                  </div>
                </div>
              </div>
              <div class="fg">
                <label class="fl">{{ $t('商品描述') }}</label>
                <textarea v-model="editForm.description" class="fi fi-text" rows="3" :placeholder="$t('请输入商品描述')"></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="closeModal" :disabled="saving">{{ $t('取消') }}</button>
              <button class="btn btn-primary" :disabled="saving" @click="handleSave">
                <span v-if="saving" class="spinner"></span>
                {{ saving ? $t('保存中...') : $t('确认') }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- 详情弹窗 -->
    <teleport to="body">
      <transition name="modal-fade">
        <div v-if="showDetail" class="modal-overlay" @click.self="showDetail = false">
          <div class="modal-card modal-md" @click.stop>
            <div class="modal-header">
              <h3>{{ $t('详情') }}</h3>
              <button class="modal-close" @click="showDetail = false">&times;</button>
            </div>
            <div class="modal-body" v-loading="detailLoading">
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="dk">{{ $t('商品名称') }}</span>
                  <span class="dv">{{ detail.name || '-' }}</span>
                </div>
                <div class="detail-item">
                  <span class="dk">{{ $t('商品分类') }}</span>
                  <span class="dv">{{ detail.categoryLabel || '-' }}</span>
                </div>
                <div class="detail-item">
                  <span class="dk">{{ $t('原价') }}</span>
                  <span class="dv">{{ '¥ ' + (detail.originalPrice ?? '-') }}</span>
                </div>
                <div class="detail-item">
                  <span class="dk">{{ $t('优惠价') }}</span>
                  <span class="dv">{{ detail.discountPrice != null ? '¥ ' + detail.discountPrice : '-' }}</span>
                </div>
                <div class="detail-item">
                  <span class="dk">{{ $t('状态') }}</span>
                  <span class="dv">
                    <span class="status-badge" :class="detail.status === 1 ? 'badge-on' : 'badge-off'">
                      {{ detail.status === 1 ? $t('上架') : $t('下架') }}
                    </span>
                  </span>
                </div>
                <div class="detail-item">
                  <span class="dk">{{ $t('排序') }}</span>
                  <span class="dv">{{ detail.sort ?? 0 }}</span>
                </div>
                <div class="detail-item">
                  <span class="dk">{{ $t('创建时间') }}</span>
                  <span class="dv">{{ detail.createTime || '-' }}</span>
                </div>
                <div class="detail-item">
                  <span class="dk">{{ $t('更新时间') }}</span>
                  <span class="dv">{{ detail.updateTime || '-' }}</span>
                </div>
                <div class="detail-item detail-full">
                  <span class="dk">{{ $t('商品描述') }}</span>
                  <span class="dv">{{ detail.description || '-' }}</span>
                </div>
                <div class="detail-item detail-full">
                  <span class="dk">{{ $t('商品主图') }}</span>
                  <span class="dv">
                    <img v-if="detail.cover" class="detail-img" :src="detail.cover" />
                    <template v-else>-</template>
                  </span>
                </div>
                <div class="detail-item detail-full">
                  <span class="dk">{{ $t('商品详情图') }}</span>
                  <span class="dv">
                    <div v-if="detail.images && detail.images.length" class="img-list">
                      <div v-for="(img, i) in detail.images" :key="img + i" class="img-thumb readonly">
                        <img :src="img" />
                      </div>
                    </div>
                    <template v-else>-</template>
                  </span>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="showDetail = false">{{ $t('取消') }}</button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onActivated } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getGoodsList, getGoodsDetail, addGoods, updateGoods, deleteGoods } from '@/api/goods'
import { getEnabledDictData } from '@/api/dict'
import { uploadFile } from '@/utils/upload'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const loading = ref(false)
const records = ref([])
const total = ref(0)
const categoryOpen = ref(false)
const statusOpen = ref(false)
const categoryOptions = ref([])

const query = reactive({ name: '', categoryId: '', status: '', page: 1, size: 10 })

// --- 分页 ---
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / query.size)))

const pageNumbers = computed(() => {
  const pages = []
  const tp = totalPages.value
  const cp = query.page
  if (tp <= 7) {
    for (let i = 1; i <= tp; i++) pages.push(i)
  } else {
    pages.push(1)
    if (cp > 4) pages.push('...')
    const start = Math.max(2, cp - 2)
    const end = Math.min(tp - 1, cp + 2)
    for (let i = start; i <= end; i++) pages.push(i)
    if (cp < tp - 3) pages.push('...')
    pages.push(tp)
  }
  return pages
})

function goPage(p) {
  query.page = p
  fetchData()
}

function onPageSizeChange() {
  query.page = 1
  fetchData()
}

function search() {
  query.page = 1
  fetchData()
}

function resetQuery() {
  query.name = ''
  query.categoryId = ''
  query.status = ''
  query.page = 1
  fetchData()
}

// --- 分类字典（goods_category）---
const fetchCategories = async () => {
  try {
    const res = await getEnabledDictData('product_category')
    const d = res?.data
    categoryOptions.value = (Array.isArray(d) ? d : []).filter(item => item && item.id != null)
  } catch (e) {
    categoryOptions.value = []
    console.warn('[goods-manage] 加载 product_category 字典失败：', e?.message || e)
  }
}

// --- 数据加载 ---
async function fetchData() {
  loading.value = true
  try {
    const params = { page: query.page, size: query.size }
    if (query.name) params.name = query.name
    if (query.categoryId !== '') params.categoryId = query.categoryId
    if (query.status !== '') params.status = query.status
    const res = await getGoodsList(params)
    records.value = res.data?.records || []
    total.value = res.data?.total ?? 0
  } catch (e) {
    console.error('加载商品列表失败', e)
  } finally {
    loading.value = false
  }
}

// --- 新增/编辑 ---
const showModal = ref(false)
const isEdit = ref(false)
const saving = ref(false)
const coverUploading = ref(false)
const imagesUploading = ref(false)
const editForm = reactive({ id: null, categoryId: '', name: '', originalPrice: null, discountPrice: null, cover: '', images: [], description: '', status: 1, sort: 0 })

function resetEditForm() {
  Object.assign(editForm, { id: null, categoryId: '', name: '', originalPrice: null, discountPrice: null, cover: '', images: [], description: '', status: 1, sort: 0 })
}

function openAddModal() {
  isEdit.value = false
  resetEditForm()
  showModal.value = true
}

function openEditModal(row) {
  isEdit.value = true
  resetEditForm()
  Object.assign(editForm, {
    id: row.id,
    categoryId: row.categoryId ?? '',
    name: row.name || '',
    originalPrice: row.originalPrice != null ? Number(row.originalPrice) : null,
    discountPrice: row.discountPrice != null ? Number(row.discountPrice) : null,
    cover: row.cover || '',
    images: [],
    description: '',
    status: row.status ?? 1,
    sort: row.sort ?? 0
  })
  showModal.value = true
  loadDetailIntoForm(row.id)
}

async function loadDetailIntoForm(id) {
  try {
    const res = await getGoodsDetail(id)
    const d = res.data || {}
    if (Array.isArray(d.images)) editForm.images = [...d.images]
    editForm.description = d.description || ''
  } catch (e) {
    console.error('加载商品详情失败', e)
  }
}

function closeModal() {
  if (saving.value) return
  showModal.value = false
}

async function onCoverChange(e) {
  const file = e.target.files?.[0]
  e.target.value = ''
  if (!file) return
  coverUploading.value = true
  try {
    const r = await uploadFile(file, { category: 'image' })
    if (r.url) editForm.cover = r.url
  } catch {} finally {
    coverUploading.value = false
  }
}

async function onImagesChange(e) {
  const files = Array.from(e.target.files || [])
  e.target.value = ''
  if (!files.length) return
  imagesUploading.value = true
  try {
    for (const file of files) {
      const r = await uploadFile(file, { category: 'image' })
      if (r.url) editForm.images.push(r.url)
    }
  } catch {} finally {
    imagesUploading.value = false
  }
}

function validateForm() {
  if (!editForm.categoryId && editForm.categoryId !== 0) {
    ElMessage.warning(t('商品分类不能为空'))
    return false
  }
  if (!editForm.name || !editForm.name.trim()) {
    ElMessage.warning(t('商品名称不能为空'))
    return false
  }
  const price = Number(editForm.originalPrice)
  if (!price || price <= 0 || Number.isNaN(price)) {
    ElMessage.warning(t('原价必须大于0'))
    return false
  }
  if (editForm.discountPrice !== null && editForm.discountPrice !== '' && editForm.discountPrice !== undefined) {
    const d = Number(editForm.discountPrice)
    if (Number.isNaN(d) || d <= 0) {
      ElMessage.warning(t('优惠价必须大于0'))
      return false
    }
    if (d >= price) {
      ElMessage.warning(t('优惠价必须低于原价'))
      return false
    }
  }
  return true
}

async function handleSave() {
  if (!validateForm()) return
  if (saving.value) return
  saving.value = true
  try {
    const data = {
      categoryId: editForm.categoryId,
      name: editForm.name.trim(),
      originalPrice: Number(editForm.originalPrice),
      status: editForm.status,
      sort: Number(editForm.sort) || 0
    }
    if (editForm.discountPrice !== null && editForm.discountPrice !== '' && editForm.discountPrice !== undefined) {
      data.discountPrice = Number(editForm.discountPrice)
    }
    if (editForm.cover) data.cover = editForm.cover
    if (editForm.images.length) data.images = [...editForm.images]
    if (editForm.description) data.description = editForm.description
    if (isEdit.value) {
      data.id = editForm.id
      await updateGoods(data)
      ElMessage.success(t('商品更新成功'))
    } else {
      await addGoods(data)
      ElMessage.success(t('商品创建成功'))
    }
    showModal.value = false
    fetchData()
  } catch (e) {
    console.error('保存商品失败', e)
  } finally {
    saving.value = false
  }
}

// --- 详情 ---
const showDetail = ref(false)
const detailLoading = ref(false)
const detail = ref({})

async function openDetail(row) {
  showDetail.value = true
  detailLoading.value = true
  detail.value = {}
  try {
    const res = await getGoodsDetail(row.id)
    detail.value = res.data || {}
  } catch (e) {
    console.error('加载商品详情失败', e)
  } finally {
    detailLoading.value = false
  }
}

// --- 删除 ---
async function confirmDelete(row) {
  try {
    await ElMessageBox.confirm(t('确定要删除商品「{name}」吗？', { name: row.name }), t('删除确认'), {
      confirmButtonText: t('确定'),
      cancelButtonText: t('取消'),
      type: 'warning'
    })
    await deleteGoods(row.id)
    ElMessage.success(t('删除成功'))
    fetchData()
  } catch (e) {
    if (e !== 'cancel') console.error('删除失败', e)
  }
}

onMounted(() => {
  fetchCategories()
  fetchData()
})

// keep-alive 复用实例，重新进入时刷新字典与列表
const isInitialActivation = ref(true)
onActivated(() => {
  if (isInitialActivation.value) {
    isInitialActivation.value = false
    return
  }
  fetchCategories()
  fetchData()
})
</script>

<style lang="scss" scoped>
/* ---- Page Container ---- */
.page-container { padding: 0; }

/* ---- Page Header ---- */
.page-header { margin-bottom: 20px; }
.page-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--el-text-color-primary, #303133);
  margin: 0 0 4px;
}
.page-subtitle {
  font-size: 13px;
  color: var(--el-text-color-secondary, #909399);
  margin: 0;
}

/* ---- Filter Card ---- */
.filter-card {
  background: var(--card-bg, #fff);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  border: 1px solid var(--border-color, #e4e7ed);
}
.filter-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}
.filter-item { display: flex; flex-direction: column; gap: 6px; }
.filter-label {
  font-size: 12px;
  color: var(--text-secondary, #909399);
  font-weight: 500;
}
.filter-input,
.filter-select {
  height: 40px;
  border-radius: 12px;
  border: none;
  padding: 0 14px;
  font-size: 13px;
  background-color: var(--bg-color, #f5f7fa);
  outline: none;
  transition: all 0.2s;
  color: var(--text-primary, #303133);
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.06);
  &:focus {
    background-color: var(--card-bg, #fff);
    box-shadow: 0 0 0 2px rgba(251,114,153,0.25);
  }
}
.filter-select {
  cursor: pointer;
  appearance: none;
  background-color: var(--bg-color, #f5f7fa);
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.06);
  padding-right: 32px;
  &:focus {
    background-color: var(--card-bg, #fff);
    box-shadow: 0 0 0 2px rgba(251,114,153,0.25);
  }
}

.select-wrap {
  position: relative;
  .filter-select { width: 100%; }
  &::after {
    content: '';
    position: absolute;
    right: 12px;
    top: 50%;
    width: 0;
    height: 0;
    border-left: 4.5px solid transparent;
    border-right: 4.5px solid transparent;
    border-top: 5.5px solid var(--text-secondary, #909399);
    pointer-events: none;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    transform: translateY(-60%);
  }
  &:hover::after {
    border-top-color: var(--color-primary, #fb7299);
  }
  &.open::after {
    border-top-color: var(--color-primary, #fb7299);
    transform: translateY(-40%) rotate(180deg);
  }
}
.filter-actions {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  justify-content: flex-end;
}
.filter-bottom {
  display: flex;
  justify-content: flex-end;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid var(--border-color, #e4e7ed);
}

/* ---- Buttons ---- */
.btn {
  height: 36px;
  padding: 0 22px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.25s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  svg { flex-shrink: 0; }
  &.btn-primary {
    background: linear-gradient(135deg, var(--color-primary, #fb7299) 0%, #ff9ac6 100%);
    color: #fff;
    box-shadow: 0 2px 8px rgba(251,114,153,0.25);
    &:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(251,114,153,0.4); }
    &:active { transform: translateY(0); }
  }
  &.btn-secondary {
    background: var(--bg-color, #f5f7fa);
    color: var(--text-primary, #303133);
    border-color: var(--border-color, #dcdfe6);
    &:hover { background: var(--border-color, #ebedf0); }
  }
  &.btn-add {
    background: linear-gradient(135deg, var(--color-primary, #fb7299) 0%, #ff9ac6 100%);
    color: #fff;
    box-shadow: 0 2px 8px rgba(251,114,153,0.25);
    padding: 0 26px;
    &:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(251,114,153,0.4); }
    &:active { transform: translateY(0); }
  }
  &.btn-sm { height: 30px; padding: 0 14px; font-size: 12px; }
  &.btn-outline { background: transparent; border-color: var(--border-color, #dcdfe6); color: var(--text-secondary, #909399); }
  &.btn-danger-text { color: #f56c6c; border-color: rgba(245,108,108,0.4); &:hover { background: rgba(245,108,108,0.08); color: #f56c6c; } }
  &:disabled { opacity: 0.55; cursor: not-allowed; transform: none !important; }
}
.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ---- Table Card ---- */
.table-card {
  background: var(--card-bg, #fff);
  border-radius: 12px;
  border: 1px solid var(--border-color, #e4e7ed);
  overflow: hidden;
}
.table-wrap {
  overflow-x: auto;
  &::-webkit-scrollbar { height: 6px; }
  &::-webkit-scrollbar-thumb { border-radius: 3px; background: rgba(0,0,0,0.15); }
}
.data-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 13px;
  min-width: 1100px;
  th {
    padding: 14px 16px;
    text-align: center;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-secondary, #909399);
    background: var(--bg-color, #f8f9fc);
    font-weight: 600;
    white-space: nowrap;
    border-bottom: 2px solid var(--border-color, #e4e7ed);
    user-select: none;
    position: sticky;
    top: 0;
    z-index: 1;
  }
  td {
    padding: 14px 16px;
    border-bottom: 1px solid var(--border-color, #f2f3f5);
    vertical-align: middle;
    background: var(--card-bg, #fff);
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .table-row:hover td { background: var(--bg-color, #fafafa); }
  .col-index { width: 60px; }
}

.goods-cover {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  object-fit: cover;
  background: var(--bg-color, #f5f7fa);
  display: inline-block;
  vertical-align: middle;
}
.goods-cover-ph {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: var(--text-secondary, #909399);
  border: 1px dashed var(--border-color, #dcdfe6);
}
.name-cell { font-weight: 500; }
.price { color: var(--text-primary, #303133); font-weight: 600; }
.price-discount { color: var(--color-primary, #fb7299); }
.sort-num {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 28px; height: 24px;
  background: var(--bg-color, #f5f7fa); border-radius: 6px;
  font-size: 13px; font-weight: 500; color: var(--text-primary, #606266);
}
.cell-muted { color: var(--text-secondary, #909399); }

.status-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 500;
}
.badge-on { color: #67c23a; background: rgba(103,194,58,0.1); }
.badge-off { color: #909399; background: rgba(144,147,153,0.08); }

/* Sticky Action Column */
.sticky-col {
  position: sticky;
  right: 0;
  z-index: 3;
  background: var(--card-bg, #fff);
  border-left: 1px solid var(--border-color, #e4e7ed);
  box-shadow: -2px 0 8px rgba(0,0,0,0.06);
}
.table-row:hover .sticky-col { background: var(--bg-color, #fafafa); }
.action-group { display: flex; gap: 6px; justify-content: center; white-space: nowrap; }
.btn-action {
  padding: 6px 14px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}
.btn-detail { color: #409eff; background: rgba(64,158,255,0.1); &:hover { color: #fff; background: #409eff; } }
.btn-edit { color: #ffc107; background: rgba(255,193,7,0.1); &:hover { color: #fff; background: #ffc107; } }
.btn-delete { color: #f56c6c; background: rgba(245,108,108,0.1); &:hover { color: #fff; background: #f56c6c; } }
.empty-row { padding: 40px; text-align: center; color: var(--text-secondary, #909399); }

/* ---- Pagination ---- */
.pagination-wrap { display: flex; align-items: center; justify-content: space-between; padding: 16px 10px; }
.page-info { font-size: 13px; color: var(--text-secondary, #909399); }
.page-btns { display: flex; gap: 4px; }
.pg-btn {
  width: 32px; height: 32px; border-radius: 8px;
  border: 1px solid var(--border-color, #dcdfe6);
  background: var(--card-bg, #fff);
  color: var(--text-primary, #303133);
  font-size: 13px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
  &:hover:not(:disabled) { border-color: var(--color-primary, #fb7299); color: var(--color-primary, #fb7299); }
  &.active { background: var(--color-primary, #fb7299); color: #fff; border-color: var(--color-primary, #fb7299); }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
}
.pg-ellipsis { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 13px; color: var(--text-secondary, #909399); }
.page-size-sel {
  height: 32px; border-radius: 8px;
  border: 1px solid var(--border-color, #dcdfe6);
  padding: 0 8px; font-size: 12px;
  background: var(--card-bg, #fff);
  color: var(--text-primary, #303133);
  cursor: pointer;
}

/* ---- Modals ---- */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.45);
  backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  z-index: 2000;
}
.modal-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 24px 80px rgba(0,0,0,0.18);
  max-height: 90vh;
  display: flex; flex-direction: column;
  overflow: hidden;
}
.modal-md { width: 560px; }
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 28px 16px; flex-shrink: 0;
  h3 { margin: 0; font-size: 17px; font-weight: 600; color: #303133; }
}
.modal-close {
  background: none; border: none; font-size: 20px; cursor: pointer;
  color: #909399; padding: 0; line-height: 1;
  width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;
  border-radius: 8px; transition: all 0.2s;
  &:hover { color: #303133; background: #f5f7fa; }
}
.modal-body { padding: 4px 28px 20px; overflow-y: auto; flex: 1; }
.modal-footer {
  display: flex; justify-content: flex-end; gap: 10px;
  padding: 16px 28px; border-top: 1px solid #f2f3f5; flex-shrink: 0;
}

/* Form */
.form-row { display: flex; gap: 14px; .half { flex: 1; min-width: 0; } }
.fg { margin-bottom: 16px; &:last-child { margin-bottom: 0; } }
.fl { display: block; font-size: 13px; font-weight: 500; color: #303133; margin-bottom: 6px; }
.req { color: #f56c6c; }
.fi {
  width: 100%; height: 40px; border-radius: 10px;
  border: 1.5px solid #e4e7ed;
  padding: 0 14px; font-size: 13px;
  background: #fff;
  color: #303133;
  outline: none; transition: all 0.25s ease; box-sizing: border-box;
  &:focus { border-color: var(--color-primary, #fb7299); box-shadow: 0 0 0 3px rgba(251,114,153,0.1); }
}
select.fi { cursor: pointer; }
.fi-text {
  height: auto;
  min-height: 80px;
  padding: 10px 14px;
  resize: vertical;
  font-family: inherit;
  line-height: 1.5;
}

/* Segmented mode switch */
.seg-row { display: flex; gap: 8px; }
.seg-btn {
  flex: 1;
  height: 40px;
  border-radius: 10px;
  border: 1.5px solid #e4e7ed;
  background: #fff;
  color: #606266;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { border-color: #d0d3d9; }
  &.active {
    border-color: var(--color-primary, #fb7299);
    color: var(--color-primary, #fb7299);
    background: rgba(251,114,153,0.06);
    font-weight: 600;
  }
}

/* Image upload */
.img-uploader { display: flex; align-items: center; gap: 12px; }
.cover-upload {
  width: 96px; height: 96px;
  border-radius: 10px;
  border: 1.5px dashed #dcdfe6;
  background: var(--bg-color, #fafafa);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; overflow: hidden;
  transition: all 0.2s;
  &:hover { border-color: var(--color-primary, #fb7299); }
  .cover-preview { width: 100%; height: 100%; object-fit: cover; }
  .cover-ph {
    display: flex; flex-direction: column; align-items: center; gap: 4px;
    font-size: 12px; color: var(--text-secondary, #909399);
    padding: 0 8px; text-align: center;
  }
}
.img-list { display: flex; flex-wrap: wrap; gap: 10px; }
.img-thumb {
  position: relative;
  width: 72px; height: 72px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-color, #e4e7ed);
  img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .img-remove {
    position: absolute; top: 2px; right: 2px;
    width: 18px; height: 18px;
    background: rgba(0,0,0,0.55);
    color: #fff; font-size: 13px; line-height: 16px;
    text-align: center; border-radius: 50%;
    cursor: pointer;
    &:hover { background: #f56c6c; }
  }
  &.readonly .img-remove { display: none; }
}
.img-add {
  width: 72px; height: 72px;
  border-radius: 8px;
  border: 1.5px dashed #dcdfe6;
  background: var(--bg-color, #fafafa);
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; color: var(--text-secondary, #909399);
  cursor: pointer; text-align: center; padding: 0 6px;
  transition: all 0.2s;
  &:hover { border-color: var(--color-primary, #fb7299); color: var(--color-primary, #fb7299); }
}

/* Detail */
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 16px;
  padding: 8px 0;
}
.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  &.detail-full { grid-column: 1 / -1; }
}
.dk { font-size: 12px; color: #909399; }
.dv { font-size: 13px; color: #303133; font-weight: 500; word-break: break-all; white-space: normal; text-align: left; }
.detail-img { max-width: 160px; max-height: 160px; border-radius: 8px; border: 1px solid var(--border-color, #e4e7ed); display: block; }

/* ---- Animations ---- */
.modal-fade-enter-active { transition: opacity 0.2s ease; .modal-card { transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease; } }
.modal-fade-leave-active { transition: opacity 0.2s ease; .modal-card { transition: transform 0.15s ease, opacity 0.15s ease; } }
.modal-fade-enter-from { opacity: 0; .modal-card { transform: scale(0.9) translateY(16px); opacity: 0; } }
.modal-fade-leave-to { opacity: 0; .modal-card { transform: scale(0.95); opacity: 0; } }

/* ---- Dark Mode ---- */
html.dark-mode {
  .filter-card, .table-card { background: var(--card-bg); border-color: var(--border-color); }
  .data-table th { background: var(--bg-color); border-color: var(--border-color); color: var(--text-primary); }
  .data-table td { border-color: var(--border-color); color: var(--text-primary); background: var(--card-bg); }
  .data-table tbody tr:hover td { background: var(--hover-bg); }
  .filter-input, .filter-select { background: var(--bg-color); color: var(--text-primary); box-shadow: inset 0 1px 3px rgba(0,0,0,0.15); }
  .filter-input:focus { background: var(--card-bg); box-shadow: 0 0 0 2px rgba(251,114,153,0.3); }
  .pg-btn { background: var(--card-bg); border-color: var(--border-color); color: var(--text-primary); }
  .page-size-sel { background: var(--card-bg); border-color: var(--border-color); color: var(--text-primary); }
  .modal-card { background: var(--card-bg); }
  .modal-header {
    h3 { color: var(--text-primary); }
    .modal-close { color: var(--text-secondary); &:hover { color: var(--text-primary); background: var(--bg-color); } }
  }
  .modal-footer { border-color: var(--border-color); }
  .fl, .dk { color: var(--text-secondary); }
  .fi { background: var(--bg-color); color: var(--text-primary); border-color: var(--border-color); }
  .fi:focus { background: var(--card-bg); box-shadow: 0 0 0 2px rgba(251,114,153,0.3); }
  .seg-btn { background: var(--bg-color); border-color: var(--border-color); color: var(--text-primary); &.active { border-color: var(--color-primary); color: var(--color-primary); background: rgba(251,114,153,0.12); } }
  .cover-upload, .img-add { background: var(--bg-color); border-color: var(--border-color); }
  .img-thumb { border-color: var(--border-color); }
  .dv { color: var(--text-primary); }
  .sort-num { background: var(--bg-color); color: var(--text-primary); }
  .btn-detail { color: #79bbff !important; }
  .btn-edit { color: #ffd54f !important; }
  .btn-delete { color: #f87171 !important; }
  .sticky-col { background: var(--card-bg); }
  .table-row:hover .sticky-col { background: var(--hover-bg); }
}
</style>
