import { axios, requestInterceptors } from '../../libs/api.new.request'
import { getToken } from '../../libs/util'
import { KF_URL_PREFIX } from '../../../config/conf'

const state = {
  clusterId: '',
  namespaceId: '',
  selectObj: [],
  selectedData: [],
  currentNamespaceName: '',
  currentClusterName: '',
  clusterSelect: true,
  quickMenu: false
}

const getters = {
  getClusterId: state => state.clusterId,
  getSelectObj: state => state.selectObj,
  getSelectedData: state => state.selectedData,
  currentClusterId: state => state.clusterId,
  currentNamespaceId: state => state.namespaceId,
  currentNamespaceName: state => state.currentNamespaceName,
  currentClusterName: state => state.currentClusterName,
  clusterSelect: state => state.clusterSelect,
  quickMenu: state => state.quickMenu
}

// 进行异步操作和ajax请求   this.$store.dispatch("changeCluserId", data);
const actions = {
  changeAjaxOpt ({ commit, state }, obj) {
    commit('setSelectedData', obj.selectedData)
    commit('setClusterId', obj.clusterId.value)
    commit('setNamespaceId', obj.namespaceId.value)
    commit('setCurrentNamespaceName', obj.namespaceId.label)
    commit('setCurrentClusterName', obj.clusterId.label)

    axios.interceptors.request.eject(requestInterceptors)

    let conf = config => {
      config.headers['X-Signing'] = getToken()

      config.params = {
        cluster: obj.clusterId.value,
        namespace: obj.namespaceId.label,
        ...config.params
      }
      return config
    }
    axios.interceptors.request.use(conf, undefined)
  },
  flushSelectObj ({ commit, state }, type) {
    axios.request({
      url: KF_URL_PREFIX + 'cascade',
      method: 'get'
    }).then(res => {
      let selectObj = res.data
      commit('setSelectObj', selectObj)
    })
  }
}

// 执行同步操作改变state  this.$store.commit('changeNodeList', { key: 'name', val: newVal })
const mutations = {
  setSelectObj (state, value) {
    state.selectObj = value
  },
  setClusterId (state, value) {
    state.clusterId = value
  },
  setNamespaceId (state, value) {
    state.namespaceId = value
  },
  setCurrentClusterName (state, value) {
    state.currentClusterName = value
  },
  setCurrentNamespaceName (state, value) {
    state.currentNamespaceName = value
  },
  setSelectedData (state, value) {
    state.selectedData = value
  },
  setClusterSelect (state, value) {
    state.clusterSelect = value
  },
  setQuickMenu (state, value) {
    state.quickMenu = value
  }

}

export default {
  state,
  getters,
  actions,
  mutations
}
