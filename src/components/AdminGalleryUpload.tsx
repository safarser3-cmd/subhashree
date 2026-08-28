import React, { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { GalleryItem } from '../types';
import { addGalleryItemInFirestore } from '../lib/firestoreService';

export default function AdminGalleryUpload() {
  const [isOpen, setIsOpen] = useState(false);
  const [adminUploadData, setAdminUploadData] = useState({
    title: '',
    imageUrl: '',
    category: 'Photoshoots',
    aspectRatio: '16:9',
    caption: '',
    orientation: 'desktop'
  });

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newId = `gal-${Date.now()}`;
      const newItem: GalleryItem = {
        id: newId,
        title: adminUploadData.title,
        category: adminUploadData.category as any,
        imageUrl: adminUploadData.imageUrl,
        date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        aspectRatio: adminUploadData.aspectRatio as any,
        orientation: adminUploadData.orientation as any,
        resolution: 'Original R2 Quality',
        caption: adminUploadData.caption,
        likes: 0,
        tags: [adminUploadData.category, 'Official']
      };
      await addGalleryItemInFirestore(newItem);
      setIsOpen(false);
      setAdminUploadData({ ...adminUploadData, title: '', imageUrl: '', caption: '' });
      alert("Successfully added to gallery!");
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 hover:from-emerald-500/30 hover:to-emerald-600/30 border border-emerald-500/30 text-emerald-400 font-bold text-sm shadow-[0_0_15px_rgba(16,185,129,0.15)] flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap"
      >
        <Sparkles className="w-4 h-4" />
        Upload from R2
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#13151c] rounded-2xl w-full max-w-md border border-white/10 overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-syne text-lg font-bold text-emerald-400">Add New R2 Image</h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAdminSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">R2 Public Image URL *</label>
                <input
                  required
                  type="url"
                  value={adminUploadData.imageUrl}
                  onChange={(e) => setAdminUploadData({ ...adminUploadData, imageUrl: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white"
                  placeholder="https://pub-..."
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Title *</label>
                <input
                  required
                  type="text"
                  value={adminUploadData.title}
                  onChange={(e) => setAdminUploadData({ ...adminUploadData, title: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Caption</label>
                <input
                  type="text"
                  value={adminUploadData.caption}
                  onChange={(e) => setAdminUploadData({ ...adminUploadData, caption: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Orientation</label>
                  <select
                    value={adminUploadData.orientation}
                    onChange={(e) => setAdminUploadData({ ...adminUploadData, orientation: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white"
                  >
                    <option value="desktop">Desktop</option>
                    <option value="mobile">Mobile</option>
                    <option value="square">Square</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Aspect Ratio</label>
                  <select
                    value={adminUploadData.aspectRatio}
                    onChange={(e) => setAdminUploadData({ ...adminUploadData, aspectRatio: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white"
                  >
                    <option value="16:9">16:9</option>
                    <option value="9:16">9:16</option>
                    <option value="1:1">1:1</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3 mt-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition-colors cursor-pointer"
              >
                Upload to Gallery
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
