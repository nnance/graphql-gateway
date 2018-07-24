import url from "url";

const hostname = process.env.NODE_ENV === "docker" ? "0.0.0.0" : "localhost";

export const getGateway = () =>
    url.parse(`http://${hostname}:3000`);

export const getBlog = () =>
    url.parse(process.env.BLOGADDR || `http://${hostname}:3010`);

export const getUser = () =>
    url.parse(process.env.USERADDR || `http://${hostname}:3011`);
