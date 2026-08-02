const request = require('supertest');

jest.mock('../lib/authService', () => ({
  CAMPUSES: ['Main Campus', 'North Campus'],
  registerAccount: jest.fn(),
  loginAccount: jest.fn(),
  getCurrentUser: jest.fn(),
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
});
