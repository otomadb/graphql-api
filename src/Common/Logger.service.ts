import { Logger } from "pino";

export const mkLoggerService = ({ pinoLogger: logger }: { pinoLogger: Logger }) => {
  return {
    fatal: logger.fatal,
    error: logger.error,
    warn: logger.warn,
    info: logger.info,
    debug: logger.debug,
    trace: logger.trace,
  };
};

export type LoggerService = ReturnType<typeof mkLoggerService>;
