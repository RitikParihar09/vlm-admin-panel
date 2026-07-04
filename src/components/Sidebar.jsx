import React from 'react';
import {
  FaTachometerAlt,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaUsers,
  FaVideo,
  FaBook,
  FaClipboardList,
  FaQuestionCircle,
  FaPlayCircle,
  FaSignOutAlt
} from "react-icons/fa";
const Sidebar = ({ activeView, setActiveView, onLogout }) => {
  const menuItems = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: <FaTachometerAlt />,
    },
    {
      id: "students",
      name: "Students Manager",
      icon: <FaUserGraduate />,
      theme: "student",
    },
    {
      id: "teachers",
      name: "Teachers Manager",
      icon: <FaChalkboardTeacher />,
      theme: "teacher",
    },
    {
      id: "parents",
      name: "Parents Linker",
      icon: <FaUsers />,
      theme: "parent",
    },
    {
      id: "liveclasses",
      name: "Live Classes",
      icon: <FaVideo />,
    },
    {
      id: "studymaterial",
      name: "Study Library",
      icon: <FaBook />,
    },
    {
      id: "mcqtasks",
      name: "MCQ Tasks",
      icon: <FaClipboardList />,
    },
    {
      id: "doubts",
      name: "Doubt Center",
      icon: <FaQuestionCircle />,
    },
    {
      id: "shortvideos",
      name: "Short Video Feed",
      icon: <FaPlayCircle />,
    },
  ];

  return (
    <div className="sidebar-container glass-panel">
      <div className="sidebar-header">
        <div className="logo-icon">V</div>
        <span className="logo-text">VLM Admin</span>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const isActive = activeView === item.id;
          let themeClass = '';
          if (isActive) {
            if (item.theme === 'student') themeClass = 'active-student';
            else if (item.theme === 'teacher') themeClass = 'active-teacher';
            else if (item.theme === 'parent') themeClass = 'active-parent';
            else themeClass = 'active-default';
          }

          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`nav-item ${isActive ? 'active' : ''} ${themeClass}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.name}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={onLogout}>
          <FaSignOutAlt className="nav-icon logout-icon" />
          <span className="nav-label">Logout</span>
        </button>
      </div>

      <style>{`
      .sidebar-footer {
  margin-top: auto;
  padding-top: 20px;
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  border: none;
  border-radius: 12px;
  background: transparent;
  color: #ef4444;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.12);
  color: #ff6b6b;
}

.logout-icon {
  font-size: 20px;
}
        .sidebar-container {
          position: fixed;
          top: 15px;
          left: 15px;
          bottom: 15px;
          width: calc(var(--sidebar-width) - 15px);
          display: flex;
          flex-direction: column;
          border-radius: 20px;
          z-index: 50;
          padding: 20px 10px;
          border: 1px solid var(--panel-border);
        }

        @media (max-width: 1024px) {
          .sidebar-container {
            width: calc(var(--sidebar-collapsed-width) - 15px);
          }
          .logo-text, .nav-label {
            display: none;
          }
          .sidebar-header, .nav-item, .logout-btn {
            justify-content: center;
          }
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 15px;
          margin-bottom: 25px;
        }

        .logo-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, var(--student-color) 0%, var(--parent-color) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 18px;
          color: white;
          box-shadow: 0 0 15px rgba(6, 182, 212, 0.4);
        }

        .logo-text {
          font-weight: 700;
          font-size: 20px;
          letter-spacing: -0.5px;
          background: linear-gradient(to right, #ffffff, var(--text-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex-grow: 1;
          overflow-y: auto;
          padding-right: 4px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 16px;
          border-radius: 12px;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.04);
          color: var(--text-primary);
        }

        .nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .active-default {
          background: rgba(59, 130, 246, 0.12) !important;
          color: var(--accent-blue) !important;
          border-left: 3px solid var(--accent-blue);
          border-radius: 0 12px 12px 0;
          padding-left: 13px;
        }

        .active-student {
          background: rgba(6, 182, 212, 0.12) !important;
          color: var(--student-color) !important;
          border-left: 3px solid var(--student-color);
          border-radius: 0 12px 12px 0;
          padding-left: 13px;
        }

        .active-teacher {
          background: rgba(245, 158, 11, 0.12) !important;
          color: var(--teacher-color) !important;
          border-left: 3px solid var(--teacher-color);
          border-radius: 0 12px 12px 0;
          padding-left: 13px;
        }

        .active-parent {
          background: rgba(236, 72, 153, 0.12) !important;
          color: var(--parent-color) !important;
          border-left: 3px solid var(--parent-color);
          border-radius: 0 12px 12px 0;
          padding-left: 13px;
        }

        .sidebar-footer {
          border-top: 1px solid var(--panel-border);
          padding-top: 15px;
          margin-top: 10px;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 14px;
          width: 100%;
          padding: 12px 16px;
          border-radius: 12px;
          border: none;
          background: transparent;
          color: var(--error-color);
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          opacity: 0.8;
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
