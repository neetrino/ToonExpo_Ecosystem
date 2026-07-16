/**
 * Whether Nest Swagger UI should be mounted at `/docs`.
 * Enabled outside production, or when SWAGGER_ENABLED=true explicitly.
 */
export function shouldEnableSwagger(env: { NODE_ENV: string; SWAGGER_ENABLED?: boolean }): boolean {
  if (env.SWAGGER_ENABLED === true) {
    return true;
  }
  return env.NODE_ENV !== 'production';
}
