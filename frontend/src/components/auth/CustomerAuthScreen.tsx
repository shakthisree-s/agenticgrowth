import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Customer } from '../../types';
import { AbstractLines } from '../layout/AbstractLines';
import { ArrowLeft, ArrowRight, User, Mail, Phone, Lock, Plus, UserCheck } from 'lucide-react';

interface Props {
  onBack: () => void;
  onAuthenticated: (customer: Customer) => void;
}

export const CustomerAuthScreen: React.FC<Props> = ({ onBack, onAuthenticated }) => {
  const { allCustomers, merchants, setIsCreateMerchantModalOpen } = useApp();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('customer@urbankart.demo');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('Customer@123');
  const [error, setError] = useState<string | null>(null);

  const handleSwitchToSignIn = () => {
    setMode('signin');
    setError(null);
    setEmail('customer@urbankart.demo');
    setPassword('Customer@123');
  };

  const handleSwitchToSignUp = () => {
    setMode('signup');
    setError(null);
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();

    if (mode === 'signup') {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (!cleanEmail || !cleanEmail.includes('@')) {
        setError('Please enter a valid email address.');
        return;
      }

      // Check if customer already exists across merchants
      let existingCustomer: Customer | null = null;
      for (const mId of Object.keys(allCustomers)) {
        const found = (allCustomers[mId] || []).find(c => c.email.toLowerCase() === cleanEmail);
        if (found) {
          existingCustomer = found;
          break;
        }
      }

      if (existingCustomer) {
        // Customer already exists, proceed with their existing profile
        onAuthenticated(existingCustomer);
        return;
      }

      // Create new customer profile
      const newCustomer: Customer = {
        id: `CUS_${Date.now().toString().slice(-4)}`,
        merchantId: merchants[0]?.id || 'merchant_sports',
        name: name.trim(),
        email: cleanEmail,
        phone: phone.trim() || '+91 98000 00000',
        location: 'Online Storefront',
        createdAt: new Date().toISOString(),
        lifetimeValue: 0,
        status: 'active',
        avatarColor: '#111111',
        currentIntent: 'STOREFRONT_VISITOR',
        nextBestAction: 'Explore store catalog with AI Shopping Agent',
        metrics: {
          totalOrders: 0,
          totalSpend: 0,
          averageOrderValue: 0,
          lastPurchaseAt: null
        },
        behavior: {
          viewedTimes: 1,
          lastViewedProduct: '',
          cartValue: 0,
          cartItems: [],
          daysActive: 1,
          hasPurchased: false,
          intentScore: 50,
          preferredCategories: [],
          viewedProducts: [],
          searchQueries: [],
          cartAdds: [],
          abandonedCarts: [],
          purchases: []
        }
      };

      onAuthenticated(newCustomer);
    } else {
      // Sign In Mode
      if (!cleanEmail || !cleanEmail.includes('@')) {
        setError('Please enter your account email.');
        return;
      }

      // Search across all merchant customer stores
      let matchedCustomer: Customer | null = null;
      for (const mId of Object.keys(allCustomers)) {
        const found = (allCustomers[mId] || []).find(c => c.email.toLowerCase() === cleanEmail);
        if (found) {
          matchedCustomer = found;
          break;
        }
      }

      if (!matchedCustomer) {
        // Create new customer profile from email
        const inferredName = cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Shopper';
        matchedCustomer = {
          id: `CUS_${Date.now().toString().slice(-4)}`,
          merchantId: merchants[0]?.id || 'merchant_sports',
          name: inferredName,
          email: cleanEmail,
          phone: '+91 98000 00000',
          location: 'Online Storefront',
          createdAt: new Date().toISOString(),
          lifetimeValue: 0,
          status: 'active',
          avatarColor: '#111111',
          currentIntent: 'STOREFRONT_VISITOR',
          nextBestAction: 'Explore store catalog with AI Shopping Agent',
          metrics: {
            totalOrders: 0,
            totalSpend: 0,
            averageOrderValue: 0,
            lastPurchaseAt: null
          },
          behavior: {
            viewedTimes: 1,
            lastViewedProduct: '',
            cartValue: 0,
            cartItems: [],
            daysActive: 1,
            hasPurchased: false,
            intentScore: 50,
            preferredCategories: [],
            viewedProducts: [],
            searchQueries: [],
            cartAdds: [],
            abandonedCarts: [],
            purchases: []
          }
        };
      }

      onAuthenticated(matchedCustomer);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FAFAFA',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px 24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <AbstractLines opacity={0.45} />

      <div style={{
        width: '100%',
        maxWidth: '520px',
        background: '#FFFFFF',
        border: '1px solid var(--border-subtle)',
        borderRadius: '16px',
        padding: '40px 44px',
        boxShadow: 'var(--shadow-card)',
        position: 'relative',
        zIndex: 2,
        animation: 'fadeIn 0.2s ease-out'
      }}>
        {/* Top Header Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <button
            onClick={onBack}
            className="btn-ghost"
            style={{
              padding: '0',
              fontSize: '0.82rem',
              color: '#666666',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ArrowLeft size={14} />
            <span>Back to Landing</span>
          </button>

          <button
            onClick={() => setIsCreateMerchantModalOpen(true)}
            className="btn-secondary btn-sm"
            style={{ borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.76rem' }}
          >
            <Plus size={13} />
            <span>Create Store</span>
          </button>
        </div>

        {/* Eyebrow & Titles */}
        <div className="eyebrow" style={{ marginBottom: '6px' }}>
          CUSTOMER AUTHENTICATION
        </div>
        <h1 style={{
          fontSize: '1.9rem',
          fontFamily: 'var(--font-serif)',
          fontWeight: 400,
          color: '#111111',
          marginBottom: '6px'
        }}>
          {mode === 'signup' ? 'Create Customer Account.' : 'Customer Sign In.'}
        </h1>
        <p style={{
          fontSize: '0.88rem',
          color: '#666666',
          marginBottom: '20px',
          lineHeight: 1.5
        }}>
          {mode === 'signup'
            ? 'Create your customer identity to access conversational AI shopping.'
            : 'Sign in to access your customer shopping profile and proceed to store selection.'}
        </p>

        {/* Mode Switch Tabs */}
        <div style={{
          display: 'flex',
          border: '1px solid #E5E5E5',
          borderRadius: '8px',
          background: '#F7F7F7',
          padding: '3px',
          marginBottom: '22px'
        }}>
          <button
            type="button"
            onClick={handleSwitchToSignIn}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: 'none',
              borderRadius: '6px',
              background: mode === 'signin' ? '#FFFFFF' : 'transparent',
              fontWeight: mode === 'signin' ? 700 : 500,
              fontSize: '0.82rem',
              color: mode === 'signin' ? '#111111' : '#666666',
              cursor: 'pointer',
              boxShadow: mode === 'signin' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={handleSwitchToSignUp}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: 'none',
              borderRadius: '6px',
              background: mode === 'signup' ? '#FFFFFF' : 'transparent',
              fontWeight: mode === 'signup' ? 700 : 500,
              fontSize: '0.82rem',
              color: mode === 'signup' ? '#111111' : '#666666',
              cursor: 'pointer',
              boxShadow: mode === 'signup' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div style={{
              background: '#FFF5F5',
              border: '1px solid #FFE0E0',
              borderRadius: '6px',
              padding: '10px 14px',
              color: '#C53030',
              fontSize: '0.82rem'
            }}>
              {error}
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#333333', marginBottom: '6px' }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="e.g. Priya Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    borderRadius: '8px',
                    border: '1px solid #D6D6D6',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  autoFocus
                />
                <User size={15} style={{ position: 'absolute', left: '12px', top: '12px', color: '#999999' }} />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#333333', marginBottom: '6px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                placeholder="e.g. priya@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  borderRadius: '8px',
                  border: '1px solid #D6D6D6',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                autoFocus={mode === 'signin'}
              />
              <Mail size={15} style={{ position: 'absolute', left: '12px', top: '12px', color: '#999999' }} />
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#333333', marginBottom: '6px' }}>
                Phone Number (Optional)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    borderRadius: '8px',
                    border: '1px solid #D6D6D6',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <Phone size={15} style={{ position: 'absolute', left: '12px', top: '12px', color: '#999999' }} />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#333333', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  borderRadius: '8px',
                  border: '1px solid #D6D6D6',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <Lock size={15} style={{ position: 'absolute', left: '12px', top: '12px', color: '#999999' }} />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '0.92rem',
              fontWeight: 700,
              cursor: 'pointer',
              marginTop: '8px'
            }}
          >
            <span>{mode === 'signup' ? 'Create Account & Select Store' : 'Sign In & Select Store'}</span>
            <ArrowRight size={15} />
          </button>
        </form>

        <div style={{
          marginTop: '24px',
          paddingTop: '16px',
          borderTop: '1px solid #F0F0F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          fontSize: '0.72rem',
          color: '#888888'
        }}>
          <UserCheck size={13} color="#111111" />
          <span>Customer Demo Access • customer@urbankart.demo</span>
        </div>
      </div>
    </div>
  );
};
