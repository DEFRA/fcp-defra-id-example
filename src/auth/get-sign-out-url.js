import { getOidcConfig } from './get-oidc-config.js'
import { createState } from './state.js'
import config from '../config.js'

async function getSignOutUrl (request, token) {
  const { end_session_endpoint: url } = await getOidcConfig()
  const state = createState(request)

  const query = [
    `post_logout_redirect_uri=${config.get('defraId.signOutRedirectUrl')}`,
    `id_token_hint=${token}`,
    `state=${state}`
  ].join('&')
  return encodeURI(`${url}?${query}`)
}

export { getSignOutUrl }
