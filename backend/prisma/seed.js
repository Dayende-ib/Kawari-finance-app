const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding de la base de données Kawari Finance...');

  // Hasher les mots de passe
  const hashedPassword = await bcrypt.hash('password123', 10);

  // ========== CRÉER DES UTILISATEURS ==========
  const admin = await prisma.user.create({
    data: {
      name: 'Administrateur Kawari',
      email: 'admin@kawari.com',
      passwordHash: hashedPassword,
    },
  });
  console.log('✅ Utilisateur créé:', admin.email);

  const user1 = await prisma.user.create({
    data: {
      name: 'Jean Ouedraogo',
      email: 'jean@kawari.com',
      passwordHash: hashedPassword,
    },
  });
  console.log('✅ Utilisateur créé:', user1.email);

  // ========== CRÉER DES CLIENTS ==========
  const customer1 = await prisma.customer.create({
    data: {
      name: 'Aminata Kaboré',
      phone: '+226 70 12 34 56',
    },
  });
  console.log('✅ Client créé:', customer1.name);

  const customer2 = await prisma.customer.create({
    data: {
      name: 'Souleymane Sawadogo',
      phone: '+226 76 98 76 54',
    },
  });
  console.log('✅ Client créé:', customer2.name);

  const customer3 = await prisma.customer.create({
    data: {
      name: 'Fatou Traoré',
      phone: '+226 70 55 44 33',
    },
  });
  console.log('✅ Client créé:', customer3.name);

  // ========== CRÉER DES TRANSACTIONS ==========
  const transaction1 = await prisma.transaction.create({
    data: {
      userId: admin.id,
      customerId: customer1.id,
      type: 'vente',
      amount: 25000,
      currency: 'XOF',
      date: new Date('2024-12-01'),
      description: 'Vente de marchandises',
      paymentMethod: 'Mobile Money',
      category: 'vente',
    },
  });
  console.log('✅ Transaction créée:', transaction1.id);

  const transaction2 = await prisma.transaction.create({
    data: {
      userId: admin.id,
      customerId: customer2.id,
      type: 'vente',
      amount: 45000,
      currency: 'XOF',
      date: new Date('2024-12-03'),
      description: 'Vente produits alimentaires',
      paymentMethod: 'Espèces',
      category: 'vente',
    },
  });
  console.log('✅ Transaction créée:', transaction2.id);

  const transaction3 = await prisma.transaction.create({
    data: {
      userId: user1.id,
      type: 'dépense',
      amount: 15000,
      currency: 'XOF',
      date: new Date('2024-12-05'),
      description: 'Achat fournitures bureau',
      paymentMethod: 'Espèces',
      category: 'dépense',
    },
  });
  console.log('✅ Transaction créée:', transaction3.id);

  // ========== CRÉER DES FACTURES ==========
  const invoice1 = await prisma.invoice.create({
    data: {
      userId: admin.id,
      customerId: customer1.id,
      number: 'INV-2024-001',
      total: 25000,
      issuedAt: new Date('2024-12-01'),
      status: 'payée',
      items: {
        create: [
          {
            label: 'Produit A',
            quantity: 5,
            unitPrice: 3000,
          },
          {
            label: 'Produit B',
            quantity: 2,
            unitPrice: 5000,
          },
        ],
      },
    },
  });
  console.log('✅ Facture créée:', invoice1.number);

  const invoice2 = await prisma.invoice.create({
    data: {
      userId: admin.id,
      customerId: customer2.id,
      number: 'INV-2024-002',
      total: 45000,
      issuedAt: new Date('2024-12-03'),
      status: 'en attente',
      items: {
        create: [
          {
            label: 'Service consultation',
            quantity: 1,
            unitPrice: 45000,
          },
        ],
      },
    },
  });
  console.log('✅ Facture créée:', invoice2.number);

  // ========== CRÉER DES NOTIFICATIONS ==========
  const notification1 = await prisma.notification.create({
    data: {
      userId: admin.id,
      message: 'Nouvelle vente enregistrée: 25,000 XOF',
      type: 'sale',
      read: false,
    },
  });
  console.log('✅ Notification créée');

  const notification2 = await prisma.notification.create({
    data: {
      userId: admin.id,
      message: 'Facture INV-2024-002 en attente de paiement',
      type: 'invoice',
      read: false,
    },
  });
  console.log('✅ Notification créée');

  console.log('\n✨ Seeding terminé avec succès!');
  console.log('📊 Données créées:');
  console.log(`   - ${2} utilisateurs`);
  console.log(`   - ${3} clients`);
  console.log(`   - ${3} transactions`);
  console.log(`   - ${2} factures`);
  console.log(`   - ${2} notifications`);
  console.log('\n🔐 Compte de test:');
  console.log('   Email: admin@kawari.com');
  console.log('   Mot de passe: password123');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });