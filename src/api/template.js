import { baseAxios } from '../libs/api.new.request'
import { KF_URL_PREFIX } from '../../config/conf'

export const List = params => {
  return baseAxios.request({
    url: KF_URL_PREFIX + 'template',
    method: 'get'
  })
}

export const Get = params => {
  return baseAxios.request({
    url: KF_URL_PREFIX + 'template/' + params.resourceName,
    method: 'get',
    params: {
      productId: params.productId
    }
  })
}

export const Create = params => {
  return baseAxios.request({
    url: KF_URL_PREFIX + 'template',
    method: 'post',
    data: {
      name: params.name,
      describe: params.describe
    }
  })
}

export const Update = params => {
  return baseAxios.request({
    url: KF_URL_PREFIX + 'template',
    method: 'put',
    data: {
      id: params.id,
      name: params.name,
      describe: params.describe
    }
  })
}

export const Delete = params => {
  return baseAxios.request({
    url: KF_URL_PREFIX + 'template/' + params.resourceName,
    method: 'delete',
    params: {
      productId: params.productId
    }
  })
}
