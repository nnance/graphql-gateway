import {
    introspectSchema,
    makeRemoteExecutableSchema,
} from "graphql-tools";

import { createHttpLink } from "apollo-link-http";

import {
    GraphQLSchema,
} from "graphql";

export type SchemaGetter = () => Promise<GraphQLSchema>;

export function schemaCacher(localGetter: SchemaGetter, remoteGetter: SchemaGetter) {
    let cache: GraphQLSchema;

    function callRemote(delay: number) {
        setTimeout(() => {
            remoteGetter()
                .then((resp) => {
                    cache = resp;
                    callRemote(60000);  // refresh remote cache every minute
                })
                .catch(() => callRemote(delay * 2)); // retry backoff
        }, delay);
    }

    callRemote(1000);  // load remote schema in the background

    return async () => cache || await localGetter();
}

export async function getSchema(uri: string) {
    const link = createHttpLink({ uri, fetch: require("node-fetch") });
    const schema = await introspectSchema(link);
    return makeRemoteExecutableSchema({ link, schema });
}
