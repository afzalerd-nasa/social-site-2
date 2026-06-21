import React, { useState } from 'react';
import { 
  User as UserIcon, Camera, Edit2, Check, Award, MapPin, Link as LinkIcon, 
  Settings, Grid, Heart, MessageSquare, Loader2, Save, X
} from 'lucide-react';
import { User } from '../types';

interface ProfileViewProps {
  currentUser: User | null;
  onUpdateProfile: (updated: User) => void;
}

export default function ProfileView({ currentUser, onUpdateProfile }: ProfileViewProps) {
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [profilePicture, setProfilePicture] = useState(currentUser?.profilePicture || '');
  const [coverPhoto, setCoverPhoto] = useState(currentUser?.coverPhoto || '');
  const [loading, setLoading] = useState(false);

  if (!currentUser) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, bio, profilePicture, coverPhoto })
      });

      if (res.ok) {
        const updated = await res.json();
        onUpdateProfile(updated);
        setEditing(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPfpSelect = (url: string) => {
    setProfilePicture(url);
  };

  const handleQuickCoverSelect = (url: string) => {
    setCoverPhoto(url);
  };

  // Sample templates to make updating pfp interactive and extremely beautiful
  const avatarTemplates = [
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
  ];

  const coverTemplates = [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80'
  ];

  // Simulated grid posts
  const portfolioPosts = [
    { id: 'gp_1', title: 'System Designs', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&auto=format&fit=crop&q=80', likes: 142, comments: 22 },
    { id: 'gp_2', title: 'Sunset coding', url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&auto=format&fit=crop&q=80', likes: 389, comments: 14 },
    { id: 'gp_3', title: 'Coffee workspace', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80', likes: 95, comments: 8 }
  ];

  return (
    <div className="max-w-4xl mx-auto text-slate-100 space-y-6">
      
      {/* PROFESSIONAL PROFILE BANNER SECTION */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl">
        
        {/* Cover Photo */}
        <div className="h-48 md:h-60 relative w-full bg-slate-950">
          <img src={currentUser.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
          
          {editing && (
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center space-y-2 p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Quick Select New Cover:</span>
              <div className="flex gap-2">
                {coverTemplates.map((c, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleQuickCoverSelect(c)}
                    type="button"
                    className="w-16 h-10 rounded border border-white/20 overflow-hidden hover:scale-105 transition-all"
                  >
                    <img src={c} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Summary Deck */}
        <div className="px-6 pb-6 relative z-10 flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-10 gap-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
            
            {/* Profile Avatar */}
            <div className="relative w-28 h-28 rounded-full border-4 border-slate-900 overflow-hidden bg-slate-950 shrink-0 shadow-2xl">
              <img src={currentUser.profilePicture} alt={currentUser.displayName} className="w-full h-full object-cover" />
              {editing && (
                <div className="absolute inset-0 bg-black/60 flex flex-wrap items-center justify-center gap-1 p-1">
                  {avatarTemplates.map((av, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => handleQuickPfpSelect(av)}
                      type="button"
                      className="w-10 h-10 rounded-full border border-white/20 overflow-hidden"
                    >
                      <img src={av} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1 pt-4">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 flex-wrap">
                <h2 className="font-extrabold text-lg md:text-xl text-slate-100">{currentUser.displayName}</h2>
                {currentUser.isVerified && (
                  <span className="flex items-center gap-0.5 px-2 py-0.2 bg-cyan-500/10 text-cyan-400 rounded-full text-[9px] font-extrabold uppercase">
                    <Check size={8} /> Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-mono">@{currentUser.username}</p>
            </div>
          </div>

          <div className="flex justify-center sm:justify-end gap-3 shrink-0">
            {editing ? (
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 border border-slate-800 hover:bg-slate-850 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  id="save-profile-btn"
                  onClick={handleSave}
                  disabled={loading}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:opacity-90 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
                >
                  {loading ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                  <span>Save Changes</span>
                </button>
              </div>
            ) : (
              <button
                id="edit-profile-btn"
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-slate-850 hover:bg-slate-800 text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-2 border border-slate-800"
              >
                <Edit2 size={12} />
                <span>Edit biography</span>
              </button>
            )}
          </div>
        </div>

        {/* Biography Block */}
        <div className="px-6 pb-6 border-t border-slate-800/40 pt-4 text-xs space-y-3.5">
          {editing ? (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Display Nickname</label>
                <input
                  id="profile-edit-displayname"
                  type="text"
                  placeholder="Nick name..."
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Biography</label>
                <textarea
                  id="profile-edit-bio"
                  placeholder="Tell others about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl outline-none h-20 resize-none"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Bio</span>
                <p className="text-slate-300 leading-relaxed text-sm select-text whitespace-pre-wrap">{currentUser.bio || 'This user is mysterious and has not composed a biography yet.'}</p>
              </div>

              <div className="flex flex-wrap gap-4 text-[11px] text-slate-500 font-mono">
                <div className="flex items-center gap-1">
                  <MapPin size={12} />
                  <span>San Francisco, CA &bull; Active Node</span>
                </div>
                <div className="flex items-center gap-1">
                  <LinkIcon size={12} />
                  <a href="#" className="text-cyan-500 hover:underline">https://connectsphere.com/me</a>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* CORE STATS TILES */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-1 shadow">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Followers</span>
          <p className="text-lg font-extrabold text-slate-100">{currentUser.followersCount}</p>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-1 shadow">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Following</span>
          <p className="text-lg font-extrabold text-slate-100">{currentUser.followingCount}</p>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-1 shadow">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Account Status</span>
          <p className="text-sm font-bold text-emerald-400 capitalize">Verified Pristine</p>
        </div>
      </div>

      {/* PORTFOLIO SCRAPBOOK GRID */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-cyan-400 border-b border-slate-800 pb-2">
          <Grid size={16} />
          <h3 className="font-extrabold text-xs uppercase tracking-wider">Historical media uploads</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {portfolioPosts.map(gp => (
            <div 
              key={gp.id} 
              className="relative rounded-xl overflow-hidden group aspect-square border border-slate-800 bg-slate-950"
            >
              <img src={gp.url} alt="" className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 z-10 text-xs text-semibold">
                <span className="flex items-center gap-1 text-rose-500">
                  <Heart size={14} fill="currentColor" /> {gp.likes}
                </span>
                <span className="flex items-center gap-1 text-cyan-400">
                  <MessageSquare size={14} fill="currentColor" /> {gp.comments}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
