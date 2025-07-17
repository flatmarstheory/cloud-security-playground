const express = require('express');
const crypto = require('crypto');
const forge = require('node-forge');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Helper: derive AES key bytes from passphrase
function deriveKey(passphrase, algorithm) {
  // Use SHA-256 to derive a consistent key
  const hash = crypto.createHash('sha256').update(passphrase).digest();
  switch (algorithm) {
    case 'aes-128-cbc':
      return hash.slice(0, 16);
    case 'aes-192-cbc':
      return hash.slice(0, 24);
    case 'aes-256-cbc':
    default:
      return hash;
  }
}

// === AES Encryption/Decryption ===
router.post('/aes/encrypt', [
  body('text').notEmpty().withMessage('Text is required'),
  body('key').isLength({ min: 16 }).withMessage('Key must be at least 16 characters'),
  body('algorithm').optional().isIn(['aes-128-cbc', 'aes-192-cbc', 'aes-256-cbc']).withMessage('Invalid algorithm')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { text, key, algorithm = 'aes-256-cbc' } = req.body;
  try {
    const iv = crypto.randomBytes(16);
    const keyBytes = deriveKey(key, algorithm);
    const cipher = crypto.createCipheriv(algorithm, keyBytes, iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);

    res.json({
      encrypted: encrypted.toString('hex'),
      iv: iv.toString('hex'),
      algorithm,
      keyLength: keyBytes.length * 8
    });
  } catch (err) {
    res.status(500).json({ error: 'Encryption failed', details: err.message });
  }
});

router.post('/aes/decrypt', [
  body('encrypted').notEmpty().withMessage('Encrypted text is required'),
  body('key').isLength({ min: 16 }).withMessage('Key must be at least 16 characters'),
  body('iv').notEmpty().withMessage('IV is required'),
  body('algorithm').optional().isIn(['aes-128-cbc', 'aes-192-cbc', 'aes-256-cbc']).withMessage('Invalid algorithm')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { encrypted, key, iv, algorithm = 'aes-256-cbc' } = req.body;
  try {
    const ivBuf = Buffer.from(iv, 'hex');
    const keyBytes = deriveKey(key, algorithm);
    const decipher = crypto.createDecipheriv(algorithm, keyBytes, ivBuf);
    const decrypted = Buffer.concat([decipher.update(Buffer.from(encrypted, 'hex')), decipher.final()]);

    res.json({ decrypted: decrypted.toString('utf8'), algorithm });
  } catch (err) {
    res.status(500).json({ error: 'Decryption failed', details: err.message });
  }
});

// === RSA Key Generation ===
router.post('/rsa/generate', [
  body('keySize').optional().isInt({ min: 512, max: 4096 }).withMessage('Key size must be between 512 and 4096')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const keySize = req.body.keySize || 2048;
    const keypair = forge.pki.rsa.generateKeyPair({ bits: keySize, workers: -1 });
    const publicKey = forge.pki.publicKeyToPem(keypair.publicKey);
    const privateKey = forge.pki.privateKeyToPem(keypair.privateKey);
    const fingerprint = forge.pki.getPublicKeyFingerprint(
      keypair.publicKey,
      { algorithm: 'sha256', encoding: 'hex' }
    );

    res.json({ publicKey, privateKey, keySize, fingerprint });
  } catch (err) {
    res.status(500).json({ error: 'Key generation failed', details: err.message });
  }
});

// === RSA Encryption/Decryption ===
router.post('/rsa/encrypt', [
  body('text').notEmpty().withMessage('Text is required'),
  body('publicKey').notEmpty().withMessage('Public key is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const pubKey = forge.pki.publicKeyFromPem(req.body.publicKey);
    const encrypted = pubKey.encrypt(req.body.text, 'RSA-OAEP');
    res.json({ encrypted: forge.util.encode64(encrypted), algorithm: 'RSA-OAEP' });
  } catch (err) {
    res.status(500).json({ error: 'RSA encryption failed', details: err.message });
  }
});

router.post('/rsa/decrypt', [
  body('encrypted').notEmpty().withMessage('Encrypted text is required'),
  body('privateKey').notEmpty().withMessage('Private key is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const privKey = forge.pki.privateKeyFromPem(req.body.privateKey);
    const decrypted = privKey.decrypt(forge.util.decode64(req.body.encrypted), 'RSA-OAEP');
    res.json({ decrypted, algorithm: 'RSA-OAEP' });
  } catch (err) {
    res.status(500).json({ error: 'RSA decryption failed', details: err.message });
  }
});

// === Digital Signatures ===
router.post('/sign', [
  body('message').notEmpty().withMessage('Message is required'),
  body('privateKey').notEmpty().withMessage('Private key is required'),
  body('algorithm').optional().isIn(['sha256', 'sha384', 'sha512']).withMessage('Invalid algorithm')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const md = forge.md[req.body.algorithm || 'sha256'].create();
    md.update(req.body.message, 'utf8');
    const privKey = forge.pki.privateKeyFromPem(req.body.privateKey);
    const signature = privKey.sign(md);
    res.json({ signature: forge.util.encode64(signature), algorithm: req.body.algorithm || 'sha256' });
  } catch (err) {
    res.status(500).json({ error: 'Signing failed', details: err.message });
  }
});

router.post('/verify', [
  body('message').notEmpty(),
  body('signature').notEmpty(),
  body('publicKey').notEmpty(),
  body('algorithm').optional().isIn(['sha256', 'sha384', 'sha512'])
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const md = forge.md[req.body.algorithm || 'sha256'].create();
    md.update(req.body.message, 'utf8');
    const pubKey = forge.pki.publicKeyFromPem(req.body.publicKey);
    const valid = pubKey.verify(md.digest().bytes(), forge.util.decode64(req.body.signature));
    res.json({ valid, algorithm: req.body.algorithm || 'sha256' });
  } catch (err) {
    res.status(500).json({ error: 'Verification failed', details: err.message });
  }
});

// === Hash Functions ===
router.post('/hash', [
  body('text').notEmpty().withMessage('Text is required'),
  body('algorithm').optional().isIn(['md5', 'sha1', 'sha256', 'sha384', 'sha512']).withMessage('Invalid algorithm')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const algorithm = req.body.algorithm || 'sha256';
    const hash = crypto.createHash(algorithm).update(req.body.text, 'utf8').digest('hex');
    res.json({ hash, algorithm });
  } catch (err) {
    res.status(500).json({ error: 'Hashing failed', details: err.message });
  }
});

module.exports = router;
