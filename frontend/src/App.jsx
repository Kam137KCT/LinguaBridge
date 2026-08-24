import { useState, useCallback, useEffect } from 'react';
import { listRooms, getMe, clearTokens, getAccessToken } from './api/client';
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
  // Derive initial page lazily to prevent synchronous setState inside useEffect on mount
  const [page, setPage] = useState(() => (getAccessToken() ? 'loading' : 'login'));
  const [currentUser, setCurrentUser] = useState(null);
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
      const data = await listRooms();
      const normalizedRooms = data.map((r) => ({
        ...r,
        isGroup: r.isGroup ?? r.is_group,
        inviteCode: r.inviteCode ?? r.invite_code,
        isOnline: true,
      }));

      setRooms(normalizedRooms);

      setActiveId((currentId) => {
        if (currentId && !normalizedRooms.some((r) => r.id === currentId)) {
          return null;
        }
        return currentId;
      });
    } catch (err) {
      addToast(`Couldn't load rooms: ${err.message}`);
    } finally {
      setRoomsLoading(false);
    }
  }, [addToast]);

  // Restore session on load if an access token exists
  useEffect(() => {
    if (!getAccessToken()) return;

    getMe()
      .then((user) => {
        setCurrentUser(user);
        setPage('chat');
        refreshRooms();
      })
      .catch(() => {
        clearTokens();
        setPage('login');
      });
  }, [refreshRooms]);

  const handleLogin = (user) => {
    setCurrentUser(user);
    setPage('chat');
    refreshRooms();
    setTimeout(() => addToast(`Welcome back, ${user.username}`), 300);
  };

  const handleRegister = (user) => {
    setCurrentUser(user);
    setPage('chat');
    refreshRooms();
    setTimeout(() => addToast(`Account created — welcome, ${user.username}`), 300);
  };

  const handleLogout = () => {
    clearTokens();
    setCurrentUser(null);
    setActiveId(null);
    setPage('login');
  };

  const handleSelectRoom = (id) => {
    setActiveId(id);
    setSidebarOpen(false);
  };

  const handleRoomReady = async (newRoom) => {
    await refreshRooms();
    const targetId = typeof newRoom === 'object' ? newRoom?.id : newRoom;
    if (targetId) {
      setActiveId(targetId);
    }
    setPage('chat');
  };

  const renderMainContent = () => {
    if (page === 'loading') {
      return <div className="min-h-screen" style={{ background: 'var(--color-fog)' }} />;
    }
    if (page === 'login') {
      return <LoginPage onLogin={handleLogin} onGoRegister={() => setPage('register')} onToast={addToast} />;
    }
    if (page === 'register') {
      return <RegisterPage onRegister={handleRegister} onGoLogin={() => setPage('login')} onToast={addToast} />;
    }
    if (page === 'roomSetup') {
      return (
        <RoomSetupPage
          onBack={() => setPage('chat')}
          onRoomReady={handleRoomReady}
          onToast={addToast}
        />
      );
    }
    if (page === 'profile') {
      return (
        <ProfilePage
          currentUser={currentUser}
          onBack={() => setPage('chat')}
          onLogout={handleLogout}
          onUserUpdate={setCurrentUser}
          onToast={addToast}
        />
      );
    }

    const activeRoom = rooms.find((r) => r.id === activeId) || null;

    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar
          currentUser={currentUser}
          rooms={rooms}
          loading={roomsLoading}
          activeId={activeId || ''}
          onSelect={handleSelectRoom}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onOpenProfile={() => setPage('profile')}
          onNewRoom={() => setPage('roomSetup')}
        />

        <main className="flex min-h-0 min-w-0 flex-1 flex-col">
          {activeRoom ? (
            <ChatArea
              key={`${activeRoom.id}-${currentUser?.preferred_language || 'en'}`}
              room={activeRoom}
              currentUser={currentUser}
              onMenuOpen={() => setSidebarOpen(true)}
              onToast={addToast}
            />
          ) : (
            <div className="flex flex-1 flex-col">
              <div
                className="flex items-center gap-3 px-4 py-3 lg:hidden"
                style={{ background: 'white', borderBottom: '1px solid var(--color-fog-dim)' }}
              >
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="flex size-8 items-center justify-center rounded-lg"
                  style={{ background: 'var(--color-fog)', color: 'var(--color-ink-soft)' }}
                >
                  ☰
                </button>
                <span className="font-['display'] text-[15px] font-semibold" style={{ color: 'var(--color-ink)' }}>
                  LinguaBridge
                </span>
              </div>
              <EmptyState />
            </div>
          )}
        </main>
      </div>
    );
  };

  return (
    <>
      {renderMainContent()}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}