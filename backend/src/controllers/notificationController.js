const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Créer une notification
exports.createNotification = async (req, res) => {
  const { message, type } = req.body;
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  try {
    const notification = await prisma.notification.create({
      data: {
        userId: req.user.id,
        message,
        type
      }
    });
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Récupérer toutes les notifications de l'utilisateur
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Marquer une notification comme lue
exports.markAsRead = async (req, res) => {
  const { id } = req.params;
  try {
    const notification = await prisma.notification.update({
      where: { id: parseInt(id) },
      data: { read: true }
    });
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Supprimer une notification
exports.deleteNotification = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.notification.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Notification deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Récupérer uniquement les notifications non lues
exports.getUnreadNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id, read: false },
      orderBy: { createdAt: 'desc' }
    });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Récupérer le nombre de notifications non lues
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await prisma.notification.count({
      where: { userId: req.user.id, read: false }
    });
    res.json({ unreadCount: count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

