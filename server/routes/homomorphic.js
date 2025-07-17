const express = require('express');
const crypto = require('crypto');
const forge = require('node-forge');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// === Shared Instances ===
// const sharedElGamalHE = new ElGamalHE();
// const sharedPaillierHE = new PaillierHE();

// === Paillier Homomorphic Encryption ===
class PaillierHE {
  constructor(bits = 128) {
    this.bits = bits;
    this.generateKeys();
  }

  generateKeys() {
    const p = new forge.jsbn.BigInteger('61');
    const q = new forge.jsbn.BigInteger('53');
    this.n = p.multiply(q);
    const p1 = p.subtract(forge.jsbn.BigInteger.ONE);
    const q1 = q.subtract(forge.jsbn.BigInteger.ONE);
    const gcd = p1.gcd(q1);
    this.lambda = p1.multiply(q1).divide(gcd);
    this.mu = this.lambda.modInverse(this.n);
  }

  encrypt(m) {
    const r = new forge.jsbn.BigInteger('17');
    const g = this.n.add(forge.jsbn.BigInteger.ONE);
    const nSquared = this.n.multiply(this.n);
    const c = g.modPow(m, nSquared).multiply(r.modPow(this.n, nSquared)).mod(nSquared);
    return c;
  }

  decrypt(c) {
    const nSquared = this.n.multiply(this.n);
    const x = c.modPow(this.lambda, nSquared);
    const l = x.subtract(forge.jsbn.BigInteger.ONE).divide(this.n);
    return l.multiply(this.mu).mod(this.n);
  }

  add(c1, c2) {
    return c1.multiply(c2).mod(this.n.multiply(this.n));
  }

  multiply(c, k) {
    return c.modPow(k, this.n.multiply(this.n));
  }
}

// === ElGamal Homomorphic Encryption ===
class ElGamalHE {
  constructor(bits = 128) {
    this.bits = bits;
    this.generateKeys();
  }

  generateKeys() {
    this.p = new forge.jsbn.BigInteger('23');
    this.g = new forge.jsbn.BigInteger('5');
    this.x = new forge.jsbn.BigInteger('6');
    this.y = this.g.modPow(this.x, this.p);
  }

  encrypt(m) {
    let k;
    do {
      k = new forge.jsbn.BigInteger(String(2 + Math.floor(Math.random() * (this.p.intValue() - 2))));
    } while (k.compareTo(this.p.subtract(forge.jsbn.BigInteger.ONE)) >= 0 || k.compareTo(forge.jsbn.BigInteger.ONE) <= 0);
    const c1 = this.g.modPow(k, this.p);
    const c2 = m.multiply(this.y.modPow(k, this.p)).mod(this.p);
    return { c1, c2 };
  }

  decrypt({ c1, c2 }) {
    const s = c1.modPow(this.x, this.p);
    const sInv = s.modInverse(this.p);
    return c2.multiply(sInv).mod(this.p);
  }

  multiply(c1, c2) {
    return {
      c1: c1.c1.multiply(c2.c1).mod(this.p),
      c2: c1.c2.multiply(c2.c2).mod(this.p)
    };
  }
}

// === Shared Instances ===
const sharedElGamalHE = new ElGamalHE();
const sharedPaillierHE = new PaillierHE();

// === Routes ===

// Generate ElGamal keys
router.post('/elgamal/generate', (req, res) => {
  const he = sharedElGamalHE;
  res.json({
    publicKey: {
      p: he.p.toString(16),
      g: he.g.toString(16),
      y: he.y.toString(16),
    },
    privateKey: {
      x: he.x.toString(16)
    },
    algorithm: 'ElGamal',
    homomorphicOperations: ['multiplication']
  });
});

// Encrypt ElGamal
router.post('/elgamal/encrypt', [
  body('message').isInt({ min: 0, max: 20 }),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const m = new forge.jsbn.BigInteger(String(req.body.message));
  const encrypted = sharedElGamalHE.encrypt(m);

  res.json({
    encrypted: {
      c1: encrypted.c1.toString(16),
      c2: encrypted.c2.toString(16)
    }
  });
});

// ElGamal homomorphic multiplication
router.post('/elgamal/multiply', [
  body('ciphertext1').notEmpty(),
  body('ciphertext2').notEmpty()
], (req, res) => {
  const { ciphertext1, ciphertext2 } = req.body;
  const he = sharedElGamalHE;

  const c1 = {
    c1: new forge.jsbn.BigInteger(ciphertext1.c1, 16),
    c2: new forge.jsbn.BigInteger(ciphertext1.c2, 16)
  };

  const c2 = {
    c1: new forge.jsbn.BigInteger(ciphertext2.c1, 16),
    c2: new forge.jsbn.BigInteger(ciphertext2.c2, 16)
  };

  const result = he.multiply(c1, c2);

  res.json({
    result: {
      c1: result.c1.toString(16),
      c2: result.c2.toString(16)
    }
  });
});

// Paillier demo endpoints

router.post('/paillier/generate', (req, res) => {
  const he = sharedPaillierHE;
  res.json({
    publicKey: {
      n: he.n.toString(16),
    },
    privateKey: {
      lambda: he.lambda.toString(16),
      mu: he.mu.toString(16)
    },
    algorithm: 'Paillier',
    homomorphicOperations: ['addition']
  });
});

router.post('/paillier/encrypt', [
  body('message').isInt({ min: 0, max: 100 }),
], (req, res) => {
  const he = sharedPaillierHE;
  const m = new forge.jsbn.BigInteger(String(req.body.message));
  const encrypted = he.encrypt(m);
  res.json({
    encrypted: encrypted.toString(16)
  });
});

router.post('/paillier/add', [
  body('ciphertext1').notEmpty(),
  body('ciphertext2').notEmpty()
], (req, res) => {
  const he = sharedPaillierHE;
  const c1 = new forge.jsbn.BigInteger(req.body.ciphertext1, 16);
  const c2 = new forge.jsbn.BigInteger(req.body.ciphertext2, 16);
  const result = he.add(c1, c2);
  res.json({
    result: result.toString(16)
  });
});

// === Universal Demo Endpoint ===

router.post('/demo', [
  body('operation').isIn(['addition', 'multiplication']),
  body('values').isArray({ min: 2, max: 5 })
], (req, res) => {
  const { operation, values } = req.body;

  if (operation === 'addition') {
    const he = sharedPaillierHE;
    const ciphertexts = values.map(v => he.encrypt(new forge.jsbn.BigInteger(String(v))));
    const result = ciphertexts.reduce((a, b) => he.add(a, b));
    const decrypted = he.decrypt(result);
    res.json({
      encryptedValues: ciphertexts.map(c => c.toString(16)),
      result: decrypted.toString()
    });
  } else {
    const he = sharedElGamalHE;
    const ciphertexts = values.map(v => he.encrypt(new forge.jsbn.BigInteger(String(v))));
    const result = ciphertexts.reduce((a, b) => he.multiply(a, b));
    const decrypted = he.decrypt(result);
    res.json({
      encryptedValues: ciphertexts.map(c => ({
        c1: c.c1.toString(16),
        c2: c.c2.toString(16)
      })),
      result: decrypted.toString()
    });
  }
});

module.exports = router;
