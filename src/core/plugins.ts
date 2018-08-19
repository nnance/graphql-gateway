import Hapi from "hapi";

import { SchemaGetter } from "./schema-stitching";
import { Tracer } from "./zipkin/tracer";

import { graphiqlHapi, graphqlHapi } from "apollo-server-hapi";
import { consulMiddleware } from "./consul/consul-hapi";
import { prometheusMiddleware } from "./prometheus/prometheus-hapi";
import { zipkinMiddleware } from "./zipkin/zipkin-instrumentation-hapi";

const graphqlOptions = (schemaGetter: SchemaGetter) => async (request: Hapi.Request) => ({
    context: {
        zipkin: (request.plugins as any).zipkin,
    },
    schema: await schemaGetter(),
});

export const graphiql = () => ({
    options: {
        graphiqlOptions: {
            endpointURL: "/graphql",
        },
        path: "/",
    },
    plugin: graphiqlHapi,
});

export const graphql = (schemaGetter: SchemaGetter) => ({
    options: {
        graphqlOptions: graphqlOptions(schemaGetter),
        path: "/graphql",
        route: {
            cors: true,
        },
    },
    plugin: graphqlHapi,
});

export const consul = (serviceName: string) => ({
    options: {
        serviceName,
    },
    plugin: consulMiddleware,
});

export const prometheus = () => ({
    plugin: prometheusMiddleware,
});

export const zipkin = (port: number | string | undefined, tracer: Tracer) => ({
    options: {
        port: Number(port || "0"),
        tracer,
    },
    plugin: zipkinMiddleware,
});
