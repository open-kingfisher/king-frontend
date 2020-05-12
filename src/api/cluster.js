import { axios } from '../libs/api.new.request'
import { K8S_URL_PREFIX } from '../../config/conf'

/*
1、获取所有Node 信息
GET /kubernetes/api/v1.10/node?productId=2012110217554623
*/

export const getAllNodeData = (params) => {
  return axios.request({
    url: K8S_URL_PREFIX + 'nodes',
    method: 'get',
    params: params
  })
}

/*
2、修改或者添加Node Label
PATCH /kubernetes/api/v1.10/nodes/node01?productId=2012110217554623

PATCH Body application/json
{
    "patches": [
        {
            "op": "add",
            "path": "/metadata/labels/env",
            "value": "linux"
        }
    ]
}

*/

export const optNodeLabel = (params) => {
  return axios.request({
    url: K8S_URL_PREFIX + 'nodes/' + params.nodeName,
    method: 'patch',
    params: { productId: 100 },
    data:
      {
        'patches': [
          {
            'op': params.option,
            'path': '/metadata/labels/' + params.key.replace(/~/g, '~0').replace(/\//g, '~1'), /* ~ 需替换成~0 / 需替换成~1 */
            'value': params.val
          }
        ]
      }
  })
}

/*
3、删除Node Label
PATCH /kubernetes/api/v1.10/nodes/node01?productId=2012110217554623

PATCH Body application/json
{
    "patches": [
        {
            "op": "add",
            "path": "/metadata/labels/env",
            "value": "linux"
        }
    ]
}

*/

export const delNodeLabel = (params) => {
  return axios.request({
    url: K8S_URL_PREFIX + 'nodes/' + params.nodeName,
    method: 'patch',
    params: { productId: 100 },
    data:
      {
        'patches': [
          {
            'op': 'remove',
            'path': '/metadata/labels/' + params.nodeLabel.replace(/~/g, '~0').replace(/\//g, '~1')
          }
        ]
      }
  })
}

/*
4、获取某个Node 信息
Request
GET /kubernetes/api/v1.10/nodes/node01?productId=2012110217554623
*/

export const getOneNodeData = (params) => {
  return axios.request({
    url: K8S_URL_PREFIX + 'nodes/' + params.nodename,
    method: 'get',
    params: {
      productId: params.productId
    }
  })
}

/*
5、获取Node上的Pod信息
Request
GET /kubernetes/api/v1.10/listPodByNode/node02?productId=100&cluster={{cluster}}
*/

export const listPodByNode = (params) => {
  return axios.request({
    url: K8S_URL_PREFIX + 'listPodByNode/' + params.nodename,
    method: 'get',
    params: {
      productId: params.productId,
      namespace: null
    }
  })
}

/*
6、删除指定产品下指定Pod
Request
DELETE /kubernetes/api/v1.10/pod/nginx-85f9748c8-ghqhj?namespace=default&productId=2012110217554623&cluster=c_52589714754D
*/

export const delPod = (params) => {
  return axios.request({
    url: K8S_URL_PREFIX + 'pod/' + params.podName,
    method: 'delete',
    params: {
      productId: params.productId,
      namespace: params.namespaceName,
      cluster: params.cluster
    }
  })
}

/*
6、删除指定产品下指定Pod
Request
PATCH /kubernetes/api/v1.10/pod/evict/nginx-85f9748c8-ghqhj?namespace=default&productId=2012110217554623&cluster=c_52589714754D
*/

export const evictPod = (params) => {
  return axios.request({
    url: K8S_URL_PREFIX + 'pod/evict/' + params.podName,
    method: 'patch',
    params: {
      productId: params.productId,
      namespace: params.namespaceName,
      cluster: params.cluster
    }
  })
}

/*
7、停止/恢复调度
Request
PATCH /kubernetes/api/v1.10/nodes/node02?productId=100&cluster={{cluster}}
PATCH Body application/json
{
    "patches": [
        {
            "op": "add",
            "path": "/spec/unschedulable",
            "value": true
        }
    ]
}
*/

export const schedulable = (params) => {
  return axios.request({
    url: K8S_URL_PREFIX + 'nodes/' + params.nodename,
    method: 'patch',
    params: {
      productId: params.productId,
      cluster: params.cluster
    },
    data:
      {
        'patches': [
          {
            'op': 'add',
            'path': '/spec/unschedulable',
            'value': params.val
          }
        ]
      }
  })
}
/*
9、获取node的metric
Request
GET /kubernetes/api/v1.10/nodeMetric/node02?productId=2012110217554623&namespace=default
*/

export const getNodeMetricOther = (params) => {
  return axios.request({
    url: K8S_URL_PREFIX + 'nodeMetric/' + params.nodename,
    method: 'get',
    params: {
      productId: params.productId,
      cluster: params.cluster,
      namespace: null
    }
  })
}

/*
9、获取node的metric
Request
PUT /kubernetes/api/v1.10/nodes/node02?productId=2012110217554623&namespace=default
*/

export const updateNodes = (params) => {
  return axios.request({
    url: K8S_URL_PREFIX + 'nodes/' + params.nodename,
    method: 'put',
    params: {
      productId: params.productId,
      cluster: params.cluster,
      namespace: null
    },
    data: params.updateJson
  })
}

export const getNodeMetric = (params) => {
  return axios.request({
    url: K8S_URL_PREFIX + 'metrics/node/' + params.nodename,
    method: 'get',
    params: {
      productId: params.productId,
      cluster: params.cluster,
      namespace: null
    }
  })
}

export const delNode = (params) => {
  return axios.request({
    url: K8S_URL_PREFIX + 'nodes/' + params.nodeName,
    method: 'delete',
    params: {
      productId: params.productId
    }
  })
}
