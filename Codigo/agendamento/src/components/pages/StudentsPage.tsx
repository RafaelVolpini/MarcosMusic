import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Phone, Mail } from 'lucide-react';
import type { Aluno } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';

interface StudentsPageProps {
  students: Aluno[];
}

export function StudentsPage({ students }: StudentsPageProps) {
  const [query, setQuery] = useState('');

  const filtered = students.filter(s =>
    s.nome.toLowerCase().includes(query.toLowerCase()) ||
    s.email.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar alunos..."
            className="w-full h-10 pl-9 pr-4 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-500)]/30 placeholder:text-[var(--muted)]"
          />
        </div>
        <Button size="sm">
          <Plus size={14} /> Novo aluno
        </Button>
      </div>

      {/* Student cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((aluno, i) => (
          <motion.div
            key={aluno.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Card hoverable className="p-5">
              <div className="flex items-start gap-3 mb-4">
                <Avatar name={aluno.nome} size="lg" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-[var(--heading)] truncate">{aluno.nome}</h3>
                  <Badge variant={aluno.ativo ? 'success' : 'warning'} className="mt-1.5">
                    {aluno.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                  <Mail size={12} className="text-[var(--accent-500)] shrink-0" />
                  <span className="truncate">{aluno.email}</span>
                </div>
                {aluno.telefone && (
                  <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                    <Phone size={12} className="text-[var(--accent-500)] shrink-0" />
                    <span>{aluno.telefone}</span>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-[var(--muted)]">
          <p className="text-sm">Nenhum aluno encontrado</p>
        </div>
      )}
    </div>
  );
}
