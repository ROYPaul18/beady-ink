import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Extract the `id` parameter from the URL
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
