import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bot,
  Activity,
  ChevronUp,
  ChevronDown,
  ArrowRight,
  X
} from 'lucide-react';

export const AgentControlDock: React.FC = () => {
  const { agentStats, setActiveScreen, startBatchSimulation } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '18px',
      right: '24px',
      zIndex: 40,
      width: isExpanded ? '320px' : 'auto',
      transition: 'all 0.25s ease'
    }}>
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E0E0E0',
        borderRadius: '10px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
        padding: isExpanded ? '14px' : '6px 12px',
        overflow: 'hidden'
      }}>
        {/* Header Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px'
        }}>
          <div
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '4px',
              background: '#F0F0F0',
              border: '1px solid #E0E0E0',
              color: '#111111',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bot size={11} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="status-dot online" style={{ width: '5px', height: '5px' }} />
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#111111' }}>
                6 Agents Active
              </span>
              <span style={{ fontSize: '0.7rem', color: '#666666', fontWeight: 600 }}>
                (₹{agentStats.aiAttributedRevenue.toLocaleString('en-IN')})
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#666666',
                padding: '2px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {isExpanded ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
            </button>

            <button
              onClick={() => setIsDismissed(true)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#999999',
                padding: '2px',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Dismiss dock"
            >
              <X size={13} />
            </button>
          </div>
        </div>

        {/* Expanded Telemetry Body */}
        {isExpanded && (
          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #EEEEEE' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '6px',
              marginBottom: '10px',
              fontSize: '0.72rem'
            }}>
              <div style={{ background: '#F8F8F8', padding: '6px 8px', borderRadius: '6px', border: '1px solid #EBEBEB' }}>
                <span style={{ color: '#777777', display: 'block' }}>Actions</span>
                <strong style={{ color: '#111111' }}>{agentStats.actionsToday} executed</strong>
              </div>

              <div style={{ background: '#F8F8F8', padding: '6px 8px', borderRadius: '6px', border: '1px solid #EBEBEB' }}>
                <span style={{ color: '#777777', display: 'block' }}>Conversion Lift</span>
                <strong style={{ color: '#111111' }}>+{agentStats.conversionLiftPercent}%</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => {
                  setActiveScreen('agents');
                  setIsExpanded(false);
                }}
                className="btn-primary btn-sm"
                style={{ flex: 1, padding: '5px 8px', fontSize: '0.72rem' }}
              >
                <span>Control Center</span>
                <ArrowRight size={11} />
              </button>

              <button
                onClick={() => {
                  startBatchSimulation();
                  setIsExpanded(false);
                }}
                className="btn-secondary btn-sm"
                style={{ flex: 1, padding: '5px 8px', fontSize: '0.72rem' }}
              >
                <span>Simulate</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
