import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Extraire l'ID depuis le chemin de l'URL
  const id = request.nextUrl.pathname.split('/').pop();

  if (!id) {
    return NextResponse.json({ message: 'ID is required' }, { status: 400 });
  }

  try {
    const prestation = await db.prestation.findUnique({
      where: { id: parseInt(id, 10) },
      include: { images: true, service: true },
    });

    if (!prestation) {
      return NextResponse.json(
        { message: 'Prestation non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(prestation);
  } catch (error) {
    console.error('Erreur lors de la récupération de la prestation:', error);
    return NextResponse.json(
      { message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  // Extraire l'ID de la route dynamique via `request.nextUrl.pathname`
  const id = request.nextUrl.pathname.split('/').pop();

  if (!id) {
    return NextResponse.json({ message: 'ID is required' }, { status: 400 });
  }

  try {
    const { status } = await request.json();

    // Validation simple du statut
    if (!['ACCEPTED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
    }

    // Mise à jour du statut dans la base de données
    const updatedReservation = await db.reservation.update({
      where: { id: parseInt(id, 10) },
      data: { status },
    });

    if (!updatedReservation) {
      return NextResponse.json({ message: 'Reservation not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Reservation status updated successfully', reservation: updatedReservation });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la réservation:', error);
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}
