import {
    introspectSchema,
    makeRemoteExecutableSchema,
    mergeSchemas,
} from "graphql-tools";

import {
    getBlog,
    getSchema,
    getUser,
} from "core";

export default async () => {
    const blog = getBlog();
    const user = getUser();
    return mergeSchemas({
        schemas: [
            await getSchema(`${blog.host}:${blog.port}/graphql`),
            await getSchema(`${user.host}:${user.port}/graphql`),
        ],
    });
};
