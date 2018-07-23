interface IBlog {
    _id: string;
    title: string;
    user?: string;
    text?: string;
}

const blogFactory = (id: string, title: string, userId?: string, text?: string): IBlog => ({
    _id: id, text, title, user: userId,
});

const blogs = [
    blogFactory("1", "Blog Post 1", "1"),
    blogFactory("2", "Blog Post 2", "3"),
    blogFactory("3", "Blog Post 3", "3"),
];

export const getBlog = (id: string) => blogs.find((u) => u._id === id);
export const getBlogsForUser = (id: string) => blogs.filter((u) => u.user === id);
export const getAll = () => blogs;
