const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Shamir's Secret Sharing Implementation (Demo)
class ShamirSecretSharing {
  constructor(prime = 97) {
    this.prime = prime; // Small prime for demo
  }

  // Fast modular exponentiation
  modPow(base, exp, mod) {
    let result = 1;
    base = ((base % mod) + mod) % mod;
    while (exp > 0) {
      if (exp & 1) result = (result * base) % mod;
      base = (base * base) % mod;
      exp = exp >> 1;
    }
    return result;
  }

  // Modular inverse via Fermat's little theorem (prime modulus)
  modInverse(a) {
    return this.modPow(a, this.prime - 2, this.prime);
  }

  // Generate n shares with threshold k
  generateShares(secret, n, k) {
    secret = Number(secret);
    const nNum = Number(n);
    const kNum = Number(k);
    if (kNum > nNum) throw new Error('k cannot be greater than n');

    // Random polynomial coefficients: a0 = secret
    const coeffs = [secret];
    for (let i = 1; i < kNum; i++) {
      coeffs.push(Math.floor(Math.random() * (this.prime - 1)) + 1);
    }

    // Evaluate polynomial at x = 1..n
    const shares = [];
    for (let x = 1; x <= nNum; x++) {
      let y = 0;
      for (let j = 0; j < coeffs.length; j++) {
        y = (y + coeffs[j] * this.modPow(x, j, this.prime)) % this.prime;
      }
      shares.push({ x, y });
    }
    return shares;
  }

  // Reconstruct secret from shares (array of {x, y})
  reconstructSecret(shares) {
    if (!Array.isArray(shares) || shares.length < 2) {
      throw new Error('Need at least 2 shares to reconstruct');
    }
    const pts = shares.map(s => ({ x: Number(s.x), y: Number(s.y) }));
    let secret = 0;

    for (let i = 0; i < pts.length; i++) {
      let num = 1;
      let den = 1;
      for (let j = 0; j < pts.length; j++) {
        if (i !== j) {
          num = (num * (0 - pts[j].x + this.prime)) % this.prime;
          den = (den * (pts[i].x - pts[j].x + this.prime)) % this.prime;
        }
      }
      const inv = this.modInverse(den);
      secret = (secret + pts[i].y * num * inv) % this.prime;
    }

    return (secret + this.prime) % this.prime;
  }
}

// Generate shares endpoint
router.post('/generate', [
  body('secret').isInt({ min: 0, max: 50 }).withMessage('Secret must be between 0 and 50'),
  body('n').isInt({ min: 2, max: 10 }).withMessage('n must be between 2 and 10'),
  body('k').isInt({ min: 2, max: 10 }).withMessage('k must be between 2 and 10')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { secret, n, k } = req.body;
  try {
    const sss = new ShamirSecretSharing();
    const shares = sss.generateShares(secret, n, k);
    res.json({
      secret: Number(secret),
      shares,
      n: Number(n),
      k: Number(k),
      prime: sss.prime,
      algorithm: 'Shamir Secret Sharing'
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Reconstruct secret endpoint
router.post('/reconstruct', [
  body('shares').isArray({ min: 2 }).withMessage('At least 2 shares are required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const sss = new ShamirSecretSharing();
    const secret = sss.reconstructSecret(req.body.shares);
    res.json({ secret, algorithm: 'Shamir Secret Sharing' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Demo endpoint: generate and reconstruct
router.post('/demo', [
  body('secret').isInt({ min: 0, max: 50 }).withMessage('Secret must be between 0 and 50'),
  body('n').isInt({ min: 3, max: 8 }).withMessage('n must be between 3 and 8'),
  body('k').isInt({ min: 2, max: 6 }).withMessage('k must be between 2 and 6')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { secret, n, k } = req.body;
  try {
    const sss = new ShamirSecretSharing();
    const shares = sss.generateShares(secret, n, k);
    const subset = shares.slice(0, Number(k));
    const reconstructed = sss.reconstructSecret(subset);
    res.json({
      originalSecret: Number(secret),
      totalShares: Number(n),
      threshold: Number(k),
      shares,
      subset,
      reconstructed,
      success: Number(secret) === reconstructed,
      algorithm: 'Shamir Secret Sharing'
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
