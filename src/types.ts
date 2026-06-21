export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  profilePicture: string;
  coverPhoto: string;
  bio: string;
  followersCount: number;
  followingCount: number;
  isFollowedByMe?: boolean;
  isVerified: boolean;
  joinedAt: string;
  is2faEnabled: boolean;
  role: 'user' | 'admin';
  isBanned: boolean;
  warningCount: number;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  username: string;
  displayName: string;
  profilePicture: string;
  content: string;
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  profilePicture: string;
  isVerified: boolean;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'none';
  likesCount: number;
  commentsCount: number;
  isLikedByMe?: boolean;
  isSavedByMe?: boolean;
  createdAt: string;
  tags?: string[];
  comments?: Comment[];
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderPicture: string;
  receiverId?: string; // for direct messages
  groupId?: string; // for group chats
  message: string;
  isEncrypted: boolean;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'none';
  reactions?: Record<string, string[]>; // e.g. { "❤️": ["userId1", "userId2"] }
  createdAt: string;
}

export interface ChatGroup {
  id: string;
  name: string;
  description: string;
  avatar: string;
  memberIds: string[];
  lastMessageAt: string;
}

export interface StreamComment {
  id: string;
  username: string;
  profilePicture: string;
  comment: string;
  gift?: string;
  createdAt: string;
}

export interface LiveStream {
  id: string;
  streamerId: string;
  streamerName: string;
  streamerPicture: string;
  title: string;
  streamKey: string;
  status: 'live' | 'ended' | 'scheduled';
  viewersCount: number;
  likesCount: number;
  comments: StreamComment[];
  scheduledAt?: string;
  recordedUrl?: string;
}

export interface Poll {
  id: string;
  question: string;
  options: { id: string; text: string; votes: number }[];
  totalVotes: number;
  votedOptionId?: string;
}

export interface ForumPost {
  id: string;
  authorName: string;
  authorPicture: string;
  title: string;
  content: string;
  category: string;
  repliesCount: number;
  createdAt: string;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  banner: string;
  ownerId: string;
  membersCount: number;
  isJoinedByMe?: boolean;
  category: string;
  forumPosts: ForumPost[];
  polls: Poll[];
}

export interface AppNotification {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'message' | 'follow' | 'mention' | 'stream' | 'call';
  senderName: string;
  content: string;
  link: string;
  isRead: boolean;
  createdAt: string;
}

export interface AnalyticMetric {
  date: string;
  users: number;
  posts: number;
  messages: number;
  activeStreams: number;
  revenue: number;
}

export interface ModerationReport {
  id: string;
  reporterName: string;
  contentId: string;
  contentType: 'post' | 'comment' | 'message';
  contentSnippet: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  aiAssessment?: string;
  createdAt: string;
}
