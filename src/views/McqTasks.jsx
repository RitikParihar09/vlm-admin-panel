import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import DataList from '../components/DataList';
import ActionModal from '../components/ActionModal';

const McqTasks = () => {
  const { mcqTasks, addMcqTask, deleteMcqTask } = useAdmin();
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [grade, setGrade] = useState('Class 10');
  
  // List of questions inside this new MCQ Task
  const [questions, setQuestions] = useState([
    { question: '', optionA: '', optionB: '', optionC: '', optionD: '', correct: 'A' }
  ]);

  const openAddModal = () => {
    setTitle('');
    setGrade('Class 10');
    setQuestions([{ question: '', optionA: '', optionB: '', optionC: '', optionD: '', correct: 'A' }]);
    setModalOpen(true);
  };

  const handleAddQuestion = () => {
    setQuestions(prev => [
      ...prev,
      { question: '', optionA: '', optionB: '', optionC: '', optionD: '', correct: 'A' }
    ]);
  };

  const handleRemoveQuestion = (idxToRemove) => {
    if (questions.length === 1) return; // Keep at least one question
    setQuestions(prev => prev.filter((_, idx) => idx !== idxToRemove));
  };

  const handleQuestionFieldChange = (idx, field, value) => {
    setQuestions(prev => prev.map((q, qIdx) => {
      if (qIdx === idx) {
        return { ...q, [field]: value };
      }
      return q;
    }));
  };

  const handleSubmit = () => {
    // Reformat questions format to match context schema: questions: [{ question, options: [], correct }]
    const formattedQuestions = questions.map(q => ({
      question: q.question,
      options: [q.optionA, q.optionB, q.optionC, q.optionD],
      correct: q.correct === 'A' ? q.optionA : q.correct === 'B' ? q.optionB : q.correct === 'C' ? q.optionC : q.optionD
    }));

    addMcqTask({
      title,
      grade,
      date: new Date().toISOString().split('T')[0],
      questions: formattedQuestions
    });
    setModalOpen(false);
  };

  const columns = [
    { header: 'ID', key: 'id', width: '60px' },
    { header: 'Assessment Title', key: 'title', render: (row) => (
      <div className="mcq-title-info">
        <span className="mcq-title-text">{row.title}</span>
        <span className="mcq-date-sub">Created on {row.date || 'N/A'}</span>
      </div>
    )},
    { header: 'Target Grade', key: 'grade', render: (row) => (
      <span className="badge badge-student">{row.grade}</span>
    )},
    { header: 'Questions Count', key: 'questions', render: (row) => (
      <span className="questions-count-badge">📝 {row.questions?.length || 0} Questions</span>
    )},
    { header: 'Student Completion Rate', key: 'completionRate', render: (row) => (
      <div className="completion-bar-container">
        <div className="completion-bar-text">
          <span>{row.completionRate || '0%'} Completed</span>
        </div>
        <div className="bar-track">
          <div className="bar-fill" style={{ width: row.completionRate || '0%' }}></div>
        </div>
      </div>
    )},
    { header: 'Actions', key: 'actions', width: '80px', render: (row) => (
      <button className="action-icon-btn delete" onClick={() => deleteMcqTask(row.id)} title="Delete assessment">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    )}
  ];

  return (
    <div className="mcqtasks-view">
      <DataList
        data={mcqTasks}
        columns={columns}
        searchPlaceholder="Search tasks by title..."
        searchKey="title"
        actionButton={
          <button className="glass-button mcq-add-btn" onClick={openAddModal}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create MCQ Task
          </button>
        }
      />

      <ActionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Daily MCQ Task"
        onSubmit={handleSubmit}
        submitText="Publish Assessment"
      >
        <div className="form-row-2">
          <div className="form-group">
            <label>Assessment Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Daily Algebra Quiz"
              className="glass-input"
            />
          </div>

          <div className="form-group">
            <label>Target Grade</label>
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
        </div>

        <div className="questions-section">
          <div className="questions-header">
            <h4>Questions ({questions.length})</h4>
            <button type="button" className="btn-add-q" onClick={handleAddQuestion}>
              + Add Question
            </button>
          </div>

          <div className="questions-scroll-area">
            {questions.map((q, idx) => (
              <div key={idx} className="question-block glass-panel">
                <div className="q-block-header">
                  <h5>Question #{idx + 1}</h5>
                  {questions.length > 1 && (
                    <button type="button" className="btn-remove-q" onClick={() => handleRemoveQuestion(idx)}>
                      Remove
                    </button>
                  )}
                </div>

                <div className="form-group">
                  <label>Question Prompt</label>
                  <input
                    type="text"
                    required
                    value={q.question}
                    onChange={(e) => handleQuestionFieldChange(idx, 'question', e.target.value)}
                    placeholder="What is the chemical symbol for Gold?"
                    className="glass-input"
                  />
                </div>

                <div className="options-grid">
                  <div className="form-group">
                    <label>Option A</label>
                    <input
                      type="text"
                      required
                      value={q.optionA}
                      onChange={(e) => handleQuestionFieldChange(idx, 'optionA', e.target.value)}
                      placeholder="Ag"
                      className="glass-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Option B</label>
                    <input
                      type="text"
                      required
                      value={q.optionB}
                      onChange={(e) => handleQuestionFieldChange(idx, 'optionB', e.target.value)}
                      placeholder="Au"
                      className="glass-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Option C</label>
                    <input
                      type="text"
                      required
                      value={q.optionC}
                      onChange={(e) => handleQuestionFieldChange(idx, 'optionC', e.target.value)}
                      placeholder="Fe"
                      className="glass-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Option D</label>
                    <input
                      type="text"
                      required
                      value={q.optionD}
                      onChange={(e) => handleQuestionFieldChange(idx, 'optionD', e.target.value)}
                      placeholder="Pb"
                      className="glass-input"
                    />
                  </div>
                </div>

                <div className="form-group select-correct-wrapper">
                  <label>Correct Answer Key</label>
                  <select
                    value={q.correct}
                    onChange={(e) => handleQuestionFieldChange(idx, 'correct', e.target.value)}
                    className="glass-select"
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ActionModal>

      <style>{`
        .mcq-add-btn {
          background: linear-gradient(135deg, var(--success-color) 0%, rgba(16, 185, 129, 0.7) 100%);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
        .mcq-add-btn:hover {
          box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
        }

        .mcq-title-info {
          display: flex;
          flex-direction: column;
        }

        .mcq-title-text {
          font-weight: 600;
          color: var(--text-primary);
        }

        .mcq-date-sub {
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 3px;
        }

        .questions-count-badge {
          color: var(--text-secondary);
          font-size: 13px;
        }

        .completion-bar-container {
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 140px;
        }

        .completion-bar-text {
          font-size: 11px;
          color: var(--text-secondary);
          font-weight: 550;
        }

        .bar-track {
          height: 6px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
          width: 100%;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          background: linear-gradient(to right, var(--student-color), var(--success-color));
          border-radius: 3px;
        }

        .questions-section {
          margin-top: 20px;
          border-top: 1px solid var(--panel-border);
          padding-top: 15px;
        }

        .questions-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .questions-header h4 {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .btn-add-q {
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 600;
          border-radius: 6px;
          border: 1px solid rgba(6, 182, 212, 0.3);
          background: rgba(6, 182, 212, 0.1);
          color: var(--student-color);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-add-q:hover {
          background: var(--student-color);
          color: white;
        }

        .questions-scroll-area {
          max-height: 320px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 15px;
          padding-right: 4px;
        }

        .question-block {
          padding: 16px;
          border-radius: 12px;
          border: 1px solid var(--panel-border);
          background: rgba(10, 15, 24, 0.3);
        }

        .q-block-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .q-block-header h5 {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .btn-remove-q {
          background: transparent;
          border: none;
          color: var(--error-color);
          font-size: 12px;
          cursor: pointer;
          font-weight: 500;
        }

        .btn-remove-q:hover {
          text-decoration: underline;
        }

        .options-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .select-correct-wrapper select {
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default McqTasks;
