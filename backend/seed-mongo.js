require('dotenv').config();
const { connect } = require('./src/mongo');
const User = require('./src/models/User');
const Customer = require('./src/models/Customer');
const Transaction = require('./src/models/Transaction');
const Invoice = require('./src/models/Invoice');
const Notification = require('./src/models/Notification');
const RefreshToken = require('./src/models/RefreshToken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

async function seed() {
  await connect();
  console.log('Seeding MongoDB...');

  await Promise.all([
    Notification.deleteMany({}),
    Invoice.deleteMany({}),
    Transaction.deleteMany({}),
    Customer.deleteMany({}),
    User.deleteMany({}),
    RefreshToken.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash('Password123!', 10);
  const companyId = new mongoose.Types.ObjectId();
  const admin = await User.create({ _id: companyId, name: 'Kawari Admin', email: 'admin@kawari.com', passwordHash, role: 'admin', companyId });

  const seller1 = await User.create({ name: 'Jean Dupont', email: 'jean@kawari.com', passwordHash, role: 'seller', companyId });
  const seller2 = await User.create({ name: 'Marie Diallo', email: 'marie@kawari.com', passwordHash, role: 'seller', companyId });
  const seller3 = await User.create({ name: 'Ousmane Traore', email: 'ousmane@kawari.com', passwordHash, role: 'seller', companyId });

  const customers = await Customer.create([
    { companyId, userId: seller1._id, name: 'Aminata Kabore', email: 'aminata@example.bf', phone: '+226 70 12 34 56' },
    { companyId, userId: seller1._id, name: 'Souleymane Sawadogo', email: 'souleymane@example.bf', phone: '+226 76 98 76 54' },
    { companyId, userId: seller1._id, name: 'Fatou Traore', email: 'fatou@example.bf', phone: '+226 70 55 44 33' },
    { companyId, userId: seller1._id, name: 'Ousmane Diallo', email: 'ousmane@example.bf', phone: '+226 74 10 20 30' },
    { companyId, userId: seller1._id, name: 'Awa Compaore', email: 'awa@example.bf', phone: '+226 78 22 11 44' },
    { companyId, userId: seller1._id, name: 'Hama Coulibaly', email: 'hama@example.bf', phone: '+226 75 66 77 55' },
  ]);

  const [c1, c2, c3, c4, c5, c6] = customers;

  const txs = [
    { companyId, userId: seller1._id, customerId: c1._id, type: 'sale', amount: 150000, currency: 'XOF', date: new Date('2024-12-20'), description: 'Vente de matériel informatique', paymentMethod: 'Mobile Money', category: 'vente' },
    { companyId, userId: seller1._id, customerId: c2._id, type: 'sale', amount: 85000, currency: 'XOF', date: new Date('2024-12-19'), description: 'Prestations de consultation', paymentMethod: 'Espèces', category: 'service' },
    { companyId, userId: seller1._id, type: 'expense', amount: 35000, currency: 'XOF', date: new Date('2024-12-20'), description: 'Achat de fournitures pour le bureau', paymentMethod: 'Carte', category: 'fournitures' },
  ];

  for (const t of txs) await Transaction.create(t);

  const inv1 = await Invoice.create({ companyId, userId: seller1._id, customerId: c1._id, number: 'INV-2024-001', total: 150000, issuedAt: new Date('2024-12-20'), status: 'paid', items: [{ label: 'Ordinateur portable', quantity: 1, unitPrice: 850000 }, { label: 'Souris sans fil', quantity: 2, unitPrice: 25000 }] });

  await Notification.create({ companyId, userId: seller1._id, message: 'Vente enregistrée: Matériel informatique (150 000 XOF)', type: 'sale', read: false });

  console.log('Seed completed. Admin: admin@kawari.com / Password123!');
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
