import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import DataList from '../components/DataList';
import ActionModal from '../components/ActionModal';

const Teachers = () => {
  const { teachers, addTeacher, updateTeacher, deleteTeacher } = useAdmin();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  // UI subject field can contain: "Math" or "Math,Physics,Chemistry"
  const [subject, setSubject] = useState('Mathematics');

  const openAddModal = () => {
    setEditingTeacher(null);
    setName('');
    setEmail('');
    setSubject('Mathematics');
    setModalOpen(true);
  };

  const openEditModal = (teacher) => {
    setEditingTeacher(teacher);

    // Teacher model expects firstName/middleName/lastName, but UI currently keeps `name`.
    // Split when editing so save payload can be correct.
    const fullName = teacher.fullName || teacher.name || `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim();
    const parts = String(fullName || '').trim().split(/\s+/).filter(Boolean);
    const firstName = parts[0];
    const lastName = parts.length >= 2 ? parts[parts.length - 1] : '';
    setName([firstName, lastName].filter(Boolean).join(' ').trim());

    setEmail(teacher.email);

    // UI subject textbox should accept comma separated values; normalize to a single string.
    const subjectsArr = Array.isArray(teacher.subjects)
      ? teacher.subjects
      : teacher.subjects
        ? teacher.subjects
        : teacher.subject
          ? [teacher.subject]
          : [];
    setSubject(subjectsArr.join(', '));

    // Also set display fields (table + UI label) but payload uses firstName/lastName/subjects.
    setModalOpen(true);
  };

const handleSubmit = async () => {
    const fullName = String(name || '').trim();
    const parts = fullName ? fullName.split(/\s+/).filter(Boolean) : [];

    const firstName = parts[0];
    const lastName = parts.length >= 2 ? parts[parts.length - 1] : '';

    // Convert UI subject textbox into subjects: [String]
    const subjects = String(subject || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const teacherPayload = {
      firstName,
      lastName,
      email,
      subjects,
    };

    // Never send undefined fields
    if (!teacherPayload.firstName) delete teacherPayload.firstName;
    if (!teacherPayload.lastName) delete teacherPayload.lastName;
    if (!teacherPayload.subjects || teacherPayload.subjects.length === 0) teacherPayload.subjects = [];

    if (editingTeacher) {
      await updateTeacher(editingTeacher._id || editingTeacher.id, teacherPayload);
    } else {
      await addTeacher(teacherPayload);
    }
    setModalOpen(false);
  };

  const columns = [
    { header: 'ID', key: 'vlmTeacherId', width: '60px', render: (row) => (
      <span>{row.vlmTeacherId || '--'}</span>
    ) },
    {
      header: 'Name',
      key: 'name',
      render: (row) => (
        <div className="cell-user">
          <div className="cell-avatar teacher" aria-hidden="true" />
          <span className="user-name">{row.name}</span>

        </div>
      )
    },
    {
      header: 'Email',
      key: 'email',
      render: (row) => <span className="user-email">{row.email}</span>
    },
    { header: 'Subject', key: 'subject', render: (row) => (
      <span className="badge badge-teacher">{row.subject}</span>
    )},
    { header: 'Tutor Rating', key: 'rating', render: (row) => (
      <span className="rating-value">⭐️ {row.rating ? row.rating.toFixed(1) : '5.0'} / 5.0</span>
    )},
    { header: 'Active Live Classes', key: 'activeClasses', render: (row) => (
      <span className="class-indicator">{row.activeClasses || 0} Scheduled</span>
    )},
    {
      header: 'Actions',
      key: 'actions',
      width: '120px',
      render: (row) => (
        <div className="table-actions">
          <button
            className="action-icon-btn edit"
            onClick={() => openEditModal(row)}
            title="Edit"
            aria-label="Edit"
            type="button"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>

          <button
            className="action-icon-btn delete"
            onClick={async () => await deleteTeacher(row.id)}
            title="Delete"
            aria-label="Delete"
            type="button"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )
    }
  ];

  const subjectOptions = [
    { value: 'Mathematics', label: 'Mathematics' },
    { value: 'Physics', label: 'Physics' },
    { value: 'Chemistry', label: 'Chemistry' },
    { value: 'Biology', label: 'Biology' }
  ];

  return (
    <div className="teachers-view">
      <DataList
        data={teachers}
        columns={columns}
        searchPlaceholder="Search teachers by name..."
        searchKey="name"
        filterKey="subject"
        filterOptions={subjectOptions}
        filterPlaceholder="All Subjects"
        actionButton={
          <button className="glass-button teacher-btn" onClick={openAddModal}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Teacher
          </button>
        }
      />

      <ActionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTeacher ? 'Edit Teacher Details' : 'Add New Teacher'}
        onSubmit={handleSubmit}
        submitText={editingTeacher ? 'Save Details' : 'Create Profile'}
      >
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Dr. Anita Sen"
            className="glass-input"
          />
        </div>

        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="anita.sen@school.com"
            className="glass-input"
          />
        </div>

        <div className="form-group">
          <label>Subject Specialization</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="glass-select"
          >
            <option value="Mathematics">Mathematics</option>
            <option value="Physics">Physics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Biology">Biology</option>
          </select>
        </div>
      </ActionModal>

      <style>{`
        .teacher-btn {
          background: linear-gradient(135deg, var(--teacher-color) 0%, rgba(245, 158, 11, 0.7) 100%);
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
        }
        .teacher-btn:hover {
          box-shadow: 0 6px 16px rgba(245, 158, 11, 0.4);
        }

        .cell-avatar.teacher { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }

        .rating-value {
          color: #fbbf24;
          font-weight: 600;
        }

        .class-indicator {
          color: var(--text-secondary);
          font-size: 13px;
        }
      `}</style>
    </div>
  );
};

export default Teachers;
