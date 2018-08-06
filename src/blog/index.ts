import {
    makeExecutableSchema,
    mergeSchemas,
} from "graphql-tools";

import { GraphQLSchema } from "graphql";

import {
    blog as typeDefs,
    blogLinks,
} from "../schema";

import {
    blogPort,
    getHost,
    getSchema,
    getTracer,
    getUser,
    schemaCacher,
    startServer,
    zipkinLink,
} from "../core";

import {
    getAll,
    getBlog,
    getBlogsForUser,
} from "./impl";

const serviceName = "blog";

const resolvers = {
  Query: {
    blogById: (obj: any, args: any, context: any) => getBlog(args.id),
    blogs: getAll,
    blogsForUser: (obj: any, args: any) => getBlogsForUser(args.id),
  },
};

const getLocalSchema = async () => makeExecutableSchema({ typeDefs, resolvers });

const linkResolvers = (schema: GraphQLSchema) => ({
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
                schema,
              });
          },
      },
  },
});

const tracer = getTracer(serviceName);

const getRemoteSchema = async () => {
  const {hostname, port, protocol} = getUser();

  const userSchema = await getSchema(zipkinLink(tracer, "user", `${protocol}//${hostname}:${port}/graphql`));

  return mergeSchemas({
    resolvers: [
        resolvers,
        linkResolvers(userSchema),
    ],
    schemas: [
        typeDefs,
        blogLinks,
        userSchema,
    ],
  });
};

const host = getHost(blogPort);
const schemaFetcher = schemaCacher(getLocalSchema, getRemoteSchema);
startServer(tracer(), host, schemaFetcher);
