import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Receipt,
  Sparkles,
  CreditCard,
  CheckCircle2,
  TrendingUp,
  ArrowUpRight,
  Search,
  ExternalLink
} from 'lucide-react';

export const TransactionsScreen: React.FC = () => {
  const { transactions, globalSearchQuery } = useApp();
  const [filterType, setFilterType] = useState<string>('ALL');

  const filtered = transactions.filter(tx => {
    if (filterType !== 'ALL' && tx.aiAttribution !== filterType) return false;
    const q = globalSearchQuery.toLowerCase();
    if (!q) return true;
    return (
      tx.customerName.toLowerCase().includes(q) ||
      tx.id.toLowerCase().includes(q) ||
      tx.razorpayPaymentId.toLowerCase().includes(q) ||
      tx.baseProduct.toLowerCase().includes(q)
    );
  });

  const totalRevenue = transactions.reduce((acc, t) => acc + t.totalAmount, 0);
  const totalAiRevenue = transactions.reduce((acc, t) => acc + t.aiAttributedRevenue, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Commerce Transactions Ledger
            </h1>
            <span className="badge-pill badge-test-mode">
              RAZORPAY TEST MODE
            </span>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Auditable commerce payment logs with automated revenue attribution for agent-driven basket expansion.
          </p>
        </div>
      </div>

      {/* Metric Mini Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <div className="gloss-card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            TOTAL TEST GMV
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0c2340', marginTop: '4px' }}>
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {transactions.length} captured orders
          </div>
        </div>

        <div className="gloss-card" style={{ padding: '18px', background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)', borderColor: '#bbf7d0' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#065f46', textTransform: 'uppercase' }}>
            AI-ATTRIBUTED REVENUE
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#047857', marginTop: '4px' }}>
            ₹{totalAiRevenue.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#065f46', marginTop: '2px' }}>
            {Math.round((totalAiRevenue / (totalRevenue || 1)) * 100)}% of total processed value
          </div>
        </div>

        <div className="gloss-card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            PAYMENT SETTLEMENT
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--blue-primary)', marginTop: '4px' }}>
            100% SUCCESS
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Razorpay Sandbox Verified
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {['ALL', 'AI Cross-sell', 'AI Checkout Recovery', 'AI Upsell', 'Direct'].map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              background: filterType === type ? 'var(--blue-primary)' : '#ffffff',
              color: filterType === type ? '#ffffff' : 'var(--text-secondary)',
              fontSize: '0.78rem',
              fontWeight: filterType === type ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="gloss-card-static" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <th style={{ padding: '14px 20px' }}>Transaction & Order ID</th>
              <th style={{ padding: '14px 20px' }}>Customer</th>
              <th style={{ padding: '14px 20px' }}>Product & AI Add-ons</th>
              <th style={{ padding: '14px 20px' }}>AI Influence</th>
              <th style={{ padding: '14px 20px' }}>Total Amount</th>
              <th style={{ padding: '14px 20px' }}>Method</th>
              <th style={{ padding: '14px 20px', textAlign: 'right' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(tx => (
              <tr
                key={tx.id}
                style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(248, 250, 252, 0.7)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Transaction ID */}
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {tx.id}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                    {tx.razorpayPaymentId}
                  </div>
                </td>

                {/* Customer */}
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {tx.customerName}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {tx.timestamp}
                  </div>
                </td>

                {/* Products */}
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {tx.baseProduct}
                  </div>
                  {tx.aiAddonProduct && (
                    <div style={{ fontSize: '0.74rem', color: '#047857', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <Sparkles size={11} color="#10b981" />
                      <span>+{tx.aiAddonProduct} (₹{tx.aiAddonAmount})</span>
                    </div>
                  )}
                </td>

                {/* AI Influence */}
                <td style={{ padding: '16px 20px' }}>
                  <span className={`badge-pill ${tx.aiAttribution !== 'Direct' ? 'badge-ai-attribution' : 'badge-executed'}`}>
                    {tx.aiAttribution}
                  </span>
                </td>

                {/* Amount */}
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0c2340' }}>
                    ₹{tx.totalAmount.toLocaleString('en-IN')}
                  </div>
                  {tx.aiAttributedRevenue > 0 && (
                    <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600 }}>
                      +₹{tx.aiAttributedRevenue.toLocaleString('en-IN')} AI Lift
                    </div>
                  )}
                </td>

                {/* Method */}
                <td style={{ padding: '16px 20px' }}>
                  <span style={{ fontSize: '0.78rem', background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px', fontWeight: 600, color: '#475569' }}>
                    {tx.paymentMethod}
                  </span>
                </td>

                {/* Status */}
                <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: '#047857',
                    background: '#ecfdf5',
                    padding: '3px 8px',
                    borderRadius: '6px'
                  }}>
                    <CheckCircle2 size={12} />
                    SUCCESS
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
