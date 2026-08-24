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
  const [page, setPage] = useState('loading');
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

  // Restore session on load if a valid access token exists
  useEffect(() => {
    if (!getAccessToken()) {
      setPage('login');
      return;
    }
    getMe()
      .then((user) => {
        setCurrentUser(user);
        setPage('chat');
      })
      .catch(() => {
        clearTokens();
        setPage('login');
      });
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

      // Reset activeId if the selected room no longer exists
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

  useEffect(() => {
    if (page === 'chat') refreshRooms();
  }, [page, refreshRooms]);

  const handleLogin = (user) => {
    setCurrentUser(user);
    setPage('chat');
    setTimeout(() => addToast(`Welcome back, ${user.username}`), 300);
  };

  const handleRegister = (user) => {
    setCurrentUser(user);
    setPage('chat');
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
    if (newRoom?.id) {
      setActiveId(newRoom.id);
    }
    setPage('chat');
  };

  const renderMainContent = () => {
    if (page === 'loading') {
      return <div className="min-h-screen" style={{ background: 'var(--color-fog)' }} />;
    }
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
        <ProfilePage
          currentUser={currentUser}
          onBack={() => setPage('chat')}
          onLogout={handleLogout}
          onUserUpdate={setCurrentUser}
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

        <main className="flex flex-1 flex-col min-h-0 min-w-0">
          {activeRoom ? (
            <ChatArea
              key={`${activeRoom.id}-${currentUser?.preferred_language || 'en'}`}
              room={activeRoom}
              currentUser={currentUser}
              onMenuOpen={() => setSidebarOpen(true)}
              onToast={addToast}
            />
          ) : (
            <div className="flex-1 flex flex-col">
              <div
                className="lg:hidden flex items-center gap-3 px-4 py-3"
                style={{ background: 'white', borderBottom: '1px solid var(--color-fog-dim)' }}
              >
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg"
                  style={{ background: 'var(--color-fog)', color: 'var(--color-ink-soft)' }}
                >
                  ☰
                </button>
                <span className="font-display text-[15px] font-semibold" style={{ color: 'var(--color-ink)' }}>
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