import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { X, Tag, Percent, DollarSign, Package } from 'lucide-react';

export const ProductEditModal: React.FC = () => {
  const {
    isProductEditModalOpen,
    setIsProductEditModalOpen,
    selectedProductForEdit,
    activeMerchant,
    addProduct,
    updateProduct,
    archiveProduct,
    products
  } = useApp();

  const isEditing = !!selectedProductForEdit;

  const [name, setName] = useState('');
  const [category, setCategory] = useState('General');
  const [price, setPrice] = useState(999);
  const [stock, setStock] = useState(40);
  const [margin, setMargin] = useState(40);
  const [tags, setTags] = useState('');
  const [description, setDescription] = useState('');
  const [compatibleProductId, setCompatibleProductId] = useState('');

  useEffect(() => {
    if (selectedProductForEdit) {
      setName(selectedProductForEdit.name);
      setCategory(selectedProductForEdit.category);
      setPrice(selectedProductForEdit.price);
      setStock(selectedProductForEdit.stockCount);
      setMargin(selectedProductForEdit.margin || 40);
      setTags(selectedProductForEdit.aiBuyerTags.join(', '));
      setDescription(selectedProductForEdit.aiSummary || '');
      setCompatibleProductId(selectedProductForEdit.crossSellAffinity?.[0]?.productId || '');
    } else {
      setName('');
      setCategory(activeMerchant.industry === 'Fashion & Apparel' ? 'Ethnic Wear' : activeMerchant.industry === 'Consumer Electronics & Workspace' ? 'Tech Accessories' : 'Running Shoes');
      setPrice(899);
      setStock(50);
      setMargin(42);
      setTags('');
      setDescription('');
      setCompatibleProductId('');
    }
  }, [selectedProductForEdit, activeMerchant, isProductEditModalOpen]);

  if (!isProductEditModalOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedTags = tags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const crossSellAffinity = compatibleProductId ? [{
      productId: compatibleProductId,
      productName: products.find(p => p.id === compatibleProductId)?.name || 'Compatible Item',
      affinityScore: 0.92,
      price: products.find(p => p.id === compatibleProductId)?.price || 499,
      reason: `Frequently bundled with ${name}.`
    }] : [];

    if (isEditing && selectedProductForEdit) {
      updateProduct(selectedProductForEdit.id, {
        name: name.trim(),
        category: category.trim(),
        price: Number(price),
        stockCount: Number(stock),
        margin: Number(margin),
        aiBuyerTags: parsedTags.length > 0 ? parsedTags : [category, name],
        aiSummary: description.trim() || `${name.trim()} in ${category.trim()}`,
        crossSellAffinity
      });
    } else {
      addProduct({
        name: name.trim(),
        category: category.trim(),
        price: Number(price),
        stockCount: Number(stock),
        margin: Number(margin),
        aiBuyerTags: parsedTags.length > 0 ? parsedTags : [category, name],
        aiSummary: description.trim() || `${name.trim()} in ${category.trim()}`,
        crossSellAffinity
      });
    }

    setIsProductEditModalOpen(false);
  };

  const handleArchive = () => {
    if (selectedProductForEdit) {
      archiveProduct(selectedProductForEdit.id);
      setIsProductEditModalOpen(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.45)',
      zIndex: 100,
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
        padding: '32px'
      }}>
        <div>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#777777' }}>
                {activeMerchant.name} Catalog
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111111', marginTop: '2px' }}>
                {isEditing ? 'Edit Product' : 'Add New Product'}
              </div>
            </div>

            <button
              onClick={() => setIsProductEditModalOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888888', padding: '4px' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: '#222222', marginBottom: '4px' }}>
                Product Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Summer Kurti, Performance Running Socks"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px solid #D6D6D6',
                  fontSize: '0.84rem',
                  background: '#FAFAFA'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: '#222222', marginBottom: '4px' }}>
                  Category
                </label>
                <input
                  type="text"
                  placeholder="e.g. Fashion, Running Shoes"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    border: '1px solid #D6D6D6',
                    fontSize: '0.84rem',
                    background: '#FAFAFA'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: '#222222', marginBottom: '4px' }}>
                  Price ({activeMerchant.currencySymbol})
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={price}
                  onChange={(e) => setPrice(parseInt(e.target.value, 10) || 0)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    border: '1px solid #D6D6D6',
                    fontSize: '0.84rem',
                    background: '#FAFAFA'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: '#222222', marginBottom: '4px' }}>
                  Stock Count
                </label>
                <input
                  type="number"
                  min={0}
                  value={stock}
                  onChange={(e) => setStock(parseInt(e.target.value, 10) || 0)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    border: '1px solid #D6D6D6',
                    fontSize: '0.84rem',
                    background: '#FAFAFA'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: '#222222', marginBottom: '4px' }}>
                  Gross Margin %
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={margin}
                  onChange={(e) => setMargin(parseInt(e.target.value, 10) || 0)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    border: '1px solid #D6D6D6',
                    fontSize: '0.84rem',
                    background: '#FAFAFA'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: '#222222', marginBottom: '4px' }}>
                AI Semantic Tags (Comma Separated)
              </label>
              <input
                type="text"
                placeholder="e.g. kurti, ethnic, summer, women, cotton"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px solid #D6D6D6',
                  fontSize: '0.84rem',
                  background: '#FAFAFA'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: '#222222', marginBottom: '4px' }}>
                AI Description / Summary
              </label>
              <textarea
                rows={3}
                placeholder="Short product summary used by AI for intent matching and customer recommendations..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px solid #D6D6D6',
                  fontSize: '0.84rem',
                  background: '#FAFAFA',
                  fontFamily: 'inherit',
                  resize: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: '#222222', marginBottom: '4px' }}>
                Compatible Cross-Sell Addon
              </label>
              <select
                value={compatibleProductId}
                onChange={(e) => setCompatibleProductId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px solid #D6D6D6',
                  fontSize: '0.84rem',
                  background: '#FAFAFA'
                }}
              >
                <option value="">None (Single Item)</option>
                {products
                  .filter(p => !selectedProductForEdit || p.id !== selectedProductForEdit.id)
                  .map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({activeMerchant.currencySymbol}{p.price})
                    </option>
                  ))}
              </select>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: isEditing ? 'space-between' : 'flex-end',
              alignItems: 'center',
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px solid #F0F0F0'
            }}>
              {isEditing && (
                <button
                  type="button"
                  onClick={handleArchive}
                  className="btn-ghost"
                  style={{ color: '#888888', fontSize: '0.8rem' }}
                >
                  Archive Product
                </button>
              )}

              <button
                type="submit"
                className="btn-primary"
                style={{ padding: '9px 20px', borderRadius: '6px', fontSize: '0.84rem' }}
              >
                <span>{isEditing ? 'Update Product' : 'Add to Catalog'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
