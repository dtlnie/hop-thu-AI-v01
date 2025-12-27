
import React, { useState } from 'react';
import { User } from '../types';
import { motion } from 'framer-motion';
import { Save, School, GraduationCap, UserCircle } from 'lucide-react';
import { normalizeString } from '../utils/normalize';

interface ProfileSettingsProps {
  user: User;
  onUpdate: (updatedUser: User) => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user, onUpdate }) => {
  const [school, setSchool] = useState(user.school || '');
  const [className, setClassName] = useState(user.className || '');
  const [success, setSuccess] = useState(false);

  const handleSave = () => {
    const normalizedSchool = normalizeString(school);
    const normalizedClass = normalizeString(className);

    const updatedUser: User = {
      ...user,
      school: normalizedSchool,
      className: normalizedClass
    };

    // Update current user
    localStorage.setItem('spss_user', JSON.stringify(updatedUser));

    // Update in all users list
    const allUsers = JSON.parse(localStorage.getItem('spss_all_users') || '[]');
    const updatedAllUsers = allUsers.map((u: any) => 
      u.id === user.id ? { ...u, school: normalizedSchool, className: normalizedClass } : u
    );
    localStorage.setItem('spss_all_users', JSON.stringify(updatedAllUsers));

    onUpdate(updatedUser);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-[40px] p-8 shadow-2xl border-white"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="relative">
            <img src={user.avatar} className="w-24 h-24 rounded-full border-4 border-indigo-100 shadow-lg" alt="avatar" />
            <div className="absolute -bottom-1 -right-1 bg-indigo-600 p-2 rounded-full text-white">
              <UserCircle size={18} />
            </div>
          </div>
          <h2 className="text-2xl font-black text-indigo-950 mt-4">{user.username}</h2>
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{user.role === 'teacher' ? 'Giáo viên' : 'Học sinh'}</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">
              <School size={14} /> Trường học
            </label>
            <input 
              type="text" 
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl bg-white/50 border-2 border-indigo-50 focus:border-indigo-500 focus:bg-white transition-all outline-none text-indigo-950 font-bold"
              placeholder="Nhập tên trường..."
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">
              <GraduationCap size={14} /> Lớp học
            </label>
            <input 
              type="text" 
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl bg-white/50 border-2 border-indigo-50 focus:border-indigo-500 focus:bg-white transition-all outline-none text-indigo-950 font-bold"
              placeholder="Nhập tên lớp..."
            />
          </div>

          {success && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-emerald-600 font-bold text-center text-sm">
              Cập nhật thông tin thành công!
            </motion.p>
          )}

          <button 
            onClick={handleSave}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-xl transition-all flex items-center justify-center gap-3"
          >
            <Save size={20} /> LƯU THAY ĐỔI
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileSettings;
