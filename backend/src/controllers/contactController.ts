import { Request, Response } from 'express';
import * as contactService from '../services/contactService';

export const getContacts = async (req: Request, res: Response) => {
    try {
        const contacts = await contactService.getAllContacts();
        res.json({ success: true, data: contacts });
    } catch (error) {
        console.error('getContacts error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch contacts' });
    }
};

export const createContact = async (req: Request, res: Response) => {
    try {
        const name = req.body.name as string;
        const phone = req.body.phone as string;
        const role = req.body.role as string;
        const description = req.body.description as string | undefined;

        if (!name || !phone || !role) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        const newContact = await contactService.createContact({ name, phone, role, description });
        res.status(201).json({ success: true, data: newContact });
    } catch (error) {
        console.error('createContact error:', error);
        res.status(500).json({ success: false, message: 'Failed to create contact' });
    }
};

export const updateContact = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const name = req.body.name as string | undefined;
        const phone = req.body.phone as string | undefined;
        const role = req.body.role as string | undefined;
        const description = req.body.description as string | undefined;

        const updatedContact = await contactService.updateContact(id, { name, phone, role, description });
        res.json({ success: true, data: updatedContact });
    } catch (error) {
        console.error('updateContact error:', error);
        res.status(500).json({ success: false, message: 'Failed to update contact' });
    }
};

export const deleteContact = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await contactService.deleteContact(id);
        res.json({ success: true, message: 'Contact deleted successfully' });
    } catch (error) {
        console.error('deleteContact error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete contact' });
    }
};
