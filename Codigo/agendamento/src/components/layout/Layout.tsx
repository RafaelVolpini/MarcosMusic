import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import type { Page } from '../../types';
import type { AuthUser } from '../../lib/auth';

interface LayoutProps {
  children: ReactNode;
  collapsed: boolean;
  onToggle: () => void;
  activePage: Page;
  onNavigate: (page: Page) => void;
  user: AuthUser;
  onLogout: () => void;
}

export function Layout({ children, collapsed, onToggle, activePage, onNavigate, user, onLogout }: LayoutProps) {
  return (
    <div className="app-shell flex h-screen w-screen overflow-hidden">
      <Sidebar
        collapsed={collapsed}
        onToggle={onToggle}
        activePage={activePage}
        onNavigate={onNavigate}
        user={user}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar activePage={activePage} user={user} onLogout={onLogout} onNavigate={onNavigate} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
