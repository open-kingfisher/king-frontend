import { axios } from '../libs/api.new.request'
import { KF_URL_PREFIX } from '../../config/conf'

export const Get = params => {
  return axios.request({
    url: KF_URL_PREFIX + 'menu',
    method: 'get',
    params: {
      productId: params.productId,
      cluster: params.cluster
    }
  })
}
