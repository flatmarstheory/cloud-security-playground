const express = require('express');
const crypto = require('crypto');
const forge = require('node-forge');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Schnorr Identification Protocol Implementation (Demo version)
class SchnorrProtocol {
  constructor(bits = 64) { // Smaller bits for demo
    this.bits = bits;
    this.generateParameters();
  }

  generateParameters() {
    // Use smaller values for demo
    this.p = new forge.jsbn.BigInteger('23'); // Small prime
    this.g = new forge.jsbn.BigInteger('5');  // Generator
    this.x = new forge.jsbn.BigInteger('6');  // Private key
    this.y = this.g.modPow(this.x, this.p);   // Public key
  }

  findGenerator() {
    // Simplified generator finding for demo
    return new forge.jsbn.BigInteger('5');
  }

  factorize(n) {
    const factors = [];
    let d = 2;
    while (d * d <= n) {
      while (n % d === 0) {
        factors.push(d);
        n /= d;
      }
      d++;
    }
    if (n > 1) factors.push(n);
    return factors;
  }

  gcd(a, b) {
    while (b !== 0) {
      [a, b] = [b, a % b];
    }
    return a;
  }

  // Prover generates commitment
  generateCommitment() {
    this.r = new forge.jsbn.BigInteger('3'); // Fixed random for demo
    this.r = this.r.mod(this.p.subtract(new forge.jsbn.BigInteger('1')));
    this.A = this.g.modPow(this.r, this.p);
    return this.A;
  }

  // Verifier generates challenge
  generateChallenge() {
    return new forge.jsbn.BigInteger('2').mod(this.p.subtract(new forge.jsbn.BigInteger('1'))); // Fixed challenge for demo
  }

  // Prover generates response
  generateResponse(challenge) {
    return this.r.add(this.x.multiply(challenge)).mod(this.p.subtract(new forge.jsbn.BigInteger('1')));
  }

  // Verifier verifies the proof
  verify(commitment, challenge, response, y) {
    const left = this.g.modPow(response, this.p);
    const right = commitment.multiply(y.modPow(challenge, this.p)).mod(this.p);
    return left.equals(right);
  }
}

// Commitment Scheme Implementation (Demo version)
class CommitmentScheme {
  constructor() {
    this.generateParameters();
  }

  generateParameters() {
    this.p = new forge.jsbn.BigInteger('23'); // Small prime
    this.g = new forge.jsbn.BigInteger('5');  // Generator
    this.h = new forge.jsbn.BigInteger('7');  // Generator
  }

  findGenerator() {
    return 5;
  }

  // Commit to a message
  commit(message, randomness) {
    const m = new forge.jsbn.BigInteger(String(message));
    const r = new forge.jsbn.BigInteger(String(randomness));
    const g = this.g;
    const h = this.h;
    const p = this.p;
    const commitment = g.modPow(m, p).multiply(h.modPow(r, p)).mod(p);
    return {
      commitment: commitment.toString(16),
      randomness: randomness
    };
  }

  // Open commitment
  open(commitment, message, randomness) {
    const m = new forge.jsbn.BigInteger(String(message));
    const r = new forge.jsbn.BigInteger(String(randomness));
    const g = this.g;
    const h = this.h;
    const p = this.p;
    const c = new forge.jsbn.BigInteger(commitment, 16);
    const expected = g.modPow(m, p).multiply(h.modPow(r, p)).mod(p);
    return c.equals(expected);
  }
}

// Schnorr Identification Protocol
router.post('/schnorr/setup', [
  body('bits').optional().isInt({ min: 128, max: 512 }).withMessage('Bits must be between 128 and 512')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const bits = req.body.bits || 256;
    const schnorr = new SchnorrProtocol(bits);
    
    res.json({
      publicParameters: {
        p: schnorr.p.toString(16),
        g: schnorr.g.toString(16),
        y: schnorr.y.toString(16),
        bits: bits
      },
      privateKey: {
        x: schnorr.x.toString(16)
      },
      algorithm: 'Schnorr Identification Protocol'
    });
  } catch (error) {
    res.status(500).json({ error: 'Setup failed', details: error.message });
  }
});

// Generate commitment
router.post('/schnorr/commit', [
  body('publicParameters').notEmpty().withMessage('Public parameters are required'),
  body('privateKey').notEmpty().withMessage('Private key is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { publicParameters, privateKey } = req.body;
    
    const schnorr = new SchnorrProtocol();
    schnorr.p = new forge.jsbn.BigInteger(publicParameters.p, 16);
    schnorr.g = new forge.jsbn.BigInteger(publicParameters.g, 16);
    schnorr.x = new forge.jsbn.BigInteger(privateKey.x, 16);
    
    const commitment = schnorr.generateCommitment();
    
    res.json({
      commitment: commitment.toString(16),
      algorithm: 'Schnorr Identification Protocol'
    });
  } catch (error) {
    res.status(500).json({ error: 'Commitment generation failed', details: error.message });
  }
});

// Generate challenge
router.post('/schnorr/challenge', [
  body('publicParameters').notEmpty().withMessage('Public parameters are required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { publicParameters } = req.body;
    
    const schnorr = new SchnorrProtocol();
    schnorr.p = new forge.jsbn.BigInteger(publicParameters.p, 16);
    
    const challenge = schnorr.generateChallenge();
    
    res.json({
      challenge: challenge.toString(16),
      algorithm: 'Schnorr Identification Protocol'
    });
  } catch (error) {
    res.status(500).json({ error: 'Challenge generation failed', details: error.message });
  }
});

// Generate response
router.post('/schnorr/response', [
  body('challenge').notEmpty().withMessage('Challenge is required'),
  body('privateKey').notEmpty().withMessage('Private key is required'),
  body('publicParameters').notEmpty().withMessage('Public parameters are required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { challenge, privateKey, publicParameters } = req.body;
    
    const schnorr = new SchnorrProtocol();
    schnorr.p = new forge.jsbn.BigInteger(publicParameters.p, 16);
    schnorr.g = new forge.jsbn.BigInteger(publicParameters.g, 16);
    schnorr.x = new forge.jsbn.BigInteger(privateKey.x, 16);
    
    // Simulate commitment generation
    schnorr.generateCommitment();
    
    const response = schnorr.generateResponse(new forge.jsbn.BigInteger(challenge, 16));
    
    res.json({
      response: response.toString(16),
      algorithm: 'Schnorr Identification Protocol'
    });
  } catch (error) {
    res.status(500).json({ error: 'Response generation failed', details: error.message });
  }
});

// Verify proof
router.post('/schnorr/verify', [
  body('commitment').notEmpty().withMessage('Commitment is required'),
  body('challenge').notEmpty().withMessage('Challenge is required'),
  body('response').notEmpty().withMessage('Response is required'),
  body('publicKey').notEmpty().withMessage('Public key is required'),
  body('publicParameters').notEmpty().withMessage('Public parameters are required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { commitment, challenge, response, publicKey, publicParameters } = req.body;
    
    const schnorr = new SchnorrProtocol();
    schnorr.p = new forge.jsbn.BigInteger(publicParameters.p, 16);
    schnorr.g = new forge.jsbn.BigInteger(publicParameters.g, 16);
    
    const A = new forge.jsbn.BigInteger(commitment, 16);
    const c = new forge.jsbn.BigInteger(challenge, 16);
    const s = new forge.jsbn.BigInteger(response, 16);
    const y = new forge.jsbn.BigInteger(publicKey, 16);
    
    const isValid = schnorr.verify(A, c, s, y);
    
    res.json({
      isValid: isValid,
      algorithm: 'Schnorr Identification Protocol'
    });
  } catch (error) {
    res.status(500).json({ error: 'Verification failed', details: error.message });
  }
});

// Commitment Scheme
router.post('/commitment/setup', (req, res) => {
  try {
    const commitment = new CommitmentScheme();
    
    res.json({
      publicParameters: {
        p: commitment.p.toString(16),
        g: commitment.g.toString(16),
        h: commitment.h.toString(16)
      },
      algorithm: 'Pedersen Commitment Scheme'
    });
  } catch (error) {
    res.status(500).json({ error: 'Setup failed', details: error.message });
  }
});

// Commit to a message
router.post('/commitment/commit', [
  body('message').notEmpty().withMessage('Message is required'),
  body('publicParameters').notEmpty().withMessage('Public parameters are required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { message, publicParameters } = req.body;
    
    const commitment = new CommitmentScheme();
    commitment.p = new forge.jsbn.BigInteger(publicParameters.p, 16);
    commitment.g = new forge.jsbn.BigInteger(publicParameters.g, 16);
    commitment.h = new forge.jsbn.BigInteger(publicParameters.h, 16);
    
    const randomness = Math.floor(Math.random() * 100000);
    const result = commitment.commit(message, randomness);
    
    res.json({
      commitment: result.commitment,
      randomness: result.randomness,
      algorithm: 'Pedersen Commitment Scheme'
    });
  } catch (error) {
    res.status(500).json({ error: 'Commitment failed', details: error.message });
  }
});

// Open commitment
router.post('/commitment/open', [
  body('commitment').notEmpty().withMessage('Commitment is required'),
  body('message').notEmpty().withMessage('Message is required'),
  body('randomness').notEmpty().withMessage('Randomness is required'),
  body('publicParameters').notEmpty().withMessage('Public parameters are required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { commitment, message, randomness, publicParameters } = req.body;
    
    const commitmentScheme = new CommitmentScheme();
    commitmentScheme.p = new forge.jsbn.BigInteger(publicParameters.p, 16);
    commitmentScheme.g = new forge.jsbn.BigInteger(publicParameters.g, 16);
    commitmentScheme.h = new forge.jsbn.BigInteger(publicParameters.h, 16);
    
    const isValid = commitmentScheme.open(commitment, message, randomness);
    
    res.json({
      isValid: isValid,
      algorithm: 'Pedersen Commitment Scheme'
    });
  } catch (error) {
    res.status(500).json({ error: 'Opening failed', details: error.message });
  }
});

// Schnorr Protocol Demo
router.post('/schnorr/demo', (req, res) => {
  try {
    const schnorr = new SchnorrProtocol(64);
    
    // Generate commitment
    const commitment = schnorr.generateCommitment();
    
    // Generate challenge
    const challenge = schnorr.generateChallenge();
    
    // Generate response
    const response = schnorr.generateResponse(challenge);
    
    // Verify
    const isValid = schnorr.verify(commitment, challenge, response, schnorr.y);
    
    res.json({
      protocol: 'Schnorr Identification',
      parameters: {
        p: schnorr.p.toString(16),
        g: schnorr.g.toString(16),
        y: schnorr.y.toString(16)
      },
      commitment: commitment.toString(16),
      challenge: challenge.toString(16),
      response: response.toString(16),
      isValid: isValid
    });
  } catch (error) {
    res.status(500).json({ error: 'Schnorr demo failed', details: error.message });
  }
});

// Commitment Scheme Demo
router.post('/commitment/demo', [
  body('message').notEmpty().withMessage('Message is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { message } = req.body;
    const commitment = new CommitmentScheme();
    
    const randomness = Math.floor(Math.random() * 100000);
    const result = commitment.commit(message, randomness);
    
    const isValid = commitment.open(result.commitment, message, randomness);
    
    res.json({
      protocol: 'Pedersen Commitment',
      parameters: {
        p: commitment.p.toString(16),
        g: commitment.g.toString(16),
        h: commitment.h.toString(16)
      },
      message: message,
      randomness: randomness,
      commitment: result.commitment,
      isValid: isValid
    });
  } catch (error) {
    res.status(500).json({ error: 'Commitment demo failed', details: error.message });
  }
});

module.exports = router; 