import {
    makeExecutableSchema,
} from "graphql-tools";

interface IUser {
    _id: string;
    blogs?: string[];
    username: string;
}

const user = (id: string, username: string, blogs?: string[]): IUser => ({
    _id: id, blogs, username,
});

const users = [
    user("1", "test-user-1"),
    user("2", "test-user-2"),
    user("3", "test-user-3"),
];

const userById = (id: string) => {
    return users.find((u) => u._id === id);
};

const typeDefs = `
    type User {
        _id: ID!
        username: String
        blogs: [ID!]
    }
    type Query {
        users: [User]
        userById(id: ID!): User
    }
`;

const resolvers = {
    Query: {
        userById: (obj: any, args: any) => userById(args.id),
        users: () => users,
    },
};

export default makeExecutableSchema({typeDefs, resolvers});
