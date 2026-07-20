import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import {
  FaPlus,
  FaTrash,
  FaEdit,
  FaUpload,
  FaTimes,
  FaChalkboardTeacher,
  FaEye,
  FaEyeSlash,
  FaArrowUp,
  FaArrowDown,
  FaEllipsisV
} from 'react-icons/fa';

const OnboardingSlides = () => {
  const {
    getOnboardingSlides,
    createOnboardingSlide,
    updateOnboardingSlide,
    deleteOnboardingSlide
  } = useAdmin();

  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingSlideId, setEditingSlideId] = useState(null);

  // Form Fields State
  const [slideTitle, setSlideTitle] = useState('');
  const [slideDesc, setSlideDesc] = useState('');
  const [slideOrder, setSlideOrder] = useState(1);
  const [slideIsActive, setSlideIsActive] = useState(true);
  const [slideImageFile, setSlideImageFile] = useState(null);
  const [slideImagePreview, setSlideImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Popover state
  const [activeActionMenuId, setActiveActionMenuId] = useState(null);

  const loadSlides = async () => {
    setLoading(true);
    setErrorMsg('');
    const res = await getOnboardingSlides();
    if (res.ok) {
      // Sort slides by order index ascending
      const data = res.data?.data || res.data || [];
      const sorted = [...data].sort((a, b) => (a.order || 0) - (b.order || 0));
      setSlides(sorted);
    } else {
      setErrorMsg(res.error?.message || 'Failed to load onboarding slides.');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSlides();
  }, []);

  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setEditingSlideId(null);
    setSlideTitle('');
    setSlideDesc('');
    setSlideOrder(slides.length + 1);
    setSlideIsActive(true);
    setSlideImageFile(null);
    setSlideImagePreview('');
    setShowModal(true);
  };

  const handleOpenEditModal = (slide) => {
    setIsEditMode(true);
    setEditingSlideId(slide._id);
    setSlideTitle(slide.title || '');
    setSlideDesc(slide.description || '');
    setSlideOrder(slide.order || 1);
    setSlideIsActive(slide.isActive !== false);
    setSlideImageFile(null);
    setSlideImagePreview(slide.imageUrl || '');
    setShowModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSlideImageFile(file);
      setSlideImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData();
    formData.append('title', slideTitle);
    formData.append('description', slideDesc);
    formData.append('order', slideOrder.toString());
    formData.append('isActive', slideIsActive.toString());

    if (slideImageFile) {
      formData.append('image', slideImageFile);
    } else if (!isEditMode) {
      alert('Onboarding graphic image file is required.');
      setSubmitting(false);
      return;
    }

    let res;
    if (isEditMode) {
      res = await updateOnboardingSlide(editingSlideId, formData);
    } else {
      res = await createOnboardingSlide(formData);
    }

    setSubmitting(false);
    if (res.ok) {
      setShowModal(false);
      loadSlides();
      alert(isEditMode ? 'Onboarding slide updated successfully!' : 'Onboarding slide created successfully!');
    } else {
      alert(res.error?.message || 'Failed to save onboarding slide.');
    }
  };

  const handleReorder = async (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === slides.length - 1) return;

    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const reordered = [...slides];
    
    // Swap items
    const temp = reordered[index];
    reordered[index] = reordered[targetIdx];
    reordered[targetIdx] = temp;

    const slide1 = reordered[index];
    const slide2 = reordered[targetIdx];

    // Optimistic UI update
    setSlides(reordered);

    const formData1 = new FormData();
    formData1.append('order', (index + 1).toString());
    const formData2 = new FormData();
    formData2.append('order', (targetIdx + 1).toString());

    const res1 = await updateOnboardingSlide(slide1._id, formData1);
    const res2 = await updateOnboardingSlide(slide2._id, formData2);

    if (!res1.ok || !res2.ok) {
      loadSlides(); // revert
      alert('Reordering failed.');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete onboarding slide "${title}"?`)) return;
    const res = await deleteOnboardingSlide(id);
    if (res.ok) {
      loadSlides();
      alert('Onboarding slide deleted successfully.');
    } else {
      alert(res.error?.message || 'Failed to delete slide.');
    }
  };

  return (
    <div className="onboarding-slides-view animate-fade-in">
      <div className="view-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
          <h2 className="view-title">Onboarding Slides</h2>
          <p className="view-subtitle">Configure mobile application walkthrough screens, graphics, and descriptions shown to students.</p>
        </div>
        <button className="create-banner-trigger-btn" onClick={handleOpenAddModal}>
          <FaPlus /> Add Onboarding Slide
        </button>
      </div>



      {loading ? (
        <div className="diagnostics-running" style={{ padding: '60px' }}>
          <div className="pulse-spinner"></div>
          <span>Loading onboarding slides...</span>
        </div>
      ) : errorMsg ? (
        <div className="modal-error-alert">
          ⚠️ {errorMsg}
          <button onClick={loadSlides} className="glass-button size-sm primary" style={{ marginLeft: '15px' }}>Retry</button>
        </div>
      ) : slides.length === 0 ? (
        <div className="banners-empty-state glass-panel">
          <FaChalkboardTeacher className="empty-ad-icon" />
          <h4>No Onboarding Slides Found</h4>
          <p>Create visual slides to guide your students through your app features (visual mock test help, doubt solvers, rewards) during app setup.</p>
          <button className="save-keys-btn" onClick={handleOpenAddModal} style={{ width: 'auto', padding: '10px 20px' }}>
            Create First Slide
          </button>
        </div>
      ) : (
        <div className="banners-management-panel glass-panel">
          <div className="banners-list-table-wrapper">
            <table className="banners-list-table">
              <thead>
                <tr>
                  <th style={{ width: '100px' }}>Sequence</th>
                  <th style={{ width: '150px' }}>Slide Graphic</th>
                  <th>Title & Description</th>
                  <th style={{ width: '120px' }}>Status</th>
                  <th style={{ textAlign: 'right', width: '120px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {slides.map((s, idx) => (
                  <tr key={s._id}>
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
                          disabled={idx === slides.length - 1}
                          onClick={() => handleReorder(idx, 'down')}
                          title="Move slide down"
                        >
                          <FaArrowDown />
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className="banner-preview-img-container">
                        {s.imageUrl ? (() => {
                          // Resolve relative paths (e.g. /onboarding1.png from seed data)
                          // against the student frontend URL since those assets live there
                          const resolvedUrl = s.imageUrl.startsWith('http')
                            ? s.imageUrl
                            : `http://localhost:5173${s.imageUrl}`;
                          return (
                            <img
                              src={resolvedUrl}
                              alt={s.title}
                              className="banner-table-preview-img"
                              style={{ objectFit: 'contain' }}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextSibling.style.display = 'flex';
                              }}
                            />
                          );
                        })() : null}
                        <span
                          className="banner-no-img"
                          style={{ display: s.imageUrl ? 'none' : 'flex', flexDirection: 'column', gap: '4px', fontSize: '10px', textAlign: 'center' }}
                        >
                          No Graphic
                          {s.imageUrl && <span style={{ fontSize: '9px', color: '#94a3b8', wordBreak: 'break-all' }}>{s.imageUrl}</span>}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="banner-info-td-col">
                        <h4 className="banner-title-text">{s.title}</h4>
                        <p className="banner-desc-text" style={{ fontSize: '12px' }}>{s.description}</p>
                      </div>
                    </td>
                    <td>
                      <span className={`promo-status-badge ${s.isActive !== false ? 'active' : 'expired'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        {s.isActive !== false ? <FaEye style={{ fontSize: '10px' }} /> : <FaEyeSlash style={{ fontSize: '10px' }} />}
                        {s.isActive !== false ? 'Visible' : 'Hidden'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', position: 'relative' }}>
                      <button 
                        className="file-edit-btn-new"
                        onClick={() => setActiveActionMenuId(activeActionMenuId === s._id ? null : s._id)}
                        style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        <FaEllipsisV />
                      </button>
                      {activeActionMenuId === s._id && (
                        <>
                          <div 
                            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998 }} 
                            onClick={() => setActiveActionMenuId(null)}
                          />
                          <div className="popover-action-dropdown-menu" style={{ position: 'absolute', right: '16px', top: '44px', zIndex: 999 }}>
                            <button onClick={() => { setActiveActionMenuId(null); handleOpenEditModal(s); }} className="popover-item">
                              <FaEdit /> Edit Parameters
                            </button>
                            <button 
                              onClick={async () => { 
                                setActiveActionMenuId(null); 
                                const formData = new FormData();
                                formData.append('isActive', (s.isActive === false).toString());
                                const res = await updateOnboardingSlide(s._id, formData);
                                if (res.ok) { loadSlides(); } else { alert('Failed to toggle status.'); }
                              }} 
                              className="popover-item"
                            >
                              {s.isActive !== false ? <FaEyeSlash /> : <FaEye />} 
                              {s.isActive !== false ? 'Hide Slide' : 'Show Slide'}
                            </button>
                            <div style={{ height: '1px', background: '#e2e8f0', margin: '4px 0' }}></div>
                            <button onClick={() => { setActiveActionMenuId(null); handleDelete(s._id, s.title); }} className="popover-item text-danger">
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
        </div>
      )}

      {/* Modal Settings Popup */}
      {showModal && (
        <div className="emp-modal-overlay">
          <div className="emp-modal-card glass-panel animate-slide" style={{ maxWidth: '650px', width: '95%' }}>
            <div className="modal-header-new">
              <h3>{isEditMode ? '⚙️ Edit Onboarding Slide' : '📢 Create Onboarding Slide'}</h3>
              <button className="close-modal-btn" onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form-new" style={{ padding: '16px 0 0 0', display: 'flex', flexDirection: 'column', maxHeight: '80vh' }}>
              <div className="modal-scroll-body" style={{ overflowY: 'auto', maxHeight: 'calc(75vh - 100px)', paddingRight: '12px', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                  <div className="form-group-new">
                    <label>Slide Title Headline</label>
                    <input 
                      type="text" 
                      value={slideTitle} 
                      onChange={(e) => setSlideTitle(e.target.value)} 
                      placeholder="e.g. Interactive Doubt Solver"
                      className="glass-input-premium"
                      required
                    />
                  </div>

                  <div className="form-group-new">
                    <label>Slide Description Subtitle</label>
                    <textarea 
                      value={slideDesc} 
                      onChange={(e) => setSlideDesc(e.target.value)} 
                      placeholder="Describe the application features clearly for students"
                      className="glass-input-premium"
                      rows={3}
                      style={{ resize: 'none', height: '70px', fontFamily: 'inherit' }}
                      required
                    />
                  </div>

                  {/* Graphic Upload Dropzone */}
                  <div className="form-group-new">
                    <label>Onboarding Graphic Illustration</label>
                    <div 
                      className={`drag-drop-zone ${slideImagePreview ? 'has-file' : ''}`}
                      onClick={() => document.getElementById('onboard-slide-picker').click()}
                      style={{ padding: '10px', height: '90px' }}
                    >
                      <input 
                        type="file"
                        id="onboard-slide-picker"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                      />
                      {slideImagePreview ? (
                        <img
                          src={slideImagePreview.startsWith('http') ? slideImagePreview : `http://localhost:5173${slideImagePreview}`}
                          alt="Preview"
                          style={{ maxHeight: '70px', maxWidth: '100%', borderRadius: '6px', objectFit: 'contain' }}
                          onError={(e) => { e.currentTarget.style.opacity = '0.3'; }}
                        />
                      ) : (
                        <div className="dd-placeholder" style={{ gap: '2px' }}>
                          <FaUpload className="dd-icon-large" style={{ fontSize: '16px' }} />
                          <span className="dd-title" style={{ fontSize: '11.5px', margin: 0 }}>Select slide graphic image</span>
                          <span className="dd-subtitle" style={{ fontSize: '8.5px', margin: 0 }}>PNG illustrations with transparent background recommended</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-group-new" style={{ marginTop: '4px' }}>
                    <label className="checkbox-toggle-wrap">
                      <input 
                        type="checkbox" 
                        checked={slideIsActive} 
                        onChange={(e) => setSlideIsActive(e.target.checked)} 
                      />
                      <span>Is Slide Active & Visible?</span>
                    </label>
                  </div>

                </div>
              </div>

              <div className="modal-footer-new" style={{ marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="glass-button size-md secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="glass-button size-md quick-upload-submit-btn" disabled={submitting}>
                  {submitting ? 'Saving Slide...' : isEditMode ? 'Update Slide' : 'Create Slide'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .onboarding-slides-view {
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

        .banners-management-panel {
          padding: 24px;
        }

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

        .order-lbl-badge {
          font-size: 11px;
          font-weight: 800;
          color: #334155;
          background: #f1f5f9;
          padding: 4px 10px;
          border-radius: 6px;
        }

        .banner-preview-img-container {
          width: 110px;
          height: 60px;
          border-radius: 8px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .banner-table-preview-img {
          max-width: 100%;
          max-height: 100%;
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

        .banner-title-text {
          font-size: 14px;
          font-weight: 750;
          color: #0f172a;
          margin: 0;
        }

        .banner-desc-text {
          font-size: 12px;
          color: #64748b;
          margin: 0;
          line-height: 1.45;
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

        .banner-action-buttons-flex {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
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

        .order-actions-col {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .order-btn-nav {
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          color: #475569;
          width: 26px;
          height: 26px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 10px;
          transition: all 0.2s;
        }

        .order-btn-nav:hover:not(:disabled) {
          background: #3b82f6;
          border-color: #3b82f6;
          color: #ffffff;
        }

        .order-btn-nav:disabled {
          opacity: 0.4;
          cursor: not-allowed;
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

export default OnboardingSlides;
