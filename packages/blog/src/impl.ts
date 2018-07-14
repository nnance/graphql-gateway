import {
    makeExecutableSchema,
    mergeSchemas,
} from "graphql-tools";

import { GraphQLSchema } from "graphql";

import { blog, user } from "schema";

import { getSchema, getUser } from "core";

interface IBlog {
    _id: string;
    title: string;
    user?: string;
    text?: string;
}

const blogFactory = (id: string, title: string, userId?: string, text?: string): IBlog => ({
    _id: id, text, title, user: userId,
});

const blogs = [
    blogFactory("1", "Blog Post 1", "1"),
    blogFactory("2", "Blog Post 2", "3"),
    blogFactory("3", "Blog Post 3", "3"),
];

const getBlog = (id: string) => blogs.find((u) => u._id === id);
const getBlogsForUser = (id: string) => blogs.filter((u) => u.user === id);

const typeDefs = blog + user + `
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
    const addr = getUser();
    const userSchema = await getSchema(`${addr.host}:${addr.port}/graphql`);
    return mergeSchemas({
        resolvers: remoteResolvers(userSchema),
        schemas: [
            userSchema,
            makeExecutableSchema({typeDefs, resolvers}),
        ],
    });
};
