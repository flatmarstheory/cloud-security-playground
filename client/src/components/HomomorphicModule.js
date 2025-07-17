import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Calculator, Copy, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export default function HomomorphicModule() {
  const [activeTab, setActiveTab] = useState('paillier');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({});

  // Paillier state
  const [paillierData, setPaillierData] = useState({
    publicKey: null,
    privateKey: null,
    values: [10, 20, 30],
    encryptedValues: [],
    result: null
  });

  // ElGamal state
  const [elgamalData, setElGamalData] = useState({
    publicKey: null,
    privateKey: null,
    values: [2, 3, 4],
    encryptedValues: [],
    result: null
  });

  // Derived values for Paillier
  const expectedSum = paillierData.values.reduce((a, b) => a + b, 0);
  const numericPaillierResult = results.paillier?.result != null
    ? parseInt(results.paillier.result, 10)
    : null;
  const sumMatches = numericPaillierResult === expectedSum;

  // Derived values for ElGamal (mod p)
  const p = elgamalData.publicKey ? parseInt(elgamalData.publicKey.p, 16) : null;
  const rawProduct = elgamalData.values.reduce((a, b) => a * b, 1);
  const expectedProduct = p ? rawProduct % p : rawProduct;
  const numericElGamalResult = results.elgamal?.result != null
    ? parseInt(results.elgamal.result, 10)
    : null;
  const productMatches = numericElGamalResult === expectedProduct;

  const tabs = [
    { id: 'paillier', label: 'Paillier (Addition)', icon: Plus },
    { id: 'elgamal', label: 'ElGamal (Multiplication)', icon: X }
  ];

  // API calls
  async function genPaillier() {
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${API_BASE}/homomorphic/paillier/generate`,
        { bits: 128 }
      );
      setPaillierData(d => ({ ...d, publicKey: data.publicKey, privateKey: data.privateKey }));
      toast.success('Paillier keys generated');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error');
    } finally { setLoading(false); }
  }

  async function demoPaillier() {
    if (!paillierData.publicKey) return toast.error('Generate keys first');
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${API_BASE}/homomorphic/demo`,
        { operation: 'addition', values: paillierData.values }
      );
      setPaillierData(d => ({ ...d, encryptedValues: data.encryptedValues, result: data.result }));
      setResults(r => ({ ...r, paillier: data }));
      toast.success('Addition done');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error');
    } finally { setLoading(false); }
  }

  async function genElGamal() {
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${API_BASE}/homomorphic/elgamal/generate`,
        { bits: 128 }
      );
      setElGamalData(d => ({ ...d, publicKey: data.publicKey, privateKey: data.privateKey }));
      toast.success('ElGamal keys generated');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error');
    } finally { setLoading(false); }
  }

  async function demoElGamal() {
    if (!elgamalData.publicKey) return toast.error('Generate keys first');
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${API_BASE}/homomorphic/demo`,
        { operation: 'multiplication', values: elgamalData.values }
      );
      setElGamalData(d => ({ ...d, encryptedValues: data.encryptedValues, result: data.result }));
      setResults(r => ({ ...r, elgamal: data }));
      toast.success('Multiplication done');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error');
    } finally { setLoading(false); }
  }

  const copy = txt => {
    navigator.clipboard.writeText(txt);
    toast.success('Copied');
  };

  const updateVals = (which, arr) => {
    if (which === 'paillier') setPaillierData(d => ({ ...d, values: arr }));
    else setElGamalData(d => ({ ...d, values: arr }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Homomorphic Encryption
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Perform computations on encrypted data without decryption
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-2">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === t.id
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <t.icon className="h-4 w-4 mr-2" />{t.label}
          </button>
        ))}
      </div>

      {/* Paillier Section */}
      {activeTab === 'paillier' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6 space-y-4">
          <h2 className="flex items-center text-xl font-semibold">
            <Plus className="w-5 h-5 text-purple-500 mr-2" /> Paillier (Addition)
          </h2>
          <button onClick={genPaillier} disabled={loading} className="btn-primary">
            {loading ? '…' : 'Generate Keys'}
          </button>

          {paillierData.publicKey && (
            <>
              <div>
                <label className="block text-sm">Public Key (n)</label>
                <div className="code-block flex justify-between items-center p-2">
                  <span className="break-all text-xs">{paillierData.publicKey.n}</span>
                  <button onClick={() => copy(paillierData.publicKey.n)}><Copy className="w-4 h-4 text-blue-500"/></button>
                </div>
              </div>
              <div>
                <label className="block text-sm">Private Key (λ, μ)</label>
                <div className="code-block flex justify-between items-center p-2">
                  <div className="text-xs">λ: {paillierData.privateKey.lambda}<br/>μ: {paillierData.privateKey.mu}</div>
                  <button onClick={() => copy(JSON.stringify(paillierData.privateKey))}><Copy className="w-4 h-4 text-blue-500"/></button>
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <div className="flex gap-2 items-center">
              {paillierData.values.map((v, i) => (
                <input
                  key={i}
                  type="number"
                  value={v}
                  onChange={e => {
                    const nv = [...paillierData.values]; nv[i] = +e.target.value || 0; updateVals('paillier', nv);
                  }}
                  className="input-field w-20 text-center"
                />
              ))}
              <button onClick={() => updateVals('paillier', [...paillierData.values, 0])} className="btn-secondary">+</button>
            </div>
            <p className="text-sm text-gray-500">Original sum: {expectedSum}</p>
            <button onClick={demoPaillier} disabled={loading} className="btn-primary">
              {loading ? '…' : 'Compute'}
            </button>
          </div>

          {results.paillier && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">Encrypted Values</h4>
                  {results.paillier.encryptedValues.map((enc, i) => (
                    <div key={i} className="code-block p-2 text-xs">
                      <div className="text-gray-500">#{i + 1}:\</div>
                      <div className="break-all">{enc}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="font-medium">Results</h4>
                  <div className="space-y-2">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-sm font-medium text-green-800">Encrypted Sum</div>
                      <div className="text-lg font-bold text-green-600">{numericPaillierResult}</div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm font-medium text-blue-800">Expected Sum</div>
                      <div className="text-lg font-bold text-blue-600">{expectedSum}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`${sumMatches ? 'bg-purple-50 text-purple-800' : 'bg-red-50 text-red-800'} p-4 rounded-lg flex items-center gap-2`}>
                {sumMatches ? <Plus className="w-5 h-5 text-purple-500"/> : <X className="w-5 h-5 text-red-500"/>}
                <span className="font-medium">Homomorphic Property {sumMatches ? 'Verified' : 'Failed'}!</span>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* ElGamal Section */}
      {activeTab === 'elgamal' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6 space-y-4">
          <h2 className="flex items-center text-xl font-semibold">
            <X className="w-5 h-5 text-orange-500 mr-2" /> ElGamal (Multiplication)
          </h2>
          <button onClick={genElGamal} disabled={loading} className="btn-primary">
            {loading ? '…' : 'Generate Keys'}
          </button>

          {elgamalData.publicKey && (
            <>
              <div>
                <label className="block text-sm">Public Key (p, g, y)</label>
                <div className="code-block flex justify-between items-center p-2">
                  <div className="text-xs">p: {elgamalData.publicKey.p}<br/>g: {elgamalData.publicKey.g}<br/>y: {elgamalData.publicKey.y}</div>
                  <button onClick={() => copy(JSON.stringify(elgamalData.publicKey))}><Copy className="w-4 h-4 text-blue-500"/></button>
                </div>
              </div>
              <div>
                <label className="block text-sm">Private Key (x)</label>
                <div className="code-block flex justify-between items-center p-2">
                  <span className="break-all text-xs">{elgamalData.privateKey.x}</span>
                  <button onClick={() => copy(elgamalData.privateKey.x)}><Copy className="w-4 h-4 text-blue-500"/></button>
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <div className="flex gap-2 items-center">
              {elgamalData.values.map((v, i) => (
                <input
                  key={i}
                  type="number"
                  value={v}
                  onChange={e => {
                    const nv = [...elgamalData.values]; nv[i] = +e.target.value || 1; updateVals('elgamal', nv);
                  }}
                  className="input-field w-20 text-center"
                />
              ))}
              <button onClick={() => updateVals('elgamal', [...elgamalData.values, 1])} className="btn-secondary">+</button>
            </div>
            <p className="text-sm text-gray-500">Original product: {rawProduct}{p ? ` (mod ${p} → ${expectedProduct})` : ''}</p>
            <button onClick={demoElGamal} disabled={loading} className="btn-primary">
              {loading ? '…' : 'Compute'}
            </button>
          </div>

          {results.elgamal && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">Encrypted Values</h4>
                  {results.elgamal.encryptedValues.map((enc, i) => (
                    <div key={i} className="code-block p-2 text-xs">
                      <div className="text-gray-500">#{i+1}:</div>
                      <div className="break-all">c1: {enc.c1}<br/>c2: {enc.c2}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="font-medium">Results</h4>
                  <div className="space-y-2">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-sm font-medium text-green-800">Encrypted Product</div>
                      <div className="text-lg font-bold text-green-600">{numericElGamalResult}</div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm font-medium text-blue-800">Expected Product</div>
                      <div className="text-lg font-bold text-blue-600">{expectedProduct}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`${productMatches ? 'bg-purple-50 text-purple-800' : 'bg-red-50 text-red-800'} p-4 rounded-lg flex items-center gap-2`}>
                {productMatches ? <Calculator className="w-5 h-5 text-purple-500"/> : <X className="w-5 h-5 text-red-500"/>}
                <span className="font-medium">Homomorphic Property {productMatches ? 'Verified' : 'Failed'}!</span>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Info Panel */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-6">
        <h3 className="flex items-center text-lg font-semibold mb-3">
          <AlertCircle className="w-5 h-5 text-blue-500 mr-2"/>About Homomorphic Encryption
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          Perform arithmetic on encrypted data without decrypting. Adds privacy while enabling computation.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium mb-1">Paillier</h4>
            <ul className="list-disc ml-4">
              <li>Addition over ciphertexts</li>
              <li>Secure voting, analytics</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-1">ElGamal</h4>
            <ul className="list-disc ml-4">
              <li>Multiplication over ciphertexts</li>
              <li>Privacy-preserving ML</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
