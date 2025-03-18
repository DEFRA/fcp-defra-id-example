import Wreck from '@hapi/wreck'
import config from '../config.js'

async function getOidcConfig () {
  const { payload } = await Wreck.get(config.get('defraId.wellKnownUrl'), {
    json: true
  })

  return payload
}

export { getOidcConfig }
