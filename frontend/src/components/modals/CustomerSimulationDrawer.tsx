import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Zap,
  Bot,
  RotateCcw,
  Sparkles,
  Ban
} from 'lucide-react';
import { Opportunity } from '../../types';

export const CustomerSimulationDrawer: React.FC = () => {
  const {
    isCustomerSimulationOpen,
    closeCustomerSimulation,
    selectedSimulationOpportunity,
    simulationStageMap,
    setCustomerSimulationStage,
    approveOpportunity,
    rejectOpportunity,
    activeMerchant
  } = useApp();

  if (!isCustomerSimulationOpen || !selectedSimulationOpportunity) return null;

  const opp = selectedSimulationOpportunity;
  const isRecovery = opp.type === 'checkout_recovery' || opp.createdByAgent === 'RECOVERY';
  const requiresApproval = Boolean(
    opp.reasoning?.policyCheck?.requiresHumanApproval ||
    opp.status === 'awaiting_approval'
  );
  const isPolicyBlocked = opp.status === 'blocked_by_policy';

  // Define stages for this specific customer/opportunity
  const specialistLabel = isRecovery ? 'RECOVERY' : 'MERCHANDISING';

  const stages = [
    { key: 'SIGNAL', label: 'CUSTOMER SIGNAL', agent: 'Growth Supervisor' },
    { key: 'INTENT', label: 'INTENT', agent: 'Customer Intent Agent' },
    { key: 'SPECIALIST', label: specialistLabel, agent: isRecovery ? 'Revenue Recovery Agent' : 'Merchandising Agent' },
    { key: 'POLICY', label: 'POLICY', agent: 'Policy & Risk Agent' },
    ...(requiresApproval ? [{ key: 'APPROVAL', label: 'APPROVAL', agent: 'Merchant Approval Gate' }] : []),
    { key: 'COMMERCE', label: isPolicyBlocked ? 'BLOCKED' : 'COMMERCE', agent: 'Commerce Execution Agent' },
    { key: 'REVENUE', label: 'REVENUE RESULT', agent: 'Revenue Ledger' }
  ];

  // Retrieve existing or default stage for this opportunity
  const currentStageIndex = simulationStageMap[opp.id] ?? 0;
  const isApproved = opp.status === 'completed' || opp.status === 'executed';
  const isRejected = opp.status === 'rejected';

  // Internal approval state within simulation
  const [localApprovalDecision, setLocalApprovalDecision] = useState<'APPROVED' | 'REJECTED' | null>(
    isApproved ? 'APPROVED' : isRejected ? 'REJECTED' : null
  );

  useEffect(() => {
    if (isApproved) setLocalApprovalDecision('APPROVED');
    else if (isRejected) setLocalApprovalDecision('REJECTED');
  }, [opp.id, isApproved, isRejected]);

  const currentStage = stages[currentStageIndex] || stages[0];

  const handleNext = () => {
    // If on approval stage and not approved, block next
    if (currentStage.key === 'APPROVAL' && localApprovalDecision !== 'APPROVED') {
      return;
    }
    if (currentStageIndex < stages.length - 1) {
      setCustomerSimulationStage(opp.id, currentStageIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentStageIndex > 0) {
      setCustomerSimulationStage(opp.id, currentStageIndex - 1);
    }
  };

  const handleApprove = () => {
    setLocalApprovalDecision('APPROVED');
    approveOpportunity(opp.id);
  };

  const handleReject = () => {
    setLocalApprovalDecision('REJECTED');
    rejectOpportunity(opp.id);
  };

  const handleReset = () => {
    setCustomerSimulationStage(opp.id, 0);
    setLocalApprovalDecision(isApproved ? 'APPROVED' : isRejected ? 'REJECTED' : null);
  };

  // Helper to render stage narrative
  const renderStageNarrative = () => {
    switch (currentStage.key) {
      case 'SIGNAL':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#777777' }}>
              Supervisor Agent Ingest
            </div>
            <div style={{ fontSize: '0.92rem', color: '#111111', lineHeight: 1.5, fontWeight: 500 }}>
              {opp.reasoning?.observation || opp.customerBehavior}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#666666', background: '#FFFFFF', padding: '10px 14px', borderRadius: '6px', border: '1px solid #EBEBEB' }}>
              <strong>Signal Ingestion:</strong> Ingested real-time session event for <strong>{opp.customerName}</strong>. Routing session context to Customer Intent Agent.
            </div>
          </div>
        );

      case 'INTENT':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#777777' }}>
                Customer Intent Diagnosis
              </span>
              <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#111111', background: '#EAEAEA', padding: '2px 8px', borderRadius: '4px' }}>
                {opp.confidence}% CONFIDENCE
              </span>
            </div>
            <div style={{ fontSize: '0.92rem', color: '#111111', lineHeight: 1.5, fontWeight: 500 }}>
              {opp.reasoning?.signal || `High purchase intent detected (${opp.confidence}%) with specific category affinity.`}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#666666', background: '#FFFFFF', padding: '10px 14px', borderRadius: '6px', border: '1px solid #EBEBEB' }}>
              <strong>Behavioral Pattern:</strong> {opp.customerBehavior}
            </div>
          </div>
        );

      case 'SPECIALIST':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#777777' }}>
                {isRecovery ? 'Recovery Action Synthesis' : 'Merchandising Recommendation'}
              </span>
              <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#111111' }}>
                +{activeMerchant.currencySymbol}{opp.expectedRevenue.toLocaleString('en-IN')}
              </span>
            </div>
            <div style={{ fontSize: '0.92rem', color: '#111111', lineHeight: 1.5, fontWeight: 600 }}>
              {opp.reasoning?.action || opp.aiRecommendation}
            </div>
            {opp.recommendedItem && (
              <div style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', padding: '10px 14px', borderRadius: '6px', fontSize: '0.82rem' }}>
                <span style={{ color: '#777777' }}>Recommended Add-on:</span> <strong style={{ color: '#111111' }}>{opp.recommendedItem.name}</strong> (₹{opp.recommendedItem.price.toLocaleString('en-IN')})
              </div>
            )}
            <div style={{ fontSize: '0.78rem', color: '#666666' }}>
              <strong>Impact Model:</strong> {opp.reasoning?.expectedImpact || `+₹${opp.expectedRevenue} net revenue uplift.`}
            </div>
          </div>
        );

      case 'POLICY':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#777777' }}>
                Policy Guardrail Evaluation
              </span>
              <span style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                color: isPolicyBlocked ? '#888888' : '#111111',
                background: '#EAEAEA',
                padding: '2px 8px',
                borderRadius: '4px'
              }}>
                {isPolicyBlocked ? 'POLICY BLOCKED' : opp.reasoning?.policyCheck?.passed ? '✓ PASSED POLICY' : 'REVIEW REQUIRED'}
              </span>
            </div>
            <div style={{ fontSize: '0.88rem', color: '#111111', lineHeight: 1.5 }}>
              {opp.reasoning?.policyCheck?.details || 'Discount limits and gross margin thresholds evaluated against merchant policy.'}
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '8px',
              background: '#FFFFFF',
              border: '1px solid #E5E5E5',
              padding: '8px 10px',
              borderRadius: '6px',
              fontSize: '0.74rem'
            }}>
              <div>
                <span style={{ color: '#888888', display: 'block' }}>Discount Cap</span>
                <strong style={{ color: '#111111' }}>{opp.reasoning?.policyCheck?.maxDiscountAllowed || activeMerchant.policy.maxDiscountPercent}% Max</strong>
              </div>
              <div>
                <span style={{ color: '#888888', display: 'block' }}>Applied Discount</span>
                <strong style={{ color: '#111111' }}>{opp.reasoning?.policyCheck?.appliedDiscount || 0}%</strong>
              </div>
              <div>
                <span style={{ color: '#888888', display: 'block' }}>Risk Rating</span>
                <strong style={{ color: '#111111' }}>{opp.reasoning?.policyCheck?.riskScore || 'LOW'}</strong>
              </div>
            </div>
          </div>
        );

      case 'APPROVAL':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={15} color="#111111" />
              <span style={{ fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#111111' }}>
                MERCHANT APPROVAL REQUIRED
              </span>
            </div>

            <div style={{ fontSize: '0.88rem', color: '#222222', lineHeight: 1.5 }}>
              High-value action for <strong>{opp.customerName}</strong> requires explicit merchant sign-off before executing in Razorpay Test Mode.
            </div>

            {localApprovalDecision === 'APPROVED' ? (
              <div style={{
                background: '#FFFFFF',
                border: '1.5px solid #111111',
                padding: '12px 14px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.84rem',
                fontWeight: 700,
                color: '#111111'
              }}>
                <CheckCircle2 size={16} />
                <span>Approved by Merchant. Click "Next" to execute Commerce stage.</span>
              </div>
            ) : localApprovalDecision === 'REJECTED' ? (
              <div style={{
                background: '#FAFAFA',
                border: '1px solid #D0D0D0',
                padding: '12px 14px',
                borderRadius: '6px',
                fontSize: '0.84rem',
                color: '#666666',
                fontWeight: 600
              }}>
                Action Rejected by Merchant. Commerce execution halted.
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button
                  onClick={handleApprove}
                  className="btn-primary btn-sm"
                  style={{ borderRadius: '6px', padding: '8px 16px', fontSize: '0.8rem' }}
                >
                  <Check size={13} />
                  <span>Approve Action</span>
                </button>
                <button
                  onClick={handleReject}
                  className="btn-secondary btn-sm"
                  style={{ borderRadius: '6px', padding: '8px 16px', fontSize: '0.8rem' }}
                >
                  <X size={13} />
                  <span>Reject</span>
                </button>
              </div>
            )}
          </div>
        );

      case 'COMMERCE':
        if (isPolicyBlocked) {
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#777777' }}>
                Execution Bypassed
              </div>
              <div style={{ fontSize: '0.9rem', color: '#111111', lineHeight: 1.5, fontWeight: 600 }}>
                Commerce execution blocked by Policy Agent gatekeeper.
              </div>
              <div style={{ fontSize: '0.82rem', color: '#666666' }}>
                No order created or dispatched. Merchant margin protected.
              </div>
            </div>
          );
        }

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#777777' }}>
              Commerce Execution Agent
            </div>
            <div style={{ fontSize: '0.9rem', color: '#111111', lineHeight: 1.5, fontWeight: 600 }}>
              Executing approved commerce action in Razorpay Test Mode.
            </div>

            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E5E5E5',
              borderRadius: '6px',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              fontSize: '0.8rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#777777' }}>Order Reference:</span>
                <code style={{ color: '#111111', fontWeight: 700 }}>order_test_{opp.id.slice(-6)}</code>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#777777' }}>Target Customer:</span>
                <span style={{ color: '#111111', fontWeight: 600 }}>{opp.customerName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#777777' }}>Environment:</span>
                <span style={{ color: '#111111', fontWeight: 600 }}>Razorpay Sandbox (Test Mode)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#111111', fontWeight: 700, marginTop: '4px', paddingTop: '6px', borderTop: '1px solid #F0F0F0' }}>
                <CheckCircle2 size={13} />
                <span>✓ Executed in Razorpay Test Mode</span>
              </div>
            </div>
          </div>
        );

      case 'REVENUE':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#777777' }}>
              Revenue Attribution Result
            </div>

            <div style={{
              background: '#FFFFFF',
              border: '1.5px solid #111111',
              borderRadius: '8px',
              padding: '18px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#777777', textTransform: 'uppercase', fontWeight: 700 }}>
                  AI-Attributed Revenue
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111111', marginTop: '2px' }}>
                  {isPolicyBlocked || localApprovalDecision === 'REJECTED'
                    ? '₹0'
                    : `+${activeMerchant.currencySymbol}${opp.expectedRevenue.toLocaleString('en-IN')}`}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  color: '#111111',
                  background: '#F0F0F0',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <CheckCircle2 size={12} />
                  <span>Simulation Completed</span>
                </span>
              </div>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#666666', lineHeight: 1.4 }}>
              The multi-agent workflow for <strong>{opp.customerName}</strong> successfully completed all 6 stages. Click "Reset" to replay this scenario or "Close" to return to the Opportunities table.
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isAtLastStage = currentStageIndex === stages.length - 1;
  const isBlockedAtApproval = currentStage.key === 'APPROVAL' && localApprovalDecision !== 'APPROVED';

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.45)',
      zIndex: 95,
      display: 'flex',
      justifyContent: 'flex-end',
      animation: 'fadeIn 0.15s ease-out'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '560px',
        height: '100vh',
        background: '#FFFFFF',
        borderLeft: '1px solid var(--border-subtle)',
        boxShadow: '-4px 0 30px rgba(0, 0, 0, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflowY: 'auto',
        padding: '32px'
      }}>
        <div>
          {/* 1. Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#777777' }}>
                Manual Opportunity Simulation
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111111', marginTop: '2px' }}>
                {opp.customerName}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#555555', marginTop: '2px' }}>
                {opp.title}
              </div>
            </div>

            <button
              onClick={closeCustomerSimulation}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888888', padding: '4px' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* 2. Metadata Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '8px',
            background: '#FAFAFA',
            border: '1px solid #EBEBEB',
            borderRadius: '8px',
            padding: '12px 14px',
            marginBottom: '22px'
          }}>
            <div>
              <span style={{ fontSize: '0.68rem', color: '#777777', textTransform: 'uppercase' }}>Expected Impact</span>
              <strong style={{ fontSize: '0.94rem', color: '#111111', display: 'block', marginTop: '1px' }}>
                +{activeMerchant.currencySymbol}{opp.expectedRevenue.toLocaleString('en-IN')}
              </strong>
            </div>

            <div>
              <span style={{ fontSize: '0.68rem', color: '#777777', textTransform: 'uppercase' }}>Confidence</span>
              <strong style={{ fontSize: '0.94rem', color: '#111111', display: 'block', marginTop: '1px' }}>
                {opp.confidence}%
              </strong>
            </div>

            <div>
              <span style={{ fontSize: '0.68rem', color: '#777777', textTransform: 'uppercase' }}>Acting Agent</span>
              <strong style={{ fontSize: '0.82rem', color: '#111111', display: 'block', marginTop: '3px' }}>
                {opp.createdByAgent === 'RECOVERY' ? 'Recovery' : 'Merchandising'}
              </strong>
            </div>
          </div>

          {/* 3. Horizontal Stage Progression Visualizer */}
          <div style={{ marginBottom: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#777777' }}>
                Agent Collaboration Sequence
              </span>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#111111' }}>
                Step {currentStageIndex + 1} of {stages.length}
              </span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              overflowX: 'auto',
              paddingBottom: '4px'
            }}>
              {stages.map((stg, idx) => {
                const isActive = currentStageIndex === idx;
                const isPast = currentStageIndex > idx;

                let bg = '#FFFFFF';
                let text = '#888888';
                let border = '#E5E5E5';

                if (isActive) {
                  bg = '#111111';
                  text = '#FFFFFF';
                  border = '#111111';
                } else if (isPast) {
                  bg = '#FFFFFF';
                  text = '#111111';
                  border = '#D0D0D0';
                }

                return (
                  <React.Fragment key={stg.key}>
                    <div
                      onClick={() => setCustomerSimulationStage(opp.id, idx)}
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: isActive || isPast ? 700 : 500,
                        color: text,
                        background: bg,
                        border: `1px solid ${border}`,
                        borderRadius: '4px',
                        padding: '5px 8px',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {isPast && <Check size={10} strokeWidth={2.5} color="#111111" />}
                      <span>{stg.label}</span>
                    </div>

                    {idx < stages.length - 1 && (
                      <span style={{ color: isPast ? '#111111' : '#D0D0D0', fontSize: '0.75rem', fontWeight: 700 }}>
                        →
                      </span>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* 4. Active Stage Narrative Container */}
          <div style={{
            background: '#FAFAFA',
            border: '1px solid #E5E5E5',
            borderRadius: '8px',
            padding: '20px',
            minHeight: '200px'
          }}>
            {renderStageNarrative()}
          </div>
        </div>

        {/* 5. Bottom Navigation Controls (Next / Back) */}
        <div style={{
          paddingTop: '20px',
          borderTop: '1px solid #F0F0F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px'
        }}>
          <button
            onClick={handleBack}
            disabled={currentStageIndex === 0}
            className="btn-secondary btn-sm"
            style={{
              borderRadius: '6px',
              padding: '9px 16px',
              opacity: currentStageIndex === 0 ? 0.4 : 1,
              cursor: currentStageIndex === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            <ChevronLeft size={14} />
            <span>Back</span>
          </button>

          <div style={{ fontSize: '0.78rem', color: '#666666', textAlign: 'center' }}>
            <strong style={{ color: '#111111' }}>{currentStage.label}</strong> ({currentStageIndex + 1}/{stages.length})
          </div>

          {isAtLastStage ? (
            <button
              onClick={handleReset}
              className="btn-secondary btn-sm"
              style={{ borderRadius: '6px', padding: '9px 16px' }}
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={isBlockedAtApproval}
              className="btn-primary btn-sm"
              style={{
                borderRadius: '6px',
                padding: '9px 16px',
                opacity: isBlockedAtApproval ? 0.4 : 1,
                cursor: isBlockedAtApproval ? 'not-allowed' : 'pointer'
              }}
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
