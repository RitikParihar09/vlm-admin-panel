import React, { useState, useMemo, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import ActionModal from '../components/ActionModal';

const StudyMaterial = () => {
  const {
    studyLibrary = [],
    addResourceToSubject,
    addSubjectToClass,
    uploadPdf,
    fetchStudyLibrary,
    hasAuth,
  } = useAdmin();

  // Use studyLibrary from context (which has default values)
  const displayStudyLibrary = studyLibrary;

  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('resource');

  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteLink, setNoteLink] = useState('');
  const [pdfFile, setPdfFile] = useState(null);

  const [subjectChoice, setSubjectChoice] = useState('existing');

  const [libraryLoaded, setLibraryLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!hasAuth || !fetchStudyLibrary || libraryLoaded) return;
      try {
        await fetchStudyLibrary();
      } catch (e) {
        // fetchStudyLibrary already sets globalError via context; keep UI resilient
      } finally {
        if (!cancelled) setLibraryLoaded(true);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [hasAuth, fetchStudyLibrary, libraryLoaded]);
  const [newSubjectName, setNewSubjectName] = useState('');

  const [resourceType, setResourceType] = useState('note');
  const [selectedResourceType, setSelectedResourceType] = useState('note');

  const selectedClassData = useMemo(
    () => (displayStudyLibrary || []).find(
      (cls) => cls.className === selectedClass
    ) || null,
    [selectedClass, displayStudyLibrary]
  );

  const selectedSubject = useMemo(
    () =>
      selectedClassData?.subjects?.find(
        (sub) => sub.id === selectedSubjectId
      ) || null,
    [selectedClassData, selectedSubjectId]
  );

  const currentStep = selectedClass ? (selectedSubject ? 'resources' : 'subjects') : 'classes';

  const openModal = (mode) => {
    setModalMode(mode);
    setNoteTitle('');
    setNoteContent('');
    setNoteLink('');
    setSubjectChoice('existing');
    setNewSubjectName('');
    setResourceType('note');
    setModalOpen(true);
  };

  const handleAddResource = async () => {
    if (!selectedClassData) return;

    if (modalMode === 'subject') {
      if (!newSubjectName.trim()) return;
      const newSubject = await addSubjectToClass(selectedClassData.className, newSubjectName.trim());
      if (newSubject) {
        setSelectedSubjectId(newSubject.id);
      }
      setModalOpen(false);
      return;
    }

    let targetSubject = selectedSubject;
    if (subjectChoice === 'new' && newSubjectName.trim()) {
      targetSubject = await addSubjectToClass(selectedClassData.className, newSubjectName.trim());
      setSelectedSubjectId(targetSubject.id);
    }

    if (!targetSubject) return;

    // Upload PDF if file is selected
    let finalLink = noteLink.trim();
    if (pdfFile && uploadPdf) {
      try {
        const uploadResult = await uploadPdf(pdfFile);
        if (uploadResult?.data?.url) {
          finalLink = uploadResult.data.url;
        }
      } catch (e) {
        console.error('PDF upload failed:', e);
      }
    }

    // Call the context function to add the resource
    await addResourceToSubject(selectedClass, targetSubject.id, {
      title: noteTitle || `${targetSubject.name} ${resourceType === 'paper' ? 'Paper' : 'Note'}`,
      content: noteContent || 'New study resource content.',
      link: finalLink,
      resourceType: resourceType
    });
    
    setModalOpen(false);
  };

  return (
    <div className="studymaterial-view">
      <div className="study-library-top">
        <div>
          <h2>Study Library</h2>
          <p>Select a class to open subjects, then view or add notes or papers.</p>
        </div>
        {currentStep === 'resources' && (
          <button className="glass-button add-notes-small" onClick={() => openModal('resource')}>
            Add Resource
          </button>
        )}
      </div>

      <div className="study-library-grid">
        {currentStep === 'classes' && (
          <div className="class-panel glass-panel">
            <h3>Classes</h3>
            <div className="class-grid">
              {displayStudyLibrary.map((cls) => (
                <button
                  type="button"
                  key={cls.className}
                  className={`class-card ${cls.className === selectedClass ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedClass(cls.className);
                    setSelectedSubjectId(null);
                    setSelectedResourceType('note');
                  }}
                >
                  {cls.className}
                </button>
              ))}
            </div>
          </div>
        )}

        {currentStep === 'subjects' && selectedClassData && (
          <div className="subject-panel glass-panel">
            <div className="panel-header-row">
              <button className="glass-button secondary" onClick={() => setSelectedClass(null)}>
                ← Back to Classes
              </button>
              <div>
                <h3>Subjects for {selectedClassData.className}</h3>
                <p>Select a subject to view notes and papers.</p>
              </div>
              <button className="glass-button small" onClick={() => openModal('subject')}>
                + Add Subject
              </button>
            </div>
            <div className="subject-list">
              {selectedClassData?.subjects?.map((subject) => (
                <button
                  type="button"
                  key={subject.id}
                  className={`subject-item ${subject.id === selectedSubject?.id ? 'active' : ''}`}
                  onClick={() => setSelectedSubjectId(subject.id)}
                >
                  {subject.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {currentStep === 'resources' && selectedClassData && selectedSubject && (
          <div className="notes-panel glass-panel">
            <div className="notes-panel-header">
              <div>
                <button className="glass-button secondary" onClick={() => setSelectedSubjectId(null)}>
                  ← Back to Subjects
                </button>
                <h3>{selectedSubject.name}</h3>
                <p>{selectedClassData.className} • Resources</p>
              </div>
              <div className="resource-tabs">
                <button
                  type="button"
                  className={`tab-btn ${selectedResourceType === 'note' ? 'active' : ''}`}
                  onClick={() => setSelectedResourceType('note')}
                >
                  Notes
                </button>
                <button
                  type="button"
                  className={`tab-btn ${selectedResourceType === 'paper' ? 'active' : ''}`}
                  onClick={() => setSelectedResourceType('paper')}
                >
                  Previous Year Paper
                </button>
                <button className="glass-button add-notes-large" onClick={() => openModal('resource')}>
                  + Add Resource
                </button>
              </div>
            </div>

            <div className="notes-list">
              {selectedSubject?.notes?.filter((note) => (note.resourceType || 'note') === selectedResourceType).length > 0 ? (
                selectedSubject.notes
                  .filter((note) => (note.resourceType || 'note') === selectedResourceType)
                  .map((note) => (
                    <div key={note.id} className="note-card glass-panel">
                      <h4>{note.title}</h4>
                      <p>{note.content}</p>
                      {note.link ? (
                        <a href={note.link} target="_blank" rel="noopener noreferrer" className="note-link">
                          Open attached file
                        </a>
                      ) : null}
                    </div>
                  ))
              ) : (
                <div className="note-empty-state">
                  <p>No {selectedResourceType === 'paper' ? 'previous year papers' : 'notes'} yet for this subject.</p>
                  <span>Click {selectedResourceType === 'paper' ? 'Add Resource' : 'Add Resource'} to create one.</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <ActionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalMode === 'subject' ? 'Add New Subject' : `Add ${resourceType === 'paper' ? 'Previous Year Paper' : 'Note'}`}
        onSubmit={handleAddResource}
        submitText={modalMode === 'subject' ? 'Add Subject' : `Add ${resourceType === 'paper' ? 'Paper' : 'Note'}`}
      >
        {modalMode === 'subject' ? (
          <>
            <div className="form-group">
              <label>New Subject Name</label>
              <input
                type="text"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                placeholder="Example: Computer Science"
                className="glass-input"
              />
            </div>
          </>
        ) : (
          <>
            <div className="form-group">
              <label>Resource Type</label>
              <div className="radio-row">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="resourceType"
                    value="note"
                    checked={resourceType === 'note'}
                    onChange={() => setResourceType('note')}
                  />
                  Note
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="resourceType"
                    value="paper"
                    checked={resourceType === 'paper'}
                    onChange={() => setResourceType('paper')}
                  />
                  Previous Year Paper
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Choose Subject</label>
              <div className="radio-row">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="subjectChoice"
                    value="existing"
                    checked={subjectChoice === 'existing'}
                    onChange={() => setSubjectChoice('existing')}
                  />
                  Existing subject
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="subjectChoice"
                    value="new"
                    checked={subjectChoice === 'new'}
                    onChange={() => setSubjectChoice('new')}
                  />
                  Add new subject
                </label>
              </div>
            </div>

            {subjectChoice === 'new' ? (
              <div className="form-group">
                <label>New Subject Name</label>
                <input
                  type="text"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  placeholder="Example: Computer Science"
                  className="glass-input"
                />
              </div>
            ) : (
              <div className="form-group">
                <label>Subject</label>
                <select
                  className="glass-select"
                  value={selectedSubject?.id || ''}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                >
                  {selectedClassData?.subjects?.map((subject) => (
                    <option key={subject.id} value={subject.id}>{subject.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label>{resourceType === 'paper' ? 'Paper Title' : 'Note Title'}</label>
              <input
                type="text"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder={resourceType === 'paper' ? 'Example: CBSE 2024 Maths Paper' : 'Example: Important formula sheet'}
                className="glass-input"
              />
            </div>
            <div className="form-group">
              <label>{resourceType === 'paper' ? 'Paper Description' : 'Note Content'}</label>
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder={resourceType === 'paper' ? 'Describe the paper or share instructions.' : 'Write note details here'}
                className="glass-textarea"
                rows={5}
              />
            </div>
            <div className="form-group">
              <label>PDF File Upload</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                className="glass-input"
              />
              {pdfFile && (
                <p style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  Selected: {pdfFile.name}
                </p>
              )}
            </div>
            <div className="form-group">
              <label>PDF / Resource Link (optional)</label>
              <input
                type="url"
                value={noteLink}
                onChange={(e) => setNoteLink(e.target.value)}
                placeholder="https://drive.google.com/your-file"
                className="glass-input"
              />
            </div>
          </>
        )}
      </ActionModal>

      <style>{`
        .study-library-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }

        .study-library-top h2 {
          margin: 0;
          font-size: 24px;
          color: var(--text-primary);
        }

        .study-library-top p {
          margin: 6px 0 0;
          color: var(--text-muted);
        }

        .study-library-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 18px;
        }

        .class-panel,
        .subject-panel,
        .notes-panel {
          padding: 20px;
          border: 1px solid var(--panel-border);
          border-radius: 24px;
          background: rgba(10, 15, 24, 0.72);
        }

        .class-panel h3,
        .subject-panel h3 {
          margin-bottom: 16px;
          font-size: 18px;
          color: var(--text-primary);
        }

        .class-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        .class-card {
          border: 1px solid rgba(148, 163, 184, 0.25);
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.04);
          color: var(--text-primary);
          padding: 14px 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
        }

        .class-card:hover,
        .class-card.active {
          border-color: rgba(59, 130, 246, 0.8);
          background: rgba(59, 130, 246, 0.1);
          transform: translateY(-1px);
        }

        .subject-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .subject-item {
          width: 100%;
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.04);
          color: var(--text-primary);
          padding: 14px 16px;
          text-align: left;
          cursor: pointer;
          transition: background 0.2s ease, transform 0.2s ease;
        }

        .subject-item:hover,
        .subject-item.active {
          background: rgba(16, 185, 129, 0.12);
          border-color: rgba(16, 185, 129, 0.6);
          transform: translateX(2px);
        }

        .notes-panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
          margin-bottom: 20px;
        }

        .notes-panel-header h3 {
          margin: 0;
          font-size: 18px;
          color: var(--text-primary);
        }

        .notes-panel-header p {
          margin: 6px 0 0;
          color: var(--text-muted);
          font-size: 13px;
        }

        .add-notes-large,
        .add-notes-small {
          border-radius: 16px;
          padding: 10px 16px;
          font-size: 13px;
          font-weight: 600;
          background: linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-purple) 100%);
          color: white;
          border: none;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .add-notes-large:hover,
        .add-notes-small:hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 24px rgba(59, 130, 246, 0.3);
        }

        .notes-list {
          display: grid;
          gap: 14px;
        }

        .note-card {
          padding: 18px;
          border-radius: 18px;
          border: 1px solid rgba(148, 163, 184, 0.2);
          background: rgba(255, 255, 255, 0.04);
        }

        .note-card h4 {
          margin: 0 0 8px;
          color: var(--text-primary);
          font-size: 15px;
        }

        .note-card p {
          margin: 0;
          color: var(--text-muted);
          font-size: 13px;
          line-height: 1.6;
        }

        .note-empty-state {
          padding: 28px;
          border-radius: 18px;
          border: 1px dashed rgba(148, 163, 184, 0.3);
          text-align: center;
          color: var(--text-muted);
        }

        .radio-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 8px;
        }

        .radio-option {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--text-primary);
        }

        .glass-textarea,
        .glass-input,
        .glass-select {
          width: 100%;
          padding: 14px;
          border-radius: 14px;
          border: 1px solid rgba(148, 163, 184, 0.2);
          background: rgba(15, 23, 42, 0.85);
          color: var(--text-primary);
        }

        .glass-textarea {
          min-height: 120px;
          resize: vertical;
        }

        .note-link {
          display: inline-block;
          margin-top: 10px;
          color: var(--accent-blue);
          text-decoration: underline;
          font-size: 13px;
        }
      `}</style>
    </div>
  );
};

export default StudyMaterial;
