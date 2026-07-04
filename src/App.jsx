import React, { useState } from 'react';
import { AdminProvider, useAdmin } from './context/AdminContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Views
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import Students from './views/Students';
import Teachers from './views/Teachers';
import Parents from './views/Parents';
import LiveClasses from './views/LiveClasses';
import StudyMaterial from './views/StudyMaterial';
import McqTasks from './views/McqTasks';
import Doubts from './views/Doubts';
import ShortVideos from './views/ShortVideos';

function AppContent() {
  const { adminUser, logoutAdmin } = useAdmin();
  const [activeView, setActiveView] = useState('dashboard');

  // If the admin user is not logged in, force render the Login view
  if (!adminUser) {
    return <Login />;
  }

  // Active view switching
  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard': return <Dashboard setActiveView={setActiveView} />;
      case 'students': return <Students />;
      case 'teachers': return <Teachers />;
      case 'parents': return <Parents />;
      case 'liveclasses': return <LiveClasses />;
      case 'studymaterial': return <StudyMaterial />;
      case 'mcqtasks': return <McqTasks />;
      case 'doubts': return <Doubts />;
      case 'shortvideos': return <ShortVideos />;
      default: return <Dashboard setActiveView={setActiveView} />;
    }
  };

  return (
    <div className="app-wrapper">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        onLogout={logoutAdmin} 
      />
      
      <main className="main-content">
        <Navbar activeView={activeView} setActiveView={setActiveView} />
        
        <div className="view-container">
          {renderActiveView()}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <AdminProvider>
      <AppContent />
    </AdminProvider>
  );
}

export default App;
