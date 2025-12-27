
import React, { useState, useEffect, useMemo } from 'react';
import { RiskLevel, StudentAlert, User } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, AreaChart, Area
} from 'recharts';
import { AlertTriangle, Clock, School, Trash2, Users, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { normalizeString } from '../utils/normalize';

const TeacherDashboard: React.FC = () => {
  const [allAlerts, setAllAlerts] = useState<StudentAlert[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedCase, setSelectedCase] = useState<StudentAlert | null>(null);
  const [activeTab, setActiveTab] = useState<'monitor' | 'students'>('monitor');

  useEffect(() => {
    const savedAlerts = JSON.parse(localStorage.getItem('spss_alerts') || '[]');
    setAllAlerts(savedAlerts.reverse());

    const savedUsers = JSON.parse(localStorage.getItem('spss_all_users') || '[]');
    setAllUsers(savedUsers);
    
    const currentUser = JSON.parse(localStorage.getItem('spss_user') || '{}');
    if (currentUser.school) setSelectedSchool(currentUser.school);
    if (currentUser.className) setSelectedClass(currentUser.className);
  }, []);

  const uniqueSchools = useMemo(() => Array.from(new Set(allUsers.map(u => u.school).filter(Boolean))), [allUsers]);
  const classesForSchool = useMemo(() => {
    if (!selectedSchool) return [];
    return Array.from(new Set(allUsers.filter(u => normalizeString(u.school) === normalizeString(selectedSchool)).map(u => u.className).filter(Boolean)));
  }, [allUsers, selectedSchool]);

  const filteredAlerts = useMemo(() => {
    if (!selectedSchool || !selectedClass) return [];
    return allAlerts.filter(a => normalizeString(a.school) === normalizeString(selectedSchool) && normalizeString(a.className) === normalizeString(selectedClass));
  }, [allAlerts, selectedSchool, selectedClass]);

  const filteredStudents = useMemo(() => {
    if (!selectedSchool || !selectedClass) return [];
    return allUsers.filter(u => 
      u.role === 'student' && 
      normalizeString(u.school) === normalizeString(selectedSchool) && 
      normalizeString(u.className) === normalizeString(selectedClass)
    );
  }, [allUsers, selectedSchool, selectedClass]);

  const handleRemoveStudent = (studentId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa học sinh này khỏi danh sách lớp? Mọi dữ liệu tài khoản của em sẽ bị xóa.")) return;
    
    const updatedUsers = allUsers.filter(u => u.id !== studentId);
    localStorage.setItem('spss_all_users', JSON.stringify(updatedUsers));
    setAllUsers(updatedUsers);
  };

  const statsData = [
    { name: 'Ổn định', value: 20, color: '#059669' },
    { name: 'Cần quan tâm', value: filteredAlerts.filter(a => a.riskLevel === RiskLevel.YELLOW).length, color: '#d97706' },
    { name: 'Cần can thiệp', value: filteredAlerts.filter(a => a.riskLevel === RiskLevel.ORANGE).length, color: '#ea580c' },
    { name: 'Khẩn cấp', value: filteredAlerts.filter(a => a.riskLevel === RiskLevel.RED).length, color: '#dc2626' },
  ];

  const trendData = [
    { day: 'T2', stress: 20, joy: 80 },
    { day: 'T3', stress: 35, joy: 65 },
    { day: 'T4', stress: 45, joy: 55 },
    { day: 'T5', stress: 70, joy: 30 },
    { day: 'T6', stress: 40, joy: 60 },
    { day: 'T7', stress: 15, joy: 85 },
  ];

  if (!selectedClass) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center text-center space-y-6">
        <div className="bg-indigo-100 p-8 rounded-[40px] text-indigo-600 shadow-inner">
          <School size={80} strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-indigo-950 uppercase tracking-tight">CHƯA CHỌN LỚP QUẢN LÝ</h2>
          <p className="text-indigo-500 font-bold mt-2">Vui lòng chọn Trường và Lớp để bắt đầu giám sát.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <select 
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
            className="flex-1 px-6 py-4 rounded-2xl glass border-2 border-indigo-100 outline-none font-bold text-indigo-900"
          >
            <option value="">Chọn Trường...</option>
            {uniqueSchools.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select 
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            disabled={!selectedSchool}
            className="flex-1 px-6 py-4 rounded-2xl glass border-2 border-indigo-100 outline-none font-bold text-indigo-900 disabled:opacity-50"
          >
            <option value="">Chọn Lớp...</option>
            {classesForSchool.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <div className="glass p-4 rounded-3xl flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg">
            <School size={20} />
          </div>
          <div>
            <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest">Đang quản lý</h4>
            <p className="font-black text-indigo-950 capitalize">{selectedSchool} - Lớp {selectedClass}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab('monitor')}
            className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase transition ${activeTab === 'monitor' ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
          >
            GIÁM SÁT AI
          </button>
          <button 
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase transition ${activeTab === 'students' ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
          >
            DANH SÁCH LỚP
          </button>
          <button 
            onClick={() => { setSelectedClass(''); setSelectedSchool(''); }}
            className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl font-black text-[10px] uppercase hover:bg-rose-100 transition"
          >
            ĐỔI LỚP
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'monitor' ? (
          <motion.div key="monitor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 glass p-6 rounded-3xl shadow-xl border-white h-fit">
                <h3 className="font-black text-indigo-950 mb-6 uppercase tracking-widest text-xs border-b border-indigo-50 pb-4">Thống kê tâm lý</h3>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statsData} layout="vertical">
                      <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} fontWeight="900" width={90} />
                      <XAxis type="number" hide />
                      <Tooltip />
                      <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={25}>
                        {statsData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="lg:col-span-2 glass p-6 rounded-3xl shadow-xl border-white">
                <h3 className="font-black text-indigo-950 mb-6 uppercase tracking-widest text-xs border-b border-indigo-50 pb-4">Lịch sử cảnh báo khẩn cấp</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[10px] uppercase font-black text-indigo-400 border-b border-indigo-50">
                        <th className="px-4 py-3">Học sinh</th>
                        <th className="px-4 py-3">Mức độ</th>
                        <th className="px-4 py-3">Nội dung cuối</th>
                        <th className="px-4 py-3 text-right">Chi tiết</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-indigo-50">
                      {filteredAlerts.length === 0 ? (
                        <tr><td colSpan={4} className="py-10 text-center text-indigo-300 font-bold">Lớp học hiện tại đang rất ổn định.</td></tr>
                      ) : (
                        filteredAlerts.map(alert => (
                          <tr key={alert.id} className="hover:bg-indigo-50/40 transition">
                            <td className="px-4 py-4 font-black text-indigo-950 text-sm">{alert.studentName}</td>
                            <td className="px-4 py-4">
                              <span className={`px-2 py-1 rounded-lg text-[9px] font-black text-white ${alert.riskLevel === RiskLevel.RED ? 'bg-rose-600' : 'bg-orange-500'}`}>
                                {alert.riskLevel}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-xs italic text-indigo-800 opacity-70 line-clamp-1 max-w-[200px]">"{alert.lastMessage}"</td>
                            <td className="px-4 py-4 text-right">
                              <button onClick={() => setSelectedCase(alert)} className="text-indigo-600 font-black text-[10px] uppercase hover:underline">Xem</button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="students" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass rounded-[32px] overflow-hidden shadow-2xl border-white">
            <div className="p-6 bg-white/50 border-b border-indigo-50 flex justify-between items-center">
              <h3 className="font-black text-indigo-950 uppercase text-sm tracking-widest flex items-center gap-2">
                <Users size={18} className="text-indigo-600" /> Danh sách học sinh ({filteredStudents.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-indigo-600 text-[10px] uppercase font-black text-white tracking-widest">
                    <th className="px-6 py-4">Học sinh</th>
                    <th className="px-6 py-4">Username</th>
                    <th className="px-6 py-4 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-50">
                  {filteredStudents.length === 0 ? (
                    <tr><td colSpan={3} className="px-6 py-10 text-center text-indigo-400 font-bold italic">Chưa có học sinh nào đăng ký tham gia lớp này.</td></tr>
                  ) : (
                    filteredStudents.map(student => (
                      <tr key={student.id} className="hover:bg-indigo-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={student.avatar} className="w-8 h-8 rounded-full border border-indigo-100" alt="avatar" />
                            <span className="font-black text-indigo-950">{student.username}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-indigo-500">@{student.username}</td>
                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => handleRemoveStudent(student.id)}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                            title="Xóa khỏi lớp"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedCase && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-indigo-950/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass max-w-lg w-full p-8 rounded-[40px] shadow-2xl relative">
              <button onClick={() => setSelectedCase(null)} className="absolute top-6 right-6 text-indigo-400 hover:text-indigo-600 font-black">ĐÓNG</button>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-3xl bg-indigo-600 text-white flex items-center justify-center text-2xl font-black">{selectedCase.studentName[0]}</div>
                <div>
                  <h4 className="text-xl font-black text-indigo-950">{selectedCase.studentName}</h4>
                  <p className="text-xs font-bold text-indigo-500 uppercase">{selectedCase.school} - Lớp {selectedCase.className}</p>
                </div>
              </div>
              <div className="bg-white/50 p-6 rounded-3xl mb-6 shadow-inner">
                <p className="text-[10px] font-black text-indigo-400 uppercase mb-2">Thông điệp rủi ro:</p>
                <p className="text-sm text-indigo-900 font-bold italic leading-relaxed">"{selectedCase.lastMessage}"</p>
              </div>
              <button className="w-full mt-4 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition">ĐÁNH DẤU ĐÃ XỬ LÝ</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeacherDashboard;
