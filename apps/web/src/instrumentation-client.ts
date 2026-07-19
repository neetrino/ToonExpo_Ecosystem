import * as Sentry from "@sentry/nextjs";

import { createSentryOptions } from "@/shared/config/sentry.config";

const options = createSentryOptions();

if (options) {
  Sentry.init(options);
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
