<template>
  <div class="profile-page">
    <!-- 内容区域 -->
    <div class="profile-container">

      <!-- 标签页导航 -->
      <div class="profile-tabs">
        <div
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-item"
          :class="{ active: activeTab === tab.key }"
          @click="switchTab(tab.key)"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" v-html="tab.icon"></svg>
          {{ tab.label }}
        </div>
        <div class="tabs-spacer"></div>
        <div v-if="user" class="tabs-stats">
          <div class="tabs-stat-item clickable" @click="goToFollowList">
            <span class="tabs-stat-label">关注数</span>
            <span class="tabs-stat-num">{{ formatCount(user.followCount || 0) }}</span>
          </div>
          <div class="tabs-stat-item clickable" @click="goToFansList">
            <span class="tabs-stat-label">粉丝数</span>
            <span class="tabs-stat-num">{{ formatCount(user.fansCount || 0) }}</span>
          </div>
          <div class="tabs-stat-item">
            <span class="tabs-stat-label">获赞数</span>
            <span class="tabs-stat-num">{{ formatCount(user.totalLikeCount || 0) }}</span>
          </div>
          <div class="tabs-stat-item">
            <span class="tabs-stat-label">播放数</span>
            <span class="tabs-stat-num">{{ formatCount(user.totalPlayCount || 0) }}</span>
          </div>
        </div>
      </div>

      <!-- 统一过渡区域 -->
      <transition name="tab-fade" mode="out-in">
        <!-- 首页：双栏布局 -->
        <div v-if="activeTab === 'home'" key="home" class="profile-body">
          <div class="profile-content">
            <!-- 收藏夹 -->
            <div class="home-section">
              <h3 class="section-title"><IconFavorite :size="18" /> 收藏夹</h3>
              <div v-if="loadingFavoriteFolders" class="loading-state"><div class="loading-spinner"></div></div>
              <div v-else-if="favoriteFolders.length > 0" class="folder-grid">
                <div v-for="folder in favoriteFolders" :key="folder.folderUid" class="folder-card" @click="goToFolder(folder)">
                  <div class="folder-cover">
                    <img v-if="folder.coverUrl" :src="folder.coverUrl" :alt="folder.name" />
                    <div v-else class="folder-cover-default">
                      <IconFavorite :size="32" color="rgba(255,255,255,0.6)" />
                    </div>
                  </div>
                  <div class="folder-info">
                    <div class="folder-title">{{ folder.name }}</div>
                    <div class="folder-type" :class="folder.isPrivate ? 'private' : 'public'">
                      <svg v-if="folder.isPrivate" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                      <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                      {{ folder.isPrivate ? '私密' : '公开' }}
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="empty-small">暂无收藏夹</div>
            </div>

            <!-- 最近投币 -->
            <div class="home-section">
              <h3 class="section-title"><IconCoin :size="18" /> 最近投币</h3>
              <div v-if="loadingCoinVideos" class="loading-state"><div class="loading-spinner"></div></div>
              <div v-else-if="coinVideos.length > 0" class="video-grid">
                <div v-for="video in coinVideos" :key="video.episodeAvid" class="video-card" @click="handleVideoClick(video)">
                  <div class="video-cover">
                    <img :src="video.videoCover" :alt="video.videoTitle" loading="lazy" />
                    <div class="cover-stats">
                      <span class="stat">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                        {{ formatCount(video.playCount || 0) }}
                      </span>
                      <span class="stat">
                        <IconFavorite :size="12" />
                        {{ formatCount(video.favoriteCount || 0) }}
                      </span>
                    </div>
                  </div>
                  <div class="video-info">
                    <div class="video-title">{{ video.episodeTitle || video.videoTitle }}</div>
                    <div class="video-meta">
                      <span class="video-author">{{ video.nickName }}</span>
                      <span class="video-date">{{ formatTime(video.actionTime) }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="empty-small">暂无投币视频</div>
            </div>

            <!-- 最近点赞 -->
            <div class="home-section">
              <h3 class="section-title"><IconLike :size="18" /> 最近点赞</h3>
              <div v-if="loadingLikeVideos" class="loading-state"><div class="loading-spinner"></div></div>
              <div v-else-if="likeVideos.length > 0" class="video-grid">
                <div v-for="video in likeVideos" :key="video.episodeAvid" class="video-card" @click="handleVideoClick(video)">
                  <div class="video-cover">
                    <img :src="video.videoCover" :alt="video.videoTitle" loading="lazy" />
                    <div class="cover-stats">
                      <span class="stat">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                        {{ formatCount(video.playCount || 0) }}
                      </span>
                      <span class="stat">
                        <IconFavorite :size="12" />
                        {{ formatCount(video.favoriteCount || 0) }}
                      </span>
                    </div>
                  </div>
                  <div class="video-info">
                    <div class="video-title">{{ video.episodeTitle || video.videoTitle }}</div>
                    <div class="video-meta">
                      <span class="video-author">{{ video.nickName }}</span>
                      <span class="video-date">{{ formatTime(video.actionTime) }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="empty-small">暂无点赞视频</div>
            </div>
          </div>

          <!-- 右侧信息卡 -->
          <div class="profile-sidebar">
            <div class="info-card">
              <div class="card-header">
                <h3 class="card-title">基本信息</h3>
                <div class="card-edit">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </div>
              </div>
              <div class="card-list">
                <div class="card-item"><span class="item-label">UID</span><span class="item-value">{{ user?.uid || '--' }}</span></div>
                <div class="card-item"><span class="item-label">生日</span><span class="item-value">{{ user?.birthday || '未填写' }}</span></div>
                <div class="card-item"><span class="item-label">性别</span><span class="item-value">{{ user?.gender === true ? '男' : user?.gender === false ? '女' : '保密' }}</span></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 投稿页 - 时间线 -->
        <div v-else-if="activeTab === 'submit'" key="submit" class="profile-content-full">
          <div class="tab-content">
            <div v-if="loadingSubmit && monthlyVideos.length === 0" class="loading-state"><div class="loading-spinner"></div></div>
            <div v-else-if="monthlyVideos.length > 0" class="timeline-container">
              <div v-for="(monthGroup, index) in monthlyVideos" :key="monthGroup.month" class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-line" v-if="index < monthlyVideos.length - 1"></div>
                <div class="timeline-content">
                  <div class="timeline-header">
                    <span class="timeline-month">{{ monthGroup.month }}</span>
                    <span class="timeline-count">{{ monthGroup.count }}个视频</span>
                  </div>
                  <div class="video-grid">
                    <div v-for="video in monthGroup.videos" :key="video.id" class="video-card" @click="handleVideoClick(video)">
                      <div class="video-cover">
                        <img :src="video.coverUrl" :alt="video.title" />
                        <div class="cover-stats">
                          <span class="stat">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                            {{ formatCount(video.playCount) }}
                          </span>
                          <span class="stat">
                            <IconFavorite :size="12" />
                            {{ formatCount(video.favoriteCount) }}
                          </span>
                        </div>
                        <span class="video-status" :class="'status-' + video.videoStatus">{{ getStatusText(video.videoStatus) }}</span>
                      </div>
                      <div class="video-info">
                        <div class="video-title">{{ video.title }}</div>
                        <div class="video-meta">
                          <span class="episode-count">{{ video.episodeCount }}集</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- 加载更多指示器 -->
              <div v-if="loadingSubmit" class="timeline-loading">
                <div class="loading-spinner"></div>
                <span>加载更多...</span>
              </div>
              <div v-if="noMoreData" class="timeline-end">没有更多了</div>
            </div>
            <div v-else class="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity="0.2">
                <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/>
              </svg>
              <p>还没有投稿视频</p>
            </div>
          </div>
        </div>

        <!-- 收藏页 -->
        <div v-else-if="activeTab === 'favorites'" key="favorites" class="profile-content-full">
          <div class="favorites-layout">
            <!-- 左侧收藏夹列表 -->
            <div class="favorites-sidebar">
              <div class="sidebar-header">
                <h3>我的收藏夹</h3>
              </div>
              <div class="sidebar-body">
                <div v-if="loadingFavoriteFolders" class="loading-state"><div class="loading-spinner"></div></div>
                <div v-else-if="favoriteFolders.length > 0" class="folder-list">
                  <div
                    v-for="folder in favoriteFolders"
                    :key="folder.folderUid"
                    class="folder-item"
                    :class="{ active: selectedFolder?.folderUid === folder.folderUid }"
                    @click="selectFolder(folder)"
                    @mouseenter="hoveredFolderUid = folder.folderUid"
                    @mouseleave="hoveredFolderUid = ''"
                  >
                    <div class="folder-info">
                      <div class="folder-name">{{ folder.name }}</div>
                      <div class="folder-count">{{ folder.count || 0 }}个内容</div>
                    </div>
                    <div class="folder-type" :class="folder.isPrivate ? 'private' : 'public'">
                      <svg v-if="folder.isPrivate" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                      <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                      <div v-if="hoveredFolderUid === folder.folderUid" class="folder-more-btn" @click.stop="toggleFolderMenu(folder.folderUid, $event)">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="empty-sidebar">
                  <IconFavorite :size="32" color="var(--text4)" />
                  <span>暂无收藏夹</span>
                </div>
              </div>
              <div class="sidebar-footer">
                <button class="add-folder-btn" @click="openCreateDialog">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  添加收藏夹
                </button>
              </div>
            </div>

            <!-- 右侧视频列表 -->
            <div class="favorites-content">
              <div v-if="!selectedFolder" class="empty-content">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-opacity="0.3">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <p>请从左侧选择收藏夹</p>
              </div>
              <div v-else>
                <!-- 搜索栏 -->
                <div class="favorites-search">
                  <div class="search-box">
                    <div class="search-select">
                      <select v-model="favoriteSearchScope" class="search-scope-select">
                        <option value="current">当前收藏夹</option>
                        <option value="all">整体收藏夹</option>
                      </select>
                    </div>
                    <div class="search-input-wrapper">
                      <input
                        v-model="favoriteSearchKey"
                        type="text"
                        class="search-input"
                        placeholder="搜索收藏视频"
                        @keyup.enter="handleFavoriteSearch"
                      />
                      <svg v-if="favoriteSearchKey" class="search-clear" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" @click="clearFavoriteSearch"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>
                      <svg v-else class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" @click="handleFavoriteSearch" style="cursor: pointer;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    </div>
                  </div>
                </div>
                <div v-if="loadingFavoriteVideos" class="loading-state"><div class="loading-spinner"></div></div>
                <div v-else-if="favoriteVideos.length > 0" class="video-grid">
                  <div v-for="video in favoriteVideos" :key="video.episodeAvid" class="video-card" @click="handleVideoClick(video)">
                    <div class="video-cover">
                      <img :src="video.videoCover" :alt="video.videoTitle" />
                      <div class="cover-stats">
                        <span class="stat">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                          {{ formatCount(video.playCount) }}
                        </span>
                        <span class="stat">
                          <IconFavorite :size="12" />
                          {{ formatCount(video.favoriteCount || 0) }}
                        </span>
                      </div>
                      <span class="video-duration">{{ formatDuration(video.duration) }}</span>
                    </div>
                    <div class="video-info">
                      <div class="video-title">{{ video.videoTitle }}</div>
                      <div class="video-meta">
                        <span class="video-author">{{ video.nickName }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="empty-content">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-opacity="0.3">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  <p>{{ favoriteSearchKey ? '未找到匹配的视频' : '该收藏夹暂无视频' }}</p>
                </div>
                <!-- 分页 -->
                <div v-if="favoriteVideos.length > 0" class="pagination">
                  <button
                    class="page-btn"
                    :disabled="favoriteCurrentPage <= 1"
                    @click="favoriteSearchKey ? searchFavoriteVideos(favoriteCurrentPage - 1) : loadFavoriteVideos(favoriteCurrentPage - 1)"
                  >
                    上一页
                  </button>
                  <span class="page-info">{{ favoriteCurrentPage }} / {{ favoriteTotalPages }}</span>
                  <button
                    class="page-btn"
                    :disabled="favoriteCurrentPage >= favoriteTotalPages"
                    @click="favoriteSearchKey ? searchFavoriteVideos(favoriteCurrentPage + 1) : loadFavoriteVideos(favoriteCurrentPage + 1)"
                  >
                    下一页
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 关注列表页 -->
        <div v-else-if="activeTab === 'follow'" key="follow" class="profile-content-full">
          <div class="follow-container">
            <div class="follow-header">
              <div class="follow-header-left">
                <h3>我的关注</h3>
                <span class="follow-count">共 {{ followTotal }} 人</span>
              </div>
              <div class="follow-search">
                <input
                  v-model="followSearchKey"
                  type="text"
                  class="follow-search-input"
                  placeholder="搜索关注用户"
                  @keyup.enter="handleFollowSearch"
                />
                <span class="follow-search-icon" @click="handleFollowSearch">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                </span>
              </div>
            </div>
            <div v-if="loadingFollowList" class="loading-state"><div class="loading-spinner"></div></div>
            <TransitionGroup name="follow-card" tag="div" class="follow-grid" v-else-if="followList.length > 0">
              <div v-for="item in followList" :key="item.uid" class="follow-card">
                <div class="follow-card-header">
                  <div class="follow-avatar" @click="goToUserProfile(item.uid)">
                    <img v-if="item.avatar" :src="item.avatar" :alt="item.nikeName" />
                    <span v-else class="avatar-placeholder">{{ item.nikeName?.charAt(0) }}</span>
                    <span v-if="item.isVip" class="vip-icon-badge">
                      <IconVip :size="12" />
                    </span>
                  </div>
                  <template v-if="unfollowedUidSet.has(item.uid)">
                      <button
                        class="follow-btn follow"
                        @click.stop="handleFollow(item)"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <line x1="12" y1="5" x2="12" y2="19"/>
                          <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        关注
                      </button>
                    </template>
                    <template v-else>
                      <button
                        class="follow-btn followed"
                        @mouseenter="hoveredFollowUid = item.uid"
                        @mouseleave="hoveredFollowUid = ''"
                        @click.stop="handleUnfollow(item)"
                      >
                        <template v-if="hoveredFollowUid === item.uid">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                          取消关注
                        </template>
                        <template v-else>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                          已关注
                        </template>
                      </button>
                    </template>
                </div>
                <div class="follow-card-body" @click="goToUserProfile(item.uid)">
                  <div class="follow-name">{{ item.nikeName }}</div>
                  <div class="follow-signature">{{ item.descript || '这个人很懒，什么都没写...' }}</div>
                </div>
              </div>
            </TransitionGroup>
            <div v-else class="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-opacity="0.2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
              </svg>
              <p>暂未关注任何人</p>
              <span class="empty-hint">快去发现感兴趣的人吧</span>
            </div>
            <!-- 分页 -->
            <div v-if="followList.length > 0 && followTotalPages > 1" class="pagination">
              <button
                class="page-btn"
                :disabled="followCurrentPage <= 1"
                @click="loadFollowList(followCurrentPage - 1)"
              >
                上一页
              </button>
              <span class="page-info">{{ followCurrentPage }} / {{ followTotalPages }}</span>
              <button
                class="page-btn"
                :disabled="followCurrentPage >= followTotalPages"
                @click="loadFollowList(followCurrentPage + 1)"
              >
                下一页
              </button>
            </div>
          </div>
        </div>

        <!-- 粉丝列表页 -->
        <div v-else-if="activeTab === 'fans'" key="fans" class="profile-content-full">
          <div class="follow-container">
            <div class="follow-header">
              <div class="follow-header-left">
                <h3>我的粉丝</h3>
                <span class="follow-count">共 {{ fansTotal }} 人</span>
              </div>
              <div class="follow-search">
                <input
                  v-model="fansSearchKey"
                  type="text"
                  class="follow-search-input"
                  placeholder="搜索粉丝用户"
                  @keyup.enter="handleFansSearch"
                />
                <span class="follow-search-icon" @click="handleFansSearch">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                </span>
              </div>
            </div>
            <div v-if="loadingFansList" class="loading-state"><div class="loading-spinner"></div></div>
            <TransitionGroup name="follow-card" tag="div" class="follow-grid" v-else-if="fansList.length > 0">
              <div v-for="item in fansList" :key="item.uid" class="follow-card">
                <div class="follow-card-header">
                  <div class="follow-avatar" @click="goToUserProfile(item.uid)">
                    <img v-if="item.avatar" :src="item.avatar" :alt="item.nikeName" />
                    <span v-else class="avatar-placeholder">{{ item.nikeName?.charAt(0) }}</span>
                    <span v-if="item.isVip" class="vip-icon-badge">
                      <IconVip :size="12" />
                    </span>
                  </div>
                  <template v-if="item.followedBack">
                    <button
                      class="follow-btn followed"
                      @mouseenter="hoveredFollowUid = item.uid"
                      @mouseleave="hoveredFollowUid = ''"
                      @click.stop="handleUnfollow(item)"
                    >
                      <template v-if="hoveredFollowUid === item.uid">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                        取消关注
                      </template>
                      <template v-else>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        互相关注
                      </template>
                    </button>
                  </template>
                  <template v-else>
                    <button
                      class="follow-btn follow"
                      @click.stop="handleFollow(item)"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                      回关
                    </button>
                  </template>
                </div>
                <div class="follow-card-body" @click="goToUserProfile(item.uid)">
                  <div class="follow-name">{{ item.nikeName }}</div>
                  <div class="follow-signature">{{ item.descript || '这个人很懒，什么都没写...' }}</div>
                </div>
              </div>
            </TransitionGroup>
            <div v-else class="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-opacity="0.2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
              </svg>
              <p>暂无粉丝</p>
              <span class="empty-hint">还没有人关注你哦</span>
            </div>
            <!-- 分页 -->
            <div v-if="fansList.length > 0 && fansTotalPages > 1" class="pagination">
              <button
                class="page-btn"
                :disabled="fansCurrentPage <= 1"
                @click="loadFansList(fansCurrentPage - 1)"
              >
                上一页
              </button>
              <span class="page-info">{{ fansCurrentPage }} / {{ fansTotalPages }}</span>
              <button
                class="page-btn"
                :disabled="fansCurrentPage >= fansTotalPages"
                @click="loadFansList(fansCurrentPage + 1)"
              >
                下一页
              </button>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- 编辑个人资料弹框 -->
    <Teleport to="body">
      <Transition name="fav-overlay">
        <div v-if="showEditProfile" class="fav-overlay" @click.self="closeEditProfile">
          <Transition name="fav-dialog" appear>
            <div v-if="showEditProfile" class="fav-dialog profile-dialog">
              <div class="fav-dialog-header">
                <h3><IconUser :size="18" /> 修改个人资料</h3>
                <button class="fav-close-btn" @click="closeEditProfile">
                  <IconClose :size="16" />
                </button>
              </div>
              <div class="fav-dialog-body profile-dialog-body">
                <!-- 头像区域 -->
                <div class="profile-avatar-section">
                  <input type="file" accept="image/*" id="edit-profile-avatar" class="cover-upload-input" @change="handleEditProfileAvatarUpload" />
                  <label for="edit-profile-avatar" class="profile-avatar-upload">
                    <img v-if="editProfileAvatar" :src="editProfileAvatar" class="profile-avatar-preview" />
                    <div v-else class="profile-avatar-placeholder">
                      <IconUser :size="32" />
                    </div>
                    <div class="profile-avatar-mask">
                      <IconUpload :size="20" />
                      <span>更换头像</span>
                    </div>
                  </label>
                  <span v-if="editProfileUploading" class="upload-loading"><span class="loading-dot"></span>上传中...</span>
                </div>

                <!-- 表单区域 -->
                <div class="profile-form-grid">
                  <div class="profile-form-item">
                    <label class="profile-form-label"><IconUser :size="15" /> 昵称</label>
                    <input v-model="editProfileForm.nikeName" class="profile-form-input" placeholder="请输入昵称" maxlength="20" />
                    <span class="profile-form-count">{{ (editProfileForm.nikeName || '').length }}/20</span>
                  </div>
                  <div class="profile-form-item">
                    <label class="profile-form-label"><IconClock :size="15" /> 出生年月</label>
                    <div class="profile-date-wrapper">
                      <el-date-picker
                        v-model="editProfileForm.birthday"
                        type="date"
                        placeholder="请选择日期"
                        format="YYYY-MM-DD"
                        value-format="YYYY-MM-DD"
                        class="profile-date-picker"
                        popper-class="profile-date-popper"
                        teleported
                      />
                    </div>
                  </div>
                </div>

                <div class="profile-form-item">
                  <label class="profile-form-label"><IconSmile :size="15" /> 性别</label>
                  <div class="profile-radio-group">
                    <label class="profile-radio" :class="{ active: editProfileForm.sex === 0 }">
                      <input type="radio" :value="0" v-model="editProfileForm.sex" />
                      <span class="radio-dot"></span>
                      <IconSecret :size="16" class="gender-icon gender-secret" />
                      保密
                    </label>
                    <label class="profile-radio" :class="{ active: editProfileForm.sex === 1 }">
                      <input type="radio" :value="1" v-model="editProfileForm.sex" />
                      <span class="radio-dot"></span>
                      <svg class="gender-icon gender-male" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="10" cy="14" r="7"/><line x1="15" y1="9" x2="21" y2="3"/><polyline points="15 3 21 3 21 9"/></svg>
                      男
                    </label>
                    <label class="profile-radio" :class="{ active: editProfileForm.sex === 2 }">
                      <input type="radio" :value="2" v-model="editProfileForm.sex" />
                      <span class="radio-dot"></span>
                      <svg class="gender-icon gender-female" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="9" r="7"/><line x1="12" y1="16" x2="12" y2="22"/><line x1="9" y1="19" x2="15" y2="19"/></svg>
                      女
                    </label>
                  </div>
                </div>

                <div class="profile-form-item">
                  <label class="profile-form-label"><IconFlag :size="15" /> 个性签名</label>
                  <textarea v-model="editProfileForm.descript" class="profile-form-textarea" placeholder="写点什么介绍下自己..." maxlength="100" rows="3"></textarea>
                  <span class="profile-form-count">{{ (editProfileForm.descript || '').length }}/100</span>
                </div>
              </div>
              <div class="fav-dialog-footer">
                <button class="fav-btn fav-btn-cancel" @click="closeEditProfile">取消</button>
                <button class="fav-btn fav-btn-confirm" :disabled="editProfileSaving" @click="saveEditProfile">
                  <IconCheck :size="14" v-if="!editProfileSaving" />
                  {{ editProfileSaving ? '保存中...' : '保存' }}
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

    <!-- 编辑收藏夹弹框 -->
    <Teleport to="body">
      <Transition name="fav-overlay">
        <div v-if="showEditDialog" class="fav-overlay" @click.self="closeEditDialog">
          <Transition name="fav-dialog" appear>
            <div v-if="showEditDialog" class="fav-dialog">
              <div class="fav-dialog-header">
                <h3>编辑收藏夹</h3>
                <button class="fav-close-btn" @click="closeEditDialog">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              <div class="fav-dialog-body">
                <div class="edit-form-item">
                  <label class="edit-form-label">收藏夹名称</label>
                  <input
                    v-model="editFolderName"
                    class="edit-form-input"
                    placeholder="请输入收藏夹名称（最多20字）"
                    maxlength="20"
                  />
                </div>
                <div class="edit-form-item">
                  <label class="edit-form-label">收藏夹描述</label>
                  <textarea
                    v-model="editFolderDescription"
                    class="edit-form-textarea"
                    placeholder="请输入收藏夹描述（可选，最多100字）"
                    maxlength="100"
                    rows="3"
                  ></textarea>
                </div>
                <div class="edit-form-item">
                  <label class="edit-form-label">收藏夹封面</label>
                  <div class="cover-upload-area">
                    <input
                      type="file"
                      :id="'edit-cover-upload'"
                      accept="image/*"
                      class="cover-upload-input"
                      @change="handleEditCoverUpload"
                    />
                    <label :for="'edit-cover-upload'" class="cover-upload-btn">
                      <img v-if="editFolderCoverUrl" :src="editFolderCoverUrl" class="cover-preview" />
                      <template v-else>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                        <span>点击上传封面</span>
                      </template>
                    </label>
                    <div v-if="editFolderCoverUploading" class="cover-upload-loading">
                      <div class="cover-upload-progress">
                        <div class="progress-bar">
                          <div class="progress-fill" :style="{ width: editFolderCoverProgress + '%' }"></div>
                        </div>
                        <span class="progress-text">{{ editFolderCoverProgress }}%</span>
                      </div>
                    </div>
                    <button v-if="editFolderCoverUrl" type="button" class="cover-remove-btn" @click="removeEditCover">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <div class="edit-form-item">
                  <label class="edit-form-label">可见性</label>
                  <div class="edit-form-radio-group">
                    <label class="edit-form-radio" :class="{ active: !editFolderPrivate }">
                      <input type="radio" :value="false" v-model="editFolderPrivate" />
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                      公开
                    </label>
                    <label class="edit-form-radio" :class="{ active: editFolderPrivate }">
                      <input type="radio" :value="true" v-model="editFolderPrivate" />
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                      私密
                    </label>
                  </div>
                </div>
              </div>
              <div class="fav-dialog-footer">
                <button class="fav-btn fav-btn-cancel" @click="closeEditDialog">取消</button>
                <button
                  class="fav-btn fav-btn-confirm"
                  :disabled="!editFolderName.trim() || editingFolder"
                  @click="handleEditFolder"
                >{{ editingFolder ? '保存中...' : '保存' }}</button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

    <!-- 删除确认弹框 -->
    <Teleport to="body">
      <Transition name="fav-overlay">
        <div v-if="showDeleteConfirm" class="fav-overlay" @click.self="closeDeleteConfirm">
          <Transition name="fav-dialog" appear>
            <div v-if="showDeleteConfirm" class="fav-dialog fav-dialog-small">
              <div class="fav-dialog-header">
                <h3>删除收藏夹</h3>
                <button class="fav-close-btn" @click="closeDeleteConfirm">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              <div class="fav-dialog-body">
                <div class="delete-confirm-content">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f56c6c" stroke-width="1.5">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <p class="delete-confirm-text">确定要删除收藏夹「{{ deletingFolder?.name }}」吗？</p>
                  <p class="delete-confirm-hint">删除后收藏夹内的视频将被移除，此操作不可恢复</p>
                </div>
              </div>
              <div class="fav-dialog-footer">
                <button class="fav-btn fav-btn-cancel" @click="closeDeleteConfirm">取消</button>
                <button
                  class="fav-btn fav-btn-danger"
                  :disabled="deletingFolderLoading"
                  @click="handleDeleteFolder"
                >{{ deletingFolderLoading ? '删除中...' : '确认删除' }}</button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

    <!-- 创建收藏夹弹框 -->
    <Teleport to="body">
      <Transition name="fav-overlay">
        <div v-if="showCreateDialog" class="fav-overlay" @click.self="closeCreateDialog">
          <Transition name="fav-dialog" appear>
            <div v-if="showCreateDialog" class="fav-dialog">
              <div class="fav-dialog-header">
                <h3>新建收藏夹</h3>
                <button class="fav-close-btn" @click="closeCreateDialog">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              <div class="fav-dialog-body">
                <div class="edit-form-item">
                  <label class="edit-form-label">收藏夹名称</label>
                  <input
                    v-model="newFolderName"
                    class="edit-form-input"
                    placeholder="请输入收藏夹名称（最多20字）"
                    maxlength="20"
                    @keydown.enter="handleCreateFolder"
                  />
                </div>
                <div class="edit-form-item">
                  <label class="edit-form-label">收藏夹描述</label>
                  <textarea
                    v-model="newFolderDescription"
                    class="edit-form-textarea"
                    placeholder="请输入收藏夹描述（可选，最多100字）"
                    maxlength="100"
                    rows="3"
                  ></textarea>
                </div>
                <div class="edit-form-item">
                  <label class="edit-form-label">收藏夹封面</label>
                  <div class="cover-upload-area">
                    <input
                      type="file"
                      :id="'create-cover-upload'"
                      accept="image/*"
                      class="cover-upload-input"
                      @change="handleCreateCoverUpload"
                    />
                    <label :for="'create-cover-upload'" class="cover-upload-btn">
                      <img v-if="newFolderCoverUrl" :src="newFolderCoverUrl" class="cover-preview" />
                      <template v-else>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                        <span>点击上传封面</span>
                      </template>
                    </label>
                    <div v-if="newFolderCoverUploading" class="cover-upload-loading">
                      <div class="cover-upload-progress">
                        <div class="progress-bar">
                          <div class="progress-fill" :style="{ width: newFolderCoverProgress + '%' }"></div>
                        </div>
                        <span class="progress-text">{{ newFolderCoverProgress }}%</span>
                      </div>
                    </div>
                    <button v-if="newFolderCoverUrl" type="button" class="cover-remove-btn" @click="removeCreateCover">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <div class="edit-form-item">
                  <label class="edit-form-label">可见性</label>
                  <div class="edit-form-radio-group">
                    <label class="edit-form-radio" :class="{ active: !newFolderPrivate }">
                      <input type="radio" :value="false" v-model="newFolderPrivate" />
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                      公开
                    </label>
                    <label class="edit-form-radio" :class="{ active: newFolderPrivate }">
                      <input type="radio" :value="true" v-model="newFolderPrivate" />
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                      私密
                    </label>
                  </div>
                </div>
              </div>
              <div class="fav-dialog-footer">
                <button class="fav-btn fav-btn-cancel" @click="closeCreateDialog">取消</button>
                <button
                  class="fav-btn fav-btn-confirm"
                  :disabled="!newFolderName.trim() || creatingFolder"
                  @click="handleCreateFolder"
                >{{ creatingFolder ? '创建中...' : '创建' }}</button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

    <!-- 收藏夹下拉菜单 -->
    <Teleport to="body">
      <div
        v-if="openMenuFolderUid && menuPosition"
        class="folder-dropdown-menu-fixed"
        :style="{ top: menuPosition.top + 'px', left: menuPosition.left + 'px' }"
        @click.stop
      >
        <div class="dropdown-menu-item" @click.stop="handleEditFromMenu">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          编辑信息
        </div>
        <div v-if="!menuFolder?.isDefault" class="dropdown-menu-item danger" @click.stop="handleDeleteFromMenu">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          删除
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../stores/auth'
import { getClientUserInfo } from '../api/auth'
import { getFavoriteFolderList, getFavoriteFolderDetail, getUserCoinVideos, getUserLikeVideos, getRecentLikeEpisodes, getRecentCoinEpisodes, getMyContributions, getFollowList, searchFollow, searchFans, searchFavorite, updateFavoriteFolder, deleteFavoriteFolder, createFavoriteFolder, unfollowUser, followUser, updateUserProfile } from '../api/video'
import { uploadFile } from '../utils/fileUpload'
import { IconFavorite, IconCoin, IconLike, IconVip, IconSecret } from '../icons'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const user = ref(null)
const activeTab = ref('home')

const submitVideos = ref([])
const monthlyVideos = ref([])
const favoriteVideos = ref([])
const favoriteFolders = ref([])
const selectedFolder = ref(null)
const favoriteCurrentPage = ref(1)
const favoriteTotal = ref(0)
const FAVORITES_PER_PAGE = 20
const favoriteSearchKey = ref('')
const favoriteSearchScope = ref('current')
const coinVideos = ref([])
const likeVideos = ref([])

const loadingSubmit = ref(false)
const loadingFavoriteFolders = ref(false)
const loadingFavoriteVideos = ref(false)
const loadingCoinVideos = ref(false)
const loadingLikeVideos = ref(false)
const loadingFollowList = ref(false)
const followList = ref([])
const followCurrentPage = ref(1)
const followTotal = ref(0)
const FOLLOWS_PER_PAGE = 20

const loadingFansList = ref(false)
const fansList = ref([])
const fansCurrentPage = ref(1)
const fansTotal = ref(0)
const fansSearchKey = ref('')

// 收藏夹菜单和弹框相关
const hoveredFolderUid = ref('')
const hoveredFollowUid = ref('')
const unfollowedUidSet = ref(new Set())
const followSearchKey = ref('')
const openMenuFolderUid = ref('')
const showCreateDialog = ref(false)
const creatingFolder = ref(false)
const newFolderName = ref('')
const newFolderDescription = ref('')
const newFolderCoverUrl = ref('')
const newFolderCoverUploading = ref(false)
const newFolderCoverProgress = ref(0)
const newFolderPrivate = ref(false)
const showEditDialog = ref(false)
const editingFolder = ref(false)
const editFolderUid = ref('')
const editFolderName = ref('')
const editFolderDescription = ref('')
const editFolderCoverUrl = ref('')
const editFolderCoverUploading = ref(false)
const editFolderCoverProgress = ref(0)
const editFolderPrivate = ref(false)
const showDeleteConfirm = ref(false)
const deletingFolder = ref(null)
const deletingFolderLoading = ref(false)
const menuPosition = ref(null)
const menuFolder = ref(null)

const showEditProfile = ref(false)
const editProfileForm = ref({ nikeName: '', descript: '', sex: 0, birthday: '' })
const editProfileAvatar = ref('')
const editProfileUploading = ref(false)
const editProfileSaving = ref(false)

const followTotalPages = computed(() => Math.ceil(followTotal.value / FOLLOWS_PER_PAGE))
const fansTotalPages = computed(() => Math.ceil(fansTotal.value / FOLLOWS_PER_PAGE))

// 时间线分页相关
const noMoreData = ref(false)
const currentDateRange = ref({ startDate: null, endDate: null })
const MONTHS_PER_PAGE = 5

const isOwnProfile = computed(() => {
  return !route.params.uid || route.params.uid === authStore.user?.uid
})

const tabs = [
  { key: 'home', label: '首页', icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>' },
  { key: 'submit', label: '投稿', icon: '<rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/>' },
  { key: 'favorites', label: '收藏', icon: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>' }
]

const loadUserInfo = async () => {
  try {
    const res = await getClientUserInfo()
    user.value = res
    authStore.user = res
    localStorage.setItem('frontUser', JSON.stringify(res))
  } catch (e) {
    console.error('获取用户信息失败:', e)
    user.value = authStore.user
  }
}

const openEditProfile = () => {
  if (!isOwnProfile.value) return
  const rawGender = user.value?.gender ?? user.value?.sex
  editProfileForm.value = {
    nikeName: user.value?.nikeName || '',
    descript: user.value?.signature || user.value?.descript || '',
    sex: rawGender === true ? 1 : rawGender === false ? 2 : 0,
    birthday: user.value?.birthday || ''
  }
  editProfileAvatar.value = user.value?.avatar || ''
  showEditProfile.value = true
}

const closeEditProfile = () => {
  showEditProfile.value = false
}

const handleEditProfileAvatarUpload = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  editProfileUploading.value = true
  try {
    const url = await uploadFile(file, (p) => {})
    editProfileAvatar.value = url
  } catch (err) {
    ElMessage.error('头像上传失败')
  } finally {
    editProfileUploading.value = false
  }
}

const saveEditProfile = async () => {
  if (!editProfileForm.value.nikeName.trim()) {
    ElMessage.warning('昵称不能为空')
    return
  }
  editProfileSaving.value = true
  try {
    await updateUserProfile({
      avatar: editProfileAvatar.value,
      nikeName: editProfileForm.value.nikeName,
      signature: editProfileForm.value.descript,
      gender: editProfileForm.value.sex === 1 ? true : editProfileForm.value.sex === 2 ? false : null,
      birthday: editProfileForm.value.birthday
    })
    ElMessage.success('修改成功')
    await loadUserInfo()
    closeEditProfile()
  } catch (e) {
    console.error('修改资料失败:', e)
    ElMessage.error('修改失败')
  } finally {
    editProfileSaving.value = false
  }
}

// 计算日期范围：从endDate往前推MONTHS_PER_PAGE个月
const calculateDateRange = (endDate) => {
  const end = new Date(endDate)
  const start = new Date(end)
  start.setMonth(start.getMonth() - MONTHS_PER_PAGE + 1)
  start.setDate(1)
  
  const format = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  
  return {
    startDate: format(start),
    endDate: format(end)
  }
}

// 获取上一批数据的结束日期（当前开始日期的前一天）
const getPrevEndDate = () => {
  if (!currentDateRange.value.startDate) return null
  const prevEnd = new Date(currentDateRange.value.startDate)
  prevEnd.setDate(prevEnd.getDate() - 1)
  return `${prevEnd.getFullYear()}-${String(prevEnd.getMonth() + 1).padStart(2, '0')}-${String(prevEnd.getDate()).padStart(2, '0')}`
}

// 初始加载投稿视频
const loadSubmitVideos = async () => {
  loadingSubmit.value = true
  noMoreData.value = false
  monthlyVideos.value = []
  
  try {
    const now = new Date()
    const endDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    const range = calculateDateRange(endDate)
    currentDateRange.value = range
    
    const res = await getMyContributions(range)
    monthlyVideos.value = res || []
    
    if (!res || res.length === 0) {
      noMoreData.value = true
    }
  } catch (e) {
    console.error('获取投稿视频失败:', e)
  } finally {
    loadingSubmit.value = false
  }
}

// 加载更多（往前追加数据）
const loadMoreSubmitVideos = async () => {
  if (loadingSubmit.value || noMoreData.value) return
  
  const prevEndDate = getPrevEndDate()
  if (!prevEndDate) {
    noMoreData.value = true
    return
  }
  
  loadingSubmit.value = true
  
  try {
    const range = calculateDateRange(prevEndDate)
    currentDateRange.value = range
    
    const res = await getMyContributions(range)
    const newData = res || []
    
    if (newData.length === 0) {
      noMoreData.value = true
    } else {
      // 追加数据到现有列表
      monthlyVideos.value = [...monthlyVideos.value, ...newData]
    }
  } catch (e) {
    console.error('加载更多投稿视频失败:', e)
  } finally {
    loadingSubmit.value = false
  }
}

// 滚动加载处理
const handleScroll = () => {
  if (activeTab.value !== 'submit') return
  
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
  const scrollHeight = document.documentElement.scrollHeight
  const clientHeight = document.documentElement.clientHeight
  
  // 距离底部200px时触发加载
  if (scrollTop + clientHeight >= scrollHeight - 200) {
    loadMoreSubmitVideos()
  }
}

const favoriteTotalPages = computed(() => Math.ceil(favoriteTotal.value / FAVORITES_PER_PAGE))

const loadFavoriteFolders = async () => {
  loadingFavoriteFolders.value = true
  try {
    const res = await getFavoriteFolderList()
    favoriteFolders.value = res || []
  } catch (e) {
    console.error('获取收藏夹列表失败:', e)
  } finally {
    loadingFavoriteFolders.value = false
  }
}

const selectFolder = async (folder) => {
  selectedFolder.value = folder
  favoriteCurrentPage.value = 1
  favoriteSearchKey.value = ''
  await loadFavoriteVideos(1)
}

const loadFavoriteVideos = async (page = 1) => {
  if (!selectedFolder.value) return
  
  loadingFavoriteVideos.value = true
  try {
    const res = await getFavoriteFolderDetail({
      folderUid: selectedFolder.value.folderUid,
      page,
      size: FAVORITES_PER_PAGE
    })
    favoriteVideos.value = res?.list?.records || res?.records || []
    favoriteTotal.value = res?.list?.total || res?.total || 0
    favoriteCurrentPage.value = page
  } catch (e) {
    console.error('获取收藏视频失败:', e)
  } finally {
    loadingFavoriteVideos.value = false
  }
}

const searchFavoriteVideos = async (page = 1) => {
  loadingFavoriteVideos.value = true
  try {
    const params = {
      title: favoriteSearchKey.value || undefined,
      page,
      size: FAVORITES_PER_PAGE
    }
    if (favoriteSearchScope.value === 'current' && selectedFolder.value) {
      params.folderUid = selectedFolder.value.folderUid
    }
    const res = await searchFavorite(params)
    const data = res?.data || res
    favoriteVideos.value = data?.records || []
    favoriteTotal.value = data?.total || 0
    favoriteCurrentPage.value = page
  } catch (e) {
    console.error('搜索收藏视频失败:', e)
  } finally {
    loadingFavoriteVideos.value = false
  }
}

const handleFavoriteSearch = () => {
  searchFavoriteVideos(1)
}

const clearFavoriteSearch = () => {
  favoriteSearchKey.value = ''
  if (selectedFolder.value) {
    loadFavoriteVideos(1)
  }
}

const handleCreateCoverUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请选择图片文件')
    return
  }
  newFolderCoverUploading.value = true
  newFolderCoverProgress.value = 0
  try {
    const res = await uploadFile(file, (progress) => {
      newFolderCoverProgress.value = progress
    })
    newFolderCoverUrl.value = res.url || res
  } catch (e) {
    console.error('上传封面失败:', e)
    ElMessage.error('上传封面失败')
  } finally {
    newFolderCoverUploading.value = false
    newFolderCoverProgress.value = 0
    event.target.value = ''
  }
}

const removeCreateCover = () => {
  newFolderCoverUrl.value = ''
}

const handleEditCoverUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请选择图片文件')
    return
  }
  editFolderCoverUploading.value = true
  editFolderCoverProgress.value = 0
  try {
    const res = await uploadFile(file, (progress) => {
      editFolderCoverProgress.value = progress
    })
    editFolderCoverUrl.value = res.url || res
  } catch (e) {
    console.error('上传封面失败:', e)
    ElMessage.error('上传封面失败')
  } finally {
    editFolderCoverUploading.value = false
    editFolderCoverProgress.value = 0
    event.target.value = ''
  }
}

const removeEditCover = () => {
  editFolderCoverUrl.value = ''
}

const openCreateDialog = () => {
  newFolderName.value = ''
  newFolderDescription.value = ''
  newFolderCoverUrl.value = ''
  newFolderPrivate.value = false
  showCreateDialog.value = true
}

const closeCreateDialog = () => {
  showCreateDialog.value = false
  newFolderName.value = ''
  newFolderDescription.value = ''
  newFolderCoverUrl.value = ''
  newFolderPrivate.value = false
}

const handleCreateFolder = async () => {
  const name = newFolderName.value.trim()
  if (!name || creatingFolder.value) return
  creatingFolder.value = true
  try {
    const data = {
      name,
      isPrivate: newFolderPrivate.value
    }
    if (newFolderDescription.value.trim()) {
      data.description = newFolderDescription.value.trim()
    }
    if (newFolderCoverUrl.value.trim()) {
      data.coverUrl = newFolderCoverUrl.value.trim()
    }
    const res = await createFavoriteFolder(data)
    ElMessage.success('收藏夹创建成功')
    closeCreateDialog()
    await loadFavoriteFolders()
    if (res && res.folderUid) {
      const folder = favoriteFolders.value.find(f => f.folderUid === res.folderUid)
      if (folder) {
        selectFolder(folder)
      }
    }
  } catch (e) {
    console.error('创建收藏夹失败:', e)
    ElMessage.error(e?.message || '创建收藏夹失败')
  } finally {
    creatingFolder.value = false
  }
}

const toggleFolderMenu = (folderUid, event) => {
  if (openMenuFolderUid.value === folderUid) {
    openMenuFolderUid.value = ''
    menuPosition.value = null
    menuFolder.value = null
  } else {
    const btn = event.currentTarget
    const rect = btn.getBoundingClientRect()
    menuPosition.value = {
      top: rect.bottom + 4,
      left: rect.right - 140
    }
    menuFolder.value = favoriteFolders.value.find(f => f.folderUid === folderUid)
    openMenuFolderUid.value = folderUid
  }
}

const handleEditFromMenu = () => {
  if (menuFolder.value) {
    openEditDialog(menuFolder.value)
  }
}

const handleDeleteFromMenu = () => {
  if (menuFolder.value) {
    openDeleteConfirm(menuFolder.value)
  }
}

const openEditDialog = (folder) => {
  editFolderUid.value = folder.folderUid
  editFolderName.value = folder.name
  editFolderDescription.value = folder.description || ''
  editFolderCoverUrl.value = folder.coverUrl || ''
  editFolderPrivate.value = folder.isPrivate || false
  showEditDialog.value = true
  openMenuFolderUid.value = ''
}

const closeEditDialog = () => {
  showEditDialog.value = false
  editFolderUid.value = ''
  editFolderName.value = ''
  editFolderDescription.value = ''
  editFolderCoverUrl.value = ''
  editFolderPrivate.value = false
}

const handleEditFolder = async () => {
  if (!editFolderName.value.trim() || editingFolder.value) return
  editingFolder.value = true
  try {
    const data = {
      folderUid: editFolderUid.value,
      name: editFolderName.value.trim(),
      isPrivate: editFolderPrivate.value
    }
    if (editFolderDescription.value.trim()) {
      data.description = editFolderDescription.value.trim()
    }
    if (editFolderCoverUrl.value.trim()) {
      data.coverUrl = editFolderCoverUrl.value.trim()
    }
    await updateFavoriteFolder(data)
    ElMessage.success('收藏夹更新成功')
    closeEditDialog()
    await loadFavoriteFolders()
  } catch (e) {
    console.error('更新收藏夹失败:', e)
    ElMessage.error(e?.message || '更新收藏夹失败')
  } finally {
    editingFolder.value = false
  }
}

const openDeleteConfirm = (folder) => {
  deletingFolder.value = folder
  showDeleteConfirm.value = true
  openMenuFolderUid.value = ''
}

const closeDeleteConfirm = () => {
  showDeleteConfirm.value = false
  deletingFolder.value = null
}

const handleDeleteFolder = async () => {
  if (!deletingFolder.value || deletingFolderLoading.value) return
  deletingFolderLoading.value = true
  try {
    await deleteFavoriteFolder({ folderUid: deletingFolder.value.folderUid })
    ElMessage.success('收藏夹已删除')
    closeDeleteConfirm()
    await loadFavoriteFolders()
    if (selectedFolder.value?.folderUid === deletingFolder.value?.folderUid) {
      selectedFolder.value = null
      favoriteVideos.value = []
    }
  } catch (e) {
    console.error('删除收藏夹失败:', e)
    ElMessage.error(e?.message || '删除收藏夹失败')
  } finally {
    deletingFolderLoading.value = false
  }
}

const switchTab = (tab) => {
  activeTab.value = tab
  if (tab === 'home') {
    loadFavoriteFolders()
    loadCoinVideos()
    loadLikeVideos()
  } else if (tab === 'submit') {
    // 重置日期范围并加载
    currentDateRange.value = { startDate: null, endDate: null }
    loadSubmitVideos()
  } else if (tab === 'favorites') {
    selectedFolder.value = null
    favoriteVideos.value = []
    favoriteSearchKey.value = ''
    loadFavoriteFolders().then(() => {
      if (favoriteFolders.value.length > 0) {
        const folderUid = route.query.folder
        const folder = folderUid ? favoriteFolders.value.find(f => f.folderUid === folderUid) : null
        selectFolder(folder || favoriteFolders.value[0])
      }
    })
  } else if (tab === 'follow') {
    loadFollowList()
  } else if (tab === 'fans') {
    loadFansList()
  }
}

const goToFolder = (folder) => {
  router.push({ path: '/profile', query: { tab: 'favorites', folder: folder.folderUid } })
}

const goToFollowList = () => {
  router.push({ path: '/profile', query: { tab: 'follow' } })
}

const goToFansList = () => {
  router.push({ path: '/profile', query: { tab: 'fans' } })
}

const goToUserProfile = (uid) => {
  router.push({ path: `/profile/${uid}` })
}

const handleUnfollow = async (user) => {
  try {
    await unfollowUser(user.uid)
    ElMessage.success('已取消关注')
    // 将用户添加到已取消关注集合中
    unfollowedUidSet.value.add(user.uid)
    // 如果是粉丝列表，更新 followedBack 状态
    const fanItem = fansList.value.find(item => item.uid === user.uid)
    if (fanItem) {
      fanItem.followedBack = false
    }
  } catch (e) {
    console.error('取消关注失败:', e)
    ElMessage.error('取消关注失败')
  }
}

const handleFollow = async (user) => {
  try {
    await followUser(user.uid)
    ElMessage.success('关注成功')
    // 从已取消关注集合中移除
    unfollowedUidSet.value.delete(user.uid)
    // 如果是粉丝列表，更新 followedBack 状态
    const fanItem = fansList.value.find(item => item.uid === user.uid)
    if (fanItem) {
      fanItem.followedBack = true
    }
  } catch (e) {
    console.error('关注失败:', e)
    ElMessage.error('关注失败')
  }
}

const loadFollowList = async (page = 1) => {
  loadingFollowList.value = true
  try {
    const params = { page, size: FOLLOWS_PER_PAGE }
    if (followSearchKey.value.trim()) {
      params.keyword = followSearchKey.value.trim()
    }
    const res = await searchFollow(params)
    followList.value = res?.records || []
    followTotal.value = res?.total || 0
    followCurrentPage.value = page
  } catch (e) {
    console.error('获取关注列表失败:', e)
  } finally {
    loadingFollowList.value = false
  }
}

const handleFollowSearch = () => {
  loadFollowList(1)
}

const loadFansList = async (page = 1) => {
  loadingFansList.value = true
  try {
    const params = { page, size: FOLLOWS_PER_PAGE }
    if (fansSearchKey.value.trim()) {
      params.keyword = fansSearchKey.value.trim()
    }
    const res = await searchFans(params)
    fansList.value = res?.records || []
    fansTotal.value = res?.total || 0
    fansCurrentPage.value = page
  } catch (e) {
    console.error('获取粉丝列表失败:', e)
  } finally {
    loadingFansList.value = false
  }
}

const handleFansSearch = () => {
  loadFansList(1)
}

const loadCoinVideos = async () => {
  loadingCoinVideos.value = true
  try {
    const res = await getRecentCoinEpisodes({ page: 1, size: 20 })
    coinVideos.value = res || []
  } catch (e) {
    console.error('获取投币视频失败:', e)
  } finally {
    loadingCoinVideos.value = false
  }
}

const loadLikeVideos = async () => {
  loadingLikeVideos.value = true
  try {
    const res = await getRecentLikeEpisodes({ page: 1, size: 20 })
    likeVideos.value = res || []
  } catch (e) {
    console.error('获取点赞视频失败:', e)
  } finally {
    loadingLikeVideos.value = false
  }
}

const handleVideoClick = (video) => {
  if (video.playLink) {
    router.push(video.playLink)
  }
}

const getStatusText = (status) => {
  const statusMap = {
    0: '草稿',
    1: '待发布',
    2: '已发布',
    3: '已下架'
  }
  return statusMap[status] || '未知'
}

const formatDuration = (seconds) => {
  if (!seconds) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const formatCount = (count) => {
  if (!count) return '0'
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + '万'
  }
  return count.toString()
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours === 0) {
      const mins = Math.floor(diff / (1000 * 60))
      return mins <= 0 ? '刚刚' : `${mins}分钟前`
    }
    return `${hours}小时前`
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }
}

const handleClickOutside = (e) => {
  if (!e.target.closest('.folder-more-btn')) {
    openMenuFolderUid.value = ''
  }
}

onMounted(() => {
  if (route.query.tab) {
    activeTab.value = route.query.tab
  }
  loadUserInfo()
  switchTab(activeTab.value)
  
  // 添加滚动监听
  window.addEventListener('scroll', handleScroll)
  // 添加点击外部关闭菜单
  document.addEventListener('click', handleClickOutside)
  // 监听编辑个人资料事件
  window.addEventListener('open-edit-profile', openEditProfile)
})

// 监听路由变化
watch(() => route.query.tab, (newTab) => {
  if (newTab && newTab !== activeTab.value) {
    activeTab.value = newTab
    switchTab(newTab)
  }
})

onUnmounted(() => {
  // 移除滚动监听
  window.removeEventListener('scroll', handleScroll)
  // 移除点击外部关闭菜单
  document.removeEventListener('click', handleClickOutside)
  // 移除编辑个人资料事件监听
  window.removeEventListener('open-edit-profile', openEditProfile)
})
</script>

<style scoped>
.profile-page {
  padding-top: 0;
  min-height: 100vh;
  background: var(--bg1);
}

.profile-container {
  margin: 0;
  padding: 0 75px;
}

/* 编辑个人资料弹框 */
.profile-dialog {
  width: 460px;
}

.profile-dialog-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.profile-avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--line_light);
}

.profile-avatar-upload {
  position: relative;
  width: 88px;
  height: 88px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  display: block;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.profile-avatar-upload:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
}

.profile-avatar-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--brand_blue), #00d4ff);
  color: #fff;
}

.profile-avatar-mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: #fff;
  opacity: 0;
  transition: opacity 0.2s;
}

.profile-avatar-mask span {
  font-size: 11px;
}

.profile-avatar-upload:hover .profile-avatar-mask {
  opacity: 1;
}

.profile-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.profile-form-item {
  display: flex;
  flex-direction: column;
  gap: 0;
  position: relative;
}

.profile-form-item:has(.profile-date-input) {
  position: relative;
}

.profile-form-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text2);
  margin-bottom: 8px;
}

.profile-form-label :deep(svg) {
  color: var(--brand_blue);
  flex-shrink: 0;
}

.profile-form-input {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 1px solid var(--line_regular);
  border-radius: 8px;
  font-size: 14px;
  font-family: var(--font-family);
  color: var(--text1);
  background: transparent;
  outline: none;
  transition: all 0.2s;
  box-sizing: border-box;
}

.profile-form-input::placeholder {
  color: var(--text4);
}

.profile-form-input:focus {
  border-color: var(--brand_blue);
  background: var(--bg1);
  box-shadow: 0 0 0 3px rgba(0, 174, 236, 0.08);
}

.profile-form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--line_regular);
  border-radius: 8px;
  font-size: 14px;
  font-family: var(--font-family);
  color: var(--text1);
  background: transparent;
  outline: none;
  transition: all 0.2s;
  box-sizing: border-box;
  resize: none;
  min-height: 80px;
  line-height: 1.5;
}

.profile-form-textarea::placeholder {
  color: var(--text4);
}

.profile-form-textarea:focus {
  border-color: var(--brand_blue);
  background: var(--bg1);
  box-shadow: 0 0 0 3px rgba(0, 174, 236, 0.08);
}

.profile-form-count {
  position: absolute;
  right: 10px;
  bottom: -18px;
  font-size: 11px;
  color: var(--text4);
}

.profile-radio-group {
  display: flex;
  gap: 10px;
}

.profile-radio {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 40px;
  border: 1px solid var(--line_regular);
  border-radius: 8px;
  font-size: 14px;
  color: var(--text2);
  cursor: pointer;
  transition: all 0.2s;
  background: transparent;
}

.profile-radio:hover {
  border-color: var(--brand_blue);
  color: var(--brand_blue);
}

.profile-radio.active {
  border-color: var(--brand_blue);
  background: rgba(0, 174, 236, 0.06);
  color: var(--brand_blue);
  font-weight: 500;
}

.profile-radio input {
  display: none;
}

.radio-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid var(--line_regular);
  transition: all 0.2s;
  position: relative;
}

.profile-radio.active .radio-dot {
  border-color: var(--brand_blue);
}

.profile-radio.active .radio-dot::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--brand_blue);
}

.profile-radio svg {
  flex-shrink: 0;
}

.profile-radio:not(.active) svg {
  opacity: 0.4;
}

.profile-radio.active svg {
  opacity: 1;
}

.profile-radio.active .gender-male {
  color: var(--brand_blue);
}

.profile-radio.active .gender-female {
  color: var(--brand_pink);
}

.profile-radio.active .gender-secret {
  color: var(--text3);
}

.profile-date-picker {
  width: 100% !important;
}

.profile-date-wrapper {
  height: 40px;
}

.profile-date-wrapper .el-date-editor {
  width: 100%;
  height: 100%;
  line-height: 40px;
}

.profile-date-wrapper .el-date-editor .el-input__wrapper {
  width: 100%;
  height: 100%;
}

:deep(.profile-date-picker) {
  height: 100%;
  width: 100%;
}

:deep(.profile-date-picker .el-input),
:deep(.profile-date-picker .el-input__wrapper),
:deep(.profile-date-picker .el-input__inner) {
  height: 100% !important;
}

:deep(.profile-date-picker .el-input__prefix),
:deep(.profile-date-picker .el-input__suffix) {
  display: flex;
  align-items: center;
}

:deep(.profile-date-picker .el-input__wrapper) {
  padding-top: 0;
  padding-bottom: 0;
  border-radius: 8px !important;
}

:deep(.profile-date-picker .el-input__inner) {
  padding-top: 0;
  padding-bottom: 0;
}

.profile-date-picker .el-input__wrapper {
  height: 40px !important;
  border-radius: 12px !important;
  background: transparent !important;
  border: 5px solid var(--line_regular) !important;
  box-shadow: none !important;
  padding: 0 12px !important;
  transition: all 0.2s !important;
}

.profile-date-picker .el-input__wrapper:hover {
  border-color: var(--brand_blue) !important;
}

.profile-date-picker .el-input__wrapper.is-focus {
  border-color: var(--brand_blue) !important;
  box-shadow: 0 0 0 3px rgba(0, 174, 236, 0.08) !important;
}

.profile-date-picker .el-input__inner {
  font-size: 14px !important;
  font-family: var(--font-family) !important;
  color: var(--text1) !important;
  line-height: 40px !important;
}

.profile-date-picker .el-input__inner::placeholder {
  color: var(--text4) !important;
}

.profile-date-picker .el-input__icon {
  color: var(--text3) !important;
  font-size: 16px !important;
}

.profile-date-picker .el-input__prefix,
.profile-date-picker .el-input__suffix {
  display: flex !important;
  align-items: center !important;
}

.profile-date-popper {
  z-index: 4000 !important;
}

.profile-date-popper .el-picker-panel {
  border-radius: 12px !important;
  overflow: hidden;
}

.upload-loading {
  font-size: 12px;
  color: var(--text4);
  display: flex;
  align-items: center;
  gap: 6px;
}

.loading-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 2px solid var(--line_regular);
  border-top-color: var(--brand_blue);
  animation: spin 0.7s linear infinite;
}

/* 标签页导航 */
.profile-tabs {
  display: flex;
  gap: 0;
  padding: 0;
  margin-top: 0;
  border-bottom: 1px solid var(--line_light);
}

.tab-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 25px 20px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text2);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: all 0.2s;
}

.tab-item:hover {
  color: var(--text1);
}

.tab-item.active {
  color: var(--brand_pink);
  border-bottom-color: var(--brand_pink);
  font-weight: 600;
}

.tab-item svg {
  color: inherit;
}

.tabs-spacer {
  flex: 1;
}

.tabs-stats {
  display: flex;
  align-items: center;
  gap: 40px;
}

.tabs-stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.tabs-stat-item.clickable {
  cursor: pointer;
  transition: color 0.2s;
}

.tabs-stat-item.clickable:hover {
  color: var(--brand_pink);
}

.tabs-stat-item.clickable:hover .tabs-stat-num,
.tabs-stat-item.clickable:hover .tabs-stat-label {
  color: var(--brand_pink);
}

.tabs-stat-num {
  font-size: 15px;
  font-weight: 600;
  color: var(--text2);
  font-family: inherit;
  line-height: 1.2;
  transition: color 0.2s;
}

.tabs-stat-label {
  font-size: 15px;
  color: var(--text2);
  transition: color 0.2s;
}

/* 标签页内容 */
.profile-body {
  display: flex;
  gap: 24px;
}

.profile-content {
  flex: 1;
  padding: 20px 0 60px;
  min-width: 0;
}

.profile-sidebar {
  width: 280px;
  flex-shrink: 0;
  padding: 20px 0 60px;
}

.info-card {
  background: var(--bg2);
  border-radius: 8px;
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text1);
  margin: 0;
}

.card-edit {
  cursor: pointer;
  color: var(--text3);
  transition: color 0.2s;
}

.card-edit:hover {
  color: var(--brand_pink);
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-label {
  font-size: 13px;
  color: var(--text3);
}

.item-value {
  font-size: 13px;
  color: var(--text1);
  font-weight: 500;
}

.home-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text1);
  margin: 0 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.empty-small {
  padding: 40px;
  text-align: center;
  color: var(--text3);
  font-size: 14px;
}

.folder-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
}

.folder-card {
  cursor: pointer;
  border-radius: 8px;
  background: var(--bg2);
  transition: transform 0.2s;
  position: relative;
  box-shadow:
    4px -4px 0 0 #d1d5db,
    8px -8px 0 0 #e5e7eb,
    12px -12px 0 0 #f3f4f6,
    0 2px 8px rgba(0, 0, 0, 0.1);
}

.folder-card:hover {
  transform: translate(-2px, 2px);
}

.folder-cover {
  position: relative;
  aspect-ratio: 16/9;
  background: linear-gradient(135deg, #fb7299 0%, #fc9db4 100%);
  overflow: hidden;
  border-radius: 8px 8px 0 0;
}

.folder-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.folder-cover-default {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.folder-info {
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.folder-title {
  font-size: 13px;
  color: var(--text1);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.folder-type {
  position: relative;
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.folder-item:hover .folder-type > svg {
  opacity: 0;
}

.folder-type.public {
  color: #52c41a;
}

.folder-type.private {
  color: #faad14;
}

.profile-content-full {
  padding: 20px 0 60px;
}

/* 收藏夹布局 */
.favorites-layout {
  display: flex;
  gap: 24px;
  min-height: 500px;
}

.favorites-sidebar {
  width: 280px;
  flex-shrink: 0;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  max-height: 600px;
  background: var(--bg1);
  border: 1px solid var(--line_light);
}

.sidebar-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--line_light);
}

.sidebar-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text1);
}

.sidebar-body {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.sidebar-footer {
  padding: 12px;
  border-top: 1px solid var(--line_light);
  flex-shrink: 0;
}

.add-folder-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 10px 16px;
  background: var(--bg2);
  border: 1px dashed var(--line_bold);
  border-radius: 8px;
  font-size: 14px;
  font-family: var(--font-family);
  color: var(--text2);
  cursor: pointer;
  transition: all 0.2s;
}

.add-folder-btn:hover {
  border-color: var(--brand_blue);
  color: var(--brand_blue);
  background: rgba(0, 174, 236, 0.06);
}

.folder-list {
  padding: 8px 0;
}

.folder-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  margin: 0 8px;
  cursor: pointer;
  transition: background 0.2s;
  border-radius: 8px;
}

.folder-item:hover {
  background: var(--bg3);
}

.folder-item.active {
  background: var(--brand_pink_thin);
}

.folder-info {
  flex: 1;
  min-width: 0;
}

.folder-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.folder-count {
  font-size: 12px;
  color: var(--text3);
  margin-top: 2px;
}

.folder-type {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.folder-type.public {
  color: #52c41a;
}

.folder-type.private {
  color: #faad14;
}

.empty-sidebar {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  gap: 8px;
  color: var(--text3);
  font-size: 14px;
}

.favorites-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.favorites-search {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.search-box {
  display: flex;
  align-items: center;
  width: 300px;
  height: 35px;
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.2s;
  background: #fff;
}

.search-box:focus-within {
  border-color: var(--brand_pink);
}

.search-select {
  flex-shrink: 0;
  height: 100%;
}

.search-scope-select {
  height: 100%;
  padding: 0 4px;
  font-size: 12px;
  color: var(--text2);
  background: var(--bg2);
  border: none;
  border-right: 1px solid var(--line_light);
  cursor: pointer;
  outline: none;
  min-width: 0;
}

.search-input-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  height: 100%;
}

.search-icon {
  position: absolute;
  right: 8px;
  color: var(--text4);
  pointer-events: none;
}

.search-input {
  width: 100%;
  height: 100%;
  padding: 0 28px 0 8px;
  font-size: 13px;
  color: var(--text1);
  background: #fff;
  border: none;
  outline: none;
}

.search-input::placeholder {
  color: var(--text4);
}

.search-clear {
  position: absolute;
  right: 24px;
  color: var(--text4);
  cursor: pointer;
  transition: color 0.2s;
}

.search-clear:hover {
  color: var(--text2);
}

.empty-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--text3);
  font-size: 14px;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 12px 0;
}

.page-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  padding: 0 6px;
  font-size: 13px;
  color: var(--text3);
  background: #fff;
  border: 1px solid var(--line_light);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  color: var(--brand_pink);
  border-color: var(--brand_pink);
}

.page-btn:disabled {
  color: var(--text4);
  cursor: not-allowed;
  opacity: 0.5;
}

.page-info {
  font-size: 13px;
  color: var(--text3);
  padding: 0 8px;
}

/* 关注列表 */
.follow-container {
  padding: 20px 0;
}

.follow-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.follow-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.follow-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text1);
}

.follow-count {
  font-size: 14px;
  color: var(--text3);
}

.follow-search {
  position: relative;
  width: 200px;
}

.follow-search-input {
  width: 100%;
  height: 32px;
  padding: 0 32px 0 12px;
  border: 1px solid var(--line_regular);
  border-radius: 6px;
  font-size: 13px;
  font-family: var(--font-family);
  color: var(--text1);
  background: var(--bg2);
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.follow-search-input::placeholder {
  color: var(--text4);
}

.follow-search-input:focus {
  border-color: var(--brand_blue);
}

.follow-search-icon {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text4);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.follow-search-icon:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.follow-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  animation: videoFadeIn 0.3s ease;
}

.follow-card {
  background: transparent;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid var(--line_light);
}

.follow-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border-color: transparent;
}

.follow-card-enter-active,
.follow-card-leave-active {
  transition: all 0.3s ease;
}

.follow-card-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.follow-card-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.follow-card-move {
  transition: transform 0.3s ease;
}

.follow-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px 16px 0;
}

.follow-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  overflow: visible;
  background: linear-gradient(135deg, var(--brand_pink) 0%, #ff6b9d 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
  box-shadow: 0 4px 12px rgba(251, 114, 153, 0.3);
  position: relative;
}

.follow-avatar:hover {
  transform: scale(1.05);
}

.follow-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.vip-icon-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #fb7299 0%, #fc9db4 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--bg1);
  color: #fff;
}

.avatar-placeholder {
  text-transform: uppercase;
}

.follow-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.follow-btn.followed {
  background: var(--bg3);
  color: var(--text2);
}

.follow-btn.followed:hover {
  background: #fee2e2;
  color: #ef4444;
}

.follow-btn.follow {
  background: var(--brand_pink);
  color: #fff;
}

.follow-btn.follow:hover {
  background: var(--brand_pink_hover, #fc5c9c);
}

.follow-card-body {
  padding: 12px 16px;
  cursor: pointer;
}

.follow-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text1);
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 6px;
}

.follow-signature {
  font-size: 13px;
  color: var(--text3);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 40px;
}

.empty-hint {
  font-size: 13px;
  color: var(--text4);
}

/* 视频网格 */
.video-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
}

.video-card {
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s;
}

.video-card:hover {
  transform: translateY(-4px);
}

.video-cover {
  position: relative;
  aspect-ratio: 16/9;
  border-radius: 8px;
  overflow: hidden;
  background: var(--bg2);
}

.video-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.video-card:hover .video-cover img {
  transform: scale(1.05);
}

.cover-stats {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px 8px 6px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  display: flex;
  gap: 12px;
}

.cover-stats .stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #fff;
}

.video-duration {
  position: absolute;
  bottom: 6px;
  right: 6px;
  padding: 2px 6px;
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  font-size: 12px;
  border-radius: 4px;
}

.video-info {
  padding: 10px 0;
}

.video-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text1);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0 0 6px;
}

.video-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
  color: var(--text3);
}

.video-author {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.video-date {
  flex-shrink: 0;
}

/* 时间线样式 */
.timeline-container {
  position: relative;
  padding-left: 40px;
}

.timeline-item {
  position: relative;
  margin-bottom: 40px;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.timeline-dot {
  position: absolute;
  left: -40px;
  top: 8px;
  width: 16px;
  height: 16px;
  background: var(--brand_pink);
  border-radius: 50%;
  border: 3px solid var(--bg1);
  box-shadow: 0 0 0 2px var(--brand_pink);
  z-index: 1;
}

.timeline-line {
  position: absolute;
  left: -33px;
  top: 24px;
  bottom: -40px;
  width: 2px;
  background: linear-gradient(to bottom, var(--brand_pink), var(--line_light));
}

.timeline-content {
  background: var(--bg2);
  border-radius: 12px;
  padding: 20px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.timeline-content:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.timeline-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--line_light);
}

.timeline-month {
  font-size: 18px;
  font-weight: 600;
  color: var(--text1);
  background: linear-gradient(135deg, var(--brand_pink), #ff6b9d);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.timeline-count {
  font-size: 13px;
  color: var(--text3);
  background: var(--bg3);
  padding: 2px 10px;
  border-radius: 12px;
}

.timeline-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  color: var(--text3);
  font-size: 14px;
}

.timeline-loading .loading-spinner {
  width: 20px;
  height: 20px;
  border-width: 2px;
}

.timeline-end {
  text-align: center;
  padding: 20px;
  color: var(--text3);
  font-size: 13px;
  position: relative;
}

.timeline-end::before,
.timeline-end::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 60px;
  height: 1px;
  background: var(--line_light);
}

.timeline-end::before {
  right: calc(50% + 40px);
}

.timeline-end::after {
  left: calc(50% + 40px);
}

.video-status {
  position: absolute;
  top: 6px;
  left: 6px;
  padding: 2px 8px;
  font-size: 11px;
  border-radius: 4px;
  color: #fff;
}

.video-status.status-0 { background: rgba(0, 0, 0, 0.6); }
.video-status.status-1 { background: #faad14; }
.video-status.status-2 { background: #52c41a; }
.video-status.status-3 { background: #ff4d4f; }

.episode-count {
  font-size: 12px;
  color: var(--text3);
}

/* 加载状态 */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--line_regular);
  border-top-color: var(--brand_pink);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px;
  gap: 16px;
  color: var(--text3);
}

.empty-state p {
  font-size: 14px;
  margin: 0;
}

/* 响应式 */
@media (max-width: 1200px) {
  .video-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .follow-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 992px) {
  .favorites-layout {
    flex-direction: column;
  }
  
  .favorites-sidebar {
    width: 100%;
  }
  
  .folder-list {
    display: flex;
    overflow-x: auto;
    padding: 8px 0;
  }
  
  .folder-item {
    flex-shrink: 0;
    padding: 8px 16px;
  }
}

@media (max-width: 768px) {
  .banner-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 0 16px 20px;
  }

  .user-info {
    padding-bottom: 0;
  }

  .info-top {
    justify-content: center;
    flex-wrap: wrap;
  }

  .info-stats {
    justify-content: center;
  }

  .info-actions {
    justify-content: center;
  }

  .profile-tabs {
    justify-content: center;
    flex-wrap: wrap;
  }

  .video-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .follow-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .favorites-search {
    justify-content: flex-end;
  }

  .search-box {
    width: 160px;
  }

  .search-scope-select {
    width: 100%;
  }

  .signature-input {
    width: 100%;
  }
}

/* 标签页切换动画 */
.tab-fade-enter-active,
.tab-fade-leave-active {
  transition: all 0.25s ease;
}

.tab-fade-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.tab-fade-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

/* 视频列表动画 */
.video-grid {
  animation: videoFadeIn 0.3s ease;
}

@keyframes videoFadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 收藏夹更多按钮和下拉菜单 */
.folder-more-btn {
  position: relative;
  cursor: pointer;
  color: var(--text3);
  transition: color 0.2s;
  z-index: 10;
}

.folder-more-btn:hover {
  color: var(--text1);
}

.folder-dropdown-menu {
  position: absolute;
  right: 0;
  top: 100%;
  min-width: 140px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  padding: 4px 0;
  z-index: 100;
}

.folder-dropdown-menu-fixed {
  position: fixed;
  min-width: 140px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  padding: 4px 0;
  z-index: 9999;
}

.dropdown-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  font-size: 13px;
  color: var(--text2);
  cursor: pointer;
  transition: all 0.2s;
}

.dropdown-menu-item:hover {
  background: var(--bg2);
  color: var(--text1);
}

.dropdown-menu-item.danger {
  color: #f56c6c;
}

.dropdown-menu-item.danger:hover {
  background: #fef0f0;
  color: #f56c6c;
}

/* 编辑弹框样式 */
.fav-overlay {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
}

.fav-dialog {
  width: 420px;
  max-width: calc(100vw - 40px);
  max-height: 80vh;
  background: var(--bg1);
  border-radius: 8px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: visible;
}

.fav-dialog-small {
  width: 380px;
}

.fav-overlay-enter-active .fav-dialog,
.fav-overlay-leave-active .fav-dialog {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.fav-overlay-enter-from .fav-dialog,
.fav-overlay-leave-to .fav-dialog {
  opacity: 0;
  transform: scale(0.95);
}

.fav-overlay-enter-active,
.fav-overlay-leave-active {
  transition: opacity 0.2s ease;
}

.fav-overlay-enter-from,
.fav-overlay-leave-to {
  opacity: 0;
}

.fav-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--line_light);
  flex-shrink: 0;
}

.fav-dialog-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text1);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.fav-dialog-header h3 svg {
  color: var(--brand_blue);
}

.fav-close-btn {
  width: 30px;
  height: 30px;
  border: none;
  background: transparent;
  border-radius: 4px;
  color: var(--text3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.fav-close-btn:hover {
  background: var(--bg2);
  color: var(--text1);
}

.fav-dialog-body {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.fav-dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 12px 20px;
  border-top: 1px solid var(--line_light);
  flex-shrink: 0;
}

.fav-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  font-family: var(--font-family);
  cursor: pointer;
  transition: all 0.15s ease;
  line-height: 1;
}

.fav-btn-cancel {
  background: var(--bg2);
  color: var(--text2);
}

.fav-btn-cancel:hover {
  background: var(--graph_bg_thick);
  color: var(--text1);
}

.fav-btn-confirm {
  background: var(--brand_blue);
  color: #fff;
}

.fav-btn-confirm:hover:not(:disabled) {
  background: var(--brand_blue_hover);
}

.fav-btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.fav-btn-danger {
  background: #f56c6c;
  color: #fff;
}

.fav-btn-danger:hover:not(:disabled) {
  background: #f78989;
}

.fav-btn-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 编辑表单样式 */

/* 封面上传样式 */
.cover-upload-area {
  position: relative;
  display: inline-block;
}

.cover-upload-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}

.cover-upload-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 200px;
  height: 112px;
  border: 2px dashed var(--line_bold);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  overflow: hidden;
  background: var(--bg2);
  color: var(--text3);
  font-size: 13px;
  gap: 8px;
}

.cover-upload-btn:hover {
  border-color: var(--brand_blue);
  color: var(--brand_blue);
}

.cover-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-upload-loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 8px;
}

.cover-upload-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 80%;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: var(--line_regular);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--brand_blue), #00d4ff);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: var(--text2);
  font-weight: 500;
}

.cover-remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
  z-index: 1;
}

.cover-remove-btn:hover {
  background: rgba(0, 0, 0, 0.8);
}

.edit-form-radio-group {
  display: flex;
  gap: 16px;
}

.edit-form-radio {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border: 1px solid var(--line_regular);
  border-radius: 6px;
  font-size: 14px;
  color: var(--text2);
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
}

.edit-form-radio:hover {
  border-color: var(--brand_blue);
}

.edit-form-radio.active {
  border-color: var(--brand_blue);
  background: rgba(0, 174, 236, 0.06);
  color: var(--brand_blue);
}

.edit-form-radio input {
  display: none;
}

/* 删除确认样式 */
.delete-confirm-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
}

.delete-confirm-text {
  font-size: 16px;
  font-weight: 500;
  color: var(--text1);
  margin: 16px 0 8px;
}

.delete-confirm-hint {
  font-size: 13px;
  color: var(--text3);
  margin: 0;
}
</style>
