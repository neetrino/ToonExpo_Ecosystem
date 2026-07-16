import type { PlatformRole } from '@toonexpo/domain';
import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: PlatformRole;
    } & DefaultSession['user'];
  }

  interface User {
    role: PlatformRole;
  }
}

declare module '@auth/core/adapters' {
  interface AdapterUser {
    role: PlatformRole;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    /** Marks tokens minted by the Credentials provider so a DB session is created. */
    credentials?: boolean;
  }
}
