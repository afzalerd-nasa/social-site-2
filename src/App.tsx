import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import AuthPage from './components/AuthPage';
import FeedView from './components/FeedView';
import ChatView from './components/ChatView';
import CallView from './components/CallView';
import StreamView from './components/StreamView';
import CommunitiesView from './components/CommunitiesView';
import ProfileView from './components/ProfileView';
import AdminDashboardView from './components/AdminDashboardView';
import { User, Notification } from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'feed' | 'chat' | 'calls' | 'streams' | 'communities' | 'profile' | 'admin'>('feed');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  
  // Slide-in notifications tray
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Attempt lazy login on setup
    checkExistingSession();
    // Poll notifications every 5 seconds to simulate active background threads
    const nInterval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(nInterval);
  }, [currentUser]);

  const checkExistingSession = async () => {
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const u = await res.json();
        if (u && u.id) {
          setCurrentUser(u);
        }
      }
    } catch (err) {
      console.warn('Session verification server error.', err);
    }
  };

  const fetchNotifications = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        setUnreadCount(data.filter((n: Notification) => !n.isRead).length);
      }
    } catch (err) {
      console.error('Failed to sync notification records.', err);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await fetch('/api/notifications/read', { method: 'POST' });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setActiveTab('feed');
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setCurrentUser(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProfile = (updated: User) => {
    setCurrentUser(updated);
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'feed':
        return <FeedView searchFilterQuery={globalSearchQuery} />;
      case 'chat':
        return <ChatView currentUser={currentUser} />;
      case 'calls':
        return <CallView currentUser={currentUser} />;
      case 'streams':
        return <StreamView currentUser={currentUser} />;
      case 'communities':
        return <CommunitiesView currentUser={currentUser} />;
      case 'profile':
        return <ProfileView currentUser={currentUser} onUpdateProfile={handleUpdateProfile} />;
      case 'admin':
        return <AdminDashboardView />;
      default:
        return <FeedView searchFilterQuery={globalSearchQuery} />;
    }
  };

  if (!currentUser) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <Layout
      currentUser={currentUser}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onLogout={handleLogout}
      onSearch={setGlobalSearchQuery}
    >
      <main className="transition-all duration-300">
        {renderActiveView()}
      </main>
    </Layout>
  );
}
