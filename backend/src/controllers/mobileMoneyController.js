// src/controllers/mobileMoneyController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.mockTransaction = async (req, res) => {
  try {
    const { amount, currency, operator, customerId } = req.body;

    // Auth obligatoire
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Validation basique
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }
    if (!currency) {
      return res.status(400).json({ message: "Currency is required" });
    }
    if (!operator) {
      return res.status(400).json({ message: "Operator is required" });
    }

    if (customerId) {
  const customerExists = await prisma.customer.findUnique({
    where: { id: customerId }
  });

  if (!customerExists) {
    return res.status(400).json({ message: "Client introuvable. Vérifie le customerId." });
  }
}

    // ✅ Création transaction (alignée avec ton schéma)
    const transaction = await prisma.transaction.create({
      data: {
        type: 'sale',
        userId: req.user.id,
        customerId: customerId || null, // optionnel
        amount,
        currency,
        date: new Date(), // obligatoire
        description: `Paiement Mobile Money via ${operator}`,
        paymentMethod: 'mobileMoney',
        category: 'mobile' // optionnel, existe dans ton schéma
      },
    });

    // 🔔 Notification
    await prisma.notification.create({
      data: {
        userId: req.user.id,
        message: `Transaction Mobile Money: ${amount} ${currency} via ${operator}`,
        type: 'mobileMoney'
      },
    });

    return res.json(transaction);
  } catch (err) {
    console.error('MobileMoney mock error:', err);
    return res.status(500).json({ message: err.message });
  }
};

exports.getMobileMoneyHistory = async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: req.user.id,
        paymentMethod: "mobileMoney"
      },
      orderBy: {
        date: "desc"
      }
    });

    res.json(transactions);
  } catch (err) {
    console.error("Erreur historique Mobile Money:", err);
    res.status(500).json({ message: err.message });
  }
};
