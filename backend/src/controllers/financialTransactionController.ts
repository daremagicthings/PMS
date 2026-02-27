import { Request, Response } from 'express';
import * as transactionService from '../services/financialTransactionService';

export const createTransactionController = async (req: Request, res: Response) => {
  try {
    const transaction = await transactionService.createFinancialTransaction(req.body);
    res.status(201).json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ success: false, message: 'Failed to create financial transaction' });
  }
};

export const getTransactionsByReportController = async (req: Request, res: Response) => {
  try {
    const reportId = req.params.reportId as string;
    const transactions = await transactionService.getTransactionsByReport(reportId);
    res.json({ success: true, data: transactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch financial transactions' });
  }
};

export const deleteTransactionController = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await transactionService.deleteFinancialTransaction(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ success: false, message: 'Failed to delete financial transaction' });
  }
};
