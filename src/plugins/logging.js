import HapiPino from 'hapi-pino'
import config from '../config/index.js'

const logging = {
  plugin: HapiPino,
  options: {
    level: config.get('isDev') ? 'info' : 'warn'
  }
}

export default logging
