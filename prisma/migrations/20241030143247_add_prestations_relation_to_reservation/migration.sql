-- CreateTable
CREATE TABLE "_ReservationPrestations" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ReservationPrestations_AB_unique" ON "_ReservationPrestations"("A", "B");

-- CreateIndex
CREATE INDEX "_ReservationPrestations_B_index" ON "_ReservationPrestations"("B");

-- AddForeignKey
ALTER TABLE "_ReservationPrestations" ADD CONSTRAINT "_ReservationPrestations_A_fkey" FOREIGN KEY ("A") REFERENCES "Prestation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ReservationPrestations" ADD CONSTRAINT "_ReservationPrestations_B_fkey" FOREIGN KEY ("B") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
