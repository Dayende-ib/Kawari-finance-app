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
  const admin = await User.create({ _id: companyId, name: 'Kawari Admin', email: 'respnsable@kawari.com', passwordHash, role: 'admin', companyId });

  const seller1 = await User.create({ name: 'Jean Dupont', email: 'jean@kawari.com', passwordHash, role: 'seller', companyId });
  const seller2 = await User.create({ name: 'Marie Diallo', email: 'marie@kawari.com', passwordHash, role: 'seller', companyId });
  const seller3 = await User.create({ name: 'Ousmane Traore', email: 'ousmane@kawari.com', passwordHash, role: 'seller', companyId });

  const companyId2 = new mongoose.Types.ObjectId();
  const admin2 = await User.create({
    _id: companyId2,
    name: 'Nadia Kone',
    companyName: 'Electro Tech',
    email: 'nadia@kawari.com',
    passwordHash,
    role: 'admin',
    companyId: companyId2,
  });

  const seller4 = await User.create({ name: 'Paul Mensah', email: 'paul@kawari.com', passwordHash, role: 'seller', companyId: companyId2 });
  const seller5 = await User.create({ name: 'Amina Sane', email: 'amina@kawari.com', passwordHash, role: 'seller', companyId: companyId2 });

  const companyId3 = new mongoose.Types.ObjectId();
  const admin3 = await User.create({
    _id: companyId3,
    name: 'Koffi Traore',
    companyName: 'AgriTech',
    email: 'koffi@kawari.com',
    passwordHash,
    role: 'admin',
    companyId: companyId3,
  });

  const seller6 = await User.create({ name: 'Sara Diallo', email: 'sara@kawari.com', passwordHash, role: 'seller', companyId: companyId3 });
  const seller7 = await User.create({ name: 'Youssef Ndao', email: 'youssef@kawari.com', passwordHash, role: 'seller', companyId: companyId3 });
  const seller8 = await User.create({ name: 'Mariam Toure', email: 'mariam@kawari.com', passwordHash, role: 'seller', companyId: companyId3 });

  const customers = await Customer.create([
    { companyId, userId: seller1._id, name: 'Aminata Kabore', email: 'aminata@example.bf', phone: '+226 70 12 34 56' },
    { companyId, userId: seller1._id, name: 'Souleymane Sawadogo', email: 'souleymane@example.bf', phone: '+226 76 98 76 54' },
    { companyId, userId: seller1._id, name: 'Fatou Traore', email: 'fatou@example.bf', phone: '+226 70 55 44 33' },
    { companyId, userId: seller1._id, name: 'Ousmane Diallo', email: 'ousmane@example.bf', phone: '+226 74 10 20 30' },
    { companyId, userId: seller1._id, name: 'Awa Compaore', email: 'awa@example.bf', phone: '+226 78 22 11 44' },
    { companyId, userId: seller1._id, name: 'Hama Coulibaly', email: 'hama@example.bf', phone: '+226 75 66 77 55' },
  ]);

  const [c1, c2, c3, c4, c5, c6] = customers;

  const customers2 = await Customer.create([
    { companyId: companyId2, userId: seller4._id, name: 'Lina Park', email: 'lina@example.com', phone: '+225 10 11 22 33' },
    { companyId: companyId2, userId: seller4._id, name: 'Eric Mensah', email: 'eric@example.com', phone: '+225 44 55 66 77' },
    { companyId: companyId2, userId: seller5._id, name: 'Marta Ndao', email: 'marta@example.com', phone: '+225 88 99 00 11' },
  ]);

  const customers3 = await Customer.create([
    { companyId: companyId3, userId: seller6._id, name: 'Abel Konate', email: 'abel@example.com', phone: '+221 70 00 11 22' },
    { companyId: companyId3, userId: seller7._id, name: 'Rita Diop', email: 'rita@example.com', phone: '+221 76 33 44 55' },
  ]);

  const [c7, c8, c9] = customers2;
  const [c10, c11] = customers3;

  const txs = [
    { companyId, userId: seller1._id, customerId: c1._id, type: 'sale', amount: 150000, currency: 'XOF', date: new Date('2024-12-20'), description: 'Vente de matériel informatique', paymentMethod: 'Mobile Money', category: 'vente' },
    { companyId, userId: seller1._id, customerId: c2._id, type: 'sale', amount: 85000, currency: 'XOF', date: new Date('2024-12-19'), description: 'Prestations de consultation', paymentMethod: 'Espèces', category: 'service' },
    { companyId, userId: seller1._id, type: 'expense', amount: 35000, currency: 'XOF', date: new Date('2024-12-20'), description: 'Achat de fournitures pour le bureau', paymentMethod: 'Carte', category: 'fournitures' },
  ];

  for (const t of txs) await Transaction.create(t);

  const extraTxs = [
    { companyId, userId: seller2._id, customerId: c3._id, type: 'sale', amount: 42000, currency: 'XOF', date: new Date('2024-12-18'), description: 'On-site support visit', paymentMethod: 'Cash', category: 'service' },
    { companyId, userId: seller3._id, customerId: c4._id, type: 'sale', amount: 96000, currency: 'XOF', date: new Date('2024-12-17'), description: 'Office equipment bundle', paymentMethod: 'Card', category: 'sale' },
    { companyId: companyId2, userId: seller4._id, customerId: c7._id, type: 'sale', amount: 125000, currency: 'XOF', date: new Date('2024-12-16'), description: 'Retail stock delivery', paymentMethod: 'Mobile Money', category: 'sale' },
    { companyId: companyId2, userId: seller5._id, customerId: c8._id, type: 'expense', amount: 22000, currency: 'XOF', date: new Date('2024-12-16'), description: 'Packaging supplies', paymentMethod: 'Cash', category: 'supplies' },
    { companyId: companyId2, userId: seller5._id, customerId: c9._id, type: 'sale', amount: 54000, currency: 'XOF', date: new Date('2024-12-15'), description: 'Retail order pickup', paymentMethod: 'Card', category: 'sale' },
    { companyId: companyId3, userId: seller6._id, customerId: c10._id, type: 'sale', amount: 88000, currency: 'XOF', date: new Date('2024-12-14'), description: 'Service contract setup', paymentMethod: 'Bank Transfer', category: 'service' },
  ];

  for (const t of extraTxs) await Transaction.create(t);

  const inv1 = await Invoice.create({ companyId, userId: seller1._id, customerId: c1._id, number: 'INV-2024-001', total: 150000, issuedAt: new Date('2024-12-20'), status: 'paid', items: [{ label: 'Ordinateur portable', quantity: 1, unitPrice: 850000 }, { label: 'Souris sans fil', quantity: 2, unitPrice: 25000 }] });

  await Notification.create({ companyId, userId: seller1._id, message: 'Vente enregistrée: Matériel informatique (150 000 XOF)', type: 'sale', read: false });

  console.log('Seed completed. Admin: respnsable@kawari.com / Password123!');
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
