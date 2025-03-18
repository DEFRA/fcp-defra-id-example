import { getPermissions } from '../auth/get-permissions.js'
import { getSignOutUrl } from '../auth/get-sign-out-url.js'
import { validateState } from '../auth/state.js'
import { verifyToken } from '../auth/verify-token.js'

const routes = [{
  method: 'GET',
  path: '/auth/sign-in',
  options: {
    auth: 'defra-id'
  },
  handler: async function (request, h) {
    return h.redirect('/home')
  }
}, {
  method: 'GET',
  path: '/auth/sign-in-oidc',
  options: {
    auth: 'defra-id'
  },
  handler: async function (request, h) {
    if (request.auth.isAuthenticated) {
      const { profile, token, refreshToken } = request.auth.credentials
      // verify token returned from Defra Identity against public key
      await verifyToken(token)
      const { role, scope } = await getPermissions(profile.crn, profile.organisationId, profile.token)
      await request.server.app.cache.set(profile.sessionId, {
        isAuthenticated: true,
        ...profile,
        role,
        scope,
        token,
        refreshToken
      })

      request.cookieAuth.set({ sessionId: profile.sessionId })

      const redirect = request.yar.get('redirect') ?? '/home'
      request.yar.clear('redirect')
      return h.redirect(redirect)
    }
    return h.redirect('/')
  }
}, {
  method: 'GET',
  path: '/auth/sign-out',
  handler: async function (request, h) {
    const signOutUrl = await getSignOutUrl(request, request.auth.credentials.token)
    return h.redirect(signOutUrl)
  }
}, {
  method: 'GET',
  path: '/auth/sign-out-oidc',
  options: {
    auth: false
  },
  handler: async function (request, h) {
    if (request.auth.isAuthenticated) {
      await request.server.app.cache.drop(request.auth.credentials?.sessionId)
      request.cookieAuth.clear()
    }
    validateState(request, request.query.state)
    return h.redirect('/')
  }
}, {
  method: 'GET',
  path: '/auth/organisation',
  options: {
    auth: 'defra-id'
  },
  handler: async function (request, h) {
    const redirect = request.yar.get('redirect') ?? '/home'
    request.yar.clear('redirect')
    return h.redirect(redirect)
  }
}]

export default routes
