import Consul from "consul";

interface IServiceNode {
    ID: string;
    Node: string;
    Address: string;
    Datacenter: string;
    ServiceID: string;
    ServiceTags: [string];
    ServiceName: string;
    ServiceAddress: string;
    ServicePort: number;
}

export interface IConsulOptions {
    port: number;
    serviceName: string;
    url?: string;
}

export const consul = Consul({
    host: "consul",
    port: "8500",
    promisify: true,
});

export async function getNodesForService(name: string) {
    return await consul.catalog.service.nodes("user") as [IServiceNode];
}

export function registerWithConsul(options: IConsulOptions) {
    return consul.agent.service.register({
        address: options.serviceName,
        check: {
          http: `http://${options.serviceName}:${options.port}/_health`,
          interval: "10s",
        },
        name: options.serviceName,
        port: options.port,
    });
}
