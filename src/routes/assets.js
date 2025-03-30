export default {
  method: 'GET',
  path: '/assets/{path*}',
  options: {
    auth: false,
    handler: {
      directory: {
        path: [
          'node_modules/govuk-frontend/dist/govuk/assets',
          'src/assets'
        ]
      }
    }
  }
}
