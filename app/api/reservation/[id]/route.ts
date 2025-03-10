import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PUT(req: NextRequest) {  // Changer le type en NextRequest
  const session = await getServerSession(authOptions);

  if (!session || !(session.user as { role?: string }).role || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  }

  // Récupérer l'ID à partir de l'URL
  const id = req.nextUrl.pathname.split("/").pop();

  if (!id) {
    return NextResponse.json({ message: "ID de réservation manquant" }, { status: 400 });
  }

  const { status } = await req.json();

  if (!["ACCEPTED", "REJECTED"].includes(status)) {
    return NextResponse.json({ message: "Statut invalide" }, { status: 400 });
  }

  try {
    const updatedReservation = await db.reservation.update({
      where: { id: Number(id) },
      data: { status },
    });

    return NextResponse.json({ updatedReservation }, { status: 200 });
  } catch (error) {
    console.error("Erreur de mise à jour de la réservation :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
