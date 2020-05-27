import { axios, baseAxios } from '../libs/api.new.request'
import { K8S_URL_PREFIX, KF_URL_PREFIX } from '../../config/conf'

/** ***********cluster******************* */

/*
1、获取指定产品线下Cluster

Request
GET /kingfisher/api/v1.10/cluster?productId=2012110217554623

*/

export const getAllCluster = params => {
  return baseAxios.request({
    url: KF_URL_PREFIX + 'cluster',
    method: 'get',
    params: {
      productId: params.productId
    }
  })
}

/*
2、获取指定产品线下指定cluster

Request
GET /kingfisher/api/v1.10/cluster/c_52146557583k?productId=2012110217554623

*/

export const getOneCluster = params => {
  return baseAxios.request({
    url: KF_URL_PREFIX + 'cluster/' + params.clusterId,
    method: 'get',
    params: {
      productId: params.productId
    }
  })
}

/*
3、删除指定产品下指定Cluster

Request
DELETE /kingfisher/api/v1.10/cluster/c_16582881708S?productId=2012110217554623
*/

export const delOneCluster = params => {
  return baseAxios.request({
    url: KF_URL_PREFIX + 'cluster/' + params.clusterId,
    method: 'delete',
    params: {
      productId: params.productId
    }
  })
}

/*
4、创建Cluster

Request
POST /kingfisher/api/v1.10/cluster?productId=2012110217554623
*/
export const createCluster = params => {
  return baseAxios.request({
    url: KF_URL_PREFIX + 'cluster',
    method: 'post',
    data: params.formData,
    params: {
      productId: params.productId
    }
  })
}

/*
5、更新Cluster

Request
PUT /kingfisher/api/v1.10/cluster?cluster=c_55684711693A&productId=2012110217554623

form-data
kub_config        上传获取
name: xd-cluster
describe: XXXX
token: b99a00.a144ef80536d4344
ca_hash: sha256:f40b3d7652fab456ed2693edd75c9f2478b2bc2c07c7f0ef36e78a9e70f94771
product : ["2012110217554623"."2012110217554623"]
*/

export const updateCluster = params => {
  return baseAxios.request({
    url: KF_URL_PREFIX + 'cluster',
    method: 'put',
    data: params.formData,
    params: {
      productId: params.productId,
      cluster: params.cluster
    }
  })
}

/** ***********audit******************* */

/*
6、获取审计日志

Request
GET /kingfisher/api/v1.10/audit
*/
export const getAuditLog = params => {
  return baseAxios.request({
    url: KF_URL_PREFIX + 'audit',
    method: 'get'
  })
}

/** ***********Namespace******************* */

/*
7、获取指定产品线、指定集群下所有Namespace

Request
GET /kingfisher/api/v1.10/namespace?productId=2012110217554623&cluster=c_39946798573X
*/
export const getAllNamespace = params => {
  return baseAxios.request({
    url: K8S_URL_PREFIX + 'namespace',
    method: 'get',
    params: {
      productId: params.productId,
      cluster: params.clusterId
    }
  })
}

/*
8、 获取指定产品下指定Namespace

Request
GET /kingfisher/api/v1.10/namespace/development?productId=2012110217554623
*/
export const getOneNamespace = params => {
  return axios.request({
    url: K8S_URL_PREFIX + 'namespace/' + params.namespaceName,
    method: 'get',
    params: {
      productId: params.productId,
      cluster: params.clusterId
    }
  })
}

/*
9、删除Namespace

Request
DELETE /kingfisher/api/v1.10/namespace/test01?cluster=c_39946798573X
*/
export const delOneNamespace = params => {
  return baseAxios.request({
    url: K8S_URL_PREFIX + 'namespace/' + params.namespaceName,
    method: 'delete',
    params: {
      cluster: params.clusterId
    }
  })
}

export const getAllNamespaceByCluster = params => {
  return baseAxios.request({
    url: K8S_URL_PREFIX + 'namespaceAll',
    method: 'get',
    params: {
      productId: params.productId,
      cluster: params.clusterId
    }
  })
}

/*
9.5、更新Namespace

Request
DELETE /kingfisher/api/v1.10/namespace/test01?cluster=c_39946798573X
*/

/*
10、创建Namespace

Request
POST /kingfisher/api/v1.10/namespace?cluster=c_39946798573X

POST Body application/json
{
    "apiVersion": "v1",
    "kind": "Namespace",
    "metadata": {
        "name": "development"
    }
}
*/

export const createNamespace = params => {
  let postData = {}
  postData = JSON.parse(params.yaml)
  return axios.request({
    url: K8S_URL_PREFIX + 'namespace',
    method: 'post',
    params: {
      cluster: params.clusterId,
      type: 'json',
      exist: params.exist
    },
    data: postData
  })
}

export const updateNamespace = params => {
  return axios.request({
    url: K8S_URL_PREFIX + 'namespace',
    method: 'put',
    params: {
      cluster: params.clusterId
    },
    data: params.updateJson
  })
}

/* limit */
export const getOneLimitRange = params => {
  return axios.request({
    url: K8S_URL_PREFIX + 'limitrange',
    method: 'get',
    params: {
      productId: params.productId,
      cluster: params.clusterId,
      namespace: params.namespaceName
    }
  })
}

export const formCreateLimitRange = params => {
  console.log(JSON.parse(params.yaml))
  let req = {
    url: K8S_URL_PREFIX + 'limitrange',
    method: 'post',
    params: {
      productId: params.productId,
      type: 'json',
      cluster: params.clusterId,
      namespace: params.namespaceName
    },
    data: JSON.parse(params.yaml)
  }
  return axios.request(req)
}

export const updateLimitRange = params => {
  return axios.request({
    url: K8S_URL_PREFIX + 'limitrange',
    method: 'put',
    params: {
      cluster: params.clusterId,
      namespace: params.namespaceName,
      productId: params.productId
    },
    data: params.updateJson
  })
}

export const delLimitRange = params => {
  return axios.request({
    url: K8S_URL_PREFIX + 'limitrange/' + params.resource,
    method: 'delete',
    params: {
      productId: params.productId,
      namespace: params.namespaceName,
      cluster: params.clusterId
    }
  })
}

/* resource quota */
export const getOneQuota = params => {
  return axios.request({
    url: K8S_URL_PREFIX + 'resourcequota',
    method: 'get',
    params: {
      productId: params.productId,
      cluster: params.clusterId,
      namespace: params.namespaceName
    }
  })
}

export const formCreateQuota = params => {
  let req = {
    url: K8S_URL_PREFIX + 'resourcequota',
    method: 'post',
    params: {
      productId: params.productId,
      type: 'json',
      cluster: params.clusterId,
      namespace: params.namespaceName
    },
    data: JSON.parse(params.yaml)
  }
  return axios.request(req)
}

export const updateQuota = params => {
  return axios.request({
    url: K8S_URL_PREFIX + 'resourcequota',
    method: 'put',
    params: {
      cluster: params.clusterId,
      namespace: params.namespaceName,
      productId: params.productId
    },
    data: params.updateJson
  })
}

export const delQuota = params => {
  return axios.request({
    url: K8S_URL_PREFIX + 'resourcequota/' + params.resource,
    method: 'delete',
    params: {
      productId: params.productId,
      cluster: params.clusterId,
      namespace: params.namespaceName
    }
  })
}

/** ***********产品线******************* */

/*
11、获取公司所有产品线

Request
GET /kingfisher/api/v1.10/producttree
 */
export const getAllProducts = () => {
  return axios.request({
    url: KF_URL_PREFIX + 'producttree',
    method: 'get'
  })
}

/*
12、产品线绑定cluster 及 namespace

Request
POST /kingfisher/api/v1.10/product

POST Body application/json
{
    "id": "2018061213105691",
    "cluster":
        [
            "c_39946798573X",
            "c_39946798573d"
        ],
    "namespace":
        [
            "n_10583087773O",
            "n_3894283643yj"
        ]
}
 */

export const bindProductLine = params => {
  return axios.request({
    url: KF_URL_PREFIX + 'product',
    method: 'post',
    data: params
  })
}

/*
13、获取KingFisher所有产品线

Request
GET /kingfisher/api/v1.10/product
 */
export const getKingfisherProducts = () => {
  return axios.request({
    url: KF_URL_PREFIX + 'product',
    method: 'get'
  })
}

/*
14、删除指定产品线
Request
DELETE /kingfisher/api/v1.10/product/2018061213105691
 */

export const delOneProduct = params => {
  return axios.request({
    url: KF_URL_PREFIX + 'product/' + params.productId,
    method: 'delete'
  })
}

/*
15、更新product

Request
PUT /kingfisher/api/v1.10/product

POST Body application/json
{
    "id": "2018061213105691",
    "cluster":
        [
            "c_39946798573X"
        ],
    "namespace":
        [
            "n_10583087773O",
            "n_3894283643yj"
        ]
}
*/
export const updateProductLine = params => {
  return axios.request({
    url: KF_URL_PREFIX + 'product',
    method: 'put',
    data: params
  })
}

/*
15、获取KingFisher指定产品线

Request
GET /kingfisher/api/v1.10/product/2012110217554623
 */
export const getKingfisherProduct = params => {
  return axios.request({
    url: KF_URL_PREFIX + 'product/' + params.productId,
    method: 'get'
  })
}

/** ***********User******************* */

/*
1、获取所有User

Request
GET /kingfisher/api/v1.10/user

Response
HTTP/1.1 200 OK
Content-Type: application/json
{
    "code": 200,
    "data": [
        {
            "id": "u_2900429483K",
            "name": "user",
            "realName": "Tom",
            "mail": "user@staff.example.com.cn",
            "mobile": "13900000789",
            "product": null,
            "role": null
        }
    ],
    "msg": ""
}
*/
export const getAllUser = params => {
  return axios.request({
    url: KF_URL_PREFIX + 'user',
    method: 'get'
  })
}

/*
2、获取指定User

Request
GET /kingfisher/api/v1.10/user/u_2900429483K

Response
HTTP/1.1 200 OK
Content-Type: application/json

{
    "code": 200,
    "data": {
        "id": "u_2900429483K",
        "name": "user",
        "realName": "Tom",
        "mail": "user@staff.jjj",
        "mobile": "13900000789",
        "product": null,
        "role": null
    },
    "msg": ""
}
*/
export const getOneUser = params => {
  return axios.request({
    url: KF_URL_PREFIX + 'user/' + params.userId,
    method: 'get'
  })
}

/*
3、删除指定User

Request
DELETE /kingfisher/api/v1.10/user/u_28721785963Y

*/
export const deleteUser = params => {
  return axios.request({
    url: KF_URL_PREFIX + 'user/' + params.userId,
    method: 'delete'
  })
}

/*
4、创建User

Request
POST /kingfisher/api/v1.10/user

POST Body application/json
{
    "mail": "user@staff.example.com.cn",
    "mobile": "13900000789",
    "realName": "Tom",
    "name": "user",
    "telephoneNumber": "9390",
    "prodcut": [],
    "role": []
}
*/
export const createUser = params => {
  return axios.request({
    url: KF_URL_PREFIX + 'user',
    method: 'post',
    data: params
  })
}

/*
5、更新User

Request
PUT  /kingfisher/api/v1.10/user?id=u_2900429483K

PUT Body application/json
{
    "mail": "user@staff.jjj",
    "mobile": "13900000789",
    "realName": "Tom",
    "name": "user",
    "telephoneNumber": "9390",
    "product": [],
    "role": []
}

*/

export const updateUser = params => {
  return axios.request({
    url: KF_URL_PREFIX + 'user',
    method: 'put',
    params: {
      id: params.userId
    },
    data: params
  })
}

export const changePassword = params => {
  return axios.request({
    url: KF_URL_PREFIX + 'changePassword',
    method: 'put',
    data: params
  })
}

/*

User lookup

1、通过传递用户名，查找用户信息

Request
GET /kingfisher/api/v1.10/userlookup?username=user

{
    "code": 200,
    "data": {
        "mail": "user@staff.example.com.cn",
        "mobile": "13900000789",
        "name": "Tom",
        "telephoneNumber": "9390"
    },
    "msg": ""
}
*/

export const userLookup = params => {
  return axios.request({
    url: KF_URL_PREFIX + 'userlookup',
    method: 'get',
    params: {
      username: params.username
    }
  })
}

/*
获取树型Cluster与Namespace的关系

Request
GET /kingfisher/api/v1.10/treeClusterNamespace
*/
export const getTreeClusterNamespace = params => {
  return axios.request({
    url: KF_URL_PREFIX + 'treeClusterNamespace',
    method: 'get',
    params: {
      productId: params.productId
    }
  })
}

export const Tree = params => {
  return baseAxios.request({
    url: KF_URL_PREFIX + 'cascadeAll',
    method: 'get'
  })
}

// 认证模式
export const userAuthMode = params => {
  return axios.request({
    url: KF_URL_PREFIX + 'userAuthMode',
    method: 'get',
    params: {}
  })
}
