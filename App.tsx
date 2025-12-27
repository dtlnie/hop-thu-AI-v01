
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import AuthPage from './components/AuthPage.tsx';
import Chatbot from './components/Chatbot.tsx';
import SafeCorner from './components/SafeCorner.tsx';
import TeacherDashboard from './components/TeacherDashboard.tsx';
import ProfileSettings from './components/ProfileSettings.tsx';
import { User } from './types.ts';
import { MessageSquare, ShieldCheck, BarChart3, LogOut, Heart, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const Navigation = ({ user, onLogout }: { user: User, onLogout: () => void }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.nav initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass sticky top-0 z-50 px-4 py-3 flex justify-between items-center shadow-md border-b border-white/20">
      <div className="flex items-center gap-2">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-2 rounded-xl text-white shadow-lg">
            <ShieldCheck size={22} />
          </div>
          <h1 className="font-black text-indigo-950 hidden sm:block tracking-tight text-xl">SmartStudent</h1>
        </Link>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <Link to="/" className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 font-bold text-sm ${isActive('/') ? 'bg-indigo-600 text-white shadow-lg' : 'text-indigo-600 hover:bg-indigo-50'}`}>
          <MessageSquare size={18} />
          <span className="hidden md:inline">Hỗ trợ</span>
        </Link>
        <Link to="/safe-corner" className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 font-bold text-sm ${isActive('/safe-corner') ? 'bg-emerald-600 text-white shadow-lg' : 'text-emerald-700 hover:bg-emerald-50'}`}>
          <Heart size={18} />
          <span className="hidden md:inline">Góc An Toàn</span>
        </Link>
        {user.role === 'teacher' && (
          <Link to="/dashboard" className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 font-bold text-sm ${isActive('/dashboard') ? 'bg-amber-500 text-white shadow-lg' : 'text-amber-700 hover:bg-amber-50'}`}>
            <BarChart3 size={18} />
            <span className="hidden md:inline">Dashboard</span>
          </Link>
        )}
        <Link to="/profile" className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 font-bold text-sm ${isActive('/profile') ? 'bg-indigo-100 text-indigo-700 shadow-sm' : 'text-indigo-600 hover:bg-indigo-50'}`}>
          <Settings size={18} />
        </Link>
        <div className="flex items-center gap-3 ml-2 border-l pl-3 border-indigo-100">
          <img src={user.avatar} className="w-8 h-8 rounded-full border-2 border-indigo-200" alt="avatar" />
          <button onClick={onLogout} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"><LogOut size={20} /></button>
        </div>
      </div>
    </motion.nav>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('spss_user');
    if (savedUser) setUser(JSON.parse(savedUser));
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('spss_user');
    setUser(null);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center font-bold text-indigo-600">Đang tải...</div>;

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-fixed">
        {user && <Navigation user={user} onLogout={handleLogout} />}
        <main className="flex-grow p-4 md:p-6 max-w-7xl mx-auto w-full">
          <Routes>
            <Route path="/auth" element={!user ? <AuthPage onAuth={setUser} /> : <Navigate to="/" />} />
            <Route path="/" element={user ? <Chatbot user={user} /> : <Navigate to="/auth" />} />
            <Route path="/safe-corner" element={user ? <SafeCorner /> : <Navigate to="/auth" />} />
            <Route path="/profile" element={user ? <ProfileSettings user={user} onUpdate={handleUpdateUser} /> : <Navigate to="/auth" />} />
            <Route path="/dashboard" element={user?.role === 'teacher' ? <TeacherDashboard /> : <Navigate to="/" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        <footer className="py-8 text-center border-t border-indigo-100 bg-white/30 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-indigo-400 text-xs font-bold">
              © 2025 <span className="text-indigo-800 text-sm">Hộp Thư AI</span> • v1.3 • Bảo mật đa lớp
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
