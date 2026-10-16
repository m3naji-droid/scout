import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, ScoutProfile, TeacherProfile } from '../types';

interface AuthContextType {
  user: User | null;
  scoutProfile: ScoutProfile | null;
  linkedScouts: ScoutProfile[];
  selectedLinkedScout: ScoutProfile | null;
  setSelectedLinkedScoutId: (id: string) => void;
  teacherProfile: TeacherProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// قائمة القادة المعتمدين مع كافة الخصائص لتجنب أخطاء الفحص النصي
const MOCK_USERS: any[] = [
  { 
    id: 'leader_basel', 
    username: 'باسل', 
    password: '1234', 
    role: 'LEADER', 
    name: 'القائد باسل حسن', 
    fullName: 'القائد باسل حسن',
    isActive: true 
  },
  { 
    id: 'leader_mohammed', 
    username: 'محمد', 
    password: '5678', 
    role: 'LEADER', 
    name: 'القائد محمد علي', 
    fullName: 'القائد محمد علي',
    isActive: true 
  },
];

const MOCK_SCOUTS: ScoutProfile[] = [];
const MOCK_TEACHERS: TeacherProfile[] = [];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [scoutProfile, setScoutProfile] = useState<ScoutProfile | null>(null);
  const [linkedScouts, setLinkedScouts] = useState<ScoutProfile[]>([]);
  const [selectedLinkedScoutId, setSelectedLinkedScoutId] = useState<string>('');
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore session safely from localStorage
  useEffect(() => {
    try {
      const savedAuth = localStorage.getItem('ahmed_alfateh_session');
      if (savedAuth) {
        const parsed = JSON.parse(savedAuth);
        if (parsed && parsed.user) {
          setUser(parsed.user);
          setToken(parsed.token || null);
          setScoutProfile(parsed.scoutProfile || null);
          setLinkedScouts(parsed.linkedScouts || []);
          if (parsed.linkedScouts && parsed.linkedScouts.length > 0) {
            setSelectedLinkedScoutId(parsed.linkedScouts[0]?.id || '');
          }
          setTeacherProfile(parsed.teacherProfile || null);
        }
      }
    } catch (err) {
      console.error('Failed reading saved session:', err);
      localStorage.removeItem('ahmed_alfateh_session');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const trimmedUser = (username || '').trim();
      const foundUser = MOCK_USERS.find(u => u.username === trimmedUser && u.password === password);

      if (!foundUser) {
        throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة');
      }

      if (!foundUser.isActive) {
        throw new Error('هذا الحساب معطل أو غير موجود');
      }

      const sessionToken = `session_${foundUser.id}_${Date.now()}`;
      
      setUser(foundUser);
      setToken(sessionToken);
      setScoutProfile(null);
      setLinkedScouts([]);
      setSelectedLinkedScoutId('');
      setTeacherProfile(null);

      localStorage.setItem('ahmed_alfateh_session', JSON.stringify({
        user: foundUser,
        token: sessionToken,
        scoutProfile: null,
        linkedScouts: [],
        teacherProfile: null
      }));

    } catch (err: any) {
      console.error('Login error:', err);
      throw new Error(err.message || 'فشل تسجيل الدخول. يرجى التحقق من صحة البيانات.');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setScoutProfile(null);
    setLinkedScouts([]);
    setSelectedLinkedScoutId('');
    setTeacherProfile(null);
    localStorage.removeItem('ahmed_alfateh_session');
  };

  const refreshUser = async () => {
    if (!user) return;
  };

  const selectedLinkedScout = linkedScouts.find(s => s.id === selectedLinkedScoutId) || linkedScouts[0] || null;

  return (
    <AuthContext.Provider
      value={{
        user,
        scoutProfile,
        linkedScouts,
        selectedLinkedScout,
        setSelectedLinkedScoutId,
        teacherProfile,
        token,
        isLoading,
        login,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
