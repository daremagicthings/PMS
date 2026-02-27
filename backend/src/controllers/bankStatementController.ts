import { Request, Response } from 'express';
import * as bankStatementService from '../services/bankStatementService';
import fs from 'fs';

export const uploadBankStatementsController = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const result = await bankStatementService.uploadBankStatements(req.file.path);
        
        // Clean up file after import
        fs.unlinkSync(req.file.path);

        res.status(200).json({
            success: true,
            message: 'Bank statements imported successfully',
            data: result,
        });
    } catch (error: any) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

export const getPendingStatementsController = async (req: Request, res: Response) => {
    try {
        const statements = await bankStatementService.getPendingBankStatements();
        res.status(200).json({ success: true, message: 'Pending statements retrieved', data: statements });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

export const autoMatchController = async (req: Request, res: Response) => {
    try {
        const result = await bankStatementService.autoMatchStatements();
        res.status(200).json({ success: true, message: `Successfully matched ${result.matchedCount} statements`, data: result });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

export const manualMatchController = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { invoiceId } = req.body;

        if (!invoiceId) {
            return res.status(400).json({ success: false, message: 'invoiceId is required' });
        }

        const result = await bankStatementService.manualMatchStatement(id, invoiceId);
        res.status(200).json({ success: true, message: 'Successfully matched and paid invoice', data: result });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};
