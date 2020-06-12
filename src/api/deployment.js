import { axios } from '../libs/api.new.request'
import { K8S_URL_PREFIX } from '../../config/conf'
import { formatTimestamp } from '@/api/tools'
/** ********************************** Controller **************************************************/
/*
1、获取指定Namespace下Controller

Request

GET http://10.55.30.23:8080/kubernetes/api/v1.10/controller/deployment?namespace=default&productId=2012110217554623
GET http://10.55.30.23:8080/kubernetes/api/v1.10/controller/daemonset?namespace=default&productId=2012110217554623
GET http://10.55.30.23:8080/kubernetes/api/v1.10/controller/statefulset?namespace=default&productId=2012110217554623

*/

export const getControllerInfo = (params) => {
  return axios.request({
    url: K8S_URL_PREFIX + 'controller/' + params.setName,
    method: 'get',
    params: {
      productId: 100
      // namespace: params.namespace
    }
  })
}

export const getControllerInfoIstio = (params) => {
  return axios.request({
    url: K8S_URL_PREFIX + 'controller/' + params.setName,
    method: 'get',
    params: {
      productId: 100,
      namespace: 'istio-system'
    }
  })
}

/*
2、获取指定Namespace下指定Controller

Request

GET http://10.55.30.23:8080/kubernetes/api/v1.10/controller/deployment/nginx01?namespace=default&productId=2012110217554623
GET http://10.55.30.23:8080/kubernetes/api/v1.10/controller/daemonset/nginx02?namespace=default&productId=2012110217554623
GET http://10.55.30.23:8080/kubernetes/api/v1.10/controller/statefulset/nginx03?namespace=default&productId=2012110217554623

*/

export const getOneControllerInfo = (params) => {
  return axios.request({
    url: K8S_URL_PREFIX + 'controller/' + params.setName + '/' + params.ctrl,
    method: 'get',
    params: {
      productId: params.productId
      // namespace: params.namespace
    }
  })
}

/*
3、修改或者添加Controller Label

PATCH /kubernetes/api/v1.10/controller/deployment/patch/nginx01?namespace=default&productId=2012110217554623
PATCH /kubernetes/api/v1.10/controller/daemonset/patch/nginx02?namespace=default&productId=2012110217554623
PATCH /kubernetes/api/v1.10/controller/statefulset/patch/nginx03?namespace=default&productId=2012110217554623

PATCH Body application/json
{
    'patches': [
        {
            'op': 'add',
            'path': '/metadata/labels/group',
            'value': 'nginx'
        }
    ]
}

*/

export const optControllerLabel = (params) => {
  return axios.request({
    url: K8S_URL_PREFIX + 'controller/' + params.setName + '/patch/' + params.controllerName,
    method: 'patch',
    params: {
      productId: params.productId
      // namespace: params.namespace
    },
    data:
    {
      'patches': [
        {
          'op': params.option,
          'path': '/metadata/labels/' + params.key,
          'value': params.val
        }
      ]
    }
  })
}

/*
4、删除Controller Label
PATCH /kubernetes/api/v1.10/controller/deployment/patch/nginx01?namespace=default&productId=2012110217554623
PATCH /kubernetes/api/v1.10/controller/daemonset/patch/nginx02?namespace=default&productId=2012110217554623
PATCH /kubernetes/api/v1.10/controller/statefulset/patch/nginx03?namespace=default&productId=2012110217554623

PATCH Body application/json
{
    'patches': [
        {
            'op': 'remove',
            'path': '/metadata/labels/group'
        }
    ]
}
*/

export const delControllerLabel = (params) => {
  return axios.request({
    url: K8S_URL_PREFIX + 'controller/' + params.setName + '/patch/' + params.controllerName,
    method: 'patch',
    params: {
      productId: params.productId
    },
    data:
    {
      'patches': [
        {
          'op': 'remove',
          'path': '/metadata/labels/' + params.controllerLabel
        }
      ]
    }
  })
}

/*
5、通过Controller 的uid获取对应的ReplicaSet

Request
GET http://10.55.30.23:8080/kubernetes/api/v1.10/replicaset?uid=e171cb58-afdd-11e8-b5a3-68b599bd0ef4&productId=2012110217554623&namespace=default

*/
export const getReplicasetOfCtrl = (params) => {
  return axios.request({
    url: K8S_URL_PREFIX + 'replicaset',
    method: 'get',
    params: {
      productId: params.productId,
      // namespace: params.namespace,
      uid: params.uid
    }
  })
}

/*
5.5、获取指定的ReplicaSet

Request
GET /kubernetes/api/v1.10/replicaset/nginx01-5474b557db?productId=2012110217554623&namespace=default&cluster=c_52589714754D

*/
export const getOneReplicaset = (params) => {
  return axios.request({
    url: K8S_URL_PREFIX + 'replicaset/' + params.replicaset,
    method: 'get',
    params: {
      productId: params.productId
      // namespace: params.namespace
    }
  })
}

/*
6、通过Controller HPA的uid获取对应的Event

Request
GET http://10.55.30.23:8080/kubernetes/api/v1.10/event?uid=e171cb58-afdd-11e8-b5a3-68b599bd0ef4&productId=2012110217554623&namespace=default

*/
export const getEventOfCtrl = (params) => {
  return axios.request({
    url: K8S_URL_PREFIX + 'event',
    method: 'get',
    params: {
      productId: params.productId,
      // namespace: params.namespace,
      uid: params.uid
    }
  })
}

/*
7、更新 Deployment

PUT /kubernetes/api/v1.10/controller/deployment?namespace=default&productId=2012110217554623

*/
export const updateController = (params) => {
  return axios.request({
    url: K8S_URL_PREFIX + 'controller/' + params.setName,
    method: 'put',
    params: {
      // namespace: params.namespace,
      productId: params.productId,
      postType: params.postType
    },
    data: params.updateJson
  })
}

/*
8、获取指定Namespace指定Cluster下指定hpa列表
Request
GET/kubernetes/api/v1.10/hpa?productId=100&namespace=default&cluster=c_52146557583k&kind=Deployment&name=nginx06
*/

export const getHpaOfCtrl = (params) => {
  return axios.request({
    url: K8S_URL_PREFIX + 'hpa',
    method: 'get',
    params: {
      kind: params.kind,
      name: params.ctrl,
      productId: params.productId
      // namespace: params.namespace
    }
  })
}

/*
9、创建Controller  通过在kind的传递类型，可以创建不同的Controller

Request
POST /kubernetes/api/v1.10/controller?productId=100&namespace=default&cluster=c_39946798573X
*/

export const createController = (params) => {
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
    url: K8S_URL_PREFIX + 'controller',
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

export const formCreateController = params => {
  let postData = {}
  let dataType = {}
  postData = JSON.parse(params.yaml)
  dataType['type'] = 'json'

  let req = {
    url: K8S_URL_PREFIX + 'controller',
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

/*
10、删除指定产品下指定Controller

Request
DELETE /kubernetes/api/v1.10/controller/deployment/nginx01?namespace=default&productId=2012110217554623&cluster=c_52589714754D
DELETE /kubernetes/api/v1.10/controller/daemonset/nginx02?namespace=default&productId=2012110217554623&cluster=c_52589714754D
DELETE /kubernetes/api/v1.10/controller/statefulset/nginx03?namespace=default&productId=2012110217554623&cluster=c_52589714754D
*/
export const deleteController = (params) => {
  return axios.request({
    url: K8S_URL_PREFIX + 'controller/' + params.setName + '/' + params.ctrl,
    method: 'delete',
    params: {
      productId: params.productId,
      uid: params.uid
      // namespace: params.namespace
    }
  })
}

/*
11、伸缩 Controller

Request
PATCH /kubernetes/api/v1.10/controller/deployment/nginx01?namespace=default&productId=2012110217554623&cluster=c_52589714754D
PATCH /kubernetes/api/v1.10/controller/daemonset/nginx02?namespace=default&productId=2012110217554623&cluster=c_52589714754D
PATCH /kubernetes/api/v1.10/controller/statefulset/nginx03?namespace=default&productId=2012110217554623&cluster=c_52589714754D

PATCH Body application/json
{
    'patches': [
        {
            'op': 'replace',
            'path': '/spec/replicas',
            'value': 3                                 // 一定要是整形
        }
    ]
}

*/
export const scaleController = (params) => {
  return axios.request({
    url: K8S_URL_PREFIX + 'controller/' + params.setName + '/patch/' + params.ctrl,
    method: 'patch',
    params: {
      productId: params.productId
    },
    data:
    {
      'patches': [
        {
          'op': 'replace',
          'path': '/spec/replicas',
          'value': params.scale
        }
      ]
    }
  })
}

/*
刪除指定的ReplicaSet

Request
DELETE {{dev_url}}/kubernetes/api/v1.10/replicaset/nginx-666865c466?productId=100&namespace=default&cluster={{cluster}}
*/
export const deleteReplicaset = (params) => {
  return axios.request({
    url: K8S_URL_PREFIX + 'replicaset/' + params.replicasetName,
    method: 'delete',
    params: {
      productId: params.productId
      // namespace: params.namespace
    }
  })
}

/*
通过Controller获取Pod
Request
GET/kubernetes/api/v1.10/hpa?productId=100&namespace=default&cluster=c_52146557583k&kind=deployment&name=nginx06
*/

export const listPodByController = (params) => {
  return axios.request({
    url: K8S_URL_PREFIX + 'listPodByController/' + params.setName + '/' + params.ctrl,
    method: 'get',
    params: {
      productId: params.productId
      // namespace: params.namespace
    }
  })
}

/*
获取deployment Chart
Request
GET /kubernetes/api/v1.10/deploymentChart/nginx?productId=2012110217554623&namespace=default&cluster={{cluster}}
*/

export const getDeploymentChartData = params => {
  return axios.request({
    url: K8S_URL_PREFIX + 'controllerChart/' + params.setName + '/' + params.ctrl,
    method: 'get',
    params: {
      productId: params.productId
    }
  })
}

/** ********************************** HPA **************************************************/

/* 1、创建HPA

Request
POST /kubernetes/api/v1.10/hpa?namespace=default&productId=2012110217554623&cluster=c_52146557583k
*/

export const createHPA = (params) => {
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
    url: K8S_URL_PREFIX + 'hpa',
    method: 'post',
    params: {
      productId: params.productId,
      ...dataType
    },
    data: postData
  }
  return axios.request(req)
}

export const formCreateHPA = (params) => {
  let postData = {}
  let dataType = {}
  postData = JSON.parse(params.yaml)
  dataType['type'] = 'json'

  let req = {
    url: K8S_URL_PREFIX + 'hpa',
    method: 'post',
    params: {
      productId: params.productId,
      ...dataType
    },
    data: postData
  }
  return axios.request(req)
}

/* 2、更新HPA

Request
PUT  /kubernetes/api/v1.10/hpa?productId=2012110217554623&namespace=default&cluster=test
*/
export const updateHPA = (params) => {
  return axios.request({
    url: K8S_URL_PREFIX + 'hpa',
    method: 'put',
    params: {
      // namespace: params.namespace,
      productId: params.productId
    },
    data: params.updateJson
  })
}

/*
3、获取指定Namespace指定Cluster下指定hpa

Request
GET /kubernetes/api/v1.10/hpa/nginx-alpine?productId=100&namespace=default&cluster=c_52146557583k
*/
export const getOneHpa = (params) => {
  return axios.request({
    url: K8S_URL_PREFIX + 'hpa/' + params.hpaName,
    method: 'get',
    params: {
      productId: params.productId
      // namespace: params.namespace
    }
  })
}

/*
4、删除指定Namespace指定Cluster下指定hpa

Request
GET /kubernetes/api/v1.10/hpa/nginx-alpine?productId=100&namespace=default&cluster=c_52146557583k
*/
export const deleteHPA = (params) => {
  return axios.request({
    url: K8S_URL_PREFIX + 'hpa/' + params.hpaName,
    method: 'delete',
    params: {
      productId: params.productId
      // namespace: params.namespace
    }
  })
}

/*
5、根据下deployment及kindName获取指定HPA

Request
GET /kubernetes/api/v1.10/hpa?productId=100&namespace=default&cluster=c_52146557583k&kind=deployment&kindName=nginx06
*/
export const getHpaByDeployment = (params) => {
  return axios.request({
    url: K8S_URL_PREFIX + 'hpa',
    method: 'get',
    params: {
      productId: params.productId,
      kind: params.kind,
      kindName: params.kindName
      // namespace: params.namespace
    }
  })
}

export const createTemplate = (params) => {
  return axios.request({
    url: K8S_URL_PREFIX + 'template/' + params.setName + '/' + params.ctrl,
    method: 'put',
    params: {
      productId: params.productId
    },
    data: {
      name: params.name,
      describe: params.describe
    }
  })
}

export const getNamespaceLabel = (params) => {
  return axios.request({
    url: K8S_URL_PREFIX + 'namespaceLabel/' + params.label,
    method: 'get',
    params: {
      productId: params.productId
    }
  })
}

export const restartController = (params) => {
  let timestamp = parseInt(new Date().getTime() / 1000)
  return axios.request({
    url: K8S_URL_PREFIX + 'controller/' + params.setName + '/patch/' + params.ctrl,
    method: 'patch',
    params: {
      productId: params.productId
    },
    data: {
      'patches': [
        {
          'op': 'add',
          'path': '/spec/template/metadata/annotations/kingfihser.io~1restartedAt',
          'value': formatTimestamp(timestamp)
        }
      ]
    }
  })
}
