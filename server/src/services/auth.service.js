const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { AppError } = require('../errors/app-error');

class AuthService {
  constructor(userRepository, config) {
    this.users = userRepository;
    this.config = config;
  }

  async register({ name, email, password }) {
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await this.users.findByEmail(normalizedEmail);

    if (existingUser) {
      throw new AppError(409, 'EMAIL_IN_USE', 'An account with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(password, this.config.bcryptRounds);
    const user = await this.users.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
    });

    return this.createSession(user);
  }

  async login({ email, password }) {
    const user = await this.users.findByEmail(email.trim().toLowerCase());
    const passwordMatches = user && (await bcrypt.compare(password, user.passwordHash));

    if (!passwordMatches) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.');
    }

    return this.createSession(user);
  }

  createSession(user) {
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    const token = jwt.sign(
      { sub: user.id, role: user.role, name: user.name },
      this.config.jwtSecret,
      { expiresIn: this.config.jwtExpiresIn },
    );

    return { user: safeUser, token };
  }
}

module.exports = { AuthService };

