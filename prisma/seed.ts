import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const sampleScenepacks = [
  {
    title: "Demon Slayer Infinity Castle",
    description: "Premium Demon Slayer scenes from the Infinity Castle arc. Includes epic battle sequences, emotional moments, and stunning visual effects. All scenes are Twixtor-ready and available in 4K quality.",
    category: "anime",
    quality: "4K",
    tags: ["Demon Slayer", "Action", "Twixtor", "4K", "AMV", "Infinity Castle"],
    driveLink: "https://drive.google.com/drive/folders/demon-slayer",
    megaLink: "https://mega.nz/folder/demon-slayer",
    featured: true,
    views: 15234,
    downloads: 3421,
  },
  {
    title: "Jujutsu Kaisen Shibuya Incident",
    description: "Epic JJK Shibuya Incident scenes with high-octane action sequences. Perfect for AMV editors.",
    category: "anime",
    quality: "4K",
    tags: ["JJK", "Shibuya", "Fights", "Gojo", "Sukuna"],
    driveLink: "https://drive.google.com/drive/folders/jjk-shibuya",
    megaLink: null,
    featured: true,
    views: 12453,
    downloads: 2987,
  },
  {
    title: "Cyberpunk 2077 Night City",
    description: "Stunning Cyberpunk gameplay captures with neon aesthetics and futuristic visuals.",
    category: "gaming",
    quality: "4K",
    tags: ["Cyberpunk", "RPG", "Neon", "Night City"],
    driveLink: "https://drive.google.com/drive/folders/cyberpunk",
    megaLink: "https://mega.nz/folder/cyberpunk",
    featured: false,
    views: 9876,
    downloads: 2134,
  },
  {
    title: "Attack on Titan Final Season",
    description: "AOT epic battle scenes from the final season. High quality captures ready for editing.",
    category: "anime",
    quality: "FHD",
    tags: ["AOT", "Titans", "Battle", "Eren", "Final Season"],
    driveLink: "https://drive.google.com/drive/folders/aot-final",
    megaLink: null,
    featured: true,
    views: 18765,
    downloads: 4532,
  },
  {
    title: "Spider-Man Across the Spider-Verse",
    description: "Stunning Spider-Verse animation with multiple art styles. Perfect for creative edits.",
    category: "movies",
    quality: "4K",
    tags: ["Spider-Man", "Animation", "Multiverse", "Miles Morales"],
    driveLink: "https://drive.google.com/drive/folders/spider-verse",
    megaLink: "https://mega.nz/folder/spider-verse",
    featured: false,
    views: 14321,
    downloads: 3210,
  },
  {
    title: "God of War Ragnarok",
    description: "Epic God of War cinematic scenes with Kratos and Atreus. Norse mythology aesthetics.",
    category: "gaming",
    quality: "4K",
    tags: ["God of War", "PS5", "Action", "Kratos"],
    driveLink: "https://drive.google.com/drive/folders/gow-ragnarok",
    megaLink: null,
    featured: false,
    views: 11234,
    downloads: 2876,
  },
  {
    title: "One Piece Wano Arc",
    description: "Gear 5 and Wano battles with stunning animation quality.",
    category: "anime",
    quality: "FHD",
    tags: ["One Piece", "Wano", "Gear 5", "Luffy"],
    driveLink: "https://drive.google.com/drive/folders/one-piece-wano",
    megaLink: "https://mega.nz/folder/one-piece",
    featured: false,
    views: 21345,
    downloads: 5432,
  },
  {
    title: "Elden Ring Boss Fights",
    description: "All boss cinematics and fights from Elden Ring. Dark fantasy aesthetics.",
    category: "gaming",
    quality: "4K",
    tags: ["Elden Ring", "Souls", "Bosses", "Dark Fantasy"],
    driveLink: "https://drive.google.com/drive/folders/elden-ring",
    megaLink: null,
    featured: false,
    views: 16543,
    downloads: 3987,
  },
  {
    title: "Chainsaw Man Dark Scenes",
    description: "High contrast dark aesthetic scenes from Chainsaw Man.",
    category: "anime",
    quality: "FHD",
    tags: ["Chainsaw Man", "Dark", "Aesthetic", "Denji"],
    driveLink: "https://drive.google.com/drive/folders/chainsaw-man",
    megaLink: "https://mega.nz/folder/chainsaw-man",
    featured: false,
    views: 19234,
    downloads: 4567,
  },
  {
    title: "The Batman Cinematic",
    description: "Robert Pattinson Batman scenes with noir aesthetics.",
    category: "movies",
    quality: "4K",
    tags: ["Batman", "DC", "Dark", "Noir"],
    driveLink: "https://drive.google.com/drive/folders/the-batman",
    megaLink: null,
    featured: false,
    views: 13456,
    downloads: 3210,
  },
  {
    title: "Hollow Knight VFX Pack",
    description: "Beautiful Hollow Knight visual effects and gameplay captures.",
    category: "gaming",
    quality: "HD",
    tags: ["Hollow Knight", "Indie", "VFX", "Hand-drawn"],
    driveLink: "https://drive.google.com/drive/folders/hollow-knight",
    megaLink: null,
    featured: false,
    views: 8765,
    downloads: 1987,
  },
  {
    title: "Travis Scott Music Video Pack",
    description: "High quality music video captures from Travis Scott visuals.",
    category: "music",
    quality: "FHD",
    tags: ["Travis Scott", "Hip Hop", "Music Video", "Cactus Jack"],
    driveLink: "https://drive.google.com/drive/folders/travis-scott",
    megaLink: "https://mega.nz/folder/travis-scott",
    featured: false,
    views: 11234,
    downloads: 2345,
  },
  {
    title: "Naruto Shippuden Ultimate Pack",
    description: "Complete Naruto Shippuden battle scenes and emotional moments.",
    category: "anime",
    quality: "FHD",
    tags: ["Naruto", "Shippuden", "Battles", "Sasuke"],
    driveLink: "https://drive.google.com/drive/folders/naruto-ship",
    megaLink: null,
    featured: false,
    views: 25678,
    downloads: 6543,
  },
  {
    title: "Interstellar Space Scenes",
    description: "Breathtaking space visuals from Interstellar. Perfect for atmospheric edits.",
    category: "movies",
    quality: "4K",
    tags: ["Interstellar", "Space", "Sci-Fi", "Christopher Nolan"],
    driveLink: "https://drive.google.com/drive/folders/interstellar",
    megaLink: "https://mega.nz/folder/interstellar",
    featured: false,
    views: 9876,
    downloads: 1876,
  },
  {
    title: "Valorant Pro Plays",
    description: "High-level Valorant gameplay and cinematic moments.",
    category: "gaming",
    quality: "FHD",
    tags: ["Valorant", "FPS", "Pro Plays", "Esports"],
    driveLink: "https://drive.google.com/drive/folders/valorant",
    megaLink: null,
    featured: false,
    views: 7654,
    downloads: 1543,
  },
];

async function main() {
  console.log("🌱 Starting database seed...");

  // Create admin user
  const hashedPassword = await hash("admin123", 12);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@mythiceditz17.com" },
    update: {},
    create: {
      email: "admin@mythiceditz17.com",
      name: "MythicEditz17",
      password: hashedPassword,
      role: "admin",
      emailVerified: new Date(),
    },
  });

  console.log("✅ Created admin user:", adminUser.email);

  // Create a demo user
  const demoPassword = await hash("demo123", 12);
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      name: "Demo User",
      password: demoPassword,
      role: "user",
      emailVerified: new Date(),
    },
  });

  console.log("✅ Created demo user:", demoUser.email);

  // Clear existing scenepacks
  await prisma.like.deleteMany();
  await prisma.save.deleteMany();
  await prisma.scenepack.deleteMany();
  console.log("🧹 Cleared existing scenepacks");

  // Create scenepacks
  for (const scenepack of sampleScenepacks) {
    await prisma.scenepack.create({
      data: {
        title: scenepack.title,
        description: scenepack.description,
        category: scenepack.category,
        quality: scenepack.quality,
        tags: JSON.stringify(scenepack.tags),
        driveLink: scenepack.driveLink,
        megaLink: scenepack.megaLink,
        featured: scenepack.featured,
        views: scenepack.views,
        downloads: scenepack.downloads,
        status: "approved",
        createdById: adminUser.id,
      },
    });
  }

  console.log(`✅ Created ${sampleScenepacks.length} scenepacks`);
  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
