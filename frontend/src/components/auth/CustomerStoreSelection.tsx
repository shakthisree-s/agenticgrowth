import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Customer } from '../../types';
import { AbstractLines } from '../layout/AbstractLines';
import { ArrowLeft, ArrowRight, Check, Plus, UserCheck } from 'lucide-react';

interface Props {
  customer: Customer;
  onBack: () => void;
}

export const CustomerStoreSelection: React.FC<Props> = ({ customer, onBack }) => {
  const { merchants, loginAsCustomer, setIsCreateMerchantModalOpen } = useApp();
  const [selectedMerchantId, setSelectedMerchantId] = useState<string>(merchants[0]?.id || 'merchant_sports');

  const handleEnterStore = () => {
    loginAsCustomer(selectedMerchantId, customer);
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
        maxWidth: '640px',
        background: '#FFFFFF',
        border: '1px solid var(--border-subtle)',
        borderRadius: '16px',
        padding: '40px 44px',
        boxShadow: 'var(--shadow-card)',
        position: 'relative',
        zIndex: 2,
        animation: 'fadeIn 0.2s ease-out'
      }}>
        {/* Back Button & Create Store */}
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
            <span>Back to Sign In</span>
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
          STORE SELECTION
        </div>
        <h1 style={{
          fontSize: '1.9rem',
          fontFamily: 'var(--font-serif)',
          fontWeight: 400,
          color: '#111111',
          marginBottom: '6px'
        }}>
          Choose your merchant.
        </h1>
        <p style={{
          fontSize: '0.9rem',
          color: '#666666',
          marginBottom: '20px',
          lineHeight: 1.5
        }}>
          Select a merchant store to start shopping with isolated merchant catalogs and conversational AI agents.
        </p>

        {/* Customer Identity Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 14px',
          background: '#F9F9F9',
          border: '1px solid #EBEBEB',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: '#111111',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.78rem',
            fontWeight: 700,
            flexShrink: 0
          }}>
            {customer.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#111111' }}>
              {customer.name}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#777777', fontFamily: 'var(--font-mono)' }}>
              {customer.email}
            </div>
          </div>
          <span style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            color: '#444444',
            background: '#EAEAEA',
            padding: '2px 8px',
            borderRadius: '4px'
          }}>
            Authenticated
          </span>
        </div>

        {/* Store Selection Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
          {merchants.map(m => {
            const isSelected = m.id === selectedMerchantId;
            return (
              <div
                key={m.id}
                onClick={() => setSelectedMerchantId(m.id)}
                style={{
                  border: isSelected ? '2px solid #111111' : '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '14px 18px',
                  background: isSelected ? '#FAFAFA' : '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.borderColor = '#999999';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.borderColor = 'var(--border-subtle)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    background: isSelected ? '#111111' : '#F0F0F0',
                    color: isSelected ? '#FFFFFF' : '#111111',
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {m.logoInitial}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.94rem', fontWeight: 700, color: '#111111' }}>
                      {m.name}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#666666' }}>
                      {m.industry} • {m.tagline}
                    </div>
                  </div>
                </div>

                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: isSelected ? '2px solid #111111' : '1px solid #CCCCCC',
                  background: isSelected ? '#111111' : '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {isSelected && <Check size={11} color="#FFFFFF" strokeWidth={3} />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Enter Store Button */}
        <button
          onClick={handleEnterStore}
          className="btn-primary"
          style={{
            width: '100%',
            padding: '13px',
            borderRadius: '8px',
            fontSize: '0.94rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer'
          }}
        >
          <span>Enter Storefront</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
