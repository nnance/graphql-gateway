import {
    collectDefaultMetrics,
    Histogram,
    register,
    Summary,
} from "prom-client";

collectDefaultMetrics({ timeout: 5000 });

const metric = {
    http: {
        requests: {
            buckets: new Histogram({
                buckets: [ 500, 2000 ],
                help: "request duration in buckets ms. Bucket size set to 500 and 2000 ms with a T of 300ms",
                labelNames: ["method", "path", "cardinality", "status"],
                name: "http_request_buckets_milliseconds",
            }),
            duration: new Summary({
                help: "request duration in milliseconds",
                labelNames: ["method", "path", "cardinality", "status"],
                name: "http_request_duration_milliseconds",
            }),
        },
    },
};

function ms(start: [number, number]) {
    const diff = process.hrtime(start);
    return Math.round((diff[0] * 1e9 + diff[1]) / 1000000);
}

function parse(path: string) {
    const ret = {
        cardinality: "many",
        path,
    };

    if (path[path.length - 1] !== "/") {
        if (!path.includes(".")) {
            ret.path = path.substr(0, path.lastIndexOf("/") + 1);
        }
        ret.cardinality = "one";
    }

    return ret;
}

export function observe(method: string, path: string, statusCode: undefined | string, start: [number, number]) {
    path = path ? path.toLowerCase() : "";

    if (path !== "/metrics" && path !== "/metrics/") {
        const duration = ms(start);
        method = method.toLowerCase();

        const split = parse(path);
        statusCode = statusCode || "";
        metric.http.requests.duration.labels(method, split.path, split.cardinality, statusCode).observe(duration);
        metric.http.requests.buckets.labels(method, split.path, split.cardinality, statusCode).observe(duration);
    }
}

export const summary = () => register.metrics();
