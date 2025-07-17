import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, 
  Key, 
  Users, 
  Eye, 
  Cloud, 
  Home,
  Menu,
  X,
  Github,
  BookOpen
} from 'lucide-react';

// Import components
import HomePage from './components/HomePage';
import CryptoModule from './components/CryptoModule';
import HomomorphicModule from './components/HomomorphicModule';
import SecretSharingModule from './components/SecretSharingModule';
import ZeroKnowledgeModule from './components/ZeroKnowledgeModule';
import CloudSecurityModule from './components/CloudSecurityModule';

function MatrixRain() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    const fontSize = 18;
    const columns = Math.floor(width / fontSize);
    const drops = Array(columns).fill(1);
    const chars = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズヅブプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッンABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    function draw() {
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.fillRect(0, 0, width, height);
      ctx.font = fontSize + 'px Fira Mono, monospace';
      ctx.fillStyle = '#00ff41';
      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }
    let anim;
    function loop() {
      draw();
      anim = requestAnimationFrame(loop);
    }
    loop();
    window.addEventListener('resize', () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    });
    return () => cancelAnimationFrame(anim);
  }, []);
  return <canvas ref={canvasRef} className="matrix-bg" />;
}

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Basic Crypto', href: '/crypto', icon: Lock },
  { name: 'Homomorphic Encryption', href: '/homomorphic', icon: Key },
  { name: 'Secret Sharing', href: '/secret-sharing', icon: Users },
  { name: 'Zero Knowledge Proofs', href: '/zero-knowledge', icon: Eye },
  { name: 'Cloud Security', href: '/cloud-security', icon: Cloud },
];

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-black">
      <MatrixRain />

      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white dark:bg-gray-800">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              🔐 Cloud Security
            </h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={24} />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col gradient-sidebar">
        <div className="flex items-center py-6 px-4 gap-4">
          <span className="flex items-center justify-center text-2xl drop-shadow-lg">
            <span role="img" aria-label="lock">🔐</span>
          </span>
          <span className="text-xl font-bold text-white drop-shadow-lg">
            Cloud Security Playground
          </span>
        </div>
        <nav className="flex-1 space-y-2 px-2 py-4">
          <div className="text-xs uppercase tracking-wider text-blue-100 mb-2 pl-2">Modules</div>
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const iconColors = {
              Home: 'text-blue-400',
              'Basic Crypto': 'text-blue-500',
              'Homomorphic Encryption': 'text-purple-500',
              'Secret Sharing': 'text-green-500',
              'Zero Knowledge Proofs': 'text-orange-500',
              'Cloud Security': 'text-indigo-500',
            };
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200 shadow-sm mb-1 ${
                  isActive
                    ? 'bg-white/20 text-white ring-2 ring-blue-300 dark:ring-blue-700'
                    : 'text-blue-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="flex items-center justify-center h-8 w-8 mr-3">
                  <item.icon className={`h-6 w-6 ${iconColors[item.name] || 'text-blue-200'} drop-shadow`} />
                </span>
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-blue-200/30 mt-auto">
          <div className="flex space-x-2 justify-center">
            <a
              href="https://github.com/flatmarstheory/cloud-security-playground"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-blue-200"
            >
              <Github size={20} />
            </a>
            <a
              href="https://github.com/flatmarstheory/cloud-security-playground#readme"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-blue-200"
            >
              <BookOpen size={20} />
            </a>
            <a
              href="https://www.buymeacoffee.com/flatmarstheory"
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-400 hover:text-yellow-500"
            >
              <img src="https://img.shields.io/badge/Buy%20Me%20A%20Coffee-flatmarstheory-yellow?logo=buy-me-a-coffee" alt="Buy Me a Coffee" className="h-5 inline" />
            </a>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Mobile header */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 shadow-sm lg:hidden">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 dark:text-gray-300 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              Cloud Security Playground
            </h1>
          </div>
        </div>

        {/* Page content */}
        <main className="h-full flex-1">
          <div className="h-full w-full px-4 sm:px-8 lg:px-12 py-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/crypto" element={<CryptoModule />} />
                  <Route path="/homomorphic" element={<HomomorphicModule />} />
                  <Route path="/secret-sharing" element={<SecretSharingModule />} />
                  <Route path="/zero-knowledge" element={<ZeroKnowledgeModule />} />
                  <Route path="/cloud-security" element={<CloudSecurityModule />} />
                </Routes>
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App; 