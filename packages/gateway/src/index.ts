import {
  getBlog,
  getGateway,
  getSchema,
  getUser,
  schemaCacher,
  startServer,
} from "core";

import {
  makeExecutableSchema,
  mergeSchemas,
} from "graphql-tools";

const getRemoteSchema = async () => {
  const blog = getBlog();
  const user = getUser();

  return mergeSchemas({
      schemas: [
          await getSchema(`${blog.protocol}://${blog.host}:${blog.port}/graphql`),
          await getSchema(`${user.protocol}://${user.host}:${user.port}/graphql`),
      ],
  });
};

const typeDefs = `
type Query {
  serverTime: String
}
`;

const resolvers = {
  Query: {
      serverTime: () => (new Date()).toLocaleString(),
  },
};

const getLocalSchema = async () => makeExecutableSchema({ typeDefs, resolvers });

startServer(getGateway(), schemaCacher(getLocalSchema, getRemoteSchema));
