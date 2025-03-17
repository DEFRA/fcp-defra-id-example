import HapiPino from 'hapi-pino'

const logging = {
  plugin: HapiPino,
  options: {
    level: 'warn'
  }
}

export default logging
