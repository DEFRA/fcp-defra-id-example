import assets from '../routes/assets.js'
import auth from '../routes/auth.js'
import index from '../routes/index.js'
import home from '../routes/home.js'

const router = {
  plugin: {
    name: 'router',
    register: (server, _options) => {
      server.route([].concat(
        assets,
        auth,
        index,
        home
      ))
    }
  }
}

export default router
