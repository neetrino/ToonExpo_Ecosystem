import * as Sentry from "@sentry/nestjs";

import {
  NODE_ENV_DEVELOPMENT,
  NODE_ENV_PRODUCTION,
  NODE_ENV_TEST,
} from "./common/constants/app.constants.js";
import { SENTRY_TRACES_SAMPLE_RATE } from "./config/sentry.constants.js";

const emptyToUndefined = (value: string | undefined): string | undefined => {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
};

const resolveNodeEnv = (): "development" | "production" | "test" => {
  const nodeEnv = process.env["NODE_ENV"];

  if (nodeEnv === NODE_ENV_PRODUCTION) {
    return NODE_ENV_PRODUCTION;
  }

  if (nodeEnv === NODE_ENV_TEST) {
    return NODE_ENV_TEST;
  }

  return NODE_ENV_DEVELOPMENT;
};

const dsn = emptyToUndefined(process.env["SENTRY_DSN"]);

if (dsn) {
  Sentry.init({
    dsn,
    environment: resolveNodeEnv(),
    tracesSampleRate: SENTRY_TRACES_SAMPLE_RATE,
  });
}
