import React, { useState } from 'react';

const WalletRewards = () => {
  const [conversionRate, setConversionRate] = useState(10); // 10 coins = ₹1
  const [storeItems, setStoreItems] = useState([
    { id: 1, name: 'VLM Notebook Bundle', cost: 500, stock: 45, image: '📚' },
    { id: 2, name: 'Premium Math Compass Set', cost: 800, stock: 12, image: '📐' },
    { id: 3, name: 'Scientific Calculator Coupon', cost: 1500, stock: 8, image: '🧮' },
    { id: 4, name: 'VLM Academy Hooded Jacket', cost: 3000, stock: 15, image: '🧥' }
  ]);

  const [logs] = useState([
    { id: 1, student: 'Harsh Singh', action: 'Redeemed Scientific Calculator', coins: -1500, date: 'Today, 14:15' },
    { id: 2, student: 'Simran Roy', action: 'Earned Daily Streak Reward', coins: 150, date: 'Today, 08:30' },
    { id: 3, student: 'Amit Mishra', action: 'Earned Perfect Score Quiz', coins: 500, date: 'Yesterday, 19:10' }
  ]);

  return (
    <div className="wallet-rewards-view">
      <div>
        <h2 className="view-title">Wallet & Rewards System</h2>
        <p className="view-subtitle">Manage VLM Reward Coins parameters, distribute loyalty points, and configure store item rewards.</p>
      </div>

      <div className="wallet-metrics">
        <div className="glass-panel metric-card-wallet">
          <span className="mw-lbl">Total Coins Circulated</span>
          <span className="mw-val">48,920,400</span>
          <span className="mw-trend">Distributed to students</span>
        </div>
        <div className="glass-panel metric-card-wallet">
          <span className="mw-lbl">Active Store Coupon Purchases</span>
          <span className="mw-val">423 redemptions</span>
          <span className="mw-trend pos">This month (+18%)</span>
        </div>
        <div className="glass-panel metric-card-wallet">
          <span className="mw-lbl">Coin Conversion Rate</span>
          <span className="mw-val">{conversionRate} Coins = ₹1</span>
          <button className="glass-button size-sm change-rate-btn" onClick={() => { const rate = prompt('Enter new coin count per ₹1:'); if (rate) setConversionRate(parseInt(rate) || 10); }}>
            Edit Rate
          </button>
        </div>
      </div>

      <div className="wallet-grid">
        {/* Left: Store Items */}
        <div className="wallet-col-left glass-panel store-card">
          <div className="store-header">
            <h3>Reward Store Catalog</h3>
            <button className="glass-button size-sm" onClick={() => alert('New Item dialog opened')}>+ Add Item</button>
          </div>
          <div className="store-list">
            {storeItems.map((item) => (
              <div key={item.id} className="store-row">
                <div className="store-left">
                  <span className="store-icon">{item.image}</span>
                  <div>
                    <h4 className="store-name">{item.name}</h4>
                    <span className="store-stock">In Stock: {item.stock} left</span>
                  </div>
                </div>
                <div className="store-right">
                  <span className="store-cost">{item.cost} Coins</span>
                  <button className="glass-button size-sm secondary" onClick={() => alert(`Edit config for ${item.name}`)}>Edit</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Wallet Logs */}
        <div className="wallet-col-right glass-panel wallet-logs-card">
          <h3>Recent Wallet Transactions</h3>
          <p className="logs-desc">Audit history of coin disbursements and redemptions.</p>
          <div className="wallet-logs">
            {logs.map((log) => (
              <div key={log.id} className="wallet-log-row">
                <div>
                  <h4 className="log-student">{log.student}</h4>
                  <span className="log-action">{log.action} • {log.date}</span>
                </div>
                <span className={`log-coins ${log.coins > 0 ? 'earned' : 'spent'}`}>
                  {log.coins > 0 ? `+${log.coins}` : log.coins}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .wallet-rewards-view {
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

        .wallet-metrics {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        @media (max-width: 768px) {
          .wallet-metrics {
            grid-template-columns: 1fr;
          }
        }

        .metric-card-wallet {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          position: relative;
        }

        .mw-lbl {
          font-size: 11px;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.05em;
        }

        .mw-val {
          font-size: 22px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .mw-trend {
          font-size: 12px;
          color: var(--text-muted);
        }

        .change-rate-btn {
          position: absolute;
          right: 20px;
          bottom: 20px;
        }

        .wallet-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 25px;
        }

        @media (max-width: 1024px) {
          .wallet-grid {
            grid-template-columns: 1fr;
          }
        }

        .store-card, .wallet-logs-card {
          padding: 24px;
        }

        .store-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
        }

        .store-card h3, .wallet-logs-card h3 {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .store-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .store-row {
          background: var(--bg-secondary);
          border: 1px solid var(--panel-border);
          border-radius: 12px;
          padding: 14px 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .store-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .store-icon {
          font-size: 24px;
        }

        .store-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 2px;
        }

        .store-stock {
          font-size: 11px;
          color: var(--text-muted);
        }

        .store-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .store-cost {
          font-size: 13px;
          font-weight: 700;
          color: var(--accent-blue);
        }

        .logs-desc {
          font-size: 13px;
          color: var(--text-secondary);
          margin-bottom: 18px;
        }

        .wallet-logs {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .wallet-log-row {
          background: var(--bg-secondary);
          border: 1px solid var(--panel-border);
          border-radius: 10px;
          padding: 12px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .log-student {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 2px;
        }

        .log-action {
          font-size: 11px;
          color: var(--text-secondary);
        }

        .log-coins {
          font-size: 13px;
          font-weight: 700;
        }

        .log-coins.earned {
          color: var(--success-color);
        }

        .log-coins.spent {
          color: var(--error-color);
        }
      `}</style>
    </div>
  );
};

export default WalletRewards;
