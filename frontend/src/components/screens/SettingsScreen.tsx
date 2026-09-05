import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  CreditCard,
  Lock,
  Save,
  CheckCircle2,
  Sliders,
  Store,
  Key,
  Package,
  ArrowRight
} from 'lucide-react';

export const SettingsScreen: React.FC = () => {
  const { activeMerchant, policy, updateMerchantPolicy, setActiveScreen } = useApp();

  const [storeName, setStoreName] = useState<string>(activeMerchant.name);
  const [industry, setIndustry] = useState<string>(activeMerchant.industry);
  const [currencySymbol, setCurrencySymbol] = useState<string>(activeMerchant.currencySymbol);
  const [maxDiscount, setMaxDiscount] = useState<number>(policy.maxDiscountPercent);
  const [approvalThreshold, setApprovalThreshold] = useState<number>(policy.requireApprovalAboveAmount);
  const [minConfidence, setMinConfidence] = useState<number>(policy.minConfidenceForAutonomousAction);
  const [rzpKey, setRzpKey] = useState<string>(policy.razorpayKeyId);
  const [webhookSecret, setWebhookSecret] = useState<string>(policy.webhookSecret);
  const [isSaved, setIsSaved] = useState(false);

  // Sync state whenever active merchant or policy changes
  useEffect(() => {
    setStoreName(activeMerchant.name);
    setIndustry(activeMerchant.industry);
    setCurrencySymbol(activeMerchant.currencySymbol);
    setMaxDiscount(policy.maxDiscountPercent);
    setApprovalThreshold(policy.requireApprovalAboveAmount);
    setMinConfidence(policy.minConfidenceForAutonomousAction);
    setRzpKey(policy.razorpayKeyId);
    setWebhookSecret(policy.webhookSecret);
  }, [activeMerchant.id, policy]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateMerchantPolicy({
      maxDiscountPercent: maxDiscount,
      requireApprovalAboveAmount: approvalThreshold,
      minConfidenceForAutonomousAction: minConfidence,
      razorpayKeyId: rzpKey,
      webhookSecret
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '820px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: '6px' }}>
            {activeMerchant.name.toUpperCase()} CONFIGURATION
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 400, fontFamily: 'var(--font-serif)', color: '#111111', marginBottom: '4px' }}>
            Merchant Guardrails & Policies
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#666666' }}>
            Configure bounded AI execution ceilings, human-in-the-loop triggers, and Razorpay Test Mode credentials for {activeMerchant.name}.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveScreen('catalog')}
          className="btn-secondary btn-sm"
          style={{ borderRadius: '6px', padding: '8px 14px' }}
        >
          <Package size={14} />
          <span>Manage Product Catalog</span>
          <ArrowRight size={12} />
        </button>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Section 1: Store Identity */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          padding: '24px'
        }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#777777', marginBottom: '16px' }}>
            Store Profile
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#111111', display: 'block', marginBottom: '6px' }}>
                Store Name
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
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
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#111111', display: 'block', marginBottom: '6px' }}>
                Industry / Category
              </label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
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
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#111111', display: 'block', marginBottom: '6px' }}>
                Currency Symbol
              </label>
              <input
                type="text"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px solid #D6D6D6',
                  fontSize: '0.86rem',
                  outline: 'none',
                  background: '#FAFAFA',
                  color: '#111111'
                }}
              />
            </div>
          </div>
        </div>

        {/* Section 2: AI Safety & Discount Limits */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          padding: '24px'
        }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#777777', marginBottom: '18px' }}>
            Autonomous Pricing & Policy Guardrails
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Max Discount Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.84rem', fontWeight: 600, color: '#111111' }}>
                  Maximum Automated Discount Ceiling
                </label>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#111111' }}>
                  {maxDiscount}% Cap
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#111111' }}
              />
              <div style={{ fontSize: '0.74rem', color: '#777777', marginTop: '4px' }}>
                Any recommendation exceeding this discount limit will be automatically blocked or routed for merchant approval.
              </div>
            </div>

            {/* High-Value Approval Gate */}
            <div>
              <label style={{ fontSize: '0.84rem', fontWeight: 600, color: '#111111', display: 'block', marginBottom: '6px' }}>
                High-Value Action Human Approval Gate ({currencySymbol})
              </label>
              <input
                type="number"
                value={approvalThreshold}
                onChange={(e) => setApprovalThreshold(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px solid #D6D6D6',
                  fontSize: '0.86rem',
                  outline: 'none',
                  background: '#FAFAFA',
                  color: '#111111'
                }}
              />
              <div style={{ fontSize: '0.74rem', color: '#777777', marginTop: '4px' }}>
                Orders or campaign actions with basket size ≥ this amount require explicit merchant review before execution.
              </div>
            </div>

            {/* Autonomous Confidence Gate */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.84rem', fontWeight: 600, color: '#111111' }}>
                  Minimum Intent Confidence for Autonomous Action
                </label>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#111111' }}>
                  {minConfidence}%
                </span>
              </div>
              <input
                type="range"
                min="60"
                max="95"
                value={minConfidence}
                onChange={(e) => setMinConfidence(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#111111' }}
              />
              <div style={{ fontSize: '0.74rem', color: '#777777', marginTop: '4px' }}>
                Actions with confidence below this threshold are routed to the Approval Gateway.
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Razorpay Test Mode Configuration */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          padding: '24px'
        }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#777777', marginBottom: '16px' }}>
            Razorpay Test Mode API Credentials
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#111111', display: 'block', marginBottom: '4px' }}>
                Key ID (Test Sandbox)
              </label>
              <input
                type="text"
                value={rzpKey}
                onChange={(e) => setRzpKey(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px solid #D6D6D6',
                  fontSize: '0.84rem',
                  fontFamily: 'var(--font-mono)',
                  background: '#FAFAFA'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#111111', display: 'block', marginBottom: '4px' }}>
                Webhook Secret (For signature verification)
              </label>
              <input
                type="password"
                value={webhookSecret}
                onChange={(e) => setWebhookSecret(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px solid #D6D6D6',
                  fontSize: '0.84rem',
                  fontFamily: 'var(--font-mono)',
                  background: '#FAFAFA'
                }}
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px' }}>
          {isSaved && (
            <span style={{ fontSize: '0.84rem', color: '#111111', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={16} />
              Policies updated & active!
            </span>
          )}
          <button
            type="submit"
            className="btn-primary"
            style={{ padding: '10px 24px', borderRadius: '6px' }}
          >
            <Save size={15} />
            <span>Save Guardrail Policies</span>
          </button>
        </div>
      </form>
    </div>
  );
};

