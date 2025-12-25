
import React, { useState, useEffect } from 'react';
import { RiskLevel, StudentAlert } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, AreaChart, Area, PieChart, Pie
} from 'recharts';
import { AlertTriangle, Clock, User, ShieldCheck, Thermometer, Info, FileText, PhoneForwarded, MessageCircle } from 'lucide-react';
// Fix: Import AnimatePresence from framer-motion
import { motion, AnimatePresence } from 'framer-motion';

const TeacherDashboard: React.FC = () => {
  const [alerts, setAlerts] = useState<StudentAlert[]>([]);
  const [selectedCase, setSelectedCase] = useState<StudentAlert | null>(null);
  
  useEffect(() => {
    const savedAlerts = JSON.parse(localStorage.getItem('spss_alerts') || '[]');
    setAlerts(savedAlerts.reverse());
  }, []);

  const statsData = [
    { name: 'Ổn định', value: alerts.filter(a => a.riskLevel === RiskLevel.GREEN).length + 32, color: '#059669' },
    { name: 'Cần quan tâm', value: alerts.filter(a => a.riskLevel === RiskLevel.YELLOW).length + 12, color: '#d97706' },
    { name: 'Cần can thiệp', value: alerts.filter(a => a.riskLevel === RiskLevel.ORANGE).length + 5, color: '#ea580c' },
    { name: 'Khẩn cấp', value: alerts.filter(a => a.riskLevel === RiskLevel.RED).length, color: '#dc2626' },
  ];

  const trendData = [
    { day: 'Thứ 2', stress: 20, joy: 80 },
    { day: 'Thứ 3', stress: 35, joy: 65 },
    { day: 'Thứ 4', stress: 45, joy: 55 },
    { day: 'Thứ 5', stress: 70, joy: 30 }, // Peak stress before exams
    { day: 'Thứ 6', stress: 40, joy: 60 },
    { day: 'Thứ 7', stress: 15, joy: 85 },
  ];

  const getRiskLabel = (level: RiskLevel) => {
    switch(level) {
      case RiskLevel.RED: return 'KHẨN CẤP';
      case RiskLevel.ORANGE: return 'CAN THIỆP';
      case RiskLevel.YELLOW: return 'QUAN TÂM';
      default: return 'BÌNH THƯỜNG';
    }
  };

  const resourceLibrary = [
    { title: 'Kịch bản trò chuyện với học sinh trầm cảm', icon: <MessageCircle size={16}/> },
    { title: 'Quy trình xử lý ca bạo lực học đường', icon: <ShieldCheck size={16}/> },
    { title: 'Bài tập giảm stress tập thể cho lớp học', icon: <Thermometer size={16}/> },
    { title: 'Danh sách chuyên gia tâm lý liên kết', icon: <PhoneForwarded size={16}/> },
  ];

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-indigo-950 uppercase tracking-tight">Hệ Thống Giám Sát Lớp 12A1</h2>
          <p className="text-indigo-600 font-bold flex items-center gap-2">
            <Clock size={16} /> Cập nhật lần cuối: {new Date().toLocaleTimeString()}
          </p>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 sm:pb-0">
          <div className="glass px-6 py-4 rounded-3xl flex items-center gap-3 border-emerald-200 min-w-[200px]">
            <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600">
              <Thermometer size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Nhiệt độ lớp</p>
              <p className="text-xl font-black text-indigo-950">DỊU MÁT</p>
            </div>
          </div>
          <div className="glass px-6 py-4 rounded-3xl flex items-center gap-3 border-rose-200 min-w-[200px]">
            <div className="p-2 bg-rose-100 rounded-xl text-rose-600">
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Ca cần xử lý</p>
              <p className="text-xl font-black text-indigo-950">{alerts.filter(a => a.riskLevel !== RiskLevel.GREEN).length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Risk Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-1 glass p-6 rounded-3xl shadow-xl border-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <ShieldCheck size={80} />
          </div>
          <h3 className="font-black text-indigo-950 mb-6 flex items-center gap-2 text-sm uppercase tracking-widest border-b border-indigo-50 pb-4">
            Phân phối rủi ro tâm lý
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} fontWeight="900" width={90} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={30}>
                  {statsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Weekly Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 glass p-6 rounded-3xl shadow-xl border-white">
          <h3 className="font-black text-indigo-950 mb-6 flex items-center gap-2 text-sm uppercase tracking-widest border-b border-indigo-50 pb-4">
            Bản đồ nhiệt tâm lý (7 ngày qua)
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorJoy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} fontWeight="bold" />
                <YAxis hide />
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none', fontWeight: 'bold'}} />
                <Area type="monotone" dataKey="stress" name="Áp lực" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorStress)" />
                <Area type="monotone" dataKey="joy" name="Hạnh phúc" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorJoy)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Alert Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-3 glass rounded-3xl overflow-hidden shadow-2xl border-white">
          <div className="p-6 border-b border-indigo-100 bg-white/50 flex justify-between items-center">
            <h3 className="font-black text-indigo-950 uppercase text-sm tracking-widest flex items-center gap-2">
              <AlertTriangle className="text-rose-600" size={18} /> Danh sách ca cần hỗ trợ
            </h3>
            <span className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">Thời gian thực</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-indigo-600 text-[10px] uppercase font-black text-white tracking-widest">
                  <th className="px-6 py-4">Học sinh</th>
                  <th className="px-6 py-4">Phân loại</th>
                  <th className="px-6 py-4">Dấu hiệu/Trigger</th>
                  <th className="px-6 py-4 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-50 bg-white/20">
                {alerts.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-16 text-center text-indigo-400 font-bold">Lớp học hiện tại đang rất ổn định.</td></tr>
                ) : (
                  alerts.map((alert) => (
                    <tr key={alert.id} className={`hover:bg-indigo-50/60 transition-colors ${alert.riskLevel === RiskLevel.RED ? 'bg-rose-50/30' : ''}`}>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-sm shadow-sm">{alert.studentName[0]}</div>
                          <div>
                            <p className="font-black text-indigo-950 text-sm">{alert.studentName}</p>
                            <p className="text-[10px] text-indigo-400 font-bold uppercase">{new Date(alert.timestamp).toLocaleTimeString()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black text-white shadow-sm ${
                          alert.riskLevel === RiskLevel.RED ? 'bg-rose-600' : 
                          alert.riskLevel === RiskLevel.ORANGE ? 'bg-orange-500' : 'bg-amber-500'
                        }`}>
                          {getRiskLabel(alert.riskLevel)}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-xs text-indigo-900 font-bold italic line-clamp-1 opacity-80">"{alert.lastMessage}"</p>
                        <p className="text-[9px] text-indigo-400 mt-1 uppercase font-black tracking-tighter">Qua Persona: {alert.personaUsed}</p>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <button 
                          onClick={() => setSelectedCase(alert)}
                          className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black hover:bg-indigo-700 transition transform active:scale-95 shadow-lg shadow-indigo-100"
                        >
                          XEM CHI TIẾT
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Resources & Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass p-6 rounded-3xl shadow-xl border-white">
            <h3 className="font-black text-indigo-950 mb-4 flex items-center gap-2 text-xs uppercase tracking-widest border-b border-indigo-50 pb-3">
              <FileText size={16} className="text-indigo-600" /> Thư viện hỗ trợ
            </h3>
            <div className="space-y-3">
              {resourceLibrary.map((item, idx) => (
                <button key={idx} className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white transition-all text-left group border border-transparent hover:border-indigo-100">
                  <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    {item.icon}
                  </div>
                  <span className="text-[11px] font-bold text-indigo-900 leading-tight">{item.title}</span>
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-3xl shadow-xl text-white">
            <h3 className="font-black mb-3 text-xs uppercase tracking-widest flex items-center gap-2">
              <Info size={16} /> Ghi chú chuyên môn
            </h3>
            <p className="text-[11px] font-medium leading-relaxed opacity-90 mb-4">
              Hệ thống AI nhận diện "Thứ 5" là thời điểm căng thẳng cực bộ của lớp do lịch kiểm tra dày. Hãy cân nhắc tổ chức một buổi sinh hoạt nhẹ nhàng.
            </p>
            <button className="w-full py-3 bg-white/20 hover:bg-white/30 rounded-2xl text-[10px] font-black transition uppercase tracking-wider">Lập kế hoạch can thiệp</button>
          </motion.div>
        </div>
      </div>

      {/* Detail Modal Placeholder */}
      <AnimatePresence>
        {selectedCase && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-indigo-950/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass max-w-lg w-full p-8 rounded-[40px] shadow-2xl relative"
            >
              <button onClick={() => setSelectedCase(null)} className="absolute top-6 right-6 text-indigo-400 hover:text-indigo-600 font-black">ĐÓNG</button>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-3xl bg-indigo-600 text-white flex items-center justify-center text-2xl font-black">{selectedCase.studentName[0]}</div>
                <div>
                  <h4 className="text-xl font-black text-indigo-950">{selectedCase.studentName}</h4>
                  <p className={`text-xs font-black uppercase ${selectedCase.riskLevel === RiskLevel.RED ? 'text-rose-600' : 'text-orange-500'}`}>Cấp độ: {getRiskLabel(selectedCase.riskLevel)}</p>
                </div>
              </div>
              <div className="bg-white/50 p-6 rounded-3xl mb-6">
                <p className="text-[10px] font-black text-indigo-400 uppercase mb-2">Thông điệp gây cảnh báo:</p>
                <p className="text-sm text-indigo-900 font-bold italic leading-relaxed">"{selectedCase.lastMessage}"</p>
              </div>
              <div className="space-y-3">
                <p className="text-[10px] font-black text-indigo-950 uppercase mb-3">Hành động gợi ý cho giáo viên:</p>
                <div className="flex items-center gap-3 p-3 bg-emerald-50 text-emerald-700 rounded-2xl text-xs font-bold border border-emerald-100">
                  <div className="bg-emerald-600 text-white p-1 rounded-md">1</div>
                  Hẹn gặp học sinh riêng vào cuối buổi học.
                </div>
                <div className="flex items-center gap-3 p-3 bg-indigo-50 text-indigo-700 rounded-2xl text-xs font-bold border border-indigo-100">
                  <div className="bg-indigo-600 text-white p-1 rounded-md">2</div>
                  Kết nối với phụ huynh để tìm hiểu hoàn cảnh tại nhà.
                </div>
              </div>
              <button className="w-full mt-8 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition">ĐÁNH DẤU ĐÃ XỬ LÝ</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeacherDashboard;
