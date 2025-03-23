import { createServer } from './server.js'

const init = async () => {
  const server = await createServer()
  await server.start()
}

await init()
