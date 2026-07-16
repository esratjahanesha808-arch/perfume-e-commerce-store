import { NextResponse } from "next/server";

/** Standard API error envelope: `{ error: { code, message, details? } }` */
export type ApiErrorPayload = {
  error: {
    code: string;
    message: string | Record<string, unknown>;
    details?: unknown;
  };
};

export function apiError(
  code: string,
  message: string | Record<string, unknown>,
  status: number,
  details?: unknown
) {
  const body: ApiErrorPayload = {
    error: details === undefined ? { code, message } : { code, message, details },
  };
  return NextResponse.json(body, { status });
}

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

/** Structured route error log — keeps message + stack without leaking to clients. */
export function logApiError(route: string, err: unknown) {
  if (err instanceof Error) {
    console.error(`[${route}]`, err.message, err.stack);
    return;
  }
  console.error(`[${route}]`, err);
}
