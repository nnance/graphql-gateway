import {
    graphiqlHapi,
    graphqlHapi,
} from "apollo-server-hapi";

import Hapi from "hapi";

import { SchemaGetter } from "./schema-stitching";

import url from "url";

import {
    ConsoleRecorder,
    ExplicitContext,
    Tracer,
} from "zipkin";

import { zipkinMiddleware } from "./zipkin";

export async function startServer(serviceName: string, settings: url.UrlWithStringQuery, schemaGetter: SchemaGetter) {
    const {hostname, port} = settings;
    const server = new Hapi.Server({host: hostname, port});

    /**
     * graphql
     */
    await server.register({
      options: {
        graphqlOptions: async () => ({
          schema: await schemaGetter(),
        }),
        path: "/graphql",
        route: {
          cors: true,
        },
      },
      plugin: graphqlHapi,
    });

    await server.register({
      options: {
          graphiqlOptions: {
              endpointURL: "/graphql",
          },
          path: "/",
      },
      plugin: graphiqlHapi,
    });

    /**
     * zipkin
     */
    const ctxImpl = new ExplicitContext();
    const recorder = new ConsoleRecorder();

    const tracer = new Tracer({ctxImpl, recorder, localServiceName: serviceName});

    await server.register({
      options: {
        port: parseInt(port || "0", 10),
        tracer,
      },
      plugin: zipkinMiddleware,
    });

    try {
      await server.start();
    } catch (err) {
      // tslint:disable-next-line:no-console
      console.log(`Error while starting server: ${err.message}`);
    }
    // tslint:disable-next-line:no-console
    console.log(`Server running at: ${server.info.uri}`);
}
