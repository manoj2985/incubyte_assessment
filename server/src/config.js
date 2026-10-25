require('dotenv').config();

function loadConfig() {
  const config = {
    port: Number(process.env.PORT || 4000),
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
    bcryptRounds: Number(process.env.BCRYPT_ROUNDS || 12),
  };

  if (!config.jwtSecret) {
    throw new Error('JWT_SECRET is required. Copy server/.env.example to server/.env.');
  }
  return config;
}

module.exports = { loadConfig };

