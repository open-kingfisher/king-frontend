import { axios } from '../libs/api.new.request'
import { K8S_URL_PREFIX } from '../../config/conf'

/*
1、获取指定Namespace下Pod

Request
GET /kubernetes/api/v1.10/pod?namespace=default&productId=2012110217554623
*/

export const getAllPodData = (params) => {
  return axios.request({
    url: K8S_URL_PREFIX + 'pod',
    method: 'get',
    params: params
  })
}

/*
2、获取指定Namespace下指定Pod

Request
GET /kubernetes/api/v1.10/pod/nginx-85f9748c8-564qx?namespace=default&productId=2012110217554623

http://10.55.30.23:8080/kubernetes/api/v1.10/pod/nginx01-bd86f7b9f-4h28w?namespace=default&productId=2012110217554623
*/

export const getPodInfo = (params) => {
  return axios.request({
    url: K8S_URL_PREFIX + 'pod/' + params.name,
    method: 'get',
    params: {
      productId: params.productId
    }
  })
}

/*
3、删除指定产品下指定Pod

Request
DELETE /kubernetes/api/v1.10/pod/nginx-85f9748c8-ghqhj?namespace=default&productId=2012110217554623&cluster=c_52589714754D
*/

export const deleteOnePod = (params) => {
  return axios.request({
    url: K8S_URL_PREFIX + 'pod/' + params.name,
    method: 'delete',
    params: {
      productId: params.productId
    }
  })
}

/*
4、获取指定Namespace下指定Pod

Request
GET /kubernetes/api/v1.10/pod/nginx-85f9748c8-564qx?namespace=default&productId=2012110217554623

http://10.55.30.23:8080/kubernetes/api/v1.10/pod/nginx01-bd86f7b9f-4h28w?namespace=default&productId=2012110217554623
*/

export const getPodLog = (params) => {
  return axios.request({
    url: K8S_URL_PREFIX + 'pod/' + params.name + '/log',
    method: 'get',
    params: {
      productId: params.productId,
      sinceSeconds: params.sinceSeconds,
      container: params.container
    }
  })
}

/*
5、Debug Pod

Request
GET /kubernetes/api/v1.10/pod/king-nginx-5cf7d97bfc-j6stj/debug?productId=100&namespace=default&cluster={{cluster}}&container=king-nginx&debugImage=nicolaka/netshoot&entryPoint=&image=kingfisher.com.cn/kingfisher/king-debug-pro:20190925151351

*/

export const debugPod = (params) => {
  return axios.request({
    url: K8S_URL_PREFIX + 'pod/' + params.name + '/debug',
    method: 'get',
    params: {
      productId: params.productId,
      sinceSeconds: params.sinceSeconds,
      container: params.container,
      debugImage: params.debugImage,
      entryPoint: params.entryPoint
    }
  })
}

export const kubectlPod = (params) => {
  return axios.request({
    url: K8S_URL_PREFIX + 'kubectl/install',
    method: 'get',
    params: {
      productId: params.productId,
      kubectlVersion: params.kubectlVersion,
      plugin: params.plugin
    }
  })
}

export const unkubectlPod = (params) => {
  return axios.request({
    url: K8S_URL_PREFIX + 'kubectl/uninstall',
    method: 'get',
    params: {
      productId: params.productId,
      kubectlVersion: params.kubectlVersion,
      plugin: params.plugin
    }
  })
}

export const metricsPod = (params) => {
  return axios.request({
    url: K8S_URL_PREFIX + 'metrics/pod/' + params.name,
    method: 'get',
    params: {
      productId: params.productId
    }
  })
}

export const rescuePod = (params) => {
  return axios.request({
    url: K8S_URL_PREFIX + 'pod/' + params.name + '/rescue',
    method: 'post',
    params: {
      productId: params.productId,
      container: params.container,
      entryPoint: params.entryPoint
    },
    data: params.rescueCondition
  })
}

// 通过Pod名获取对应debug Pod的IP
export const getDebugPodIPByPod = (params) => {
  return axios.request({
    url: K8S_URL_PREFIX + 'debug/podIP/' + params.name,
    method: 'get',
    params: {
      productId: params.productId
    }
  })
}
