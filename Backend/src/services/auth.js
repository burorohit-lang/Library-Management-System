const { promisify } = require('node:util');
const { randomBytes, scrypt: scryptCallback, createHmac, timingSafeEqual } = require('node:crypto');
const User = require('../models/User');

const scrypt = promisify(scryptCallback);

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = await scrypt(password, salt, 64);
  return `${salt}:${hash.toString('hex')}`;
}

async function verifyPassword(password, storedHash) {
  const [salt, expectedHex] = storedHash.split(':');
  if (!salt || !expectedHex) return false;
  const expected = Buffer.from(expectedHex, 'hex');
  const actual = await scrypt(password, salt, expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function createToken(user) {
  const payload = Buffer.from(JSON.stringify({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    exp: Date.now() + 8 * 60 * 60 * 1000
  })).toString('base64url');
  const signature = createHmac('sha256', process.env.JWT_SECRET).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function readToken(token) {
  const [payload, signature, extra] = String(token || '').split('.');
  if (!payload || !signature || extra) return null;
  const expected = createHmac('sha256', process.env.JWT_SECRET).update(payload).digest();
  let actual;
  try {
    actual = Buffer.from(signature, 'base64url');
  } catch {
    return null;
  }
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  try {
    const user = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return user.exp > Date.now() ? user : null;
  } catch {
    return null;
  }
}

async function seedAdmin(email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  const existingAdmin = await User.findOne({ role: 'admin' });
  if (existingAdmin) return;
  await User.create({
    name: 'Library Admin',
    email: normalizedEmail,
    passwordHash: await hashPassword(password),
    role: 'admin'
  });
  console.log(`Initial admin account created for ${normalizedEmail}.`);
}

module.exports = { createToken, hashPassword, readToken, seedAdmin, verifyPassword };
