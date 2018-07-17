import {
    introspectSchema,
    makeRemoteExecutableSchema,
} from "graphql-tools";

import { createHttpLink } from "apollo-link-http";

import {
    GraphQLSchema,
} from "graphql";

export type SchemaGetter = () => Promise<GraphQLSchema>;

export function wrapper(localGetter: SchemaGetter, remoteGetter: SchemaGetter) {
    let cache: GraphQLSchema;
    let remoteCache: GraphQLSchema;

    const getSchemaWithCache = async () => {
        if (!cache) {
            cache = await localGetter();
            return cache;
        } else if (!remoteCache) {
            try {
                remoteCache = await remoteGetter();
            } catch (e) {
                // tslint:disable-next-line:no-console
                console.error(e);
                return cache;
            }
        }
        return remoteCache;
    };
    return getSchemaWithCache;
}

export async function getSchema(uri: string) {
    const link = createHttpLink({ uri, fetch: require("node-fetch") });
    const schema = await introspectSchema(link);
    return makeRemoteExecutableSchema({ link, schema });
}
