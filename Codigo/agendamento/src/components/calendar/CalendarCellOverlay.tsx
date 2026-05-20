import { Plus } from 'lucide-react';

interface CalendarCellOverlayProps {
  /** Mostrar o overlay (célula disponível e clicável) */
  visible: boolean;
}

/**
 * Overlay de hover para células do calendário.
 * Exibe fundo colorido + ícone "+" indicando que a célula é clicável.
 * Renderizar apenas quando o horário estiver disponível.
 */
export function CalendarCellOverlay({ visible }: CalendarCellOverlayProps) {
  if (!visible) return null;

  return (
    <>
      {/* Fundo colorido aparece no hover via classe `group-hover` do pai */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-100 cursor-pointer bg-(--accent-icon-bg) pointer-events-none" />
      {/* Ícone "+" centralizado */}
      <Plus
        size={16}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-50 transition-opacity pointer-events-none text-(--accent-600)"
      />
    </>
  );
}
