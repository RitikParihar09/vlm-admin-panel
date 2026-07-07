import React, { useEffect, useState } from 'react';
import { useAdmin } from '../context/AdminContext';

const BackendDebug = () => {
  const { adminToken } = useAdmin();
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(false);

  const push = (entry) => setLog((prev) => [{ t: new Date().toLocaleTimeString(), ...entry }, ...prev]);

  const run = async () => {
    setLoading(true);
    setLog([]);

    const API_BASE_URL = 'https://vlm-app-backend.onrender.com/api';
    const candidates = [
      `${API_BASE_URL}/health`,
      `${API_BASE_URL}/students`,
      `${API_BASE_URL}/teachers`,
      `${API_BASE_URL}/parents`,
      `${API_BASE_URL}/admin/students`,
      `${API_BASE_URL}/admin/teachers`,
      `${API_BASE_URL}/admin/parents`
    ];

    for (const url of candidates) {
      try {
        const res = await fetch(url, {
          headers: {
            Accept: 'application/json',
        ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {})
          }
        });
        const text = await res.text();
        push({ url, ok: res.ok, status: res.status, textPreview: text?.slice(0, 500) });
      } catch (e) {
        push({ url, ok: false, error: String(e) });
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    // auto-run once
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Backend Debug</h2>
      <p style={{ opacity: 0.8, marginBottom: 12 }}>
        adminToken: {adminToken ? `present (${adminToken.slice(0, 10)}...)` : 'missing'}
      </p>
      <button onClick={run} disabled={loading} style={{ padding: '8px 12px' }}>
        {loading ? 'Running...' : 'Run tests again'}
      </button>
      <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
        {log.map((item, idx) => (
          <div key={idx} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
            <div style={{ fontWeight: 700 }}>{item.t} - {item.url}</div>
            <div style={{ marginTop: 6, fontSize: 13, opacity: 0.9 }}>
              {item.ok !== undefined ? `ok=${item.ok} status=${item.status}` : ''}
              {item.error ? ` error=${item.error}` : ''}
            </div>
            {item.textPreview && (
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginTop: 8, maxHeight: 250, overflow: 'auto', fontSize: 12 }}>
                {item.textPreview}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BackendDebug;

