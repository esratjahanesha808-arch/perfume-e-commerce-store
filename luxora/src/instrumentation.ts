export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { assertProductionEnv } = await import("@/lib/env");
    assertProductionEnv();

    if (process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN) {
      await import("../sentry.server.config");
    }
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    if (process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN) {
      await import("../sentry.server.config");
    }
  }
}
