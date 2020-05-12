import { baseAxios } from '../libs/api.new.request'
import { K8S_URL_PREFIX } from '../../config/conf'

export const Get = params => {
  return baseAxios.request({
    url: K8S_URL_PREFIX + 'search/podip/' + params.resourceName,
    method: 'get',
    params: {
      productId: params.productId
    }
  })
}
