import Jwt from '@hapi/jwt'
import { getOidcConfig } from '../auth/get-oidc-config.js'
import { refreshTokens } from '../auth/refresh-tokens.js'
import config from '../config.js'

const plugin = {
  plugin: {
    name: 'auth',
    register: async (server) => {
      const oidcConfig = await getOidcConfig()

      // Bell is a third-party plugin that provides a common interface for OAuth 2.0 authentication
      // Used to authenticate users with Defra Identity and a pre-requisite for the Cookie authentication strategy
      // Also used for changing organisations and signing out
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

            // Map all JWT properties to the credentials object so it can be stored in the session
            // Add some additional properties to the profile object for convenience
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
          if (request.path === '/auth/organisation') {
            params.forceReselection = true
            // If user has already selected an organisation in another service, pass the organisation Id to force Defra Id to skip the organisation selection screen
            if (request.query.organisationId) {
              params.relationshipId = request.query.organisationId
            }
          }

          return params
        },
        password: config.get('cookie.password'),
        isSecure: !config.get('isDev')
      })

      // Cookie is a built-in authentication strategy for hapi.js that authenticates users based on a session cookie
      // Used for all non-Defra Identity routes
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
          const userSession = await request.server.app.cache.get(session.sessionId)

          // verify Defra Identity token has not expired
          try {
            const decoded = Jwt.token.decode(userSession.token)
            Jwt.token.verifyTime(decoded)
          } catch (error) {
            if (!config.get('defraId.refreshTokens')) {
              return { isValid: false }
            }
            const { access_token: token, refresh_token: refreshToken } = await refreshTokens(userSession.refreshToken)
            userSession.token = token
            userSession.refreshToken = refreshToken
            await request.server.app.cache.set(session.sessionId, userSession)
          }

          // If session exists, set the user's details on the request object and allow the request to continue
          // Depending on the service, additional checks can be performed here
          if (userSession) {
            return { isValid: true, credentials: userSession }
          }
          return { isValid: false }
        }
      })

      // Set the default authentication strategy to session
      // All routes will require authentication unless explicitly set to 'defra-id' or `auth: false`
      server.auth.default('session')
    }
  }
}

export default plugin
