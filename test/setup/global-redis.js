// Testcontainers globalSetup for the integration project. Starts a real Redis in
// a container, exposes its mapped port to the tests, and stops it on teardown.
// Requires Docker running, but NO `npm run services:up`.
import { GenericContainer, Wait } from 'testcontainers'

export async function setup () {
  const redis = await new GenericContainer('redis')
    .withExposedPorts(6379)
    .withWaitStrategy(Wait.forLogMessage('Ready to accept connections'))
    .start()

  process.env.REDIS_HOST = redis.getHost()
  process.env.REDIS_PORT = String(redis.getMappedPort(6379))
  process.env.USE_SINGLE_INSTANCE_CACHE = 'true'
  process.env.NODE_ENV = 'test'

  return async function teardown () {
    await redis.stop()
  }
}
