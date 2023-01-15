import { FastifyInstance, RouteHandlerMethod } from "fastify";
import fastifyPlugin from "fastify-plugin";
import promClient from "prom-client";

/*
type Label = "method" | "status_code" | "route";
type ReqMetrics = {
  history(labels: LabelValues<Label>): number;
  summary(labels: LabelValues<Label>): number;
};
*/

export class FastifyMetrics {
  private fastify: FastifyInstance;
  private client: typeof promClient;

  /*
  private metricsStorage: WeakMap<FastifyRequest, ReqMetrics>;

  private histogram: Histogram<Label>;
  private summary: Summary<Label>;
  */

  constructor(
    fastify: FastifyInstance,
    client: typeof promClient,
    option: {
      clearRegisterOnInit: boolean;
    }
  ) {
    this.fastify = fastify;
    this.client = client;

    // this.metricsStorage = new WeakMap();

    if (option.clearRegisterOnInit) this.client.register.clear();

    /*
    this.histogram = new this.client.Histogram({
      name: "http_request_duration_seconds",
      help: "request duration in seconds",
      labelNames: ["method", "status_code", "route"],
    }) satisfies Histogram<Label>;
    this.summary = new this.client.Summary({
      name: "http_request_summary_seconds",
      help: "request duration in seconds summary",
      labelNames: ["method", "status_code", "route"],
    }) satisfies Summary<Label>;
    */

    // this.collect();
    this.expose();
  }

  private async expose() {
    const globalRegistry = this.client.register;

    const handler: RouteHandlerMethod = async (_req, reply) => {
      const merged = globalRegistry;
      const metrics = await globalRegistry.metrics();
      reply.type(merged.contentType).send(metrics);
    };

    await this.fastify.route({
      url: "/metrics",
      method: "GET",
      handler,
    });
  }

  /*
  private async collect() {
    this.fastify
      .addHook("onRequest", (req, reply, done) => {
        this.metricsStorage.set(req, {
          history: this.histogram.startTimer(),
          summary: this.summary.startTimer(),
        });
        done();
      })
      .addHook("onResponse", (req, reply, done) => {
        const metrics = this.metricsStorage.get(req);
        if (!metrics) return done();

        const status = reply.statusCode;
        const route = req.routerPath;
        const method = req.method;

        const labels = {
          method,
          route,
          status_code: status,
        } satisfies LabelValues<Label>;

        metrics.history(labels);
        metrics.summary(labels);

        done();
      });
  }
  */
}

export type FastifyMetricsOptions = {
  name?: string;

  endpoint: string;

  clearRegisterOnInit?: boolean;
};

export default fastifyPlugin<FastifyMetricsOptions>(
  async (fastify, options) => {
    const { name = "metrics", clearRegisterOnInit = false } = options;

    const fm = new FastifyMetrics(fastify, promClient, { clearRegisterOnInit });
    fastify.decorate<FastifyMetrics>(name, fm);
  },
  {
    fastify: ">=4.0.0",
    name: "fastify-metrics",
  }
);
