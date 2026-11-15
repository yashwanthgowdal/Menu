import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  console.log("🌱 Seeding NoWave E-Menu database...\n");

  // ─── Create Admin User ───
  const passwordHash = await bcrypt.hash("NoWave2024!", 12);
  const admin = await prisma.adminUser.upsert({
    where: { email: "manager@nowave.cafe" },
    update: {},
    create: {
      email: "manager@nowave.cafe",
      passwordHash,
      name: "Café Manager",
    },
  });
  console.log(`✅ Admin user: ${admin.email}`);

  // ─── Create Categories ───
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "morning-tiffin" },
      update: {},
      create: { name: "Morning Tiffin & Breakfast", slug: "morning-tiffin", sortOrder: 0 },
    }),
    prisma.category.upsert({
      where: { slug: "small-plates" },
      update: {},
      create: { name: "Small Plates & Starters", slug: "small-plates", sortOrder: 1 },
    }),
    prisma.category.upsert({
      where: { slug: "mains" },
      update: {},
      create: { name: "Mains & Rice Bowls", slug: "mains", sortOrder: 2 },
    }),
    prisma.category.upsert({
      where: { slug: "craft-beverages" },
      update: {},
      create: { name: "Craft Beverages", slug: "craft-beverages", sortOrder: 3 },
    }),
    prisma.category.upsert({
      where: { slug: "desserts" },
      update: {},
      create: { name: "Desserts & Sweet Endings", slug: "desserts", sortOrder: 4 },
    }),
  ]);

  console.log(`✅ ${categories.length} categories created`);

  const [morningTiffin, smallPlates, mains, craftBeverages, desserts] = categories;

  // ─── Create Menu Items ───
  // Delete existing items to avoid duplicates on re-seed
  await prisma.menuItem.deleteMany();

  const items = await Promise.all([
    // ── Morning Tiffin ──
    prisma.menuItem.create({
      data: {
        name: "Crispy Benne Masala Dosa",
        description: "Lacy sesame-studded crepe filled with spiced potato, served with coconut chutney and sambar from our grandmother's recipe.",
        price: 180,
        imageUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
        dietaryType: "veg",
        spiceLevel: 2,
        isChefSpecial: true,
        availabilitySlot: "morning_only",
        categoryId: morningTiffin.id,
        sortOrder: 0,
        isStruckOut: true, // ← Pre-sold-out for demo
      },
    }),
    prisma.menuItem.create({
      data: {
        name: "Idli Vada Combo",
        description: "Three pillowy steamed rice cakes with crispy medu vada, paired with sambar and three chutneys — coconut, tomato & mint.",
        price: 140,
        imageUrl: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=600&q=80",
        dietaryType: "veg",
        spiceLevel: 1,
        availabilitySlot: "morning_only",
        categoryId: morningTiffin.id,
        sortOrder: 1,
      },
    }),
    prisma.menuItem.create({
      data: {
        name: "Akki Roti with Coconut Chutney",
        description: "Traditional Karnataka rice flour flatbread with onions, dill & curry leaves, stone-ground chutney on the side.",
        price: 120,
        imageUrl: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=80",
        dietaryType: "veg",
        spiceLevel: 1,
        availabilitySlot: "morning_only",
        categoryId: morningTiffin.id,
        sortOrder: 2,
      },
    }),

    // ── Small Plates ──
    prisma.menuItem.create({
      data: {
        name: "Gunpowder Paneer Tikka",
        description: "Charcoal-kissed paneer cubes coated in our signature gunpowder spice blend, served with pickled onion rings.",
        price: 280,
        imageUrl: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&q=80",
        dietaryType: "veg",
        spiceLevel: 3,
        isChefSpecial: true,
        availabilitySlot: "all_day",
        categoryId: smallPlates.id,
        sortOrder: 0,
      },
    }),
    prisma.menuItem.create({
      data: {
        name: "Mangalore Chicken Ghee Roast",
        description: "Tender chicken pieces slow-roasted in aromatic ghee with Byadgi chillies and whole spices — a coastal Karnataka classic.",
        price: 340,
        imageUrl: "https://images.unsplash.com/photo-1610057099443-fde6c99db9e1?w=600&q=80",
        dietaryType: "nonveg",
        spiceLevel: 4,
        availabilitySlot: "lunch_dinner",
        categoryId: smallPlates.id,
        sortOrder: 1,
      },
    }),

    // ── Mains ──
    prisma.menuItem.create({
      data: {
        name: "Bisi Bele Bath",
        description: "Karnataka's beloved one-pot rice dish with lentils, tamarind, vegetables and our house-ground BBB spice powder, topped with boondi.",
        price: 220,
        imageUrl: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80",
        dietaryType: "veg",
        spiceLevel: 3,
        availabilitySlot: "all_day",
        categoryId: mains.id,
        sortOrder: 0,
      },
    }),
    prisma.menuItem.create({
      data: {
        name: "Ragi Mudde with Saaru",
        description: "Wholesome finger millet balls served with piping hot pepper rasam — comfort food from the heart of Karnataka.",
        price: 160,
        imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80",
        dietaryType: "veg",
        spiceLevel: 2,
        availabilitySlot: "lunch_dinner",
        categoryId: mains.id,
        sortOrder: 1,
      },
    }),
    prisma.menuItem.create({
      data: {
        name: "Chicken Biryani, Bengaluru Style",
        description: "Fragrant basmati rice layered with saffron-marinated chicken, fried onions, and fresh mint. Served with raita and salan.",
        price: 320,
        imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80",
        dietaryType: "nonveg",
        spiceLevel: 3,
        isChefSpecial: true,
        availabilitySlot: "lunch_dinner",
        categoryId: mains.id,
        sortOrder: 2,
      },
    }),

    // ── Craft Beverages ──
    prisma.menuItem.create({
      data: {
        name: "Filter Kaapi",
        description: "Strong, aromatic South Indian filter coffee brewed from estate-fresh Chikmagalur beans, frothed to perfection in a traditional dabara set.",
        price: 80,
        imageUrl: "https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=600&q=80",
        dietaryType: "veg",
        spiceLevel: 1,
        availabilitySlot: "all_day",
        categoryId: craftBeverages.id,
        sortOrder: 0,
        isStruckOut: true, // ← Pre-sold-out for demo
      },
    }),
    prisma.menuItem.create({
      data: {
        name: "Rose Badam Milk",
        description: "Chilled almond milk infused with Mysore rose essence, saffron strands, and crushed pistachios.",
        price: 120,
        imageUrl: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=600&q=80",
        dietaryType: "veg",
        spiceLevel: 1,
        availabilitySlot: "all_day",
        categoryId: craftBeverages.id,
        sortOrder: 1,
      },
    }),

    // ── Desserts ──
    prisma.menuItem.create({
      data: {
        name: "Mysore Pak",
        description: "Melt-in-your-mouth ghee-rich gram flour fudge — our rendition of the royal Mysore palace recipe.",
        price: 100,
        imageUrl: "https://images.unsplash.com/photo-1666190050494-b7be95383540?w=600&q=80",
        dietaryType: "veg",
        spiceLevel: 1,
        availabilitySlot: "all_day",
        categoryId: desserts.id,
        sortOrder: 0,
      },
    }),
    prisma.menuItem.create({
      data: {
        name: "Dharwad Peda",
        description: "Caramelized milk fudge with cardamom, a sweet specialty from North Karnataka, topped with sliced almonds.",
        price: 90,
        imageUrl: "https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=600&q=80",
        dietaryType: "veg",
        spiceLevel: 1,
        availabilitySlot: "all_day",
        categoryId: desserts.id,
        sortOrder: 1,
      },
    }),
  ]);

  console.log(`✅ ${items.length} menu items created`);
  console.log(`   → 2 items pre-set as "Struck Out" (Benne Masala Dosa & Filter Kaapi)\n`);
  console.log("🎉 Seeding complete!\n");
  console.log("─── Demo Login Credentials ───");
  console.log("Email:    manager@nowave.cafe");
  console.log("Password: NoWave2024!");
  console.log("──────────────────────────────\n");
}

seed()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
