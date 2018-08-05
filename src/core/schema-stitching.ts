import {
    introspectSchema,
    makeRemoteExecutableSchema,
    mergeSchemas,
} from "graphql-tools";

import { ApolloLink, Observable } from "apollo-link";

import { createHttpLink } from "apollo-link-http";

import { setContext } from "apollo-link-context";

import {
    GraphQLSchema,
} from "graphql";

import { Tracer } from "./plugins/zipkin";

import { zipkinFetcher } from "./zipkin";

import { TraceId } from "zipkin";

export type Fetcher = (url: string, options: any) => Promise<any>;

export type SchemaGetter = () => Promise<GraphQLSchema>;

export function schemaCacher(localGetter: SchemaGetter, remoteGetter: SchemaGetter) {
    let cache: GraphQLSchema;

    function callRemote(delay: number) {
        setTimeout(async () => {
            try {
                const resp = await remoteGetter();
                if (!cache) {
                    // tslint:disable-next-line:no-console
                    console.log("Successfully pulled remote schema");
                }
                cache = resp;
                callRemote(60000);  // refresh remote cache every minute
            } catch (e) {
                // tslint:disable-next-line:no-console
                console.error(e);
                callRemote(delay * 2); // retry backoff
            }
        }, delay);
    }

    callRemote(1000);  // load remote schema in the background

    return async () => cache || await localGetter();
}

export async function getSchema(tracer: (id?: TraceId) => Tracer, remoteServiceName: string, remoteURI: string) {

    const customFetch = (uri: string, options: any) => {
        const traceId = options.headers["X-B3-TraceId"];
        const zipFetch = zipkinFetcher({
            remoteServiceName,
            tracer: tracer(traceId),
        });
        return zipFetch(uri, options);
    };

    // const http = new ApolloLink((operation, forward) => {
    //     const context = operation.getContext();
    //     // tslint:disable-next-line:no-console
    //     console.log(context);
    //     const fetch = zipkinFetcher({
    //         remoteServiceName,
    //         tracer: tracer(),
    //     });
    //     return new Observable((observer) => {
    //         fetch(remoteURI, context.fetchOptions);
    //     });
    // });

    // const fetch = zipkinFetcher({
    //     remoteServiceName,
    //     tracer: tracer(),
    // });

    const http = createHttpLink({uri: remoteURI, fetch: customFetch });

    const link = setContext((request, prevContext) => {
        const traceId = prevContext.graphqlContext ? (prevContext.graphqlContext.zipkin as TraceId).traceId : undefined;
        return { headers: { "X-B3-TraceId": traceId } };
    }).concat(http);

    const schema = await introspectSchema(link);
    return makeRemoteExecutableSchema({ link, schema });
}
