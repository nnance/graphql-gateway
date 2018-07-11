import {
    DocumentNode,
    ExecutionResult,
} from "graphql";

import {
    introspectSchema,
    makeRemoteExecutableSchema,
} from "graphql-tools";

import { createHttpLink } from "apollo-link-http";

const link = createHttpLink({ uri: "http://localhost:3000/graphql", fetch: require("node-fetch") });

export default async () => {
    const schema = await introspectSchema(link);
    return makeRemoteExecutableSchema({ link, schema });
};
