import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import DataList from '../components/DataList';
import ActionModal from '../components/ActionModal';

const Students = () => {
  const { students, parents, addStudent, updateStudent, deleteStudent } = useAdmin();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [grade, setGrade] = useState('Class 10');
  const [rewardPoints, setRewardPoints] = useState(0);
  const [leaderboardRank, setLeaderboardRank] = useState(1);
  const [selectedParents, setSelectedParents] = useState([]);

  const openAddModal = () => {
    setEditingStudent(null);
    setName('');
    setEmail('');
    setGrade('Class 10');
    setRewardPoints(0);
    setLeaderboardRank(students.length + 1);
    setSelectedParents([]);
    setModalOpen(true);
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setName(student.name);
    setEmail(student.email);
    setGrade(student.grade);
    setRewardPoints(student.rewardPoints);
    setLeaderboardRank(student.leaderboardRank);
    setSelectedParents(student.parentIds || []);
    setModalOpen(true);
  };

  const handleSubmit = () => {
    const studentData = {
      name,
      email,
      grade,
      rewardPoints: Number(rewardPoints),
      leaderboardRank: Number(leaderboardRank),
      parentIds: selectedParents
    };

    if (editingStudent) {
      updateStudent(editingStudent.id, studentData);
    } else {
      addStudent(studentData);
    }
    setModalOpen(false);
  };

  const handleQuickReward = (student, pointsToAdd) => {
    updateStudent(student.id, { rewardPoints: student.rewardPoints + pointsToAdd });
  };

  const handleParentToggle = (parentId) => {
    setSelectedParents(prev => 
      prev.includes(parentId) 
        ? prev.filter(id => id !== parentId) 
        : [...prev, parentId]
    );
  };

  const columns = [
    { header: 'ID', key: 'id', width: '60px' },
    { header: 'Name', key: 'name', render: (row) => (
      <div className="cell-user">
        <div className="cell-avatar student">S</div>
        <div className="cell-info">
          <span className="user-name">{row.name}</span>
          <span className="user-email">{row.email}</span>
        </div>
      </div>
    )},
    { header: 'Grade', key: 'grade', render: (row) => (
      <span className="badge badge-student">{row.grade}</span>
    )},
    { header: 'Reward Points', key: 'rewardPoints', render: (row) => (
      <div className="points-container">
        <span className="points-val">🪙 {row.rewardPoints}</span>
        <div className="quick-points">
          <button className="btn-quick-pts" onClick={() => handleQuickReward(row, 10)}>+10</button>
          <button className="btn-quick-pts" onClick={() => handleQuickReward(row, 50)}>+50</button>
        </div>
      </div>
    )},
    { header: 'Leaderboard', key: 'leaderboardRank', render: (row) => (
      <span className="rank-value">🏆 #{row.leaderboardRank}</span>
    )},
    { header: 'Linked Parents', key: 'parentIds', render: (row) => {
      const linked = parents.filter(p => row.parentIds?.includes(p.id));
      return (
        <span className="parents-count">
          {linked.length > 0 ? linked.map(p => p.name).join(', ') : 'None Linked'}
        </span>
      );
    }},
    { header: 'Actions', key: 'actions', width: '120px', render: (row) => (
      <div className="table-actions">
        <button className="action-icon-btn edit" onClick={() => openEditModal(row)} title="Edit profile">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button className="action-icon-btn delete" onClick={() => deleteStudent(row.id)} title="Delete student">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    )}
  ];

  const gradeOptions = [
    { value: 'Class 9', label: 'Class 9' },
    { value: 'Class 10', label: 'Class 10' },
    { value: 'Class 11', label: 'Class 11' },
    { value: 'Class 12', label: 'Class 12' }
  ];

  return (
    <div className="students-view">
      <DataList
        data={students}
        columns={columns}
        searchPlaceholder="Search students by name..."
        searchKey="name"
        filterKey="grade"
        filterOptions={gradeOptions}
        filterPlaceholder="All Grades"
        actionButton={
          <button className="glass-button student-btn" onClick={openAddModal}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Student
          </button>
        }
      />

      <ActionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingStudent ? 'Edit Student Details' : 'Add New Student'}
        onSubmit={handleSubmit}
        submitText={editingStudent ? 'Save Details' : 'Create Profile'}
      >
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ram Kumar"
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
            placeholder="ram.kumar@gmail.com"
            className="glass-input"
          />
        </div>

        <div className="form-row-2">
          <div className="form-group">
            <label>Grade Level</label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="glass-select"
            >
              <option value="Class 9">Class 9</option>
              <option value="Class 10">Class 10</option>
              <option value="Class 11">Class 11</option>
              <option value="Class 12">Class 12</option>
            </select>
          </div>

          <div className="form-group">
            <label>Leaderboard Rank</label>
            <input
              type="number"
              min="1"
              required
              value={leaderboardRank}
              onChange={(e) => setLeaderboardRank(e.target.value)}
              className="glass-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Reward Points</label>
          <input
            type="number"
            min="0"
            required
            value={rewardPoints}
            onChange={(e) => setRewardPoints(e.target.value)}
            className="glass-input"
          />
        </div>

        <div className="form-group">
          <label>Link Parents</label>
          <div className="parent-links-selector">
            {parents.map(parent => (
              <label key={parent.id} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedParents.includes(parent.id)}
                  onChange={() => handleParentToggle(parent.id)}
                />
                <span className="custom-checkbox"></span>
                <span className="checkbox-text">{parent.name} ({parent.phone})</span>
              </label>
            ))}
          </div>
        </div>
      </ActionModal>

      <style>{`
        .student-btn {
          background: linear-gradient(135deg, var(--student-color) 0%, rgba(6, 182, 212, 0.7) 100%);
          box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
        }
        .student-btn:hover {
          box-shadow: 0 6px 16px rgba(6, 182, 212, 0.4);
        }

        .cell-user {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .cell-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 13px;
          color: white;
        }

        .cell-avatar.student { background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); }
        
        .cell-info {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 14px;
        }

        .user-email {
          font-size: 11px;
          color: var(--text-muted);
        }

        .points-container {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .points-val {
          font-weight: 600;
          color: #f59e0b;
        }

        .quick-points {
          display: flex;
          gap: 6px;
        }

        .btn-quick-pts {
          padding: 2px 6px;
          font-size: 10px;
          border-radius: 4px;
          border: 1px solid var(--panel-border);
          background: rgba(255,255,255,0.03);
          color: var(--text-secondary);
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .btn-quick-pts:hover {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
          border-color: rgba(245, 158, 11, 0.3);
        }

        .rank-value {
          font-weight: 600;
          color: var(--text-primary);
        }

        .parents-count {
          color: var(--text-secondary);
          font-size: 13px;
        }

        .table-actions {
          display: flex;
          gap: 8px;
        }

        .action-icon-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--panel-border);
          background: rgba(255, 255, 255, 0.02);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-icon-btn:hover {
          color: var(--text-primary);
          border-color: var(--panel-border-hover);
        }

        .action-icon-btn.edit:hover {
          background: rgba(59, 130, 246, 0.12);
          color: var(--accent-blue);
          border-color: rgba(59, 130, 246, 0.3);
        }

        .action-icon-btn.delete:hover {
          background: rgba(239, 68, 68, 0.12);
          color: var(--error-color);
          border-color: rgba(239, 68, 68, 0.3);
        }

        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .parent-links-selector {
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

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: var(--text-secondary);
          cursor: pointer;
          position: relative;
        }

        .checkbox-label input {
          position: absolute;
          opacity: 0;
          cursor: pointer;
        }

        .custom-checkbox {
          width: 18px;
          height: 18px;
          border-radius: 4px;
          border: 1.5px solid var(--panel-border);
          background: rgba(255, 255, 255, 0.02);
          display: inline-block;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .checkbox-label input:checked ~ .custom-checkbox {
          background: var(--student-color);
          border-color: var(--student-color);
        }

        .custom-checkbox::after {
          content: '';
          display: none;
          margin-left: 5px;
          margin-top: 2px;
          width: 4px;
          height: 8px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }

        .checkbox-label input:checked ~ .custom-checkbox::after {
          display: block;
        }

        .checkbox-text {
          user-select: none;
        }
      `}</style>
    </div>
  );
};

export default Students;
