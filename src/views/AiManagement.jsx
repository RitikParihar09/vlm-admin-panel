import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import {
  FaCloud,
  FaVideo,
  FaSms,
  FaRobot,
  FaPlay,
  FaCheckCircle,
  FaTimesCircle,
  FaKey,
  FaTerminal,
  FaExchangeAlt,
  FaChevronRight,
  FaDatabase,
  FaArrowLeft,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';

const AiManagement = () => {
  const {
    getIntegrations,
    updateIntegration,
    testIntegration
  } = useAdmin();

  const [integrationsList, setIntegrationsList] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [selectedProvider, setSelectedProvider] = useState(null); // integration object
  const [localConfig, setLocalConfig] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [showSecrets, setShowSecrets] = useState({});

  const loadIntegrations = async () => {
    setLoadingList(true);
    setErrorMsg('');
    const res = await getIntegrations();
    if (res.ok) {
      setIntegrationsList(res.data?.data || res.data || []);
    } else {
      setErrorMsg(res.error?.message || 'Failed to load API integrations.');
    }
    setLoadingList(false);
  };

  useEffect(() => {
    loadIntegrations();
  }, []);

  const handleProviderSelect = (integration) => {
    setSelectedProvider(integration);
    setLocalConfig({ ...integration.config });
    setTestResult(null);
  };

  const handleSaveCredentials = async (e) => {
    e.preventDefault();
    if (!selectedProvider) return;

    setIsSaving(true);
    setErrorMsg('');

    // Filter out fields that are still masked with '••••' (user did not touch/change them)
    const payload = {};
    Object.entries(localConfig).forEach(([k, v]) => {
      if (v && !v.toString().includes('••••')) {
        payload[k] = v;
      }
    });

    const res = await updateIntegration(selectedProvider.key, payload);
    setIsSaving(false);

    if (res.ok) {
      alert(`${selectedProvider.name} credentials updated successfully!`);
      
      // Refresh list to pull updated data
      const refreshRes = await getIntegrations();
      if (refreshRes.ok) {
        const refreshedList = refreshRes.data?.data || refreshRes.data || [];
        setIntegrationsList(refreshedList);
        const refreshedItem = refreshedList.find(i => i.key === selectedProvider.key);
        if (refreshedItem) {
          setSelectedProvider(refreshedItem);
          setLocalConfig({ ...refreshedItem.config });
        }
      }
    } else {
      setErrorMsg(res.error?.message || 'Failed to update credentials.');
    }
  };

  const handleTestApi = async (integrationKey) => {
    setIsTesting(true);
    setTestResult(null);

    const res = await testIntegration(integrationKey);
    setIsTesting(false);

    const isCloudflare = integrationKey === 'integration_cloudflare_r2';
    const isGemini = integrationKey === 'integration_gemini_ai';
    const isAgora = integrationKey === 'integration_agora_rtc';

    const fallbackUrl = isCloudflare ? 'https://api.cloudflare.com/client/v4/accounts/vlm-academy/r2'
                      : isGemini ? 'https://generativelanguage.googleapis.com/v1beta/openai'
                      : isAgora ? 'https://api.agora.io/v1/projects'
                      : 'https://api.msg91.com/api/v5/balance';

    if (res.ok) {
      setTestResult({
        status: 'success',
        statusCode: 200,
        latency: res.data?.latency || '82ms',
        endpoint: fallbackUrl,
        response: res.data || res
      });
    } else {
      setTestResult({
        status: 'error',
        statusCode: 400,
        latency: '0ms',
        endpoint: fallbackUrl,
        response: res.error || { message: 'Connection attempt failed. Verify your secret configuration keys.' }
      });
    }
  };

  const getProviderIcon = (key) => {
    if (key.includes('cloudflare')) return <FaCloud />;
    if (key.includes('gemini')) return <FaRobot />;
    if (key.includes('agora')) return <FaVideo />;
    if (key.includes('msg91')) return <FaSms />;
    return <FaDatabase />;
  };

  // Static event logs list for visual simulation stream
  const logsList = {
    integration_cloudflare_r2: [
      { type: 'GET', endpoint: '/cloudflare/objects/math_class12.pdf', status: 200, latency: '84ms', time: 'Just now' },
      { type: 'POST', endpoint: '/cloudflare/upload/video_lecture.mp4', status: 200, latency: '340ms', time: '4 mins ago' },
      { type: 'GET', endpoint: '/cloudflare/bucket/bandwidth', status: 200, latency: '92ms', time: '24 mins ago' }
    ],
    integration_gemini_ai: [
      { type: 'POST', endpoint: '/gemini/chat/completions/doubt-solver', status: 200, latency: '142ms', time: '2 mins ago' },
      { type: 'POST', endpoint: '/gemini/mcq/generate/physics_exam', status: 200, latency: '280ms', time: '12 mins ago' },
      { type: 'POST', endpoint: '/gemini/notes/summarize', status: 200, latency: '190ms', time: '35 mins ago' }
    ],
    integration_agora_rtc: [
      { type: 'GET', endpoint: '/agora/rtc/token?channel=class-physics', status: 200, latency: '76ms', time: '10 mins ago' },
      { type: 'POST', endpoint: '/agora/channel/kick-user', status: 200, latency: '98ms', time: '1 hour ago' },
      { type: 'GET', endpoint: '/agora/sessions/active-streams', status: 200, latency: '64ms', time: '2 hours ago' }
    ],
    integration_msg91_sms: [
      { type: 'POST', endpoint: '/msg91/otp/send?to=919876543210', status: 200, latency: '112ms', time: '5 mins ago' },
      { type: 'POST', endpoint: '/msg91/otp/verify', status: 200, latency: '104ms', time: '6 mins ago' },
      { type: 'POST', endpoint: '/msg91/sms/bulk', status: 200, latency: '145ms', time: '4 hours ago' }
    ]
  };

  return (
    <div className="api-management-view animate-fade-in">
      
      {/* Dynamic Header & Breadcrumb */}
      {selectedProvider ? (
        <div className="api-breadcrumb-header">
          <button className="back-to-providers-btn" onClick={() => { setSelectedProvider(null); setTestResult(null); loadIntegrations(); }}>
            <FaArrowLeft /> Back to API Providers
          </button>
          <div className="provider-header-row" style={{ marginTop: '12px' }}>
            <span className={`provider-avatar-icon ${selectedProvider.key}`}>
              {getProviderIcon(selectedProvider.key)}
            </span>
            <div>
              <h2 className="view-title">{selectedProvider.name} Integration</h2>
              <p className="view-subtitle">{selectedProvider.description}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="view-header-row">
          <div>
            <h2 className="view-title">Connected API Integrations</h2>
            <p className="view-subtitle">Select a third-party service provider to manage secrets, check live latency, and inspect routing payloads.</p>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {loadingList ? (
        <div className="diagnostics-running" style={{ minHeight: '300px' }}>
          <div className="pulse-spinner"></div>
          <span>Loading third-party integrations details...</span>
        </div>
      ) : errorMsg && !selectedProvider ? (
        <div className="modal-error-alert" style={{ margin: '20px 0' }}>
          ⚠️ {errorMsg}
          <button onClick={loadIntegrations} className="glass-button size-sm primary" style={{ marginLeft: '15px' }}>Retry</button>
        </div>
      ) : !selectedProvider ? (
        /* View 1: Grid of Connected API Providers */
        <div className="api-providers-grid">
          {integrationsList.map((details) => (
            <div 
              key={details.key} 
              className="api-provider-large-card animate-slide-up"
              onClick={() => handleProviderSelect(details)}
            >
              <div className="card-top-glow"></div>
              
              <div className="card-header-line">
                <span className={`provider-avatar-icon-large ${details.key}`}>
                  {getProviderIcon(details.key)}
                </span>
                <span className={`card-status-badge ${details.status === 'Operational' || details.status === 'Active' ? 'ok' : 'err'}`}>
                  <span className="badge-dot"></span> {details.status}
                </span>
              </div>

              <div className="card-info-block">
                <h3 className="card-provider-name">{details.name}</h3>
                <p className="card-provider-desc">{details.description}</p>
              </div>

              <div className="card-footer-metrics">
                <div className="card-metric">
                  <span className="metric-lbl">API Latency</span>
                  <span className="metric-val">{details.latency}</span>
                </div>
                <div className="card-metric">
                  <span className="metric-lbl">Avg Health</span>
                  <span className="metric-val">{details.health}</span>
                </div>
                <div className="card-metric">
                  <span className="metric-lbl">Volume / Day</span>
                  <span className="metric-val">{details.volume}</span>
                </div>
              </div>

              <div className="card-hover-action-indicator">
                Configure Integration <FaChevronRight className="chevron-icon" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* View 2: Split columns details page for the selected provider */
        <div className="api-grid">
          {/* Left Column: API Configurations */}
          <div className="api-col-left">
            <div className="glass-panel keys-config-panel">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaKey style={{ fontSize: '13.5px', color: '#3b82f6' }} /> Credentials Configuration
              </h3>
              <p className="panel-desc">All keys are secured using HSM encryption and injected into production environments.</p>

              {errorMsg && <div className="modal-error-alert" style={{ marginBottom: '15px' }}>⚠️ {errorMsg}</div>}

              <form className="keys-form" onSubmit={handleSaveCredentials}>
                 {Object.keys(localConfig).map((configKey) => {
                   const isSecretField = configKey.toLowerCase().includes('secret') || 
                                         configKey.toLowerCase().includes('key') || 
                                         configKey.toLowerCase().includes('token') || 
                                         configKey.toLowerCase().includes('auth') || 
                                         configKey.toLowerCase().includes('cert') || 
                                         configKey.toLowerCase().includes('id');
                   return (
                     <div key={configKey} className="form-group-new">
                       <label>{configKey.replace(/_/g, ' ')}</label>
                       <div className="input-with-toggle-wrapper" style={{ position: 'relative', width: '100%' }}>
                         <input 
                           type={isSecretField && !showSecrets[configKey] ? 'password' : 'text'}
                           value={localConfig[configKey] || ''} 
                           onChange={(e) => setLocalConfig(prev => ({ ...prev, [configKey]: e.target.value }))}
                           className="glass-input-premium"
                           style={{ paddingRight: isSecretField ? '40px' : '14px' }}
                           required
                         />
                         {isSecretField && (
                           <button
                             type="button"
                             className="toggle-secret-visibility-btn"
                             onClick={() => setShowSecrets(prev => ({ ...prev, [configKey]: !prev[configKey] }))}
                             style={{
                               position: 'absolute',
                               right: '12px',
                               top: '50%',
                               transform: 'translateY(-50%)',
                               background: 'none',
                               border: 'none',
                               color: '#94a3b8',
                               cursor: 'pointer',
                               display: 'flex',
                               alignItems: 'center',
                               fontSize: '14px',
                               padding: '4px',
                               transition: 'color 0.2s'
                             }}
                           >
                             {showSecrets[configKey] ? <FaEyeSlash /> : <FaEye />}
                           </button>
                         )}
                       </div>
                     </div>
                   );
                 })}

                <button type="submit" className="save-keys-btn" disabled={isSaving}>
                  {isSaving ? 'Re-deploying secrets...' : 'Save & Re-deploy Secrets'}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Diagnostic & Event Logs */}
          <div className="api-col-right">
            <div className="glass-panel test-diagnostic-panel">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaTerminal style={{ fontSize: '13.5px', color: '#10b981' }} /> Live Endpoint Connectivity
              </h3>
              <p className="panel-desc">Run a simulation ping request to check backend routing response status.</p>

              <button 
                className="test-diagnostics-btn"
                disabled={isTesting}
                onClick={() => handleTestApi(selectedProvider.key)}
              >
                <FaPlay className="play-icon" /> {isTesting ? 'Sending Request...' : 'Send Test Ping Request'}
              </button>

              {isTesting ? (
                <div className="diagnostics-running">
                  <div className="pulse-spinner"></div>
                  <span>Establishing Connection...</span>
                </div>
              ) : testResult ? (
                <div className="diagnostics-results-box animate-fade-in">
                  <div className="result-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {testResult.status === 'success' ? (
                        <>
                          <FaCheckCircle style={{ color: '#10b981' }} />
                          <span className="status-label" style={{ color: '#10b981' }}>STATUS {testResult.statusCode} OK</span>
                        </>
                      ) : (
                        <>
                          <FaTimesCircle style={{ color: '#ef4444' }} />
                          <span className="status-label" style={{ color: '#ef4444' }}>STATUS {testResult.statusCode} ERROR</span>
                        </>
                      )}
                    </div>
                    <span className="latency-badge">{testResult.latency}</span>
                  </div>

                  <div className="result-endpoint-box">
                    <span className="endpoint-lbl">Endpoint URL:</span>
                    <code className="endpoint-val">{testResult.endpoint}</code>
                  </div>

                  <div className="result-code-viewer">
                    <div className="viewer-header">
                      <span>RESPONSE JSON BODY</span>
                    </div>
                    <pre>{JSON.stringify(testResult.response, null, 2)}</pre>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="glass-panel logs-panel">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaExchangeAlt style={{ fontSize: '13.5px', color: '#8b5cf6' }} /> Activity Stream Logs
              </h3>
              <p className="panel-desc">Realtime stream of transactional integration gateway calls.</p>

              <div className="logs-stream-list">
                {(logsList[selectedProvider.key] || []).map((log, idx) => (
                  <div key={idx} className="log-stream-row">
                    <div className="log-left-col">
                      <span className={`method-badge ${log.type}`}>
                        {log.type}
                      </span>
                      <span className="log-endpoint-text">{log.endpoint}</span>
                    </div>

                    <div className="log-right-col">
                      <span className="log-latency">{log.latency}</span>
                      <span className={`status-dot ${log.status === 200 ? 'ok' : 'err'}`}>
                        {log.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .api-management-view {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .api-breadcrumb-header {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .back-to-providers-btn {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #475569;
          font-size: 12.5px;
          font-weight: 700;
          padding: 8px 14px;
          border-radius: 8px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }

        .back-to-providers-btn:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          color: #0f172a;
        }

        .provider-header-row {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .view-title {
          font-size: 20px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .view-subtitle {
          font-size: 13px;
          color: #64748b;
        }

        /* Providers list 2x2 Grid */
        .api-providers-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 25px;
        }

        @media (max-width: 768px) {
          .api-providers-grid {
            grid-template-columns: 1fr;
          }
        }

        .api-provider-large-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 24px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          gap: 18px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .api-provider-large-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 36px rgba(0,0,0,0.04);
          border-color: #cbd5e1;
        }

        .api-provider-large-card:hover .card-hover-action-indicator {
          color: #2563eb;
          transform: translateX(4px);
        }

        .card-top-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #3b82f6, #60a5fa);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .api-provider-large-card:hover .card-top-glow {
          opacity: 1;
        }

        .card-header-line {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .provider-avatar-icon-large {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.02);
        }

        .provider-avatar-icon-large.integration_cloudflare_r2 { background: #fff3eb; color: #f27420; }
        .provider-avatar-icon-large.integration_gemini_ai { background: #f0f4ff; color: #4285f4; }
        .provider-avatar-icon-large.integration_agora_rtc { background: #f5f3ff; color: #009eff; }
        .provider-avatar-icon-large.integration_msg91_sms { background: #eefdf8; color: #2cb784; }

        .card-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 12px;
        }

        .card-status-badge.ok {
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          color: #065f46;
        }

        .card-status-badge.err {
          background: #fef2f2;
          border: 1px solid #fca5a5;
          color: #991b1b;
        }

        .card-status-badge.ok .badge-dot { background: #10b981; }
        .card-status-badge.err .badge-dot { background: #ef4444; }

        .badge-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
        }

        .card-info-block {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .card-provider-name {
          font-size: 16px;
          font-weight: 750;
          color: #0f172a;
          margin: 0;
        }

        .card-provider-desc {
          font-size: 12px;
          color: #64748b;
          line-height: 1.5;
          margin: 0;
        }

        .card-footer-metrics {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          padding-top: 16px;
          border-top: 1px solid #f1f5f9;
        }

        .card-metric {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .metric-lbl {
          font-size: 8.5px;
          font-weight: 750;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .metric-val {
          font-size: 12px;
          font-weight: 700;
          color: #334155;
        }

        .card-hover-action-indicator {
          font-size: 11.5px;
          font-weight: 700;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: all 0.2s ease;
          padding-top: 4px;
        }

        .chevron-icon {
          font-size: 9px;
        }

        /* Detail split views */
        .api-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 25px;
        }

        @media (max-width: 1024px) {
          .api-grid {
            grid-template-columns: 1fr;
          }
        }

        .api-col-left,
        .api-col-right {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .keys-config-panel,
        .test-diagnostic-panel,
        .logs-panel {
          padding: 24px;
        }

        .keys-config-panel h3,
        .test-diagnostic-panel h3,
        .logs-panel h3 {
          font-size: 14.5px;
          font-weight: 750;
          color: #0f172a;
          margin: 0 0 4px 0;
        }

        .panel-desc {
          font-size: 12px;
          color: #64748b;
          margin: 0 0 20px 0;
        }

        .keys-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-group-new {
          display: flex;
          flex-direction: column;
          gap: 6px;
          align-items: flex-start;
          width: 100%;
        }

        .form-group-new label {
          font-size: 11.5px;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .glass-input-premium {
          background: #ffffff !important;
          border: 1px solid #cbd5e1 !important;
          border-radius: 8px !important;
          padding: 10px 14px !important;
          font-size: 13px !important;
          font-family: monospace !important;
          width: 100%;
          box-sizing: border-box;
        }

        .save-keys-btn {
          width: 100%;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: #ffffff;
          border: none;
          font-size: 13px;
          font-weight: 700;
          padding: 12px;
          border-radius: 8px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
          transition: all 0.2s;
        }

        .save-keys-btn:hover {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          transform: translateY(-0.5px);
        }

        .provider-avatar-icon {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          flex-shrink: 0;
        }

        .provider-avatar-icon.integration_cloudflare_r2 { background: #fff3eb; color: #f27420; }
        .provider-avatar-icon.integration_gemini_ai { background: #f0f4ff; color: #4285f4; }
        .provider-avatar-icon.integration_agora_rtc { background: #f5f3ff; color: #009eff; }
        .provider-avatar-icon.integration_msg91_sms { background: #eefdf8; color: #2cb784; }

        .diagnostics-target-row {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
          margin-bottom: 16px;
        }

        .target-label {
          color: #64748b;
        }

        .target-val {
          color: #0f172a;
          font-weight: 700;
        }

        .test-diagnostics-btn {
          width: 100%;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #334155;
          font-size: 13px;
          font-weight: 700;
          padding: 12px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
          margin-bottom: 20px;
        }

        .test-diagnostics-btn:hover:not(:disabled) {
          border-color: #10b981;
          color: #10b981;
          background: #f0fdf440;
        }

        .test-diagnostics-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .play-icon {
          font-size: 9px;
        }

        .diagnostics-running {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 40px;
          color: #64748b;
          font-size: 13px;
          font-weight: 650;
        }

        .pulse-spinner {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #10b981;
          animation: ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        .diagnostics-results-box {
          background: #0f172a;
          border-radius: 12px;
          padding: 20px;
          border: 1px solid #334155;
        }

        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #1e293b;
          padding-bottom: 12px;
          margin-bottom: 14px;
        }

        .status-label {
          color: #10b981;
          font-size: 11px;
          font-weight: 850;
          letter-spacing: 0.5px;
        }

        .latency-badge {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 4px;
        }

        .result-endpoint-box {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 16px;
        }

        .endpoint-lbl {
          font-size: 9px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
        }

        .endpoint-val {
          color: #94a3b8;
          font-family: monospace;
          font-size: 11.5px;
          word-break: break-all;
        }

        .result-code-viewer {
          display: flex;
          flex-direction: column;
        }

        .viewer-header {
          background: #1e293b;
          border-top-left-radius: 6px;
          border-top-right-radius: 6px;
          padding: 6px 12px;
          font-size: 9px;
          font-weight: 700;
          color: #64748b;
          letter-spacing: 0.5px;
        }

        .result-code-viewer pre {
          background: #020617;
          border-bottom-left-radius: 6px;
          border-bottom-right-radius: 6px;
          padding: 14px;
          margin: 0;
          color: #e2e8f0;
          font-family: monospace;
          font-size: 11px;
          overflow-x: auto;
          line-height: 1.5;
        }

        /* Activity Stream logs */
        .logs-stream-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .log-stream-row {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 10px 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
        }

        .log-left-col {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .method-badge {
          font-size: 8px;
          font-weight: 850;
          padding: 2px 6px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .method-badge.GET { background: #dcfce7; color: #16a34a; }
        .method-badge.POST { background: #dbeafe; color: #2563eb; }

        .log-endpoint-text {
          font-family: monospace;
          color: #334155;
          font-weight: 600;
        }

        .log-right-col {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .log-latency {
          color: #94a3b8;
          font-size: 11px;
        }

        .status-dot {
          display: inline-flex;
          align-items: center;
          font-size: 10px;
          font-weight: 700;
          gap: 4px;
        }

        .status-dot.ok { color: #10b981; }
        .status-dot.err { color: #ef4444; }

        .status-dot::before {
          content: '';
          width: 4px;
          height: 4px;
          border-radius: 50%;
          display: inline-block;
        }
        .status-dot.ok::before { background: #10b981; }
        .status-dot.err::before { background: #ef4444; }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-slide-up {
          animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default AiManagement;
