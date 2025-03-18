import Wreck from '@hapi/wreck'
import { getOidcConfig } from './get-oidc-config.js'
import config from '../config.js'

async function refreshTokens (refreshToken) {
  const { token_endpoint: url } = await getOidcConfig()

  const query = [
    `client_id=${config.get('defraId.clientId')}`,
    `client_secret=${config.get('defraId.clientSecret')}`,
    'grant_type=refresh_token',
    `scope=openid offline_access ${config.get('defraId.clientId')}`,
    `refresh_token=${refreshToken}`,
    `redirect_uri=${config.get('defraId.redirectUrl')}`
  ].join('&')

  const { payload } = await Wreck.post(`${url}?${query}`, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    json: true
  })

  return payload
}

export { refreshTokens }
