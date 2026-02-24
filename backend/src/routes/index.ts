import { Router } from 'express';
import healthRoutes from './healthRoutes';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import apartmentRoutes from './apartmentRoutes';
import invoiceRoutes from './invoiceRoutes';
import ticketRoutes from './ticketRoutes';
import announcementRoutes from './announcementRoutes';
import notificationRoutes from './notificationRoutes';
import workPlanRoutes from './workPlanRoutes';
import financialReportRoutes from './financialReportRoutes';
import webhookRoutes from './webhookRoutes';
import pollRoutes from './pollRoutes';

/**
 * Central route aggregator.
 * All feature routes are imported and mounted here.
 */
const router = Router();

// ─── Health ─────────────────────────────────────────────
router.use(healthRoutes);

// ─── Auth ───────────────────────────────────────────────
router.use('/auth', authRoutes);

// ─── Users ──────────────────────────────────────────────
router.use('/users', userRoutes);

// ─── Apartments ─────────────────────────────────────────
router.use('/apartments', apartmentRoutes);

// ─── Invoices ───────────────────────────────────────────
router.use('/invoices', invoiceRoutes);

// ─── Tickets ────────────────────────────────────────────
router.use('/tickets', ticketRoutes);

// ─── Announcements ──────────────────────────────────────
router.use('/announcements', announcementRoutes);

// ─── Notifications ──────────────────────────────────────
router.use('/notifications', notificationRoutes);

// ─── Transparency & Reporting ───────────────────────────
router.use('/work-plans', workPlanRoutes);
router.use('/financial-reports', financialReportRoutes);

// ─── Polls (Digital Voting) ─────────────────────────────
router.use('/polls', pollRoutes);

// ─── Webhooks (Public — external payment callbacks) ─────
router.use('/webhooks/qpay', webhookRoutes);

export default router;




