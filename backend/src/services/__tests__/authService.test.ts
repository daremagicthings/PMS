import * as authService from '../authService';
import prisma from '../../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock dependencies
jest.mock('../../lib/prisma', () => ({
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
}));
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should throw an error if user is not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(authService.login({ phone: '12345678', password: 'password123' }))
        .rejects
        .toThrow('Invalid phone number or password');
    });

    it('should throw an error if password is invalid', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user-1', passwordHash: 'hashed' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.login({ phone: '12345678', password: 'wrongpassword' }))
        .rejects
        .toThrow('Invalid phone number or password');
    });

    it('should return a token and user data on successful login', async () => {
      const mockUser = {
        id: 'user-1',
        name: 'Test User',
        phone: '12345678',
        email: null,
        role: 'RESIDENT',
        apartmentId: 'apt-1',
        passwordHash: 'hashed',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mock-jwt-token');

      const result = await authService.login({ phone: '12345678', password: 'correctpassword' });

      expect(result.token).toBe('mock-jwt-token');
      expect(result.user.id).toBe(mockUser.id);
      expect(result.user.role).toBe('RESIDENT');
      expect(jwt.sign).toHaveBeenCalled();
    });
  });

  describe('changePassword', () => {
    it('should change password successfully if old password is correct', async () => {
      const mockUser = { id: 'user-1', passwordHash: 'old-hashed' };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed');

      const result = await authService.changePassword('user-1', {
        oldPassword: 'oldpassword',
        newPassword: 'newpassword123'
      });

      expect(result.message).toBe('Password changed successfully');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { passwordHash: 'new-hashed' }
      });
    });
  });
});
