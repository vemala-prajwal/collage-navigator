const request = require('supertest');

jest.mock('../lib/authService', () => ({
  CAMPUSES: ['Main Campus', 'North Campus'],
  registerAccount: jest.fn(),
  loginAccount: jest.fn(),
  getCurrentUser: jest.fn(),
  requestPhonePasswordReset: jest.fn(),
  verifyPhonePasswordResetOtp: jest.fn(),
  resetPasswordWithToken: jest.fn(),
}));

const authService = require('../lib/authService');
const app = require('../app');

describe('Auth routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers a user with the complete account payload', async () => {
    authService.registerAccount.mockResolvedValue({
      token: 'registration-token',
      user: {
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        campus: 'Main Campus',
        role: 'student',
        sanUsn: '1RN21CS001',
      },
    });

    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        campus: 'Main Campus',
        sanUsn: '1RN21CS001',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token', 'registration-token');
    expect(authService.registerAccount).toHaveBeenCalledWith(expect.objectContaining({
      email: 'test@example.com',
      campus: 'Main Campus',
      sanUsn: '1RN21CS001',
    }));
  });

  it('logs in a user', async () => {
    authService.loginAccount.mockResolvedValue({
      token: 'login-token',
      user: { id: 'user-1', email: 'test@example.com', role: 'student' },
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token', 'login-token');
  });

  it('handles phone password reset request', async () => {
    authService.requestPhonePasswordReset.mockResolvedValue({
      maskedPhone: '+91 *****5678',
      phone: '+919876545678',
      message: "If this number is registered, you'll receive a code shortly.",
    });

    const response = await request(app)
      .post('/api/auth/forgot-password-phone')
      .send({ phone: '+919876545678' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('maskedPhone', '+91 *****5678');
  });

  it('handles phone OTP verification for password reset', async () => {
    authService.verifyPhonePasswordResetOtp.mockResolvedValue({
      resetToken: 'mock-reset-token',
    });

    const response = await request(app)
      .post('/api/auth/verify-otp')
      .send({ phone: '+919876545678', otp: '123456', firebaseToken: 'mock-fb-token' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('resetToken', 'mock-reset-token');
  });

  it('resets password with token', async () => {
    authService.resetPasswordWithToken.mockResolvedValue({
      message: 'Password has been reset successfully.',
    });

    const response = await request(app)
      .post('/api/auth/reset-password-with-token')
      .send({ token: 'mock-reset-token', password: 'newPassword123!' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Password has been reset successfully.');
  });
});
