import path from 'path'
import { fileURLToPath } from 'url'
import nunjucks from 'nunjucks'
import Vision from '@hapi/vision'
import config from '../config.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const plugin = {
  plugin: Vision,
  options: {
    engines: {
      njk: {
        compile: (src, options) => {
          const template = nunjucks.compile(src, options.environment)

          return (context) => {
            return template.render(context)
          }
        },
        prepare: (options, next) => {
          options.compileOptions.environment = nunjucks.configure([
            path.join(options.relativeTo || process.cwd(), options.path),
            'node_modules/govuk-frontend/dist'
          ], {
            autoescape: true,
            watch: config.get('isDev')
          })

          return next()
        }
      }
    },
    path: '../views',
    relativeTo: __dirname,
    isCached: !config.get('isDev'),
    context: async function (request) {
      const auth = await request.server.app.cache.get(request.auth.credentials.sessionId)
      return {
        auth
      }
    }
  }
}

export default plugin
