import { getPermissions } from '../auth/get-permissions.js'

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
      const { role, scope } = await getPermissions(profile.crn, profile.organisationId, profile.token)
      console.log(role, scope)
      await request.server.app.cache.set(profile.sessionId, {
        isAuthenticated: true,
        ...profile,
        role,
        scope,
        token,
        refreshToken
      })

      request.cookieAuth.set({ sessionId: profile.sessionId })

      // TODO: handle redirect
      return h.redirect('/home')
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
}]

export default routes
