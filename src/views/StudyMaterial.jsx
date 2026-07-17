import React, { useState, useMemo, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import {
  FaFolder,
  FaFolderOpen,
  FaFilePdf,
  FaPlayCircle,
  FaFileSignature,
  FaPlus,
  FaTrash,
  FaChevronRight,
  FaHome,
  FaExternalLinkAlt,
  FaTimes,
  FaUpload,
  FaCloudUploadAlt,
  FaBookOpen,
  FaEdit
} from 'react-icons/fa';

const normalizeTypeKey = (key) => {
  if (!key) return 'note';
  const clean = key.toLowerCase().trim();
  if (clean === 'notes' || clean === 'note') return 'note';
  if (clean === 'videos' || clean === 'video') return 'video';
  if (clean === 'previous_year_papers' || clean === 'pyq' || clean === 'pyqs') return 'pyq';
  return clean;
};

const StudyMaterial = () => {
  const {
    studyLibrary = [],
    addResourceToSubject,
    updateResourceInSubject,
    addSubjectToClass,
    deleteResourceFromSubject,
    deleteSubjectFromClass,
    uploadPdf,
    fetchStudyLibrary,
    hasAuth,
    globalLoading
  } = useAdmin();

  // Navigation states
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [selectedResourceType, setSelectedResourceType] = useState(null); // 'note', 'video', 'pyq', etc.

  // Edit states
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingResourceId, setEditingResourceId] = useState(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('resource'); // 'subject', 'resource', or 'category'
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // Resource Form states
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceDesc, setResourceDesc] = useState('');
  const [resourceLink, setResourceLink] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Quick Upload Modal Selection states
  const [showQuickModal, setShowQuickModal] = useState(false);
  const [quickClass, setQuickClass] = useState('Class 1');
  const [quickSubjectId, setQuickSubjectId] = useState('');
  const [quickResourceType, setQuickResourceType] = useState('note');
  const [isDragging, setIsDragging] = useState(false);

  // Search/Autocomplete states for Quick Modal
  const [classQuery, setClassQuery] = useState('');
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [subjectQuery, setSubjectQuery] = useState('');
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [typeQuery, setTypeQuery] = useState('');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  // Base list of content types. State allows registering custom types.
  const [resourceTypes, setResourceTypes] = useState([
    { key: 'note', label: 'Notes' },
    { key: 'video', label: 'Video Lectures' },
    { key: 'pyq', label: 'PYQ Papers' },
    { key: 'mock', label: 'Mock Test Papers' }
  ]);

  // Subject-specific custom folder category states
  const [subjectCustomTypes, setSubjectCustomTypes] = useState({});

  // Safety confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmDeleteType, setConfirmDeleteType] = useState(''); // 'subject', 'category', or 'resource'
  const [confirmDeleteTarget, setConfirmDeleteTarget] = useState(null);
  const [confirmTypedText, setConfirmTypedText] = useState('');

  const [libraryLoaded, setLibraryLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!hasAuth || !fetchStudyLibrary || libraryLoaded) return;
      try {
        await fetchStudyLibrary();
      } catch (e) {
        // UI resilient fallback
      } finally {
        if (!cancelled) setLibraryLoaded(true);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [hasAuth, fetchStudyLibrary, libraryLoaded]);

  // Derived data for explorer
  const selectedClassData = useMemo(() => {
    return (studyLibrary || []).find(cls => cls.className === selectedClass) || null;
  }, [selectedClass, studyLibrary]);

  const selectedSubject = useMemo(() => {
    if (!selectedClassData) return null;
    return (selectedClassData.subjects || []).find(sub => sub.id === selectedSubjectId) || null;
  }, [selectedClassData, selectedSubjectId]);

  // Derived data for Quick Upload
  const quickClassData = useMemo(() => {
    return (studyLibrary || []).find(cls => cls.className === quickClass) || null;
  }, [quickClass, studyLibrary]);

  const quickSubjectsList = useMemo(() => {
    return quickClassData ? (quickClassData.subjects || []) : [];
  }, [quickClassData]);



  // Determine active view step: 'classes', 'subjects', 'categories', 'files'
  const currentStep = useMemo(() => {
    if (!selectedClass) return 'classes';
    if (!selectedSubjectId) return 'subjects';
    if (!selectedResourceType) return 'categories';
    return 'files';
  }, [selectedClass, selectedSubjectId, selectedResourceType]);

  // Dynamically extract and assign folder categories for Level 3 (Categories Explorer)
  const categoryFolders = useMemo(() => {
    if (!selectedSubject) return [];

    // Predefined default base folders
    const base = [
      { key: 'note', label: 'Notes', iconClass: 'blue', themeClass: 'blue-theme', icon: FaBookOpen },
      { key: 'video', label: 'Video Lectures', iconClass: 'purple', themeClass: 'purple-theme', icon: FaPlayCircle },
      { key: 'pyq', label: 'Previous Year Papers', iconClass: 'green', themeClass: 'green-theme', icon: FaFileSignature }
    ];

    const existingTypes = new Set(base.map(b => b.key));
    const list = [...base];

    // Find any custom categories created manually for this subject
    const customs = subjectCustomTypes[selectedSubject.id] || [];
    customs.forEach(c => {
      if (!existingTypes.has(c.key)) {
        existingTypes.add(c.key);
        list.push(c);
      }
    });

    // Find any other custom types present in the subject's resource array
    (selectedSubject.notes || []).forEach(n => {
      const typeKey = normalizeTypeKey(n.resourceType || n.type || 'note');
      if (!existingTypes.has(typeKey)) {
        existingTypes.add(typeKey);
        
        // Auto capitalise label (e.g. worksheets -> Worksheets)
        const label = typeKey.charAt(0).toUpperCase() + typeKey.slice(1).replace(/-/g, ' ');
        list.push({
          key: typeKey,
          label: label,
          isCustom: true
        });
      }
    });

    // Map themes and icons cyclically
    const themes = [
      { themeClass: 'blue-theme', iconClass: 'blue', icon: FaFilePdf },
      { themeClass: 'purple-theme', iconClass: 'purple', icon: FaPlayCircle },
      { themeClass: 'green-theme', iconClass: 'green', icon: FaFileSignature },
      { themeClass: 'amber-theme', iconClass: 'amber', icon: FaFolder },
      { themeClass: 'pink-theme', iconClass: 'pink', icon: FaFolder },
      { themeClass: 'indigo-theme', iconClass: 'indigo', icon: FaFolder },
      { themeClass: 'teal-theme', iconClass: 'teal', icon: FaFolder }
    ];

    return list.map((cat, idx) => {
      const selectedTheme = themes[idx % themes.length];
      return {
        ...cat,
        themeClass: cat.themeClass || selectedTheme.themeClass,
        iconClass: cat.iconClass || selectedTheme.iconClass,
        icon: cat.icon || selectedTheme.icon
      };
    });
  }, [selectedSubject, subjectCustomTypes]);

  // Filter resources by selected category/type
  const filteredResources = useMemo(() => {
    if (!selectedSubject) return [];
    return (selectedSubject.notes || []).filter(note => {
      const type = normalizeTypeKey(note.resourceType || note.type || 'note');
      return type === selectedResourceType;
    });
  }, [selectedSubject, selectedResourceType]);

  // Reset explorer view helpers
  const goToRoot = () => {
    setSelectedClass(null);
    setSelectedSubjectId(null);
    setSelectedResourceType(null);
  };

  const goToClass = (className) => {
    setSelectedClass(className);
    setSelectedSubjectId(null);
    setSelectedResourceType(null);
  };

  const goToSubject = (subId) => {
    setSelectedSubjectId(subId);
    setSelectedResourceType(null);
  };

  const handleOpenSubjectModal = () => {
    setModalMode('subject');
    setNewSubjectName('');
    setErrorMsg('');
    setShowModal(true);
  };

  const handleOpenCategoryModal = () => {
    setModalMode('category');
    setNewCategoryName('');
    setErrorMsg('');
    setShowModal(true);
  };

  const handleOpenResourceModal = () => {
    setIsEditMode(false);
    setEditingResourceId(null);
    setModalMode('resource');
    setResourceTitle('');
    setResourceDesc('');
    setResourceLink('');
    setPdfFile(null);
    setErrorMsg('');
    setShowModal(true);
  };

  const handleOpenEditResourceModal = (note) => {
    setIsEditMode(true);
    setEditingResourceId(note.id);
    setModalMode('resource');
    setResourceTitle(note.title || '');
    setResourceDesc(note.content || '');
    setResourceLink(note.link || '');
    setPdfFile(null);
    setErrorMsg('');
    setShowModal(true);
  };

  const handleOpenQuickUpload = () => {
    setResourceTitle('');
    setResourceDesc('');
    setResourceLink('');
    setPdfFile(null);
    setErrorMsg('');

    // Pre-fill Class selection if context is active
    if (selectedClass) {
      setQuickClass(selectedClass);
      setClassQuery(selectedClass);
    } else {
      setQuickClass('');
      setClassQuery('');
    }
    
    // Pre-fill Subject selection if context is active
    if (selectedSubject) {
      setQuickSubjectId(selectedSubject.id);
      setSubjectQuery(selectedSubject.name);
    } else {
      setQuickSubjectId('');
      setSubjectQuery('');
    }
    
    // Pre-fill Content Type selection if context is active
    if (selectedResourceType) {
      const matched = categoryFolders.find(c => c.key === selectedResourceType);
      const typeLabel = matched ? matched.label : selectedResourceType.charAt(0).toUpperCase() + selectedResourceType.slice(1);
      setQuickResourceType(selectedResourceType);
      setTypeQuery(typeLabel);
    } else {
      setQuickResourceType('');
      setTypeQuery('');
    }
    
    setShowQuickModal(true);
  };

  const handleAddSubjectSubmit = async (e) => {
    e.preventDefault();
    if (!newSubjectName.trim() || !selectedClass) return;

    try {
      const newSub = await addSubjectToClass(selectedClass, newSubjectName.trim());
      if (newSub) {
        setShowModal(false);
      } else {
        setErrorMsg('Failed to add subject.');
      }
    } catch (err) {
      setErrorMsg('Error creating subject.');
    }
  };

  const handleAddCategorySubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!newCategoryName.trim() || !selectedSubjectId) {
      setErrorMsg('Category name is required.');
      return;
    }

    const label = newCategoryName.trim();
    const key = label.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // Add to subject specific custom list
    setSubjectCustomTypes(prev => {
      const currentList = prev[selectedSubjectId] || [];
      if (currentList.some(c => c.key === key)) return prev;
      return {
        ...prev,
        [selectedSubjectId]: [...currentList, { key, label }]
      };
    });

    // Sync to global uploader type suggestions list
    setResourceTypes(prev => {
      if (prev.some(t => t.key === key)) return prev;
      return [...prev, { key, label }];
    });

    setShowModal(false);
  };

  const handleAddResourceSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!resourceTitle.trim()) {
      setErrorMsg('Title is required.');
      return;
    }

    let finalLink = resourceLink.trim();
    if (pdfFile) {
      setUploadingFile(true);
      try {
        const subjectName = selectedSubject?.name || 'General';
        const uploadResult = await uploadPdf(pdfFile, selectedClass, subjectName);
        if (uploadResult.ok) {
          const apiData = uploadResult.data;
          finalLink = apiData?.url || apiData?.data?.url;
        } else {
          setErrorMsg(uploadResult.error?.message || 'Failed to upload file.');
          setUploadingFile(false);
          return;
        }
      } catch (err) {
        setErrorMsg(err.message || 'File upload error.');
        setUploadingFile(false);
        return;
      }
      setUploadingFile(false);
    }

    try {
      let success;
      if (isEditMode) {
        success = await updateResourceInSubject(selectedClass, selectedSubjectId, editingResourceId, {
          title: resourceTitle,
          content: resourceDesc || 'No description provided.',
          link: finalLink,
          resourceType: selectedResourceType
        });
      } else {
        success = await addResourceToSubject(selectedClass, selectedSubjectId, {
          title: resourceTitle,
          content: resourceDesc || 'No description provided.',
          link: finalLink,
          resourceType: selectedResourceType
        });
      }

      if (success) {
        setShowModal(false);
      } else {
        setErrorMsg(isEditMode ? 'Failed to update study resource.' : 'Failed to save study resource.');
      }
    } catch (err) {
      setErrorMsg('Error saving resource.');
    }
  };

  const handleQuickUploadSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!quickClass || !quickSubjectId || !quickResourceType) {
      setErrorMsg('Please select class, subject, and content type from suggestions.');
      return;
    }

    if (!resourceTitle.trim()) {
      setErrorMsg('Title is required.');
      return;
    }

    const isVideoType = quickResourceType === 'video';

    let finalLink = resourceLink.trim();
    if (!isVideoType && pdfFile) {
      setUploadingFile(true);
      try {
        const quickSubObj = quickSubjectsList.find(s => s.id === quickSubjectId);
        const quickSubjectName = quickSubObj ? quickSubObj.name : 'General';
        const uploadResult = await uploadPdf(pdfFile, quickClass, quickSubjectName);
        if (uploadResult.ok) {
          const apiData = uploadResult.data;
          finalLink = apiData?.url || apiData?.data?.url;
        } else {
          setErrorMsg(uploadResult.error?.message || 'Failed to upload PDF file.');
          setUploadingFile(false);
          return;
        }
      } catch (err) {
        setErrorMsg(err.message || 'PDF upload error.');
        setUploadingFile(false);
        return;
      }
      setUploadingFile(false);
    }

    const finalType = quickResourceType === 'mock' ? 'pyq' : quickResourceType;
    const finalTitle = quickResourceType === 'mock' 
      ? `${resourceTitle.trim()} (Mock Test)`
      : resourceTitle.trim();

    try {
      const success = await addResourceToSubject(quickClass, quickSubjectId, {
        title: finalTitle,
        content: resourceDesc || 'No description provided.',
        link: finalLink,
        resourceType: finalType
      });

      if (success) {
        setShowQuickModal(false);
      } else {
        setErrorMsg('Failed to save study resource.');
      }
    } catch (err) {
      setErrorMsg('Error adding resource.');
    }
  };

  // Safe confirm-trigger deletions
  const handleDeleteSubject = (subId, subName) => {
    setConfirmDeleteType('subject');
    setConfirmDeleteTarget({ subjectId: subId, name: subName });
    setConfirmTypedText('');
    setShowConfirmModal(true);
  };

  const handleDeleteCategory = (catKey, catLabel, count) => {
    setConfirmDeleteType('category');
    setConfirmDeleteTarget({ categoryKey: catKey, label: catLabel, count });
    setConfirmTypedText('');
    setShowConfirmModal(true);
  };

  const handleDeleteResource = (noteId, noteTitle) => {
    setConfirmDeleteType('resource');
    setConfirmDeleteTarget({ noteId, title: noteTitle });
    setConfirmTypedText('');
    setShowConfirmModal(true);
  };

  const handleExecuteDeletion = async () => {
    if (confirmTypedText !== 'DELETE') return;

    if (confirmDeleteType === 'subject') {
      try {
        await deleteSubjectFromClass(selectedClass, confirmDeleteTarget.subjectId);
      } catch (err) {
        alert('Failed to delete subject.');
      }
    } 
    else if (confirmDeleteType === 'category') {
      const targetCategoryKey = confirmDeleteTarget.categoryKey;
      const notesToDelete = (selectedSubject.notes || []).filter(
        n => normalizeTypeKey(n.resourceType || n.type || 'note') === targetCategoryKey
      );
      
      for (const note of notesToDelete) {
        try {
          await deleteResourceFromSubject(selectedClass, selectedSubjectId, note.id);
        } catch (e) {
          // ignore
        }
      }
    } 
    else if (confirmDeleteType === 'resource') {
      try {
        await deleteResourceFromSubject(selectedClass, selectedSubjectId, confirmDeleteTarget.noteId);
      } catch (err) {
        alert('Failed to delete resource.');
      }
    }

    setShowConfirmModal(false);
  };

  // Drag & Drop event handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        setPdfFile(file);
      } else {
        setErrorMsg('Only PDF files are allowed inside this category.');
      }
    }
  };

  const triggerFileInput = () => {
    document.getElementById('modal-pdf-file-picker')?.click();
  };

  const triggerQuickFileInput = () => {
    document.getElementById('quick-pdf-file-picker')?.click();
  };

  // Autocomplete Filtering logic
  const filteredClasses = useMemo(() => {
    return (studyLibrary || []).filter(c => 
      c.className.toLowerCase().includes(classQuery.toLowerCase())
    );
  }, [classQuery, studyLibrary]);

  const filteredSubjects = useMemo(() => {
    if (!subjectQuery.trim()) return quickSubjectsList;
    return quickSubjectsList.filter(s => 
      s.name.toLowerCase().includes(subjectQuery.toLowerCase())
    );
  }, [subjectQuery, quickSubjectsList]);

  const exactSubjectExists = useMemo(() => {
    return quickSubjectsList.some(s => s.name.toLowerCase() === subjectQuery.toLowerCase().trim());
  }, [subjectQuery, quickSubjectsList]);

  const filteredTypes = useMemo(() => {
    return resourceTypes.filter(t => 
      t.label.toLowerCase().includes(typeQuery.toLowerCase())
    );
  }, [typeQuery, resourceTypes]);

  const exactTypeExists = useMemo(() => {
    return resourceTypes.some(t => t.label.toLowerCase() === typeQuery.toLowerCase().trim());
  }, [typeQuery, resourceTypes]);

  return (
    <div className="studymaterial-view-new">
      {/* Breadcrumbs Navigation with Quick Upload button */}
      <div className="study-breadcrumbs glass-panel">
        <div className="breadcrumbs-trail">
          <button className="breadcrumb-item home" onClick={goToRoot}>
            <FaHome className="bc-home-icon" /> Study Library
          </button>

          {selectedClass && (
            <>
              <FaChevronRight className="bc-separator" />
              <button className="breadcrumb-item" onClick={() => goToClass(selectedClass)}>
                Class {selectedClass.replace('Class ', '')}
              </button>
            </>
          )}

          {selectedSubject && (
            <>
              <FaChevronRight className="bc-separator" />
              <button className="breadcrumb-item" onClick={() => goToSubject(selectedSubject.id)}>
                {selectedSubject.name}
              </button>
            </>
          )}

          {selectedResourceType && (
            <>
              <FaChevronRight className="bc-separator" />
              <span className="breadcrumb-item active">
                {categoryFolders.find(c => c.key === selectedResourceType)?.label || selectedResourceType}
              </span>
            </>
          )}
        </div>

        {/* Header Direct Action Option */}
        <button className="glass-button size-sm primary quick-upload-header-btn" onClick={handleOpenQuickUpload}>
          <FaUpload style={{ marginRight: '6px' }} /> Quick Upload
        </button>
      </div>

      {/* Main Folder Explorer Grid */}
      <div className="explorer-container">
        
        {/* Step 1: Classes grid */}
        {currentStep === 'classes' && (
          <div className="explorer-section">
            <h3 className="section-title-new">Classes / Standards</h3>
            <div className="folders-grid-new">
              {studyLibrary.map((cls) => (
                <div 
                  key={cls.className} 
                  className="folder-card-new class-folder"
                  onClick={() => goToClass(cls.className)}
                >
                  <div className="folder-icon-wrapper yellow">
                    <FaFolderOpen className="f-icon" />
                  </div>
                  <div className="folder-info-col">
                    <span className="folder-name-text">{cls.className}</span>
                    <span className="folder-subtext">{(cls.subjects || []).length} Subjects</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Subjects grid inside selected class */}
        {currentStep === 'subjects' && selectedClassData && (
          <div className="explorer-section">
            <div className="section-header-new">
              <h3 className="section-title-new">Subjects for {selectedClassData.className}</h3>
            </div>
            
            <div className="folders-grid-new">
              {/* Dotted Plus Card for adding subject */}
              <div className="folder-card-new add-new-folder-card" onClick={handleOpenSubjectModal}>
                <div className="folder-icon-wrapper dotted">
                  <FaPlus className="f-icon" />
                </div>
                <div className="folder-info-col">
                  <span className="folder-name-text add-lbl">New Subject</span>
                  <span className="folder-subtext">Add to class</span>
                </div>
              </div>

              {(selectedClassData.subjects || []).map((sub) => (
                <div 
                  key={sub.id} 
                  className="folder-card-new subject-folder"
                  style={{ position: 'relative' }}
                  onClick={() => goToSubject(sub.id)}
                >
                  <div className="folder-icon-wrapper amber">
                    <FaFolder className="f-icon" />
                  </div>
                  <div className="folder-info-col" style={{ flexGrow: 1, paddingRight: '24px' }}>
                    <span className="folder-name-text">{sub.name}</span>
                    <span className="folder-subtext">{(sub.notes || []).length} Resources</span>
                  </div>
                  
                  {/* Delete Subject Button */}
                  <button 
                    className="folder-delete-btn-new"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSubject(sub.id, sub.name);
                    }}
                    title="Delete Subject"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Dynamic category folders inside subject */}
        {currentStep === 'categories' && selectedSubject && (
          <div className="explorer-section">
            <h3 className="section-title-new">
              {selectedSubject.name} <span className="title-muted">({selectedClassData.className})</span>
            </h3>
            
            <div className="folders-grid-new category-folders">
              {/* Dotted Plus Card for adding content category folder */}
              <div className="folder-card-new add-new-folder-card" onClick={handleOpenCategoryModal}>
                <div className="folder-icon-wrapper dotted">
                  <FaPlus className="f-icon" />
                </div>
                <div className="folder-info-col">
                  <span className="folder-name-text add-lbl">New Category</span>
                  <span className="folder-subtext">Add to subject</span>
                </div>
              </div>

              {categoryFolders.map((cat) => {
                const IconComponent = cat.icon;
                const count = (selectedSubject.notes || []).filter(n => normalizeTypeKey(n.resourceType || n.type || 'note') === cat.key).length;
                return (
                  <div 
                    key={cat.key}
                    className={`folder-card-new category-folder ${cat.themeClass}`}
                    style={{ position: 'relative' }}
                    onClick={() => setSelectedResourceType(cat.key)}
                  >
                    <div className={`folder-icon-wrapper ${cat.iconClass}`}>
                      <IconComponent className="f-icon" />
                    </div>
                    <div className="folder-info-col" style={{ flexGrow: 1, paddingRight: '24px' }}>
                      <span className="folder-name-text">{cat.label}</span>
                      <span className="folder-subtext">
                        {count} documents
                      </span>
                    </div>

                    {/* Delete Category Button */}
                    <button 
                      className="folder-delete-btn-new"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCategory(cat.key, cat.label, count);
                      }}
                      title="Delete Category Content"
                    >
                      <FaTrash />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Files list inside selected Category */}
        {currentStep === 'files' && selectedSubject && (
          <div className="explorer-section glass-panel files-explorer-card">
            <div className="section-header-new">
              <div>
                <h3 className="section-title-new">
                  {categoryFolders.find(c => c.key === selectedResourceType)?.label || selectedResourceType}
                </h3>
                <p className="section-desc-new">
                  {selectedClassData.className} • {selectedSubject.name}
                </p>
              </div>
              <button className="glass-button size-md primary quick-upload-header-btn" onClick={handleOpenResourceModal}>
                <FaPlus style={{ marginRight: '6px' }} /> Add Resource
              </button>
            </div>

            {filteredResources.length === 0 ? (
              <div className="files-empty-state-new animate-fade-in">
                <div className="empty-icon-glowing-wrapper">
                  <div className="glow-backdrop"></div>
                  <div className="floating-folder-wrapper">
                    <FaFolderOpen className="glowing-folder-icon" />
                  </div>
                </div>
                
                <h4 className="empty-title-gradient">This Folder is Empty</h4>
                <p className="empty-desc-premium">
                  Upload PDFs, research papers, question banks, or lecture videos to build this subject's library and share resources instantly with students.
                </p>
                
                <button 
                  className="premium-action-btn" 
                  onClick={handleOpenResourceModal}
                >
                  <FaPlus className="btn-plus-icon" /> Add Your First Resource
                </button>
              </div>
            ) : (
              <div className="files-table-wrapper">
                <table className="files-table">
                  <thead>
                    <tr>
                      <th>Resource Details</th>
                      <th>Category</th>
                      <th>Reference URL / File</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResources.map((note) => (
                      <tr key={note.id}>
                        <td>
                          <div className="file-detail-cell">
                            <span className={`file-type-icon ${selectedResourceType === 'video' ? 'video' : 'note'}`}>
                              {selectedResourceType === 'video' ? <FaPlayCircle /> : <FaFilePdf />}
                            </span>
                            <div className="file-text-col">
                              <span className="file-name-title">{note.title}</span>
                              <span className="file-desc-text">{note.content}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`file-badge-pill ${selectedResourceType === 'video' ? 'video' : selectedResourceType === 'pyq' ? 'pyq' : 'note'}`}>
                            {categoryFolders.find(c => c.key === selectedResourceType)?.label || selectedResourceType}
                          </span>
                        </td>
                        <td>
                          {note.link ? (
                            <a 
                              href={note.link} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="file-link-button"
                            >
                              <FaExternalLinkAlt style={{ marginRight: '5px', fontSize: '10px' }} /> View Attachment
                            </a>
                          ) : (
                            <span className="no-link-text">No attachment links</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button 
                              className="file-edit-btn-new" 
                              title="Edit file resource"
                              onClick={() => handleOpenEditResourceModal(note)}
                            >
                              <FaEdit />
                            </button>
                            <button 
                              className="file-delete-btn" 
                              title="Remove file resource"
                              onClick={() => handleDeleteResource(note.id, note.title)}
                            >
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
      </div>

      {/* Modal: Subject Add / Category Add / Local Directory Upload */}
      {showModal && (
        <div className="emp-modal-overlay">
          <div className="emp-modal-card glass-panel animate-slide">
            <div className="modal-header-new">
              <h3>
                {modalMode === 'subject' && 'Add New Subject'}
                {modalMode === 'category' && 'Add New Content Category'}
                {modalMode === 'resource' && `Add ${selectedResourceType === 'video' ? 'Video Lecture' : selectedResourceType === 'pyq' ? 'Previous Year Paper' : 'Note/Book'}`}
              </h3>
              <button className="close-modal-btn" onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>

            {modalMode === 'subject' ? (
              <form onSubmit={handleAddSubjectSubmit} className="modal-form-new">
                {errorMsg && <div className="modal-error-alert">⚠️ {errorMsg}</div>}
                
                <div className="form-group-new">
                  <label>Subject Name</label>
                  <input 
                    type="text" 
                    value={newSubjectName} 
                    onChange={(e) => setNewSubjectName(e.target.value)} 
                    placeholder="Example: Physics, Biology, Social Science..."
                    required
                    autoFocus
                  />
                </div>

                <div className="modal-footer-new">
                  <button type="button" className="glass-button size-md secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="glass-button size-md quick-upload-submit-btn">
                    Add Subject
                  </button>
                </div>
              </form>
            ) : modalMode === 'category' ? (
              <form onSubmit={handleAddCategorySubmit} className="modal-form-new">
                {errorMsg && <div className="modal-error-alert">⚠️ {errorMsg}</div>}
                
                <div className="form-group-new">
                  <label>Category Name</label>
                  <input 
                    type="text" 
                    value={newCategoryName} 
                    onChange={(e) => setNewCategoryName(e.target.value)} 
                    placeholder="Example: Worksheets, Practice Sets, Blueprint..."
                    required
                    autoFocus
                  />
                </div>

                <div className="modal-footer-new">
                  <button type="button" className="glass-button size-md secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="glass-button size-md quick-upload-submit-btn">
                    Add Category
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleAddResourceSubmit} className="modal-form-new">
                {errorMsg && <div className="modal-error-alert">⚠️ {errorMsg}</div>}

                <div className="form-group-new">
                  <label>Resource Title</label>
                  <input 
                    type="text" 
                    value={resourceTitle} 
                    onChange={(e) => setResourceTitle(e.target.value)} 
                    placeholder={selectedResourceType === 'video' ? 'Example: Laws of Motion lecture video' : 'Example: Class 10 Physics formula notes'}
                    required
                    autoFocus
                  />
                </div>

                <div className="form-group-new">
                  <label>Description / Details</label>
                  <textarea 
                    value={resourceDesc} 
                    onChange={(e) => setResourceDesc(e.target.value)} 
                    placeholder="Enter short description or instructions for students"
                    rows={3}
                    className="modal-textarea-new"
                  />
                </div>

                <div className="form-group-new">
                  <label>{selectedResourceType === 'video' ? 'Upload Video File' : 'Drag & Drop Content File'}</label>
                  
                  {/* Drag & Drop Zone */}
                  <div 
                    className={`drag-drop-zone ${isDragging ? 'dragging' : ''} ${pdfFile ? 'has-file' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={triggerFileInput}
                  >
                    <input 
                      type="file" 
                      id="modal-pdf-file-picker"
                      accept={selectedResourceType === 'video' ? 'video/*' : 'application/pdf'}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (selectedResourceType === 'video') {
                          if (file.type.startsWith('video/')) {
                            setPdfFile(file);
                          } else {
                            setErrorMsg('Only video files are allowed.');
                          }
                        } else {
                          if (file.type === 'application/pdf') {
                            setPdfFile(file);
                          } else {
                            setErrorMsg('Only PDF files are allowed.');
                          }
                        }
                      }}
                      style={{ display: 'none' }}
                    />
                    <FaCloudUploadAlt className="dd-icon-large" />
                    {pdfFile ? (
                      <div className="dd-success-file">
                        <span className="dd-filename">{pdfFile.name}</span>
                        <span className="dd-filesize">({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                      </div>
                    ) : (
                      <div className="dd-placeholder">
                        <span className="dd-title">
                          {selectedResourceType === 'video' ? 'Drag & Drop Video file here' : 'Drag & Drop PDF file here'}
                        </span>
                        <span className="dd-subtitle">or click to choose file from your system</span>
                      </div>
                    )}
                  </div>

                  <div className="form-group-new" style={{ marginTop: '12px' }}>
                    <label>Or Paste URL Link {pdfFile ? '(Optional)' : '(Required if no file uploaded)'}</label>
                    <input 
                      type="url" 
                      value={resourceLink} 
                      onChange={(e) => setResourceLink(e.target.value)} 
                      placeholder={selectedResourceType === 'video' ? 'https://youtube.com/watch?v=...' : 'https://drive.google.com/...'}
                      required={!pdfFile}
                    />
                  </div>
                </div>

                <div className="modal-footer-new">
                  <button type="button" className="glass-button size-md secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="glass-button size-md quick-upload-submit-btn" disabled={uploadingFile || globalLoading}>
                    {uploadingFile ? 'Uploading file...' : globalLoading ? 'Saving...' : 'Add Resource'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal: Direct / Quick Add Autocomplete Explorer Uploader */}
      {showQuickModal && (
        <div className="emp-modal-overlay">
          <div className="emp-modal-card glass-panel animate-slide">
            <div className="modal-header-new">
              <h3>⚡ Quick Upload Resource</h3>
              <button className="close-modal-btn" onClick={() => setShowQuickModal(false)}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleQuickUploadSubmit} className="modal-form-new">
              {errorMsg && <div className="modal-error-alert">⚠️ {errorMsg}</div>}

              {/* Selection Rows */}
              <div className="form-grid-3col">
                {/* 1. SELECT CLASS SEARCH AUTOCOMPLETE */}
                <div className="form-group-new selector-group">
                  <label>1. Select Class</label>
                  <div className="combobox-container">
                    <input 
                      type="text" 
                      value={classQuery}
                      onChange={(e) => {
                        setClassQuery(e.target.value);
                        setShowClassDropdown(true);
                      }}
                      onFocus={() => setShowClassDropdown(true)}
                      onBlur={() => setTimeout(() => setShowClassDropdown(false), 200)}
                      placeholder="Type class..."
                    />
                    {showClassDropdown && filteredClasses.length > 0 && (
                      <div className="combobox-dropdown">
                        {filteredClasses.map(cls => (
                          <div 
                            key={cls.className} 
                            className="combobox-item"
                            onClick={() => {
                              setQuickClass(cls.className);
                              setClassQuery(cls.className);
                              setQuickSubjectId('');
                              setSubjectQuery('');
                              setShowClassDropdown(false);
                            }}
                          >
                            {cls.className}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. SELECT SUBJECT SEARCH AUTOCOMPLETE & DYNAMIC CREATION */}
                <div className="form-group-new selector-group">
                  <label>2. Select Subject</label>
                  <div className="combobox-container">
                    <input 
                      type="text" 
                      value={subjectQuery}
                      onChange={(e) => {
                        setSubjectQuery(e.target.value);
                        setShowSubjectDropdown(true);
                      }}
                      onFocus={() => setShowSubjectDropdown(true)}
                      onBlur={() => setTimeout(() => setShowSubjectDropdown(false), 200)}
                      placeholder="Search or type subject..."
                    />
                    {showSubjectDropdown && (
                      <div className="combobox-dropdown">
                        {filteredSubjects.map(sub => (
                          <div 
                            key={sub.id} 
                            className="combobox-item"
                            onClick={() => {
                              setQuickSubjectId(sub.id);
                              setSubjectQuery(sub.name);
                              setShowSubjectDropdown(false);
                            }}
                          >
                            {sub.name}
                          </div>
                        ))}
                        {subjectQuery.trim() && !exactSubjectExists && (
                          <div 
                            className="combobox-item create-new-item"
                            onClick={async () => {
                              const newSub = await addSubjectToClass(quickClass, subjectQuery.trim());
                              if (newSub) {
                                setQuickSubjectId(newSub.id);
                                setSubjectQuery(newSub.name);
                              }
                              setShowSubjectDropdown(false);
                            }}
                          >
                            ✨ Create: "{subjectQuery.trim()}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. CONTENT TYPE SEARCH AUTOCOMPLETE & CREATION */}
                <div className="form-group-new selector-group">
                  <label>3. Content Type</label>
                  <div className="combobox-container">
                    <input 
                      type="text" 
                      value={typeQuery}
                      onChange={(e) => {
                        setTypeQuery(e.target.value);
                        setShowTypeDropdown(true);
                      }}
                      onFocus={() => setShowTypeDropdown(true)}
                      onBlur={() => setTimeout(() => setShowTypeDropdown(false), 200)}
                      placeholder="Type content type..."
                    />
                    {showTypeDropdown && (
                      <div className="combobox-dropdown">
                        {filteredTypes.map(t => (
                          <div 
                            key={t.key} 
                            className="combobox-item"
                            onClick={() => {
                              setQuickResourceType(t.key);
                              setTypeQuery(t.label);
                              setShowTypeDropdown(false);
                            }}
                          >
                            {t.label}
                          </div>
                        ))}
                        {typeQuery.trim() && !exactTypeExists && (
                          <div 
                            className="combobox-item create-new-item"
                            onClick={() => {
                              const newLabel = typeQuery.trim();
                              const newKey = newLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                              
                              // Add to custom resource types
                              setResourceTypes(prev => [...prev, { key: newKey, label: newLabel }]);
                              setQuickResourceType(newKey);
                              setTypeQuery(newLabel);
                              setShowTypeDropdown(false);
                            }}
                          >
                            ✨ Create Type: "{typeQuery.trim()}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Resource Fields */}
              <div className="form-group-new">
                <label>Resource Title</label>
                <input 
                  type="text" 
                  value={resourceTitle} 
                  onChange={(e) => setResourceTitle(e.target.value)} 
                  placeholder="Enter file title (e.g. Laws of Motion lecture video)"
                  required
                />
              </div>

              <div className="form-group-new">
                <label>Description / Details</label>
                <textarea 
                  value={resourceDesc} 
                  onChange={(e) => setResourceDesc(e.target.value)} 
                  placeholder="Enter short description or instructions for students"
                  rows={2}
                  className="modal-textarea-new"
                />
              </div>

              <div className="form-group-new">
                <label>{quickResourceType === 'video' ? 'Upload Video File' : 'Drag & Drop Content File'}</label>
                
                {/* Drag & Drop Zone */}
                <div 
                  className={`drag-drop-zone ${isDragging ? 'dragging' : ''} ${pdfFile ? 'has-file' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={triggerQuickFileInput}
                >
                  <input 
                    type="file" 
                    id="quick-pdf-file-picker"
                    accept={quickResourceType === 'video' ? 'video/*' : 'application/pdf'}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (quickResourceType === 'video') {
                        if (file.type.startsWith('video/')) {
                          setPdfFile(file);
                        } else {
                          setErrorMsg('Only video files are allowed.');
                        }
                      } else {
                        if (file.type === 'application/pdf') {
                          setPdfFile(file);
                        } else {
                          setErrorMsg('Only PDF files are allowed.');
                        }
                      }
                    }}
                    style={{ display: 'none' }}
                  />
                  <FaCloudUploadAlt className="dd-icon-large" />
                  {pdfFile ? (
                    <div className="dd-success-file">
                      <span className="dd-filename">{pdfFile.name}</span>
                      <span className="dd-filesize">({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                  ) : (
                    <div className="dd-placeholder">
                      <span className="dd-title">
                        {quickResourceType === 'video' ? 'Drag & Drop Video file here' : 'Drag & Drop PDF file here'}
                      </span>
                      <span className="dd-subtitle">or click to choose file from your system</span>
                    </div>
                  )}
                </div>

                <div className="form-group-new" style={{ marginTop: '12px' }}>
                  <label>Or Paste URL Link {pdfFile ? '(Optional)' : '(Required if no file uploaded)'}</label>
                  <input 
                    type="url" 
                    value={resourceLink} 
                    onChange={(e) => setResourceLink(e.target.value)} 
                    placeholder={quickResourceType === 'video' ? 'https://youtube.com/watch?v=...' : 'https://drive.google.com/...'}
                    required={!pdfFile}
                  />
                </div>
              </div>

              <div className="modal-footer-new">
                <button type="button" className="glass-button size-md secondary" onClick={() => setShowQuickModal(false)}>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="glass-button size-md quick-upload-submit-btn" 
                  disabled={uploadingFile || globalLoading}
                >
                  {uploadingFile ? (
                    'Uploading file...'
                  ) : globalLoading ? (
                    'Saving...'
                  ) : (
                    <>
                      <FaUpload style={{ marginRight: '6px' }} /> Upload Resource
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Security Confirmation Modal */}
      {showConfirmModal && (
        <div className="emp-modal-overlay" style={{ zIndex: 3000 }}>
          <div className="emp-modal-card glass-panel animate-slide" style={{ maxWidth: '480px' }}>
            <div className="modal-header-new" style={{ borderBottomColor: '#fca5a5' }}>
              <h3 style={{ color: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                ⚠️ Dangerous Action!
              </h3>
              <button className="close-modal-btn" onClick={() => setShowConfirmModal(false)}>
                <FaTimes />
              </button>
            </div>

            <div style={{ marginTop: '14px' }}>
              <p style={{ fontSize: '13.5px', color: '#334155', lineHeight: '1.5', margin: '0 0 10px 0' }}>
                You are about to delete the following {confirmDeleteType}:
              </p>
              
              <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '8px', padding: '12px', margin: '14px 0' }}>
                {confirmDeleteType === 'subject' && (
                  <>
                    <strong style={{ display: 'block', fontSize: '14px', color: '#991b1b' }}>Subject: {confirmDeleteTarget?.name}</strong>
                    <span style={{ fontSize: '12px', color: '#7f1d1d', marginTop: '4px', display: 'block' }}>This will remove the subject folder and all of its notes, videos, or papers.</span>
                  </>
                )}
                {confirmDeleteType === 'category' && (
                  <>
                    <strong style={{ display: 'block', fontSize: '14px', color: '#991b1b' }}>Category Folder: {confirmDeleteTarget?.label}</strong>
                    <span style={{ fontSize: '12px', color: '#7f1d1d', marginTop: '4px', display: 'block' }}>This will delete all {confirmDeleteTarget?.count} documents under this folder.</span>
                  </>
                )}
                {confirmDeleteType === 'resource' && (
                  <>
                    <strong style={{ display: 'block', fontSize: '14px', color: '#991b1b' }}>File: {confirmDeleteTarget?.title}</strong>
                    <span style={{ fontSize: '12px', color: '#7f1d1d', marginTop: '4px', display: 'block' }}>This will remove this specific attachment file resource.</span>
                  </>
                )}
              </div>

              <div className="form-group-new" style={{ marginTop: '16px' }}>
                <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '750' }}>
                  Please type <span style={{ color: '#dc2626' }}>DELETE</span> to confirm:
                </label>
                <input 
                  type="text"
                  value={confirmTypedText}
                  onChange={(e) => setConfirmTypedText(e.target.value)}
                  placeholder="Type DELETE..."
                  style={{ 
                    border: confirmTypedText === 'DELETE' ? '1px solid #10b981' : '1px solid #cbd5e1',
                    fontSize: '14px',
                    fontWeight: '700',
                    textAlign: 'center',
                    letterSpacing: '1px',
                    marginTop: '4px'
                  }}
                  autoFocus
                />
              </div>
            </div>

            <div className="modal-footer-new">
              <button 
                type="button" 
                className="glass-button size-md secondary" 
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="glass-button size-md" 
                style={{ 
                  background: confirmTypedText === 'DELETE' ? '#dc2626' : '#cbd5e1',
                  color: '#ffffff',
                  border: 'none',
                  cursor: confirmTypedText === 'DELETE' ? 'pointer' : 'not-allowed',
                  opacity: confirmTypedText === 'DELETE' ? 1 : 0.6,
                  fontWeight: '700'
                }}
                disabled={confirmTypedText !== 'DELETE'}
                onClick={handleExecuteDeletion}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .studymaterial-view-new {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* Breadcrumbs styling */
        .study-breadcrumbs {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          padding: 12px 20px;
          flex-wrap: wrap;
        }

        .breadcrumbs-trail {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .breadcrumb-item {
          background: transparent;
          border: none;
          font-size: 13px;
          font-weight: 650;
          color: #3b82f6;
          cursor: pointer;
          transition: color 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .breadcrumb-item:hover {
          color: #1d4ed8;
          text-decoration: underline;
        }

        .breadcrumb-item.home {
          color: #64748b;
        }
        .breadcrumb-item.home:hover {
          color: #0f172a;
        }

        .breadcrumb-item.active {
          color: #0f172a;
          font-weight: 700;
          cursor: default;
          pointer-events: none;
        }

        .bc-home-icon {
          font-size: 13.5px;
        }

        .bc-separator {
          font-size: 10px;
          color: #cbd5e1;
        }

        .quick-upload-header-btn,
        .quick-upload-submit-btn {
          background: #3b82f6 !important;
          color: #ffffff !important;
          border: none !important;
          font-weight: 700 !important;
          box-shadow: 0 4px 10px rgba(59, 130, 246, 0.2) !important;
          transition: all 0.2s ease !important;
        }
        .quick-upload-header-btn:hover,
        .quick-upload-submit-btn:hover {
          background: #2563eb !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 6px 14px rgba(59, 130, 246, 0.3) !important;
        }

        /* Folders Explorer Container */
        .explorer-container {
          min-height: 400px;
        }

        .section-header-new {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
          gap: 16px;
        }

        .section-title-new {
          font-size: 16px;
          font-weight: 750;
          color: #0f172a;
          margin: 0;
        }

        .title-muted {
          font-weight: 500;
          color: #64748b;
        }

        /* Folder cards grid */
        .folders-grid-new {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        @media (max-width: 1200px) {
          .folders-grid-new {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (max-width: 768px) {
          .folders-grid-new {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 480px) {
          .folders-grid-new {
            grid-template-columns: 1fr;
          }
        }

        .folder-card-new {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 14px;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.01);
        }

        .folder-card-new:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 18px rgba(0, 0, 0, 0.04);
          border-color: #cbd5e1;
        }

        .folder-icon-wrapper {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        }

        .folder-icon-wrapper.yellow { background: #fef3c7; color: #d97706; }
        .folder-icon-wrapper.amber { background: #fffbeb; color: #b45309; }
        .folder-icon-wrapper.blue { background: #eff6ff; color: #3b82f6; }
        .folder-icon-wrapper.purple { background: #faf5ff; color: #8b5cf6; }
        .folder-icon-wrapper.green { background: #f0fdf4; color: #10b981; }
        .folder-icon-wrapper.pink { background: #fdf2f8; color: #db2777; }
        .folder-icon-wrapper.indigo { background: #e0e7ff; color: #4f46e5; }
        .folder-icon-wrapper.teal { background: #f0fdfa; color: #0d9488; }
        
        /* Category specific styles hover states */
        .folder-card-new.category-folder.blue-theme:hover { border-color: #3b82f6; background: #eff6ff20; }
        .folder-card-new.category-folder.purple-theme:hover { border-color: #8b5cf6; background: #faf5ff20; }
        .folder-card-new.category-folder.green-theme:hover { border-color: #10b981; background: #f0fdf420; }
        .folder-card-new.category-folder.pink-theme:hover { border-color: #db2777; background: #fdf2f820; }
        .folder-card-new.category-folder.indigo-theme:hover { border-color: #4f46e5; background: #e0e7ff20; }
        .folder-card-new.category-folder.teal-theme:hover { border-color: #0d9488; background: #f0fdfa20; }

        .folder-icon-wrapper.dotted {
          border: 2px dashed #cbd5e1;
          color: #94a3b8;
          background: transparent;
        }

        .folder-card-new.add-new-folder-card {
          border-style: dashed;
        }
        .folder-card-new.add-new-folder-card:hover {
          border-color: #3b82f6;
          background: #f0f6ff20;
        }
        .add-lbl {
          color: #3b82f6 !important;
        }

        .folder-info-col {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .folder-name-text {
          font-size: 13.5px;
          font-weight: 650;
          color: #0f172a;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }

        .folder-subtext {
          font-size: 11px;
          color: #94a3b8;
          font-weight: 500;
        }

        /* Files Explorer panel */
        .files-explorer-card {
          padding: 32px !important;
          border-radius: 20px !important;
          background: rgba(255, 255, 255, 0.7) !important;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.5) !important;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.03) !important;
        }

        .section-desc-new {
          font-size: 12.5px;
          color: #64748b;
          margin: 4px 0 0 0;
        }

        /* Premium Empty State Redesign */
        .files-empty-state-new {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 60px 40px;
          background: rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 20px;
          border: 1px dashed #cbd5e1;
          margin-top: 15px;
          position: relative;
          overflow: hidden;
        }

        .empty-icon-glowing-wrapper {
          position: relative;
          width: 90px;
          height: 90px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
        }

        .glow-backdrop {
          position: absolute;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(59, 130, 246, 0) 70%);
          filter: blur(10px);
          animation: pulse-glow 3s infinite ease-in-out;
        }

        .floating-folder-wrapper {
          width: 60px;
          height: 60px;
          border-radius: 16px;
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          border: 1px solid rgba(59, 130, 246, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 20px rgba(59, 130, 246, 0.1);
          animation: float-slow 4s infinite ease-in-out;
        }

        .glowing-folder-icon {
          font-size: 26px;
          color: #3b82f6;
        }

        .empty-title-gradient {
          font-size: 19px;
          font-weight: 800;
          margin: 0 0 10px 0;
          background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -0.02em;
        }

        .empty-desc-premium {
          font-size: 13.5px;
          color: #64748b;
          max-width: 460px;
          line-height: 1.6;
          margin: 0 0 28px 0;
          font-weight: 500;
        }

        .premium-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 28px;
          border-radius: 12px;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: #ffffff;
          border: none;
          font-size: 13.5px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 8px 20px rgba(37, 99, 235, 0.25);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .premium-action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 26px rgba(37, 99, 235, 0.35);
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
        }

        .premium-action-btn:active {
          transform: translateY(0);
        }

        .btn-plus-icon {
          font-size: 12px;
        }

        .files-table-wrapper {
          width: 100%;
          overflow-x: auto;
          margin-top: 15px;
        }

        .files-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .files-table th {
          font-size: 11px;
          font-weight: 750;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          padding: 10px 14px;
          border-bottom: 2px solid #f1f5f9;
        }

        .files-table td {
          padding: 12px 14px;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: middle;
        }

        .file-detail-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .file-type-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          flex-shrink: 0;
        }

        .file-type-icon.note { background: #eff6ff; color: #3b82f6; }
        .file-type-icon.video { background: #faf5ff; color: #8b5cf6; }
        .file-type-icon.pyq { background: #f0fdf4; color: #10b981; }

        .file-text-col {
          display: flex;
          flex-direction: column;
        }

        .file-name-title {
          font-size: 13.5px;
          font-weight: 600;
          color: #0f172a;
        }

        .file-desc-text {
          font-size: 11px;
          color: #94a3b8;
          max-width: 380px;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }

        .file-badge-pill {
          display: inline-flex;
          padding: 2px 8px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .file-badge-pill.note { background: #dbeafe; color: #2563eb; }
        .file-badge-pill.video { background: #f3e8ff; color: #7c3aed; }
        .file-badge-pill.pyq { background: #dcfce7; color: #16a34a; }

        .file-link-button {
          font-size: 12px;
          font-weight: 650;
          color: #3b82f6;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
        }
        .file-link-button:hover {
          color: #1d4ed8;
          text-decoration: underline;
        }

        .no-link-text {
          font-size: 12px;
          color: #94a3b8;
          font-style: italic;
        }

        .file-delete-btn {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
        }
        .file-delete-btn:hover {
          background: #fef2f2;
          border-color: #fca5a5;
          color: #dc2626;
        }

        .file-edit-btn-new {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
        }
        .file-edit-btn-new:hover {
          background: #eff6ff;
          border-color: #bfdbfe;
          color: #2563eb;
        }

        .folder-delete-btn-new {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 28px;
          height: 28px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
          opacity: 0;
        }
        .folder-card-new.subject-folder:hover .folder-delete-btn-new,
        .folder-card-new.category-folder:hover .folder-delete-btn-new {
          opacity: 1;
        }
        .folder-delete-btn-new:hover {
          background: #fef2f2;
          border-color: #fca5a5;
          color: #dc2626;
        }

        /* Modal specific details */
        .modal-textarea-new {
          width: 100%;
          padding: 10px 14px;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          outline: none;
          font-size: 13.5px;
          resize: vertical;
        }

        .form-grid-3col {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
        }

        @media (max-width: 600px) {
          .form-grid-3col {
            grid-template-columns: 1fr;
            gap: 12px;
          }
        }

        /* Drag & Drop PDF area */
        .drag-drop-zone {
          width: 100%;
          border: 2px dashed #cbd5e1;
          border-radius: 12px;
          padding: 24px;
          text-align: center;
          background: #f8fafc;
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .drag-drop-zone:hover {
          border-color: #3b82f6;
          background: #f0f6ff;
        }

        .drag-drop-zone.dragging {
          border-color: #1e40af;
          background: #dbeafe;
          transform: scale(0.99);
        }

        .drag-drop-zone.has-file {
          border-color: #10b981;
          background: #ecfdf5;
        }

        .drag-drop-zone.disabled {
          opacity: 0.5;
          cursor: not-allowed;
          pointer-events: none;
        }

        .dd-icon-large {
          font-size: 32px;
          color: #94a3b8;
          transition: color 0.2s;
        }
        .drag-drop-zone:hover .dd-icon-large {
          color: #3b82f6;
        }
        .drag-drop-zone.has-file .dd-icon-large {
          color: #10b981;
        }

        .dd-placeholder {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .dd-title {
          font-size: 13px;
          font-weight: 700;
          color: #334155;
        }

        .dd-subtitle {
          font-size: 11px;
          color: #64748b;
        }

        .dd-success-file {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .dd-filename {
          font-size: 13px;
          font-weight: 700;
          color: #065f46;
          max-width: 250px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .dd-filesize {
          font-size: 10.5px;
          color: #047857;
        }

        /* Modal Overlay & Card styling */
        .emp-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 20px;
        }

        .emp-modal-card {
          width: 100%;
          max-width: 680px;
          max-height: 95vh;
          background: #ffffff;
          border-radius: 16px;
          padding: 28px;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        .modal-header-new {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 14px;
        }

        .modal-header-new h3 {
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .close-modal-btn {
          background: transparent;
          border: none;
          font-size: 16px;
          color: #64748b;
          cursor: pointer;
          transition: color 0.2s;
        }

        .close-modal-btn:hover {
          color: #0f172a;
        }

        .modal-form-new {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-top: 15px;
        }

        .modal-error-alert {
          background: #fef2f2;
          border: 1px solid #fca5a5;
          color: #b91c1c;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 12.5px;
          font-weight: 600;
        }

        .form-group-new {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group-new label {
          font-size: 11.5px;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
        }

        .form-group-new input, 
        .form-group-new select, 
        .form-group-new textarea {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 13.5px;
          color: #0f172a;
          outline: none;
          transition: all 0.2s;
        }

        .form-group-new input:focus, 
        .form-group-new select:focus, 
        .form-group-new textarea:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-grid-2col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        @media (max-width: 600px) {
          .form-grid-2col {
            grid-template-columns: 1fr;
            gap: 15px;
          }
        }

        .modal-footer-new {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 15px;
          border-top: 1px solid #f1f5f9;
          padding-top: 18px;
        }

        /* Selector Autocomplete Combobox styling */
        .selector-group {
          margin-bottom: 8px;
        }

        .combobox-container {
          position: relative;
          width: 100%;
        }

        .combobox-container input {
          width: 100% !important;
          background: #ffffff !important;
          border: 1px solid #cbd5e1 !important;
          border-radius: 8px !important;
          padding: 10px 14px !important;
          font-size: 13.5px !important;
          color: #0f172a !important;
          outline: none !important;
        }

        .combobox-dropdown {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          right: 0;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          z-index: 10000;
          max-height: 180px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          padding: 4px;
        }

        .combobox-item {
          padding: 10px 12px;
          font-size: 13px;
          font-weight: 600;
          color: #475569;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .combobox-item:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .combobox-item.create-new-item {
          color: #3b82f6;
          font-weight: 750;
          background: #eff6ff80;
          border-top: 1px solid #e2e8f0;
          margin-top: 4px;
        }

        .combobox-item.create-new-item:hover {
          background: #dbeafe;
          color: #1e40af;
        }

        .no-options-warning {
          background: #fffbeb;
          border: 1px solid #fef3c7;
          color: #b45309;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 12.5px;
          font-weight: 600;
          margin-top: 6px;
        }
      `}</style>
    </div>
  );
};

export default StudyMaterial;
