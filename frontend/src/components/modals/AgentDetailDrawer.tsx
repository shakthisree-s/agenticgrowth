import React from 'react';
import { useApp } from '../../context/AppContext';
import { X } from 'lucide-react';

export const AgentDetailDrawer: React.FC = () => {
  const {
    isAgentDetailDrawerOpen,
    setIsAgentDetailDrawerOpen,
    selectedAgentForDetail
  } = useApp();

  if (!isAgentDetailDrawerOpen || !selectedAgentForDetail) return null;

  const agent = selectedAgentForDetail;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.4)',
      zIndex: 90,
      display: 'flex',
      justifyContent: 'flex-end',
      animation: 'fadeIn 0.15s ease-out'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#777777' }}>
                Agent Details
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#111111', marginTop: '2px' }}>
                {agent.name}
              </div>
            </div>

            <button
              onClick={() => setIsAgentDetailDrawerOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888888', padding: '4px' }}
            >
              <X size={20} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Role & Status */}
            <div style={{ background: '#F9F9F9', border: '1px solid #EBEBEB', borderRadius: '8px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#777777' }}>Role</span>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#111111', background: '#EAEAEA', padding: '2px 6px', borderRadius: '4px' }}>
                  {agent.status}
                </span>
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#111111' }}>
                {agent.role}
              </div>
            </div>

            {/* Current Task */}
            <div style={{ background: '#F9F9F9', border: '1px solid #EBEBEB', borderRadius: '8px', padding: '16px' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#777777', marginBottom: '4px' }}>
                Current Task
              </div>
              <div style={{ fontSize: '0.86rem', color: '#333333', lineHeight: 1.5 }}>
                {agent.currentTask}
              </div>
            </div>

            {/* Recent Decision & Reasoning */}
            {agent.recentDecisions && agent.recentDecisions.length > 0 && (
              <div style={{ background: '#F9F9F9', border: '1px solid #EBEBEB', borderRadius: '8px', padding: '16px' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#777777', marginBottom: '6px' }}>
                  Recent Decision & Reasoning
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#111111', marginBottom: '4px' }}>
                  {agent.recentDecisions[0].title}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#555555', lineHeight: 1.45 }}>
                  {agent.recentDecisions[0].reason}
                </div>
              </div>
            )}

            {/* Tools Used */}
            <div style={{ background: '#F9F9F9', border: '1px solid #EBEBEB', borderRadius: '8px', padding: '16px' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#777777', marginBottom: '8px' }}>
                Tools Used
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {agent.tools.map((tool, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: '0.72rem',
                      fontFamily: 'var(--font-mono)',
                      background: '#FFFFFF',
                      border: '1px solid #E0E0E0',
                      padding: '3px 7px',
                      borderRadius: '4px',
                      color: '#222222'
                    }}
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>

            {/* Recent Events */}
            {agent.recentEvents && agent.recentEvents.length > 0 && (
              <div style={{ background: '#F9F9F9', border: '1px solid #EBEBEB', borderRadius: '8px', padding: '16px' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#777777', marginBottom: '8px' }}>
                  Recent Events
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {agent.recentEvents.map((evt, i) => (
                    <div key={i} style={{ fontSize: '0.78rem', color: '#444444' }}>
                      <span style={{ fontWeight: 600, color: '#111111' }}>{evt.event}:</span> {evt.details}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Close */}
        <div style={{ paddingTop: '24px', borderTop: '1px solid #F0F0F0' }}>
          <button
            onClick={() => setIsAgentDetailDrawerOpen(false)}
            className="btn-primary"
            style={{ width: '100%', borderRadius: '6px' }}
          >
            Close Drawer
          </button>
        </div>
      </div>
    </div>
  );
};
