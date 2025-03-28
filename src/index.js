import { createServer } from './server.js'

async function init () {
  const server = await createServer()
  await server.start()
}

export { init }

if (import.meta.url === new URL(import.meta.url).href) {
  await init()
}
