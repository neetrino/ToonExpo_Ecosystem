import { authErrorCodeSchema, type AuthErrorCode } from '@toonexpo/contracts';

export class ApiClientError extends Error {
  readonly status: number;
  readonly code: AuthErrorCode | 'UNKNOWN' | 'NETWORK';
  readonly body: unknown;

  constructor(
    status: number,
    code: AuthErrorCode | 'UNKNOWN' | 'NETWORK',
    message: string,
    body?: unknown,
  ) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
    this.body = body;
  }
}

export function mapAuthErrorCode(code: string | undefined): AuthErrorCode | 'UNKNOWN' {
  const parsed = authErrorCodeSchema.safeParse(code);
  return parsed.success ? parsed.data : 'UNKNOWN';
}

/** Reads a domain error key from the API exception payload. */
export function getApiErrorKey(error: unknown): string | null {
  if (!(error instanceof ApiClientError)) {
    return null;
  }
  const body = error.body;
  if (!body || typeof body !== 'object' || !('error' in body)) {
    return null;
  }
  return typeof body.error === 'string' ? body.error : null;
}
