import {
    makeExecutableSchema,
} from "graphql-tools";

interface IBlog {
    _id: number;
    user: string;
    title: string;
    text?: string;
}

const blog = (id: number, user: string, title: string, text?: string) => ({
    _id: id, text, title, user,
});

const blogs = [
    blog(1, "test-user-1", "Blog Post 1"),
    blog(2, "test-user-2", "Blog Post 2"),
    blog(3, "test-user-3", "Blog Post 3"),
];

const typeDefs = `
    type Blog {
        _id: ID!
        user: String
        title: String!
        text: String
    }

    type Query {
        blogs: [Blog]
    }
`;

const resolvers = {
    Query: {
        blogs: () => blogs,
    },
};

export default makeExecutableSchema({typeDefs, resolvers});
