import { PrismaClient } from '@prisma/client';

export async function seedRoles(prisma: PrismaClient) {
  console.log("SEEDING ROLES STARTED");

  const roles = [
    { name: 'ADMIN', description: 'Admin role with full access' },
    { name: 'USER', description: 'Default user role' },
  ];

  try {
    // Use a transaction to ensure atomic operations
    await prisma.$transaction(
      roles.map((role) =>
        prisma.role.upsert({
          where: { name: role.name }, // Find by unique name
          create: {
            name: role.name,
            description: role.description || `CREATED NEW ROLE THROUGH SEEDING`,
          },
          update: {}, // Update (empty to do nothing if exists)
        })
      )
    );

    console.log("SEEDING ROLES COMPLETED SUCCESSFULLY");
  } catch (error) {
    console.error("ERROR WHILE SEEDING ROLES:", error);
    throw error; // Re-throw the error to propagate it
  }
}