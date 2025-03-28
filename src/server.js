import Hapi from '@hapi/hapi'
import Joi from 'joi'
import { Engine as CatboxRedis } from '@hapi/catbox-redis'
import { registerPlugins } from './plugins/index.js'
import config from './config/index.js'

async function createServer () {
  const server = Hapi.server({
    host: config.get('host'),
    port: config.get('port'),
    routes: {
      validate: {
        options: {
          abortEarly: false
        }
      }
    },
    router: {
      stripTrailingSlash: true
    },
    cache: [{
      name: config.get('cache.name'),
      provider: {
        constructor: CatboxRedis,
        options: {
          host: config.get('cache.host'),
          port: config.get('cache.port'),
          password: config.get('cache.password'),
          tls: config.get('cache.tls')
        }
      }
    }]
  })

  server.app.cache = server.cache({
    cache: config.get('cache.name'),
    segment: config.get('cache.segment'),
    expiresIn: config.get('cache.ttl')
  })

  server.validator(Joi)

  await registerPlugins(server)

  return server
}

export { createServer }
