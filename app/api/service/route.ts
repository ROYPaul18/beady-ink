import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import * as z from "zod";
import { ServiceType } from "@prisma/client"; // Importer l'enum ServiceType

// Schéma de validation pour le service (seulement `type`)
const serviceSchema = z.object({
  type: z.nativeEnum(ServiceType, {
    errorMap: () => ({ message: "Type de service invalide" }),
  }), // Valide directement avec l'enum
});

// POST Request pour ajouter un service
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Corps de la requête :", body);

    // Valider le corps de la requête avec Zod
    const serviceData = serviceSchema.parse(body);

    console.log("Données validées par Zod :", serviceData);

    // Créer un nouveau service avec uniquement le type
    const newService = await db.service.create({
      data: {
        type: serviceData.type, // Assigner uniquement le type validé
      },
    });

    console.log("Nouveau service créé :", newService);

    return NextResponse.json(
      { service: newService, message: "Service ajouté avec succès" },
      { status: 201 }
    );
  } catch (error) {
    // Gérer les erreurs de validation Zod
    if (error instanceof z.ZodError) {
      console.log("Erreur de validation Zod :", error.errors);
      return NextResponse.json(
        { message: "Erreur de validation", errors: error.errors },
        { status: 400 }
      );
    }

    // Gérer les erreurs générales
    console.error("Erreur lors de l'ajout du service:", error);
    return NextResponse.json(
      {
        message: `Erreur 500: ${
          error instanceof Error ? error.message : "Erreur inconnue"
        }`,
      },
      { status: 500 }
    );
  }
}
