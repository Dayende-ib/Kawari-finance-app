const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


// 🔹 Créer une vente
const createSale = async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  try {
    const { amount, currency, date, description, paymentMethod, category } = req.body;
    
     // ✅ Validation du montant
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    const sale = await prisma.transaction.create({
      data: {
        type: "sale",
        userId: req.user.id,
        customerId: customerId || null, // Temporarily set to null
        amount,
        currency,
        date: new Date(date),
        description,
        paymentMethod,
        category
        
      }
    });

    // 🔔 Notification automatique
    await prisma.notification.create({
      data: {
        userId: req.user.id,
        message: `Nouvelle vente de ${amount} ${currency}`,
        type: "sale"
      }
    });

    const { customerId, ...safeSale } = sale;
    res.json(safeSale);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all sales
const getAllSales = async (req, res) => {
  try {
    const sales = await prisma.transaction.findMany({
      where: { type: "sale", userId: req.user.id }
    });
    const cleaned = sales.map(({ customerId, ...rest }) => rest);
    res.json(cleaned);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get sale by ID
const getSaleById = async (req, res) => {
  try {
    const sale = await prisma.transaction.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    if (!sale) return res.status(404).json({ message: "Sale not found" });
    const { customerId, ...safeSale } = sale;
    res.json(safeSale);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update sale
const updateSale = async (req, res) => {
  try {
    if (req.body.amount && req.body.amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }
    const sale = await prisma.transaction.update({
      where: { id: parseInt(req.params.id) },
      data: req.body
    });
    const { customerId, ...safeSale } = sale;
    res.json(safeSale);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete sale
const deleteSale= async (req, res) => {
  try {
    await prisma.transaction.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ message: "Sale deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




// Créer une dépense
const createExpense = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    const { amount, currency, date, description, paymentMethod, category } = req.body;
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // ✅ Validation du montant
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    const expense = await prisma.transaction.create({
      data: {
        type: "expense",
        userId: req.user.id,
        amount,
        currency,
        customerId: customerId || null, // Temporarily set to null
        date: new Date(date),
        description,
        paymentMethod,
        category
      }
    });

    // 🔔 Notification automatique
    await prisma.notification.create({
      data: {
        userId: req.user.id,
        message: `Nouvelle dépense de ${amount} ${currency}`,
        type: "expense"
      }
    });

    const { customerId, ...safeExpense } = expense;
    res.json(safeExpense);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllExpenses = async (req, res) => {
  try {
    const expenses = await prisma.transaction.findMany({
      where: {
        type: "expense",
        userId: req.user.id
      }
    });
    const cleaned = expenses.map(({ customerId, ...rest }) => rest);
    res.json(cleaned);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get expense by ID
const getExpenseById = async (req, res) => {
  try {
    const expense = await prisma.transaction.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    const { customerId, ...safeExpense } = expense;
    res.json(safeExpense);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update expense
const updateExpense = async (req, res) => {
  try {
    if (req.body.amount && req.body.amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    const expense = await prisma.transaction.update({
      where: { id: parseInt(req.params.id) },
      data: req.body
    });
    const { customerId, ...safeExpense } = expense;
    res.json(safeExpense);
;
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete expense
const deleteExpense = async (req, res) => {
  try {
    await prisma.transaction.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ message: "Expense deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getStatistics = async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  try {
    const totalSales = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { type: "sale", userId: req.user.id }
    });

    const totalExpenses = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { type: "expense", userId: req.user.id }
    });

    // Balance
    const balance = (totalSales._sum.amount || 0) - (totalExpenses._sum.amount || 0);
    // Notifications non lues
    const unreadCount = await prisma.notification.count({
      where: { userId: req.user.id, read: false }
    });
    // Factures (optionnel si tu veux compléter ton dashboard)
    const totalInvoices = await prisma.invoice.count({
      where: { userId: req.user.id }
    });
    const unpaidInvoices = await prisma.invoice.count({
      where: { userId: req.user.id, status: "pending" }
    });

    // Placeholder temporaire
    return res.json({
      totalSales: totalSales._sum.amount || 0,
      totalExpenses: totalExpenses._sum.amount || 0,
      balance,
      unreadNotifications: unreadCount,
      totalInvoices,
      unpaidInvoices
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const getMonthlyStats = async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  try {
    const userId = req.user.id;

    // Récupérer toutes les ventes et dépenses
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: { in: ["sale", "expense"] }
      },
      select: {
        type: true,
        amount: true,
        date: true
      }
    });

    // Regrouper par mois
    const monthlyMap = {};

    transactions.forEach(({ type, amount, date }) => {
      const key = new Date(date).toLocaleString('default', { month: 'short', year: 'numeric' });

      if (!monthlyMap[key]) {
        monthlyMap[key] = { sale: 0, expense: 0 };
      }

      monthlyMap[key][type] += amount;
    });

    // Transformer en tableau
    const monthlySales = [];
    const monthlyExpenses = [];

    Object.entries(monthlyMap).forEach(([month, values]) => {
      monthlySales.push({ month, total: values.sale });
      monthlyExpenses.push({ month, total: values.expense });
    });

    res.json({ monthlySales, monthlyExpenses });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};




module.exports = {
  createSale,
  getAllSales,
  getSaleById,
  updateSale,
  deleteSale,
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getStatistics,
  getMonthlyStats
};

