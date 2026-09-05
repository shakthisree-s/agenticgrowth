import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ActiveScreen } from '../../types';
import { Sliders, ChevronDown, Plus, Check, Store, Package } from 'lucide-react';

export const TopBar: React.FC = () => {
  const {
    activeScreen,
    setActiveScreen,
    opportunities,
    merchants,
    activeMerchantId,
    activeMerchant,
    setActiveMerchantId,
    setIsCreateMerchantModalOpen,
    openStorefront
  } = useApp();

  const [isMerchantDropdownOpen, setIsMerchantDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const awaitingCount = opportunities.filter(o => o.status === 'awaiting_approval').length;

  const navLinks: { id: ActiveScreen; label: string; badge?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'agents', label: 'Agents' },
    { id: 'opportunities', label: 'Opportunities', badge: awaitingCount > 0 ? awaitingCount : undefined },
    { id: 'customers', label: 'Customers' },
    { id: 'agent_activity', label: 'Activity' },
    { id: 'audit_trail', label: 'Audit' }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsMerchantDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header style={{
      height: '68px',
      position: 'sticky',
      top: 0,
      background: 'rgba(255, 255, 255, 0.96)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 36px',
      zIndex: 40
    }}>
      {/* Brand, Merchant Switcher & Clean Horizontal Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        {/* Brand Logo & Subtitle */}
        <div
          onClick={() => setActiveScreen('overview')}
          style={{
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{
            fontSize: '1.05rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: '#111111',
            lineHeight: 1.1
          }}>
            MerchantOS <span style={{ fontWeight: 400, color: '#777777' }}>AI</span>
          </div>
          <div style={{
            fontSize: '0.62rem',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#888888',
            marginTop: '2px'
          }}>
            AI Commerce
          </div>
        </div>

        {/* Merchant Store Selector Pill */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setIsMerchantDropdownOpen(!isMerchantDropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#F7F7F7',
              border: '1px solid #E5E5E5',
              borderRadius: '8px',
              padding: '6px 12px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{
              width: '18px',
              height: '18px',
              borderRadius: '4px',
              background: '#111111',
              color: '#FFFFFF',
              fontSize: '0.68rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {activeMerchant.logoInitial}
            </div>

            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#111111', lineHeight: 1.1 }}>
                {activeMerchant.name}
              </div>
            </div>

            <ChevronDown size={14} style={{ color: '#777777' }} />
          </button>

          {/* Dropdown Menu */}
          {isMerchantDropdownOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              width: '240px',
              background: '#FFFFFF',
              border: '1px solid var(--border-subtle)',
              borderRadius: '10px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
              padding: '6px',
              zIndex: 50,
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              animation: 'fadeIn 0.12s ease-out'
            }}>
              <div style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#888888',
                padding: '6px 10px 4px 10px'
              }}>
                Switch Merchant
              </div>

              {merchants.map(m => {
                const isSelected = m.id === activeMerchantId;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      setActiveMerchantId(m.id);
                      setIsMerchantDropdownOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      background: isSelected ? '#F5F5F5' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = '#FAFAFA'; }}
                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '4px',
                        background: isSelected ? '#111111' : '#EAEAEA',
                        color: isSelected ? '#FFFFFF' : '#333333',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {m.logoInitial}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#111111' }}>{m.name}</div>
                        <div style={{ fontSize: '0.68rem', color: '#777777' }}>{m.industry}</div>
                      </div>
                    </div>

                    {isSelected && <Check size={14} style={{ color: '#111111' }} />}
                  </button>
                );
              })}

              <div style={{ height: '1px', background: '#F0F0F0', margin: '4px 0' }} />

              {/* Merchant Admin Controls */}
              <div style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#888888',
                padding: '4px 10px 2px 10px'
              }}>
                Store Admin
              </div>

              <button
                onClick={() => {
                  setIsMerchantDropdownOpen(false);
                  openStorefront();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 10px',
                  borderRadius: '6px',
                  background: 'transparent',
                  border: 'none',
                  color: '#111111',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#FAFAFA'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <Store size={13} style={{ color: '#555555' }} />
                <span>Open Storefront</span>
              </button>

              <button
                onClick={() => {
                  setActiveScreen('catalog');
                  setIsMerchantDropdownOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 10px',
                  borderRadius: '6px',
                  background: activeScreen === 'catalog' ? '#F5F5F5' : 'transparent',
                  border: 'none',
                  color: '#111111',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#FAFAFA'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = activeScreen === 'catalog' ? '#F5F5F5' : 'transparent'; }}
              >
                <Package size={13} style={{ color: '#555555' }} />
                <span>Manage Catalog</span>
              </button>

              <button
                onClick={() => {
                  setActiveScreen('settings');
                  setIsMerchantDropdownOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 10px',
                  borderRadius: '6px',
                  background: activeScreen === 'settings' ? '#F5F5F5' : 'transparent',
                  border: 'none',
                  color: '#111111',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#FAFAFA'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = activeScreen === 'settings' ? '#F5F5F5' : 'transparent'; }}
              >
                <Sliders size={13} style={{ color: '#555555' }} />
                <span>Merchant Settings</span>
              </button>

              <div style={{ height: '1px', background: '#F0F0F0', margin: '4px 0' }} />

              <button
                onClick={() => {
                  setIsMerchantDropdownOpen(false);
                  setIsCreateMerchantModalOpen(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 10px',
                  borderRadius: '6px',
                  background: '#FAFAFA',
                  border: '1px dashed #D6D6D6',
                  color: '#111111',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  width: '100%',
                  justifyContent: 'center'
                }}
              >
                <Plus size={13} />
                <span>Create Store</span>
              </button>
            </div>
          )}
        </div>

        {/* Minimalist Horizontal Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {navLinks.map(link => {
            const isActive = activeScreen === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActiveScreen(link.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '0.86rem',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#111111' : '#666666',
                  cursor: 'pointer',
                  padding: '8px 0',
                  position: 'relative',
                  transition: 'color 0.15s ease'
                }}
              >
                <span>{link.label}</span>

                {link.badge && (
                  <span style={{
                    marginLeft: '6px',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '1px 5px',
                    borderRadius: '4px',
                    background: '#F0F0F0',
                    color: '#111111',
                    border: '1px solid #E0E0E0'
                  }}>
                    {link.badge}
                  </span>
                )}

                {isActive && (
                  <div style={{
                    position: 'absolute',
                    bottom: '0px',
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: '#111111'
                  }} />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
