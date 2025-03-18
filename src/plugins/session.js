import Yar from '@hapi/yar'
import config from '../config.js'

// Yar is a session management plugin for hapi.js that allows you to store session data in a cookie
// Yar is used to store temporary session data not dependent on the user's authentication status
// such as state values used to prevent CSRF attacks and redirect URLs
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
