import React, { useState, useEffect } from 'react';
import { 
  Heart, MessageCircle, Share2, Bookmark, Flame, Sparkles, Send, 
  Image as ImageIcon, Film, Hash, AlertTriangle, Check, Loader2, RefreshCw
} from 'lucide-react';
import { Post, Comment, User } from '../types';

interface FeedViewProps {
  currentUser: User | null;
  searchQuery: string;
}

export default function FeedView({ currentUser, searchQuery }: FeedViewProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newContent, setNewContent] = useState('');
  const [selectedMediaUrl, setSelectedMediaUrl] = useState('');
  const [selectedMediaType, setSelectedMediaType] = useState<'image' | 'video' | 'none'>('none');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  
  // Reporting states
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportStatus, setReportStatus] = useState<Record<string, 'idle' | 'loading' | 'done'>>({});

  // Recommendation states
  const [fetchingAiPost, setFetchingAiPost] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Quick Photo Templates to let users easily create beautiful image-posts
  const photoTemplates = [
    { label: 'Workstation 💻', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80' },
    { label: 'Coffee Sunset ☕', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80' },
    { label: 'Mountains 🏔️', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80' },
    { label: 'Gaming setup 🔮', url: 'https://images.unsplash.com/photo-1600861195091-690c92f1d2cc?w=600&auto=format&fit=crop&q=80' }
  ];

  useEffect(() => {
    fetchPosts();
  }, [searchQuery, selectedTag]);

  const fetchPosts = async (getAiRecommend: boolean = false) => {
    setLoading(true);
    try {
      let url = '/api/posts';
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedTag) params.append('tag', selectedTag);
      if (getAiRecommend) params.append('recommend', 'true');
      
      const res = await fetch(`${url}?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim() && !selectedMediaUrl) return;

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newContent,
          mediaUrl: selectedMediaUrl || null,
          mediaType: selectedMediaType === 'none' ? 'none' : selectedMediaType
        })
      });

      if (res.ok) {
        const newlyCreated = await res.json();
        setPosts(prev => [newlyCreated, ...prev]);
        setNewContent('');
        setSelectedMediaUrl('');
        setSelectedMediaType('none');
      }
    } catch (err) {
      console.error('Error creating post:', err);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
      if (res.ok) {
        const updated = await res.json();
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, likesCount: updated.likesCount, isLikedByMe: updated.isLikedByMe } : p));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentSubmit = async (postId: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    try {
      const res = await fetch(`/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text })
      });

      if (res.ok) {
        const newComment = await res.json();
        setPosts(prev => prev.map(p => {
          if (p.id === postId) {
            return {
              ...p,
              commentsCount: p.commentsCount + 1,
              comments: [...(p.comments || []), newComment]
            };
          }
          return p;
        }));
        setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReportPost = async (postId: string) => {
    if (!reportReason.trim()) return;
    setReportStatus(prev => ({ ...prev, [postId]: 'loading' }));

    try {
      const res = await fetch(`/api/posts/${postId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reportReason })
      });

      if (res.ok) {
        setReportStatus(prev => ({ ...prev, [postId]: 'done' }));
        setTimeout(() => {
          setReportingPostId(null);
          setReportReason('');
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setReportStatus(prev => ({ ...prev, [postId]: 'idle' }));
    }
  };

  const requestAiRecommendation = async () => {
    setFetchingAiPost(true);
    await fetchPosts(true);
    setFetchingAiPost(false);
  };

  // Trending hash tags simulation
  const trendingTags = ['AI', 'Web3', 'Privacy', 'travel', 'wilderness', 'Welcome', 'Community'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* LEFT & CENTER FEED PANEL */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* CREATE POST INPUT */}
        {currentUser && (
          <div className="p-4 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl text-slate-900 dark:text-slate-100">
            <div className="flex gap-3">
              <img
                src={currentUser.profilePicture}
                alt={currentUser.displayName}
                className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-800"
              />
              <div className="flex-1">
                <textarea
                  id="feed-post-textarea"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder={`What is on your mind, ${currentUser.displayName}? Write something to your feed or add a hashtag #Privacy...`}
                  className="w-full text-sm bg-transparent border-0 outline-none focus:ring-0 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 resize-none h-20"
                />
                
                {/* Media preview */}
                {selectedMediaUrl && (
                  <div className="relative mt-3 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800">
                    <img src={selectedMediaUrl} alt="Preview attachment" className="w-full max-h-48 object-cover" />
                    <button 
                      onClick={() => { setSelectedMediaUrl(''); setSelectedMediaType('none'); }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-950/80 hover:bg-slate-900 text-rose-500 text-xs"
                    >
                      Clear
                    </button>
                  </div>
                )}

                {/* Photo selection suggestions */}
                <div className="mt-3">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold mb-1.5">Add premium graphic theme:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {photoTemplates.map((template, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSelectedMediaUrl(template.url);
                          setSelectedMediaType('image');
                        }}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                          selectedMediaUrl === template.url 
                            ? 'bg-blue-50 border-blue-600 text-blue-600 dark:bg-cyan-500/10 dark:border-cyan-500 dark:text-cyan-400 font-medium' 
                            : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        {template.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/65">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      title="Attach Image"
                      onClick={() => {
                        setSelectedMediaUrl('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80');
                        setSelectedMediaType('image');
                      }}
                      className="p-2 text-blue-600 dark:text-cyan-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-lg transition-all cursor-pointer"
                    >
                      <ImageIcon size={18} />
                    </button>
                    <button
                      type="button"
                      title="Attach Video Stream"
                      onClick={() => {
                        setSelectedMediaUrl('https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80');
                        setSelectedMediaType('video');
                      }}
                      className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-lg transition-all cursor-pointer"
                    >
                      <Film size={18} />
                    </button>
                  </div>

                  <button
                    id="submit-new-post-btn"
                    onClick={handleCreatePost}
                    disabled={!newContent.trim() && !selectedMediaUrl}
                    className="flex items-center gap-2 px-4 py-1.5 text-xs text-white rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-all font-semibold cursor-pointer"
                  >
                    <Send size={12} />
                    <span>Post Sphere</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FEED SEPARATOR OR TAG TITLE */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-widest text-slate-400 uppercase">
            {selectedTag ? `#${selectedTag} Feed` : (searchQuery ? `Search Results: "${searchQuery}"` : 'News Feed')}
          </h2>
          
          {selectedTag && (
            <button 
              onClick={() => setSelectedTag(null)} 
              className="text-xs text-cyan-500 hover:underline"
            >
              Clear Tag Filter
            </button>
          )}
        </div>

        {/* FEED POSTS ITEMS LIST */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <Loader2 className="animate-spin text-blue-600 dark:text-cyan-500" size={32} />
            <p className="text-xs text-slate-500 mt-2">Harmonizing Feed Nodes...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-550">
            <Sparkles size={24} className="mx-auto text-blue-600 dark:text-cyan-400 mb-2 opacity-55 animate-pulse" />
            <p className="font-semibold text-sm">Prism complete. No matching posts found!</p>
            <p className="text-xs mt-1">Be the first to share your mind on this topic!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map(post => (
              <article 
                key={post.id} 
                id={`post-card-${post.id}`}
                className="p-5 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 space-y-4 shadow-sm dark:shadow-xl text-slate-900 dark:text-slate-100 nav-target"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src={post.profilePicture} 
                      alt={post.displayName} 
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800/20" 
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{post.displayName}</span>
                        {post.isVerified && (
                          <span className="text-[9px] px-1.5 py-0.2 bg-blue-50 dark:bg-cyan-500/10 text-blue-600 dark:text-cyan-400 rounded-full font-extrabold tracking-tighter">verified</span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 font-mono">@{post.username} &bull; {new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <button
                    id={`report-btn-${post.id}`}
                    onClick={() => setReportingPostId(reportingPostId === post.id ? null : post.id)}
                    className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-rose-500 dark:hover:text-rose-400 transition-all cursor-pointer"
                    title="Report Inappropriate Content"
                  >
                    <AlertTriangle size={14} />
                  </button>
                </div>

                {/* Report Form Popup */}
                {reportingPostId === post.id && (
                  <div className="p-3 bg-red-950/20 rounded-xl border border-rose-900/30 text-xs">
                    <p className="font-semibold text-rose-400 mb-1">Report Violation Policy</p>
                    {reportStatus[post.id] === 'done' ? (
                      <p className="text-emerald-400 font-bold flex items-center gap-1">
                        <Check size={12} /> Filed successfully. Admin moderators notified.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        <input
                          id={`report-input-${post.id}`}
                          type="text"
                          placeholder="e.g. Hate speech, abusive language, spam cryptocurrency"
                          value={reportReason}
                          onChange={(e) => setReportReason(e.target.value)}
                          className="w-full bg-slate-950 px-2 py-1.5 rounded border border-slate-800 focus:ring-1 focus:ring-rose-500 text-xs outline-none"
                        />
                        <div className="flex gap-2 justify-end">
                          <button 
                            onClick={() => setReportingPostId(null)}
                            className="px-2.5 py-1 text-[10px] text-slate-400 hover:text-white"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={() => handleReportPost(post.id)}
                            disabled={!reportReason.trim() || reportStatus[post.id] === 'loading'}
                            className="px-3 py-1 text-[10px] bg-rose-600 text-white rounded hover:bg-rose-500 disabled:opacity-50 flex items-center gap-1 font-semibold"
                          >
                            {reportStatus[post.id] === 'loading' && <Loader2 size={10} className="animate-spin" />}
                            Submit Report
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Post Content */}
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{post.content}</p>

                {/* Media item rendering */}
                {post.mediaUrl && post.mediaType !== 'none' && (
                  <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                    <img 
                      src={post.mediaUrl} 
                      alt="Post visual content" 
                      className="w-full max-h-96 object-cover" 
                      onClick={() => alert(`Visual node link template: ${post.mediaUrl}`)}
                    />
                  </div>
                )}

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.map(t => (
                      <button 
                        key={t}
                        onClick={() => setSelectedTag(t)}
                        className="text-xs text-blue-600 dark:text-cyan-400 hover:underline flex items-center"
                      >
                        <Hash size={10} />
                        {t}
                      </button>
                    ))}
                  </div>
                )}

                {/* Action Controls Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/40 text-slate-500 dark:text-slate-400 text-xs text-mono">
                  <button 
                    id={`like-btn-${post.id}`}
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-1.5 hover:text-rose-500 transition-colors ${post.isLikedByMe ? 'text-rose-500 font-bold' : ''}`}
                  >
                    <Heart size={16} fill={post.isLikedByMe ? 'currentColor' : 'none'} />
                    <span>{post.likesCount}</span>
                  </button>

                  <button 
                    id={`comment-trigger-${post.id}`}
                    onClick={() => setActiveCommentsPostId(activeCommentsPostId === post.id ? null : post.id)}
                    className="flex items-center gap-1.5 hover:text-amber-600 dark:hover:text-amber-500 transition-colors"
                  >
                    <MessageCircle size={16} />
                    <span>{post.commentsCount} Comments</span>
                  </button>

                  <button 
                    onClick={() => alert('Visual stream link copied to server clipboard! Share with friends.')}
                    className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-cyan-500 transition-colors"
                  >
                    <Share2 size={16} />
                    <span>Share</span>
                  </button>
                </div>

                {/* Comments Container */}
                {activeCommentsPostId === post.id && (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/30 space-y-3">
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 divide-y divide-slate-100 dark:divide-slate-800">
                      {(!post.comments || post.comments.length === 0) ? (
                        <p className="text-xs text-slate-500 italic text-center py-2">No comments yet. Spread positivity and start conversation!</p>
                      ) : (
                        post.comments.map(c => (
                          <div key={c.id} className="pt-2.5 flex gap-2 text-xs">
                            <img src={c.profilePicture} alt={c.displayName} className="w-6 h-6 rounded-full object-cover" />
                            <div className="flex-1 bg-slate-50 dark:bg-slate-950 p-2 rounded-lg">
                              <p className="font-bold text-slate-800 dark:text-slate-200">{c.displayName} <span className="text-[10px] text-slate-500 font-mono">@{c.username}</span></p>
                              <p className="text-slate-600 dark:text-slate-300 mt-1">{c.content}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* New comment input */}
                    <div className="flex gap-2">
                      <input
                        id={`comment-input-${post.id}`}
                        type="text"
                        placeholder="Join the discussion sphere..."
                        value={commentInputs[post.id] || ''}
                        onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCommentSubmit(post.id);
                        }}
                        className="flex-1 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 px-3 py-1.5 rounded-lg outline-none focus:border-blue-500"
                      />
                      <button
                        id={`submit-comment-${post.id}`}
                        onClick={() => handleCommentSubmit(post.id)}
                        className="px-3 bg-blue-600 hover:bg-blue-700 text-white dark:bg-slate-800 dark:text-cyan-400 rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                )}

              </article>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT SIDEBAR PANEL */}
      <div className="space-y-6">
        
        {/* RECOMMENDED ENGINE CARD */}
        <div className="p-4 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl space-y-4 text-slate-900 dark:text-slate-100">
          <div className="flex items-center gap-2 text-blue-600 dark:text-cyan-400 font-bold">
            <Sparkles size={18} className="animate-spin" style={{ animationDuration: '4s' }} />
            <h3 className="font-bold text-sm uppercase tracking-wider">Gemini Feed Agent</h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Need inspiration or curated intelligence? Let Gemini generate a trending suggestion post inside your local feed panel using real-time policy guidelines.
          </p>
          <button
            id="ai-recommendation-trigger-btn"
            onClick={requestAiRecommendation}
            disabled={fetchingAiPost}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs text-slate-700 hover:text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-850/80 rounded-xl border border-slate-200 dark:border-slate-800 transition-all font-semibold cursor-pointer"
          >
            {fetchingAiPost ? (
              <>
                <Loader2 size={12} className="animate-spin text-blue-600 dark:text-cyan-400" />
                <span>Interfacing LLM Model...</span>
              </>
            ) : (
              <>
                <Flame size={12} className="text-amber-500" />
                <span>Draft Gemini Recommended Post</span>
              </>
            )}
          </button>
        </div>

        {/* TRENDING TOPICS CARD */}
        <div className="p-4 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl space-y-3 text-slate-900 dark:text-slate-100">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Trending Sphere Tags</h3>
          <div className="flex flex-col gap-2">
            {trendingTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                  selectedTag === tag 
                    ? 'bg-blue-50 dark:bg-cyan-500/10 text-blue-600 dark:text-cyan-400 border border-blue-200/50 dark:border-cyan-500/20 font-bold' 
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-350'
                }`}
              >
                <span className="flex items-center gap-1">
                  <Hash size={12} className="text-blue-500 dark:text-cyan-500" />
                  <span className="font-semibold">{tag}</span>
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                  {Math.floor(Math.random() * 400 + 120)} nodes
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* GUIDELINES INFO */}
        <div className="p-4 rounded-2xl bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 space-y-2">
          <p>&bull; End-to-end local cryptos active</p>
          <p>&bull; Real-time peer networking powered by custom CJS node environments</p>
          <p>&bull; Press on profile photos to view account analytics reports</p>
        </div>

      </div>

    </div>
  );
}
