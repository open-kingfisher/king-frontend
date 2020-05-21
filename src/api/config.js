import { baseAxios } from '../libs/api.new.request'
import { KF_URL_PREFIX } from '../../config/conf'

export const List = params => {
  return baseAxios.request({
    url: KF_URL_PREFIX + 'config',
    method: 'get'
  })
}

export const Get = params => {
  return baseAxios.request({
    url: KF_URL_PREFIX + 'config/' + params.resourceName,
    method: 'get',
    params: {
      productId: params.productId
    }
  })
}

export const Create = params => {
  return baseAxios.request({
    url: KF_URL_PREFIX + 'config?configType=' + params.configType,
    method: 'post',
    data: {
      ldap: params.ldap
    }
  })
}

export const Test = params => {
  return baseAxios.request({
    url: KF_URL_PREFIX + 'ldap/test?configType=' + params.configType,
    method: 'post',
    data: {
      ldap: params.ldap
    }
  })
}
