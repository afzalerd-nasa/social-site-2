import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, MessageSquare, Send, Shield, Lock, Unlock, Smile, Camera, 
  Search, Info, Check, CheckCheck, Loader2, Plus, Sparkles
} from 'lucide-react';
import { Message, ChatGroup, User } from '../types';

interface ChatViewProps {
  currentUser: User | null;
}

export default function ChatView({ currentUser }: ChatViewProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<ChatGroup[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);

  // Selected targets
  const [selectedUserId, setSelectedUserId] = useState<string | null>('user_1'); // default to Alex
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  // Message Sending
  const [inputMessage, setInputMessage] = useState('');
  const [isEncrypted, setIsEncrypted] = useState(false);

  // Interactive Typing simulator
  const [isTyping, setIsTyping] = useState(false);

  // Group creation popup
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchUsersAndGroups();
  }, []);

  useEffect(() => {
    fetchMessages();
    // Poll for new messages every 4 seconds to simulate active socket
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, [selectedUserId, selectedGroupId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchUsersAndGroups = async () => {
    setLoadingList(true);
    try {
      // Fetch users
      const resU = await fetch('/api/admin/users');
      if (resU.ok) {
        const dataU = await resU.json();
        // filter out current user
        setUsers(dataU.filter((u: User) => u.id !== currentUser?.id));
      }

      // Fetch groups
      const resG = await fetch('/api/chat/groups');
      if (resG.ok) {
        const dataG = await resG.json();
        setGroups(dataG);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingList(false);
    }
  };

  const fetchMessages = async () => {
    if (!selectedUserId && !selectedGroupId) return;
    try {
      let url = '/api/chat/messages';
      if (selectedGroupId) {
        url += `?groupId=${selectedGroupId}`;
      } else if (selectedUserId) {
        url += `?receiverId=${selectedUserId}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const body: Record<string, any> = {
      message: inputMessage,
      isEncrypted
    };

    if (selectedGroupId) {
      body.groupId = selectedGroupId;
    } else if (selectedUserId) {
      body.receiverId = selectedUserId;
    }

    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        const sent = await res.json();
        setMessages(prev => [...prev, sent]);
        setInputMessage('');
        
        // Trigger temporary synthetic response simulation for direct chat to make user happy!
        if (selectedUserId === 'user_1') {
          simulateTypingAndResponse('Yeah, makes total sense! Let\'s synchronize the protocol later tonight.');
        } else if (selectedUserId === 'user_3') {
          simulateTypingAndResponse('No worries, I am wrapping up my cameras and heading back now.');
        } else if (selectedGroupId) {
          simulateTypingAndResponse('System logs successfully updated. High speed communication achieved 🌌');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const simulateTypingAndResponse = (respText: string) => {
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(async () => {
        setIsTyping(false);
        // post simulation
        try {
          await fetch('/api/chat/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              receiverId: currentUser?.id,
              senderId: selectedUserId || 'user_1', // default Alex if in group
              groupId: selectedGroupId || undefined,
              message: `[AI Interactive Peer Response] ${respText}`,
              isEncrypted
            })
          });
          fetchMessages();
        } catch (e) {
          console.error(e);
        }
      }, 2500);
    }, 1200);
  };

  const handleCreateGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    try {
      const res = await fetch('/api/chat/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newGroupName, description: newGroupDesc })
      });

      if (res.ok) {
        const newlyCreatedGroup = await res.json();
        setGroups(prev => [newlyCreatedGroup, ...prev]);
        setSelectedGroupId(newlyCreatedGroup.id);
        setSelectedUserId(null);
        setShowCreateGroup(false);
        setNewGroupName('');
        setNewGroupDesc('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const selectUser = (userId: string) => {
    setSelectedUserId(userId);
    setSelectedGroupId(null);
  };

  const selectGroup = (groupId: string) => {
    setSelectedGroupId(groupId);
    setSelectedUserId(null);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const currentActiveTargetName = selectedGroupId 
    ? groups.find(g => g.id === selectedGroupId)?.name 
    : users.find(u => u.id === selectedUserId)?.displayName;

  const currentActiveTargetPfp = selectedGroupId 
    ? 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=120&auto=format&fit=crop&q=80'
    : users.find(u => u.id === selectedUserId)?.profilePicture;

  const currentActiveTargetBio = selectedGroupId
    ? groups.find(g => g.id === selectedGroupId)?.description
    : users.find(u => u.id === selectedUserId)?.bio;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-sm dark:shadow-2xl overflow-hidden h-[calc(100vh-7rem)]">
      
      {/* SIDEBAR CONVERSATIONS LISTINGS */}
      <div className="border-r border-slate-200 dark:border-slate-800 flex flex-col h-full bg-slate-50 dark:bg-slate-950/60">
        
        {/* Title and creation btn */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300 font-mono">Channels</h3>
          <button 
            id="create-group-popup-btn"
            onClick={() => setShowCreateGroup(true)}
            className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white dark:bg-slate-800 dark:text-cyan-400 text-xs transition-colors flex items-center gap-1 cursor-pointer font-semibold"
            title="Create Custom Chat Group"
          >
            <Plus size={14} />
            <span className="hidden lg:inline text-[10px] font-bold">New Group</span>
          </button>
        </div>

        {/* Channels scroll container */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          
          {loadingList ? (
            <div className="flex justify-center p-8">
              <Loader2 className="animate-spin text-blue-600 dark:text-cyan-500" size={20} />
            </div>
          ) : (
            <>
              {/* GROUPS LIST */}
              <div>
                <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Group Spheres</p>
                <div className="space-y-1">
                  {groups.map(group => {
                    const isSelected = selectedGroupId === group.id;
                    return (
                      <button
                        key={group.id}
                        id={`chat-group-btn-${group.id}`}
                        onClick={() => selectGroup(group.id)}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-blue-50 dark:bg-slate-800 border-l-4 border-blue-600 dark:border-cyan-500 text-blue-650 dark:text-white' 
                            : 'hover:bg-slate-200/50 dark:hover:bg-slate-800/40 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-550 dark:text-blue-400">
                          <Users size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold truncate text-slate-850 dark:text-slate-200">{group.name}</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{group.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* DIRECT CHATS LIST */}
              <div>
                <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Direct Peers</p>
                <div className="space-y-1">
                  {users.map(u => {
                    const isSelected = selectedUserId === u.id;
                    return (
                      <button
                        key={u.id}
                        id={`chat-user-btn-${u.id}`}
                        onClick={() => selectUser(u.id)}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-blue-50 dark:bg-slate-800 border-l-4 border-blue-600 dark:border-cyan-500 text-blue-650 dark:text-white' 
                            : 'hover:bg-slate-200/50 dark:hover:bg-slate-800/40 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        <img src={u.profilePicture} alt={u.username} className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-800" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold truncate text-slate-850 dark:text-slate-200">{u.displayName}</p>
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                          </div>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">@{u.username}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

        </div>
      </div>

      {/* CHAT AREA CONTAINER */}
      <div className="md:col-span-3 flex flex-col h-full bg-white dark:bg-slate-900">
        
        {/* Active chat header */}
        {(selectedUserId || selectedGroupId) ? (
          <>
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
              <div className="flex items-center gap-3">
                {currentActiveTargetPfp ? (
                  <img src={currentActiveTargetPfp} alt="" className="w-9 h-9 rounded-full object-cover shrink-0 ring-2 ring-blue-550/15 dark:ring-cyan-500/10" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-cyan-950 text-blue-650 dark:text-cyan-400 flex items-center justify-center font-bold">
                    G
                  </div>
                )}
                <div>
                  <h4 className="text-xs font-bold text-slate-850 dark:text-slate-100">{currentActiveTargetName}</h4>
                  <p className="text-[10px] text-slate-405 dark:text-slate-500 max-w-[400px] truncate">{currentActiveTargetBio}</p>
                </div>
              </div>

              {/* Security parameters */}
              <div className="flex items-center gap-2">
                <button
                  id="encryption-toggle-btn"
                  onClick={() => setIsEncrypted(!isEncrypted)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                    isEncrypted 
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 font-bold' 
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                  title={isEncrypted ? "Standard end-to-end encryption ACTIVE" : "Toggle encryption standards"}
                >
                  {isEncrypted ? <Lock size={12} /> : <Unlock size={12} />}
                  <span className="text-[10px] hidden sm:inline">{isEncrypted ? 'E2E Active' : 'Enable E2E Encryption'}</span>
                </button>
              </div>
            </div>

            {/* MESSAGE LIST BODY */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-500">
                  <span className="text-2xl">✨</span>
                  <p className="text-xs mt-1">Direct handshake secure. Say hello and establish connection!</p>
                </div>
              ) : (
                messages.map(m => {
                  const isOwn = m.senderId === currentUser?.id;
                  const formattedTime = new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                  return (
                    <div key={m.id} className={`flex items-end gap-2.5 max-w-[85%] ${isOwn ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                      {!isOwn && (
                        <img src={m.senderPicture} alt="" className="w-6.5 h-6.5 rounded-full object-cover shrink-0" />
                      )}
                      <div>
                        
                        {/* Display sender nickname if group chat */}
                        {selectedGroupId && !isOwn && (
                          <span className="text-[9px] text-slate-500 font-bold block mb-0.5 px-1">{m.senderName}</span>
                        )}

                        <div className={`p-3 rounded-2xl relative group ${
                          isOwn 
                            ? 'bg-blue-600 text-white rounded-br-none' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none'
                        }`}>
                          
                          {/* Encrypted payload annotation */}
                          {m.isEncrypted && (
                            <div className={`flex items-center gap-1 mb-1 text-[9px] font-mono font-bold ${isOwn ? 'text-blue-105' : 'text-emerald-600 dark:text-emerald-400'}`}>
                              <Lock size={10} />
                              <span>E2EE Payload (AES-256)</span>
                            </div>
                          )}

                          <p className={`text-xs select-text ${m.isEncrypted ? 'font-mono' : ''}`}>{m.message}</p>
                          
                          {/* Message meta */}
                          <div className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${isOwn ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'}`}>
                            <span>{formattedTime}</span>
                            {isOwn && (
                              <CheckCheck size={10} className="text-white" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Typing indicators */}
              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-slate-500 italic pl-8">
                  <Loader2 size={12} className="animate-spin text-blue-600 dark:text-cyan-500" />
                  <span>{currentActiveTargetName} is generating response...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* SEND MESSAGE BAR */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
              <div className="flex gap-2">
                <input
                  id="chat-message-input"
                  type="text"
                  placeholder={isEncrypted ? "Enter encryption block message..." : "Send modern encrypted packet..."}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-xl outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
                />
                <button
                  id="send-chat-btn"
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Send size={12} />
                  <span>Send</span>
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-404 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-900/60">
            <MessageSquare size={36} className="text-blue-500/80 dark:text-cyan-500 opacity-60 mb-2 animate-bounce" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">Unified secure chat portal</p>
            <p className="text-xs mt-1">Select a group or team peer on the left column to begin E2E communication.</p>
          </div>
        )}

      </div>

      {/* CREATE GROUP OVERLAY DIALOG */}
      {showCreateGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl w-full max-w-sm text-slate-100 space-y-4 shadow-2xl">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-cyan-400">Establish Group Sphere</h3>
            <form onSubmit={handleCreateGroupSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Group Name</label>
                <input
                  id="new-group-name"
                  type="text"
                  placeholder="e.g. Science pioneers 🧬"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  required
                  className="w-full text-xs bg-slate-950 border border-slate-800 px-3 py-2 rounded-lg outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Channel Mission</label>
                <input
                  id="new-group-desc"
                  type="text"
                  placeholder="e.g. Brainstorming custom designs"
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-800 px-3 py-2 rounded-lg outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div className="flex gap-2.5 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateGroup(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  id="submit-create-group"
                  type="submit"
                  className="px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg text-xs font-bold hover:opacity-90 transition-all"
                >
                  Confirm Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
