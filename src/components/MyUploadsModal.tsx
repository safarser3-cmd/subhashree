import React, { useEffect, useState } from 'react';
import { FanArtSubmission } from '../types';
import { X, Image, AlertCircle, Clock, CheckCircle2, XCircle, LayoutDashboard } from 'lucide-react';
import { auth } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

interface MyUploadsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MyUploadsModal: React.FC<MyUploadsModalProps> = ({ isOpen, onClose }) => {
  const [user] = useAuthState(auth);
  const [uploads, setUploads] = useState<FanArtSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const fetchUploads = async () => {
      if (!user || !isOpen) return;
      setIsLoading(true);
      setError(null);
      try {
        const token = await user.getIdToken();
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const res = await fetch(`${apiUrl}/api/interactions/fanart/my-uploads`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setUploads(data.data);
        } else {
          setError(data.reason || 'Failed to fetch uploads.');
        }
      } catch (err: any) {
        setError(err.message || 'Network error fetching uploads.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUploads();
  }, [user, isOpen]);

  if (!isOpen) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
            <Clock className="w-3.5 h-3.5" /> Pending
          </div>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full bg-[#13151c] rounded-3xl overflow-hidden border border-white/20 shadow-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#181a24]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-syne text-lg font-bold text-white">
                Creator Panel
              </h3>
              <p className="text-xs text-slate-400 font-sans">
                Manage and track your submitted fan art
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {!user ? (
            <div className="py-12 text-center">
              <p className="text-slate-400 font-sans">Please sign in to view your uploads.</p>
            </div>
          ) : isLoading ? (
            <div className="py-12 flex justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
            </div>
          ) : error ? (
            <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center gap-2 text-rose-300 text-sm">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          ) : uploads.length === 0 ? (
            <div className="py-24 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto border border-white/10">
                <Image className="w-8 h-8 text-slate-400" />
              </div>
              <h4 className="font-syne text-xl text-white">No Uploads Yet</h4>
              <p className="text-slate-400 font-sans text-sm">
                You haven't submitted any fan art yet. Click "Submit Fan Art" to get started!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {uploads.map((art) => {
                // Fix old URLs that had /pending/ incorrectly returned by the worker
                const displayUrl = art.imageUrl?.replace('/pending/', '/fanart/');
                return (
                <div key={art.id} className="group relative rounded-2xl bg-white/5 border border-white/10 overflow-hidden flex flex-col">
                  <div className="aspect-[4/5] bg-black relative">
                    {displayUrl ? (
                      <img src={displayUrl} alt={art.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-300 bg-white/5">
                        <p className="text-xs line-clamp-6 italic font-medium">"{art.textEssay}"</p>
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      {getStatusBadge(art.status || 'pending')}
                    </div>
                  </div>
                  <div className="p-4 bg-[#181a24]">
                    <h4 className="text-white font-bold text-sm truncate" title={art.title}>{art.title}</h4>
                    <p className="text-slate-400 text-xs mt-1 truncate">
                      Submitted on {new Date(art.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
