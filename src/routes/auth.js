import { getPermissions } from '../auth/get-permissions.js'
import { getSignOutUrl } from '../auth/get-sign-out-url.js'
import { validateState } from '../auth/state.js'
import { verifyToken } from '../auth/verify-token.js'
import { getSafeRedirect } from '../utils/get-safe-redirect.js'

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
    auth: { strategy: 'defra-id', mode: 'try' }
  },
  handler: async function (request, h) {
    if (request.auth.isAuthenticated) {
      const { profile, token, refreshToken } = request.auth.credentials
      // verify token returned from Defra Identity against public key
      await verifyToken(token)

      // Typically permissions for the selected organisation would be available in the `roles` property of the token
      // However, when signing in with RPA credentials, the roles only include the role name and not the permissions
      // Therefore, we need to make additional API calls to get the permissions from Siti Agri
      // These calls are authenticated using the token returned from Defra Identity
      const { role, scope } = await getPermissions(profile.crn, profile.organisationId, profile.token)

      // Store token and all useful data in the session cache
      await request.server.app.cache.set(profile.sessionId, {
        isAuthenticated: true,
        ...profile,
        role,
        scope,
        token,
        refreshToken
      })

      // Create a new session using cookie authentication strategy which is used for all subsequent requests
      request.cookieAuth.set({ sessionId: profile.sessionId })

      // Redirect user to the page they were trying to access before signing in or to the home page if no redirect was set
      const redirect = request.yar.get('redirect') ?? '/home'
      request.yar.clear('redirect')
      // Ensure redirect is a relative path to prevent redirect attacks
      const safeRedirect = getSafeRedirect(redirect)
      return h.redirect(safeRedirect)
    }

    // If the user is not authenticated, redirect to the home page
    // This should only occur if the user tries to access the sign-in page directly and not part of the sign-in flow
    // eg if the user has bookmarked the Defra Identity sign-in page or they have signed out and tried to go back in the browser
    return h.view('unauthorised')
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
    auth: { mode: 'try' }
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
    // Ensure redirect is a relative path to prevent redirect attacks
    const safeRedirect = getSafeRedirect(redirect)
    return h.redirect(safeRedirect)
  }
}]

export default routes
