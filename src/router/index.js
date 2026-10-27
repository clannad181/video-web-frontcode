import { createRouter, createWebHashHistory } from 'vue-router'
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
        meta: { title: '工作台', icon: 'Odometer', requiresAuth: true }
      },
      {
        path: 'data-analysis',
        name: 'DataAnalysis',
        component: () => import('@/views/analytics/index.vue'),
        meta: { title: '数据分析', icon: 'TrendCharts', requiresAuth: true }
      }
    ]
  },
  {
    path: '/video-manage',
    component: Layout,
    children: [
      {
        path: '',
        name: 'VideoManage',
        component: () => import('@/views/video/video-manage.vue'),
        meta: { title: '视频管理', icon: 'VideoCamera', requiresAuth: true }
      }
    ]
  },
  {
    path: '/users',
    component: Layout,
    children: [
      {
        path: '',
        name: 'UserManage',
        component: () => import('@/views/user/user-manage.vue'),
        meta: { title: '人员管理', icon: 'User', requiresAuth: true }
      }
    ]
  },
  {
    path: '/vip-manage',
    component: Layout,
    children: [
      {
        path: '',
        name: 'VipManage',
        component: () => import('@/views/user/vip-manage.vue'),
        meta: { title: '大会员管理', icon: 'GoldMedal', hidden: true, requiresAuth: true }
      }
    ]
  },
  {
    path: '/goods-manage',
    component: Layout,
    children: [
      {
        path: '',
        name: 'GoodsManage',
        component: () => import('@/views/goods/goods-manage.vue'),
        meta: { title: '商品管理', icon: 'Goods', hidden: true, requiresAuth: true }
      }
    ]
  },
  {
    path: '/roles',
    component: Layout,
    children: [
      {
        path: '',
        name: 'Role',
        component: () => import('@/views/system/role-manage.vue'),
        meta: { title: '角色管理', icon: 'UserFilled', requiresAuth: true }
      }
    ]
  },
  {
    path: '/menus',
    component: Layout,
    children: [
      {
        path: '',
        name: 'MenuManage',
        component: () => import('@/views/menu-manage/index.vue'),
        meta: { title: '菜单管理', icon: 'Menu', requiresAuth: true }
      }
    ]
  },
  {
    path: '/category-manage',
    component: Layout,
    children: [
      {
        path: '',
        name: 'CategoryManage',
        component: () => import('@/views/user/category-manage.vue'),
        meta: { title: '分类管理', icon: 'Folder', requiresAuth: true }
      }
    ]
  },
  {
    path: '/dict',
    component: Layout,
    children: [
      {
        path: '',
        name: 'DictManage',
        component: () => import('@/views/dict/index.vue'),
        meta: { title: '字典管理', icon: 'Collection', requiresAuth: true }
      }
    ]
  },
  {
    path: '/comment-manage',
    component: Layout,
    children: [
      {
        path: '',
        name: 'CommentManage',
        component: () => import('@/views/video/comment-manage.vue'),
        meta: { title: '评论管理', icon: 'ChatDotRound', requiresAuth: true }
      }
    ]
  },
  {
    path: '/review',
    component: Layout,
    children: [
      {
        path: '',
        name: 'ReviewManage',
        component: () => import('@/views/review/index.vue'),
        meta: { title: '内容审核', icon: 'CircleCheck', requiresAuth: true }
      },
      {
        path: 'complaint',
        name: 'ReviewComplaint',
        component: () => import('@/views/review/complaint.vue'),
        meta: { title: '稿件投诉', icon: 'Warning', requiresAuth: true }
      }
    ]
  },
  {
    path: '/settings',
    component: Layout,
    children: [
      {
        path: '',
        name: 'Settings',
        component: () => import('@/views/system/website.vue'),
        meta: { title: '系统设置', icon: 'Setting', requiresAuth: true }
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
        component: () => import('@/views/system/notification.vue'),
        meta: { title: '通知设置', icon: 'Bell', hidden: true, requiresAuth: true }
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
        meta: { title: '系统信息', icon: 'Monitor', requiresAuth: true }
      }
    ]
  },
  {
    path: '/system-log',
    component: Layout,
    children: [
      {
        path: '',
        name: 'SystemLog',
        component: () => import('@/views/system-log/login-log.vue'),
        meta: { title: '系统日志', icon: 'Document', requiresAuth: true }
      }
    ]
  },
  {
    path: '/login-log',
    component: Layout,
    children: [
      {
        path: '',
        name: 'LoginLog',
        component: () => import('@/views/system-log/login-log.vue'),
        meta: { title: '登录日志', icon: 'Key', requiresAuth: true }
      }
    ]
  },
  {
    path: '/operation-log',
    component: Layout,
    children: [
      {
        path: '',
        name: 'OperationLog',
        component: () => import('@/views/system-log/operation-log.vue'),
        meta: { title: '运行日志', icon: 'Cpu', requiresAuth: true }
      }
    ]
  },
  {
    path: '/log-statistics',
    component: Layout,
    children: [
      {
        path: '',
        name: 'LogStatistics',
        component: () => import('@/views/system-log/log-statistics.vue'),
        meta: { title: '日志统计', icon: 'DataAnalysis', requiresAuth: true }
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
        meta: { title: '个人中心', icon: 'Avatar', hidden: true, requiresAuth: true }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error-page/index.vue'),
    meta: { title: '404' }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes: constantRoutes
})

router.beforeEach((to, from, next) => {
  NProgress.start()
  const token = getToken()

  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/')
  } else {
    next()
  }
})

router.afterEach(() => {
  NProgress.done()
})

export default router
