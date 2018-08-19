import Hapi from "hapi";

import { SchemaGetter } from "./schema-stitching";
import { Tracer } from "./zipkin/tracer";

import url from "url";

import {
  consul,
  graphiql,
  graphql,
  prometheus,
  zipkin,
} from "./plugins";

export interface IServerOptions {
  hostAddress: url.UrlWithStringQuery;
  schemaGetter: SchemaGetter;
  serviceName: string;
  tracer: Tracer;
}

export async function startServer(options: IServerOptions) {
  const {hostAddress, schemaGetter, serviceName, tracer} = options;
  const {hostname, port} = hostAddress;
  const server = new Hapi.Server({host: hostname, port});

  await server.register([
    graphiql(),
    graphql(schemaGetter),
  ]);

  if (process.env.NODE_ENV === "docker") {
    await server.register([
      consul(serviceName),
      prometheus(),
      zipkin(port, tracer),
    ]);
  }

  try {
    await server.start();
  } catch (err) {
    // tslint:disable-next-line:no-console
    console.log(`Error while starting server: ${err.message}`);
  }
  // tslint:disable-next-line:no-console
  console.log(`Server running at: ${server.info.uri}`);
}
