import React, { useState, useEffect } from 'react';
import { 
  Compass, MessageSquare, Video, Tv, Users, User, ShieldAlert,
  Search, Bell, LogOut, Moon, Sun, Menu, X, Check, CheckCheck, Loader2
} from 'lucide-react';
import { User as UserType, AppNotification } from '../types';

interface LayoutProps {
  currentUser: UserType | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  onSearch: (query: string) => void;
  children: React.ReactNode;
}

export default function Layout({ 
  currentUser, 
  activeTab, 
  setActiveTab, 
  onLogout, 
  onSearch,
  children 
}: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 12000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.ok ? await res.json() : [];
        setNotifications(data);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const markAllRead = async () => {
    setLoadingNotifs(true);
    try {
      const res = await fetch('/api/notifications/read-all', { method: 'POST' });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingNotifs(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const menuItems = [
    { id: 'feed', label: 'Feed', icon: Compass },
    { id: 'chat', label: 'Messages', icon: MessageSquare, badge: true },
    { id: 'calls', label: 'Voice & Video', icon: Video },
    { id: 'streams', label: 'Live Stream', icon: Tv, highlight: true },
    { id: 'communities', label: 'Communities', icon: Users },
    { id: 'profile', label: 'My Profile', icon: User },
  ];

  // If user is admin (or system account), expose the Admin Control panel
  if (currentUser?.role === 'admin') {
    menuItems.push({ id: 'admin', label: 'Admin Terminal', icon: ShieldAlert, highlight: false });
  }

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className={`min-h-screen font-sans transition-colors duration-150 ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-950'}`}>
      
      {/* HEADER BAR */}
      <header className={`sticky top-0 z-40 flex items-center justify-between border-b px-4 py-3 h-16 ${darkMode ? 'bg-slate-900/90 border-slate-800 backdrop-blur-md' : 'bg-white/90 border-slate-200 backdrop-blur-md'}`}>
        <div className="flex items-center gap-3">
          <button 
            id="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(prev => !prev)} 
            className={`p-2 rounded-lg md:hidden ${darkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('feed')}>
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-sm">
              <span>C</span>
              <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-emerald-500 border border-white dark:border-slate-900 rounded-full"></span>
            </div>
            <span className="hidden sm:inline font-bold text-xl tracking-tight text-slate-900 dark:text-white">
              ConnectSphere
            </span>
          </div>
        </div>

        {/* Global Search form */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center max-w-md w-full mx-8">
          <div className="relative w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <Search size={16} />
            </span>
            <input
              id="global-search-input"
              type="text"
              placeholder="Search posts, hashtags, discover communities..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                onSearch(e.target.value);
              }}
              className={`w-full text-xs pl-10 pr-4 py-2 rounded-full border focus:outline-none focus:ring-1 transition-all ${
                darkMode 
                  ? 'bg-slate-950 border-slate-800 text-slate-200 placeholder-slate-500 focus:ring-blue-500 focus:border-blue-500' 
                  : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-blue-500 focus:border-blue-500'
              }`}
            />
          </div>
        </form>

        <div className="flex items-center gap-3">
          {/* Light/Dark mode */}
          <button
            id="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-lg transition-all ${darkMode ? 'text-amber-400 hover:bg-slate-800' : 'text-indigo-600 hover:bg-slate-100'}`}
            title="Toggle theme mode"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              id="notification-dropdown-btn"
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              className={`relative p-2 rounded-lg evolution-fade ${darkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <Bell size={18} />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white animate-pulse">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Container */}
            {notifDropdownOpen && (
              <div className={`absolute right-0 mt-2 w-80 max-w-[90vw] h-96 rounded-xl border shadow-xl flex flex-col z-50 ${
                darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
              }`}>
                <div className="p-3 border-b flex items-center justify-between border-slate-800/10 dark:border-slate-800">
                  <h3 className="font-semibold text-sm">Sphere Notifications</h3>
                  {unreadNotificationsCount > 0 && (
                    <button 
                      onClick={markAllRead}
                      disabled={loadingNotifs}
                      className="text-xs text-cyan-500 hover:underline font-medium flex items-center gap-1"
                    >
                      {loadingNotifs ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                      Mark all read
                    </button>
                  )}
                </div>
                
                <div className="flex-1 overflow-y-auto divide-y divide-slate-800/5 dark:divide-slate-800">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full p-4 text-center text-slate-500">
                      <span className="text-2xl">✨</span>
                      <p className="text-xs mt-1">Your notification pipeline is currently pristine!</p>
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div 
                        key={notif.id} 
                        className={`p-3 text-xs flex gap-2 transition-colors ${
                          !notif.isRead 
                            ? (darkMode ? 'bg-slate-800/40 hover:bg-slate-800' : 'bg-slate-100 hover:bg-slate-200')
                            : (darkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50')
                        }`}
                        onClick={() => {
                          setNotifDropdownOpen(false);
                          if (notif.link) {
                            window.location.hash = notif.link;
                          }
                        }}
                      >
                        <div className="flex-1">
                          <p className="font-medium text-slate-300 dark:text-slate-200">
                            <span className="font-bold text-slate-900 dark:text-white">@{notif.senderName}</span> {notif.content}
                          </p>
                          <span className="text-[10px] text-slate-500 mt-1 block">
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-cyan-500 self-center"></span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Summary */}
          {currentUser && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800/10 dark:border-slate-800">
              <img
                src={currentUser.profilePicture}
                alt={currentUser.displayName}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-cyan-500/20"
                onClick={() => setActiveTab('profile')}
              />
              <div className="hidden lg:block text-left text-xs">
                <p className="font-bold max-w-[100px] truncate">{currentUser.displayName}</p>
                <p className="text-slate-500 capitalize">{currentUser.role} Mode</p>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* CORE WRAPPER */}
      <div className="flex max-w-7xl mx-auto min-h-[calc(100vh-4rem)]">
        
        {/* SIDEBAR NAVIGATION (Desktop) */}
        <aside className={`hidden md:flex flex-col justify-between w-64 p-4 border-r shrink-0 transition-all ${
          darkMode ? 'bg-slate-900/40 border-slate-900' : 'bg-white border-slate-200'
        }`}>
          <div className="space-y-6">
            <div className="px-2">
              <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase block">Sphere Menu</span>
            </div>
            
            <nav className="space-y-1">
              {menuItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`sidebar-nav-${item.id}`}
                    onClick={() => setActiveTab(item.id)}
                    className={`nav-menu-button w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      isActive
                        ? (darkMode ? 'bg-slate-800 text-blue-400 font-semibold' : 'bg-slate-100 text-blue-600 font-semibold')
                        : (darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900')
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} className={isActive ? (darkMode ? 'text-blue-400' : 'text-blue-600') : (item.highlight ? 'text-red-500' : 'text-slate-400')} />
                      <span>{item.label}</span>
                    </div>

                    {item.id === 'chat' && (
                      <span className="ml-auto text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">4</span>
                    )}

                    {item.highlight && !isActive && (
                      <span className="text-[10px] px-1.5 py-0.2 bg-red-100 text-red-500 dark:bg-rose-950/20 dark:text-rose-400 rounded font-bold uppercase">
                        Live
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Pro Plan Upgrade Block */}
          <div className="mt-auto px-1 py-3">
            <div className="bg-slate-900 rounded-xl p-4 text-white relative overflow-hidden">
              <p className="text-[10px] font-semibold opacity-65 uppercase tracking-wider mb-0.5">Pro Plan</p>
              <h4 className="text-xs font-bold mb-3">Unlock Analytics Suite</h4>
              <button 
                onClick={() => alert("Simulation Upgrade: Requesting Pro License Node allocation...")}
                className="w-full bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Upgrade to Pro
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <button
              id="sidebar-logout-btn"
              onClick={onLogout}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all font-medium`}
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
            <div className="px-3 text-[10px] text-slate-500 text-center">
              ConnectSphere v2.6.0 &bull; Secure Active Node
            </div>
          </div>
        </aside>

        {/* MAIN PANEL CONTENT */}
        <main className="flex-1 w-full overflow-hidden p-4 md:p-6">
          {children}
        </main>
      </div>

      {/* MOBILE NAV DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
          
          <div className={`relative flex flex-col justify-between w-64 max-w-[80vw] h-full p-4 shadow-2xl transition-transform ${
            darkMode ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'
          }`}>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="font-bold text-lg bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">ConnectSphere</span>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-1.5 rounded-lg ${darkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSearchSubmit} className="flex items-center">
                <div className="relative w-full">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Search size={14} />
                  </span>
                  <input
                    id="mobile-search-input"
                    type="text"
                    placeholder="Search sphere..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      onSearch(e.target.value);
                    }}
                    className={`w-full text-xs pl-9 pr-4 py-1.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                      darkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
              </form>

              <nav className="space-y-1">
                {menuItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                          : (darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100')
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={16} className={isActive ? 'text-white' : (item.highlight ? 'text-cyan-400' : '')} />
                        <span>{item.label}</span>
                      </div>
                      
                      {item.highlight && !isActive && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-bold uppercase animate-pulse">Live</span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-800/10 dark:border-slate-800 space-y-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-xs text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all font-medium"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
              <div className="text-[9px] text-slate-500 text-center">
                ConnectSphere Mobile Node
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
