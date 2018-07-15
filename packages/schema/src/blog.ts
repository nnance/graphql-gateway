export const blog = `
type Blog {
    _id: ID!
    title: String!
    text: String
}
`;

export const blogWithUser = `
type Blog {
    _id: ID!
    title: String!
    text: String
    user: User
}
`;

export const blogQuery = `
type Query {
    blogs: [Blog]
    blogById(id: ID!): Blog
    blogsForUser(id: ID!): [Blog]
}
`;
