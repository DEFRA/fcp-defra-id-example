import Jwt from '@hapi/jwt'
import { getOidcConfig } from '../auth/get-oidc-config.js'
import config from '../config.js'

const plugin = {
  plugin: {
    name: 'auth',
    register: async (server) => {
      const oidcConfig = await getOidcConfig()

      server.auth.strategy('defra-id', 'bell', {
        // TODO: get redirect URL
        // TODO: get scopes from Siti Agri
        provider: {
          name: 'defra-id',
          protocol: 'oauth2',
          useParamsAuth: true,
          auth: oidcConfig.authorization_endpoint,
          token: oidcConfig.token_endpoint,
          scope: ['openid', 'offline_access', config.get('defraId.clientId')],
          profile: async function (credentials, params, get) {
            const payload = Jwt.token.decode(credentials.token).decoded.payload

            credentials.profile = {
              ...payload,
              crn: payload.contactId,
              name: `${payload.firstName} ${payload.lastName}`
            // TODO: get person and organisation Ids from Crown Hosting
            }
          }
        },
        location: function () {
          return config.get('defraId.redirectUrl')
        },
        clientId: config.get('defraId.clientId'),
        clientSecret: config.get('defraId.clientSecret'),
        providerParams: {
          serviceId: config.get('defraId.serviceId'),
          p: config.get('defraId.policy'),
          response_mode: 'query'
        },
        password: config.get('cookie.password'),
        isSecure: !config.get('isDev')
      })

      server.auth.strategy('session', 'cookie', {
        cookie: {
          password: config.get('cookie.password'),
          path: '/',
          isSecure: !config.get('isDev')
        },
        validate: async function (request, session) {
          // TODO: handle expired session
          const userSession = await request.server.app.cache.get(session.sessionId)
          if (userSession) {
            return { isValid: true, credentials: session }
          }
          return { isValid: false }
        }
      })

      server.auth.default('session')
    }
  }
}

export default plugin
