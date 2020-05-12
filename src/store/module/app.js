import {
  getBreadCrumbList,
  setTagNavListInLocalstorage,
  getMenuByRouter,
  getTagNavListFromLocalstorage,
  getHomeRoute
} from '@/libs/util'
import routers from '@/router/routers'
import routeMap from '@/router/components'
import { Get } from '@/api/menu'

const formatRoutes = function (routes) {
  if (routes.length > 0) {
    routes.forEach((route, index) => {
      if (route.component) {
        routes[index].component = routeMap[route.component]
      }
      if (route.children && route.children.length) {
        formatRoutes(route.children)
      }
    })
    return routes
  }
}

export default {
  state: {
    breadCrumbList: [],
    tagNavList: [],
    homeRoute: getHomeRoute(routers),
    local: '',
    menuRspList: []
  },
  getters: {
    // menuList: (state, getters, rootState) => getMenuByRouter(routers, rootState.user.access)
    menuList: (state, getters, rootState) => getMenuByRouter(state.menuRspList, rootState.user.access)
  },
  mutations: {
    setBreadCrumb (state, routeMetched) {
      state.breadCrumbList = getBreadCrumbList(routeMetched, state.homeRoute)
    },
    setTagNavList (state, list) {
      if (list) {
        state.tagNavList = [...list]
        setTagNavListInLocalstorage([...list])
      } else state.tagNavList = getTagNavListFromLocalstorage()
    },
    addTag (state, item, type = 'unshift') {
      if (state.tagNavList.findIndex(tag => tag.name === item.name) < 0) {
        if (type === 'push') state.tagNavList.push(item)
        else state.tagNavList.unshift(item)
        setTagNavListInLocalstorage([...state.tagNavList])
      }
    },
    setLocal (state, lang) {
      state.local = lang
    },
    // 从后端获取的菜单列表
    setMenuRspList (state, list) {
      let len = list.length
      state.menuRspList = []
      for (let i = 0; i < len; i++) {
        state.menuRspList.push(list[i])
      }
    }
  },
  actions: {
    // 从后端获取菜单列表,params为集群ID
    getMenuData ({ commit, rootState }, params) {
      Get({
        productId: 100,
        cluster: params
      }).then(res => {
        if (res.code === 200) {
          // 格式化路由，主要是对路由中组件的重新获取
          let routeData = formatRoutes(res.data)
          commit('setMenuRspList', routeData)
        }
      }).catch(e => {
        console.log(e)
      })
    }
  }
}
