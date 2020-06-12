import { axios } from '../libs/api.new.request'
import { K8S_URL_PREFIX } from '../../config/conf'

/*
1、获取指定Namespace下Service

Request
GET /kubernetes/api/v1.10/service?namespace=default&productId=2012110217554623&cluster=c_52589714754D
*/

export const getAllService = params => {
  return axios.request({
    url: K8S_URL_PREFIX + 'service',
    method: 'get'
  })
}

/*
2、获取指定Namespace下指定Service

Request
GET /kubernetes/api/v1.10/service/kubernetes?productId=2012110217554623&namespace=default&cluster=c_52589714754D
*/

export const getOneService = params => {
  return axios.request({
    url: K8S_URL_PREFIX + 'service/' + params.serviceName,
    method: 'get',
    params: {
      productId: params.productId
    }
  })
}

/*
3、创建Service

Service 4种类型

ClusterIP      //默认，内部
NodePort    // 外部，需要指定nodePort 参数，不指定随机分配 30000~32767
LoadBalancer  //使用云提供商的负载均衡器在外部公开服务
ExternalName // 通过Name导出提供外部服务

Request
POST /kubernetes/api/v1.10/service?namespace=default&productId=2012110217554623&cluster=c_52589714754D
*/

export const createService = params => {
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
    url: K8S_URL_PREFIX + 'service',
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

export const formCreateService = params => {
  let postData = {}
  let dataType = {}
  postData = JSON.parse(params.yaml)
  dataType['type'] = 'json'

  let req = {
    url: K8S_URL_PREFIX + 'service',
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
4、更新Service

Request
PUT /kubernetes/api/v1.10/service?namespace=default&productId=2012110217554623&cluster=c_52589714754D

*/
export const updateService = params => {
  return axios.request({
    url: K8S_URL_PREFIX + 'service',
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
5、删除指定产品下指定Service

Request
DELETE /kubernetes/api/v1.10/service/nginx?namespace=default&productId=2012110217554623&cluster=c_52589714754D

 */

export const deleteService = params => {
  return axios.request({
    url: K8S_URL_PREFIX + 'service/' + params.serviceName,
    method: 'delete',
    params: {
      productId: params.productId
    }
  })
}

/*
6、获取指定Namespace指定Cluster下Ingress

Request
GET /kubernetes/api/v1.10/ingress?productId=2012110217554623&namespace=default&cluster=test
*/

export const getAllIngress = params => {
  return axios.request({
    url: K8S_URL_PREFIX + 'ingress',
    method: 'get',
    params: {
      productId: params.productId
    }
  })
}

/*
7、获取指定Namespace指定Cluster下指定Ingress

Request
GET /kubernetes/api/v1.10/ingress/test-ingress?productId=2012110217554623&namespace=default&cluster=test
*/

export const getOneIngress = params => {
  return axios.request({
    url: K8S_URL_PREFIX + 'ingress/' + params.ingressName,
    method: 'get',
    params: {
      productId: params.productId
    }
  })
}

/*
8、创建Ingress

Request
POST /kubernetes/api/v1.10/ingress?productId=2012110217554623&namespace=default&cluster=test
*/

export const createIngress = params => {
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
    url: K8S_URL_PREFIX + 'ingress',
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

export const formCreateIngress = params => {
  let postData = {}
  let dataType = {}
  postData = JSON.parse(params.yaml)
  dataType['type'] = 'json'

  let req = {
    url: K8S_URL_PREFIX + 'ingress',
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
9、更新Ingress

Request
PUT  /kubernetes/api/v1.10/ingress?productId=2012110217554623&namespace=default&cluster=test

*/
export const updateIngress = params => {
  return axios.request({
    url: K8S_URL_PREFIX + 'ingress',
    method: 'put',
    params: {
      productId: params.productId,
      postType: params.postType
    },
    data: params.updateJson
  })
}

/*
5、删除指定产品下指定Ingress

Request
DELETE /kubernetes/api/v1.10/ingress/test-ingress?productId=2012110217554623&namespace=default&cluster=test

 */

export const deleteIngress = params => {
  return axios.request({
    url: K8S_URL_PREFIX + 'ingress/' + params.ingressName,
    method: 'delete',
    params: {
      productId: params.productId
    }
  })
}

/*
6、PATCH更新Ingress

Request
PATCH  /kubernetes/api/v1.10/ingress/patch/test-ingress?productId=2012110217554623&namespace=default&cluster=test

POST Body application/json
{
    "patches": [
        {
            "op": "replace",
            "path": "/spec/rules/0/http/paths/0/path",
            "value": "/testpath/a/b/c"
        }
    ]
}
*/
export const patchIngress = params => {
  return axios.request({
    url: K8S_URL_PREFIX + 'ingress/patch/' + params.ingressName,
    method: 'patch',
    params: {
      productId: params.productId
    },
    data: {
      patches: params.patchJson
    }
  })
}

/*
7、获取ingress Chart
Request
GET /kubernetes/api/v1.10/ingressChart/nginx?productId=2012110217554623&namespace=default&cluster={{cluster}}
*/

export const getIngressChartData = params => {
  return axios.request({
    url: K8S_URL_PREFIX + 'ingressChart/' + params.ingressName,
    method: 'get',
    params: {
      productId: params.productId
    }
  })
}

/*
8、通过Service获取Pod信息
Request
GET /kubernetes/api/v1.10/listPodByService/nginx-app03?productId=100&cluster={{cluster}}
*/

export const listPodByService = (params) => {
  return axios.request({
    url: K8S_URL_PREFIX + 'listPodByService/' + params.name,
    method: 'get',
    params: {
      productId: params.productId
    }
  })
}
export const endpointList = (params) => {
  return axios.request({
    url: K8S_URL_PREFIX + 'endpoint/' + params.name,
    method: 'get',
    params: {
      productId: params.productId
    }
  })
}
