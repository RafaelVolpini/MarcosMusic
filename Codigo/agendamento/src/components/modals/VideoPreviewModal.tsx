import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { UploadModuloDTO } from '../../services/moduloService';

export interface VideoPreviewModalProps {
  video: UploadModuloDTO | null;
  onClose: () => void;
}

export function VideoPreviewModal({ video, onClose }: VideoPreviewModalProps) {
  const url = video?.url ?? '';
  const isYouTube = /(?:youtube\.com|youtu\.be)/i.test(url);

  const getYouTubeEmbed = (rawUrl: string) => {
    const id =
      rawUrl.match(/v=([^&]+)/)?.[1] ||
      rawUrl.match(/youtu\.be\/([^?]+)/)?.[1] ||
      rawUrl.match(/embed\/([^?]+)/)?.[1];
    return id ? `https://www.youtube.com/embed/${id}` : '';
  };

  const embedUrl = isYouTube ? getYouTubeEmbed(url) : '';

  return (
    <AnimatePresence>
      {video && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-998"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-999 flex items-center justify-center p-6 pointer-events-none"
          >
            <div className="bg-black rounded-2xl overflow-hidden w-full max-w-3xl pointer-events-auto">
              <div className="flex items-center justify-between px-4 py-3 bg-gray-900">
                <p className="text-sm text-white font-medium">{video.nome}</p>
                <button onClick={onClose} className="text-gray-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <div className="aspect-video bg-black flex items-center justify-center">
                {isYouTube && embedUrl ? (
                  <iframe
                    className="w-full h-full"
                    src={embedUrl}
                    title={video.nome}
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    className="w-full h-full"
                    src={url}
                    controls
                    playsInline
                  />
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}