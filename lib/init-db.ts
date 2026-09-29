import { seedDatabase } from "@/lib/seed";

let isSeeded = false;

export async function initializeDatabase() {
  if (isSeeded) return;
  try {
    await seedDatabase();
    isSeeded = true;
  } catch (error) {
    console.error("Failed to seed database:", error);
  }
}

initializeDatabase();