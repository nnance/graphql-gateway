import Hapi from "hapi";

import { SchemaGetter } from "./schema-stitching";

import url from "url";

import { graphiql, graphql, prometheus, Tracer, zipkin  } from "./plugins";

import { consul } from "./config";

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
      prometheus(),
      zipkin(options.tracer, port),
    ]);

    server.route({
      // tslint:disable-next-line:no-console
      handler: () => "OK",
      method: "GET",
      path: "/_health",
    });

    try {
      await server.start();
      await consul.agent.service.register({
        address: options.serviceName,
        check: {
          http: `http://${options.serviceName}:${port}/_health`,
          interval: "10s",
        },
        name: options.serviceName,
        port: Number(server.info.port),
      });
    } catch (err) {
      // tslint:disable-next-line:no-console
      console.log(`Error while starting server: ${err.message}`);
    }
    // tslint:disable-next-line:no-console
    console.log(`Server running at: ${server.info.uri}`);
}
