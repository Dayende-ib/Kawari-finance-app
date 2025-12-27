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
      name: 'Kawari Admin',
      email: 'admin@kawari.com',
      passwordHash,
    },
  });

  // Customers
  const customer1 = await prisma.customer.create({
    data: { name: 'Aminata Kabore', email: 'aminata@example.bf', phone: '+226 70 12 34 56' },
  });
  const customer2 = await prisma.customer.create({
    data: { name: 'Souleymane Sawadogo', email: 'souleymane@example.bf', phone: '+226 76 98 76 54' },
  });
  const customer3 = await prisma.customer.create({
    data: { name: 'Fatou Traore', email: 'fatou@example.bf', phone: '+226 70 55 44 33' },
  });
  const customer4 = await prisma.customer.create({
    data: { name: 'Ousmane Diallo', email: 'ousmane@example.bf', phone: '+226 74 10 20 30' },
  });
  const customer5 = await prisma.customer.create({
    data: { name: 'Awa Compaore', email: 'awa@example.bf', phone: '+226 78 22 11 44' },
  });
  const customer6 = await prisma.customer.create({
    data: { name: 'Hama Coulibaly', email: 'hama@example.bf', phone: '+226 75 66 77 55' },
  });

  // Transactions for admin user - Dec 2024
  const transactions = [
    // Sales
    {
      userId: admin.id,
      customerId: customer1.id,
      type: 'sale',
      amount: 150000,
      currency: 'XOF',
      date: new Date('2024-12-20'),
      description: 'Vente de matériel informatique',
      paymentMethod: 'Mobile Money',
      category: 'vente',
    },
    {
      userId: admin.id,
      customerId: customer2.id,
      type: 'sale',
      amount: 85000,
      currency: 'XOF',
      date: new Date('2024-12-19'),
      description: 'Prestations de consultation',
      paymentMethod: 'Espèces',
      category: 'service',
    },
    {
      userId: admin.id,
      customerId: customer3.id,
      type: 'sale',
      amount: 120000,
      currency: 'XOF',
      date: new Date('2024-12-18'),
      description: 'Vente de fournitures de bureau',
      paymentMethod: 'Carte',
      category: 'vente',
    },
    {
      userId: admin.id,
      customerId: customer4.id,
      type: 'sale',
      amount: 95000,
      currency: 'XOF',
      date: new Date('2024-12-17'),
      description: 'Services de maintenance IT',
      paymentMethod: 'Mobile Money',
      category: 'service',
    },
    {
      userId: admin.id,
      type: 'sale',
      amount: 65000,
      currency: 'XOF',
      date: new Date('2024-12-16'),
      description: 'Vente de licences logicielles',
      paymentMethod: 'Espèces',
      category: 'vente',
    },
    // Expenses
    {
      userId: admin.id,
      type: 'expense',
      amount: 35000,
      currency: 'XOF',
      date: new Date('2024-12-20'),
      description: 'Achat de fournitures pour le bureau',
      paymentMethod: 'Carte',
      category: 'fournitures',
    },
    {
      userId: admin.id,
      type: 'expense',
      amount: 50000,
      currency: 'XOF',
      date: new Date('2024-12-19'),
      description: 'Frais de transport et logistique',
      paymentMethod: 'Mobile Money',
      category: 'transport',
    },
    {
      userId: admin.id,
      type: 'expense',
      amount: 25000,
      currency: 'XOF',
      date: new Date('2024-12-15'),
      description: 'Abonnement internet et téléphone',
      paymentMethod: 'Virement',
      category: 'utilities',
    },
  ];

  for (const tx of transactions) {
    await prisma.transaction.create({ data: tx });
  }

  // Invoices and items
  const invoices = [
    {
      userId: admin.id,
      customerId: customer1.id,
      number: 'INV-2024-001',
      total: 150000,
      issuedAt: new Date('2024-12-20'),
      status: 'paid',
      items: {
        create: [
          { label: 'Ordinateur portable', quantity: 1, unitPrice: 850000 },
          { label: 'Souris sans fil', quantity: 2, unitPrice: 25000 },
        ],
      },
    },
    {
      userId: admin.id,
      customerId: customer2.id,
      number: 'INV-2024-002',
      total: 85000,
      issuedAt: new Date('2024-12-19'),
      status: 'paid',
      items: {
        create: [
          { label: 'Consultation IT - 5 heures', quantity: 1, unitPrice: 85000 },
        ],
      },
    },
    {
      userId: admin.id,
      customerId: customer3.id,
      number: 'INV-2024-003',
      total: 120000,
      issuedAt: new Date('2024-12-18'),
      status: 'pending',
      items: {
        create: [
          { label: 'Papier A4 - ramette', quantity: 10, unitPrice: 8000 },
          { label: 'Stylos (boîte de 50)', quantity: 2, unitPrice: 20000 },
        ],
      },
    },
    {
      userId: admin.id,
      customerId: customer4.id,
      number: 'INV-2024-004',
      total: 95000,
      issuedAt: new Date('2024-12-17'),
      status: 'pending',
      items: {
        create: [
          { label: 'Service maintenance - 1 jour', quantity: 1, unitPrice: 95000 },
        ],
      },
    },
    {
      userId: admin.id,
      customerId: customer5.id,
      number: 'INV-2024-005',
      total: 65000,
      issuedAt: new Date('2024-12-16'),
      status: 'overdue',
      items: {
        create: [
          { label: 'Licence Microsoft Office', quantity: 5, unitPrice: 13000 },
        ],
      },
    },
  ];

  for (const inv of invoices) {
    await prisma.invoice.create({ data: inv });
  }

  // Notifications - avec type obligatoire et valide
  const notifications = [
    {
      userId: admin.id,
      message: 'Vente enregistrée: Matériel informatique (150 000 XOF)',
      type: 'sale',
      read: false,
    },
    {
      userId: admin.id,
      message: 'Facture INV-2024-003 en attente de paiement (120 000 XOF)',
      type: 'invoice',
      read: false,
    },
    {
      userId: admin.id,
      message: 'Facture INV-2024-005 en retard de paiement (65 000 XOF)',
      type: 'invoice',
      read: true,
    },
    {
      userId: admin.id,
      message: 'Dépense enregistrée: Fournitures bureau (35 000 XOF)',
      type: 'expense',
      read: false,
    },
    {
      userId: admin.id,
      message: 'Facture INV-2024-004 en attente de paiement (95 000 XOF)',
      type: 'invoice',
      read: false,
    },
  ];

  for (const notif of notifications) {
    await prisma.notification.create({ data: notif });
  }

  console.log('Seed completed successfully! ✅');
  console.log('Test credentials:');
  console.log('  Email: admin@kawari.com');
  console.log('  Password: Password123!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
