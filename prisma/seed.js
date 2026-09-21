const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("159753", 12);

  await prisma.user.upsert({
    where: { email: "admin@tcetmumbai.in" },
    update: { role: "ADMIN", approvalStatus: "APPROVED", passwordHash },
    create: {
      name: "TCET Administrator",
      email: "admin@tcetmumbai.in",
      passwordHash,
      role: "ADMIN",
      approvalStatus: "APPROVED",
    },
  });

  console.log("Seeded admin@tcetmumbai.in");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
