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
    .min(8, 'Password must have more than 8 characters'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate request body
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

    // Create new user with default role 'USER'
    const newUser = await db.user.create({
      data: {
        username,
        email,
        password: hashPassword,
        role: 'USER', // Default role
      },
    });

    // Exclude password from the response
    const { password: newUserPassword, ...rest } = newUser;

    return NextResponse.json({ user: rest, message: "Utilisateur créé avec succès" }, { status: 201 });

  } catch (error: unknown) {
    // Handle Zod validation errors separately
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Validation Error", errors: error.errors }, { status: 400 });
    }

    // Check if error is an instance of the built-in Error class
    if (error instanceof Error) {
      console.error("Error creating user:", error.message);
      return NextResponse.json({ message: `Erreur 500: ${error.message}` }, { status: 500 });
    }

    // Handle any other unknown type of error
    console.error("Unknown error", error);
    return NextResponse.json({ message: "Erreur 500: An unknown error occurred" }, { status: 500 });
  }
}
