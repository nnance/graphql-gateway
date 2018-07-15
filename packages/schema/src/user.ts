import { gql } from "apollo-server";

export const user = gql`
type User {
    _id: ID!
    username: String
}
`;

export const userWithBlogs = gql`
type User {
    _id: ID!
    username: String
    blogs: [Blog]
}
`;

export const userQuery = gql`
    type Query {
        users: [User]
        userById(id: ID!): User
    }
`;
