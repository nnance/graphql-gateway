import {
    makeExecutableSchema,
} from "graphql-tools";

interface IUser {
    _id: number;
    blogs?: string[];
    username: string;
}

const user = (id: number, username: string, blogs?: string[]) => ({
    _id: id, blogs, username,
});

const users = [
    user(1, "test-user-1"),
    user(2, "test-user-2"),
    user(3, "test-user-3"),
];

const userById = (id: number) => {
    // tslint:disable-next-line:no-console
    console.log(`queryUser: ${id}`);
    return users.find((u) => u._id === id);
};

const typeDefs = `
    type User {
        _id: ID!
        username: String
        blogs: [String]
    }
    type Query {
        users: [User]
    }
`;

const resolvers = {
    Query: {
        users: () => users,
    },
};

export default makeExecutableSchema({typeDefs, resolvers});
