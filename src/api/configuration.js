import { axios } from '../libs/api.new.request'
import { K8S_URL_PREFIX } from '../../config/conf'

/** *************************************Config Map************************************************ */

/*
1、获取指定Namespace下ConfigMap
Request
GET /kubernetes/api/v1.10/configmap?namespace=default&productId=2012110217554623&cluster=c_52589714754D
*/

export const getAllConfMap = params => {
  return axios.request({
    url: K8S_URL_PREFIX + 'configmap',
    method: 'get',
    params: {
      productId: params.productId
      // namespace: params.namespace
    }
  })
}

/*
2、 获取指定Namespace下指定ConfigMap
Request
GET /kubernetes/api/v1.10/configmap/config01?productId=2012110217554623&namespace=default&cluster=c_52589714754D

*/
export const getOneConfMap = params => {
  return axios.request({
    url: K8S_URL_PREFIX + 'configmap/' + params.confmap,
    method: 'get',
    params: {
      productId: 100
      // namespace: params.namespace
    }
  })
}

/*
3、更新ConfigMap

Request
PUT /kubernetes/api/v1.10/configmap?namespace=default&productId=2012110217554623&cluster=c_52589714754D

*/

export const updateConfMap = params => {
  return axios.request({
    url: K8S_URL_PREFIX + 'configmap',
    method: 'put',
    params: {
      namespace: params.namespace,
      productId: params.productId,
      type: 'json'
    },
    data: {
      metadata: {
        name: params.mapname
      },
      data: params.createJson
    }
  })
}

/*
4、创建ConfigMap

Request
POST /kubernetes/api/v1.10/configmap?namespace=default&productId=2012110217554623
POST Body application/json
{
    "metadata": {
        "name": "config01",
        "namespace": "default"
    },
    "data": {
        "password": "admin",
        "username": "12345"
    }
}
*/
export const createConfMap = params => {
  return axios.request({
    url: K8S_URL_PREFIX + 'configmap',
    method: 'post',
    params: {
      namespace: params.namespace,
      productId: params.productId,
      type: 'json'
    },
    data: {
      metadata: {
        name: params.mapname
      },
      data: params.createJson
    }
  })
}

/*
5、删除指定产品下指定ConfigMap

Request
DELETE /kubernetes/api/v1.10/configmap/config01?namespace=default&productId=2012110217554623&cluster=c_52589714754D

*/

export const deleteConfMap = params => {
  return axios.request({
    url: K8S_URL_PREFIX + 'configmap/' + params.confmap,
    method: 'delete',
    params: {
      // namespace: 'default',
      productId: params.productId
      // cluster: params.clusterId
    }
  })
}

/** ****************************************Secret************************************************ */
/*
6、获取指定Namespace下Secret

Request
GET /kubernetes/api/v1.10/secret?namespace=default&productId=2012110217554623&cluster=c_52589714754D

*/

export const getAllSecret = params => {
  return axios.request({
    url: K8S_URL_PREFIX + 'secret',
    method: 'get',
    params: {
      // namespace: params.namespace,
      productId: params.productId
      // cluster: params.clusterId
    }
  })
}

/*
7、 获取指定Namespace下指定secret

Request
GET /kubernetes/api/v1.10/secret/mysecret?productId=2012110217554623&namespace=default&cluster=c_52589714754D

*/
export const getOneSecret = params => {
  return axios.request({
    url: K8S_URL_PREFIX + 'secret/' + params.secret,
    method: 'get',
    params: {
      productId: 100
      // namespace: params.namespace,
      // cluster: params.clusterId
    }
  })
}

/*
8、更新Secret
Request
PUT /kubernetes/api/v1.10/secret?namespace=default&productId=2012110217554623&cluster=c_52589714754D
*/

export const updateSecret = params => {
  return axios.request({
    url: K8S_URL_PREFIX + 'secret',
    method: 'put',
    params: {
      // namespace: params.namespace,
      productId: params.productId
    },
    data: params.updateJson

    // data: {
    //   metadata: params.updateJson.metadata,
    //   stringData: params.updateJson.data,
    //   type: params.updateJson.data.type
    // }

  })
}

/*
9、删除指定产品下指定Secret

Request
DELETE /kubernetes/api/v1.10/secret/mysecret?namespace=default&productId=2012110217554623&cluster=c_52589714754D
*/

export const deleteSecret = params => {
  return axios.request({
    url: K8S_URL_PREFIX + 'secret/' + params.secretName,
    method: 'delete',
    params: {
      // namespace: params.namespace,
      productId: params.productId
      // cluster: params.clusterId
    }
  })
}

/*
10、创建Secret

Request
POST /kubernetes/api/v1.10/secret?namespace=default&productId=2012110217554623&cluster=c_52589714754D

POST Body application/json
{
    "metadata":
    {
            "name": "mysecret10",
            "namespace": "default"
    },
    "stringData": {                                                      //一定要用stringData 明文会采用base64进行加密
            "password": "admin",
            "username": "12345"
    },
    "type": "Opaque"

}
*/
// export const createSecret = params => {
//   return axios.request({
//     url: K8S_URL_PREFIX + 'secret',
//     method: 'post',
//     params: {
//       productId: params.productId,
//       namespace: params.namespace,
//       type: 'json'
//     },
//     data: {
//       metadata: {
//         name: params.secretName
//       },
//       stringData: params.createJson,
//       type: 'Opaque'
//     }
//   })
// }

export const createSecret = params => {
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
    url: K8S_URL_PREFIX + 'secret',
    method: 'post',
    params: {
      productId: params.productId,
      ...dataType
    },
    data: postData

  }
  return axios.request(req)
}

/** ***********************************Service Account************************************************ */
/* 11、获取指定Namespace指定Cluster下ServiceAccount
Request
GET /kubernetes/api/v1.10/serviceaccount?productId=100&namespace=default&cluster=c_52146557583k
*/
export const getAllSrvAccount = params => {
  return axios.request({
    url: K8S_URL_PREFIX + 'serviceaccount',
    method: 'get',
    params: {
      productId: params.productId
    }
  })
}

/* 12、获取指定Namespace指定Cluster下指定ServiceAccount
Request
GET /kubernetes/api/v1.10/serviceaccount/default?productId=100&namespace=default&cluster=c_52146557583k
*/
export const getOneSrvAccount = params => {
  return axios.request({
    url: K8S_URL_PREFIX + 'serviceaccount/' + params.srvAccount,
    method: 'get',
    params: {
      productId: params.productId
    }
  })
}

/* 13、更新Service Account
Request
PUT /kubernetes/api/v1.10/serviceaccount?namespace=default&productId=2012110217554623&cluster=c_52146557583k

PUT Body application/json
{
    "metadata": {
        "labels": {
             "k8s-app": "test-account"
        },
        "name": "test-service-account01",
        "namespace": "default"
    }
}
*/
export const updateSrvAccount = params => {
  return axios.request({
    url: K8S_URL_PREFIX + 'serviceaccount',
    method: 'put',
    params: {
      productId: params.productId
    },
    data: params.updateJson
  })
}

/* 14、删除Service Account
Request
DELETE /kubernetes/api/v1.10/serviceaccount/test-service-account01?namespace=default&productId=2012110217554623&cluster=c_52146557583k
*/
export const deleteSrvAccount = params => {
  return axios.request({
    url: K8S_URL_PREFIX + 'serviceaccount/' + params.srvAccount,
    method: 'delete',
    params: {
      productId: params.productId
    }
  })
}

/* 15、创建Service Account

Request
POST /kubernetes/api/v1.10/serviceaccount?namespace=default&productId=2012110217554623&cluster=c_52146557583k

POST Body application/json
{
    "metadata": {
        "name": "test-service-account01",
        "namespace": "default"
    }
}
*/
export const createSrvAccount = params => {
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
    url: K8S_URL_PREFIX + 'serviceaccount',
    method: 'post',
    params: {
      productId: params.productId,
      ...dataType
    },
    data: postData

  }
  return axios.request(req)
}
