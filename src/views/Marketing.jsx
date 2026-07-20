import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import {
  FaPlus,
  FaTrash,
  FaEdit,
  FaArrowUp,
  FaArrowDown,
  FaAd,
  FaTicketAlt,
  FaUpload,
  FaTimes,
  FaCheckCircle,
  FaEllipsisV,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';

const Marketing = ({ defaultTab = 'promocodes' }) => {
  const {
    getBanners,
    createBanner,
    updateBanner,
    deleteBanner,
    reorderBanners,
    getSettings,
    updateSetting
  } = useAdmin();

  // Tab state: 'promocodes' or 'banners'
  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  // Existing Promo Code state
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState('20% OFF');
  const [promos, setPromos] = useState([
    { id: 1, code: 'VLMSTART20', type: 'Percentage', value: '20% OFF', redeemed: 423, status: 'Active' },
    { id: 2, code: 'JEEVIP50', type: 'Percentage', value: '50% OFF', redeemed: 120, status: 'Active' },
    { id: 3, code: 'FREECLASS', type: 'Trial Access', value: '7 Days Free', redeemed: 890, status: 'Expired' }
  ]);

  // Banners state
  const [banners, setBanners] = useState([]);
  const [loadingBanners, setLoadingBanners] = useState(false);
  const [bannersError, setBannersError] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState(null);

  // Form states for banner
  const [bannerTag, setBannerTag] = useState('NEW');
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerHighlight, setBannerHighlight] = useState('');
  const [bannerDesc, setBannerDesc] = useState('');
  const [bannerBtnText, setBannerBtnText] = useState('Explore Now');
  const [bannerBtnLink, setBannerBtnLink] = useState('/library');
  const [bannerBgGradient, setBannerBgGradient] = useState('linear-gradient(135deg, #4f21db 0%, #7e22ce 100%)');
  const [bannerTextColor, setBannerTextColor] = useState('#ffffff');
  const [bannerBtnBgColor, setBannerBtnBgColor] = useState('#ffffff');
  const [bannerBtnTextColor, setBannerBtnTextColor] = useState('#4f21db');
  const [bannerIsCoupon, setBannerIsCoupon] = useState(false);
  const [bannerIsActive, setBannerIsActive] = useState(true);
  const [bannerImageFile, setBannerImageFile] = useState(null);
  const [bannerImagePreview, setBannerImagePreview] = useState('');
  const [bgType, setBgType] = useState('gradient');
  const [bgStartColor, setBgStartColor] = useState('#4f21db');
  const [bgEndColor, setBgEndColor] = useState('#7e22ce');
  const [bgSolidColor, setBgSolidColor] = useState('#4f21db');
  const [submitting, setSubmitting] = useState(false);

  // Rotation and popover states
  const [rotationTime, setRotationTime] = useState(6);
  const [savingRotation, setSavingRotation] = useState(false);
  const [activeActionMenuId, setActiveActionMenuId] = useState(null);

  const loadBanners = async () => {
    setLoadingBanners(true);
    setBannersError('');
    const res = await getBanners();
    if (res.ok) {
      const dataObj = res.data;
      if (dataObj && dataObj.rotationTime !== undefined) {
        setRotationTime(dataObj.rotationTime);
      }
      setBanners(dataObj?.data || dataObj || []);
    } else {
      setBannersError('Failed to fetch banners list.');
    }

    const settingsRes = await getSettings();
    if (settingsRes.ok) {
      const allSettings = settingsRes.data?.data || settingsRes.data || [];
      const rotSetting = allSettings.find(s => s.key === 'banner_rotation_time');
      if (rotSetting) {
        setRotationTime(parseInt(rotSetting.value, 10) || 6);
      }
    }
    setLoadingBanners(false);
  };

  const handleSaveRotation = async () => {
    setSavingRotation(true);
    const res = await updateSetting('banner_rotation_time', rotationTime.toString());
    setSavingRotation(false);
    if (res.ok) {
      alert('Rotation interval updated successfully!');
    } else {
      alert(res.error?.message || 'Failed to update rotation interval.');
    }
  };

  useEffect(() => {
    if (activeTab === 'banners') {
      loadBanners();
    }
  }, [activeTab]);

  const handleCreatePromo = (e) => {
    e.preventDefault();
    if (!promoCode.trim()) return;

    const newPromo = {
      id: Date.now(),
      code: promoCode.toUpperCase(),
      type: 'Percentage',
      value: discount,
      redeemed: 0,
      status: 'Active'
    };

    setPromos([newPromo, ...promos]);
    setPromoCode('');
    alert('Marketing promotional discount code generated.');
  };

  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setEditingBannerId(null);
    setBannerTag('NEW');
    setBannerTitle('');
    setBannerHighlight('');
    setBannerDesc('');
    setBannerBtnText('Explore Now');
    setBannerBtnLink('/library');
    setBannerBgGradient('linear-gradient(135deg, #4f21db 0%, #7e22ce 100%)');
    setBgType('gradient');
    setBgStartColor('#4f21db');
    setBgEndColor('#7e22ce');
    setBgSolidColor('#4f21db');
    setBannerTextColor('#ffffff');
    setBannerBtnBgColor('#ffffff');
    setBannerBtnTextColor('#4f21db');
    setBannerIsCoupon(false);
    setBannerIsActive(true);
    setBannerImageFile(null);
    setBannerImagePreview('');
    setShowModal(true);
  };

  const handleOpenEditModal = (banner) => {
    setIsEditMode(true);
    setEditingBannerId(banner._id);
    setBannerTag(banner.tag || 'NEW');
    setBannerTitle(banner.title || '');
    setBannerHighlight(banner.highlightWord || '');
    setBannerDesc(banner.description || '');
    setBannerBtnText(banner.buttonText || 'Explore Now');
    setBannerBtnLink(banner.buttonLink || '/library');
    
    const val = banner.bgGradient || 'linear-gradient(135deg, #4f21db 0%, #7e22ce 100%)';
    setBannerBgGradient(val);
    if (val.startsWith('#') && (val.length === 4 || val.length === 7)) {
      setBgType('solid');
      setBgSolidColor(val);
    } else if (val.includes('linear-gradient')) {
      const hexMatches = val.match(/#[0-9a-fA-F]{3,6}/g);
      if (hexMatches && hexMatches.length >= 2) {
        setBgType('gradient');
        setBgStartColor(hexMatches[0]);
        setBgEndColor(hexMatches[1]);
      } else {
        setBgType('custom');
      }
    } else {
      setBgType('custom');
    }

    setBannerTextColor(banner.textColor || '#ffffff');
    setBannerBtnBgColor(banner.buttonBgColor || '#ffffff');
    setBannerBtnTextColor(banner.buttonTextColor || '#4f21db');
    setBannerIsCoupon(banner.isCoupon || false);
    setBannerIsActive(banner.isActive !== false);
    setBannerImageFile(null);
    setBannerImagePreview(banner.imageUrl || '');
    setShowModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerImageFile(file);
      setBannerImagePreview(URL.createObjectURL(file));
    }
  };

  const handleBannerSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData();
    formData.append('tag', bannerTag);
    formData.append('title', bannerTitle);
    formData.append('highlightWord', bannerHighlight);
    formData.append('description', bannerDesc);
    formData.append('buttonText', bannerBtnText);
    formData.append('buttonLink', bannerBtnLink);

    let finalBg = bannerBgGradient;
    if (bgType === 'solid') {
      finalBg = bgSolidColor;
    } else if (bgType === 'gradient') {
      finalBg = `linear-gradient(135deg, ${bgStartColor} 0%, ${bgEndColor} 100%)`;
    }
    formData.append('bgGradient', finalBg);

    formData.append('textColor', bannerTextColor);
    formData.append('buttonBgColor', bannerBtnBgColor);
    formData.append('buttonTextColor', bannerBtnTextColor);
    formData.append('isCoupon', bannerIsCoupon);
    formData.append('isActive', bannerIsActive);

    if (bannerImageFile) {
      formData.append('image', bannerImageFile);
    }

    let res;
    if (isEditMode) {
      res = await updateBanner(editingBannerId, formData);
    } else {
      res = await createBanner(formData);
    }

    setSubmitting(false);
    if (res.ok) {
      setShowModal(false);
      loadBanners();
      alert(isEditMode ? 'Banner updated successfully!' : 'Banner created successfully!');
    } else {
      alert(res.error?.message || 'Error saving banner slide.');
    }
  };

  const handleDeleteBanner = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete the banner "${title}"?`)) return;
    const res = await deleteBanner(id);
    if (res.ok) {
      loadBanners();
      alert('Banner deleted successfully.');
    } else {
      alert(res.error?.message || 'Error deleting banner.');
    }
  };

  const handleReorder = async (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === banners.length - 1) return;

    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const reordered = [...banners];
    
    // Swap items
    const temp = reordered[index];
    reordered[index] = reordered[targetIdx];
    reordered[targetIdx] = temp;

    // Apply orders locally
    const payload = reordered.map((item, idx) => ({
      id: item._id,
      order: idx
    }));

    // Optimistic UI state update
    setBanners(reordered);

    const res = await reorderBanners(payload);
    if (!res.ok) {
      loadBanners(); // revert
      alert('Reordering failed.');
    }
  };

  return (
    <div className="marketing-view animate-fade-in">
      <div className="view-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', gap: '20px' }}>
        <div>
          <h2 className="view-title">
            {activeTab === 'banners' ? 'Banner Ads' : 'Coupon Codes'}
          </h2>
          <p className="view-subtitle">
            {activeTab === 'banners' 
              ? 'Configure hero graphic sliders, customize colors, and manage CTA target routes.' 
              : 'Generate discount codes, set usage limits, and track redemption metrics.'}
          </p>
        </div>

        {activeTab === 'banners' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {/* Compact Rotation Speed Settings */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ffffff', padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>Rotate:</span>
              <input 
                type="number" 
                value={rotationTime} 
                onChange={(e) => setRotationTime(parseInt(e.target.value) || 6)} 
                style={{ width: '45px', padding: '4px 6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', textAlign: 'center', fontWeight: 700, color: '#1e293b' }}
                min="1"
              />
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>sec</span>
              <button 
                onClick={handleSaveRotation} 
                style={{ background: '#3b82f6', border: 'none', color: '#ffffff', fontSize: '11px', fontWeight: 700, cursor: 'pointer', padding: '4px 8px', borderRadius: '4px', transition: 'background 0.2s' }}
                disabled={savingRotation}
              >
                {savingRotation ? '...' : 'Save'}
              </button>
            </div>

            <button className="create-banner-trigger-btn" onClick={handleOpenAddModal} style={{ margin: 0 }}>
              <FaPlus /> Create Slide Banner
            </button>
          </div>
        )}
      </div>

      {activeTab === 'promocodes' ? (
        /* TAB 1: Promo Coupon Codes & Campaign Stats */
        <>
          <div className="marketing-metrics-row">
            <div className="glass-panel metric-card-mkt">
              <span className="mm-lbl">Adwords Campaign Leads</span>
              <span className="mm-val">12,450 leads</span>
              <span className="mm-trend positive">+8.4% CVR</span>
            </div>
            <div className="glass-panel metric-card-mkt">
              <span className="mm-lbl">Affiliate Commissions Paid</span>
              <span className="mm-val">₹ 1.84 Lakhs</span>
              <span className="mm-trend">This month payouts</span>
            </div>
            <div className="glass-panel metric-card-mkt">
              <span className="mm-lbl">Promo Redemptions Revenue</span>
              <span className="mm-val">₹ 14.8 Lakhs</span>
              <span className="mm-trend positive">ROI: 3.4x</span>
            </div>
          </div>

          <div className="marketing-grid">
            {/* Left: Code Builder */}
            <div className="marketing-col-left glass-panel builder-card">
              <h3>Create Promo Discount Code</h3>
              <form onSubmit={handleCreatePromo} className="promo-form">
                <div className="form-group-new">
                  <label>Promo Code String</label>
                  <input 
                    type="text" 
                    value={promoCode} 
                    onChange={(e) => setPromoCode(e.target.value)} 
                    placeholder="e.g. MONSOON30"
                    className="glass-input-premium"
                    required
                  />
                </div>
                <div className="form-group-new">
                  <label>Discount Amount</label>
                  <select value={discount} onChange={(e) => setDiscount(e.target.value)} className="glass-input-premium" style={{ width: '100%' }}>
                    <option value="10% OFF">10% Discount</option>
                    <option value="20% OFF">20% Discount</option>
                    <option value="30% OFF">30% Discount</option>
                    <option value="50% OFF">50% Discount</option>
                    <option value="Flat ₹500 OFF">Flat ₹500 Discount</option>
                  </select>
                </div>
                <div className="form-group-new">
                  <label>Max Redemption Limits</label>
                  <input type="number" defaultValue="500" className="glass-input-premium" />
                </div>
                <button type="submit" className="save-keys-btn" style={{ marginTop: '10px' }}>
                  Generate Promo Code
                </button>
              </form>
            </div>

            {/* Right: Codes List */}
            <div className="marketing-col-right glass-panel codes-list-card">
              <h3>Active Promo Codes</h3>
              <div className="promos-list-mkt">
                {promos.map((p) => (
                  <div key={p.id} className="promo-row-mkt">
                    <div>
                      <h4 className="promo-code-mkt">{p.code}</h4>
                      <span className="promo-meta-mkt">{p.type} • {p.value}</span>
                    </div>
                    <div className="promo-stats-mkt">
                      <span className="promo-redeems">{p.redeemed} Redeemed</span>
                      <span className={`promo-status-badge ${p.status.toLowerCase()}`}>{p.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        /* TAB 2: Custom Graphic Banners settings */
        <div className="banners-management-panel glass-panel" style={{ padding: '24px' }}>

          {loadingBanners ? (
            <div className="diagnostics-running" style={{ padding: '60px' }}>
              <div className="pulse-spinner"></div>
              <span>Fetching active slide configurations...</span>
            </div>
          ) : bannersError ? (
            <div className="modal-error-alert">
              ⚠️ {bannersError}
              <button onClick={loadBanners} className="glass-button size-sm primary" style={{ marginLeft: '15px' }}>Retry</button>
            </div>
          ) : banners.length === 0 ? (
            <div className="banners-empty-state">
              <FaAd className="empty-ad-icon" />
              <h4>No Banner Slides Found</h4>
              <p>Add a new graphic slide banner to promote offers, events, and library access to your students.</p>
              <button className="save-keys-btn" onClick={handleOpenAddModal} style={{ width: 'auto', padding: '10px 20px' }}>
                Add First Banner Slide
              </button>
            </div>
          ) : (
            <div className="banners-list-table-wrapper">
              <table className="banners-list-table">
                <thead>
                  <tr>
                    <th>Slide Order</th>
                    <th>Graphic Preview</th>
                    <th>Banner Information</th>
                    <th>Color Customization</th>
                    <th>Target Destination</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {banners.map((b, idx) => (
                    <tr key={b._id}>
                      <td style={{ width: '80px' }}>
                        <div className="order-actions-col">
                          <button 
                            className="order-btn-nav"
                            disabled={idx === 0}
                            onClick={() => handleReorder(idx, 'up')}
                            title="Move slide up"
                          >
                            <FaArrowUp />
                          </button>
                          <span className="order-lbl-badge">#{idx + 1}</span>
                          <button 
                            className="order-btn-nav"
                            disabled={idx === banners.length - 1}
                            onClick={() => handleReorder(idx, 'down')}
                            title="Move slide down"
                          >
                            <FaArrowDown />
                          </button>
                        </div>
                      </td>
                      <td style={{ width: '140px' }}>
                        <div className="banner-preview-img-container">
                          {b.imageUrl ? (
                            <img src={b.imageUrl} alt={b.title} className="banner-table-preview-img" />
                          ) : (
                            <span className="banner-no-img">No Graphic</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="banner-info-td-col">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="banner-tag-badge">{b.tag}</span>
                            <h4 className="banner-title-text">{b.title}</h4>
                          </div>
                          <p className="banner-desc-text">{b.description}</p>
                          {b.highlightWord && (
                            <span className="banner-highlight-word">Highlight: <strong>{b.highlightWord}</strong></span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="colors-grid-td">
                          <div className="color-preview-row">
                            <span className="color-indicator-circle" style={{ background: b.bgGradient }}></span>
                            <span className="color-name-val">Bg Gradient</span>
                          </div>
                          <div className="color-preview-row">
                            <span className="color-indicator-circle" style={{ background: b.textColor || '#ffffff' }}></span>
                            <span className="color-name-val">Text Color</span>
                          </div>
                          <div className="color-preview-row">
                            <span className="color-indicator-circle" style={{ background: b.buttonBgColor || '#ffffff' }}></span>
                            <span className="color-name-val">Btn Color</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="target-link-td-col">
                          <span className="target-btn-label">{b.buttonText || 'Explore Now'}</span>
                          <code className="target-link-code">{b.buttonLink || '/library'}</code>
                          <span className={`is-coupon-badge ${b.isCoupon ? 'coupon' : 'link'}`}>
                            {b.isCoupon ? 'Coupon Slide' : 'Standard Link'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`promo-status-badge ${b.isActive !== false ? 'active' : 'expired'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          {b.isActive !== false ? <FaEye style={{ fontSize: '10px' }} /> : <FaEyeSlash style={{ fontSize: '10px' }} />}
                          {b.isActive !== false ? 'Visible' : 'Hidden'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', position: 'relative' }}>
                        <button 
                          className="file-edit-btn-new"
                          onClick={() => setActiveActionMenuId(activeActionMenuId === b._id ? null : b._id)}
                          style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }}
                        >
                          <FaEllipsisV />
                        </button>
                        {activeActionMenuId === b._id && (
                          <>
                            <div 
                              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998 }} 
                              onClick={() => setActiveActionMenuId(null)}
                            />
                            <div className="popover-action-dropdown-menu" style={{ position: 'absolute', right: '16px', top: '44px', zIndex: 999 }}>
                              <button onClick={() => { setActiveActionMenuId(null); handleOpenEditModal(b); }} className="popover-item">
                                <FaEdit /> Edit Parameters
                              </button>
                              <button 
                                onClick={async () => { 
                                  setActiveActionMenuId(null); 
                                  const formData = new FormData();
                                  formData.append('isActive', (b.isActive === false).toString());
                                  const res = await updateBanner(b._id, formData);
                                  if (res.ok) { loadBanners(); } else { alert('Failed to toggle status.'); }
                                }} 
                                className="popover-item"
                              >
                                {b.isActive !== false ? <FaEyeSlash /> : <FaEye />} 
                                {b.isActive !== false ? 'Hide Slide' : 'Show Slide'}
                              </button>
                              <div style={{ height: '1px', background: '#e2e8f0', margin: '4px 0' }}></div>
                              <button onClick={() => { setActiveActionMenuId(null); handleDeleteBanner(b._id, b.title); }} className="popover-item text-danger">
                                <FaTrash /> Delete Slide
                              </button>
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Slide Edit & Create Modal */}
      {showModal && (
        <div className="emp-modal-overlay">
          <div className="emp-modal-card glass-panel animate-slide" style={{ maxWidth: '1000px', width: '90%' }}>
            <div className="modal-header-new">
              <h3>{isEditMode ? '⚙️ Edit Banner Slide Settings' : '📢 Create New Banner Slide'}</h3>
              <button className="close-modal-btn" onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleBannerSubmit} className="modal-form-new" style={{ padding: '16px 0 0 0', display: 'flex', flexDirection: 'column', maxHeight: '80vh' }}>
              <div className="modal-scroll-body" style={{ overflowY: 'auto', maxHeight: 'calc(75vh - 100px)', paddingRight: '12px', paddingBottom: '12px' }}>
                <div className="modal-grid-2-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  
                  {/* Left Side fields */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className="form-group-new">
                      <label>Banner Title Headline (Main Heading)</label>
                      <input 
                        type="text" 
                        value={bannerTitle} 
                        onChange={(e) => setBannerTitle(e.target.value)} 
                        placeholder="e.g. Join JEE Premium Crash Course"
                        className="glass-input-premium"
                        required
                      />
                    </div>

                    <div className="form-group-new">
                      <label>Highlight Word (Optional - will show in yellow color)</label>
                      <input 
                        type="text" 
                        value={bannerHighlight} 
                        onChange={(e) => setBannerHighlight(e.target.value)} 
                        placeholder="Enter a word from the headline to highlight"
                        className="glass-input-premium"
                      />
                    </div>

                    <div className="form-group-new">
                      <label>Banner Description (Subtitle Details)</label>
                      <textarea 
                        value={bannerDesc} 
                        onChange={(e) => setBannerDesc(e.target.value)} 
                        placeholder="Describe what students get when they click this banner"
                        className="glass-input-premium"
                        rows={3}
                        style={{ resize: 'none', height: '65px', fontFamily: 'inherit' }}
                        required
                      />
                    </div>

                    {/* Headline Tag & Button Text in same row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div className="form-group-new" style={{ marginBottom: 0 }}>
                        <label>Banner Headline Tag Badge</label>
                        <input 
                          type="text" 
                          value={bannerTag} 
                          onChange={(e) => setBannerTag(e.target.value)} 
                          placeholder="e.g. NEW, OFFER, HOT"
                          className="glass-input-premium"
                          required
                        />
                      </div>

                      <div className="form-group-new" style={{ marginBottom: 0 }}>
                        <label>Button Label Text</label>
                        <input 
                          type="text" 
                          value={bannerBtnText} 
                          onChange={(e) => setBannerBtnText(e.target.value)} 
                          placeholder="e.g. Explore Now, Claim Coupon"
                          className="glass-input-premium"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group-new">
                      <label>Button Action Target Link / URL path (e.g. /library or /subscription)</label>
                      <input 
                        type="text" 
                        value={bannerBtnLink} 
                        onChange={(e) => setBannerBtnLink(e.target.value)} 
                        placeholder="e.g. /library, /subscription, or custom URL path"
                        className="glass-input-premium"
                        required
                      />
                    </div>
                  </div>

                  {/* Right Side fields */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    
                    {/* Image Graphic Upload Zone */}
                    <div className="form-group-new">
                      <label>Upload Banner Graphic Image</label>
                      <div 
                        className={`drag-drop-zone ${bannerImagePreview ? 'has-file' : ''}`}
                        onClick={() => document.getElementById('banner-img-file-picker').click()}
                        style={{ padding: '10px', height: '80px' }}
                      >
                        <input 
                          type="file"
                          id="banner-img-file-picker"
                          accept="image/*"
                          onChange={handleFileChange}
                          style={{ display: 'none' }}
                        />
                        {bannerImagePreview ? (
                          <img src={bannerImagePreview} alt="Preview" style={{ maxHeight: '60px', maxWidth: '100%', borderRadius: '6px', objectFit: 'contain' }} />
                        ) : (
                          <div className="dd-placeholder" style={{ gap: '2px' }}>
                            <FaUpload className="dd-icon-large" style={{ fontSize: '15px' }} />
                            <span className="dd-title" style={{ fontSize: '11px', margin: 0 }}>Upload Slide Graphic</span>
                            <span className="dd-subtitle" style={{ fontSize: '8.5px', margin: 0 }}>Aspect ratio 3:1 recommended</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="form-group-new">
                      <label>Background Style Type</label>
                      <select 
                        value={bgType} 
                        onChange={(e) => setBgType(e.target.value)}
                        className="glass-input-premium"
                        style={{ width: '100%' }}
                      >
                        <option value="gradient">🎨 Gradient (Easy Selection)</option>
                        <option value="solid">🖌️ Solid Color (Color Picker)</option>
                        <option value="custom">⚙️ Custom CSS rules (Advanced)</option>
                      </select>
                    </div>

                    {bgType === 'gradient' && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div className="form-group-new">
                          <label>Gradient Start Color</label>
                          <input 
                            type="color" 
                            value={bgStartColor} 
                            onChange={(e) => setBgStartColor(e.target.value)} 
                            className="glass-input-premium"
                            style={{ height: '36px', padding: '2px', cursor: 'pointer' }}
                          />
                        </div>
                        <div className="form-group-new">
                          <label>Gradient End Color</label>
                          <input 
                            type="color" 
                            value={bgEndColor} 
                            onChange={(e) => setBgEndColor(e.target.value)} 
                            className="glass-input-premium"
                            style={{ height: '36px', padding: '2px', cursor: 'pointer' }}
                          />
                        </div>
                      </div>
                    )}

                    {bgType === 'solid' && (
                      <div className="form-group-new">
                        <label>Select Background Color</label>
                        <input 
                          type="color" 
                          value={bgSolidColor} 
                          onChange={(e) => setBgSolidColor(e.target.value)} 
                          className="glass-input-premium"
                          style={{ height: '36px', padding: '2px', cursor: 'pointer' }}
                        />
                      </div>
                    )}

                    {bgType === 'custom' && (
                      <div className="form-group-new">
                        <label>CSS Background Gradient/Color String</label>
                        <input 
                          type="text" 
                          value={bannerBgGradient} 
                          onChange={(e) => setBannerBgGradient(e.target.value)} 
                          placeholder="e.g. linear-gradient(135deg, #4f21db 0%, #7e22ce 100%)"
                          className="glass-input-premium"
                          required
                        />
                      </div>
                    )}

                    {/* Compact Color Pickers Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '4px' }}>
                      <div className="form-group-new" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: '9.5px' }}>Text Color</label>
                        <input 
                          type="color" 
                          value={bannerTextColor} 
                          onChange={(e) => setBannerTextColor(e.target.value)} 
                          className="glass-input-premium"
                          style={{ height: '36px', padding: '2px', cursor: 'pointer' }}
                        />
                      </div>

                      <div className="form-group-new" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: '9.5px' }}>Btn Bg</label>
                        <input 
                          type="color" 
                          value={bannerBtnBgColor} 
                          onChange={(e) => setBannerBtnBgColor(e.target.value)} 
                          className="glass-input-premium"
                          style={{ height: '36px', padding: '2px', cursor: 'pointer' }}
                        />
                      </div>

                      <div className="form-group-new" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: '9.5px' }}>Btn Text</label>
                        <input 
                          type="color" 
                          value={bannerBtnTextColor} 
                          onChange={(e) => setBannerBtnTextColor(e.target.value)} 
                          className="glass-input-premium"
                          style={{ height: '36px', padding: '2px', cursor: 'pointer' }}
                        />
                      </div>
                    </div>

                    {/* Switch Checkboxes */}
                    <div style={{ display: 'flex', gap: '20px', marginTop: '16px' }}>
                      <label className="checkbox-toggle-wrap">
                        <input 
                          type="checkbox" 
                          checked={bannerIsCoupon} 
                          onChange={(e) => setBannerIsCoupon(e.target.checked)} 
                        />
                        <span>Is Coupon Slide?</span>
                      </label>

                      <label className="checkbox-toggle-wrap">
                        <input 
                          type="checkbox" 
                          checked={bannerIsActive} 
                          onChange={(e) => setBannerIsActive(e.target.checked)} 
                        />
                        <span>Is Active Slide?</span>
                      </label>
                    </div>
                  </div>

                </div>
              </div>

              <div className="modal-footer-new" style={{ marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="glass-button size-md secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="glass-button size-md quick-upload-submit-btn" disabled={submitting}>
                  {submitting ? 'Saving settings...' : isEditMode ? 'Update Slide' : 'Create Slide'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .marketing-view {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .view-title {
          font-size: 20px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .view-subtitle {
          font-size: 13px;
          color: #64748b;
        }

        /* Tab Switcher */
        .mkt-tab-switcher {
          display: flex;
          background: #f1f5f9;
          border-radius: 10px;
          padding: 4px;
          gap: 4px;
        }

        .mkt-tab-btn {
          border: none;
          background: none;
          font-size: 12.5px;
          font-weight: 700;
          color: #475569;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }

        .mkt-tab-btn.active {
          background: #ffffff;
          color: #2563eb;
          box-shadow: 0 4px 10px rgba(0,0,0,0.03);
        }

        .marketing-metrics-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .metric-card-mkt {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .mm-lbl {
          font-size: 10px;
          color: #94a3b8;
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.05em;
        }

        .mm-val {
          font-size: 22px;
          font-weight: 800;
          color: #0f172a;
        }

        .mm-trend {
          font-size: 11px;
          color: #64748b;
        }

        .mm-trend.positive {
          color: #10b981;
          font-weight: 700;
        }

        .marketing-grid {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 25px;
        }

        .builder-card, .codes-list-card, .banners-management-panel {
          padding: 24px;
        }

        .builder-card h3, .codes-list-card h3, .banners-panel-header h3 {
          font-size: 15px;
          font-weight: 750;
          color: #0f172a;
          margin: 0 0 16px 0;
        }

        .promos-list-mkt {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .promo-row-mkt {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 14px 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .promo-code-mkt {
          font-size: 14px;
          font-weight: 750;
          color: #0f172a;
          margin-bottom: 2px;
          font-family: monospace;
          letter-spacing: 0.5px;
        }

        .promo-meta-mkt {
          font-size: 11px;
          color: #64748b;
        }

        .promo-stats-mkt {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 6px;
        }

        .promo-redeems {
          font-size: 12px;
          color: #334155;
          font-weight: 700;
        }

        .promo-status-badge {
          display: inline-flex;
          align-items: center;
          font-size: 9px;
          font-weight: 750;
          padding: 2px 8px;
          border-radius: 10px;
          text-transform: uppercase;
        }

        .promo-status-badge.active {
          background: #ecfdf5;
          color: #065f46;
        }
        .promo-status-badge.expired {
          background: #fef2f2;
          color: #991b1b;
        }

        /* Banners Specific layout */
        .banners-panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 16px;
          margin-bottom: 20px;
        }

        .banners-panel-header h3 {
          margin-bottom: 4px;
        }

        .create-banner-trigger-btn {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: #ffffff;
          border: none;
          font-size: 12.5px;
          font-weight: 700;
          padding: 10px 18px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 4px 10px rgba(59, 130, 246, 0.2);
          transition: all 0.2s;
        }

        .create-banner-trigger-btn:hover {
          transform: translateY(-0.5px);
          box-shadow: 0 6px 14px rgba(59, 130, 246, 0.3);
        }

        .banners-empty-state {
          text-align: center;
          padding: 60px 40px;
          border: 1.5px dashed #cbd5e1;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .empty-ad-icon {
          font-size: 38px;
          color: #cbd5e1;
          margin-bottom: 6px;
        }

        .banners-empty-state h4 {
          font-size: 15px;
          font-weight: 750;
          color: #334155;
          margin: 0;
        }

        .banners-empty-state p {
          font-size: 12.5px;
          color: #64748b;
          max-width: 380px;
          line-height: 1.5;
          margin: 0 0 10px 0;
        }

        /* Banner Tables List */
        .banners-list-table-wrapper {
          overflow-x: auto;
        }

        .banners-list-table {
          width: 100%;
          border-collapse: collapse;
        }

        .banners-list-table th {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          color: #64748b;
          letter-spacing: 0.5px;
          padding: 12px 16px;
          border-bottom: 1.5px solid #e2e8f0;
          text-align: left;
        }

        .banners-list-table td {
          padding: 16px;
          border-bottom: 1px solid #f1f5f9;
          font-size: 13px;
          vertical-align: middle;
        }

        .order-actions-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .order-btn-nav {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #64748b;
          font-size: 9px;
          width: 22px;
          height: 22px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .order-btn-nav:hover:not(:disabled) {
          border-color: #3b82f6;
          color: #3b82f6;
          background: #f0f6ff;
        }

        .order-btn-nav:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .order-lbl-badge {
          font-size: 11px;
          font-weight: 800;
          color: #334155;
        }

        .banner-preview-img-container {
          width: 110px;
          height: 55px;
          border-radius: 8px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .banner-table-preview-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .banner-no-img {
          font-size: 10px;
          color: #94a3b8;
          font-style: italic;
        }

        .banner-info-td-col {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .banner-tag-badge {
          background: #3b82f6;
          color: #ffffff;
          font-size: 8.5px;
          font-weight: 800;
          padding: 2.5px 6.5px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .banner-title-text {
          font-size: 13.5px;
          font-weight: 750;
          color: #0f172a;
          margin: 0;
        }

        .banner-desc-text {
          font-size: 11.5px;
          color: #64748b;
          margin: 0;
          line-height: 1.4;
        }

        .banner-highlight-word {
          font-size: 10.5px;
          color: #334155;
        }

        .colors-grid-td {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .color-preview-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .color-indicator-circle {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 1px solid #cbd5e1;
          display: inline-block;
          flex-shrink: 0;
        }

        .color-name-val {
          font-size: 11px;
          color: #475569;
          font-weight: 600;
        }

        .target-link-td-col {
          display: flex;
          flex-direction: column;
          gap: 3px;
          align-items: flex-start;
        }

        .target-btn-label {
          font-size: 11.5px;
          font-weight: 750;
          color: #334155;
        }

        .target-link-code {
          font-family: monospace;
          font-size: 10.5px;
          color: #64748b;
          background: #f1f5f9;
          padding: 1px 5px;
          border-radius: 4px;
        }

        .is-coupon-badge {
          font-size: 8.5px;
          font-weight: 800;
          padding: 1px 6px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .is-coupon-badge.coupon { background: #fef3c7; color: #d97706; }
        .is-coupon-badge.link { background: #e0f2fe; color: #0284c7; }

        .banner-action-buttons-flex {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }

        .checkbox-toggle-wrap {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
          font-weight: 650;
          color: #334155;
          cursor: pointer;
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-in {
          animation: fade-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .emp-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
        }

        .emp-modal-card {
          width: 100%;
          max-width: 1000px;
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid #cbd5e1;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          padding: 24px;
          position: relative;
          color: #334155;
        }

        .modal-header-new {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 12px;
        }

        .modal-header-new h3 {
          font-size: 16px;
          font-weight: 750;
          color: #0f172a;
          margin: 0;
        }

        .close-modal-btn {
          background: none;
          border: none;
          color: #64748b;
          font-size: 14px;
          cursor: pointer;
          transition: color 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
        }

        .close-modal-btn:hover {
          color: #0f172a;
        }

        .form-group-new {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 16px;
          width: 100%;
        }

        .form-group-new label {
          font-size: 11px;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .glass-input-premium {
          background: #ffffff !important;
          border: 1px solid #cbd5e1 !important;
          border-radius: 8px !important;
          padding: 10px 14px !important;
          font-size: 13px !important;
          font-family: inherit !important;
          width: 100%;
          box-sizing: border-box;
          color: #334155 !important;
        }

        .glass-input-premium:focus {
          border-color: #3b82f6 !important;
          outline: none;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        }

        .glass-input-premium[type="color"] {
          padding: 2px !important;
          height: 38px;
          cursor: pointer;
        }

        .drag-drop-zone {
          border: 1.5px dashed #cbd5e1;
          border-radius: 12px;
          padding: 16px;
          text-align: center;
          background: #f8fafc;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          height: 120px;
          box-sizing: border-box;
        }

        .drag-drop-zone:hover {
          border-color: #3b82f6;
          background: #f0f6ff;
        }

        .drag-drop-zone.has-file {
          border-color: #10b981;
          background: #ecfdf5;
        }

        .dd-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .dd-icon-large {
          font-size: 20px;
          color: #64748b;
        }

        .dd-title {
          font-size: 12px;
          font-weight: 700;
          color: #334155;
        }

        .dd-subtitle {
          font-size: 9px;
          color: #94a3b8;
        }

        .checkbox-toggle-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12.5px;
          font-weight: 700;
          color: #475569;
          cursor: pointer;
        }

        .checkbox-toggle-wrap input[type="checkbox"] {
          width: 16px;
          height: 16px;
          cursor: pointer;
          accent-color: #3b82f6;
        }

        .popover-action-dropdown-menu {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
          padding: 6px;
          display: flex;
          flex-direction: column;
          min-width: 160px;
          text-align: left;
        }

        .popover-item {
          background: none;
          border: none;
          color: #334155;
          font-size: 12.5px;
          font-weight: 600;
          padding: 8px 12px;
          width: 100%;
          text-align: left;
          cursor: pointer;
          border-radius: 6px;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: background 0.2s;
        }

        .popover-item:hover {
          background: #f1f5f9;
        }

        .popover-item.text-danger {
          color: #ef4444;
        }

        .popover-item.text-danger:hover {
          background: #fef2f2;
        }
      `}</style>
    </div>
  );
};

export default Marketing;
