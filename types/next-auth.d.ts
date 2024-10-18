import NextAuth from "next-auth";

// Ajouter les propriétés `nom` et `prenom` au type User dans NextAuth
declare module "next-auth" {
  interface User {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    role: string;
  }

  interface Session {
    user: {
      id: string;
      nom: string;
      prenom: string;
      email: string;
      role: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    role: string;
  }
}
