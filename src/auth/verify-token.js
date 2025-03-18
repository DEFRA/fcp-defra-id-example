import Wreck from '@hapi/wreck'
import Jwt from '@hapi/jwt'
import jwkToPem from 'jwk-to-pem'
import { getOidcConfig } from './get-oidc-config.js'

async function verifyToken (token) {
  const { jwks_uri: uri } = await getOidcConfig()
  const { payload } = await Wreck.get(uri, {
    json: true
  })
  const { keys } = payload
  const pem = jwkToPem(keys[0])
  const decoded = Jwt.token.decode(token)
  Jwt.token.verify(decoded, { key: pem, algorithm: 'RS256' })
}

export { verifyToken }
