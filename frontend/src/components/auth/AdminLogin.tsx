import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AbstractLines } from '../layout/AbstractLines';
import { ArrowLeft, ArrowRight, Lock, Key, ShieldCheck, Check, Plus } from 'lucide-react';

interface Props {
  onBack: () => void;
}

export const AdminLogin: React.FC<Props> = ({ onBack }) => {
  const { merchants, loginAsAdmin, setIsCreateMerchantModalOpen } = useApp();

  const [selectedMerchantId, setSelectedMerchantId] = useState<string>(merchants[0]?.id || 'merchant_sports');
  const [username, setUsername] = useState<string>('admin@urbankart.demo');
  const [password, setPassword] = useState<string>('Admin@123');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const getDemoCredsForMerchant = (mId: string) => {
    switch (mId) {
      case 'merchant_sports':
        return { username: 'admin@urbankart.demo', password: 'Admin@123' };
      case 'merchant_fashion':
        return { username: 'admin@fashionhub.demo', password: 'Admin@123' };
      case 'merchant_tech':
        return { username: 'admin@technest.demo', password: 'Admin@123' };
      default:
        return { username: `admin@${mId}.demo`, password: 'Admin@123' };
    }
  };

  const handleSelectMerchant = (mId: string) => {
    setSelectedMerchantId(mId);
    const creds = getDemoCredsForMerchant(mId);
    setUsername(creds.username);
    setPassword(creds.password);
    setErrorMsg(null);
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Please enter both username and password.');
      return;
    }

    loginAsAdmin(selectedMerchantId, username.trim());
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
        maxWidth: '600px',
        background: '#FFFFFF',
        border: '1px solid var(--border-subtle)',
        borderRadius: '16px',
        padding: '40px 44px',
        boxShadow: 'var(--shadow-card)',
        position: 'relative',
        zIndex: 2,
        animation: 'fadeIn 0.2s ease-out'
      }}>
        {/* Top Actions */}
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

        {/* Heading */}
        <div className="eyebrow" style={{ marginBottom: '6px' }}>
          ADMIN ACCESS
        </div>
        <h1 style={{
          fontSize: '1.9rem',
          fontFamily: 'var(--font-serif)',
          fontWeight: 400,
          color: '#111111',
          marginBottom: '6px'
        }}>
          Merchant Admin Access.
        </h1>
        <p style={{
          fontSize: '0.9rem',
          color: '#666666',
          marginBottom: '24px'
        }}>
          Select a merchant below to 1-click autofill demo credentials and access the autonomous multi-agent control center.
        </p>

        {/* 1-Click Merchant Selection Cards */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#777777',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Key size={12} />
            <span>Select Merchant (1-Click Autofill)</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: merchants.length > 3 ? 'repeat(2, 1fr)' : `repeat(${Math.min(3, merchants.length)}, 1fr)`, gap: '10px' }}>
            {merchants.map(m => {
              const isSelected = m.id === selectedMerchantId;
              const creds = getDemoCredsForMerchant(m.id);

              return (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => handleSelectMerchant(m.id)}
                  style={{
                    background: isSelected ? '#111111' : '#FAFAFA',
                    color: isSelected ? '#FFFFFF' : '#111111',
                    border: isSelected ? '1px solid #111111' : '1px solid #E5E5E5',
                    borderRadius: '8px',
                    padding: '12px 10px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, marginBottom: '2px' }}>
                    {m.name}
                  </div>
                  <div style={{
                    fontSize: '0.66rem',
                    color: isSelected ? '#CCCCCC' : '#777777',
                    fontFamily: 'var(--font-mono)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {creds.username}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#333333', display: 'block', marginBottom: '6px' }}>
              Username / Demo Email
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin@urbankart.demo"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #D5D5D5',
                fontSize: '0.88rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#333333', display: 'block', marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #D5D5D5',
                fontSize: '0.88rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {errorMsg && (
            <div style={{ color: '#D9534F', fontSize: '0.82rem', fontWeight: 600 }}>
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '0.92rem',
              fontWeight: 700,
              marginTop: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Lock size={15} />
            <span>Sign In as Admin</span>
          </button>
        </form>

        <div style={{
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: '1px solid #F0F0F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          fontSize: '0.72rem',
          color: '#888888'
        }}>
          <ShieldCheck size={13} color="#111111" />
          <span>Deterministic Demo Auth • Full 6-Agent Merchant Control</span>
        </div>
      </div>
    </div>
  );
};
