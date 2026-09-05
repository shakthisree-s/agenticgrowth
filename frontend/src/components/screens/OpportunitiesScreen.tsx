import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OpportunityType, OpportunityStatus, Opportunity } from '../../types';
import {
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  SlidersHorizontal,
  XCircle,
  FileText,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const OpportunitiesScreen: React.FC = () => {
  const {
    opportunities,
    openReasoningDrawer,
    approveOpportunity,
    startBatchSimulation,
    isSimulationModalOpen,
    simulationProgress,
    activeMerchant,
    openCustomerSimulation,
    simulationStageMap,
    setCustomerSimulationStage
  } = useApp();

  const isSimulating = isSimulationModalOpen || simulationProgress.isRunning;

  const [statusFilter, setStatusFilter] = useState<'active' | 'completed' | 'all'>('active');
  const [typeFilter, setTypeFilter] = useState<'all' | 'upsell' | 'cross_sell' | 'recovery'>('all');

  const handleRowStepBack = (opp: Opportunity) => {
    const current = simulationStageMap[opp.id] ?? 0;
    if (current > 0) {
      setCustomerSimulationStage(opp.id, current - 1);
    }
  };

  const handleRowStepNext = (opp: Opportunity) => {
    const current = simulationStageMap[opp.id] ?? 0;
    if (current < 5) {
      setCustomerSimulationStage(opp.id, current + 1);
    }
  };

  // Active opportunities that still require action / are pending review
  const isActiveOpportunity = (status: OpportunityStatus) => {
    return status === 'awaiting_approval' || status === 'ready' || status === 'execution_failed' || status === 'blocked_by_policy';
  };

  const isCompletedOpportunity = (status: OpportunityStatus) => {
    return status === 'completed' || status === 'executed';
  };

  const activeCount = opportunities.filter(o => isActiveOpportunity(o.status)).length;
  const completedCount = opportunities.filter(o => isCompletedOpportunity(o.status)).length;
  const allCount = opportunities.length;

  const filteredOpportunities = opportunities.filter(opp => {
    // 1. Status Filter
    if (statusFilter === 'active' && !isActiveOpportunity(opp.status)) return false;
    if (statusFilter === 'completed' && !isCompletedOpportunity(opp.status)) return false;

    // 2. Type Filter
    if (typeFilter === 'recovery') {
      if (opp.type !== 'checkout_recovery') return false;
    } else if (typeFilter !== 'all') {
      if (opp.type !== typeFilter) return false;
    }

    return true;
  });

  const getStatusBadge = (status: OpportunityStatus) => {
    switch (status) {
      case 'awaiting_approval':
        return (
          <span style={{
            fontSize: '0.74rem',
            fontWeight: 700,
            color: '#111111',
            background: '#F0F0F0',
            border: '1px solid #D8D8D8',
            padding: '3px 8px',
            borderRadius: '4px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Clock size={11} />
            Approval Required
          </span>
        );
      case 'ready':
        return (
          <span style={{
            fontSize: '0.74rem',
            fontWeight: 600,
            color: '#333333',
            background: '#F7F7F7',
            border: '1px solid #E5E5E5',
            padding: '3px 8px',
            borderRadius: '4px'
          }}>
            Ready
          </span>
        );
      case 'completed':
      case 'executed':
        return (
          <span style={{
            fontSize: '0.74rem',
            fontWeight: 700,
            color: '#111111',
            background: '#F2F2F2',
            border: '1px solid #D0D0D0',
            padding: '3px 8px',
            borderRadius: '4px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <CheckCircle2 size={11} />
            Completed (Razorpay)
          </span>
        );
      case 'execution_failed':
        return (
          <span style={{
            fontSize: '0.74rem',
            fontWeight: 700,
            color: '#111111',
            background: '#FEE2E2',
            border: '1px solid #FECACA',
            padding: '3px 8px',
            borderRadius: '4px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <XCircle size={11} />
            Execution Failed
          </span>
        );
      case 'rejected':
        return (
          <span style={{
            fontSize: '0.74rem',
            fontWeight: 600,
            color: '#888888',
            background: '#F5F5F5',
            border: '1px solid #EBEBEB',
            padding: '3px 8px',
            borderRadius: '4px'
          }}>
            Rejected
          </span>
        );
      case 'blocked_by_policy':
        return (
          <span style={{
            fontSize: '0.74rem',
            fontWeight: 600,
            color: '#888888',
            background: '#F5F5F5',
            border: '1px solid #EBEBEB',
            padding: '3px 8px',
            borderRadius: '4px'
          }}>
            Blocked by Policy
          </span>
        );
      default:
        return <span style={{ fontSize: '0.74rem', color: '#666666' }}>{status}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* 1. Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: '6px' }}>
            AI REVENUE OPPORTUNITIES • {activeMerchant.name.toUpperCase()}
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 400, fontFamily: 'var(--font-serif)', color: '#111111', marginBottom: '4px' }}>
            Opportunities Approval Queue
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#666666', maxWidth: '640px' }}>
            High-confidence revenue actions synthesized by autonomous agents. Approved recommendations execute directly in Razorpay Test Mode and move automatically to Completed history.
          </p>
        </div>

        <button
          onClick={startBatchSimulation}
          disabled={isSimulating}
          className="btn-primary btn-sm"
          style={{
            borderRadius: '6px',
            padding: '8px 16px',
            opacity: isSimulating ? 0.6 : 1,
            cursor: isSimulating ? 'not-allowed' : 'pointer'
          }}
        >
          <Sparkles size={14} />
          <span>{isSimulating ? 'Running Discovery...' : 'Run Discovery Simulation'}</span>
        </button>
      </div>

      {/* 2. Primary Status Navigation Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '12px'
      }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => setStatusFilter('active')}
            style={{
              padding: '7px 16px',
              borderRadius: '6px',
              border: statusFilter === 'active' ? '1px solid #111111' : '1px solid transparent',
              background: statusFilter === 'active' ? '#111111' : 'transparent',
              color: statusFilter === 'active' ? '#FFFFFF' : '#666666',
              fontSize: '0.82rem',
              fontWeight: statusFilter === 'active' ? 700 : 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <span>Active Queue</span>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              padding: '1px 6px',
              borderRadius: '10px',
              background: statusFilter === 'active' ? 'rgba(255,255,255,0.2)' : '#EEEEEE',
              color: statusFilter === 'active' ? '#FFFFFF' : '#333333'
            }}>
              {activeCount}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('completed')}
            style={{
              padding: '7px 16px',
              borderRadius: '6px',
              border: statusFilter === 'completed' ? '1px solid #111111' : '1px solid transparent',
              background: statusFilter === 'completed' ? '#111111' : 'transparent',
              color: statusFilter === 'completed' ? '#FFFFFF' : '#666666',
              fontSize: '0.82rem',
              fontWeight: statusFilter === 'completed' ? 700 : 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <span>Completed History</span>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              padding: '1px 6px',
              borderRadius: '10px',
              background: statusFilter === 'completed' ? 'rgba(255,255,255,0.2)' : '#EEEEEE',
              color: statusFilter === 'completed' ? '#FFFFFF' : '#333333'
            }}>
              {completedCount}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('all')}
            style={{
              padding: '7px 14px',
              borderRadius: '6px',
              border: statusFilter === 'all' ? '1px solid #111111' : '1px solid transparent',
              background: statusFilter === 'all' ? '#111111' : 'transparent',
              color: statusFilter === 'all' ? '#FFFFFF' : '#777777',
              fontSize: '0.82rem',
              fontWeight: statusFilter === 'all' ? 700 : 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <span>All ({allCount})</span>
          </button>
        </div>

        {/* Type Secondary Filter Pills */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {[
            { id: 'all', label: 'All Types' },
            { id: 'cross_sell', label: 'Cross-sell' },
            { id: 'upsell', label: 'Upsell' },
            { id: 'recovery', label: 'Checkout Recovery' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setTypeFilter(tab.id as any)}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                border: typeFilter === tab.id ? '1px solid #D0D0D0' : '1px solid #EBEBEB',
                background: typeFilter === tab.id ? '#F5F5F5' : '#FFFFFF',
                color: typeFilter === tab.id ? '#111111' : '#777777',
                fontSize: '0.74rem',
                fontWeight: typeFilter === tab.id ? 600 : 400,
                cursor: 'pointer'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Opportunities Table */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid var(--border-subtle)',
        borderRadius: '10px',
        overflow: 'hidden'
      }}>
        {filteredOpportunities.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#FAFAFA', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '12px 18px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#777777' }}>Customer</th>
                <th style={{ padding: '12px 14px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#777777' }}>Opportunity Title</th>
                <th style={{ padding: '12px 14px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#777777' }}>Acting Agent</th>
                <th style={{ padding: '12px 14px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#777777' }}>Impact</th>
                <th style={{ padding: '12px 14px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#777777' }}>Status</th>
                <th style={{ padding: '12px 14px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#777777', textAlign: 'right' }}>Action</th>
                <th style={{ padding: '12px 18px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#777777', textAlign: 'center' }}>Simulation</th>
              </tr>
            </thead>
            <tbody>
              {filteredOpportunities.map(opp => {
                const isCompleted = isCompletedOpportunity(opp.status);
                const isFailed = opp.status === 'execution_failed';
                const currentStageIdx = simulationStageMap[opp.id] ?? 0;

                return (
                  <tr
                    key={opp.id}
                    style={{
                      borderBottom: '1px solid #F0F0F0',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#FCFCFC'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    {/* Customer */}
                    <td style={{ padding: '16px 18px' }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#111111' }}>
                        {opp.customerName}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#777777', marginTop: '2px' }}>
                        {opp.customerBehavior}
                      </div>
                    </td>

                    {/* Opportunity */}
                    <td style={{ padding: '16px 14px' }}>
                      <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#222222' }}>
                        {opp.title}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#666666', marginTop: '2px', maxWidth: '300px' }}>
                        {opp.aiRecommendation}
                      </div>
                    </td>

                    {/* Agent */}
                    <td style={{ padding: '16px 14px' }}>
                      <span style={{
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        color: '#444444',
                        background: '#F5F5F5',
                        padding: '2px 7px',
                        borderRadius: '4px',
                        border: '1px solid #EBEBEB'
                      }}>
                        {opp.createdByAgent === 'MERCHANDISING' ? 'Merchandising Agent' : opp.createdByAgent === 'RECOVERY' ? 'Recovery Agent' : opp.createdByAgent}
                      </span>
                    </td>

                    {/* Expected Impact */}
                    <td style={{ padding: '16px 14px' }}>
                      <div style={{ fontSize: '0.94rem', fontWeight: 700, color: '#111111' }}>
                        {activeMerchant.currencySymbol}{opp.expectedRevenue.toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#888888' }}>
                        {opp.confidence}% confidence
                      </div>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '16px 14px' }}>
                      {getStatusBadge(opp.status)}
                    </td>

                    {/* Action */}
                    <td style={{ padding: '16px 14px', textAlign: 'right' }}>
                      {isCompleted ? (
                        <button
                          onClick={() => openReasoningDrawer(opp)}
                          className="btn-ghost btn-sm"
                          style={{ fontSize: '0.76rem', color: '#555555', border: '1px solid #E5E5E5' }}
                        >
                          <FileText size={12} />
                          <span>View Decision</span>
                        </button>
                      ) : isFailed ? (
                        <button
                          onClick={() => approveOpportunity(opp.id)}
                          className="btn-primary btn-sm"
                          style={{ fontSize: '0.76rem', borderRadius: '6px', background: '#111111' }}
                        >
                          <RotateCcw size={12} />
                          <span>Retry</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => openReasoningDrawer(opp)}
                          className="btn-primary btn-sm"
                          style={{ fontSize: '0.78rem', borderRadius: '6px' }}
                        >
                          <span>Review</span>
                          <ArrowRight size={12} />
                        </button>
                      )}
                    </td>

                    {/* Simulation Control */}
                    <td style={{ padding: '16px 18px', textAlign: 'center' }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '2px',
                        background: '#FAFAFA',
                        padding: '2px 4px',
                        borderRadius: '6px',
                        border: '1px solid #E5E5E5'
                      }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowStepBack(opp);
                          }}
                          disabled={currentStageIdx === 0}
                          title="Previous stage (<)"
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: currentStageIdx === 0 ? 'not-allowed' : 'pointer',
                            color: currentStageIdx === 0 ? '#C5C5C5' : '#111111',
                            padding: '3px 4px',
                            display: 'flex',
                            alignItems: 'center',
                            borderRadius: '3px'
                          }}
                        >
                          <ChevronLeft size={13} />
                        </button>

                        <button
                          onClick={() => openCustomerSimulation(opp)}
                          title="Open manual customer simulation"
                          style={{
                            background: '#FFFFFF',
                            border: '1px solid #D5D5D5',
                            borderRadius: '4px',
                            padding: '3px 8px',
                            fontSize: '0.74rem',
                            fontWeight: 600,
                            color: '#111111',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <span>Simulate</span>
                          {currentStageIdx > 0 && (
                            <span style={{ fontSize: '0.66rem', color: '#666666', background: '#EAEAEA', padding: '1px 4px', borderRadius: '3px' }}>
                              {currentStageIdx + 1}/6
                            </span>
                          )}
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowStepNext(opp);
                          }}
                          disabled={currentStageIdx >= 5}
                          title="Next stage (>)"
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: currentStageIdx >= 5 ? 'not-allowed' : 'pointer',
                            color: currentStageIdx >= 5 ? '#C5C5C5' : '#111111',
                            padding: '3px 4px',
                            display: 'flex',
                            alignItems: 'center',
                            borderRadius: '3px'
                          }}
                        >
                          <ChevronRight size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '56px 24px', textAlign: 'center' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '8px',
              background: '#F5F5F5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto',
              color: '#888888'
            }}>
              <CheckCircle2 size={22} />
            </div>

            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111111', marginBottom: '6px' }}>
              {statusFilter === 'active'
                ? 'All pending opportunities have been approved!'
                : statusFilter === 'completed'
                ? 'No completed opportunities yet'
                : 'No opportunities found'}
            </div>

            <p style={{ fontSize: '0.84rem', color: '#666666', maxWidth: '420px', margin: '0 auto 20px auto', lineHeight: 1.5 }}>
              {statusFilter === 'active'
                ? `The active opportunity queue for ${activeMerchant.name} is clear. Run an AI discovery simulation to scan for new intent signals, basket expansions, or abandoned carts.`
                : `Approved actions executed in Razorpay Test Mode will appear here in the completed audit trail.`}
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              {statusFilter === 'active' && completedCount > 0 && (
                <button
                  onClick={() => setStatusFilter('completed')}
                  className="btn-secondary btn-sm"
                  style={{ borderRadius: '6px' }}
                >
                  <span>View Completed History ({completedCount})</span>
                </button>
              )}

              <button
                onClick={startBatchSimulation}
                disabled={isSimulating}
                className="btn-primary btn-sm"
                style={{
                  borderRadius: '6px',
                  opacity: isSimulating ? 0.6 : 1,
                  cursor: isSimulating ? 'not-allowed' : 'pointer'
                }}
              >
                <Sparkles size={13} />
                <span>{isSimulating ? 'Running Discovery...' : 'Run Discovery Simulation'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
