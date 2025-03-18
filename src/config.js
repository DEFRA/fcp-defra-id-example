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
  },
  defraId: {
    wellKnownUrl: {
      doc: 'The Defra Identity well known URL.',
      format: String,
      default: null,
      env: 'DEFRA_ID_WELL_KNOWN_URL'
    },
    clientId: {
      doc: 'The Defra Identity client ID.',
      format: String,
      default: null,
      env: 'DEFRA_ID_CLIENT_ID'
    },
    clientSecret: {
      doc: 'The Defra Identity client secret.',
      format: String,
      default: null,
      env: 'DEFRA_ID_CLIENT_SECRET'
    },
    serviceId: {
      doc: 'The Defra Identity service ID.',
      format: String,
      default: null,
      env: 'DEFRA_ID_SERVICE_ID'
    },
    policy: {
      doc: 'The Defra Identity policy.',
      format: String,
      default: null,
      env: 'DEFRA_ID_POLICY'
    },
    redirectUrl: {
      doc: 'The Defra Identity redirect URl.',
      format: String,
      default: null,
      env: 'DEFRA_ID_REDIRECT_URL'
    },
    signOutRedirectUrl: {
      doc: 'The Defra Identity sign out redirect URl.',
      format: String,
      default: null,
      env: 'DEFRA_ID_SIGN_OUT_REDIRECT_URL'
    },
    refreshTokens: {
      doc: 'True if Defra Identity refresh tokens are enabled.',
      format: Boolean,
      default: true,
      env: 'DEFRA_ID_REFRESH_TOKENS'
    }
  },
  cookie: {
    password: {
      doc: 'The cookie password.',
      format: String,
      default: null,
      env: 'COOKIE_PASSWORD'
    }
  }
})

config.validate({ allowed: 'strict' })

export default config
