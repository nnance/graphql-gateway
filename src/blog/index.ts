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
    getUser,
    schemaCacher,
    startServer,
} from "../core";

import {
    getAll,
    getBlog,
    getBlogsForUser,
} from "./impl";

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

const getRemoteSchema = async () => {
  const {hostname, port, protocol} = getUser();
  const userSchema = await getSchema(`${protocol}//${hostname}:${port}/graphql`);
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

startServer(getHost(blogPort), schemaCacher(getLocalSchema, getRemoteSchema));
