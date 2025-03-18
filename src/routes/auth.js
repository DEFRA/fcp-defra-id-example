import { getPermissions } from '../auth/get-permissions.js'
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
    // TODO: handle expiry
    if (request.auth.isAuthenticated) {
      const { profile, token, refreshToken } = request.auth.credentials
      // verify token returned from Defra Identity against public key
      try {
        await verifyToken(token)
      } catch (err) {
        console.error(err)
        return h.view('500')
      }
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
    // TODO: sign out of Defra Id as well as locally
    await request.server.app.cache.drop(request.auth.credentials.sessionId)
    request.cookieAuth.clear()
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
