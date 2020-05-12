import { axios } from '../libs/api.new.request'
import { K8S_URL_PREFIX } from '../../config/conf'

/*
1、获取info card

Request
GET /kubernetes/api/v1.10/dashboard/infocard?namespace=default&productId=2012110217554623&cluster=c_52589714754D
*/

export const getInfoCard = (params) => {
  return axios.request({
    url: K8S_URL_PREFIX + 'dashboard/infocard',
    method: 'get'
  })
}

/*
2、获取Application

Request
GET /kubernetes/api/v1.10/dashboard/application?productId=2012110217554623&namespace=default&cluster=c_52589714754D
*/

export const getApplication = (params) => {
  return axios.request({
    url: K8S_URL_PREFIX + 'dashboard/application',
    method: 'get'
  })
}

/*
3、获取history

Request
GET /kubernetes/api/v1.10/dashboard/history
*/

export const getHistory = (params) => {
  return axios.request({
    url: K8S_URL_PREFIX + 'dashboard/history',
    method: 'get'
  })
}
