import { AnimatePresence, motion } from 'framer-motion';
import { X, Film } from 'lucide-react';
import type { VideoRecording } from '../../types';

export interface VideoPreviewModalProps {
  activeVideo: string | null;
  videos: VideoRecording[];
  onClose: () => void;
}

export function VideoPreviewModal({ activeVideo, videos, onClose }: VideoPreviewModalProps) {
  return (
    <AnimatePresence>
      {activeVideo && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[80]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-6 pointer-events-none"
          >
            <div className="bg-black rounded-2xl overflow-hidden w-full max-w-3xl pointer-events-auto">
              <div className="flex items-center justify-between px-4 py-3 bg-gray-900">
                <p className="text-sm text-white font-medium">
                  {videos.find(v => v.id === activeVideo)?.title}
                </p>
                <button onClick={onClose} className="text-gray-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>
              <div className="aspect-video bg-linear-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <Film size={48} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm">Preview do vídeo</p>
                  <p className="text-xs mt-1 opacity-60">O vídeo seria exibido aqui com um player real</p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
