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
const RefreshToken = require('../src/models/RefreshToken');

let app;
let mongo;

jest.setTimeout(30000);

const clearDb = async () => {
  await Promise.all([
    Notification.deleteMany({}),
    Invoice.deleteMany({}),
    Transaction.deleteMany({}),
    Customer.deleteMany({}),
    RefreshToken.deleteMany({}),
    User.deleteMany({}),
  ]);
};

const getRefreshCookie = (res) => {
  const cookies = res.headers['set-cookie'] || [];
  const refresh = cookies.find((c) => c.startsWith('refreshToken='));
  if (!refresh) {
    const details = JSON.stringify({ status: res.status, body: res.body });
    throw new Error(`Missing refreshToken cookie. Response: ${details}`);
  }
  return refresh;
};

const createAdmin = async () => {
  const companyId = new mongoose.Types.ObjectId();
  const admin = await User.create({
    _id: companyId,
    companyId,
    name: 'Admin',
    email: `admin-${companyId}@example.com`,
    passwordHash: 'hash',
    role: 'admin',
  });
  return admin;
};

const createSeller = async (companyId, nameSuffix = '') => {
  return User.create({
    companyId,
    name: `Seller ${nameSuffix}`.trim(),
    email: `seller-${nameSuffix || companyId}@example.com`,
    passwordHash: 'hash',
    role: 'seller',
  });
};

const tokenFor = (user) => generateAccessToken({ userId: user._id, email: user.email, role: user.role });

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-secret';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
  process.env.JWT_REFRESH_MAX_AGE_MS = '600000';
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
  await clearDb();
});

test('register creates an admin with companyId', async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Company Admin', email: 'admin@company.com', password: 'Password123!' });

  expect(res.status).toBe(200);
  expect(res.body.user.role).toBe('admin');

  const user = await User.findOne({ email: 'admin@company.com' }).lean();
  expect(String(user._id)).toBe(String(user.companyId));
});

test('login rejects invalid credentials', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'missing@company.com', password: 'Password123!' });

  expect(res.status).toBe(400);
});

test('refresh token rotates and revokes old token', async () => {
  await request(app)
    .post('/api/auth/register')
    .send({ name: 'Company Admin', email: 'admin@company.com', password: 'Password123!' });

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@company.com', password: 'Password123!' });

  expect(loginRes.status).toBe(200);
  const cookie = getRefreshCookie(loginRes);
  const refreshToken = cookie.split(';')[0].split('=')[1];

  const refreshRes = await request(app)
    .post('/api/auth/refresh')
    .set('Cookie', cookie);

  expect(refreshRes.status).toBe(200);
  expect(refreshRes.body.token).toBeTruthy();

  const stored = await RefreshToken.findOne({ token: refreshToken }).lean();
  expect(stored.revoked).toBe(true);
  expect(stored.replacedBy).toBeTruthy();
});

test('logout revokes refresh token', async () => {
  await request(app)
    .post('/api/auth/register')
    .send({ name: 'Company Admin', email: 'admin@company.com', password: 'Password123!' });

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@company.com', password: 'Password123!' });

  expect(loginRes.status).toBe(200);
  const cookie = getRefreshCookie(loginRes);
  const refreshToken = cookie.split(';')[0].split('=')[1];

  const logoutRes = await request(app)
    .post('/api/auth/logout')
    .set('Cookie', cookie);

  expect(logoutRes.status).toBe(200);
  const stored = await RefreshToken.findOne({ token: refreshToken }).lean();
  expect(stored.revoked).toBe(true);
});

test('admin can manage sellers, seller cannot', async () => {
  const admin = await createAdmin();
  const adminToken = tokenFor(admin);

  const createRes = await request(app)
    .post('/api/auth/sellers')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: 'Seller A', email: 'seller-a@company.com', password: 'Password123!' });

  expect(createRes.status).toBe(201);
  const sellerId = createRes.body.user.id;

  const listRes = await request(app)
    .get('/api/auth/sellers')
    .set('Authorization', `Bearer ${adminToken}`);

  expect(listRes.status).toBe(200);
  expect(listRes.body.length).toBe(1);

  const patchRes = await request(app)
    .patch(`/api/auth/sellers/${sellerId}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: 'Seller B' });

  expect(patchRes.status).toBe(200);
  expect(patchRes.body.user.name).toBe('Seller B');

  const deleteRes = await request(app)
    .delete(`/api/auth/sellers/${sellerId}`)
    .set('Authorization', `Bearer ${adminToken}`);

  expect(deleteRes.status).toBe(200);

  const seller = await createSeller(admin.companyId, 'limited');
  const sellerToken = tokenFor(seller);
  const forbiddenRes = await request(app)
    .post('/api/auth/sellers')
    .set('Authorization', `Bearer ${sellerToken}`)
    .send({ name: 'Seller C', email: 'seller-c@company.com', password: 'Password123!' });

  expect(forbiddenRes.status).toBe(403);
});

test('customers are scoped by seller and company admin', async () => {
  const admin = await createAdmin();
  const seller1 = await createSeller(admin.companyId, 'one');
  const seller2 = await createSeller(admin.companyId, 'two');

  const seller1Token = tokenFor(seller1);
  const seller2Token = tokenFor(seller2);
  const adminToken = tokenFor(admin);

  const createRes1 = await request(app)
    .post('/api/customers')
    .set('Authorization', `Bearer ${seller1Token}`)
    .send({ name: 'Client 1' });

  expect(createRes1.status).toBe(201);
  expect(String(createRes1.body.userId)).toBe(String(seller1._id));
  expect(String(createRes1.body.companyId)).toBe(String(admin.companyId));

  const createRes2 = await request(app)
    .post('/api/customers')
    .set('Authorization', `Bearer ${seller2Token}`)
    .send({ name: 'Client 2' });

  expect(createRes2.status).toBe(201);

  const sellerList = await request(app)
    .get('/api/customers')
    .set('Authorization', `Bearer ${seller1Token}`);

  expect(sellerList.body).toHaveLength(1);

  const adminList = await request(app)
    .get('/api/customers')
    .set('Authorization', `Bearer ${adminToken}`);

  expect(adminList.body).toHaveLength(2);

  const forbiddenGet = await request(app)
    .get(`/api/customers/${createRes2.body._id}`)
    .set('Authorization', `Bearer ${seller1Token}`);

  expect(forbiddenGet.status).toBe(404);

  const invalidGet = await request(app)
    .get('/api/customers/invalid-id')
    .set('Authorization', `Bearer ${seller1Token}`);

  expect(invalidGet.status).toBe(400);
});

test('transactions use authenticated user and are scoped', async () => {
  const admin = await createAdmin();
  const seller1 = await createSeller(admin.companyId, 'one');
  const seller2 = await createSeller(admin.companyId, 'two');

  const seller1Token = tokenFor(seller1);
  const adminToken = tokenFor(admin);

  const createRes = await request(app)
    .post('/api/transactions')
    .set('Authorization', `Bearer ${seller1Token}`)
    .send({
      userId: seller2._id,
      type: 'sale',
      amount: 100,
      currency: 'XOF',
    });

  expect(createRes.status).toBe(201);
  expect(String(createRes.body.userId)).toBe(String(seller1._id));
  expect(String(createRes.body.companyId)).toBe(String(admin.companyId));

  await Transaction.create({
    companyId: admin.companyId,
    userId: seller2._id,
    type: 'sale',
    amount: 50,
    currency: 'XOF',
  });

  const sellerList = await request(app)
    .get('/api/transactions')
    .set('Authorization', `Bearer ${seller1Token}`);

  expect(sellerList.body).toHaveLength(1);

  const adminList = await request(app)
    .get('/api/transactions')
    .set('Authorization', `Bearer ${adminToken}`);

  expect(adminList.body).toHaveLength(2);

  const invalidGet = await request(app)
    .get('/api/transactions/invalid-id')
    .set('Authorization', `Bearer ${seller1Token}`);

  expect(invalidGet.status).toBe(400);
});

test('invoices list and get respect scope', async () => {
  const admin = await createAdmin();
  const seller1 = await createSeller(admin.companyId, 'one');
  const seller2 = await createSeller(admin.companyId, 'two');

  const c1 = await Customer.create({ companyId: admin.companyId, userId: seller1._id, name: 'C1' });
  const c2 = await Customer.create({ companyId: admin.companyId, userId: seller2._id, name: 'C2' });

  const inv1 = await Invoice.create({
    companyId: admin.companyId,
    userId: seller1._id,
    customerId: c1._id,
    number: 'INV-1',
    total: 100,
    status: 'paid',
  });

  await Invoice.create({
    companyId: admin.companyId,
    userId: seller2._id,
    customerId: c2._id,
    number: 'INV-2',
    total: 200,
    status: 'PENDING',
  });

  const sellerToken = tokenFor(seller1);
  const adminToken = tokenFor(admin);

  const sellerList = await request(app)
    .get('/api/invoices')
    .set('Authorization', `Bearer ${sellerToken}`);

  expect(sellerList.body).toHaveLength(1);

  const adminList = await request(app)
    .get('/api/invoices')
    .set('Authorization', `Bearer ${adminToken}`);

  expect(adminList.body).toHaveLength(2);

  const sellerGet = await request(app)
    .get(`/api/invoices/${inv1._id}`)
    .set('Authorization', `Bearer ${sellerToken}`);

  expect(sellerGet.status).toBe(200);

  const invalidGet = await request(app)
    .get('/api/invoices/invalid-id')
    .set('Authorization', `Bearer ${sellerToken}`);

  expect(invalidGet.status).toBe(400);
});

test('stats respond with zeroed values when no data', async () => {
  const admin = await createAdmin();
  const seller = await createSeller(admin.companyId, 'empty');
  const sellerToken = tokenFor(seller);

  const res = await request(app)
    .get('/api/stats')
    .set('Authorization', `Bearer ${sellerToken}`);

  expect(res.status).toBe(200);
  expect(res.body.totalSales).toBe(0);
  expect(res.body.totalExpenses).toBe(0);
  expect(res.body.balance).toBe(0);
  expect(res.body.totalInvoices).toBe(0);
});
