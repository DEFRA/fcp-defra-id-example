import assets from '../routes/assets.js'
import index from '../routes/index.js'
import home from '../routes/home.js'

const router = {
  plugin: {
    name: 'router',
    register: (server, _options) => {
      server.route([].concat(
        assets,
        index,
        home
      ))
    }
  }
}

export default router
