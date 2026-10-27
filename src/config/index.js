/**
 * 全局请求地址配置
 * BASE_URL    - 后端接口请求地址
 * OSS_BASE_URL- 图片/视频等静态资源请求地址
 */
export const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export const OSS_BASE_URL = import.meta.env.VITE_OSS_BASE_URL || ''
