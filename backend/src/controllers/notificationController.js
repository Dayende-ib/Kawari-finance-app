const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const AppError = require('../utils/AppError');

// Créer une notification
exports.createNotification = async (req, res, next) => {
  const { message, type } = req.body;
  if (!req.user || !req.user.id) {
    return next(new AppError('User not authenticated', 401, 'UNAUTHORIZED'));
  }
  if (!message) {
    return next(new AppError('Message is required', 400, 'VALIDATION_ERROR'));
  }
  if (!type) {
    return next(new AppError('Type is required', 400, 'VALIDATION_ERROR'));
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
    next(new AppError(err.message, 500));
  }
};

// Récupérer toutes les notifications de l'utilisateur
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(notifications);
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

// Marquer une notification comme lue
exports.markAsRead = async (req, res, next) => {
  const { id } = req.params;
  try {
    const notification = await prisma.notification.update({
      where: { id: parseInt(id) },
      data: { read: true }
    });
    res.json(notification);
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

// Supprimer une notification
exports.deleteNotification = async (req, res, next) => {
  const { id } = req.params;
  try {
    await prisma.notification.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Notification deleted successfully" });
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

// Récupérer uniquement les notifications non lues
exports.getUnreadNotifications = async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id, read: false },
      orderBy: { createdAt: 'desc' }
    });
    res.json(notifications);
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

// Récupérer le nombre de notifications non lues
exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await prisma.notification.count({
      where: { userId: req.user.id, read: false }
    });
    res.json({ unreadCount: count });
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};
