import Hapi from "hapi";

import { SchemaGetter } from "./schema-stitching";

import { IServerSettings } from "./config";

export function createServer(settings: IServerSettings) {
  const {host, port} = settings;
  return new Hapi.Server({host, port});
}

export async function startServer(
  settings: IServerSettings,
  schemaGetter: SchemaGetter,
  graphqlHapi: any,
  graphiqlHapi: any,
) {
  const {host, port} = settings;
  const server = new Hapi.Server({host, port});

  const getGraphqlOptions = async () => {
    const cachedSchema = await schemaGetter();
    return { schema: cachedSchema };
  };

  const graphqlOptions = await getGraphqlOptions();

  // const schema = await schemaGetter();

  await server.register({
    options: {
      graphqlOptions,
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
