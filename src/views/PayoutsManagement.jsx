import React, { useState, useEffect } from 'react';
import { 
  adminGetPendingPayouts, 
  adminProcessPayout, 
  adminGetPayoutHistory 
} from '../api/adminAuthApi';
import ActionModal from '../components/ActionModal';
import { 
  FaWallet, 
  FaMoneyBillWave, 
  FaDownload, 
  FaSearch, 
  FaRedo, 
  FaUniversity, 
  FaHistory, 
  FaCheckCircle, 
  FaBuilding, 
  FaReceipt 
} from 'react-icons/fa';

const PayoutsManagement = () => {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'history'
  const [loading, setLoading] = useState(true);
  const [pendingPayouts, setPendingPayouts] = useState([]);
  const [historyPayouts, setHistoryPayouts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Process Payout Modal
  const [selectedPayoutTeacher, setSelectedPayoutTeacher] = useState(null);
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [payoutNotes, setPayoutNotes] = useState('');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'pending') {
        const res = await adminGetPendingPayouts();
        if (res && res.success && Array.isArray(res.data)) {
          setPendingPayouts(res.data);
        } else if (Array.isArray(res)) {
          setPendingPayouts(res);
        } else {
          setPendingPayouts([]);
        }
      } else {
        const res = await adminGetPayoutHistory();
        if (res && res.success && Array.isArray(res.data)) {
          setHistoryPayouts(res.data);
        } else if (Array.isArray(res)) {
          setHistoryPayouts(res);
        } else {
          setHistoryPayouts([]);
        }
      }
    } catch (err) {
      console.error('Error fetching payouts data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const openProcessModal = (teacherItem) => {
    setSelectedPayoutTeacher(teacherItem);
    setUtrNumber('');
    setPayoutNotes('Weekly Payout Batch Transfer');
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setPeriodStart(weekAgo);
    setPeriodEnd(today);
    setPayoutModalOpen(true);
  };

  const handleProcessSubmit = async () => {
    if (!selectedPayoutTeacher || !utrNumber.trim()) {
      alert('Please enter a valid Bank UTR or Reference Number.');
      return;
    }

    setProcessing(true);
    try {
      const payload = {
        teacherId: selectedPayoutTeacher.teacherId || selectedPayoutTeacher._id,
        amount: selectedPayoutTeacher.withdrawableBalance,
        transactionReference: utrNumber.trim(),
        notes: payoutNotes,
        periodStart,
        periodEnd
      };

      const res = await adminProcessPayout(payload);
      if (res && res.success) {
        alert(res.message || 'Payout recorded successfully.');
        setPayoutModalOpen(false);
        fetchData();
      } else {
        alert(res?.message || 'Failed to record payout.');
      }
    } catch (err) {
      console.error('Error recording payout:', err);
      alert('Failed to process payout: ' + (err?.response?.data?.message || err.message));
    } finally {
      setProcessing(false);
    }
  };

  const handleExportCSV = () => {
    if (pendingPayouts.length === 0) {
      alert('No pending payouts to export.');
      return;
    }

    const headers = ['Teacher Name', 'VLM Teacher ID', 'Email', 'Withdrawable Amount (₹)', 'Account Holder', 'Bank Name', 'Account Number', 'IFSC Code', 'UPI ID'];
    const rows = pendingPayouts.map(p => [
      `"${p.teacherName || ''}"`,
      `"${p.vlmTeacherId || ''}"`,
      `"${p.email || ''}"`,
      p.withdrawableBalance || 0,
      `"${p.bankDetails?.accountHolder || ''}"`,
      `"${p.bankDetails?.bankName || ''}"`,
      `"${p.bankDetails?.accountNumber || ''}"`,
      `"${p.bankDetails?.ifsc || ''}"`,
      `"${p.bankDetails?.upiId || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `VLM_Pending_Payouts_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredPending = pendingPayouts.filter(item => {
    const query = searchQuery.toLowerCase();
    const name = (item.teacherName || '').toLowerCase();
    const email = (item.email || '').toLowerCase();
    const id = (item.vlmTeacherId || '').toLowerCase();
    return !searchQuery || name.includes(query) || email.includes(query) || id.includes(query);
  });

  const filteredHistory = historyPayouts.filter(item => {
    const query = searchQuery.toLowerCase();
    const teacherObj = item.teacherId || {};
    const name = `${teacherObj.firstName || ''} ${teacherObj.lastName || ''}`.toLowerCase();
    const utr = (item.transactionReference || '').toLowerCase();
    return !searchQuery || name.includes(query) || utr.includes(query);
  });

  const totalPendingAmount = pendingPayouts.reduce((acc, curr) => acc + (curr.withdrawableBalance || 0), 0);

  return (
    <div className="view-page-container">
      {/* Header */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                <FaWallet size={24} />
              </div>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0, color: '#0f172a' }}>
                  Weekly Payouts Management
                </h1>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#475569' }}>
                  Manage teacher session earnings, perform manual net-banking transfers, and log UTR numbers.
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className="glass-button size-md secondary"
              onClick={handleExportCSV}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <FaDownload /> Export Batch CSV
            </button>
            <button 
              className="glass-button size-md secondary"
              onClick={fetchData}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <FaRedo className={loading ? 'spin' : ''} /> Refresh
            </button>
          </div>
        </div>

        {/* Tab & Search Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '4px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <button
              onClick={() => setActiveTab('pending')}
              style={{
                padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '13px',
                background: activeTab === 'pending' ? '#3b82f6' : 'transparent', color: activeTab === 'pending' ? '#fff' : '#475569',
                transition: 'all 0.2s'
              }}
            >
              Eligible Payouts ({pendingPayouts.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              style={{
                padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '13px',
                background: activeTab === 'history' ? '#3b82f6' : 'transparent', color: activeTab === 'history' ? '#fff' : '#475569',
                transition: 'all 0.2s'
              }}
            >
              Completed History
            </button>
          </div>

          <div style={{ position: 'relative', width: '300px' }}>
            <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              className="glass-input"
              placeholder="Search teacher or reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '36px', width: '100%' }}
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {activeTab === 'pending' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ fontSize: '12.5px', color: '#475569', fontWeight: '600', textTransform: 'uppercase' }}>Eligible Teachers</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#1d4ed8', marginTop: '6px' }}>
              {pendingPayouts.length} Candidates
            </div>
          </div>
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ fontSize: '12.5px', color: '#475569', fontWeight: '600', textTransform: 'uppercase' }}>Teacher Share (75%)</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#047857', marginTop: '6px' }}>
              ₹{totalPendingAmount.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ fontSize: '12.5px', color: '#475569', fontWeight: '600', textTransform: 'uppercase' }}>Company Share (25%)</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#c2410c', marginTop: '6px' }}>
              ₹{Number((totalPendingAmount * 0.25 / 0.75).toFixed(2)).toLocaleString('en-IN')}
            </div>
          </div>
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ fontSize: '12.5px', color: '#475569', fontWeight: '600', textTransform: 'uppercase' }}>Total Gross Volume (100%)</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#6d28d9', marginTop: '6px' }}>
              ₹{Number((totalPendingAmount / 0.75).toFixed(2)).toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      )}

      {/* Content Table */}
      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        {activeTab === 'pending' ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '16px 20px', color: '#475569', fontSize: '12.5px', fontWeight: '600' }}>TEACHER</th>
                  <th style={{ padding: '16px 20px', color: '#475569', fontSize: '12.5px', fontWeight: '600' }}>WITHDRAWABLE BALANCE</th>
                  <th style={{ padding: '16px 20px', color: '#475569', fontSize: '12.5px', fontWeight: '600' }}>BANK ACCOUNT DETAILS</th>
                  <th style={{ padding: '16px 20px', color: '#475569', fontSize: '12.5px', fontWeight: '600' }}>UPI ID</th>
                  <th style={{ padding: '16px 20px', color: '#475569', fontSize: '12.5px', fontWeight: '600', textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading payouts...</td></tr>
                ) : filteredPending.length === 0 ? (
                  <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No pending payouts found.</td></tr>
                ) : (
                  filteredPending.map((item) => (
                    <tr key={item.teacherId} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '14px' }}>{item.teacherName}</div>
                        <div style={{ fontSize: '12px', color: '#475569' }}>{item.email}</div>
                        <div style={{ fontSize: '11px', color: '#1d4ed8', marginTop: '2px' }}>ID: {item.vlmTeacherId}</div>
                      </td>

                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#047857' }}>
                          ₹{(item.withdrawableBalance || 0).toLocaleString('en-IN')}
                        </div>
                      </td>

                      <td style={{ padding: '16px 20px' }}>
                        {item.bankDetails ? (
                          <div style={{ fontSize: '12px', color: '#334155' }}>
                            <div><strong>Holder:</strong> {item.bankDetails.accountHolder || item.teacherName}</div>
                            <div><strong>Bank:</strong> {item.bankDetails.bankName || 'N/A'}</div>
                            <div><strong>A/C:</strong> {item.bankDetails.accountNumber}</div>
                            <div><strong>IFSC:</strong> {item.bankDetails.ifsc}</div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#ef4444' }}>Missing Bank Details</span>
                        )}
                      </td>

                      <td style={{ padding: '16px 20px', fontSize: '12.5px', color: '#334155' }}>
                        {item.bankDetails?.upiId || 'N/A'}
                      </td>

                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <button
                          onClick={() => openProcessModal(item)}
                          className="glass-button size-sm primary"
                          style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none' }}
                        >
                          <FaMoneyBillWave /> Submit Bank UTR
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '16px 20px', color: '#475569', fontSize: '12.5px', fontWeight: '600' }}>PAID TO TEACHER</th>
                  <th style={{ padding: '16px 20px', color: '#475569', fontSize: '12.5px', fontWeight: '600' }}>AMOUNT</th>
                  <th style={{ padding: '16px 20px', color: '#475569', fontSize: '12.5px', fontWeight: '600' }}>BANK UTR / REF NO.</th>
                  <th style={{ padding: '16px 20px', color: '#475569', fontSize: '12.5px', fontWeight: '600' }}>PROCESSED BY</th>
                  <th style={{ padding: '16px 20px', color: '#475569', fontSize: '12.5px', fontWeight: '600' }}>PAID DATE</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading history...</td></tr>
                ) : filteredHistory.length === 0 ? (
                  <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No completed payout records.</td></tr>
                ) : (
                  filteredHistory.map((item) => {
                    const teacherObj = item.teacherId || {};
                    const name = `${teacherObj.firstName || ''} ${teacherObj.lastName || ''}`.trim() || 'Teacher';
                    return (
                      <tr key={item._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '14px' }}>{name}</div>
                          <div style={{ fontSize: '11px', color: '#1d4ed8' }}>ID: {teacherObj.vlmTeacherId || 'N/A'}</div>
                        </td>

                        <td style={{ padding: '16px 20px', fontSize: '15px', fontWeight: '700', color: '#047857' }}>
                          ₹{(item.amount || 0).toLocaleString('en-IN')}
                        </td>

                        <td style={{ padding: '16px 20px' }}>
                          <span style={{ padding: '4px 8px', borderRadius: '6px', background: '#eff6ff', fontSize: '12px', fontFamily: 'monospace', color: '#1d4ed8' }}>
                            {item.transactionReference}
                          </span>
                        </td>

                        <td style={{ padding: '16px 20px', fontSize: '12.5px', color: '#334155' }}>
                          {item.paidBy?.fullName || item.paidBy?.email || 'Super Admin'}
                        </td>

                        <td style={{ padding: '16px 20px', fontSize: '12.5px', color: '#64748b' }}>
                          {new Date(item.paidAt || Date.now()).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Manual Payout Modal */}
      <ActionModal
        isOpen={payoutModalOpen}
        onClose={() => setPayoutModalOpen(false)}
        title="Record Bank Transfer (UTR Submission)"
      >
        <div style={{ padding: '16px' }}>
          {selectedPayoutTeacher && (
            <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '700', color: '#065f46', fontSize: '15px' }}>{selectedPayoutTeacher.teacherName}</div>
                  <div style={{ fontSize: '12px', color: '#047857' }}>Account: {selectedPayoutTeacher.bankDetails?.accountNumber || 'N/A'} ({selectedPayoutTeacher.bankDetails?.ifsc})</div>
                </div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#047857' }}>
                  ₹{(selectedPayoutTeacher.withdrawableBalance || 0).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#1e293b', fontSize: '13.5px', fontWeight: '600', marginBottom: '6px' }}>
              Bank UTR / Transaction Reference Number <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              className="glass-input"
              placeholder="e.g. UTR98127364512"
              value={utrNumber}
              onChange={(e) => setUtrNumber(e.target.value)}
              style={{ width: '100%', fontFamily: 'monospace' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', color: '#334155', fontSize: '12.5px', fontWeight: '600', marginBottom: '4px' }}>Period Start</label>
              <input type="date" className="glass-input" value={periodStart} onChange={e => setPeriodStart(e.target.value)} style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ display: 'block', color: '#334155', fontSize: '12.5px', fontWeight: '600', marginBottom: '4px' }}>Period End</label>
              <input type="date" className="glass-input" value={periodEnd} onChange={e => setPeriodEnd(e.target.value)} style={{ width: '100%' }} />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#1e293b', fontSize: '13.5px', fontWeight: '600', marginBottom: '6px' }}>
              Notes:
            </label>
            <input
              type="text"
              className="glass-input"
              placeholder="e.g. Weekly Payout transferred via HDFC NetBanking."
              value={payoutNotes}
              onChange={(e) => setPayoutNotes(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button className="glass-button secondary" onClick={() => setPayoutModalOpen(false)}>
              Cancel
            </button>
            <button 
              className="glass-button primary"
              onClick={handleProcessSubmit}
              disabled={processing}
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none' }}
            >
              {processing ? 'Processing...' : 'Confirm & Clear Balance'}
            </button>
          </div>
        </div>
      </ActionModal>
    </div>
  );
};

export default PayoutsManagement;
