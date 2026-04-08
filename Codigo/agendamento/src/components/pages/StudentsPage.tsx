import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, BookOpen, Phone, Mail, Music } from 'lucide-react';
import type { Student } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { cn } from '../../utils';

interface StudentsPageProps {
  students: Student[];
}

const LEVEL_BADGE: Record<string, 'default' | 'warning' | 'success'> = {
  beginner: 'default',
  intermediate: 'warning',
  advanced: 'success',
};
const LEVEL_LABEL: Record<string, string> = {
  beginner: 'Iniciante',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
};

export function StudentsPage({ students }: StudentsPageProps) {
  const [query, setQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');

  const filtered = students.filter(s => {
    const matchQ = s.name.toLowerCase().includes(query.toLowerCase()) || s.instrument.toLowerCase().includes(query.toLowerCase());
    const matchL = levelFilter === 'all' || s.level === levelFilter;
    return matchQ && matchL;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar alunos..."
            className="w-full h-10 pl-9 pr-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-1">
          {['all', 'beginner', 'intermediate', 'advanced'].map(l => (
            <button
              key={l}
              onClick={() => setLevelFilter(l)}
              className={cn(
                'px-3 h-7 text-xs font-semibold rounded-lg transition-all',
                levelFilter === l ? 'bg-linear-to-r from-indigo-500 to-purple-600 text-white' : 'text-slate-500 hover:text-slate-700',
              )}
            >
              {l === 'all' ? 'Todos' : LEVEL_LABEL[l]}
            </button>
          ))}
        </div>
        <Button size="sm">
          <Plus size={14} /> Novo aluno
        </Button>
      </div>

      {/* Student cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((student, i) => (
          <motion.div
            key={student.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Card hoverable className="p-5">
              <div className="flex items-start gap-3 mb-4">
                <Avatar name={student.name} size="lg" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-slate-800 truncate">{student.name}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Music size={11} className="text-indigo-500" />
                    <span className="text-xs text-slate-500">{student.instrument}</span>
                  </div>
                  <Badge variant={LEVEL_BADGE[student.level]} className="mt-1.5">
                    {LEVEL_LABEL[student.level]}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <BookOpen size={12} className="text-teal-500 shrink-0" />
                  <span>{student.totalLessons} aulas realizadas</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Mail size={12} className="text-cyan-500 shrink-0" />
                  <span className="truncate">{student.email}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Phone size={12} className="text-emerald-500 shrink-0" />
                  <span>{student.phone}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div>
                  <p className="text-xs text-slate-400">Saldo</p>
                  <p className={cn(
                    'text-sm font-bold',
                    student.balance < 0 ? 'text-rose-500' : student.balance > 0 ? 'text-emerald-600' : 'text-slate-700',
                  )}>
                    {student.balance < 0 ? '-' : student.balance > 0 ? '+' : ''}R$ {Math.abs(student.balance)}
                  </p>
                </div>
                {student.nextLesson && (
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Próxima aula</p>
                    <p className="text-xs font-semibold text-slate-700">
                      {new Date(student.nextLesson).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <Music size={40} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">Nenhum aluno encontrado</p>
        </div>
      )}
    </div>
  );
}
