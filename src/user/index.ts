import {
  getBlog,
  getSchema,
  getUser,
  schemaCacher,
  startServer,
} from "../core";

import {
  makeExecutableSchema,
  mergeSchemas,
} from "graphql-tools";

import { GraphQLSchema } from "graphql";

import {
  user,
  userQuery,
  userWithBlogs,
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

const remoteResolvers = (schema: GraphQLSchema) => ({
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
          remoteResolvers(blogSchema),
      ],
      schemas: [
          blogSchema,
          userWithBlogs,
          userQuery,
      ],
  });
};

const getLocalSchema = async () => makeExecutableSchema({ typeDefs: [user, userQuery], resolvers });

startServer(getUser(), schemaCacher(getLocalSchema, getRemoteSchema));
