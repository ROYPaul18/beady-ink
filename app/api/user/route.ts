import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import * as z from 'zod';

const userSchema = z.object({
  username: z.string().min(1, 'Username is required').max(100),
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must have than 8 characters'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, username, password } = userSchema.parse(body);

    // Check if email or username already exists
    const existingUserByEmail = await db.user.findUnique({ where: { email } });
    const existingUserByUsername = await db.user.findUnique({ where: { username } });

    if (existingUserByEmail) {
      return NextResponse.json({ message: "Un utilisateur possède déjà cet email !" }, { status: 409 });
    }

    if (existingUserByUsername) {
      return NextResponse.json({ message: "Un utilisateur possède déjà ce pseudo !" }, { status: 409 });
    }

    const hashPassword = await hash(password, 10);

    // Créez un nouvel utilisateur avec un rôle par défaut "user"
    const newUser = await db.user.create({
      data: {
        username,
        email,
        password: hashPassword,
        role: 'USER', // Rôle par défaut
      },
    });

    const { password: newUserPassword, ...rest } = newUser;
    return NextResponse.json({ user: rest, message: "Utilisateur créé avec succès" }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ message: "Erreur 500" }, { status: 500 });
  }
}
