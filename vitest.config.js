import { defineConfig, configDefaults } from 'vitest/config'

const sharedEnv = {
  NODE_ENV: 'test',
  COOKIE_PASSWORD: 'this-is-a-secret-that-must-be-at-least-32-characters',
  USE_SINGLE_INSTANCE_CACHE: 'true',
  DEFRA_ID_WELL_KNOWN_URL: 'https://oidc.example.com/.well-known/openid-configuration',
  DEFRA_ID_CLIENT_ID: 'test-client-id',
  DEFRA_ID_CLIENT_SECRET: 'test-client-secret',
  DEFRA_ID_SERVICE_ID: 'test-service-id',
  DEFRA_ID_POLICY: 'test-policy',
  DEFRA_ID_REDIRECT_URL: 'http://localhost:3000/auth/sign-in-oidc',
  DEFRA_ID_SIGN_OUT_REDIRECT_URL: 'http://localhost:3000/auth/sign-out-oidc'
}

const coverageConfig = {
  provider: 'v8',
  reportsDirectory: './coverage',
  clean: false,
  reporter: ['text', 'lcov'],
  include: ['src/**/*.js'],
  exclude: [
    ...configDefaults.exclude,
    '**/test/**',
    'coverage',
    'src/assets/**'
  ]
}

export default defineConfig({
  test: {
    globals: true,
    clearMocks: true,
    coverage: coverageConfig,
    projects: [
      {
        test: {
          name: 'unit',
          include: ['test/unit/**/*.test.js'],
          globals: true,
          clearMocks: true,
          environment: 'node',
          env: { ...sharedEnv, REDIS_HOST: 'redis', REDIS_PORT: '6379' }
        }
      },
      {
        test: {
          name: 'integration',
          include: ['test/integration/**/*.test.js'],
          globals: true,
          clearMocks: true,
          environment: 'node',
          env: sharedEnv,
          globalSetup: ['./test/setup/global-redis.js']
        }
      }
    ]
  }
})
