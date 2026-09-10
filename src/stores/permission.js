import { defineStore } from 'pinia'
import { constantRoutes } from '@/router'

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    routes: [],
    addRoutes: []
  }),

  actions: {
    setRoutes(routes) {
      this.addRoutes = routes
      this.routes = constantRoutes.concat(routes)
    },

    generateRoutes(menus) {
      return new Promise(resolve => {
        const accessedRoutes = filterAsyncRoutes(menus)
        this.setRoutes(accessedRoutes)
        resolve(accessedRoutes)
      })
    }
  }
})

function filterAsyncRoutes(menus) {
  const routes = []
  menus.forEach(menu => {
    const route = {
      path: menu.path,
      name: menu.name,
      component: () => import(`@/views${menu.component}.vue`),
      meta: { title: menu.title, icon: menu.icon }
    }
    if (menu.children && menu.children.length) {
      route.children = filterAsyncRoutes(menu.children)
    }
    routes.push(route)
  })
  return routes
}
