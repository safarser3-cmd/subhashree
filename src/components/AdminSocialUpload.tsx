import React, { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { SocialPost } from '../types';
import { addSocialPostToFirestore } from '../lib/firestoreService';

export default function AdminSocialUpload() {
  const [isOpen, setIsOpen] = useState(false);
  const [uploadData, setUploadData] = useState({
    platform: 'instagram',
    mediaType: 'video_embed',
    caption: '',
    mediaUrl: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newId = `post-${Date.now()}`;
      const newPost: SocialPost = {
        id: newId,
        platform: uploadData.platform as 'instagram' | 'youtube' | 'twitter',
        handle: '@subhaslyf',
        authorName: 'Shubhashree Sahu',
        avatarUrl: '/assets/avatar.jpg',
        publishedAt: 'Just now',
        caption: uploadData.caption || 'New post',
        mediaUrl: uploadData.mediaUrl,
        mediaType: uploadData.mediaType as 'image' | 'video_embed' | 'quote_card',
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        tags: [],
        comments: []
      };

      await addSocialPostToFirestore(newPost);
      setIsOpen(false);
      setUploadData({ ...uploadData, mediaUrl: '', caption: '' });
      alert("Successfully added to Social Feed!");
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full sm:w-auto px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 hover:from-emerald-500/30 hover:to-emerald-600/30 border border-emerald-500/30 text-emerald-400 font-bold text-xs shadow-[0_0_15px_rgba(16,185,129,0.15)] flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
      >
        <Sparkles className="w-3.5 h-3.5" />
        Add Social Post
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#13151c] rounded-2xl w-full max-w-md border border-white/10 overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-syne text-lg font-bold text-emerald-400">Add Social Post</h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Platform *</label>
                <select
                  value={uploadData.platform}
                  onChange={(e) => setUploadData({ ...uploadData, platform: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white"
                >
                  <option value="instagram">Instagram</option>
                  <option value="youtube">YouTube</option>
                  <option value="twitter">X (Twitter)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs text-slate-400 mb-1">Content Type *</label>
                <select
                  value={uploadData.mediaType}
                  onChange={(e) => setUploadData({ ...uploadData, mediaType: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white"
                >
                  <option value="video_embed">Raw Embed Code (HTML)</option>
                  <option value="image">Direct Image/Video URL</option>
                  <option value="quote_card">Text Only / Quote</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  {uploadData.mediaType === 'video_embed' ? 'Embed HTML Code' : 'Media URL'}
                </label>
                {uploadData.mediaType === 'video_embed' ? (
                  <textarea
                    required
                    value={uploadData.mediaUrl}
                    onChange={(e) => setUploadData({ ...uploadData, mediaUrl: e.target.value })}
                    className="w-full h-32 bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white font-mono"
                    placeholder="<blockquote class='instagram-media'..."
                  />
                ) : (
                  <input
                    type="url"
                    value={uploadData.mediaUrl}
                    onChange={(e) => setUploadData({ ...uploadData, mediaUrl: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white"
                    placeholder="https://..."
                  />
                )}
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Optional Short Caption</label>
                <input
                  type="text"
                  value={uploadData.caption}
                  onChange={(e) => setUploadData({ ...uploadData, caption: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white"
                />
              </div>
              
              <button
                type="submit"
                className="w-full py-3 mt-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition-colors cursor-pointer"
              >
                Post to Feed
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
