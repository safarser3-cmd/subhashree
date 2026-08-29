import { GalleryItem, NewsItem, SocialPost, FanMessage } from '../types';

export const INFLUENCER_PROFILE = {
  name: 'Shubhashree Sahu',
  tagline: 'Fashion Creator, Heritage Style Icon & Digital Muse',
  bio: 'Inspiring millions across social media with graceful ethnic drapes, modern editorial fashion, compassionate philanthropy, and genuine positive energy.',
  followers: '2.4M+',
  engagementRate: '8.7%',
  totalLikes: '45M+',
  communityCount: '120K+',
  location: 'Bhubaneswar / Mumbai, India',
  platforms: {
    instagram: 'https://instagram.com/subhaslyf',
    youtube: 'https://youtube.com/@subhaback',
    twitter: 'https://x.com/againsubha'
  }
};

const R2_BASE = 'https://pub-f5a2d26958f94a9692b716b327178122.r2.dev/Subhashree%20home%20page';

export const GALLERY_ITEMS: GalleryItem[] = [];

export const NEWS_UPDATES: NewsItem[] = [
  {
    id: 'news-1',
    title: 'Traditional Handloom Showcase: Spotlight on Sambalpuri Silk & Handcrafted Weaves',
    summary: 'Highlighting the heritage of Odisha weavers through traditional Ikat silk styling, intricate motifs, and cultural aesthetic appreciation.',
    fullStory: 'Shubhashree continues to highlight regional Indian handlooms in her creative work, spotlighting authentic Sambalpuri bandha sarees and traditional Odisha textile craftsmanship. By pairing heritage drapes with contemporary styling, she brings cultural handlooms into modern digital fashion dialogues.',
    category: 'Fashion & Style',
    date: 'Recent Update',
    readTime: '3 min read',
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1000&q=80',
    author: 'Creator Content Team',
    quote: '“Traditional handlooms carry generations of artistry and soul in every thread.”'
  },
  {
    id: 'news-2',
    title: 'Digital Creator Channel Update: Lifestyle, Fashion Lookbooks & Creative Visuals',
    summary: 'New creative photo and video content exploring contemporary styling, traditional aesthetics, and personal creative expression.',
    fullStory: 'Exploring a diverse spectrum of fashion concepts ranging from vibrant festive attire to minimalist everyday looks, Shubhashree shares regular visual styling lookbooks, behind-the-scenes moments, and lifestyle content across her official social media channels.',
    category: 'Fashion & Style',
    date: 'Recent Update',
    readTime: '3 min read',
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80',
    author: 'Editorial Desk',
    quote: '“Authenticity and creative expression are the heart of connecting with people.”'
  },
  {
    id: 'news-3',
    title: 'Advocating Digital Empathy & Respect in Online Creator Spaces',
    summary: 'Spreading positive messages on mental resilience, constructive community behavior, and standing against cyberbullying.',
    fullStory: 'Using her digital platform to foster a supportive and respectful online environment, Shubhashree regularly reminds followers about the importance of empathy, kindness, and mental well-being in digital spaces, urging internet users to choose understanding over hate.',
    category: 'Milestones',
    date: 'Community Note',
    readTime: '2 min read',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=80',
    author: 'Community Team',
    quote: '“Behind every screen is a real person. Let kindness and empathy always lead our words.”'
  },
  {
    id: 'news-4',
    title: 'Community Engagement: Connecting with Supporters & Celebrating Fan Creativity',
    summary: 'Appreciating fan artwork, heartfelt community messages, and dedicated digital creators across platforms.',
    fullStory: 'From fan art illustrations and thoughtful messages to collaborative community edits, Shubhashree regularly acknowledges and celebrates the immense creativity and positivity shared by her supporters across social media platforms.',
    category: 'Milestones',
    date: 'Community Update',
    readTime: '2 min read',
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1000&q=80',
    author: 'Community Desk',
    quote: '“Grateful for every thoughtful edit, message, and piece of art shared by the community.”'
  }
];

export const SOCIAL_POSTS: SocialPost[] = [
  {
    id: 'soc-1',
    platform: 'instagram',
    handle: '@subhaslyf',
    authorName: 'Shubhashree Sahu',
    avatarUrl: '/assets/avatar.jpg',
    publishedAt: 'Recently',
    caption: 'Recent Instagram Reel 🌸',
    mediaUrl: `<blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="https://www.instagram.com/reel/DcbGKcgJbNO/?utm_source=ig_embed&amp;utm_campaign=loading" data-instgrm-version="14" style=" background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:540px; min-width:326px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);"><div style="padding:16px;"> <a href="https://www.instagram.com/reel/DcbGKcgJbNO/?utm_source=ig_embed&amp;utm_campaign=loading" style=" background:#FFFFFF; line-height:0; padding:0 0; text-align:center; text-decoration:none; width:100%;" target="_blank"> <div style=" display: flex; flex-direction: row; align-items: center;"> <div style="background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 40px; margin-right: 14px; width: 40px;"></div> <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center;"> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 100px;"></div> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 60px;"></div></div></div><div style="padding: 19% 0;"></div> <div style="display:block; height:50px; margin:0 auto 12px; width:50px;"><svg width="50px" height="50px" viewBox="0 0 60 60" version="1.1" xmlns="https://www.w3.org/2000/svg" xmlns:xlink="https://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-511.000000, -20.000000)" fill="#000000"><g><path d="M556.869,30.41 C554.814,30.41 553.148,32.076 553.148,34.131 C553.148,36.186 554.814,37.852 556.869,37.852 C558.924,37.852 560.59,36.186 560.59,34.131 C560.59,32.076 558.924,30.41 556.869,30.41 M541,60.657 C535.114,60.657 530.342,55.887 530.342,50 C530.342,44.114 535.114,39.342 541,39.342 C546.887,39.342 551.658,44.114 551.658,50 C551.658,55.887 546.887,60.657 541,60.657 M541,33.886 C532.1,33.886 524.886,41.1 524.886,50 C524.886,58.899 532.1,66.113 541,66.113 C549.9,66.113 557.115,58.899 557.115,50 C557.115,41.1 549.9,33.886 541,33.886 M565.378,62.101 C565.244,65.022 564.756,66.606 564.346,67.663 C563.803,69.06 563.154,70.057 562.106,71.106 C561.058,72.155 560.06,72.803 558.662,73.347 C557.607,73.757 556.021,74.244 553.102,74.378 C549.944,74.521 548.997,74.552 541,74.552 C533.003,74.552 532.056,74.521 528.898,74.378 C525.979,74.244 524.393,73.757 523.338,73.347 C521.94,72.803 520.942,72.155 519.894,71.106 C518.846,70.057 518.197,69.06 517.654,67.663 C517.244,66.606 516.755,65.022 516.623,62.101 C516.479,58.943 516.448,57.996 516.448,50 C516.448,42.003 516.479,41.056 516.623,37.899 C516.755,34.978 517.244,33.391 517.654,32.338 C518.197,30.938 518.846,29.942 519.894,28.894 C520.942,27.846 521.94,27.196 523.338,26.654 C524.393,26.244 525.979,25.756 528.898,25.623 C532.057,25.479 533.004,25.448 541,25.448 C548.997,25.448 549.943,25.479 553.102,25.623 C556.021,25.756 557.607,26.244 558.662,26.654 C560.06,27.196 561.058,27.846 562.106,28.894 C563.154,29.942 563.803,30.938 564.346,32.338 C564.756,33.391 565.244,34.978 565.378,37.899 C565.522,41.056 565.552,42.003 565.552,50 C565.552,57.996 565.522,58.943 565.378,62.101 M570.82,37.631 C570.674,34.438 570.167,32.258 569.425,30.349 C568.659,28.377 567.633,26.702 565.965,25.035 C564.297,23.368 562.623,22.342 560.652,21.575 C558.743,20.834 556.562,20.326 553.369,20.18 C550.169,20.033 549.148,20 541,20 C532.853,20 531.831,20.033 528.631,20.18 C525.438,20.326 523.257,20.834 521.349,21.575 C519.376,22.342 517.703,23.368 516.035,25.035 C514.368,26.702 513.342,28.377 512.574,30.349 C511.834,32.258 511.326,34.438 511.181,37.631 C511.035,40.831 511,41.851 511,50 C511,58.147 511.035,59.17 511.181,62.369 C511.326,65.562 511.834,67.743 512.574,69.651 C513.342,71.625 514.368,73.296 516.035,74.965 C517.703,76.634 519.376,77.658 521.349,78.425 C523.257,79.167 525.438,79.673 528.631,79.82 C531.831,79.965 532.853,80.001 541,80.001 C549.148,80.001 550.169,79.965 553.369,79.82 C556.562,79.673 558.743,79.167 560.652,78.425 C562.623,77.658 564.297,76.634 565.965,74.965 C567.633,73.296 568.659,71.625 569.425,69.651 C570.167,67.743 570.674,65.562 570.82,62.369 C570.966,59.17 571,58.147 571,50 C571,41.851 570.966,40.831 570.82,37.631"></path></g></g></g></svg></div><div style="padding-top: 8px;"> <div style=" color:#3897f0; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:550; line-height:18px;">View this post on Instagram</div></div><div style="padding: 12.5% 0;"></div> <div style="display: flex; flex-direction: row; margin-bottom: 14px; align-items: center;"><div> <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(0px) translateY(7px);"></div> <div style="background-color: #F4F4F4; height: 12.5px; transform: rotate(-45deg) translateX(3px) translateY(1px); width: 12.5px; flex-grow: 0; margin-right: 14px; margin-left: 2px;"></div> <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(9px) translateY(-18px);"></div></div><div style="margin-left: 8px;"> <div style=" background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 20px; width: 20px;"></div> <div style=" width: 0; height: 0; border-top: 2px solid transparent; border-left: 6px solid #f4f4f4; border-bottom: 2px solid transparent; transform: translateX(16px) translateY(-4px) rotate(30deg)"></div></div><div style="margin-left: auto;"> <div style=" width: 0px; border-top: 8px solid #F4F4F4; border-right: 8px solid transparent; transform: translateY(16px);"></div> <div style=" background-color: #F4F4F4; flex-grow: 0; height: 12px; width: 16px; transform: translateY(-4px);"></div> <div style=" width: 0; height: 0; border-top: 8px solid #F4F4F4; border-left: 8px solid transparent; transform: translateY(-4px) translateX(8px);"></div></div></div> <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center; margin-bottom: 24px;"> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 224px;"></div> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 144px;"></div></div></a><p style=" color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; line-height:17px; margin-bottom:0; margin-top:8px; overflow:hidden; padding:8px 0 7px; text-align:center; text-overflow:ellipsis; white-space:nowrap;"><a href="https://www.instagram.com/reel/DcbGKcgJbNO/?utm_source=ig_embed&amp;utm_campaign=loading" style=" color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:normal; line-height:17px; text-decoration:none;" target="_blank">A post shared by Subhashree Sahu (@subhaslyf)</a></p></div></blockquote>`,
    mediaType: 'video_embed',
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    tags: ['#RecentPost', '#InstagramReel'],
    comments: []
  }
];

export const INITIAL_FAN_MESSAGES: FanMessage[] = [
  {
    id: 'msg-1',
    senderName: 'Pooja Verma',
    location: 'Delhi, India',
    message: 'Shubhashree Didi, your styling videos give me so much confidence to rock traditional sarees to my college events! You are such a radiant soul, always stay blessed!',
    badge: 'Superfan',
    avatarColor: '#f43f5e',
    createdAt: 'Today at 10:30 AM',
    likes: 142
  },
  {
    id: 'msg-2',
    senderName: 'Manish & Team Odisha Fanclub',
    location: 'Bhubaneswar, Odisha',
    message: 'So proud to see an Odia creator representing our culture, handlooms, and values with so much class on the national and global stage! Keep flying high!',
    badge: 'Devoted Supporter',
    avatarColor: '#8b5cf6',
    createdAt: 'Yesterday at 4:15 PM',
    likes: 310
  },
  {
    id: 'msg-3',
    senderName: 'Ayesha Rahman',
    location: 'London, UK',
    message: 'Following your fashion journey all the way from London! Love your calm energy, candid vlogs, and how genuinely you interact with all your fans!',
    badge: 'VIP Fan',
    avatarColor: '#ec4899',
    createdAt: '2 days ago',
    likes: 98
  },
  {
    id: 'msg-4',
    senderName: 'Vikramaditya Rao',
    location: 'Bengaluru, India',
    message: 'Your charity campaigns and tree planting drives show that true influence is used for good. Truly an inspiration for our generation!',
    badge: 'Art Enthusiast',
    avatarColor: '#f59e0b',
    createdAt: '3 days ago',
    likes: 185
  }
];

export const FAN_FACTS = [
  {
    title: 'Signature Style',
    desc: 'Handloom Sambalpuri & Tussar Sarees paired with oxidised silver jewelry and minimalist dewy makeup.',
    icon: 'Sparkles'
  },
  {
    title: 'Philanthropy',
    desc: 'Actively funds education for weaver communities and led the 10,000+ sapling planting initiative.',
    icon: 'Heart'
  },
  {
    title: 'Creative Passion',
    desc: 'Loves classical Odissi music, botanical sketching, literature, and architectural heritage travel.',
    icon: 'Feather'
  },
  {
    title: 'Community First',
    desc: 'Known for holding interactive live Q&As and featuring fan art on her official social channels.',
    icon: 'Users'
  }
];
