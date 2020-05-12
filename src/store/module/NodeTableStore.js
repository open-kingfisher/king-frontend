import { forEach, isContains } from '@/libs/tools'

const state = {
  nodeList: [],
  backupList: [],
  keyword: ''
}

const getters = {
  getNodeList: state => state.nodeList
}

// 进行异步操作和ajax请求
const actions = {
  initNodeList ({ commit, state }, nodeList) {
    commit('initNodeList', nodeList)
  }
}

// 执行同步操作改变state
const mutations = {
  initNodeList (state, nodeList) {
    state.nodeList = nodeList
    state.backupList = nodeList
  },
  changeNodeList (state, payload) {
    // state.nodeList = nodeList;

    if (payload) {
      if (payload.key) {
        // key不为空，指定搜索
        let table = []
        forEach(state.backupList, (item, index) => {
          isContains(item[payload.key], payload.val) && table.push(item)
        })
        state.nodeList = table
      } else {
        // key为空，全局搜索
        let table = []
        forEach(state.backupList, (item, index) => {
          forEach(Object.values(item), (val, index) => {
            isContains(val, payload.val) && table.push(item)
          })
        })
        state.nodeList = table
      }
    } else {
      state.nodeList = state.backupList
    }
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
