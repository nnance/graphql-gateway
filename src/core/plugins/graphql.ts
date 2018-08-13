import { SchemaGetter } from "../schema-stitching";

import {
    graphiqlHapi,
    graphqlHapi,
} from "apollo-server-hapi";

import { Request } from "hapi";

export const graphql = (schemaGetter: SchemaGetter) => ({
    options: {
        graphqlOptions: async (request: Request) => ({
            context: {
                zipkin: (request.plugins as any).zipkin,
            },
            schema: await schemaGetter(),
        }),
        path: "/graphql",
        route: {
            cors: true,
        },
    },
    plugin: graphqlHapi,
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
