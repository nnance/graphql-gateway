import Hapi from "hapi";

import { SchemaGetter } from "./schema-stitching";

import url from "url";

import {
  graphiql,
  graphql,
  Tracer,
  zipkin,
} from "./plugins";

import { consulMiddleware } from "./consul/consul-hapi";
import { prometheusMiddleware } from "./prometheus/prometheus-hapi";

export interface IServerOptions {
    hostAddress: url.UrlWithStringQuery;
    schemaGetter: SchemaGetter;
    serviceName: string;
    tracer: Tracer;
}

export async function startServer(options: IServerOptions) {
    const {hostname, port} = options.hostAddress;
    const server = new Hapi.Server({host: hostname, port});

    await server.register([
      graphiql(),
      graphql(options.schemaGetter),
    ]);

    if (process.env.NODE_ENV === "docker") {
      await server.register([{
          options: { serviceName: options.serviceName },
          plugin: consulMiddleware,
        }, {
          plugin: prometheusMiddleware,
        },
        zipkin(options.tracer, port),
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
