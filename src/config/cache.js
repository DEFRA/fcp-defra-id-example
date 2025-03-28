import convict from 'convict'
import convictFormatWithValidator from 'convict-format-with-validator'

convict.addFormats(convictFormatWithValidator)

const config = convict({
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
  },
  segment: {
    doc: 'The cache segment.',
    format: String,
    default: 'session'
  },
  ttl: {
    doc: 'The cache TTL.',
    format: Number,
    default: 1000 * 60 * 60 * 24,
    env: 'REDIS_TTL'
  }
})

config.validate({ allowed: 'strict' })

export default config
