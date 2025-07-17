import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Key, 
  Lock, 
  Users, 
  Copy, 
  CheckCircle,
  XCircle,
  Shield
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const CloudSecurityModule = () => {
  const [activeTab, setActiveTab] = useState('kms');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({});

  // KMS State
  const [kmsData, setKmsData] = useState({
    keys: [],
    selectedKey: null,
    plaintext: '',
    ciphertext: '',
    iv: ''
  });

  // SMPC State
  const [smpcData, setSmpcData] = useState({
    parties: [],
    selectedParty: null,
    input: '',
    shares: [],
    results: []
  });

  // JWT State
  const [jwtData, setJwtData] = useState({
    username: '',
    password: '',
    accessToken: '',
    refreshToken: '',
    decodedToken: null,
    isValid: null
  });

  // JWT Demo State
  const [jwtMode, setJwtMode] = useState('login'); // 'login' or 'register'
  const [jwtUsername, setJwtUsername] = useState('');
  const [jwtPassword, setJwtPassword] = useState('');
  const [jwtToken, setJwtToken] = useState('');
  const [jwtMessage, setJwtMessage] = useState('');
  const [jwtVerifyResult, setJwtVerifyResult] = useState(null);

  // Add a state for manual token input
  const [manualToken, setManualToken] = useState('');

  const tabs = [
    { id: 'kms', name: 'Key Management', icon: Key },
    { id: 'smpc', name: 'Secure MPC', icon: Users },
    { id: 'jwt', name: 'JWT Tokens', icon: Lock }
  ];

  // KMS Functions
  const handleKmsCreateKey = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/cloud-security/kms/create-key`, {
        alias: `key-${Date.now()}`,
        keySpec: 'AES_256'
      });

      setKmsData(prev => ({
        ...prev,
        keys: [...prev.keys, response.data.key]
      }));

      toast.success('Key created successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Key creation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleKmsEncrypt = async () => {
    if (!kmsData.selectedKey || !kmsData.plaintext) {
      toast.error('Please select a key and enter plaintext');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/cloud-security/kms/encrypt`, {
        keyId: kmsData.selectedKey.keyId,
        plaintext: kmsData.plaintext
      });

      setKmsData(prev => ({
        ...prev,
        ciphertext: response.data.ciphertext,
        iv: response.data.iv
      }));

      toast.success('Data encrypted successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Encryption failed');
    } finally {
      setLoading(false);
    }
  };

  const handleKmsDecrypt = async () => {
    if (!kmsData.selectedKey || !kmsData.ciphertext || !kmsData.iv) {
      toast.error('Please select a key and enter ciphertext with IV');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/cloud-security/kms/decrypt`, {
        keyId: kmsData.selectedKey.keyId,
        ciphertext: kmsData.ciphertext,
        iv: kmsData.iv
      });

      setKmsData(prev => ({
        ...prev,
        plaintext: response.data.plaintext
      }));

      toast.success('Data decrypted successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Decryption failed');
    } finally {
      setLoading(false);
    }
  };

  const handleKmsDemo = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/cloud-security/kms/demo`);

      setResults(prev => ({
        ...prev,
        kms: response.data
      }));

      toast.success('KMS demo completed!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Demo failed');
    } finally {
      setLoading(false);
    }
  };

  // SMPC Functions
  const handleSmpcAddParty = async () => {
    if (!smpcData.input) {
      toast.error('Please enter a value for the party');
      return;
    }

    setLoading(true);
    try {
      const uniquePartyId = `party-${Date.now()}`;
      const response = await axios.post(`${API_BASE}/cloud-security/smpc/add-party`, {
        partyId: uniquePartyId,
        input: parseInt(smpcData.input)
      });

      setSmpcData(prev => ({
        ...prev,
        parties: [...prev.parties, response.data],
        input: ''
      }));

      toast.success('Party added successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add party');
    } finally {
      setLoading(false);
    }
  };

  const handleSmpcGenerateShares = async () => {
    if (!smpcData.selectedParty) {
      toast.error('Please select a party');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/cloud-security/smpc/generate-shares`, {
        partyId: smpcData.selectedParty.partyId,
        totalShares: 3,
        threshold: 2
      });

      setSmpcData(prev => ({
        ...prev,
        shares: response.data.shares
      }));

      toast.success('Shares generated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Share generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSmpcCompute = async () => {
    setLoading(true);
    try {
      // Use threshold 2 by default (or make configurable)
      const response = await axios.post(`${API_BASE}/cloud-security/smpc/compute`, { threshold: 2 });

      setSmpcData(prev => ({
        ...prev,
        results: response.data.results
      }));

      setResults(prev => ({
        ...prev,
        smpc: response.data
      }));

      toast.success('Secure computation completed!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Computation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSmpcDemo = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/cloud-security/smpc/demo`);

      setResults(prev => ({
        ...prev,
        smpc: response.data
      }));

      toast.success('SMPC demo completed!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Demo failed');
    } finally {
      setLoading(false);
    }
  };

  // JWT Functions
  const handleJwtRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setJwtMessage('');
    try {
      const response = await axios.post(`${API_BASE}/cloud-security/auth/register`, {
        username: jwtUsername,
        password: jwtPassword
      });
      setJwtMessage('Registration successful! You can now log in.');
      setJwtMode('login');
    } catch (error) {
      setJwtMessage(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Ensure jwtToken is set after login
  const handleJwtLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setJwtMessage('');
    try {
      const response = await axios.post(`${API_BASE}/cloud-security/auth/login`, {
        username: jwtUsername,
        password: jwtPassword
      });
      setJwtToken(response.data.accessToken);
      setManualToken(''); // clear manual input on successful login
      setJwtMessage('Login successful!');
    } catch (error) {
      setJwtMessage(error.response?.data?.error || 'Login failed');
      setJwtToken('');
    } finally {
      setLoading(false);
    }
  };

  // Update handleJwtVerify to use manualToken if provided, else jwtToken
  const handleJwtVerify = async () => {
    setLoading(true);
    setJwtVerifyResult(null);
    try {
      const tokenToVerify = manualToken.trim() || jwtToken;
      const response = await axios.post(`${API_BASE}/cloud-security/auth/verify`, {
        token: tokenToVerify
      });
      setJwtVerifyResult({
        valid: true,
        decoded: response.data.decoded
      });
    } catch (error) {
      setJwtVerifyResult({
        valid: false,
        error: error.response?.data?.error || 'Invalid token'
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Cloud Security
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Key Management Systems, JWT tokens, and secure multi-party computation
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 justify-center">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <tab.icon className="h-4 w-4 mr-2" />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Key Management System */}
      {activeTab === 'kms' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Key className="h-5 w-5 mr-2 text-indigo-500" />
            Key Management System (KMS)
          </h2>

          <div className="space-y-6">
            {/* Key Management */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Key Management</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Create and manage encryption keys securely in the cloud.
              </p>
              
              <button
                onClick={handleKmsCreateKey}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Creating...' : 'Create New Key'}
              </button>

              {kmsData.keys.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium">Available Keys</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {kmsData.keys.map((key, index) => (
                      <div 
                        key={index} 
                        className={`card cursor-pointer transition-colors ${
                          kmsData.selectedKey?.keyId === key.keyId 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                            : 'hover:border-gray-300'
                        }`}
                        onClick={() => setKmsData(prev => ({ ...prev, selectedKey: key }))}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{key.alias}</span>
                          <span className="text-xs text-gray-500">{key.keySpec}</span>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          ID: {key.keyId}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Created: {new Date(key.creationDate).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Encryption/Decryption */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Encryption</h3>
                <div>
                  <label className="block text-sm font-medium mb-2">Plaintext</label>
                  <textarea
                    value={kmsData.plaintext}
                    onChange={(e) => setKmsData(prev => ({ ...prev, plaintext: e.target.value }))}
                    className="input-field"
                    rows={4}
                    placeholder="Enter text to encrypt..."
                  />
                </div>

                <button
                  onClick={handleKmsEncrypt}
                  disabled={loading || !kmsData.selectedKey}
                  className="btn-primary w-full"
                >
                  {loading ? 'Encrypting...' : 'Encrypt'}
                </button>

                {kmsData.ciphertext && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Ciphertext</label>
                    <div className="code-block">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-500">Hexadecimal</span>
                        <button
                          onClick={() => copyToClipboard(kmsData.ciphertext)}
                          className="text-blue-500 hover:text-blue-600"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="break-all text-xs">{kmsData.ciphertext}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Decryption</h3>
                <div>
                  <label className="block text-sm font-medium mb-2">Ciphertext</label>
                  <textarea
                    value={kmsData.ciphertext}
                    onChange={(e) => setKmsData(prev => ({ ...prev, ciphertext: e.target.value }))}
                    className="input-field"
                    rows={4}
                    placeholder="Enter ciphertext to decrypt..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">IV</label>
                  <input
                    type="text"
                    value={kmsData.iv}
                    onChange={(e) => setKmsData(prev => ({ ...prev, iv: e.target.value }))}
                    className="input-field"
                    placeholder="Enter IV..."
                  />
                </div>

                <button
                  onClick={handleKmsDecrypt}
                  disabled={loading || !kmsData.selectedKey}
                  className="btn-primary w-full"
                >
                  {loading ? 'Decrypting...' : 'Decrypt'}
                </button>

                {kmsData.plaintext && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Decrypted Text</label>
                    <div className="code-block bg-green-50 dark:bg-green-900/20">
                      <div className="break-all">{kmsData.plaintext}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Demo */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Quick Demo</h3>
              <button
                onClick={handleKmsDemo}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Running Demo...' : 'Run KMS Demo'}
              </button>

              {results.kms && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Demo Results</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Original Data:</span>
                          <span>{results.kms.plaintext ?? ''}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Key ID:</span>
                          <span className="font-mono text-xs">{results.kms.key?.keyId ?? ''}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Decrypted:</span>
                          <span>{results.kms.decrypted ?? ''}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Encryption Details</h4>
                      <div className="code-block text-xs">
                        <div className="break-all">{results.kms.ciphertext ?? ''}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Secure Multi-Party Computation */}
      {activeTab === 'smpc' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2 text-green-500" />
            Secure Multi-Party Computation (SMPC)
          </h2>

          <div className="space-y-6">
            {/* Party Management */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Add Parties</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Add parties with their private inputs for secure computation.
              </p>
              
              <div className="flex gap-2">
                <input
                  type="number"
                  value={smpcData.input}
                  onChange={(e) => setSmpcData(prev => ({ ...prev, input: e.target.value }))}
                  className="input-field flex-1"
                  placeholder="Enter party input..."
                />
                <button
                  onClick={handleSmpcAddParty}
                  disabled={loading || !smpcData.input}
                  className="btn-primary"
                >
                  {loading ? 'Adding...' : 'Add Party'}
                </button>
              </div>

              {Array.isArray(smpcData.parties) && smpcData.parties.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Parties</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {smpcData.parties.map((party, index) => (
                      <div 
                        key={index} 
                        className={`card cursor-pointer transition-colors ${
                          smpcData.selectedParty?.partyId === party.partyId 
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                            : 'hover:border-gray-300'
                        }`}
                        onClick={() => setSmpcData(prev => ({ ...prev, selectedParty: party }))}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{party.partyId}</span>
                          <span className="text-xs text-gray-500">Input: {party.input}</span>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Public Key: {typeof party.publicKey === 'string' ? party.publicKey.substring(0, 16) + '...' : '-'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Share Generation */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Generate Shares</h3>
              
              <button
                onClick={handleSmpcGenerateShares}
                disabled={loading || !smpcData.selectedParty}
                className="btn-primary"
              >
                {loading ? 'Generating...' : 'Generate Shares'}
              </button>

              {Array.isArray(smpcData.shares) && smpcData.shares.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Shares for {smpcData.selectedParty?.partyId}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {smpcData.shares.map((share, index) => (
                      <div key={index} className="card bg-gray-50 dark:bg-gray-800">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">Share {share.id}</span>
                          <span className="text-xs text-gray-500">Value: {share.value}</span>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Party: {share.partyId}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Computation */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Secure Computation</h3>
              
              <button
                onClick={handleSmpcCompute}
                disabled={loading || smpcData.parties.length === 0}
                className="btn-primary"
              >
                {loading ? 'Computing...' : 'Perform Secure Computation'}
              </button>

              {Array.isArray(smpcData.results) && smpcData.results.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Computation Results</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {smpcData.results.map((result, index) => (
                      <div key={index} className="card bg-blue-50 dark:bg-blue-900/20">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{result.partyId}</span>
                          <span className="text-xs text-gray-500">Sum: {result.sum}</span>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Original Input: {result.input}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Demo */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Quick Demo</h3>
              <button
                onClick={handleSmpcDemo}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Running Demo...' : 'Run SMPC Demo'}
              </button>

              {results.smpc && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Demo Results</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Parties:</span>
                          <span>{Array.isArray(results.smpc.parties) ? results.smpc.parties.join(', ') : '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Total Sum:</span>
                          <span>{results.smpc.totalSum}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Computation Type</h4>
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-sm font-medium text-green-800 dark:text-green-200">
                          {results.smpc.computationType}
                        </div>
                        <div className="text-xs text-green-600 dark:text-green-400">
                          Algorithm: {results.smpc.algorithm}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* JWT Tokens */}
      {activeTab === 'jwt' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Lock className="h-5 w-5 mr-2 text-purple-500" />
            JWT Token Management
          </h2>

          <div className="space-y-6">
            {/* Authentication */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Authentication</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Login to receive JWT access and refresh tokens.
              </p>
              
              {/* JWT Demo Section */}
              <div className="space-y-4 border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                <div className="flex gap-2 mb-2">
                  <button
                    className={`px-3 py-1 rounded ${jwtMode === 'login' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
                    onClick={() => setJwtMode('login')}
                    disabled={jwtMode === 'login'}
                  >
                    Login
                  </button>
                  <button
                    className={`px-3 py-1 rounded ${jwtMode === 'register' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
                    onClick={() => setJwtMode('register')}
                    disabled={jwtMode === 'register'}
                  >
                    Register
                  </button>
                </div>
                <form onSubmit={jwtMode === 'login' ? handleJwtLogin : handleJwtRegister} className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium">Username</label>
                    <input
                      type="text"
                      className="w-full px-2 py-1 border rounded"
                      value={jwtUsername}
                      onChange={e => setJwtUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Password</label>
                    <input
                      type="password"
                      className="w-full px-2 py-1 border rounded"
                      value={jwtPassword}
                      onChange={e => setJwtPassword(e.target.value)}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 rounded bg-blue-600 text-white font-semibold"
                    disabled={loading}
                  >
                    {jwtMode === 'login' ? 'Login' : 'Register'}
                  </button>
                </form>
                {jwtMessage && (
                  <div className={`text-sm ${jwtMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{jwtMessage}</div>
                )}
                {jwtToken && (
                  <div className="mt-2 text-xs break-all">
                    <span className="font-semibold">JWT Token:</span>
                    <div className="bg-gray-200 dark:bg-gray-700 p-2 rounded mt-1">{jwtToken}</div>
                  </div>
                )}
              </div> {/* <-- Close JWT demo section */}
            </div> {/* <-- Close .space-y-6 */}

            {/* Token Verification */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Token Verification</h3>
              <div>
                <label className="block text-sm font-medium mb-1">JWT Token to Verify</label>
                <input
                  type="text"
                  className="w-full px-2 py-1 border rounded text-xs"
                  value={manualToken}
                  onChange={e => setManualToken(e.target.value)}
                  placeholder="Paste a JWT token here or leave blank to use the last login token"
                />
              </div>
              <button
                onClick={handleJwtVerify}
                disabled={loading || (!manualToken.trim() && !jwtToken)}
                className="btn-primary"
              >
                {loading ? 'Verifying...' : 'Verify Token'}
              </button>
              {jwtVerifyResult && (
                <div className="mt-2">
                  {jwtVerifyResult.valid ? (
                    <div className="p-2 rounded bg-green-100 text-green-800">
                      <strong>Token is valid!</strong>
                      <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-x-auto">{JSON.stringify(jwtVerifyResult.decoded, null, 2)}</pre>
                    </div>
                  ) : (
                    <div className="p-2 rounded bg-red-100 text-red-800">
                      <strong>Token is invalid!</strong>
                      <div className="text-xs mt-2">{jwtVerifyResult.error}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Information Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Shield className="h-5 w-5 mr-2 text-blue-500" />
          About Cloud Security
        </h3>
        <div className="space-y-4 text-gray-600 dark:text-gray-300">
          <p>
            Cloud security encompasses various technologies and practices to protect 
            data, applications, and infrastructure in cloud environments.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Key Management</h4>
              <ul className="text-sm space-y-1">
                <li>• Centralized key storage</li>
                <li>• Automatic key rotation</li>
                <li>• Hardware security modules</li>
                <li>• Audit logging</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Secure MPC</h4>
              <ul className="text-sm space-y-1">
                <li>• Privacy-preserving computation</li>
                <li>• Distributed processing</li>
                <li>• No trusted third party</li>
                <li>• Cryptographic guarantees</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">JWT Tokens</h4>
              <ul className="text-sm space-y-1">
                <li>• Stateless authentication</li>
                <li>• Self-contained tokens</li>
                <li>• Access control</li>
                <li>• Refresh mechanisms</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CloudSecurityModule; 