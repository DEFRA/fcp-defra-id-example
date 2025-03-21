import Blankie from 'blankie'

const plugin = {
  plugin: Blankie,
  options: {
    defaultSrc: ['self'],
    scriptSrc: ['self', 'unsafe-inline'],
    styleSrc: ['self', 'unsafe-inline'],
    generateNonces: false
  }
}

export default plugin
