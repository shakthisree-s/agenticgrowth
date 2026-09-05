import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const AgentActivityScreen: React.FC = () => {
  const { activityStream, transactions } = useApp();
  const [activeTab, setActiveTab] = useState<'activity' | 'transactions'>('activity');

  const getAgentLabel = (stage: string) => {
    switch (stage) {
      case 'OBSERVE': return 'Supervisor Agent';
      case 'UNDERSTAND': return 'Intent Agent';
      case 'RECOMMEND': return 'Merchandising Agent';
      case 'POLICY': return 'Policy Agent';
      case 'APPROVAL': return 'Supervisor Agent';
      case 'ACTION': return 'Commerce Agent';
      case 'RESULT': return 'Commerce Agent';
      default: return 'Supervisor Agent';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
      {/* Title & Subtitle */}
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 400, fontFamily: 'var(--font-serif)', color: '#111111', marginBottom: '4px' }}>
          Activity
        </h1>
        <p style={{ fontSize: '0.92rem', color: '#666666' }}>
          Chronological multi-agent operations and transaction records.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => setActiveTab('activity')}
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            border: activeTab === 'activity' ? '1px solid #111111' : '1px solid #E5E5E5',
            background: activeTab === 'activity' ? '#111111' : '#FFFFFF',
            color: activeTab === 'activity' ? '#FFFFFF' : '#444444',
            fontWeight: activeTab === 'activity' ? 600 : 400,
            fontSize: '0.82rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          Agent Activity
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            border: activeTab === 'transactions' ? '1px solid #111111' : '1px solid #E5E5E5',
            background: activeTab === 'transactions' ? '#111111' : '#FFFFFF',
            color: activeTab === 'transactions' ? '#FFFFFF' : '#444444',
            fontWeight: activeTab === 'transactions' ? 600 : 400,
            fontSize: '0.82rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          Transactions
        </button>
      </div>

      {/* Tab Content 1: Agent Activity Table */}
      {activeTab === 'activity' && (
        <div style={{
          background: '#FFFFFF',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F8F8F8', borderBottom: '1px solid #EBEBEB', color: '#777777', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                <th style={{ padding: '14px 20px', width: '80px' }}>Time</th>
                <th style={{ padding: '14px 20px', width: '200px' }}>Agent</th>
                <th style={{ padding: '14px 20px' }}>Action</th>
                <th style={{ padding: '14px 20px', width: '160px' }}>Customer</th>
                <th style={{ padding: '14px 20px', textAlign: 'right', width: '120px' }}>Result</th>
              </tr>
            </thead>
            <tbody>
              {activityStream.map((item) => (
                <tr
                  key={item.id}
                  style={{
                    borderBottom: '1px solid #F0F0F0',
                    transition: 'background 0.15s'
                  }}
                >
                  {/* Time */}
                  <td style={{ padding: '16px 20px', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#777777' }}>
                    {item.timeFormatted}
                  </td>

                  {/* Agent */}
                  <td style={{ padding: '16px 20px', fontSize: '0.86rem', fontWeight: 600, color: '#111111' }}>
                    {item.agentName || (item.agent ? `${item.agent.charAt(0) + item.agent.slice(1).toLowerCase()} Agent` : getAgentLabel(item.stage))}
                  </td>

                  {/* Action */}
                  <td style={{ padding: '16px 20px', fontSize: '0.84rem', color: '#333333' }}>
                    {item.title}
                  </td>

                  {/* Customer */}
                  <td style={{ padding: '16px 20px', fontSize: '0.82rem', color: '#666666' }}>
                    {item.customerName || '—'}
                  </td>

                  {/* Result */}
                  <td style={{ padding: '16px 20px', textAlign: 'right', fontSize: '0.78rem', color: item.policyStatus === 'BLOCKED' ? '#B91C1C' : '#111111', fontWeight: 500 }}>
                    {item.policyStatus === 'BLOCKED' ? 'Blocked' : item.stage === 'POLICY' ? 'Passed' : item.stage === 'RESULT' ? 'Captured' : item.stage === 'APPROVAL' ? 'Approved' : 'Completed'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab Content 2: Transactions Table */}
      {activeTab === 'transactions' && (
        <div style={{
          background: '#FFFFFF',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F8F8F8', borderBottom: '1px solid #EBEBEB', color: '#777777', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                <th style={{ padding: '14px 20px' }}>Order</th>
                <th style={{ padding: '14px 20px' }}>Customer</th>
                <th style={{ padding: '14px 20px' }}>Amount</th>
                <th style={{ padding: '14px 20px' }}>AI Attribution</th>
                <th style={{ padding: '14px 20px', textAlign: 'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(tx => (
                <tr
                  key={tx.id}
                  style={{
                    borderBottom: '1px solid #F0F0F0',
                    transition: 'background 0.15s'
                  }}
                >
                  {/* Order */}
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#111111' }}>
                      {tx.baseProduct}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#888888', fontFamily: 'var(--font-mono)' }}>
                      {tx.razorpayOrderId} · {tx.paymentMethod}
                    </div>
                  </td>

                  {/* Customer */}
                  <td style={{ padding: '16px 20px', fontSize: '0.86rem', color: '#222222' }}>
                    {tx.customerName}
                  </td>

                  {/* Amount */}
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111111' }}>
                      ₹{tx.totalAmount.toLocaleString('en-IN')}
                    </div>
                    {tx.aiAttributedRevenue > 0 && (
                      <div style={{ fontSize: '0.72rem', color: '#666666' }}>
                        +₹{tx.aiAttributedRevenue} uplift
                      </div>
                    )}
                  </td>

                  {/* AI Attribution */}
                  <td style={{ padding: '16px 20px', fontSize: '0.82rem', color: '#444444' }}>
                    {tx.aiAttribution}
                  </td>

                  {/* Status */}
                  <td style={{ padding: '16px 20px', textAlign: 'right', fontSize: '0.78rem', color: '#111111', fontWeight: 600 }}>
                    {tx.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
