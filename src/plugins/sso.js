const plugin = {
  plugin: {
    name: 'sso',
    register: (server, options) => {
      server.ext('onRequest', (request, h) => {
        // If the user has already selected an organisation in another service, pass the organisation Id to force Defra Id to skip the organisation selection screen
        if (request.query.ssoOrgId) {
          return h.redirect(`/auth/organisation?organisationId=${request.query.ssoOrgId}&redirect=${request.url.pathname}`).takeover()
        }
        return h.continue
      })
    }
  }
}

export default plugin
