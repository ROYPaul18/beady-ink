import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { db } from "./db";
import { compare } from "bcrypt";
import { User } from "next-auth";

interface ExtendedUser extends User {
  nom?: string;
  prenom?: string;
  role?: string;
}

export const authOptions: NextAuthOptions = {
  
  adapter: PrismaAdapter(db),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/sign-in",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "MarieRoy@aol.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const existingUser = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!existingUser) {
          return null;
        }

        const passwordMatch = await compare(
          credentials.password,
          existingUser.password
        );

        if (!passwordMatch) {
          return null;
        }

        // Renvoie les champs `nom`, `prenom`, `email` et `role` au lieu de `username`
        return {
          id: String(existingUser.id),
          nom: existingUser.nom,
          prenom: existingUser.prenom,
          email: existingUser.email,
          role: existingUser.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const extendedUser = user as ExtendedUser;
        token = {
          ...token,
          nom: extendedUser.nom,
          prenom: extendedUser.prenom,
          role: extendedUser.role,
        };
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          nom: token.nom,
          prenom: token.prenom,
          role: token.role,
        },
      };
    },
  },
};
