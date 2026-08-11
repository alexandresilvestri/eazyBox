import * as Sentry from "@sentry/bun";

Sentry.init({
  dsn: process.env.SENTRY_DSN_SERVER,
  tracesSampleRate: 1.0,
});

export { Sentry };
