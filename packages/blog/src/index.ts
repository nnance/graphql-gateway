import {
    graphiqlHapi,
    graphqlHapi,
  } from "apollo-server-hapi";

import {
  makeExecutableSchema,
  mergeSchemas,
} from "graphql-tools";

import { GraphQLSchema } from "graphql";

import {
  blog,
  blogQuery,
  blogWithUser,
} from "schema";

import {
  getBlog as getBlogServer,
  getSchema,
  getUser,
  schemaCacher,
  startServer,
} from "core";

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

const getLocalSchema = async () => makeExecutableSchema({ typeDefs: [blog, blogQuery], resolvers });

const remoteResolvers = (schema: GraphQLSchema) => ({
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
  const {host, port, protocol} = getUser();
  const userSchema = await getSchema(`${protocol}://${host}:${port}/graphql`);
  return mergeSchemas({
      resolvers: [
          resolvers,
          remoteResolvers(userSchema),
      ],
      schemas: [
          userSchema,
          blogWithUser,
          blogQuery,
      ],
  });
};

startServer(getBlogServer(), schemaCacher(getLocalSchema, getRemoteSchema), graphqlHapi, graphiqlHapi);
