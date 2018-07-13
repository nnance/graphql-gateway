import {
    introspectSchema,
    makeExecutableSchema,
    makeRemoteExecutableSchema,
    mergeSchemas,
} from "graphql-tools";

import { createHttpLink } from "apollo-link-http";
import { GraphQLSchema } from "graphql";

import { blog, user } from "schema";

async function getSchema(uri: string) {
    const link = createHttpLink({ uri, fetch: require("node-fetch") });
    const schema = await introspectSchema(link);
    return makeRemoteExecutableSchema({ link, schema });
}

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

const typeDefs = user + blog + `
    type Query {
        users: [User]
        userById(id: ID!): User
    }
`;

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
    const blogSchema = await getSchema("http://localhost:3001/graphql");
    return mergeSchemas({
        resolvers: remoteResolvers(blogSchema),
        schemas: [
            blogSchema,
            makeExecutableSchema({typeDefs, resolvers}),
        ],
    });
};
