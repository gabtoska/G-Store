import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/validation";
import { DUMMY_PASSWORD_HASH, verifyPassword } from "@/lib/password";
import { rateLimit } from "@/server/rate-limit";
import { AppError } from "@/lib/errors";

export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
  providers: [
    Credentials({
      credentials: { email: { type: "email" }, password: { type: "password" } },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;
        try {
          await rateLimit("login", email, 10, 15 * 60 * 1000);
        } catch (error) {
          if (error instanceof AppError && error.status === 429) return null;
          throw error;
        }
        const user = await db.user.findUnique({ where: { email } });
        const valid = await verifyPassword(
          password,
          user?.passwordHash ?? DUMMY_PASSWORD_HASH,
        );
        if (!user || !valid) return null;
        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.sub = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      return session;
    },
  },
});
