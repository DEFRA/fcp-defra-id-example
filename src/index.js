import { createServer } from './server.js'

async function init () {
  const server = await createServer()
  await server.start()
}

await init()
