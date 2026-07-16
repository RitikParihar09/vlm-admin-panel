import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import DataList from '../components/DataList';
import ActionModal from '../components/ActionModal';

const Parents = () => {
  const { parents, students, addParent, updateParent, deleteParent } = useAdmin();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingParent, setEditingParent] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);

  const openAddModal = () => {
    setEditingParent(null);
    setName('');
    setEmail('');
    setPhone('');
    setSelectedStudents([]);
    setModalOpen(true);
  };

const openEditModal = (parent) => {
    setEditingParent(parent);
    setName(parent.name);
    setEmail(parent.email);
    setPhone(parent.phone);
    setSelectedStudents(parent.children || parent.studentIds || []);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const parentData = { name, email, phone, studentIds: selectedStudents };
    if (editingParent) {
      await updateParent(editingParent._id || editingParent.id, parentData);
    } else {
      await addParent(parentData);
    }
    setModalOpen(false);
  };

  const handleStudentToggle = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId) 
        : [...prev, studentId]
    );
  };

  const columns = [
    { header: 'ID', key: 'id', width: '60px' },
    {
      header: 'Name',
      key: 'name',
      render: (row) => (
        <div className="cell-user">
          <div className="cell-avatar parent">P</div>
          <span className="user-name">{row.name}</span>
        </div>
      )
    },
    {
      header: 'Email',
      key: 'email',
      render: (row) => <span className="user-email">{row.email}</span>
    },
    { header: 'Phone Number', key: 'phone', render: (row) => (
      <span className="phone-value">{row.phone}</span>
    )},
{
      header: 'Linked Students',
      key: 'children',
      render: (row) => {
        const linked = students.filter(s => (row.children || row.studentIds || []).includes(s.id));
        return (
          <div className="linked-students-badges">
            {linked.length > 0 ? (
              linked.map(s => (
                <span key={s.id} className="badge badge-student" style={{ marginRight: '6px', marginBottom: '4px' }}>
                  {s.name} ({s.grade})
                </span>
              ))
            ) : (
              <span className="no-students">None Linked</span>
            )}
          </div>
        );
      }
    },
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
            onClick={async () => await deleteParent(row.id)}
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

  return (
    <div className="parents-view">
      <DataList
        data={parents}
        columns={columns}
        searchPlaceholder="Search parents by name..."
        searchKey="name"
        actionButton={
          <button className="glass-button parent-btn" onClick={openAddModal}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Parent
          </button>
        }
      />

      <ActionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingParent ? 'Edit Parent Details' : 'Add New Parent'}
        onSubmit={handleSubmit}
        submitText={editingParent ? 'Save Details' : 'Create Profile'}
      >
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Mr. Suresh Kumar"
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
            placeholder="suresh.kumar@gmail.com"
            className="glass-input"
          />
        </div>

        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 9876543210"
            className="glass-input"
          />
        </div>

        <div className="form-group">
          <label>Link Students</label>
          <div className="student-links-selector">
            {students.map(student => (
              <label key={student.id} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedStudents.includes(student.id)}
                  onChange={() => handleStudentToggle(student.id)}
                />
                <span className="custom-checkbox student-cb"></span>
                <span className="checkbox-text">{student.name} ({student.grade})</span>
              </label>
            ))}
          </div>
        </div>
      </ActionModal>

      <style>{`
        .parent-btn {
          background: linear-gradient(135deg, var(--parent-color) 0%, rgba(236, 72, 153, 0.7) 100%);
          box-shadow: 0 4px 12px rgba(236, 72, 153, 0.3);
        }
        .parent-btn:hover {
          box-shadow: 0 6px 16px rgba(236, 72, 153, 0.4);
        }

        .cell-avatar.parent { background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); }

        .phone-value {
          color: var(--text-secondary);
          font-size: 13px;
        }

        .linked-students-badges {
          display: flex;
          flex-wrap: wrap;
        }

        .no-students {
          color: var(--text-muted);
          font-size: 13px;
          font-style: italic;
        }

        .student-links-selector {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 150px;
          overflow-y: auto;
          background: rgba(10, 15, 24, 0.4);
          border: 1px solid var(--panel-border);
          border-radius: 8px;
          padding: 12px;
        }

        .student-cb:checked ~ .custom-checkbox {
          background: var(--parent-color);
          border-color: var(--parent-color);
        }
      `}</style>
    </div>
  );
};

export default Parents;
