import url from "url";
import { getNodesForService } from "../core/consul/discovery";

const hostname =
    (process.env.NODE_ENV === "docker" || process.env.NODE_ENV === "kubernetes") ? "0.0.0.0" : "localhost";

export const gatwayPort = 3000;
export const blogPort = 3010;
export const userPort = 3011;

export const getHost = (port: number) =>
    url.parse(`http://${hostname}:${port}`);

export const getGateway = () =>
    getHost(gatwayPort);

export const getBlog = async () => {
    if (process.env.BLOGADDR) {
        return url.parse(process.env.BLOGADDR);
    } else if (process.env.NODE_ENV === "docker") {
        const nodes = await getNodesForService("blog");
        return url.parse(`http://${nodes[0].ServiceAddress}:${nodes[0].ServicePort}`);
    } else if (process.env.NODE_ENV === "kubernetes") {
        return url.parse(`http://${process.env.BLOG_SERVICE_HOST}:${process.env.BLOG_SERVICE_PORT}`);
    } else {
        return url.parse(`http://${hostname}:${blogPort}`);
    }
};

export const getUser = async () => {
    if (process.env.USERADDR) {
        return url.parse(process.env.USERADDR);
    } else if (process.env.NODE_ENV === "docker") {
        const nodes = await getNodesForService("user");
        return url.parse(`http://${nodes[0].ServiceAddress}:${nodes[0].ServicePort}`);
    } else if (process.env.NODE_ENV === "kubernetes") {
        return url.parse(`http://${process.env.USER_SERVICE_HOST}:${process.env.USER_SERVICE_PORT}`);
    } else {
        return url.parse(`http://${hostname}:${userPort}`);
    }
};
