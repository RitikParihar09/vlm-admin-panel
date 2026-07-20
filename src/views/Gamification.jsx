import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import ActionModal from '../components/ActionModal';
import { Coins, Gift } from 'lucide-react';
import { 
  FaCoins, 
  FaPlus, 
  FaTrash, 
  FaAward, 
  FaTrophy, 
  FaCalendarCheck, 
  FaGift, 
  FaDice,
  FaRedoAlt,
  FaCheck,
  FaTimes,
  FaStar,
  FaShieldAlt,
  FaFire,
  FaEdit,
  FaInfoCircle,
  FaTicketAlt,
  FaRegFrownOpen,
  FaRegFrown,
  FaLock,
  FaRobot,
  FaQuestionCircle
} from 'react-icons/fa';

const Gamification = () => {
  const { spinSettings, fetchSpin, updateSpinSettings } = useAdmin();
  const [activeTab, setActiveTab] = useState('spin'); // 'points', 'coins', 'badges', 'achievements', 'streak', 'spin', 'spinwd', 'reward'
  
  // Spin Wheel Segment Config State
  const [segments, setSegments] = useState([
    { id: 1, name: '100 Coins', probability: 25, color: '#ffb300', type: 'coins', amount: 100, value: '100', isActive: true },
    { id: 2, name: '50 Coins', probability: 20, color: '#f97316', type: 'coins', amount: 50, value: '50', isActive: true },
    { id: 3, name: '5 XP', probability: 15, color: '#3b82f6', type: 'xp', amount: 5, value: '5', isActive: true },
    { id: 4, name: 'Star Learner', probability: 10, color: '#2cd2bf', type: 'badge', amount: 0, value: 'Star Learner', isActive: true },
    { id: 5, name: '1 Day Freeze', probability: 10, color: '#4caf50', type: 'streak', amount: 1, value: '1 Day', isActive: true },
    { id: 6, name: '10% OFF', probability: 10, color: '#2563eb', type: 'coupon', amount: 10, value: '10% OFF', isActive: true },
    { id: 7, name: 'Better Luck Next Time', probability: 5, color: '#9b59b6', type: 'none', amount: 0, value: '-', isActive: true },
    { id: 8, name: 'Surprise Reward', probability: 5, color: '#ec4899', type: 'random', amount: 0, value: 'Random', isActive: true }
  ]);

  // Points & XP Rules state
  const [pointRule, setPointRule] = useState({
    mcqComplete: 50,
    videoWatch: 20,
    doubtResolve: 100,
    perfectScore: 150,
    streakDays: 7,
    xpMultiplier: 1.5
  });

  // Active Badges List state
  const [badgesList, setBadgesList] = useState([
    { id: 1, name: 'Knowledge Seeker', desc: 'Complete 10 MCQ tasks with 90%+ scores.', icon: '🏆', count: 1420 },
    { id: 2, name: 'Doubt Destroyer', desc: 'Help answer 5 student doubts.', icon: '🛡️', count: 320 },
    { id: 3, name: 'Daily Streak Master', desc: 'Maintain a study streak of 15 days.', icon: '🔥', count: 856 },
    { id: 4, name: 'Perfect Score Pioneer', desc: 'Get 100% on a major term exam.', icon: '⚡', count: 432 },
    { id: 5, name: 'Peer Mentor', desc: 'Receive 5 positive peer feedback votes.', icon: '🤝', count: 180 }
  ]);

  // Daily Streak Settings
  const [streakConfig, setStreakConfig] = useState({
    targetDays: 7,
    freezePrice: 200,
    baseReward: 15,
    maxRewardMultiplier: 3
  });

  // Cooldown setting
  const [cooldownHours, setCooldownHours] = useState(24);

  // Edit Segment Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingSegIndex, setEditingSegIndex] = useState(null);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState('none');
  const [editValue, setEditValue] = useState('');
  const [editProbability, setEditProbability] = useState(0);
  const [editColor, setEditColor] = useState('#3b82f6');
  const [editIsActive, setEditIsActive] = useState(true);
  const [editIcon, setEditIcon] = useState('gift');
  const [editPopupTitle, setEditPopupTitle] = useState('');
  const [editPopupMessage, setEditPopupMessage] = useState('');
  const [resultModalOpen, setResultModalOpen] = useState(false);

  // Wheel rotation/spin animation state
  const [spinning, setSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [landedReward, setLandedReward] = useState(null);
  const [spinCount, setSpinCount] = useState(0);
  const [spinCooldownActive, setSpinCooldownActive] = useState(false);

  const openEditModal = (idx) => {
    const seg = segments[idx];
    setEditingSegIndex(idx);
    setEditName(seg.name || '');
    setEditType(seg.type || 'none');
    setEditValue(seg.value || '');
    setEditProbability(seg.probability || 0);
    setEditColor(seg.color || '#3b82f6');
    setEditIsActive(seg.isActive !== undefined ? seg.isActive : true);
    setEditIcon(seg.icon || seg.type || 'gift');
    
    // Pre-fill with existing custom title/message OR fall back to student app defaults so they aren't blank
    const defaultTitle = seg.title || (seg.type === 'none' || (seg.name || '').toLowerCase().includes('better') || (seg.name || '').toLowerCase().includes('try') ? 'TRY AGAIN!' : 'CONGRATULATIONS!');
    const defaultMessage = seg.message || (seg.type === 'none' || (seg.name || '').toLowerCase().includes('better') || (seg.name || '').toLowerCase().includes('try') 
      ? 'Better luck next time! Your daily spin has been used.' 
      : `You just won ${seg.name || 'this reward'}!`);
      
    setEditPopupTitle(defaultTitle);
    setEditPopupMessage(defaultMessage);
    setEditModalOpen(true);
  };

  const handleSaveSegmentModal = () => {
    setSegments(prev => {
      const updated = [...prev];
      if (editingSegIndex !== null && updated[editingSegIndex]) {
        const finalValue = editType === 'none' ? '-' : editValue;
        const finalAmount = editType === 'none' ? 0 : (Number(finalValue) || 0);
        updated[editingSegIndex] = {
          ...updated[editingSegIndex],
          name: editName,
          type: editType,
          value: finalValue,
          amount: finalAmount,
          probability: Number(editProbability) || 0,
          color: editColor,
          isActive: editIsActive,
          icon: editIcon,
          title: editPopupTitle,
          message: editPopupMessage
        };
      }
      return updated;
    });
    setEditModalOpen(false);
  };

  // Load backend settings
  useEffect(() => {
    if (fetchSpin) {
      fetchSpin();
    }
  }, []);

  // Sync state if backend data loaded
  useEffect(() => {
    console.log("spinSettings in useEffect:", spinSettings);
    if (spinSettings) {
      const rewards = spinSettings.rewards || [];
      if (Array.isArray(rewards) && rewards.length > 0) {
        setSegments(rewards.map((s, idx) => ({
          id: s.id || idx + 1,
          name: s.name || s.prize || '',
          probability: s.probability || 0,
          color: s.color || '#4f46e5',
          type: s.type || 'none',
          amount: s.amount || 0,
          value: s.value !== undefined ? String(s.value) : (s.amount !== undefined ? String(s.amount) : ''),
          isActive: s.isActive !== undefined ? s.isActive : true,
          icon: s.icon || s.type || 'gift',
          title: s.title || '',
          message: s.message || ''
        })));
      }
      if (spinSettings.cooldownHours !== undefined) {
        setCooldownHours(Number(spinSettings.cooldownHours) || 2);
      }
    }
  }, [spinSettings]);

  // Update segments table input inline
  const handleUpdateSegment = (idx, field, val) => {
    setSegments(prev => {
      const updated = [...prev];
      updated[idx] = {
        ...updated[idx],
        [field]: field === 'probability' || field === 'amount' ? (Number(val) || 0) : val
      };
      return updated;
    });
  };

  // Robust helper to normalize active segment probabilities to sum exactly 100% without negative numbers
  const normalizeActiveProbabilities = (list) => {
    // 1. Reset all disabled/inactive segments to 0 probability
    list.forEach(s => {
      if (!s.isActive) {
        s.probability = 0;
      } else if ((s.probability || 0) < 0) {
        s.probability = 0;
      }
    });

    const activeList = list.filter(s => s.isActive);
    if (activeList.length === 0) return;

    const currentTotal = activeList.reduce((sum, s) => sum + (s.probability || 0), 0);
    if (currentTotal === 100) return;

    const diff = 100 - currentTotal;
    if (diff > 0) {
      // Add the positive difference to the first active segment
      activeList[0].probability += diff;
    } else {
      // Proportional reduction with no-negative floor guard
      let remainingDiff = Math.abs(diff);
      for (let i = activeList.length - 1; i >= 0 && remainingDiff > 0; i--) {
        const sub = Math.min(activeList[i].probability || 0, remainingDiff);
        activeList[i].probability -= sub;
        remainingDiff -= sub;
      }
      // If there is still a mismatch, force the remaining sum adjustment safely
      if (remainingDiff > 0) {
        activeList[0].probability = 0;
      }
    }
  };

  // Toggle status with probability redistribution
  const handleToggleStatus = (idx) => {
    setSegments(prev => {
      const updated = prev.map(s => ({ ...s }));
      const target = updated[idx];
      const isNowActive = !target.isActive;

      // Minimum 4 active segments constraint check
      const activeCount = updated.filter(s => s.isActive).length;
      if (!isNowActive && activeCount <= 4) {
        alert("You must have at least 4 active segments on the spin wheel.");
        return prev;
      }

      target.isActive = isNowActive;

      // Redistribute probabilities
      if (!isNowActive) {
        const pToDistribute = target.probability;
        target.probability = 0;

        const otherActive = updated.filter((s, i) => s.isActive && i !== idx);
        const sumOtherProb = otherActive.reduce((sum, s) => sum + (s.probability || 0), 0);

        if (sumOtherProb > 0) {
          let distributedSum = 0;
          otherActive.forEach(s => {
            const share = Math.round((s.probability / sumOtherProb) * pToDistribute);
            s.probability += share;
            distributedSum += share;
          });
          const diff = pToDistribute - distributedSum;
          if (diff !== 0 && otherActive.length > 0) {
            otherActive[0].probability += diff;
          }
        }
      } else {
        const startProb = 10;
        target.probability = startProb;

        const otherActive = updated.filter((s, i) => s.isActive && i !== idx);
        const sumOtherProb = otherActive.reduce((sum, s) => sum + (s.probability || 0), 0);

        if (sumOtherProb > 0) {
          let subtractedSum = 0;
          otherActive.forEach(s => {
            const share = Math.round((s.probability / sumOtherProb) * startProb);
            s.probability = Math.max(0, s.probability - share);
            subtractedSum += share;
          });
          const diff = startProb - subtractedSum;
          if (diff !== 0 && otherActive.length > 0) {
            otherActive[0].probability = Math.max(0, otherActive[0].probability - diff);
          }
        }
      }

      // Safeguard normalization pass to guarantee no negative values and total sum exactly 100%
      normalizeActiveProbabilities(updated);
      return updated;
    });
  };

  // Add segment
  const handleAddSegment = () => {
    if (segments.length >= 8) {
      alert('Maximum 8 segments allowed.');
      return;
    }
    setSegments(prev => [
      ...prev,
      { id: prev.length + 1, name: 'New Reward', probability: 0, color: '#3b82f6', type: 'none', amount: 0, isActive: true }
    ]);
  };

  // Delete segment with probability redistribution
  const handleDeleteSegment = (idx) => {
    if (segments.length <= 4) {
      alert('Minimum 4 segments required.');
      return;
    }
    setSegments(prev => {
      const updated = prev.map(s => ({ ...s }));
      const target = updated[idx];
      const pToDistribute = target.isActive ? target.probability : 0;
      
      const filtered = updated.filter((_, i) => i !== idx);
      const activeSegments = filtered.filter(s => s.isActive);
      const sumActiveProb = activeSegments.reduce((sum, s) => sum + (s.probability || 0), 0);

      if (pToDistribute > 0 && sumActiveProb > 0) {
        let distributedSum = 0;
        activeSegments.forEach(s => {
          const share = Math.round((s.probability / sumActiveProb) * pToDistribute);
          s.probability += share;
          distributedSum += share;
        });
        const diff = pToDistribute - distributedSum;
        if (diff !== 0 && activeSegments.length > 0) {
          activeSegments[0].probability += diff;
        }
      }

      // Safeguard normalization pass to guarantee no negative values and total sum exactly 100%
      normalizeActiveProbabilities(filtered);
      return filtered;
    });
  };

  // Total probability check
  const totalProbability = segments.reduce((sum, s) => sum + (s.probability || 0), 0);

  // Save changes to backend
  const handleSaveChanges = async () => {
    if (totalProbability !== 100) {
      alert(`Total probability must equal exactly 100%. Current total: ${totalProbability}%`);
      return;
    }
    const payload = segments.map(s => ({
      id: s.id,
      name: s.name,
      probability: s.probability,
      color: s.color,
      type: s.type,
      amount: isNaN(Number(s.value)) ? 0 : Number(s.value),
      value: s.value,
      isActive: s.isActive,
      icon: s.icon || s.type || 'gift',
      title: s.title || '',
      message: s.message || ''
    }));
    const success = await updateSpinSettings({ rewards: payload, cooldownHours });
    if (success) {
      alert('Spin wheel rewards settings updated successfully!');
    }
  };

  // Interactive Spin Wheel Simulation
  const handleSpinSimulate = () => {
    if (spinning) return;
    
    const activeSegments = segments.filter(s => s.isActive !== false);
    if (activeSegments.length === 0) {
      alert("Please enable at least one segment to simulate the spin wheel.");
      return;
    }
    
    // Choose segment based on probabilities of active segments only
    const totalActiveProb = activeSegments.reduce((sum, s) => sum + (s.probability || 0), 0);
    if (totalActiveProb === 0) {
      alert("Active segments have 0% total probability.");
      return;
    }
    
    let rand = Math.random() * totalActiveProb;
    let targetIdx = 0;
    let accumulatedProb = 0;

    for (let i = 0; i < activeSegments.length; i++) {
      accumulatedProb += activeSegments[i].probability;
      if (rand <= accumulatedProb) {
        targetIdx = i;
        break;
      }
    }

    setSpinning(true);
    setLandedReward(null);

    // Calculate angle: 5 full spins + slice offsets of active segments
    const sliceAngle = 360 / activeSegments.length;
    const targetAngle = 360 * 5 * (spinCount + 1) + (360 - (targetIdx * sliceAngle));
    
    setWheelRotation(targetAngle);
    setSpinCount(c => c + 1);

    setTimeout(() => {
      setSpinning(false);
      setLandedReward(activeSegments[targetIdx]);
    }, 4600);
  };

  // Reset to default settings
  const resetToDefaults = () => {
    if (window.confirm('Reset spin settings to system default segments?')) {
      setSegments([
        { id: 1, name: 'Try Again', probability: 15, color: '#8b5cf6', type: 'none', amount: 0, value: '-', isActive: true, icon: 'frown', title: 'TRY AGAIN!', message: 'Better luck next time! Your daily spin has been used.' },
        { id: 2, name: '50 Points', probability: 15, color: '#f97316', type: 'coins', amount: 50, value: '50', isActive: true, icon: 'coins' },
        { id: 3, name: '100 Points', probability: 15, color: '#ffb300', type: 'coins', amount: 100, value: '100', isActive: true, icon: 'coins' },
        { id: 4, name: '5 AI Credits', probability: 10, color: '#3b82f6', type: 'ai_credit', amount: 5, value: '5', isActive: true, icon: 'ai' },
        { id: 5, name: '10 Doubt Credits', probability: 10, color: '#ec4899', type: 'doubt_credit', amount: 10, value: '10', isActive: true, icon: 'doubt' },
        { id: 6, name: '50 XP', probability: 15, color: '#10b981', type: 'xp', amount: 50, value: '50', isActive: true, icon: 'xp' },
        { id: 7, name: 'Surprise', probability: 10, color: '#e11d48', type: 'random', amount: 200, value: '200', isActive: true, icon: 'gift', title: 'SURPRISE!', message: 'You won a Surprise 200 Points Reward!' },
        { id: 8, name: '20 AI Credits', probability: 10, color: '#06b6d4', type: 'ai_credit', amount: 20, value: '20', isActive: true, icon: 'ai' }
      ]);
    }
  };

  // Unified React Icon component mapping for table, wheel, and preview boxes
  const getSegmentIconComponent = (customIcon, type, name = '') => {
    const text = (name || '').toLowerCase();
    const iconName = (customIcon || type || '').toLowerCase();
    
    if (iconName === 'coins' || iconName.includes('coin') || text.includes('coin') || text.includes('point')) {
      return FaCoins;
    }
    if (iconName === 'xp' || iconName === 'star' || iconName.includes('xp') || text.includes('xp')) {
      return FaStar;
    }
    if (iconName === 'badge' || iconName === 'medal' || iconName.includes('badge') || iconName.includes('learner') || text.includes('badge') || text.includes('learner')) {
      return FaAward;
    }
    if (iconName === 'lock' || text.includes('lock')) {
      return FaLock;
    }
    if (iconName === 'streak' || iconName.includes('streak') || iconName.includes('freeze') || text.includes('streak') || text.includes('freeze')) {
      return FaFire;
    }
    if (iconName === 'ticket' || iconName === 'coupon' || iconName.includes('coupon') || iconName.includes('%') || text.includes('coupon') || text.includes('%')) {
      return FaTicketAlt;
    }
    if (iconName === 'frown' || iconName === 'none' || iconName.includes('better') || iconName.includes('luck') || text.includes('better') || text.includes('luck') || text.includes('try again')) {
      return FaRegFrownOpen;
    }
    if (iconName === 'ai' || iconName === 'robot' || iconName.includes('ai') || text.includes('ai') || text.includes('robot')) {
      return FaRobot;
    }
    if (iconName === 'doubt' || iconName.includes('doubt') || text.includes('doubt') || text.includes('question')) {
      return FaQuestionCircle;
    }
    if (iconName === 'gift' || iconName === 'random' || iconName.includes('surprise') || iconName.includes('reward') || text.includes('surprise') || text.includes('reward')) {
      return FaGift;
    }
    return FaGift;
  };

  // Helper to map segments to specific UI icon colors in the settings table
  const getSegmentIconColor = (customIcon, type, name = '') => {
    const text = (name || '').toLowerCase();
    const iconName = (customIcon || type || '').toLowerCase();
    
    if (iconName === 'coins' || iconName.includes('coin') || text.includes('coin') || text.includes('point')) return '#fbbf24'; // Yellow
    if (iconName === 'xp' || iconName === 'star' || iconName.includes('xp') || text.includes('xp')) return '#3b82f6'; // Blue
    if (iconName === 'badge' || iconName === 'medal' || iconName.includes('badge') || iconName.includes('learner') || text.includes('badge') || text.includes('learner')) return '#06b6d4'; // Cyan
    if (iconName === 'lock' || text.includes('lock')) return '#64748b'; // Slate
    if (iconName === 'streak' || iconName.includes('streak') || iconName.includes('freeze') || text.includes('streak') || text.includes('freeze')) return '#10b981'; // Green
    if (iconName === 'ticket' || iconName === 'coupon' || iconName.includes('coupon') || iconName.includes('%') || text.includes('coupon') || text.includes('%')) return '#ec4899'; // Pink
    if (iconName === 'frown' || iconName === 'none' || iconName.includes('better') || iconName.includes('luck') || text.includes('better') || text.includes('luck') || text.includes('try again')) return '#8b5cf6'; // Purple
    if (iconName === 'ai' || iconName === 'robot' || iconName.includes('ai') || text.includes('ai') || text.includes('robot')) return '#6366f1'; // Indigo
    if (iconName === 'doubt' || iconName.includes('doubt') || text.includes('doubt') || text.includes('question')) return '#f43f5e'; // Rose/Pink
    if (iconName === 'gift' || iconName === 'random' || iconName.includes('surprise') || iconName.includes('reward') || text.includes('surprise') || text.includes('reward')) return '#e11d48'; // Red
    return '#4f46e5';
  };

  const getSlicePath = (index, total) => {
    const angle = 360 / total;
    const startAngle = index * angle - 90 - (angle / 2);
    const endAngle = (index + 1) * angle - 90 - (angle / 2);
    
    const rad = Math.PI / 180;
    const R = 142; // outer radius of slices
    
    const x1 = 150 + R * Math.cos(startAngle * rad);
    const y1 = 150 + R * Math.sin(startAngle * rad);
    const x2 = 150 + R * Math.cos(endAngle * rad);
    const y2 = 150 + R * Math.sin(endAngle * rad);
    
    return `M 150 150 L ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2} Z`;
  };

  const getSliceBisectorAngle = (index, total) => {
    const angle = 360 / total;
    return index * angle;
  };

  const getSegmentReactIcon = (customIcon, type, name = '') => {
    const text = (name || '').toLowerCase();
    const iconName = (customIcon || type || '').toLowerCase();
    if (iconName === 'coins' || iconName.includes('coin')) return FaCoins;
    if (iconName === 'xp' || iconName === 'star' || iconName.includes('xp')) return FaStar;
    if (iconName === 'badge' || iconName === 'medal' || iconName.includes('badge') || iconName.includes('learner')) return FaAward;
    if (iconName === 'lock' || iconName === 'streak' || iconName.includes('streak') || iconName.includes('freeze')) return FaLock;
    if (iconName === 'ticket' || iconName === 'coupon' || iconName.includes('coupon') || iconName.includes('%')) return FaTicketAlt;
    if (iconName === 'frown' || iconName === 'none' || iconName.includes('better') || iconName.includes('luck')) return FaRegFrown;
    if (iconName === 'gift' || iconName === 'random' || iconName.includes('surprise') || iconName.includes('reward')) return FaGift;
    return FaGift;
  };

  const renderSliceText = (name, x, y) => {
    const parts = name.split(' ');
    
    // Fallback for single word values
    if (parts.length === 1) {
      return (
        <text 
          x={x} 
          y={y + 3} 
          textAnchor="middle" 
          fill="#ffffff" 
          fontSize="10.5" 
          fontWeight="950"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {name}
        </text>
      );
    }
    
    let line1 = parts[0];
    let line2 = parts.slice(1).join(' ');
    
    // Case-insensitive check for common multi-line splits
    const lowerName = name.toLowerCase();
    if (lowerName.includes('better luck')) {
      line1 = 'Better Luck';
      line2 = 'Next Time';
    } else if (lowerName.includes('star learner')) {
      line1 = 'Star';
      line2 = 'Learner';
    } else if (lowerName.includes('streak freeze') || lowerName.includes('day freeze')) {
      line1 = '1 Day';
      line2 = 'Freeze';
    }
    
    return (
      <>
        <text 
          x={x} 
          y={y - 4} 
          textAnchor="middle" 
          fill="#ffffff" 
          fontSize="10" 
          fontWeight="950"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {line1}
        </text>
        <text 
          x={x} 
          y={y + 7} 
          textAnchor="middle" 
          fill="rgba(255, 255, 255, 0.85)" 
          fontSize="8.5" 
          fontWeight="850"
          style={{ fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.2px' }}
        >
          {line2}
        </text>
      </>
    );
  };


  return (
    <div className="gamification-view animate-fade-in">

      {/* Categories Cards Row */}
      <div className="gamification-cards-grid">
        <div className={`glass-panel g-rule-card ${activeTab === 'points' ? 'active' : ''}`}>
          <div className="g-card-icon points"><FaStar /></div>
          <h4>Points Rules</h4>
          <p>Manage how students earn points</p>
          <button className="g-manage-btn" onClick={() => setActiveTab('points')}>Manage</button>
        </div>

        <div className={`glass-panel g-rule-card ${activeTab === 'coins' ? 'active' : ''}`}>
          <div className="g-card-icon coins"><FaCoins /></div>
          <h4>Coins Rules</h4>
          <p>Manage how coins are earned & used</p>
          <button className="g-manage-btn" onClick={() => setActiveTab('coins')}>Manage</button>
        </div>

        <div className={`glass-panel g-rule-card ${activeTab === 'badges' ? 'active' : ''}`}>
          <div className="g-card-icon badges"><FaShieldAlt /></div>
          <h4>Badges</h4>
          <p>Create and manage badges</p>
          <button className="g-manage-btn" onClick={() => setActiveTab('badges')}>Manage</button>
        </div>

        <div className={`glass-panel g-rule-card ${activeTab === 'achievements' ? 'active' : ''}`}>
          <div className="g-card-icon achievements"><FaTrophy /></div>
          <h4>Achievements</h4>
          <p>Manage achievements & milestones</p>
          <button className="g-manage-btn" onClick={() => setActiveTab('achievements')}>Manage</button>
        </div>

        <div className={`glass-panel g-rule-card ${activeTab === 'streak' ? 'active' : ''}`}>
          <div className="g-card-icon streak"><FaFire /></div>
          <h4>Daily Streak</h4>
          <p>Manage streak rules & rewards</p>
          <button className="g-manage-btn" onClick={() => setActiveTab('streak')}>Manage</button>
        </div>

        <div className={`glass-panel g-rule-card ${activeTab === 'spin' ? 'active' : ''}`}>
          <div className="g-card-icon spin"><FaDice /></div>
          <h4>Spin Wheel</h4>
          <p>Edit spin wheel segment rewards</p>
          <button className="g-manage-btn" onClick={() => setActiveTab('spin')}>Manage</button>
        </div>


        <div className={`glass-panel g-rule-card ${activeTab === 'reward' ? 'active' : ''}`}>
          <div className="g-card-icon reward"><FaGift /></div>
          <h4>Reward Rules</h4>
          <p>Manage reward redemption rules</p>
          <button className="g-manage-btn" onClick={() => setActiveTab('reward')}>Manage</button>
        </div>
      </div>

      {/* Tab Panel Body Layout */}
      {activeTab === 'spin' && (
        <div className="spin-wheel-config-flex">
          {/* Spin Wheel Settings table */}
          <div className="glass-panel spin-settings-box">
            <h3 className="section-title-g">Spin Wheel Settings</h3>
            <p className="section-desc-g">Add, edit or remove prizes and set probability for each segment.</p>
            
            <div className="spin-table-wrapper">
              <table className="spin-config-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>#</th>
                    <th>Prize / Reward</th>
                    <th>Type</th>
                    <th>Value</th>
                    <th style={{ width: '90px' }}>Probability (%)</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right', width: '100px', verticalAlign: 'bottom', paddingBottom: '10px' }}>
                      <div style={{ 
                        fontSize: '9px', 
                        fontWeight: '800', 
                        color: totalProbability === 100 ? '#10b981' : '#ef4444', 
                        marginBottom: '6px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.2px',
                        textAlign: 'right',
                        whiteSpace: 'nowrap'
                      }}>
                        Total: {totalProbability}%
                      </div>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {segments.map((seg, idx) => (
                    <tr key={seg.id || idx}>
                      <td>{idx + 1}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '16px', display: 'flex', alignItems: 'center' }}>
                            {(() => {
                              const IconComp = getSegmentIconComponent(seg.icon, seg.type, seg.name);
                              const iconColor = getSegmentIconColor(seg.icon, seg.type, seg.name);
                              return <IconComp style={{ color: iconColor }} />;
                            })()}
                          </span>
                          <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{seg.name}</span>
                        </div>
                      </td>
                      <td style={{ textTransform: 'capitalize', fontWeight: '600', color: '#475569' }}>
                        {seg.type === 'xp' ? 'XP Points' : seg.type === 'none' ? 'Other' : seg.type}
                      </td>
                      <td style={{ fontWeight: 'bold', color: '#334155' }}>
                        {seg.value || '-'}
                      </td>
                      <td style={{ fontWeight: 'bold', color: '#0f172a' }}>
                        {seg.probability}%
                      </td>
                      <td>
                        <button 
                          className={`switch-toggle-btn ${seg.isActive ? 'active' : ''}`}
                          onClick={() => handleToggleStatus(idx)}
                          type="button"
                          aria-label="Toggle Status"
                        >
                          <span className="switch-slider"></span>
                        </button>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                          <button 
                            className="table-row-edit-btn" 
                            onClick={() => openEditModal(idx)}
                            title="Edit Segment"
                            type="button"
                            style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              width: '28px', 
                              height: '28px', 
                              borderRadius: '6px', 
                              background: '#eff6ff', 
                              border: '1px solid #bfdbfe',
                              color: '#3b82f6',
                              cursor: 'pointer',
                              padding: 0,
                              boxSizing: 'border-box'
                            }}
                          >
                            <FaEdit style={{ fontSize: '11px' }} />
                          </button>
                          <button 
                            className="table-row-delete-btn" 
                            onClick={() => handleDeleteSegment(idx)} 
                            title="Delete Segment" 
                            style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              width: '28px', 
                              height: '28px', 
                              borderRadius: '6px', 
                              background: '#fef2f2', 
                              border: '1px solid #fee2e2',
                              color: '#ef4444',
                              cursor: 'pointer',
                              padding: 0,
                              boxSizing: 'border-box'
                            }}
                          >
                            <FaTrash style={{ fontSize: '11px' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Spin Cooldown Settings Row */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              marginTop: '20px',
              marginBottom: '20px',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FaInfoCircle style={{ color: '#6366f1', fontSize: '20px', flexShrink: 0 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <span style={{ fontWeight: '700', fontSize: '13px', color: '#0f172a' }}>Spin Cooldown (App Usage hours)</span>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>
                    Cooldown is calculated based on active student app learning time, not regular hours.
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                <input 
                  type="number"
                  min="1"
                  max="168"
                  value={cooldownHours}
                  onChange={(e) => setCooldownHours(Number(e.target.value) || 2)}
                  style={{
                    width: '75px',
                    padding: '8px 12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    color: '#0f172a',
                    textAlign: 'center',
                    background: 'white'
                  }}
                />
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>Hours</span>
              </div>
            </div>

            <div className="spin-actions-bottom-row">
              <button className="g-add-segment-btn" onClick={handleAddSegment}>
                <FaPlus style={{ marginRight: '6px' }} /> Add New Segment
              </button>


              <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto' }}>
                <button className="g-reset-defaults-btn" onClick={resetToDefaults}>
                  <FaRedoAlt style={{ marginRight: '6px' }} /> Reset to Default
                </button>
                <button className="g-save-settings-btn" onClick={handleSaveChanges}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Wheel Preview Panel */}
          <div className="glass-panel spin-preview-box">
            <h3 className="section-title-g">Wheel Preview</h3>
            <p className="section-desc-g">This is how the spin wheel looks for students.</p>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', marginTop: '55px', position: 'relative' }}>
              {(() => {
                const activeSegments = segments.filter(s => s.isActive !== false);
                const totalSegments = activeSegments.length || 1;
                const activeSliceAngle = 360 / totalSegments;
                const gradientParts = activeSegments.length > 0 
                  ? activeSegments.map((seg, idx) => {
                      const start = idx * activeSliceAngle;
                      const end = (idx + 1) * activeSliceAngle;
                      return `${seg.color} ${start}deg ${end}deg`;
                    })
                  : ['#cbd5e1 0deg 360deg'];
                const conicGradient = `conic-gradient(${gradientParts.join(', ')})`;
                
                const lines = [];
                if (activeSegments.length > 0) {
                  for (let i = 0; i < activeSegments.length; i++) {
                    const rot = i * activeSliceAngle;
                    lines.push(
                      <div 
                        key={`line-${activeSegments.length}-${i}`} 
                        className="wheel-separator-line" 
                        style={{ transform: `rotate(${rot}deg)` }}
                      />
                    );
                  }
                }

                return (
                  <div className="spinner-wrapper">
                    {/* Top Custom SVG Pin Marker */}
                    <svg className="top-pin" viewBox="0 0 60 85" xmlns="http://www.w3.org/2000/svg">
                      <path d="M30,0 C13.431,0 0,13.431 0,30 C0,51.105 27.75,82.2 28.95,83.7 C29.49,84.405 30.51,84.405 31.05,83.7 C32.25,82.2 60,51.105 60,30 C60,13.431 46.569,0 30,0 Z" fill="#6140EA" />
                      <circle cx="30" cy="27" r="9" fill="white" />
                    </svg>

                    {/* Outer and Inner Wheel */}
                    <div className="wheel-outer">
                      <div 
                        className="wheel-inner"
                        style={{
                          background: conicGradient,
                          transform: `rotate(${wheelRotation - (activeSliceAngle / 2)}deg)`,
                          transition: spinning ? 'transform 4.5s cubic-bezier(0.15, 0.9, 0.25, 1)' : 'none'
                        }}
                      >
                        {/* White Separator Lines */}
                        <div className="lines-container">
                          {lines}
                        </div>

                        {/* Slices Content */}
                        <div className="content-container">
                          {activeSegments.map((seg, i) => {
                            const rot = (i * activeSliceAngle) + (activeSliceAngle / 2);
                            const IconComponent = getSegmentIconComponent(seg.icon, seg.type, seg.name);
                            return (
                              <div 
                                key={seg.id || i} 
                                className="slice-content" 
                                style={{ 
                                  transform: `rotate(${rot}deg)`,
                                  paddingTop: activeSegments.length > 6 ? '24px' : '30px'
                                }}
                              >
                                <div style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.15))', marginBottom: '4px' }}>
                                  <IconComponent size={activeSegments.length > 6 ? 24 : 28} color="#ffffff" style={{ display: 'block' }} />
                                </div>
                                <div className="slice-text" style={{ fontSize: activeSegments.length > 6 ? '9.5px' : '11px', maxWidth: activeSegments.length > 6 ? '70px' : '85px' }}>
                                  {seg.name.split(' ').map((word, wIdx) => (
                                    <div key={wIdx}>{word}</div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Center Spin Button */}
                    <div className="center-btn-outer">
                      <button 
                        className="center-btn-inner" 
                        onClick={handleSpinSimulate}
                        disabled={spinning}
                      >
                        SPIN
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Student Popup Preview Container */}
              <div style={{
                width: '100%',
                maxWidth: '320px',
                marginTop: '30px',
                borderTop: '1px solid #e2e8f0',
                paddingTop: '25px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '15px' }}>
                  Student Reward Popup Preview
                </span>
                
                {landedReward ? (() => {
                  const liveReward = segments.find(s => s.id === landedReward.id) || landedReward;
                  const isTryAgain = liveReward.type === 'none' || liveReward.name.toLowerCase().includes('better') || liveReward.name.toLowerCase().includes('luck');
                  const popupTitle = liveReward.title || (isTryAgain ? 'TRY AGAIN!' : 'CONGRATULATIONS!');
                  const popupMessage = liveReward.message || (isTryAgain ? 'Better luck next time! Your daily spin has been used.' : `You just won ${liveReward.name}!`);
                  const popupLabel = liveReward.name.split(' ')[0] || 'REWARD';
                  const popupSub = liveReward.name.split(' ').slice(1).join(' ').toUpperCase() || liveReward.type.toUpperCase();
                  
                  return (
                    <div style={{
                      width: '100%',
                      borderRadius: '20px',
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      padding: '28px',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '20px',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.06)'
                    }}>
                      {/* Emoji Circle */}
                      <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '32px',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                      }}>
                        {isTryAgain ? '😢' : '🎉'}
                      </div>

                      {/* Text Area */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <h4 style={{
                          fontSize: '20px',
                          fontWeight: '900',
                          color: '#0f172a',
                          textTransform: 'uppercase',
                          margin: 0,
                          letterSpacing: '-0.3px'
                        }}>
                          {popupTitle}
                        </h4>
                        <p style={{
                          fontSize: '13px',
                          fontWeight: '600',
                          color: '#475569',
                          margin: 0,
                          lineHeight: '1.5',
                          padding: '0 8px'
                        }}>
                          {popupMessage}
                        </p>
                      </div>

                      {/* Reward Display Box */}
                      <div style={{
                        padding: '16px 24px',
                        borderRadius: '16px',
                        background: '#f8fafc',
                        border: '1px solid #f1f5f9',
                        width: '100%',
                        boxSizing: 'border-box',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                      }}>
                        <span style={{
                          fontSize: '28px',
                          fontWeight: '900',
                          color: '#0f172a',
                          display: 'block',
                          letterSpacing: '-0.5px'
                        }}>
                          {popupLabel}
                        </span>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: '700',
                          color: '#6140EA',
                          textTransform: 'uppercase',
                          letterSpacing: '0.15em',
                          display: 'block',
                          marginTop: '4px'
                        }}>
                          {popupSub}
                        </span>
                      </div>

                      {/* Coupon Code Block (If applicable) */}
                      {liveReward.type === 'coupon' && (
                        <div style={{
                          width: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          textAlign: 'left'
                        }}>
                          <span style={{ fontSize: '9px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            YOUR COUPON CODE
                          </span>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 14px',
                            borderRadius: '12px',
                            background: 'rgba(97,64,234,0.05)',
                            border: '1px solid rgba(97,64,234,0.15)',
                            width: '100%',
                            boxSizing: 'border-box'
                          }}>
                            <code style={{ fontSize: '13px', fontWeight: '900', color: '#6140EA', fontFamily: 'monospace' }}>
                              {liveReward.value || 'COUPON100'}
                            </code>
                            <button style={{
                              padding: '5px 10px',
                              borderRadius: '8px',
                              fontSize: '11px',
                              fontWeight: '800',
                              background: '#6140EA',
                              color: '#ffffff',
                              border: 'none',
                              cursor: 'pointer'
                            }}>
                              Copy
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Claim Button */}
                      <button style={{
                        width: '100%',
                        height: '44px',
                        borderRadius: '22px',
                        background: '#6140EA',
                        border: 'none',
                        color: '#ffffff',
                        fontWeight: '700',
                        fontSize: '14px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 10px rgba(97,64,234,0.3)',
                        transition: 'all 0.2s'
                      }} onClick={() => setLandedReward(null)}>
                        Claim Reward
                      </button>
                    </div>
                  );
                })() : (
                  <div style={{
                    width: '100%',
                    borderRadius: '16px',
                    border: '1px dashed #cbd5e1',
                    background: '#f8fafc',
                    padding: '30px 20px',
                    textAlign: 'center',
                    boxSizing: 'border-box'
                  }}>
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
                      Spin the wheel to preview the student congratulations/reward popup message here.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'points' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 className="section-title-g">Points Rules Config</h3>
          <p className="section-desc-g">Configure how much XP students receive for taking class actions.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '500px', marginTop: '20px' }}>
            <div className="rule-config-row">
              <label>MCQ Task Complete (XP)</label>
              <input 
                type="number" 
                value={pointRule.mcqComplete} 
                onChange={(e) => setPointRule({...pointRule, mcqComplete: parseInt(e.target.value) || 0})} 
                className="glass-input rule-input-element"
              />
            </div>
            <div className="rule-config-row">
              <label>Watching Video Lectures (XP)</label>
              <input 
                type="number" 
                value={pointRule.videoWatch} 
                onChange={(e) => setPointRule({...pointRule, videoWatch: parseInt(e.target.value) || 0})} 
                className="glass-input rule-input-element"
              />
            </div>
            <div className="rule-config-row">
              <label>Doubt Answer Resolved (XP)</label>
              <input 
                type="number" 
                value={pointRule.doubtResolve} 
                onChange={(e) => setPointRule({...pointRule, doubtResolve: parseInt(e.target.value) || 0})} 
                className="glass-input rule-input-element"
              />
            </div>
            <div className="rule-config-row">
              <label>Perfect 100% MCQ Exam Score (XP)</label>
              <input 
                type="number" 
                value={pointRule.perfectScore} 
                onChange={(e) => setPointRule({...pointRule, perfectScore: parseInt(e.target.value) || 0})} 
                className="glass-input rule-input-element"
              />
            </div>
            <button className="g-save-settings-btn" onClick={() => alert('XP scoring rules updated successfully!')} style={{ width: '100%', marginTop: '15px' }}>
              Save Multipliers
            </button>
          </div>
        </div>
      )}

      {activeTab === 'coins' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 className="section-title-g">Coins Rules Config</h3>
          <p className="section-desc-g">Configure how coins are earned and their exchange metrics.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '500px', marginTop: '20px' }}>
            <div className="rule-config-row">
              <label>Coins Conversion Rate (1 Coin = X XP)</label>
              <input 
                type="number" 
                value={10} 
                className="glass-input rule-input-element"
                disabled
              />
            </div>
            <div className="rule-config-row">
              <label>Max Coins Earnable per day</label>
              <input 
                type="number" 
                value={1000} 
                className="glass-input rule-input-element"
                disabled
              />
            </div>
            <button className="g-save-settings-btn" onClick={() => alert('Coins conversion rules updated.')} style={{ width: '100%', marginTop: '15px' }}>
              Save Rules
            </button>
          </div>
        </div>
      )}

      {activeTab === 'badges' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 className="section-title-g">Active Badges & Achievements</h3>
          <p className="section-desc-g">Milestone badges earned by students for consistent participation.</p>
          <div className="badges-grid-premium" style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
            {badgesList.map(b => (
              <div key={b.id} style={{ display: 'flex', gap: '15px', alignItems: 'center', background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                <span style={{ fontSize: '32px' }}>{b.icon}</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800 }}>{b.name}</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{b.desc}</p>
                </div>
                <div style={{ marginLeft: 'auto', fontSize: '12px', fontWeight: 700, color: '#3b82f6' }}>
                  {b.count.toLocaleString()} earners
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 className="section-title-g">System Milestones</h3>
          <p className="section-desc-g">Custom achievements unlocked upon video watches or MCQ completions.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '500px', marginTop: '20px' }}>
            <div className="rule-config-row">
              <label>Complete 10 MCQs</label>
              <span style={{ fontSize: '12.5px', color: '#64748b' }}>Unlocked - Reward: 200 XP</span>
            </div>
            <div className="rule-config-row">
              <label>Watch 5 hours of Video Lectures</label>
              <span style={{ fontSize: '12.5px', color: '#64748b' }}>Unlocked - Reward: 100 XP</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'streak' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 className="section-title-g">Daily Streak Rules</h3>
          <p className="section-desc-g">Streaks reward students who open and study in the app daily.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '500px', marginTop: '20px' }}>
            <div className="rule-config-row">
              <label>Target Streak Loop (Days)</label>
              <input 
                type="number" 
                value={streakConfig.targetDays} 
                onChange={(e) => setStreakConfig({...streakConfig, targetDays: parseInt(e.target.value) || 7})} 
                className="glass-input rule-input-element"
              />
            </div>
            <div className="rule-config-row">
              <label>Base Reward per day (Coins)</label>
              <input 
                type="number" 
                value={streakConfig.baseReward} 
                onChange={(e) => setStreakConfig({...streakConfig, baseReward: parseInt(e.target.value) || 15})} 
                className="glass-input rule-input-element"
              />
            </div>
            <div className="rule-config-row">
              <label>Streak Freeze Price (Coins)</label>
              <input 
                type="number" 
                value={streakConfig.freezePrice} 
                onChange={(e) => setStreakConfig({...streakConfig, freezePrice: parseInt(e.target.value) || 200})} 
                className="glass-input rule-input-element"
              />
            </div>
            <button className="g-save-settings-btn" onClick={() => alert('Streak rules applied successfully!')} style={{ width: '100%', marginTop: '15px' }}>
              Save Streak Parameters
            </button>
          </div>
        </div>
      )}


      {activeTab === 'reward' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 className="section-title-g">General Reward Rules</h3>
          <p className="section-desc-g">Define limits and multipliers for standard learning activity rewards.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '500px', marginTop: '20px' }}>
            <div className="rule-config-row">
              <label>First Login of the Day (XP)</label>
              <input type="number" defaultValue={10} className="glass-input rule-input-element" />
            </div>
            <div className="rule-config-row">
              <label>Continuous 3-day Study Multiplier</label>
              <input type="number" defaultValue={1.2} step="0.1" className="glass-input rule-input-element" />
            </div>
            <button className="g-save-settings-btn" onClick={() => alert('Reward rules saved!')} style={{ width: '100%', marginTop: '15px' }}>
              Save Rules
            </button>
          </div>
        </div>
      )}


      <ActionModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Wheel Segment Settings"
        onSubmit={handleSaveSegmentModal}
        submitText="Save Segment"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', padding: '4px 0' }}>
          {/* Row 1: Reward Label */}
          <div className="g-modal-form-group" style={{ display: 'flex', flexDirection: 'column' }}>
            <label className="g-modal-label">Prize / Reward Label</label>
            <input
              type="text"
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="g-modal-input"
              placeholder="e.g. 100 Coins"
            />
          </div>

          {/* Row 2: Reward Type & Value */}
          <div style={{ display: 'flex', gap: '16px' }}>
            <div className="g-modal-form-group" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <label className="g-modal-label">Reward Type</label>
              <select
                value={editType}
                onChange={(e) => {
                  const val = e.target.value;
                  setEditType(val);
                  if (val === 'none') {
                    setEditIcon('frown');
                  }
                }}
                className="g-modal-input g-modal-select"
              >
                <option value="coins">Coins</option>
                <option value="xp">XP Points</option>
                <option value="coupon">Coupon</option>
                <option value="ai_credit">AI Credit</option>
                <option value="doubt_credit">Doubt Credit</option>
                <option value="none">Try Again</option>
              </select>
            </div>

            <div className="g-modal-form-group" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <label className="g-modal-label">Reward Value</label>
              <input
                type="text"
                required={editType !== 'none'}
                disabled={editType === 'none'}
                value={editType === 'none' ? '-' : editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="g-modal-input"
                placeholder={editType === 'none' ? 'No Value Needed' : 'e.g. 100 or Star Learner'}
                style={editType === 'none' ? { background: '#f1f5f9', cursor: 'not-allowed', color: '#94a3b8' } : {}}
              />
            </div>
          </div>

          {/* Row 3: Segment Icon & Background Color */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
            <div className="g-modal-form-group" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <label className="g-modal-label">Segment Icon</label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <select
                  value={editIcon}
                  onChange={(e) => setEditIcon(e.target.value)}
                  className="g-modal-input g-modal-select"
                  style={{ flex: 1 }}
                >
                  <option value="coins">🪙 Coins Stack</option>
                  <option value="xp">⭐ XP Star</option>
                  <option value="badge">🏆 Badge Medal</option>
                  <option value="lock">🔒 Padlock</option>
                  <option value="ticket">🎟️ Coupon Ticket</option>
                  <option value="frown">😢 Sad Frown Face</option>
                  <option value="gift">🎁 Surprise Gift Box</option>
                  <option value="ai">🤖 AI Bot</option>
                  <option value="doubt">❓ Doubt Question</option>
                </select>
                
                {/* Visual Icon Preview Box */}
                <div style={{ 
                  width: '38px', 
                  height: '38px', 
                  borderRadius: '8px', 
                  background: '#6140EA', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 2px 6px rgba(97, 64, 234, 0.2)'
                }} title="Selected Icon Preview">
                  {(() => {
                    const IconComp = getSegmentIconComponent(editIcon, editType, editName);
                    return <IconComp size={20} color="#ffffff" style={{ display: 'block' }} />;
                  })()}
                </div>
              </div>
            </div>

            <div className="g-modal-form-group" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <label className="g-modal-label">Sector Background Color</label>
              <div style={{ 
                display: 'flex', 
                border: '1px solid #cbd5e1', 
                borderRadius: '8px', 
                overflow: 'hidden', 
                background: '#ffffff', 
                alignItems: 'center', 
                height: '38px',
                boxSizing: 'border-box'
              }}>
                <div style={{ position: 'relative', width: '38px', height: '38px', flexShrink: 0, overflow: 'hidden' }}>
                  <input
                    type="color"
                    value={editColor}
                    onChange={(e) => setEditColor(e.target.value)}
                    style={{
                      position: 'absolute',
                      top: '-6px',
                      left: '-6px',
                      width: '50px',
                      height: '50px',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      background: 'none'
                    }}
                  />
                </div>
                <input
                  type="text"
                  value={editColor}
                  onChange={(e) => setEditColor(e.target.value)}
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    padding: '0 12px',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#334155',
                    background: 'transparent',
                    height: '100%',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Row 4: Probability Weight (%) & Active Status Toggle */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
            <div className="g-modal-form-group" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <label className="g-modal-label">Probability Weight (%)</label>
              <input
                type="number"
                required
                min="0"
                max="100"
                value={editProbability}
                onChange={(e) => setEditProbability(Number(e.target.value) || 0)}
                className="g-modal-input"
              />
            </div>

            <div className="g-modal-form-group" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <label className="g-modal-label">Wheel Active Status</label>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                height: '38px',
                padding: '0 14px',
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                boxSizing: 'border-box'
              }}>
                <button
                  className={`switch-toggle-btn ${editIsActive ? 'active' : ''}`}
                  onClick={() => setEditIsActive(!editIsActive)}
                  type="button"
                  aria-label="Toggle Active State"
                  style={{ flexShrink: 0 }}
                >
                  <span className="switch-slider"></span>
                </button>
                <span style={{ fontSize: '12.5px', fontWeight: '750', color: editIsActive ? '#10b981' : '#64748b' }}>
                  {editIsActive ? 'Active Segment' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>

          {/* Section Divider: Student Popup Custom Messages */}
          <div style={{
            borderTop: '1px solid #e2e8f0',
            margin: '12px 0 2px 0',
            paddingTop: '16px'
          }}>
            <h4 style={{ fontSize: '12px', fontWeight: '800', color: '#6140EA', textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0 }}>
              Student Popup Custom Messages
            </h4>
            <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0 0', lineHeight: '1.3' }}>
              Override the congratulations/try-again messages shown to the student upon earning this reward.
            </p>
          </div>

          {/* Row 5: Popup Custom Title (Optional) */}
          <div className="g-modal-form-group" style={{ display: 'flex', flexDirection: 'column' }}>
            <label className="g-modal-label">Popup Custom Title (Optional)</label>
            <input
              type="text"
              value={editPopupTitle}
              onChange={(e) => setEditPopupTitle(e.target.value)}
              className="g-modal-input"
              placeholder="e.g. CONGRATULATIONS!"
            />
          </div>

          {/* Row 6: Popup Custom Message (Optional) */}
          <div className="g-modal-form-group" style={{ display: 'flex', flexDirection: 'column' }}>
            <label className="g-modal-label">Popup Custom Message (Optional)</label>
            <input
              type="text"
              value={editPopupMessage}
              onChange={(e) => setEditPopupMessage(e.target.value)}
              className="g-modal-input"
              placeholder="e.g. You just won 100 Gold Coins!"
            />
          </div>
        </div>
      </ActionModal>


      {/* Styling Block */}
      <style>{`
        .gamification-view {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* Top Grid Categories */
        .gamification-cards-grid {
          display: grid;
          grid-template-columns: repeat(7, minmax(0, 1fr));
          gap: 10px;
        }

        .g-rule-card {
          padding: 14px 6px;
          border-radius: 12px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          border: 1px solid rgba(0, 0, 0, 0.05);
          background: #ffffff;
          box-shadow: 0 4px 15px rgba(0,0,0,0.02);
          transition: all 0.2s ease;
        }

        .g-rule-card.active {
          border-color: #3b82f6;
          box-shadow: 0 10px 25px rgba(59, 130, 246, 0.1);
          transform: translateY(-2px);
        }

        .g-rule-card h4 {
          font-size: 12px;
          font-weight: 800;
          color: #0f172a;
          margin: 10px 0 4px 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          width: 100%;
        }

        .g-rule-card p {
          font-size: 9.5px;
          color: #64748b;
          margin: 0 0 12px 0;
          line-height: 1.2;
          height: 24px;
          overflow: hidden;
        }

        .g-card-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }

        .g-card-icon.points { background: #f5f3ff; color: #7c3aed; }
        .g-card-icon.coins { background: #fffbeb; color: #d97706; }
        .g-card-icon.badges { background: #eff6ff; color: #2563eb; }
        .g-card-icon.achievements { background: #ecfdf5; color: #047857; }
        .g-card-icon.streak { background: #fff5f5; color: #e11d48; }
        .g-card-icon.spin { background: #f5f3ff; color: #7c3aed; }
        .g-card-icon.spinwd { background: #eef2ff; color: #4f46e5; }
        .g-card-icon.reward { background: #fffbeb; color: #d97706; }

        .g-manage-btn {
          width: 90%;
          padding: 5px 0;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #475569;
          font-size: 11px;
          font-weight: 750;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .g-rule-card.active .g-manage-btn {
          background: #3b82f6;
          border-color: #3b82f6;
          color: #ffffff;
        }

        .g-manage-btn:hover {
          background: #f8fafc;
        }

        /* Flex config boxes */
        .spin-wheel-config-flex {
          display: flex;
          gap: 24px;
        }

        @media (max-width: 1024px) {
          .spin-wheel-config-flex {
            flex-direction: column;
          }
        }

        .spin-settings-box {
          flex: 1.4;
          padding: 24px;
          border-radius: 14px;
        }

        .spin-preview-box {
          flex: 1;
          padding: 24px;
          border-radius: 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .section-title-g {
          font-size: 16px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 4px 0;
        }

        .section-desc-g {
          font-size: 12.5px;
          color: #64748b;
          margin: 0;
        }

        /* Table custom settings */
        .spin-table-wrapper {
          margin-top: 20px;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          overflow: hidden;
        }

        .spin-config-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .spin-config-table th {
          background: #f8fafc;
          padding: 10px 14px;
          font-size: 11px;
          font-weight: 800;
          color: #475569;
          border-bottom: 1px solid #cbd5e1;
        }

        .spin-config-table td {
          padding: 8px 14px;
          font-size: 12.5px;
          color: #334155;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: middle;
        }

        .table-inline-input {
          width: 100%;
          padding: 6px 8px;
          border-radius: 4px;
          border: 1px solid #cbd5e1;
          font-size: 12px;
          font-weight: 650;
          box-sizing: border-box;
        }

        .table-inline-input.numeric {
          text-align: center;
        }

        .table-inline-select {
          padding: 6px;
          border-radius: 4px;
          border: 1px solid #cbd5e1;
          font-size: 12px;
          font-weight: 650;
        }

        .table-row-delete-btn {
          background: none;
          border: none;
          color: #ef4444;
          cursor: pointer;
          padding: 6px;
          font-size: 13px;
        }

        /* Switch Toggle Button */
        .switch-toggle-btn {
          position: relative;
          width: 38px;
          height: 20px;
          border-radius: 15px;
          background: #cbd5e1;
          border: none;
          cursor: pointer;
          transition: background 0.2s;
          padding: 0;
          display: inline-flex;
          align-items: center;
        }

        .switch-toggle-btn.active {
          background: #10b981;
        }

        .switch-slider {
          position: absolute;
          left: 2px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          transition: transform 0.2s;
        }

        .switch-toggle-btn.active .switch-slider {
          transform: translateX(18px);
        }

        .spin-actions-bottom-row {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-top: 18px;
          flex-wrap: wrap;
        }

        .g-add-segment-btn {
          background: #ffffff;
          color: #4f46e5;
          border: 1px solid #cbd5e1;
          padding: 8px 14px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 750;
          cursor: pointer;
          transition: background 0.2s;
        }

        .g-add-segment-btn:hover {
          background: #f8fafc;
        }

        .total-prob-badge {
          font-size: 12px;
          font-weight: 750;
          background: #f8fafc;
          padding: 6px 12px;
          border-radius: 20px;
          border: 1px solid #cbd5e1;
        }

        .g-reset-defaults-btn {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #475569;
          padding: 8px 14px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 750;
          cursor: pointer;
        }

        .g-reset-defaults-btn:hover {
          background: #f8fafc;
        }

        .g-save-settings-btn {
          background: #4f46e5;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 750;
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(79, 70, 229, 0.25);
        }

        .g-save-settings-btn:hover {
          background: #4338ca;
        }

        .landed-reward-toast-g {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #166534;
          font-size: 12.5px;
          font-weight: 750;
          padding: 8px 16px;
          border-radius: 8px;
          margin-top: 15px;
          width: 100%;
          box-sizing: border-box;
          text-align: center;
        }

        .cooldown-info-card-g {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 10px 14px;
          border-radius: 10px;
          width: 100%;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .cooldown-info-card-g .c-title {
          font-size: 12px;
          font-weight: 800;
          color: #0f172a;
        }

        .cooldown-info-card-g .c-desc {
          font-size: 10px;
          color: #64748b;
        }

        .cooldown-edit-btn {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #475569;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 6px;
          cursor: pointer;
        }

        .cooldown-edit-btn:hover {
          background: #f8fafc;
        }

        /* Rules input config rows */
        .rule-config-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          background: #f8fafc;
          padding: 12px 18px;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
        }

        .rule-config-row label {
          font-size: 12.5px;
          font-weight: 700;
          color: #334155;
        }

        .rule-input-element {
          width: 80px;
          padding: 6px;
          text-align: center;
          font-weight: 700;
          font-size: 12.5px;
        }

        /* Gamification bottom stats overview */
        .gamification-overview-panel {
          padding: 24px;
          border-radius: 14px;
        }

        .g-overview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
          margin-top: 20px;
        }

        .g-overview-card {
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .g-overview-card .lbl {
          font-size: 10px;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
        }

        .g-overview-card .val {
          font-size: 18px;
          font-weight: 850;
          color: #0f172a;
        }

        .g-overview-card .trend {
          font-size: 9.5px;
          font-weight: 600;
          color: #10b981;
        }

        /* CUSTOM MODAL FORMS */
        .g-modal-label {
          font-size: 11px !important;
          font-weight: 800 !important;
          color: #475569 !important;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin-bottom: 6px;
          display: block;
        }

        .g-modal-input {
          width: 100%;
          height: 38px;
          padding: 8px 12px;
          border-radius: 6px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          font-size: 13px;
          font-weight: 650;
          color: #1e293b;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .g-modal-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        select.g-modal-select {
          appearance: none;
          background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E");
          background-position: right 10px center;
          background-repeat: no-repeat;
          background-size: 18px;
          padding-right: 32px;
        }

        /* Premium CSS-based Conic Spinner Preview styles */
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&display=swap');

        .spinner-wrapper {
            position: relative;
            width: 300px;
            height: 300px;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0 auto;
            font-family: 'Nunito', sans-serif;
        }

        .top-pin {
            position: absolute;
            top: -16px;
            left: 50%;
            transform: translateX(-50%);
            width: 28px;
            height: 38px;
            z-index: 30;
            filter: drop-shadow(0 3px 4px rgba(0,0,0,0.15));
        }

        .wheel-outer {
            width: 100%;
            height: 100%;
            background-color: white;
            border-radius: 50%;
            padding: 8px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
            box-sizing: border-box;
            position: relative;
        }

        .wheel-inner {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            position: relative;
            overflow: hidden;
            will-change: transform;
        }

        .lines-container {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
        }
        
        .wheel-separator-line {
            position: absolute;
            top: 0; left: 50%;
            width: 2px;
            height: 50%;
            background: white;
            transform-origin: bottom center;
            margin-left: -1px;
        }

        .content-container {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            pointer-events: none;
        }

        .slice-content {
            position: absolute;
            top: 0;
            left: 50%;
            margin-left: -50px;
            width: 100px;
            height: 50%;
            transform-origin: bottom center;
            display: flex;
            flex-direction: column;
            align-items: center;
            box-sizing: border-box;
            color: white;
        }
        
        .slice-text {
            font-weight: 900;
            line-height: 1.15;
            text-align: center;
            text-shadow: 0 1px 2px rgba(0,0,0,0.2);
            letter-spacing: 0.1px;
        }

        .center-btn-outer {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 76px;
            height: 76px;
            background-color: white;
            border-radius: 50%;
            box-shadow: 0 3px 8px rgba(0,0,0,0.12);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 20;
        }

        .center-btn-inner {
            width: 62px;
            height: 62px;
            background-color: #6140EA;
            border-radius: 50%;
            border: none;
            color: white;
            font-family: 'Nunito', sans-serif;
            font-size: 15px;
            font-weight: 900;
            cursor: pointer;
            outline: none;
            transition: transform 0.1s;
            box-shadow: inset 0 -2px 0 rgba(0,0,0,0.15);
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .center-btn-inner:active {
            transform: scale(0.95);
            box-shadow: inset 0 -1px 0 rgba(0,0,0,0.15);
        }

        /* Result Modal Overlay */
        .g-modal-overlay-res {
            position: fixed;
            top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(15, 23, 42, 0.45);
            backdrop-filter: blur(4px);
            display: flex;
            justify-content: center;
            align-items: center;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
            z-index: 9999;
        }
        
        .g-modal-overlay-res.active { opacity: 1; pointer-events: all; }
        
        .g-modal-content-res {
            background: white;
            padding: 30px 40px;
            border-radius: 20px;
            text-align: center;
            transform: translateY(20px);
            transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            max-width: 320px;
            width: 90%;
        }
        
        .g-modal-overlay-res.active .g-modal-content-res { transform: translateY(0); }
        
        .g-modal-title-res { font-size: 22px; font-weight: 900; color: #1e293b; margin: 0 0 10px 0; font-family: 'Nunito', sans-serif; }
        .g-modal-desc-res { font-size: 15px; color: #475569; font-weight: 700; margin-bottom: 20px; white-space: pre-line; line-height: 1.4; font-family: 'Nunito', sans-serif; }
        
        .g-modal-btn-res {
            background: #6140EA;
            color: white;
            border: none;
            padding: 10px 30px;
            font-size: 15px;
            font-weight: 800;
            border-radius: 25px;
            cursor: pointer;
            font-family: 'Nunito', sans-serif;
            box-shadow: 0 4px 10px rgba(97, 64, 234, 0.3);
            transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .g-modal-btn-res:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 14px rgba(97, 64, 234, 0.4);
        }
      `}</style>
    </div>
  );
};

export default Gamification;
