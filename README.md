# Cloud Security Playground

[![GitHub](https://img.shields.io/github/stars/flatmarstheory/cloud-security-playground?style=social)](https://github.com/flatmarstheory/cloud-security-playground)
[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-flatmarstheory-yellow?logo=buy-me-a-coffee)](https://www.buymeacoffee.com/flatmarstheory)

---

![Small Recording 2025-07-17 180519](https://github.com/user-attachments/assets/e8721b56-5ed6-4dba-a47b-e88b3a7ae15c)


## Overview

**Cloud Security Playground** is an interactive, full-stack educational platform for learning, experimenting, and demonstrating modern cryptographic and cloud security concepts. It features:

- **Key Management System (KMS)**
- **Secure Multi-Party Computation (SMPC)**
- **Homomorphic Encryption**
- **JWT Token Management**
- **Zero-Knowledge Proofs**
- Modular, extensible codebase (Node.js/Express backend, React frontend)
- API and UI for all features

---

## Directory Structure

```
cloud-security-playground/
├── client/         # React frontend
├── server/         # Node.js/Express backend
├── docker-compose.yml
├── README.md       # (this file)
└── ...
```

---

## Getting Started

### 1. Prerequisites
- Node.js (v16+ recommended)
- npm
- (Optional) Docker & Docker Compose

### 2. Clone the Repository
```bash
git clone https://github.com/flatmarstheory/cloud-security-playground.git
cd cloud-security-playground
```

### 3. Environment Variables
Create a `.env` file in `server/` with:
```
JWT_SECRET=your_super_secret_key
```

### 4. Install Dependencies
```bash
cd server && npm install
cd ../client && npm install
```

### 5. Running Locally (Dev Mode)
**In two terminals:**
```bash
# Terminal 1: Backend
cd server && npm run dev

# Terminal 2: Frontend
cd client && npm start
```
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### 6. Running with Docker
```bash
docker-compose up --build
```
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### 7. Production Build
```bash
cd client && npm run build
# Serve the build with your preferred static server
```

---

## Usage

### Web UI
- Visit http://localhost:3000
- Explore modules: KMS, SMPC, Homomorphic Encryption, JWT, Zero-Knowledge
- Interactive demos, API calls, and cryptographic visualizations

### API Usage
- All backend endpoints are under `/api/cloud-security/`
- Use Postman, curl, or any HTTP client

#### Example: Register & Login (JWT)
```bash
curl -X POST http://localhost:5000/api/cloud-security/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"username":"testuser","password":"testpass123"}'

curl -X POST http://localhost:5000/api/cloud-security/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"testuser","password":"testpass123"}'
```

---

## Module Details

### 1. Key Management System (KMS)
- **Create, describe, encrypt, decrypt keys**
- Simulates cloud KMS (e.g., AWS KMS)
- Endpoints: `/kms/create-key`, `/kms/describe-key/:keyId`, `/kms/encrypt`, `/kms/decrypt`

### 2. Secure Multi-Party Computation (SMPC)
- **Add parties, generate shares, reconstruct secrets, compute sum**
- Uses Shamir Secret Sharing
- Endpoints: `/smpc/add-party`, `/smpc/generate-shares`, `/smpc/reconstruct`, `/smpc/compute-sum`

### 3. Homomorphic Encryption
- **Perform computations on encrypted data**
- Paillier and ElGamal demos
- UI only (no backend endpoints)

### 4. JWT Token Management
- **Register, login, verify, refresh, logout**
- Endpoints: `/auth/register`, `/auth/login`, `/auth/verify`, `/auth/refresh`, `/auth/logout`

### 5. Zero-Knowledge Proofs
- **Interactive ZKP demos**
- UI only (no backend endpoints)

---

## API Endpoints (Summary)

| Endpoint                        | Method | Description                       |
|---------------------------------|--------|-----------------------------------|
| /kms/create-key                 | POST   | Create a new key                  |
| /kms/describe-key/:keyId        | GET    | Get key metadata                  |
| /kms/encrypt                    | POST   | Encrypt data with a key           |
| /kms/decrypt                    | POST   | Decrypt data with a key           |
| /kms/demo                       | POST   | Run KMS demo                      |
| /smpc/add-party                 | POST   | Add a party for SMPC              |
| /smpc/generate-shares           | POST   | Generate secret shares            |
| /smpc/reconstruct               | POST   | Reconstruct secret from shares    |
| /smpc/compute-sum               | POST   | Compute sum using SMPC            |
| /smpc/demo                      | POST   | Run SMPC demo                     |
| /auth/register                  | POST   | Register a new user               |
| /auth/login                     | POST   | Login and get JWT                 |
| /auth/verify                    | POST   | Verify a JWT                      |
| /auth/refresh                   | POST   | Refresh JWT                       |
| /auth/logout                    | POST   | Logout (revoke refresh token)     |

---

## Use Cases
- **Education:** Learn and teach modern cryptography and cloud security
- **Demos:** Showcase cryptographic protocols in action
- **Prototyping:** Experiment with secure computation and key management
- **API Testing:** Try out real-world security APIs
- **Research:** Extend with new cryptographic modules

---

## Contributing

1. Fork the repo: https://github.com/flatmarstheory/cloud-security-playground
2. Create a feature branch
3. Commit your changes
4. Open a pull request

All contributions, bug reports, and feature requests are welcome!

---

## License

MIT License. See [LICENSE](LICENSE) for details.

---

## Contact & Support

- GitHub: [flatmarstheory](https://github.com/flatmarstheory)
- Buy Me a Coffee: [flatmarstheory](https://www.buymeacoffee.com/flatmarstheory)

---

> **cloud-security-playground** — by [flatmarstheory](https://github.com/flatmarstheory) 
