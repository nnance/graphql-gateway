import {
    introspectSchema,
    makeRemoteExecutableSchema,
    mergeSchemas,
} from "graphql-tools";

import { createHttpLink } from "apollo-link-http";

async function getSchema(uri: string) {
    const link = createHttpLink({ uri, fetch: require("node-fetch") });
    const schema = await introspectSchema(link);
    return makeRemoteExecutableSchema({ link, schema });
}

export default async () => {
    return mergeSchemas({
        schemas: [
            await getSchema("http://localhost:3000/graphql"),
            await getSchema("http://localhost:3001/graphql"),
        ],
    });
};
