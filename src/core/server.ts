import Hapi from "hapi";

import { SchemaGetter } from "./schema-stitching";

import url from "url";

import { graphiql, graphql } from "./plugins/graphql";
import { Tracer, zipkin } from "./plugins/zipkin";

export async function startServer(tracer: Tracer, settings: url.UrlWithStringQuery, schemaGetter: SchemaGetter) {
    const {hostname, port} = settings;
    const server = new Hapi.Server({host: hostname, port});

    await server.register([
      graphiql(),
      graphql(schemaGetter),
      zipkin(tracer, port),
    ]);

    try {
      await server.start();
    } catch (err) {
      // tslint:disable-next-line:no-console
      console.log(`Error while starting server: ${err.message}`);
    }
    // tslint:disable-next-line:no-console
    console.log(`Server running at: ${server.info.uri}`);
}
