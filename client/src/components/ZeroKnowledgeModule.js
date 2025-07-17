import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Key, 
  Lock, 
  Copy, 
  CheckCircle,
  XCircle,
  Shield,
  User,
  Server
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const ZeroKnowledgeModule = () => {
  const [activeTab, setActiveTab] = useState('schnorr');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({});

  // Schnorr State
  const [schnorrData, setSchnorrData] = useState({
    publicParameters: null,
    privateKey: null,
    commitment: '',
    challenge: '',
    response: '',
    isValid: null
  });

  // Commitment State
  const [commitmentData, setCommitmentData] = useState({
    publicParameters: null,
    message: '',
    randomness: '',
    commitment: '',
    isValid: null
  });

  const tabs = [
    { id: 'schnorr', name: 'Schnorr Protocol', icon: Key },
    { id: 'commitment', name: 'Commitment Scheme', icon: Lock }
  ];

  // Schnorr Functions
  const handleSchnorrSetup = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/zero-knowledge/schnorr/setup`, {
        bits: 128 // Changed from 256 to 128 (allowed by backend)
      });

      setSchnorrData(prev => ({
        ...prev,
        publicParameters: response.data.publicParameters,
        privateKey: response.data.privateKey
      }));

      toast.success('Schnorr parameters generated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Setup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSchnorrCommit = async () => {
    if (!schnorrData.publicParameters || !schnorrData.privateKey) {
      toast.error('Please generate parameters first');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/zero-knowledge/schnorr/commit`, {
        publicParameters: schnorrData.publicParameters,
        privateKey: schnorrData.privateKey
      });

      setSchnorrData(prev => ({
        ...prev,
        commitment: response.data.commitment
      }));

      toast.success('Commitment generated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Commitment failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSchnorrChallenge = async () => {
    if (!schnorrData.publicParameters) {
      toast.error('Please generate parameters first');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/zero-knowledge/schnorr/challenge`, {
        publicParameters: schnorrData.publicParameters
      });

      setSchnorrData(prev => ({
        ...prev,
        challenge: response.data.challenge
      }));

      toast.success('Challenge generated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Challenge generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSchnorrResponse = async () => {
    if (!schnorrData.challenge || !schnorrData.privateKey) {
      toast.error('Please generate challenge and ensure private key is available');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/zero-knowledge/schnorr/response`, {
        challenge: schnorrData.challenge,
        privateKey: schnorrData.privateKey,
        publicParameters: schnorrData.publicParameters
      });

      setSchnorrData(prev => ({
        ...prev,
        response: response.data.response
      }));

      toast.success('Response generated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Response generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSchnorrVerify = async () => {
    if (!schnorrData.commitment || !schnorrData.challenge || !schnorrData.response) {
      toast.error('Please complete all steps first');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/zero-knowledge/schnorr/verify`, {
        commitment: schnorrData.commitment,
        challenge: schnorrData.challenge,
        response: schnorrData.response,
        publicKey: schnorrData.publicParameters.y,
        publicParameters: schnorrData.publicParameters
      });

      setSchnorrData(prev => ({
        ...prev,
        isValid: response.data.isValid
      }));

      toast.success(response.data.isValid ? 'Proof verified!' : 'Proof invalid!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  // Commitment Functions
  const handleCommitmentSetup = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/zero-knowledge/commitment/setup`);

      setCommitmentData(prev => ({
        ...prev,
        publicParameters: response.data.publicParameters
      }));

      toast.success('Commitment parameters generated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Setup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCommitmentCommit = async () => {
    if (!commitmentData.publicParameters || !commitmentData.message) {
      toast.error('Please generate parameters and enter a message');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/zero-knowledge/commitment/commit`, {
        message: commitmentData.message,
        publicParameters: commitmentData.publicParameters
      });

      setCommitmentData(prev => ({
        ...prev,
        commitment: response.data.commitment,
        randomness: response.data.randomness
      }));

      toast.success('Commitment created successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Commitment failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCommitmentOpen = async () => {
    if (!commitmentData.commitment || !commitmentData.message || !commitmentData.randomness) {
      toast.error('Please create a commitment first');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/zero-knowledge/commitment/open`, {
        commitment: commitmentData.commitment,
        message: commitmentData.message,
        randomness: commitmentData.randomness,
        publicParameters: commitmentData.publicParameters
      });

      setCommitmentData(prev => ({
        ...prev,
        isValid: response.data.isValid
      }));

      toast.success(response.data.isValid ? 'Commitment opened successfully!' : 'Commitment invalid!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Opening failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSchnorrDemo = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/zero-knowledge/schnorr/demo`);

      setResults(prev => ({
        ...prev,
        schnorr: response.data
      }));

      toast.success('Schnorr demo completed!');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Zero Knowledge Proofs
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Prove knowledge without revealing the secret itself
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
                ? 'bg-orange-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <tab.icon className="h-4 w-4 mr-2" />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Schnorr Protocol */}
      {activeTab === 'schnorr' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Key className="h-5 w-5 mr-2 text-orange-500" />
            Schnorr Identification Protocol
          </h2>

          <div className="space-y-6">
            {/* Setup */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Step 1: Setup Parameters</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Generate public parameters and private key for the Schnorr protocol.
              </p>
              
              <button
                onClick={handleSchnorrSetup}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Generating...' : 'Generate Parameters'}
              </button>

              {schnorrData.publicParameters && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Public Parameters</label>
                    <div className="code-block">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-500">p, g, y</span>
                        <button
                          onClick={() => copyToClipboard(JSON.stringify(schnorrData.publicParameters))}
                          className="text-blue-500 hover:text-blue-600"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="text-xs space-y-1">
                        <div>p: {schnorrData.publicParameters.p}</div>
                        <div>g: {schnorrData.publicParameters.g}</div>
                        <div>y: {schnorrData.publicParameters.y}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Private Key</label>
                    <div className="code-block">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-500">x</span>
                        <button
                          onClick={() => copyToClipboard(schnorrData.privateKey.x)}
                          className="text-blue-500 hover:text-blue-600"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="break-all text-xs">{schnorrData.privateKey.x}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Protocol Steps */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Step 2: Execute Protocol</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Prover Side */}
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center">
                    <User className="h-4 w-4 mr-2 text-blue-500" />
                    Prover (Knows Secret)
                  </h4>
                  
                  <div className="space-y-2">
                    <button
                      onClick={handleSchnorrCommit}
                      disabled={loading || !schnorrData.publicParameters}
                      className="btn-secondary w-full"
                    >
                      {loading ? 'Generating...' : 'Generate Commitment'}
                    </button>

                    {schnorrData.commitment && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Commitment (A)</label>
                        <div className="code-block">
                          <div className="break-all text-xs">{schnorrData.commitment}</div>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleSchnorrResponse}
                      disabled={loading || !schnorrData.challenge}
                      className="btn-secondary w-full"
                    >
                      {loading ? 'Generating...' : 'Generate Response'}
                    </button>

                    {schnorrData.response && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Response (s)</label>
                        <div className="code-block">
                          <div className="break-all text-xs">{schnorrData.response}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Verifier Side */}
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center">
                    <Server className="h-4 w-4 mr-2 text-green-500" />
                    Verifier (Checks Proof)
                  </h4>
                  
                  <div className="space-y-2">
                    <button
                      onClick={handleSchnorrChallenge}
                      disabled={loading || !schnorrData.publicParameters}
                      className="btn-secondary w-full"
                    >
                      {loading ? 'Generating...' : 'Generate Challenge'}
                    </button>

                    {schnorrData.challenge && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Challenge (c)</label>
                        <div className="code-block">
                          <div className="break-all text-xs">{schnorrData.challenge}</div>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleSchnorrVerify}
                      disabled={loading || !schnorrData.commitment || !schnorrData.challenge || !schnorrData.response}
                      className="btn-primary w-full"
                    >
                      {loading ? 'Verifying...' : 'Verify Proof'}
                    </button>

                    {schnorrData.isValid !== null && (
                      <div className={`p-4 rounded-lg ${
                        schnorrData.isValid 
                          ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                          : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                      }`}>
                        <div className="flex items-center">
                          {schnorrData.isValid ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500 mr-2" />
                          )}
                          <span className={`font-medium ${
                            schnorrData.isValid ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                          }`}>
                            {schnorrData.isValid ? 'Proof is valid!' : 'Proof is invalid!'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Demo */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Quick Demo</h3>
              <button
                onClick={handleSchnorrDemo}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Running Demo...' : 'Run Complete Demo'}
              </button>

              {results.schnorr && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Protocol Values</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Commitment:</span>
                          <span className="font-mono text-xs">{results.schnorr.commitment}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Challenge:</span>
                          <span className="font-mono text-xs">{results.schnorr.challenge}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Response:</span>
                          <span className="font-mono text-xs">{results.schnorr.response}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Verification Result</h4>
                      <div className={`p-4 rounded-lg ${
                        results.schnorr.isValid 
                          ? 'bg-green-50 dark:bg-green-900/20' 
                          : 'bg-red-50 dark:bg-red-900/20'
                      }`}>
                        <div className="flex items-center">
                          {results.schnorr.isValid ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500 mr-2" />
                          )}
                          <span className={`font-medium ${
                            results.schnorr.isValid ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                          }`}>
                            {results.schnorr.isValid ? 'Proof Verified!' : 'Proof Failed!'}
                          </span>
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

      {/* Commitment Scheme */}
      {activeTab === 'commitment' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Lock className="h-5 w-5 mr-2 text-purple-500" />
            Pedersen Commitment Scheme
          </h2>

          <div className="space-y-6">
            {/* Setup */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Step 1: Setup Parameters</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Generate public parameters for the commitment scheme.
              </p>
              
              <button
                onClick={handleCommitmentSetup}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Generating...' : 'Generate Parameters'}
              </button>

              {commitmentData.publicParameters && (
                <div>
                  <label className="block text-sm font-medium mb-2">Public Parameters</label>
                  <div className="code-block">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-500">p, g, h</span>
                      <button
                        onClick={() => copyToClipboard(JSON.stringify(commitmentData.publicParameters))}
                        className="text-blue-500 hover:text-blue-600"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="text-xs space-y-1">
                      <div>p: {commitmentData.publicParameters.p}</div>
                      <div>g: {commitmentData.publicParameters.g}</div>
                      <div>h: {commitmentData.publicParameters.h}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Commitment */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Step 2: Create Commitment</h3>
              
              <div>
                <label className="block text-sm font-medium mb-2">Message to Commit</label>
                <input
                  type="text"
                  value={commitmentData.message}
                  onChange={(e) => setCommitmentData(prev => ({ ...prev, message: e.target.value }))}
                  className="input-field"
                  placeholder="Enter message to commit..."
                />
              </div>

              <button
                onClick={handleCommitmentCommit}
                disabled={loading || !commitmentData.publicParameters || !commitmentData.message}
                className="btn-primary"
              >
                {loading ? 'Creating...' : 'Create Commitment'}
              </button>

              {commitmentData.commitment && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Commitment</label>
                    <div className="code-block">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-500">Hexadecimal</span>
                        <button
                          onClick={() => copyToClipboard(commitmentData.commitment)}
                          className="text-blue-500 hover:text-blue-600"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="break-all text-xs">{commitmentData.commitment}</div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Randomness</label>
                    <div className="code-block">
                      <div className="break-all text-xs">{commitmentData.randomness}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Opening */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Step 3: Open Commitment</h3>
              
              <button
                onClick={handleCommitmentOpen}
                disabled={loading || !commitmentData.commitment}
                className="btn-primary"
              >
                {loading ? 'Opening...' : 'Open Commitment'}
              </button>

              {commitmentData.isValid !== null && (
                <div className={`p-4 rounded-lg ${
                  commitmentData.isValid 
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                }`}>
                  <div className="flex items-center">
                    {commitmentData.isValid ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mr-2" />
                    )}
                    <span className={`font-medium ${
                      commitmentData.isValid ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                    }`}>
                      {commitmentData.isValid ? 'Commitment opened successfully!' : 'Commitment is invalid!'}
                    </span>
                  </div>
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
          About Zero Knowledge Proofs
        </h3>
        <div className="space-y-4 text-gray-600 dark:text-gray-300">
          <p>
            Zero Knowledge Proofs allow a prover to convince a verifier that they know a secret 
            without revealing any information about the secret itself.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Schnorr Protocol</h4>
              <ul className="text-sm space-y-1">
                <li>• Three-step protocol: commit, challenge, respond</li>
                <li>• Proves knowledge of discrete logarithm</li>
                <li>• Used in: digital signatures, authentication</li>
                <li>• Perfect zero-knowledge property</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Commitment Schemes</h4>
              <ul className="text-sm space-y-1">
                <li>• Hiding: commitment reveals no information</li>
                <li>• Binding: cannot change committed value</li>
                <li>• Used in: voting systems, auctions</li>
                <li>• Pedersen: information-theoretically hiding</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ZeroKnowledgeModule; 