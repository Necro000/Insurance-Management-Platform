const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed script...');

  // 1. Hash default passwords
  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 2. Create Users (Admin, Agent, Customer)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@insurance.com' },
    update: {},
    create: {
      name: 'System Admin',
      email: 'admin@insurance.com',
      password: passwordHash,
      role: 'admin',
    },
  });

  const agentUser = await prisma.user.upsert({
    where: { email: 'agent@insurance.com' },
    update: {},
    create: {
      name: 'Sarah Agent',
      email: 'agent@insurance.com',
      password: passwordHash,
      role: 'agent',
    },
  });

  const customerUser = await prisma.user.upsert({
    where: { email: 'rohan.sharma@example.com' },
    update: {},
    create: {
      name: 'Rohan Sharma',
      email: 'rohan.sharma@example.com',
      password: passwordHash,
      role: 'customer',
    },
  });

  console.log('✅ Created Demo Users:');
  console.log('  - Admin:    admin@insurance.com / Password123!');
  console.log('  - Agent:    agent@insurance.com / Password123!');
  console.log('  - Customer: rohan.sharma@example.com / Password123!');

  // 3. Create Sample Customers
  const customer1 = await prisma.customer.upsert({
    where: { email: 'rohan.sharma@example.com' },
    update: {},
    create: {
      name: 'Rohan Sharma',
      email: 'rohan.sharma@example.com',
      phone: '+91 9876543210',
      dob: new Date('1988-04-12'),
      address: '102 Green Park Extension, New Delhi',
    },
  });

  const customer2 = await prisma.customer.upsert({
    where: { email: 'ananya.verma@example.com' },
    update: {},
    create: {
      name: 'Ananya Verma',
      email: 'ananya.verma@example.com',
      phone: '+91 9812345678',
      dob: new Date('1992-09-25'),
      address: '405 Palm Beach Road, Mumbai',
    },
  });

  const customer3 = await prisma.customer.upsert({
    where: { email: 'vikram.m@example.com' },
    update: {},
    create: {
      name: 'Vikram Malhotra',
      email: 'vikram.m@example.com',
      phone: '+91 9711223344',
      dob: new Date('1985-01-30'),
      address: '78 MG Road, Bengaluru',
    },
  });

  console.log('✅ Created 3 Customers');

  // 4. Create Sample Policies
  const policy1 = await prisma.policy.upsert({
    where: { policyNumber: 'POL-2026-1001' },
    update: {},
    create: {
      policyNumber: 'POL-2026-1001',
      policyType: 'Health Comprehensive',
      premiumAmount: 18500,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2027-01-01'),
      status: 'active',
      customerId: customer1.id,
    },
  });

  const policy2 = await prisma.policy.upsert({
    where: { policyNumber: 'POL-2026-1002' },
    update: {},
    create: {
      policyNumber: 'POL-2026-1002',
      policyType: 'Motor Insurance',
      premiumAmount: 12000,
      startDate: new Date('2026-02-15'),
      endDate: new Date('2027-02-15'),
      status: 'active',
      customerId: customer2.id,
    },
  });

  const policy3 = await prisma.policy.upsert({
    where: { policyNumber: 'POL-2026-1003' },
    update: {},
    create: {
      policyNumber: 'POL-2026-1003',
      policyType: 'Life Cover Premium',
      premiumAmount: 35000,
      startDate: new Date('2025-06-01'),
      endDate: new Date('2026-06-01'),
      status: 'expired',
      customerId: customer3.id,
    },
  });

  console.log('✅ Created 3 Policies');

  // 5. Create Sample Premium Payments
  const existingPayments = await prisma.premiumPayment.count();
  if (existingPayments === 0) {
    await prisma.premiumPayment.createMany({
      data: [
        {
          policyId: policy1.id,
          amount: 18500,
          paymentDate: new Date('2026-01-02'),
          paymentStatus: 'paid',
        },
        {
          policyId: policy2.id,
          amount: 12000,
          paymentDate: new Date('2026-02-16'),
          paymentStatus: 'paid',
        },
        {
          policyId: policy3.id,
          amount: 35000,
          paymentDate: new Date('2025-06-02'),
          paymentStatus: 'paid',
        },
      ],
    });
    console.log('✅ Created Premium Payments');
  }

  // 6. Create Sample Claims
  const existingClaims = await prisma.claim.count();
  if (existingClaims === 0) {
    await prisma.claim.createMany({
      data: [
        {
          policyId: policy1.id,
          claimAmount: 45000,
          reason: 'Emergency hospitalization and surgical procedures at Apollo Hospital',
          submissionDate: new Date('2026-05-10'),
          status: 'approved',
        },
        {
          policyId: policy2.id,
          claimAmount: 15000,
          reason: 'Bumper repair and denting due to parking collision',
          submissionDate: new Date('2026-06-01'),
          status: 'pending',
        },
      ],
    });
    console.log('✅ Created Sample Claims');
  }

  console.log('\n🎉 Database Seed Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
