import logging from './logging.js'
import router from './router.js'

async function registerPlugins (server) {
  const plugins = [
    logging,
    router
  ]

  await server.register(plugins)
}

export { registerPlugins }
