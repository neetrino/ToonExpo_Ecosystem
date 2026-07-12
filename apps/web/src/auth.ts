import { randomUUID } from 'node:crypto';

import { PrismaAdapter } from '@auth/prisma-adapter';
import { loginSchema } from '@toonexpo/contracts';
import { prisma } from '@toonexpo/db';
import NextAuth, { type NextAuthResult } from 'next-auth';
import { encode as defaultEncode } from 'next-auth/jwt';
import Credentials from 'next-auth/providers/credentials';

import { SESSION_MAX_AGE_SECONDS } from '@/lib/auth/constants';
import { verifyPassword } from '@/lib/auth/password';

const MILLISECONDS_PER_SECOND = 1000;

const adapter = PrismaAdapter(prisma);

/**
 * Auth.js 5 configuration with DATABASE sessions and a Credentials provider.
 *
 * KNOWN PITFALL: the Credentials provider forces Auth.js onto the JWT code path
 * and never persists a Session row on its own. The documented workaround is to
 * flag credentials logins in the `jwt` callback and override `jwt.encode`: for a
 * credentials token we create a real Session via the adapter and return its
 * `sessionToken` as the cookie value. Because the strategy is `database`, every
 * later request resolves that cookie through `adapter.getSessionAndUser`, so the
 * `session` callback receives the DB `user` (including `role`). Non-credentials
 * flows fall back to the default JWT encoder.
 *
 * IMPORTANT: `session.strategy` is intentionally NOT set to `'database'`. Auth.js
 * (@auth/core) refuses a credentials-only provider set when the *raw* config
 * declares `strategy: 'database'` (UnsupportedStrategy). Its config assertion
 * runs before defaults resolve and only inspects the raw value, so by omitting
 * `strategy` we pass the check while still getting database sessions: with an
 * adapter present the resolved default strategy is `'database'`.
 *
 * Cookies rely on Auth.js defaults (httpOnly, sameSite=lax, secure over HTTPS);
 * lifetime is driven by `session.maxAge`.
 *
 * Rate limiting for credentials sign-in / registration lives in the server
 * actions (`loginAction` / `registerAction`) so the UI can show `rateLimited`.
 */
// Exports are explicitly annotated to avoid the pnpm portability error (TS2742)
// where Auth.js's inferred `signIn`/`auth` types reference an internal
// `.pnpm/@auth+core` path. This is the workaround documented by Auth.js.
const nextAuth = NextAuth({
  adapter,
  session: { maxAge: SESSION_MAX_AGE_SECONDS },
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (raw) => {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
        });
        if (!user?.passwordHash) {
          return null;
        }

        const valid = await verifyPassword(user.passwordHash, parsed.data.password);
        if (!valid) {
          return null;
        }

        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, account }) => {
      if (account?.provider === 'credentials') {
        token.credentials = true;
      }
      return token;
    },
    session: async ({ session, user }) => {
      // GET /api/auth/session is client-exposed — whitelist safe fields only;
      // the raw `session` object carries DB row data (sessionToken, passwordHash, …).
      return {
        expires: session.expires,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        },
      };
    },
  },
  jwt: {
    encode: async (params) => {
      if (!params.token?.credentials) {
        return defaultEncode(params);
      }

      const userId = params.token.sub;
      if (!userId) {
        throw new Error('Credentials token is missing a user id');
      }
      if (!adapter.createSession) {
        throw new Error('Auth adapter does not support createSession');
      }

      const sessionToken = randomUUID();
      await adapter.createSession({
        sessionToken,
        userId,
        expires: new Date(Date.now() + SESSION_MAX_AGE_SECONDS * MILLISECONDS_PER_SECOND),
      });

      return sessionToken;
    },
  },
});

export const handlers: NextAuthResult['handlers'] = nextAuth.handlers;
export const auth: NextAuthResult['auth'] = nextAuth.auth;
export const signIn: NextAuthResult['signIn'] = nextAuth.signIn;
export const signOut: NextAuthResult['signOut'] = nextAuth.signOut;
