import {
    getBlog,
    getHost,
    getSchema,
    schemaCacher,
    startServer,
    userPort,
} from "../core";

import {
    makeExecutableSchema,
    mergeSchemas,
} from "graphql-tools";

import { GraphQLSchema } from "graphql";

import {
    user as typeDefs,
    userLinks,
} from "../schema";

import {
    allUsers,
    userById,
} from "./impl";

const resolvers = {
  Query: {
    userById: (obj: any, args: any, context: any) => userById(args.id),
    users: allUsers,
  },
};

const linkResolvers = (schema: GraphQLSchema) => ({
  User: {
      blogs: {
          fragment: "fragment UserFragment on User { _id }",
          resolve(parent: any, args: any, context: any, info: any) {
              return info.mergeInfo.delegateToSchema({
                args: {
                    id: parent._id,
                },
                context,
                fieldName: "blogsForUser",
                info,
                operation: "query",
                schema,
              });
          },
      },
  },
});

const getRemoteSchema = async () => {
  const {hostname, port, protocol} = getBlog();
  const blogSchema = await getSchema(`${protocol}//${hostname}:${port}/graphql`);
  return mergeSchemas({
    resolvers: [
    resolvers,
        linkResolvers(blogSchema),
    ],
    schemas: [
        typeDefs,
        userLinks,
        blogSchema,
    ],
  });
};

const getLocalSchema = async () => makeExecutableSchema({ typeDefs, resolvers });

startServer("user", getHost(userPort), schemaCacher(getLocalSchema, getRemoteSchema));
