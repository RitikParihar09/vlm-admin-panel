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
  FaInfoCircle 
} from 'react-icons/fa';

const WalletRewards = () => {
  const { 
    getCashbackOffers, 
    createCashbackOffer, 
    updateCashbackOffer, 
    deleteCashbackOffer, 
    toggleCashbackOffer 
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

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this cashback offer?')) {
      const ok = await deleteCashbackOffer(id);
      if (ok) loadOffers();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !minRechargeAmount) {
      alert('Please fill out the required fields.');
      return;
    }

    const payload = {
      title,
      description,
      recommendedText,
      minRechargeAmount: Number(minRechargeAmount),
      cashbackAmount: Number(cashbackAmount),
      cashbackPercent: Number(cashbackPercent),
      maxCashback: Number(maxCashback),
      perUserLimit: Number(perUserLimit),
      usageLimit: Number(usageLimit),
      isActive: true
    };

    const ok = await createCashbackOffer(payload);
    if (ok) {
      setIsModalOpen(false);
      // Reset form
      setTitle('');
      setDescription('');
      setRecommendedText('');
      setMinRechargeAmount(100);
      setCashbackAmount(10);
      setCashbackPercent(0);
      setMaxCashback(0);
      setPerUserLimit(0);
      setUsageLimit(0);
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
          onClick={() => setIsModalOpen(true)}
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

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>Loading active offers...</div>
        ) : offers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: '13px' }}>
            <FaInfoCircle style={{ fontSize: '20px', marginBottom: '8px', color: '#cbd5e1' }} />
            <p>No cashback offers created yet. Create one to display it during student recharge!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {offers.map((offer) => (
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
                    display: 'flex', alignItems: 'center', justify: 'center', color: '#4f46e5', fontSize: '18px'
                  }}>
                    <FaGift style={{ margin: 'auto' }} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{offer.title}</h4>
                      {offer.recommendedText && (
                        <span style={{ background: '#fef3c7', color: '#d97706', fontSize: '9px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                          {offer.recommendedText}
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
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button 
                    onClick={() => handleToggle(offer._id)}
                    style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '22px', display: 'flex', alignItems: 'center' }}
                    title={offer.isActive ? "Deactivate" : "Activate"}
                  >
                    {offer.isActive ? <FaToggleOn className="text-green-500" /> : <FaToggleOff className="text-slate-400" />}
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
        )}
      </div>

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="premium-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="premium-modal-content animate-zoom-in" style={{ maxWidth: '480px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
            <div className="side-panel-header">
              <h3>Create Cashback Offer</h3>
              <button className="close-panel-btn" onClick={() => setIsModalOpen(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="side-panel-body" style={{ maxHeight: '65vh', overflowY: 'auto', paddingRight: '4px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  
                  <div className="form-group-side">
                    <label>Offer Title *</label>
                    <input 
                      type="text" 
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Recharge ₹500, Get ₹50 Instant Cashback!"
                      className="side-input"
                    />
                  </div>

                  <div className="form-group-side">
                    <label>Description</label>
                    <input 
                      type="text" 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g. Double benefit promotional bonus balance added directly."
                      className="side-input"
                    />
                  </div>

                  <div className="form-group-side">
                    <label>Recommended Badge Text (Optional)</label>
                    <input 
                      type="text" 
                      value={recommendedText}
                      onChange={(e) => setRecommendedText(e.target.value)}
                      placeholder="e.g. HOT OFFER, 10% BONUS"
                      className="side-input"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group-side">
                      <label>Min Recharge Amount (₹) *</label>
                      <input 
                        type="number" 
                        required
                        min="100"
                        value={minRechargeAmount}
                        onChange={(e) => setMinRechargeAmount(Math.max(100, parseInt(e.target.value) || 100))}
                        className="side-input"
                      />
                    </div>
                    <div className="form-group-side">
                      <label>Cashback Amount (₹)</label>
                      <input 
                        type="number" 
                        value={cashbackAmount}
                        onChange={(e) => setCashbackAmount(Math.max(0, parseInt(e.target.value) || 0))}
                        className="side-input"
                        disabled={cashbackPercent > 0}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group-side">
                      <label>Cashback Percent (%)</label>
                      <input 
                        type="number" 
                        value={cashbackPercent}
                        onChange={(e) => setCashbackPercent(Math.max(0, parseInt(e.target.value) || 0))}
                        className="side-input"
                        placeholder="0 for fixed amount"
                      />
                    </div>
                    <div className="form-group-side">
                      <label>Max Cashback Cap (₹)</label>
                      <input 
                        type="number" 
                        value={maxCashback}
                        onChange={(e) => setMaxCashback(Math.max(0, parseInt(e.target.value) || 0))}
                        className="side-input"
                        disabled={!cashbackPercent}
                        placeholder="0 for no limit"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group-side">
                      <label>Per User Limit</label>
                      <input 
                        type="number" 
                        value={perUserLimit}
                        onChange={(e) => setPerUserLimit(Math.max(0, parseInt(e.target.value) || 0))}
                        className="side-input"
                        placeholder="0 for unlimited"
                      />
                    </div>
                    <div className="form-group-side">
                      <label>Global Usage Limit</label>
                      <input 
                        type="number" 
                        value={usageLimit}
                        onChange={(e) => setUsageLimit(Math.max(0, parseInt(e.target.value) || 0))}
                        className="side-input"
                        placeholder="0 for unlimited"
                      />
                    </div>
                  </div>

                </div>
              </div>
              <div className="side-panel-footer" style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                <button type="button" className="cancel-side-panel-btn" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="save-side-panel-btn" style={{ flex: 1, background: '#4f46e5' }}>Create Offer</button>
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
      `}</style>
    </div>
  );
};

export default WalletRewards;
