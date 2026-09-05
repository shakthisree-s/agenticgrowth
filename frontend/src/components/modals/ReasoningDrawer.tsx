import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
  Lock,
  CreditCard
} from 'lucide-react';

export const ReasoningDrawer: React.FC = () => {
  const {
    isReasoningDrawerOpen,
    setIsReasoningDrawerOpen,
    selectedOpportunity,
    approveOpportunity,
    rejectOpportunity,
    activeMerchant
  } = useApp();

  if (!isReasoningDrawerOpen || !selectedOpportunity) return null;

  const rawReasoning = selectedOpportunity.reasoning;
  const policyCheck = rawReasoning?.policyCheck || {
    passed: true,
    ruleName: 'Merchant Autonomous Threshold',
    details: 'Approved within autonomous discount threshold.',
    maxDiscountAllowed: 15,
    appliedDiscount: 10,
    riskScore: 'LOW'
  };

  const reasoning = {
    observation: rawReasoning?.observation || `Customer interaction for ${selectedOpportunity.customerName}.`,
    signal: rawReasoning?.signal || selectedOpportunity.customerBehavior || 'High purchase intent',
    productRelationship: rawReasoning?.productRelationship || 'Catalog bundle affinity',
    action: rawReasoning?.action || selectedOpportunity.aiRecommendation || 'Cross-sell recommendation',
    expectedImpact: rawReasoning?.expectedImpact || `+${activeMerchant.currencySymbol}${selectedOpportunity.expectedRevenue.toLocaleString('en-IN')}`,
    policyCheck,
    toolUsed: rawReasoning?.toolUsed || 'CommerceExecutionAgent'
  };

  const isCompleted = selectedOpportunity.status === 'completed' || selectedOpportunity.status === 'executed';
  const isRejected = selectedOpportunity.status === 'rejected';

  const handleApprove = () => {
    approveOpportunity(selectedOpportunity.id);
  };

  const handleReject = () => {
    rejectOpportunity(selectedOpportunity.id);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.45)',
      zIndex: 90,
      display: 'flex',
      justifyContent: 'flex-end',
      animation: 'fadeIn 0.15s ease-out'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '540px',
        height: '100vh',
        background: '#FFFFFF',
        borderLeft: '1px solid var(--border-subtle)',
        boxShadow: '-4px 0 30px rgba(0, 0, 0, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflowY: 'auto',
        padding: '36px'
      }}>
        <div>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#777777' }}>
                Multi-Agent Reasoning & Decision Flow
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111111', marginTop: '2px' }}>
                {selectedOpportunity.customerName}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#666666', marginTop: '2px' }}>
                {selectedOpportunity.title}
              </div>
            </div>

            <button
              onClick={() => setIsReasoningDrawerOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888888', padding: '4px' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Workflow Sequence Breadcrumb */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.68rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: '#777777',
            background: '#F8F8F8',
            border: '1px solid #EAEAEA',
            padding: '8px 12px',
            borderRadius: '6px',
            marginBottom: '20px',
            overflowX: 'auto'
          }}>
            <span>Intent</span>
            <span>→</span>
            <span>{selectedOpportunity.createdByAgent}</span>
            <span>→</span>
            <span>Policy</span>
            <span>→</span>
            <span style={{ color: '#111111' }}>Approval</span>
            <span>→</span>
            <span>Commerce (Razorpay)</span>
          </div>

          {/* Structured Explainability Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* 1. OBSERVATION & SIGNAL */}
            <div style={{ background: '#FAFAFA', border: '1px solid #E8E8E8', borderRadius: '8px', padding: '16px' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#777777', marginBottom: '6px' }}>
                1. Observation & Customer Signal
              </div>
              <div style={{ fontSize: '0.86rem', color: '#111111', lineHeight: 1.5, marginBottom: '6px' }}>
                {reasoning.observation}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#555555', fontStyle: 'italic' }}>
                Signal: {reasoning.signal}
              </div>
            </div>

            {/* 2. RECOMMENDATION & EXPECTED IMPACT */}
            <div style={{ background: '#FAFAFA', border: '1px solid #E8E8E8', borderRadius: '8px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#777777' }}>
                  2. AI Recommendation
                </div>
                <div style={{ fontSize: '0.94rem', fontWeight: 700, color: '#111111' }}>
                  +{activeMerchant.currencySymbol}{selectedOpportunity.expectedRevenue.toLocaleString('en-IN')}
                </div>
              </div>
              <div style={{ fontSize: '0.86rem', color: '#111111', lineHeight: 1.5, fontWeight: 600 }}>
                {reasoning.action}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#666666', marginTop: '6px' }}>
                Impact: {reasoning.expectedImpact}
              </div>
            </div>

            {/* 3. POLICY CHECK (Distinct from Approval) */}
            <div style={{ background: '#FAFAFA', border: '1px solid #E8E8E8', borderRadius: '8px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#777777' }}>
                  3. Policy Guardrail Evaluation
                </div>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: '#111111',
                  background: '#EAEAEA',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  border: '1px solid #DDDDDD'
                }}>
                  {reasoning.policyCheck.passed ? '✓ PASSED POLICY' : 'FLAGGED'}
                </span>
              </div>

              <div style={{ fontSize: '0.82rem', color: '#333333', lineHeight: 1.5, marginBottom: '8px' }}>
                {reasoning.policyCheck.details}
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '8px',
                background: '#FFFFFF',
                border: '1px solid #E5E5E5',
                padding: '8px 10px',
                borderRadius: '6px',
                fontSize: '0.72rem'
              }}>
                <div>
                  <span style={{ color: '#888888', display: 'block' }}>Discount Cap</span>
                  <strong style={{ color: '#111111' }}>{reasoning.policyCheck.maxDiscountAllowed}% Max</strong>
                </div>
                <div>
                  <span style={{ color: '#888888', display: 'block' }}>Applied Discount</span>
                  <strong style={{ color: '#111111' }}>{reasoning.policyCheck.appliedDiscount}%</strong>
                </div>
                <div>
                  <span style={{ color: '#888888', display: 'block' }}>Risk Level</span>
                  <strong style={{ color: '#111111' }}>{reasoning.policyCheck.riskScore}</strong>
                </div>
              </div>
            </div>

            {/* 4. MERCHANT DECISION & COMMERCE EXECUTION */}
            <div style={{ background: '#FAFAFA', border: '1px solid #E8E8E8', borderRadius: '8px', padding: '16px' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#777777', marginBottom: '8px' }}>
                4. Merchant Decision & Commerce Execution
              </div>

              {isCompleted ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: '#111111'
                  }}>
                    <CheckCircle2 size={15} />
                    <span>Approved & Executed in Razorpay Test Mode</span>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#666666' }}>
                    Transaction ID: <code>{selectedOpportunity.transactionId || 'TX_TEST_CONFIRMED'}</code>
                  </div>
                  {selectedOpportunity.executedAt && (
                    <div style={{ fontSize: '0.72rem', color: '#888888' }}>
                      Timestamp: {new Date(selectedOpportunity.executedAt).toLocaleString()}
                    </div>
                  )}
                </div>
              ) : isRejected ? (
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#888888' }}>
                  Declined during merchant review. Action was not dispatched.
                </div>
              ) : (
                <div style={{ fontSize: '0.82rem', color: '#444444', lineHeight: 1.4 }}>
                  Awaiting merchant sign-off. Clicking <strong>Approve</strong> immediately executes the commerce order in Razorpay Test Mode and marks the opportunity as completed.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div style={{
          paddingTop: '20px',
          borderTop: '1px solid #F0F0F0',
          display: 'flex',
          gap: '10px'
        }}>
          {!isCompleted && !isRejected ? (
            <>
              <button
                onClick={handleApprove}
                className="btn-primary"
                style={{ flex: 2, borderRadius: '6px', padding: '10px 16px', fontSize: '0.84rem' }}
              >
                <span>Approve & Execute</span>
                <ArrowRight size={13} />
              </button>

              <button
                onClick={handleReject}
                className="btn-secondary"
                style={{ flex: 1, borderRadius: '6px', padding: '10px 14px', fontSize: '0.84rem' }}
              >
                <span>Reject</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsReasoningDrawerOpen(false)}
              className="btn-secondary"
              style={{ width: '100%', borderRadius: '6px', padding: '9px', fontSize: '0.82rem' }}
            >
              <span>Close Record</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
