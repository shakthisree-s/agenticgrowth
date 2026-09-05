import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Megaphone,
  Sparkles,
  Users,
  TrendingUp,
  ShieldCheck,
  CheckCircle,
  Clock,
  Zap,
  Send,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export const CampaignsScreen: React.FC = () => {
  const { campaigns, approveCampaign, executeCampaign } = useApp();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            AI Campaign Orchestrator
          </h1>
          <span className="badge-pill badge-ai-attribution">
            <Sparkles size={12} />
            Autonomous Cohort Discovery
          </span>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
          Let your AI Growth Agent identify high-propensity audience clusters, formulate personalized offers, and safely execute via Razorpay Smart Links.
        </p>
      </div>

      {/* Campaign Cards Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {campaigns.map(camp => (
          <div
            key={camp.id}
            className="gloss-card"
            style={{
              padding: '24px',
              border: camp.status === 'APPROVED' ? '1px solid #bbf7d0' : '1px solid var(--border-subtle)'
            }}
          >
            {/* Top Row: Title, Badge, Lifecycle Status */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {camp.title}
                  </h2>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    background: '#eff6ff',
                    color: '#1d4ed8',
                    border: '1px solid #bfdbfe'
                  }}>
                    {camp.badge}
                  </span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {camp.subtitle}
                </div>
              </div>

              {/* Status lifecycle pill */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={`badge-pill badge-${camp.status === 'APPROVED' ? 'ready' : camp.status === 'REVIEW' ? 'awaiting' : camp.status === 'EXECUTED' ? 'executed' : 'autonomous'}`}>
                  {camp.status}
                </span>
              </div>
            </div>

            {/* AI Reasoning Quote Box */}
            <div style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
              border: '1px solid #dbeafe',
              borderRadius: '14px',
              padding: '14px 16px',
              marginBottom: '18px'
            }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--blue-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={13} />
                AI Behavioral Reasoning
              </div>
              <div style={{ fontSize: '0.86rem', color: 'var(--text-primary)', fontStyle: 'italic', lineHeight: 1.45 }}>
                "{camp.aiRationale}"
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                <strong>Recommended Action:</strong> {camp.recommendedAction}
              </div>
            </div>

            {/* Metrics Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '14px 18px',
              marginBottom: '18px'
            }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>TARGET AUDIENCE</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {camp.targetAudience}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>PROJECTED REACH</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e40af', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Users size={15} />
                  {camp.projectedReach.toLocaleString('en-IN')} users
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>EST. CONVERSION RATE</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#059669', marginTop: '2px' }}>
                  {camp.expectedConversionRate}%
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>PROJECTED REVENUE</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#047857', marginTop: '2px' }}>
                  ₹{camp.projectedRevenue.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Channels & Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>Dispatch Channels:</span>
                {camp.channels.map((ch, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: '0.7rem',
                      background: '#f1f5f9',
                      color: 'var(--text-secondary)',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontWeight: 600
                    }}
                  >
                    {ch}
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                {camp.status === 'REVIEW' && (
                  <button
                    onClick={() => approveCampaign(camp.id)}
                    className="btn-success btn-sm"
                  >
                    <CheckCircle size={14} />
                    <span>Approve Campaign</span>
                  </button>
                )}

                {camp.status === 'APPROVED' && (
                  <button
                    onClick={() => executeCampaign(camp.id)}
                    className="btn-primary btn-sm"
                  >
                    <Send size={14} />
                    <span>Dispatch Razorpay Smart Links</span>
                  </button>
                )}

                {camp.status === 'EXECUTED' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#059669', fontWeight: 700 }}>
                    <CheckCircle2 size={16} />
                    <span>Dispatched in Test Mode</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
