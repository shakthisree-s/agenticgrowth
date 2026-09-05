import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, User, Mail, Phone, ArrowRight } from 'lucide-react';

export const CustomerAuthModal: React.FC = () => {
  const {
    isCustomerAuthModalOpen,
    closeCustomerAuth,
    customerAuthMode,
    setCustomerAuthMode,
    signUpCustomer,
    signInCustomer,
    activeMerchant
  } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isCustomerAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (customerAuthMode === 'signup') {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setError('Please enter a valid email address.');
        return;
      }

      signUpCustomer({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined
      });
      setName('');
      setEmail('');
      setPhone('');
    } else {
      if (!email.trim() || !email.includes('@')) {
        setError('Please enter your account email.');
        return;
      }

      const cust = signInCustomer({ email: email.trim() });
      if (!cust) {
        setError('Account not found with this email. Please create an account.');
        return;
      }
      setEmail('');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.45)',
      backdropFilter: 'blur(4px)',
      WebkitBackdropFilter: 'blur(4px)',
      zIndex: 110,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#FFFFFF',
        width: '100%',
        maxWidth: '440px',
        borderRadius: '12px',
        border: '1px solid var(--border-subtle)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
        overflow: 'hidden',
        animation: 'fadeIn 0.15s ease-out'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 28px 18px 28px',
          borderBottom: '1px solid #F0F0F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888888', marginBottom: '4px' }}>
              {activeMerchant.name} Storefront
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111111', margin: 0, fontFamily: 'var(--font-serif)' }}>
              {customerAuthMode === 'signup' ? 'Create Customer Account' : 'Sign in to Shop'}
            </h2>
          </div>
          <button
            onClick={closeCustomerAuth}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888888', padding: '4px' }}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mode Switch Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #F0F0F0', background: '#FAFAFA' }}>
          <button
            onClick={() => { setCustomerAuthMode('signin'); setError(null); }}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              background: customerAuthMode === 'signin' ? '#FFFFFF' : 'transparent',
              fontWeight: customerAuthMode === 'signin' ? 700 : 500,
              fontSize: '0.84rem',
              color: customerAuthMode === 'signin' ? '#111111' : '#777777',
              cursor: 'pointer',
              borderBottom: customerAuthMode === 'signin' ? '2px solid #111111' : 'none'
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => { setCustomerAuthMode('signup'); setError(null); }}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              background: customerAuthMode === 'signup' ? '#FFFFFF' : 'transparent',
              fontWeight: customerAuthMode === 'signup' ? 700 : 500,
              fontSize: '0.84rem',
              color: customerAuthMode === 'signup' ? '#111111' : '#777777',
              cursor: 'pointer',
              borderBottom: customerAuthMode === 'signup' ? '2px solid #111111' : 'none'
            }}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
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

          {customerAuthMode === 'signup' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#333333', marginBottom: '6px' }}>
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
                    borderRadius: '6px',
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
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#333333', marginBottom: '6px' }}>
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
                  borderRadius: '6px',
                  border: '1px solid #D6D6D6',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                autoFocus={customerAuthMode === 'signin'}
              />
              <Mail size={15} style={{ position: 'absolute', left: '12px', top: '12px', color: '#999999' }} />
            </div>
          </div>

          {customerAuthMode === 'signup' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#333333', marginBottom: '6px' }}>
                Phone (Optional)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="tel"
                  placeholder="+91 98201 44819"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    borderRadius: '6px',
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

          <button
            type="submit"
            className="btn-primary"
            style={{
              width: '100%',
              padding: '11px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '0.86rem',
              fontWeight: 600,
              cursor: 'pointer',
              marginTop: '4px'
            }}
          >
            <span>{customerAuthMode === 'signup' ? 'Create Customer Account' : 'Sign In'}</span>
            <ArrowRight size={14} />
          </button>
        </form>
      </div>
    </div>
  );
};
