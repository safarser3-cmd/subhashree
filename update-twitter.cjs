const fs = require('fs');

const content = fs.readFileSync('src/data/shubhashreeData.ts', 'utf8');

const post1Url = `<blockquote class="twitter-tweet"><p lang="en" dir="ltr">I’m seeing all the love you’re showing through the reels, memes, videos and messages 🥹 It genuinely means more than I can explain. These hard times have made me realise just how much love and support I have from all of you.<br><br>©️ and please be aware of fake accounts that are… <a href="https://t.co/6fPfa4PZd2">pic.twitter.com/6fPfa4PZd2</a></p>&mdash; Subhashree Sahu (@againsubha) <a href="https://x.com/againsubha/status/2089311293627146519?ref_src=twsrc%5Etfw">August 17, 2026</a></blockquote>`;

const post2Url = `<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Growing up in Odisha, I&#39;ve seen poverty up close. I&#39;ve seen children begging at traffic lights instead of being in schools. I&#39;ve seen elderly people forced to ask strangers for food just to survive another day. It broke my heart then, and it breaks my heart now.<br><br>But heartbreak…</p>&mdash; Subhashree Sahu (@againsubha) <a href="https://x.com/againsubha/status/2058054384366579757?ref_src=twsrc%5Etfw">May 23, 2026</a></blockquote>`;

const twitterPosts = `  {
    id: 'soc-tw-1',
    platform: 'twitter',
    handle: '@againsubha',
    authorName: 'Subhashree Sahu',
    avatarUrl: '/assets/avatar.jpg',
    publishedAt: 'August 17, 2026',
    caption: '',
    mediaUrl: \`${post1Url}\`,
    mediaType: 'video_embed',
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    tags: [],
    comments: []
  },
  {
    id: 'soc-tw-2',
    platform: 'twitter',
    handle: '@againsubha',
    authorName: 'Subhashree Sahu',
    avatarUrl: '/assets/avatar.jpg',
    publishedAt: 'May 23, 2026',
    caption: '',
    mediaUrl: \`${post2Url}\`,
    mediaType: 'video_embed',
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    tags: [],
    comments: []
  },`;

const searchStr = `export const SOCIAL_POSTS: SocialPost[] = [\n`;
if (content.includes(searchStr)) {
  const newContent = content.replace(searchStr, searchStr + twitterPosts + '\n');
  fs.writeFileSync('src/data/shubhashreeData.ts', newContent);
  console.log('Twitter posts added');
} else {
  console.log('Could not find SOCIAL_POSTS start array');
}
