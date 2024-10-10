import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import * as z from 'zod';

// définition du schéma pour la validation de l'input

const userSchema = z
  .object({
    username: z.string().min(1, 'Username is required').max(100),
    email: z.string().min(1, 'Email is required').email('Invalid email'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must have than 8 characters'),
  })

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, username, password } = userSchema.parse(body);

    // check if email is already exists
    const existingUserByEmail = await db.user.findUnique({
        where: { email: email },
      });
    if (existingUserByEmail) {
      return NextResponse.json(
        {
          user: null,
          message: "Un utilisateur possède déja cette adresse email !",
        },
        { status: 409 }
      );
    }

    // check if username is already exists
    const existingUserByUsername = await db.user.findUnique({
      where: { username: username },
    });
    if (existingUserByUsername) {
      return NextResponse.json(
        { user: null, message: "Un utilisateur possède déja ce pseaudo !" },
        { status: 409 }
      );
    }
    const hashPassword = await hash(password, 10);
    const newUser = await db.user.create({
      data: {
        username,
        email,
        password: hashPassword,
      },
    });
    const { password: newUserPassword, ...rest } = newUser;

    return NextResponse.json(
      { user: rest, message: "Utilisateur créer avec succes" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
        { message: "Erreur 500 " },
        { status: 500 }
      );
  }
}
