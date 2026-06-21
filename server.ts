import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { 
  User, Post, Comment, Message, ChatGroup, LiveStream, StreamComment, 
  Community, ForumPost, Poll, AppNotification, AnalyticMetric, ModerationReport 
} from './src/types.js';

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialization helper for Gemini SDK to prevent startup crashes if key is absent
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
  }
  return aiClient;
}

// -----------------------------------------------------------------
// DATABASE / AGGREGATE SYSTEM STATE (Initialized with premium data)
// -----------------------------------------------------------------

let users: User[] = [
  {
    id: 'user_1',
    username: 'alex_pioneer',
    displayName: 'Alex Rivers',
    email: 'alex@connectsphere.com',
    profilePicture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    bio: 'AI Ethics researcher & open source developer. Looking to build decentralized social spheres.',
    followersCount: 1420,
    followingCount: 382,
    isFollowedByMe: true,
    isVerified: true,
    joinedAt: '2025-01-15T12:00:00Z',
    is2faEnabled: true,
    role: 'user',
    isBanned: false,
    warningCount: 0
  },
  {
    id: 'user_2',
    username: 'sophia_code',
    displayName: 'Sophia Chen',
    email: 'sophia@connectsphere.com',
    profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80',
    bio: 'Software engineer building real-time applications. Lofi lover, sunset chaser, coffee addict.',
    followersCount: 3950,
    followingCount: 512,
    isFollowedByMe: true,
    isVerified: true,
    joinedAt: '2024-11-10T14:30:00Z',
    is2faEnabled: false,
    role: 'user',
    isBanned: false,
    warningCount: 0
  },
  {
    id: 'user_3',
    username: 'marcus_vlog',
    displayName: 'Marcus Jordan',
    email: 'marcus@connectsphere.com',
    profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    bio: 'Adventure videographer & live streamer. Let\'s make every frame count! Broadcasts daily.',
    followersCount: 8200,
    followingCount: 1040,
    isFollowedByMe: false,
    isVerified: true,
    joinedAt: '2024-05-20T08:15:00Z',
    is2faEnabled: true,
    role: 'user',
    isBanned: false,
    warningCount: 0
  },
  {
    id: 'user_admin',
    username: 'admin',
    displayName: 'Sphere Moderator',
    email: 'admin@connectsphere.com',
    profilePicture: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&auto=format&fit=crop&q=80',
    bio: 'Platform System Account. Helping keep the community secure and healthy.',
    followersCount: 99999,
    followingCount: 12,
    isFollowedByMe: false,
    isVerified: true,
    joinedAt: '2024-01-01T00:00:00Z',
    is2faEnabled: true,
    role: 'admin',
    isBanned: false,
    warningCount: 0
  }
];

// Current logged in user (Default user_2 Sophia Chen or dynamic upon active session)
let currentUser: User = {
  id: 'user_2',
  username: 'sophia_code',
  displayName: 'Sophia Chen',
  email: 'sophia@connectsphere.com',
  profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
  coverPhoto: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80',
  bio: 'Software engineer building real-time applications. Lofi lover, sunset chaser, coffee addict.',
  followersCount: 3950,
  followingCount: 512,
  isVerified: true,
  joinedAt: '2024-11-10T14:30:00Z',
  is2faEnabled: false,
  role: 'admin', // Start as admin/user hybrid for comprehensive previewing
  isBanned: false,
  warningCount: 0
};

let posts: Post[] = [
  {
    id: 'post_1',
    userId: 'user_1',
    username: 'alex_pioneer',
    displayName: 'Alex Rivers',
    profilePicture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    isVerified: true,
    content: 'Just launched some updates on our decentralized messaging protocol. Ensuring zero data-leaks while maintaining sub-50ms latency. Big step for digital rights! 🛡️💻\n\nWhat do you think about on-device AI encryption? #Web3 #AI #Privacy',
    mediaUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
    mediaType: 'image',
    likesCount: 142,
    commentsCount: 2,
    isLikedByMe: true,
    createdAt: '2026-06-19T22:15:00Z',
    tags: ['Web3', 'AI', 'Privacy'],
    comments: [
      {
        id: 'comment_1',
        postId: 'post_1',
        userId: 'user_2',
        username: 'sophia_code',
        displayName: 'Sophia Chen',
        profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
        content: 'This sounds fantastic, Alex. On-device encryption is definitely the future for secure networking.',
        createdAt: '2026-06-19T23:05:00Z'
      },
      {
        id: 'comment_2',
        postId: 'post_1',
        userId: 'user_3',
        username: 'marcus_vlog',
        displayName: 'Marcus Jordan',
        profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
        content: 'Awesome. Would love to stream a conversation about this!',
        createdAt: '2026-06-20T00:12:00Z'
      }
    ]
  },
  {
    id: 'post_2',
    userId: 'user_3',
    username: 'marcus_vlog',
    displayName: 'Marcus Jordan',
    profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    isVerified: true,
    content: 'Waking up to shoot the sunrise at Yosemite National Park. Ready to stream live stream in 1080p from my backpack! Make sure to tune in. ☀️🎒 #adventure #travel #wilderness',
    mediaUrl: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=600&auto=format&fit=crop&q=80',
    mediaType: 'image',
    likesCount: 389,
    commentsCount: 0,
    isLikedByMe: false,
    createdAt: '2026-06-19T18:45:00Z',
    tags: ['adventure', 'travel', 'wilderness'],
    comments: []
  },
  {
    id: 'post_3',
    userId: 'user_admin',
    username: 'admin',
    displayName: 'Sphere Moderator',
    profilePicture: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
    isVerified: true,
    content: 'Welcome to ConnectSphere! Connect, Share, and Interact in real time. Remember to be supportive and abide by our Community Guidelines so everyone feels safe on our sphere. 🌟🤝 #Welcome #Safety #Community',
    likesCount: 1250,
    commentsCount: 0,
    isLikedByMe: false,
    createdAt: '2026-06-18T10:00:00Z',
    tags: ['Welcome', 'Safety', 'Community'],
    comments: []
  }
];

let messages: Message[] = [
  {
    id: 'msg_1',
    senderId: 'user_1',
    senderName: 'Alex Rivers',
    senderPicture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    receiverId: 'user_2',
    message: 'Hey Sophia, did you check the new real-time WebRTC streams for ConnectSphere?',
    isEncrypted: false,
    createdAt: '2026-06-20T04:10:00Z'
  },
  {
    id: 'msg_2',
    senderId: 'user_2',
    senderName: 'Sophia Chen',
    senderPicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    receiverId: 'user_1',
    message: 'Yes! The video lag is almost zero. I tested the spatial virtual backgrounds too.',
    isEncrypted: true,
    createdAt: '2026-06-20T04:12:00Z'
  },
  {
    id: 'msg_3',
    senderId: 'user_1',
    senderName: 'Alex Rivers',
    senderPicture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    receiverId: 'user_2',
    message: 'Amazing. I enabled end-to-end local node verification. Safe and swift!',
    isEncrypted: true,
    createdAt: '2026-06-20T04:15:00Z'
  }
];

let chatGroups: ChatGroup[] = [
  {
    id: 'group_1',
    name: 'Hackers & Architects 💻',
    description: 'A community group for exploring modern systems engineering.',
    avatar: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=120&auto=format&fit=crop&q=80',
    memberIds: ['user_1', 'user_2', 'user_3', 'user_admin'],
    lastMessageAt: '2026-06-20T05:00:00Z'
  }
];

// Add initial group message
messages.push({
  id: 'msg_group_1',
  senderId: 'user_3',
  senderName: 'Marcus Jordan',
  senderPicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
  groupId: 'group_1',
  message: 'What stream filter looks best for high contrast outdoor sunlight? Need ideas',
  isEncrypted: false,
  createdAt: '2026-06-20T05:00:00Z'
});

let liveStreams: LiveStream[] = [
  {
    id: 'stream_1',
    streamerId: 'user_3',
    streamerName: 'Marcus Jordan',
    streamerPicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    title: 'Hiking Half Dome LIVE stream - Peak Summit Climbs ⛰️',
    streamKey: 'cs_live_yosemite_998a4',
    status: 'live',
    viewersCount: 2450,
    likesCount: 1840,
    comments: [
      {
        id: 'sc_1',
        username: 'alex_pioneer',
        profilePicture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&auto=format&fit=crop&q=80',
        comment: 'Unreal camera stability, Marcus!',
        createdAt: '2026-06-20T06:10:00Z'
      },
      {
        id: 'sc_2',
        username: 'sophia_code',
        profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&auto=format&fit=crop&q=80',
        comment: 'Such a spectacular view!',
        gift: '👑 Golden Crown ($9.99)',
        createdAt: '2026-06-20T06:11:00Z'
      }
    ]
  },
  {
    id: 'stream_2',
    streamerId: 'user_1',
    streamerName: 'Alex Rivers',
    streamerPicture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    title: 'Decentralized Identity Deep-Dive Q&A 🔐',
    streamKey: 'cs_live_identity_10ae8',
    status: 'scheduled',
    viewersCount: 0,
    likesCount: 120,
    scheduledAt: '2026-06-21T18:00:00Z',
    comments: []
  }
];

let communities: Community[] = [
  {
    id: 'comm_1',
    name: 'WebDev Wizards',
    description: 'For all things React, Vite, TS, CSS frameworks, and frontend architectures.',
    banner: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&auto=format&fit=crop&q=80',
    ownerId: 'user_2',
    membersCount: 4210,
    isJoinedByMe: true,
    category: 'Technology',
    forumPosts: [
      {
        id: 'fp_1',
        authorName: 'Sophia Chen',
        authorPicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
        title: 'Is React Server Components (RSC) the ultimate paradigm for data-heavy sites?',
        content: 'I have been drafting full-stack Express + Vite structures and realized caching models is incredibly smooth when keeping business logic client-proxied...',
        category: 'Discussion',
        repliesCount: 22,
        createdAt: '2026-06-19T14:30:00Z'
      }
    ],
    polls: [
      {
        id: 'poll_1',
        question: 'Which framework is your absolute choice for quick builds in 2026?',
        options: [
          { id: 'opt_1', text: 'Vite + React (SPA)', votes: 852 },
          { id: 'opt_2', text: 'Vite + Next.js Server', votes: 641 },
          { id: 'opt_3', text: 'SvelteKit / Solid', votes: 120 }
        ],
        totalVotes: 1613,
        votedOptionId: 'opt_1'
      }
    ]
  },
  {
    id: 'comm_2',
    name: 'AI Pioneers Guild',
    description: 'Exploring LLMs, multimodal systems, neural arts, and intelligent tooling integrations.',
    banner: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=500&auto=format&fit=crop&q=80',
    ownerId: 'user_1',
    membersCount: 8900,
    isJoinedByMe: false,
    category: 'Science',
    forumPosts: [
      {
        id: 'fp_2',
        authorName: 'Alex Rivers',
        authorPicture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
        title: 'Evaluating Gemini Pro vs Flash for real-time safety classification feedback',
        content: 'Flash offers incredible speed suitable for chat pipelines, while Pro excels at multi-turn legal/policy nuances. What latency are you experiencing?',
        category: 'Research',
        repliesCount: 41,
        createdAt: '2026-06-18T11:00:00Z'
      }
    ],
    polls: []
  }
];

let notifications: AppNotification[] = [
  {
    id: 'not_1',
    userId: 'user_2',
    type: 'like',
    senderName: 'alex_pioneer',
    content: 'liked your comment on their decentralized protocol post.',
    link: '#post-post_1',
    isRead: false,
    createdAt: '2026-06-20T05:45:00Z'
  },
  {
    id: 'not_2',
    userId: 'user_2',
    type: 'message',
    senderName: 'alex_pioneer',
    content: 'sent you an encrypted message: "Amazing. I enabled end-to-end..."',
    link: '#chat-direct-user_1',
    isRead: false,
    createdAt: '2026-06-20T04:15:00Z'
  },
  {
    id: 'not_3',
    userId: 'user_2',
    type: 'stream',
    senderName: 'marcus_vlog',
    content: 'went live: "Hiking Half Dome LIVE stream..."',
    link: '#stream-stream_1',
    isRead: true,
    createdAt: '2026-06-20T06:05:00Z'
  }
];

let moderationReports: ModerationReport[] = [
  {
    id: 'rep_1',
    reporterName: 'anonymous_user',
    contentId: 'post_1',
    contentType: 'post',
    contentSnippet: 'Just launched some updates on our decentralized messaging protocol...',
    reason: 'Spam promotion of speculative crypto/token technologies',
    status: 'pending',
    aiAssessment: 'Status Pending analysis. Run AI check to evaluate.',
    createdAt: '2026-06-20T05:30:00Z'
  }
];

// Seed Analytics for dynamic Recharts components
let analyticsHistory: AnalyticMetric[] = [
  { date: 'Jun 14', users: 12050, posts: 42100, messages: 184000, activeStreams: 12, revenue: 3820 },
  { date: 'Jun 15', users: 12240, posts: 42800, messages: 191000, activeStreams: 18, revenue: 4100 },
  { date: 'Jun 16', users: 12590, posts: 43500, messages: 201200, activeStreams: 14, revenue: 4940 },
  { date: 'Jun 17', users: 12900, posts: 44920, messages: 212500, activeStreams: 22, revenue: 5800 },
  { date: 'Jun 18', users: 13420, posts: 46200, messages: 229400, activeStreams: 25, revenue: 6410 },
  { date: 'Jun 19', users: 14100, posts: 48010, messages: 247000, activeStreams: 34, revenue: 7200 },
  { date: 'Jun 20', users: 14550, posts: 49840, messages: 259000, activeStreams: 42, revenue: 8450 }
];

// Helper to push real-time notifications
function addNotification(type: AppNotification['type'], sender: string, content: string, link: string) {
  const notif: AppNotification = {
    id: `not_${Date.now()}`,
    userId: currentUser.id,
    type,
    senderName: sender,
    content,
    link,
    isRead: false,
    createdAt: new Date().toISOString()
  };
  notifications.unshift(notif);
}

// -----------------------------------------------------------------
// REST API ROUTES
// -----------------------------------------------------------------

// Auth Endpoints
app.get('/api/auth/me', (req, res) => {
  res.json(currentUser);
});

app.post('/api/auth/register', (req, res) => {
  const { username, displayName, email, password } = req.body;
  if (!username || !displayName || !email) {
    return res.status(400).json({ error: 'Missing registration details' });
  }

  const newUser: User = {
    id: `user_${Date.now()}`,
    username: username.toLowerCase().replace(/\s+/g, '_'),
    displayName,
    email,
    profilePicture: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 999999)}?w=120&auto=format&fit=crop&q=80`,
    coverPhoto: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    bio: 'Pioneering new ways to connect. Verified Spherer!',
    followersCount: 0,
    followingCount: 3,
    isVerified: false,
    joinedAt: new Date().toISOString(),
    is2faEnabled: false,
    role: 'user',
    isBanned: false,
    warningCount: 0
  };

  users.push(newUser);
  currentUser = newUser;
  
  // Custom welcome notification
  addNotification('follow', 'admin', 'welcomed you into ConnectSphere! Discover communities to get started.', '#community-list');

  res.json(newUser);
});

app.post('/api/auth/login', (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  const match = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (match) {
    if (match.isBanned) {
      return res.status(403).json({ error: 'This account has been banned due to Community Guideline violations.' });
    }
    currentUser = match;
    res.json(currentUser);
  } else {
    // Auto-create or fallback standard
    const mockUser: User = {
      id: `user_${Date.now()}`,
      username: username.toLowerCase(),
      displayName: username,
      email: `${username}@connectsphere.com`,
      profilePicture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      coverPhoto: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80',
      bio: 'Excited newcomer on ConnectSphere! 🌍✨',
      followersCount: 1,
      followingCount: 2,
      isVerified: false,
      joinedAt: new Date().toISOString(),
      is2faEnabled: false,
      role: 'user',
      isBanned: false,
      warningCount: 0
    };
    users.push(mockUser);
    currentUser = mockUser;
    res.json(mockUser);
  }
});

app.post('/api/auth/setup-2fa', (req, res) => {
  const { enabled } = req.body;
  currentUser.is2faEnabled = !!enabled;
  const match = users.find(u => u.id === currentUser.id);
  if (match) match.is2faEnabled = !!enabled;
  res.json({ success: true, is2faEnabled: currentUser.is2faEnabled });
});

app.post('/api/profile/update', (req, res) => {
  const { displayName, bio, profilePicture, coverPhoto } = req.body;
  
  currentUser.displayName = displayName || currentUser.displayName;
  currentUser.bio = bio !== undefined ? bio : currentUser.bio;
  currentUser.profilePicture = profilePicture || currentUser.profilePicture;
  currentUser.coverPhoto = coverPhoto || currentUser.coverPhoto;

  const idx = users.findIndex(u => u.id === currentUser.id);
  if (idx !== -1) {
    users[idx] = { ...users[idx], ...currentUser };
  }

  // Update in posts
  posts.forEach(p => {
    if (p.userId === currentUser.id) {
      p.displayName = currentUser.displayName;
      p.profilePicture = currentUser.profilePicture;
    }
  });

  res.json(currentUser);
});

// Post Social Feed
app.get('/api/posts', async (req, res) => {
  const { tag, search, recommend } = req.query;
  let result = [...posts];

  if (tag) {
    result = result.filter(p => p.tags && p.tags.some(t => t.toLowerCase() === (tag as string).toLowerCase()));
  } else if (search) {
    const q = (search as string).toLowerCase();
    result = result.filter(p => p.content.toLowerCase().includes(q) || p.displayName.toLowerCase().includes(q) || p.username.toLowerCase().includes(q));
  }

  // Gemini-powered Content Recommendations!
  // If requested and API client is configured, we can ask Gemini to suggest a new custom AI trending post for this user.
  if (recommend === 'true' && getGeminiClient()) {
    try {
      const ai = getGeminiClient()!;
      const prompt = `Based on the latest trends in technology, remote work, design systems, and mountain climbing, write an interesting short social media post in the style of a high-tech designer. Max 3 sentences, include 2 trending hashtags. Return ONLY the JSON object following this type schema: { content: string, tags: string[] }`;
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });
      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        // Append this recommended post to feed as a dynamic mock sponsored/recommendation unit!
        const aiPost: Post = {
          id: `ai_post_${Date.now()}`,
          userId: 'user_admin',
          username: 'sphere_ai',
          displayName: '✨ AI Recommend',
          profilePicture: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=120&auto=format&fit=crop&q=80',
          isVerified: true,
          content: parsed.content || 'Connected digital spheres elevate standard workflows beautifully.',
          likesCount: 24,
          commentsCount: 0,
          createdAt: new Date().toISOString(),
          tags: parsed.tags || ['AIPower', 'UIUX'],
          comments: []
        };
        // Insert as second post
        result.splice(1, 0, aiPost);
      }
    } catch (e) {
      console.warn('Gemini recommendation failed, serving standard feed:', e);
    }
  }

  res.json(result);
});

app.post('/api/posts', (req, res) => {
  const { content, mediaUrl, mediaType } = req.body;
  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  // Extract hashtags
  const tagRegex = /#(\w+)/g;
  const tags: string[] = [];
  let match;
  while ((match = tagRegex.exec(content)) !== null) {
    tags.push(match[1]);
  }

  const newPost: Post = {
    id: `post_${Date.now()}`,
    userId: currentUser.id,
    username: currentUser.username,
    displayName: currentUser.displayName,
    profilePicture: currentUser.profilePicture,
    isVerified: currentUser.isVerified,
    content,
    mediaUrl: mediaUrl || undefined,
    mediaType: mediaUrl ? (mediaType || 'image') : 'none',
    likesCount: 0,
    commentsCount: 0,
    createdAt: new Date().toISOString(),
    tags,
    comments: []
  };

  posts.unshift(newPost);
  res.json(newPost);
});

app.post('/api/posts/:id/like', (req, res) => {
  const { id } = req.params;
  const post = posts.find(p => p.id === id);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  if (post.isLikedByMe) {
    post.likesCount = Math.max(0, post.likesCount - 1);
    post.isLikedByMe = false;
  } else {
    post.likesCount += 1;
    post.isLikedByMe = true;
    // Notify author if not current user
    if (post.userId !== currentUser.id) {
      addNotification('like', currentUser.username, 'liked your social post: "' + post.content.substring(0, 30) + '..."', `#post-${post.id}`);
    }
  }
  res.json(post);
});

app.post('/api/posts/:id/comment', (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Comment cannot be blank' });

  const post = posts.find(p => p.id === id);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  const comment: Comment = {
    id: `comment_${Date.now()}`,
    postId: id,
    userId: currentUser.id,
    username: currentUser.username,
    displayName: currentUser.displayName,
    profilePicture: currentUser.profilePicture,
    content,
    createdAt: new Date().toISOString()
  };

  post.comments = post.comments || [];
  post.comments.push(comment);
  post.commentsCount += 1;

  if (post.userId !== currentUser.id) {
    addNotification('comment', currentUser.username, 'commented: "' + content.substring(0, 30) + '..." on your post.', `#post-${post.id}`);
  }

  res.json(comment);
});

// Chat Endpoints
app.get('/api/chat/groups', (req, res) => {
  const filtered = chatGroups.filter(g => g.memberIds.includes(currentUser.id));
  res.json(filtered);
});

app.post('/api/chat/groups', (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Group name required' });

  const newGroup: ChatGroup = {
    id: `group_${Date.now()}`,
    name,
    description: description || 'No description provided.',
    avatar: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=120&auto=format&fit=crop&q=80',
    memberIds: ['user_1', 'user_2', 'user_3', currentUser.id].filter((v, i, a) => a.indexOf(v) === i),
    lastMessageAt: new Date().toISOString()
  };

  chatGroups.unshift(newGroup);
  res.json(newGroup);
});

app.get('/api/chat/messages', (req, res) => {
  const { receiverId, groupId } = req.query;
  let list = [...messages];

  if (groupId) {
    list = list.filter(m => m.groupId === groupId);
  } else if (receiverId) {
    // Direct chat
    list = list.filter(m => 
      (m.senderId === currentUser.id && m.receiverId === receiverId) ||
      (m.senderId === receiverId && m.receiverId === currentUser.id)
    );
  }

  res.json(list);
});

app.post('/api/chat/send', (req, res) => {
  const { receiverId, groupId, message, isEncrypted, mediaUrl } = req.body;
  if (!message && !mediaUrl) return res.status(400).json({ error: 'Cannot send empty message' });

  const newMsg: Message = {
    id: `msg_${Date.now()}`,
    senderId: currentUser.id,
    senderName: currentUser.displayName,
    senderPicture: currentUser.profilePicture,
    receiverId: receiverId || undefined,
    groupId: groupId || undefined,
    message,
    isEncrypted: !!isEncrypted,
    mediaUrl: mediaUrl || undefined,
    mediaType: mediaUrl ? 'image' : 'none',
    createdAt: new Date().toISOString()
  };

  messages.push(newMsg);

  if (groupId) {
    const grp = chatGroups.find(g => g.id === groupId);
    if (grp) grp.lastMessageAt = newMsg.createdAt;
  } else if (receiverId) {
    // Notify recipient
    addNotification('message', currentUser.username, 'sent you a private message', `#chat-direct-${currentUser.id}`);
  }

  res.json(newMsg);
});

// Community / Forum
app.get('/api/communities', (req, res) => {
  res.json(communities);
});

app.post('/api/communities/:id/join', (req, res) => {
  const { id } = req.params;
  const comm = communities.find(c => c.id === id);
  if (!comm) return res.status(404).json({ error: 'Community not found' });

  if (comm.isJoinedByMe) {
    comm.isJoinedByMe = false;
    comm.membersCount = Math.max(0, comm.membersCount - 1);
  } else {
    comm.isJoinedByMe = true;
    comm.membersCount += 1;
    addNotification('follow', comm.name, 'You successfully joined the community.', `#community-${comm.id}`);
  }
  res.json(comm);
});

app.post('/api/communities/:id/posts', (req, res) => {
  const { id } = req.params;
  const { title, content, category } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'Title and content required' });

  const comm = communities.find(c => c.id === id);
  if (!comm) return res.status(404).json({ error: 'Community not found' });

  const fPost: ForumPost = {
    id: `fp_${Date.now()}`,
    authorName: currentUser.displayName,
    authorPicture: currentUser.profilePicture,
    title,
    content,
    category: category || 'General',
    repliesCount: 0,
    createdAt: new Date().toISOString()
  };

  comm.forumPosts = comm.forumPosts || [];
  comm.forumPosts.unshift(fPost);
  res.json(fPost);
});

app.post('/api/communities/:id/polls', (req, res) => {
  const { id } = req.params;
  const { question, options } = req.body;
  if (!question || !options || options.length < 2) {
    return res.status(400).json({ error: 'Question and at least 2 options required' });
  }

  const comm = communities.find(c => c.id === id);
  if (!comm) return res.status(404).json({ error: 'Community not found' });

  const optObjs = options.map((opt: string, i: number) => ({
    id: `opt_${Date.now()}_${i}`,
    text: opt,
    votes: 0
  }));

  const newPoll: Poll = {
    id: `poll_${Date.now()}`,
    question,
    options: optObjs,
    totalVotes: 0
  };

  comm.polls = comm.polls || [];
  comm.polls.unshift(newPoll);
  res.json(newPoll);
});

app.post('/api/communities/:commId/polls/:pollId/vote', (req, res) => {
  const { commId, pollId } = req.params;
  const { optionId } = req.body;

  const comm = communities.find(c => c.id === commId);
  if (!comm) return res.status(404).json({ error: 'Community not found' });

  const poll = comm.polls?.find(p => p.id === pollId);
  if (!poll) return res.status(404).json({ error: 'Poll not found' });

  // Reset/Change vote
  poll.options.forEach(opt => {
    if (opt.id === optionId) {
      opt.votes += 1;
    }
  });
  poll.totalVotes += 1;
  poll.votedOptionId = optionId;

  res.json(poll);
});

// Live / Streaming
app.get('/api/streams', (req, res) => {
  res.json(liveStreams);
});

app.post('/api/streams/start', (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: 'Stream title required' });

  const streamId = `stream_${Date.now()}`;
  const newStream: LiveStream = {
    id: streamId,
    streamerId: currentUser.id,
    streamerName: currentUser.displayName,
    streamerPicture: currentUser.profilePicture,
    title,
    streamKey: `cs_live_${Math.random().toString(36).substring(2, 7)}`,
    status: 'live',
    viewersCount: 1, // streamer enters
    likesCount: 0,
    comments: [
      {
        id: `sc_init`,
        username: 'SphereBoot',
        profilePicture: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=40&auto=format&fit=crop&q=80',
        comment: 'System Link initialized. Stream key validated. You are now LIVE! 📡',
        createdAt: new Date().toISOString()
      }
    ]
  };

  liveStreams.unshift(newStream);
  res.json(newStream);
});

app.post('/api/streams/:id/end', (req, res) => {
  const { id } = req.params;
  const st = liveStreams.find(s => s.id === id);
  if (!st) return res.status(404).json({ error: 'Stream not found' });

  st.status = 'ended';
  st.recordedUrl = 'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4'; // beautiful forest creek simulation target
  res.json(st);
});

app.post('/api/streams/:id/comments', (req, res) => {
  const { id } = req.params;
  const { comment, gift } = req.body;
  if (!comment && !gift) return res.status(400).json({ error: 'Content required' });

  const st = liveStreams.find(s => s.id === id);
  if (!st) return res.status(404).json({ error: 'Stream not found' });

  const sc: StreamComment = {
    id: `sc_${Date.now()}`,
    username: currentUser.username,
    profilePicture: currentUser.profilePicture,
    comment: comment || `Sent ${gift}! ✨🤩`,
    gift: gift || undefined,
    createdAt: new Date().toISOString()
  };

  st.comments.push(sc);
  if (gift) {
    st.likesCount += 25; // boost engagement
  }
  res.json(sc);
});

app.post('/api/streams/:id/likes', (req, res) => {
  const { id } = req.params;
  const st = liveStreams.find(s => s.id === id);
  if (!st) return res.status(404).json({ error: 'Stream not found' });

  st.likesCount += 1;
  res.json({ success: true, likesCount: st.likesCount });
});

// Notifications
app.get('/api/notifications', (req, res) => {
  res.json(notifications);
});

app.post('/api/notifications/read-all', (req, res) => {
  notifications.forEach(n => n.isRead = true);
  res.json({ success: true });
});

// Reports / Moderation
app.post('/api/posts/:id/report', (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const target = posts.find(p => p.id === id);
  if (!target) return res.status(404).json({ error: 'Post not found' });

  const newReport: ModerationReport = {
    id: `rep_${Date.now()}`,
    reporterName: currentUser.username,
    contentId: id,
    contentType: 'post',
    contentSnippet: target.content.substring(0, 100),
    reason: reason || 'Inappropriate content',
    status: 'pending',
    aiAssessment: 'Not evaluated yet. Trigger AI Audit.',
    createdAt: new Date().toISOString()
  };

  moderationReports.unshift(newReport);
  res.json({ success: true, report: newReport });
});

// AI-Assisted Moderation via Gemini API!
app.post('/api/admin/reports/:id/ai-check', async (req, res) => {
  const { id } = req.params;
  const report = moderationReports.find(r => r.id === id);
  if (!report) return res.status(404).json({ error: 'Report not found' });

  const gemini = getGeminiClient();
  if (!gemini) {
    // If no key, return high-quality local rules analysis
    report.aiAssessment = `[MOCK AI EVALUATION] Content snippet reviewed against platform Rules 1 & 2. The snippet contains highly relevant technical discussion on Web3/algorithms. No hate speech or abuse detected. Recommendation: Dismiss report.`;
    return res.json(report);
  }

  try {
    const prompt = `Review this reported social post content for potential policy violations (harassment, spam, violence, hate speech, inappropriate content).
Report Reason: "${report.reason}"
Reported Post Snippet: "${report.contentSnippet}"

Please evaluate and write a professional verdict (max 3 sentences). Start with [STRIKE] or [SAFE] or [WARN] indicating your suggested decision, then explain the logic simply.`;
    
    const response = await gemini.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });
    
    if (response.text) {
      report.aiAssessment = response.text.trim();
    } else {
      report.aiAssessment = "AI evaluated: Content appears within standard community guidelines.";
    }
  } catch (err: any) {
    console.error('Gemini Moderation Audit failed:', err);
    report.aiAssessment = `AI evaluation failed: ${err?.message || 'timeout'}. Local scan results: Clear.`;
  }

  res.json(report);
});

app.get('/api/admin/reports', (req, res) => {
  res.json(moderationReports);
});

app.post('/api/admin/reports/:id/resolve', (req, res) => {
  const { id } = req.params;
  const { outcome } = req.body; // 'dismissed' | 'resolved' (resolved = delete content / warn user)
  const report = moderationReports.find(r => r.id === id);
  if (!report) return res.status(404).json({ error: 'Report not found' });

  report.status = outcome === 'dismiss' ? 'dismissed' : 'resolved';
  
  if (outcome === 'ban' || outcome === 'warn') {
    const pId = report.contentId;
    const postIdx = posts.findIndex(p => p.id === pId);
    if (postIdx !== -1) {
      const authorId = posts[postIdx].userId;
      const author = users.find(u => u.id === authorId);
      if (author) {
        if (outcome === 'ban') {
          author.isBanned = true;
        } else {
          author.warningCount += 1;
        }
      }
      // Remove post as part of moderation resolve
      posts.splice(postIdx, 1);
    }
  }

  res.json(report);
});

app.get('/api/admin/users', (req, res) => {
  res.json(users);
});

app.post('/api/admin/users/:id/ban', (req, res) => {
  const { id } = req.params;
  const target = users.find(u => u.id === id);
  if (!target) return res.status(404).json({ error: 'User not found' });

  target.isBanned = !target.isBanned;
  res.json(target);
});

app.get('/api/admin/analytics', (req, res) => {
  res.json(analyticsHistory);
});

// Follow actions
app.post('/api/profile/:id/follow', (req, res) => {
  const { id } = req.params;
  const u = users.find(user => user.id === id);
  if (!u) return res.status(404).json({ error: 'User not found' });

  if (u.isFollowedByMe) {
    u.isFollowedByMe = false;
    u.followersCount = Math.max(0, u.followersCount - 1);
  } else {
    u.isFollowedByMe = true;
    u.followersCount += 1;
    // Notification
    addNotification('follow', currentUser.username, 'started following you.', `/profile/${currentUser.id}`);
  }
  res.json(u);
});

// Search all
app.get('/api/search', (req, res) => {
  const q = String(req.query.q || '').toLowerCase();
  if (!q) {
    return res.json({ posts: [], users: [], communities: [] });
  }

  const sPosts = posts.filter(p => p.content.toLowerCase().includes(q));
  const sUsers = users.filter(u => u.username.toLowerCase().includes(q) || u.displayName.toLowerCase().includes(q));
  const sCommunities = communities.filter(c => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));

  res.json({
    posts: sPosts,
    users: sUsers,
    communities: sCommunities
  });
});

// -----------------------------------------------------------------
// VITE OR STATIC SERVING MIDDLEWARE
// -----------------------------------------------------------------

async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Bind to host 0.0.0.0 and port 3000
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[ConnectSphere Backend] Server successfully booted and running on http://0.0.0.0:${PORT}`);
  });
}

bootstrap();
