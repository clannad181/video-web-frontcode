<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">字典管理</h1>
      <p class="page-subtitle">维护系统字典类型及其字典数据，供下拉框、枚举等场景复用</p>
    </div>

    <div class="split-layout">
      <!-- ========== 左：字典类型 ========== -->
      <section class="panel">
        <div class="panel-head">
          <div class="panel-head-text">
            <h2 class="panel-title">字典类型</h2>
            <span class="panel-sub">共 {{ typeTotal }} 条</span>
          </div>
          <button class="btn btn-add btn-sm" @click="openTypeModal(null)">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
            新增类型
          </button>
        </div>

        <div class="panel-filter is-type">
          <input v-model="typeQuery.typeCode" class="filter-input" placeholder="类型编码" @keyup.enter="searchTypes" />
          <input v-model="typeQuery.typeName" class="filter-input" placeholder="类型名称" @keyup.enter="searchTypes" />
          <div class="select-wrap" :class="{ open: typeStatusOpen }">
            <select v-model="typeQuery.status" class="filter-select" @mousedown="typeStatusOpen = true" @blur="typeStatusOpen = false">
              <option value="">全部状态</option>
              <option :value="true">启用</option>
              <option :value="false">禁用</option>
            </select>
          </div>
          <div class="panel-filter-btns">
            <button class="btn btn-secondary btn-sm" @click="resetTypeQuery">重置</button>
            <button class="btn btn-primary btn-sm" @click="searchTypes">搜索</button>
          </div>
        </div>

        <div class="panel-body table-wrap" v-loading="typeLoading">
          <table class="data-table">
            <thead>
              <tr>
                <th class="sortable th-left" @click="toggleTypeSort('typeName')">
                  字典类型
                  <span class="sort-icon" :class="{ active: typeSort.field === 'typeName' }">
                    <span class="tri tri-up" :class="{ highlight: typeSortDir('typeName') === 'asc' }">▲</span>
                    <span class="tri tri-down" :class="{ highlight: typeSortDir('typeName') === 'desc' }">▼</span>
                  </span>
                </th>
                <th class="col-count">数据量</th>
                <th class="sortable col-status" @click="toggleTypeSort('status')">
                  状态
                  <span class="sort-icon" :class="{ active: typeSort.field === 'status' }">
                    <span class="tri tri-up" :class="{ highlight: typeSortDir('status') === 'asc' }">▲</span>
                    <span class="tri tri-down" :class="{ highlight: typeSortDir('status') === 'desc' }">▼</span>
                  </span>
                </th>
                <th class="col-act">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="typeRecords.length === 0 && !typeLoading">
                <td colspan="4" class="empty-row">暂无字典类型</td>
              </tr>
              <tr v-for="row in typeRecords" :key="row.id" class="table-row type-row"
                :class="{ selected: selectedType && selectedType.id === row.id }" @click="selectType(row)">
                <td class="cell-name">
                  <div class="cell-line1">
                    <span class="cell-bold">{{ row.typeName }}</span>
                    <span v-if="row.isSystem" class="tag-sys">内置</span>
                  </div>
                  <div class="cell-code">{{ row.typeCode }}</div>
                </td>
                <td><span class="sort-num">{{ row.dataCount ?? 0 }}</span></td>
                <td class="col-status">
                  <span class="status-badge" :class="row.status ? 'active' : 'inactive'">{{ row.status ? '启用' : '禁用' }}</span>
                </td>
                <td class="col-act">
                  <div class="action-group">
                    <button class="btn-action btn-edit" @click.stop="openTypeModal(row)">编辑</button>
                    <button class="btn-action btn-delete" :disabled="row.isSystem"
                      :title="row.isSystem ? '系统内置字典不可删除' : ''" @click.stop="confirmDeleteType(row)">删除</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="typeTotal > 0" class="panel-foot">
          <div class="page-btns">
            <button class="pg-btn" :disabled="typePage <= 1" @click="goTypePage(typePage - 1)">&#8249;</button>
            <button v-for="p in typePages" :key="'t' + p" class="pg-btn" :class="{ active: typePage === p }" @click="goTypePage(p)">{{ p }}</button>
            <button class="pg-btn" :disabled="typePage >= typePages.length" @click="goTypePage(typePage + 1)">&#8250;</button>
          </div>
          <select v-model.number="typeSize" class="page-size-sel">
            <option :value="10">10 条/页</option>
            <option :value="20">20 条/页</option>
            <option :value="50">50 条/页</option>
          </select>
        </div>
      </section>

      <!-- ========== 右：字典数据 ========== -->
      <section class="panel">
        <div class="panel-head">
          <div class="panel-head-text">
            <h2 class="panel-title">字典数据</h2>
            <span class="panel-sub" v-if="selectedType">
              {{ selectedType.typeName }}
              <code class="type-code-chip">{{ selectedType.typeCode }}</code>
            </span>
            <span class="panel-sub" v-else>未选择字典类型</span>
          </div>
          <button class="btn btn-add btn-sm" :disabled="!selectedType" @click="openDataModal(null)">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
            新增数据
          </button>
        </div>

        <div class="panel-filter is-data">
          <input v-model="dataQuery.label" class="filter-input" placeholder="字典标签" :disabled="!selectedType" @keyup.enter="searchDatas" />
          <div class="select-wrap" :class="{ open: dataStatusOpen }">
            <select v-model="dataQuery.status" class="filter-select" :disabled="!selectedType" @mousedown="dataStatusOpen = true" @blur="dataStatusOpen = false">
              <option value="">全部状态</option>
              <option :value="true">启用</option>
              <option :value="false">禁用</option>
            </select>
          </div>
          <div class="panel-filter-btns">
            <button class="btn btn-secondary btn-sm" :disabled="!selectedType" @click="resetDataQuery">重置</button>
            <button class="btn btn-primary btn-sm" :disabled="!selectedType" @click="searchDatas">搜索</button>
          </div>
        </div>

        <div class="panel-body table-wrap" v-loading="dataLoading">
          <div v-if="!selectedType" class="empty-state">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18" /><path d="M9 9v11" /></svg>
            <p>请先在左侧选择字典类型</p>
            <span>选中后可在此维护该类型下的标签、值、排序与默认项</span>
          </div>

          <table v-else class="data-table">
            <thead>
              <tr>
                <th class="sortable th-left" @click="toggleDataSort('label')">
                  字典标签
                  <span class="sort-icon" :class="{ active: dataSort.field === 'label' }">
                    <span class="tri tri-up" :class="{ highlight: dataSortDir('label') === 'asc' }">▲</span>
                    <span class="tri tri-down" :class="{ highlight: dataSortDir('label') === 'desc' }">▼</span>
                  </span>
                </th>
                <th class="sortable th-left" @click="toggleDataSort('value')">
                  字典值
                  <span class="sort-icon" :class="{ active: dataSort.field === 'value' }">
                    <span class="tri tri-up" :class="{ highlight: dataSortDir('value') === 'asc' }">▲</span>
                    <span class="tri tri-down" :class="{ highlight: dataSortDir('value') === 'desc' }">▼</span>
                  </span>
                </th>
                <th class="sortable col-sort" @click="toggleDataSort('sort')">
                  排序
                  <span class="sort-icon" :class="{ active: dataSort.field === 'sort' }">
                    <span class="tri tri-up" :class="{ highlight: dataSortDir('sort') === 'asc' }">▲</span>
                    <span class="tri tri-down" :class="{ highlight: dataSortDir('sort') === 'desc' }">▼</span>
                  </span>
                </th>
                <th class="col-flag">默认</th>
                <th class="sortable col-status" @click="toggleDataSort('status')">
                  状态
                  <span class="sort-icon" :class="{ active: dataSort.field === 'status' }">
                    <span class="tri tri-up" :class="{ highlight: dataSortDir('status') === 'asc' }">▲</span>
                    <span class="tri tri-down" :class="{ highlight: dataSortDir('status') === 'desc' }">▼</span>
                  </span>
                </th>
                <th class="th-left">备注</th>
                <th class="col-act">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="dataRecords.length === 0 && !dataLoading">
                <td colspan="7" class="empty-row">该类型下暂无字典数据</td>
              </tr>
              <tr v-for="row in dataRecords" :key="row.id" class="table-row">
                <td class="cell-bold cell-left">{{ row.label }}</td>
                <td class="cell-mono cell-left">{{ row.value }}</td>
                <td class="col-sort"><span class="sort-num">{{ row.sort ?? 0 }}</span></td>
                <td class="col-flag">
                  <span v-if="row.isDefault" class="tag-default">默认</span>
                  <span v-else class="cell-muted">—</span>
                </td>
                <td class="col-status">
                  <span class="status-badge" :class="row.status ? 'active' : 'inactive'">{{ row.status ? '启用' : '禁用' }}</span>
                </td>
                <td class="cell-muted cell-left cell-ellipsis" :title="row.remark || ''">{{ row.remark || '—' }}</td>
                <td class="col-act">
                  <div class="action-group">
                    <button class="btn-action btn-edit" @click="openDataModal(row)">编辑</button>
                    <button class="btn-action btn-delete" @click="confirmDeleteData(row)">删除</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="selectedType && dataTotal > 0" class="panel-foot">
          <div class="page-btns">
            <button class="pg-btn" :disabled="dataPage <= 1" @click="goDataPage(dataPage - 1)">&#8249;</button>
            <button v-for="p in dataPages" :key="'d' + p" class="pg-btn" :class="{ active: dataPage === p }" @click="goDataPage(p)">{{ p }}</button>
            <button class="pg-btn" :disabled="dataPage >= dataPages.length" @click="goDataPage(dataPage + 1)">&#8250;</button>
          </div>
          <select v-model.number="dataSize" class="page-size-sel">
            <option :value="10">10 条/页</option>
            <option :value="20">20 条/页</option>
            <option :value="50">50 条/页</option>
          </select>
        </div>
      </section>
    </div>

    <!-- ========== 字典类型弹窗 ========== -->
    <teleport to="body">
      <transition name="modal-fade">
        <div v-if="showTypeModal" class="modal-overlay" @click.self="closeTypeModal">
          <div class="modal-card modal-std" @click.stop>
            <div class="modal-header">
              <h3>{{ typeForm.id ? '编辑字典类型' : '新增字典类型' }}</h3>
              <button class="modal-close" @click="closeTypeModal">&times;</button>
            </div>
            <div class="modal-body">
              <div class="fg">
                <label class="fl">类型编码 <span class="req">*</span>
                  <span v-if="typeForm.isSystem && typeForm.id" class="tag-sys">系统内置</span>
                </label>
                <input v-model="typeForm.typeCode" class="fi" placeholder="如：video_status"
                  :disabled="typeForm.isSystem && !!typeForm.id" />
                <span class="fh">{{ typeForm.isSystem && typeForm.id ? '系统内置字典不可修改编码' : '全局唯一，用于按编码获取字典数据' }}</span>
              </div>
              <div class="fg">
                <label class="fl">类型名称 <span class="req">*</span></label>
                <input v-model="typeForm.typeName" class="fi" placeholder="如：视频状态" />
                <span class="fh">全局唯一</span>
              </div>
              <div class="fg">
                <label class="fl">备注</label>
                <input v-model="typeForm.remark" class="fi" placeholder="选填，说明该字典的用途" />
              </div>
              <div class="fg">
                <label class="fl">状态</label>
                <div class="toggle-wrap" @click="typeForm.status = !typeForm.status">
                  <button class="toggle-btn" :class="{ on: typeForm.status }"><span class="toggle-knob"></span></button>
                  <span class="toggle-label">{{ typeForm.status ? '启用' : '禁用' }}</span>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="closeTypeModal">取消</button>
              <button class="btn btn-primary" @click="saveType">确认</button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- ========== 字典数据弹窗 ========== -->
    <teleport to="body">
      <transition name="modal-fade">
        <div v-if="showDataModal" class="modal-overlay" @click.self="closeDataModal">
          <div class="modal-card modal-std" @click.stop>
            <div class="modal-header">
              <h3>{{ dataForm.id ? '编辑字典数据' : '新增字典数据' }}</h3>
              <button class="modal-close" @click="closeDataModal">&times;</button>
            </div>
            <div class="modal-body">
              <div class="fg">
                <label class="fl">所属类型 <span class="req">*</span></label>
                <div class="select-wrap" :class="{ open: dataFormTypeOpen }">
                  <select v-model="dataForm.typeCode" class="filter-select" :disabled="typeOptions.length === 0"
                    @mousedown="dataFormTypeOpen = true" @blur="dataFormTypeOpen = false">
                    <option v-for="t in typeOptions" :key="t.id" :value="t.typeCode">{{ t.typeName }}（{{ t.typeCode }}）</option>
                  </select>
                </div>
                <span class="fh">切换类型会将该条数据移动到目标类型下</span>
              </div>
              <div class="fg">
                <label class="fl">字典标签 <span class="req">*</span></label>
                <input v-model="dataForm.label" class="fi" placeholder="如：已发布" />
                <span class="fh">展示给用户的文案，同类型下唯一</span>
              </div>
              <div class="fg">
                <label class="fl">字典值 <span class="req">*</span></label>
                <input v-model="dataForm.value" class="fi" placeholder="如：published" />
                <span class="fh">业务取值，同类型下唯一</span>
              </div>
              <div class="fg fg-half">
                <label class="fl">排序</label>
                <input v-model.number="dataForm.sort" class="fi" type="number" placeholder="0" />
                <span class="fh">升序，越小越靠前</span>
              </div>
              <div class="fg">
                <label class="fl">是否默认</label>
                <div class="toggle-wrap" @click="dataForm.isDefault = !dataForm.isDefault">
                  <button class="toggle-btn" :class="{ on: dataForm.isDefault }"><span class="toggle-knob"></span></button>
                  <span class="toggle-label">{{ dataForm.isDefault ? '默认项' : '非默认' }}</span>
                </div>
              </div>
              <div class="fg">
                <label class="fl">备注</label>
                <input v-model="dataForm.remark" class="fi" placeholder="选填" />
              </div>
              <div class="fg">
                <label class="fl">状态</label>
                <div class="toggle-wrap" @click="dataForm.status = !dataForm.status">
                  <button class="toggle-btn" :class="{ on: dataForm.status }"><span class="toggle-knob"></span></button>
                  <span class="toggle-label">{{ dataForm.status ? '启用' : '禁用' }}</span>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="closeDataModal">取消</button>
              <button class="btn btn-primary" @click="saveData">确认</button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getDictTypeList, addDictType, updateDictType, deleteDictType,
  getDictDataList, addDictData, updateDictData, deleteDictData
} from '@/api/dict'

// 业务错误（code!=200）由拦截器 reject 且不弹提示；HTTP 错误拦截器已弹过，避免重复
function showError(e, fallback) {
  if (!e?.response) ElMessage.error(e.message || fallback)
}

// ===================== 字典类型 =====================
const typeLoading = ref(false)
const typeRecords = ref([])
const typeTotal = ref(0)
const typePage = ref(1)
const typeSize = ref(10)
const typeStatusOpen = ref(false)
const typeQuery = reactive({ typeCode: '', typeName: '', status: '' })
const typeApplied = reactive({ typeCode: '', typeName: '', status: '' })
const typeSort = reactive({ field: '', descOrAsc: '' })

const typePages = computed(() => {
  const n = Math.max(1, Math.ceil(typeTotal.value / typeSize.value))
  return Array.from({ length: n }, (_, i) => i + 1)
})

async function fetchTypes() {
  typeLoading.value = true
  try {
    const params = { page: typePage.value, size: typeSize.value }
    if (typeApplied.typeCode) params.typeCode = typeApplied.typeCode
    if (typeApplied.typeName) params.typeName = typeApplied.typeName
    if (typeApplied.status !== '') params.status = typeApplied.status
    if (typeSort.field) {
      params.field = typeSort.field
      params.descOrAsc = typeSort.descOrAsc
    }
    const res = await getDictTypeList(params)
    typeRecords.value = res.data?.records || []
    typeTotal.value = res.data?.total ?? 0
    ensureSelection()
  } catch (e) {
    showError(e, '加载字典类型失败')
  } finally {
    typeLoading.value = false
  }
}

function searchTypes() {
  typeApplied.typeCode = typeQuery.typeCode.trim()
  typeApplied.typeName = typeQuery.typeName.trim()
  typeApplied.status = typeQuery.status
  typePage.value = 1
  fetchTypes()
}

function resetTypeQuery() {
  typeQuery.typeCode = ''
  typeQuery.typeName = ''
  typeQuery.status = ''
  typeApplied.typeCode = ''
  typeApplied.typeName = ''
  typeApplied.status = ''
  typeSort.field = ''
  typeSort.descOrAsc = ''
  typePage.value = 1
  fetchTypes()
}

function goTypePage(p) {
  if (p < 1 || p > typePages.value.length || p === typePage.value) return
  typePage.value = p
  fetchTypes()
}

function toggleTypeSort(field) {
  if (typeSort.field !== field) {
    typeSort.field = field
    typeSort.descOrAsc = 'asc'
  } else if (typeSort.descOrAsc === 'asc') {
    typeSort.descOrAsc = 'desc'
  } else {
    typeSort.field = ''
    typeSort.descOrAsc = ''
  }
  typePage.value = 1
  fetchTypes()
}

function typeSortDir(field) {
  return typeSort.field === field ? typeSort.descOrAsc : ''
}

// ===================== 字典数据 =====================
const selectedType = ref(null)
const dataLoading = ref(false)
const dataRecords = ref([])
const dataTotal = ref(0)
const dataPage = ref(1)
const dataSize = ref(10)
const dataStatusOpen = ref(false)
const dataQuery = reactive({ label: '', status: '' })
const dataApplied = reactive({ label: '', status: '' })
const dataSort = reactive({ field: '', descOrAsc: '' })

const dataPages = computed(() => {
  const n = Math.max(1, Math.ceil(dataTotal.value / dataSize.value))
  return Array.from({ length: n }, (_, i) => i + 1)
})

function ensureSelection() {
  if (!selectedType.value) {
    if (typeRecords.value.length) {
      selectType(typeRecords.value[0])
    } else {
      dataRecords.value = []
      dataTotal.value = 0
    }
    return
  }
  const found = typeRecords.value.find(r => r.id === selectedType.value.id)
  if (found) selectedType.value = found
}

function selectType(row) {
  if (selectedType.value && selectedType.value.id === row.id) return
  selectedType.value = row
  dataPage.value = 1
  dataQuery.label = ''
  dataQuery.status = ''
  dataApplied.label = ''
  dataApplied.status = ''
  dataSort.field = ''
  dataSort.descOrAsc = ''
  fetchDatas()
}

async function fetchDatas() {
  if (!selectedType.value) {
    dataRecords.value = []
    dataTotal.value = 0
    return
  }
  dataLoading.value = true
  try {
    const params = { page: dataPage.value, size: dataSize.value, typeCode: selectedType.value.typeCode }
    if (dataApplied.label) params.label = dataApplied.label
    if (dataApplied.status !== '') params.status = dataApplied.status
    if (dataSort.field) {
      params.field = dataSort.field
      params.descOrAsc = dataSort.descOrAsc
    }
    const res = await getDictDataList(params)
    dataRecords.value = res.data?.records || []
    dataTotal.value = res.data?.total ?? 0
  } catch (e) {
    showError(e, '加载字典数据失败')
  } finally {
    dataLoading.value = false
  }
}

function searchDatas() {
  dataApplied.label = dataQuery.label.trim()
  dataApplied.status = dataQuery.status
  dataPage.value = 1
  fetchDatas()
}

function resetDataQuery() {
  dataQuery.label = ''
  dataQuery.status = ''
  dataApplied.label = ''
  dataApplied.status = ''
  dataSort.field = ''
  dataSort.descOrAsc = ''
  dataPage.value = 1
  fetchDatas()
}

function goDataPage(p) {
  if (p < 1 || p > dataPages.value.length || p === dataPage.value) return
  dataPage.value = p
  fetchDatas()
}

function toggleDataSort(field) {
  if (dataSort.field !== field) {
    dataSort.field = field
    dataSort.descOrAsc = 'asc'
  } else if (dataSort.descOrAsc === 'asc') {
    dataSort.descOrAsc = 'desc'
  } else {
    dataSort.field = ''
    dataSort.descOrAsc = ''
  }
  dataPage.value = 1
  fetchDatas()
}

function dataSortDir(field) {
  return dataSort.field === field ? dataSort.descOrAsc : ''
}

// 切换每页条数
watch(typeSize, () => { typePage.value = 1; fetchTypes() })
watch(dataSize, () => { dataPage.value = 1; fetchDatas() })

// ===================== 字典类型弹窗 =====================
const showTypeModal = ref(false)
const typeForm = reactive({ id: null, typeCode: '', typeName: '', remark: '', status: true, isSystem: false })

function openTypeModal(row) {
  if (row) {
    typeForm.id = row.id
    typeForm.typeCode = row.typeCode
    typeForm.typeName = row.typeName
    typeForm.remark = row.remark || ''
    typeForm.status = !!row.status
    typeForm.isSystem = !!row.isSystem
  } else {
    typeForm.id = null
    typeForm.typeCode = ''
    typeForm.typeName = ''
    typeForm.remark = ''
    typeForm.status = true
    typeForm.isSystem = false
  }
  showTypeModal.value = true
}

function closeTypeModal() { showTypeModal.value = false }

async function saveType() {
  const typeCode = typeForm.typeCode.trim()
  const typeName = typeForm.typeName.trim()
  if (!typeCode) { ElMessage.warning('字典类型编码不能为空'); return }
  if (!typeName) { ElMessage.warning('字典类型名称不能为空'); return }
  try {
    if (typeForm.id) {
      const payload = { id: typeForm.id, typeName, remark: typeForm.remark, status: typeForm.status }
      // 系统内置类型不下发 typeCode，规避后端「系统内置字典不可修改编码」
      if (!typeForm.isSystem) payload.typeCode = typeCode
      await updateDictType(payload)
      ElMessage.success('字典类型更新成功')
    } else {
      await addDictType({ typeCode, typeName, remark: typeForm.remark, status: typeForm.status })
      ElMessage.success('字典类型创建成功')
    }
    closeTypeModal()
    fetchTypes()
    loadTypeOptions()
  } catch (e) {
    showError(e, '保存字典类型失败')
  }
}

async function confirmDeleteType(row) {
  if (row.isSystem) {
    ElMessage.warning('系统内置字典不可删除')
    return
  }
  try {
    await ElMessageBox.confirm(
      `确定要删除字典类型「${row.typeName}」吗？其下 ${row.dataCount ?? 0} 条字典数据将一并删除。`,
      '删除确认',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    )
    await deleteDictType(row.id)
    ElMessage.success('删除成功')
    if (selectedType.value && selectedType.value.id === row.id) selectedType.value = null
    fetchTypes()
    loadTypeOptions()
  } catch (e) {
    if (e !== 'cancel') showError(e, '删除字典类型失败')
  }
}

// ===================== 字典数据弹窗 =====================
const showDataModal = ref(false)
const dataFormTypeOpen = ref(false)
const dataForm = reactive({ id: null, typeCode: '', label: '', value: '', sort: 0, isDefault: false, remark: '', status: true })
const typeOptions = ref([])

async function loadTypeOptions() {
  try {
    const res = await getDictTypeList({ page: 1, size: 500 })
    typeOptions.value = (res.data?.records || []).map(t => ({ id: t.id, typeCode: t.typeCode, typeName: t.typeName }))
  } catch { /* 下拉选项加载失败不阻断主流程 */ }
}

function openDataModal(row) {
  if (!selectedType.value) {
    ElMessage.warning('请先选择字典类型')
    return
  }
  if (typeOptions.value.length === 0) loadTypeOptions()
  if (row) {
    dataForm.id = row.id
    dataForm.typeCode = row.typeCode
    dataForm.label = row.label
    dataForm.value = row.value
    dataForm.sort = row.sort ?? 0
    dataForm.isDefault = !!row.isDefault
    dataForm.remark = row.remark || ''
    dataForm.status = !!row.status
  } else {
    dataForm.id = null
    dataForm.typeCode = selectedType.value.typeCode
    dataForm.label = ''
    dataForm.value = ''
    dataForm.sort = 0
    dataForm.isDefault = false
    dataForm.remark = ''
    dataForm.status = true
  }
  showDataModal.value = true
}

function closeDataModal() { showDataModal.value = false }

async function saveData() {
  const typeCode = dataForm.typeCode
  const label = dataForm.label.trim()
  const value = dataForm.value.trim()
  if (!typeCode) { ElMessage.warning('字典类型编码不能为空'); return }
  if (!label) { ElMessage.warning('字典标签不能为空'); return }
  if (!value) { ElMessage.warning('字典值不能为空'); return }
  const payload = {
    typeCode, label, value,
    sort: dataForm.sort === '' || dataForm.sort == null ? 0 : Number(dataForm.sort),
    isDefault: dataForm.isDefault,
    remark: dataForm.remark,
    status: dataForm.status
  }
  try {
    if (dataForm.id) {
      await updateDictData({ id: dataForm.id, ...payload })
      ElMessage.success('字典数据更新成功')
    } else {
      await addDictData(payload)
      ElMessage.success('字典数据创建成功')
    }
    closeDataModal()
    fetchDatas()
    fetchTypes()
  } catch (e) {
    showError(e, '保存字典数据失败')
  }
}

async function confirmDeleteData(row) {
  try {
    await ElMessageBox.confirm(`确定要删除字典数据「${row.label}」吗？`, '删除确认', {
      confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
    })
    await deleteDictData(row.id)
    ElMessage.success('删除成功')
    fetchDatas()
    fetchTypes()
  } catch (e) {
    if (e !== 'cancel') showError(e, '删除字典数据失败')
  }
}

onMounted(() => {
  fetchTypes()
  loadTypeOptions()
})
</script>

<style lang="scss" scoped>
/* ---- Page ---- */
.page-container { padding: 0; }
.page-header { margin-bottom: 20px; }
.page-title { font-size: 22px; font-weight: 700; color: var(--el-text-color-primary, #303133); margin: 0 0 4px; }
.page-subtitle { font-size: 13px; color: var(--el-text-color-secondary, #909399); margin: 0; }

/* ---- Split ---- */
.split-layout {
  display: grid;
  grid-template-columns: 440px minmax(0, 1fr);
  gap: 16px;
  align-items: stretch;
  height: calc(100vh - 190px);
  min-height: 480px;
}

@media (max-width: 1200px) {
  .split-layout { grid-template-columns: minmax(0, 1fr); height: auto; min-height: 0; }
}

/* ---- Panel ---- */
.panel {
  background: var(--card-bg, #fff);
  border: 1px solid var(--border-color, #e4e7ed);
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 18px 14px;
  border-bottom: 1px solid var(--border-color, #f2f3f5);
  flex-shrink: 0;
}

.panel-head-text { display: flex; align-items: baseline; gap: 10px; min-width: 0; flex-wrap: wrap; }
.panel-title { margin: 0; font-size: 16px; font-weight: 600; color: var(--text-primary, #303133); }
.panel-sub { font-size: 12px; color: var(--text-secondary, #909399); display: inline-flex; align-items: center; gap: 6px; }

.type-code-chip {
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 11.5px;
  padding: 2px 7px;
  border-radius: 6px;
  background: rgba(0, 161, 214, 0.1);
  color: #00a1d6;
}

.panel-filter {
  display: grid;
  gap: 10px;
  padding: 14px 18px;
  background: var(--bg-color, #f8f9fc);
  border-bottom: 1px solid var(--border-color, #f2f3f5);
  flex-shrink: 0;

  /* 左栏：两列，第二行 = 状态 + 操作按钮 */
  &.is-type { grid-template-columns: repeat(2, minmax(0, 1fr)); }

  /* 右栏：标签 / 状态 / 操作按钮 同一行 */
  &.is-data { grid-template-columns: minmax(0, 300px) minmax(0, 170px) minmax(0, 1fr); }

  .panel-filter-btns { display: flex; justify-content: flex-end; align-items: center; gap: 8px; min-width: 0; }
}

@media (max-width: 1200px) {
  .panel-filter.is-data { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .panel-filter.is-data .panel-filter-btns { grid-column: 1 / -1; }
}

.panel-body {
  flex: 1 1 auto;
  min-height: 180px;
  min-width: 0;
  overflow: auto;

  &::-webkit-scrollbar { width: 6px; height: 6px; }
  &::-webkit-scrollbar-thumb { border-radius: 3px; background: rgba(0, 0, 0, 0.15); }

  .data-table { min-width: 0; }
}

.panel-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 18px;
  border-top: 1px solid var(--border-color, #f2f3f5);
  flex-wrap: wrap;
  flex-shrink: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 100%;
  box-sizing: border-box;
  padding: 48px 20px;
  color: var(--text-secondary, #909399);

  p { margin: 4px 0 0; font-size: 14px; font-weight: 500; color: var(--text-primary, #606266); }
  span { font-size: 12.5px; }
  svg { color: var(--border-color, #dcdfe6); }
}

/* ---- Filter controls ---- */
.filter-input,
.filter-select {
  height: 36px;
  border-radius: 10px;
  border: none;
  padding: 0 12px;
  font-size: 13px;
  background-color: var(--card-bg, #fff);
  outline: none;
  transition: all 0.2s;
  color: var(--text-primary, #303133);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.06);
  width: 100%;
  box-sizing: border-box;

  &::placeholder { color: var(--text-secondary, #c0c4cc); }
  &:focus { box-shadow: 0 0 0 2px rgba(251, 114, 153, 0.25); }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
}

.filter-select { cursor: pointer; appearance: none; padding-right: 30px; }

.select-wrap {
  position: relative;

  &::after {
    content: '';
    position: absolute;
    right: 11px;
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

  &:hover::after { border-top-color: var(--color-primary, #fb7299); }
  &.open::after { border-top-color: var(--color-primary, #fb7299); transform: translateY(-40%) rotate(180deg); }
}

/* ---- Buttons ---- */
.btn {
  height: 34px;
  padding: 0 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.25s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  white-space: nowrap;

  svg { flex-shrink: 0; }

  &.btn-sm { height: 30px; padding: 0 13px; font-size: 12.5px; border-radius: 7px; }

  &.btn-primary {
    background: linear-gradient(135deg, var(--color-primary, #fb7299) 0%, #ff9ac6 100%);
    color: #fff;
    box-shadow: 0 2px 8px rgba(251, 114, 153, 0.25);

    &:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(251, 114, 153, 0.4); }
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
    box-shadow: 0 2px 8px rgba(251, 114, 153, 0.25);

    &:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(251, 114, 153, 0.4); }
    &:active { transform: translateY(0); }
  }

  &:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; box-shadow: none; }
}

/* ---- Table ---- */
.data-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 13px;

  th {
    padding: 11px 10px;
    text-align: center;
    font-size: 12px;
    letter-spacing: 0.3px;
    color: var(--text-secondary, #909399);
    background: var(--bg-color, #f8f9fc);
    font-weight: 600;
    white-space: nowrap;
    border-bottom: 1px solid var(--border-color, #e4e7ed);

    &.th-left { text-align: left; }

    &.sortable {
      cursor: pointer;
      user-select: none;
      &:hover { color: var(--color-primary, #fb7299); }
    }
  }

  td {
    padding: 11px 10px;
    border-bottom: 1px solid var(--border-color, #f2f3f5);
    vertical-align: middle;
    background: var(--card-bg, #fff);
    text-align: center;
    white-space: nowrap;
  }

  .table-row { cursor: default; }
  .type-row { cursor: pointer; }

  .table-row:hover td { background: var(--bg-color, #fafafa); }
  .type-row.selected td { background: rgba(251, 114, 153, 0.07); }
  .type-row.selected .cell-bold { color: var(--color-primary, #fb7299); }

  .col-sort { width: 58px; }
  .col-count { width: 64px; }
  .col-status { width: 72px; }
  .col-flag { width: 58px; }
  .col-act { width: 116px; }
}

/* 提高优先级，避免被 .data-table td { text-align: center } 覆盖 */
.data-table .cell-name,
.data-table .cell-left { text-align: left; }

.cell-name { text-align: left; }
.cell-line1 { display: flex; align-items: center; gap: 6px; }
.cell-left { text-align: left; }
.cell-ellipsis { max-width: 150px; overflow: hidden; text-overflow: ellipsis; }
.cell-bold { font-weight: 600; color: var(--text-primary, #303133); }
.cell-muted { color: var(--text-secondary, #909399); }

.cell-code {
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 11.5px;
  color: var(--text-secondary, #909399);
  margin-top: 3px;
}

.cell-mono {
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 12.5px;
  color: var(--text-secondary, #606266);
}

.sort-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 22px;
  padding: 0 6px;
  background: var(--bg-color, #f5f7fa);
  border-radius: 6px;
  font-size: 12.5px;
  font-weight: 500;
  color: var(--text-primary, #606266);
}

.status-badge {
  display: inline-block;
  padding: 2px 9px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 500;

  &.active { color: #67c23a; background: rgba(103, 194, 58, 0.1); }
  &.inactive { color: #f56c6c; background: rgba(245, 108, 108, 0.1); }
}

.tag-sys {
  display: inline-block;
  padding: 1px 7px;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 600;
  color: #e6a23c;
  background: rgba(230, 162, 60, 0.12);
}

.tag-default {
  display: inline-block;
  padding: 1px 8px;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-primary, #fb7299);
  background: rgba(251, 114, 153, 0.12);
}

.action-group { display: flex; gap: 4px; justify-content: center; white-space: nowrap; }

.btn-action {
  padding: 4px 9px;
  border-radius: 100px;
  font-size: 11.5px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-edit { color: #ffc107; background: rgba(255, 193, 7, 0.1); &:hover { color: #fff; background: #ffc107; } }
.btn-delete { color: #f56c6c; background: rgba(245, 108, 108, 0.1); &:hover { color: #fff; background: #f56c6c; } }
.btn-action:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-action:disabled:hover { color: #f56c6c; background: rgba(245, 108, 108, 0.1); }

.empty-row { padding: 34px; text-align: center; color: var(--text-secondary, #909399); }

.sort-icon {
  display: inline-flex;
  flex-direction: column;
  margin-left: 3px;
  vertical-align: middle;
  line-height: 1;
  &.active { opacity: 1; }
  &:not(.active) { opacity: 0.35; }
}

.tri {
  font-size: 9px;
  line-height: 1;
  color: var(--text-secondary, #909399);
  &.highlight { color: var(--color-primary, #fb7299); }
}

/* ---- Pagination ---- */
.page-btns { display: flex; gap: 4px; flex-wrap: wrap; }

.pg-btn {
  min-width: 28px;
  height: 28px;
  padding: 0 6px;
  border-radius: 7px;
  border: 1px solid var(--border-color, #dcdfe6);
  background: var(--card-bg, #fff);
  color: var(--text-primary, #303133);
  font-size: 12.5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover:not(:disabled) { border-color: var(--color-primary, #fb7299); color: var(--color-primary, #fb7299); }
  &.active { background: var(--color-primary, #fb7299); color: #fff; border-color: var(--color-primary, #fb7299); }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
}

.page-size-sel {
  height: 28px;
  border-radius: 7px;
  border: 1px solid var(--border-color, #dcdfe6);
  padding: 0 6px;
  font-size: 12px;
  background: var(--card-bg, #fff);
  color: var(--text-primary, #303133);
  cursor: pointer;
}

/* ---- Modal ---- */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-card {
  background: var(--card-bg, #fff);
  border-radius: 16px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.18);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-std { width: 460px; }

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 26px 14px;
  flex-shrink: 0;

  h3 { margin: 0; font-size: 17px; font-weight: 600; color: var(--text-primary, #303133); }
}

.modal-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: var(--text-secondary, #909399);
  padding: 0;
  line-height: 1;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover { color: var(--text-primary, #303133); background: var(--bg-color, #f5f7fa); }
}

.modal-body { padding: 4px 26px 20px; overflow-y: auto; flex: 1; }

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 15px 26px;
  border-top: 1px solid var(--border-color, #f2f3f5);
  flex-shrink: 0;
}

/* ---- Form ---- */
.fg { margin-bottom: 15px; &:last-child { margin-bottom: 0; } }

.fl {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary, #303133);
  margin-bottom: 6px;
}

.req { color: #f56c6c; }

.fi {
  width: 100%;
  height: 38px;
  border-radius: 10px;
  border: 1.5px solid var(--border-color, #e4e7ed);
  padding: 0 13px;
  font-size: 13px;
  background: var(--card-bg, #fff);
  color: var(--text-primary, #303133);
  outline: none;
  transition: all 0.25s ease;
  box-sizing: border-box;

  &:focus { border-color: var(--color-primary, #fb7299); box-shadow: 0 0 0 3px rgba(251, 114, 153, 0.1); }
  &:disabled { background: var(--bg-color, #f5f7fa); color: var(--text-secondary, #909399); cursor: not-allowed; }
}

.fh {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--text-secondary, #909399);
}

.toggle-wrap { display: flex; align-items: center; gap: 10px; min-height: 38px; cursor: pointer; }

.toggle-btn {
  width: 46px;
  height: 25px;
  border-radius: 13px;
  border: none;
  background: var(--border-color, #dcdfe6);
  cursor: pointer;
  position: relative;
  transition: background 0.25s ease;
  padding: 0;
  flex-shrink: 0;

  &.on { background: var(--color-primary, #fb7299); }
}

.toggle-knob {
  width: 21px;
  height: 21px;
  border-radius: 50%;
  background: #fff;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
}

.toggle-btn.on .toggle-knob { transform: translateX(21px); }
.toggle-label { font-size: 13px; color: var(--text-secondary, #909399); }

/* ---- Animation ---- */
.modal-fade-enter-active { transition: opacity 0.2s ease; .modal-card { transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease; } }
.modal-fade-leave-active { transition: opacity 0.2s ease; .modal-card { transition: transform 0.15s ease, opacity 0.15s ease; } }
.modal-fade-enter-from { opacity: 0; .modal-card { transform: scale(0.9) translateY(16px); opacity: 0; } }
.modal-fade-leave-to { opacity: 0; .modal-card { transform: scale(0.95); opacity: 0; } }

/* ---- Dark Mode ---- */
html.dark-mode {
  .panel { background: var(--card-bg); border-color: var(--border-color); }
  .panel-head, .panel-filter, .panel-foot { border-color: var(--border-color); }
  .panel-filter { background: var(--bg-color); }

  .data-table th { background: var(--bg-color); border-color: var(--border-color); color: var(--text-primary); }
  .data-table td { border-color: var(--border-color); color: var(--text-primary); }
  .data-table tbody tr:hover td { background: var(--hover-bg); }
  .type-row.selected td { background: rgba(251, 114, 153, 0.12); }

  .filter-input, .filter-select, .fi {
    background: var(--bg-color);
    color: var(--text-primary);
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.15);
  }
  .filter-input:focus, .filter-select:focus { background: var(--card-bg); box-shadow: 0 0 0 2px rgba(251, 114, 153, 0.3); }
  .fi:focus { background: var(--card-bg); box-shadow: 0 0 0 3px rgba(251, 114, 153, 0.18); }
  .fi:disabled { background: var(--hover-bg); }

  .pg-btn { background: var(--card-bg); border-color: var(--border-color); color: var(--text-primary); }
  .page-size-sel { background: var(--card-bg); border-color: var(--border-color); color: var(--text-primary); }

  .cell-code, .cell-mono { color: var(--text-secondary); }
  .empty-state p { color: var(--text-primary); }
  .modal-header h3 { color: var(--text-primary); }
  .modal-footer { border-color: var(--border-color); }
  .btn-edit { color: #ffd54f !important; }
  .btn-delete { color: #f87171 !important; }
}
</style>
