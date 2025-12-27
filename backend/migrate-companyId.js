require('dotenv').config();
const { connect, mongoose } = require('./src/mongo');
const User = require('./src/models/User');
const Customer = require('./src/models/Customer');
const Transaction = require('./src/models/Transaction');
const Invoice = require('./src/models/Invoice');
const Notification = require('./src/models/Notification');

const isMissingCompany = { $or: [{ companyId: { $exists: false } }, { companyId: null }] };

const loadUserCompanyMap = async () => {
  const users = await User.find({ companyId: { $ne: null } }, { _id: 1, companyId: 1 }).lean();
  const map = new Map();
  for (const user of users) {
    if (user.companyId) {
      map.set(String(user._id), user.companyId);
    }
  }
  return map;
};

const backfillCompanyId = async (Model, name, userMap) => {
  const docs = await Model.find(isMissingCompany, { _id: 1, userId: 1 }).lean();
  if (!docs.length) {
    console.log(`${name}: nothing to update`);
    return;
  }

  const ops = [];
  for (const doc of docs) {
    const companyId = userMap.get(String(doc.userId));
    if (!companyId) continue;
    ops.push({
      updateOne: {
        filter: { _id: doc._id },
        update: { $set: { companyId } },
      },
    });
  }

  if (!ops.length) {
    console.log(`${name}: no matching companyId found`);
    return;
  }

  const result = await Model.bulkWrite(ops);
  console.log(`${name}: updated ${result.modifiedCount} documents`);
};

async function migrate() {
  await connect();
  console.log('Starting companyId migration...');

  const admins = await User.find({ role: 'admin' }).lean();
  let adminMissing = 0;
  for (const admin of admins) {
    if (!admin.companyId) {
      await User.updateOne({ _id: admin._id }, { $set: { companyId: admin._id } });
      adminMissing += 1;
    }
  }
  console.log(`Admins updated: ${adminMissing}`);

  let defaultCompanyId = null;
  if (process.env.COMPANY_ID_DEFAULT) {
    defaultCompanyId = new mongoose.Types.ObjectId(process.env.COMPANY_ID_DEFAULT);
    console.log(`Using COMPANY_ID_DEFAULT: ${defaultCompanyId}`);
  } else if (admins.length === 1) {
    defaultCompanyId = admins[0]._id;
    console.log(`Single admin detected, using companyId: ${defaultCompanyId}`);
  }

  if (defaultCompanyId) {
    const sellerResult = await User.updateMany(
      { role: 'seller', ...isMissingCompany },
      { $set: { companyId: defaultCompanyId } }
    );
    console.log(`Sellers updated with default companyId: ${sellerResult.modifiedCount}`);
  } else {
    const missingSellers = await User.countDocuments({ role: 'seller', ...isMissingCompany });
    if (missingSellers > 0) {
      console.warn(`Sellers missing companyId: ${missingSellers}. Provide COMPANY_ID_DEFAULT to update them.`);
    }
  }

  const userMap = await loadUserCompanyMap();
  await backfillCompanyId(Customer, 'Customers', userMap);
  await backfillCompanyId(Transaction, 'Transactions', userMap);
  await backfillCompanyId(Invoice, 'Invoices', userMap);
  await backfillCompanyId(Notification, 'Notifications', userMap);

  console.log('Migration completed.');
  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
