import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.INITIAL_ADMIN_EMAIL || 'admin@quickshop.com';
  const password = process.env.INITIAL_ADMIN_PASSWORD || 'admin123';

  // Check if admin already exists
  const existingAdmin = await prisma.adminUser.findUnique({
    where: { email },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await prisma.adminUser.create({
      data: {
        email,
        username: email,
        passwordHash: hashedPassword,
        role: 'SUPERADMIN',
        name: 'Initial Admin',
      },
    });

    console.log('Initial admin user created successfully!');
  } else {
    console.log('Initial admin user already exists.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 