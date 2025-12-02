const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllInvoices = async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { userId: req.user.id },
      include: { items: true }
    });

    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getInvoiceById = async (req, res) => {
  const { id } = req.params;
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: parseInt(id) },
      include: { items: true } // pour inclure les items de la facture
    });
    if (!invoice || invoice.userId !== req.user.id) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createInvoice = async (req, res) => {
  const { customerId, number, total, issuedAt, status, items } = req.body;
  
  // ✅ Validations
  if (!items || items.length === 0) {
    return res.status(400).json({ message: "Invoice must have at least one item" });
  }
  if (!total || total <= 0) {
    return res.status(400).json({ message: "Total must be greater than 0" });
  }
  if (!issuedAt || isNaN(new Date(issuedAt).getTime())) {
    return res.status(400).json({ message: "Invalid issuedAt date" });
  }
  try {
    const invoice = await prisma.invoice.create({
      data: {
        userId: req.user.id,
        customerId: customerId || null,
        number: number || `INV-${Date.now()}`,
        total,
        issuedAt: new Date(issuedAt),
        status:"pending",
        items: { create: items }
      },
      include: { items: true }
    });

    //  Notification automatique
    await prisma.notification.create({
      data: {
        userId: req.user.id,
        message: `Nouvelle facture créée (#${invoice.number}) pour un total de ${total}`,
        type: "invoice"
      }
    });

    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



exports.updateInvoice = async (req, res) => {
  const { id } = req.params;
  const { customerId, number, total, issuedAt, status, items } = req.body;
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  try {
    // Vérifie si la facture existe
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id: parseInt(id) },
      include: { items: true },
    });

    if (!existingInvoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // ✅ Validations
    if (total && total <= 0) {
      return res.status(400).json({ message: "Total must be greater than 0" });
    }
    if (issuedAt && isNaN(new Date(issuedAt).getTime())) {
      return res.status(400).json({ message: "Invalid issuedAt date" });
    }

    // Mets à jour les items existants (simplification : supprime et recrée)
    await prisma.invoiceItem.deleteMany({ where: { invoiceId: parseInt(id) } });

    const updatedInvoice = await prisma.invoice.update({
      where: { id: parseInt(id) },
      data: {
        customerId,
        number: number || existingInvoice.number,
        total: total || existingInvoice.total,
        issuedAt: issuedAt ? new Date(issuedAt) : existingInvoice.issuedAt,
        status: status || existingInvoice.status,
        items: { create: items || [] },
      },
      include: { items: true },
    });

    res.json(updatedInvoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteInvoice = async (req, res) => {
  const { id } = req.params;

  try {
    // Vérifie si la facture existe
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingInvoice || existingInvoice.userId !== req.user.id) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Supprime les items liés avant la facture
    await prisma.invoiceItem.deleteMany({ where: { invoiceId: parseInt(id) } });

    // Supprime la facture
    await prisma.invoice.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Invoice deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
