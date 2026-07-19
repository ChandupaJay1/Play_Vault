import { createClient } from "@libsql/client";

async function main() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  const statements: string[] = [
    `CREATE TABLE "User" ("id" TEXT NOT NULL PRIMARY KEY, "email" TEXT NOT NULL, "name" TEXT NOT NULL, "password" TEXT NOT NULL, "role" TEXT NOT NULL DEFAULT 'user', "phone" TEXT, "avatar" TEXT, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL)`,
    `CREATE TABLE "Category" ("id" TEXT NOT NULL PRIMARY KEY, "name" TEXT NOT NULL, "slug" TEXT NOT NULL)`,
    `CREATE TABLE "Game" ("id" TEXT NOT NULL PRIMARY KEY, "title" TEXT NOT NULL, "slug" TEXT NOT NULL, "description" TEXT NOT NULL, "price" REAL NOT NULL, "originalPrice" REAL, "imageUrl" TEXT NOT NULL, "platform" TEXT NOT NULL DEFAULT 'PC', "developer" TEXT, "publisher" TEXT, "releaseDate" TEXT, "rating" REAL, "inStock" BOOLEAN NOT NULL DEFAULT true, "featured" BOOLEAN NOT NULL DEFAULT false, "categoryId" TEXT NOT NULL, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL)`,
    `CREATE TABLE "Order" ("id" TEXT NOT NULL PRIMARY KEY, "userId" TEXT NOT NULL, "gameId" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'pending', "totalAmount" REAL NOT NULL, "paymentMethod" TEXT, "paymentProof" TEXT, "transactionId" TEXT, "adminNote" TEXT, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL)`,
    `CREATE TABLE "ActivationKey" ("id" TEXT NOT NULL PRIMARY KEY, "key" TEXT NOT NULL, "gameId" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'available', "orderId" TEXT, "userId" TEXT, "assignedAt" DATETIME, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL)`,
    `CREATE TABLE "Setting" ("key" TEXT NOT NULL PRIMARY KEY, "value" TEXT NOT NULL, "updatedAt" DATETIME NOT NULL)`,
    `CREATE TABLE "SteamAccount" ("id" TEXT NOT NULL PRIMARY KEY, "email" TEXT NOT NULL, "password" TEXT NOT NULL, "gameId" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'available', "orderId" TEXT, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL)`,
    `CREATE TABLE "Review" ("id" TEXT NOT NULL PRIMARY KEY, "userId" TEXT NOT NULL, "gameId" TEXT NOT NULL, "rating" INTEGER NOT NULL, "comment" TEXT NOT NULL, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE "ContactMessage" ("id" TEXT NOT NULL PRIMARY KEY, "name" TEXT NOT NULL, "email" TEXT NOT NULL, "subject" TEXT NOT NULL, "orderId" TEXT, "message" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'new', "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE UNIQUE INDEX "User_email_key" ON "User"("email")`,
    `CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name")`,
    `CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug")`,
    `CREATE UNIQUE INDEX "Game_slug_key" ON "Game"("slug")`,
    `CREATE UNIQUE INDEX "ActivationKey_key_key" ON "ActivationKey"("key")`,
    `CREATE UNIQUE INDEX "ActivationKey_orderId_key" ON "ActivationKey"("orderId")`,
    `CREATE UNIQUE INDEX "SteamAccount_orderId_key" ON "SteamAccount"("orderId")`,
    `CREATE UNIQUE INDEX "Review_userId_gameId_key" ON "Review"("userId", "gameId")`,
  ];

  for (const stmt of statements) {
    const preview = stmt.substring(0, 60);
    console.log(`Executing: ${preview}...`);
    try {
      await client.execute(stmt);
    } catch (e: any) {
      if (e.message?.includes("already exists")) {
        console.log("  (already exists, skipping)");
      } else {
        console.error(`  Error: ${e.message}`);
      }
    }
  }

  console.log("Done!");
  client.close();
}

main().catch(console.error);
