import env from './env'

export const PRO_URL = 'http://kingfisher.com'

export const DEV_URL = 'http://192.168.138.128:9090'

export default env === 'development' ? DEV_URL : PRO_URL
