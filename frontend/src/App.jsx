import { useState, useCallback, useEffect } from 'react';
import { listRooms } from './api/client';
import { DEV_CURRENT_USER_ID } from './config/devConfig';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import EmptyState from './components/EmptyState';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RoomSetupPage from './pages/RoomSetupPage';
import ProfilePage from './pages/ProfilePage';
import { ToastContainer } from './components/Toast';

let toastCounter = 0;

export default function App() {
  const [page, setPage] = useState('login');
  const [rooms, setRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message) => {
    const id = String(++toastCounter);
    setToasts((prev) => [...prev, { id, message }]);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const refreshRooms = useCallback(async () => {
    setRoomsLoading(true);
    try {
      const data = await listRooms(DEV_CURRENT_USER_ID);
      // Backend field is is_group (snake_case) — normalize to isGroup
      // here so components don't need to know about that difference.
      setRooms(data.map((r) => ({ ...r, isGroup: r.is_group, isOnline: true })));
    } catch (err) {
      addToast(`Couldn't load rooms: ${err.message}`);
    } finally {
      setRoomsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    if (page === 'chat') refreshRooms();
  }, [page, refreshRooms]);

  const handleLogin = () => {
    setPage('chat');
    setTimeout(() => addToast('Welcome back'), 300);
  };

  const handleRegister = () => {
    setPage('chat');
    setTimeout(() => addToast('Account created — welcome to LinguaBridge'), 300);
  };

  const handleLogout = () => {
    setPage('login');
    setActiveId(null);
  };

  const handleSelectRoom = (id) => {
    setActiveId(id);
    setSidebarOpen(false);
  };

  const handleRoomReady = async () => {
    await refreshRooms();
    setPage('chat');
  };

  if (page === 'login') {
    return <LoginPage onLogin={handleLogin} onGoRegister={() => setPage('register')} />;
  }
  if (page === 'register') {
    return <RegisterPage onRegister={handleRegister} onGoLogin={() => setPage('login')} />;
  }
  if (page === 'roomSetup') {
    return <RoomSetupPage onBack={() => setPage('chat')} onRoomReady={handleRoomReady} />;
  }
  if (page === 'profile') {
    return (
      <>
        <ProfilePage onBack={() => setPage('chat')} onLogout={handleLogout} />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  const activeRoom = rooms.find((r) => r.id === activeId) || null;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        rooms={rooms}
        loading={roomsLoading}
        activeId={activeId || ''}
        onSelect={handleSelectRoom}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenProfile={() => setPage('profile')}
        onNewRoom={() => setPage('roomSetup')}
      />

      <main className="flex-1 flex flex-col min-w-0 min-h-0">
        {activeRoom ? (
          <ChatArea
            key={activeRoom.id}
            room={activeRoom}
            onMenuOpen={() => setSidebarOpen(true)}
            onToast={addToast}
          />
        ) : (
          <div className="flex-1 flex flex-col">
            <div className="lg:hidden flex items-center gap-3 px-4 py-3" style={{ background: 'white', borderBottom: '1px solid var(--color-fog-dim)' }}>
              <button onClick={() => setSidebarOpen(true)} className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ background: 'var(--color-fog)', color: 'var(--color-ink-soft)' }}>☰</button>
              <span className="font-display text-[15px] font-600" style={{ color: 'var(--color-ink)' }}>LinguaBridge</span>
            </div>
            <EmptyState />
          </div>
        )}
      </main>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}