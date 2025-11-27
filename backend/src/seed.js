require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Transaction = require('./models/Transaction');
const Invoice = require('./models/Invoice');

const main = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI manquant');
  await mongoose.connect(uri);

  console.log('Seeding demo data...');

  // Nettoyage léger pour éviter doublons
  await Promise.all([User.deleteMany({ email: /demo@kawari.app/ }), Transaction.deleteMany({}), Invoice.deleteMany({})]);

  const user = await User.create({
    name: 'Démo Kawari',
    email: 'demo@kawari.app',
    password: 'demo1234',
    company: 'Boutique Démo',
  });

  const now = new Date();
  const months = [...Array(6).keys()].map((i) => new Date(now.getFullYear(), now.getMonth() - i, 10));

  const transactions = months.flatMap((d, idx) => [
    {
      type: 'sale',
      amount: 500000 + idx * 45000,
      category: 'Ventes',
      description: 'Ventes mensuelles',
      date: d,
      createdBy: user._id,
      counterparty: 'Client récurrent',
    },
    {
      type: 'expense',
      amount: 180000 + idx * 15000,
      category: 'Charges',
      description: 'Charges opérationnelles',
      date: d,
      createdBy: user._id,
      counterparty: 'Fournisseur',
    },
  ]);

  await Transaction.insertMany(transactions);

  await Invoice.insertMany([
    {
      number: 'INV-001',
      customerName: 'Société Faso',
      amount: 350000,
      dueDate: new Date(now.getFullYear(), now.getMonth(), 25),
      status: 'sent',
      createdBy: user._id,
    },
    {
      number: 'INV-002',
      customerName: 'Bobo Market',
      amount: 520000,
      dueDate: new Date(now.getFullYear(), now.getMonth() + 1, 5),
      status: 'draft',
      createdBy: user._id,
    },
    {
      number: 'INV-003',
      customerName: 'Ouaga Services',
      amount: 210000,
      dueDate: new Date(now.getFullYear(), now.getMonth() - 1, 28),
      status: 'paid',
      createdBy: user._id,
    },
  ]);

  console.log('Utilisateur démo:', user.email, 'mdp: demo1234');
  await mongoose.disconnect();
};

main()
  .then(() => {
    console.log('Seed terminé');
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
