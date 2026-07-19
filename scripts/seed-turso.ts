import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

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

function uuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

const categories = [
  { name: "Action", slug: "action" },
  { name: "RPG", slug: "rpg" },
  { name: "Adventure", slug: "adventure" },
  { name: "Strategy", slug: "strategy" },
  { name: "Simulation", slug: "simulation" },
  { name: "Sports", slug: "sports" },
  { name: "Racing", slug: "racing" },
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
  {
    title: "Shadow Realm Chronicles",
    slug: "shadow-realm-chronicles",
    description:
      "An open-world RPG set in a dark fantasy universe. Create your character, explore vast dungeons, and uncover ancient secrets.",
    price: 49.99,
    originalPrice: 59.99,
    imageUrl: "https://placehold.co/600x400/2d1b69/ffffff?text=Shadow+Realm",
    platform: "PC",
    developer: "Midnight Studios",
    publisher: "PlayVault Games",
    releaseDate: "2025-01-20",
    rating: 4.5,
    featured: true,
    categorySlug: "rpg",
  },
  {
    title: "Neon Drift",
    slug: "neon-drift",
    description:
      "A high-octane racing game set in a cyberpunk city. Customize your vehicle, race through neon-lit streets, and dominate the underground racing scene.",
    price: 39.99,
    originalPrice: null,
    imageUrl: "https://placehold.co/600x400/0f3460/ffffff?text=Neon+Drift",
    platform: "PC",
    developer: "Velocity Works",
    publisher: "PlayVault Games",
    releaseDate: "2025-05-10",
    rating: 4.3,
    featured: false,
    categorySlug: "racing",
  },
  {
    title: "Kingdoms at War",
    slug: "kingdoms-at-war",
    description:
      "Build your empire, train armies, and conquer rival kingdoms in this grand strategy game. Lead your civilization from medieval village to global superpower.",
    price: 44.99,
    originalPrice: 54.99,
    imageUrl: "https://placehold.co/600x400/1a1a2e/ffffff?text=Kingdoms+War",
    platform: "PC",
    developer: "Iron Crown Games",
    publisher: "PlayVault Games",
    releaseDate: "2024-11-15",
    rating: 4.6,
    featured: true,
    categorySlug: "strategy",
  },
  {
    title: "Space Frontier",
    slug: "space-frontier",
    description:
      "Explore the cosmos, build space stations, and establish colonies on distant planets. A comprehensive space simulation experience.",
    price: 34.99,
    originalPrice: 44.99,
    imageUrl: "https://placehold.co/600x400/0a1628/ffffff?text=Space+Frontier",
    platform: "PC",
    developer: "Celestial Interactive",
    publisher: "PlayVault Games",
    releaseDate: "2025-02-28",
    rating: 4.4,
    featured: false,
    categorySlug: "simulation",
  },
  {
    title: "Desert Storm",
    slug: "desert-storm",
    description:
      "An intense tactical FPS set in modern conflict zones. Lead your squad through challenging missions with realistic weapon mechanics.",
    price: 49.99,
    originalPrice: 59.99,
    imageUrl: "https://placehold.co/600x400/8b4513/ffffff?text=Desert+Storm",
    platform: "PC",
    developer: "Frontline Games",
    publisher: "PlayVault Games",
    releaseDate: "2025-04-05",
    rating: 4.2,
    featured: false,
    categorySlug: "action",
  },
  {
    title: "Mystic Quest",
    slug: "mystic-quest",
    description:
      "A charming adventure RPG with classic turn-based combat. Journey through magical lands, befriend quirky characters, and save the world from darkness.",
    price: 29.99,
    originalPrice: 39.99,
    imageUrl: "https://placehold.co/600x400/2e8b57/ffffff?text=Mystic+Quest",
    platform: "PC",
    developer: "Retro Pixel Studios",
    publisher: "PlayVault Games",
    releaseDate: "2024-09-01",
    rating: 4.8,
    featured: true,
    categorySlug: "rpg",
  },
  {
    title: "Pro League Football",
    slug: "pro-league-football",
    description:
      "The most realistic football simulation with licensed teams and players. Experience match day like never before.",
    price: 59.99,
    originalPrice: 69.99,
    imageUrl: "https://placehold.co/600x400/006400/ffffff?text=Pro+Football",
    platform: "PC",
    developer: "Kickoff Studios",
    publisher: "PlayVault Games",
    releaseDate: "2025-06-01",
    rating: 4.1,
    featured: false,
    categorySlug: "sports",
  },
];

const categoryMap: Record<string, string> = {};

async function main() {
  console.log("Seeding Turso database...");

  // Seed categories
  for (const cat of categories) {
    const existing = await client.execute({
      sql: "SELECT id FROM Category WHERE slug = ?",
      args: [cat.slug],
    });

    if (existing.rows.length === 0) {
      const id = uuid();
      await client.execute({
        sql: "INSERT INTO Category (id, name, slug) VALUES (?, ?, ?)",
        args: [id, cat.name, cat.slug],
      });
      categoryMap[cat.slug] = id;
    } else {
      categoryMap[cat.slug] = existing.rows[0].id as string;
    }
  }
  console.log("Categories seeded");

  // Seed users
  const adminPassword = await bcrypt.hash("admin123", 10);
  const userPassword = await bcrypt.hash("user123", 10);

  for (const u of [
    { email: "admin@playvault.com", name: "Admin", password: adminPassword, role: "admin" },
    { email: "user@playvault.com", name: "Gamer", password: userPassword, role: "user" },
  ]) {
    const existing = await client.execute({
      sql: "SELECT id FROM User WHERE email = ?",
      args: [u.email],
    });
    if (existing.rows.length === 0) {
      await client.execute({
        sql: "INSERT INTO User (id, email, name, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))",
        args: [uuid(), u.email, u.name, u.password, u.role],
      });
    }
  }
  console.log("Users seeded");

  // Seed games + keys
  for (const g of games) {
    const existing = await client.execute({
      sql: "SELECT id FROM Game WHERE slug = ?",
      args: [g.slug],
    });

    let gameId: string;
    if (existing.rows.length === 0) {
      gameId = uuid();
      await client.execute({
        sql: `INSERT INTO Game (id, title, slug, description, price, originalPrice, imageUrl, platform, developer, publisher, releaseDate, rating, inStock, featured, categoryId, createdAt, updatedAt)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, datetime('now'), datetime('now'))`,
        args: [
          gameId, g.title, g.slug, g.description, g.price, g.originalPrice,
          g.imageUrl, g.platform, g.developer, g.publisher, g.releaseDate,
          g.rating, g.featured, categoryMap[g.categorySlug],
        ],
      });
      console.log(`Created game "${g.title}"`);
    } else {
      gameId = existing.rows[0].id as string;
    }

    const keyCount = await client.execute({
      sql: "SELECT COUNT(*) as cnt FROM ActivationKey WHERE gameId = ?",
      args: [gameId],
    });

    if ((keyCount.rows[0].cnt as number) === 0) {
      const numKeys = 5 + Math.floor(Math.random() * 6);
      for (let i = 0; i < numKeys; i++) {
        await client.execute({
          sql: "INSERT INTO ActivationKey (id, key, gameId, status, createdAt, updatedAt) VALUES (?, ?, ?, 'available', datetime('now'), datetime('now'))",
          args: [uuid(), generateKey(), gameId],
        });
      }
      console.log(`  Added ${numKeys} keys`);
    }
  }

  console.log("Seeding complete!");
  client.close();
}

main().catch(console.error);
