import convict from 'convict'
import convictFormatWithValidator from 'convict-format-with-validator'

convict.addFormats(convictFormatWithValidator)

const config = convict({
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV'
  },
  isDev: {
    doc: 'True if the application is in development mode.',
    format: Boolean,
    default: process.env.NODE_ENV === 'development'
  },
  host: {
    doc: 'The host to bind.',
    format: 'ipaddress',
    default: '0.0.0.0',
    env: 'HOST'
  },
  port: {
    doc: 'The port to bind.',
    format: 'port',
    default: 3000,
    env: 'PORT',
    arg: 'port'
  },
  cache: {
    name: {
      doc: 'The cache name.',
      format: String,
      default: 'redis'
    },
    host: {
      doc: 'The Redis cache host.',
      format: String,
      default: '',
      env: 'REDIS_HOST'
    },
    port: {
      doc: 'The Redis cache port.',
      format: 'port',
      default: 6379,
      env: 'REDIS_PORT'
    },
    password: {
      doc: 'The Redis cache password.',
      format: String,
      default: '',
      env: 'REDIS_PASSWORD'
    },
    tls: {
      doc: 'True if the Redis cache is using TLS.',
      format: Object,
      default: process.env.REDIS_TLS === 'true' ? {} : undefined
    }
  }
})

config.validate({ allowed: 'strict' })

export default config
