import React, { useState, useEffect, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import ActionModal from '../components/ActionModal';
import PdfViewer from '../components/PdfViewer';

const RESOURCE_TYPES = [
  { value: 'notes', label: 'Notes' },
  { value: 'assignments', label: 'Assignments' },
  { value: 'previous_year_papers', label: 'Previous Year Papers' },
  { value: 'sample_papers', label: 'Sample Papers' },
  { value: 'question_bank', label: 'Question Bank' },
  { value: 'formula_sheets', label: 'Formula Sheets' },
  { value: 'reference_material', label: 'Reference Material' },
  { value: 'worksheets', label: 'Worksheets' },
  { value: 'e_books', label: 'E-books' },
  { value: 'lab_manual', label: 'Lab Manual' }
];

const StudyLibrary = () => {
  const {
    resources = [],
    getStudyLibraryResources,
    createStudyResource,
    updateStudyResource,
    deleteStudyResource,
    uploadPdf,
    hasAuth,
    globalLoading,
    globalError
  } = useAdmin();

  // Dropdown states
  const [boards, setBoards] = useState(['CBSE', 'ICSE', 'State Board']);
  const [classes, setClasses] = useState(['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12']);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [topics, setTopics] = useState([]);

  // Selected values
  const [selectedBoard, setSelectedBoard] = useState('CBSE');
  const [selectedClass, setSelectedClass] = useState('Class 1');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedResourceType, setSelectedResourceType] = useState('notes');

  // Form states
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceDescription, setResourceDescription] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [visibility, setVisibility] = useState('active');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editingResource, setEditingResource] = useState(null);

  // Search and filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Loading states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [localResources, setLocalResources] = useState([]);
  
  // PDF Viewer state
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [pdfToView, setPdfToView] = useState(null);

  // Load resources on mount
  useEffect(() => {
    const loadResources = async () => {
      if (hasAuth && getStudyLibraryResources) {
        const data = await getStudyLibraryResources();
        setLocalResources(Array.isArray(data) ? data : []);
      }
    };
    loadResources();
  }, [hasAuth, getStudyLibraryResources]);

  // Load subjects when class changes
  useEffect(() => {
    const loadSubjects = async () => {
      if (selectedClass) {
        // For now, use default subjects based on class
        const defaultSubjects = {
          'Class 1': ['Mathematics', 'Science', 'English'],
          'Class 2': ['Mathematics', 'Science', 'English'],
          'Class 3': ['Mathematics', 'Science', 'English'],
          'Class 4': ['Mathematics', 'Science', 'English'],
          'Class 5': ['Mathematics', 'Science', 'English'],
          'Class 6': ['Mathematics', 'Science', 'English'],
          'Class 7': ['Mathematics', 'Science', 'English'],
          'Class 8': ['Mathematics', 'Science', 'English'],
          'Class 9': ['Mathematics', 'Physics', 'Chemistry', 'Biology'],
          'Class 10': ['Mathematics', 'Physics', 'Chemistry', 'Biology'],
          'Class 11': ['Mathematics', 'Physics', 'Chemistry'],
          'Class 12': ['Mathematics', 'Physics', 'Chemistry']
        };
        setSubjects(defaultSubjects[selectedClass] || []);
      }
    };
    loadSubjects();
  }, [selectedClass]);

  // Load chapters when subject changes
  useEffect(() => {
    if (selectedSubject) {
      // Default chapters
      setChapters(['Chapter 1', 'Chapter 2', 'Chapter 3', 'Chapter 4', 'Chapter 5']);
    }
  }, [selectedSubject]);

  // Load topics when chapter changes
  useEffect(() => {
    if (selectedChapter) {
      setTopics(['Topic 1', 'Topic 2', 'Topic 3']);
    }
  }, [selectedChapter]);

  // Filtered resources
  const filteredResources = useMemo(() => {
    return localResources.filter(resource => {
      const matchesSearch = !searchQuery || 
        (resource.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (resource.subject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (resource.chapter || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = !filterType || resource.resourceType === filterType;
      const matchesStatus = !filterStatus || resource.visibility === filterStatus;
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [localResources, searchQuery, filterType, filterStatus]);

  const openAddModal = () => {
    setModalMode('add');
    setEditingResource(null);
    setResourceTitle('');
    setResourceDescription('');
    setPdfFile(null);
    setThumbnailFile(null);
    setVisibility('active');
    setModalOpen(true);
  };

  const openEditModal = (resource) => {
    setModalMode('edit');
    setEditingResource(resource);
    setResourceTitle(resource.title || '');
    setResourceDescription(resource.description || '');
    setSelectedBoard(resource.board || 'CBSE');
    setSelectedClass(resource.className || 'Class 1');
    setSelectedSubject(resource.subject || '');
    setSelectedChapter(resource.chapter || '');
    setSelectedTopic(resource.topic || '');
    setSelectedResourceType(resource.resourceType || 'notes');
    setVisibility(resource.visibility || 'active');
    setModalOpen(true);
  };

  const handlePdfUpload = async (file) => {
    if (!file) return null;
    
    // Validate file type
    if (file.type !== 'application/pdf') {
      alert('Please select a PDF file only');
      return null;
    }
    
    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return null;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 100);
    
    try {
      const result = await uploadPdf(file);
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (result?.data?.url) {
        return result.data.url;
      }
      return null;
    } catch (error) {
      clearInterval(progressInterval);
      setUploadProgress(0);
      throw error;
    } finally {
      setTimeout(() => setIsUploading(false), 500);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!resourceTitle.trim()) {
      alert('Resource title is required');
      return;
    }
    
    // For multipart upload, send files directly
    const payload = {
      title: resourceTitle,
      description: resourceDescription,
      board: selectedBoard,
      className: selectedClass,
      subject: selectedSubject,
      chapterName: selectedChapter,
      topic: selectedTopic,
      resourceType: selectedResourceType,
      visibility,
      status: visibility, // Map visibility to status
      pdfFile: pdfFile,
      thumbnailFile: thumbnailFile
    };
    
    let success = false;
    if (modalMode === 'add') {
      success = await createStudyResource(payload);
    } else {
      success = await updateStudyResource(editingResource._id, payload);
    }
    
    if (success) {
      setModalOpen(false);
      const data = await getStudyLibraryResources();
      setLocalResources(Array.isArray(data) ? data : []);
    }
  };

  const handleDelete = async (resource) => {
    if (window.confirm(`Are you sure you want to delete "${resource.title}"?`)) {
      const success = await deleteStudyResource(resource._id);
      if (success) {
        setLocalResources(prev => prev.filter(r => r._id !== resource._id));
      }
    }
  };

  const handleDuplicate = async (resource) => {
    const payload = {
      ...resource,
      title: `${resource.title} (Copy)`,
      _id: undefined,
      id: undefined
    };
    const success = await createStudyResource(payload);
    if (success) {
      const data = await getStudyLibraryResources();
      setLocalResources(Array.isArray(data) ? data : []);
    }
  };

  const handleView = (resource) => {
    if (resource.pdf) {
      setPdfToView(resource.pdf);
      setPdfViewerOpen(true);
    }
  };

  const handleDownload = (resource) => {
    if (resource.pdf) {
      const link = document.createElement('a');
      link.href = resource.pdf;
      link.download = `${resource.title || 'document'}.pdf`;
      link.click();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="study-library-view">
      <div className="panel-header">
        <div>
          <h2>Study Library</h2>
          <p>Manage study resources for students</p>
        </div>
        <button className="glass-button" onClick={openAddModal}>
          + Add Resource
        </button>
      </div>

      {/* Filters and Search */}
      <div className="filters-bar glass-panel" style={{ padding: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search by title, subject, chapter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input"
            style={{ flex: '1', minWidth: '200px' }}
          />
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="glass-select"
          >
            <option value="">All Types</option>
            {RESOURCE_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="glass-select"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Resources Table */}
      <div className="table-container glass-panel">
        <table>
          <thead>
            <tr>
              <th>Thumbnail</th>
              <th>Title</th>
              <th>Board</th>
              <th>Class</th>
              <th>Subject</th>
              <th>Chapter</th>
              <th>Type</th>
              <th>Created Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredResources.length > 0 ? (
              filteredResources.map((resource) => (
                <tr key={resource._id || resource.id}>
                  <td>
                    {resource.thumbnail ? (
                      <img 
                        src={resource.thumbnail} 
                        alt="Thumbnail" 
                        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                    ) : (
                      <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    )}
                  </td>
                  <td>{resource.title || '-'}</td>
                  <td>{resource.board || '-'}</td>
                  <td>{resource.className || '-'}</td>
                  <td>{resource.subject || '-'}</td>
                  <td>{resource.chapter || '-'}</td>
                  <td>
                    {RESOURCE_TYPES.find(t => t.value === resource.resourceType)?.label || resource.resourceType || '-'}
                  </td>
                  <td>{formatDate(resource.createdAt)}</td>
                  <td>
                    <span className={`badge ${resource.visibility === 'active' ? 'badge-success' : 'badge-error'}`}>
                      {resource.visibility || 'active'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        className="glass-button secondary" 
                        onClick={() => handleView(resource)}
                        title="View"
                        style={{ padding: '6px 10px', fontSize: '12px' }}
                      >
                        View
                      </button>
                      <button 
                        className="glass-button secondary" 
                        onClick={() => openEditModal(resource)}
                        title="Edit"
                        style={{ padding: '6px 10px', fontSize: '12px' }}
                      >
                        Edit
                      </button>
                      <button 
                        className="glass-button secondary" 
                        onClick={() => handleDuplicate(resource)}
                        title="Duplicate"
                        style={{ padding: '6px 10px', fontSize: '12px' }}
                      >
                        Duplicate
                      </button>
                      <button 
                        className="glass-button secondary" 
                        onClick={() => handleDownload(resource)}
                        title="Download"
                        style={{ padding: '6px 10px', fontSize: '12px' }}
                      >
                        Download
                      </button>
                      <button 
                        className="glass-button secondary" 
                        onClick={() => handleDelete(resource)}
                        title="Delete"
                        style={{ padding: '6px 10px', fontSize: '12px', color: 'var(--error-color)' }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '40px' }}>
                  No resources found. Click "Add Resource" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      <ActionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalMode === 'add' ? 'Add New Resource' : 'Edit Resource'}
        submitText={modalMode === 'add' ? 'Add Resource' : 'Update Resource'}
        onSubmit={handleSubmit}
      >
        <div className="form-group">
          <label>Board</label>
          <select
            className="glass-select"
            value={selectedBoard}
            onChange={(e) => setSelectedBoard(e.target.value)}
          >
            {boards.map(board => (
              <option key={board} value={board}>{board}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Class</label>
          <select
            className="glass-select"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            {classes.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Subject</label>
          <select
            className="glass-select"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="">Select Subject</option>
            {subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Chapter (Optional)</label>
          <select
            className="glass-select"
            value={selectedChapter}
            onChange={(e) => setSelectedChapter(e.target.value)}
          >
            <option value="">Select Chapter</option>
            {chapters.map(chapter => (
              <option key={chapter} value={chapter}>{chapter}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Topic (Optional)</label>
          <select
            className="glass-select"
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
          >
            <option value="">Select Topic</option>
            {topics.map(topic => (
              <option key={topic} value={topic}>{topic}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Resource Type</label>
          <select
            className="glass-select"
            value={selectedResourceType}
            onChange={(e) => setSelectedResourceType(e.target.value)}
          >
            {RESOURCE_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Resource Title *</label>
          <input
            type="text"
            className="glass-input"
            value={resourceTitle}
            onChange={(e) => setResourceTitle(e.target.value)}
            placeholder="Enter resource title"
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            className="glass-textarea"
            value={resourceDescription}
            onChange={(e) => setResourceDescription(e.target.value)}
            placeholder="Enter resource description"
            rows={3}
          />
        </div>

        <div className="form-group">
          <label>PDF File {modalMode === 'add' ? '*' : '(Replace)'}</label>
          <div
            className="glass-panel"
            style={{
              padding: '20px',
              textAlign: 'center',
              cursor: 'pointer',
              border: '2px dashed var(--panel-border)',
              background: 'rgba(10, 15, 24, 0.3)'
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file && file.type === 'application/pdf') {
                setPdfFile(file);
              } else {
                alert('Please drop a PDF file only');
              }
            }}
            onClick={() => document.getElementById('pdf-upload').click()}
          >
            {pdfFile ? (
              <div>
                <p style={{ margin: 0, color: 'var(--success-color)' }}>
                  {pdfFile.name}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Click to replace or drag another PDF
                </p>
              </div>
            ) : (
              <div>
                <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ margin: '0 auto 8px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.9l3.88-2.2a3 3 0 113.72 0l3.88 2.2a4 4 0 01-.88 7.9" />
                </svg>
                <p style={{ margin: 0 }}>Drag & drop PDF or click to browse</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  PDF only, max 10MB
                </p>
              </div>
            )}
            <input
              id="pdf-upload"
              type="file"
              accept="application/pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  if (file.type !== 'application/pdf') {
                    alert('Please select a PDF file only');
                    return;
                  }
                  if (file.size > 10 * 1024 * 1024) {
                    alert('File size must be less than 10MB');
                    return;
                  }
                  setPdfFile(file);
                }
              }}
              style={{ display: 'none' }}
            />
          </div>
          
          {isUploading && (
            <div style={{ marginTop: '10px' }}>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    height: '100%', 
                    width: `${uploadProgress}%`, 
                    background: 'var(--accent-blue)',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Thumbnail (Optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
            className="glass-input"
          />
          {thumbnailFile && (
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Selected: {thumbnailFile.name}
            </p>
          )}
        </div>

        <div className="form-group">
          <label>Visibility</label>
          <select
            className="glass-select"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </ActionModal>

      {/* PDF Viewer Modal */}
      {pdfViewerOpen && pdfToView && (
        <PdfViewer pdfUrl={pdfToView} onClose={() => setPdfViewerOpen(false)} />
      )}

      <style>{`
        .study-library-view {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .filters-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }
        
        .table-container {
          overflow-x: auto;
        }
        
        .glass-panel {
          background: var(--panel-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--panel-border);
          border-radius: 16px;
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
        }
        
        .glass-button.secondary {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--panel-border);
          color: var(--text-primary);
          box-shadow: none;
        }
        
        .glass-button.secondary:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
};

export default StudyLibrary;