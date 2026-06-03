import { useCallback, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, ChevronDown, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Button } from '../ui/Button';
import { acceptContract, getUser, type ContractAcceptance, type AuthUser } from '../../lib/auth';

const SESSION_KEY = 'marcos-music:auth:session';

const CONTRACT_DATA = {
  teacherName: '___________________________',
  studentName: '___________________________',
  guardianName: '___________________________',
  startDate: '___/___/______',
  city: '_______________',
  state: '___',
  noticeDays: '30',
};

interface ContractGateProps {
  user: AuthUser;
  onAccepted: (acceptance: ContractAcceptance) => void;
}

export function ContractGate({ user, onAccepted }: ContractGateProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [confirmation, setConfirmation] = useState<ContractAcceptance | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const contractRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 48) {
      setHasScrolledToBottom(true);
    }
  }, []);

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  };

  const handleDownloadPDF = async () => {
    if (!contractRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(contractRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const ratio = pdfWidth / canvas.width;
      const scaledHeight = canvas.height * ratio;
      let heightLeft = scaledHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, scaledHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, scaledHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save('contrato-aulas-musica.pdf');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    } finally {
      setDownloading(false);
    }
  };

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      const record = await acceptContract(user.email);
      setConfirmation(record);
    } catch {
      // Backend offline persiste localmente e continua
      const current = getUser();
      if (current) {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...current, termos: true }));
      }
      setConfirmation({ email: user.email, acceptedAt: new Date().toISOString() });
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="app-shell h-screen overflow-y-auto">
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:py-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-black" style={{ color: 'var(--text)' }}>Termos de Contrato</h1>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>Leia, confirme o aceite e continue para a plataforma.</p>
          </div>
          <Button variant="secondary" size="sm" onClick={handleDownloadPDF} disabled={downloading}>
            <Download size={14} />
            {downloading ? 'Gerando...' : 'Baixar PDF'}
          </Button>
        </div>

        <div className="app-surface relative overflow-hidden rounded-3xl border shadow-xl" style={{ borderColor: 'var(--border)' }}>
          <div ref={scrollRef} onScroll={handleScroll} className="max-h-[56vh] overflow-y-auto px-6 py-7 sm:max-h-[62vh] sm:px-10 sm:py-10 lg:max-h-[68vh]">
            <div ref={contractRef} className="space-y-6 text-[15px] leading-relaxed text-(--text)">
              <ContractContent data={CONTRACT_DATA} />
            </div>
          </div>

          {!hasScrolledToBottom && (
            <button
              type="button"
              onClick={scrollToBottom}
              className="absolute bottom-0 left-0 right-0 flex h-20 items-end justify-center border-none bg-linear-to-t from-(--surface) via-(--surface)/80 to-transparent pb-3"
            >
                <span className="flex items-center gap-1 text-sm animate-bounce" style={{ color: 'var(--muted)' }}>
                <ChevronDown size={14} />
                Role para baixo para continuar
              </span>
            </button>
          )}
        </div>

        <div className="mt-5 space-y-4">
          <label
            className={`flex items-start gap-3 rounded-2xl border p-4 transition ${
              hasScrolledToBottom
                ? 'cursor-pointer'
                : 'cursor-not-allowed opacity-60'
            }`}
            style={hasScrolledToBottom
              ? { borderColor: 'var(--accent-100)', backgroundColor: 'color-mix(in srgb, var(--accent-50) 65%, transparent)' }
              : { borderColor: 'var(--border)', backgroundColor: 'var(--surface-soft)' }}
          >
            <input
              type="checkbox"
              checked={accepted}
              onChange={(event) => setAccepted(event.target.checked)}
              disabled={!hasScrolledToBottom}
              className="mt-0.5 h-4 w-4 rounded border-(--border) accent-(--accent-600)"
            />
            <span className="text-sm" style={{ color: 'var(--text)' }}>Li e concordo com todos os termos deste contrato.</span>
          </label>

          <Button onClick={handleConfirm} disabled={!accepted || confirming} className="h-11 w-full justify-center text-sm">
            Confirmar e Continuar
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {confirmation && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/45 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="fixed inset-0 z-50 flex items-center justify-center px-4"
            >
              <div className="app-surface w-full max-w-md rounded-3xl border p-6 text-center shadow-2xl" style={{ borderColor: 'var(--border)' }}>
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-100) 75%, transparent)', color: 'var(--accent-600)' }}>
                  <CheckCircle2 size={28} />
                </div>
                <h2 className="text-lg font-black" style={{ color: 'var(--text)' }}>Contrato aceito com sucesso</h2>
                <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>Voce confirmou os termos em:</p>
                <p className="mt-1 text-sm font-semibold" style={{ color: 'var(--text)' }}>
                  {new Date(confirmation.acceptedAt).toLocaleDateString('pt-BR')} as{' '}
                  {new Date(confirmation.acceptedAt).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </p>
                <Button className="mt-5 w-full justify-center" onClick={() => onAccepted(confirmation)}>
                  Ir para a plataforma
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function ContractContent({ data }: { data: typeof CONTRACT_DATA }) {
  return (
    <div className="font-serif" style={{ color: 'var(--text)' }}>
      <div className="space-y-4 border-b pb-6 text-center" style={{ borderColor: 'var(--border)' }}>
        <h2 className="text-lg font-bold uppercase tracking-wide text-(--accent-700)">
          Contrato de Prestacao de Servicos de Aulas de Musica
        </h2>
        <div className="mt-6 space-y-1 text-left text-sm" style={{ color: 'var(--muted)' }}>
          <p><strong>Professor(a):</strong> {data.teacherName}</p>
          <p><strong>Aluno(a):</strong> {data.studentName}</p>
          <p><strong>Responsavel Legal (se menor):</strong> {data.guardianName}</p>
          <p><strong>Data de Inicio:</strong> {data.startDate}</p>
          <p><strong>Cidade/Estado:</strong> {data.city} / {data.state}</p>
        </div>
      </div>

      <div className="mt-6 space-y-5">
        <Clause number="1" title="Objeto do Contrato">
          <p>Este contrato rege a prestacao de aulas particulares individuais de musica de forma pre-agendada e recorrente.</p>
        </Clause>
        <Clause number="2" title="Formato das Aulas">
          <p><strong>2.1</strong> - As aulas sao individuais por padrao, no horario agendado do aluno.</p>
          <p><strong>2.2</strong> - Aulas de reposicao podem ocorrer em formato compartilhado conforme disponibilidade.</p>
          <p><strong>2.3</strong> - O formato compartilhado nao reduz a duracao da aula.</p>
        </Clause>
        <Clause number="3" title="Agendamento e Frequencia">
          <p><strong>3.1</strong> - O horario reservado deve ser respeitado por ambas as partes.</p>
          <p><strong>3.2</strong> - Faltas devem ser comunicadas com antecedencia.</p>
          <p><strong>3.3</strong> - Faltas nao comunicadas podem resultar em perda de reposicao.</p>
        </Clause>
        <Clause number="4" title="Reposicoes">
          <p><strong>4.1</strong> - Reposicoes podem ser solicitadas para faltas justificadas.</p>
          <p><strong>4.2</strong> - O prazo para agendamento é de 6 meses apos a aula perdida.</p>
          <p><strong>4.3</strong> - O agendamento depende da disponibilidade da agenda do professor.</p>
          <p><strong>4.4</strong> - Aulas nao reagendadas no prazo expiram sem reembolso.</p>
        </Clause>
        <Clause number="5" title="Pagamento">
          <p><strong>5.1</strong> - Valores e vencimentos sao definidos na matricula e registrados no sistema.</p>
          <p><strong>5.2</strong> - Atrasos podem suspender aulas ate regularizacao.</p>
        </Clause>
        <Clause number="6" title="Vigencia e Rescisao">
          <p><strong>6.1</strong> - O contrato tem vigencia por prazo indeterminado.</p>
          <p><strong>6.2</strong> - Qualquer parte pode rescindir com {data.noticeDays} dias de aviso previo.</p>
        </Clause>
      </div>

      <div className="mt-8 space-y-8 border-t pt-6" style={{ borderColor: 'var(--border)' }}>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>{data.city} / {data.state}, {data.startDate}</p>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-2">
            <div className="h-10 w-full border-b" style={{ borderColor: 'var(--text)' }} />
            <p className="text-sm font-medium">Professor(a)</p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>Nome: {data.teacherName}</p>
          </div>
          <div className="space-y-2">
            <div className="h-10 w-full border-b" style={{ borderColor: 'var(--text)' }} />
            <p className="text-sm font-medium">Aluno(a) / Responsavel Legal</p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>Nome: {data.studentName}</p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>CPF: ___.___.___-__</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Clause({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-bold uppercase tracking-wide text-(--accent-700)">
        Clausula {number} - {title}
      </h3>
      <div className="space-y-2 pl-1 text-[15px] leading-relaxed">{children}</div>
    </section>
  );
}
