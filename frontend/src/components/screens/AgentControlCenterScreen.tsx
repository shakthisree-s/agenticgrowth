import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { AgentInfo, AgentId, AgentStatus } from '../../types';
import {
  Play,
  Check,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Zap,
  ArrowRight,
  Terminal,
  Activity,
  Bot,
  CreditCard
} from 'lucide-react';

interface LiveEventItem {
  id: string;
  stepNumber: number;
  time: string;
  agent: string;
  message: string;
  status: 'info' | 'success' | 'warning' | 'blocked';
}

export const AgentControlCenterScreen: React.FC = () => {
  const {
    agents,
    openAgentDetailDrawer,
    activeMerchant,
    recordLiveDemoCompletion,
    openRecoveryCheckout
  } = useApp();

  // Workflow State Machine
  const [isRunning, setIsRunning] = useState(false);
  const [currentDemo, setCurrentDemo] = useState<'BASKET_GROWTH' | 'CHECKOUT_RECOVERY' | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
  const [activeAgentId, setActiveAgentId] = useState<AgentId | null>(null);
  const [liveEvents, setLiveEvents] = useState<LiveEventItem[]>([
    {
      id: 'init_01',
      stepNumber: 1,
      time: 'Just now',
      agent: 'Growth Supervisor',
      message: `Multi-agent fleet initialized and synchronized with ${activeMerchant.name} catalog.`,
      status: 'info'
    }
  ]);
  const [completionResult, setCompletionResult] = useState<{
    text: string;
    amount: number;
    type: 'success' | 'blocked';
    demoType?: 'BASKET_GROWTH' | 'CHECKOUT_RECOVERY';
  } | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Dynamic third stage label based on active demo
  const thirdStageLabel = currentDemo === 'CHECKOUT_RECOVERY' ? 'RECOVERY' : 'MERCHANDISING';

  const collaborationSteps = [
    { key: 'SIGNAL', label: 'CUSTOMER SIGNAL' },
    { key: 'INTENT', label: 'INTENT' },
    { key: 'SPECIALIST', label: thirdStageLabel },
    { key: 'POLICY', label: 'POLICY' },
    { key: 'COMMERCE', label: 'COMMERCE' },
    { key: 'REVENUE', label: 'REVENUE' }
  ];

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // 1. RUN BASKET GROWTH DEMO (Aarav Mehta)
  const handleRunBasketGrowth = () => {
    if (isRunning) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    setIsRunning(true);
    setCurrentDemo('BASKET_GROWTH');
    setCompletionResult(null);

    const steps = [
      {
        step: 0,
        agentId: 'SUPERVISOR' as AgentId,
        agentName: 'Growth Supervisor',
        message: 'Growth Supervisor routed browsing session for Aarav Mehta to Intent Agent.'
      },
      {
        step: 1,
        agentId: 'INTENT' as AgentId,
        agentName: 'Customer Intent Agent',
        message: 'Intent Agent classified Aarav Mehta as HIGH_PURCHASE_INTENT (94%).'
      },
      {
        step: 2,
        agentId: 'MERCHANDISING' as AgentId,
        agentName: 'Merchandising Agent',
        message: 'Merchandising Agent recommended Pro Dynamic Running Socks (+₹799).'
      },
      {
        step: 3,
        agentId: 'POLICY' as AgentId,
        agentName: 'Policy & Risk Agent',
        message: 'Policy Agent approved bundle recommendation — within merchant limit.'
      },
      {
        step: 4,
        agentId: 'COMMERCE' as AgentId,
        agentName: 'Commerce Execution Agent',
        message: 'Commerce Agent generated 1-click test checkout.'
      },
      {
        step: 5,
        agentId: 'COMMERCE' as AgentId,
        agentName: 'Commerce Execution Agent',
        message: 'Commerce Agent captured ₹7,798 in Razorpay Test Mode — ₹799 AI uplift recorded.'
      }
    ];

    // Initialize with step 0 (CUSTOMER SIGNAL)
    setActiveStepIndex(0);
    setActiveAgentId(steps[0].agentId);
    const startTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLiveEvents([
      {
        id: `evt_${Date.now()}_0`,
        stepNumber: 1,
        time: startTime,
        agent: steps[0].agentName,
        message: steps[0].message,
        status: 'info'
      }
    ]);

    let currentStep = 0;

    const runNextStep = () => {
      timerRef.current = setTimeout(() => {
        currentStep++;
        if (currentStep < steps.length) {
          const stepData = steps[currentStep];
          setActiveStepIndex(currentStep);
          setActiveAgentId(stepData.agentId);
          const stepTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          setLiveEvents(prev => [
            ...prev,
            {
              id: `evt_${Date.now()}_${currentStep}`,
              stepNumber: currentStep + 1,
              time: stepTime,
              agent: stepData.agentName,
              message: stepData.message,
              status: currentStep === 5 ? 'success' : 'info'
            }
          ]);
          runNextStep();
        } else {
          // Final Completion
          setActiveAgentId(null);
          setIsRunning(false);
          setCompletionResult({
            text: '+₹799 AI-attributed revenue',
            amount: 799,
            type: 'success',
            demoType: 'BASKET_GROWTH'
          });

          // Record live transaction and audit trail into application state
          recordLiveDemoCompletion({
            demoType: 'BASKET_GROWTH',
            customerName: 'Aarav Mehta',
            amount: 799,
            productName: 'Velocity Runner X',
            addonName: 'Pro Dynamic Running Socks',
            details: 'Dispatched 1-click cross-sell bundle (+₹799) executed in Razorpay Test Mode.'
          });
        }
      }, 1800); // 1.8 seconds per stage for clear visibility
    };

    runNextStep();
  };

  // 2. RUN CHECKOUT RECOVERY DEMO (Priya Sharma)
  const handleRunCheckoutRecovery = () => {
    if (isRunning) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    setIsRunning(true);
    setCurrentDemo('CHECKOUT_RECOVERY');
    setCompletionResult(null);

    const steps = [
      {
        step: 0,
        agentId: 'SUPERVISOR' as AgentId,
        agentName: 'Growth Supervisor',
        message: 'Growth Supervisor routed abandoned checkout for Priya Sharma to Intent Agent.'
      },
      {
        step: 1,
        agentId: 'INTENT' as AgentId,
        agentName: 'Customer Intent Agent',
        message: 'Intent Agent classified Priya Sharma as HIGH_RECOVERY_INTENT — ₹4,890 cart abandoned before payment.'
      },
      {
        step: 2,
        agentId: 'RECOVERY' as AgentId,
        agentName: 'Revenue Recovery Agent',
        message: 'Recovery Agent recommended a Razorpay recovery payment link for ₹4,890.'
      },
      {
        step: 3,
        agentId: 'POLICY' as AgentId,
        agentName: 'Policy & Risk Agent',
        message: 'Policy Agent approved recovery action — within merchant recovery limits.'
      },
      {
        step: 4,
        agentId: 'COMMERCE' as AgentId,
        agentName: 'Commerce Execution Agent',
        message: 'Commerce Agent generated Razorpay Test Mode recovery checkout for ₹4,890.'
      },
      {
        step: 5,
        agentId: 'COMMERCE' as AgentId,
        agentName: 'Commerce Execution Agent',
        message: 'Commerce Agent captured ₹4,890 in Razorpay Test Mode — checkout recovery successful.'
      }
    ];

    // Initialize with step 0 (CUSTOMER SIGNAL)
    setActiveStepIndex(0);
    setActiveAgentId(steps[0].agentId);
    const startTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLiveEvents([
      {
        id: `evt_${Date.now()}_0`,
        stepNumber: 1,
        time: startTime,
        agent: steps[0].agentName,
        message: steps[0].message,
        status: 'info'
      }
    ]);

    let currentStep = 0;

    const runNextStep = () => {
      timerRef.current = setTimeout(() => {
        currentStep++;
        if (currentStep < steps.length) {
          const stepData = steps[currentStep];
          setActiveStepIndex(currentStep);
          setActiveAgentId(stepData.agentId);
          const stepTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          setLiveEvents(prev => [
            ...prev,
            {
              id: `evt_${Date.now()}_${currentStep}`,
              stepNumber: currentStep + 1,
              time: stepTime,
              agent: stepData.agentName,
              message: stepData.message,
              status: currentStep === 5 ? 'success' : 'info'
            }
          ]);
          runNextStep();
        } else {
          // Final Completion
          setActiveAgentId(null);
          setIsRunning(false);
          setCompletionResult({
            text: '₹4,890 recovered in Razorpay Test Mode',
            amount: 4890,
            type: 'success',
            demoType: 'CHECKOUT_RECOVERY'
          });

          // Record live transaction and 6-stage chronological audit trail into application state
          recordLiveDemoCompletion({
            demoType: 'CHECKOUT_RECOVERY',
            customerName: 'Priya Sharma',
            amount: 4890,
            productName: 'Urban Performance Kurti & Stole Ensemble',
            details: 'Commerce Agent captured ₹4,890 in Razorpay Test Mode — checkout recovery successful.'
          });
        }
      }, 1800); // 1.8 seconds per stage for clear visibility
    };

    runNextStep();
  };

  // Helper to determine active agent status dynamically
  const getDynamicAgentStatus = (agentId: AgentId, originalStatus: AgentStatus): { status: string; isWorking: boolean } => {
    if (!isRunning || activeStepIndex === null) {
      return { status: originalStatus, isWorking: false };
    }

    if (activeAgentId === agentId) {
      switch (agentId) {
        case 'SUPERVISOR': return { status: 'COORDINATING', isWorking: true };
        case 'INTENT': return { status: 'ANALYZING', isWorking: true };
        case 'MERCHANDISING': return { status: 'RECOMMENDING', isWorking: true };
        case 'RECOVERY': return { status: 'SYNTHESIZING', isWorking: true };
        case 'POLICY': return { status: 'CHECKING', isWorking: true };
        case 'COMMERCE': return { status: 'EXECUTING', isWorking: true };
        default: return { status: 'WORKING', isWorking: true };
      }
    }

    // Supervisor remains coordinating during specialist work
    if (agentId === 'SUPERVISOR') {
      return { status: 'COORDINATING', isWorking: true };
    }

    return { status: 'ONLINE', isWorking: false };
  };

  // Step explanation descriptions
  const getStepExplanation = () => {
    if (activeStepIndex === null) {
      if (completionResult) {
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} color="#111111" />
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#111111' }}>
                Workflow Completed: {completionResult.text}
              </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {completionResult.demoType === 'CHECKOUT_RECOVERY' && (
                <button
                  onClick={() => openRecoveryCheckout({ customerName: 'Priya Sharma', amount: 4890, productName: 'Urban Performance Kurti & Stole Ensemble' })}
                  style={{
                    background: '#111111',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <CreditCard size={13} />
                  <span>Test Live Razorpay Checkout (₹4,890)</span>
                </button>
              )}
              <span style={{ fontSize: '0.74rem', color: '#777777', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Ledger Recorded & Traceable in Audit
              </span>
            </div>
          </div>
        );
      }
      return (
        <span style={{ fontSize: '0.84rem', color: '#666666' }}>
          Select a demo scenario above to observe the real-time deterministic multi-agent collaboration sequence.
        </span>
      );
    }

    if (currentDemo === 'BASKET_GROWTH') {
      switch (activeStepIndex) {
        case 0:
          return <span><strong>Stage 1 (Customer Signal):</strong> Aarav added Velocity Runner X to cart. Routing session context to Customer Intent Agent.</span>;
        case 1:
          return <span><strong>Stage 2 (Intent):</strong> Customer Intent Agent analyzed browsing behavior: classified as <strong>HIGH_PURCHASE_INTENT (94%)</strong>.</span>;
        case 2:
          return <span><strong>Stage 3 (Merchandising):</strong> Merchandising Agent evaluated catalog graph: recommended <strong>Pro Dynamic Running Socks (+₹799)</strong>.</span>;
        case 3:
          return <span><strong>Stage 4 (Policy):</strong> Policy & Risk Agent verified margin guardrails: <strong>PASSED (10% ≤ {activeMerchant.policy.maxDiscountPercent}% cap)</strong>.</span>;
        case 4:
          return <span><strong>Stage 5 (Commerce):</strong> Commerce Execution Agent prepared 1-click Razorpay Test Mode checkout order.</span>;
        case 5:
          return <span><strong>Stage 6 (Revenue):</strong> AI-attributed revenue recorded: <strong>+₹799</strong> incremental basket uplift.</span>;
      }
    } else if (currentDemo === 'CHECKOUT_RECOVERY') {
      switch (activeStepIndex) {
        case 0:
          return <span><strong>Stage 1 (Customer Signal):</strong> Customer Priya Sharma added products to cart (<strong>₹4,890</strong>) but abandoned checkout before payment.</span>;
        case 1:
          return <span><strong>Stage 2 (Intent):</strong> Detected checkout abandonment — cart ₹4,890, payment not completed. Classified as <strong>HIGH_RECOVERY_INTENT</strong>. Routing to Recovery Agent.</span>;
        case 2:
          return <span><strong>Stage 3 (Recovery):</strong> Recovery Agent recommended a Razorpay recovery payment link for <strong>₹4,890</strong>. <em>Reasoning: Customer showed purchase intent but exited before payment.</em></span>;
        case 3:
          return <span><strong>Stage 4 (Policy):</strong> Policy & Risk Agent verified recovery action against merchant policy: <strong>POLICY: ALLOWED · RESULT: APPROVED</strong>.</span>;
        case 4:
          return <span><strong>Stage 5 (Commerce):</strong> Commerce Agent prepared Razorpay Test Mode recovery checkout — <strong>₹4,890</strong>.</span>;
        case 5:
          return <span><strong>Stage 6 (Revenue):</strong> Recovered revenue recorded: <strong>₹4,890</strong> captured in Razorpay Test Mode.</span>;
      }
    }

    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '44px' }}>
      {/* 1. Title & Subtitle */}
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 400, fontFamily: 'var(--font-serif)', color: '#111111', marginBottom: '4px' }}>
          Agent Fleet
        </h1>
        <p style={{ fontSize: '0.92rem', color: '#666666' }}>
          Six specialized agents orchestrated by the Growth Supervisor to detect intent, enforce policies, and execute commerce for {activeMerchant.name}.
        </p>
      </div>

      {/* 2. 6 Minimal Agent Cards (3-Column Editorial Grid with Real-Time Working Status) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px' }}>
        {agents.map(agent => {
          const { status, isWorking } = getDynamicAgentStatus(agent.id, agent.status);

          return (
            <div
              key={agent.id}
              onClick={() => openAgentDetailDrawer(agent)}
              style={{
                background: '#FFFFFF',
                border: isWorking ? '1.5px solid #111111' : '1px solid var(--border-subtle)',
                borderRadius: '10px',
                padding: '24px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '175px',
                transition: 'all 0.2s ease',
                boxShadow: isWorking ? '0 4px 14px rgba(0, 0, 0, 0.08)' : 'none'
              }}
              onMouseEnter={(e) => { if (!isWorking) e.currentTarget.style.borderColor = '#111111'; }}
              onMouseLeave={(e) => { if (!isWorking) e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#777777' }}>
                    {agent.name.toUpperCase()}
                  </div>

                  {isWorking && (
                    <span style={{
                      fontSize: '0.64rem',
                      fontWeight: 800,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: '#FFFFFF',
                      background: '#111111',
                      padding: '1px 6px',
                      borderRadius: '4px'
                    }}>
                      ACTIVE
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '0.88rem', color: '#111111', lineHeight: 1.45, marginBottom: '14px' }}>
                  {agent.role}
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '12px',
                borderTop: '1px solid #F0F0F0',
                fontSize: '0.75rem'
              }}>
                <span style={{
                  color: isWorking ? '#111111' : '#555555',
                  fontWeight: isWorking ? 800 : 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: isWorking ? '#111111' : '#999999'
                  }} />
                  {status}
                </span>

                <span style={{ color: '#777777' }}>
                  {agent.actionsCompleted} tasks completed
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. LIVE COLLABORATION WORKFLOW SECTION */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid var(--border-subtle)',
        borderRadius: '12px',
        padding: '32px 36px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        {/* Header with Demo Triggers */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '2px' }}>
              Live Collaboration
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#111111' }}>
              Deterministic Multi-Agent Orchestration Trace
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleRunBasketGrowth}
              disabled={isRunning}
              className={currentDemo === 'BASKET_GROWTH' && isRunning ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'}
              style={{
                borderRadius: '6px',
                padding: '8px 16px',
                fontSize: '0.8rem',
                fontWeight: 600,
                opacity: isRunning && currentDemo !== 'BASKET_GROWTH' ? 0.45 : 1,
                cursor: isRunning ? 'not-allowed' : 'pointer'
              }}
            >
              <Play size={12} />
              <span>{isRunning && currentDemo === 'BASKET_GROWTH' ? 'Running Basket Growth...' : 'Run Demo: Basket Growth'}</span>
            </button>

            <button
              onClick={handleRunCheckoutRecovery}
              disabled={isRunning}
              className={currentDemo === 'CHECKOUT_RECOVERY' && isRunning ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'}
              style={{
                borderRadius: '6px',
                padding: '8px 16px',
                fontSize: '0.8rem',
                fontWeight: 600,
                opacity: isRunning && currentDemo !== 'CHECKOUT_RECOVERY' ? 0.45 : 1,
                cursor: isRunning ? 'not-allowed' : 'pointer'
              }}
            >
              <Play size={12} />
              <span>{isRunning && currentDemo === 'CHECKOUT_RECOVERY' ? 'Running Recovery...' : 'Run Demo: Checkout Recovery'}</span>
            </button>
          </div>
        </div>

        {/* Horizontal Pipeline Steps with Strict Monochrome State Styling */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          overflowX: 'auto',
          padding: '8px 0'
        }}>
          {collaborationSteps.map((step, idx) => {
            const isActive = activeStepIndex === idx;
            const isCompleted = activeStepIndex !== null && activeStepIndex > idx;
            const isFinished = activeStepIndex === null && completionResult !== null;

            let bgColor = '#FFFFFF';
            let textColor = '#888888';
            let borderColor = '#E8E8E8';

            if (isActive) {
              bgColor = '#111111';
              textColor = '#FFFFFF';
              borderColor = '#111111';
            } else if (isCompleted || isFinished) {
              bgColor = '#FFFFFF';
              textColor = '#111111';
              borderColor = '#111111';
            }

            return (
              <React.Fragment key={step.key}>
                <div style={{
                  fontSize: '0.78rem',
                  fontWeight: isActive || isCompleted || isFinished ? 700 : 500,
                  letterSpacing: '0.04em',
                  color: textColor,
                  background: bgColor,
                  border: `1px solid ${borderColor}`,
                  borderRadius: '6px',
                  padding: '9px 16px',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.25s ease',
                  boxShadow: isActive ? '0 2px 10px rgba(0,0,0,0.12)' : 'none'
                }}>
                  {(isCompleted || (isFinished && idx < collaborationSteps.length - 1)) && (
                    <Check size={12} strokeWidth={2.5} color="#111111" />
                  )}
                  {isFinished && idx === collaborationSteps.length - 1 && (
                    <CheckCircle2 size={13} strokeWidth={2.5} color="#111111" />
                  )}
                  <span>{step.label}</span>
                </div>

                {idx < collaborationSteps.length - 1 && (
                  <div style={{
                    color: (activeStepIndex !== null && activeStepIndex > idx) || isFinished ? '#111111' : '#D0D0D0',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    transition: 'color 0.25s ease'
                  }}>
                    →
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Step Explanation Callout */}
        <div style={{
          background: '#FAFAFA',
          border: '1px solid #EBEBEB',
          borderRadius: '8px',
          padding: '14px 18px',
          minHeight: '48px',
          display: 'flex',
          alignItems: 'center'
        }}>
          {getStepExplanation()}
        </div>

        {/* Live Event Trace Log (Progressively appended with monochrome styling) */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888888', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Terminal size={12} />
              <span>Live Collaboration Event Trace</span>
            </div>
            {isRunning && (
              <span style={{ fontSize: '0.72rem', color: '#111111', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#111111', display: 'inline-block' }} />
                Orchestrating stage {((activeStepIndex ?? 0) + 1)}/6...
              </span>
            )}
            {!isRunning && completionResult && (
              <span style={{ fontSize: '0.72rem', color: '#111111', fontWeight: 700 }}>
                Trace completed (6/6 stages)
              </span>
            )}
          </div>

          <div style={{
            background: '#FAFAFA',
            border: '1px solid #E5E5E5',
            borderRadius: '8px',
            padding: '14px 18px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            minHeight: '120px',
            maxHeight: '220px',
            overflowY: 'auto'
          }}>
            {liveEvents.map((evt, idx) => (
              <div
                key={evt.id}
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '12px',
                  lineHeight: 1.5,
                  animation: 'fadeIn 0.25s ease-out'
                }}
              >
                <span style={{ color: '#888888', flexShrink: 0, fontSize: '0.74rem', minWidth: '20px' }}>
                  {evt.stepNumber ? `${evt.stepNumber}.` : `${idx + 1}.`}
                </span>
                <span style={{ color: '#111111', fontWeight: 700, flexShrink: 0 }}>
                  {evt.agent} —
                </span>
                <span style={{ color: evt.status === 'success' ? '#111111' : '#333333', fontWeight: evt.status === 'success' ? 600 : 400 }}>
                  {evt.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

