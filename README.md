# graphql-gateway

This is an example GraphQL microservices project that provides a dynamic GraphQL gateway.  The gateway uses Schema stitching and Schema delegation provided by Apollo's [graphql-tools](https://github.com/apollographql/graphql-tools) to dynamically expose the Schema of each service.

Initially, this was a simply project to research the Schema stitching capabilities provided by version 3.0 of graphql-tools.  However, it quickly developed into a project that illustrates how an entire microservice architecture can be provided via GraphQL.  In this project the services exposed by the gateway use Schema delegation to expose types from other services.  Example:

```graphql
type Blog {
    _id: ID!
    title: String!
    text: String
    user: User
}

type User {
    _id: ID!
    username: String
    blogs: [Blog]
}
```

## Project Structure

This project composed of several services and shared libraries:

* core - Core libraries used by all service packages that provides capabilities like: startServer, getSchema, etc.

* schema - A single place where all schemas are managed.  This really isn't necessary but is a pattern we are evaluating using for manageability.

* user - User microservice

* blog - Blog microservice

* gateway - Aggregation service

## Getting started

### Building projects

From the root directory install all package dependencies

```sh
> npm install
```

Build each package

```sh
> npm run build
```

### Starting services

All three services must be running before the system will work.  The order of starting the services doesn't matter as each service will not try to retrieve the remote schema until the first schema query is executed.

Open a separate tab for each service and start them with

```sh
> node ./dist/user/index.js
> node ./dist/blog/index.js
> node ./dist/gateway/index.js
```

## Docker Compose

Start them with docker compose

```sh
> docker-compose up --build
```

## Verifying services

Confirm the services are working by opening the GraphiQL interface on the gateway

```sh
> open http://localhost:3000
```

**Note**: Make sure you refresh the GrpahiQL interface at least once to trigger all the services to refresh their dependent schemas.  After the initial refresh it could take a few seconds for the schema to become consistent.

Once GraphiQL is running the following query should work

```graphql
{
    blogs {
        title
        user {
            username
        }
    }
}
```

## Future improvements

- [x] Merge remote schemas with local schemas to avoid duplication.
- [x] Build schema refresh logic in schema loader such that schemas can be refreshed at a specified interval.
- [ ] Use a service discover tool like Consul to register each service and have the gateway use it.
- [x] Create Docker compose file to make running services easier
- [ ] Dockerize each service and provide a Kubernetes deployable example with infrastructure.  ie: Consule & Envoy.
