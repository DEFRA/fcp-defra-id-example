# FCP Defra Identity example

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_fcp-defra-id-example&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=DEFRA_fcp-defra-id-example)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_fcp-defra-id-example&metric=bugs)](https://sonarcloud.io/summary/new_code?id=DEFRA_fcp-defra-id-example)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_fcp-defra-id-example&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=DEFRA_fcp-defra-id-example)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_fcp-defra-id-example&metric=coverage)](https://sonarcloud.io/summary/new_code?id=DEFRA_fcp-defra-id-example)
[![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_fcp-defra-id-example&metric=duplicated_lines_density)](https://sonarcloud.io/summary/new_code?id=DEFRA_fcp-defra-id-example)

This is an example service that demonstrates how to use the Defra Identity service to authenticate users within the Farming and Countryside programme (FCP).

The patterns used within this example are documented below.  Code comments are also provided to provide extra context.

## Defra Identity

Defra Identity is a service that provides external user authentication and authorisation for Defra services. It is based on the OAuth 2.0 and OpenID Connect standards and is backed by Azure B2C.

Defra Identity supports authentication through a Government Gateway or Rural Payments account.

FCP services should use Defra Identity with a Rural Payments account. This is because the majority of users will have one and it is only possible to retrieve customer and land data data if the user is authenticated with a Rural Payments account.

> Defra Identity only supports external user authentication and cannot be used for internal users.  Microsoft Entra should be used for internal users.

Whilst this service focuses on the Rural Payments account and FCP, the patterns within can be applied to other services that use Defra Identity.

The only significant difference is that FCP services must retrieve permissions from Siti Agri as opposed to being provided by Defra Customer.

## Sign in flow

Once a user has been authenticated, a service must retrieve this data from Siti Agri via an API call. A complication of this is that this API cannot retrieve all permissions for an individual, instead it can only retrieve permissions for a specific organisation the person is associated with.

The majority of farming APIs follow this concept, so FCP journey's should be based around an organisation, rather than an individual. A typical journey would be:

1. User accesses a service
1. User is redirected to the Defra Identity login page
1. User logs in
1. User selects an organisation
1. User is redirected back to the consuming service with an authorisation code
1. Consuming service exchanges the authorisation code for an access token
1. Consuming service stores JWT token in session
1. Consuming service retrieves permissions for the organisation from Siti Agri

> If a user is only associated with one organisation, the organisation selection step is automatically skipped.

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

> Within this example, the data is mocked.  In a real-world scenario, the data would be retrieved from Siti Agri via Crown Hosting APIs.

Once the user is authenticated, the application creates a session cookie. This cookie is used to manage the user's session and is used to authenticate the user on subsequent requests.

The OAuth2.0 token and other session data is stored in Redis and can be used to retrieve user information and permissions from downstream services.

The session will end when the user signs out or the browser is closed.  This is to align with the behaviour of other farming services.

### Redirections

When an unauthenticated user accesses a route that requires authentication, the application will redirect the user to the Defra Identity sign in endpoint. 

The original path is stored in Redis session storage and is retrieved once the user has signed in.  The user is then redirected back to the original path.

[`@hapi/yar`](https://github.com/hapijs/yar) is used to store the original path in the session.  Like `@hapi/cookie`, `@hapi/yar` is a cookie-based session management plugin, but is used for unauthenticated users.

### Sign out

When a user signs out, the application will redirect the user to the Defra Identity sign out endpoint.  Once the user has signed out, they will be redirected back to the application.

The application will then clear the session and the user will be signed out.

As sign out is not a feature supported by `@hapi/bell`, a module has been created to ensure the redirect Url is correctly set and appropriate state validation is performed to prevent CSRF attacks.

> The sign out process will only end the session with the application and the Defra Identity SSO session.  The user will still be signed into any other services that use the same Defra Identity policy.

### Refreshing tokens

As part of the cookie authentication strategy, the application will check if the token has expired.  
If the token has expired, it will be refreshed automatically if the `DEFRA_ID_REFRESH_TOKENS` environment variable is set to `true`.

As refreshing tokens is not a feature supported by `@hapi/bell`, a module has been created to handle the token refresh process.

### Protecting routes

This example sets cookie authentication as the default authentication strategy for all routes.  
This means that all routes are protected by default unless explicitly set to be unprotected or use the Defra Identity OAuth2.0 strategy.

Hapi.js authorisation is simpler when using scopes.  Scopes are used to define the permissions a user has within the application.

Permissions retrieved from Siti Agri are mapped to the `scope` property of the user session.  This session data is added to the `request.auth.credentials` object on each request.

Routes can be protected by scopes by using the `scope` property in the route configuration.  The `/home` route is an example of this where `user` scope is required.

If any route does not have a scope defined, it will be accessible to all authenticated users.

The `/` route is set to be unprotected and only tries to authenticate the to allow users to access the start page without being authenticated.

If a user tries to access a route without the required scope, the `error` plugin will return the `403` page.

> Services may wish to aggregate permissions or map to more meaningful names to simplify authorisation.

### Switching organisations

If a user is associated with multiple organisations, they will be prompted to select an organisation when they sign in.

During their session, they may wish to switch organisations.  This can be achieved by passing the `forceReselection` query parameter when redirecting to the Defra Identity sign in endpoint.

If the Defra Identity session is still active, the user will be redirected to the organisation selection page.  If the session has expired, the user will be prompted to sign in again first.

The `/auth/organisation` route enables this functionality.  As the user will be redirected to the same post Defra Identity sign in route, the session data, including permissions, will be refreshed to reflect the new organisation.

### Single Sign On (SSO)

As user journeys may span multiple services, it is important to support Single Sign On (SSO) to provide a seamless experience for users.

Defra Identity supports SSO through the use of policies.  All FCP services should use the same policy to ensure a consistent experience.

If a user is redirected to a different service that uses the same policy, when they are redirected to the Defra Identity sign in endpoint, they will be automatically signed in and redirected back to the new consuming service without needing to sign in again.

#### SSO and organisations

Although SSO avoids the need to sign in again, it does not automatically switch organisations.  If a user is associated with multiple organisations, they will still be prompted to select an organisation.

To avoid this, `relationshipId` can be passed as a query parameter when redirecting to the Defra Identity sign in endpoint.  This will automatically select the organisation associated with the `relationshipId`.  The `relationshipId` should be set to the `organisationId` of the organisation the user wishes to switch to.

The `organisationId` can be retrieved from the JWT token in the `currentRelationshipId` property.  This example sets the `organisationId` in the session when the user selects an organisation for convenience.

To make this work, services must include the `ssoOrgId` query parameter when redirecting between services. 
The `sso` plugin in the example service handles intercept any requests with the `ssoOrgId` query parameter and redirect to Defra Identity to setup an appropriate session.

The user is then redirected to their original destination with the appropriate organisation selected.

> It is important that no route is configured to use a query parameter named `ssoOrgId` to avoid conflicts with the plugin.

### View templates

User session data is passed to the view templates to enable the conditional rendering of content based on the user's permissions.

This is handled by the `view` plugin which adds the `auth` object to the view context.  This object contains the user's permissions and other session data.

The `home` view is an example of this where all session data is displayed.

> In a real-world scenario, the user token data should not be displayed in the view.

### Security

The application has been designed with security in mind.  The following security patterns have been implemented:
- Content Security Policy (CSP) to prevent cross-site scripting attacks
- HTTP Strict Transport Security (HSTS) to ensure all communication is over HTTPS
- Referrer Policy to prevent leaking sensitive information
- X-Content-Type-Options to prevent MIME type sniffing
- X-Frame-Options to prevent clickjacking
- X-XSS-Protection to prevent cross-site scripting attacks
- Authorisation code exchange to prevent token leakage
- Public key verification to ensure token is signed by Defra Identity
- State and nonce validation to prevent CSRF and token replay attacks
- Token expiration validation
- Session management to prevent session fixation attacks
- Scope-based authorisation to prevent unauthorised access
- Redirect validation to prevent open redirects
- No store policy to prevent caching of sensitive information and back button and browser history attacks

> **Important** Security is subjective and should be reviewed to ensure it meets the requirements of the service and the technologies used.

## Licence

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government license v3

### About the licence

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable information providers in the public sector to license the use and re-use of their information under a common open licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.
