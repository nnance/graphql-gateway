import { prometheusMiddleware } from "../prometheus/prometheus-hapi";

export const prometheus = (url?: string) => ({
    options: { url },
    plugin: prometheusMiddleware,
});
