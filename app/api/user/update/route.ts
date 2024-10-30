// /app/api/user/update/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(request: Request) {
  const data = await request.json();

  if (!data.id) {
    return NextResponse.json({ message: "ID utilisateur manquant" }, { status: 400 });
  }

  try {
    const updatedUser = await db.user.update({
      where: { id: data.id },
      data: {
        prenom: data.prenom,
        nom: data.nom,
        telephone: data.telephone,
        email: data.email,
      },
    });
    return NextResponse.json({ message: "Mise à jour réussie", user: updatedUser });
  } catch (error) {
    return NextResponse.json({ message: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}
