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
  FaCheckCircle
} from 'react-icons/fa';

const Marketing = () => {
  const {
    getBanners,
    createBanner,
    updateBanner,
    deleteBanner,
    reorderBanners
  } = useAdmin();

  // Tab state: 'promocodes' or 'banners'
  const [activeTab, setActiveTab] = useState('promocodes');

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
  const [submitting, setSubmitting] = useState(false);

  const loadBanners = async () => {
    setLoadingBanners(true);
    setBannersError('');
    const res = await getBanners();
    if (res.ok) {
      setBanners(res.data?.data || res.data || []);
    } else {
      setBannersError('Failed to fetch banners list.');
    }
    setLoadingBanners(false);
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
    setBannerBgGradient(banner.bgGradient || 'linear-gradient(135deg, #4f21db 0%, #7e22ce 100%)');
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
    formData.append('bgGradient', bannerBgGradient);
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
      <div className="view-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="view-title">Marketing & Promos</h2>
          <p className="view-subtitle">Generate coupon codes, create dynamic graphic slides, and track referral payouts.</p>
        </div>
        
        {/* Tab Selection Switcher */}
        <div className="mkt-tab-switcher">
          <button 
            className={`mkt-tab-btn ${activeTab === 'promocodes' ? 'active' : ''}`}
            onClick={() => setActiveTab('promocodes')}
          >
            <FaTicketAlt /> Coupon Codes
          </button>
          <button 
            className={`mkt-tab-btn ${activeTab === 'banners' ? 'active' : ''}`}
            onClick={() => setActiveTab('banners')}
          >
            <FaAd /> Banner Ads
          </button>
        </div>
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
        <div className="banners-management-panel glass-panel">
          <div className="banners-panel-header">
            <div>
              <h3>Promo Slider Graphic Banners</h3>
              <p className="panel-desc">Manage customizable hero slide banners displayed on the student mobile app homepage.</p>
            </div>
            <button className="create-banner-trigger-btn" onClick={handleOpenAddModal}>
              <FaPlus /> Create Slide Banner
            </button>
          </div>

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
                      <td style={{ textAlign: 'right' }}>
                        <div className="banner-action-buttons-flex">
                          <button className="file-edit-btn-new" onClick={() => handleOpenEditModal(b)} title="Edit banner parameters">
                            <FaEdit />
                          </button>
                          <button className="file-delete-btn" onClick={() => handleDeleteBanner(b._id, b.title)} title="Delete banner slide">
                            <FaTrash />
                          </button>
                        </div>
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
          <div className="emp-modal-card glass-panel animate-slide" style={{ maxWidth: '650px' }}>
            <div className="modal-header-new">
              <h3>{isEditMode ? '⚙️ Edit Banner Slide Settings' : '📢 Create New Banner Slide'}</h3>
              <button className="close-modal-btn" onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleBannerSubmit} className="modal-form-new" style={{ padding: '24px 0 0 0' }}>
              <div className="modal-grid-2-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                
                {/* Left Side fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="form-group-new">
                    <label>Banner Headline Tag</label>
                    <input 
                      type="text" 
                      value={bannerTag} 
                      onChange={(e) => setBannerTag(e.target.value)} 
                      placeholder="e.g. NEW, OFFER, JEE 2026"
                      className="glass-input-premium"
                      required
                    />
                  </div>

                  <div className="form-group-new">
                    <label>Banner Title Headline</label>
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
                    <label>Highlight Word (Optional)</label>
                    <input 
                      type="text" 
                      value={bannerHighlight} 
                      onChange={(e) => setBannerHighlight(e.target.value)} 
                      placeholder="Word inside title to highlight yellow"
                      className="glass-input-premium"
                    />
                  </div>

                  <div className="form-group-new">
                    <label>Secondary Details description</label>
                    <textarea 
                      value={bannerDesc} 
                      onChange={(e) => setBannerDesc(e.target.value)} 
                      placeholder="Describe what students get when they click this banner"
                      className="glass-input-premium"
                      rows={3}
                      style={{ resize: 'none', height: '80px', fontFamily: 'inherit' }}
                      required
                    />
                  </div>

                  <div className="form-group-new">
                    <label>Call To Action Button Text</label>
                    <input 
                      type="text" 
                      value={bannerBtnText} 
                      onChange={(e) => setBannerBtnText(e.target.value)} 
                      placeholder="e.g. Explore Now, Claim Coupon"
                      className="glass-input-premium"
                      required
                    />
                  </div>

                  <div className="form-group-new">
                    <label>CTA Target Navigation Link</label>
                    <input 
                      type="text" 
                      value={bannerBtnLink} 
                      onChange={(e) => setBannerBtnLink(e.target.value)} 
                      placeholder="e.g. /library, /subscription"
                      className="glass-input-premium"
                      required
                    />
                  </div>
                </div>

                {/* Right Side fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* Image Graphic Upload Zone */}
                  <div className="form-group-new">
                    <label>Upload Banner Graphic Image</label>
                    <div 
                      className={`drag-drop-zone ${bannerImagePreview ? 'has-file' : ''}`}
                      onClick={() => document.getElementById('banner-img-file-picker').click()}
                      style={{ padding: '20px 10px', height: '110px' }}
                    >
                      <input 
                        type="file"
                        id="banner-img-file-picker"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                      />
                      {bannerImagePreview ? (
                        <img src={bannerImagePreview} alt="Preview" style={{ maxHeight: '90px', maxWidth: '100%', borderRadius: '6px', objectFit: 'contain' }} />
                      ) : (
                        <div className="dd-placeholder" style={{ gap: '4px' }}>
                          <FaUpload className="dd-icon-large" style={{ fontSize: '18px', marginBottom: '2px' }} />
                          <span className="dd-title" style={{ fontSize: '11.5px' }}>Upload Slide Graphic</span>
                          <span className="dd-subtitle" style={{ fontSize: '9px' }}>Aspect ratio 3:1 recommended</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-group-new">
                    <label>CSS Background Gradient/Color</label>
                    <input 
                      type="text" 
                      value={bannerBgGradient} 
                      onChange={(e) => setBannerBgGradient(e.target.value)} 
                      placeholder="linear-gradient(...) or solid hex like #4f21db"
                      className="glass-input-premium"
                      required
                    />
                  </div>

                  <div className="form-group-new">
                    <label>Text Content Color</label>
                    <input 
                      type="color" 
                      value={bannerTextColor} 
                      onChange={(e) => setBannerTextColor(e.target.value)} 
                      className="glass-input-premium"
                      style={{ height: '36px', padding: '2px' }}
                    />
                  </div>

                  <div className="form-group-new">
                    <label>Button Background Color</label>
                    <input 
                      type="color" 
                      value={bannerBtnBgColor} 
                      onChange={(e) => setBannerBtnBgColor(e.target.value)} 
                      className="glass-input-premium"
                      style={{ height: '36px', padding: '2px' }}
                    />
                  </div>

                  <div className="form-group-new">
                    <label>Button Label Text Color</label>
                    <input 
                      type="color" 
                      value={bannerBtnTextColor} 
                      onChange={(e) => setBannerBtnTextColor(e.target.value)} 
                      className="glass-input-premium"
                      style={{ height: '36px', padding: '2px' }}
                    />
                  </div>

                  {/* Switch Checkboxes */}
                  <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
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

              <div className="modal-footer-new" style={{ marginTop: '24px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
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
          max-width: 650px;
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
      `}</style>
    </div>
  );
};

export default Marketing;
