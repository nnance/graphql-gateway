export interface IUser {
    _id: string;
    blogs?: string[];
    username: string;
}

const userFactory = (id: string, username: string, blogs?: string[]): IUser => ({
    _id: id, blogs, username,
});

const users = [
    userFactory("1", "test-user-1"),
    userFactory("2", "test-user-2"),
    userFactory("3", "test-user-3"),
];

export const userById = (id: string) => users.find((u) => u._id === id);
export const allUsers = () => users;
