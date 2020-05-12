import { baseAxios } from '../libs/api.new.request'
import { KF_URL_PREFIX } from '../../config/conf'

export const List = params => {
  return baseAxios.request({
    url: KF_URL_PREFIX + 'platformRole',
    method: 'get'
  })
}

export const Get = params => {
  return baseAxios.request({
    url: KF_URL_PREFIX + 'platformRole/' + params.resourceName,
    method: 'get',
    params: {
      productId: params.productId
    }
  })
}

export const Create = params => {
  return baseAxios.request({
    url: KF_URL_PREFIX + 'platformRole',
    method: 'post',
    data: {
      name: params.name,
      describe: params.describe,
      access: params.access
    }
  })
}

export const Update = params => {
  return baseAxios.request({
    url: KF_URL_PREFIX + 'platformRole',
    method: 'put',
    data: {
      id: params.id,
      name: params.name,
      describe: params.describe,
      access: params.access
    }
  })
}

export const Delete = params => {
  return baseAxios.request({
    url: KF_URL_PREFIX + 'platformRole/' + params.resourceName,
    method: 'delete',
    params: {
      productId: params.productId
    }
  })
}

export const Tree = params => {
  return baseAxios.request({
    url: KF_URL_PREFIX + 'platformRoleTree',
    method: 'get'
  })
}
