const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { AuthService } = require('../src/services/auth.service');

describe('AuthService', () => {
  let users;
  let repository;
  let service;

  beforeEach(() => {
    users = [];
    repository = {
      findByEmail: jest.fn(async (email) => users.find((user) => user.email === email) || null),
      create: jest.fn(async (data) => {
        const user = { id: `user-${users.length + 1}`, role: 'USER', ...data };
        users.push(user);
        return user;
      }),
    };
    service = new AuthService(repository, {
      jwtSecret: 'test-secret',
      jwtExpiresIn: '1h',
      bcryptRounds: 4,
    });
  });

  test('registers a user with a normalized email and hashed password', async () => {
    const result = await service.register({
      name: 'Asha Rao',
      email: ' ASHA@Example.COM ',
      password: 'StrongPass1!',
    });

    expect(result.user).toEqual({
      id: 'user-1',
      name: 'Asha Rao',
      email: 'asha@example.com',
      role: 'USER',
    });
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'asha@example.com' }),
    );
    expect(await bcrypt.compare('StrongPass1!', users[0].passwordHash)).toBe(true);
    expect(jwt.verify(result.token, 'test-secret').sub).toBe('user-1');
  });

  test('rejects a duplicate email', async () => {
    users.push({ id: 'existing', email: 'asha@example.com', passwordHash: 'hash', role: 'USER' });

    await expect(
      service.register({ name: 'Asha', email: 'ASHA@example.com', password: 'StrongPass1!' }),
    ).rejects.toMatchObject({ status: 409, code: 'EMAIL_IN_USE' });
  });

  test('logs in with valid credentials and never returns the password hash', async () => {
    users.push({
      id: 'user-1',
      name: 'Asha Rao',
      email: 'asha@example.com',
      passwordHash: await bcrypt.hash('StrongPass1!', 4),
      role: 'USER',
    });

    const result = await service.login({ email: 'ASHA@example.com', password: 'StrongPass1!' });

    expect(result.user).toEqual({
      id: 'user-1',
      name: 'Asha Rao',
      email: 'asha@example.com',
      role: 'USER',
    });
    expect(result).not.toHaveProperty('passwordHash');
  });

  test('rejects invalid credentials without revealing which field failed', async () => {
    await expect(
      service.login({ email: 'missing@example.com', password: 'WrongPass1!' }),
    ).rejects.toMatchObject({ status: 401, code: 'INVALID_CREDENTIALS' });
  });
});

