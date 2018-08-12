import {
    Request,
    ResponseObject,
    ResponseToolkit,
    Server,
} from "hapi";

import * as Boom from "boom";

import {
    observe,
    summary,
} from "./metrics";

function isBoom(x: ResponseObject | Boom): x is Boom {
    return (x as Boom).isBoom;
}

function getStatusCode(x: null | ResponseObject | Boom) {
    if (x) {
        return isBoom(x) ? x.output.statusCode.toString() : x.statusCode.toString();
    } else {
        return undefined;
    }
}

export interface IPrometheusPluginOptions {
    url: string;
}

export const prometheusMiddleware = {
    name: "prometheus",
    register: (server: Server, options: IPrometheusPluginOptions) => {
        server.route({
            handler: (req: Request, reply: ResponseToolkit) => {
                const resp = reply.response(summary());
                resp.type("text/plain");
                return resp;
            },
            method: "GET",
            path: options.url || "/metrics",
        });

        server.ext("onRequest", (request: Request, reply: ResponseToolkit) => {
            (request as any).plugins.epimetheus = {
                start: process.hrtime(),
            };
            return reply.continue;
        });

        server.ext("onPreResponse", (request: Request, reply: ResponseToolkit) => {
            const statusCode = getStatusCode(request.response);

            observe(request.method, request.path, statusCode, (request as any).plugins.epimetheus.start);
            return reply.continue;
        });
    },
};
