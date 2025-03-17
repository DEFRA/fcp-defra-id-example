# FCP Template Node

Template to support rapid delivery of microservices for FCP Platform. It contains the configuration needed to deploy a simple Hapi Node server to the Azure Kubernetes Platform.

## Usage

Create a new repository from this template and run `./rename.js` specifying the new name of the project and the description to use e.g.
```
./rename.js ffc-demo-web "Web frontend for demo workstream"
```

The script will update the following:

* `package.json`: update `name`, `description`, `homepage`
* `docker-compose.yaml`: update the service name, `image` and `container_name`
* `docker-compose.test.yaml`: update the service name, `image` and `container_name`
* `docker-compose.override.yaml`: update the service name, `image` and `container_name`
* Rename `helm/ffc-template-node`
* `helm/ffc-template-node/Chart.yaml`: update `description` and `name`
* `helm/ffc-template-node/values.yaml`: update  `name`, `namespace`, `workstream`, `image`, `containerConfigMap.name`
* `helm/ffc-template-node/templates/_container.yaml`: update the template name
* `helm/ffc-template-node/templates/cluster-ip-service.yaml`: update the template name and list parameter of include
* `helm/ffc-template-node/templates/config-map.yaml`: update the template name and list parameter of include
* `helm/ffc-template-node/templates/deployment.yaml`: update the template name, list parameter of deployment and container includes

### Notes on automated rename

* The Helm chart deployment values in `helm/ffc-template-node/values.yaml` may need updating depending on the resource needs of your microservice
* The rename is a one-way operation i.e. currently it doesn't allow the name being changed from to be specified
* There is some validation on the input to try and ensure the rename is successful, however, it is unlikely to stand up to malicious entry
* Once the rename has been performed the script can be removed from the repo
* Should the rename go awry the changes can be reverted via `git clean -df && git checkout -- .`

## Prerequisites

- Docker
- Docker Compose

Optional:
- Kubernetes
- Helm

## Running the application

The application is designed to run in containerised environments, using Docker Compose in development and Kubernetes in production.

- A Helm chart is provided for production deployments to Kubernetes.

### Build container image

Container images are built using Docker Compose, with the same images used to run the service with either Docker Compose or Kubernetes.

When using the Docker Compose files in development the local `app` folder will
be mounted on top of the `app` folder within the Docker container, hiding the CSS files that were generated during the Docker build.  For the site to render correctly locally `npm run build` must be run on the host system.


By default, the start script will build (or rebuild) images so there will
rarely be a need to build images manually. However, this can be achieved
through the Docker Compose
[build](https://docs.docker.com/compose/reference/build/) command:

```
# Build container images
docker compose build
```

### Start

Use Docker Compose to run service locally.

```
docker compose up
```

## Test structure

The tests have been structured into subfolders of `./test` as per the
[Microservice test approach and repository structure](https://eaflood.atlassian.net/wiki/spaces/FPS/pages/1845396477/Microservice+test+approach+and+repository+structure)

### Running tests

A convenience script is provided to run automated tests in a containerised
environment. This will rebuild images before running tests via docker-compose,
using a combination of `docker-compose.yaml` and `docker-compose.test.yaml`.
The command given to `docker-compose run` may be customised by passing
arguments to the test script.

Examples:

```
# Run all tests
scripts/test

# Run tests with file watch
scripts/test -w
```

## CI pipeline

This service uses the [FFC CI pipeline](https://github.com/DEFRA/ffc-jenkins-pipeline-library)

## Licence

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government license v3

### About the licence

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable information providers in the public sector to license the use and re-use of their information under a common open licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.

### FFC-Service-Deploy Pipeline

More information about the pipeline : [FFC-Service-Deploy Pipeline](https://eaflood.atlassian.net/wiki/spaces/FAPT/pages/5332500540/Migrating+to+the+new+pipeline)

### Provisioning

After updating the `provision.azure` file with the correct information, the pipeline will create the required resources automatically
At the moment the following resources provisioning automatically:
- Managed Identity
- PostgreSql Database
- Service Bus Queue
- Service Bus Topic
- Service Bus Subscription

The permissions to the mentioned resources will be automatically granted by the pipeline.

### Using Workload Identity

Database:

```
const { DefaultAzureCredential, getBearerTokenProvider } = require('@azure/identity')

function isProd () {
  return process.env.NODE_ENV === production
}

const dbConfig = {
  username: process.env.POSTGRES_USERNAME,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  schema: process.env.POSTGRES_SCHEMA_NAME || 'public',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  logging: process.env.POSTGRES_LOGGING || false,
  dialect: 'postgres',
  dialectOptions: {
    ssl: isProd()
  },
  hooks: {
    beforeConnect: async (cfg) => {
      if (isProd()) {
        const credential = new DefaultAzureCredential({ managedIdentityClientId: process.env.AZURE_CLIENT_ID })
        const tokenProvider = getBearerTokenProvider(
          credential,
          'https://ossrdbms-aad.database.windows.net/.default'
        )
        cfg.password = tokenProvider
      }
    }
  },

```

Service Bus:

```
const mqSchema = joi.object({
  messageQueue: {
    host: joi.string().default('localhost'),
    useCredentialChain: joi.bool().default(false),
    type: joi.string(),
    appInsights: joi.object(),
    username: joi.string().optional(),
    password: joi.string().optional(),
    managedIdentityClientId: joi.string().optional()
  },
  applyQueue: queueSchema
})

const mqConfig = {
  messageQueue: {
    host: process.env.MESSAGE_QUEUE_HOST,
    useCredentialChain: process.env.NODE_ENV === 'production',
    type: 'queue',
    appInsights: process.env.NODE_ENV === 'production' ? require('applicationinsights') : undefined,
    username: process.env.MESSAGE_QUEUE_USER,
    password: process.env.MESSAGE_QUEUE_PASSWORD,
    managedIdentityClientId: process.env.AZURE_CLIENT_ID
  },
  {{ TheServiceQueue }}: {
    address: process.env.APPLY_QUEUE_ADDRESS
  }
}

```

For Storage account and other resources pass the azure client id to the `DefaultAzureCredential` method:
```
new DefaultAzureCredential({ managedIdentityClientId: process.env.AZURE_CLIENT_ID })
```
