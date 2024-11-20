-- CreateTable
CREATE TABLE "FlashTattooRequest" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "flashTattooId" INTEGER NOT NULL,
    "size" TEXT NOT NULL,
    "placement" TEXT NOT NULL,
    "healthData" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlashTattooRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FlashTattooRequest" ADD CONSTRAINT "FlashTattooRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
