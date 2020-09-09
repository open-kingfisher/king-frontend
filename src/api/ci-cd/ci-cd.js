import { axios } from '../../libs/api.new.request'
import { RUNNER_URL_PREFIX } from '../../../config/conf'

export const List = params => {
  return axios.request({
    url: RUNNER_URL_PREFIX + 'ci',
    method: 'get'
  })
}

export const Get = params => {
  return axios.request({
    url: RUNNER_URL_PREFIX + 'ci/' + params.resourceName,
    method: 'get',
    params: {
      productId: params.productId
    }
  })
}

export const Create = params => {
  return axios.request({
    url: RUNNER_URL_PREFIX + 'ci',
    method: 'post',
    params: {
      productId: params.productId
    },
    data: {
      name: params.name,
      describe: params.describe,
      level: params.level,
      namespace: params.namespace,
      basic: params.basic,
      unused: params.unused,
      state: params.state,
      security: params.security
    }
  })
}

export const Update = params => {
  return axios.request({
    url: RUNNER_URL_PREFIX + 'ci',
    method: 'put',
    data: {
      id: params.id,
      name: params.name,
      describe: params.describe,
      level: params.level,
      namespace: params.namespace,
      basic: params.basic,
      unused: params.unused,
      state: params.state,
      security: params.security
    }
  })
}

export const Delete = params => {
  return axios.request({
    url: RUNNER_URL_PREFIX + 'ci/' + params.resourceName,
    method: 'delete',
    params: {
      productId: params.productId
    }
  })
}

export const Metric = params => {
  return axios.request({
    url: RUNNER_URL_PREFIX + 'metric',
    method: 'get'
  })
}

export const Increase = params => {
  return axios.request({
    url: RUNNER_URL_PREFIX + 'consumer/increase',
    method: 'get',
    params: {
      surge: params.surge
    }
  })
}

export const Reduce = params => {
  return axios.request({
    url: RUNNER_URL_PREFIX + 'consumer/reduce',
    method: 'get',
    params: {
      reduce: params.reduce
    }
  })
}
