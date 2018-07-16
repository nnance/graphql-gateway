export interface IServerSettings {
    host: string;
    port: string;
    protocol: string;
}

export const getGateway = () => ({
    host: "localhost",
    port: "3000",
    protocol: "http",
});

export const getBlog = () => ({
    host: "localhost",
    port: "3010",
    protocol: "http",
});

export const getUser = () => ({
    host: "localhost",
    port: "3011",
    protocol: "http",
});
