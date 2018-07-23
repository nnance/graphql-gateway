import {
    graphiqlHapi,
    graphqlHapi,
} from "apollo-server-hapi";

import Hapi from "hapi";

import { SchemaGetter } from "./schema-stitching";

import url from "url";

export async function startServer(settings: url.UrlWithStringQuery, schemaGetter: SchemaGetter) {
    const {hostname, port} = settings;
    const server = new Hapi.Server({host: hostname, port});

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

    try {
      await server.start();
    } catch (err) {
      // tslint:disable-next-line:no-console
      console.log(`Error while starting server: ${err.message}`);
    }
    // tslint:disable-next-line:no-console
    console.log(`Server running at: ${server.info.uri}`);
}
