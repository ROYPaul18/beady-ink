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
    
    // Check if email or username already exists in a single query
    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });
    
    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json(
          { message: "Un utilisateur possède déjà cet email !" }, 
          { status: 409 }
        );
      }
      if (existingUser.username === username) {
        return NextResponse.json(
          { message: "Un utilisateur possède déjà ce pseudo !" }, 
          { status: 409 }
        );
      }
    }
    
    const hashedPassword = await hash(password, 10);
    
    // Create new user
    const newUser = await db.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: 'USER',
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        // Explicitly exclude password
      }
    });
    
    return NextResponse.json(
      { user: newUser, message: "Utilisateur créé avec succès" }, 
      { status: 201 }
    );
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Erreur de validation", errors: error.errors }, 
        { status: 400 }
      );
    }
    
    console.error("Erreur lors de la création de l'utilisateur:", error);
    
    return NextResponse.json(
      { message: "Une erreur est survenue lors de la création de l'utilisateur" }, 
      { status: 500 }
    );
  }
}