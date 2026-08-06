import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { 
  FaPlus, 
  FaTrash, 
  FaCheck, 
  FaTimes, 
  FaPercent, 
  FaGift, 
  FaToggleOn, 
  FaToggleOff, 
  FaInfoCircle,
  FaEdit,
  FaStar
} from 'react-icons/fa';

const WalletRewards = () => {
  const { 
    getCashbackOffers, 
    createCashbackOffer, 
    updateCashbackOffer, 
    deleteCashbackOffer, 
    toggleCashbackOffer,
    setRecommendedOffer,
  } = useAdmin();

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [recommendedText, setRecommendedText] = useState('');
  const [minRechargeAmount, setMinRechargeAmount] = useState(100);
  const [cashbackAmount, setCashbackAmount] = useState(10);
  const [cashbackPercent, setCashbackPercent] = useState(0);
  const [maxCashback, setMaxCashback] = useState(0);
  const [perUserLimit, setPerUserLimit] = useState(0);
  const [usageLimit, setUsageLimit] = useState(0);
  const [editingOfferId, setEditingOfferId] = useState(null);
  const [rechargeType, setRechargeType] = useState('combo');
  const [activeCategory, setActiveCategory] = useState('combo');

  const loadOffers = async () => {
    if (!getCashbackOffers) return;
    setLoading(true);
    const data = await getCashbackOffers();
    if (Array.isArray(data)) {
      setOffers(data);
    } else if (data?.data && Array.isArray(data.data)) {
      setOffers(data.data);
    } else {
      setOffers([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadOffers();
  }, []);

  const handleToggle = async (id) => {
    const ok = await toggleCashbackOffer(id);
    if (ok) loadOffers();
  };

  const handleRecommend = async (id) => {
    const ok = await setRecommendedOffer(id);
    if (ok) loadOffers();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this cashback offer?')) {
      const ok = await deleteCashbackOffer(id);
      if (ok) loadOffers();
    }
  };

  const handleEdit = (offer) => {
    setEditingOfferId(offer._id);
    setTitle(offer.title || '');
    setDescription(offer.description || '');
    setRecommendedText(offer.recommendedText || '');
    setMinRechargeAmount(offer.minRechargeAmount || 100);
    setCashbackAmount(offer.cashbackAmount || 0);
    setCashbackPercent(offer.cashbackPercent || 0);
    setMaxCashback(offer.maxCashback || 0);
    setPerUserLimit(offer.perUserLimit || 0);
    setUsageLimit(offer.usageLimit || 0);
    setRechargeType(offer.rechargeType || 'combo');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!minRechargeAmount) {
      alert('Please enter a recharge amount.');
      return;
    }

    const autoTitle = `Recharge ₹${minRechargeAmount}, Get ${cashbackPercent}% Extra!`;
    const autoDesc = `Get ${cashbackPercent}% extra bonus balance added directly.`;
    const autoRecText = `${cashbackPercent}% BONUS`;

    const payload = {
      title: autoTitle,
      description: autoDesc,
      recommendedText: autoRecText,
      minRechargeAmount: Number(minRechargeAmount),
      cashbackAmount: 0,
      cashbackPercent: Number(cashbackPercent),
      maxCashback: 0,
      perUserLimit: 0,
      usageLimit: 0,
      rechargeType: rechargeType,
    };

    let ok;
    if (editingOfferId) {
      ok = await updateCashbackOffer(editingOfferId, payload);
    } else {
      ok = await createCashbackOffer({ ...payload, isActive: true });
    }

    if (ok) {
      setIsModalOpen(false);
      // Reset form
      setEditingOfferId(null);
      setTitle('');
      setDescription('');
      setRecommendedText('');
      setMinRechargeAmount(100);
      setCashbackAmount(0);
      setCashbackPercent(0);
      setMaxCashback(0);
      setPerUserLimit(0);
      setUsageLimit(0);
      setRechargeType(activeCategory);
      loadOffers();
    }
  };

  return (
    <div className="wallet-rewards-view">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div>
          <h2 className="view-title">Wallet & Cashback Configuration</h2>
          <p className="view-subtitle">Configure recharge bonus cash and promotional cashback offers shown to students.</p>
        </div>
        <button 
          className="premium-btn primary-glow" 
          onClick={() => {
            setEditingOfferId(null);
            setTitle('');
            setDescription('');
            setRecommendedText('');
            setMinRechargeAmount(100);
            setCashbackAmount(0);
            setCashbackPercent(0);
            setMaxCashback(0);
            setPerUserLimit(0);
            setUsageLimit(0);
            setRechargeType(activeCategory);
            setIsModalOpen(true);
          }}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', border: 'none', 
            background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', color: '#fff', 
            fontSize: '13px', fontWeight: '700', padding: '10px 18px', borderRadius: '10px', 
            cursor: 'pointer', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)' 
          }}
        >
          <FaPlus /> Create Cashback Offer
        </button>
      </div>

      {/* Offers List */}
      <div className="glass-panel" style={{ padding: '24px', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaGift className="text-violet-500" /> Active Cashback Packs
        </h3>

        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '20px', paddingBottom: '8px' }}>
          {['combo', 'ai', 'doubt'].map((tab) => {
            const labelMap = {
              combo: 'Combo Recharge',
              ai: 'AI Tutor Recharge',
              doubt: 'Doubt Chat Recharge',
            };
            const isActive = activeCategory === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveCategory(tab)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isActive ? '#4f46e5' : 'transparent',
                  color: isActive ? '#fff' : '#64748b',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {labelMap[tab]}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>Loading active offers...</div>
        ) : (() => {
          const filteredOffers = offers.filter(o => (o.rechargeType || 'combo') === activeCategory);
          if (filteredOffers.length === 0) {
            return (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: '13px' }}>
                <FaInfoCircle style={{ fontSize: '20px', marginBottom: '8px', color: '#cbd5e1' }} />
                <p>No cashback offers created for this category yet. Create one to display it during student recharge!</p>
              </div>
            );
          }
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredOffers.map((offer) => (
              <div 
                key={offer._id} 
                style={{ 
                  background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', 
                  padding: '16px 20px', display: 'flex', justifyContent: 'space-between', 
                  alignItems: 'center', gap: '20px' 
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ 
                    height: '42px', width: '42px', borderRadius: '10px', background: 'rgba(79, 70, 229, 0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5', fontSize: '18px'
                  }}>
                    <FaGift />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{offer.title}</h4>
                      {offer.isRecommended && (
                        <span style={{ background: '#fef3c7', color: '#d97706', fontSize: '9px', fontWeight: '800', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          ⭐ RECOMMENDED
                        </span>
                      )}
                    </div>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>{offer.description || 'No description provided.'}</p>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '10px', color: '#94a3b8', fontWeight: '600' }}>
                      <span>Min Recharge: ₹{offer.minRechargeAmount}</span>
                      <span>•</span>
                      <span>Cashback: {offer.cashbackPercent > 0 ? `${offer.cashbackPercent}%` : `₹${offer.cashbackAmount}`}</span>
                      <span>•</span>
                      <span>Used: {offer.usedCount} times</span>
                      <span>•</span>
                      <span style={{ color: '#4f46e5', textTransform: 'uppercase' }}>
                        {offer.rechargeType === 'ai' ? 'AI Tutor' : offer.rechargeType === 'doubt' ? 'Doubt Chat' : 'Combo'}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Recommended star */}
                  <button
                    onClick={() => handleRecommend(offer._id)}
                    style={{ 
                      border: 'none', background: 'none', cursor: 'pointer', fontSize: '20px', 
                      display: 'flex', alignItems: 'center',
                      color: offer.isRecommended ? '#f59e0b' : '#cbd5e1',
                      transition: 'color 0.2s'
                    }}
                    title={offer.isRecommended ? 'Remove Recommended' : 'Mark as Recommended (Default)'}
                  >
                    <FaStar />
                  </button>

                  <button 
                    onClick={() => handleToggle(offer._id)}
                    style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '22px', display: 'flex', alignItems: 'center' }}
                    title={offer.isActive ? "Deactivate" : "Activate"}
                  >
                    {offer.isActive ? <FaToggleOn className="text-green-500" /> : <FaToggleOff className="text-slate-400" />}
                  </button>

                  <button 
                    onClick={() => handleEdit(offer)}
                    style={{ 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', height: '34px', width: '34px',
                      borderRadius: '8px', border: '1px solid #4f46e5', background: 'rgba(79, 70, 229, 0.05)', 
                      color: '#4f46e5', cursor: 'pointer' 
                    }}
                    title="Edit Offer"
                  >
                    <FaEdit size={12} />
                  </button>

                  <button 
                    onClick={() => handleDelete(offer._id)}
                    style={{ 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', height: '34px', width: '34px',
                      borderRadius: '8px', border: '1px solid #ef4444', background: 'rgba(239, 68, 68, 0.05)', 
                      color: '#ef4444', cursor: 'pointer' 
                    }}
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          );
        })()}
      </div>

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="premium-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="premium-modal-content animate-zoom-in" style={{ maxWidth: '480px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
            <div className="side-panel-header">
              <h3>{editingOfferId ? 'Edit Cashback Offer' : 'Create Cashback Offer'}</h3>
              <button className="close-panel-btn" onClick={() => setIsModalOpen(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="side-panel-body" style={{ maxHeight: '65vh', overflowY: 'auto', paddingRight: '4px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  
                  <div className="form-group-side">
                    <label>Recharge Amount (₹) *</label>
                    <input 
                      type="number" 
                      required
                      min="1"
                      value={minRechargeAmount}
                      onChange={(e) => setMinRechargeAmount(Math.max(1, parseInt(e.target.value) || 1))}
                      placeholder="e.g. 5000"
                      className="side-input"
                    />
                  </div>

                  <div className="form-group-side">
                    <label>Extra Bonus Percentage (%) *</label>
                    <input 
                      type="number" 
                      required
                      min="0"
                      max="100"
                      value={cashbackPercent}
                      onChange={(e) => setCashbackPercent(Math.max(0, parseInt(e.target.value) || 0))}
                      placeholder="e.g. 15"
                      className="side-input"
                    />
                  </div>

                </div>
              </div>
              <div className="side-panel-footer" style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                <button type="button" className="cancel-side-panel-btn" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="save-side-panel-btn" style={{ flex: 1, background: '#4f46e5' }}>{editingOfferId ? 'Save Changes' : 'Create Offer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .wallet-rewards-view {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .view-title {
          font-size: 22px;
          font-weight: 800;
          color: #1e293b;
          margin: 0;
        }
        .view-subtitle {
          font-size: 13px;
          color: #64748b;
          margin: 4px 0 0 0;
          font-weight: 500;
        }
        .premium-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .premium-modal-content {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        .side-panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 16px;
          margin-bottom: 20px;
        }
        .side-panel-header h3 {
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }
        .close-panel-btn {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.15s;
        }
        .close-panel-btn:hover {
          color: #f43f5e;
        }
        .form-group-side {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 14px;
          text-align: left;
        }
        .form-group-side label {
          font-size: 11px;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .side-input {
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          padding: 10px 14px;
          color: #0f172a;
          font-size: 13px;
          outline: none;
          width: 100%;
          box-sizing: border-box;
          transition: all 0.15s;
        }
        .side-input:focus {
          border-color: #4f46e5;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }
        .cancel-side-panel-btn {
          padding: 10px 20px;
          border-radius: 10px;
          border: 1px solid #cbd5e1;
          background: #fff;
          color: #475569;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
        }
        .cancel-side-panel-btn:hover {
          background: #f8fafc;
          color: #0f172a;
        }
        .save-side-panel-btn {
          padding: 10px 20px;
          border-radius: 10px;
          border: none;
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
        }
        .save-side-panel-btn:hover {
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
};

export default WalletRewards;
