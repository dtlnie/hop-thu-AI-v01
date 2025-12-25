
export enum RiskLevel {
  GREEN = 'GREEN',
  YELLOW = 'YELLOW',
  ORANGE = 'ORANGE',
  RED = 'RED'
}

export type PersonaType = 'TEACHER' | 'FRIEND' | 'EXPERT' | 'LISTENER';

export interface User {
  id: string;
  username: string;
  role: 'student' | 'teacher';
  avatar: string;
}

export interface UserMemory {
  insights: string; // Tóm tắt đặc điểm tâm lý, sự kiện quan trọng
  lastUpdated: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  riskLevel?: RiskLevel;
}

export interface ChatState {
  [key: string]: Message[];
}

export interface StudentAlert {
  id: string;
  studentName: string;
  riskLevel: RiskLevel;
  lastMessage: string;
  timestamp: number;
  personaUsed: string;
}
