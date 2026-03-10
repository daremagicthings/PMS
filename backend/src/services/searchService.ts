import prisma from '../lib/prisma';

export const performUniversalSearch = async (query: string) => {
  const searchTerm = `%${query}%`;
  
  const [users, apartments, vehicles, tickets, polls, announcements, faqs, staticContents] = await Promise.all([
    // Search Users (Name, Phone, Email)
    prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ]
      },
      select: { id: true, name: true, phone: true, role: true },
      take: 5
    }),
    
    // Search Apartments (Building, Unit, Contract)
    prisma.apartment.findMany({
      where: {
        OR: [
          { buildingName: { contains: query, mode: 'insensitive' } },
          { unitNumber: { contains: query, mode: 'insensitive' } },
          { contractId: { contains: query, mode: 'insensitive' } },
          { contractNumber: { contains: query, mode: 'insensitive' } },
        ]
      },
      select: { id: true, buildingName: true, unitNumber: true, unitType: true },
      take: 5
    }),
    
    // Search Vehicles (License Plate, Make Model)
    prisma.vehicle.findMany({
      where: {
        OR: [
          { licensePlate: { contains: query, mode: 'insensitive' } },
          { makeModel: { contains: query, mode: 'insensitive' } },
        ]
      },
      select: { id: true, licensePlate: true, makeModel: true, apartment: { select: { buildingName: true, unitNumber: true } } },
      take: 5
    }),
    
    // Search Tickets (Title, Description)
    prisma.ticket.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ]
      },
      select: { id: true, title: true, status: true },
      take: 5
    }),

    // Search Polls
    prisma.poll.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ]
      },
      select: { id: true, title: true, status: true },
      take: 5
    }),

    // Search Announcements & Documents
    prisma.announcement.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
        ]
      },
      select: { id: true, title: true, category: true },
      take: 5
    }),

    // Search FAQs
    prisma.faq.findMany({
      where: {
        OR: [
          { question: { contains: query, mode: 'insensitive' } },
          { answer: { contains: query, mode: 'insensitive' } },
        ]
      },
      select: { id: true, question: true },
      take: 5
    }),

    // Search Static Content
    prisma.staticContent.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
        ]
      },
      select: { id: true, title: true, type: true },
      take: 5
    }),
  ]);

  return {
    users,
    apartments,
    vehicles,
    tickets,
    polls,
    announcements,
    faqs,
    staticContents
  };
};

