import axios from '../libs/api.request'
import { KF_URL_PREFIX } from '../../config/conf'

export const preLogin = () => {
  return axios.request({
    url: '/login',
    method: 'get'
  })
}

export const login = ({ userName, password }) => {
  const data = {
    username: userName,
    password: password
  }
  return axios.request({
    url: KF_URL_PREFIX + 'login',
    data,
    method: 'post'
  })
}

/* 通过Token获取用户信息 */
export const getUserInfo = (token) => {
  return axios.request({
    url: KF_URL_PREFIX + 'userByToken',
    headers: {
      'X-Signing': token
    },
    method: 'get'
  })
}

export const logout = (token) => {
  return axios.request({
    url: 'logout',
    method: 'post'
  })
}
