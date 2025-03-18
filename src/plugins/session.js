import Yar from '@hapi/yar'
import config from '../config.js'

const plugin = {
  plugin: Yar,
  options: {
    storeBlank: false,
    maxCookieSize: 0,
    cache: {
      cache: config.get('cache.name'),
      segment: `${config.get('cache.segment')}-temp`
    },
    cookieOptions: {
      password: config.get('cookie.password'),
      isSecure: !config.get('isDev')
    }
  }
}

export default plugin
