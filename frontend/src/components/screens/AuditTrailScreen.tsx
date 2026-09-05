import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AuditLog } from '../../types';
import { X, Copy, Check } from 'lucide-react';

export const AuditTrailScreen: React.FC = () => {
  const { auditLogs } = useApp();
  const [filterAgent, setFilterAgent] = useState<string>('ALL');
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLog | null>(null);
  const [copied, setCopied] = useState(false);

  const agentTabs = [
    { id: 'ALL', label: 'All' },
    { id: 'SUPERVISOR', label: 'Supervisor' },
    { id: 'INTENT', label: 'Intent' },
    { id: 'MERCHANDISING', label: 'Merchandising' },
    { id: 'RECOVERY', label: 'Recovery' },
    { id: 'POLICY', label: 'Policy' },
    { id: 'COMMERCE', label: 'Commerce' }
  ];

  const filtered = auditLogs.filter(log => {
    if (filterAgent === 'ALL') return true;
    const target = filterAgent.toUpperCase();
    const logAgent = (log.agent || log.agentId || '').toUpperCase();
    const logAgentName = (log.agentName || '').toUpperCase();

    if (target === 'SUPERVISOR') {
      return logAgent === 'SUPERVISOR' || (logAgentName.includes('SUPERVISOR') && !logAgentName.includes('INTENT'));
    }
    if (target === 'INTENT') {
      return logAgent === 'INTENT' || (logAgentName.includes('INTENT') && !logAgentName.includes('SUPERVISOR'));
    }
    if (target === 'MERCHANDISING') {
      return logAgent === 'MERCHANDISING' || logAgentName.includes('MERCHANDISING');
    }
    if (target === 'RECOVERY') {
      return logAgent === 'RECOVERY' || logAgentName.includes('RECOVERY');
    }
    if (target === 'POLICY') {
      return logAgent === 'POLICY' || logAgentName.includes('POLICY');
    }
    if (target === 'COMMERCE') {
      return logAgent === 'COMMERCE' || logAgentName.includes('COMMERCE');
    }
    return logAgent === target;
  });

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTimestamp = (ts: string) => {
    if (!ts) return '14:30:00';
    if (ts.includes('T')) return ts.substring(11, 19);
    if (ts.includes(' ')) return ts.split(' ')[1] || ts;
    return ts;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
      {/* Title & Subtitle */}
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 400, fontFamily: 'var(--font-serif)', color: '#111111', marginBottom: '4px' }}>
          Audit Trail
        </h1>
        <p style={{ fontSize: '0.92rem', color: '#666666' }}>
          Every autonomous decision is traceable.
        </p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {agentTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterAgent(tab.id)}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: filterAgent === tab.id ? '1px solid #111111' : '1px solid #E5E5E5',
              background: filterAgent === tab.id ? '#111111' : '#FFFFFF',
              color: filterAgent === tab.id ? '#FFFFFF' : '#444444',
              fontWeight: filterAgent === tab.id ? 600 : 400,
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Audit Table */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid var(--border-subtle)',
        borderRadius: '10px',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#F8F8F8', borderBottom: '1px solid #EBEBEB', color: '#777777', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              <th style={{ padding: '14px 20px', width: '140px' }}>Timestamp</th>
              <th style={{ padding: '14px 20px', width: '180px' }}>Agent</th>
              <th style={{ padding: '14px 20px' }}>Event</th>
              <th style={{ padding: '14px 20px', width: '120px' }}>Policy</th>
              <th style={{ padding: '14px 20px', textAlign: 'right', width: '120px' }}>Result</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(log => (
              <tr
                key={log.id}
                onClick={() => setSelectedAuditLog(log)}
                style={{
                  borderBottom: '1px solid #F0F0F0',
                  cursor: 'pointer',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#F9F9F9')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Timestamp */}
                <td style={{ padding: '16px 20px', fontFamily: 'var(--font-mono)', fontSize: '0.76rem', color: '#777777' }}>
                  {formatTimestamp(log.timestamp)}
                </td>

                {/* Agent */}
                <td style={{ padding: '16px 20px', fontSize: '0.86rem', fontWeight: 600, color: '#111111' }}>
                  {log.agentName || (log.agent ? `${log.agent.charAt(0) + log.agent.slice(1).toLowerCase()} Agent` : 'Policy Agent')}
                </td>

                {/* Event Description */}
                <td style={{ padding: '16px 20px', fontSize: '0.84rem', color: '#333333' }}>
                  {log.agentDecision}
                </td>

                {/* Policy */}
                <td style={{ padding: '16px 20px', fontSize: '0.78rem', color: log.policyStatus === 'BLOCKED' ? '#B91C1C' : '#111111', fontWeight: 600 }}>
                  {log.policyStatus || 'ALLOWED'}
                </td>

                {/* Result */}
                <td style={{ padding: '16px 20px', textAlign: 'right', fontSize: '0.8rem', color: log.result === 'REJECTED' || log.result === 'BLOCKED' ? '#B91C1C' : log.result === 'RETRY_AVAILABLE' ? '#D97706' : '#111111', fontWeight: 500 }}>
                  {log.result === 'SUCCESS' ? 'Executed' : log.result === 'AWAITING_APPROVAL' || log.result === 'APPROVED' ? 'Approved' : log.result === 'REJECTED' ? 'Rejected' : log.result === 'BLOCKED' ? 'Blocked' : log.result === 'RETRY_AVAILABLE' ? 'Retry Available' : (log.result || 'Executed')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Audit Detail Drawer */}
      {selectedAuditLog && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.4)',
          zIndex: 100,
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '460px',
            background: '#FFFFFF',
            height: '100%',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '-4px 0 24px rgba(0,0,0,0.1)',
            overflowY: 'auto'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#777777' }}>
                  Decision Audit Record
                </div>
                <button
                  onClick={() => setSelectedAuditLog(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888888' }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#111111', marginBottom: '4px' }}>
                {selectedAuditLog.agentDecision}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#666666', marginBottom: '24px' }}>
                {selectedAuditLog.timestamp} · Customer: {selectedAuditLog.customerName}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: '#F9F9F9', border: '1px solid #EBEBEB', borderRadius: '8px', padding: '14px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#777777', textTransform: 'uppercase', marginBottom: '4px' }}>Policy Verification</div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#111111' }}>{selectedAuditLog.policyDetails || 'Passed all bounds and margin safeguards.'}</div>
                </div>

                <div style={{ background: '#F9F9F9', border: '1px solid #EBEBEB', borderRadius: '8px', padding: '14px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#777777', textTransform: 'uppercase', marginBottom: '4px' }}>Tool Executed</div>
                  <div style={{ fontSize: '0.86rem', fontFamily: 'var(--font-mono)', color: '#111111' }}>{selectedAuditLog.toolUsed}</div>
                </div>

                <div style={{ background: '#F9F9F9', border: '1px solid #EBEBEB', borderRadius: '8px', padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ fontSize: '0.72rem', color: '#777777', textTransform: 'uppercase' }}>SHA-256 Signature</div>
                    <button
                      onClick={() => handleCopyHash(selectedAuditLog.signatureHash)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666666', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem' }}
                    >
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)', color: '#444444', wordBreak: 'break-all' }}>
                    {selectedAuditLog.signatureHash}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ paddingTop: '24px', borderTop: '1px solid #F0F0F0' }}>
              <button
                onClick={() => setSelectedAuditLog(null)}
                className="btn-primary"
                style={{ width: '100%', borderRadius: '6px' }}
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
