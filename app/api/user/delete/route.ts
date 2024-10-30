// /app/api/user/delete/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(request: Request) {
  // Supposons que l'utilisateur est identifié d'une certaine manière
  const userId = request.headers.get("user-id"); // exemple d'authentification

  if (!userId) {
    return NextResponse.json({ message: "Utilisateur non trouvé" }, { status: 404 });
  }

  try {
    await db.user.delete({ where: { id: parseInt(userId) } });
    return NextResponse.json({ message: "Utilisateur supprimé avec succès" });
  } catch (error) {
    return NextResponse.json({ message: "Erreur lors de la suppression" }, { status: 500 });
  }
}
