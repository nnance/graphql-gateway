import {
    introspectSchema,
    makeRemoteExecutableSchema,
} from "graphql-tools";

import { ApolloLink } from "apollo-link";

import {
    GraphQLSchema,
} from "graphql";

export type Fetcher = (url: string, options: any) => Promise<Response>;

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

export async function getSchema(link: ApolloLink) {
    const schema = await introspectSchema(link);
    return makeRemoteExecutableSchema({ link, schema });
}
