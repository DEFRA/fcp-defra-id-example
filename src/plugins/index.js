import Inert from '@hapi/inert'
import Crumb from '@hapi/crumb'
import Bell from '@hapi/bell'
import Cookie from '@hapi/cookie'
import Scooter from '@hapi/scooter'
import csp from './content-security-policy.js'
import headers from './headers.js'
import auth from './auth.js'
import session from './session.js'
import logging from './logging.js'
import errors from './errors.js'
import views from './views.js'
import router from './router.js'
import sso from './sso.js'

async function registerPlugins (server) {
  const plugins = [
    Inert,
    Crumb,
    Bell,
    Cookie,
    Scooter,
    csp,
    auth,
    session,
    logging,
    errors,
    headers,
    views,
    router,
    sso
  ]

  await server.register(plugins)
}

export { registerPlugins }
