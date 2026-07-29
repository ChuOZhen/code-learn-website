'use client';

import { useSyncExternalStore } from 'react';
import { AuthProvider, useAuth } from './AuthProvider';
import AuthModal from './AuthModal';
import Sidebar from './Sidebar';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!mounted) return null;

  return (
    <>
      <Sidebar />
      <main className="flex-1 overflow-auto md:pt-0 pt-14">{children}</main>
      {!currentUser && <AuthModal />}
    </>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex h-full">
        <LayoutContent>{children}</LayoutContent>
      </div>
    </AuthProvider>
  );
}
