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
      const { profile } = request.auth.credentials
      await request.server.app.cache.set(profile.sessionId, {
        ...profile,
        isAuthenticated: true,
        token: request.auth.credentials.token,
        refreshToken: request.auth.credentials.refreshToken
      })

      request.cookieAuth.set({ sessionId: profile.sessionId })

      // TODO: handle redirect
      return h.redirect('/home')
    }
    return h.redirect('/')
  }
}]

export default routes
