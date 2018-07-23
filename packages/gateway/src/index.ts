import {
  graphiqlHapi,
  graphqlHapi,
} from "apollo-server-hapi";

import {
  getBlog,
  getGateway,
  getSchema,
  getUser,
  IServerSettings,
  schemaCacher,
  startServer,
} from "core";

// import { startServer } from "./server";

import {
  makeExecutableSchema,
  mergeSchemas,
} from "graphql-tools";

const buildAddress = (getter: () => IServerSettings) =>
  `${getter().protocol}://${getter().host}:${getter().port}`;

const getRemoteSchema = async () => {
  const blog = process.env.BLOGADDR || buildAddress(getBlog);
  const user = process.env.USERADDR || buildAddress(getUser);

  return mergeSchemas({
      schemas: [
          await getSchema(`${blog}/graphql`),
          await getSchema(`${user}/graphql`),
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

const cacher = schemaCacher(getLocalSchema, getRemoteSchema);

startServer(getGateway(), cacher, graphqlHapi, graphiqlHapi);
