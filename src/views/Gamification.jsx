import React, { useState } from 'react';

const Gamification = () => {
  const [pointRule, setPointRule] = useState({
    mcqComplete: 50,
    videoWatch: 20,
    doubtResolve: 100,
    perfectScore: 150
  });

  const [streakDays, setStreakDays] = useState(7);
  const [xpMultiplier, setXpMultiplier] = useState(1.5);

  const badgesList = [
    { id: 1, name: 'Knowledge Seeker', desc: 'Complete 10 MCQ tasks with 90%+ scores.', icon: '🏆', count: 1420 },
    { id: 2, name: 'Doubt Destroyer', desc: 'Help answer 5 student doubts.', icon: '🛡️', count: 320 },
    { id: 3, name: 'Daily Streak Master', desc: 'Maintain a study streak of 15 days.', icon: '🔥', count: 856 },
    { id: 4, name: 'Perfect Score Pioneer', desc: 'Get 100% on a major term exam.', icon: '⚡', count: 432 },
    { id: 5, name: 'Peer Mentor', desc: 'Receive 5 positive peer feedback votes.', icon: '🤝', count: 180 }
  ];

  const handleUpdateRules = (e) => {
    e.preventDefault();
    alert('Gamification point multipliers and scoring rules updated successfully.');
  };

  return (
    <div className="gamification-view">
      <div>
        <h2 className="view-title">Gamification & Rewards Engine</h2>
        <p className="view-subtitle">Customize student engagement parameters, manage badges, streaks, and XP points.</p>
      </div>

      <div className="game-grid">
        {/* Left Column: XP and Points Config */}
        <div className="game-col-left">
          <div className="glass-panel rule-box">
            <h3>XP Point Allocations</h3>
            <form onSubmit={handleUpdateRules} className="config-form">
              <div className="rule-row">
                <label>Completing an MCQ Task (XP)</label>
                <input 
                  type="number" 
                  value={pointRule.mcqComplete} 
                  onChange={(e) => setPointRule({...pointRule, mcqComplete: parseInt(e.target.value) || 0})} 
                  className="glass-input rule-input"
                />
              </div>
              <div className="rule-row">
                <label>Watching an Educational Video (XP)</label>
                <input 
                  type="number" 
                  value={pointRule.videoWatch} 
                  onChange={(e) => setPointRule({...pointRule, videoWatch: parseInt(e.target.value) || 0})} 
                  className="glass-input rule-input"
                />
              </div>
              <div className="rule-row">
                <label>Submitting Doubt Answer (XP)</label>
                <input 
                  type="number" 
                  value={pointRule.doubtResolve} 
                  onChange={(e) => setPointRule({...pointRule, doubtResolve: parseInt(e.target.value) || 0})} 
                  className="glass-input rule-input"
                />
              </div>
              <div className="rule-row">
                <label>Perfect 100% MCQ Score Bonus (XP)</label>
                <input 
                  type="number" 
                  value={pointRule.perfectScore} 
                  onChange={(e) => setPointRule({...pointRule, perfectScore: parseInt(e.target.value) || 0})} 
                  className="glass-input rule-input"
                />
              </div>

              <div className="rule-row">
                <label>Target Daily Streak (Days)</label>
                <input 
                  type="number" 
                  value={streakDays} 
                  onChange={(e) => setStreakDays(parseInt(e.target.value) || 0)} 
                  className="glass-input rule-input"
                />
              </div>

              <div className="rule-row">
                <label>Weekend Multiplier Rate (x)</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={xpMultiplier} 
                  onChange={(e) => setXpMultiplier(parseFloat(e.target.value) || 0)} 
                  className="glass-input rule-input"
                />
              </div>

              <button type="submit" className="glass-button save-rules-btn">
                Apply System Scopes
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Badges & Rewards */}
        <div className="game-col-right glass-panel badges-card">
          <h3>Active Achievements & Badges</h3>
          <p className="badges-subtitle">Displaying achievements current students can earn.</p>
          
          <div className="badges-list">
            {badgesList.map((badge) => (
              <div key={badge.id} className="badge-row">
                <div className="badge-details">
                  <span className="badge-icon-game">{badge.icon}</span>
                  <div>
                    <h4 className="badge-name-game">{badge.name}</h4>
                    <p className="badge-desc-game">{badge.desc}</p>
                  </div>
                </div>
                <div className="badge-analytics">
                  <span className="badge-earners">{badge.count.toLocaleString()} earners</span>
                </div>
              </div>
            ))}
          </div>

          <button className="glass-button add-badge-btn" onClick={() => alert('New Achievement modal opened')}>
            Create New Badge
          </button>
        </div>
      </div>

      <style>{`
        .gamification-view {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .view-title {
          font-size: 24px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .view-subtitle {
          font-size: 14px;
          color: var(--text-secondary);
        }

        .game-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 25px;
        }

        @media (max-width: 1024px) {
          .game-grid {
            grid-template-columns: 1fr;
          }
        }

        .rule-box, .badges-card {
          padding: 24px;
        }

        .rule-box h3, .badges-card h3 {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 18px;
        }

        .rule-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 14px;
        }

        .rule-row label {
          font-size: 13px;
          color: var(--text-secondary);
          font-weight: 550;
        }

        .rule-input {
          width: 90px;
          padding: 8px 12px;
          text-align: center;
        }

        .save-rules-btn {
          margin-top: 15px;
          width: 100%;
          justify-content: center;
        }

        .badges-subtitle {
          font-size: 13px;
          color: var(--text-secondary);
          margin-bottom: 20px;
        }

        .badges-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 24px;
        }

        .badge-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--bg-secondary);
          border: 1px solid var(--panel-border);
          border-radius: 12px;
          padding: 14px 18px;
        }

        .badge-details {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .badge-icon-game {
          font-size: 24px;
        }

        .badge-name-game {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 2px;
        }

        .badge-desc-game {
          font-size: 12px;
          color: var(--text-secondary);
          margin: 0;
        }

        .badge-earners {
          font-size: 12px;
          font-weight: 550;
          color: var(--accent-blue);
          background: rgba(59, 130, 246, 0.1);
          padding: 4px 10px;
          border-radius: 8px;
        }

        .add-badge-btn {
          width: 100%;
          justify-content: center;
        }
      `}</style>
    </div>
  );
};

export default Gamification;
