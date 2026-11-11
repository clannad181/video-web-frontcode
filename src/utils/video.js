import { openAppPage } from './navigation'

/**
 * 处理视频点击跳转
 * @param {Object} video 视频对象
 * @param {Object} router Vue Router实例（可选）
 */
export const handleVideoClick = (video, router = null) => {
  let path = ''
  if (video.playLink) {
    path = video.playLink
    try {
      const url = new URL(path)
      path = url.pathname
    } catch {}
    if (path.startsWith('/api')) {
      path = path.slice(4)
    }
  } else if (video.episodeAvid && video.videoAvid) {
    path = `/client/video/${video.videoAvid}/episode/${video.episodeAvid}`
  } else if (video.episodeAvid) {
    path = `/client/video/${video.videoAvid || video.id}/episode/${video.episodeAvid}`
  } else {
    path = `/client/video/${video.id}/episode/${video.currentEpisode?.id || video.id}`
  }
  if (path) {
    const query = video.watchedSeconds ? { t: video.watchedSeconds } : {}
    if (router) {
      router.push({ path, query })
    } else {
      const queryString = new URLSearchParams(query).toString()
      const fullPath = queryString ? `${path}?${queryString}` : path
      openAppPage(fullPath)
    }
  }
}

/**
 * 处理用户点击跳转
 * @param {number} uid 用户ID
 * @param {Object} router Vue Router实例（可选）
 */
export const handleUserClick = (uid, router = null) => {
  const path = `/up/profile/${uid}`
  if (router) {
    router.push(path)
  } else {
    openAppPage(path)
  }
}
