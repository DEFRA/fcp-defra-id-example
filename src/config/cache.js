import convict from 'convict'

const config = convict({
  name: {
    doc: 'The cache name.',
    format: String,
    default: 'redis'
  },
  host: {
    doc: 'The Redis cache host.',
    format: String,
    default: null,
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
    default: process.env.NODE_ENV === 'production' ? null : undefined,
    env: 'REDIS_PASSWORD'
  },
  tls: {
    doc: 'True if the Redis cache is using TLS.',
    format: Object,
    default: process.env.NODE_ENV === 'production' ? {} : undefined
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
