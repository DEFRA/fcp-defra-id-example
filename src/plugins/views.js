import path from 'path'
import { fileURLToPath } from 'url'
import nunjucks from 'nunjucks'
import Vision from '@hapi/vision'
import config from '../config/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default {
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
          const nunjucksEnv = nunjucks.configure([
            path.join(options.relativeTo, options.path),
            'node_modules/govuk-frontend/dist'
          ], {
            autoescape: true,
            watch: config.get('isDev')
          })

          nunjucksEnv.addGlobal('govukRebrand', true)

          options.compileOptions.environment = nunjucksEnv

          return next()
        }
      }
    },
    path: '../views',
    relativeTo: __dirname,
    isCached: !config.get('isDev'),
    context: async function (request) {
      const context = request.response.source?.context || {}
      // If the user is authenticated, add the user's details to the view context
      // This allows the view to display the user's session details and the ability to conditionally render content
      if (!request.auth.isAuthenticated || !request.auth.credentials?.sessionId) {
        return context
      }

      try {
        const auth = await request.server.app.cache.get(request.auth.credentials.sessionId)
        return {
          ...context,
          auth
        }
      } catch (error) {
        // If cache lookup fails, return context without auth to prevent circular errors
        request.log(['warn', 'views'], `Failed to get auth from cache: ${error.message}`)
        return context
      }
    }
  }
}
