import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import {
  Plus,
  Upload,
  Search,
  Edit2,
  Archive,
  RotateCcw,
  CheckCircle2,
  ShoppingBag,
  ArrowRight,
  Package,
  Layers,
  FileText,
  X
} from 'lucide-react';

export const CatalogScreen: React.FC = () => {
  const {
    products,
    activeMerchant,
    openProductEditModal,
    updateProduct,
    archiveProduct,
    importProductsCsv,
    setActiveScreen
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'Active' | 'Archived'>('All');
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [csvFeedback, setCsvFeedback] = useState<{ importedCount: number; skippedCount: number; errors: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derive unique categories from active merchant's products
  const uniqueCategories = ['All', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

  // Filtering products
  const filteredProducts = products.filter(p => {
    // Status filter
    if (selectedStatus === 'Active' && p.status === 'Archived') return false;
    if (selectedStatus === 'Archived' && p.status !== 'Archived') return false;

    // Category filter
    if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = p.name.toLowerCase().includes(q);
      const matchCategory = p.category.toLowerCase().includes(q);
      const matchSummary = p.aiSummary?.toLowerCase().includes(q) || false;
      const matchTags = p.aiBuyerTags?.some(t => t.toLowerCase().includes(q)) || false;
      if (!matchName && !matchCategory && !matchSummary && !matchTags) return false;
    }

    return true;
  });

  // Calculate catalog metrics
  const totalCount = products.length;
  const activeCount = products.filter(p => p.status !== 'Archived').length;
  const archivedCount = products.filter(p => p.status === 'Archived').length;
  const outOfStockCount = products.filter(p => p.stockCount === 0 && p.status !== 'Archived').length;
  const avgMargin = products.length > 0
    ? Math.round(products.reduce((acc, p) => acc + (p.margin || 40), 0) / products.length)
    : 40;

  // Handle CSV file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setCsvText(content);
      }
    };
    reader.readAsText(file);
  };

  // Submit CSV import
  const handleCsvSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvText.trim()) return;
    const res = importProductsCsv(csvText);
    setCsvFeedback(res);
    if (res.importedCount > 0) {
      setTimeout(() => {
        setIsCsvModalOpen(false);
        setCsvFeedback(null);
        setCsvText('');
      }, 1500);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* 1. Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: '6px' }}>
            MERCHANT CATALOG ADMINISTRATION • {activeMerchant.name.toUpperCase()}
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 400, fontFamily: 'var(--font-serif)', color: '#111111', marginBottom: '4px' }}>
            Product Catalog
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#666666', maxWidth: '640px' }}>
            The merchant's single source of truth. Manage stock, pricing, and AI cross-sell affinities. Changes made here immediately update customer shopping search and agent recommendations.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setIsCsvModalOpen(true)}
            className="btn-secondary btn-sm"
            style={{ borderRadius: '6px', padding: '8px 14px' }}
          >
            <Upload size={14} />
            <span>Import CSV</span>
          </button>

          <button
            onClick={() => openProductEditModal()}
            className="btn-primary btn-sm"
            style={{ borderRadius: '6px', padding: '8px 16px' }}
          >
            <Plus size={14} />
            <span>Add Product</span>
          </button>

          <button
            onClick={() => setActiveScreen('conversational')}
            className="btn-ghost btn-sm"
            style={{ borderRadius: '6px', padding: '8px 12px', border: '1px solid #E5E5E5', color: '#111111' }}
            title="Switch to customer-facing shopping view"
          >
            <ShoppingBag size={14} />
            <span>Customer View</span>
            <ArrowRight size={12} />
          </button>
        </div>
      </div>

      {/* 2. Metrics Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '16px',
        padding: '20px 24px',
        background: '#FFFFFF',
        border: '1px solid var(--border-subtle)',
        borderRadius: '10px'
      }}>
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
            Total Items
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111111' }}>
            {totalCount}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
            Active in Store
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111111' }}>
            {activeCount}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
            Out of Stock
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: outOfStockCount > 0 ? '#111111' : '#888888' }}>
            {outOfStockCount}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
            Archived
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#888888' }}>
            {archivedCount}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
            Avg Gross Margin
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111111' }}>
            {avgMargin}%
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Search Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#FFFFFF',
          border: '1px solid #D6D6D6',
          borderRadius: '6px',
          padding: '8px 12px',
          width: '320px'
        }}>
          <Search size={15} style={{ color: '#888888' }} />
          <input
            type="text"
            placeholder="Search products, tags, categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              fontSize: '0.84rem',
              width: '100%',
              background: 'transparent'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999999', padding: '0 2px' }}
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Category & Status Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Category Filter */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {uniqueCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: selectedCategory === cat ? '1px solid #111111' : '1px solid #E5E5E5',
                  background: selectedCategory === cat ? '#111111' : '#FFFFFF',
                  color: selectedCategory === cat ? '#FFFFFF' : '#666666',
                  fontSize: '0.78rem',
                  fontWeight: selectedCategory === cat ? 600 : 400,
                  cursor: 'pointer'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div style={{ width: '1px', height: '20px', background: '#E0E0E0', margin: '0 4px' }} />

          {/* Status Filter */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {(['All', 'Active', 'Archived'] as const).map(status => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: selectedStatus === status ? '1px solid #111111' : '1px solid transparent',
                  background: selectedStatus === status ? '#F0F0F0' : 'transparent',
                  color: selectedStatus === status ? '#111111' : '#777777',
                  fontSize: '0.76rem',
                  fontWeight: selectedStatus === status ? 600 : 400,
                  cursor: 'pointer'
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Product Table */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid var(--border-subtle)',
        borderRadius: '10px',
        overflow: 'hidden'
      }}>
        {filteredProducts.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#FAFAFA', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '12px 18px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#777777' }}>Product</th>
                <th style={{ padding: '12px 14px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#777777' }}>Category</th>
                <th style={{ padding: '12px 14px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#777777' }}>Price</th>
                <th style={{ padding: '12px 14px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#777777' }}>Stock</th>
                <th style={{ padding: '12px 14px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#777777' }}>Margin</th>
                <th style={{ padding: '12px 14px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#777777' }}>Cross-Sell Addon</th>
                <th style={{ padding: '12px 14px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#777777' }}>Status</th>
                <th style={{ padding: '12px 18px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#777777', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => {
                const isArchived = product.status === 'Archived';
                const isOutOfStock = product.stockCount === 0;
                const crossSell = product.crossSellAffinity?.[0];

                return (
                  <tr
                    key={product.id}
                    style={{
                      borderBottom: '1px solid #F0F0F0',
                      opacity: isArchived ? 0.6 : 1,
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#FCFCFC'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    {/* Product Name & Details */}
                    <td style={{ padding: '16px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '6px',
                          background: '#F0F0F0',
                          overflow: 'hidden',
                          flexShrink: 0,
                          border: '1px solid #EAEAEA'
                        }}>
                          <img
                            src={product.image}
                            alt={product.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>

                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#111111' }}>
                            {product.name}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#777777', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                            {product.aiSummary}
                          </div>

                          {/* AI Tags */}
                          {product.aiBuyerTags && product.aiBuyerTags.length > 0 && (
                            <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
                              {product.aiBuyerTags.slice(0, 3).map((tag, idx) => (
                                <span
                                  key={idx}
                                  style={{
                                    fontSize: '0.64rem',
                                    color: '#555555',
                                    background: '#F5F5F5',
                                    padding: '1px 6px',
                                    borderRadius: '4px',
                                    border: '1px solid #E8E8E8'
                                  }}
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td style={{ padding: '16px 14px' }}>
                      <span style={{
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: '#333333',
                        background: '#F7F7F7',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        border: '1px solid #EAEAEA'
                      }}>
                        {product.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td style={{ padding: '16px 14px' }}>
                      <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#111111' }}>
                        {activeMerchant.currencySymbol}{product.price.toLocaleString('en-IN')}
                      </div>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <div style={{ fontSize: '0.72rem', color: '#888888', textDecoration: 'line-through' }}>
                          {activeMerchant.currencySymbol}{product.originalPrice.toLocaleString('en-IN')}
                        </div>
                      )}
                    </td>

                    {/* Stock */}
                    <td style={{ padding: '16px 14px' }}>
                      {isOutOfStock ? (
                        <span style={{
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          color: '#777777',
                          background: '#F0F0F0',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          border: '1px solid #E0E0E0'
                        }}>
                          0 (Out of stock)
                        </span>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: product.stockCount < 10 ? '#888888' : '#111111'
                          }} />
                          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#111111' }}>
                            {product.stockCount} units
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Margin */}
                    <td style={{ padding: '16px 14px' }}>
                      <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#222222' }}>
                        {product.margin || 40}%
                      </span>
                    </td>

                    {/* Cross-Sell Addon */}
                    <td style={{ padding: '16px 14px' }}>
                      {crossSell ? (
                        <div style={{ fontSize: '0.78rem', color: '#222222', maxWidth: '140px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {crossSell.productName}
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.74rem', color: '#999999' }}>None</span>
                      )}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '16px 14px' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: isArchived ? '#F0F0F0' : '#EAEAEA',
                        color: isArchived ? '#888888' : '#111111'
                      }}>
                        {isArchived ? 'Archived' : 'Active'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          onClick={() => openProductEditModal(product)}
                          className="btn-ghost btn-sm"
                          style={{ padding: '5px 10px', fontSize: '0.76rem', border: '1px solid #E5E5E5' }}
                          title="Edit product details, price, or stock"
                        >
                          <Edit2 size={12} />
                          <span>Edit</span>
                        </button>

                        {isArchived ? (
                          <button
                            onClick={() => updateProduct(product.id, { status: 'Active', availability: true })}
                            className="btn-ghost btn-sm"
                            style={{ padding: '5px 8px', fontSize: '0.76rem', color: '#111111' }}
                            title="Restore product to active catalog"
                          >
                            <RotateCcw size={12} />
                            <span>Restore</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => archiveProduct(product.id)}
                            className="btn-ghost btn-sm"
                            style={{ padding: '5px 8px', fontSize: '0.76rem', color: '#888888' }}
                            title="Archive product (removes from customer search)"
                          >
                            <Archive size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: '#F5F5F5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto',
              color: '#888888'
            }}>
              <Package size={20} />
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#111111', marginBottom: '4px' }}>
              No products found
            </div>
            <p style={{ fontSize: '0.82rem', color: '#777777', marginBottom: '16px', maxWidth: '360px', margin: '0 auto 16px auto' }}>
              {searchQuery ? `No products match "${searchQuery}".` : `No products exist in ${activeMerchant.name}'s catalog yet.`}
            </p>
            <button
              onClick={() => openProductEditModal()}
              className="btn-primary btn-sm"
              style={{ borderRadius: '6px' }}
            >
              <Plus size={13} />
              <span>Add First Product</span>
            </button>
          </div>
        )}
      </div>

      {/* 5. CSV Import Modal */}
      {isCsvModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.45)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div style={{
            background: '#FFFFFF',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
            width: '100%',
            maxWidth: '560px',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#777777' }}>
                  {activeMerchant.name} Catalog
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111111', marginTop: '2px' }}>
                  Import Products from CSV
                </div>
              </div>
              <button
                onClick={() => { setIsCsvModalOpen(false); setCsvFeedback(null); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888888', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#666666', lineHeight: 1.4 }}>
              Upload a .csv file or paste comma-separated values below. Expected columns: <code>name, category, price, stock, margin, tags, description</code>.
            </p>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary btn-sm"
                style={{ borderRadius: '6px' }}
              >
                <FileText size={13} />
                <span>Choose CSV File</span>
              </button>

              <button
                type="button"
                onClick={() => setCsvText(
                  `name,category,price,stock,margin,tags,description\n` +
                  `Summer Cotton Kurti,Ethnic Wear,899,40,45,"kurti,cotton,summer","Lightweight breathable summer cotton kurti"\n` +
                  `Embroidered Festive Kurti,Ethnic Wear,1499,25,50,"festive,silk,kurti","Festive silk kurti with intricate detailing"`
                )}
                className="btn-ghost btn-sm"
                style={{ fontSize: '0.76rem', color: '#666666' }}
              >
                Load Sample Format
              </button>
            </div>

            <textarea
              rows={6}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder={`name,category,price,stock,margin,tags,description\nUrban Kurti,Ethnic Wear,899,50,42,"kurti,ethnic","Premium casual kurti"`}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid #D6D6D6',
                fontSize: '0.8rem',
                fontFamily: 'var(--font-mono)',
                background: '#FAFAFA',
                resize: 'none'
              }}
            />

            {csvFeedback && (
              <div style={{
                background: csvFeedback.importedCount > 0 ? '#F4FBF7' : '#FEF2F2',
                border: csvFeedback.importedCount > 0 ? '1px solid #C6EBD7' : '1px solid #FECACA',
                borderRadius: '6px',
                padding: '10px 14px',
                fontSize: '0.8rem',
                color: '#111111'
              }}>
                <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {csvFeedback.importedCount > 0 && <CheckCircle2 size={14} color="#16A34A" />}
                  Import Result: {csvFeedback.importedCount} products added, {csvFeedback.skippedCount} skipped.
                </div>
                {csvFeedback.errors.length > 0 && (
                  <ul style={{ marginTop: '6px', paddingLeft: '16px', color: '#991B1B', fontSize: '0.75rem' }}>
                    {csvFeedback.errors.map((err, i) => <li key={i}>{err}</li>)}
                  </ul>
                )}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => { setIsCsvModalOpen(false); setCsvFeedback(null); }}
                className="btn-ghost btn-sm"
                style={{ borderRadius: '6px' }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleCsvSubmit}
                disabled={!csvText.trim()}
                className="btn-primary btn-sm"
                style={{ borderRadius: '6px', opacity: csvText.trim() ? 1 : 0.5 }}
              >
                <Upload size={13} />
                <span>Import Products</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
