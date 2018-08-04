import {
    Instrumentation,
    option,
    Tracer,
  } from "zipkin";

import * as url from "url";

import {
    Request,
    ResponseToolkit,
    Server,
} from "hapi";

const headerOption = (headers: any) => (header: any) => {
    const val = headers[header.toLowerCase()];
    if (val != null) {
        return new option.Some(val);
    } else {
        return option.None;
    }
};

export interface IZipkinPluginOptions {
    port?: number;
    tracer: Tracer;
}

export const zipkinMiddleware = {
    name: "zipkin",
    register: (server: Server, options: IZipkinPluginOptions) => {
        const {tracer, port = 0} = options;

        const instrumentation = new Instrumentation.HttpServer({tracer, port});

        server.ext("onRequest", (request: Request, reply: ResponseToolkit) => {
            const {headers} = request;
            const readHeader = headerOption(headers);
            const plugins = request.plugins;

            tracer.scoped(() => {
                const id =
                    instrumentation.recordRequest(request.method, url.format(request.url), readHeader);

                (plugins as any).zipkin = {
                    traceId: id,
                };
            });
            return reply.continue;
        });

        server.ext("onPreResponse", (request: Request, reply: ResponseToolkit) => {
            const {response}: {response: any} = request;
            const statusCode = (response && response.isBoom) ? response.output.statusCode : response.statusCode;

            tracer.scoped(() =>
                instrumentation.recordResponse((request.plugins as any).zipkin.traceId, statusCode));

            return reply.continue;
        });
    },
};
