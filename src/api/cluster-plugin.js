import { axios, baseAxios } from '../libs/api.new.request'
import { K8S_URL_PREFIX, KF_URL_PREFIX } from '../../config/conf'

export const List = params => {
  return baseAxios.request({
    url: KF_URL_PREFIX + 'clusterplugin',
    method: 'get',
    params: {
      productId: params.productId,
      cluster: params.cluster
    }
  })
}

export const InstallPodDebug = (params) => {
  return axios.request({
    url: KF_URL_PREFIX + 'podDebug/install',
    method: 'get',
    params: {
      productId: params.productId,
      plugin: params.plugin,
      cluster: params.cluster
    }
  })
}

export const UninstallPodDebug = (params) => {
  return axios.request({
    url: KF_URL_PREFIX + 'podDebug/uninstall',
    method: 'get',
    params: {
      productId: params.productId,
      plugin: params.plugin,
      cluster: params.cluster
    }
  })
}

export const InstallIstio = (params) => {
  return axios.request({
    url: KF_URL_PREFIX + 'istio/install',
    method: 'get',
    params: {
      productId: params.productId,
      plugin: params.plugin,
      cluster: params.cluster
    }
  })
}

export const UninstallIstio = (params) => {
  return axios.request({
    url: KF_URL_PREFIX + 'istio/uninstall',
    method: 'get',
    params: {
      productId: params.productId,
      plugin: params.plugin,
      cluster: params.cluster
    }
  })
}

export const InstallInspect = (params) => {
  return axios.request({
    url: KF_URL_PREFIX + 'inspect/install',
    method: 'get',
    params: {
      productId: params.productId,
      plugin: params.plugin,
      cluster: params.cluster
    }
  })
}

export const UninstallInspect = (params) => {
  return axios.request({
    url: KF_URL_PREFIX + 'inspect/uninstall',
    method: 'get',
    params: {
      productId: params.productId,
      plugin: params.plugin,
      cluster: params.cluster
    }
  })
}

export const InstallDaemon = (params) => {
  return axios.request({
    url: K8S_URL_PREFIX + 'daemon/install',
    method: 'get',
    params: {
      productId: params.productId,
      plugin: params.plugin,
      cluster: params.cluster
    }
  })
}

export const UninstallDaemon = (params) => {
  return axios.request({
    url: K8S_URL_PREFIX + 'daemon/uninstall',
    method: 'get',
    params: {
      productId: params.productId,
      plugin: params.plugin,
      cluster: params.cluster
    }
  })
}
