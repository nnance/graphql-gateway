import { setContext } from "apollo-link-context";
import { createHttpLink } from "apollo-link-http";

import { TraceId } from "zipkin";

import { Tracer } from "./plugin";

import { Fetcher } from "../schema-stitching";

export type TracerForId = (id?: TraceId) => Tracer;

const zipkinFetcher = (options: {tracer: Tracer, remoteServiceName: string}): Fetcher =>
    require("zipkin-instrumentation-fetch")(require("node-fetch"), options);

const zipkinFetch = (tracer: TracerForId, serviceName: string) => (uri: string, options: any) => {
    const traceId = options.headers["X-B3-TraceId"];
    const fetcher = zipkinFetcher({
        remoteServiceName: serviceName,
        tracer: tracer(traceId),
    });
    return fetcher(uri, options);
};

export const zipkinLink = (tracer: TracerForId, serviceName: string, remoteURI: string) => {
    const fetch = zipkinFetch(tracer, serviceName);
    const http = createHttpLink({uri: remoteURI, fetch });

    return setContext((request, prevContext) => {
        const traceId = prevContext.graphqlContext ? (prevContext.graphqlContext.zipkin as TraceId).traceId : undefined;
        return { headers: { "X-B3-TraceId": traceId } };
    }).concat(http);
};
