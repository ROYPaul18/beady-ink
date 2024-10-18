import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import { db } from "@/lib/db";  // Modifier selon votre configuration
import * as z from "zod";

// Schéma de validation des données d'inscription
const userSchema = z.object({
  nom: z.string().min(1, "Le nom est requis").max(100),
  prenom: z.string().min(1, "Le prénom est requis").max(100),
  telephone: z.string().regex(/^(\d{10}|\d{2} \d{2} \d{2} \d{2} \d{2})$/, "Le numéro de téléphone doit être au format 1234567890 ou 12 34 56 78 90"),
  email: z.string().email("L'email est invalide"),
  password: z.string().min(8, "Le mot de passe doit comporter au moins 8 caractères"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, nom, prenom, telephone, password } = userSchema.parse(body);

    // Vérifier si l'email ou le numéro de téléphone existe déjà
    const existingUserByEmail = await db.user.findUnique({ where: { email } });
    if (existingUserByEmail) {
      return NextResponse.json({ message: "Un utilisateur avec cet email existe déjà !" }, { status: 409 });
    }

    const existingUserByPhone = await db.user.findFirst({ where: { telephone } });
    if (existingUserByPhone) {
      return NextResponse.json({ message: "Un utilisateur avec ce numéro de téléphone existe déjà !" }, { status: 409 });
    }

    // Hacher le mot de passe avant de l'enregistrer
    const hashedPassword = await hash(password, 10);

    // Créer un nouvel utilisateur
    const newUser = await db.user.create({
      data: {
        nom,
        prenom,
        telephone,
        email,
        password: hashedPassword,
        role: 'USER',
      },
    });

    // Exclure le mot de passe de la réponse
    const { password: _, ...rest } = newUser;

    // Retourner la réponse de succès
    return NextResponse.json({ user: rest, message: "Utilisateur créé avec succès" }, { status: 201 });

  } catch (error) {
    // Gérer les erreurs de validation Zod
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Erreur de validation", errors: error.errors }, { status: 400 });
    }

    // Gérer les erreurs inattendues
    console.error("Erreur lors de l'inscription :", error);
    return NextResponse.json({ message: "Erreur 500: Une erreur est survenue" }, { status: 500 });
  }
}
