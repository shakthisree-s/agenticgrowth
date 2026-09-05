import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Play,
  RefreshCw,
  ArrowRight,
  Check,
  CheckCircle2,
  AlertCircle,
  Terminal,
  ShieldCheck,
  Zap,
  Clock,
  Ban
} from 'lucide-react';
import { AgentId } from '../../types';

interface SimulationEvent {
  id: string;
  time: string;
  agent: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'blocked';
}

interface CustomerScenario {
  id: string;
  customerName: string;
  type: 'BASKET_GROWTH' | 'CHECKOUT_RECOVERY' | 'UPSELL' | 'POLICY_BLOCK' | 'CROSS_SELL';
  specialistType: 'MERCHANDISING' | 'RECOVERY';
  specialistLabel: 'MERCHANDISING' | 'RECOVERY';
  signal: string;
  intent: string;
  specialistAction: string;
  policyCheck: string;
  requiresApproval: boolean;
  isBlocked: boolean;
  commerceAction: string;
  resultSuccess: string;
  resultRejected?: string;
  resultBlocked?: string;
  potentialRevenue: number;
  attributedRevenue: number;
  opportunityTitle: string;
}

export const SimulationModal: React.FC = () => {
  const {
    isSimulationModalOpen,
    setIsSimulationModalOpen,
    setActiveScreen,
    activeMerchant,
    policy,
    opportunities
  } = useApp();

  // Scenarios configured with deterministic application customer data
  const scenarios: CustomerScenario[] = [
    {
      id: 'scen_01',
      customerName: 'Aarav Mehta',
      type: 'BASKET_GROWTH',
      specialistType: 'MERCHANDISING',
      specialistLabel: 'MERCHANDISING',
      signal: 'Viewed Velocity Runner X 4 times and added it to cart.',
      intent: 'Customer Intent Agent detected high purchase intent — 94% confidence.',
      specialistAction: 'Merchandising Agent recommends complementary Pro Dynamic Running Socks (+₹799).',
      policyCheck: `Policy & Risk Agent checked discount and margin limits: Policy passed (10% ≤ ${policy.maxDiscountPercent}% cap).`,
      requiresApproval: false,
      isBlocked: false,
      commerceAction: 'Commerce Agent prepared 1-click Razorpay Test Mode checkout order.',
      resultSuccess: '+₹799 AI-attributed revenue',
      potentialRevenue: 1299,
      attributedRevenue: 799,
      opportunityTitle: 'Sports Socks Bundle Recommendation'
    },
    {
      id: 'scen_02',
      customerName: 'Priya Sharma',
      type: 'CHECKOUT_RECOVERY',
      specialistType: 'RECOVERY',
      specialistLabel: 'RECOVERY',
      signal: 'Abandoned ₹4,890 checkout session at payment method selection.',
      intent: 'Customer Intent Agent diagnosed exit trigger: high purchase intent with cart drop-off (91%).',
      specialistAction: 'Revenue Recovery Agent prepared 1-click smart recovery payment link with 5% incentive.',
      policyCheck: `Policy & Risk Agent verified recovery action: Merchant approval required (order amount > ₹${policy.requireApprovalAboveAmount}).`,
      requiresApproval: true,
      isBlocked: false,
      commerceAction: 'Commerce Agent dispatched approved Razorpay Test Mode smart payment recovery link.',
      resultSuccess: '₹4,890 recovered in Razorpay Test Mode',
      resultRejected: 'Recovery action rejected by merchant — ₹0 recovered',
      potentialRevenue: 4890,
      attributedRevenue: 4890,
      opportunityTitle: 'Abandoned Checkout Recovery'
    },
    {
      id: 'scen_03',
      customerName: 'Ananya Iyer',
      type: 'UPSELL',
      specialistType: 'MERCHANDISING',
      specialistLabel: 'MERCHANDISING',
      signal: 'Viewed marathon carbon-plate footwear specifications 6 times across 3 sessions.',
      intent: 'Customer Intent Agent detected performance runner profile with high upsell readiness (92%).',
      specialistAction: 'Merchandising Agent recommends AeroFlex Marathon Ultra (+₹1,499 upsell delta).',
      policyCheck: `Policy & Risk Agent checked price delta rules: Policy passed (within autonomous tolerance).`,
      requiresApproval: false,
      isBlocked: false,
      commerceAction: 'Commerce Agent prepared Razorpay Test Mode 1-click upgrade option.',
      resultSuccess: '+₹1,499 AI-attributed revenue',
      potentialRevenue: 1499,
      attributedRevenue: 1499,
      opportunityTitle: 'VIP Racing Footwear Upsell'
    },
    {
      id: 'scen_04',
      customerName: 'Vikram Sengupta',
      type: 'POLICY_BLOCK',
      specialistType: 'MERCHANDISING',
      specialistLabel: 'MERCHANDISING',
      signal: 'Applied promotional voucher requesting 25% discount on running accessories.',
      intent: 'Customer Intent Agent analyzed price sensitivity and accessory interest (88%).',
      specialistAction: 'Merchandising Agent generated accessory bundle recommendation with requested 25% discount.',
      policyCheck: `Policy & Risk Agent evaluated margin rules: Policy Blocked — Discount (25%) exceeds merchant ceiling (${policy.maxDiscountPercent}%).`,
      requiresApproval: false,
      isBlocked: true,
      commerceAction: 'Commerce execution blocked by Policy Agent gatekeeper.',
      resultSuccess: 'Action blocked by merchant policy — ₹0 executed (Margin protected)',
      resultBlocked: 'Action blocked by merchant policy — ₹0 executed (Margin protected)',
      potentialRevenue: 699,
      attributedRevenue: 0,
      opportunityTitle: 'Discount Safety Guard'
    },
    {
      id: 'scen_05',
      customerName: 'Rahul Verma',
      type: 'CROSS_SELL',
      specialistType: 'MERCHANDISING',
      specialistLabel: 'MERCHANDISING',
      signal: 'Added primary item to cart and browsing catalog protection gear.',
      intent: 'Customer Intent Agent detected accessory add-on affinity (88% confidence).',
      specialistAction: 'Merchandising Agent recommends high-affinity protection accessory (+₹799).',
      policyCheck: `Policy & Risk Agent verified safe margin limits: Policy passed (0% discount needed).`,
      requiresApproval: false,
      isBlocked: false,
      commerceAction: 'Commerce Agent executed Razorpay Test Mode checkout bundle.',
      resultSuccess: '+₹799 AI-attributed revenue',
      potentialRevenue: 799,
      attributedRevenue: 799,
      opportunityTitle: 'Accessory Protection Cross-Sell'
    }
  ];

  // State
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [currentCustomerIndex, setCurrentCustomerIndex] = useState<number>(0);
  const [activeStageIndex, setActiveStageIndex] = useState<number>(0);
  const [isAwaitingApproval, setIsAwaitingApproval] = useState<boolean>(false);
  const [approvalDecision, setApprovalDecision] = useState<'APPROVED' | 'REJECTED' | null>(null);

  // Results tracker
  const [analyzedCount, setAnalyzedCount] = useState<number>(0);
  const [approvedCount, setApprovedCount] = useState<number>(0);
  const [blockedCount, setBlockedCount] = useState<number>(0);
  const [totalPotentialRevenue, setTotalPotentialRevenue] = useState<number>(0);
  const [totalCapturedRevenue, setTotalCapturedRevenue] = useState<number>(0);

  const [liveEvents, setLiveEvents] = useState<SimulationEvent[]>([]);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentScenario = scenarios[currentCustomerIndex] || scenarios[0];

  const addEvent = (agent: string, message: string, type: 'info' | 'success' | 'warning' | 'blocked' = 'info') => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLiveEvents(prev => [
      { id: `sim_evt_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`, time, agent, message, type },
      ...prev.slice(0, 4) // keep latest 5 events
    ]);
  };

  const clearExistingTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => clearExistingTimer();
  }, []);

  // Initialize and automatically start when modal opens if not already running or completed
  useEffect(() => {
    if (isSimulationModalOpen && !isRunning && !isCompleted && liveEvents.length === 0) {
      startSimulation();
    }
  }, [isSimulationModalOpen]);

  // Start / Restart Simulation
  const startSimulation = () => {
    clearExistingTimer();
    setIsRunning(true);
    setIsCompleted(false);
    setCurrentCustomerIndex(0);
    setActiveStageIndex(0);
    setIsAwaitingApproval(false);
    setApprovalDecision(null);

    setAnalyzedCount(0);
    setApprovedCount(0);
    setBlockedCount(0);
    setTotalPotentialRevenue(0);
    setTotalCapturedRevenue(0);

    const initialTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLiveEvents([
      {
        id: 'init_sim',
        time: initialTime,
        agent: 'Growth Supervisor',
        message: `Initiated autonomous discovery simulation across ${activeMerchant.name} customer base.`,
        type: 'info'
      }
    ]);

    runCustomerStage(0, 0);
  };

  // Progression state machine for a customer's stages
  const runCustomerStage = (customerIdx: number, stageIdx: number) => {
    if (customerIdx >= scenarios.length) {
      // All customers completed
      finishSimulation();
      return;
    }

    const scen = scenarios[customerIdx];
    setCurrentCustomerIndex(customerIdx);
    setActiveStageIndex(stageIdx);

    // Timings per stage:
    // Stage 0 (CUSTOMER SIGNAL): 800ms
    // Stage 1 (INTENT): 1200ms
    // Stage 2 (MERCHANDISING / RECOVERY): 1200ms
    // Stage 3 (POLICY): 1200ms
    // Stage 4 (COMMERCE): 1200ms
    // Stage 5 (RESULT): 1000ms

    if (stageIdx === 0) {
      // 0: CUSTOMER SIGNAL
      addEvent('Growth Supervisor', `Customer Signal → Ingested active session for ${scen.customerName}`);
      timerRef.current = setTimeout(() => {
        runCustomerStage(customerIdx, 1);
      }, 800);
    } else if (stageIdx === 1) {
      // 1: INTENT
      addEvent('Intent Agent', scen.intent);
      timerRef.current = setTimeout(() => {
        runCustomerStage(customerIdx, 2);
      }, 1200);
    } else if (stageIdx === 2) {
      // 2: MERCHANDISING / RECOVERY
      addEvent(
        scen.specialistType === 'RECOVERY' ? 'Recovery Agent' : 'Merchandising Agent',
        scen.specialistAction
      );
      timerRef.current = setTimeout(() => {
        runCustomerStage(customerIdx, 3);
      }, 1200);
    } else if (stageIdx === 3) {
      // 3: POLICY
      addEvent('Policy Agent', scen.policyCheck, scen.isBlocked ? 'blocked' : 'info');

      if (scen.requiresApproval) {
        // Pause for merchant approval
        setIsAwaitingApproval(true);
        addEvent('Growth Supervisor', `Workflow paused: Merchant approval required for ${scen.customerName}`, 'warning');
        return;
      }

      if (scen.isBlocked) {
        // Blocked opportunity: skip commerce stage, jump to result
        timerRef.current = setTimeout(() => {
          setBlockedCount(prev => prev + 1);
          setAnalyzedCount(prev => prev + 1);
          setTotalPotentialRevenue(prev => prev + scen.potentialRevenue);
          runCustomerStage(customerIdx, 5); // Jump directly to Result
        }, 1200);
        return;
      }

      // Normal passed policy
      timerRef.current = setTimeout(() => {
        runCustomerStage(customerIdx, 4);
      }, 1200);
    } else if (stageIdx === 4) {
      // 4: COMMERCE
      addEvent('Commerce Agent', scen.commerceAction);
      timerRef.current = setTimeout(() => {
        runCustomerStage(customerIdx, 5);
      }, 1200);
    } else if (stageIdx === 5) {
      // 5: RESULT
      const isApprovedSuccess = !scen.isBlocked && (!scen.requiresApproval || approvalDecision === 'APPROVED');
      const isRejected = scen.requiresApproval && approvalDecision === 'REJECTED';

      if (isApprovedSuccess) {
        addEvent('Revenue Result', scen.resultSuccess, 'success');
        setApprovedCount(prev => prev + 1);
        setAnalyzedCount(prev => prev + 1);
        setTotalPotentialRevenue(prev => prev + scen.potentialRevenue);
        setTotalCapturedRevenue(prev => prev + scen.attributedRevenue);
      } else if (isRejected) {
        addEvent('Revenue Result', scen.resultRejected || 'Action rejected by merchant', 'warning');
        setAnalyzedCount(prev => prev + 1);
        setTotalPotentialRevenue(prev => prev + scen.potentialRevenue);
      } else if (scen.isBlocked) {
        addEvent('Revenue Result', scen.resultBlocked || 'Action blocked by policy', 'blocked');
      }

      // Transition to next customer after 1200ms
      timerRef.current = setTimeout(() => {
        setApprovalDecision(null);
        runCustomerStage(customerIdx + 1, 0);
      }, 1200);
    }
  };

  // Handle Merchant Approval click
  const handleApproveAction = () => {
    if (!isAwaitingApproval) return;
    setIsAwaitingApproval(false);
    setApprovalDecision('APPROVED');
    addEvent('Growth Supervisor', `Merchant approved recovery action for ${currentScenario.customerName}. Executing...`, 'success');
    runCustomerStage(currentCustomerIndex, 4); // Continue to Commerce
  };

  // Handle Merchant Reject click
  const handleRejectAction = () => {
    if (!isAwaitingApproval) return;
    setIsAwaitingApproval(false);
    setApprovalDecision('REJECTED');
    addEvent('Growth Supervisor', `Merchant rejected recovery action for ${currentScenario.customerName}. Commerce cancelled.`, 'warning');
    runCustomerStage(currentCustomerIndex, 5); // Continue to Result showing rejected
  };

  // Finish Simulation
  const finishSimulation = () => {
    clearExistingTimer();
    setIsRunning(false);
    setIsCompleted(true);
    addEvent('Growth Supervisor', `Discovery simulation complete. Analyzed ${scenarios.length} customer opportunities.`, 'success');
  };

  if (!isSimulationModalOpen) return null;

  // Stages definition for current scenario
  const stages = [
    { key: 'SIGNAL', label: 'CUSTOMER SIGNAL' },
    { key: 'INTENT', label: 'INTENT' },
    { key: 'SPECIALIST', label: currentScenario.specialistLabel },
    { key: 'POLICY', label: 'POLICY' },
    { key: 'COMMERCE', label: currentScenario.isBlocked && activeStageIndex >= 3 ? 'BLOCKED' : 'COMMERCE' },
    { key: 'RESULT', label: 'RESULT' }
  ];

  // Overall progress calculation
  const progressPercent = isCompleted
    ? 100
    : Math.round(((currentCustomerIndex + (activeStageIndex / 6)) / scenarios.length) * 100);

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
        maxWidth: '680px',
        background: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid var(--border-subtle)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'fadeIn 0.15s ease-out',
        maxHeight: '90vh'
      }}>
        {/* 1. Modal Header */}
        <div style={{
          padding: '22px 28px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#FFFFFF'
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#777777' }}>
              DISCOVERY SIMULATION
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#111111', marginTop: '2px' }}>
              Sequential Multi-Agent Opportunity Engine
            </div>
          </div>

          <button
            onClick={() => {
              clearExistingTimer();
              setIsRunning(false);
              setIsSimulationModalOpen(false);
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#888888',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* 2. Modal Body */}
        <div style={{ padding: '24px 28px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Progress Header & Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#666666' }}>
                {isCompleted ? (
                  <span style={{ color: '#111111', fontWeight: 700 }}>Analysis Complete ({scenarios.length} Customers)</span>
                ) : (
                  <span>Customer {currentCustomerIndex + 1} of {scenarios.length}</span>
                )}
              </span>
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#111111' }}>
                {isCompleted ? '100%' : `${progressPercent}%`}
              </span>
            </div>

            <div style={{ width: '100%', height: '4px', background: '#EBEBEB', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{
                width: `${isCompleted ? 100 : progressPercent}%`,
                height: '100%',
                background: '#111111',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>

          {/* Current Active Customer / Complete Summary */}
          {!isCompleted ? (
            <div style={{
              background: '#FAFAFA',
              border: '1px solid #E5E5E5',
              borderRadius: '10px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {/* Customer Title & Opportunity Type */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #EBEBEB', paddingBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#777777', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Active Customer Target
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#111111', marginTop: '1px' }}>
                    {currentScenario.customerName}
                  </div>
                </div>

                <div style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: '#111111',
                  background: '#FFFFFF',
                  border: '1px solid #D0D0D0',
                  padding: '3px 9px',
                  borderRadius: '4px'
                }}>
                  {currentScenario.opportunityTitle}
                </div>
              </div>

              {/* Horizontal 6 Stages Pipeline */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '6px',
                overflowX: 'auto',
                padding: '4px 0'
              }}>
                {stages.map((stage, idx) => {
                  const isActive = activeStageIndex === idx;
                  const isPast = activeStageIndex > idx;
                  const isBlockedCommerce = stage.key === 'COMMERCE' && currentScenario.isBlocked && activeStageIndex >= 3;

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

                  if (isBlockedCommerce && (isActive || isPast)) {
                    border = '#888888';
                  }

                  return (
                    <React.Fragment key={stage.key}>
                      <div style={{
                        fontSize: '0.72rem',
                        fontWeight: isActive || isPast ? 700 : 500,
                        letterSpacing: '0.03em',
                        color: text,
                        background: bg,
                        border: `1px solid ${border}`,
                        borderRadius: '5px',
                        padding: '6px 10px',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.2s ease',
                        boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
                      }}>
                        {isPast && !isBlockedCommerce && (
                          <Check size={11} strokeWidth={2.5} color="#111111" />
                        )}
                        {isBlockedCommerce && (
                          <Ban size={11} color="#111111" />
                        )}
                        <span>{stage.label}</span>
                      </div>

                      {idx < stages.length - 1 && (
                        <div style={{
                          color: isPast ? '#111111' : '#D0D0D0',
                          fontSize: '0.8rem',
                          fontWeight: 700
                        }}>
                          →
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Active Step Narrative */}
              <div style={{
                background: '#FFFFFF',
                border: '1px solid #E5E5E5',
                borderRadius: '8px',
                padding: '16px',
                fontSize: '0.84rem',
                lineHeight: 1.5,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span style={{ fontWeight: 700, color: '#111111', minWidth: '110px' }}>Customer Signal:</span>
                  <span style={{ color: activeStageIndex >= 0 ? '#111111' : '#999999' }}>{currentScenario.signal}</span>
                </div>

                {activeStageIndex >= 1 && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ fontWeight: 700, color: '#111111', minWidth: '110px' }}>Intent Agent:</span>
                    <span style={{ color: '#222222' }}>{currentScenario.intent}</span>
                  </div>
                )}

                {activeStageIndex >= 2 && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ fontWeight: 700, color: '#111111', minWidth: '110px' }}>{currentScenario.specialistLabel} Agent:</span>
                    <span style={{ color: '#222222' }}>{currentScenario.specialistAction}</span>
                  </div>
                )}

                {activeStageIndex >= 3 && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ fontWeight: 700, color: '#111111', minWidth: '110px' }}>Policy Agent:</span>
                    <span style={{ color: currentScenario.isBlocked ? '#111111' : '#222222', fontWeight: currentScenario.isBlocked ? 700 : 400 }}>
                      {currentScenario.policyCheck}
                    </span>
                  </div>
                )}

                {/* Awaiting Merchant Approval Sub-Panel */}
                {isAwaitingApproval && (
                  <div style={{
                    marginTop: '8px',
                    padding: '12px 16px',
                    background: '#FAFAFA',
                    border: '1.5px solid #111111',
                    borderRadius: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={14} color="#111111" />
                      <span style={{ fontSize: '0.76rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#111111' }}>
                        MERCHANT APPROVAL REQUIRED
                      </span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#333333' }}>
                      Recovery payment link for Priya Sharma (₹4,890) requires 1-click merchant signoff before executing.
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
                      <button
                        onClick={handleApproveAction}
                        className="btn-primary btn-sm"
                        style={{ borderRadius: '5px', padding: '6px 14px', fontSize: '0.78rem' }}
                      >
                        <Check size={12} />
                        <span>Approve Action</span>
                      </button>
                      <button
                        onClick={handleRejectAction}
                        className="btn-secondary btn-sm"
                        style={{ borderRadius: '5px', padding: '6px 14px', fontSize: '0.78rem' }}
                      >
                        <X size={12} />
                        <span>Reject Action</span>
                      </button>
                    </div>
                  </div>
                )}

                {activeStageIndex >= 4 && !currentScenario.isBlocked && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ fontWeight: 700, color: '#111111', minWidth: '110px' }}>Commerce Agent:</span>
                    <span style={{ color: '#222222' }}>{currentScenario.commerceAction}</span>
                  </div>
                )}

                {activeStageIndex >= 5 && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '4px',
                    paddingTop: '10px',
                    borderTop: '1px solid #EBEBEB'
                  }}>
                    <span style={{ fontWeight: 800, color: '#111111' }}>Result:</span>
                    <span style={{
                      fontWeight: 800,
                      color: currentScenario.isBlocked || approvalDecision === 'REJECTED' ? '#666666' : '#111111',
                      fontSize: '0.9rem'
                    }}>
                      {approvalDecision === 'REJECTED'
                        ? currentScenario.resultRejected
                        : currentScenario.isBlocked
                        ? currentScenario.resultBlocked
                        : currentScenario.resultSuccess}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* DISCOVERY COMPLETE SUMMARY */
            <div style={{
              background: '#FAFAFA',
              border: '1px solid #E5E5E5',
              borderRadius: '10px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px'
            }}>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#777777' }}>
                  SIMULATION AUDIT SUMMARY
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#111111', marginTop: '2px' }}>
                  Discovery Complete
                </div>
                <div style={{ fontSize: '0.85rem', color: '#666666', marginTop: '2px' }}>
                  {scenarios.length} customer opportunities evaluated through the six-agent workflow for {activeMerchant.name}.
                </div>
              </div>

              {/* Metrics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: '8px', padding: '14px' }}>
                  <div style={{ fontSize: '0.68rem', color: '#777777', textTransform: 'uppercase', fontWeight: 700 }}>Opportunities</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111111', marginTop: '2px' }}>{scenarios.length}</div>
                </div>

                <div style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: '8px', padding: '14px' }}>
                  <div style={{ fontSize: '0.68rem', color: '#777777', textTransform: 'uppercase', fontWeight: 700 }}>Approved & Executed</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111111', marginTop: '2px' }}>{approvedCount}</div>
                </div>

                <div style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: '8px', padding: '14px' }}>
                  <div style={{ fontSize: '0.68rem', color: '#777777', textTransform: 'uppercase', fontWeight: 700 }}>Blocked by Policy</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111111', marginTop: '2px' }}>{blockedCount}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: '8px', padding: '14px' }}>
                  <div style={{ fontSize: '0.68rem', color: '#777777', textTransform: 'uppercase', fontWeight: 700 }}>Potential Value</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#111111', marginTop: '2px' }}>₹{totalPotentialRevenue.toLocaleString('en-IN')}</div>
                </div>

                <div style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: '8px', padding: '14px' }}>
                  <div style={{ fontSize: '0.68rem', color: '#777777', textTransform: 'uppercase', fontWeight: 700 }}>Captured / Attributed</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#111111', marginTop: '2px' }}>₹{totalCapturedRevenue.toLocaleString('en-IN')}</div>
                </div>
              </div>
            </div>
          )}

          {/* 3. Live Event Trace Log */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#777777', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Terminal size={12} />
                <span>Simulation Event Trace</span>
              </div>
              {isRunning && !isAwaitingApproval && (
                <span style={{ fontSize: '0.68rem', color: '#111111', fontWeight: 600 }}>
                  Executing discovery workflow...
                </span>
              )}
            </div>

            <div style={{
              background: '#FAFAFA',
              border: '1px solid #E5E5E5',
              borderRadius: '8px',
              padding: '12px 16px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.76rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              maxHeight: '130px',
              overflowY: 'auto'
            }}>
              {liveEvents.map(evt => (
                <div
                  key={evt.id}
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '10px',
                    lineHeight: 1.4,
                    animation: 'fadeIn 0.2s ease-out'
                  }}
                >
                  <span style={{ color: '#888888', flexShrink: 0, fontSize: '0.7rem' }}>
                    {evt.time}
                  </span>
                  <span style={{ color: '#111111', fontWeight: 700, flexShrink: 0 }}>
                    {evt.agent}
                  </span>
                  <span style={{ color: '#333333' }}>
                    {evt.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Footer Actions */}
        <div style={{
          padding: '18px 28px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px',
          background: '#FFFFFF'
        }}>
          {isCompleted ? (
            <>
              <button
                onClick={() => {
                  clearExistingTimer();
                  setIsSimulationModalOpen(false);
                }}
                className="btn-secondary btn-sm"
                style={{ borderRadius: '6px' }}
              >
                <span>Close</span>
              </button>

              <button
                onClick={startSimulation}
                className="btn-secondary btn-sm"
                style={{ borderRadius: '6px' }}
              >
                <RefreshCw size={13} />
                <span>Run Again</span>
              </button>

              <button
                onClick={() => {
                  clearExistingTimer();
                  setIsSimulationModalOpen(false);
                  setActiveScreen('opportunities');
                }}
                className="btn-primary btn-sm"
                style={{ borderRadius: '6px' }}
              >
                <span>View Opportunities</span>
                <ArrowRight size={13} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  clearExistingTimer();
                  setIsRunning(false);
                  setIsSimulationModalOpen(false);
                }}
                className="btn-secondary btn-sm"
                style={{ borderRadius: '6px' }}
              >
                <span>Cancel</span>
              </button>

              <button
                onClick={startSimulation}
                disabled={isRunning}
                className="btn-primary btn-sm"
                style={{ borderRadius: '6px' }}
              >
                <Play size={13} />
                <span>{isRunning ? 'Running Discovery...' : 'Start Discovery'}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
