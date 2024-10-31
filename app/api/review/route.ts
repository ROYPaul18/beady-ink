import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Route pour obtenir tous les avis
export async function GET(req: Request) {
  try {
    const reviews = await db.review.findMany({
      include: {
        user: true, // Inclure les informations de l'utilisateur
        prestation: {
          select: { name: true }, // Inclure uniquement le nom de la prestation
        },
      },
    });
    return NextResponse.json(reviews, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération des avis :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
