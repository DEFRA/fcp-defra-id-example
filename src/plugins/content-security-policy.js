import Blankie from 'blankie'

const plugin = {
  plugin: Blankie,
  options: {
    fontSrc: ['self'],
    imgSrc: ['self'],
    scriptSrc: ['self', 'unsafe-inline'],
    styleSrc: ['self', 'unsafe-inline'],
    frameAncestors: ['self'],
    formAction: ['self'],
    generateNonces: false
  }
}

export default plugin
