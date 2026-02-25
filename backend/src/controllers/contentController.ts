import { Request, Response, NextFunction } from 'express';
import {
    createFaq,
    getAllFaqs,
    updateFaq,
    deleteFaq,
    upsertStaticContent,
    getStaticContent,
} from '../services/contentService';

/** ==============================
 *  📝 FAQ Controllers
 *  ============================== */

export const createFaqController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { question, answer, order } = req.body;
        if (!question || !answer) {
            res.status(400).json({ success: false, message: 'Question and answer are required' });
            return;
        }

        const faq = await createFaq(question, answer, order);
        res.status(201).json({ success: true, message: 'FAQ created successfully', data: faq });
    } catch (error) {
        next(error);
    }
};

export const getFaqsController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const faqs = await getAllFaqs();
        res.status(200).json({ success: true, message: 'FAQs retrieved', data: faqs });
    } catch (error) {
        next(error);
    }
};

export const updateFaqController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const id = req.params.id as string;
        const { question, answer, order } = req.body;

        const faq = await updateFaq(id, question, answer, order);
        res.status(200).json({ success: true, message: 'FAQ updated', data: faq });
    } catch (error) {
        next(error);
    }
};

export const deleteFaqController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const id = req.params.id as string;
        await deleteFaq(id);
        res.status(200).json({ success: true, message: 'FAQ deleted' });
    } catch (error) {
        next(error);
    }
};

/** ==============================
 *  📝 Static Content Controllers
 *  ============================== */

export const getStaticContentController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const type = req.params.type as string;
        const content = await getStaticContent(type);

        if (!content) {
            res.status(404).json({ success: false, message: 'Content not found' });
            return;
        }

        res.status(200).json({ success: true, message: 'Content retrieved', data: content });
    } catch (error) {
        next(error);
    }
};

export const upsertStaticContentController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const type = req.params.type as string;
        const { title, content } = req.body;

        if (!title || !content) {
            res.status(400).json({ success: false, message: 'Title and content are required' });
            return;
        }

        const updated = await upsertStaticContent(type, title, content);
        res.status(200).json({ success: true, message: 'Content saved successfully', data: updated });
    } catch (error) {
        next(error);
    }
};
