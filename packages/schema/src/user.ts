export const user = `
type User {
    _id: ID!
    username: String
}
`;

export const userWithBlogs = `
type User {
    _id: ID!
    username: String
    blogs: [Blog]
}
`;

export const userQuery = `
    type Query {
        users: [User]
        userById(id: ID!): User
    }
`;
