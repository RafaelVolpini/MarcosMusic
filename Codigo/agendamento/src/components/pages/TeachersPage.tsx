import { motion } from 'framer-motion';
import { Plus, Star, Mail, Phone, Music } from 'lucide-react';
import type { Teacher } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface TeachersPageProps {
  teachers: Teacher[];
}

export function TeachersPage({ teachers }: TeachersPageProps) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">{teachers.length} professores cadastrados</p>
        <Button size="sm">
          <Plus size={14} /> Novo Professor
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {teachers.map((teacher, i) => (
          <motion.div
            key={teacher.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Card hoverable className="p-5">
              {/* Color bar */}
              <div className="h-1.5 rounded-full mb-4" style={{ backgroundColor: teacher.color }} />

              <div className="flex items-start gap-3 mb-4">
                {/* Avatar */}
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shrink-0"
                  style={{ backgroundColor: teacher.color }}
                >
                  {teacher.name.split(' ').slice(0, 2).map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{teacher.name}</h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star size={11} className="text-amber-400 fill-amber-400" />
                    <span className="text-xs text-gray-600">{teacher.rating}</span>
                  </div>
                </div>
              </div>

              {/* Instruments */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {teacher.instruments.map(inst => (
                  <Badge key={inst} variant="purple">
                    <Music size={10} />
                    {inst}
                  </Badge>
                ))}
              </div>

              {/* Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Mail size={12} className="text-gray-400 shrink-0" />
                  <span className="truncate">{teacher.email}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Phone size={12} className="text-gray-400 shrink-0" />
                  <span>{teacher.phone}</span>
                </div>
              </div>

              {/* Footer stats */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-400">Alunos</p>
                  <p className="text-lg font-bold text-gray-900">{teacher.studentsCount}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 mb-1">Disponibilidade</p>
                  <div className="flex gap-1">
                    {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((d, idx) => {
                      const dayMap = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                      const active = teacher.availability.includes(dayMap[idx]);
                      return (
                        <div
                          key={idx}
                          className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-medium"
                          style={{
                            backgroundColor: active ? teacher.color + '22' : '#f3f4f6',
                            color: active ? teacher.color : '#9ca3af',
                          }}
                        >
                          {d}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
