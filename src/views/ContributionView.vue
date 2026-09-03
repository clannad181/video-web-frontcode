<template>
  <div class="contribution-page">
    <CreatorHeader />
    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          {{ activeMenu === 'submit' ? '投稿视频' : activeMenu === 'contributions' ? '稿件管理' : '投稿中心' }}
        </h1>
      </div>

      <div class="contribution-layout">
        <aside class="sidebar-menu">
          <div class="sidebar-top">
            <button class="new-contribution-btn" @click="resetFormAndGoSubmit">
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
                <a class="nav-subitem" :class="{ active: activeMenu === 'contributions' }" @click.prevent="activeMenu = 'contributions'">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
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
                <a class="nav-subitem" :class="{ active: activeMenu === 'stats' }" @click.prevent="activeMenu = 'stats'">
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

          <div v-if="activeMenu === 'submit'" class="steps-progress">
            <div class="progress-title">投稿进度</div>
            <div 
              v-for="(step, index) in steps" 
              :key="index" 
              class="progress-item"
              :class="{ active: currentStep === index, completed: currentStep > index }"
            >
              <div class="progress-dot">
                <svg v-if="currentStep > index" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span v-else>{{ index + 1 }}</span>
              </div>
              <span class="progress-label">{{ step }}</span>
            </div>
          </div>
        </aside>

        <div class="contribution-content">
          <!-- 稿件管理页面 -->
          <div v-if="activeMenu === 'contributions'" class="contributions-manage fade-in">
            <div class="manage-header">
              <div class="manage-filters">
                <div class="search-box">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="M21 21l-4.35-4.35"/>
                  </svg>
                  <input 
                    v-model="contributionSearchKey" 
                    type="text" 
                    placeholder="搜索稿件标题" 
                    @keyup.enter="searchContributions"
                  />
                  <svg v-if="contributionSearchKey" class="search-clear" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" @click="contributionSearchKey = ''; loadContributions()">
                    <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
                  </svg>
                </div>
                <select v-model="contributionStatusFilter" class="filter-select" @change="loadContributions()">
                  <option value="">全部状态</option>
                  <option value="0">草稿</option>
                  <option value="1">待发布</option>
                  <option value="2">已发布</option>
                  <option value="3">已下架</option>
                </select>
              </div>
              <div class="manage-stats">
                <span class="stat-item">共 <strong>{{ contributionTotal }}</strong> 个稿件</span>
              </div>
            </div>

            <div v-if="loadingContributions" class="loading-state">
              <div class="loading-spinner"></div>
            </div>
            <div v-else-if="contributions.length > 0" class="contributions-table">
              <div class="table-header">
                <div class="col-cover">视频</div>
                <div class="col-title">标题</div>
                <div class="col-status">状态</div>
                <div class="col-ongoing">连载状态</div>
                <div class="col-stats">数据</div>
                <div class="col-time">发布时间</div>
                <div class="col-action">操作</div>
              </div>
              <div v-for="item in contributions" :key="item.videoUid" class="table-row">
                <div class="col-cover">
                  <div class="video-cover" @click="goToVideo(item)">
                    <img :src="item.coverUrl" :alt="item.title" />
                    <span class="video-duration" v-if="item.episodeCount">{{ item.episodeCount }}P</span>
                  </div>
                </div>
                <div class="col-title">
                  <div class="video-title" @click="goToVideo(item)">{{ item.title }}</div>
                  <div class="video-desc">{{ item.description || '暂无简介' }}</div>
                </div>
                <div class="col-status">
                  <span class="status-tag" :class="getStatusClass(item.videoStatus)">
                    {{ getStatusText(item.videoStatus) }}
                  </span>
                </div>
                <div class="col-ongoing">
                  <span class="ongoing-tag clickable" :class="item.isOngoing ? 'ongoing' : 'finished'" @click="toggleOngoing(item)">
                    {{ item.isOngoing ? '连载中' : '已完结' }}
                  </span>
                </div>
                <div class="col-stats">
                  <div class="stat-row">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    <span>{{ formatCount(item.playCount || 0) }}</span>
                  </div>
                  <div class="stat-row">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    <span>{{ formatCount(item.favoriteCount || 0) }}</span>
                  </div>
                </div>
                <div class="col-time">{{ formatDate(item.createTime) }}</div>
                <div class="col-action">
                  <button v-if="item.isOngoing" class="action-btn add-btn" title="剧集管理" @click="goToEpisodeManagement(item)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="12" y1="5" x2="12" y2="19"/>
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                  </button>
                  <button class="action-btn" title="编辑" @click="editContribution(item)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button class="action-btn delete-btn" title="删除" @click="deleteContribution(item)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <p>暂无稿件</p>
              <button class="btn btn-primary btn-sm" @click="activeMenu = 'submit'">去投稿</button>
            </div>
            <div v-if="contributionTotalPages > 1" class="pagination">
              <button class="page-btn" :disabled="contributionCurrentPage <= 1" @click="loadContributions(contributionCurrentPage - 1)">上一页</button>
              <span class="page-info">{{ contributionCurrentPage }} / {{ contributionTotalPages }}</span>
              <button class="page-btn" :disabled="contributionCurrentPage >= contributionTotalPages" @click="loadContributions(contributionCurrentPage + 1)">下一页</button>
            </div>
          </div>

          <!-- 数据概览页面 -->
          <div v-if="activeMenu === 'stats'" class="stats-overview fade-in">
            <div v-if="loadingStats" class="loading-state">
              <div class="loading-spinner"></div>
            </div>
            <template v-else>
              <div class="stats-cards">
                <div class="stat-card">
                  <div class="stat-card-icon play">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                  </div>
                  <div class="stat-card-info">
                    <div class="stat-card-value">{{ formatCount(statsData.totalPlayCount) }}</div>
                    <div class="stat-card-label">总观看数</div>
                  </div>
                </div>
                <div class="stat-card">
                  <div class="stat-card-icon favorite">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </div>
                  <div class="stat-card-info">
                    <div class="stat-card-value">{{ formatCount(statsData.totalFavoriteCount) }}</div>
                    <div class="stat-card-label">总收藏数</div>
                  </div>
                </div>
                <div class="stat-card">
                  <div class="stat-card-icon coin">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>
                      <path d="M12 18V6"/>
                    </svg>
                  </div>
                  <div class="stat-card-info">
                    <div class="stat-card-value">{{ formatCount(statsData.totalCoinCount) }}</div>
                    <div class="stat-card-label">总投币数</div>
                  </div>
                </div>
                <div class="stat-card">
                  <div class="stat-card-icon like">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                    </svg>
                  </div>
                  <div class="stat-card-info">
                    <div class="stat-card-value">{{ formatCount(statsData.totalLikeCount) }}</div>
                    <div class="stat-card-label">总点赞数</div>
                  </div>
                </div>
              </div>

              <div class="stats-section">
                <h3 class="stats-section-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 20V10"/>
                    <path d="M18 20V4"/>
                    <path d="M6 20v-4"/>
                  </svg>
                  最热视频 TOP5
                </h3>
                <div v-if="statsData.hotVideos.length > 0" class="stats-video-table">
                  <div class="table-header">
                    <div class="sv-col-rank">排名</div>
                    <div class="sv-col-title">标题</div>
                    <div class="sv-col-category">分类</div>
                    <div class="sv-col-episodes">集数</div>
                    <div class="sv-col-duration">时长</div>
                    <div class="sv-col-play">播放</div>
                  </div>
                  <div v-for="(video, index) in statsData.hotVideos" :key="video.avid" class="table-row">
                    <div class="sv-col-rank">
                      <span class="rank-badge" :class="'rank-' + (index + 1)">{{ index + 1 }}</span>
                    </div>
                    <div class="sv-col-title">
                      <div class="sv-title-text">{{ video.title }}</div>
                    </div>
                    <div class="sv-col-category">{{ video.categoryName }}</div>
                    <div class="sv-col-episodes">{{ video.episodeCount }}集</div>
                    <div class="sv-col-duration">{{ formatDuration(video.totalDuration) }}</div>
                    <div class="sv-col-play">{{ formatCount(video.playCount) }}</div>
                  </div>
                </div>
                <div v-else class="empty-state">
                  <p>暂无数据</p>
                </div>
              </div>

              <div class="stats-section">
                <h3 class="stats-section-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  最受欢迎视频 TOP5
                </h3>
                <div v-if="statsData.favoriteVideos.length > 0" class="stats-video-table">
                  <div class="table-header">
                    <div class="sv-col-rank">排名</div>
                    <div class="sv-col-title">标题</div>
                    <div class="sv-col-category">分类</div>
                    <div class="sv-col-episodes">集数</div>
                    <div class="sv-col-duration">时长</div>
                    <div class="sv-col-fav">收藏</div>
                  </div>
                  <div v-for="(video, index) in statsData.favoriteVideos" :key="video.avid" class="table-row">
                    <div class="sv-col-rank">
                      <span class="rank-badge" :class="'rank-' + (index + 1)">{{ index + 1 }}</span>
                    </div>
                    <div class="sv-col-title">
                      <div class="sv-title-text">{{ video.title }}</div>
                    </div>
                    <div class="sv-col-category">{{ video.categoryName }}</div>
                    <div class="sv-col-episodes">{{ video.episodeCount }}集</div>
                    <div class="sv-col-duration">{{ formatDuration(video.totalDuration) }}</div>
                    <div class="sv-col-fav">{{ formatCount(video.favoriteCount) }}</div>
                  </div>
                </div>
                <div v-else class="empty-state">
                  <p>暂无数据</p>
                </div>
              </div>
            </template>
          </div>

          <!-- 投稿表单页面 -->
          <div v-if="activeMenu === 'submit'">
          <div v-if="editingVideoUid" class="edit-notice">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>{{ addingEpisodeMode ? '新增的剧集需要审核' : '编辑完成后需要重新审核' }}</span>
          </div>
          <div v-show="currentStep === 0">
            <div class="info-cards fade-in">
              <div class="info-card">
                <div class="info-card-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </div>
                <div class="info-card-content">
                  <div class="info-card-title">视频大小</div>
                  <div class="info-card-desc">16G以内，时长10小时以内</div>
                  <div class="info-card-hint">粉丝数 ≥ 1000，可自动解锁64G超大文件</div>
                </div>
              </div>
              <div class="info-card">
                <div class="info-card-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <polygon points="23 7 16 12 23 17 23 7"/>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                  </svg>
                </div>
                <div class="info-card-content">
                  <div class="info-card-title">视频格式</div>
                  <div class="info-card-desc">推荐上传 MP4/MOV/MKV 格式</div>
                  <div class="info-card-hint">转码更快、过审更顺利～</div>
                </div>
              </div>
              <div class="info-card">
                <div class="info-card-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                    <line x1="8" y1="21" x2="16" y2="21"/>
                    <line x1="12" y1="17" x2="12" y2="21"/>
                  </svg>
                </div>
                <div class="info-card-content">
                  <div class="info-card-title">视频分辨率</div>
                  <div class="info-card-desc">推荐分辨率：1080P、4K</div>
                  <div class="info-card-hint">高分辨率更清晰流畅～</div>
                </div>
              </div>
            </div>

            <div class="form-section fade-in">
              <h2 class="section-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                基本信息
              </h2>

              <div class="form-grid">
              <div class="form-group full-width">
                <label class="form-label">
                  视频标题
                  <span class="required">*</span>
                </label>
                <div class="input-wrapper">
                  <input 
                    v-model="form.title" 
                    type="text" 
                    class="form-input" 
                    placeholder="请输入视频标题"
                    maxlength="80"
                  />
                  <span class="char-count">{{ form.title.length }}/80</span>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">
                  视频分类
                  <span class="required">*</span>
                </label>
                <div class="select-wrapper">
                  <select v-model="form.categoryId" class="form-select">
                    <option value="">请选择分类</option>
                    <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                  </select>
                  <svg class="select-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">连载状态</label>
                <div class="radio-group">
                  <label class="radio-item" :class="{ active: !form.isFinished }">
                    <input 
                      type="radio" 
                      :value="false" 
                      v-model="form.isFinished"
                    />
                    <span class="radio-dot"></span>
                    <span class="radio-label">连载中</span>
                    <span class="radio-hint">支持后续添加剧集</span>
                  </label>
                  <label class="radio-item" :class="{ active: form.isFinished }">
                    <input 
                      type="radio" 
                      :value="true" 
                      v-model="form.isFinished"
                    />
                    <span class="radio-dot"></span>
                    <span class="radio-label">已完结</span>
                    <span class="radio-hint">全集已上传完毕</span>
                  </label>
                </div>
              </div>

              <div class="form-group full-width">
                <label class="form-label">视频标签</label>
                <div class="tags-input-wrapper">
                  <div class="tags-list">
                    <span v-for="(tag, index) in form.tags" :key="index" class="tag-item">
                      {{ tag }}
                      <button class="tag-remove" @click="removeTag(index)">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </span>
                    <input 
                      v-model="tagInput"
                      type="text" 
                      class="tag-input"
                      :placeholder="form.tags.length === 0 ? '输入标签后按回车添加' : ''"
                      maxlength="10"
                      @keydown.enter.prevent="addTag"
                    />
                  </div>
                  <span class="tags-hint">每个标签最多 {{ maxTagLength }} 个字</span>
                </div>
              </div>

              <div class="form-group full-width">
                <label class="form-label">视频简介</label>
                <div class="input-wrapper">
                  <textarea 
                    v-model="form.description" 
                    class="form-textarea" 
                    placeholder="请输入视频简介，让更多人了解你的作品"
                    rows="4"
                    maxlength="2000"
                  ></textarea>
                  <span class="char-count">{{ form.description.length }}/2000</span>
                </div>
              </div>
            </div>
          </div>
        </div>

          <div v-show="currentStep === 1" class="form-section fade-in">
            <div class="section-header">
              <h2 class="section-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
                  <line x1="7" y1="2" x2="7" y2="22"/>
                  <line x1="17" y1="2" x2="17" y2="22"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                  <line x1="2" y1="7" x2="7" y2="7"/>
                  <line x1="2" y1="17" x2="7" y2="17"/>
                  <line x1="17" y1="17" x2="22" y2="17"/>
                  <line x1="17" y1="7" x2="22" y2="7"/>
                </svg>
                剧集管理
              </h2>
              <button class="add-episode-btn" @click="addEpisode">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                添加剧集
              </button>
            </div>

            <div class="cover-section">
              <div class="cover-section-header">
                <div class="cover-section-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  封面图
                </div>
                <span class="cover-section-hint">建议尺寸 16:9，支持 JPG/PNG</span>
              </div>
              <div class="cover-upload-area">
                <div class="cover-upload" @click="triggerCoverUpload">
                  <input 
                    ref="coverInput" 
                    type="file" 
                    accept="image/*" 
                    style="display: none" 
                    @change="handleCoverChange"
                  />
                  <div v-if="coverPreview" class="cover-preview">
                    <img :src="coverPreview" alt="封面预览" />
                    <div class="cover-overlay">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                        <circle cx="12" cy="13" r="4"/>
                      </svg>
                      <span>更换封面</span>
                    </div>
                  </div>
                  <div v-else class="cover-placeholder">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <span class="upload-text">点击上传封面</span>
                   </div>
                </div>
                <button 
                  v-if="episodes.some(ep => ep.videoPreviewUrl)" 
                  class="capture-btn" 
                  @click="captureCoverFromVideo"
                  type="button"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                  从视频截取封面
                </button>
              </div>
            </div>

            <div class="episodes-list">
              <div class="episodes-list-header">
                <span class="episodes-count">共 {{ episodes.length }} 个剧集</span>
              </div>
<TransitionGroup name="episode">
  <div 
    v-for="(episode, index) in reversedEpisodes" 
    :key="episode.id" 
    class="episode-card"
    :style="{ '--index': index }"
  >
                  <div class="episode-card-header">
                    <div class="episode-badge">
                      <span class="episode-index">P{{ episodes.length - index }}</span>
                    </div>
                    <div class="episode-info">
                      <input 
                        v-model="episode.title" 
                        type="text" 
                        class="episode-title-input" 
                        :placeholder="'剧集 ' + (episodes.length - index) + ' 标题'"
                      />
                      <div class="episode-meta">
                        <span v-if="episode.file" class="episode-meta-item">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                            <polyline points="13 2 13 9 20 9"/>
                          </svg>
                          {{ formatFileSize(episode.file.size) }}
                        </span>
                        <span v-if="episode.duration" class="episode-meta-item">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                          </svg>
                          {{ formatDuration(episode.duration) }}
                        </span>
                      </div>
                    </div>
                    <button 
                      v-if="episodes.length > 1" 
                      class="delete-episode-btn" 
                      @click="removeEpisode(getOriginalIndex(index))"
                      title="删除剧集"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>

                  <div class="episode-content">
                    <input 
                      :ref="el => { if (el) videoInputs[getOriginalIndex(index)] = el }" 
                      type="file" 
                      accept="video/*" 
                      style="display: none" 
                      @change="(e) => handleVideoChange(e, getOriginalIndex(index))"
                    />
                    
                    <div 
                      v-if="episode.file || (editingVideoUid && episode.videoPreviewUrl)" 
                      class="video-preview-card"
                    >
                      <div class="video-preview-main">
                        <video 
                          :src="episode.videoPreviewUrl" 
                          class="video-preview-player"
                          controls
                        ></video>
                      </div>
                      <div class="video-preview-actions">
                        <button class="video-action-btn" @click="triggerVideoUpload(getOriginalIndex(index))">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="17 8 12 3 7 8"/>
                            <line x1="12" y1="3" x2="12" y2="15"/>
                          </svg>
                          更换视频
                        </button>
                        <button class="video-action-btn danger" @click="removeFile(getOriginalIndex(index))">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          </svg>
                          删除
                        </button>
                      </div>
                    </div>

                    <div 
                      v-else 
                      class="upload-zone" 
                      @click="triggerVideoUpload(getOriginalIndex(index))"
                    >
                      <div class="upload-zone-inner">
                        <div class="upload-icon">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="17 8 12 3 7 8"/>
                            <line x1="12" y1="3" x2="12" y2="15"/>
                          </svg>
                        </div>
                        <span class="upload-title">点击上传视频</span>
                        <span class="upload-hint">支持 MP4、AVI、MOV 等格式，最大 16GB</span>
                      </div>
                    </div>

                    <div v-if="episode.uploading" class="upload-progress">
                      <div class="progress-info">
                        <span class="progress-status">上传中...</span>
                        <span class="progress-percent">{{ episode.progress }}%</span>
                      </div>
                      <div class="progress-bar">
                        <div class="progress-fill" :style="{ width: episode.progress + '%' }"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </TransitionGroup>
            </div>
          </div>

          <div v-show="currentStep === 2" class="form-section fade-in">
            <h2 class="section-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              确认投稿
            </h2>

            <div class="review-section">
              <div class="review-row">
                <div class="review-group">
                  <span class="review-label">视频标题</span>
                  <span class="review-value">{{ form.title || '未填写' }}</span>
                </div>
                <div class="review-group">
                  <span class="review-label">视频分类</span>
                  <span class="review-value">{{ selectedCategoryName || '未选择' }}</span>
                </div>
                <div class="review-group">
                  <span class="review-label">连载状态</span>
                  <span class="review-value">{{ form.isFinished ? '已完结' : '连载中' }}</span>
                </div>
              </div>

              <div class="review-group" v-if="form.tags.length > 0">
                <span class="review-label">视频标签</span>
                <div class="review-tags">
                  <span v-for="(tag, index) in form.tags" :key="index" class="review-tag">{{ tag }}</span>
                </div>
              </div>

              <div class="review-group" v-if="form.description">
                <span class="review-label">视频简介</span>
                <p class="review-desc">{{ form.description }}</p>
              </div>

              <div class="review-group">
                <span class="review-label">封面图</span>
                <div v-if="coverPreview" class="review-cover">
                  <img :src="coverPreview" alt="封面预览" />
                </div>
                <span v-else class="review-value">未上传</span>
              </div>
            </div>

            <div class="review-episodes">
              <h3 class="review-episodes-title">剧集列表（{{ episodes.filter(ep => ep.file || (editingVideoUid && ep.videoPreviewUrl)).length }} 集）</h3>
              <div class="review-episodes-list">
                <div 
                  v-for="(episode, index) in episodes.filter(ep => ep.file || (editingVideoUid && ep.videoPreviewUrl))" 
                  :key="episode.id" 
                  class="review-episode-item"
                >
                  <div class="review-episode-index">P{{ index + 1 }}</div>
                  <div class="review-episode-preview">
                    <video 
                      :src="episode.videoPreviewUrl" 
                      class="review-episode-video"
                    ></video>
                  </div>
                  <div class="review-episode-info">
                    <span class="review-episode-name">{{ episode.title || `剧集${index + 1}` }}</span>
                    <span v-if="episode.file" class="review-episode-meta">{{ formatFileSize(episode.file.size) }}</span>
                    <span v-else class="review-episode-meta">已有视频</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button 
              v-if="currentStep > 0 && !addingEpisodeMode" 
              class="btn btn-outline" 
              @click="prevStep"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              上一步
            </button>
            <button 
              v-if="currentStep < 2" 
              class="btn btn-primary" 
              :disabled="!canNextStep" 
              @click="nextStep"
            >
              下一步
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
            <button 
              v-else 
              class="btn btn-submit" 
              :disabled="!canSubmit || submitting" 
              @click="handleSubmit"
            >
              <svg v-if="!submitting" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 2L11 13"/>
                <path d="M22 2l-7 20-4-9-9-4 20-7z"/>
              </svg>
              <span v-else class="spinner"></span>
              {{ submitting ? '投稿中...' : '提交投稿' }}
            </button>
          </div>
        </div>
           </div>
      </div>
    </div>
  </div>

<!-- 视频截取封面弹窗 -->
<Teleport to="body">
  <Transition name="fav-overlay" mode="out-in">
    <div v-if="showCaptureDialog" class="fav-overlay" @click.self="showCaptureDialog = false">
      <Transition name="fav-dialog" appear>
        <div v-if="showCaptureDialog" class="fav-dialog capture-dialog">
          <div class="fav-dialog-header">
            <h3>截取封面</h3>
            <button class="fav-close-btn" @click="showCaptureDialog = false">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="fav-dialog-body">
            <div class="capture-video-wrap">
              <video 
                ref="captureVideoRef" 
                :src="captureVideoUrl" 
                class="capture-video"
                preload="metadata"
                @loadedmetadata="onCaptureVideoLoaded"
                @timeupdate="onCaptureTimeUpdate"
              ></video>
              <div class="capture-time-display">{{ formatCaptureTime(captureCurrentTime) }} / {{ formatCaptureTime(captureDuration) }}</div>
            </div>
            <div class="capture-slider-wrap">
              <input 
                type="range" 
                class="capture-slider"
                :min="0" 
                :max="captureDuration || 100" 
                :step="0.1"
                :value="captureCurrentTime"
                @input="onCaptureSliderChange"
              />
            </div>
            <div class="capture-preview-wrap">
              <span class="capture-preview-label">当前帧预览</span>
              <div class="capture-preview-box">
                <canvas ref="captureCanvasRef" class="capture-preview-canvas"></canvas>
              </div>
            </div>
          </div>
          <div class="fav-dialog-footer">
            <button class="fav-btn fav-btn-cancel" @click="showCaptureDialog = false">取消</button>
            <button class="fav-btn fav-btn-confirm" @click="confirmCapture">确认截取</button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</Teleport>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getCategoryList } from '../api/category'
import { uploadFile } from '../utils/fileUpload'
import { submitVideo, getMyContributions, updateVideo, getVideoDetailByUid, toggleVideoOngoing, getStatsDataCenter } from '../api/video'
import { ElMessage } from 'element-plus'
import CreatorHeader from '../components/layout/CreatorHeader.vue'

const router = useRouter()
const route = useRoute()

const steps = ['基本信息', '剧集管理', '确认投稿']
const currentStep = ref(0)
const activeMenu = ref('contributions')

// 稿件管理相关
const contributions = ref([])
const loadingContributions = ref(false)
const contributionSearchKey = ref('')
const contributionStatusFilter = ref('')
const contributionCurrentPage = ref(1)
const contributionTotal = ref(0)
const contributionPageSize = 10

const contributionTotalPages = computed(() => Math.ceil(contributionTotal.value / contributionPageSize))

// 数据概览相关
const statsData = ref({
  totalPlayCount: 0,
  totalFavoriteCount: 0,
  totalCoinCount: 0,
  totalLikeCount: 0,
  hotVideos: [],
  favoriteVideos: []
})
const loadingStats = ref(false)

watch(activeMenu, (val) => {
  if (val === 'contributions') {
    loadContributions()
  } else if (val === 'stats') {
    loadStatsData()
  }
})

const formatDuration = (seconds) => {
  if (!seconds) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const categories = ref([])
const form = ref({
  title: '',
  categoryId: '',
  description: '',
  isFinished: false,
  tags: []
})
const tagInput = ref('')
const maxTagLength = 10
const coverFile = ref(null)
const coverPreview = ref('')
const coverInput = ref(null)

// 视频截取封面相关
const showCaptureDialog = ref(false)
const captureVideoRef = ref(null)
const captureCanvasRef = ref(null)
const captureVideoUrl = ref('')
const captureCurrentTime = ref(0)
const captureDuration = ref(0)
const videoInputs = ref({})
let episodeIdCounter = 1

function createEpisode() {
  return {
    id: episodeIdCounter++,
    title: '',
    file: null,
    videoPreviewUrl: '',
    duration: 0,
    uploading: false,
    progress: 0
  }
}

const episodes = ref([createEpisode()])
const submitting = ref(false)
const editingVideoUid = ref('')
const addingEpisodeMode = ref(false)

const reversedEpisodes = computed(() => [...episodes.value].reverse())
const getOriginalIndex = (reversedIndex) => episodes.value.length - 1 - reversedIndex

const canNextStep = computed(() => {
  if (currentStep.value === 0) {
    return form.value.title.trim() && form.value.categoryId
  }
  if (currentStep.value === 1) {
    return episodes.value.some(ep => ep.file || (editingVideoUid.value && ep.videoPreviewUrl))
  }
  return true
})

const canSubmit = computed(() => {
  return form.value.title.trim() && 
         form.value.categoryId && 
         episodes.value.some(ep => ep.file || (editingVideoUid.value && ep.videoPreviewUrl))
})

const selectedCategoryName = computed(() => {
  const cat = categories.value.find(c => c.id === form.value.categoryId)
  return cat?.name || ''
})

onMounted(async () => {
  try {
    const res = await getCategoryList()
    categories.value = (res || []).filter(c => c.id !== 1)
  } catch (e) {
    console.error('获取分类失败:', e)
  }
  if (route.query.page) {
    contributionCurrentPage.value = parseInt(route.query.page) || 1
  }
  if (route.query.status) {
    contributionStatusFilter.value = route.query.status
  }
  if (route.query.search) {
    contributionSearchKey.value = route.query.search
  }
  if (activeMenu.value === 'contributions') {
    loadContributions(contributionCurrentPage.value)
  }
})

const loadContributions = async (page = 1) => {
  loadingContributions.value = true
  try {
    const params = {
      page,
      size: contributionPageSize
    }
    if (contributionSearchKey.value.trim()) {
      params.title = contributionSearchKey.value.trim()
    }
    if (contributionStatusFilter.value !== '') {
      params.videoStatus = contributionStatusFilter.value
    }
    const res = await getMyContributions(params)
    contributions.value = res?.records || []
    contributionTotal.value = res?.total || 0
    contributionCurrentPage.value = page
  } catch (e) {
    console.error('获取稿件列表失败:', e)
    contributions.value = []
  } finally {
    loadingContributions.value = false
  }
}

const searchContributions = () => {
  loadContributions(1)
}

const loadStatsData = async () => {
  loadingStats.value = true
  try {
    const res = await getStatsDataCenter()
    statsData.value = {
      totalPlayCount: res?.totalPlayCount || 0,
      totalFavoriteCount: res?.totalFavoriteCount || 0,
      totalCoinCount: res?.totalCoinCount || 0,
      totalLikeCount: res?.totalLikeCount || 0,
      hotVideos: res?.hotVideos || [],
      favoriteVideos: res?.favoriteVideos || []
    }
  } catch (e) {
    console.error('获取数据概览失败:', e)
  } finally {
    loadingStats.value = false
  }
}

const getStatusClass = (status) => {
  const s = Number(status)
  const map = { 0: 'pending', 1: 'approved', 2: 'approved', 3: 'rejected' }
  return map[s] || 'pending'
}

const getStatusText = (status) => {
  const s = Number(status)
  const map = { 0: '草稿', 1: '待发布', 2: '已发布', 3: '已下架' }
  return map[s] || '未知'
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const m = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  return `${m}-${day}`
}

const formatCount = (num) => {
  if (num >= 10000) return (num / 10000).toFixed(1) + '万'
  return num.toString()
}

const goToVideo = (item) => {
  if (item.playLink) {
    router.push(item.playLink)
  }
}

const editContribution = async (item) => {
  try {
    const res = await getVideoDetailByUid(item.videoUid || item.avid)
    if (res) {
      editingVideoUid.value = item.videoUid || item.avid
      form.value = {
        title: res.title || '',
        categoryId: res.categoryId || '',
        description: res.description || '',
        isFinished: !res.isOngoing,
        tags: res.tags || []
      }
      if (res.coverUrl) {
        coverPreview.value = res.coverUrl
      }
      if (res.episodes && res.episodes.length > 0) {
        episodes.value = res.episodes.map((ep, index) => ({
          id: ep.id || index + 1,
          serverId: ep.id,
          title: ep.title || '',
          file: null,
          videoPreviewUrl: ep.playUrl || '',
          duration: ep.duration || 0,
          uploading: false,
          progress: 0
        }))
      } else {
        episodes.value = [createEpisode()]
      }
      currentStep.value = 0
      activeMenu.value = 'submit'
    }
  } catch (e) {
    console.error('获取视频详情失败:', e)
    ElMessage.error('获取视频详情失败')
  }
}

const deleteContribution = (item) => {
  ElMessage.info('删除功能开发中')
}

const toggleOngoing = async (item) => {
  try {
    await toggleVideoOngoing(item.videoUid || item.avid)
    item.isOngoing = !item.isOngoing
    ElMessage.success(item.isOngoing ? '已切换为连载中' : '已切换为已完结')
  } catch (e) {
    console.error('切换连载状态失败:', e)
    ElMessage.error('切换连载状态失败')
  }
}

const goToEpisodeManagement = (item) => {
  const query = {
    page: contributionCurrentPage.value,
    status: contributionStatusFilter.value,
    search: contributionSearchKey.value
  }
  router.push({ path: `/contribution/episodes/${item.videoUid || item.avid}`, query })
}

// 切换菜单时加载数据
const handleMenuChange = (menu) => {
  if (menu === 'contributions') {
    loadContributions()
  }
}

const nextStep = () => {
  if (canNextStep.value && currentStep.value < 2) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const resetFormAndGoSubmit = () => {
  editingVideoUid.value = ''
  addingEpisodeMode.value = false
  form.value = { title: '', categoryId: '', description: '', isFinished: false, tags: [] }
  coverFile.value = null
  coverPreview.value = ''
  episodes.value = [createEpisode()]
  currentStep.value = 0
  activeMenu.value = 'submit'
}

const triggerCoverUpload = () => {
  coverInput.value.click()
}

const handleCoverChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    coverFile.value = file
    coverPreview.value = URL.createObjectURL(file)
  }
}

const captureCoverFromVideo = () => {
  const videoWithPreview = episodes.value.find(ep => ep.videoPreviewUrl)
  if (!videoWithPreview) {
    ElMessage.warning('请先上传视频')
    return
  }
  captureVideoUrl.value = videoWithPreview.videoPreviewUrl
  captureCurrentTime.value = 0
  captureDuration.value = 0
  showCaptureDialog.value = true
}

const onCaptureVideoLoaded = () => {
  if (captureVideoRef.value) {
    captureDuration.value = captureVideoRef.value.duration
    captureVideoRef.value.currentTime = 0
  }
}

const onCaptureTimeUpdate = () => {
  if (captureVideoRef.value) {
    captureCurrentTime.value = captureVideoRef.value.currentTime
    updateCapturePreview()
  }
}

const onCaptureSliderChange = (e) => {
  const time = parseFloat(e.target.value)
  captureCurrentTime.value = time
  if (captureVideoRef.value) {
    captureVideoRef.value.currentTime = time
  }
}

const updateCapturePreview = () => {
  if (captureVideoRef.value && captureCanvasRef.value) {
    const video = captureVideoRef.value
    const canvas = captureCanvasRef.value
    const videoWidth = video.videoWidth || 320
    const videoHeight = video.videoHeight || 180
    const maxHeight = 240
    const scale = Math.min(1, maxHeight / videoHeight)
    canvas.width = videoWidth * scale
    canvas.height = videoHeight * scale
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
  }
}

const formatCaptureTime = (seconds) => {
  if (!seconds) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const confirmCapture = () => {
  if (captureVideoRef.value && captureCanvasRef.value) {
    const video = captureVideoRef.value
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'cover.jpg', { type: 'image/jpeg' })
        coverFile.value = file
        coverPreview.value = URL.createObjectURL(file)
        showCaptureDialog.value = false
        ElMessage.success('封面截取成功')
      }
    }, 'image/jpeg', 0.9)
  }
}

const triggerVideoUpload = (index) => {
  videoInputs.value[index]?.click()
}

const handleVideoChange = (e, index) => {
  const file = e.target.files[0]
  if (file) {
    episodes.value[index].file = file
    episodes.value[index].title = file.name.replace(/\.[^/.]+$/, '')
    if (episodes.value[index].videoPreviewUrl) {
      URL.revokeObjectURL(episodes.value[index].videoPreviewUrl)
    }
    const previewUrl = URL.createObjectURL(file)
    episodes.value[index].videoPreviewUrl = previewUrl
    
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.onloadedmetadata = () => {
      episodes.value[index].duration = Math.floor(video.duration)
    }
    video.src = previewUrl
  }
}

const removeFile = (index) => {
  if (episodes.value[index].videoPreviewUrl) {
    URL.revokeObjectURL(episodes.value[index].videoPreviewUrl)
  }
  episodes.value[index].file = null
  episodes.value[index].videoPreviewUrl = ''
  episodes.value[index].progress = 0
}

const addTag = () => {
  const tag = tagInput.value.trim()
  if (tag && !form.value.tags.includes(tag)) {
    if (tag.length <= maxTagLength) {
      form.value.tags.push(tag)
      tagInput.value = ''
    } else {
      ElMessage.warning(`标签最多${maxTagLength}个字`)
    }
  }
}

const removeTag = (index) => {
  form.value.tags.splice(index, 1)
}

const addEpisode = () => {
  episodes.value.push(createEpisode())
}

const removeEpisode = (index) => {
  if (episodes.value.length > 1) {
    if (episodes.value[index].videoPreviewUrl) {
      URL.revokeObjectURL(episodes.value[index].videoPreviewUrl)
    }
    episodes.value.splice(index, 1)
  }
}

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
}

const handleSubmit = async () => {
  if (!canSubmit.value || submitting.value) return

  submitting.value = true

  try {
    if (addingEpisodeMode.value) {
      const newEpisodes = episodes.value.filter(ep => ep.file)
      for (let i = 0; i < newEpisodes.length; i++) {
        const episode = newEpisodes[i]
        episode.uploading = true
        episode.progress = 0

        const result = await uploadFile(episode.file, (progress) => {
          episode.progress = progress
        })

        await addVideoEpisode({
          videoUid: editingVideoUid.value,
          title: episode.title || undefined,
          playUrl: result?.url || result?.filePath || '',
          duration: episode.duration || 0
        })

        episode.uploading = false
      }
      ElMessage.success('剧集添加成功！')
    } else {
      let coverUrl = coverPreview.value || ''
      if (coverFile.value) {
        const coverResult = await uploadFile(coverFile.value)
        coverUrl = coverResult?.url || coverResult?.filePath || ''
      }

      const uploadedEpisodes = []
      for (let i = 0; i < episodes.value.length; i++) {
        const episode = episodes.value[i]
        
        if (episode.file) {
          episode.uploading = true
          episode.progress = 0

          const result = await uploadFile(episode.file, (progress) => {
            episode.progress = progress
          })

          uploadedEpisodes.push({
            id: editingVideoUid.value ? episode.serverId : undefined,
            title: episode.title || `剧集${i + 1}`,
            playUrl: result?.url || result?.filePath || '',
            duration: episode.duration || 0,
            sort: i + 1
          })

          episode.uploading = false
        } else if (editingVideoUid.value && episode.videoPreviewUrl) {
          uploadedEpisodes.push({
            id: episode.serverId,
            title: episode.title || `剧集${i + 1}`,
            playUrl: episode.videoPreviewUrl,
            duration: episode.duration || 0,
            sort: i + 1
          })
        }
      }

      const submitData = {
        title: form.value.title,
        categoryId: form.value.categoryId,
        description: form.value.description,
        isOngoing: !form.value.isFinished,
        tags: form.value.tags,
        coverUrl,
        episodes: uploadedEpisodes
      }

      if (editingVideoUid.value) {
        submitData.videoUid = editingVideoUid.value
        await updateVideo(submitData)
        ElMessage.success('更新成功！')
      } else {
        await submitVideo(submitData)
        ElMessage.success('投稿成功！')
      }
    }
    
    editingVideoUid.value = ''
    addingEpisodeMode.value = false
    form.value = { title: '', categoryId: '', description: '', isFinished: false, tags: [] }
    coverFile.value = null
    coverPreview.value = ''
    episodes.value = [createEpisode()]
    currentStep.value = 0
    router.push('/profile?tab=submit')
  } catch (e) {
    console.error('投稿失败:', e)
    ElMessage.error(e.message || '投稿失败，请重试')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.contribution-page {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--bg1) 0%, var(--bg2) 100%);
}

.page-content {
  padding-top: 76px;
  max-width: 1200px;
  margin: 0 auto;
  padding-left: 24px;
  padding-right: 24px;
  padding-bottom: 40px;
}

.page-header {
  margin-bottom: 32px;
  padding-top: 8px;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 26px;
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
  position: sticky;
  top: 76px;
  height: fit-content;
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
  background: linear-gradient(135deg, var(--brand_pink) 0%, #ff6b9d 100%);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(255, 92, 122, 0.3);
}

.new-contribution-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(255, 92, 122, 0.4);
}

.sidebar-nav {
  background: var(--bg2);
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 16px;
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
  transition: all 0.2s ease;
}

.nav-subitem:hover {
  background: var(--bg3);
  color: var(--text1);
}

.nav-subitem.active {
  background: rgba(255, 92, 122, 0.1);
  color: var(--brand_pink);
}

.steps-progress {
  background: var(--bg2);
  border-radius: 12px;
  padding: 16px;
}

.progress-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text2);
  margin-bottom: 12px;
  padding: 0 4px;
}

.progress-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 4px;
}

.progress-dot {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  background: var(--bg3);
  color: var(--text4);
  transition: all 0.3s ease;
}

.progress-item.active .progress-dot {
  background: var(--brand_pink);
  color: #fff;
  box-shadow: 0 2px 8px rgba(255, 92, 122, 0.4);
}

.progress-item.completed .progress-dot {
  background: #00b578;
  color: #fff;
}

.progress-label {
  font-size: 13px;
  color: var(--text3);
}

.progress-item.active .progress-label {
  color: var(--text1);
  font-weight: 500;
}

.progress-item.completed .progress-label {
  color: var(--text2);
}

.contribution-content {
  flex: 1;
  min-width: 0;
  overflow-x: auto;
}

.edit-notice {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  background: rgba(255, 152, 0, 0.1);
  border: 1px solid rgba(255, 152, 0, 0.3);
  border-radius: 8px;
  color: #e6a23c;
  font-size: 14px;
}

.form-section {
  background: var(--bg2);
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.info-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.info-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: var(--bg1);
  border-radius: 12px;
  border: 1px solid var(--line_regular);
  transition: all 0.2s ease;
}

.info-card:hover {
  border-color: var(--brand_pink);
  box-shadow: 0 2px 8px rgba(255, 92, 122, 0.1);
}

.info-card-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(255, 92, 122, 0.1) 0%, rgba(255, 107, 157, 0.1) 100%);
  border-radius: 10px;
  color: var(--brand_pink);
  flex-shrink: 0;
}

.info-card-content {
  flex: 1;
  min-width: 0;
}

.info-card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text1);
  margin-bottom: 4px;
}

.info-card-desc {
  font-size: 13px;
  color: var(--text2);
  line-height: 1.4;
}

.info-card-hint {
  font-size: 12px;
  color: var(--text4);
  margin-top: 4px;
  line-height: 1.4;
}

.fade-in {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: var(--text1);
  margin: 0 0 24px 0;
}

.section-title svg {
  color: var(--brand_pink);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.section-header .section-title {
  margin-bottom: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text1);
}

.required {
  color: var(--brand_pink);
  margin-left: 2px;
}

.input-wrapper {
  position: relative;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid var(--line_regular);
  border-radius: 10px;
  background: var(--bg1);
  color: var(--text1);
  font-size: 14px;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.form-input:hover,
.form-textarea:hover {
  border-color: var(--text4);
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--brand_pink);
  box-shadow: 0 0 0 3px rgba(255, 92, 122, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
  line-height: 1.6;
}

.char-count {
  position: absolute;
  right: 12px;
  bottom: 10px;
  font-size: 12px;
  color: var(--text4);
  pointer-events: none;
}

.form-textarea + .char-count {
  bottom: 12px;
}

.tags-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px 14px;
  border: 1.5px solid var(--line_regular);
  border-radius: 10px;
  background: var(--bg1);
  min-height: 44px;
  align-items: center;
  transition: all 0.2s ease;
}

.tags-list:focus-within {
  border-color: var(--brand_pink);
  box-shadow: 0 0 0 3px rgba(255, 92, 122, 0.1);
}

.tag-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: linear-gradient(135deg, rgba(255, 92, 122, 0.1) 0%, rgba(255, 107, 157, 0.1) 100%);
  border-radius: 6px;
  font-size: 13px;
  color: var(--brand_pink);
  animation: fadeIn 0.2s ease;
}

.tag-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--brand_pink);
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.tag-remove:hover {
  opacity: 1;
}

.tag-input {
  flex: 1;
  min-width: 120px;
  padding: 4px 0;
  border: none;
  background: transparent;
  font-size: 14px;
  color: var(--text1);
  outline: none;
}

.tag-input::placeholder {
  color: var(--text4);
}

.tags-hint {
  font-size: 12px;
  color: var(--text4);
}

.radio-group {
  display: flex;
  gap: 16px;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  background: var(--bg1);
  border: 1.5px solid var(--line_regular);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
  white-space: nowrap;
}

.radio-item:hover {
  border-color: var(--text4);
}

.radio-item.active {
  border-color: var(--brand_pink);
  background: rgba(255, 92, 122, 0.04);
}

.radio-item input {
  display: none;
}

.radio-dot {
  width: 18px;
  height: 18px;
  border: 2px solid var(--line_regular);
  border-radius: 50%;
  position: relative;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.radio-item.active .radio-dot {
  border-color: var(--brand_pink);
}

.radio-item.active .radio-dot::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  background: var(--brand_pink);
  border-radius: 50%;
}

.radio-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text1);
}

.radio-hint {
  white-space: nowrap;
  font-size: 12px;
  color: var(--text4);
  margin-left: auto;
}

.select-wrapper {
  position: relative;
}

.form-select {
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: 1.5px solid var(--line_regular);
  border-radius: 10px;
  background: var(--bg1);
  color: var(--text1);
  font-size: 14px;
  cursor: pointer;
  appearance: none;
  transition: all 0.2s ease;
}

.form-select:hover {
  border-color: var(--text4);
}

.form-select:focus {
  outline: none;
  border-color: var(--brand_pink);
  box-shadow: 0 0 0 3px rgba(255, 92, 122, 0.1);
}

.select-arrow {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text4);
  pointer-events: none;
}

.cover-section {
  margin-bottom: 24px;
  padding: 20px;
  background: var(--bg2);
  border-radius: 12px;
  border: 1px solid var(--line_light);
}

.cover-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.cover-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 500;
  color: var(--text1);
}

.cover-section-title svg {
  color: var(--brand_pink);
}

.cover-section-hint {
  font-size: 12px;
  color: var(--text4);
}

.cover-upload-area {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.capture-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: var(--bg1);
  border: 1px solid var(--line_regular);
  border-radius: 8px;
  color: var(--text2);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.capture-btn:hover {
  background: var(--bg3);
  color: var(--brand_pink);
  border-color: var(--brand_pink);
}

.cover-upload {
  width: 220px;
  height: 124px;
  border: 2px dashed var(--line_regular);
  border-radius: 10px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.cover-upload:hover {
  border-color: var(--brand_pink);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.cover-preview {
  position: relative;
  width: 100%;
  height: 100%;
}

.cover-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.cover-upload:hover .cover-overlay {
  opacity: 1;
}

.cover-overlay svg,
.cover-overlay span {
  color: #fff;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--text4);
}

.cover-placeholder .upload-text {
  font-size: 14px;
  font-weight: 500;
}

.cover-placeholder .upload-hint {
  font-size: 12px;
  opacity: 0.7;
}

.add-episode-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--brand_pink) 0%, #ff6b9d 100%);
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(255, 92, 122, 0.3);
}

.add-episode-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(255, 92, 122, 0.4);
}

.episodes-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.episode-card {
  background: var(--bg1);
  border-radius: 16px;
  border: 1px solid var(--line_light);
  overflow: hidden;
  transition: all 0.3s ease;
}

.episode-card:hover {
  border-color: var(--brand_pink);
  box-shadow: 0 4px 16px rgba(255, 92, 122, 0.1);
}

.episode-card-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  background: var(--bg2);
  border-bottom: 1px solid var(--line_light);
}

.episode-badge {
  flex-shrink: 0;
}

.episode-index {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 32px;
  background: linear-gradient(135deg, var(--brand_pink) 0%, #ff6b9d 100%);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
}

.episode-info {
  flex: 1;
  min-width: 0;
}

.episode-title-input {
  width: 100%;
  padding: 8px 0;
  border: none;
  background: transparent;
  color: var(--text1);
  font-size: 15px;
  font-weight: 500;
}

.episode-title-input::placeholder {
  color: var(--text4);
}

.episode-title-input:focus {
  outline: none;
}

.episode-meta {
  display: flex;
  gap: 12px;
  margin-top: 4px;
}

.episode-meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text4);
}

.delete-episode-btn {
  padding: 10px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: var(--text4);
  cursor: pointer;
  transition: all 0.2s ease;
}

.delete-episode-btn:hover {
  background: rgba(245, 108, 108, 0.1);
  color: #f56c6c;
}

.episode-content {
  padding: 20px;
}

.video-preview-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.video-preview-main {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: #000;
  aspect-ratio: 16 / 9;
}

.video-preview-player {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.video-preview-actions {
  display: flex;
  gap: 12px;
}

.video-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid var(--line_regular);
  border-radius: 8px;
  background: var(--bg2);
  color: var(--text2);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.video-action-btn:hover {
  border-color: var(--brand_pink);
  color: var(--brand_pink);
}

.video-action-btn.danger:hover {
  border-color: #f56c6c;
  color: #f56c6c;
  background: rgba(245, 108, 108, 0.05);
}

.upload-zone {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  border: 2px dashed var(--line_regular);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--bg2);
}

.upload-zone:hover {
  border-color: var(--brand_pink);
  background: rgba(255, 92, 122, 0.02);
}

.upload-zone-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.upload-zone .upload-icon {
  color: var(--text4);
  transition: color 0.3s ease;
}

.upload-zone:hover .upload-icon {
  color: var(--brand_pink);
}

.upload-zone .upload-title {
  font-size: 15px;
  color: var(--text2);
  font-weight: 500;
}

.upload-zone .upload-hint {
  font-size: 13px;
  color: var(--text4);
}

.upload-progress {
  margin-top: 16px;
  padding: 14px;
  background: var(--bg2);
  border-radius: 10px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.progress-status {
  font-size: 13px;
  color: var(--text2);
}

.progress-percent {
  font-size: 13px;
  font-weight: 600;
  color: var(--brand_pink);
}

.episodes-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.episodes-count {
  font-size: 13px;
  color: var(--text4);
}

.progress-bar {
  height: 6px;
  background: var(--bg3);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--brand_pink) 0%, #ff6b9d 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.review-section {
  background: var(--bg1);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.review-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 16px;
}

.review-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.review-label {
  font-size: 13px;
  color: var(--text4);
}

.review-value {
  font-size: 14px;
  font-weight: 500;
  color: var(--text1);
}

.review-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.review-tag {
  padding: 4px 12px;
  background: rgba(255, 92, 122, 0.1);
  border-radius: 6px;
  font-size: 13px;
  color: var(--brand_pink);
}

.review-desc {
  font-size: 14px;
  color: var(--text2);
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
}

.review-cover {
  width: 160px;
  height: 90px;
  border-radius: 8px;
  overflow: hidden;
}

.review-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.review-episodes {
  background: var(--bg1);
  border-radius: 12px;
  padding: 20px;
}

.review-episodes-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text1);
  margin: 0 0 16px 0;
}

.review-episodes-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.review-episode-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg2);
  border-radius: 8px;
}

.review-episode-index {
  font-size: 13px;
  font-weight: 600;
  color: var(--brand_pink);
  min-width: 28px;
}

.review-episode-preview {
  width: 120px;
  height: 68px;
  border-radius: 6px;
  overflow: hidden;
  background: #000;
  flex-shrink: 0;
}

.review-episode-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.review-episode-info {
  flex: 1;
  min-width: 0;
}

.review-episode-name {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--text1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.review-episode-meta {
  font-size: 12px;
  color: var(--text4);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-outline {
  background: transparent;
  border: 1.5px solid var(--line_regular);
  color: var(--text2);
}

.btn-outline:hover {
  border-color: var(--text4);
  background: var(--bg3);
}

.btn-primary {
  background: linear-gradient(135deg, var(--brand_pink) 0%, #ff6b9d 100%);
  color: #fff;
  box-shadow: 0 4px 12px rgba(255, 92, 122, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(255, 92, 122, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-submit {
  background: linear-gradient(135deg, #00b578 0%, #00d68f 100%);
  color: #fff;
  box-shadow: 0 4px 12px rgba(0, 181, 120, 0.3);
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 181, 120, 0.4);
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.episode-enter-active,
.episode-leave-active {
  transition: all 0.3s ease;
}

.episode-enter-active {
  transition-delay: calc(var(--index, 0) * 50ms);
}

.episode-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.episode-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.episode-move {
  transition: transform 0.3s ease;
}

/* 稿件管理样式 */
.contributions-manage {
  background: var(--bg2);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  overflow-x: auto;
}

.manage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.manage-filters {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--bg1);
  border: 1px solid var(--line_regular);
  border-radius: 8px;
  width: 240px;
}

.search-box svg {
  color: var(--text4);
  flex-shrink: 0;
}

.search-box input {
  flex: 1;
  border: none;
  background: none;
  font-size: 13px;
  color: var(--text1);
  outline: none;
}

.search-box input::placeholder {
  color: var(--text4);
}

.search-clear {
  cursor: pointer;
  color: var(--text4);
  transition: color 0.2s;
}

.search-clear:hover {
  color: var(--text2);
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid var(--line_regular);
  border-radius: 8px;
  font-size: 13px;
  color: var(--text1);
  background: var(--bg1);
  outline: none;
  cursor: pointer;
}

.manage-stats {
  font-size: 13px;
  color: var(--text3);
}

.manage-stats strong {
  color: var(--brand_pink);
  font-weight: 600;
}

.loading-state {
  display: flex;
  justify-content: center;
  padding: 60px;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--line_regular);
  border-top-color: var(--brand_pink);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.contributions-table {
  border: 1px solid var(--line_light);
  border-radius: 8px;
  overflow-x: auto;
  min-width: 0;
}

.table-header {
  display: grid;
  grid-template-columns: 140px 1fr 100px 90px 120px 110px 120px;
  gap: 16px;
  padding: 12px 16px;
  background: var(--bg3);
  font-size: 12px;
  color: var(--text3);
  font-weight: 500;
  text-align: center;
}

.table-row {
  display: grid;
  grid-template-columns: 140px 1fr 100px 90px 120px 110px 120px;
  gap: 16px;
  padding: 16px;
  border-bottom: 1px solid var(--line_light);
  align-items: center;
  transition: background 0.15s;
  text-align: center;
}

.table-row:last-child {
  border-bottom: none;
}

.table-row:hover {
  background: var(--bg1);
}

.col-cover {
  display: flex;
  justify-content: center;
  min-width: 0;
}

.col-title {
  text-align: left;
  min-width: 0;
}

.video-cover {
  width: 120px;
  height: 68px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  cursor: pointer;
  position: relative;
}

.video-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-duration {
  position: absolute;
  bottom: 4px;
  right: 4px;
  padding: 2px 6px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  font-size: 11px;
  border-radius: 4px;
}

.video-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text1);
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 4px;
}

.video-title:hover {
  color: var(--brand_pink);
}

.video-desc {
  font-size: 12px;
  color: var(--text4);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-tag {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-tag.pending {
  background: rgba(255, 152, 0, 0.1);
  color: #ff9800;
}

.status-tag.approved {
  background: rgba(0, 181, 120, 0.1);
  color: #00b578;
}

.status-tag.rejected {
  background: rgba(245, 108, 108, 0.1);
  color: #f56c6c;
}

.ongoing-tag {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.ongoing-tag.ongoing {
  background: rgba(64, 158, 255, 0.1);
  color: #409eff;
}

.ongoing-tag.finished {
  background: rgba(144, 147, 153, 0.1);
  color: #909399;
}

.ongoing-tag.clickable {
  cursor: pointer;
  transition: all 0.2s;
}

.ongoing-tag.clickable:hover {
  opacity: 0.8;
  transform: scale(1.05);
}

.col-stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
}

.stat-row {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text3);
}

.stat-row svg {
  color: var(--text4);
}

.col-time {
  font-size: 12px;
  color: var(--text3);
  text-align: center;
}

.col-ongoing {
  text-align: center;
}

.col-action {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.action-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: var(--bg1);
  border-radius: 6px;
  color: var(--text3);
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: var(--bg3);
  color: var(--brand_blue);
}

.action-btn.add-btn:hover {
  background: rgba(64, 158, 255, 0.1);
  color: #409eff;
}

.action-btn.delete-btn:hover {
  color: #f56c6c;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  gap: 16px;
}

.empty-state p {
  font-size: 14px;
  color: var(--text4);
}

.btn-sm {
  padding: 8px 16px;
  font-size: 13px;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--line_light);
}

.page-btn {
  padding: 6px 14px;
  border: 1px solid var(--line_regular);
  border-radius: 6px;
  background: var(--bg1);
  color: var(--text2);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  border-color: var(--brand_blue);
  color: var(--brand_blue);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 13px;
  color: var(--text3);
}

.stats-overview {
  background: var(--bg2);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--bg1);
  border-radius: 12px;
  transition: all 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.stat-card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-card-icon.play {
  background: rgba(64, 158, 255, 0.1);
  color: #409eff;
}

.stat-card-icon.favorite {
  background: rgba(255, 92, 122, 0.1);
  color: var(--brand_pink);
}

.stat-card-icon.coin {
  background: rgba(255, 152, 0, 0.1);
  color: #ff9800;
}

.stat-card-icon.like {
  background: rgba(0, 181, 120, 0.1);
  color: #00b578;
}

.stat-card-info {
  flex: 1;
}

.stat-card-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--text1);
  line-height: 1.2;
}

.stat-card-label {
  font-size: 13px;
  color: var(--text3);
  margin-top: 4px;
}

.stats-section {
  margin-bottom: 32px;
}

.stats-section:last-child {
  margin-bottom: 0;
}

.stats-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text1);
  margin: 0 0 16px 0;
}

.stats-video-table {
  border: 1px solid var(--line_light);
  border-radius: 8px;
  overflow: hidden;
}

.stats-video-table .table-header {
  display: grid;
  grid-template-columns: 60px 1fr 100px 80px 100px 100px;
  gap: 16px;
  padding: 12px 16px;
  background: var(--bg3);
  font-size: 12px;
  color: var(--text3);
  font-weight: 500;
  text-align: center;
}

.stats-video-table .table-row {
  display: grid;
  grid-template-columns: 60px 1fr 100px 80px 100px 100px;
  gap: 16px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--line_light);
  align-items: center;
  transition: background 0.15s;
  text-align: center;
}

.stats-video-table .table-row:last-child {
  border-bottom: none;
}

.stats-video-table .table-row:hover {
  background: var(--bg1);
}

.sv-col-rank {
  text-align: center;
}

.rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  background: var(--bg3);
  color: var(--text3);
}

.rank-badge.rank-1 {
  background: linear-gradient(135deg, #ff6b9d, #ff9a5c);
  color: #fff;
}

.rank-badge.rank-2 {
  background: linear-gradient(135deg, #409eff, #53a8ff);
  color: #fff;
}

.rank-badge.rank-3 {
  background: linear-gradient(135deg, #00b578, #36d399);
  color: #fff;
}

.sv-col-title {
  text-align: left;
  min-width: 0;
}

.sv-title-text {
  font-size: 14px;
  color: var(--text1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sv-col-category {
  font-size: 13px;
  color: var(--text3);
}

.sv-col-episodes {
  font-size: 13px;
  color: var(--text3);
}

.sv-col-duration {
  font-size: 13px;
  color: var(--text3);
}

.sv-col-play,
.sv-col-fav {
  font-size: 14px;
  font-weight: 500;
  color: var(--text1);
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--line_light);
  border-top-color: var(--brand_pink);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.capture-dialog {
  width: 640px;
}

.capture-video-wrap {
  position: relative;
  width: 100%;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
}

.capture-video {
  width: 100%;
  display: block;
  max-height: 360px;
}

.capture-time-display {
  position: absolute;
  bottom: 8px;
  right: 8px;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  font-size: 12px;
  border-radius: 4px;
}

.capture-slider-wrap {
  margin-bottom: 16px;
}

.capture-slider {
  width: 100%;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: var(--bg3);
  border-radius: 3px;
  outline: none;
  cursor: pointer;
}

.capture-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: var(--brand_pink);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(255, 92, 122, 0.4);
}

.capture-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: var(--brand_pink);
  border-radius: 50%;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 6px rgba(255, 92, 122, 0.4);
}

.capture-preview-wrap {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.capture-preview-label {
  font-size: 13px;
  color: var(--text3);
}

.capture-preview-box {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #000;
  border-radius: 8px;
  max-height: 240px;
  overflow: hidden;
}

.capture-preview-canvas {
  max-width: 100%;
  max-height: 240px;
  object-fit: contain;
}

.fav-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.fav-dialog {
  background: var(--bg2);
  border-radius: 12px;
  max-height: 90vh;
  overflow: hidden;
}

.fav-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--line_light);
}

.fav-dialog-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text1);
  margin: 0;
}

.fav-close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  color: var(--text3);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
}

.fav-close-btn:hover {
  background: var(--bg3);
  color: var(--text1);
}

.fav-dialog-body {
  padding: 20px;
  max-height: 70vh;
  overflow-y: auto;
}

.fav-dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid var(--line_light);
}

.fav-btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.fav-btn-cancel {
  background: var(--bg1);
  color: var(--text2);
}

.fav-btn-cancel:hover {
  background: var(--bg3);
}

.fav-btn-confirm {
  background: var(--brand_pink);
  color: #fff;
}

.fav-btn-confirm:hover {
  background: #e63e8a;
}
</style>
