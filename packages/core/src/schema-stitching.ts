import {
    introspectSchema,
    makeRemoteExecutableSchema,
} from "graphql-tools";

import { createHttpLink } from "apollo-link-http";

export async function getSchema(uri: string) {
    const link = createHttpLink({ uri, fetch: require("node-fetch") });
    const schema = await introspectSchema(link);
    return makeRemoteExecutableSchema({ link, schema });
}
