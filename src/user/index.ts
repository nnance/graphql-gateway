import {
    getBlog,
    getHost,
    getSchema,
    getTracer,
    schemaCacher,
    startServer,
    userPort,
    zipkinFetcher,
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

const serviceName = "user";

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

const tracer = getTracer(serviceName);

const getRemoteSchema = async () => {
  const {hostname, port, protocol} = getBlog();

  const blogSchema = await getSchema(tracer, "blog", `${protocol}//${hostname}:${port}/graphql`);
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

const host = getHost(userPort);
const schemaFetcher = schemaCacher(getLocalSchema, getRemoteSchema);
startServer(tracer(), host, schemaFetcher);
