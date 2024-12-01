import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(req: NextRequest): Promise<NextResponse> {
  try {
    // Extraire l'ID à partir de l'URL
    const id = parseInt(req.nextUrl.pathname.split('/').pop() as string);

    if (isNaN(id)) {
      return NextResponse.json({ message: 'ID is required and must be a number' }, { status: 400 });
    }

    const data = await req.json();

    // Remove fields that shouldn't be updated
    const { 
      id: _id, 
      createdAt: _createdAt,
      ...updateData 
    } = data;

    const result = await db.openingHours.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      message: "Horaires mis à jour avec succès",
      result: {
        ...result,
        jour: result.jour.charAt(0).toUpperCase() + result.jour.slice(1),
        startTime: result.startTime,
        endTime: result.endTime
      }
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'horaire :", error);
    return NextResponse.json(
      { message: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    // Extraire l'ID à partir de l'URL
    const id = parseInt(req.nextUrl.pathname.split('/').pop() as string);

    if (isNaN(id)) {
      return NextResponse.json({ message: 'ID is required and must be a number' }, { status: 400 });
    }

    await db.openingHours.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Horaires supprimés avec succès"
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'horaire :", error);
    return NextResponse.json(
      { message: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}
