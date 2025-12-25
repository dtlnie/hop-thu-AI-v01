
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User, PersonaType, Message, RiskLevel, ChatState } from '../types';
import { PERSONAS } from '../constants';
import { getGeminiResponse } from '../services/geminiService';
import { Send, Phone, UserX, AlertTriangle, AlertCircle, Sparkles, RefreshCcw, MessageCircle, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatbotProps {
  user: User;
}

const Chatbot: React.FC<ChatbotProps> = ({ user }) => {
  const [selectedPersona, setSelectedPersona] = useState<PersonaType | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatState>(() => {
    try {
      const saved = localStorage.getItem(`spss_chats_${user.id}`);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentRisk, setCurrentRisk] = useState<RiskLevel>(RiskLevel.GREEN);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Ref để lưu trữ AbortController
  const abortControllerRef = useRef<AbortController | null>(null);

  const currentMessages = selectedPersona ? (chatHistory[selectedPersona] || []) : [];

  const scrollToBottom = useCallback(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(`spss_chats_${user.id}`, JSON.stringify(chatHistory));
    scrollToBottom();
  }, [chatHistory, scrollToBottom]);

  const handleStopRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsTyping(false);
    }
  };

  const handleSendMessage = async () => {
    const text = input.trim();
    if (!text || !selectedPersona || isTyping || currentRisk === RiskLevel.RED) return;

    const userMessage: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now()
    };

    setChatHistory(prev => ({
      ...prev,
      [selectedPersona]: [...(prev[selectedPersona] || []), userMessage]
    }));

    setInput('');
    setIsTyping(true);

    // Khởi tạo AbortController mới cho yêu cầu này
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const historyForAI = currentMessages.slice(-6).map(m => ({ 
        role: m.role, 
        content: m.content 
      }));

      const response = await getGeminiResponse(text, selectedPersona, historyForAI, controller.signal);

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        timestamp: Date.now(),
        riskLevel: (response.riskLevel as RiskLevel) || RiskLevel.GREEN
      };

      setChatHistory(prev => ({
        ...prev,
        [selectedPersona]: [...(prev[selectedPersona] || []), aiMessage]
      }));

      setCurrentRisk((response.riskLevel as RiskLevel) || RiskLevel.GREEN);

      if (response.riskLevel === RiskLevel.ORANGE || response.riskLevel === RiskLevel.RED) {
        saveAlert(text, response.riskLevel as RiskLevel);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        const cancelMsg: Message = {
          id: `sys-${Date.now()}`,
          role: 'assistant',
          content: "*(Tin nhắn đã bị hủy bởi người dùng)*",
          timestamp: Date.now()
        };
        setChatHistory(prev => ({
          ...prev,
          [selectedPersona]: [...(prev[selectedPersona] || []), cancelMsg]
        }));
      } else {
        console.error("Chat error:", error);
        const errorMessage: Message = {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: "Mình không hiểu ý bạn lắm hoặc kết nối bị lỗi, bạn nói lại cho mình nghe được không?",
          timestamp: Date.now()
        };
        setChatHistory(prev => ({
          ...prev,
          [selectedPersona]: [...(prev[selectedPersona] || []), errorMessage]
        }));
      }
    } finally {
      setIsTyping(false);
      abortControllerRef.current = null;
    }
  };

  const saveAlert = (lastText: string, level: RiskLevel) => {
    try {
      const alerts = JSON.parse(localStorage.getItem('spss_alerts') || '[]');
      alerts.push({
        id: Date.now().toString(),
        studentName: user.username,
        riskLevel: level,
        lastMessage: lastText,
        timestamp: Date.now(),
        personaUsed: selectedPersona
      });
      localStorage.setItem('spss_alerts', JSON.stringify(alerts.slice(-50)));
    } catch (e) {
      console.error("Alert save error", e);
    }
  };

  if (!selectedPersona) {
    return (
      <div className="flex flex-col items-center px-4 max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 mt-8"
        >
          <h2 className="text-3xl sm:text-4xl font-black text-indigo-950 mb-3 tracking-tight">Chào {user.username}, hôm nay bạn thế nào?</h2>
          <p className="text-indigo-600 font-bold bg-white/50 px-6 py-2 rounded-full inline-block shadow-sm">Chọn một người bạn để bắt đầu trò chuyện nhé</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {PERSONAS.map((p) => (
            <motion.button
              key={p.id}
              whileHover={{ y: -10, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedPersona(p.id)}
              className="glass p-8 rounded-[40px] flex flex-col items-center text-center group border-white shadow-xl hover:shadow-indigo-200/50 transition-all duration-300"
            >
              <div className={`${p.color} p-5 rounded-3xl mb-6 group-hover:rotate-6 transition-transform shadow-lg`}>
                {p.icon}
              </div>
              <h3 className="font-black text-indigo-950 text-xl mb-1">{p.name}</h3>
              <p className="text-[10px] font-black text-indigo-400 mb-4 uppercase tracking-[0.2em]">{p.role}</p>
              <p className="text-sm text-indigo-800 font-medium leading-relaxed opacity-80">{p.description}</p>
              
              {chatHistory[p.id]?.length > 0 && (
                <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                  <Sparkles size={10} /> ĐANG CÓ {chatHistory[p.id].length} TIN NHẮN
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  const activePersona = PERSONAS.find(p => p.id === selectedPersona);

  return (
    <div className="flex flex-col h-[calc(100vh-14rem)] max-w-5xl mx-auto glass rounded-[40px] overflow-hidden shadow-2xl border-white/60 relative">
      <div className="p-5 border-b border-indigo-100 flex justify-between items-center bg-white/60 backdrop-blur-xl z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              if(isTyping) handleStopRequest();
              setSelectedPersona(null);
            }}
            className="p-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest shadow-sm"
          >
            ĐỔI NHÂN VẬT
          </button>
          <div className="h-10 w-px bg-indigo-100 mx-1"></div>
          <div className={`${activePersona?.color} p-2.5 rounded-xl shadow-md`}>
            {activePersona?.icon}
          </div>
          <div>
            <h3 className="font-black text-indigo-950 text-base leading-tight">{activePersona?.name}</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              <p className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter">Đang kết nối</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {currentRisk === RiskLevel.RED && (
            <button 
              onClick={() => setCurrentRisk(RiskLevel.GREEN)}
              className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl text-[10px] font-black shadow-lg"
            >
              <RefreshCcw size={14} /> TIẾP TỤC CHAT
            </button>
          )}
        </div>
      </div>

      <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-white/20 to-indigo-50/10">
        {currentMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-40 text-center">
            <div className="p-6 bg-white rounded-full mb-4 shadow-inner">
              <MessageCircle size={40} className="text-indigo-200" />
            </div>
            <p className="text-indigo-950 font-black text-xl mb-1">Mọi chuyện bắt đầu từ đây...</p>
            <p className="text-indigo-700 font-bold text-sm max-w-xs leading-relaxed">Bạn có thể chia sẻ bất cứ điều gì, mình sẽ luôn lắng nghe bạn.</p>
          </div>
        ) : (
          currentMessages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`group relative max-w-[80%] px-6 py-4 rounded-3xl shadow-sm text-sm font-bold leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-br-none shadow-indigo-200' 
                  : msg.id.startsWith('sys-') 
                    ? 'bg-gray-100 text-gray-500 italic text-[11px]' 
                    : 'bg-white text-indigo-950 rounded-bl-none border border-indigo-50 shadow-indigo-100/30'
              }`}>
                {msg.content}
              </div>
            </motion.div>
          ))
        )}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/80 backdrop-blur-sm px-5 py-3 rounded-2xl rounded-bl-none shadow-sm flex gap-1.5 items-center border border-indigo-50">
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-duration:0.8s]"></div>
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} className="h-4" />
      </div>

      <div className="p-6 bg-white/90 backdrop-blur-xl border-t border-indigo-50">
        <div className="relative flex items-center gap-3 max-w-4xl mx-auto">
          <input
            disabled={currentRisk === RiskLevel.RED || isTyping}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={isTyping ? "Chờ AI phản hồi..." : "Nhập câu chuyện của bạn..."}
            className="w-full bg-indigo-50/30 border-2 border-indigo-50/50 rounded-3xl px-6 py-5 pr-16 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-indigo-950 font-bold placeholder:text-indigo-300 shadow-inner"
          />
          {isTyping ? (
            <button
              onClick={handleStopRequest}
              className="absolute right-2 p-4 bg-rose-500 text-white rounded-2xl hover:bg-rose-600 transition-all shadow-lg active:scale-90 flex items-center justify-center"
              title="Dừng phản hồi"
            >
              <Square size={20} fill="currentColor" />
            </button>
          ) : (
            <button
              disabled={!input.trim() || currentRisk === RiskLevel.RED}
              onClick={handleSendMessage}
              className="absolute right-2 p-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:bg-indigo-200 disabled:cursor-not-allowed transition-all shadow-lg active:scale-90"
            >
              <Send size={20} />
            </button>
          )}
        </div>
        <p className="text-center text-[10px] text-indigo-300 font-black mt-4 uppercase tracking-widest">An toàn • Bảo mật • Luôn lắng nghe</p>
      </div>
    </div>
  );
};

export default Chatbot;
