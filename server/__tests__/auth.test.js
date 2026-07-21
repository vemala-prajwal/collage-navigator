const request = require('supertest');
const app = require('../app');
const User = require('../models/User');

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn().mockResolvedValue(true),
}));

jest.mock('../models/User', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  find: jest.fn(),
}));

describe('Auth routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers a user', async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({ _id: 'user-1', name: 'Test User', email: 'test@example.com', role: 'student', passwordHash: 'hash' });

    const response = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'test@example.com', password: 'password123' });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
  }, 15000);

  it('logs in a user', async () => {
    User.findOne.mockResolvedValue({ _id: 'user-1', name: 'Test User', email: 'test@example.com', role: 'student', passwordHash: 'hash' });

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  }, 15000);
});
