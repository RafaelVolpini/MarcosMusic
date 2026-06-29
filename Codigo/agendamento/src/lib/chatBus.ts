/**
 * Minimal event bus to open the chat panel with a specific student
 * from any page (e.g. StudentsPage) without prop-drilling through Layout/TopBar.
 */
type ChatBusListener = (alunoId: string) => void;

let _listener: ChatBusListener | null = null;

export const chatBus = {
  /** Emit: open the chat panel directed at a specific student */
  open: (alunoId: string) => _listener?.(alunoId),

  /** Subscribe (TopBar registers this once on mount) */
  listen: (fn: ChatBusListener): (() => void) => {
    _listener = fn;
    return () => { _listener = null; };
  },
};
