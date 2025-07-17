// src/routes/securityDemo.js
require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const secrets = require('secrets.js-grempe');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// In‑memory user store (id → { username, passwordHash, roles })
const userStore = new Map();

// ─── Key Management System (KMS) ────────────────────────────────────────────
class KMS {
  constructor() {
    this.keys = new Map();        // keyId → { encryptedKey, iv, authTag, keySpec, creationDate, enabled }
    this.keyAliases = new Map();  // alias → keyId
    this._generateMasterKey();
  }

  _generateMasterKey() {
    this.masterKey = crypto.randomBytes(32);                // 256‑bit AES key
    this.masterKeyId = crypto.randomBytes(16).toString('hex');
  }

  createKey(alias, keySpec = 'AES_256') {
    if (this.keyAliases.has(alias)) {
      throw new Error(`Alias "${alias}" already exists`);
    }
    const keyId = crypto.randomBytes(16).toString('hex');
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(12);  // GCM nonce
    const cipher = crypto.createCipheriv('aes-256-gcm', this.masterKey, iv);
    const encryptedKey = Buffer.concat([cipher.update(key), cipher.final()]);
    const authTag = cipher.getAuthTag();

    this.keys.set(keyId, {
      encryptedKey,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      keySpec,
      creationDate: new Date().toISOString(),
      enabled: true
    });
    this.keyAliases.set(alias, keyId);

    return { keyId, alias, keySpec, creationDate: this.keys.get(keyId).creationDate };
  }

  describeKey(keyId) {
    const meta = this.keys.get(keyId);
    if (!meta) throw new Error('Key not found');
    const { keySpec, creationDate, enabled } = meta;
    return { keyId, keySpec, creationDate, enabled };
  }

  encrypt(keyId, plaintext) {
    const meta = this.keys.get(keyId);
    if (!meta) throw new Error('Key not found');

    // 1) Unwrap the key
    const iv = Buffer.from(meta.iv, 'hex');
    const authTag = Buffer.from(meta.authTag, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', this.masterKey, iv);
    decipher.setAuthTag(authTag);
    const key = Buffer.concat([decipher.update(meta.encryptedKey), decipher.final()]);

    // 2) Encrypt the data with unwrapped key (AES‑GCM)
    const dataIv = crypto.randomBytes(12);
    const dataCipher = crypto.createCipheriv('aes-256-gcm', key, dataIv);
    const ciphertext = Buffer.concat([dataCipher.update(Buffer.from(plaintext, 'utf8')), dataCipher.final()]);
    const dataAuthTag = dataCipher.getAuthTag();

    return {
      keyId,
      ciphertext: ciphertext.toString('hex'),
      iv: dataIv.toString('hex'),
      authTag: dataAuthTag.toString('hex')
    };
  }

  decrypt(keyId, ciphertextHex, ivHex, authTagHex) {
    const meta = this.keys.get(keyId);
    if (!meta) throw new Error('Key not found');

    // 1) Unwrap the key
    const iv = Buffer.from(meta.iv, 'hex');
    const authTag = Buffer.from(meta.authTag, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', this.masterKey, iv);
    decipher.setAuthTag(authTag);
    const key = Buffer.concat([decipher.update(meta.encryptedKey), decipher.final()]);

    // 2) Decrypt the data
    const dataIv = Buffer.from(ivHex, 'hex');
    const dataAuthTag = Buffer.from(authTagHex, 'hex');
    const dataDecipher = crypto.createDecipheriv('aes-256-gcm', key, dataIv);
    dataDecipher.setAuthTag(dataAuthTag);
    const plaintext = Buffer.concat([dataDecipher.update(Buffer.from(ciphertextHex, 'hex')), dataDecipher.final()]);

    return plaintext.toString('utf8');
  }
}

// ─── Secure Multi‑Party Computation (SMPC) ───────────────────────────────────
class SMPC {
  constructor() {
    this.parties = new Map(); // partyId → { input, shares: [] }
  }

  addParty(partyId, input) {
    if (this.parties.has(partyId)) {
      throw new Error(`Party "${partyId}" already exists`);
    }
    this.parties.set(partyId, { input, shares: [] });
  }

  generateShares(partyId, totalShares, threshold) {
    const p = this.parties.get(partyId);
    if (!p) throw new Error('Party not found');
    const secretHex = secrets.str2hex(String(p.input));
    const shares = secrets.share(secretHex, totalShares, threshold);
    p.shares = shares; // Store shares on the party object
    // return as [{ id:1, share: '801abc...' }, ...]
    return shares.map((sh, i) => ({ id: i + 1, share: sh }));
  }

  reconstructSecret(sharesArray) {
    const hex = secrets.combine(sharesArray);
    return secrets.hex2str(hex);
  }

  computeSum(threshold) {
    let total = 0;
    let found = false;
    for (const [partyId, { shares }] of this.parties) {
      console.log(`Party ${partyId} shares:`, shares);
      if (!shares || shares.length < threshold) {
        console.log(`Not enough shares for party ${partyId}`);
        continue;
      }
      const subset = shares.slice(0, threshold).map(s => s);
      const secret = Number(this.reconstructSecret(subset));
      total += secret;
      found = true;
    }
    return found ? total : null;
  }
}

// ─── JWT & User Management ──────────────────────────────────────────────────
class TokenManager {
  constructor() {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET must be set in environment');
    }
    this.secret = process.env.JWT_SECRET;
    this.refreshTokens = new Map(); // token → { userId, expiresAt }
  }

  generateAccessToken(userId, roles = []) {
    return jwt.sign({ userId, roles, type: 'access' }, this.secret, { expiresIn: '15m' });
  }

  generateRefreshToken(userId) {
    const token = crypto.randomBytes(64).toString('hex');
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
    this.refreshTokens.set(token, { userId, expiresAt });
    return token;
  }

  verifyToken(token) {
    try {
      const payload = jwt.verify(token, this.secret);
      return { valid: true, payload };
    } catch (err) {
      return { valid: false, error: err.message };
    }
  }

  refreshAccessToken(refreshToken) {
    const data = this.refreshTokens.get(refreshToken);
    if (!data) throw new Error('Invalid refresh token');
    if (data.expiresAt < Date.now()) {
      this.refreshTokens.delete(refreshToken);
      throw new Error('Refresh token expired');
    }
    return this.generateAccessToken(data.userId);
  }

  revokeRefreshToken(token) {
    return this.refreshTokens.delete(token);
  }
}

// ─── Shared Instances ───────────────────────────────────────────────────────
const kms    = new KMS();
const smpc   = new SMPC();
const tokenM = new TokenManager();

// ─── Routes ──────────────────────────────────────────────────────────────────

// ── Auth ────────────────────────────────────────────────────────────────────
// Register
router.post('/auth/register', [
  body('username').trim().notEmpty(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { username, password } = req.body;
  if ([...userStore.values()].some(u => u.username === username)) {
    return res.status(409).json({ error: 'Username already taken' });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const userId = crypto.randomUUID();
  userStore.set(userId, { username, passwordHash, roles: ['user'] });
  res.status(201).json({ userId, username });
});

// Login
router.post('/auth/login', [
  body('username').notEmpty(),
  body('password').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { username, password } = req.body;
  const entry = [...userStore.entries()].find(([,u]) => u.username === username);
  if (!entry) return res.status(401).json({ error: 'Invalid credentials' });
  const [userId, user] = entry;
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });

  const accessToken  = tokenM.generateAccessToken(userId, user.roles);
  const refreshToken = tokenM.generateRefreshToken(userId);
  res.json({ accessToken, refreshToken, user: { userId, username, roles: user.roles } });
});

// Verify
router.post('/auth/verify', [
  body('token').notEmpty()
], (req, res) => {
  const result = tokenM.verifyToken(req.body.token);
  res.json(result);
});

// Refresh
router.post('/auth/refresh', [
  body('refreshToken').notEmpty()
], (req, res) => {
  try {
    const newToken = tokenM.refreshAccessToken(req.body.refreshToken);
    res.json({ accessToken: newToken });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

// Logout
router.post('/auth/logout', [
  body('refreshToken').notEmpty()
], (req, res) => {
  tokenM.revokeRefreshToken(req.body.refreshToken);
  res.json({ message: 'Logged out' });
});

// ── KMS ─────────────────────────────────────────────────────────────────────
router.post('/kms/create-key', [
  body('alias').notEmpty(),
  body('keySpec').optional().isIn(['AES_256', 'AES_128', 'RSA_2048'])
], (req, res) => {
  try {
    const key = kms.createKey(req.body.alias, req.body.keySpec);
    res.json({ key, message: 'Key created' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/kms/describe-key/:keyId', (req, res) => {
  try {
    res.json(kms.describeKey(req.params.keyId));
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

router.post('/kms/encrypt', [
  body('keyId').notEmpty(),
  body('plaintext').notEmpty()
], (req, res) => {
  try {
    const ct = kms.encrypt(req.body.keyId, req.body.plaintext);
    res.json(ct);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/kms/decrypt', [
  body('keyId').notEmpty(),
  body('ciphertext').notEmpty(),
  body('iv').notEmpty(),
  body('authTag').notEmpty()
], (req, res) => {
  try {
    const pt = kms.decrypt(
      req.body.keyId,
      req.body.ciphertext,
      req.body.iv,
      req.body.authTag
    );
    res.json({ plaintext: pt });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── KMS DEMO ───────────────────────────────────────────────────────────────
router.post('/kms/demo', (req, res) => {
  try {
    // Check if 'demo-key' already exists
    let keyId;
    if (kms.keyAliases.has('demo-key')) {
      keyId = kms.keyAliases.get('demo-key');
    } else {
      const key = kms.createKey('demo-key', 'AES_256');
      keyId = key.keyId;
    }
    // Encrypt a sample plaintext
    const plaintext = 'Hello, KMS!';
    const ct = kms.encrypt(keyId, plaintext);
    // Decrypt it back
    const pt = kms.decrypt(keyId, ct.ciphertext, ct.iv, ct.authTag);
    res.json({
      key: kms.describeKey(keyId),
      plaintext,
      ciphertext: ct.ciphertext,
      decrypted: pt,
      iv: ct.iv,
      authTag: ct.authTag
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── SMPC ────────────────────────────────────────────────────────────────────
router.post('/smpc/add-party', [
  body('partyId').notEmpty(),
  body('input').isInt()
], (req, res) => {
  try {
    smpc.addParty(req.body.partyId, Number(req.body.input));
    // Return the party data
    res.json({
      partyId: req.body.partyId,
      input: Number(req.body.input)
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/smpc/generate-shares', [
  body('partyId').notEmpty(),
  body('totalShares').isInt({ min: 2 }),
  body('threshold').isInt({ min: 2 })
], (req, res) => {
  try {
    const shares = smpc.generateShares(
      req.body.partyId,
      Number(req.body.totalShares),
      Number(req.body.threshold)
    );
    res.json({ shares });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/smpc/reconstruct', [
  body('shares').isArray({ min: 2 })
], (req, res) => {
  try {
    const secret = smpc.reconstructSecret(req.body.shares);
    res.json({ secret });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/smpc/compute-sum', [
  body('threshold').isInt({ min: 2 })
], (req, res) => {
  try {
    const total = smpc.computeSum(Number(req.body.threshold));
    res.json({ total });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Alias for /smpc/compute-sum
// router.post('/smpc/compute', [
//   body('threshold').isInt({ min: 2 })
// ], (req, res) => {
//   try {
//     const total = smpc.computeSum(Number(req.body.threshold));
//     res.json({ total });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });


// ── SMPC Compute ───────────────────────────────────────────────────────────────
router.post(
  '/smpc/compute',
  [ body('threshold').isInt({ min: 2 }) ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const threshold = Number(req.body.threshold);
    const results = [];
    for (const [partyId, { input, shares }] of smpc.parties.entries()) {
      if (Array.isArray(shares) && shares.length >= threshold) {
        // shares are stored as strings; combine needs just the share-strings
        const secret = smpc.reconstructSecret(shares.slice(0, threshold));
        results.push({
          partyId,
          input,
          sum: Number(secret)
        });
      }
    }
    const totalSum = results.reduce((acc, r) => acc + r.sum, 0);

    return res.json({
      parties: results.map(r => r.partyId),
      results,
      totalSum,
      computationType: 'sum',
      algorithm: 'Shamir Secret Sharing'
    });
  }
);

// // ── SMPC DEMO ──────────────────────────────────────────────────────────────
// router.post('/smpc/demo', (req, res) => {
//   try {
//     // Clear all parties before running the demo
//     smpc.parties.clear();
//     // Add a demo party
//     const partyId = 'demo-party';
//     const input = 42;
//     smpc.addParty(partyId, input);
//     // Generate shares
//     const shares = smpc.generateShares(partyId, 5, 3);
//     // Reconstruct secret from shares
//     const shareStrings = shares.map(s => s.share);
//     const secret = smpc.reconstructSecret(shareStrings.slice(0, 3));
//     // Compute sum (only one party, so sum = input)
//     const total = smpc.computeSum(3);
//     res.json({
//       partyId,
//       input,
//       shares,
//       reconstructed: secret,
//       total
//     });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });


// ── SMPC Demo ────────────────────────────────────────────────────────────────
router.post('/smpc/demo', (req, res) => {
  // wipe any prior parties
  smpc.parties.clear();

  // single demo party
  const demoId = 'demo-party';
  const demoInput = 42;
  smpc.addParty(demoId, demoInput);

  // give it 5 shares, threshold 3
  const shares = smpc.generateShares(demoId, 5, 3);

  // reconstruct with first 3
  const secret = smpc.reconstructSecret(shares.map(s => s.share).slice(0, 3));

  // computeSum with threshold 3
  const totalSum = smpc.computeSum(3);

  return res.json({
    parties: [demoId],
    results: [{
      partyId: demoId,
      input: demoInput,
      sum: Number(secret)
    }],
    totalSum,
    computationType: 'sum',
    algorithm: 'Shamir Secret Sharing'
  });
});

// ── Expose router ────────────────────────────────────────────────────────────
module.exports = router;
