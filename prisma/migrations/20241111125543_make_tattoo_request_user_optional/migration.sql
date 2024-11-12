-- CreateTable
CREATE TABLE "TattooRequest" (
    "id" SERIAL NOT NULL,
    "availability" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "placement" TEXT NOT NULL,
    "referenceImages" TEXT[],
    "healthData" JSONB NOT NULL,
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TattooRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TattooRequest" ADD CONSTRAINT "TattooRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
