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

// New Feature Views
import AiManagement from './views/AiManagement';
import Gamification from './views/Gamification';
import Communication from './views/Communication';
import SubscriptionBilling from './views/SubscriptionBilling';
import WalletRewards from './views/WalletRewards';
import SupportCenter from './views/SupportCenter';
import AnalyticsReports from './views/AnalyticsReports';
import Marketing from './views/Marketing';
import SystemConfig from './views/SystemConfig';
import SecurityCompliance from './views/SecurityCompliance';
import MediaManagement from './views/MediaManagement';
import FounderDashboard from './views/FounderDashboard';

function AppContent() {
  const { adminUser, logoutAdmin } = useAdmin();
  const [activeView, setActiveView] = useState(() => {
    return localStorage.getItem('adminActiveView') || 'dashboard';
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Persist active view navigation across page refreshes
  React.useEffect(() => {
    localStorage.setItem('adminActiveView', activeView);
  }, [activeView]);

  // If the admin user is not logged in, force render the Login view
  if (!adminUser) {
    return <Login />;
  }

  const viewPermissions = {
    students: 'students',
    teachers: 'teachers',
    parents: 'parents',
    liveclasses: 'liveclasses',
    studymaterial: 'study-materials',
    mcqtasks: 'mcqs',
    aimanager: 'ai',
    gamification: 'gamification',
    communication: 'communication',
    subscription: 'financials',
    wallet: 'wallet',
    support: 'tickets',
    analytics: 'analytics',
    marketing: 'banners',
    sysconfig: 'settings',
    security: 'employees',
    media: 'media',
    founder: 'founder'
  };

  const hasPermissionForView = (view) => {
    if (!adminUser) return false;
    if (adminUser.isSuperAdmin === true) return true;
    const required = viewPermissions[view];
    if (!required) return true; // dashboard and doubts are accessible by default or have no check
    return adminUser.permissions && adminUser.permissions.includes(required);
  };

  // Active view switching
  const renderActiveView = () => {
    if (!hasPermissionForView(activeView)) {
      return (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', maxWidth: '500px', margin: '40px auto' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>🚫</div>
          <h2 style={{ color: '#ef4444', fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>Access Denied</h2>
          <p style={{ color: '#64748b', fontSize: '13.5px', marginBottom: '20px' }}>You do not have the required permissions to access this feature panel.</p>
          <button className="glass-button size-md primary" onClick={() => setActiveView('dashboard')}>
            Back to Dashboard
          </button>
        </div>
      );
    }

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
      
      // New views routing
      case 'aimanager': return <AiManagement />;
      case 'gamification': return <Gamification />;
      case 'communication': return <Communication />;
      case 'subscription': return <SubscriptionBilling />;
      case 'wallet': return <WalletRewards />;
      case 'support': return <SupportCenter />;
      case 'analytics': return <AnalyticsReports />;
      case 'marketing': return <Marketing />;
      case 'sysconfig': return <SystemConfig />;
      case 'security': return <SecurityCompliance />;
      case 'media': return <MediaManagement />;
      case 'founder': return <FounderDashboard />;

      default: return <Dashboard setActiveView={setActiveView} />;
    }
  };

  return (
    <div className={`app-wrapper ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        onLogout={logoutAdmin} 
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      
      <main className="main-content">
        <Navbar 
          activeView={activeView} 
          setActiveView={setActiveView} 
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
        />
        
        <div className="view-container">
          {renderActiveView()}
        </div>
      </main>
      
      <style>{`
        /* Dynamic layout style based on sidebar status */
        .app-wrapper.sidebar-collapsed .main-content {
          margin-left: var(--sidebar-collapsed-width);
          width: calc(100% - var(--sidebar-collapsed-width));
        }

        .app-wrapper.sidebar-collapsed .sidebar-container {
          width: calc(var(--sidebar-collapsed-width) - 15px);
        }

        .app-wrapper.sidebar-collapsed .logo-text,
        .app-wrapper.sidebar-collapsed .nav-label,
        .app-wrapper.sidebar-collapsed .category-title {
          display: none;
        }

        .app-wrapper.sidebar-collapsed .sidebar-header,
        .app-wrapper.sidebar-collapsed .nav-item,
        .app-wrapper.sidebar-collapsed .logout-btn {
          justify-content: center;
        }
      `}</style>
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
