export const user = `
type User {
    _id: ID!
    username: String
}

type Query {
    users: [User]
    userById(id: ID!): User
}
`;

export const userLinks = `
extend type User {
    blogs: [Blog]
}
`;
