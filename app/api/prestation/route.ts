// app/api/prestation/route.ts

import { NextResponse } from 'next/server';
import { processPrestationForm } from '@/lib/uploadImage';
import { z } from 'zod';
import { db } from '@/lib/db';

// Indiquer que cette route doit s'exécuter sur Node.js
export const runtime = 'nodejs';

// Fonction principale pour gérer les requêtes POST
export async function POST(request: Request) {
  try {
    // Traiter le formulaire et obtenir les données
    const { prestationData, service, imageUrls } = await processPrestationForm(request);

    // Créer la prestation avec les images associées
    const newPrestation = await db.prestation.create({
      data: {
        name: prestationData.name,
        duration: prestationData.duration,
        price: prestationData.price,
        description: prestationData.description,
        serviceId: service.id,
        images: {
          create: imageUrls.map((url) => ({ url })),
        },
      },
      include: {
        images: true,
      },
    });

    return NextResponse.json(
      { prestation: newPrestation, message: 'Prestation ajoutée avec succès' },
      { status: 201 }
    );
  } catch (error: unknown) {
    // Gérer les erreurs
    console.error('Erreur lors de la création de la prestation:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation des données échouée', errors: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      if (error.message.includes('introuvable')) {
        return NextResponse.json({ message: error.message }, { status: 404 });
      }
    }

    return NextResponse.json({ message: 'Erreur lors de la création de la prestation' }, { status: 500 });
  }
}
