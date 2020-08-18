import Axios from 'axios'
import baseURL from '../../config/url'
import { Notice } from 'view-design'
import { getToken } from '../libs/util'

let conf = {
  baseURL: baseURL,
  // timeout: 3000,
  headers: {
    'Content-Type': 'application/json; charset=utf-8'
    /* 'X-URL-PATH': location.pathname */
  }
}

const axios = Axios.create(conf)

// 添加请求拦截器
const requestInterceptors = axios.interceptors.request.use(
  config => {
    config.headers['X-Signing'] = getToken()
    config.params = {
      cluster: '',
      namespace: '',
      ...config.params
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 添加响应拦截器
const responseInterceptors = axios.interceptors.response.use(
  res => {
    let { data } = res
    if (data.code !== 200) {
      // 后端服务在个别情况下回报201，待确认
      // if (data.code === 401) {
      //   window.location.href = '/login'
      //   Message.error('未登录，或登录失效，请登录')
      // } else {
      //   if (data.msg) {
      //     Notice.error({ title: '错误提示', desc: data.msg, duration: 10 })
      //   }
      // }
      if (data.msg) {
        Notice.error({ title: '错误提示', desc: data.msg, duration: 10 })
      }
    }
    return data
  },
  error => {
    let data = error.response.data
    if (data.code === 401) {
      window.location.href = 'login'
    }
    if (data.msg === 'sql: no rows in result set') {
      if (this.$store.getters.getSelectObj) {
        Notice.info({
          title: '集群信息错误',
          desc: '请选择正确集群信息',
          duration: 10
        })
      }
    } else if (data.msg === 'dashboard not exist') {
      Notice.info({ title: '创建图表', desc: '图表创建中请等待...', duration: 10 })
    } else {
      Notice.error({ title: '错误提示', desc: data.msg })
    }

    // 对响应错误做点什么
    return Promise.reject(error)
  }
)

const baseAxios = Axios.create(conf)
const baseRequestInterceptors = baseAxios.interceptors.request.use(
  config => {
    config.headers['X-Signing'] = getToken()
    config.params = {
      ...config.params
    }
    return config
  },
  error => {
    return Promise.reject(error)
  })

const baseResponseInterceptors = baseAxios.interceptors.response.use(
  res => {
    let { data } = res
    if (data.code !== 200) {
      // 后端服务在个别情况下回报201，待确认
      // if (data.code === 401) {
      //   window.location.href = '/login'
      //   Message.error('未登录，或登录失效，请登录')
      // } else {
      //   if (data.msg) {
      //     Notice.error({ title: '错误提示', desc: data.msg, duration: 10 })
      //   }
      // }
      if (data.msg) {
        Notice.error({ title: '错误提示', desc: data.msg, duration: 10 })
      }
    }
    return data
  },
  error => {
    let data = error.response.data
    if (data.code === 401) {
      window.location.href = 'login'
    }
    Notice.error({ title: '错误提示', desc: data.msg, duration: 10 })
    // 对响应错误做点什么
    return Promise.reject(error)
  }
)

// 为了某些组件可能需要移除这个拦截器
export {
  requestInterceptors,
  responseInterceptors,
  axios,
  baseAxios,
  baseRequestInterceptors,
  baseResponseInterceptors
}
