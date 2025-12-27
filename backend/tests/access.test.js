const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { generateAccessToken } = require('../src/utils/jwt');
const { connect } = require('../src/mongo');
const User = require('../src/models/User');
const Customer = require('../src/models/Customer');
const Transaction = require('../src/models/Transaction');
const Invoice = require('../src/models/Invoice');
const Notification = require('../src/models/Notification');

let app;
let mongo;

jest.setTimeout(30000);

const seedCompany = async () => {
  const companyId = new mongoose.Types.ObjectId();
  const admin = await User.create({
    _id: companyId,
    companyId,
    name: 'Admin',
    email: `admin-${companyId}@example.com`,
    passwordHash: 'hash',
    role: 'admin',
  });

  const seller1 = await User.create({
    companyId,
    name: 'Seller 1',
    email: `seller1-${companyId}@example.com`,
    passwordHash: 'hash',
    role: 'seller',
  });

  const seller2 = await User.create({
    companyId,
    name: 'Seller 2',
    email: `seller2-${companyId}@example.com`,
    passwordHash: 'hash',
    role: 'seller',
  });

  const c1 = await Customer.create({ companyId, userId: seller1._id, name: 'Cust 1' });
  const c2 = await Customer.create({ companyId, userId: seller2._id, name: 'Cust 2' });

  await Transaction.create({ companyId, userId: seller1._id, type: 'sale', amount: 100, currency: 'XOF' });
  await Transaction.create({ companyId, userId: seller1._id, type: 'expense', amount: 20, currency: 'XOF' });
  await Transaction.create({ companyId, userId: seller2._id, type: 'sale', amount: 200, currency: 'XOF' });
  await Transaction.create({ companyId, userId: seller2._id, type: 'expense', amount: 50, currency: 'XOF' });

  await Invoice.create({ companyId, userId: seller1._id, customerId: c1._id, number: 'INV-1', total: 100, status: 'paid' });
  await Invoice.create({ companyId, userId: seller2._id, customerId: c2._id, number: 'INV-2', total: 200, status: 'PENDING' });

  await Notification.create({ companyId, userId: seller1._id, message: 'Sale', type: 'sale', read: false });

  return { admin, seller1, seller2, c1, c2 };
};

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-secret';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
  mongo = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongo.getUri();
  await connect();
  app = require('../server');
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
});

beforeEach(async () => {
  await Promise.all([
    Notification.deleteMany({}),
    Invoice.deleteMany({}),
    Transaction.deleteMany({}),
    Customer.deleteMany({}),
    User.deleteMany({}),
  ]);
});

test('customers list respects seller vs admin access', async () => {
  const { admin, seller1, seller2 } = await seedCompany();

  const adminToken = generateAccessToken({ userId: admin._id, email: admin.email, role: admin.role });
  const seller1Token = generateAccessToken({ userId: seller1._id, email: seller1.email, role: seller1.role });
  const seller2Token = generateAccessToken({ userId: seller2._id, email: seller2.email, role: seller2.role });

  const seller1Res = await request(app)
    .get('/api/customers')
    .set('Authorization', `Bearer ${seller1Token}`);

  expect(seller1Res.status).toBe(200);
  expect(seller1Res.body).toHaveLength(1);
  expect(seller1Res.body[0].userId).toBe(String(seller1._id));

  const seller2Res = await request(app)
    .get('/api/customers')
    .set('Authorization', `Bearer ${seller2Token}`);

  expect(seller2Res.status).toBe(200);
  expect(seller2Res.body).toHaveLength(1);
  expect(seller2Res.body[0].userId).toBe(String(seller2._id));

  const adminRes = await request(app)
    .get('/api/customers')
    .set('Authorization', `Bearer ${adminToken}`);

  expect(adminRes.status).toBe(200);
  expect(adminRes.body).toHaveLength(2);
});

test('transactions list respects seller vs admin access', async () => {
  const { admin, seller1 } = await seedCompany();

  const adminToken = generateAccessToken({ userId: admin._id, email: admin.email, role: admin.role });
  const sellerToken = generateAccessToken({ userId: seller1._id, email: seller1.email, role: seller1.role });

  const sellerRes = await request(app)
    .get('/api/transactions')
    .set('Authorization', `Bearer ${sellerToken}`);

  expect(sellerRes.status).toBe(200);
  expect(sellerRes.body).toHaveLength(2);
  expect(sellerRes.body.every((tx) => String(tx.userId) === String(seller1._id))).toBe(true);

  const adminRes = await request(app)
    .get('/api/transactions')
    .set('Authorization', `Bearer ${adminToken}`);

  expect(adminRes.status).toBe(200);
  expect(adminRes.body).toHaveLength(4);
});

test('stats are scoped to seller or company admin', async () => {
  const { admin, seller1 } = await seedCompany();

  const adminToken = generateAccessToken({ userId: admin._id, email: admin.email, role: admin.role });
  const sellerToken = generateAccessToken({ userId: seller1._id, email: seller1.email, role: seller1.role });

  const sellerRes = await request(app)
    .get('/api/stats')
    .set('Authorization', `Bearer ${sellerToken}`);

  expect(sellerRes.status).toBe(200);
  expect(sellerRes.body.totalSales).toBe(100);
  expect(sellerRes.body.totalExpenses).toBe(20);
  expect(sellerRes.body.balance).toBe(80);
  expect(sellerRes.body.totalInvoices).toBe(1);

  const adminRes = await request(app)
    .get('/api/stats')
    .set('Authorization', `Bearer ${adminToken}`);

  expect(adminRes.status).toBe(200);
  expect(adminRes.body.totalSales).toBe(300);
  expect(adminRes.body.totalExpenses).toBe(70);
  expect(adminRes.body.balance).toBe(230);
  expect(adminRes.body.totalInvoices).toBe(2);
});
