import {
    DocumentNode,
    ExecutionResult,
} from "graphql";

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
    const userLink = await getSchema("http://localhost:3000/graphql");
    const blogLink = await getSchema("http://localhost:3001/graphql");

    return mergeSchemas({
        schemas: [ userLink, blogLink ],
    });
};
