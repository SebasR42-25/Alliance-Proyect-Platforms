import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import MicrosoftEntraId from 'next-auth/providers/microsoft-entra-id';
import Facebook from 'next-auth/providers/facebook';
import Credentials from 'next-auth/providers/credentials';

const API_URL = process.env.API_URL ?? 'http://localhost:3000/api';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    MicrosoftEntraId({
      clientId:     process.env.MICROSOFT_CLIENT_ID!,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
      issuer:       `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}/v2.0`,
    }),
    Facebook({
      clientId:     process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {
        email:    { label: 'Email',      type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email:    credentials.email,
              password: credentials.password,
            }),
          });
          if (!res.ok) return null;
          const data = await res.json();
          return {
            id:          data.user.id,
            name:        data.user.name,
            email:       data.user.email,
            accessToken: data.access_token,
          };
        } catch {
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.accessToken = (user as { accessToken?: string }).accessToken;
        token.userId      = user.id;
      }

      if (account && account.provider !== 'credentials' && profile) {
        try {
          const res = await fetch(`${API_URL}/auth/oauth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              provider: account.provider,
              email:    profile.email,
              name:     profile.name,
              avatar:   (profile as { picture?: string }).picture ?? null,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            token.accessToken = data.access_token;
            token.userId      = data.user.id;
          }
        } catch (e) {
          console.error('[NextAuth] OAuth backend login failed:', e);
        }
      }
      return token;
    },

    async session({ session, token }) {
      session.accessToken  = token.accessToken as string | undefined;
      session.user.id      = (token.userId ?? token.sub) as string;
      return session;
    },
  },

  pages: {
    signIn:  '/login',
    error:   '/login',
  },

  session: { strategy: 'jwt' },
});
