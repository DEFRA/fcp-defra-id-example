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

## Licence

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government license v3

### About the licence

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable information providers in the public sector to license the use and re-use of their information under a common open licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.
