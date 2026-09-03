import request from './request'

export const getVideoList = (params) => request.get('/admin/video/list', { params })

export const getVideoDetail = (id) => request.get(`/admin/video/${id}`)

export const getVideoEpisodes = (videoId) => request.get(`/admin/video/${videoId}/episodes`)

export const addPlayHistory = (data) => request.post('/admin/video/history', data)

export const getPlayHistory = (params) => request.get('/admin/video/history', { params })

export const favoriteVideo = (videoId) => request.post(`/admin/video/${videoId}/favorite`)

export const unfavoriteVideo = (videoId) => request.delete(`/admin/video/${videoId}/favorite`)

export const getFavoriteList = (params) => request.get('/admin/video/favorites', { params })

export const likeVideo = (videoId) => request.post(`/admin/video/${videoId}/like`)

export const unlikeVideo = (videoId) => request.delete(`/admin/video/${videoId}/like`)

export const coinVideo = (videoId, count) => request.post(`/admin/video/${videoId}/coin`, { count })

export const getClientVideoList = (params) => request.get('/client/video/list', { params })

export const getRecommendVideos = () => request.get('/client/video/recommend')

export const followUser = (followUserUid) => request.post('/client/follow/add', { followUserUid })

export const unfollowUser = (followUserUid) => request.post('/client/follow/remove', { followUserUid })

export const checkIsFollowed = (followUserUid) => request.get('/client/follow/is-followed', { params: { followUserUid } })

export const getRelatedVideos = (videoUid) => request.get('/client/video/related', { params: { videoUid } })

export const likeEpisode = (episodeUid) => request.post(`/client/episode/${episodeUid}/like`)

export const coinEpisode = (episodeUid) => request.post(`/client/episode/${episodeUid}/coin`)

export const getEpisodeStatus = (episodeUid) => request.get(`/client/episode/${episodeUid}/status`)

export const getFavoriteStatus = (episodeUid) => request.get(`/client/episode/${episodeUid}/favorite/status`)

export const getFavoriteFolderList = () => request.get('/client/favorite/folder/list')

export const getFavoriteFolderDetail = (data) => request.post('/client/favorite/detail', data)

export const createFavoriteFolder = (data) => request.post('/client/favorite/folder/create', data)

export const updateFavoriteFolder = (data) => request.post('/client/favorite/folder/update', data)

export const deleteFavoriteFolder = (data) => request.post('/client/favorite/folder/delete', data)

export const addFavorite = (data) => request.post('/client/favorite/add', data)

export const removeFavorite = (data) => request.post('/client/favorite/remove', data)

export const getWatchHistoryList = (params) => request.get('/client/watch-history/list', { params })

export const searchWatchHistory = (data) => request.post('/client/watch-history/search', data)

export const deleteWatchHistory = (params) => request.get('/client/watch-history/delete', { params })

export const getUserCoinVideos = (params) => request.get('/client/user/coin-videos', { params })

export const getUserLikeVideos = (params) => request.get('/client/user/like-videos', { params })

export const getRecentLikeEpisodes = (params) => request.get('/client/episode/like/recent', { params })

export const getRecentCoinEpisodes = (params) => request.get('/client/episode/coin/recent', { params })

export const updateUserProfile = (data) => request.post('/client/user/update', data)

export const getMyContributions = (params) => request.get('/client/video/mine', { params })

export const getUserVideos = (params) => request.get('/client/video/user-videos', { params })

export const getFollowList = (params) => request.get('/client/follow/list', { params })
export const searchFollow = (params) => request.get('/client/follow/search', { params })
export const searchFans = (params) => request.get('/client/follow/fans', { params })

export const searchFavorite = (data) => request.post('/client/favorite/search', data)

export const submitVideo = (data) => request.post('/client/video/contribute', data)

export const updateVideo = (data) => request.post('/client/video/contribute/update', data)

export const toggleVideoOngoing = (videoUid) => request.post('/client/video/contribute/ongoing/toggle', { videoUid })

export const addVideoEpisode = (data) => request.post('/client/video/contribute/episode/add', data)

export const getVideoEpisodeList = (data) => request.post('/client/video/contribute/episode/list', data)

export const updateVideoEpisode = (data) => request.post('/client/video/contribute/episode/update', data)

export const deleteVideoEpisode = (episodeUid) => request.get('/client/video/contribute/episode/delete', { params: { episodeUid } })

export const getVideoDetailByUid = (videoUid) => request.get('/client/video/contribute/detail', { params: { videoUid } })

export const getStatsDataCenter = () => request.get('/client/stats/data-center')

export const searchContent = (params) => request.get('/client/search', { params })