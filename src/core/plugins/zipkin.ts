import {
    BatchRecorder,
    ConsoleRecorder,
    ExplicitContext,
    TraceId,
    Tracer,
} from "zipkin";

import { HttpLogger } from "zipkin-transport-http";

import { zipkinMiddleware } from "../zipkin/zipkin-instrumentation-hapi";

export { Tracer } from "zipkin";

const zipkinHost = process.env.ZIPKIN_HOST || "http://zipkin:9411";

const recorderOptions = {
    logger: new HttpLogger({
      endpoint: `${zipkinHost}/api/v1/spans`,
    }),
};

export const getTracer = (localServiceName: string) => (id?: TraceId) => {
    const tracer = new Tracer({
        ctxImpl: new ExplicitContext(),
        localServiceName,
        recorder: zipkinHost ? new BatchRecorder(recorderOptions) : new ConsoleRecorder(),
    });
    if (id) {
        tracer.setId(id);
    }
    return tracer;
};

export const zipkin = (tracer: Tracer, port: string | undefined) => ({
    options: {
        port: parseInt(port || "0", 10),
        tracer,
    },
    plugin: zipkinMiddleware,
});
