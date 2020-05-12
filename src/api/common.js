import { axios } from '../libs/api.new.request'
import { K8S_URL_PREFIX } from '../../config/conf'

/*
1、获取指定资源的Event
Request
GET /kubernetes/api/v1.10/event?uid=nginx&kind=Ingress&productId=2012110217554623&namespace=default
*/

export const getEvent = (params) => {
  return axios.request({
    url: K8S_URL_PREFIX + 'event',
    method: 'get',
    params: {
      uid: params.uid,
      kind: params.kind,
      productId: params.productId,
      namespace: params.namespaceName,
      cluster: params.cluster
    }
  })
}
