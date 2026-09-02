export interface GalleryItem {
  id: string;
  title: string;
  category: 'Photoshoots' | 'Traditional Sarees' | 'Casual & Travel' | 'Red Carpet & Events' | 'Portraits';
  imageUrl: string;
  date: string;
  aspectRatio?: '9:16' | '16:9' | '1:1' | '4:5';
  orientation?: 'mobile' | 'desktop' | 'square' | 'portrait';
  resolution?: string; // e.g., '4K Ultra HD', '1080x1920', 'OLED QHD'
  caption: string;
  photographerOrLocation?: string;
  likes: number;
  tags: string[];
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  fullStory: string;
  category: 'Fashion & Style' | 'Interviews' | 'Milestones' | 'Charity & Causes' | 'Vlogs & Travel';
  date: string;
  readTime: string;
  imageUrl: string;
  author: string;
  quote?: string;
}

export interface SocialPost {
  id: string;
  platform: 'instagram' | 'youtube' | 'twitter';
  handle: string;
  authorName: string;
  avatarUrl: string;
  publishedAt: string;
  caption: string;
  mediaUrl?: string;
  mediaType: 'image' | 'video_embed' | 'quote_card' | 'twitter_embed';
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  tags: string[];
  comments: Array<{
    id: string;
    user: string;
    avatar: string;
    text: string;
    time: string;
  }>;
}

export interface FanArtSubmission {
  id: string;
  title: string;
  artistName: string;
  artistHandle?: string;
  category: 'Digital Illustration' | 'Pencil Sketch' | 'Video Edit & Reel' | 'Wallpaper & Graphic' | 'Poetry & Words';
  size?: '9:16 (Mobile)' | '16:9 (Desktop)' | '1:1 (Instagram)' | '4:5 (Portrait)';
  imageUrl?: string;
  videoUrl?: string;
  textEssay?: string;
  description: string;
  submittedAt: string;
  likes: number;
  isFeatured?: boolean;
  status?: 'pending' | 'approved' | 'rejected';
}

export interface FanMessage {
  id: string;
  userId: string;
  senderName: string;
  photoURL?: string | null;
  isAnonymous: boolean;
  message: string;
  createdAt: string;
  likes: number;
}

export interface HeroPhoto {
  id: string;
  name: string;
  tag: string;
  url: string;
  fallback: string;
}

export interface SocialProfileCard {
  platform: 'instagram' | 'twitter' | 'youtube';
  name: string;
  handle: string;
  avatar: string;
  verified: boolean;
  badgeTitle: string;
  statusHighlight: string;
  followers?: number;
  followersDisplay?: string;
  following?: string;
  postsCount?: string;
  growth?: string;
  bio: string;
  category: string;
  profileUrl: string;
  themeGradient: string;
  badgeBg: string;
  borderHover: string;
  isApifyLive?: boolean;
  isXLive?: boolean;
}

export interface ResilienceContent {
  title: string;
  subtitle: string;
  quote: string;
  paragraphs: string[];
}
