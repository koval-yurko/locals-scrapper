-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "username" TEXT,
    "age" INTEGER,
    "gender" TEXT,
    "description" TEXT,
    "occupation" TEXT,
    "country" TEXT,
    "city" TEXT,
    "avatarPicture" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
