import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin-portal-2024", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@andreasboutsikas.com" },
    update: {},
    create: {
      email: "admin@andreasboutsikas.com",
      password: adminPassword,
      name: "Andreas Boutsikas",
      role: "ADMIN",
    },
  });
  console.log("Created admin:", admin.email);

  // Create client users
  const clientPassword = await bcrypt.hash("client-demo-2024", 12);

  const villaClient = await prisma.user.upsert({
    where: { email: "villa-eden@client.com" },
    update: {},
    create: {
      email: "villa-eden@client.com",
      password: clientPassword,
      name: "Villa Eden",
      role: "CLIENT",
    },
  });
  console.log("Created client:", villaClient.email);

  const hotelClient = await prisma.user.upsert({
    where: { email: "hotel-renaissance@client.com" },
    update: {},
    create: {
      email: "hotel-renaissance@client.com",
      password: clientPassword,
      name: "Hotel Renaissance",
      role: "CLIENT",
    },
  });
  console.log("Created client:", hotelClient.email);

  // Create projects
  const villaProject = await prisma.project.upsert({
    where: { slug: "villa-eden-santorini" },
    update: {},
    create: {
      title: "Villa Eden — Santorini",
      slug: "villa-eden-santorini",
      description:
        "A stunning luxury villa perched on the cliffs of Santorini, featuring breathtaking caldera views, traditional Cycladic architecture, and contemporary interiors. This photoshoot captured the essence of Mediterranean living at its finest.",
      location: "Santorini, Greece",
      shootDate: new Date("2024-09-15"),
      published: true,
      access: {
        create: [{ userId: villaClient.id }],
      },
    },
  });
  console.log("Created project:", villaProject.title);

  const hotelProject = await prisma.project.upsert({
    where: { slug: "hotel-renaissance-athens" },
    update: {},
    create: {
      title: "Hotel Renaissance — Athens",
      slug: "hotel-renaissance-athens",
      description:
        "An elegant boutique hotel in the heart of Athens, blending neoclassical grandeur with modern luxury. The photography showcases the hotel's sophisticated lobby, premium suites, and rooftop restaurant with views of the Acropolis.",
      location: "Athens, Greece",
      shootDate: new Date("2024-10-08"),
      published: true,
      access: {
        create: [{ userId: hotelClient.id }],
      },
    },
  });
  console.log("Created project:", hotelProject.title);

  // Create a draft project for testing
  const draftProject = await prisma.project.upsert({
    where: { slug: "penthouse-heraklion" },
    update: {},
    create: {
      title: "Penthouse — Heraklion",
      slug: "penthouse-heraklion",
      description: "A modern penthouse apartment with panoramic views of Heraklion harbor.",
      location: "Heraklion, Crete",
      shootDate: new Date("2024-11-20"),
      published: false,
    },
  });
  console.log("Created project:", draftProject.title);

  console.log("Seeding completed!");
  console.log("\nDemo credentials:");
  console.log("Admin: admin@andreasboutsikas.com / admin-portal-2024");
  console.log("Client 1: villa-eden@client.com / client-demo-2024");
  console.log("Client 2: hotel-renaissance@client.com / client-demo-2024");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
