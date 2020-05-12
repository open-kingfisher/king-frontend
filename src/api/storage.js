import { axios } from '../libs/api.new.request'
import { K8S_URL_PREFIX } from '../../config/conf'

/** ******************************PVC****************************************************** */
/*
1、获取指定Namespace下PVC
Request
GET /kubernetes/api/v1.10/pvc?namespace=default&productId=2012110217554623&cluster=c_52589714754D
*/

export const getAllPVC = params => {
  return axios.request({
    url: K8S_URL_PREFIX + 'pvc',
    method: 'get',
    params: {
      productId: params.productId
    }
  })
}

/*
2、获取指定Namespace下指定PVC

Request
GET /kubernetes/api/v1.10/pvc/block-pvc?productId=100&namespace=default&cluster=c_52589714754D

*/
export const getOnePVC = params => {
  return axios.request({
    url: K8S_URL_PREFIX + 'pvc/' + params.pvcName,
    method: 'get',
    params: {
      productId: params.productId
    }
  })
}

/*
3、删除指定产品下指定PVC

Request
DELETE /kubernetes/api/v1.10/pvc/test-pvc?namespace=default&productId=2012110217554623&cluster=c_52589714754D

*/

export const deletePVC = params => {
  return axios.request({
    url: K8S_URL_PREFIX + 'pvc/' + params.pvcName,
    method: 'delete',
    params: {
      productId: params.productId
    }
  })
}

/*
4、更新PVC  注：暂时没有发现可以修改的地方，PUT 信息仅供测试

Request
PUT /kubernetes/api/v1.10/pvc?namespace=default&productId=2012110217554623&cluster=c_52589714754D

*/

export const updatePVC = params => {
  return axios.request({
    url: K8S_URL_PREFIX + 'pvc',
    method: 'put',
    params: {
      productId: params.productId
    },
    data: params.updateJson
  })
}

/* 4.5 创建PVC
Request
POST /kubernetes/api/v1.10/pvc?namespace=default&productId=2012110217554623&cluster=c_52589714754D
*/
export const createPVC = params => {
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
    url: K8S_URL_PREFIX + 'pvc',
    method: 'post',
    params: {
      productId: params.productId,
      ...dataType
    },
    data: postData

  }
  return axios.request(req)
}

/** ******************************PV****************************************************** */

/*
5、获取指定Cluster下PV

Request
GET /kubernetes/api/v1.10/pv?productId=2012110217554623&cluster=c_52589714754D
*/

export const getAllPV = params => {
  return axios.request({
    url: K8S_URL_PREFIX + 'pv',
    method: 'get',
    params: {
      productId: params.productId
    }
  })
}

/*
6、获取指定Cluster下指定PV

Request
GET /kubernetes/api/v1.10/pv/block-pv?productId=100&cluster=c_52589714754D

*/
export const getOnePV = params => {
  return axios.request({
    url: K8S_URL_PREFIX + 'pv/' + params.pvName,
    method: 'get',
    params: {
      productId: params.productId
    }
  })
}

/*
7、删除指定PV

Request
DELETE /kubernetes/api/v1.10/pv/test-pv?productId=2012110217554623&cluster=c_52589714754D

*/

export const deletePV = params => {
  return axios.request({
    url: K8S_URL_PREFIX + 'pv/' + params.pvName,
    method: 'delete',
    params: {
      productId: params.productId
    }
  })
}

/*
8、更新PV

Request
PUT /kubernetes/api/v1.10/pv?productId=2012110217554623&cluster=c_52589714754D

*/

export const updatePV = params => {
  return axios.request({
    url: K8S_URL_PREFIX + 'pv',
    method: 'put',
    params: {
      productId: params.productId
    },
    data: params.updateJson
  })
}

/* 8.5 创建PV
Request
POST /kubernetes/api/v1.10/pv?productId=2012110217554623&cluster=cluster=c_52589714754D
*/
export const createPV = params => {
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
    url: K8S_URL_PREFIX + 'pv',
    method: 'post',
    params: {
      productId: params.productId,
      ...dataType
    },
    data: postData

  }
  return axios.request(req)
}

/** ******************************Storage Classes************************************************* */
/*
9、获取指定Cluster下Storage Classes

Request
GET /kubernetes/api/v1.10/sc?productId=2012110217554623&cluster=c_52589714754D
*/

export const getAllSC = params => {
  return axios.request({
    url: K8S_URL_PREFIX + 'sc',
    method: 'get',
    params: {
      productId: params.productId
    }
  })
}

/*
10、获取指定Cluster下指定Storage classes

Request
GET /kubernetes/api/v1.10/sc/rbd?productId=100&cluster=c_52589714754D

*/
export const getOneSC = params => {
  return axios.request({
    url: K8S_URL_PREFIX + 'sc/' + params.scName,
    method: 'get',
    params: {
      productId: params.productId
    }
  })
}

/*
11、删除指定Storage classes

Request
DELETE /kubernetes/api/v1.10/sc/test-rbd?productId=2012110217554623&cluster=c_52589714754D
*/

export const deleteSC = params => {
  return axios.request({
    url: K8S_URL_PREFIX + 'sc/' + params.scName,
    method: 'delete',
    params: {
      productId: params.productId
    }
  })
}

/*
12、更新Storage classes

Request
PUT /kubernetes/api/v1.10/sc?productId=2012110217554623&cluster=c_52589714754D

*/

export const updateSC = params => {
  return axios.request({
    url: K8S_URL_PREFIX + 'sc',
    method: 'put',
    params: {
      productId: params.productId
    },
    data: params.updateJson
  })
}

/*
12.5、创建Storage classes
Request
POST /kubernetes/api/v1.10/sc?productId=2012110217554623&cluster=cluster=c_52589714754D
*/
export const createSC = params => {
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
    url: K8S_URL_PREFIX + 'sc',
    method: 'post',
    params: {
      productId: params.productId,
      ...dataType
    },
    data: postData
  }
  return axios.request(req)
}
