import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Lock, 
  Key, 
  Hash, 
  FileText, 
  Copy, 
  Check,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const CryptoModule = () => {
  const [activeTab, setActiveTab] = useState('aes');
  const [loading, setLoading] = useState(false);

  // AES State
  const [aesData, setAesData] = useState({
    text: '',
    key: '',
    algorithm: 'aes-256-cbc',
    encrypted: '',
    decrypted: '',
    iv: ''
  });

  // RSA State
  const [rsaData, setRsaData] = useState({
    keySize: 2048,
    publicKey: '',
    privateKey: '',
    text: '',
    encrypted: '',
    decrypted: ''
  });

  // Hash State
  const [hashData, setHashData] = useState({
    text: '',
    algorithm: 'sha256',
    hash: ''
  });

  // Signature State
  const [signatureData, setSignatureData] = useState({
    message: '',
    signature: '',
    isValid: null
  });

  const tabs = [
    { id: 'aes', name: 'AES Encryption', icon: Lock },
    { id: 'rsa', name: 'RSA Keys', icon: Key },
    { id: 'hash', name: 'Hash Functions', icon: Hash },
    { id: 'signature', name: 'Digital Signatures', icon: FileText }
  ];

  // AES Functions
  const handleAesEncrypt = async () => {
    if (!aesData.text || !aesData.key) {
      toast.error('Please enter both text and key');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/crypto/aes/encrypt`, {
        text: aesData.text,
        key: aesData.key,
        algorithm: aesData.algorithm
      });

      setAesData(prev => ({
        ...prev,
        encrypted: response.data.encrypted,
        iv: response.data.iv
      }));

      toast.success('Text encrypted successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Encryption failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAesDecrypt = async () => {
    if (!aesData.encrypted || !aesData.key || !aesData.iv) {
      toast.error('Please enter encrypted text, key, and IV');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/crypto/aes/decrypt`, {
        encrypted: aesData.encrypted,
        key: aesData.key,
        iv: aesData.iv,
        algorithm: aesData.algorithm
      });

      setAesData(prev => ({
        ...prev,
        decrypted: response.data.decrypted
      }));

      toast.success('Text decrypted successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Decryption failed');
    } finally {
      setLoading(false);
    }
  };

  // RSA Functions
  const handleRsaGenerate = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/crypto/rsa/generate`, {
        keySize: rsaData.keySize
      });

      setRsaData(prev => ({
        ...prev,
        publicKey: response.data.publicKey,
        privateKey: response.data.privateKey
      }));

      toast.success('RSA key pair generated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Key generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRsaEncrypt = async () => {
    if (!rsaData.text || !rsaData.publicKey) {
      toast.error('Please enter text and public key');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/crypto/rsa/encrypt`, {
        text: rsaData.text,
        publicKey: rsaData.publicKey
      });

      setRsaData(prev => ({
        ...prev,
        encrypted: response.data.encrypted
      }));

      toast.success('Text encrypted successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Encryption failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRsaDecrypt = async () => {
    if (!rsaData.encrypted || !rsaData.privateKey) {
      toast.error('Please enter encrypted text and private key');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/crypto/rsa/decrypt`, {
        encrypted: rsaData.encrypted,
        privateKey: rsaData.privateKey
      });

      setRsaData(prev => ({
        ...prev,
        decrypted: response.data.decrypted
      }));

      toast.success('Text decrypted successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Decryption failed');
    } finally {
      setLoading(false);
    }
  };

  // Hash Functions
  const handleHash = async () => {
    if (!hashData.text) {
      toast.error('Please enter text to hash');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/crypto/hash`, {
        text: hashData.text,
        algorithm: hashData.algorithm
      });

      setHashData(prev => ({
        ...prev,
        hash: response.data.hash
      }));

      toast.success('Hash generated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Hashing failed');
    } finally {
      setLoading(false);
    }
  };

  // Digital Signatures
  const handleSign = async () => {
    if (!signatureData.message || !rsaData.privateKey) {
      toast.error('Please enter message and private key');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/crypto/sign`, {
        message: signatureData.message,
        privateKey: rsaData.privateKey,
        algorithm: 'sha256'
      });

      setSignatureData(prev => ({
        ...prev,
        signature: response.data.signature
      }));

      toast.success('Message signed successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Signing failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!signatureData.message || !signatureData.signature || !rsaData.publicKey) {
      toast.error('Please enter message, signature, and public key');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/crypto/verify`, {
        message: signatureData.message,
        signature: signatureData.signature,
        publicKey: rsaData.publicKey,
        algorithm: 'sha256'
      });

      setSignatureData(prev => ({
        ...prev,
        isValid: response.data.isValid
      }));

      toast.success(response.data.isValid ? 'Signature verified!' : 'Signature invalid!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const generateRandomKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setAesData(prev => ({ ...prev, key: result }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Basic Cryptography
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Explore AES encryption, RSA key pairs, hash functions, and digital signatures
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
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <tab.icon className="h-4 w-4 mr-2" />
            {tab.name}
          </button>
        ))}
      </div>

      {/* AES Encryption */}
      {activeTab === 'aes' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Lock className="h-5 w-5 mr-2 text-blue-500" />
            AES Encryption/Decryption
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Encryption */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Encryption</h3>
              <div>
                <label className="block text-sm font-medium mb-2">Text to Encrypt</label>
                <textarea
                  value={aesData.text}
                  onChange={(e) => setAesData(prev => ({ ...prev, text: e.target.value }))}
                  className="input-field"
                  rows={3}
                  placeholder="Enter text to encrypt..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Encryption Key</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aesData.key}
                    onChange={(e) => setAesData(prev => ({ ...prev, key: e.target.value }))}
                    className="input-field flex-1"
                    placeholder="Enter encryption key (min 16 chars)"
                  />
                  <button
                    onClick={generateRandomKey}
                    className="btn-secondary px-3"
                    title="Generate random key"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Algorithm</label>
                <select
                  value={aesData.algorithm}
                  onChange={(e) => setAesData(prev => ({ ...prev, algorithm: e.target.value }))}
                  className="input-field"
                >
                  <option value="aes-128-cbc">AES-128-CBC</option>
                  <option value="aes-192-cbc">AES-192-CBC</option>
                  <option value="aes-256-cbc">AES-256-CBC</option>
                </select>
              </div>

              <button
                onClick={handleAesEncrypt}
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Encrypting...' : 'Encrypt'}
              </button>

              {aesData.encrypted && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Encrypted Text</label>
                  <div className="code-block">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-500">Hexadecimal</span>
                      <button
                        onClick={() => copyToClipboard(aesData.encrypted)}
                        className="text-blue-500 hover:text-blue-600"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="break-all">{aesData.encrypted}</div>
                  </div>
                  
                  <label className="block text-sm font-medium">IV (Initialization Vector)</label>
                  <div className="code-block">
                    <div className="break-all">{aesData.iv}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Decryption */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Decryption</h3>
              <div>
                <label className="block text-sm font-medium mb-2">Encrypted Text</label>
                <textarea
                  value={aesData.encrypted}
                  onChange={(e) => setAesData(prev => ({ ...prev, encrypted: e.target.value }))}
                  className="input-field"
                  rows={3}
                  placeholder="Enter encrypted text..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Decryption Key</label>
                <input
                  type="text"
                  value={aesData.key}
                  onChange={(e) => setAesData(prev => ({ ...prev, key: e.target.value }))}
                  className="input-field"
                  placeholder="Enter decryption key"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">IV</label>
                <input
                  type="text"
                  value={aesData.iv}
                  onChange={(e) => setAesData(prev => ({ ...prev, iv: e.target.value }))}
                  className="input-field"
                  placeholder="Enter IV"
                />
              </div>

              <button
                onClick={handleAesDecrypt}
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Decrypting...' : 'Decrypt'}
              </button>

              {aesData.decrypted && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Decrypted Text</label>
                  <div className="code-block bg-green-50 dark:bg-green-900/20">
                    <div className="break-all">{aesData.decrypted}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* RSA Keys */}
      {activeTab === 'rsa' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Key className="h-5 w-5 mr-2 text-purple-500" />
            RSA Key Generation & Encryption
          </h2>

          <div className="space-y-6">
            {/* Key Generation */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Key Generation</h3>
              <div>
                <label className="block text-sm font-medium mb-2">Key Size</label>
                <select
                  value={rsaData.keySize}
                  onChange={(e) => setRsaData(prev => ({ ...prev, keySize: parseInt(e.target.value) }))}
                  className="input-field"
                >
                  <option value={512}>512 bits</option>
                  <option value={1024}>1024 bits</option>
                  <option value={2048}>2048 bits</option>
                  <option value={4096}>4096 bits</option>
                </select>
              </div>

              <button
                onClick={handleRsaGenerate}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Generating...' : 'Generate Key Pair'}
              </button>

              {rsaData.publicKey && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Public Key</label>
                    <div className="code-block">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-500">PEM Format</span>
                        <button
                          onClick={() => copyToClipboard(rsaData.publicKey)}
                          className="text-blue-500 hover:text-blue-600"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="break-all text-xs">{rsaData.publicKey}</div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Private Key</label>
                    <div className="code-block">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-500">PEM Format</span>
                        <button
                          onClick={() => copyToClipboard(rsaData.privateKey)}
                          className="text-blue-500 hover:text-blue-600"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="break-all text-xs">{rsaData.privateKey}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Encryption/Decryption */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Encryption</h3>
                <div>
                  <label className="block text-sm font-medium mb-2">Text to Encrypt</label>
                  <textarea
                    value={rsaData.text}
                    onChange={(e) => setRsaData(prev => ({ ...prev, text: e.target.value }))}
                    className="input-field"
                    rows={3}
                    placeholder="Enter text to encrypt..."
                  />
                </div>

                <button
                  onClick={handleRsaEncrypt}
                  disabled={loading || !rsaData.publicKey}
                  className="btn-primary w-full"
                >
                  {loading ? 'Encrypting...' : 'Encrypt'}
                </button>

                {rsaData.encrypted && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Encrypted Text</label>
                    <div className="code-block">
                      <div className="break-all text-xs">{rsaData.encrypted}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Decryption</h3>
                <div>
                  <label className="block text-sm font-medium mb-2">Encrypted Text</label>
                  <textarea
                    value={rsaData.encrypted}
                    onChange={(e) => setRsaData(prev => ({ ...prev, encrypted: e.target.value }))}
                    className="input-field"
                    rows={3}
                    placeholder="Enter encrypted text..."
                  />
                </div>

                <button
                  onClick={handleRsaDecrypt}
                  disabled={loading || !rsaData.privateKey}
                  className="btn-primary w-full"
                >
                  {loading ? 'Decrypting...' : 'Decrypt'}
                </button>

                {rsaData.decrypted && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Decrypted Text</label>
                    <div className="code-block bg-green-50 dark:bg-green-900/20">
                      <div className="break-all">{rsaData.decrypted}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Hash Functions */}
      {activeTab === 'hash' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Hash className="h-5 w-5 mr-2 text-green-500" />
            Hash Functions
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Text to Hash</label>
              <textarea
                value={hashData.text}
                onChange={(e) => setHashData(prev => ({ ...prev, text: e.target.value }))}
                className="input-field"
                rows={4}
                placeholder="Enter text to hash..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Hash Algorithm</label>
              <select
                value={hashData.algorithm}
                onChange={(e) => setHashData(prev => ({ ...prev, algorithm: e.target.value }))}
                className="input-field"
              >
                <option value="md5">MD5 (128 bits)</option>
                <option value="sha1">SHA-1 (160 bits)</option>
                <option value="sha256">SHA-256 (256 bits)</option>
                <option value="sha384">SHA-384 (384 bits)</option>
                <option value="sha512">SHA-512 (512 bits)</option>
              </select>
            </div>

            <button
              onClick={handleHash}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Hashing...' : 'Generate Hash'}
            </button>

            {hashData.hash && (
              <div>
                <label className="block text-sm font-medium mb-2">Hash Result</label>
                <div className="code-block">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-500">{hashData.algorithm.toUpperCase()}</span>
                    <button
                      onClick={() => copyToClipboard(hashData.hash)}
                      className="text-blue-500 hover:text-blue-600"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="break-all font-mono">{hashData.hash}</div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Digital Signatures */}
      {activeTab === 'signature' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-orange-500" />
            Digital Signatures
          </h2>

          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Signing */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Sign Message</h3>
                <div>
                  <label className="block text-sm font-medium mb-2">Message to Sign</label>
                  <textarea
                    value={signatureData.message}
                    onChange={(e) => setSignatureData(prev => ({ ...prev, message: e.target.value }))}
                    className="input-field"
                    rows={4}
                    placeholder="Enter message to sign..."
                  />
                </div>

                <button
                  onClick={handleSign}
                  disabled={loading || !rsaData.privateKey}
                  className="btn-primary w-full"
                >
                  {loading ? 'Signing...' : 'Sign Message'}
                </button>

                {signatureData.signature && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Digital Signature</label>
                    <div className="code-block">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-500">Base64 Encoded</span>
                        <button
                          onClick={() => copyToClipboard(signatureData.signature)}
                          className="text-blue-500 hover:text-blue-600"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="break-all text-xs">{signatureData.signature}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Verification */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Verify Signature</h3>
                <div>
                  <label className="block text-sm font-medium mb-2">Original Message</label>
                  <textarea
                    value={signatureData.message}
                    onChange={(e) => setSignatureData(prev => ({ ...prev, message: e.target.value }))}
                    className="input-field"
                    rows={4}
                    placeholder="Enter original message..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Signature to Verify</label>
                  <textarea
                    value={signatureData.signature}
                    onChange={(e) => setSignatureData(prev => ({ ...prev, signature: e.target.value }))}
                    className="input-field"
                    rows={4}
                    placeholder="Enter signature to verify..."
                  />
                </div>

                <button
                  onClick={handleVerify}
                  disabled={loading || !rsaData.publicKey}
                  className="btn-primary w-full"
                >
                  {loading ? 'Verifying...' : 'Verify Signature'}
                </button>

                {signatureData.isValid !== null && (
                  <div className={`p-4 rounded-lg ${
                    signatureData.isValid 
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                      : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                  }`}>
                    <div className="flex items-center">
                      {signatureData.isValid ? (
                        <Check className="h-5 w-5 text-green-500 mr-2" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                      )}
                      <span className={`font-medium ${
                        signatureData.isValid ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                      }`}>
                        {signatureData.isValid ? 'Signature is valid!' : 'Signature is invalid!'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CryptoModule; 