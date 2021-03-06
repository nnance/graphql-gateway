import {
  getBlog,
  getGateway,
  getSchema,
  getTracer,
  getUser,
  schemaCacher,
  startServer,
  zipkinLink,
} from "../core";

import {
  makeExecutableSchema,
  mergeSchemas,
} from "graphql-tools";

const serviceName = "gateway";

const tracer = getTracer(serviceName);

const getRemoteSchema = async () => {
  const blog = getBlog();
  const user = getUser();

  return mergeSchemas({
      schemas: [
          await getSchema(zipkinLink(tracer, "blog", `${blog.protocol}//${blog.hostname}:${blog.port}/graphql`)),
          await getSchema(zipkinLink(tracer, "user", `${user.protocol}//${user.hostname}:${user.port}/graphql`)),
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

const host = getGateway();
const schemaFetcher = schemaCacher(getLocalSchema, getRemoteSchema);
startServer(tracer(), host, schemaFetcher);
