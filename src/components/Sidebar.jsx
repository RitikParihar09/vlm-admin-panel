import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import {
  FaTachometerAlt,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaUsers,
  FaVideo,
  FaBook,
  FaClipboardList,
  FaQuestionCircle,
  FaSignOutAlt,
  FaRobot,
  FaTrophy,
  FaEnvelope,
  FaCreditCard,
  FaWallet,
  FaLifeRing,
  FaChartLine,
  FaBullhorn,
  FaCog,
  FaShieldAlt,
  FaImages,
  FaUserShield,
  FaChevronLeft,
  FaChevronRight,
  FaAngleDown,
  FaAngleRight,
  FaLink,
  FaTicketAlt,
  FaAd
} from "react-icons/fa";
import logo from '../assets/logo.png';

const Sidebar = ({ activeView, setActiveView, onLogout, collapsed, setCollapsed }) => {
  const { adminUser } = useAdmin();
  const [userMenuExpanded, setUserMenuExpanded] = useState(false);
  const [marketingMenuExpanded, setMarketingMenuExpanded] = useState(false);
  const [subscriptionMenuExpanded, setSubscriptionMenuExpanded] = useState(false);

  useEffect(() => {
    if (activeView === 'students' || activeView === 'teachers' || activeView === 'parents') {
      setUserMenuExpanded(true);
    }
    if (activeView === 'promocodes' || activeView === 'banners') {
      setMarketingMenuExpanded(true);
    }
    if (['subscription', 'sub-plans', 'sub-trials', 'sub-upgrades', 'sub-list', 'sub-renewals', 'sub-expiring', 'sub-billing', 'sub-gst'].includes(activeView)) {
      setSubscriptionMenuExpanded(true);
    }
  }, [activeView]);

  const menuSections = [
    {
      title: "MANAGEMENT",
      items: [
        {
          id: "dashboard",
          name: "Dashboard",
          icon: <FaTachometerAlt />,
        },
        {
          id: "users",
          name: "User Management",
          icon: <FaUsers />,
          isExpandable: true,
          expanded: userMenuExpanded,
          setExpanded: setUserMenuExpanded,
          subItems: [
            { id: "students", name: "Students", icon: <FaUserGraduate />, requiredPermission: "students" },
            { id: "teachers", name: "Teachers", icon: <FaChalkboardTeacher />, requiredPermission: "teachers" },
            { id: "parents", name: "Parents", icon: <FaUsers />, requiredPermission: "parents" }
          ]
        },
        {
          id: "studymaterial",
          name: "Content Management",
          icon: <FaBook />,
          requiredPermission: "study-materials"
        },
        {
          id: "shortvideos",
          name: "Shorts Management",
          icon: <FaVideo />,
          requiredPermission: "study-materials"
        },
        {
          id: "aimanager",
          name: "API Management",
          icon: <FaLink />,
          requiredPermission: "ai"
        },
        {
          id: "doubts",
          name: "Doubt & Session",
          icon: <FaQuestionCircle />,
          requiredPermission: "doubts",
          underMaintenance: true
        },
        {
          id: "liveclasses",
          name: "Live Class",
          icon: <FaVideo />,
          requiredPermission: "liveclasses"
        },
        {
          id: "mcqtasks",
          name: "Test & MCQ",
          icon: <FaClipboardList />,
          requiredPermission: "mcqs"
        },
        {
          id: "gamification",
          name: "Gamification",
          icon: <FaTrophy />,
          requiredPermission: "gamification",
          underMaintenance: true
        },
        {
          id: "communication",
          name: "Communication",
          icon: <FaEnvelope />,
          requiredPermission: "communication",
          underMaintenance: true
        },
        {
          id: "subscription",
          name: "Subscription Management",
          icon: <FaCreditCard />,
          isExpandable: true,
          expanded: subscriptionMenuExpanded,
          setExpanded: setSubscriptionMenuExpanded,
          requiredPermission: "financials",
          subItems: [
            { id: "sub-plans", name: "Subscription Plans", icon: <FaChevronRight style={{ fontSize: '10px' }} />, requiredPermission: "financials" },
            { id: "sub-trials", name: "Trial Management", icon: <FaChevronRight style={{ fontSize: '10px' }} />, requiredPermission: "financials" },
            { id: "sub-upgrades", name: "Plan Upgrade", icon: <FaChevronRight style={{ fontSize: '10px' }} />, requiredPermission: "financials" },
            { id: "sub-list", name: "Subscriptions", icon: <FaChevronRight style={{ fontSize: '10px' }} />, requiredPermission: "financials" },
            { id: "sub-renewals", name: "Renewals", icon: <FaChevronRight style={{ fontSize: '10px' }} />, requiredPermission: "financials" },
            { id: "sub-expiring", name: "Expiring Soon", icon: <FaChevronRight style={{ fontSize: '10px' }} />, requiredPermission: "financials" },
            { id: "sub-billing", name: "Billing History", icon: <FaChevronRight style={{ fontSize: '10px' }} />, requiredPermission: "financials" },
            { id: "sub-gst", name: "GST Invoices", icon: <FaChevronRight style={{ fontSize: '10px' }} />, requiredPermission: "financials" }
          ]
        },
        {
          id: "wallet",
          name: "Wallet & Rewards",
          icon: <FaWallet />,
          requiredPermission: "wallet"
        },
        {
          id: "support",
          name: "Support Center",
          icon: <FaLifeRing />,
          requiredPermission: "tickets",
          underMaintenance: true
        }
      ]
    },
    {
      title: "OPERATIONS",
      items: [
        {
          id: "analytics",
          name: "Analytics & Reports",
          icon: <FaChartLine />,
          requiredPermission: "analytics",
          underMaintenance: true
        },
        {
          id: "marketing",
          name: "Marketing",
          icon: <FaBullhorn />,
          isExpandable: true,
          expanded: marketingMenuExpanded,
          setExpanded: setMarketingMenuExpanded,
          subItems: [
            { id: "banners", name: "Banner Ads", icon: <FaAd />, requiredPermission: "banners" },
            { id: "onboarding", name: "Onboarding Slides", icon: <FaChalkboardTeacher />, requiredPermission: "onboarding" },
            { id: "promocodes", name: "Coupon Codes", icon: <FaTicketAlt />, requiredPermission: "banners" }
          ]
        },
        {
          id: "sysconfig",
          name: "System Configuration",
          icon: <FaCog />,
          requiredPermission: "settings",
          underMaintenance: true
        },
        {
          id: "security",
          name: "Security & Compliance",
          icon: <FaShieldAlt />,
          requiredPermission: "employees"
        },
        {
          id: "media",
          name: "Media Management",
          icon: <FaImages />,
          requiredPermission: "media",
          underMaintenance: true
        }
      ]
    },
    {
      title: "FOUNDER",
      items: [
        {
          id: "founder",
          name: "Founder Dashboard",
          icon: <FaUserShield />,
          requiredPermission: "founder",
          underMaintenance: true
        }
      ]
    }
  ];

  const hasPermission = (permission) => {
    if (!adminUser) return false;
    if (adminUser.isSuperAdmin === true) return true;
    if (!permission) return true;
    return adminUser.permissions && adminUser.permissions.includes(permission);
  };

  const filteredMenuSections = menuSections
    .map(section => {
      const filteredItems = section.items
        .map(item => {
          if (item.subItems) {
            const filteredSubItems = item.subItems.filter(sub => hasPermission(sub.requiredPermission));
            return { ...item, subItems: filteredSubItems };
          }
          return item;
        })
        .filter(item => {
          if (item.subItems) {
            return item.subItems.length > 0;
          }
          return hasPermission(item.requiredPermission);
        });

      return { ...section, items: filteredItems };
    })
    .filter(section => section.items.length > 0);

  const handleItemClick = (item) => {
    if (item.isExpandable) {
      if (collapsed) {
        setCollapsed(false);
      }
      item.setExpanded(!item.expanded);
    } else {
      setActiveView(item.id);
    }
  };

  const isSubItemActive = (subItems) => {
    return subItems.some(sub => activeView === sub.id);
  };

  return (
    <div className={`sidebar-container ${collapsed ? 'collapsed' : ''}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="logo-container">
          <img src={logo} alt="VLM Logo" className="logo-img" />
          {!collapsed && (
            <div className="logo-text-col">
              <span className="logo-title">VLM ACADEMY</span>
              <span className="logo-subtitle">Admin Panel</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <div className="sidebar-nav">
        {filteredMenuSections.map((section, sIdx) => (
          <div key={sIdx} className="nav-section">
            {!collapsed && <span className="category-title">{section.title}</span>}
            
            <div className="section-items">
              {section.items.map((item) => {
                const isItemActive = activeView === item.id;
                const isSubActive = item.subItems && isSubItemActive(item.subItems);
                const showExpanded = item.isExpandable && item.expanded && !collapsed;

                return (
                  <div key={item.id} className="nav-item-group">
                    <button
                      onClick={() => handleItemClick(item)}
                      className={`nav-item ${isItemActive || isSubActive ? 'active' : ''}`}
                    >
                      <span className="nav-icon">{item.icon}</span>
                      {!collapsed ? (
                        <span className="nav-label-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', overflow: 'hidden' }}>
                          <span className="nav-label" style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', flexGrow: 1 }}>{item.name}</span>
                          {item.underMaintenance && (
                            <span className="maint-badge">Dev</span>
                          )}
                        </span>
                      ) : null}
                      {item.isExpandable && !collapsed && (
                        <span className="expand-chevron">
                          {showExpanded ? <FaAngleDown /> : <FaAngleRight />}
                        </span>
                      )}
                    </button>

                    {showExpanded && (
                      <div className="sub-menu-list">
                        {item.subItems.map((sub) => {
                          const isSubItemActive = activeView === sub.id;
                          return (
                            <button
                              key={sub.id}
                              onClick={() => setActiveView(sub.id)}
                              className={`sub-nav-item ${isSubItemActive ? 'active' : ''}`}
                            >
                              <span className="sub-nav-icon">{sub.icon}</span>
                              <span className="sub-nav-label">{sub.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Floating Edge Collapse Button in the Vertical Middle */}
      <button 
        className="sidebar-collapse-edge-btn" 
        onClick={() => setCollapsed(!collapsed)}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <FaChevronRight style={{ fontSize: '9px' }} /> : <FaChevronLeft style={{ fontSize: '9px' }} />}
      </button>

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={onLogout}>
          <FaSignOutAlt className="nav-icon" />
          {!collapsed && <span className="nav-label">Logout</span>}
        </button>
      </div>

      <style>{`
        .sidebar-container {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: var(--sidebar-width);
          background: #0f172a; /* Premium deep dark slate */
          border-right: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          flex-direction: column;
          z-index: 100;
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          color: #94a3b8;
          padding: 0;
        }

        .sidebar-container.collapsed {
          width: var(--sidebar-collapsed-width);
        }

        .sidebar-header {
          height: var(--navbar-height);
          display: flex;
          align-items: center;
          padding: 0 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .logo-container {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo-img {
          width: 32px;
          height: 32px;
          object-fit: contain;
        }

        .logo-text-col {
          display: flex;
          flex-direction: column;
        }

        .logo-title {
          font-size: 14px;
          font-weight: 700;
          color: #f8fafc;
          letter-spacing: 0.05em;
        }

        .logo-subtitle {
          font-size: 11px;
          color: #64748b;
          font-weight: 500;
        }

        .sidebar-nav {
          flex-grow: 1;
          overflow-y: auto;
          padding: 20px 10px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* Custom Scrollbar for dark sidebar */
        .sidebar-nav::-webkit-scrollbar {
          width: 4px;
        }
        .sidebar-nav::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
        }

        .nav-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .category-title {
          font-size: 10px;
          font-weight: 700;
          color: #475569;
          letter-spacing: 0.1em;
          padding-left: 12px;
          margin-bottom: 4px;
        }

        .section-items {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .nav-item-group {
          display: flex;
          flex-direction: column;
        }

        .nav-item {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 10px 14px;
          border: none;
          background: transparent;
          color: #94a3b8;
          font-size: 13.5px;
          font-weight: 550;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          gap: 12px;
          text-align: left;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.04);
          color: #f8fafc;
        }

        .nav-item.active {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
        }

        .nav-icon {
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
        }

        .nav-label {
          flex-grow: 1;
        }

        .maint-badge {
          background: rgba(249, 115, 22, 0.1);
          border: 1px solid rgba(249, 115, 22, 0.25);
          color: #f97316;
          font-size: 8px;
          font-weight: 800;
          text-transform: uppercase;
          padding: 1.5px 5.5px;
          border-radius: 4px;
          letter-spacing: 0.5px;
          margin-left: 6px;
          display: inline-flex;
          align-items: center;
          height: fit-content;
        }

        .expand-chevron {
          font-size: 11px;
          display: flex;
          align-items: center;
          color: #64748b;
        }

        .sub-menu-list {
          margin-top: 2px;
          padding-left: 12px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          border-left: 1px solid rgba(255, 255, 255, 0.06);
          margin-left: 22px;
        }

        .sub-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          border: none;
          background: transparent;
          color: #64748b;
          font-size: 12.5px;
          font-weight: 500;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .sub-nav-item:hover {
          color: #f8fafc;
          background: rgba(255, 255, 255, 0.03);
        }

        .sub-nav-item.active {
          color: #3b82f6;
          font-weight: 600;
        }

        .sub-nav-icon {
          font-size: 12px;
        }

        .sidebar-footer {
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .collapse-btn-bottom {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 10px 14px;
          background: transparent;
          border: none;
          color: #64748b;
          font-size: 13.5px;
          font-weight: 550;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .collapse-btn-bottom:hover {
          background: rgba(255, 255, 255, 0.03);
          color: #f8fafc;
        }

        .footer-icon {
          font-size: 14px;
          width: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 10px 14px;
          background: transparent;
          border: none;
          color: #ef4444;
          font-size: 13.5px;
          font-weight: 550;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.1);
        }

        .sidebar-collapse-edge-btn {
          position: absolute;
          top: 50%;
          right: -12px;
          transform: translateY(-50%);
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #0f172a;
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 101;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
          transition: all 0.2s ease;
          padding: 0;
        }

        .sidebar-collapse-edge-btn:hover {
          background: #1e293b;
          color: #3b82f6;
          border-color: #3b82f6;
          transform: translateY(-50%) scale(1.1);
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
