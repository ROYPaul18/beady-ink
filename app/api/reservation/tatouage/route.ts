// app/api/reservation/tatouage/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { ServiceType } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
      console.error("Erreur: Utilisateur non autorisé ou session manquante");
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const userEmail = session.user.email as string;

    // Récupérer l'utilisateur pour obtenir son ID
    const user = await db.user.findUnique({
      where: { email: userEmail },
      select: { id: true },
    });

    if (!user) {
      console.error("Utilisateur non trouvé");
      return NextResponse.json({ message: 'Utilisateur non autorisé' }, { status: 401 });
    }

    const userId = user.id;

    // Récupération des données du corps de la requête
    const body = await req.json();
    const {
      availability,
      size,
      placement,
      referenceImages,
      healthData,
    } = body;

    // Validations (ajoutez vos validations ici)...

    // Récupération du service correspondant au tatouage
    const tattooService = await db.service.findUnique({
      where: {
        type: ServiceType.TATOUAGE,
      },
    });

    if (!tattooService) {
      console.error("Erreur: Service de tatouage non trouvé");
      return NextResponse.json(
        { message: 'Service de tatouage non disponible' },
        { status: 400 }
      );
    }

    // Créer la demande de tatouage en utilisant userId et serviceId
    const tattooRequest = await db.tattooRequest.create({
        data: {
          user: {
            connect: {
              id: userId,
            },
          },
          service: {
            connect: {
              id: tattooService.id,
            },
          },
          availability,
          size,
          placement,
          referenceImages,
          healthData,
        },
      });

    return NextResponse.json(
      {
        success: true,
        message: 'Demande de tatouage créée avec succès',
        tattooRequest,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur lors de la création de la demande de tatouage:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Erreur lors de la création de la demande de tatouage',
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}
