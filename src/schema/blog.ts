export const blog = `
type Blog {
    _id: ID!
    title: String!
    text: String
}

type Query {
    blogs: [Blog]
    blogById(id: ID!): Blog
    blogsForUser(id: ID!): [Blog]
}
`;

export const blogLinks = `
extend type Blog {
    user: User
}
`;
