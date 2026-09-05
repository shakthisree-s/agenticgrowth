import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Store, ArrowRight, ShieldCheck, Tag } from 'lucide-react';

export const CreateMerchantModal: React.FC = () => {
  const { isCreateMerchantModalOpen, setIsCreateMerchantModalOpen, createMerchant, setActiveScreen } = useApp();

  const [step, setStep] = useState<1 | 2>(1);
  const [storeName, setStoreName] = useState('');
  const [industry, setIndustry] = useState('Fashion & Apparel');
  const [currency, setCurrency] = useState('INR');
  const [tagline, setTagline] = useState('');
  const [maxDiscount, setMaxDiscount] = useState(15);
  const [approvalThreshold, setApprovalThreshold] = useState(5000);

  if (!isCreateMerchantModalOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim()) return;

    createMerchant({
      name: storeName.trim(),
      storeName: storeName.trim(),
      industry,
      currency,
      currencySymbol: currency === 'USD' ? '$' : '₹',
      tagline: tagline.trim() || `AI Autonomous Commerce Store for ${industry}`,
      maxDiscountPercent: maxDiscount,
      requireApprovalAboveAmount: approvalThreshold
    });

    setIsCreateMerchantModalOpen(false);
    setStep(1);
    setStoreName('');
    setActiveScreen('conversational'); // Take merchant to Shopping / Catalog to add first product
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.45)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '520px',
        background: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid var(--border-subtle)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.12)',
        overflow: 'hidden',
        animation: 'fadeIn 0.15s ease-out'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#777777' }}>
              Merchant Onboarding
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#111111', marginTop: '2px' }}>
              Create Your Store
            </div>
          </div>

          <button
            onClick={() => setIsCreateMerchantModalOpen(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888888', padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleCreate} style={{ padding: '24px' }}>
          {step === 1 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#222222', marginBottom: '6px' }}>
                  Store Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aura Studio, Lumina Beauty, Bolt Electronics"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #D6D6D6',
                    fontSize: '0.86rem',
                    outline: 'none',
                    background: '#FAFAFA',
                    color: '#111111'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#222222', marginBottom: '6px' }}>
                  Industry Category
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #D6D6D6',
                    fontSize: '0.86rem',
                    background: '#FAFAFA',
                    color: '#111111'
                  }}
                >
                  <option value="Fashion & Apparel">Fashion & Apparel</option>
                  <option value="Sports & Athletics">Sports & Athletics</option>
                  <option value="Consumer Electronics & Workspace">Consumer Electronics & Workspace</option>
                  <option value="Beauty & Personal Care">Beauty & Personal Care</option>
                  <option value="Home & Living">Home & Living</option>
                  <option value="Specialty Goods">Specialty Goods</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#222222', marginBottom: '6px' }}>
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #D6D6D6',
                    fontSize: '0.86rem',
                    background: '#FAFAFA',
                    color: '#111111'
                  }}
                >
                  <option value="INR">INR (₹) — Razorpay India</option>
                  <option value="USD">USD ($) — International</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#222222', marginBottom: '6px' }}>
                  Store Tagline / Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Handcrafted modern apparel designed for everyday luxury"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #D6D6D6',
                    fontSize: '0.86rem',
                    background: '#FAFAFA',
                    color: '#111111'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button
                  type="button"
                  disabled={!storeName.trim()}
                  onClick={() => setStep(2)}
                  className="btn-primary"
                  style={{ padding: '9px 18px', borderRadius: '6px', fontSize: '0.84rem' }}
                >
                  <span>Next: Configure Policies</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#F9F9F9', border: '1px solid #EBEBEB', borderRadius: '8px', padding: '14px', marginBottom: '4px' }}>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#111111', marginBottom: '2px' }}>
                  AI Guardrails for {storeName}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#666666' }}>
                  These rules constrain the Policy Agent for autonomous discount & checkout decisions.
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#222222', marginBottom: '6px' }}>
                  Maximum Dynamic Discount % (Hard Ceiling)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(parseInt(e.target.value, 10) || 0)}
                    style={{
                      width: '100px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #D6D6D6',
                      fontSize: '0.86rem',
                      background: '#FAFAFA'
                    }}
                  />
                  <span style={{ fontSize: '0.82rem', color: '#666666' }}>% (e.g. 15% or 20%)</span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#222222', marginBottom: '6px' }}>
                  Human Approval Threshold
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="number"
                    min={100}
                    step={500}
                    value={approvalThreshold}
                    onChange={(e) => setApprovalThreshold(parseInt(e.target.value, 10) || 0)}
                    style={{
                      width: '140px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #D6D6D6',
                      fontSize: '0.86rem',
                      background: '#FAFAFA'
                    }}
                  />
                  <span style={{ fontSize: '0.82rem', color: '#666666' }}>Orders above this require 1-click merchant signoff</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #F0F0F0' }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-secondary btn-sm"
                  style={{ borderRadius: '6px' }}
                >
                  Back
                </button>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '9px 20px', borderRadius: '6px', fontSize: '0.84rem' }}
                >
                  <span>Launch Store & Initialize Fleet</span>
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
