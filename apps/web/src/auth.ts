/**
 * Nest-backed session accessor. Prefer `@/lib/auth/get-session` for new code.
 * Kept as `@/auth` so existing imports keep working during the migration.
 */
export { auth, getSession } from '@/lib/auth/get-session';
