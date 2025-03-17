import Inert from '@hapi/inert'
import Crumb from '@hapi/crumb'
import logging from './logging.js'
import errors from './errors.js'
import views from './views.js'
import router from './router.js'

async function registerPlugins (server) {
  const plugins = [
    Inert,
    Crumb,
    logging,
    errors,
    views,
    router
  ]

  await server.register(plugins)
}

export { registerPlugins }
