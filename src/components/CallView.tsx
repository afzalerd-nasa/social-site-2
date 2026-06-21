import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, Video as VideoIcon, VideoOff, Mic, MicOff, Tv, Monitor, StopCircle, 
  HelpCircle, MonitorOff, Award, Sparkles, Smile, Radio, Volume2, Loader2, Play
} from 'lucide-react';
import { User } from '../types';

interface CallViewProps {
  currentUser: User | null;
}

export default function CallView({ currentUser }: CallViewProps) {
  const [callType, setCallType] = useState<'audio' | 'video'>('video');
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'active' | 'ended'>('idle');
  const [participants, setParticipants] = useState<string[]>(['Alex Rivers', 'Sophia Chen']);
  
  // Controls
  const [micActive, setMicActive] = useState(true);
  const [cameraActive, setCameraActive] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('none');

  // Stream refs
  const [streamError, setStreamError] = useState<string | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  // Timer
  const [duration, setDuration] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (callStatus === 'active') {
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setDuration(0);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callStatus]);

  // Handle hardware camera toggling
  useEffect(() => {
    if (callStatus === 'active' && cameraActive && callType === 'video') {
      enableCamera();
    } else {
      disableCamera();
    }
  }, [callStatus, cameraActive, callType]);

  const enableCamera = async () => {
    try {
      setStreamError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 320, height: 240 }, 
        audio: false 
      });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.warn('Camera permission denied or not available. Using elite cyber avatar simulation.', err);
      setStreamError('Camera hardware lock or permission denied. Loading high-fidelity avatar simulation instead.');
    }
  };

  const disableCamera = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
  };

  const startCall = (type: 'audio' | 'video') => {
    setCallType(type);
    setCallStatus('calling');
    setTimeout(() => {
      setCallStatus('active');
    }, 2000);
  };

  const endCall = () => {
    setCallStatus('ended');
    disableCamera();
    setIsScreenSharing(false);
    setIsRecording(false);
    setTimeout(() => {
      setCallStatus('idle');
    }, 1500);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rSecs.toString().padStart(2, '0')}`;
  };

  // Sound effects simulation
  const soundboardSounds = [
    { label: '🎉 Applause', desc: 'Congratulate peers' },
    { label: '✨ Sparkle', desc: 'Bright idea alert' },
    { label: '🔔 Digital Bell', desc: 'Call attention' },
    { label: '🎵 Lo-Fi Intro', desc: 'Set calm vibe' }
  ];

  const playSoundEffect = (name: string) => {
    alert(`[Call Spatial Audio Simulation] Playing environmental soundboard: ${name}. Synchronizing nodes!`);
  };

  // Modern video filters
  const filtersList = [
    { id: 'none', label: 'None' },
    { id: 'blur', label: 'Virtual Blur (Bokeh)' },
    { id: 'grayscale', label: 'Retro Obsidian' },
    { id: 'sepia', label: 'Golden Hour Sunset' },
    { id: 'invert', label: 'Cyber Matrix Neon' }
  ];

  return (
    <div className="p-4 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl space-y-6 text-slate-900 dark:text-slate-100 max-w-4xl mx-auto h-[calc(100vh-7rem)] overflow-y-auto animate-fade-in">
      
      {/* HEADER TITLE */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <h2 className="font-bold text-xs uppercase tracking-widest text-blue-600 dark:text-cyan-400 font-mono">Sphere Communications Hub</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">High contrast real-time video grid & background filters</p>
        </div>
        {callStatus === 'active' && (
          <div className="flex items-center gap-2 px-3 py-1 bg-rose-50 dark:bg-red-650/10 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-red-500/15 rounded-full text-xs font-mono font-bold animate-pulse">
            <Radio size={12} />
            <span>CONNECTED &bull; {formatTime(duration)}</span>
          </div>
        )}
      </div>

      {callStatus === 'idle' ? (
        /* IDLE CONSOLE SCREEN - LAUNCH NEW SESSION */
        <div className="flex flex-col items-center justify-center p-12 text-center space-y-6">
          <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-blue-50 dark:bg-cyan-950 text-blue-600 dark:text-cyan-400">
            <Phone size={36} />
          </div>

          <div className="space-y-1.5 max-w-md">
            <h3 className="font-bold text-base text-slate-850 dark:text-slate-200">Initiate Secure Peer Call</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Establish a peer-to-peer real-time conference with active members. Supports on-the-fly camera filters, screen sharing, and local recording options.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              id="init-video-call-btn"
              onClick={() => startCall('video')}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              <VideoIcon size={14} />
              <span>Launch Video Conference</span>
            </button>
            <button
              id="init-audio-call-btn"
              onClick={() => startCall('audio')}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-150/50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              <Mic size={14} />
              <span>Audio Only Call</span>
            </button>
          </div>
        </div>

      ) : callStatus === 'calling' ? (
        /* LOCKING IN PEER NODES SCREEN */
        <div className="flex flex-col items-center justify-center p-12 text-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin"></div>
            <Phone className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-400" size={18} />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-slate-300">Dialing ConnectSphere Peers...</h3>
            <p className="text-xs font-mono text-slate-500">Establishing sub-50ms WebRTC handshakes</p>
          </div>
          <button 
            onClick={endCall}
            className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold"
          >
            Cancel Call
          </button>
        </div>

      ) : (
        /* CALL SESSION ACTIVE - GRID MONITOR */
        <div className="space-y-6">
          
          {/* PARTICIPANTS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* LOCAL PARTICIPANT STREAM */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 aspect-video flex flex-col justify-between p-4 min-h-[180px]">
              
              {/* Filter rendering class application */}
              <div className="absolute inset-0 z-0">
                {cameraActive && !streamError && localStream ? (
                  <video 
                    ref={localVideoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className={`w-full h-full object-cover transform scale-x-[-1] transition-all ${
                      activeFilter === 'blur' ? 'blur-md' :
                      activeFilter === 'grayscale' ? 'grayscale' :
                      activeFilter === 'sepia' ? 'sepia' :
                      activeFilter === 'invert' ? 'invert' : ''
                    }`}
                  />
                ) : (
                  /* Cyber Avatar simulation */
                  <div className={`w-full h-full flex flex-col items-center justify-center bg-slate-950 transition-all ${
                    activeFilter === 'grayscale' ? 'grayscale' :
                    activeFilter === 'sepia' ? 'sepia' :
                    activeFilter === 'invert' ? 'invert' : ''
                  }`}>
                    <div className={`w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center font-extrabold text-xl ${activeFilter === 'blur' ? 'blur-sm' : ''}`}>
                      {currentUser?.displayName[0] || 'S'}
                    </div>
                    <span className="text-[10px] text-slate-500 italic mt-2">Avatar Simulation Active</span>
                  </div>
                )}
              </div>

              {/* Grid Overlays */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="text-[10px] bg-slate-950/80 px-2 py-0.5 rounded-full font-bold">You (Host)</span>
                {!micActive && (
                  <span className="p-1 rounded bg-rose-600 text-white text-[10px] uppercase font-bold">Muted</span>
                )}
              </div>

              <div className="relative z-10 flex justify-between items-end">
                <div>
                  <h4 className="text-xs font-bold">{currentUser?.displayName}</h4>
                  <p className="text-[9px] text-slate-400">{isScreenSharing ? 'Sharing entire screen' : 'Camera stream active'}</p>
                </div>
                {activeFilter !== 'none' && (
                  <span className="text-[9px] bg-cyan-500 px-1.5 py-0.5 rounded font-mono uppercase text-black font-semibold">
                    Filter: {activeFilter}
                  </span>
                )}
              </div>
            </div>

            {/* MOCK COMPANION STREAM (Alex Rivers) */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 aspect-video flex flex-col justify-between p-4 min-h-[180px]">
              
              {/* Alexander background visual decoration */}
              <div className="absolute inset-0 z-0">
                <img 
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80" 
                  alt="" 
                  className="w-full h-full object-cover filter brightness-[0.4]" 
                />
              </div>

              <div className="relative z-10 flex items-center justify-between">
                <span className="text-[10px] bg-slate-950/80 px-2 py-0.5 rounded-full font-bold">Peer Node</span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-mono">54ms latency</span>
              </div>

              <div className="relative z-10">
                <h4 className="text-xs font-bold">Alex Rivers</h4>
                <p className="text-[9px] text-slate-400">Decentralized protocols lead engineer</p>
              </div>
            </div>

          </div>

          {/* ACTIVE FILTER SELECTOR */}
          <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <p className="text-[10px] uppercase font-bold text-slate-450 dark:text-slate-500 tracking-wider">Spatial Camera Filters</p>
            <div className="flex flex-wrap gap-2">
              {filtersList.map(f => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    activeFilter === f.id 
                      ? 'bg-blue-600 dark:bg-cyan-500 text-white dark:text-black font-bold border-blue-600 dark:border-cyan-400' 
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:text-slate-205'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            {streamError && (
              <p className="text-[9px] text-amber-500 italic mt-1">&bull; {streamError}</p>
            )}
          </div>

          {/* CALL OPERATIONS CONTROLS */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              <button
                id="toggle-mic-btn"
                onClick={() => setMicActive(!micActive)}
                className={`p-2.5 rounded-lg transition-all cursor-pointer ${
                  micActive ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-100 dark:hover:bg-slate-700' : 'bg-rose-605 text-white bg-rose-600 hover:bg-rose-700'
                }`}
                title={micActive ? "Mute Microphone" : "Unmute Microphone"}
              >
                {micActive ? <Mic size={16} /> : <MicOff size={16} />}
              </button>

              <button
                id="toggle-camera-btn"
                onClick={() => setCameraActive(!cameraActive)}
                className={`p-2.5 rounded-lg transition-all cursor-pointer ${
                  cameraActive ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-100 dark:hover:bg-slate-700' : 'bg-rose-605 text-white bg-rose-600 hover:bg-rose-700'
                }`}
                title={cameraActive ? "Disable Camera Stream" : "Enable Camera Stream"}
              >
                {cameraActive ? <VideoIcon size={16} /> : <VideoOff size={16} />}
              </button>

              <button
                id="toggle-screenshare-btn"
                onClick={() => {
                  setIsScreenSharing(!isScreenSharing);
                  alert(isScreenSharing ? 'Screen sharing stopped.' : 'Prompted to select screen element. Simulated share Active!');
                }}
                className={`p-2.5 rounded-lg transition-all cursor-pointer ${
                  isScreenSharing ? 'bg-blue-650 hover:bg-blue-700 text-white' : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-100 dark:hover:bg-slate-700'
                }`}
                title={isScreenSharing ? "Stop sharing screen" : "Share screen"}
              >
                {isScreenSharing ? <MonitorOff size={16} /> : <Monitor size={16} />}
              </button>

              <button
                id="toggle-record-btn"
                onClick={() => {
                  setIsRecording(!isRecording);
                  if (!isRecording) {
                    alert('Platform recording established. Capturing high frequency spatial audio locally!');
                  } else {
                    alert('Session record saved to repository.');
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all cursor-pointer ${
                  isRecording ? 'bg-red-600 text-white animate-pulse hover:bg-red-750' : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <StopCircle size={16} />
                <span className="text-[10px] font-bold">{isRecording ? 'REC Active' : 'Record'}</span>
              </button>
            </div>

            <button
              id="disconnect-call-btn"
              onClick={endCall}
              className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              Disconnect Node
            </button>
          </div>

          {/* SPATIAL SOUNDBOARD */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-1.5 text-blue-600 dark:text-cyan-400 font-bold">
              <Volume2 size={14} />
              <h3 className="font-bold text-[10px] uppercase tracking-wider font-mono">Spatial Audio Soundboard</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {soundboardSounds.map(s => (
                <button
                  key={s.label}
                  onClick={() => playSoundEffect(s.label)}
                  className="p-2 text-left bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800/80 rounded-lg transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{s.label}</span>
                    <Play size={8} className="text-blue-600 dark:text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-[9px] text-slate-450 dark:text-slate-500 block">{s.desc}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
