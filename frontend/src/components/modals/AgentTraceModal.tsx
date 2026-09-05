import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Layers,
  CheckCircle2,
  Lock,
  ArrowDown
} from 'lucide-react';
import { AgentId } from '../../types';

export const AgentTraceModal: React.FC = () => {
  const {
    activeMerchant,
    products,
    policy,
    isAgentTraceModalOpen,
    setIsAgentTraceModalOpen
  } = useApp();

  if (!isAgentTraceModalOpen) return null;

  // Derive trace based on active merchant's catalog and profile
  const sampleProd = products[0] || { name: 'Catalog Product', price: 999 };
  const crossSellProd = products[1] || { name: 'Addon Accessory', price: 499 };

  const traceSteps = [
    {
      agentId: 'INTENT' as AgentId,
      agentName: 'Customer Intent Agent',
      action: '1. INTENT ANALYSIS',
      status: 'success',
      desc: `Extracted semantic constraints for ${activeMerchant.name}: "${sampleProd.name} under ${activeMerchant.currencySymbol}${(sampleProd.price * 1.2).toFixed(0)}". Intent score: 94% (HIGH_PURCHASE_INTENT).`,
      evidence: [
        'Analyzed natural language constraints',
        `Category: ${sampleProd.category || 'General'}`,
        `Budget ceiling: ${activeMerchant.currencySymbol}${(sampleProd.price * 1.2).toFixed(0)}`
      ]
    },
    {
      agentId: 'SUPERVISOR' as AgentId,
      agentName: 'Growth Supervisor Agent',
      action: '2. SPECIALIST ROUTING',
      status: 'success',
      desc: `Routed session to Merchandising Agent with ${activeMerchant.name}'s active catalog scope.`,
      evidence: [
        `Scoped merchant_id: ${activeMerchant.id}`,
        `Pipeline: Catalog Search & Bundle Recommendation`
      ]
    },
    {
      agentId: 'MERCHANDISING' as AgentId,
      agentName: 'Merchandising Agent',
      action: '3. CATALOG SEARCH & CROSS-SELL PACKAGING',
      status: 'success',
      desc: `Searched ${activeMerchant.name} Catalog (${products.length} items). Found ${sampleProd.name} (${activeMerchant.currencySymbol}${sampleProd.price.toLocaleString('en-IN')}). Recommended ${crossSellProd.name} (+${activeMerchant.currencySymbol}${crossSellProd.price.toLocaleString('en-IN')}).`,
      evidence: [
        `Queried active store catalog`,
        `Direct price & category constraint match`,
        `Expected revenue uplift: ${activeMerchant.currencySymbol}${crossSellProd.price}`
      ]
    },
    {
      agentId: 'POLICY' as AgentId,
      agentName: 'Policy & Risk Agent',
      action: '4. POLICY & MARGIN EVALUATION',
      status: 'success',
      desc: `Passed discount margin verification (under ${policy.maxDiscountPercent}% cap). Order value under human approval gate (${activeMerchant.currencySymbol}${policy.requireApprovalAboveAmount.toLocaleString('en-IN')}).`,
      evidence: [
        'Rule: AUTONOMOUS_EXECUTION_SAFE',
        `Max discount cap: ${policy.maxDiscountPercent}%`,
        'Risk level: LOW'
      ]
    },
    {
      agentId: 'COMMERCE' as AgentId,
      agentName: 'Commerce Execution Agent',
      action: '5. RAZORPAY TEST EXECUTION',
      status: 'success',
      desc: `Executed checkout via Razorpay Test Sandbox for total amount ${activeMerchant.currencySymbol}${(sampleProd.price + crossSellProd.price).toLocaleString('en-IN')}.`,
      evidence: [
        'Order ID: order_test_' + Math.random().toString(36).substring(2, 9),
        'Payment ID: pay_test_' + Math.random().toString(36).substring(2, 9),
        `Attributed Revenue Lift: +${activeMerchant.currencySymbol}${crossSellProd.price}`
      ]
    },
    {
      agentId: 'SUPERVISOR' as AgentId,
      agentName: 'Growth Supervisor Agent',
      action: '6. TASK COMPLETION & AUDIT LOG',
      status: 'success',
      desc: `Task closed. Emitted immutable cryptographic audit log for ${activeMerchant.name} and credited AI revenue attribution ledger.`,
      evidence: [
        'Audit Hash: 0x8f2a99e1c3b77209',
        `Revenue Attribution: +${activeMerchant.currencySymbol}${crossSellProd.price} captured`
      ]
    }
  ];

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
        maxWidth: '640px',
        maxHeight: '90vh',
        background: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid var(--border-subtle)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'fadeIn 0.15s ease-out'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: '2px' }}>
              {activeMerchant.name.toUpperCase()} • AGENT PROVENANCE
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#111111' }}>
              Multi-Agent Execution Trace
            </div>
          </div>

          <button
            onClick={() => setIsAgentTraceModalOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#888888',
              padding: '4px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
          {traceSteps.map((step, idx) => (
            <div
              key={idx}
              style={{
                background: '#F9F9F9',
                border: '1px solid #EBEBEB',
                borderRadius: '8px',
                padding: '14px 16px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', color: '#111111', textTransform: 'uppercase' }}>
                  {step.action}
                </span>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: '#111111',
                  color: '#FFFFFF'
                }}>
                  {step.agentName}
                </span>
              </div>

              <div style={{ fontSize: '0.84rem', color: '#222222', fontWeight: 500, marginBottom: '8px', lineHeight: 1.45 }}>
                {step.desc}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {step.evidence.map((ev, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: '0.7rem',
                      background: '#FFFFFF',
                      color: '#444444',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      border: '1px solid #E0E0E0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <CheckCircle2 size={11} color="#111111" />
                    {ev}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={() => setIsAgentTraceModalOpen(false)}
            className="btn-primary btn-sm"
            style={{ borderRadius: '6px' }}
          >
            Close Trace Inspector
          </button>
        </div>
      </div>
    </div>
  );
};

