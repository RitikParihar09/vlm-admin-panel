import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminContext = createContext();

const initialStudents = [
  { id: 'S1', name: 'Ram Kumar', email: 'ram.kumar@gmail.com', grade: 'Class 10', rewardPoints: 240, leaderboardRank: 3, parentIds: ['P1'], mcqCompletion: '3/4' },
  { id: 'S2', name: 'Sita Sharma', email: 'sita.sharma@gmail.com', grade: 'Class 12', rewardPoints: 510, leaderboardRank: 1, parentIds: ['P2'], mcqCompletion: '4/4' },
  { id: 'S3', name: 'Rahul Gupta', email: 'rahul.gupta@gmail.com', grade: 'Class 10', rewardPoints: 120, leaderboardRank: 8, parentIds: ['P1'], mcqCompletion: '1/4' },
  { id: 'S4', name: 'Priya Verma', email: 'priya.verma@gmail.com', grade: 'Class 11', rewardPoints: 340, leaderboardRank: 2, parentIds: ['P3'], mcqCompletion: '4/4' },
  { id: 'S5', name: 'Vikram Singh', email: 'vikram.singh@gmail.com', grade: 'Class 9', rewardPoints: 80, leaderboardRank: 15, parentIds: [], mcqCompletion: '2/4' },
];

const initialTeachers = [
  { id: 'T1', name: 'Mr. Rajesh Verma', email: 'rajesh.verma@school.com', subject: 'Mathematics', rating: 4.8, activeClasses: 3 },
  { id: 'T2', name: 'Dr. Anita Sen', email: 'anita.sen@school.com', subject: 'Biology', rating: 4.9, activeClasses: 2 },
  { id: 'T3', name: 'Mrs. Kalyani Rao', email: 'kalyani.rao@school.com', subject: 'Physics', rating: 4.7, activeClasses: 4 },
  { id: 'T4', name: 'Mr. Amit Shah', email: 'amit.shah@school.com', subject: 'Chemistry', rating: 4.5, activeClasses: 1 },
];

const initialParents = [
  { id: 'P1', name: 'Mr. Suresh Kumar', email: 'suresh.kumar@gmail.com', phone: '+91 9876543210', studentIds: ['S1', 'S3'] },
  { id: 'P2', name: 'Mrs. Maya Sharma', email: 'maya.sharma@gmail.com', phone: '+91 9123456789', studentIds: ['S2'] },
  { id: 'P3', name: 'Mr. Alok Verma', email: 'alok.verma@gmail.com', phone: '+91 8877665544', studentIds: ['S4'] },
];

const initialLiveClasses = [
  { id: 'L1', topic: 'Quadratic Equations & Roots', teacherId: 'T1', subject: 'Mathematics', date: '2026-07-04', startTime: '10:00', endTime: '11:30', link: 'https://zoom.us/j/123456789', status: 'Scheduled' },
  { id: 'L2', topic: 'Cell Division & Mitosis', teacherId: 'T2', subject: 'Biology', date: '2026-07-03', startTime: '14:00', endTime: '15:00', link: 'https://zoom.us/j/987654321', status: 'Live' },
  { id: 'L3', topic: 'Newtonian Laws of Motion', teacherId: 'T3', subject: 'Physics', date: '2026-07-02', startTime: '11:00', endTime: '12:30', link: 'https://zoom.us/j/555666777', status: 'Completed' },
];

const initialStudyMaterials = [
  { id: 'M1', title: 'Class 10 Trigonometry Formula Sheet', type: 'PDF Notes', link: 'https://example.com/maths-trig.pdf', grade: 'Class 10' },
  { id: 'M2', title: 'Introduction to Organic Chemistry - Video Lesson', type: 'Video Lesson', link: 'https://youtube.com/watch?v=mock123', grade: 'Class 11' },
  { id: 'M3', title: 'Class 12 Physics CBSE 2025 Board Paper', type: 'Previous Year Paper', link: 'https://example.com/physics-2025.pdf', grade: 'Class 12' },
];

const initialStudyLibrary = [
  {
    className: 'Class 1',
    subjects: [
      { id: 'C1-S1', name: 'English', notes: [{ id: 'N1', title: 'Alphabet Practice', content: 'Practice letters A to Z and simple words.' }] },
      { id: 'C1-S2', name: 'Mathematics', notes: [{ id: 'N2', title: 'Counting 1-50', content: 'Write numbers 1 to 50 and practice basic addition.' }] }
    ]
  },
  {
    className: 'Class 2',
    subjects: [
      { id: 'C2-S1', name: 'English', notes: [{ id: 'N3', title: 'Simple Sentences', content: 'Build short sentences using everyday words.' }] },
      { id: 'C2-S2', name: 'Mathematics', notes: [{ id: 'N4', title: 'Basic Addition', content: 'Add numbers up to 20 using pictures or blocks.' }] }
    ]
  },
  {
    className: 'Class 3',
    subjects: [
      { id: 'C3-S1', name: 'English', notes: [{ id: 'N5', title: 'Rhyming Words', content: 'Match cat with hat, sun with fun, and bed with red.' }] },
      { id: 'C3-S2', name: 'Mathematics', notes: [{ id: 'N6', title: 'Multiplication Intro', content: 'Learn 2x and 3x tables with practice problems.' }] },
      { id: 'C3-S3', name: 'Science', notes: [{ id: 'N7', title: 'Plant Parts', content: 'Identify roots, stem, leaves, and flowers.' }] }
    ]
  },
  {
    className: 'Class 4',
    subjects: [
      { id: 'C4-S1', name: 'English', notes: [{ id: 'N8', title: 'Reading Short Stories', content: 'Read a short story and underline the main idea.' }] },
      { id: 'C4-S2', name: 'Mathematics', notes: [{ id: 'N9', title: 'Fractions Basics', content: 'Understand halves, quarters, and thirds with examples.' }] },
      { id: 'C4-S3', name: 'Science', notes: [{ id: 'N10', title: 'Food Groups', content: 'Learn carbohydrates, proteins, and vitamins.' }] }
    ]
  },
  {
    className: 'Class 5',
    subjects: [
      { id: 'C5-S1', name: 'English', notes: [{ id: 'N11', title: 'Paragraph Writing', content: 'Write a short paragraph about your favorite animal.' }] },
      { id: 'C5-S2', name: 'Mathematics', notes: [{ id: 'N12', title: 'Decimals', content: 'Practice decimal addition and subtraction.' }] },
      { id: 'C5-S3', name: 'Science', notes: [{ id: 'N13', title: 'Human Body', content: 'Label basic body systems like heart and lungs.' }] }
    ]
  },
  {
    className: 'Class 6',
    subjects: [
      { id: 'C6-S1', name: 'Mathematics', notes: [{ id: 'N14', title: 'Integers', content: 'Practice positive and negative numbers on a number line.' }] },
      { id: 'C6-S2', name: 'Science', notes: [{ id: 'N15', title: 'Motion and Forces', content: 'Understand push, pull and simple machines.' }] },
      { id: 'C6-S3', name: 'Social Studies', notes: [{ id: 'N16', title: 'Maps and Globe', content: 'Learn directions, map symbols, and continents.' }] }
    ]
  },
  {
    className: 'Class 7',
    subjects: [
      { id: 'C7-S1', name: 'Mathematics', notes: [{ id: 'N17', title: 'Ratio and Proportion', content: 'Solve basic ratio problems with real examples.' }] },
      { id: 'C7-S2', name: 'Science', notes: [{ id: 'N18', title: 'Cells and Tissues', content: 'Learn cell structure and function.' }] },
      { id: 'C7-S3', name: 'Social Science', notes: [{ id: 'N19', title: 'Ancient Civilizations', content: 'Read about ancient India and Egypt.' }] }
    ]
  },
  {
    className: 'Class 8',
    subjects: [
      { id: 'C8-S1', name: 'Mathematics', notes: [{ id: 'N20', title: 'Linear Equations', content: 'Solve one-variable linear equations step by step.' }] },
      { id: 'C8-S2', name: 'Science', notes: [{ id: 'N21', title: 'Force and Pressure', content: 'Explore how pressure changes with area.' }] },
      { id: 'C8-S3', name: 'Social Science', notes: [{ id: 'N22', title: 'Indian Geography', content: 'Learn major rivers, mountains, and cities.' }] }
    ]
  },
  {
    className: 'Class 9',
    subjects: [
      { id: 'C9-S1', name: 'Mathematics', notes: [{ id: 'N23', title: 'Polynomials', content: 'Practice addition and subtraction of polynomials.' }] },
      { id: 'C9-S2', name: 'Science', notes: [{ id: 'N24', title: 'Periodic Table', content: 'Understand groups and periods of elements.' }] },
      { id: 'C9-S3', name: 'English', notes: [{ id: 'N25', title: 'Comprehension Skills', content: 'Answer questions from a short passage.' }] }
    ]
  },
  {
    className: 'Class 10',
    subjects: [
      { id: 'C10-S1', name: 'Mathematics', notes: [{ id: 'N26', title: 'Quadratic Equations', content: 'Learn factorization and formula methods.' }] },
      { id: 'C10-S2', name: 'Science', notes: [{ id: 'N27', title: 'Chemical Reactions', content: 'Write balanced equations for simple reactions.' }] },
      { id: 'C10-S3', name: 'English', notes: [{ id: 'N28', title: 'Writing Skills', content: 'Practice formal letter writing and essays.' }] }
    ]
  },
  {
    className: 'Class 11',
    subjects: [
      { id: 'C11-S1', name: 'Physics', notes: [{ id: 'N29', title: 'Kinematics', content: 'Understand speed, velocity and acceleration.' }] },
      { id: 'C11-S2', name: 'Chemistry', notes: [{ id: 'N30', title: 'Atomic Structure', content: 'Learn electron configuration and periodic trends.' }] },
      { id: 'C11-S3', name: 'Biology', notes: [{ id: 'N31', title: 'Genetics Basics', content: 'Study heredity and Mendel’s experiments.' }] }
    ]
  },
  {
    className: 'Class 12',
    subjects: [
      { id: 'C12-S1', name: 'Physics', notes: [{ id: 'N32', title: 'Electrostatics', content: 'Learn charge, field lines, and capacitance.' }] },
      { id: 'C12-S2', name: 'Chemistry', notes: [{ id: 'N33', title: 'Organic Reactions', content: 'Review substitution and addition reactions.' }] },
      { id: 'C12-S3', name: 'Biology', notes: [{ id: 'N34', title: 'Biotechnology', content: 'Explore plant tissue culture and DNA tools.' }] }
    ]
  }
];

const initialMcqTasks = [
  { id: 'Q1', title: 'Daily Algebra practice', grade: 'Class 10', date: '2026-07-03', completionRate: '68%', questions: [
    { question: 'What is the root of x^2 - 4 = 0?', options: ['x=2', 'x=-2', 'x=2 or x=-2', 'x=4'], correct: 'x=2 or x=-2' },
    { question: 'Solve 2x + 5 = 15', options: ['x=5', 'x=10', 'x=3', 'x=15'], correct: 'x=5' }
  ]},
  { id: 'Q2', title: 'Cell Anatomy Quiz', grade: 'Class 9', date: '2026-07-03', completionRate: '85%', questions: [
    { question: 'Which organelle is the powerhouse of the cell?', options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Golgi Body'], correct: 'Mitochondria' }
  ]}
];

const initialDoubts = [
  { id: 'D1', studentName: 'Ram Kumar', studentId: 'S1', question: 'How do we derive the quadratic formula by completing the square?', status: 'Open', teacherId: 'T1', replies: [] },
  { id: 'D2', studentName: 'Sita Sharma', studentId: 'S2', question: 'Please verify if my answer for Question 4 of the assignment is correct.', status: 'Assigned', teacherId: 'T3', replies: [{ sender: 'T3', text: 'Please send an image of your solution' }] },
  { id: 'D3', studentName: 'Rahul Gupta', studentId: 'S3', question: 'What is the difference between speed and velocity?', status: 'Resolved', teacherId: 'T3', replies: [{ sender: 'T3', text: 'Speed is scalar, velocity is vector (has direction).' }] }
];

const initialShortVideos = [
  { id: 'V1', title: 'Solving Integration Tricks in 60s', views: '2.4k', duration: '0:58', link: 'https://example.com/video1.mp4' },
  { id: 'V2', title: 'How Mitochondria Produces ATP', views: '1.8k', duration: '1:12', link: 'https://example.com/video2.mp4' }
];

export const AdminProvider = ({ children }) => {
  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem('vlm_students');
    return saved ? JSON.parse(saved) : initialStudents;
  });

  const [teachers, setTeachers] = useState(() => {
    const saved = localStorage.getItem('vlm_teachers');
    return saved ? JSON.parse(saved) : initialTeachers;
  });

  const [parents, setParents] = useState(() => {
    const saved = localStorage.getItem('vlm_parents');
    return saved ? JSON.parse(saved) : initialParents;
  });

  const [liveClasses, setLiveClasses] = useState(() => {
    const saved = localStorage.getItem('vlm_liveClasses');
    return saved ? JSON.parse(saved) : initialLiveClasses;
  });

  const [studyMaterials, setStudyMaterials] = useState(() => {
    const saved = localStorage.getItem('vlm_studyMaterials');
    return saved ? JSON.parse(saved) : initialStudyMaterials;
  });

  const [studyLibrary, setStudyLibrary] = useState(() => {
    const saved = localStorage.getItem('vlm_studyLibrary');
    return saved ? JSON.parse(saved) : initialStudyLibrary;
  });

  const [mcqTasks, setMcqTasks] = useState(() => {
    const saved = localStorage.getItem('vlm_mcqTasks');
    return saved ? JSON.parse(saved) : initialMcqTasks;
  });

  const [doubts, setDoubts] = useState(() => {
    const saved = localStorage.getItem('vlm_doubts');
    return saved ? JSON.parse(saved) : initialDoubts;
  });

  const [shortVideos, setShortVideos] = useState(() => {
    const saved = localStorage.getItem('vlm_shortVideos');
    return saved ? JSON.parse(saved) : initialShortVideos;
  });

  const [adminUser, setAdminUser] = useState(() => {
    const saved = localStorage.getItem('vlm_admin_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Sync to local storage
  useEffect(() => { localStorage.setItem('vlm_students', JSON.stringify(students)); }, [students]);
  useEffect(() => { localStorage.setItem('vlm_teachers', JSON.stringify(teachers)); }, [teachers]);
  useEffect(() => { localStorage.setItem('vlm_parents', JSON.stringify(parents)); }, [parents]);
  useEffect(() => { localStorage.setItem('vlm_liveClasses', JSON.stringify(liveClasses)); }, [liveClasses]);
  useEffect(() => { localStorage.setItem('vlm_studyMaterials', JSON.stringify(studyMaterials)); }, [studyMaterials]);
  useEffect(() => { localStorage.setItem('vlm_studyLibrary', JSON.stringify(studyLibrary)); }, [studyLibrary]);
  useEffect(() => { localStorage.setItem('vlm_mcqTasks', JSON.stringify(mcqTasks)); }, [mcqTasks]);
  useEffect(() => { localStorage.setItem('vlm_doubts', JSON.stringify(doubts)); }, [doubts]);
  useEffect(() => { localStorage.setItem('vlm_shortVideos', JSON.stringify(shortVideos)); }, [shortVideos]);
  useEffect(() => { 
    if (adminUser) {
      localStorage.setItem('vlm_admin_user', JSON.stringify(adminUser));
    } else {
      localStorage.removeItem('vlm_admin_user');
    }
  }, [adminUser]);

  // Auth Operations
  const loginAdmin = (username, password) => {
    if (username.toLowerCase() === 'admin' && password === 'admin123') {
      const user = { username: 'Admin', role: 'admin', lastLogin: new Date().toLocaleTimeString() };
      setAdminUser(user);
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setAdminUser(null);
  };

  const updateAdminUser = (updates) => {
    setAdminUser(prev => {
      if (!prev) return { ...updates };
      return { ...prev, ...updates };
    });
  };

  // Student CRUD
  const addStudent = (student) => {
    const newStudent = {
      ...student,
      id: 'S' + (students.length + 1 + Date.now().toString().slice(-4)),
      rewardPoints: Number(student.rewardPoints) || 0,
      leaderboardRank: Number(student.leaderboardRank) || (students.length + 1),
      parentIds: student.parentIds || [],
      mcqCompletion: '0/0'
    };
    setStudents(prev => [newStudent, ...prev]);
  };

  const updateStudent = (id, updatedFields) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, ...updatedFields } : s));
  };

  const deleteStudent = (id) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    
    setParents(prev => prev.map(p => ({
      ...p,
      studentIds: p.studentIds.filter(sid => sid !== id)
    })));
  };

  // Teacher CRUD
  const addTeacher = (teacher) => {
    const newTeacher = {
      ...teacher,
      id: 'T' + (teachers.length + 1 + Date.now().toString().slice(-4)),
      rating: 5.0,
      activeClasses: 0
    };
    setTeachers(prev => [newTeacher, ...prev]);
  };

  const updateTeacher = (id, updatedFields) => {
    setTeachers(prev => prev.map(t => t.id === id ? { ...t, ...updatedFields } : t));
  };

  const deleteTeacher = (id) => {
    setTeachers(prev => prev.filter(t => t.id !== id));
  };

  const addParent = (parent) => {
    const newParent = {
      ...parent,
      id: 'P' + (parents.length + 1 + Date.now().toString().slice(-4)),
      studentIds: parent.studentIds || []
    };
    setParents(prev => [newParent, ...prev]);
    // Back-link to students
    if (parent.studentIds && parent.studentIds.length > 0) {
      setStudents(prev => prev.map(s => {
        if (parent.studentIds.includes(s.id)) {
          return { ...s, parentIds: [...(s.parentIds || []), newParent.id] };
        }
        return s;
      }));
    }
  };

  const updateParent = (id, updatedFields) => {
    setParents(prev => prev.map(p => {
      if (p.id === id) {
        // Handle student links change
        const oldStudentIds = p.studentIds || [];
        const newStudentIds = updatedFields.studentIds || oldStudentIds;
        
        // Remove parent reference from removed students
        const removed = oldStudentIds.filter(x => !newStudentIds.includes(x));
        if (removed.length > 0) {
          setStudents(prevS => prevS.map(s => {
            if (removed.includes(s.id)) {
              return { ...s, parentIds: (s.parentIds || []).filter(pid => pid !== id) };
            }
            return s;
          }));
        }

        const added = newStudentIds.filter(x => !oldStudentIds.includes(x));
        if (added.length > 0) {
          setStudents(prevS => prevS.map(s => {
            if (added.includes(s.id)) {
              return { ...s, parentIds: [...(s.parentIds || []).filter(pid => pid !== id), id] };
            }
            return s;
          }));
        }

        return { ...p, ...updatedFields };
      }
      return p;
    }));
  };

  const deleteParent = (id) => {
    setParents(prev => prev.filter(p => p.id !== id));
    // Remove references from students
    setStudents(prev => prev.map(s => ({
      ...s,
      parentIds: (s.parentIds || []).filter(pid => pid !== id)
    })));
  };

  const addLiveClass = (liveClass) => {
    const newClass = {
      ...liveClass,
      id: 'L' + (liveClasses.length + 1 + Date.now().toString().slice(-4)),
      status: liveClass.status || 'Scheduled'
    };
    setLiveClasses(prev => [newClass, ...prev]);

    if (liveClass.teacherId) {
      setTeachers(prev => prev.map(t => t.id === liveClass.teacherId ? { ...t, activeClasses: t.activeClasses + 1 } : t));
    }
  };

  const updateLiveClass = (id, updatedFields) => {
    setLiveClasses(prev => prev.map(c => c.id === id ? { ...c, ...updatedFields } : c));
  };

  const deleteLiveClass = (id) => {
    const classToDelete = liveClasses.find(c => c.id === id);
    setLiveClasses(prev => prev.filter(c => c.id !== id));
    if (classToDelete && classToDelete.teacherId) {
      setTeachers(prev => prev.map(t => t.id === classToDelete.teacherId ? { ...t, activeClasses: Math.max(0, t.activeClasses - 1) } : t));
    }
  };

  // Study Material CRUD
  const addStudyMaterial = (material) => {
    const newMaterial = {
      ...material,
      id: 'M' + (studyMaterials.length + 1 + Date.now().toString().slice(-4))
    };
    setStudyMaterials(prev => [newMaterial, ...prev]);
  };

  const deleteStudyMaterial = (id) => {
    setStudyMaterials(prev => prev.filter(m => m.id !== id));
  };

  const addResourceToSubject = (className, subjectId, resource) => {
    setStudyLibrary(prev => prev.map(cls => {
      if (cls.className !== className) return cls;
      return {
        ...cls,
        subjects: cls.subjects.map(sub => {
          if (sub.id !== subjectId) return sub;
          return {
            ...sub,
            notes: [{
              ...resource,
              id: 'N' + (Date.now().toString().slice(-6) + Math.floor(Math.random() * 99)).padStart(4, '0'),
              resourceType: resource.resourceType || 'note'
            }, ...(sub.notes || [])]
          };
        })
      };
    }));
  };

  const addNoteToSubject = (className, subjectId, note) => {
    addResourceToSubject(className, subjectId, { ...note, resourceType: 'note' });
  };

  const addSubjectToClass = (className, subjectName) => {
    let createdSubject = null;
    setStudyLibrary(prev => prev.map(cls => {
      if (cls.className !== className) return cls;
      const newSubject = {
        id: `${className.replace(/\s+/g, '')}-S${Date.now().toString().slice(-4)}`,
        name: subjectName,
        notes: []
      };
      createdSubject = newSubject;
      return {
        ...cls,
        subjects: [...cls.subjects, newSubject]
      };
    }));
    return createdSubject;
  };

  // MCQ Task CRUD
  const addMcqTask = (task) => {
    const newTask = {
      ...task,
      id: 'Q' + (mcqTasks.length + 1 + Date.now().toString().slice(-4)),
      completionRate: '0%',
      questions: task.questions || []
    };
    setMcqTasks(prev => [newTask, ...prev]);
  };

  const deleteMcqTask = (id) => {
    setMcqTasks(prev => prev.filter(q => q.id !== id));
  };

  // Doubts Ops
  const updateDoubt = (id, status, assignedTeacherId, replyText) => {
    setDoubts(prev => prev.map(d => {
      if (d.id === id) {
        const updatedReplies = [...d.replies];
        if (replyText) {
          updatedReplies.push({ sender: 'Admin', text: replyText });
        }
        return {
          ...d,
          status: status || d.status,
          teacherId: assignedTeacherId !== undefined ? assignedTeacherId : d.teacherId,
          replies: updatedReplies
        };
      }
      return d;
    }));
  };

  // Short Video CRUD
  const addShortVideo = (video) => {
    const newVideo = {
      ...video,
      id: 'V' + (shortVideos.length + 1 + Date.now().toString().slice(-4)),
      views: '0',
    };
    setShortVideos(prev => [newVideo, ...prev]);
  };

  const deleteShortVideo = (id) => {
    setShortVideos(prev => prev.filter(v => v.id !== id));
  };

  return (
    <AdminContext.Provider value={{
      students,
      teachers,
      parents,
      liveClasses,
      studyMaterials,
      studyLibrary,
      mcqTasks,
      doubts,
      shortVideos,
      adminUser,
      loginAdmin,
      logoutAdmin,
      updateAdminUser,
      addStudent,
      updateStudent,
      deleteStudent,
      addTeacher,
      updateTeacher,
      deleteTeacher,
      addParent,
      updateParent,
      deleteParent,
      addLiveClass,
      updateLiveClass,
      deleteLiveClass,
      addStudyMaterial,
      deleteStudyMaterial,
      addNoteToSubject,
      addResourceToSubject,
      addSubjectToClass,
      addMcqTask,
      deleteMcqTask,
      updateDoubt,
      addShortVideo,
      deleteShortVideo
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);
