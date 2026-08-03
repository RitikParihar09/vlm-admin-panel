import React, { useState, useEffect, useRef } from 'react';
import {
  FaVideo, FaVideoSlash, FaMicrophone, FaMicrophoneSlash,
  FaPaperPlane, FaEraser, FaPaintBrush, FaTimes
} from 'react-icons/fa';

const LiveInterviewSession = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const channelName = urlParams.get('channelName') || '';
  const token = urlParams.get('token') || '';
  const appId = urlParams.get('appId') || '';
  const teacherName = urlParams.get('teacherName') || 'Teacher Candidate';
  const interviewId = urlParams.get('interviewId') || '';
  const teacherId = urlParams.get('teacherId') || '';

  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(true);
  const [remoteUserJoined, setRemoteUserJoined] = useState(false);

  // Audio/Video Mute States
  const [micMuted, setMicMuted] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);

  // Chat States
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');

  // Right Side Panel Tab
  const [rightPanelTab, setRightPanelTab] = useState('chat'); // 'chat' or 'notes'

  // Evaluation notes & scores
  const [evaluationNotes, setEvaluationNotes] = useState('');
  const [subjectScore, setSubjectScore] = useState(5);
  const [communicationScore, setCommunicationScore] = useState(5);
  const [teachingScore, setTeachingScore] = useState(5);
  const [overallScore, setOverallScore] = useState(5);
  const [decision, setDecision] = useState('approve'); // 'approve' or 'reject'
  const [savingNotes, setSavingNotes] = useState(false);

  // Tab state for Video vs Whiteboard on the left side
  const [activeWorkspace, setActiveWorkspace] = useState('video'); // 'video' or 'whiteboard'

  // Whiteboard drawing settings
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(4);
  const [isDrawing, setIsDrawing] = useState(false);

  // Refs for Agora
  const clientRef = useRef(null);
  const localAudioTrackRef = useRef(null);
  const localVideoTrackRef = useRef(null);

  // Refs for Video Div elements
  const localVideoDivRef = useRef(null);
  const remoteVideoDivRef = useRef(null);

  // Refs for Canvas Whiteboard
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const drawingHistoryRef = useRef([]);

  // Sync state refs
  const lastPolledRef = useRef(0);

  // Initialize Agora Local Media for Lobby Preview
  useEffect(() => {
    if (!appId || !channelName || !token || joined) return;

    let active = true;
    const initLobbyTracks = async () => {
      try {
        const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;

        // Clear any old/duplicate tracks
        if (localAudioTrackRef.current) { localAudioTrackRef.current.close(); localAudioTrackRef.current = null; }
        if (localVideoTrackRef.current) { localVideoTrackRef.current.close(); localVideoTrackRef.current = null; }

        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();

        if (!active) {
          audioTrack.close();
          videoTrack.close();
          return;
        }

        localAudioTrackRef.current = audioTrack;
        localVideoTrackRef.current = videoTrack;

        setTimeout(() => {
          try {
            if (localVideoDivRef.current && !videoMuted) {
              localVideoDivRef.current.innerHTML = "";
              videoTrack.play(localVideoDivRef.current);
            }
          } catch (e) {
            console.warn("Lobby play failed:", e);
          }
        }, 300);

        if (active) {
          setLoading(false);
        }
      } catch (err) {
        console.error("Lobby track initialization failed:", err);
        if (active) setLoading(false);
      }
    };

    initLobbyTracks();

    return () => {
      active = false;
    };
  }, [appId, channelName, token]);

  const handleJoinCall = async () => {
    if (!appId || !channelName || !token) {
      alert("Agora credentials not ready yet");
      return;
    }

    try {
      const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      clientRef.current = client;

      client.on('user-published', async (user, mediaType) => {
        console.log("===== ADMIN REMOTE USER =====");
        await client.subscribe(user, mediaType);
        if (mediaType === "video") {
          setRemoteUserJoined(true);
          setTimeout(() => {
            try {
              if (remoteVideoDivRef.current) {
                remoteVideoDivRef.current.innerHTML = "";
                user.videoTrack.play(remoteVideoDivRef.current);
              }
            } catch (e) {
              console.warn("Remote play failed:", e);
            }
          }, 300);
        }
        if (mediaType === "audio") {
          try {
            user.audioTrack.play();
          } catch (e) {
            console.warn("Remote audio play failed:", e);
          }
        }
      });

      client.on('user-unpublished', (user, mediaType) => {
        if (mediaType === 'video') {
          setRemoteUserJoined(false);
          if (remoteVideoDivRef.current) {
            remoteVideoDivRef.current.innerHTML = ""; // Clear frozen video!
          }
        }
      });

      client.on('user-left', () => {
        setRemoteUserJoined(false);
        setMessages(prev => [...prev, { sender: 'System', text: `${teacherName} left the session.` }]);
        if (remoteVideoDivRef.current) {
          remoteVideoDivRef.current.innerHTML = ""; // Clear frozen video!
        }
      });

      await client.join(appId, channelName, token, null);

      const tracks = [];
      if (localAudioTrackRef.current) tracks.push(localAudioTrackRef.current);
      if (localVideoTrackRef.current) tracks.push(localVideoTrackRef.current);

      if (tracks.length > 0) {
        await client.publish(tracks);
      }

      setJoined(true);
      setMessages(prev => [...prev, { sender: 'System', text: 'Connected to call. Waiting for candidate to join...' }]);
    } catch (err) {
      console.error("Agora join failed:", err);
      alert("Failed to join call: " + err.message);
    }
  };

  // Clean up Agora tracks & connections
  const cleanupAgora = async () => {
    if (localAudioTrackRef.current) {
      localAudioTrackRef.current.stop();
      localAudioTrackRef.current.close();
      localAudioTrackRef.current = null;
    }
    if (localVideoTrackRef.current) {
      localVideoTrackRef.current.stop();
      localVideoTrackRef.current.close();
      localVideoTrackRef.current = null;
    }
    if (clientRef.current) {
      await clientRef.current.leave().catch(() => { });
      clientRef.current = null;
    }
  };

  // Poll loop for drawing and chat updates (REST syncing fallback)
  useEffect(() => {
    if (!interviewId) return;

    let active = true;
    const fetchSync = async () => {
      try {
        const adminToken = localStorage.getItem('adminToken') || '';
        const res = await fetch(`/api/auth/interview/${interviewId}/sync?since=${lastPolledRef.current}`, {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        });
        const json = await res.json();
        if (json.success && json.data && json.data.length > 0 && active) {
          let maxTime = lastPolledRef.current;
          json.data.forEach(event => {
            maxTime = Math.max(maxTime, event.timestamp);

            // Skip drawing events sent by the current sender ('admin')
            if (event.sender === 'admin') {
              if (event.type === 'chat') {
                // Ignore since we already rendered locally
                return;
              }
              return;
            }

            // Process remote/candidate events
            if (event.type === 'chat') {
              setMessages(prev => [...prev, { sender: teacherName, text: event.text }]);
            } else if (event.type === 'draw-start') {
              drawRemoteStart(event.x, event.y, event.color, event.size);
            } else if (event.type === 'draw-move') {
              drawRemoteMove(event.x, event.y);
            } else if (event.type === 'draw-end') {
              drawRemoteEnd();
            } else if (event.type === 'clear-board') {
              clearLocalBoard(false);
            }
          });
          lastPolledRef.current = maxTime;
        }
      } catch (e) {
        console.error('Error polling sync data:', e);
      }
    };

    const interval = setInterval(fetchSync, 700);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [interviewId, teacherName]);

  const sendSyncEvent = async (eventPayload) => {
    if (!interviewId) return;
    try {
      const adminToken = localStorage.getItem('adminToken') || '';
      await fetch(`/api/auth/interview/${interviewId}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ event: eventPayload })
      });
    } catch (e) {
      console.error('Error sending sync event:', e);
    }
  };

  // Mute audio track
  const toggleMic = async () => {
    if (localAudioTrackRef.current) {
      await localAudioTrackRef.current.setEnabled(micMuted);
      setMicMuted(!micMuted);
    }
  };

  // Mute video track
  const toggleVideo = async () => {
    if (localVideoTrackRef.current) {
      await localVideoTrackRef.current.setEnabled(videoMuted);
      setVideoMuted(!videoMuted);
    }
  };

  // Send message
  const sendMessage = () => {
    if (!inputText.trim()) return;
    const text = inputText.trim();
    setMessages(prev => [...prev, { sender: 'You (Admin)', text }]);
    setInputText('');
    sendSyncEvent({ type: 'chat', text });
  };

  // Canvas drawing initialize
  useEffect(() => {
    if (activeWorkspace === 'whiteboard' && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight || 500;

      const context = canvas.getContext('2d');
      context.lineCap = 'round';
      context.lineJoin = 'round';
      contextRef.current = context;

      redrawHistory();
    }
  }, [activeWorkspace]);

  const redrawHistory = () => {
    if (!contextRef.current || !canvasRef.current) return;
    const ctx = contextRef.current;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    drawingHistoryRef.current.forEach((stroke) => {
      if (stroke.points.length < 1) return;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.size;
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    });
  };

  // Whiteboard drawing handlers (Local mouse interactions)
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || !contextRef.current) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    contextRef.current.strokeStyle = brushColor;
    contextRef.current.lineWidth = brushSize;
    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
    setIsDrawing(true);

    drawingHistoryRef.current.push({
      color: brushColor,
      size: brushSize,
      points: [{ x, y }]
    });

    sendDrawEvent('draw-start', x, y, brushColor, brushSize);
  };

  const draw = (e) => {
    if (!isDrawing || !contextRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();

    const currentStroke = drawingHistoryRef.current[drawingHistoryRef.current.length - 1];
    if (currentStroke) {
      currentStroke.points.push({ x, y });
    }

    sendDrawEvent('draw-move', x, y);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    sendDrawEvent('draw-end');
  };

  // Whiteboard drawing handlers (Remote messages received)
  let remotePathRef = useRef(null);

  const drawRemoteStart = (x, y, color, size) => {
    remotePathRef.current = {
      color,
      size,
      points: [{ x, y }]
    };

    if (!contextRef.current) return;
    contextRef.current.strokeStyle = color;
    contextRef.current.lineWidth = size;
    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
  };

  const drawRemoteMove = (x, y) => {
    if (remotePathRef.current) {
      remotePathRef.current.points.push({ x, y });
    }
    if (!contextRef.current) return;
    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();
  };

  const drawRemoteEnd = () => {
    if (remotePathRef.current) {
      drawingHistoryRef.current.push(remotePathRef.current);
      remotePathRef.current = null;
    }
  };

  const clearLocalBoard = (notify = true) => {
    drawingHistoryRef.current = [];
    if (canvasRef.current && contextRef.current) {
      contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    if (notify) {
      sendDrawEvent('clear-board');
    }
  };

  // Re-bind Agora video streams when switching back to video workspace
  useEffect(() => {
    if (activeWorkspace === 'video') {
      if (localVideoTrackRef.current && localVideoDivRef.current) {
        localVideoDivRef.current.innerHTML = "";
        localVideoTrackRef.current.play(localVideoDivRef.current);
      }
      if (clientRef.current) {
        const remoteUsers = clientRef.current.remoteUsers;
        remoteUsers.forEach(user => {
          if (user.videoTrack && remoteVideoDivRef.current) {
            remoteVideoDivRef.current.innerHTML = "";
            user.videoTrack.play(remoteVideoDivRef.current);
          }
        });
      }
    }
  }, [activeWorkspace, joined, remoteUserJoined]);

  const sendDrawEvent = (type, x = 0, y = 0, color = '', size = 0) => {
    sendSyncEvent({ type, x, y, color, size });
  };

  const handleEndCall = async () => {
    if (confirm('Are you sure you want to end this interview session? This will disconnect the call.')) {
      await cleanupAgora();
      window.close();
    }
  };

  const handleSubmitEvaluation = async () => {
    if (!teacherId) {
      alert("Teacher ID is missing. Cannot submit evaluation.");
      return;
    }
    
    setSavingNotes(true);
    try {
      const adminToken = localStorage.getItem('adminToken') || '';
      
      const formattedNotes = `Subject Knowledge: ${subjectScore}/5\nCommunication: ${communicationScore}/5\nTeaching Ability: ${teachingScore}/5\nOverall: ${overallScore}/5\n\nNotes:\n${evaluationNotes}`;

      const res = await fetch('/api/admin/teachers/verify-decision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          teacherId,
          interviewId,
          decision,
          notes: formattedNotes
        })
      });

      const json = await res.json();
      if (json.success) {
        alert("Evaluation submitted successfully! The interview is now completed.");
      } else {
        alert("Failed to submit evaluation: " + (json.message || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting evaluation: " + err.message);
    } finally {
      setSavingNotes(false);
    }
  };

  if (!joined) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', backgroundColor: '#090d16', color: '#fff', fontFamily: 'sans-serif' }}>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}} />
        <div style={{ width: '100%', maxWidth: '640px', backgroundColor: 'rgba(30, 41, 59, 0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', padding: '32px', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', margin: '0 auto' }}>
          
          <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>Ready to start the Interview?</h2>
          <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '24px' }}>Check your camera and microphone preview below before entering the live session.</p>

          {/* Large Camera Preview Card */}
          <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '24px', boxShadow: 'inset 0 2px 4px 0 rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div ref={localVideoDivRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            
            {/* If camera is muted */}
            {videoMuted && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#090d16', zIndex: 10 }}>
                <FaVideoSlash size={40} color="#ef4444" style={{ marginBottom: '8px' }} />
                <p style={{ fontSize: '14px', color: '#94a3b8' }}>Your camera is turned off</p>
              </div>
            )}

            {!localVideoTrackRef.current && !videoMuted && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#090d16', zIndex: 10 }}>
                <div style={{ width: '32px', height: '32px', border: '3px solid #38bdf8', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '8px' }} />
                <p style={{ fontSize: '14px', color: '#94a3b8' }}>Starting camera preview...</p>
              </div>
            )}

            {/* Float badge */}
            <div style={{ position: 'absolute', bottom: '12px', left: '12px', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', border: '1px solid rgba(255,255,255,0.1)', zIndex: 20 }}>
              Camera Preview
            </div>
          </div>

          {/* Lobby Media Control Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
            <button
              onClick={toggleMic}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: '1px solid ' + (micMuted ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255,255,255,0.1)'),
                backgroundColor: micMuted ? 'rgba(239, 68, 68, 0.2)' : '#1e293b',
                color: micMuted ? '#f87171' : '#fff',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title={micMuted ? 'Unmute Mic' : 'Mute Mic'}
            >
              {micMuted ? <FaMicrophoneSlash size={20} /> : <FaMicrophone size={20} />}
            </button>
            
            <button
              onClick={toggleVideo}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: '1px solid ' + (videoMuted ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255,255,255,0.1)'),
                backgroundColor: videoMuted ? 'rgba(239, 68, 68, 0.2)' : '#1e293b',
                color: videoMuted ? '#f87171' : '#fff',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title={videoMuted ? 'Turn Camera On' : 'Turn Camera Off'}
            >
              {videoMuted ? <FaVideoSlash size={20} /> : <FaVideo size={20} />}
            </button>
          </div>

          {/* Action Buttons */}
          <div style={{ width: '100%', display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button
              onClick={handleJoinCall}
              style={{
                background: 'linear-gradient(to right, #10b981, #14b8a6)',
                color: '#fff',
                fontWeight: 'bold',
                padding: '0 32px',
                height: '48px',
                borderRadius: '24px',
                fontSize: '14px',
                cursor: 'pointer',
                border: 'none',
                boxShadow: '0 10px 15px -3px rgba(16,185,129,0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <FaVideo size={16} /> Enter Interview Room
            </button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#0f172a',
      color: '#f8fafc',
      fontFamily: 'Inter, system-ui, sans-serif',
      overflow: 'hidden'
    }}>
      {/* 1. ROOM HEADER */}
      <div style={{
        padding: '16px 24px',
        background: '#1e293b',
        borderBottom: '1px solid #334155',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: joined ? '#10b981' : '#f59e0b', animation: joined ? 'pulse 2s infinite' : 'none' }} />
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>VLM Live Interview Room</h1>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
              Candidate: <strong>{teacherName}</strong> | Room Channel: {channelName}
            </div>
          </div>
        </div>

        {/* Workspace controls */}
        <div style={{ display: 'flex', gap: '8px', background: '#0f172a', padding: '4px', borderRadius: '8px' }}>
          <button
            onClick={() => setActiveWorkspace('video')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeWorkspace === 'video' ? '#3b82f6' : 'transparent',
              color: '#fff',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Video Streams
          </button>
          <button
            onClick={() => setActiveWorkspace('whiteboard')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeWorkspace === 'whiteboard' ? '#3b82f6' : 'transparent',
              color: '#fff',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Interactive Whiteboard
          </button>
        </div>

        {/* Top end button */}
        <button
          onClick={handleEndCall}
          style={{
            padding: '8px 18px',
            background: '#ef4444',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '13.5px'
          }}
        >
          End Interview Call
        </button>
      </div>

      {/* 2. MAIN WORKSPACE */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0, position: 'relative' }}>

        {/* Left Side: Video Streams OR Whiteboard */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#090d16', padding: '16px', position: 'relative', minWidth: 0 }}>
          {loading && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(9, 13, 22, 0.95)', zIndex: 10 }}>
              <div style={{ textAlign: 'center' }}>
                <div className="spinner" style={{ border: '4px solid rgba(255,255,255,0.1)', borderLeftColor: '#3b82f6', width: '36px', height: '36px', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px auto' }} />
                <div>Joining Interview Channel...</div>
              </div>
            </div>
          )}

          {activeWorkspace === 'video' ? (
            /* VIDEO VIEW GRID */
            <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>

              {/* Remote Video Box (Candidate - Main Background) */}
              <div style={{ position: 'absolute', inset: 0, background: '#1e293b', borderRadius: '12px', overflow: 'hidden', border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div ref={remoteVideoDivRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {!remoteUserJoined && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#090d16', zIndex: 2, color: '#64748b' }}>
                    <FaVideoSlash size={40} style={{ opacity: 0.5, marginBottom: '12px' }} />
                    <div style={{ fontSize: '14px', fontWeight: '500' }}>Waiting for teacher to join...</div>
                  </div>
                )}
                <div style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'rgba(15, 23, 42, 0.75)', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '500', zIndex: 5 }}>
                  Candidate: {teacherName}
                </div>
              </div>

              {/* Local Video Box (Admin Interviewer - Small PIP Floating Preview) */}
              <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10, width: '180px', height: '135px', background: '#1e293b', borderRadius: '12px', overflow: 'hidden', border: '2px solid rgba(255, 255, 255, 0.2)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}>
                <div ref={localVideoDivRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {videoMuted && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
                    <FaVideoSlash size={30} color="#64748b" />
                  </div>
                )}
                <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(15, 23, 42, 0.75)', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '500' }}>
                  You (Admin)
                </div>
              </div>

            </div>
          ) : (
            /* WHITEBOARD VIEW */
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#ffffff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #334155' }}>

              {/* Whiteboard Controls */}
              <div style={{ padding: '8px 16px', background: '#f1f5f9', borderBottom: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#0f172a' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>

                  {/* Colors */}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {['#000000', '#ef4444', '#3b82f6', '#10b981'].map(color => (
                      <button
                        key={color}
                        onClick={() => setBrushColor(color)}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: color,
                          border: brushColor === color ? '2px solid #6366f1' : '1px solid #94a3b8',
                          cursor: 'pointer',
                          padding: 0
                        }}
                      />
                    ))}
                  </div>

                  <div style={{ width: '1px', height: '20px', background: '#cbd5e1' }} />

                  {/* Size selector */}
                  <select
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    style={{ padding: '3px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: '600' }}
                  >
                    <option value={2}>Thin Pen</option>
                    <option value={4}>Medium Pen</option>
                    <option value={8}>Thick Pen</option>
                    <option value={15}>Marker</option>
                  </select>

                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => clearLocalBoard(true)}
                    style={{
                      padding: '4px 12px',
                      background: '#fee2e2',
                      color: '#ef4444',
                      border: '1px solid #fca5a5',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <FaEraser size={11} /> Clear Board
                  </button>
                </div>
              </div>

              {/* Canvas workspace */}
              <div style={{ flex: 1, position: 'relative', background: '#ffffff', cursor: 'crosshair' }}>
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  style={{ display: 'block', width: '100%', height: '100%' }}
                />
              </div>

            </div>
          )}

          {/* Call Controls HUD at bottom */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '16px', flexShrink: 0 }}>
            <button
              onClick={toggleMic}
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                border: 'none',
                background: micMuted ? '#ef4444' : '#334155',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              title={micMuted ? 'Unmute Microphone' : 'Mute Microphone'}
            >
              {micMuted ? <FaMicrophoneSlash size={18} /> : <FaMicrophone size={18} />}
            </button>

            <button
              onClick={toggleVideo}
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                border: 'none',
                background: videoMuted ? '#ef4444' : '#334155',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              title={videoMuted ? 'Turn Camera On' : 'Turn Camera Off'}
            >
              {videoMuted ? <FaVideoSlash size={18} /> : <FaVideo size={18} />}
            </button>
          </div>

        </div>

        {/* Right Side: Tabbed Panel (Chat & Notes) */}
        <div style={{
          width: '380px',
          borderLeft: '1px solid #334155',
          background: '#1e293b',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0
        }}>
          {/* Tab Headers */}
          <div style={{ display: 'flex', borderBottom: '1px solid #334155', flexShrink: 0 }}>
            <button
              onClick={() => setRightPanelTab('chat')}
              style={{
                flex: 1,
                padding: '14px',
                background: rightPanelTab === 'chat' ? 'transparent' : '#111827',
                border: 'none',
                color: rightPanelTab === 'chat' ? '#38bdf8' : '#94a3b8',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                borderBottom: rightPanelTab === 'chat' ? '2px solid #38bdf8' : 'none'
              }}
            >
              Chat
            </button>
            <button
              onClick={() => setRightPanelTab('notes')}
              style={{
                flex: 1,
                padding: '14px',
                background: rightPanelTab === 'notes' ? 'transparent' : '#111827',
                border: 'none',
                color: rightPanelTab === 'notes' ? '#38bdf8' : '#94a3b8',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                borderBottom: rightPanelTab === 'notes' ? '2px solid #38bdf8' : 'none'
              }}
            >
              Interviewer Notes & Score
            </button>
          </div>

          {rightPanelTab === 'chat' ? (
            /* CHAT PANEL CONTENT */
            <>
              {/* Chat Messages Log */}
              <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#64748b', fontSize: '13px', marginTop: '20px' }}>
                    No messages yet. Send a note to the candidate!
                  </div>
                ) : (
                  messages.map((msg, i) => {
                    const isMe = msg.sender.includes('You');
                    const isSystem = msg.sender === 'System';

                    if (isSystem) {
                      return (
                        <div key={i} style={{ textAlign: 'center', fontSize: '11px', color: '#f59e0b', margin: '4px 0', background: 'rgba(245, 158, 11, 0.05)', padding: '4px 8px', borderRadius: '6px' }}>
                          {msg.text}
                        </div>
                      );
                    }

                    return (
                      <div
                        key={i}
                        style={{
                          alignSelf: isMe ? 'flex-end' : 'flex-start',
                          maxWidth: '85%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isMe ? 'flex-end' : 'flex-start'
                        }}
                      >
                        <span style={{ fontSize: '10.5px', color: '#94a3b8', marginBottom: '2px' }}>{msg.sender}</span>
                        <div style={{
                          padding: '8px 12px',
                          borderRadius: '10px',
                          fontSize: '12.5px',
                          lineHeight: '1.4',
                          background: isMe ? '#2563eb' : '#334155',
                          color: '#fff',
                          wordBreak: 'break-word'
                        }}>
                          {msg.text}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Chat Input */}
              <div style={{ padding: '14px', borderTop: '1px solid #334155', background: '#0f172a' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message to the teacher..."
                    style={{
                      flex: 1,
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #334155',
                      background: '#1e293b',
                      color: '#fff',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                  <button
                    onClick={sendMessage}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      border: 'none',
                      background: '#3b82f6',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <FaPaperPlane size={13} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* EVALUATION / NOTES PANEL CONTENT */
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', color: '#f8fafc' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0, color: '#38bdf8' }}>Evaluate Candidate</h3>
              
              {/* Star Rating Selectors */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#cbd5e1' }}>Subject Knowledge</span>
                  <select
                    value={subjectScore}
                    onChange={(e) => setSubjectScore(Number(e.target.value))}
                    style={{ background: '#0f172a', color: '#fff', border: '1px solid #475569', borderRadius: '6px', padding: '4px 8px', fontSize: '13px', cursor: 'pointer' }}
                  >
                    {[5, 4, 3, 2, 1].map(v => <option key={v} value={v}>{v} Stars</option>)}
                  </select>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#cbd5e1' }}>Communication Skills</span>
                  <select
                    value={communicationScore}
                    onChange={(e) => setCommunicationScore(Number(e.target.value))}
                    style={{ background: '#0f172a', color: '#fff', border: '1px solid #475569', borderRadius: '6px', padding: '4px 8px', fontSize: '13px', cursor: 'pointer' }}
                  >
                    {[5, 4, 3, 2, 1].map(v => <option key={v} value={v}>{v} Stars</option>)}
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#cbd5e1' }}>Teaching Methodology</span>
                  <select
                    value={teachingScore}
                    onChange={(e) => setTeachingScore(Number(e.target.value))}
                    style={{ background: '#0f172a', color: '#fff', border: '1px solid #475569', borderRadius: '6px', padding: '4px 8px', fontSize: '13px', cursor: 'pointer' }}
                  >
                    {[5, 4, 3, 2, 1].map(v => <option key={v} value={v}>{v} Stars</option>)}
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#cbd5e1' }}>Overall Score</span>
                  <select
                    value={overallScore}
                    onChange={(e) => setOverallScore(Number(e.target.value))}
                    style={{ background: '#0f172a', color: '#fff', border: '1px solid #475569', borderRadius: '6px', padding: '4px 8px', fontSize: '13px', cursor: 'pointer' }}
                  >
                    {[5, 4, 3, 2, 1].map(v => <option key={v} value={v}>{v} Stars</option>)}
                  </select>
                </div>
              </div>

              <div style={{ height: '1px', background: '#334155' }} />

              {/* Written Notes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: '600' }}>Evaluation Notes</span>
                <textarea
                  value={evaluationNotes}
                  onChange={(e) => setEvaluationNotes(e.target.value)}
                  placeholder="Write detailed assessment notes..."
                  style={{
                    height: '140px',
                    background: '#0f172a',
                    color: '#fff',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    padding: '10px',
                    fontSize: '13px',
                    resize: 'none',
                    fontFamily: 'inherit',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Verification Decision */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: '600' }}>Verification Status</span>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="decision"
                      value="approve"
                      checked={decision === 'approve'}
                      onChange={() => setDecision('approve')}
                    />
                    Approve / Verify
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', color: '#f87171' }}>
                    <input
                      type="radio"
                      name="decision"
                      value="reject"
                      checked={decision === 'reject'}
                      onChange={() => setDecision('reject')}
                    />
                    Reject
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmitEvaluation}
                disabled={savingNotes}
                style={{
                  background: decision === 'approve' ? 'linear-gradient(to right, #10b981, #14b8a6)' : 'linear-gradient(to right, #ef4444, #f43f5e)',
                  color: '#fff',
                  fontWeight: 'bold',
                  height: '40px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '13px',
                  cursor: savingNotes ? 'not-allowed' : 'pointer',
                  opacity: savingNotes ? 0.7 : 1,
                  marginTop: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                {savingNotes ? 'Submitting...' : 'Submit Final Evaluation'}
              </button>
            </div>
          )}
        </div>

      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
      `}</style>
    </div>
  );
};

export default LiveInterviewSession;
