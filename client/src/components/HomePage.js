import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Lock, 
  Key, 
  Users, 
  Eye, 
  Cloud,
  ArrowRight,
  Zap,
  Code,
  BookOpen,
  Github
} from 'lucide-react';

const features = [
  {
    name: 'Basic Cryptography',
    description: 'AES encryption, RSA key pairs, digital signatures, and hash functions',
    icon: Lock,
    href: '/crypto',
    color: 'bg-blue-500',
    gradient: 'from-blue-500 to-blue-600'
  },
  {
    name: 'Homomorphic Encryption',
    description: 'Perform computations on encrypted data without decryption',
    icon: Key,
    href: '/homomorphic',
    color: 'bg-purple-500',
    gradient: 'from-purple-500 to-purple-600'
  },
  {
    name: 'Secret Sharing',
    description: 'Shamir\'s Secret Sharing with threshold reconstruction',
    icon: Users,
    href: '/secret-sharing',
    color: 'bg-green-500',
    gradient: 'from-green-500 to-green-600'
  },
  {
    name: 'Zero Knowledge Proofs',
    description: 'Prove knowledge without revealing the secret itself',
    icon: Eye,
    href: '/zero-knowledge',
    color: 'bg-orange-500',
    gradient: 'from-orange-500 to-orange-600'
  },
  {
    name: 'Cloud Security',
    description: 'KMS, JWT tokens, and secure multi-party computation',
    icon: Cloud,
    href: '/cloud-security',
    color: 'bg-indigo-500',
    gradient: 'from-indigo-500 to-indigo-600'
  }
];

const stats = [
  { name: 'Cryptographic Algorithms', value: '15+' },
  { name: 'Interactive Demos', value: '25+' },
  { name: 'Security Concepts', value: '10+' },
  { name: 'Code Examples', value: '50+' }
];

const HomePage = () => {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center relative overflow-hidden gradient-hero py-12 rounded-2xl shadow-lg mb-8"
      >
        <div className="absolute inset-0 z-0 animate-gradient-move pointer-events-none" style={{ background: 'linear-gradient(120deg, #667eea 0%, #764ba2 40%, #43e97b 80%, #38f9d7 100%)', opacity: 0.18 }} />
        <div className="bg-clip-text text-transparent relative z-10">
          <h1 className="text-4xl font-bold sm:text-6xl mb-6 animate-fade-in">
            Cloud Security Playground
          </h1>
        </div>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8 animate-fade-in delay-100">
          Interactive demonstrations of cryptographic methods, homomorphic encryption, 
          secret sharing, zero-knowledge proofs, and cloud security concepts.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in delay-200">
          <Link
            to="/crypto"
            className="btn-primary inline-flex items-center justify-center"
          >
            <Zap className="mr-2 h-5 w-5" />
            Start Exploring
          </Link>
          <a
            href="https://github.com/flatmarstheory/cloud-security-playground"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary inline-flex items-center justify-center"
          >
            <Github className="mr-2 h-5 w-5" />
            View Source
          </a>
          <a
            href="https://github.com/flatmarstheory/cloud-security-playground#readme"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary inline-flex items-center justify-center"
          >
            <BookOpen className="mr-2 h-5 w-5" />
            Project Docs
          </a>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
            className="card text-center animate-fade-in"
          >
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stat.value}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {stat.name}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={feature.name}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
            whileHover={{ y: -5, scale: 1.04 }}
            className="card hover:shadow-lg transition-all duration-300 animate-fade-in"
          >
            <div className="flex items-center mb-4">
              <div className={`p-3 rounded-lg ${feature.color} text-white mr-4 animate-pop`}> 
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {feature.name}
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {feature.description}
            </p>
            <Link
              to={feature.href}
              className={`inline-flex items-center text-sm font-medium bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent hover:underline`}
            >
              Explore Module
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </motion.div>
        ))}
      </div>

      
    </div>
  );
};

export default HomePage; 