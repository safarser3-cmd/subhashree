import { GalleryItem, NewsItem, SocialPost, FanArtSubmission, FanMessage } from '../types';

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

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'gal-1',
    title: 'Ethereal Crimson & Gold Silk Drape',
    category: 'Traditional Sarees',
    imageUrl: `${R2_BASE}/hero1.jpg`,
    date: 'February 2025',
    caption: 'Classic handloom Sambalpuri saree paired with temple silver jewelry and delicate jasmine blooms.',
    photographerOrLocation: 'Heritage Palace Studio, Bhubaneswar',
    likes: 4210,
    tags: ['Handloom', 'SareeGoals', 'TraditionalElegance', 'OdiaHeritage']
  },
  {
    id: 'gal-2',
    title: 'Sunset Luminescence & High Fashion',
    category: 'Photoshoots',
    imageUrl: `${R2_BASE}/hero2.jpg`,
    date: 'January 2025',
    caption: 'Golden hour studio editorial capturing warm natural light, soft glow makeup, and sleek minimalist styling.',
    photographerOrLocation: 'Vogue Studio Mumbai',
    likes: 5890,
    tags: ['Editorial', 'GoldenHour', 'BeautyPortrait', 'MinimalGlam']
  },
  {
    id: 'gal-3',
    title: 'Modern Noir Elegance & Tailored Power',
    category: 'Red Carpet & Events',
    imageUrl: `${R2_BASE}/hero3.jpg`,
    date: 'December 2024',
    caption: 'Monochrome red carpet look showcasing sleek blazer styling with diamond ear cuffs and bold confidence.',
    photographerOrLocation: 'Digital Creator Awards Night',
    likes: 6730,
    tags: ['RedCarpet', 'PowerDressing', 'Monochrome', 'CelebrityStyle']
  },
  {
    id: 'gal-4',
    title: 'Casual Parisian Café Vibes & Trench Coat',
    category: 'Casual & Travel',
    imageUrl: `${R2_BASE}/hero4.jpg`,
    date: 'November 2024',
    caption: 'Effortless travel style in neutral beige tones with a warm cup of mocha and candid morning smiles.',
    photographerOrLocation: 'Travel Diary • Paris Edition',
    likes: 7120,
    tags: ['TravelAesthetic', 'StreetStyle', 'CoffeeMoments', 'Wanderlust']
  },
  {
    id: 'gal-5',
    title: 'Verdant Meadow & Pastel Linen Bloom',
    category: 'Casual & Travel',
    imageUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=1200&q=85',
    date: 'October 2024',
    caption: 'Embracing nature in breezy floral pastels, celebrating sustainability and mindful living.',
    photographerOrLocation: 'Botanical Sanctuary, Bengaluru',
    likes: 3840,
    tags: ['EcoFashion', 'FloralVibes', 'PastelAesthetic', 'MindfulLiving']
  },
  {
    id: 'gal-6',
    title: 'Close-Up Radiance & Flawless Dewy Glow',
    category: 'Portraits',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=85',
    date: 'September 2024',
    caption: 'High-definition portrait accentuating her warm smile, soft eyes, and natural grace.',
    photographerOrLocation: 'Natural Light Portrait Sessions',
    likes: 8940,
    tags: ['DewyGlow', 'NaturalBeauty', 'SmileEnergy', 'PortraitPhotography']
  },
  {
    id: 'gal-7',
    title: 'Midnight Royal Blue Zari Lehenga',
    category: 'Traditional Sarees',
    imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85',
    date: 'Diwali Gala 2024',
    caption: 'Festive glamour in handcrafted midnight blue velvet with intricate gold zari embroidery.',
    photographerOrLocation: 'Festive Lights Campaign',
    likes: 9420,
    tags: ['FestiveFashion', 'RoyalBlue', 'LehengaLook', 'DesiGlam']
  },
  {
    id: 'gal-8',
    title: 'Urban Chic & Sunset Skyline',
    category: 'Photoshoots',
    imageUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1200&q=85',
    date: 'August 2024',
    caption: 'City skyline rooftop editorial with modern accessories and dynamic windblown movement.',
    photographerOrLocation: 'Rooftop Series Mumbai',
    likes: 5120,
    tags: ['UrbanVibes', 'Skyline', 'ModernChic', 'FashionLookbook']
  }
];

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
    publishedAt: '2 hours ago',
    caption: 'Sunday mornings are for fresh filter coffee, cotton sarees, and peaceful journaling ☕🌸 What is one little thing that made you smile today?',
    mediaUrl: `${R2_BASE}/hero1.jpg`,
    mediaType: 'image',
    likesCount: 94200,
    commentsCount: 3840,
    sharesCount: 2190,
    tags: ['#DesiAesthetic', '#SundayVibes', '#CottonSaree', '#PositiveEnergy'],
    comments: [
      { id: 'c1', user: 'priya_styles', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80', text: 'You look so breathtaking in traditional drapes! Saree queen forever ❤️', time: '1h ago' },
      { id: 'c2', user: 'rohit_creatives', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=100&q=80', text: 'Your caption brought so much peace to my busy day. Stay blessed Shubhashree!', time: '35m ago' }
    ]
  },
  {
    id: 'soc-2',
    platform: 'youtube',
    handle: '@subhaback',
    authorName: 'Shubhashree Sahu',
    avatarUrl: '/assets/avatar.jpg',
    publishedAt: 'Yesterday',
    caption: 'NEW VLOG 🎥: "Get Ready With Me for the Creator Gala + What I Eat in a Day & Q&A!" Tap link to watch in 4K!',
    mediaUrl: `${R2_BASE}/hero3.jpg`,
    mediaType: 'image',
    likesCount: 142000,
    commentsCount: 6200,
    sharesCount: 5100,
    tags: ['#GRWM', '#CreatorGala', '#VlogLife', '#YouTubeCreators'],
    comments: [
      { id: 'c3', user: 'ananya_fan', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80', text: 'Watched the whole video! That red carpet outfit was unreal! ✨', time: '12h ago' }
    ]
  },
  {
    id: 'soc-3',
    platform: 'instagram',
    handle: '@subhaslyf',
    authorName: 'Shubhashree Sahu',
    avatarUrl: '/assets/avatar.jpg',
    publishedAt: '2 days ago',
    caption: 'Gentle reminder: You do not need to have everything figured out right now. Take small steps, trust your journey, and never compromise your inner peace for anyone’s validation. ✨',
    mediaType: 'quote_card',
    likesCount: 48900,
    commentsCount: 2310,
    sharesCount: 1840,
    tags: ['#Mindset', '#SelfWorth', '#PeaceOfMind', '#DailyWisdom'],
    comments: [
      { id: 'c4', user: 'kavita_edits', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=100&q=80', text: 'I really needed to hear this today. Thank you for your warmth and positivity Didi ❤️', time: '1d ago' }
    ]
  },
  {
    id: 'soc-4',
    platform: 'twitter',
    handle: '@againsubha',
    authorName: 'Shubhashree Sahu',
    avatarUrl: '/assets/avatar.jpg',
    publishedAt: '3 days ago',
    caption: 'Sneak peek of the upcoming festive shoot with our amazing handloom weavers! Can’t wait to share the magic we created together! 🧵💫 Stay tuned!',
    mediaType: 'quote_card',
    likesCount: 31200,
    commentsCount: 1420,
    sharesCount: 960,
    tags: ['#HandloomFashion', '#SneakPeek', '#DesiVibes'],
    comments: [
      { id: 'c5', user: 'rahul_b', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80', text: 'Always championing traditional art. Huge respect!', time: '2d ago' }
    ]
  }
];

export const INITIAL_FAN_ART: FanArtSubmission[] = [
  {
    id: 'art-1',
    title: 'Golden Sunset Glow Vector Art',
    artistName: 'Sneha Patel',
    artistHandle: '@sneha_vectorart',
    category: 'Digital Illustration',
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1000&q=80',
    description: 'A vibrant digital portrait blending synthwave warm sunset tones with Shubhashree’s iconic smile and traditional silver jhumkas.',
    submittedAt: '2 days ago',
    likes: 840,
    isFeatured: true
  },
  {
    id: 'art-2',
    title: 'Charcoal & Graphite Portrait Study',
    artistName: 'Arjun Das',
    artistHandle: '@arjun_sketches',
    category: 'Pencil Sketch',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=80',
    description: 'A realistic 8B graphite pencil sketch focusing on her eyes, gentle expression, and handloom saree drape textures.',
    submittedAt: '4 days ago',
    likes: 1210,
    isFeatured: true
  },
  {
    id: 'art-3',
    title: 'Cinematic 4K Video Edit & Tribute Reel',
    artistName: 'Rohan Edits FX',
    artistHandle: '@rohan_vfx_edits',
    category: 'Video Edit & Reel',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    description: 'A smooth, fast-paced transition edit sync’d to ambient lo-fi beats showcasing her top 2024 fashion looks and smile moments.',
    submittedAt: '1 week ago',
    likes: 1950,
    isFeatured: true
  },
  {
    id: 'art-4',
    title: 'Words of Admiration: The Light You Share',
    artistName: 'Tanvi Mohanty',
    artistHandle: '@tanvi_poetry',
    category: 'Poetry & Words',
    textEssay: `In every frame, a gentle grace she weaves,
Like sunlight dancing through the autumn leaves.
With humble heart and roots running deep,
A legacy of kindness that our hearts will keep.
Shine on, Shubhashree — inspiring dreamers near and far!`,
    description: 'A heartfelt community tribute poem celebrating her authenticity, smile, and positive impact.',
    submittedAt: '2 weeks ago',
    likes: 670,
    isFeatured: false
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
