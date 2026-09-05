import React from 'react';
import { useApp } from '../../context/AppContext';
import { AbstractLines } from '../layout/AbstractLines';
import { ArrowRight, Plus } from 'lucide-react';

export const OverviewScreen: React.FC = () => {
  const {
    activeMerchant,
    agentStats,
    opportunities,
    openReasoningDrawer,
    setActiveScreen,
    openProductEditModal
  } = useApp();

  // Filter only active actionable opportunities for preview (show top 1-2)
  const activeOpportunities = opportunities.filter(
    o => o.status === 'awaiting_approval' || o.status === 'ready' || o.status === 'execution_failed'
  );
  const previewOpportunities = activeOpportunities.slice(0, 2);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', position: 'relative' }}>
      {/* 1. HERO SECTION */}
      <section style={{
        position: 'relative',
        padding: '64px 52px',
        background: '#FFFFFF',
        border: '1px solid var(--border-subtle)',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-card)'
      }}>
        <AbstractLines opacity={0.55} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: '680px' }}>
          <div className="eyebrow" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>MULTI-AGENT COMMERCE</span>
            <span style={{ color: '#CCCCCC' }}>•</span>
            <span style={{ color: '#111111', fontWeight: 800 }}>{activeMerchant.name.toUpperCase()}</span>
          </div>

          <h1 className="hero-serif-title" style={{
            fontSize: '3.4rem',
            lineHeight: 1.1,
            marginBottom: '18px',
            color: '#111111'
          }}>
            AI agents that<br />
            grow revenue.
          </h1>

          <p style={{
            fontSize: '1.02rem',
            color: '#555555',
            lineHeight: 1.6,
            marginBottom: '32px',
            maxWidth: '560px'
          }}>
            Discover revenue opportunities, enforce merchant policies, and execute approved commerce actions across your catalog.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveScreen('agents')}
              className="btn-primary"
              style={{ padding: '12px 24px', fontSize: '0.86rem', borderRadius: '6px' }}
            >
              <span>Explore Agents</span>
              <ArrowRight size={14} />
            </button>

            <button
              onClick={() => openProductEditModal()}
              className="btn-ghost"
              style={{ padding: '12px 18px', fontSize: '0.84rem', border: '1px dashed #CCCCCC', borderRadius: '6px' }}
            >
              <Plus size={14} />
              <span>Add Product</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. REVENUE METRICS */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '32px',
        padding: '0 8px'
      }}>
        <div>
          <div style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
            Revenue Generated
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 400, fontFamily: 'var(--font-serif)', color: '#111111' }}>
            {activeMerchant.currencySymbol}{agentStats.revenueGenerated.toLocaleString('en-IN')}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
            AI-Attributed Revenue
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 400, fontFamily: 'var(--font-serif)', color: '#111111' }}>
            {activeMerchant.currencySymbol}{agentStats.aiAttributedRevenue.toLocaleString('en-IN')}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
            AI Opportunities
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 400, fontFamily: 'var(--font-serif)', color: '#111111' }}>
            {activeOpportunities.length > 0 ? activeOpportunities.length : agentStats.opportunitiesFound}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
            Conversion Lift
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 400, fontFamily: 'var(--font-serif)', color: '#111111' }}>
            +{agentStats.conversionLiftPercent}%
          </div>
        </div>
      </section>

      {/* 3. FOCUSED REVENUE OPPORTUNITIES PREVIEW (1-2 Cards) */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 400, fontFamily: 'var(--font-serif)', color: '#111111' }}>
              Revenue opportunities
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#777777', marginTop: '2px' }}>
              High-confidence opportunities detected for {activeMerchant.name}.
            </p>
          </div>
          <button
            onClick={() => setActiveScreen('opportunities')}
            className="btn-ghost"
            style={{ fontSize: '0.82rem', color: '#111111', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <span>View active queue</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {previewOpportunities.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            {previewOpportunities.map(opp => (
              <div
                key={opp.id}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '200px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111111' }}>
                      {opp.customerName}
                    </div>
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: '#666666',
                      background: '#F5F5F5',
                      border: '1px solid #EBEBEB',
                      padding: '2px 7px',
                      borderRadius: '4px',
                      letterSpacing: '0.04em'
                    }}>
                      {opp.type.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.86rem', color: '#222222', lineHeight: 1.45, marginTop: '8px', marginBottom: '14px' }}>
                    {opp.title}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '14px', paddingTop: '12px', borderTop: '1px solid #F0F0F0' }}>
                    <span style={{ fontSize: '0.74rem', color: '#777777' }}>Expected impact:</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111111' }}>
                      {activeMerchant.currencySymbol}{opp.expectedRevenue.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <button
                    onClick={() => openReasoningDrawer(opp)}
                    className="btn-secondary btn-sm"
                    style={{ width: '100%', borderRadius: '6px', padding: '8px' }}
                  >
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            background: '#FFFFFF',
            border: '1px dashed var(--border-subtle)',
            borderRadius: '10px',
            padding: '40px',
            textAlign: 'center'
          }}>
            <button
              onClick={() => setActiveScreen('opportunities')}
              className="btn-secondary btn-sm"
              style={{ borderRadius: '6px' }}
            >
              <span>View Opportunities</span>
              <ArrowRight size={13} />
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
