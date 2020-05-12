import { axios } from '../../libs/api.new.request'
import { INSPECT_URL_PREFIX } from '../../../config/conf'

export const List = params => {
  return axios.request({
    url: INSPECT_URL_PREFIX + 'inspect',
    method: 'get'
  })
}

export const Get = params => {
  return axios.request({
    url: INSPECT_URL_PREFIX + 'inspect/' + params.resourceName,
    method: 'get',
    params: {
      productId: params.productId
    }
  })
}

export const Create = params => {
  return axios.request({
    url: INSPECT_URL_PREFIX + 'inspect',
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
    url: INSPECT_URL_PREFIX + 'inspect',
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
    url: INSPECT_URL_PREFIX + 'inspect/' + params.resourceName,
    method: 'delete',
    params: {
      productId: params.productId
    }
  })
}

export const Action = params => {
  return axios.request({
    url: INSPECT_URL_PREFIX + 'inspectAction/' + params.resourceName,
    method: 'get',
    params: {
      productId: params.productId
    }
  })
}

export const Time = params => {
  return axios.request({
    url: INSPECT_URL_PREFIX + 'inspectTime/' + params.resourceName,
    method: 'get',
    params: {
      productId: params.productId
    }
  })
}

export const Event = params => {
  return axios.request({
    url: INSPECT_URL_PREFIX + 'inspectEvent/' + params.resourceName,
    method: 'get',
    params: {
      productId: params.productId,
      time: params.time
    }
  })
}
