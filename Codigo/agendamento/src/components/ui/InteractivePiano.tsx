import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

// ─── Nota musical → frequência (Hz), afinação padrão A4 = 440Hz ───────────────

const WHITE_NOTES = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5'] as const;

const NOTE_FREQ: Record<string, number> = {
  C4: 261.63, 'C#4': 277.18, D4: 293.66, 'D#4': 311.13, E4: 329.63,
  F4: 349.23, 'F#4': 369.99, G4: 392.0, 'G#4': 415.3, A4: 440.0,
  'A#4': 466.16, B4: 493.88, C5: 523.25, 'C#5': 554.37, D5: 587.33,
  'D#5': 622.25, E5: 659.25,
};

// posição do sustenido: entre qual índice de tecla branca ele aparece
const BLACK_KEYS = [
  { note: 'C#4', afterIndex: 0 },
  { note: 'D#4', afterIndex: 1 },
  { note: 'F#4', afterIndex: 3 },
  { note: 'G#4', afterIndex: 4 },
  { note: 'A#4', afterIndex: 5 },
  { note: 'C#5', afterIndex: 7 },
  { note: 'D#5', afterIndex: 8 },
];

// Mapeamento do teclado do computador → tocar sem precisar do mouse
const KEYBOARD_MAP: Record<string, string> = {
  a: 'C4', w: 'C#4', s: 'D4', e: 'D#4', d: 'E4',
  f: 'F4', t: 'F#4', g: 'G4', y: 'G#4', h: 'A4',
  u: 'A#4', j: 'B4', k: 'C5', o: 'C#5', l: 'D5', p: 'D#5', ';': 'E5',
};

interface InteractivePianoProps {
  className?: string;
}

export function InteractivePiano({ className }: InteractivePianoProps) {
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const audioCtxRef = useRef<AudioContext | null>(null);
  const voicesRef = useRef<Map<string, { osc: OscillatorNode; gain: GainNode }>>(new Map());

  const getCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new Ctx();
    }
    if (audioCtxRef.current.state === 'suspended') void audioCtxRef.current.resume();
    return audioCtxRef.current;
  }, []);

  const playNote = useCallback((note: string) => {
    if (voicesRef.current.has(note)) return;
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = NOTE_FREQ[note];
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.16, ctx.currentTime + 0.015);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    voicesRef.current.set(note, { osc, gain });
    setActiveNotes((prev) => new Set(prev).add(note));
  }, [getCtx]);

  const stopNote = useCallback((note: string) => {
    const voice = voicesRef.current.get(note);
    if (!voice) return;
    const ctx = getCtx();
    voice.gain.gain.cancelScheduledValues(ctx.currentTime);
    voice.gain.gain.setValueAtTime(voice.gain.gain.value, ctx.currentTime);
    voice.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.18);
    voice.osc.stop(ctx.currentTime + 0.2);
    voicesRef.current.delete(note);
    setActiveNotes((prev) => {
      const next = new Set(prev);
      next.delete(note);
      return next;
    });
  }, [getCtx]);

  // Toca com o teclado físico do computador
  useEffect(() => {
    const pressed = new Set<string>();

    // Não toca quando o usuário está digitando em um campo do formulário
    const isTypingTarget = (target: EventTarget | null) => {
      const el = target as HTMLElement | null;
      if (!el) return false;
      const tag = el.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      const key = e.key.toLowerCase();
      const note = KEYBOARD_MAP[key];
      if (!note || pressed.has(key) || e.repeat) return;
      pressed.add(key);
      playNote(note);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      const key = e.key.toLowerCase();
      const note = KEYBOARD_MAP[key];
      pressed.delete(key);
      if (note) stopNote(note);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [playNote, stopNote]);

  // Libera todas as notas se o ponteiro sair da janela com o botão apertado
  useEffect(() => {
    const releaseAll = () => {
      voicesRef.current.forEach((_v, note) => stopNote(note));
    };
    window.addEventListener('pointerup', releaseAll);
    return () => window.removeEventListener('pointerup', releaseAll);
  }, [stopNote]);

  const whiteWidth = 100 / WHITE_NOTES.length;

  return (
    <div className={className}>
      <div className="relative h-40 w-full select-none sm:h-48" role="group" aria-label="Teclado musical interativo">
        {/* Teclas brancas */}
        <div className="flex h-full w-full gap-[2px]">
          {WHITE_NOTES.map((note) => {
            const active = activeNotes.has(note);
            return (
              <motion.button
                key={note}
                type="button"
                aria-label={`Tecla ${note}`}
                onPointerDown={() => playNote(note)}
                onPointerUp={() => stopNote(note)}
                onPointerLeave={() => stopNote(note)}
                animate={{ y: active ? 3 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="flex-1 rounded-b-lg border border-t-0 outline-none"
                style={{
                  backgroundColor: active ? 'color-mix(in srgb, var(--accent-500) 22%, #fdf9f0)' : 'rgba(253,249,240,0.94)',
                  borderColor: 'rgba(15,23,42,0.12)',
                }}
              />
            );
          })}
        </div>

        {/* Teclas pretas */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[62%]">
          {BLACK_KEYS.map(({ note, afterIndex }) => {
            const active = activeNotes.has(note);
            const left = whiteWidth * (afterIndex + 1) - whiteWidth * 0.28;
            return (
              <motion.button
                key={note}
                type="button"
                aria-label={`Tecla ${note}`}
                onPointerDown={() => playNote(note)}
                onPointerUp={() => stopNote(note)}
                onPointerLeave={() => stopNote(note)}
                animate={{ y: active ? 2 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="pointer-events-auto absolute top-0 rounded-b-md"
                style={{
                  left: `${left}%`,
                  width: `${whiteWidth * 0.56}%`,
                  height: '100%',
                  backgroundColor: active ? 'color-mix(in srgb, var(--accent-500) 55%, #2b1c12)' : '#2b1c12',
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
