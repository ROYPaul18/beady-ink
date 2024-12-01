// app/api/user/delete/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 401 }
      );
    }

    // On s'assure que l'email existe avant de continuer
    const userEmail: string = session.user.email;

    // Utiliser une transaction pour s'assurer que toutes les opérations sont atomiques
    const result = await db.$transaction(async (tx) => {
      // Trouver l'utilisateur d'abord
      const user = await tx.user.findUnique({
        where: { email: userEmail }
      });

      if (!user) {
        throw new Error("Utilisateur non trouvé");
      }

      // 1. Supprimer les reviews
      await tx.review.deleteMany({
        where: { userId: user.id }
      });

      // 2. Supprimer les tattooRequests
      await tx.tattooRequest.deleteMany({
        where: { userId: user.id }
      });

      // 3. Supprimer les flashTattooRequests
      await tx.flashTattooRequest.deleteMany({
        where: { userId: user.id }
      });

      // 4. Supprimer les réservations
      await tx.reservation.deleteMany({
        where: { userId: user.id }
      });

      // 5. Finalement, supprimer l'utilisateur
      const deletedUser = await tx.user.delete({
        where: { id: user.id },
        select: {
          id: true,
          prenom: true,
          nom: true,
          email: true
        }
      });

      return deletedUser;
    });

    return NextResponse.json({
      message: "Compte et données associées supprimés avec succès",
      user: result
    });
    
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Une erreur est survenue lors de la suppression du compte" },
      { status: 500 }
    );
  }
}