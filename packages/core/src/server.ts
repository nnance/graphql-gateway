import {
    graphiqlHapi,
    graphqlHapi,
} from "apollo-server-hapi";

import Hapi from "hapi";

import { SchemaGetter } from "./schema-stitching";

import { IServerSettings } from "./config";

export async function startServer(settings: IServerSettings, schemaGetter: SchemaGetter) {
    const {host, port} = settings;
    const server = new Hapi.Server({host, port});

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
