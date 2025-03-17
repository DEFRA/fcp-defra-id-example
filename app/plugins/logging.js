import HapiPino from 'hapi-pino'

const logging = {
  plugin: HapiPino,
  options: {
    logPayload: true,
    level: 'warn'
  }
}

export default logging
