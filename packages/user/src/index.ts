import {
    graphiqlHapi,
    graphqlHapi,
} from "apollo-server-hapi";

import Hapi from "hapi";

import schema from "./impl";

const HOST = "localhost";
const PORT = 3000;

async function StartServer() {

  const server = new Hapi.Server({
    host: HOST,
    port: PORT,
  });

  await server.register({
    options: {
      graphqlOptions: {
        schema,
      },
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

StartServer();