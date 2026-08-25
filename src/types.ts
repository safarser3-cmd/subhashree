export interface GalleryItem {
  id: string;
  title: string;
  category: 'Photoshoots' | 'Traditional Sarees' | 'Casual & Travel' | 'Red Carpet & Events' | 'Portraits';
  imageUrl: string;
  date: string;
  aspectRatio?: string;
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
  mediaType: 'image' | 'video_embed' | 'quote_card';
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
  imageUrl?: string;
  videoUrl?: string;
  textEssay?: string;
  description: string;
  submittedAt: string;
  likes: number;
  isFeatured?: boolean;
}

export interface FanMessage {
  id: string;
  senderName: string;
  location: string;
  message: string;
  badge: 'Superfan' | 'VIP Fan' | 'Art Enthusiast' | 'Devoted Supporter' | 'Style Lover';
  avatarColor: string;
  createdAt: string;
  likes: number;
}

