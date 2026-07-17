import React from 'react';

const SubscriptionBilling = () => {
  const plans = [
    { id: 1, name: 'Basic Core Curriculum', price: '₹999/mo', students: 4320, active: true },
    { id: 2, name: 'Standard Academy Pro', price: '₹1,999/mo', students: 12450, active: true },
    { id: 3, name: 'Elite IIT-JEE Mentorship', price: '₹4,999/mo', students: 3120, active: true }
  ];

  const transactions = [
    { id: 'TXN-98402', user: 'Vikas Sharma', plan: 'Academy Pro', amount: '₹1,999', date: 'Today, 12:44', status: 'Success' },
    { id: 'TXN-98401', user: 'Rohan Gupta', plan: 'IIT-JEE Mentorship', amount: '₹4,999', date: 'Today, 11:20', status: 'Success' },
    { id: 'TXN-98400', user: 'Simran Jeet', plan: 'Basic Core', amount: '₹999', date: 'Today, 09:12', status: 'Success' },
    { id: 'TXN-98399', user: 'Sneha Reddy', plan: 'Academy Pro', amount: '₹1,999', date: 'Yesterday, 18:23', status: 'Success' }
  ];

  const withdrawals = [
    { id: 1, name: 'Dr. Ramesh Patil', role: 'Physics Educator', amount: '₹45,000', requested: '2 days ago', status: 'Pending Approval' },
    { id: 2, name: 'Prof. Amrit Sen', role: 'Math Educator', amount: '₹72,000', requested: '3 days ago', status: 'Pending Approval' }
  ];

  return (
    <div className="subscription-billing-view">
      <div>
        <h2 className="view-title">Subscription & Billing Portal</h2>
        <p className="view-subtitle">Monitor recurring revenue streams, manage product plans, and approve payout requests.</p>
      </div>

      <div className="billing-metrics">
        <div className="glass-panel metric-card-bill">
          <span className="mb-lbl">Monthly Recurring Revenue (MRR)</span>
          <span className="mb-val">₹ 4.82 Cr</span>
          <span className="mb-trend pos">+14.2% vs last month</span>
        </div>
        <div className="glass-panel metric-card-bill">
          <span className="mb-lbl">Total Subscribed Students</span>
          <span className="mb-val">19,890</span>
          <span className="mb-trend pos">94% Active Rate</span>
        </div>
        <div className="glass-panel metric-card-bill">
          <span className="mb-lbl">Avg Revenue Per Student (ARPU)</span>
          <span className="mb-val">₹ 2,420</span>
          <span className="mb-trend">Stable</span>
        </div>
      </div>

      <div className="billing-grid">
        {/* Left: Active Plans */}
        <div className="billing-col-left">
          <div className="glass-panel plans-card">
            <h3>Active Subscription Plans</h3>
            <div className="plans-list">
              {plans.map((plan) => (
                <div key={plan.id} className="plan-row-billing">
                  <div>
                    <h4 className="plan-name-bill">{plan.name}</h4>
                    <span className="plan-price-bill">{plan.price}</span>
                  </div>
                  <div className="plan-stats-bill">
                    <span className="plan-students-count">{plan.students.toLocaleString()} students</span>
                    <span className="plan-active-status">Active</span>
                  </div>
                </div>
              ))}
            </div>
            <button className="glass-button add-plan-btn" onClick={() => alert('New Plan builder opened')}>
              Configure New Plan
            </button>
          </div>

          <div className="glass-panel payouts-card">
            <h3>Pending Instructor Payouts</h3>
            <div className="withdrawals-list">
              {withdrawals.map((w) => (
                <div key={w.id} className="withdrawal-row-bill">
                  <div>
                    <h4 className="w-name-bill">{w.name}</h4>
                    <span className="w-role-bill">{w.role} • Requesting {w.amount}</span>
                  </div>
                  <button className="glass-button size-sm approve-w-btn" onClick={() => alert(`Approved payout for ${w.name}`)}>
                    Approve
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Payments Log */}
        <div className="billing-col-right glass-panel transactions-card">
          <h3>Recent Transactions</h3>
          <p className="tx-desc">Real-time gateway webhook events logs.</p>
          <div className="tx-list">
            {transactions.map((tx) => (
              <div key={tx.id} className="tx-row-billing">
                <div className="tx-left">
                  <span className="tx-id-badge">{tx.id}</span>
                  <div>
                    <h4 className="tx-user">{tx.user}</h4>
                    <span className="tx-plan">{tx.plan}</span>
                  </div>
                </div>
                <div className="tx-right">
                  <span className="tx-amount">{tx.amount}</span>
                  <span className="tx-date-status">{tx.date} • <span className="success">{tx.status}</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .subscription-billing-view {
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

        .billing-metrics {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        @media (max-width: 768px) {
          .billing-metrics {
            grid-template-columns: 1fr;
          }
        }

        .metric-card-bill {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .mb-lbl {
          font-size: 11px;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.05em;
        }

        .mb-val {
          font-size: 22px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .mb-trend {
          font-size: 12px;
          color: var(--text-muted);
        }

        .mb-trend.pos {
          color: var(--success-color);
          font-weight: 550;
        }

        .billing-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 25px;
        }

        @media (max-width: 1024px) {
          .billing-grid {
            grid-template-columns: 1fr;
          }
        }

        .billing-col-left {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .plans-card, .payouts-card, .transactions-card {
          padding: 24px;
        }

        .plans-card h3, .payouts-card h3, .transactions-card h3 {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 18px;
        }

        .plans-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-bottom: 18px;
        }

        .plan-row-billing {
          background: var(--bg-secondary);
          border: 1px solid var(--panel-border);
          border-radius: 12px;
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .plan-name-bill {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .plan-price-bill {
          font-size: 13px;
          font-weight: 600;
          color: var(--accent-blue);
        }

        .plan-stats-bill {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }

        .plan-students-count {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .plan-active-status {
          font-size: 11px;
          background: rgba(16, 185, 129, 0.1);
          color: var(--success-color);
          padding: 2px 8px;
          border-radius: 4px;
          font-weight: 600;
        }

        .add-plan-btn {
          width: 100%;
          justify-content: center;
        }

        .withdrawals-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .withdrawal-row-bill {
          background: var(--bg-secondary);
          border: 1px solid var(--panel-border);
          border-radius: 10px;
          padding: 12px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .w-name-bill {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 2px;
        }

        .w-role-bill {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .approve-w-btn {
          background: var(--success-color) !important;
          box-shadow: none !important;
          padding: 6px 12px !important;
        }

        .tx-desc {
          font-size: 13px;
          color: var(--text-secondary);
          margin-bottom: 18px;
        }

        .tx-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .tx-row-billing {
          background: var(--bg-secondary);
          border: 1px solid var(--panel-border);
          border-radius: 12px;
          padding: 14px 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .tx-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .tx-id-badge {
          font-family: monospace;
          background: rgba(0, 0, 0, 0.05);
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 11px;
          color: var(--text-secondary);
        }

        .tx-user {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 2px;
        }

        .tx-plan {
          font-size: 11px;
          color: var(--text-muted);
        }

        .tx-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }

        .tx-amount {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .tx-date-status {
          font-size: 11px;
          color: var(--text-muted);
        }

        .tx-date-status .success {
          color: var(--success-color);
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default SubscriptionBilling;
