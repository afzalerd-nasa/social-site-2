import React, { useState, useEffect } from 'react';
import { 
  Users, Pin, Compass, Search, PlusCircle, MessageCircle, BarChart, 
  Check, CheckCircle2, ChevronRight, BookOpen, Vote, HelpCircle, Loader2
} from 'lucide-react';
import { Community, ForumPost, Poll, User } from '../types';

interface CommunitiesViewProps {
  currentUser: User | null;
}

export default function CommunitiesView({ currentUser }: CommunitiesViewProps) {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCommId, setActiveCommId] = useState<string | null>('comm_1'); // default WebDev Wizards

  // Selection details
  const [communityData, setCommunityData] = useState<Community | null>(null);

  // Group forum thread submission
  const [forumTitle, setForumTitle] = useState('');
  const [forumContent, setForumContent] = useState('');
  const [forumCategory, setForumCategory] = useState('General');
  const [submittingThread, setSubmittingThread] = useState(false);

  // Poll creation
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);

  useEffect(() => {
    fetchCommunities();
  }, []);

  useEffect(() => {
    if (activeCommId) {
      const match = communities.find(c => c.id === activeCommId);
      if (match) setCommunityData(match);
    }
  }, [communities, activeCommId]);

  const fetchCommunities = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/communities');
      if (res.ok) {
        const data = await res.json();
        setCommunities(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinToggle = async (commId: string) => {
    try {
      const res = await fetch(`/api/communities/${commId}/join`, { method: 'POST' });
      if (res.ok) {
        await fetchCommunities();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateThreadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forumTitle.trim() || !forumContent.trim() || !activeCommId) return;

    setSubmittingThread(true);
    try {
      const res = await fetch(`/api/communities/${activeCommId}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: forumTitle,
          content: forumContent,
          category: forumCategory
        })
      });

      if (res.ok) {
        setForumTitle('');
        setForumContent('');
        setForumCategory('General');
        await fetchCommunities();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingThread(false);
    }
  };

  const handleVoteSubmit = async (pollId: string, optionId: string) => {
    if (!activeCommId) return;

    try {
      const res = await fetch(`/api/communities/${activeCommId}/polls/${pollId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId })
      });

      if (res.ok) {
        await fetchCommunities();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const filteredOpts = pollOptions.filter(o => o.trim());
    if (!pollQuestion.trim() || filteredOpts.length < 2 || !activeCommId) return;

    try {
      const res = await fetch(`/api/communities/${activeCommId}/polls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: pollQuestion,
          options: filteredOpts
        })
      });

      if (res.ok) {
        setPollQuestion('');
        setPollOptions(['', '']);
        alert('Dynamic poll set established successfully!');
        await fetchCommunities();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-slate-100 max-w-6xl mx-auto">
      
      {/* SIDI BAR LOBBY LIST OP COMMUNITIES */}
      <div className="space-y-4">
        
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-3">
          <h3 className="font-extrabold text-xs uppercase tracking-widest text-slate-400">Discover Groups</h3>
          
          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="animate-spin text-cyan-500" size={16} />
            </div>
          ) : (
            <div className="space-y-2.5">
              {communities.map(comm => {
                const isSelected = activeCommId === comm.id;
                return (
                  <div 
                    key={comm.id}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-slate-950 border-cyan-500/40 text-white' 
                        : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-950/40 text-slate-300'
                    }`}
                    onClick={() => {
                      setActiveCommId(comm.id);
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold">{comm.name}</h4>
                      <span className="text-[9px] px-1.5 py-0.2 bg-slate-800 rounded text-slate-400 uppercase font-mono">{comm.category}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 lines-clamp-2 truncate">{comm.description}</p>
                    <div className="flex items-center justify-between text-[9px] text-slate-400 mt-2">
                      <span>{comm.membersCount} active members</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoinToggle(comm.id);
                        }}
                        className={`px-2 py-0.5 rounded font-bold ${
                          comm.isJoinedByMe 
                            ? 'bg-emerald-500/10 text-emerald-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors' 
                            : 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20'
                        }`}
                      >
                        {comm.isJoinedByMe ? 'Joined' : 'Join'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

      {/* CENTER & MAIN COMM PANEL DETAILS */}
      <div className="lg:col-span-2 space-y-6">
        
        {communityData ? (
          <div className="space-y-6">
            
            {/* Banner card */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 p-5 shadow-xl h-44 flex flex-col justify-end">
              <div className="absolute inset-0">
                <img src={communityData.banner} className="w-full h-full object-cover filter brightness-[0.3]" />
              </div>

              <div className="relative z-10 space-y-1">
                <span className="text-[9px] px-2 py-0.5 uppercase bg-cyan-500 text-black font-extrabold tracking-widest rounded-full">{communityData.category} Sphere</span>
                <h2 className="text-lg font-extrabold">{communityData.name}</h2>
                <p className="text-xs text-slate-300 leading-snug">{communityData.description}</p>
              </div>
            </div>

            {/* DYNAMIC FORUM SECTIONS */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <h3 className="font-extrabold text-xs uppercase tracking-widest text-slate-400">Discussion threads</h3>
                <span className="text-[10px] text-slate-500">{communityData.forumPosts?.length || 0} discussion threads</span>
              </div>

              <div className="space-y-3.5 divide-y divide-slate-800/10 dark:divide-slate-800">
                {(!communityData.forumPosts || communityData.forumPosts.length === 0) ? (
                  <p className="text-xs text-slate-500 italic text-center py-4">Nothing posted here yet. Initiate the first discussion thread!</p>
                ) : (
                  communityData.forumPosts.map(fpost => (
                    <div key={fpost.id} className="pt-3.5 space-y-2">
                      <div className="flex items-center gap-2">
                        <img src={fpost.authorPicture} alt="" className="w-5 h-5 rounded-full object-cover" />
                        <span className="text-[10px] font-bold text-slate-300">@{fpost.authorName} &bull; {new Date(fpost.createdAt).toLocaleDateString()}</span>
                        <span className="text-[9px] ml-auto px-1.5 py-0.2 bg-slate-950 border border-slate-800 text-cyan-400 rounded-full font-mono">{fpost.category}</span>
                      </div>
                      <h4 className="text-xs font-bold hover:underline select-text">{fpost.title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed max-h-24 overflow-y-auto pr-1 select-text whitespace-pre-wrap">{fpost.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* CREATE DISCUSSION FORM */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-widest text-slate-400">Launch New Discussion</h4>
              <form onSubmit={handleCreateThreadSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <input
                      id="f-thread-title"
                      type="text"
                      placeholder="Title of discussion thread..."
                      value={forumTitle}
                      onChange={(e) => setForumTitle(e.target.value)}
                      required
                      className="w-full text-xs bg-slate-950 border border-slate-820 px-3 py-2 rounded-xl outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <select
                      id="f-thread-category"
                      value={forumCategory}
                      onChange={(e) => setForumCategory(e.target.value)}
                      className="w-full text-xs bg-slate-950 border border-slate-820 px-3 py-2 rounded-xl outline-none"
                    >
                      <option value="General">General</option>
                      <option value="Discussion">Discussion</option>
                      <option value="Research">Research</option>
                      <option value="Inquiry">Inquiry</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <textarea
                    id="f-thread-content"
                    placeholder="Enter thorough content or details..."
                    value={forumContent}
                    onChange={(e) => setForumContent(e.target.value)}
                    required
                    className="w-full text-xs bg-slate-950 border border-slate-820 px-3 py-2 rounded-xl outline-none h-20 resize-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    id="submit-f-thread-btn"
                    type="submit"
                    disabled={submittingThread || !forumTitle.trim() || !forumContent.trim()}
                    className="px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-xs font-bold text-white flex items-center gap-1 hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    {submittingThread && <Loader2 size={12} className="animate-spin" />}
                    <span>Post Thread</span>
                  </button>
                </div>
              </form>
            </div>

            {/* INTERACTIVE POLL PANEL */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <div className="flex items-center gap-1 text-cyan-400">
                  <Vote size={14} />
                  <h3 className="font-extrabold text-xs uppercase tracking-widest">Active Community Polls</h3>
                </div>
              </div>

              <div className="space-y-5">
                {(!communityData.polls || communityData.polls.length === 0) ? (
                  <p className="text-xs text-slate-500 italic text-center">No polls are currently seeking votes.</p>
                ) : (
                  communityData.polls.map(poll => {
                    const votedOption = poll.votedOptionId;
                    return (
                      <div key={poll.id} className="p-3 bg-slate-950/60 rounded-xl border border-slate-850 space-y-3 shadow">
                        <div className="flex gap-1.5 items-start">
                          <HelpCircle size={14} className="text-cyan-500 shrink-0 mt-0.5" />
                          <h4 className="text-xs font-bold text-slate-100">{poll.question}</h4>
                        </div>
                        
                        {/* Option outputs */}
                        <div className="space-y-2">
                          {poll.options.map(opt => {
                            const percent = poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0;
                            const isVoted = votedOption === opt.id;
                            
                            return (
                              <div key={opt.id} className="relative">
                                <button
                                  type="button"
                                  onClick={() => handleVoteSubmit(poll.id, opt.id)}
                                  disabled={!!votedOption}
                                  className="w-full text-left text-xs p-2.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-850/80 transition-all flex items-center justify-between relative z-10 disabled:cursor-default"
                                >
                                  <span className="flex items-center gap-2">
                                    {isVoted && <CheckCircle2 size={12} className="text-emerald-400" />}
                                    <span className={isVoted ? 'font-bold text-emerald-400' : ''}>{opt.text}</span>
                                  </span>
                                  <span className="text-[10px] font-mono text-slate-400">{opt.votes} votes &bull; {percent}%</span>
                                </button>
                                
                                {/* Graphical result progress fill */}
                                <div 
                                  className={`absolute inset-y-0 left-0 rounded-lg transition-all ${
                                    isVoted ? 'bg-emerald-500/10' : 'bg-cyan-500/5'
                                  }`} 
                                  style={{ width: `${percent}%`, zIndex: 1 }}
                                />
                              </div>
                            );
                          })}
                        </div>

                        <p className="text-[9px] text-slate-500 font-mono text-right">{poll.totalVotes} aggregate votes</p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* CREATE POLL FORM */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-widest text-slate-400">Launch New Poll</h4>
              <form onSubmit={handleCreatePollSubmit} className="space-y-3">
                <div className="space-y-1">
                  <input
                    id="new-poll-question"
                    type="text"
                    placeholder="Enter the survey question here..."
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    required
                    className="w-full text-xs bg-slate-950 border border-slate-820 px-3 py-2 rounded-xl outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    id="new-poll-opt-1"
                    type="text"
                    placeholder="Option 1"
                    value={pollOptions[0]}
                    onChange={(e) => {
                      const updated = [...pollOptions];
                      updated[0] = e.target.value;
                      setPollOptions(updated);
                    }}
                    required
                    className="text-xs bg-slate-950 border border-slate-820 px-3 py-2 rounded-xl outline-none"
                  />
                  <input
                    id="new-poll-opt-2"
                    type="text"
                    placeholder="Option 2"
                    value={pollOptions[1]}
                    onChange={(e) => {
                      const updated = [...pollOptions];
                      updated[1] = e.target.value;
                      setPollOptions(updated);
                    }}
                    required
                    className="text-xs bg-slate-950 border border-slate-820 px-3 py-2 rounded-xl outline-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    id="submit-poll-btn"
                    type="submit"
                    disabled={!pollQuestion.trim() || !pollOptions[0].trim() || !pollOptions[1].trim()}
                    className="px-4 py-1.5 bg-slate-850 hover:bg-slate-800 hover:text-white text-cyan-400 rounded-xl text-xs font-bold transition-all"
                  >
                    Establish Poll
                  </button>
                </div>
              </form>
            </div>

          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500 bg-slate-900 rounded-2xl h-80">
            <Users size={36} className="text-cyan-500 mb-2 animate-bounce" />
            <p className="font-semibold text-slate-200">Interactive Community Hubs</p>
            <p className="text-xs mt-1">Select an active group on the left panel to engage in forum lists and polls.</p>
          </div>
        )}

      </div>

    </div>
  );
}
