process.env.SUPABASE_URL = '';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = '';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.JWT_SECRET = 'test-secret';

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

const { createClient } = require('@supabase/supabase-js');
const publicClient = {
  auth: {
    admin: {},
    signUp: jest.fn(),
  },
};

createClient.mockReturnValue(publicClient);

const { registerAccount } = require('../lib/authService');

describe('registerAccount with public Supabase auth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates an account when only the anon key is available', async () => {
    publicClient.auth.signUp.mockResolvedValue({
      data: {
        user: {
          id: 'public-user-1',
          identities: [{ id: 'identity-1' }],
        },
        session: { access_token: 'supabase-session' },
      },
      error: null,
    });

    const result = await registerAccount({
      name: 'Public User',
      email: 'public@example.com',
      password: 'strongPass123!',
      campus: 'Main Campus',
      role: 'admin',
      sanUsn: '1RN21CS001',
    });

    expect(result.token).toEqual(expect.any(String));
    expect(result.user).toMatchObject({
      id: 'public-user-1',
      role: 'student',
      email: 'public@example.com',
    });
    expect(publicClient.auth.signUp).toHaveBeenCalledWith(expect.objectContaining({
      email: 'public@example.com',
      options: expect.objectContaining({
        data: expect.objectContaining({ role: 'student' }),
      }),
    }));
  });

  it('reports when email confirmation is required', async () => {
    publicClient.auth.signUp.mockResolvedValue({
      data: {
        user: { id: 'public-user-2', identities: [{ id: 'identity-2' }] },
        session: null,
      },
      error: null,
    });

    const result = await registerAccount({
      name: 'Pending User',
      email: 'pending@example.com',
      password: 'strongPass123!',
      campus: 'North Campus',
      sanUsn: '1RN21CS002',
    });

    expect(result.token).toBeNull();
    expect(result.requiresEmailConfirmation).toBe(true);
  });
});
