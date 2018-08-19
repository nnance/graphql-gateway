import { Server } from "hapi";

import { IConsulOptions, registerWithConsul } from "./discovery";

export const consulMiddleware = {
    name: "consul",
    register: async (server: Server, options: IConsulOptions) => {
        server.route({
            handler: () => "OK",
            method: "GET",
            path: options.url || "/_health",
        });
        options.port = options.port || Number(server.info.port);
        await registerWithConsul(options);
    },
};
