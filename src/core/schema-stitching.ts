import {
    introspectSchema,
    makeRemoteExecutableSchema,
    mergeSchemas,
} from "graphql-tools";

import { createHttpLink } from "apollo-link-http";

import {
    GraphQLSchema,
} from "graphql";

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

export async function getSchema(uri: string) {
    const link = createHttpLink({ uri, fetch: require("node-fetch") });
    const schema = await introspectSchema(link);
    return makeRemoteExecutableSchema({ link, schema });
}
