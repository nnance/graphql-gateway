import {
    introspectSchema,
    makeExecutableSchema,
    makeRemoteExecutableSchema,
    mergeSchemas,
} from "graphql-tools";

import { GraphQLSchema } from "graphql";

import {
    user,
    userQuery,
    userWithBlogs,
} from "schema";

import { getBlog, getSchema } from "core";

interface IUser {
    _id: string;
    blogs?: string[];
    username: string;
}

const userFactory = (id: string, username: string, blogs?: string[]): IUser => ({
    _id: id, blogs, username,
});

const users = [
    userFactory("1", "test-user-1"),
    userFactory("2", "test-user-2"),
    userFactory("3", "test-user-3"),
];

const userById = (id: string) => {
    return users.find((u) => u._id === id);
};

const resolvers = {
    Query: {
        userById: (obj: any, args: any, context: any) => {
            context.user = userById(args.id);
            return context.user;
        },
        users: () => users,
    },
};

const remoteResolvers = (subschema: GraphQLSchema) => ({
    User: {
        blogs: (parent: any, args: any, context: any, info: any) => {
            return info.mergeInfo.delegateToSchema({
                args: {
                    id: context.user._id,
                },
                context,
                fieldName: "blogsForUser",
                info,
                operation: "query",
                schema: subschema,
            });
        },
    },
});

export default async () => {
    const {host, port, protocol} = getBlog();
    // const blogSchema = await getSchema(`${protocol}://${host}:${port}/graphql`);
    return mergeSchemas({
        // resolvers: remoteResolvers(blogSchema),
        schemas: [
            makeExecutableSchema({typeDefs: [user, userQuery], resolvers}),
        ],
    });
};
