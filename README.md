# FCP Defra Identity example

This is an example service that demonstrates how to use the Defra Identity service to authenticate users within the Farming and Countryside programme (FCP).

Defra Identity is a service that provides external user authentication and authorisation for Defra services. It is based on the OAuth 2.0 and OpenID Connect standards and is backed by Azure B2C.

Defra Identity supports authentication through a Government Gateway or Rural Payments account.

FCP services should use Defra Identity with a Rural Payments account. This is because the majority of users will have one and it is only possible to retrieve customer and land data data if the user is authenticated with a Rural Payments account.

> Defra Identity only supports external user authentication and cannot be used for internal users.  Microsoft Entra should be used for internal users.

Whilst this service focuses on the Rural Payments account and FCP, the patterns within can be applied to other services that use Defra Identity.

The only significant difference is that FCP services must retrieve permissions from Siti Agri as opposed to being provided by Defra Customer.

## FCP Development Guide

The [FCP Development Guide](https://defra.github.io/ffc-development-guide/development-patterns/authentication/defra-identity/) provides more context on how to use Defra Identity and Siti Agri within FCP services.

## Prerequisites

- Docker
- Docker Compose

### Defra Identity onboarding

Before you can use Defra Identity, you will need to onboard your service with the Defra Identity team. This will provide you with the necessary credentials to authenticate users.

- Redirect Url configured in Defra Identity service to `http://localhost:3000/auth/sign-in-oidc`
- Sign out redirect Url configured in Defra Identity service to `http://localhost:3000/auth/sign-out-oidc`

> To support Single Sign On (SSO) with other services, all FCP services should use the same policy.

### Environment variables

Once you have your Defra Identity service credentials, you will need to add them to a `.env` file in the root of the project.

```bash
DEFRA_ID_WELL_KNOWN_URL
DEFRA_ID_CLIENT_ID
DEFRA_ID_CLIENT_SECRET
DEFRA_ID_SERVICE
DEFRA_ID_POLICY
```

## Running the application

The application is designed to run in containerised environments.  Before running the application, you will need to build the Docker image.

```bash
docker compose build
```

### Start

Use Docker Compose to run service locally.

```bash
docker compose up
```

### Running tests

A convenience script is provided to run automated tests in a containerised
environment. This will rebuild images before running tests via docker-compose,
using a combination of `docker-compose.yaml` and `docker-compose.test.yaml`.
The command given to `docker-compose run` may be customised by passing
arguments to the test script.

Examples:

```bash
# Run all tests
scripts/test

# Run tests with file watch
scripts/test -w
```

## Patterns

### Authentication strategies

The application contains two authentication strategies:

1. OAuth2.0 orchestrated by [`@hapi/bell`](https://github.com/hapijs/bell)
1. Cookie-based session management orchestrated by [`@hapi/cookie`](https://github.com/hapijs/cookie)

The OAuth2.0 strategy is used to authenticate users with Defra Identity. Once authenticated, the user is redirected to the application with an access token. 

`@hapi/bell` simplifies the OAuth2.0 process by handling the OAuth2.0 flow and token exchange with Defra Identity including validation of state and nonce to prevent CSRF  and token replay attacks.

The token is validated against the Defra Identity public key to ensure it is valid.

This token is used to retrieve user information and permissions from Siti Agri.

> Within this example, the data is mocked.  In a real-world scenario, the data would be retrieved from Siti Agri via KITS/Version 1 APIs.

Once the user is authenticated, the application creates a session cookie. This cookie is used to manage the user's session and is used to authenticate the user on subsequent requests.

The OAuth2.0 token and other session data is stored in Redis and can be used to retrieve user information and permissions from downstream services.

As part of the cookie authentication strategy, the application will check if the token has expired.  
If the token has expired, it will be refreshed automatically if the `DEFRA_ID_REFRESH_TOKENS` environment variable is set to `true`.

The session will end when the user signs out or the browser is closed.  This is to align with the behaviour of other farming services.

### Sign out

When a user signs out, the application will redirect the user to the Defra Identity sign out endpoint.  Once the user has signed out, they will be redirected back to the application.

The application will then clear the session and the user will be signed out.

As sign out is not a feature supported by `@hapi/bell`, a module has been created to ensure the redirect Url is correctly set and appropriate state validation is performed to prevent CSRF attacks.

### Protecting routes

This example sets cookie authentication as the default authentication strategy for all routes.  
This means that all routes are protected by default unless explicitly set to be unprotected or use the Defra Identity OAuth2.0 strategy.

Hapi.js authorisation is simpler when using scopes.  Scopes are used to define the permissions a user has within the application.

Permissions retrieved from Siti Agri are mapped to the `scope` property of the user session.  This session data is added to the `request.auth.credentials` object on each request.

Routes can be protected by scopes by using the `scope` property in the route configuration.

For example:

```javascript
{
  method: 'GET',
  path: '/restricted',
  options: {
    auth: {
      scope: ['permission1']
    }
  }
  handler: (request, h) => {
    return 'You have access to this route';
  }
}
```

If any route does not have a scope defined, it will be accessible to all authenticated users.

The `/` route is set to be unprotected to allow users to access the start page without being authenticated.

## Licence

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government license v3

### About the licence

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable information providers in the public sector to license the use and re-use of their information under a common open licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.
