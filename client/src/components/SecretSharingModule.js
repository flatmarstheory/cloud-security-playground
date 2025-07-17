import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Key, 
  Eye, 
  Copy, 
  CheckCircle,
  XCircle,
  Shield
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const SecretSharingModule = () => {
  const [activeTab, setActiveTab] = useState('generate');
  const [loading, setLoading] = useState(false);

  // Generate State
  const [generateData, setGenerateData] = useState({
    secret: 42,
    n: 5,
    k: 3,
    shares: [],
    prime: ''
  });

  // Reconstruct State
  const [reconstructData, setReconstructData] = useState({
    shares: [],
    k: 3,
    prime: '',
    secret: ''
  });

  // Demo State
  const [demoData, setDemoData] = useState({
    secret: 42,
    n: 6,
    k: 4,
    scenarios: []
  });

  const tabs = [
    { id: 'generate', name: 'Generate Shares', icon: Key },
    { id: 'reconstruct', name: 'Reconstruct Secret', icon: Eye },
    { id: 'demo', name: 'Threshold Demo', icon: Users }
  ];

  // Generate Shares
  const handleGenerateShares = async () => {
    if (!generateData.secret || generateData.n < 2 || generateData.k < 2) {
      toast.error('Please enter a secret and valid n, k values (n ≥ k ≥ 2)');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/secret-sharing/generate`, {
        secret: generateData.secret,
        n: generateData.n,
        k: generateData.k
      });

      setGenerateData(prev => ({
        ...prev,
        shares: response.data.shares,
        prime: response.data.prime
      }));

      toast.success('Shares generated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Share generation failed');
    } finally {
      setLoading(false);
    }
  };

  // Reconstruct Secret
  const handleReconstructSecret = async () => {
    if (reconstructData.shares.length < reconstructData.k) {
      toast.error(`Need at least ${reconstructData.k} shares to reconstruct`);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/secret-sharing/reconstruct`, {
        shares: reconstructData.shares.slice(0, reconstructData.k),
        k: reconstructData.k,
        prime: reconstructData.prime
      });

      setReconstructData(prev => ({
        ...prev,
        secret: response.data.secret
      }));

      toast.success('Secret reconstructed successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Reconstruction failed');
    } finally {
      setLoading(false);
    }
  };

  // Demo
  const handleDemo = async () => {
    if (!demoData.secret || demoData.n < 5 || demoData.k < 3) {
      toast.error('Please enter a secret and valid n, k values (n ≥ 5, k ≥ 3)');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/secret-sharing/demo`, {
        secret: demoData.secret,
        n: demoData.n,
        k: demoData.k
      });

      setDemoData(prev => ({
        ...prev,
        scenarios: response.data.scenarios
      }));

      toast.success('Threshold demo completed!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Demo failed');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const addShare = () => {
    setReconstructData(prev => ({
      ...prev,
      shares: [...prev.shares, { x: 1, y: '' }]
    }));
  };

  const updateShare = (index, field, value) => {
    const newShares = [...reconstructData.shares];
    newShares[index] = { ...newShares[index], [field]: value };
    setReconstructData(prev => ({ ...prev, shares: newShares }));
  };

  const removeShare = (index) => {
    const newShares = reconstructData.shares.filter((_, i) => i !== index);
    setReconstructData(prev => ({ ...prev, shares: newShares }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Shamir's Secret Sharing
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Split secrets into shares and reconstruct with threshold access
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
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <tab.icon className="h-4 w-4 mr-2" />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Generate Shares */}
      {activeTab === 'generate' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Key className="h-5 w-5 mr-2 text-green-500" />
            Generate Secret Shares
          </h2>

          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Secret</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={generateData.secret}
                    onChange={(e) => setGenerateData(prev => ({ ...prev, secret: parseInt(e.target.value) || 0 }))}
                    className="input-field"
                    placeholder="Enter a number between 0 and 50..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Total Shares (n)</label>
                    <input
                      type="number"
                      min="2"
                      max="20"
                      value={generateData.n}
                      onChange={(e) => setGenerateData(prev => ({ ...prev, n: parseInt(e.target.value) || 2 }))}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Threshold (k)</label>
                    <input
                      type="number"
                      min="2"
                      max={generateData.n}
                      value={generateData.k}
                      onChange={(e) => setGenerateData(prev => ({ ...prev, k: parseInt(e.target.value) || 2 }))}
                      className="input-field"
                    />
                  </div>
                </div>

                <button
                  onClick={handleGenerateShares}
                  disabled={loading}
                  className="btn-primary w-full"
                >
                  {loading ? 'Generating...' : 'Generate Shares'}
                </button>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Parameters</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Secret:</span>
                    <span className="font-mono">{generateData.secret}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Shares:</span>
                    <span>{generateData.n}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Threshold:</span>
                    <span>{generateData.k}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Required for Reconstruction:</span>
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      {generateData.k} of {generateData.n}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {Array.isArray(generateData.shares) && generateData.shares.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Generated Shares</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {generateData.shares.map((share, index) => (
                    <div key={index} className="card bg-gray-50 dark:bg-gray-800">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Share {share.x}</span>
                        <button
                          onClick={() => copyToClipboard(share.y)}
                          className="text-blue-500 hover:text-blue-600"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="code-block text-xs">
                        <div className="break-all">{share.y}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Prime (Finite Field)</label>
                  <div className="code-block">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-500">Hexadecimal</span>
                      <button
                        onClick={() => copyToClipboard(generateData.prime)}
                        className="text-blue-500 hover:text-blue-600"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="break-all text-xs">{generateData.prime}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Reconstruct Secret */}
      {activeTab === 'reconstruct' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Eye className="h-5 w-5 mr-2 text-blue-500" />
            Reconstruct Secret
          </h2>

          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Threshold (k)</label>
                  <input
                    type="number"
                    min="2"
                    value={reconstructData.k}
                    onChange={(e) => setReconstructData(prev => ({ ...prev, k: parseInt(e.target.value) || 2 }))}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Prime</label>
                  <input
                    type="text"
                    value={reconstructData.prime}
                    onChange={(e) => setReconstructData(prev => ({ ...prev, prime: e.target.value }))}
                    className="input-field"
                    placeholder="Enter prime (hexadecimal)..."
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium">Shares</label>
                    <button
                      onClick={addShare}
                      className="btn-secondary text-sm px-3 py-1"
                    >
                      Add Share
                    </button>
                  </div>
                  <div className="space-y-2">
                    {Array.isArray(reconstructData.shares) && reconstructData.shares.map((share, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <input
                          type="number"
                          value={share.x}
                          onChange={(e) => updateShare(index, 'x', parseInt(e.target.value) || 1)}
                          className="input-field w-20"
                          placeholder="x"
                        />
                        <input
                          type="text"
                          value={share.y}
                          onChange={(e) => updateShare(index, 'y', e.target.value)}
                          className="input-field flex-1"
                          placeholder="Share value (hex)"
                        />
                        <button
                          onClick={() => removeShare(index)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleReconstructSecret}
                  disabled={loading || reconstructData.shares.length < reconstructData.k}
                  className="btn-primary w-full"
                >
                  {loading ? 'Reconstructing...' : 'Reconstruct Secret'}
                </button>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Reconstruction Status</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Shares Provided:</span>
                    <span>{reconstructData.shares.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Threshold Required:</span>
                    <span>{reconstructData.k}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                    <span className={`font-medium ${
                      Array.isArray(reconstructData.shares) && reconstructData.shares.length >= reconstructData.k
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {Array.isArray(reconstructData.shares) && reconstructData.shares.length >= reconstructData.k ? 'Ready' : 'Insufficient Shares'}
                    </span>
                  </div>
                </div>

                {reconstructData.secret && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center mb-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span className="font-medium text-green-800 dark:text-green-200">
                        Secret Reconstructed!
                      </span>
                    </div>
                    <div className="code-block bg-green-100 dark:bg-green-900/30">
                      <div className="break-all">{reconstructData.secret}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Threshold Demo */}
      {activeTab === 'demo' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2 text-purple-500" />
            Threshold Reconstruction Demo
          </h2>

          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Secret</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={demoData.secret}
                    onChange={(e) => setDemoData(prev => ({ ...prev, secret: parseInt(e.target.value) || 0 }))}
                    className="input-field"
                    placeholder="Enter a number between 0 and 50..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Total Shares (n)</label>
                    <input
                      type="number"
                      min="5"
                      max="10"
                      value={demoData.n}
                      onChange={(e) => setDemoData(prev => ({ ...prev, n: parseInt(e.target.value) || 5 }))}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Threshold (k)</label>
                    <input
                      type="number"
                      min="3"
                      max={demoData.n}
                      value={demoData.k}
                      onChange={(e) => setDemoData(prev => ({ ...prev, k: parseInt(e.target.value) || 3 }))}
                      className="input-field"
                    />
                  </div>
                </div>

                <button
                  onClick={handleDemo}
                  disabled={loading}
                  className="btn-primary w-full"
                >
                  {loading ? 'Running Demo...' : 'Run Threshold Demo'}
                </button>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Demo Parameters</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Secret:</span>
                    <span className="font-mono">{demoData.secret}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Shares:</span>
                    <span>{demoData.n}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Threshold:</span>
                    <span>{demoData.k}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Configuration:</span>
                    <span className="text-purple-600 dark:text-purple-400 font-medium">
                      ({demoData.k}, {demoData.n})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {Array.isArray(demoData.scenarios) && demoData.scenarios.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Reconstruction Scenarios</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {demoData.scenarios.map((scenario, index) => (
                    <div key={index} className={`card ${
                      scenario.successful 
                        ? 'border-green-200 dark:border-green-800' 
                        : 'border-red-200 dark:border-red-800'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{scenario.description}</span>
                        {scenario.successful ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Shares Used:</span>
                          <span>{scenario.sharesUsed}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Result:</span>
                          <span className={`font-mono ${
                            scenario.successful 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {scenario.reconstructed}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
          About Shamir's Secret Sharing
        </h3>
        <div className="space-y-4 text-gray-600 dark:text-gray-300">
          <p>
            Shamir's Secret Sharing splits a secret into n shares such that any k shares 
            can reconstruct the secret, but any k-1 shares reveal no information.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Properties</h4>
              <ul className="text-sm space-y-1">
                <li>• Perfect security: k-1 shares reveal nothing</li>
                <li>• Threshold access: any k shares can reconstruct</li>
                <li>• Flexible: any (k,n) configuration</li>
                <li>• Used in: key management, voting systems</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Applications</h4>
              <ul className="text-sm space-y-1">
                <li>• Distributed key management</li>
                <li>• Secure multi-party computation</li>
                <li>• Backup and recovery systems</li>
                <li>• Privacy-preserving protocols</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SecretSharingModule; 