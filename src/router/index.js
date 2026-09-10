import { createRouter, createWebHistory } from 'vue-router'
import NProgress from 'nprogress'
import { getToken } from '@/utils/auth'

const Layout = () => import('@/layouts/index.vue')

export const constantRoutes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '工作台', icon: 'Odometer' }
      },
      {
        path: 'analytics',
        name: 'Analytics',
        component: () => import('@/views/analytics/index.vue'),
        meta: { title: '数据分析', icon: 'TrendCharts' }
      }
    ]
  },
  {
    path: '/video',
    component: Layout,
    redirect: '/video/video-manage',
    meta: { title: '视频管理', icon: 'VideoCamera' },
    children: [
      {
        path: 'video-manage',
        name: 'VideoManage',
        component: () => import('@/views/video/video-manage.vue'),
        meta: { title: '视频管理' }
      },
      {
        path: 'comment-manage',
        name: 'CommentManage',
        component: () => import('@/views/video/comment-manage.vue'),
        meta: { title: '评论管理' }
      },
      {
        path: 'danmaku-manage',
        name: 'DanmakuManage',
        component: () => import('@/views/video/danmaku-manage.vue'),
        meta: { title: '弹幕管理' }
      }
    ]
  },
  {
    path: '/audit',
    component: Layout,
    redirect: '/audit/video-audit',
    meta: { title: '审核管理', icon: 'Stamp' },
    children: [
      {
        path: 'video-audit',
        name: 'VideoAudit',
        component: () => import('@/views/audit/video-audit.vue'),
        meta: { title: '视频审核' }
      },
      {
        path: 'comment-audit',
        name: 'CommentAudit',
        component: () => import('@/views/audit/comment-audit.vue'),
        meta: { title: '评论审核' }
      }
    ]
  },
  {
    path: '/user',
    component: Layout,
    redirect: '/user/user-manage',
    meta: { title: '用户管理', icon: 'User' },
    children: [
      {
        path: 'user-manage',
        name: 'UserManage',
        component: () => import('@/views/user/user-manage.vue'),
        meta: { title: '用户管理' }
      },
      {
        path: 'category-manage',
        name: 'CategoryManage',
        component: () => import('@/views/user/category-manage.vue'),
        meta: { title: '分类管理' }
      }
    ]
  },
  {
    path: '/notice',
    component: Layout,
    children: [
      {
        path: '',
        name: 'Notice',
        component: () => import('@/views/notice/index.vue'),
        meta: { title: '通知中心', icon: 'Bell' }
      }
    ]
  },
  {
    path: '/system',
    component: Layout,
    redirect: '/system/website',
    meta: { title: '系统管理', icon: 'Setting' },
    children: [
      {
        path: 'website',
        name: 'Website',
        component: () => import('@/views/system/website.vue'),
        meta: { title: '网站设置' }
      },
      {
        path: 'security',
        name: 'Security',
        component: () => import('@/views/system/security.vue'),
        meta: { title: '安全设置' }
      },
      {
        path: 'token',
        name: 'Token',
        component: () => import('@/views/system/token.vue'),
        meta: { title: '令牌安全' }
      },
      {
        path: 'notification',
        name: 'Notification',
        component: () => import('@/views/system/notification.vue'),
        meta: { title: '通知设置' }
      },
      {
        path: 'appearance',
        name: 'Appearance',
        component: () => import('@/views/system/appearance.vue'),
        meta: { title: '外观设置' }
      },
      {
        path: 'audit-config',
        name: 'AuditConfig',
        component: () => import('@/views/system/audit-config.vue'),
        meta: { title: '审核设置' }
      },
      {
        path: 'default',
        name: 'Default',
        component: () => import('@/views/system/default.vue'),
        meta: { title: '默认设置' }
      }
    ]
  },
  {
    path: '/system-info',
    component: Layout,
    children: [
      {
        path: '',
        name: 'SystemInfo',
        component: () => import('@/views/system-info/index.vue'),
        meta: { title: '系统信息', icon: 'Monitor' }
      }
    ]
  },
  {
    path: '/system-log',
    component: Layout,
    redirect: '/system-log/login-log',
    meta: { title: '日志管理', icon: 'Document' },
    children: [
      {
        path: 'login-log',
        name: 'LoginLog',
        component: () => import('@/views/system-log/login-log.vue'),
        meta: { title: '登录日志' }
      },
      {
        path: 'operation-log',
        name: 'OperationLog',
        component: () => import('@/views/system-log/operation-log.vue'),
        meta: { title: '运行日志' }
      },
      {
        path: 'log-statistics',
        name: 'LogStatistics',
        component: () => import('@/views/system-log/log-statistics.vue'),
        meta: { title: '日志统计' }
      }
    ]
  },
  {
    path: '/role',
    component: Layout,
    children: [
      {
        path: '',
        name: 'Role',
        component: () => import('@/views/role/index.vue'),
        meta: { title: '角色管理', icon: 'UserFilled' }
      }
    ]
  },
  {
    path: '/menu-manage',
    component: Layout,
    children: [
      {
        path: '',
        name: 'MenuManage',
        component: () => import('@/views/menu-manage/index.vue'),
        meta: { title: '菜单管理', icon: 'Menu' }
      }
    ]
  },
  {
    path: '/profile',
    component: Layout,
    children: [
      {
        path: '',
        name: 'Profile',
        component: () => import('@/views/profile/index.vue'),
        meta: { title: '个人中心', icon: 'Avatar', hidden: true }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes
})

const whiteList = ['/login']

router.beforeEach((to, from, next) => {
  NProgress.start()
  const token = getToken()
  if (token) {
    if (to.path === '/login') {
      next('/')
    } else {
      next()
    }
  } else {
    if (whiteList.includes(to.path)) {
      next()
    } else {
      next(`/login?redirect=${to.path}`)
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})

export default router
