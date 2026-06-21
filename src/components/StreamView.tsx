import React, { useState, useEffect, useRef } from 'react';
import { 
  Tv, Zap, Users, Heart, Send, Award, Gift, Radio, Play, StopCircle, 
  Loader2, Check, RefreshCw, BarChart2, Star, Trophy
} from 'lucide-react';
import { LiveStream, StreamComment, User } from '../types';

interface StreamViewProps {
  currentUser: User | null;
}

export default function StreamView({ currentUser }: StreamViewProps) {
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Active stream context
  const [activeWatchStreamId, setActiveWatchStreamId] = useState<string | null>(null);
  const [activeStreamData, setActiveStreamData] = useState<LiveStream | null>(null);

  // Broadcaster model states
  const [broadcasterTitle, setBroadcasterTitle] = useState('');
  const [broadcastingStream, setBroadcastingStream] = useState<LiveStream | null>(null);

  // Interaction inputs
  const [chatInput, setChatInput] = useState('');
  const [gloriousNotice, setGloriousNotice] = useState<string | null>(null); // gift alerts

  useEffect(() => {
    fetchStreams();
    const interval = setInterval(fetchStreams, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeWatchStreamId) {
      const match = streams.find(s => s.id === activeWatchStreamId);
      if (match) setActiveStreamData(match);
    }
  }, [streams, activeWatchStreamId]);

  const fetchStreams = async () => {
    try {
      const res = await fetch('/api/streams');
      if (res.ok) {
        const data = await res.json();
        setStreams(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoLiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcasterTitle.trim()) return;

    try {
      const res = await fetch('/api/streams/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: broadcasterTitle })
      });

      if (res.ok) {
        const started = await res.json();
        setBroadcastingStream(started);
        setActiveWatchStreamId(started.id);
        setActiveStreamData(started);
        setBroadcasterTitle('');
        await fetchStreams();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEndStream = async () => {
    if (!broadcastingStream) return;
    try {
      const res = await fetch(`/api/streams/${broadcastingStream.id}/end`, {
        method: 'POST'
      });
      if (res.ok) {
        setBroadcastingStream(null);
        setActiveWatchStreamId(null);
        setActiveStreamData(null);
        await fetchStreams();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeWatchStreamId) return;

    try {
      const res = await fetch(`/api/streams/${activeWatchStreamId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: chatInput })
      });

      if (res.ok) {
        setChatInput('');
        await fetchStreams();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendGift = async (giftLabel: string, cost: string) => {
    if (!activeWatchStreamId) return;

    try {
      const res = await fetch(`/api/streams/${activeWatchStreamId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gift: `${giftLabel} (${cost})` })
      });

      if (res.ok) {
        // Trigger celebrative overlay
        setGloriousNotice(`⭐️ THANK YOU! Send ${giftLabel} to Streamer! ⭐️`);
        setTimeout(() => setGloriousNotice(null), 3000);
        await fetchStreams();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLikeStream = async () => {
    if (!activeWatchStreamId) return;

    try {
      const res = await fetch(`/api/streams/${activeWatchStreamId}/likes`, { method: 'POST' });
      if (res.ok) {
        await fetchStreams();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Pre-loaded virtual gifts
  const giftOptions = [
    { label: '🔥 Spark', cost: '$0.99', icon: Zap, color: 'text-yellow-400' },
    { label: '💎 Diamond Heart', cost: '$4.99', icon: Heart, color: 'text-rose-500' },
    { label: '👑 Golden Crown', cost: '$9.99', icon: Trophy, color: 'text-amber-400' },
    { label: '🚀 Cosmic Rocket', cost: '$24.99', icon: Star, color: 'text-fuchsia-400' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-slate-900 dark:text-slate-100 max-w-6xl mx-auto animate-fade-in">
      
      {/* LEFT COLUMN: ACTIVE PLAYER OR LAUNCH PANEL */}
      <div className="lg:col-span-2 space-y-6">
        
        {activeStreamData ? (
          /* PRESENT THERAPEUTIC / ADVENTURE BROADCAST VIEW */
          <div className="space-y-4">
            
            {/* VIRTUAL VIDEO STAGE */}
            <div className="relative rounded-2xl bg-black overflow-hidden aspect-video border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-2xl">
              
              {/* Overlay active alert */}
              {gloriousNotice && (
                <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-yellow-500 via-amber-600 to-rose-600 font-extrabold text-xs text-white px-5 py-2.5 rounded-full shadow-2xl animate-bounce tracking-wide">
                  {gloriousNotice}
                </div>
              )}

              {/* Static visual placeholders depending on stream */}
              <div className="absolute inset-0">
                {activeStreamData.status === 'live' ? (
                  <div className="relative w-full h-full">
                    {activeStreamData.streamerId === 'user_3' ? (
                      /* Hiking stream mock clip background */
                      <img 
                        src="https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&auto=format&fit=crop&q=80" 
                        alt="Yosemite" 
                        className="w-full h-full object-cover brightness-[0.7] animate-pulse" 
                        style={{ animationDuration: '7s' }}
                      />
                    ) : (
                      /* Custom Streamer visual output */
                      <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-cyan-700 flex items-center justify-center text-white text-lg font-bold animate-pulse">
                          LIVE
                        </div>
                        <span className="text-xs text-slate-500 font-mono">Peer Camera Source Active</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center p-4">
                    <Tv size={48} className="text-slate-700 mb-2" />
                    <p className="text-sm font-bold text-slate-400">Broadcast commences shortly.</p>
                    {activeStreamData.scheduledAt && (
                      <p className="text-xs text-slate-500 font-mono">Scheduled: {new Date(activeStreamData.scheduledAt).toLocaleString()}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Player Top HUD Overlay */}
              <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-600 text-[10px] font-extrabold rounded-full tracking-wide">
                    <Radio size={10} className="animate-ping" />
                    <span>{activeStreamData.status === 'live' ? 'LIVE' : 'UPCOMING'}</span>
                  </span>
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-black/60 rounded-full text-[10px] text-slate-200">
                    <Users size={10} />
                    <span>{activeStreamData.viewersCount} watching</span>
                  </span>
                </div>
                
                <button 
                  onClick={() => setActiveWatchStreamId(null)}
                  className="bg-black/65 px-3 py-1 rounded-full text-[10px] text-slate-300 hover:text-white"
                >
                  Exit Theater
                </button>
              </div>

              {/* Player Bottom controls and titles */}
              <div className="absolute bottom-4 inset-x-4 bg-slate-950/80 p-3 rounded-xl border border-white/5 flex items-center justify-between z-10 backdrop-blur-sm">
                <div>
                  <h3 className="text-xs font-bold truncate max-w-[300px]">{activeStreamData.title}</h3>
                  <p className="text-[10px] text-slate-400">Host: @{activeStreamData.streamerName}</p>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={handleLikeStream}
                    className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-rose-500 text-xs flex items-center gap-1 font-bold"
                  >
                    <Heart size={12} fill="currentColor" />
                    <span>{activeStreamData.likesCount}</span>
                  </button>
                </div>
              </div>

            </div>

            {/* SEND DIRECT COMMUNITY GIFT */}
            {activeStreamData.status === 'live' && (
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 rounded-2xl space-y-3 shadow-sm dark:shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-blue-600 dark:text-cyan-405 font-bold">
                    <Gift size={16} />
                    <h4 className="font-bold text-xs uppercase tracking-wider font-mono">Stream Gifting Panel</h4>
                  </div>
                  <span className="text-[10px] text-slate-450 dark:text-slate-500">Gifts boost streamer priority</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {giftOptions.map(g => {
                    const GiftIcon = g.icon;
                    return (
                      <button
                        key={g.label}
                        onClick={() => handleSendGift(g.label, g.cost)}
                        className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-955 dark:hover:bg-slate-950/60 rounded-xl border border-slate-205 dark:border-slate-800 text-left transition-all hover:scale-[1.01] cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <GiftIcon size={16} className={g.color} />
                          <span className="text-[9px] text-slate-500 uppercase font-bold font-mono">{g.cost}</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-800 dark:text-slate-200 mt-1">{g.label}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* BROADCASTER PANEL TERMINATE HOOKS */}
            {broadcastingStream && broadcastingStream.id === activeWatchStreamId && (
              <div className="p-4 bg-rose-50 dark:bg-red-950/10 border border-rose-100 dark:border-red-900/20 rounded-2xl flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-xs font-bold text-rose-600 dark:text-red-400 font-mono">Broadcaster Controller active</p>
                  <p className="text-[10px] text-slate-550 dark:text-slate-500">Disconnect RTMP pipeline and close room</p>
                </div>
                <button
                  onClick={handleEndStream}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-rose-605 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  <StopCircle size={14} />
                  <span>Terminate Stream</span>
                </button>
              </div>
            )}

          </div>
        ) : (
          /* GO LIVE & LAUNCH CENTER PANEL */
          <div className="space-y-6">
            
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm dark:shadow-xl flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-cyan-500/10 text-blue-600 dark:text-cyan-404 flex items-center justify-center shrink-0">
                <Tv size={36} />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 font-sans">Broadcast Center Platform</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Ready to link and stream? Connect with your local camera node or RTMP client to beam live video outputs and accumulate virtual gifts on-the-fly!
                </p>
              </div>
            </div>

            {/* BROADCAST FORM */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-xl space-y-4">
              <h3 className="font-bold text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono font-sans">Go LIVE configuration center</h3>
              <form onSubmit={handleGoLiveSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold tracking-wider uppercase text-slate-450 dark:text-slate-500 font-mono">Stream Title</label>
                  <input
                    id="new-stream-title"
                    type="text"
                    placeholder="e.g. Building custom web apps from my backyard 🛠️🎧"
                    value={broadcasterTitle}
                    onChange={(e) => setBroadcasterTitle(e.target.value)}
                    required
                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-xl outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
                  />
                </div>

                <button
                  id="go-live-submit-btn"
                  type="submit"
                  disabled={!broadcasterTitle.trim()}
                  className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  <Radio size={12} className="animate-pulse" />
                  <span>Establish Secure RTMP Broadcast</span>
                </button>
              </form>
            </div>

            {/* SYSTEM LATENCY METRICS */}
            <div className="grid grid-cols-2 gap-4 animate-fade-in">
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-450 dark:text-slate-500 tracking-wider font-mono">HLS Playback Latency</span>
                <p className="text-xl font-mono font-bold text-blue-600 dark:text-cyan-400">42ms</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-955 border border-slate-150 dark:border-slate-850 rounded-2xl text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-450 dark:text-slate-500 tracking-wider font-mono">Active Ingress Servers</span>
                <p className="text-xl font-mono font-bold text-blue-600 dark:text-indigo-400 font-mono">Tokyo / SGP</p>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* RIGHT COLUMN: ACTIVE CHANNELS OR STREAM CHAT */}
      <div className="space-y-6">
        
        {activeStreamData ? (
          /* ACTIVE THEATER LIVE CHAT MESSAGING */
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-xl flex flex-col h-[calc(100vh-9rem)]">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">
              <div className="flex items-center gap-1.5 text-blue-600 dark:text-cyan-400 font-bold font-mono">
                <Radio size={12} className="animate-pulse" />
                <h4 className="font-bold text-[10px] uppercase tracking-wider">Live Chat Pipeline</h4>
              </div>
              <span className="text-[9px] bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded-full text-slate-500 font-mono">Auto Refresh</span>
            </div>

            {/* Chat list */}
            <div className="flex-1 overflow-y-auto space-y-2.5 mb-3 divide-y divide-slate-100 dark:divide-slate-800/20 pr-1 select-text">
              {activeStreamData.comments.map(c => (
                <div key={c.id} className="pt-2 text-xs">
                  <div className="flex gap-2 items-start">
                    <img src={c.profilePicture} className="w-5.5 h-5.5 rounded-full object-cover shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-700 dark:text-slate-350">@{c.username}</p>
                      
                      {/* Render gift callouts with unique styling */}
                      {c.gift ? (
                        <p className="text-xs font-bold text-amber-700 dark:text-amber-400 p-1.5 bg-amber-50 dark:bg-yellow-950/20 rounded-lg border border-amber-100 dark:border-yellow-850/10 mt-0.5 animate-pulse">
                          🎁 sent {c.gift}
                        </p>
                      ) : (
                        <p className="text-slate-600 dark:text-slate-400 text-xs mt-0.5">{c.comment}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Direct Message Input */}
            <form onSubmit={handleSendChat} className="flex gap-1.5 border-t border-slate-100 dark:border-slate-850 pt-3">
              <input
                id="stream-chat-input"
                type="text"
                placeholder="Send positive comment..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-820 px-3 py-2 rounded-xl outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500"
              />
              <button
                id="stream-chat-send-btn"
                type="submit"
                disabled={!chatInput.trim()}
                className="px-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                Send
              </button>
            </form>

          </div>
        ) : (
          /* GENERAL LOBBY LIST OF STREAM TARGETS */
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-xl space-y-4 animate-fade-in">
            
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-400 font-mono">Discover Active Broadcasts</h3>
              <button 
                onClick={fetchStreams} 
                className="p-1 rounded text-slate-450 dark:text-slate-500 hover:text-blue-600 dark:hover:text-white transition-colors cursor-pointer"
                title="Refresh listings"
              >
                <RefreshCw size={12} />
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="animate-spin text-blue-600 dark:text-cyan-500" size={18} />
              </div>
            ) : streams.length === 0 ? (
              <p className="text-xs text-slate-500 italic text-center py-4">No active broadcasts. Be the first explorer to go live!</p>
            ) : (
              <div className="space-y-3.5">
                {streams.map(stream => (
                  <div 
                    key={stream.id}
                    id={`active-stream-item-${stream.id}`}
                    onClick={() => {
                      setActiveWatchStreamId(stream.id);
                      setActiveStreamData(stream);
                    }}
                    className="p-3 bg-slate-5/50 hover:bg-slate-100/50 dark:bg-slate-950/60 dark:hover:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl cursor-pointer transition-all hover:scale-[1.01] space-y-2.5 text-left"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <img src={stream.streamerPicture} alt="" className="w-5.5 h-5.5 rounded-full object-cover" />
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-350">@{stream.streamerName}</span>
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold uppercase tracking-wider border ${
                        stream.status === 'live' ? 'bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/10' : 'bg-slate-100 dark:bg-slate-800 text-slate-505 dark:text-slate-400 border-slate-200 dark:border-slate-750'
                      }`}>
                        {stream.status}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold leading-tight text-slate-800 dark:text-slate-100">{stream.title}</h4>

                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                      <span>{stream.viewersCount} active viewers</span>
                      <span className="text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-1 font-bold">
                        <Play size={8} /> Enter Stage
                      </span>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
}
