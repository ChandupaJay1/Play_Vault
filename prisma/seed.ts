import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";

const adapter = new PrismaLibSql({
    url: "file:dev.db",
});
const prisma = new PrismaClient({ adapter });

function generateKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const segments = [5, 5, 5, 5];
  return segments
    .map(
      (len) =>
        Array.from({ length: len }, () =>
          chars[Math.floor(Math.random() * chars.length)]
        ).join("")
    )
    .join("-");
}

const categories = [
  { name: "Action", slug: "action" },
  { name: "RPG", slug: "rpg" },
  { name: "Adventure", slug: "adventure" },
  { name: "Strategy", slug: "strategy" },
  { name: "Simulation", slug: "simulation" },
  { name: "Sports", slug: "sports" },
];

const games = [
  {
    title: "Crimson Fury",
    slug: "crimson-fury",
    description:
      "A fast-paced hack-and-slash action game set in a war-torn fantasy kingdom. Wield elemental weapons and unleash devastating combos against fearsome bosses.",
    price: 59.99,
    originalPrice: 69.99,
    imageUrl: "https://placehold.co/600x400/1a1a2e/ffffff?text=Crimson+Fury",
    platform: "PC",
    developer: "Stormworks Studio",
    publisher: "PlayVault Games",
    releaseDate: "2025-03-15",
    rating: 4.7,
    featured: true,
    categorySlug: "action",
  },
];

async function main() {
  console.log("Seeding database...");

  const adminPassword = await bcrypt.hash("admin123", 10);
  const userPassword = await bcrypt.hash("user123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@playvault.com" },
    update: {},
    create: {
      email: "admin@playvault.com",
      name: "Admin",
      password: adminPassword,
      role: "admin",
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "user@playvault.com" },
    update: {},
    create: {
      email: "user@playvault.com",
      name: "Gamer",
      password: userPassword,
      role: "user",
    },
  });

  console.log("Users ready:", admin.email, user.email);

  const createdCategories = await Promise.all(
    categories.map((cat) =>
      prisma.category.upsert({
        where: { slug: cat.slug },
        update: { name: cat.name },
        create: { name: cat.name, slug: cat.slug },
      })
    )
  );

  const categoryMap = Object.fromEntries(
    createdCategories.map((c) => [c.slug, c.id])
  );

  console.log("Categories ready:", createdCategories.map((c) => c.name));

  for (const gameData of games) {
    const { categorySlug, ...rest } = gameData;
    const createdGame = await prisma.game.upsert({
      where: { slug: rest.slug },
      update: {
        title: rest.title,
        description: rest.description,
        price: rest.price,
        originalPrice: rest.originalPrice || null,
        imageUrl: rest.imageUrl,
        platform: rest.platform,
        developer: rest.developer,
        publisher: rest.publisher,
        releaseDate: rest.releaseDate,
        rating: rest.rating,
        featured: rest.featured,
        categoryId: categoryMap[categorySlug],
      },
      create: {
        ...rest,
        categoryId: categoryMap[categorySlug],
      },
    });

    const existingKeys = await prisma.activationKey.count({
      where: { gameId: createdGame.id },
    });

    if (existingKeys === 0) {
      const keyCount = 5 + Math.floor(Math.random() * 6);
      const keys = Array.from({ length: keyCount }, () => ({
        key: generateKey(),
        gameId: createdGame.id,
        status: "available",
      }));

      await prisma.activationKey.createMany({ data: keys });
      console.log(
        `Created game "${createdGame.title}" with ${keyCount} keys`
      );
    } else {
      console.log(
        `Game "${createdGame.title}" already has ${existingKeys} keys, skipping`
      );
    }
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
