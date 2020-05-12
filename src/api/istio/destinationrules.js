import { axios } from '../../libs/api.new.request'
import { ISTIO_URL_PREFIX } from '../../../config/conf'

export const List = params => {
  return axios.request({
    url: ISTIO_URL_PREFIX + 'destinationRules',
    method: 'get'
  })
}

export const Get = params => {
  return axios.request({
    url: ISTIO_URL_PREFIX + 'destinationRules/' + params.resourceName,
    method: 'get',
    params: {
      productId: params.productId
    }
  })
}

export const Create = params => {
  let postData = {}
  let dataType = {}
  if (params.yaml[1] === '{') {
    postData = JSON.parse(params.yaml)
    dataType['type'] = 'json'
  } else {
    postData = { context: JSON.parse(params.yaml) }
    dataType['type'] = 'yaml'
  }

  let req = {
    url: ISTIO_URL_PREFIX + 'destinationRules',
    method: 'post',
    params: {
      productId: params.productId,
      postType: 'yaml',
      ...dataType
    },
    data: postData

  }
  return axios.request(req)
}

export const formCreate = params => {
  let postData = {}
  let dataType = {}
  postData = JSON.parse(params.yaml)
  dataType['type'] = 'json'

  let req = {
    url: ISTIO_URL_PREFIX + 'destinationRules',
    method: 'post',
    params: {
      productId: params.productId,
      postType: 'form',
      ...dataType
    },
    data: postData
  }
  return axios.request(req)
}

export const Update = params => {
  return axios.request({
    url: ISTIO_URL_PREFIX + 'destinationRules',
    method: 'put',
    params: {
      productId: params.productId,
      postType: params.postType
    },
    data: params.updateJson
  })
}

export const Delete = params => {
  return axios.request({
    url: ISTIO_URL_PREFIX + 'destinationRules/' + params.resourceName,
    method: 'delete',
    params: {
      productId: params.productId
    }
  })
}

export const Chart = params => {
  return axios.request({
    url: ISTIO_URL_PREFIX + 'destinationRulesChart/' + params.resourceName,
    method: 'get',
    params: {
      productId: params.productId
    }
  })
}
