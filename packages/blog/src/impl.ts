import {
    mergeSchemas,
} from "graphql-tools";

import { GraphQLSchema } from "graphql";

import { blog } from "schema";

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

const getBlog = (id: string) => blogs.find((u) => u._id === id);
const getBlogsForUser = (id: string) => blogs.filter((u) => u.user === id);

const blogs = [
    blogFactory("1", "Blog Post 1", "1"),
    blogFactory("2", "Blog Post 2", "3"),
    blogFactory("3", "Blog Post 3", "3"),
];

const typeDefs = blog + `
    type Query {
        blogs: [Blog]
        blogById(id: ID!): Blog
        blogsForUser(id: ID!): [Blog]
    }
`;

const resolvers = {
    Query: {
        blogById: (obj: any, args: any, context: any) => getBlog(args.id),
        blogs: () => blogs,
        blogsForUser: (obj: any, args: any) => getBlogsForUser(args.id),
    },
};

const remoteResolvers = (subschema: GraphQLSchema) => ({
    Blog: {
        user: {
            fragment: "fragment BlogFragment on Blog { _id }",
            resolve(parent: any, args: any, context: any, info: any) {
                return info.mergeInfo.delegateToSchema({
                    args: {
                        id: parent._id,
                    },
                    context,
                    fieldName: "userById",
                    info,
                    operation: "query",
                    schema: subschema,
                });
            },
        },
    },
    Query: {
        blogById: (obj: any, args: any, context: any) => getBlog(args.id),
        blogs: () => blogs,
        blogsForUser: (obj: any, args: any) => getBlogsForUser(args.id),
    },
});

export default async () => {
    const {host, port, protocol} = getUser();
    const userSchema = await getSchema(`${protocol}://${host}:${port}/graphql`);
    return mergeSchemas({
        resolvers: remoteResolvers(userSchema),
        schemas: [
            userSchema,
            typeDefs,
        ],
    });
};
