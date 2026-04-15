import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Video, Film, Clock, HardDrive, ExternalLink, X, UploadCloud } from 'lucide-react';
import type { VideoRecording } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { formatBytes, formatSeconds } from '../../utils';

interface VideoPageProps {
  videos: VideoRecording[];
}

export function VideoPage({ videos }: VideoPageProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedName, setUploadedName] = useState('');
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [meetLink, setMeetLink] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const simulateUpload = (name: string) => {
    setUploading(true);
    setUploadedName(name);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => setUploading(false), 600);
          return 100;
        }
        return p + Math.random() * 15;
      });
    }, 200);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) simulateUpload(file.name);
  };

  const generateMeet = () => {
    const seg = (n: number) => Array.from({ length: n }, () => 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]).join('');
    setMeetLink(`https://meet.google.com/${seg(3)}-${seg(4)}-${seg(3)}`);
  };

  return (
    <div className="page-padding space-y-6">
      {/* Top section: Join/Create Meet */}
      <Card className="p-5 app-surface">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="flex-1 min-w-64">
            <h3 className="text-sm font-semibold text-[var(--heading)] mb-1">Criar Aula Online</h3>
            <p className="text-xs text-[var(--muted)] mb-3">Gere um link Google Meet instantâneo para sua aula</p>
            <div className="flex gap-2">
              <Button onClick={generateMeet}>
                <Video size={14} />
                Gerar link Meet
              </Button>
              {meetLink && (
                <a href={meetLink} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary">
                    <ExternalLink size={14} />
                    Entrar na aula
                  </Button>
                </a>
              )}
            </div>
            {meetLink && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-xs text-[var(--accent-700)] font-mono bg-[var(--accent-50)] px-3 py-1.5 rounded-lg inline-block"
              >
                {meetLink}
              </motion.p>
            )}
          </div>

          {/* Upload panel */}
          <div className="flex-1 min-w-64">
            <h3 className="text-sm font-semibold text-[var(--heading)] mb-1">Enviar Gravação</h3>
            <p className="text-xs text-[var(--muted)] mb-3">Faça upload de vídeos das aulas para os alunos</p>
            <input
              ref={fileRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button variant="secondary" onClick={() => fileRef.current?.click()}>
              <UploadCloud size={14} />
              Selecionar vídeo
            </Button>
          </div>
        </div>

        {/* Upload progress */}
        <AnimatePresence>
          {uploading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 overflow-hidden"
            >
              <div className="bg-[var(--accent-50)] rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Film size={14} className="text-[var(--accent-600)]" />
                    <span className="text-xs font-medium text-[var(--heading)] truncate max-w-48">{uploadedName}</span>
                  </div>
                  <span className="text-xs font-bold text-[var(--accent-600)]">{Math.round(uploadProgress)}%</span>
                </div>
                <div className="h-1.5 bg-[var(--accent-100)] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(135deg, var(--accent-gradient-from), var(--accent-gradient-to))' }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
                {uploadProgress >= 100 && (
                  <p className="text-xs text-emerald-600 mt-1.5 font-medium">✓ Upload concluído!</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Video library */}
      <div>
        <h2 className="text-sm font-semibold text-[var(--heading)] mb-4">Biblioteca de Vídeos ({videos.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {videos.map((video, i) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Card hoverable className="overflow-hidden" onClick={() => setActiveVideo(video.id)}>
                {/* Thumbnail */}
                <div className="relative aspect-video bg-linear-to-br from-gray-800 to-gray-900 flex items-center justify-center group">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <Play size={20} className="text-white ml-0.5" />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded font-mono">
                    {formatSeconds(video.duration)}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-sm font-medium text-[var(--heading)] line-clamp-2 mb-2">{video.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {formatSeconds(video.duration)}
                    </span>
                    <span className="flex items-center gap-1">
                      <HardDrive size={11} />
                      {formatBytes(video.size)}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--muted)] mt-1.5">
                    {new Date(video.uploadedAt).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Video preview modal */}
      <AnimatePresence>
        {activeVideo && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
              onClick={() => setActiveVideo(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none"
            >
              <div className="bg-black rounded-2xl overflow-hidden w-full max-w-3xl pointer-events-auto">
                <div className="flex items-center justify-between px-4 py-3 bg-gray-900">
                  <p className="text-sm text-white font-medium">
                    {videos.find(v => v.id === activeVideo)?.title}
                  </p>
                  <button onClick={() => setActiveVideo(null)} className="text-gray-400 hover:text-white">
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
    </div>
  );
}
