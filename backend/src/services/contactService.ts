import prisma from '../lib/prisma';

export const getAllContacts = async () => {
    return prisma.contact.findMany({
        orderBy: { createdAt: 'desc' },
    });
};

export const createContact = async (data: {
    name: string;
    phone: string;
    role: string;
    description?: string;
}) => {
    return prisma.contact.create({
        data,
    });
};

export const updateContact = async (
    id: string,
    data: {
        name?: string;
        phone?: string;
        role?: string;
        description?: string;
    }
) => {
    return prisma.contact.update({
        where: { id },
        data,
    });
};

export const deleteContact = async (id: string) => {
    return prisma.contact.delete({
        where: { id },
    });
};
