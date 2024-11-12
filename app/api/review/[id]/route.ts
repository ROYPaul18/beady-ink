import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

// Schéma de validation pour les données de l'avis
const reviewSchema = z.object({
  rating: z.number().min(1).max(5), // La note doit être comprise entre 1 et 5
  comment: z.string().min(1, "Le commentaire ne peut pas être vide"),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const prestationId = parseInt(params.id, 10);
    if (isNaN(prestationId)) {
      return NextResponse.json({ message: "ID de prestation invalide" }, { status: 400 });
    }

    const { rating, comment } = await req.json();
    const parsedData = reviewSchema.safeParse({ rating, comment });

    if (!parsedData.success) {
      return NextResponse.json({ message: "Données de l'avis invalides", errors: parsedData.error.errors }, { status: 400 });
    }

    // Création de l'avis dans la base de données
    const newReview = await db.review.create({
      data: {
        rating: parsedData.data.rating,
        comment: parsedData.data.comment,
        prestationId: prestationId,
        userId: 1, // Remplacez par l'ID utilisateur authentifié
      },
    });

    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de l'avis :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
