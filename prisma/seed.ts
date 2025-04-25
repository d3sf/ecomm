import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create initial admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.adminUser.upsert({
    where: { email: 'admin@quickshop.com' },
    update: {},
    create: {
      email: 'admin@quickshop.com',
      username: 'admin',
      passwordHash: hashedPassword,
      role: 'SUPERADMIN',
      name: 'Admin User',
    },
  });

  console.log('Created admin user:', admin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 