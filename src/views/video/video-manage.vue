<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">视频管理</h1>
      <p class="page-subtitle">管理平台所有视频内容，支持搜索、筛选、排序和批量操作</p>
    </div>

    <div class="filter-card">
      <div class="filter-grid">
        <div class="filter-item">
          <label class="filter-label">视频AVID</label>
          <input v-model="filter.id" class="filter-input" placeholder="输入视频ID" @keyup.enter="onSearch" />
        </div>
        <div class="filter-item">
          <label class="filter-label">视频标题</label>
          <input v-model="filter.title" class="filter-input" placeholder="搜索视频标题" @keyup.enter="onSearch" />
        </div>
        <div class="filter-item">
          <label class="filter-label">分类</label>
          <div class="select-wrap" :class="{ open: categoryOpen }">
            <select v-model="filter.categoryId" class="filter-select" @mousedown="categoryOpen = true" @blur="categoryOpen = false">
              <option value="">全部分类</option>
              <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>
        </div>
        <div class="filter-item">
          <label class="filter-label">视频状态</label>
          <div class="select-wrap" :class="{ open: videoStatusOpen }">
            <select v-model="filter.videoStatus" class="filter-select" @mousedown="videoStatusOpen = true" @blur="videoStatusOpen = false">
              <option value="">全部</option>
              <option :value="0">草稿</option>
              <option :value="1">待发布</option>
              <option :value="2">已发布</option>
              <option :value="3">已下架</option>
            </select>
          </div>
        </div>
        <div class="filter-item">
          <label class="filter-label">UP主昵称</label>
          <input v-model="filter.username" class="filter-input" placeholder="输入UP主昵称" @keyup.enter="onSearch" />
        </div>
        <div class="filter-item">
          <label class="filter-label">用户UID</label>
          <input v-model="filter.userId" class="filter-input" placeholder="输入用户ID" @keyup.enter="onSearch" />
        </div>
        <div class="filter-item">
          <label class="filter-label">连载状态</label>
          <div class="select-wrap" :class="{ open: serialStatusOpen }">
            <select v-model="filter.serialStatus" class="filter-select" @mousedown="serialStatusOpen = true" @blur="serialStatusOpen = false">
              <option value="">全部</option>
              <option :value="1">连载中</option>
              <option :value="0">已完结</option>
            </select>
          </div>
        </div>
        <div class="filter-actions">
          <button class="btn btn-outline" @click="onReset">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            重置
          </button>
          <button class="btn btn-primary" @click="onSearch">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            搜索
          </button>
        </div>
      </div>
      <div class="filter-bottom">
        <button class="btn btn-add" @click="openAdd">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
          新增视频
        </button>
      </div>
    </div>

    <div class="table-card">
      <div class="table-wrap" v-loading="loading">
        <table class="data-table">
          <thead>
            <tr>
              <th class="col-index">#</th>
              <th class="col-id">视频AVID</th>
              <th class="col-cover">封面</th>
              <th class="col-title">标题</th>
              <th class="col-user">UP主</th>
              <th class="col-category">分类</th>
              <th class="col-episodes">集数</th>
              <th class="col-sortable" @click="toggleSort('duration')">总时长<span class="sort-icon"><i class="arrow-up"
                    :class="{ active: sortField === 'duration' && sortOrder === 'asc' }"></i><i class="arrow-down"
                    :class="{ active: sortField === 'duration' && sortOrder === 'desc' }"></i></span></th>
              <th class="col-sortable" @click="toggleSort('viewCount')">播放量<span class="sort-icon"><i class="arrow-up"
                    :class="{ active: sortField === 'viewCount' && sortOrder === 'asc' }"></i><i class="arrow-down"
                    :class="{ active: sortField === 'viewCount' && sortOrder === 'desc' }"></i></span></th>
              <th class="col-fav col-sortable" @click="toggleSort('favoriteCount')">收藏<span class="sort-icon"><i
                    class="arrow-up" :class="{ active: sortField === 'favoriteCount' && sortOrder === 'asc' }"></i><i
                    class="arrow-down"
                    :class="{ active: sortField === 'favoriteCount' && sortOrder === 'desc' }"></i></span></th>
              <th class="col-serial">连载</th>
              <th class="col-audit">审核状态</th>
              <th class="col-status">视频状态</th>
              <th class="col-sortable" @click="toggleSort('createTime')">创建时间<span class="sort-icon"><i class="arrow-up"
                    :class="{ active: sortField === 'createTime' && sortOrder === 'asc' }"></i><i class="arrow-down"
                    :class="{ active: sortField === 'createTime' && sortOrder === 'desc' }"></i></span></th>
              <th class="col-action" style="border-left:1px solid var(--border-color,#e4e7ed);background:var(--bg-color,#f8f9fc);">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="tableData.length === 0 && !loading">
              <td colspan="15" class="empty-cell">
                <div class="empty-state">
                  <p>暂无数据</p>
                </div>
              </td>
            </tr>
            <tr v-for="(row, index) in tableData" :key="row.id" class="table-row">
              <td class="col-index">{{ (pagination.page - 1) * pagination.pageSize + index + 1 }}</td>
              <td class="col-id mono">{{ row.avid || '-' }}</td>
              <td class="col-cover">
                <img v-if="row.cover" :src="row.cover" class="cover-thumb" @click="previewCover(row.cover)" />
                <div v-else class="cover-empty"><el-icon :size="16">
                    <VideoPlay />
                  </el-icon></div>
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
              <td class="col-fav mono">{{ formatNumber(row.favoriteCount) }}</td>
              <td class="col-serial"><span class="badge"
                  :class="row.serialStatus === 1 ? 'badge-green' : 'badge-gray'">{{ row.serialStatus === 1 ? '连载中' :
                  '已完结' }}</span></td>
              <td class="col-audit"><span class="badge" :class="auditBadgeCls(row.auditStatus)">{{
                auditLbl(row.auditStatus) }}</span></td>
              <td class="col-status"><span class="badge" :class="statusBadgeCls(row.videoStatus)">{{
                statusLbl(row.videoStatus) }}</span></td>
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
          <button class="pg-btn" :disabled="pagination.page >= totalPages"
            @click="goPage(pagination.page + 1)">&#8250;</button>
        </div>
        <div class="page-size">每页 <select v-model.number="pagination.pageSize" class="size-sel"
            @change="onPageSizeChange">
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
          </select> 条</div>
      </div>
    </div>

    <!-- Detail Modal -->
    <teleport to="body">
      <transition name="modal-fade">
        <div v-if="detailVisible" class="modal-overlay" @click.self="detailVisible = false">
          <div class="modal-card modal-wide" @click.stop>
            <div class="modal-header">
              <h3>视频详情</h3><button class="modal-close" @click="detailVisible = false">&times;</button>
            </div>
            <div class="modal-body" v-loading="detailLoading">
              <div class="detail-layout" v-if="detailData">
                <div class="detail-left">
                  <div class="player-box">
                    <DPlayer v-if="currentPlayUrl" :src="currentPlayUrl" :title="detailData.title"
                      :poster="detailData.cover" height="100%" />
                    <div v-else class="player-empty"><el-icon :size="48" color="#555">
                        <VideoPlay />
                      </el-icon>
                      <p>暂无播放源</p>
                    </div>
                  </div>
                  <div class="detail-desc">
                    <h4>简介</h4>
                    <p>{{ detailData.description || '暂无简介' }}</p>
                  </div>
                  <div class="detail-tags" v-if="detailData.tags?.length"><h4>标签</h4><div class="tag-row"><span v-for="(tag, i) in detailData.tags"
                      :key="i" class="tag-pill">{{ tag }}</span></div></div>
                  <div class="detail-eps" v-if="detailData.episodes?.length > 1">
                    <h4>剧集</h4>
                    <div class="ep-pills">
                      <button v-for="(ep, i) in detailData.episodes" :key="ep.id || i"
                        class="ep-pill" :class="{ active: detailActiveEp === i, 'ep-unreviewed': ep.reviewStatus === 0 }" @click="detailActiveEp = i">{{
                          ep.title ||
                           '第' + (i+1) +
                        '集' }}</button></div>
                  </div>
                </div>
                <div class="detail-right">
                  <div class="detail-title-row">
                    <span class="detail-vtitle">{{ curEpData?.title ? curEpData.title : detailData.title }}</span>
                    <span class="badge" :class="epReviewBadgeCls(curEpData?.reviewStatus)">{{ epReviewLbl(curEpData?.reviewStatus) }}</span>
                  </div>
                  <div class="detail-user">
                    <img v-if="detailData.avatar" :src="detailData.avatar" class="user-avatar" />
                    <div v-else class="user-avatar avatar-fb">{{ (detailData.username || '?')[0].toUpperCase() }}</div>
                    <div>
                      <div class="user-name">{{ detailData.username }}</div>
                      <div class="user-uid">UID: {{ detailData.uid }}</div>
                    </div>
                  </div>
                  <div class="info-grid">
                    <div class="info-item"><span class="il">分类</span><span class="iv">{{ detailData.categoryName || '-'
                        }}</span></div>
                    <div class="info-item"><span class="il">集数</span><span class="iv">{{ detailData.episodes?.length ||
                        '-'
                        }}</span></div>
                    <div class="info-item"><span class="il">总时长</span><span class="iv mono">{{
                      formatDuration(detailData.duration) }}</span></div>
                    <div class="info-item"><span class="il">播放</span><span class="iv mono">{{
                      formatNumber(curEpData?.viewCount ?? detailData.viewCount) }}</span></div>
                    <div class="info-item"><span class="il">收藏</span><span class="iv mono">{{
                      formatNumber(curEpData?.favoriteCount ?? detailData.favoriteCount) }}</span></div>
                    <div class="info-item"><span class="il">点赞</span><span class="iv mono">{{
                      formatNumber(curEpData?.likeCount ?? detailData.likeCount) }}</span></div>
                    <div class="info-item"><span class="il">投币</span><span class="iv mono">{{
                      formatNumber(curEpData?.coinCount ?? detailData.coinCount) }}</span></div>
                    <div class="info-item"><span class="il">观看人数</span><span class="iv mono">{{
                      formatNumber(curEpData?.viewCount ?? detailData.viewCount) }}</span></div>
                  </div>
                  <div class="info-item full"><span class="il">创建时间</span><span class="iv">{{ detailData.createTime
                      }}</span></div>
                  <div class="detail-cover" v-if="detailData.coverUrl || detailData.cover" @click="previewCover(detailData.coverUrl || detailData.cover)">
                    <img :src="detailData.coverUrl || detailData.cover" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- Add/Edit Modal -->
    <teleport to="body">
      <transition name="modal-fade" @after-leave="editClosing = false">
        <div v-if="editVisible" class="modal-overlay" :class="{ closing: editClosing }" @click.self="closeEdit">
          <div class="modal-card modal-wide" @click.stop>
            <div class="modal-header">
              <div class="modal-title-row">
                <h3>{{ isEditing ? '编辑视频' : '新增视频' }}</h3>
                <span class="modal-subtitle">{{ isEditing ? '修改视频信息' : '填写视频基本信息' }}</span>
              </div>
              <button class="modal-close" @click="closeEdit">&times;</button>
            </div>
            <div class="modal-body" style="max-height:70vh;overflow-y:auto">
              <!-- 基本信息 -->
              <div class="form-section">
                <div class="section-title">基本信息</div>
                <div class="form-grid">
                  <div class="fg full"><label class="fl required">视频标题</label><input v-model="editForm.title" class="fi"
                      placeholder="请输入视频标题" maxlength="80" /></div>
                  <div class="fg"><label class="fl required">分类</label><select v-model="editForm.categoryId" class="fs">
                      <option value="">请选择分类</option>
                      <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
                    </select></div>
                  <div class="fg"><label class="fl">连载状态</label>
                    <div class="toggle-wrap" @click="editForm.isOngoing = editForm.isOngoing ? 0 : 1">
                      <div class="toggle-track" :class="{ active: editForm.isOngoing }"><div class="toggle-thumb"></div></div>
                      <span class="toggle-text">{{ editForm.isOngoing ? '连载中' : '已完结' }}</span>
                    </div>
                  </div>
                  <div class="fg full">
                    <label class="fl">封面</label>
                    <div class="cover-row">
                      <div class="cover-upload" @click="$refs.coverInput.click()">
                        <input ref="coverInput" type="file" accept="image/*" style="display:none" @change="onCoverChange" />
                        <img v-if="editForm.coverUrl" :src="editForm.coverUrl" class="cover-preview"
                          @click.stop="coverPreviewVisible = true" />
                        <button v-if="editForm.coverUrl" class="cover-rm-x" @click.stop="editForm.coverUrl = ''">❌</button>
                        <div v-else class="cover-ph">
                          <el-icon :size="28"><Plus /></el-icon>
                          <span>上传封面</span>
                          <span class="cover-hint">建议 16:9 比例</span>
                        </div>
                      </div>
                      <div v-if="uploadedEps.length && !editForm.coverUrl" class="cover-extract">
                        <select v-model="extractEpIndex" class="fs fs-sm" @change="onExtractEpChange">
                          <option :value="-1">选择剧集</option>
                          <option v-for="(ep, i) in uploadedEps" :key="i" :value="ep._idx">第 {{ ep._disp }} 集</option>
                        </select>
                        <button v-if="extractEpIndex >= 0" class="btn btn-sm btn-primary" @click="extractModalVisible = true">
                          截取封面
                        </button>
                      </div>
                    </div>
                    <canvas ref="extractCanvasRef" style="display:none"></canvas>
                  </div>
                  <div class="fg full">
                    <label class="fl">标签</label>
                    <input v-model="tagInput" class="fi tag-input" placeholder="输入标签后按回车添加" @keyup.enter="addTag" />
                    <div v-if="editForm.tags.length" class="tags-list">
                      <span v-for="(tag, i) in editForm.tags" :key="i" class="tag-pill">{{ tag }}<button class="tag-rm"
                          @click="editForm.tags.splice(i, 1)">&times;</button></span>
                    </div>
                  </div>
                  <div class="fg full"><label class="fl">简介</label><textarea v-model="editForm.description" class="fta"
                      rows="3" placeholder="请输入视频简介（选填）"></textarea></div>
                </div>
              </div>
              <!-- 剧集管理 -->
              <div class="form-section">
                <div class="section-title-row">
                  <span class="section-title">剧集管理</span>
                  <button class="btn btn-sm btn-primary" @click="addEditEpisode">+ 添加剧集</button>
                </div>
                <div v-if="editForm.episodes.length === 0" class="ep-empty">
                  <el-icon :size="36" color="#c0c4cc"><VideoPlay /></el-icon>
                  <p>暂无剧集，点击上方添加</p>
                </div>
                <TransitionGroup name="ep-list" tag="div" class="ep-list">
                  <div v-for="(ep, i) in reversedEpisodes" :key="ep._key" class="ep-card">
                    <div class="ep-card-top">
                      <div class="ep-num-badge">第 {{ ep._num }} 集</div>
                      <button class="ep-rm" @click="editForm.episodes.splice(ep._origIdx, 1)" title="删除剧集">&times;</button>
                    </div>
                    <input v-model="editForm.episodes[ep._origIdx].title" class="fi" placeholder="剧集标题" />
                    <div v-if="!ep.playUrl" class="ep-dropzone"
                      :class="{ 'dragover': ep._dragover }"
                      @dragover.prevent="ep._dragover = true"
                      @dragleave="ep._dragover = false"
                      @drop.prevent="ep._dragover = false; onEpFileDrop($event, ep._origIdx)"
                      @click="epRefs[ep._origIdx]?.click()">
                      <input :ref="el => { epRefs[ep._origIdx] = el }" type="file" accept="video/*" style="display:none"
                        @change="e => onEpFileChange(e, ep._origIdx)" />
                      <div class="ep-drop-hint">
                        <el-icon :size="28"><Upload /></el-icon>
                        <span>点击或拖拽视频到此处</span>
                        <span class="ep-drop-sub">支持大文件自动分片上传</span>
                      </div>
                    </div>
                    <div v-if="ep.playUrl" class="ep-preview">
                      <video :src="ep.playUrl" controls preload="metadata" class="ep-video"></video>
                      <button class="ep-video-rm" @click="editForm.episodes[ep._origIdx].playUrl=''; editForm.episodes[ep._origIdx].fileName=''; editForm.episodes[ep._origIdx].duration=0">❌</button>
                    </div>
                    <div v-if="ep.fileName" class="ep-file-info">
                      <el-icon :size="14"><VideoPlay /></el-icon>
                      <span class="file-name">{{ ep.fileName }}</span>
                      <span v-if="ep.duration" class="ep-dur">{{ formatDuration(ep.duration) }}</span>
                    </div>
                  </div>
                </TransitionGroup>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="closeEdit" :disabled="saving">取消</button>
              <button v-if="!isEditing" class="btn btn-ghost" @click="onSave(0)" :disabled="saving">
                {{ saving ? '保存中...' : '存草稿' }}
              </button>
              <button class="btn btn-primary" @click="onSave(1)" :disabled="saving">
                <span v-if="saving" class="btn-loading"></span>
                {{ saving ? '保存中...' : '确定' }}
              </button>
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
            <div class="modal-header">
              <h3>剧集 - {{ episodeVideo?.title }}</h3><button class="modal-close"
                @click="episodeVisible = false">&times;</button>
            </div>
            <div class="modal-body">
              <div class="ep-section">
                <div class="ep-header">
                  <h4>剧集列表</h4><button v-if="episodeVideo?.serialStatus === 1" class="btn-add-ep"
                    @click="addEpManage">+ 添加剧集</button>
                </div>
                <div v-if="episodeList.length === 0" class="ep-empty">暂无剧集</div>
                <div v-for="(ep, i) in episodeList" :key="i" class="ep-card">
                  <div class="ep-card-top"><span class="ep-num">第 {{ ep.episodeNumber || episodeList.length - i }}
                      集</span><button class="ep-rm" @click="episodeList.splice(i, 1)">&times;</button></div>
                  <input v-model="ep.title" class="fi" placeholder="剧集标题" />
                  <div v-if="ep.playUrl" class="ep-preview">
                    <video :src="ep.playUrl" controls preload="metadata" class="ep-video"></video>
                    <button class="ep-video-rm" @click="ep.playUrl=''; ep.fileName=''; ep.duration=0">❌</button>
                  </div>
                  <div v-else class="ep-dropzone"
                    :class="{ 'dragover': ep._dragover }"
                    @dragover.prevent="ep._dragover = true"
                    @dragleave="ep._dragover = false"
                    @drop.prevent="ep._dragover = false; onEmFileDrop($event, i)"
                    @click="emRefs[i]?.click()">
                    <input :ref="el => { emRefs[i] = el }" type="file" accept="video/*" style="display:none"
                      @change="e => onEmFileChange(e, i)" />
                    <div class="ep-drop-hint">
                      <el-icon :size="28"><Upload /></el-icon>
                      <span>点击或拖拽视频到此处</span>
                      <span class="ep-drop-sub">支持大文件自动分片上传</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer"><button class="btn btn-secondary"
                @click="episodeVisible = false">取消</button><button class="btn btn-primary"
                @click="onSaveEpisodes">保存</button></div>
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

    <!-- Extract Frame Modal -->
    <teleport to="body">
      <transition name="modal-fade">
        <div v-if="extractModalVisible" class="modal-overlay" @click.self="extractModalVisible = false">
          <div class="modal-card" style="width:760px" @click.stop>
            <div class="modal-header">
              <div class="modal-title-row">
                <h3>截取封面</h3>
                <span class="modal-subtitle">第 {{ extractEpIndex + 1 }} 集 · 拖动进度条选择帧</span>
              </div>
              <button class="modal-close" @click="extractModalVisible = false">&times;</button>
            </div>
            <div class="modal-body" style="padding:0">
              <div class="extract-modal-player">
                <DPlayer ref="extractDPlayerRef" :src="extractVideoSrc" :autoPlay="false"
                  :controlBtns="['audioTrack','volume','setting','pip','fullScreen']"
                  @timeupdate="onExtractTimeUpdate" @loaded="onExtractLoaded" />
                <div v-if="capturing" class="extract-capturing-overlay">
                  <div class="btn-loading"></div>
                  <span>截取中...</span>
                </div>
              </div>
              <div class="extract-modal-controls">
                <span class="extract-time">{{ formatExtractTime(extractCurrent) }}</span>
                <input type="range" class="extract-slider" :min="0" :max="extractDuration * 10 || 1"
                  :value="extractCurrent * 10" @input="onExtractSeek" />
                <span class="extract-time">{{ formatExtractTime(extractDuration) }}</span>
                <button class="btn btn-sm btn-primary" @click="captureFrame" :disabled="capturing">
                  {{ capturing ? '截取中...' : '截取封面' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- Title Tooltip -->
    <teleport to="body">
      <div v-if="titleTip.visible" class="title-tooltip" :style="{ left: titleTip.x + 'px', top: titleTip.y + 'px' }">{{
        titleTip.text }}</div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { VideoPlay, Plus, Upload } from '@element-plus/icons-vue'
import { formatDuration, formatNumber } from '@/utils/format'
import { getVideoList, getVideoDetail, createVideo, updateVideo, deleteVideo, saveEpisodes } from '@/api/video'
import { getCategoryList } from '@/api/category'
import { uploadFile } from '@/utils/upload'
import DPlayer from '@/components/DPlayer.vue'

const route = useRoute()
const loading = ref(false)
const tableData = ref([])
const categories = ref([])
const categoryOpen = ref(false)
const videoStatusOpen = ref(false)
const serialStatusOpen = ref(false)

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

const auditLbl = (s) => ['未审核', '部分审核', '审核完成'][s] ?? '未知'
const auditBadgeCls = (s) => ['badge-amber', 'badge-blue', 'badge-green'][s] ?? ''
const epReviewLbl = (s) => ['未审核', '审核通过', '已拒绝'][s] ?? '未知'
const epReviewBadgeCls = (s) => ['badge-amber', 'badge-green', 'badge-red'][s] ?? ''
const statusLbl = (s) => ['草稿', '待发布', '已发布', '已下架'][s] || '未知'
const statusBadgeCls = (s) => ['badge-gray', 'badge-amber', 'badge-green', 'badge-red'][s] || ''

const fieldMap = { duration: 1, viewCount: 2, favoriteCount: 3, createTime: 4 }

const buildParams = () => {
  const p = { page: pagination.page, size: pagination.pageSize }
  if (filter.id) p.videoId = filter.id
  if (filter.title) p.title = filter.title
  if (filter.categoryId) p.categoryId = filter.categoryId
  if (filter.videoStatus !== '') p.videoStatus = filter.videoStatus
  if (filter.username) p.nickName = filter.username
  if (filter.userId) p.uid = filter.userId
  if (filter.serialStatus !== '') p.isOngoing = filter.serialStatus === 1
  if (sortField.value) { p.field = fieldMap[sortField.value]; p.descOrAsc = sortOrder.value }
  if (route.query.videoId) p.videoId = route.query.videoId
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
    .then(async () => { await deleteVideo(row.id); ElMessage.success('删除成功'); fetchData() }).catch(() => { })
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
    d.username = d.nickName || d.username || ''
    d.avatar = d.avatarUrl || d.avatar || ''
    d.duration = d.totalDuration || d.duration || 0
    d.viewCount = d.playCount || d.viewCount || 0
    d.likeCount = d.likeCount || 0
    d.coinCount = d.coinCount || 0
    d.favoriteCount = d.favoriteCount || 0
    d.episodes = (d.episodes || []).sort((a, b) => (a.sortOrder ?? a.id) - (b.sortOrder ?? b.id))
    detailData.value = d
  } catch (e) { console.error(e) } finally { detailLoading.value = false }
}

const editVisible = ref(false)
const editClosing = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const saving = ref(false)
const editForm = reactive({ title: '', categoryId: '', coverUrl: '', description: '', isOngoing: 0, tags: [], episodes: [] })
const tagInput = ref('')
const epRefs = ref({})

const resetEditForm = () => {
  Object.assign(editForm, { title: '', categoryId: '', coverUrl: '', description: '', isOngoing: 0, tags: [], episodes: [] })
  tagInput.value = ''; editingId.value = null; saving.value = false
}

const openAdd = () => { isEditing.value = false; resetEditForm(); editVisible.value = true }
const openEdit = async (row) => {
  isEditing.value = true; resetEditForm(); editingId.value = row.id
  try {
    const res = await getVideoDetail(row.id)
    const d = res.data
    Object.assign(editForm, {
      title: d.title, categoryId: d.categoryId, coverUrl: d.coverUrl || '',
      description: d.description || '', isOngoing: d.serialStatus || 0,
      tags: d.tags || [],
      episodes: (d.episodes || []).map(e => ({ id: e.id, episodeNumber: e.episodeNumber, title: e.title, duration: e.duration, playUrl: e.playUrl || '', fileName: '', _dragover: false }))
    })
  } catch (e) { console.error(e) }
  editVisible.value = true
}
const closeEdit = () => { editClosing.value = true; setTimeout(() => { editVisible.value = false }, 200) }

const addTag = () => {
  const v = tagInput.value.trim()
  if (v && !editForm.tags.includes(v)) editForm.tags.push(v)
  tagInput.value = ''
}
let epIdCounter = 0
const addEditEpisode = () => {
  editForm.episodes.push({ _epId: ++epIdCounter, title: '', duration: 0, playUrl: '', fileName: '', _dragover: false })
}
const reversedEpisodes = computed(() => {
  return editForm.episodes.map((ep, i) => ({ ...ep, _origIdx: i, _num: i + 1, _key: `${ep._epId}` })).reverse()
})
const onCoverChange = async (e) => {
  const file = e.target.files?.[0]; if (!file) return
  try { const r = await uploadFile(file, { category: 'image' }); editForm.coverUrl = r.url; ElMessage.success('封面上传成功') } catch (err) { ElMessage.error(err.message || '上传失败') }
}

const extractVideoRef = ref(null)
const extractDPlayerRef = ref(null)
const extractCanvasRef = ref(null)
const extractVideoSrc = ref('')
const extractEpIndex = ref(-1)
const extractCurrent = ref(0)
const extractDuration = ref(0)
const extractModalVisible = ref(false)
const capturing = ref(false)
const onExtractEpChange = () => {
  extractCurrent.value = 0; extractDuration.value = 0
  const ep = editForm.episodes[extractEpIndex.value]
  extractVideoSrc.value = ep?.playUrl || ''
}
const onExtractLoaded = () => {
  const dplayer = extractDPlayerRef.value
  const video = dplayer?.getVideoEl()
  if (video) extractDuration.value = video.duration || 0
}
const onExtractTimeUpdate = () => {
  const dplayer = extractDPlayerRef.value
  const video = dplayer?.getVideoEl()
  if (video) extractCurrent.value = video.currentTime || 0
}
const onExtractSeek = (e) => {
  const dplayer = extractDPlayerRef.value
  const video = dplayer?.getVideoEl()
  if (video) video.currentTime = e.target.value / 10
}
const formatExtractTime = (sec) => {
  if (!sec || !isFinite(sec)) return '0:00'
  const m = Math.floor(sec / 60); const s = Math.floor(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}
const uploadedEps = computed(() => {
  return editForm.episodes
    .map((ep, i) => ({ ...ep, _idx: i, _disp: i + 1 }))
    .filter(ep => ep.playUrl)
})
const onExtractVideoLoaded = async () => {
  if (!extractVideoRef.value || capturing.value) return
  const video = extractVideoRef.value
  video.currentTime = Math.min(3, video.duration / 2)
}
const captureFrame = async () => {
  const ep = editForm.episodes[extractEpIndex.value]
  if (!ep?.playUrl) return
  capturing.value = true
  try {
    const dplayer = extractDPlayerRef.value
    const video = dplayer?.getVideoEl()
    const canvas = extractCanvasRef.value
    if (!video || !canvas) throw new Error('播放器未就绪')
    const wasPaused = video.paused
    video.pause()
    const seekTo = extractCurrent.value
    await new Promise((resolve, reject) => {
      const onSeeked = () => { video.removeEventListener('seeked', onSeeked); resolve() }
      video.addEventListener('seeked', onSeeked)
      video.currentTime = seekTo
      setTimeout(() => { video.removeEventListener('seeked', onSeeked); reject(new Error('截取超时')) }, 8000)
    })
    const w = video.videoWidth || 640
    const h = video.videoHeight || 360
    canvas.width = w; canvas.height = h
    canvas.getContext('2d').drawImage(video, 0, 0, w, h)
    const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', 0.92))
    if (!blob) throw new Error('截图失败')
    const file = new File([blob], `cover_ep${extractEpIndex.value + 1}.jpg`, { type: 'image/jpeg' })
    const res = await uploadFile(file, { category: 'image' })
    editForm.coverUrl = res.url
    ElMessage.success('封面截取成功')
    extractModalVisible.value = false
    if (!wasPaused) video.play()
  } catch (err) { ElMessage.error(err.message || '截取失败') } finally { capturing.value = false }
}
const onEpFileChange = async (e, i) => {
  const file = e.target.files?.[0]; if (!file) return
  const ep = editForm.episodes[i]; ep.fileName = file.name
  try { const r = await uploadFile(file, { category: 'video' }); ep.playUrl = r.url; ep.duration = r.duration || 0; ElMessage.success('视频上传成功') } catch (err) { ep.fileName = ''; ElMessage.error(err.message || '上传失败') }
}
const onEpFileDrop = async (e, i) => {
  const file = e.dataTransfer?.files?.[0]; if (!file || !file.type.startsWith('video/')) return
  const ep = editForm.episodes[i]; ep.fileName = file.name
  try { const r = await uploadFile(file, { category: 'video' }); ep.playUrl = r.url; ep.duration = r.duration || 0; ElMessage.success('视频上传成功') } catch (err) { ep.fileName = ''; ElMessage.error(err.message || '上传失败') }
}
const onSave = async (videoStatus) => {
  if (!editForm.title) return ElMessage.warning('请填写视频标题')
  if (!editForm.categoryId) return ElMessage.warning('请选择视频分类')
  if (saving.value) return
  saving.value = true
  let userId
  try { userId = JSON.parse(localStorage.getItem('user'))?.id } catch {}
  const payload = {
    id: isEditing.value ? editingId.value : undefined,
    title: editForm.title,
    categoryId: editForm.categoryId,
    coverUrl: editForm.coverUrl || undefined,
    description: editForm.description || undefined,
    isOngoing: editForm.isOngoing,
    videoStatus,
    tags: editForm.tags.length ? editForm.tags : undefined,
    userId: userId || undefined,
    episodes: editForm.episodes.map((e, i) => ({
      id: e.id || undefined,
      episodeNumber: i + 1,
      title: e.title || undefined,
      duration: e.duration || undefined,
      playUrl: e.playUrl || undefined,
      sort: i
    }))
  }
  try {
    if (isEditing.value) { await updateVideo(payload); ElMessage.success('更新成功') }
    else { await createVideo(payload); ElMessage.success(videoStatus === 0 ? '视频已暂存' : '视频保存成功') }
    closeEdit(); fetchData()
  } catch (e) { ElMessage.error(e.message || '保存失败') } finally { saving.value = false }
}

const episodeVisible = ref(false)
const episodeVideo = ref(null)
const episodeList = ref([])
const emRefs = ref({})

const openEpisode = async (row) => {
  episodeVideo.value = row
  try {
    const res = await getVideoDetail(row.id)
    const d = res.data
    episodeVideo.value = { ...row, serialStatus: d.isOngoing ? 1 : 0, title: d.title || row.title }
    episodeList.value = (d.episodes || [])
      .sort((a, b) => (b.episodeNumber || b.sort || 0) - (a.episodeNumber || a.sort || 0))
      .map(e => ({ id: e.id, episodeNumber: e.episodeNumber, title: e.title, duration: e.duration, playUrl: e.playUrl || '', fileName: '', _dragover: false }))
  } catch (e) { episodeList.value = [] }
  episodeVisible.value = true
}
const addEpManage = () => {
  const max = episodeList.value.reduce((m, e) => Math.max(m, e.episodeNumber || 0), 0)
  episodeList.value.unshift({ episodeNumber: max + 1, title: '', duration: 0, playUrl: '', fileName: '', _dragover: false })
}
const onEmFileChange = async (e, i) => {
  const file = e.target.files?.[0]; if (!file) return
  const ep = episodeList.value[i]; ep.fileName = file.name
  try { const r = await uploadFile(file, { category: 'video' }); ep.playUrl = r.url; ep.duration = r.duration || 0 } catch (err) { ep.fileName = '' }
}
const onEmFileDrop = async (e, i) => {
  const file = e.dataTransfer.files?.[0]; if (!file || !file.type.startsWith('video/')) return
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
  try { const res = await getCategoryList({ page: 1, size: 200 }); categories.value = res.data.records || [] } catch (e) { console.error('分类加载失败', e) }
  if (route.query.videoId) filter.id = route.query.videoId
  fetchData()
})
</script>

<style lang="scss" scoped>
.page-container {
  padding: 0;
}

.page-header {
  margin-bottom: 20px;
}

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

.filter-card {
  background: var(--card-bg, #fff);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  border: 1px solid var(--border-color, #e4e7ed);
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

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
  background-repeat: no-repeat;
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
  transition: all 0.2s;

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
  letter-spacing: 0.3px;

  svg {
    flex-shrink: 0;
  }

  &.btn-primary {
    background: linear-gradient(135deg, var(--color-primary, #fb7299) 0%, #ff9ac6 100%);
    color: #fff;
    border-color: transparent;
    box-shadow: 0 2px 8px rgba(251, 114, 153, 0.25);

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 16px rgba(251, 114, 153, 0.4);
    }

    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 8px rgba(251, 114, 153, 0.25);
    }
  }

  &.btn-secondary {
    background: var(--bg-color, #f5f7fa);
    color: var(--text-primary, #303133);
    border-color: var(--border-color, #dcdfe6);

    &:hover {
      background: var(--border-color, #ebedf0);
      border-color: #c0c4cc;
    }
  }

  &.btn-ghost {
    background: transparent;
    color: var(--text-secondary, #909399);
    border-color: var(--border-color, #dcdfe6);

    &:hover {
      color: var(--color-primary, #fb7299);
      border-color: var(--color-primary, #fb7299);
      background: rgba(251,114,153,0.04);
    }
  }

  &.btn-outline {
    background: transparent;
    color: var(--text-secondary, #909399);
    border-color: var(--border-color, #dcdfe6);

    &:hover {
      color: var(--color-primary, #fb7299);
      border-color: var(--color-primary, #fb7299);
      background: rgba(251, 114, 153, 0.04);
    }
  }

  &.btn-add {
    background: linear-gradient(135deg, var(--color-primary, #fb7299) 0%, #ff9ac6 100%);
    color: #fff;
    border-color: transparent;
    box-shadow: 0 2px 8px rgba(251, 114, 153, 0.25);
    padding: 0 26px;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 16px rgba(251, 114, 153, 0.4);
    }

    &:active {
      transform: translateY(0);
    }
  }

  &.btn-sm {
    height: 30px;
    padding: 0 14px;
    font-size: 12px;
    margin-bottom: 10px
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none !important;
  }
}

.btn-loading {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: btn-spin 0.6s linear infinite;
}

@keyframes btn-spin {
  to { transform: rotate(360deg); }
}

.ep-list-enter-active,
.ep-list-leave-active {
  transition: all 0.25s ease;
}
.ep-list-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}
.ep-list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.table-card {
  background: var(--card-bg, #fff);
  border-radius: 12px;
  border: 1px solid var(--border-color, #e4e7ed);
  overflow: hidden;
}

.table-wrap {
  overflow-x: auto;
  background: var(--card-bg, #fff);

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 3px;
    background: rgba(0, 0, 0, 0.15);
  }
}

.data-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 13px;
  min-width: 1200px;

  th {
    padding: 14px 16px;
    text-align: center;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-primary, #303133);
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

  .table-row:hover td {
    background: var(--bg-color, #fafafa);
  }

  .col-index {
    width: 60px;
  }

  .col-id {
    width: 100px;
  }

  .col-cover {
    min-width: 200px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .col-title {
    text-align: center;
    max-width: 280px;
  }

  .col-user {
    width: 240px;
  }

  .col-fav {
    width: 150px;
  }

  .col-action {
    min-width: 280px;
    position: sticky;
    right: 0;
    z-index: 3;
    background: var(--card-bg, #fff);
    border-left: 1px solid var(--border-color, #e4e7ed);
    box-shadow: -2px 0 8px rgba(0,0,0,0.06);
  }

  .table-row:hover .col-action {
    background: var(--bg-color, #fafafa);
  }

  .col-sortable {
    cursor: pointer;

    &:hover {
      color: var(--color-primary, #fb7299);
    }
  }
}

.data-table td.col-data.mono,
.data-table td.col-fav.mono,
.data-table td.col-serial,
.data-table td.col-audit,
.data-table td.col-status {
  font-size: 14px;
  font-weight: 500;
}

.mono {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 14px;
}

.cover-thumb {
  width: 80px !important;
  height: 45px !important;
  border-radius: 4px;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.2s;
  display: block;
  flex-shrink: 0;

  &:hover {
    transform: scale(1.05);
  }
}

.cover-empty {
  width: 80px !important;
  height: 45px !important;
  border-radius: 4px;
  background: var(--el-fill-color-light, #f5f7fa);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c0c4cc;
  flex-shrink: 0;
}

.title-cell {
  max-width: 100%;
}

.title-text {
  font-weight: 500;
  color: var(--el-text-color-primary, #303133);
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: default;
}

.user-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.avatar-fb {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--el-color-primary-light-9, #fce4ec);
  color: var(--el-color-primary, #fb7299);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.user-name {
  font-size: 12px;
  color: var(--el-text-color-regular, #303133);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-shrink: 1;
  min-width: 0;
}

.badge {
  display: inline-block;
  padding: 5px 12px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;

  &.badge-green {
    color: #4caf50;
    background: rgba(76, 175, 80, 0.1);
  }

  &.badge-blue {
    color: #409eff;
    background: rgba(64, 158, 255, 0.1);
  }

  &.badge-amber {
    color: #e6a23c;
    background: rgba(230, 162, 60, 0.1);
  }

  &.badge-red {
    color: #f56c6c;
    background: rgba(245, 108, 108, 0.1);
  }

  &.badge-red {
    color: #f56c6c;
    background: rgba(245, 108, 108, 0.1);
  }

  &.badge-gray {
    color: #909399;
    background: rgba(144, 147, 153, 0.1);
  }
}

.sort-icon {
  display: inline-flex;
  flex-direction: column;
  margin-left: 4px;
  vertical-align: middle;
  gap: 1px;

  i {
    display: block;
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    opacity: 0.3;

    &.arrow-up {
      border-bottom: 5px solid currentColor;

      &.active {
        opacity: 1;
      }
    }

    &.arrow-down {
      border-top: 5px solid currentColor;

      &.active {
        opacity: 1;
      }
    }
  }
}

.action-group {
  display: flex;
  gap: 6px;
  justify-content: center;
  white-space: nowrap;
}

.act-btn {
  padding: 7px 15px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;

  &.act-blue {
    color: #00a1d6;
    background: rgba(0, 161, 214, 0.1);
    &:hover { color: #fff; background: #00a1d6; box-shadow: 0 2px 8px rgba(0,161,214,0.35); }
  }

  &.act-amber {
    color: #ffc107;
    background: rgba(255, 193, 7, 0.1);
    &:hover { color: #fff; background: #ffc107; box-shadow: 0 2px 8px rgba(255,193,7,0.35); }
  }

  &.act-green {
    color: #67c23a;
    background: rgba(103, 194, 58, 0.1);
    &:hover { color: #fff; background: #67c23a; box-shadow: 0 2px 8px rgba(103,194,58,0.35); }
  }

  &.act-red {
    color: #f56c6c;
    background: rgba(245, 108, 108, 0.1);
    &:hover { color: #fff; background: #f56c6c; box-shadow: 0 2px 8px rgba(245,108,108,0.35); }
  }
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 10px;
}

.page-info {
  padding-left: 10px;
  font-size: 13px;
  color: var(--text-secondary, #909399);
}

.page-btns {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pg-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid var(--border-color, #dcdfe6);
  background: var(--card-bg, #fff);
  color: var(--text-primary, #303133);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    border-color: var(--color-primary, #fb7299);
    color: var(--color-primary, #fb7299);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &.active {
    background: var(--color-primary, #fb7299);
    color: #fff;
    border-color: var(--color-primary, #fb7299);
  }
}

.pg-ellipsis {
  width: 32px;
  text-align: center;
  color: var(--text-secondary, #909399);
}

.page-size {
  font-size: 13px;
  color: var(--text-secondary, #909399);
  display: flex;
  align-items: center;
  gap: 6px;
  padding-right: 10px;
}

.size-sel {
  height: 32px;
  border-radius: 6px;
  border: 1px solid var(--border-color, #dcdfe6);
  padding: 0 8px;
  font-size: 13px;
  background: var(--card-bg, #fff);
  color: var(--text-primary, #303133);
  cursor: pointer;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-card {
  background: var(--el-bg-color, #fff);
  border-radius: 16px;
  width: 700px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 80px rgba(0,0,0,0.18);
}

.modal-wide {
  width: 920px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 22px 28px;
  border-bottom: 1px solid var(--border-color, #ebeef5);
}

.modal-title-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
  h3 { margin: 0; font-size: 17px; font-weight: 600; color: var(--text-primary, #303133); }
}

.modal-subtitle {
  font-size: 12px;
  color: var(--text-secondary, #909399);
}

.modal-close {
  background: none;
  border: none;
  font-size: 22px;
  cursor: pointer;
  color: var(--el-text-color-secondary, #909399);
  padding: 4px 8px;
  border-radius: 8px;
  transition: all 0.15s;
  &:hover { background: var(--bg-color, #f5f7fa); color: var(--text-primary, #303133); }
}

.modal-body {
  padding: 24px 28px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 16px 28px;
  border-top: 1px solid var(--border-color, #ebeef5);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.detail-layout {
  display: flex;
  gap: 24px;
}

.detail-left {
  flex: 1;
  min-width: 0;
}

.detail-right {
  width: 300px;
  flex-shrink: 0;
}

.player-box {
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: 8px;
  overflow: hidden;
  background: #000;
  margin-bottom: 16px;
}

.player-empty {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #555;

  p {
    margin: 0;
    font-size: 13px;
  }
}

.detail-desc {
  margin-bottom: 12px;
  padding: 12px;
  background: #f5f6fa;
  border-radius: 12px;

  h4 {
    font-size: 13px;
    color: var(--el-text-color-secondary, #909399);
    margin: 0 0 6px;
  }

  p {
    font-size: 13px;
    color: var(--el-text-color-regular, #303133);
    margin: 0;
    line-height: 1.6;
  }
}

.detail-tags {
  margin-bottom: 12px;
  padding-left:10px;

  h4 {
    font-size: 13px;
    color: var(--el-text-color-secondary, #909399);
    margin: 0 0 8px;
  }
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 12px;
  border-radius: 100px;
  font-size: 12px;
  background: var(--el-fill-color-light, #f5f7fa);
  border: 1px solid var(--el-border-color-lighter, #e4e7ed);
}

.detail-eps {
  padding: 12px;
  background: #f5f6fa;
  border-radius: 12px;
  margin-bottom: 12px;
  h4 {
    font-size: 13px;
    color: var(--el-text-color-secondary, #909399);
    margin: 0 0 8px;
  }
}

.ep-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.ep-pill {
  padding: 4px 14px;
  border-radius: 6px;
  border: 1px solid var(--el-border-color, #dcdfe6);
  background: #fff;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;

  &:hover {
    border-color: var(--el-color-primary, #fb7299);
  }

  &.active {
    background: var(--el-color-primary, #fb7299);
    color: #fff;
    border-color: var(--el-color-primary, #fb7299);
  }

  &.ep-unreviewed:not(.active) {
    background: #fdf6e3;
    border-color: #f0c040;
    color: #b8860b;
  }
}

.detail-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.detail-vtitle {
  font-size: 16px;
  font-weight: 600;
}

.detail-cover {
  margin-top: 8px;
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: 12px;
  overflow: hidden;
  background: #1a1a1a;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  position: relative;
  cursor: pointer;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  &:hover img {
    transform: scale(1.03);
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 12px;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
    pointer-events: none;
  }
}

.detail-user {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
  padding: 14px 16px;
  background: #f5f6fa;
  border-radius: 12px;

  .user-avatar {
    width: 52px;
    height: 52px;
    font-size: 20px;
  }

  .user-name {
    font-size: 16px;
    font-weight: 600;
  }

  .user-uid {
    font-size: 13px;
  }
}

.user-uid {
  font-size: 12px;
  color: var(--el-text-color-secondary, #909399);
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 10px 14px;
  background: #f5f6fa;
  border-radius: 10px;

  &.full {
    grid-column: 1 / -1;
  }
}

.il {
  font-size: 11px;
  color: var(--el-text-color-secondary, #909399);
}

.iv {
  font-size: 13px;
  color: var(--el-text-color-primary, #303133);
  font-weight: 500;
}

.form-section {
  margin-bottom: 24px;
  &:last-child { margin-bottom: 0; }
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary, #303133);
  margin-bottom: 14px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color, #ebeef5);
}

.section-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color, #ebeef5);
  .section-title { margin: 0; padding: 0; border: none; }
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.fg {
  display: flex;
  flex-direction: column;
  gap: 6px;
  &.full { grid-column: 1 / -1; }
}

.fl {
  font-size: 12px;
  color: var(--text-secondary, #909399);
  font-weight: 500;
  &.required::before { content: '*'; color: #f56c6c; margin-right: 4px; }
}

.fi {
  height: 38px;
  border-radius: 10px;
  border: 1.5px solid var(--border-color, #e4e7ed);
  padding: 0 14px;
  font-size: 13px;
  background: var(--card-bg, #fff);
  outline: none;
  transition: all 0.2s;
  color: var(--text-primary, #303133);
  &:focus { border-color: var(--color-primary, #fb7299); box-shadow: 0 0 0 3px rgba(251,114,153,0.1); }
}

.fs {
  height: 38px;
  border-radius: 10px;
  border: 1.5px solid var(--border-color, #e4e7ed);
  padding: 0 14px;
  font-size: 13px;
  background: var(--card-bg, #fff);
  outline: none;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23909399' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 32px;
  color: var(--text-primary, #303133);
  transition: all 0.2s;
  &:focus { border-color: var(--color-primary, #fb7299); box-shadow: 0 0 0 3px rgba(251,114,153,0.1); }
}

.fta {
  border-radius: 10px;
  border: 1.5px solid var(--border-color, #e4e7ed);
  padding: 10px 14px;
  font-size: 13px;
  background: var(--card-bg, #fff);
  outline: none;
  resize: vertical;
  font-family: inherit;
  color: var(--text-primary, #303133);
  transition: all 0.2s;
  &:focus { border-color: var(--color-primary, #fb7299); box-shadow: 0 0 0 3px rgba(251,114,153,0.1); }
}

.cover-row {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.cover-upload {
  width: 180px;
  height: 101px;
  border-radius: 10px;
  border: 2px dashed var(--border-color, #dcdfe6);
  cursor: pointer;
  overflow: hidden;
  transition: all 0.2s;
  flex-shrink: 0;
  position: relative;
  &:hover { border-color: var(--color-primary, #fb7299); }
}

.cover-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-rm-x {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.cover-upload:hover .cover-rm-x {
  opacity: 1;
}

.cover-ph {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: var(--text-secondary, #909399);
  span { font-size: 12px; }
}

.cover-hint {
  font-size: 11px !important;
  color: var(--el-text-color-placeholder, #c0c4cc) !important;
}

.cover-extract {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
}

.extract-modal-player {
  position: relative;
  background: #000;
  aspect-ratio: 16/9;
  max-height: 50vh;
}

.extract-capturing-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #fff;
  font-size: 13px;
  .btn-loading {
    width: 28px;
    height: 28px;
    border: 3px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: btn-spin 0.6s linear infinite;
  }
}

.extract-modal-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: var(--card-bg, #fff);
  border-top: 1px solid var(--border-color, #ebeef5);
  border-radius: 20px;
}

.extract-time {
  font-size: 12px;
  color: var(--text-secondary, #909399);
  font-family: 'JetBrains Mono', monospace;
  min-width: 36px;
  text-align: center;
}

.extract-slider {
  flex: 1;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: var(--border-color, #dcdfe6);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--color-primary, #fb7299);
    cursor: pointer;
    box-shadow: 0 0 4px rgba(251,114,153,0.4);
  }
  &::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--color-primary, #fb7299);
    border: none;
    cursor: pointer;
  }
}

.fs-sm {
  height: 30px;
  font-size: 12px;
  padding: 0 10px;
  padding-right: 28px;
}

.btn-danger-text {
  color: #f56c6c !important;
  border-color: #f56c6c !important;
  &:hover { background: rgba(245,108,108,0.06) !important; }
}

.toggle-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 8px 0;
}

.toggle-track {
  width: 44px;
  height: 24px;
  border-radius: 12px;
  background: var(--border-color, #dcdfe6);
  position: relative;
  transition: background 0.25s;
  &.active { background: var(--color-primary, #fb7299); }
}

.toggle-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.25s cubic-bezier(0.4,0,0.2,1);
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  .active & { transform: translateX(20px); }
}

.toggle-text {
  font-size: 13px;
  color: var(--text-primary, #303133);
  font-weight: 500;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.tag-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 100px;
  font-size: 12px;
  background: rgba(251,114,153,0.08);
  color: var(--color-primary, #fb7299);
  border: 1px solid rgba(251,114,153,0.2);
  font-weight: 500;
}

.tag-rm {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 14px;
  padding: 0 2px;
  opacity: 0.6;
  transition: opacity 0.15s;
  &:hover { opacity: 1; }
}

.tag-input { width: 100%; }

.ep-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ep-empty {
  text-align: center;
  padding: 40px;
  color: var(--el-text-color-placeholder, #c0c4cc);
  font-size: 13px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  p { margin: 0; }
}

.ep-card {
  margin-bottom: 15px;
  background: var(--bg-color, #f5f7fa);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border: 1px solid var(--border-color, #ebeef5);
  transition: border-color 0.2s;
  &:hover { border-color: rgba(251,114,153,0.3); }
}

.ep-header {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-bottom: 12px;

  h4 {
    font-size: 14px;
    font-weight: 600;
    margin: 0 0 8px;
    align-self: flex-start;
  }
}

.btn-add-ep {
  padding: 4px 14px;
  border-radius: 6px;
  border: 1.5px dashed var(--border-color, #dcdfe6);
  background: transparent;
  color: var(--text-secondary, #909399);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--color-primary, #fb7299);
    color: var(--color-primary, #fb7299);
  }
}

.ep-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ep-num-badge {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-primary, #fb7299);
  background: rgba(251,114,153,0.1);
  padding: 10px 19px;
  border-radius: 50px;
  width:100px;
}

.ep-rm {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: var(--el-text-color-secondary, #909399);
  padding: 2px 6px;
  border-radius: 4px;
  transition: all 0.15s;
  &:hover { color: #f56c6c; background: rgba(245,108,108,0.1); }
}

.ep-upload {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ep-dropzone {
  border: 2px dashed var(--border-color, #dcdfe6);
  border-radius: 10px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--card-bg, #fff);
  &:hover, &.dragover {
    border-color: var(--color-primary, #fb7299);
    background: rgba(251,114,153,0.03);
  }
}

.ep-drop-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: var(--text-secondary, #909399);
  font-size: 13px;
}

.ep-drop-sub {
  font-size: 11px;
  color: var(--el-text-color-placeholder, #c0c4cc);
}

.ep-file-info {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: var(--card-bg, #fff);
  border-radius: 8px;
  border: 1px solid var(--border-color, #ebeef5);
  font-size: 12px;
  color: var(--text-secondary, #909399);
}

.file-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
}

.ep-dur {
  margin-left: auto;
  color: var(--color-primary, #fb7299);
  font-weight: 500;
}

.ep-preview {
  margin-top: 10px;
  border-radius: 8px;
  overflow: hidden;
  background: #000;
  position: relative;
}

.ep-video {
  width: 100%;
  max-height: 240px;
  display: block;
  border-radius: 8px;
  outline: none;
}

.ep-video-rm {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(0,0,0,0.55);
  color: #fff;
  border: none;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  &:hover { background: #f56c6c; }
}

.cover-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-close {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: #fff;
  font-size: 24px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
}

.cover-lg {
  max-width: 90vw;
  max-height: 90vh;
  border-radius: 8px;
  object-fit: contain;
}

.title-tooltip {
  position: fixed;
  z-index: 4000;
  max-width: 400px;
  padding: 8px 14px;
  background: var(--card-bg, #fff);
  color: var(--text-primary, #303133);
  font-size: 13px;
  line-height: 1.5;
  border-radius: 6px;
  pointer-events: none;
  word-break: break-all;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  border: 1px solid var(--border-color, #e4e7ed);
}

.empty-cell {
  text-align: center;
  padding: 48px 0 !important;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--el-text-color-secondary, #909399);

  p {
    margin: 0;
    font-size: 14px;
  }
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;

  .modal-card {
    transition: transform 0.2s ease, opacity 0.2s ease;
  }
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;

  .modal-card {
    transform: scale(0.95) translateY(10px);
    opacity: 0;
  }
}

/* Dark Mode */
html.dark-mode {
  .filter-card,
  .table-card,
  .data-table td,
  .col-action,
  .pg-btn,
  .size-sel,
  .modal-card {
    background-color: var(--card-bg);
    border-color: var(--border-color);
  }

  .data-table th {
    background-color: var(--bg-color);
    border-color: var(--border-color);
    color: var(--text-primary);
  }

  .filter-input,
  .filter-select,
  .fi,
  .fs,
  .fta {
    background-color: var(--bg-color);
    color: var(--text-primary);
    &:focus {
      background-color: var(--card-bg);
    }
  }

  .btn-secondary {
    background-color: var(--bg-color);
    border-color: var(--border-color);
    color: var(--text-primary);
  }

  .page-info,
  .pg-ellipsis,
  .filter-label,
  .page-size,
  .fl {
    color: var(--text-secondary);
  }

  .modal-header {
    border-color: var(--border-color);
    h3 { color: var(--text-primary); }
  }

  .modal-footer {
    border-color: var(--border-color);
  }

  .cover-upload {
    border-color: var(--border-color);
  }

  .cover-ph { color: var(--text-secondary); }

  .tags-list {
    background-color: var(--bg-color);
  }

  .tag-pill {
    background-color: rgba(251,114,153,0.12);
    border-color: rgba(251,114,153,0.25);
    color: var(--color-primary);
  }

  .tag-input {
    color: var(--text-primary);
  }

  .ep-card {
    background-color: var(--bg-color);
    border-color: var(--border-color);
  }

  .ep-dropzone {
    background-color: var(--card-bg);
    border-color: var(--border-color);
  }

  .ep-drop-hint { color: var(--text-secondary); }
  .ep-drop-sub { color: var(--text-secondary); }

  .ep-file-info {
    background: var(--card-bg);
    border-color: var(--border-color);
    color: var(--text-secondary);
  }

  .modal-close:hover {
    background: var(--bg-color);
  }

  .btn-ghost {
    color: var(--text-secondary);
    border-color: var(--border-color);
    &:hover {
      color: var(--color-primary);
      border-color: var(--color-primary);
    }
  }

  .title-text,
  .user-name,
  .mono,
  .col-data,
  .col-serial,
  .col-audit,
  .col-status,
  .detail-vtitle,
  .detail-desc p,
  .info-item .iv {
    color: var(--text-primary) !important;
  }

  .act-btn {
    opacity: 0.9;
  }

  .act-blue { color: #00a1d6 !important; }
  .act-amber { color: #ffc107 !important; }
  .act-green { color: #67c23a !important; }
  .act-red { color: #f56c6c !important; }

  .badge-green { color: #6fcf73 !important; background: rgba(76,175,80,0.15) !important; }
  .badge-blue { color: #6cb4ee !important; background: rgba(64,158,255,0.15) !important; }
  .badge-amber { color: #f0c060 !important; background: rgba(230,162,60,0.15) !important; }
  .badge-red { color: #f87171 !important; background: rgba(245,108,108,0.15) !important; }
  .badge-red { color: #f87171 !important; background: rgba(245,108,108,0.15) !important; }
  .badge-gray { color: #a0aab4 !important; background: rgba(144,147,153,0.15) !important; }

  .cover-empty { background: var(--bg-color); }

  .detail-desc,
  .detail-tags,
  .detail-eps,
  .detail-user,
  .info-item,
  .detail-cover {
    background-color: var(--bg-color);
  }

  .detail-desc h4,
  .detail-tags h4,
  .detail-eps h4,
  .il {
    color: var(--text-secondary);
  }

  .detail-desc p,
  .detail-vtitle,
  .user-name,
  .info-item .iv {
    color: var(--text-primary);
  }

  .user-uid {
    color: var(--text-secondary);
  }

  .detail-cover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  }

  .ep-pill {
    background: var(--card-bg);
    border-color: var(--border-color);
    color: var(--text-primary);

    &.ep-unreviewed:not(.active) {
      background: rgba(240, 192, 64, 0.12);
      border-color: rgba(240, 192, 64, 0.3);
      color: #f0c060;
    }
  }

  .ep-num-badge {
    background: var(--bg-color);
    color: var(--text-secondary);
  }

  .ep-num {
    color: var(--text-secondary);
  }

  .ep-dur {
    color: var(--text-secondary);
  }
}
</style>

<style lang="scss">
html.dark-mode .el-message-box {
  background-color: var(--card-bg) !important;
  border-color: var(--border-color) !important;

  .el-message-box__title {
    color: var(--text-primary) !important;
  }

  .el-message-box__content {
    color: var(--text-secondary) !important;
  }

  .el-message-box__headerbtn .el-message-box__close {
    color: var(--text-secondary);
  }
}
</style>
