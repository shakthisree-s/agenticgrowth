import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CreditCard,
  Smartphone,
  Building2,
  Lock,
  CheckCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  X,
  Plus,
  AlertCircle,
  RotateCcw
} from 'lucide-react';

export const RazorpayCheckoutModal: React.FC = () => {
  const {
    isRazorpayModalOpen,
    setIsRazorpayModalOpen,
    checkoutItem,
    recommendedAddon,
    recoveryDetails,
    completeCheckout,
    recordRecoveryPaymentFailure,
    activeMerchant,
    policy
  } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'Netbanking'>('UPI');
  const [upiId, setUpiId] = useState('success@razorpay');
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('889');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState<any | null>(null);
  const [isFailureState, setIsFailureState] = useState(false);

  if (!isRazorpayModalOpen || !checkoutItem) return null;

  const isRecovery = Boolean(recoveryDetails?.isRecovery);
  const basePrice = checkoutItem.price;
  const addonPrice = recommendedAddon ? recommendedAddon.price : 0;
  const totalAmount = basePrice + addonPrice;

  const handlePay = () => {
    setIsProcessing(true);
    setIsFailureState(false);
    setTimeout(() => {
      const tx = completeCheckout(paymentMethod);
      setIsProcessing(false);
      setPaymentSuccessData(tx);
    }, 1100);
  };

  const handleSimulateFailure = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsFailureState(true);
      recordRecoveryPaymentFailure({
        customerName: recoveryDetails?.customerName || 'Priya Sharma',
        amount: totalAmount,
        reason: 'Payment gateway timeout in Test Mode'
      });
    }, 900);
  };

  const handleRetryPayment = () => {
    setIsFailureState(false);
  };

  const handleClose = () => {
    setIsRazorpayModalOpen(false);
    setPaymentSuccessData(null);
    setIsFailureState(false);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.45)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '520px',
        background: '#ffffff',
        borderRadius: '24px',
        boxShadow: '0 25px 60px -12px rgba(15, 23, 42, 0.25)',
        border: '1px solid rgba(226, 232, 240, 0.9)',
        overflow: 'hidden',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        {/* Razorpay Branded Top Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0c2340 0%, #173b6c 100%)',
          color: '#ffffff',
          padding: '18px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#3395ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 800,
              fontSize: '1rem'
            }}>
              R
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                Razorpay <span style={{ fontSize: '0.7rem', color: '#93c5fd', background: 'rgba(255,255,255,0.15)', padding: '2px 6px', borderRadius: '4px' }}>TEST MODE</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                {activeMerchant.name} {isRecovery ? 'Recovery Checkout Gateway' : 'Checkout Gateway'}
              </div>
            </div>
          </div>

          <button
            onClick={handleClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        {isFailureState ? (
          /* Graceful Failure Handling State */
          <div style={{ padding: '32px 24px', textAlign: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#fef2f2',
              border: '2px solid #fecaca',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              color: '#dc2626'
            }}>
              <AlertCircle size={36} />
            </div>

            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111111', marginBottom: '4px' }}>
              Payment Failed
            </div>
            <div style={{
              display: 'inline-block',
              background: '#fee2e2',
              color: '#991b1b',
              fontSize: '0.82rem',
              fontWeight: 700,
              padding: '4px 12px',
              borderRadius: '6px',
              marginBottom: '16px'
            }}>
              Payment failed — recovery link remains available.
            </div>

            <p style={{ fontSize: '0.86rem', color: '#555555', lineHeight: 1.5, marginBottom: '20px' }}>
              Simulated payment gateway timeout in Razorpay Test Mode. Revenue has <strong>not</strong> been recorded. The customer session and recovery link for <strong>₹{totalAmount.toLocaleString('en-IN')}</strong> remain preserved for retry.
            </p>

            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '12px 16px',
              marginBottom: '24px',
              textAlign: 'left',
              fontSize: '0.78rem',
              color: '#64748b'
            }}>
              <div>• Audit Event: Logged failure state to Activity & Audit Trail</div>
              <div>• Attributed Revenue: ₹0 (unchanged)</div>
              <div>• Customer: {recoveryDetails?.customerName || 'Priya Sharma'}</div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleRetryPayment}
                className="btn-primary"
                style={{ flex: 1, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <RotateCcw size={15} />
                <span>Retry Payment</span>
              </button>
              <button
                onClick={handleClose}
                className="btn-secondary"
                style={{ padding: '12px 20px' }}
              >
                <span>Close</span>
              </button>
            </div>
          </div>
        ) : !paymentSuccessData ? (
          <div style={{ padding: '24px' }}>
            {/* Order Summary Box */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {isRecovery ? 'Abandoned Checkout Recovery' : 'Order Summary'}
                </div>
                {isRecovery && (
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#111111', background: '#e2e8f0', padding: '2px 8px', borderRadius: '4px' }}>
                    HIGH RECOVERY INTENT
                  </span>
                )}
              </div>

              {/* Main item */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {checkoutItem.name}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    {isRecovery ? `Customer: ${recoveryDetails?.customerName || 'Priya Sharma'} • Abandoned Session` : `Qty 1 • ${checkoutItem.category}`}
                  </div>
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                  ₹{basePrice.toLocaleString('en-IN')}
                </div>
              </div>

              {/* Recovery Agent Callout */}
              {isRecovery && (
                <div style={{
                  padding: '10px 12px',
                  background: '#F0F0F0',
                  border: '1px solid #D8D8D8',
                  borderRadius: '10px',
                  margin: '10px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <ShieldCheck size={16} color="#111111" />
                  <div style={{ fontSize: '0.76rem', color: '#111111', lineHeight: 1.4 }}>
                    <strong>Recovery Agent:</strong> Customer showed purchase intent but exited before payment. Pre-filled 1-click Razorpay Test Mode checkout link.
                  </div>
                </div>
              )}

              {/* AI Recommended Add-on */}
              {recommendedAddon && (
                <div style={{
                  padding: '10px 12px',
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                  border: '1px solid #a7f3d0',
                  borderRadius: '12px',
                  margin: '10px 0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      background: '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff'
                    }}>
                      <Sparkles size={13} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#065f46' }}>
                        {recommendedAddon.name}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#047857' }}>
                        AI Growth Agent Cross-sell Bundle
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#047857' }}>
                    +₹{addonPrice.toLocaleString('en-IN')}
                  </div>
                </div>
              )}

              {/* Total Row */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '12px',
                marginTop: '10px',
                borderTop: '1px dashed #cbd5e1'
              }}>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Total Payable (Test Mode)
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0c2340' }}>
                  ₹{totalAmount.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px' }}>
                SELECT TEST PAYMENT METHOD
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  style={{
                    padding: '12px 8px',
                    borderRadius: '12px',
                    border: paymentMethod === 'UPI' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                    background: paymentMethod === 'UPI' ? '#eff6ff' : '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s'
                  }}
                >
                  <Smartphone size={20} color={paymentMethod === 'UPI' ? '#2563eb' : '#64748b'} />
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: paymentMethod === 'UPI' ? '#1e40af' : '#475569' }}>
                    UPI / QR
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Card')}
                  style={{
                    padding: '12px 8px',
                    borderRadius: '12px',
                    border: paymentMethod === 'Card' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                    background: paymentMethod === 'Card' ? '#eff6ff' : '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s'
                  }}
                >
                  <CreditCard size={20} color={paymentMethod === 'Card' ? '#2563eb' : '#64748b'} />
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: paymentMethod === 'Card' ? '#1e40af' : '#475569' }}>
                    Cards
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Netbanking')}
                  style={{
                    padding: '12px 8px',
                    borderRadius: '12px',
                    border: paymentMethod === 'Netbanking' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                    background: paymentMethod === 'Netbanking' ? '#eff6ff' : '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s'
                  }}
                >
                  <Building2 size={20} color={paymentMethod === 'Netbanking' ? '#2563eb' : '#64748b'} />
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: paymentMethod === 'Netbanking' ? '#1e40af' : '#475569' }}>
                    Netbanking
                  </span>
                </button>
              </div>

              {/* Dynamic Input based on method */}
              {paymentMethod === 'UPI' && (
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <label style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                    Test VPA / UPI ID (Auto-passes in Test Mode)
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      fontFamily: 'var(--font-mono)'
                    }}
                  />
                </div>
              )}

              {paymentMethod === 'Card' && (
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                      Test Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                        Expiry
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                        CVV
                      </label>
                      <input
                        type="text"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'Netbanking' && (
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Simulated HDFC / ICICI / SBI Test Gateway
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Direct automated test authorization with Razorpay sandbox keys.
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons: Pay & Simulate Failure */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={handlePay}
                disabled={isProcessing}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #0c2340 0%, #1e40af 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.98rem',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 8px 20px rgba(12, 35, 64, 0.25)',
                  transition: 'all 0.2s'
                }}
              >
                {isProcessing ? (
                  <span>Simulating Razorpay Authorization...</span>
                ) : (
                  <>
                    <Lock size={16} />
                    <span>Pay ₹{totalAmount.toLocaleString('en-IN')} with Razorpay Test Mode</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSimulateFailure}
                disabled={isProcessing}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '10px',
                  background: '#FFFFFF',
                  color: '#b91c1c',
                  border: '1px solid #fca5a5',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.15s'
                }}
              >
                <AlertCircle size={14} />
                <span>Simulate Payment Failure (Test Graceful Recovery State)</span>
              </button>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              marginTop: '12px'
            }}>
              <ShieldCheck size={14} color="#10b981" />
              <span>Razorpay Test Sandbox • Key: {policy.razorpayKeyId.substring(0, 14)}...</span>
            </div>
          </div>
        ) : (
          /* Payment Success State */
          <div style={{ padding: '32px 24px', textAlign: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#ecfdf5',
              border: '2px solid #a7f3d0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              color: '#059669'
            }}>
              <CheckCircle size={36} />
            </div>

            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Payment Successful!
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Razorpay Test Transaction Captured
            </div>

            {/* Recovery Success Banner */}
            {isRecovery && (
              <div style={{
                background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                border: '1px solid #6ee7b7',
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '20px',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Sparkles size={18} color="#059669" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#065f46' }}>
                    Revenue Recovered by Revenue Recovery Agent
                  </span>
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#047857' }}>
                  +₹{totalAmount.toLocaleString('en-IN')} Recovered Revenue
                </div>
                <div style={{ fontSize: '0.74rem', color: '#065f46', marginTop: '4px' }}>
                  Abandoned checkout for {recoveryDetails?.customerName || 'Priya Sharma'} recovered and settled in Razorpay Test Mode.
                </div>
              </div>
            )}

            {/* Impact Highlight Banner for Cross-sell */}
            {!isRecovery && recommendedAddon && (
              <div style={{
                background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                border: '1px solid #6ee7b7',
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '20px',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Sparkles size={18} color="#059669" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#065f46' }}>
                    Revenue Uplift Attributed to AI Growth Agent
                  </span>
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#047857' }}>
                  +₹{addonPrice.toLocaleString('en-IN')} Additional Basket Value
                </div>
                <div style={{ fontSize: '0.74rem', color: '#065f46', marginTop: '4px' }}>
                  Cross-sell bundle '{recommendedAddon.name}' successfully attached at checkout.
                </div>
              </div>
            )}

            {/* Transaction Receipt Details */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '14px',
              marginBottom: '24px',
              textAlign: 'left',
              fontSize: '0.78rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Payment ID:</span>
                <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{paymentSuccessData.razorpayPaymentId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Order ID:</span>
                <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{paymentSuccessData.razorpayOrderId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Amount:</span>
                <span style={{ fontWeight: 800 }}>₹{paymentSuccessData.totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Ledger Event:</span>
                <span style={{ color: '#059669', fontWeight: 700 }}>Recorded in Audit Trail</span>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="btn-primary"
              style={{ width: '100%', padding: '12px' }}
            >
              <span>Return to Dashboard</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
