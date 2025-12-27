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
  const passwordHash = await bcrypt.hash('Password123!', 10);
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
  const user2 = await prisma.user.create({
    data: {
      name: 'Mariam Zongo',
      email: 'mariam@kawari.com',
      passwordHash,
    },
  });
  const user3 = await prisma.user.create({
    data: {
      name: 'Idrissa Kone',
      email: 'idrissa@kawari.com',
      passwordHash,
    },
  });
  const user4 = await prisma.user.create({
    data: {
      name: 'Alice Somé',
      email: 'alice@kawari.com',
      passwordHash,
    },
  });
  const user5 = await prisma.user.create({
    data: {
      name: 'Thomas Sawadogo',
      email: 'thomas@kawari.com',
      passwordHash,
    },
  });

  // Customers
  const customer1 = await prisma.customer.create({
    data: { name: 'Aminata Kabore', email: 'aminata@kabore.bf', phone: '+226 70 12 34 56' },
  });
  const customer2 = await prisma.customer.create({
    data: { name: 'Souleymane Sawadogo', email: 'souleymane@sawadogo.bf', phone: '+226 76 98 76 54' },
  });
  const customer3 = await prisma.customer.create({
    data: { name: 'Fatou Traore', email: 'fatou@traore.bf', phone: '+226 70 55 44 33' },
  });
  const customer4 = await prisma.customer.create({
    data: { name: 'Abdoulaye Diallo', email: 'abdoulaye@diallo.bf', phone: '+226 74 10 20 30' },
  });
  const customer5 = await prisma.customer.create({
    data: { name: 'Awa Compaore', email: 'awa@compaore.bf', phone: '+226 78 22 11 44' },
  });
  const customer6 = await prisma.customer.create({
    data: { name: 'Kadiatou Coulibaly', email: 'kadiatou@coulibaly.bf', phone: '+226 75 66 77 55' },
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

  await prisma.transaction.create({
    data: {
      userId: user1.id,
      customerId: customer4.id,
      type: 'sale',
      amount: 32000,
      currency: 'XOF',
      date: new Date('2024-12-07'),
      description: 'Prestation de service',
      paymentMethod: 'Mobile Money',
      category: 'service',
    },
  });

  await prisma.transaction.create({
    data: {
      userId: user2.id,
      customerId: customer5.id,
      type: 'sale',
      amount: 18000,
      currency: 'XOF',
      date: new Date('2024-12-08'),
      description: 'Vente accessoires',
      paymentMethod: 'Carte',
      category: 'vente',
    },
  });

  await prisma.transaction.create({
    data: {
      userId: user2.id,
      type: 'expense',
      amount: 9000,
      currency: 'XOF',
      date: new Date('2024-12-09'),
      description: 'Transport et logistique',
      paymentMethod: 'Especes',
      category: 'logistique',
    },
  });

  await prisma.transaction.create({
    data: {
      userId: user3.id,
      customerId: customer6.id,
      type: 'sale',
      amount: 52000,
      currency: 'XOF',
      date: new Date('2024-12-10'),
      description: 'Vente lot produits',
      paymentMethod: 'Mobile Money',
      category: 'vente',
    },
  });

  await prisma.transaction.create({
    data: {
      userId: user3.id,
      type: 'expense',
      amount: 12000,
      currency: 'XOF',
      date: new Date('2024-12-11'),
      description: 'Marketing digital',
      paymentMethod: 'Carte',
      category: 'marketing',
    },
  });

  // Transactions pour les nouveaux utilisateurs
  await prisma.transaction.create({
    data: {
      userId: user4.id,
      customerId: customer1.id,
      type: 'sale',
      amount: 35000,
      currency: 'XOF',
      date: new Date('2024-12-12'),
      description: 'Vente de produits électroniques',
      paymentMethod: 'Carte',
      category: 'vente',
    },
  });

  await prisma.transaction.create({
    data: {
      userId: user4.id,
      type: 'expense',
      amount: 8000,
      currency: 'XOF',
      date: new Date('2024-12-13'),
      description: 'Frais de transport',
      paymentMethod: 'Especes',
      category: 'transport',
    },
  });

  await prisma.transaction.create({
    data: {
      userId: user5.id,
      customerId: customer3.id,
      type: 'sale',
      amount: 42000,
      currency: 'XOF',
      date: new Date('2024-12-14'),
      description: 'Prestation de services',
      paymentMethod: 'Mobile Money',
      category: 'service',
    },
  });

  await prisma.transaction.create({
    data: {
      userId: user5.id,
      customerId: customer5.id,
      type: 'sale',
      amount: 28000,
      currency: 'XOF',
      date: new Date('2024-12-15'),
      description: 'Vente de marchandises',
      paymentMethod: 'Especes',
      category: 'vente',
    },
  });

  await prisma.transaction.create({
    data: {
      userId: user5.id,
      type: 'expense',
      amount: 11000,
      currency: 'XOF',
      date: new Date('2024-12-16'),
      description: 'Achat de fournitures',
      paymentMethod: 'Carte',
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
      status: 'paid',
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
      status: 'pending',
      items: {
        create: [{ label: 'Service consultation', quantity: 1, unitPrice: 45000 }],
      },
    },
  });

  await prisma.invoice.create({
    data: {
      userId: user1.id,
      customerId: customer4.id,
      number: 'INV-2024-003',
      total: 32000,
      issuedAt: new Date('2024-12-07'),
      status: 'paid',
      items: {
        create: [{ label: 'Prestation technique', quantity: 1, unitPrice: 32000 }],
      },
    },
  });

  await prisma.invoice.create({
    data: {
      userId: user2.id,
      customerId: customer5.id,
      number: 'INV-2024-004',
      total: 18000,
      issuedAt: new Date('2024-12-08'),
      status: 'paid',
      items: {
        create: [{ label: 'Accessoires divers', quantity: 6, unitPrice: 3000 }],
      },
    },
  });

  await prisma.invoice.create({
    data: {
      userId: user3.id,
      customerId: customer6.id,
      number: 'INV-2024-005',
      total: 52000,
      issuedAt: new Date('2024-12-10'),
      status: 'pending',
      items: {
        create: [
          { label: 'Pack produits', quantity: 1, unitPrice: 42000 },
          { label: 'Livraison', quantity: 1, unitPrice: 10000 },
        ],
      },
    },
  });

  // Ajout de factures en retard
  await prisma.invoice.create({
    data: {
      userId: admin.id,
      customerId: customer3.id,
      number: 'INV-2024-006',
      total: 75000,
      issuedAt: new Date('2024-11-15'),
      status: 'overdue',
      items: {
        create: [
          { label: 'Services de consultation', quantity: 1, unitPrice: 50000 },
          { label: 'Frais de déplacement', quantity: 1, unitPrice: 25000 },
        ],
      },
    },
  });

  await prisma.invoice.create({
    data: {
      userId: user2.id,
      customerId: customer1.id,
      number: 'INV-2024-007',
      total: 98000,
      issuedAt: new Date('2024-11-20'),
      status: 'overdue',
      items: {
        create: [
          { label: 'Produits électroniques', quantity: 2, unitPrice: 49000 },
        ],
      },
    },
  });

  // Ajout de factures pour les nouveaux utilisateurs
  await prisma.invoice.create({
    data: {
      userId: user4.id,
      customerId: customer2.id,
      number: 'INV-2024-008',
      total: 35000,
      issuedAt: new Date('2024-12-12'),
      status: 'paid',
      items: {
        create: [
          { label: 'Produits électroniques', quantity: 1, unitPrice: 35000 },
        ],
      },
    },
  });

  await prisma.invoice.create({
    data: {
      userId: user4.id,
      customerId: customer4.id,
      number: 'INV-2024-009',
      total: 22000,
      issuedAt: new Date('2024-12-13'),
      status: 'pending',
      items: {
        create: [
          { label: 'Services de maintenance', quantity: 2, unitPrice: 11000 },
        ],
      },
    },
  });

  await prisma.invoice.create({
    data: {
      userId: user5.id,
      customerId: customer3.id,
      number: 'INV-2024-010',
      total: 42000,
      issuedAt: new Date('2024-12-14'),
      status: 'paid',
      items: {
        create: [
          { label: 'Prestation de services', quantity: 1, unitPrice: 42000 },
        ],
      },
    },
  });

  await prisma.invoice.create({
    data: {
      userId: user5.id,
      customerId: customer5.id,
      number: 'INV-2024-011',
      total: 28000,
      issuedAt: new Date('2024-12-15'),
      status: 'pending',
      items: {
        create: [
          { label: 'Vente de marchandises', quantity: 4, unitPrice: 7000 },
        ],
      },
    },
  });

  await prisma.invoice.create({
    data: {
      userId: user5.id,
      customerId: customer6.id,
      number: 'INV-2024-012',
      total: 65000,
      issuedAt: new Date('2024-11-10'),
      status: 'overdue',
      items: {
        create: [
          { label: 'Formation professionnelle', quantity: 1, unitPrice: 65000 },
        ],
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

  await prisma.notification.create({
    data: {
      userId: admin.id,
      message: 'Facture INV-2024-006 en retard de paiement',
      type: 'invoice',
      read: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: user1.id,
      message: 'Prestation facturee INV-2024-003',
      type: 'invoice',
      read: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: user2.id,
      message: 'Nouvelle vente accessoires: 18,000 XOF',
      type: 'sale',
      read: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: user3.id,
      message: 'Facture INV-2024-005 en attente de paiement',
      type: 'invoice',
      read: false,
    },
  });

  // Notifications pour les nouveaux utilisateurs
  await prisma.notification.create({
    data: {
      userId: user4.id,
      message: 'Nouvelle vente enregistree: 35,000 XOF',
      type: 'sale',
      read: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: user4.id,
      message: 'Facture INV-2024-009 en attente de paiement',
      type: 'invoice',
      read: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: user5.id,
      message: 'Nouvelle vente enregistree: 70,000 XOF',
      type: 'sale',
      read: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: user5.id,
      message: 'Facture INV-2024-012 en retard de paiement',
      type: 'invoice',
      read: false,
    },
  });

  console.log('Seed completed successfully.');
  console.log('Test account -> Email: admin@kawari.com | Password: Password123!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
