import Inert from '@hapi/inert'
import Crumb from '@hapi/crumb'
import Bell from '@hapi/bell'
import Cookie from '@hapi/cookie'
import auth from './auth.js'
import session from './session.js'
import logging from './logging.js'
import errors from './errors.js'
import views from './views.js'
import router from './router.js'

async function registerPlugins (server) {
  const plugins = [
    Inert,
    Crumb,
    Bell,
    Cookie,
    auth,
    session,
    logging,
    errors,
    views,
    router
  ]

  await server.register(plugins)
}

export { registerPlugins }
