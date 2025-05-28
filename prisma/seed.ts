import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create initial admin user
  const email = process.env.INITIAL_ADMIN_EMAIL || 'admin@merugo.com';
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

  // Create demo user
  const demoEmail = 'demo@merugo.com';
  const demoPassword = '123456';

  // Check if demo user already exists
  const existingDemoUser = await prisma.user.findUnique({
    where: { email: demoEmail },
  });

  if (!existingDemoUser) {
    const hashedDemoPassword = await bcrypt.hash(demoPassword, 10);
    
    await prisma.user.create({
      data: {
        email: demoEmail,
        name: 'Demo User',
        passwordHash: hashedDemoPassword,
        emailVerified: true,
        phone: '1234567890',
      },
    });

    console.log('Demo user created successfully!');
  } else {
    console.log('Demo user already exists.');
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