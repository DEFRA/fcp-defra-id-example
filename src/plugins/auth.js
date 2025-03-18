import Jwt from '@hapi/jwt'
import { getOidcConfig } from '../auth/get-oidc-config.js'
import config from '../config.js'

const plugin = {
  plugin: {
    name: 'auth',
    register: async (server) => {
      const oidcConfig = await getOidcConfig()

      server.auth.strategy('defra-id', 'bell', {
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
              name: `${payload.firstName} ${payload.lastName}`,
              organisationId: payload.currentRelationshipId
            }
          }
        },
        location: function (request) {
          // If request includes a redirect query parameter, store it in the session to allow redirection after authentication
          if (request.query.redirect) {
            request.yar.set('redirect', request.query.redirect)
          }

          return config.get('defraId.redirectUrl')
        },
        clientId: config.get('defraId.clientId'),
        clientSecret: config.get('defraId.clientSecret'),
        providerParams: function (request) {
          const params = {
            serviceId: config.get('defraId.serviceId'),
            p: config.get('defraId.policy'),
            response_mode: 'query'
          }

          // If user intends to switch organisation, force Defra Identity to display the organisation selection screen
          if (request.path === '/auth/switch-organisation') {
            params.forceReselection = true
          }

          // If user has already selected an organisation in another service, pass the organisation Id to force Defra Id to skip the organisation selection screen
          if (request.query.organisationId) {
            params.relationshipId = request.query.organisationId
          }

          return params
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
        redirectTo: function (request) {
          return `/auth/sign-in?redirect=${request.url.pathname}`
        },
        validate: async function (request, session) {
          // TODO: handle expired session
          const userSession = await request.server.app.cache.get(session.sessionId)
          if (userSession) {
            return { isValid: true, credentials: userSession }
          }
          return { isValid: false }
        }
      })

      server.auth.default('session')
    }
  }
}

export default plugin
