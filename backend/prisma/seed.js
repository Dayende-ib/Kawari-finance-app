const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Kawari Finance database...');

  // Reset tables to keep the seed idempotent
  await prisma.notification.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  // Users
  const passwordHash = await bcrypt.hash('password123', 10);
  const admin = await prisma.user.create({
    data: {
      name: 'Administrateur Kawari',
      email: 'admin@kawari.com',
      passwordHash,
    },
  });
  const user1 = await prisma.user.create({
    data: {
      name: 'Jean Ouedraogo',
      email: 'jean@kawari.com',
      passwordHash,
    },
  });

  // Customers
  const customer1 = await prisma.customer.create({
    data: { name: 'Aminata Kaboré', phone: '+226 70 12 34 56' },
  });
  const customer2 = await prisma.customer.create({
    data: { name: 'Souleymane Sawadogo', phone: '+226 76 98 76 54' },
  });
  const customer3 = await prisma.customer.create({
    data: { name: 'Fatou Traoré', phone: '+226 70 55 44 33' },
  });

  // Transactions (sales/expenses)
  await prisma.transaction.create({
    data: {
      userId: admin.id,
      customerId: customer1.id,
      type: 'sale',
      amount: 25000,
      currency: 'XOF',
      date: new Date('2024-12-01'),
      description: 'Vente de marchandises',
      paymentMethod: 'Mobile Money',
      category: 'vente',
    },
  });

  await prisma.transaction.create({
    data: {
      userId: admin.id,
      customerId: customer2.id,
      type: 'sale',
      amount: 45000,
      currency: 'XOF',
      date: new Date('2024-12-03'),
      description: 'Vente produits alimentaires',
      paymentMethod: 'Especes',
      category: 'vente',
    },
  });

  await prisma.transaction.create({
    data: {
      userId: user1.id,
      type: 'expense',
      amount: 15000,
      currency: 'XOF',
      date: new Date('2024-12-05'),
      description: 'Achat fournitures bureau',
      paymentMethod: 'Especes',
      category: 'depense',
    },
  });

  // Invoices and items
  await prisma.invoice.create({
    data: {
      userId: admin.id,
      customerId: customer1.id,
      number: 'INV-2024-001',
      total: 25000,
      issuedAt: new Date('2024-12-01'),
      status: 'payee',
      items: {
        create: [
          { label: 'Produit A', quantity: 5, unitPrice: 3000 },
          { label: 'Produit B', quantity: 2, unitPrice: 5000 },
        ],
      },
    },
  });

  await prisma.invoice.create({
    data: {
      userId: admin.id,
      customerId: customer2.id,
      number: 'INV-2024-002',
      total: 45000,
      issuedAt: new Date('2024-12-03'),
      status: 'en attente',
      items: {
        create: [{ label: 'Service consultation', quantity: 1, unitPrice: 45000 }],
      },
    },
  });

  // Notifications
  await prisma.notification.create({
    data: {
      userId: admin.id,
      message: 'Nouvelle vente enregistree: 25,000 XOF',
      type: 'sale',
      read: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: admin.id,
      message: 'Facture INV-2024-002 en attente de paiement',
      type: 'invoice',
      read: false,
    },
  });

  console.log('Seed completed successfully.');
  console.log('Test account -> Email: admin@kawari.com | Password: password123');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
