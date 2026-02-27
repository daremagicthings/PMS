import prisma from '../lib/prisma';

interface CreateTransactionInput {
  date: string;
  amount: number;
  receiverSender: string;
  description: string;
  type: string;
  reportId: string;
}

export const createFinancialTransaction = async (data: CreateTransactionInput) => {
  return prisma.financialTransaction.create({
    data: {
      ...data,
      date: new Date(data.date),
    },
  });
};

export const getTransactionsByReport = async (reportId: string) => {
  return prisma.financialTransaction.findMany({
    where: { reportId },
    orderBy: { date: 'asc' },
  });
};

export const deleteFinancialTransaction = async (id: string) => {
  return prisma.financialTransaction.delete({
    where: { id },
  });
};
