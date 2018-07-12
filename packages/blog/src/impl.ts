import {
    introspectSchema,
    makeExecutableSchema,
    makeRemoteExecutableSchema,
    mergeSchemas,
} from "graphql-tools";

import { createHttpLink } from "apollo-link-http";
import { GraphQLSchema } from "graphql";

async function getSchema(uri: string) {
    const link = createHttpLink({ uri, fetch: require("node-fetch") });
    const schema = await introspectSchema(link);
    return makeRemoteExecutableSchema({ link, schema });
}

interface IBlog {
    _id: string;
    title: string;
    user?: string;
    text?: string;
}

const blogFactory = (id: string, title: string, user?: string, text?: string): IBlog => ({
    _id: id, text, title, user,
});

const blogs = [
    blogFactory("1", "Blog Post 1", "1"),
    blogFactory("2", "Blog Post 2", "3"),
    blogFactory("3", "Blog Post 3", "3"),
];

const getBlog = (id: string) => blogs.find((u) => u._id === id);
const getBlogsForUser = (id: string) => blogs.filter((u) => u.user === id);

const typeDefs = `
    type User {
        _id: ID!
        username: String
        blogs: [Blog]
    }

    type Blog {
        _id: ID!
        user: User
        title: String!
        text: String
    }

    type Query {
        blogs: [Blog]
        blogById(id: ID!): Blog
        blogsForUser(id: ID!): [Blog]
    }
`;

const resolvers = {
    Query: {
        blogById: (obj: any, args: any, context: any) => {
            context.blog = getBlog(args.id);
            return context.blog;
        },
        blogs: () => blogs,
        blogsForUser: (obj: any, args: any) => getBlogsForUser(args.id),
    },
};

const remoteResolvers = (subschema: GraphQLSchema) => ({
    Blog: {
        user: (parent: any, args: any, context: any, info: any) => {
            return info.mergeInfo.delegateToSchema({
                args: {
                    id: context.blog.user,
                },
                context,
                fieldName: "userById",
                info,
                operation: "query",
                schema: subschema,
            });
        },
    },
});

export default async () => {
    const userSchema = await getSchema("http://localhost:3000/graphql");
    return mergeSchemas({
        resolvers: remoteResolvers(userSchema),
        schemas: [
            userSchema,
            makeExecutableSchema({typeDefs, resolvers}),
        ],
    });
};
