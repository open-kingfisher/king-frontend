import { axios } from '../libs/api.new.request'
import { K8S_URL_PREFIX } from '../../config/conf'

/** ****************************** Role ****************************************************** */
/*
1、获取指定Namespace指定Cluster下Role

Request
GET /kubernetes/api/v1.10/role?productId=2012110217554623&namespace=default&cluster=test
*/

export const getAllRole = params => {
  return axios.request({
    url: K8S_URL_PREFIX + 'role',
    method: 'get',
    params: {
      productId: params.productId
    }
  })
}

/*
2、获取指定Namespace指定Cluster下指定Role

Request
GET /kubernetes/api/v1.10/role/system:controller:cloud-provider?productId=2012110217554623&namespace=default&cluster=c_52146557583k
*/

export const getOneRole = params => {
  return axios.request({
    url: K8S_URL_PREFIX + 'role/' + params.roleName,
    method: 'get',
    params: {
      productId: params.productId
    }
  })
}

/*
3、删除指定产品下指定Role

Request
DELETE /kubernetes/api/v1.10/role/test-role?productId=2012110217554623&namespace=default&cluster=c_52146557583k
*/

export const deleteRole = params => {
  return axios.request({
    url: K8S_URL_PREFIX + 'role/' + params.roleName,
    method: 'delete',
    params: {
      productId: params.productId
    }
  })
}

/*
4、更新Role

Request
PUT  /kubernetes/api/v1.10/role?productId=2012110217554623&namespace=default&cluster=c_52146557583k
*/

export const updateRole = params => {
  return axios.request({
    url: K8S_URL_PREFIX + 'role',
    method: 'put',
    params: {
      productId: params.productId
    },
    data: params.updateJson
  })
}

/*
5、创建Role

Request
PUT  /kubernetes/api/v1.10/role?productId=2012110217554623&namespace=default&cluster=c_52146557583k
*/

export const createRole = params => {
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
    url: K8S_URL_PREFIX + 'role',
    method: 'post',
    params: {
      productId: params.productId,
      ...dataType
    },
    data: postData

  }
  return axios.request(req)
}

/** ****************************** Cluster Role ************************************************ */
/*
1、指定Cluster下ClusterRole

Request
GET /kubernetes/api/v1.10/clusterrole?productId=2012110217554623&namespace=default&cluster=c_52146557583k
*/

export const getAllClusterRole = params => {
  return axios.request({
    url: K8S_URL_PREFIX + 'clusterrole',
    method: 'get',
    params: {
      productId: params.productId
    }
  })
}

/*
2、指定Cluster下指定ClusterRole

Request
GET /kubernetes/api/v1.10/clusterrole/view?productId=100&namespace=default&cluster=c_0883824493K
*/

export const getOneClusterRole = params => {
  return axios.request({
    url: K8S_URL_PREFIX + 'clusterrole/' + params.clusterRoleName,
    method: 'get',
    params: {
      productId: params.productId
    }
  })
}

/*
3、删除指定产品下指定ClusterRole

Request
DELETE /kubernetes/api/v1.10/clusterrole/test-role?productId=2012110217554623&namespace=default&cluster=c_0883824493K
*/

export const deleteClusterRole = params => {
  return axios.request({
    url: K8S_URL_PREFIX + 'clusterrole/' + params.clusterRoleName,
    method: 'delete',
    params: {
      productId: params.productId
    }
  })
}

/*
4、更新ClusterRole

Request
PUT  /kubernetes/api/v1.10/clusterrole?productId=2012110217554623&namespace=default&cluster=test
*/

export const updateClusterRole = params => {
  return axios.request({
    url: K8S_URL_PREFIX + 'clusterrole',
    method: 'put',
    params: {
      productId: params.productId
    },
    data: params.updateJson
  })
}

/*
5、创建ClusterRole

Request
POST /kubernetes/api/v1.10/clusterrole?productId=2012110217554623&namespace=default&cluster=c_0883824493K
*/

export const createClusterRole = params => {
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
    url: K8S_URL_PREFIX + 'clusterrole',
    method: 'post',
    params: {
      productId: params.productId,
      ...dataType
    },
    data: postData

  }
  return axios.request(req)
}

/** ****************************** Cluster Role Bind ******************************************** */
/*
1、获取指定Cluster下Cluster Role Bind

Request
GET /kubernetes/api/v1.10/bind/clusterrole?productId=100&cluster=c_52146557583k
*/

export const getAllClusterRBind = params => {
  return axios.request({
    url: K8S_URL_PREFIX + 'bind/clusterrole',
    method: 'get',
    params: {
      productId: params.productId
    }
  })
}

/*
2、获取指定Cluster下指定Cluster Role Bind

Request
GET /kubernetes/api/v1.10/bind/clusterrole/admin-user?productId=100&cluster=c_52146557583k
*/

export const getOneClusterRBind = params => {
  return axios.request({
    url: K8S_URL_PREFIX + 'bind/clusterrole/' + params.clusterRBindName,
    method: 'get',
    params: {
      productId: params.productId
    }
  })
}

/*
3、删除Cluster Role bind

Request
DELETE /kubernetes/api/v1.10/bind/clusterrole/test-cluster-role-bind01?productId=2012110217554623&cluster=c_52146557583k
*/

export const deleteClusterRBind = params => {
  return axios.request({
    url: K8S_URL_PREFIX + 'bind/clusterrole/' + params.clusterRBindName,
    method: 'delete',
    params: {
      productId: params.productId
    }
  })
}

/*
4、更新Cluster Role bind

Request
PUT  /kubernetes/api/v1.10/bind/clusterrole?productId=2012110217554623&cluster=c_52146557583k
*/

export const updateClusterRBind = params => {
  return axios.request({
    url: K8S_URL_PREFIX + 'bind/clusterrole',
    method: 'put',
    params: {
      productId: params.productId
    },
    data: params.updateJson
  })
}

/*
5、创建cluster Role bind

Request
POST /kubernetes/api/v1.10/bind/clusterrole?productId=2012110217554623&cluster=c_52146557583k
*/

export const createClusterRBind = params => {
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
    url: K8S_URL_PREFIX + 'bind/clusterrole',
    method: 'post',
    params: {
      productId: params.productId,
      ...dataType
    },
    data: postData

  }
  return axios.request(req)
}

/** ****************************** Role Bind ******************************************** */
/*
1、获取指定Namespace指定Cluster下Role Bind

Request
GET /kubernetes/api/v1.10/bind/role?productId=100&namespace=kube-system&cluster=c_52146557583k
*/

export const getAllRoleBind = params => {
  return axios.request({
    url: K8S_URL_PREFIX + 'bind/role',
    method: 'get',
    params: {
      productId: params.productId
    }
  })
}

/*
2、获取指定Namespace指定Cluster下指定Role Bind

Request
GET /kubernetes/api/v1.10/bind/role/kubernetes-dashboard-minimal?productId=100&namespace=kube-system&cluster=c_52146557583k
*/

export const getOneRoleBind = params => {
  return axios.request({
    url: K8S_URL_PREFIX + 'bind/role/' + params.roleBindName,
    method: 'get',
    params: {
      productId: params.productId
    }
  })
}

/*
3、删除Rolebind

Request
DELETE /kubernetes/api/v1.10/bind/role/jyp-rolebind?namespace=default&productId=2012110217554623&cluster=c_52146557583k
*/

export const deleteRoleBind = params => {
  return axios.request({
    url: K8S_URL_PREFIX + 'bind/role/' + params.roleBindName,
    method: 'delete',
    params: {
      productId: params.productId
    }
  })
}

/*
4、更新Rolebind

Request
PUT  /kubernetes/api/v1.10/bind/role?namespace=default&productId=2012110217554623&cluster=c_52146557583k
*/

export const updateRoleBind = params => {
  return axios.request({
    url: K8S_URL_PREFIX + 'bind/role',
    method: 'put',
    params: {
      productId: params.productId
    },
    data: params.updateJson
  })
}

/*
5、创建Rolebind

Request
POST /kubernetes/api/v1.10/bind/role?namespace=default&productId=2012110217554623&cluster=c_52146557583k
*/

export const createRoleBind = params => {
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
    url: K8S_URL_PREFIX + 'bind/role',
    method: 'post',
    params: {
      productId: params.productId,
      ...dataType
    },
    data: postData

  }
  return axios.request(req)
}
