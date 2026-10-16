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

// قائمة المستخدمين الآمنة (يمكنك إضافة مئات الكشافين والمعلمين هنا بكل إنسيابية)
const MOCK_USERS: any[] = [
  { id: 'admin_1', username: 'admin', password: 'password', role: 'ADMIN', name: 'مدير النظام', isActive: true },
  { id: 'scout_1', username: 'scout_ahmed', password: 'password', role: 'SCOUT', scoutId: 's1', name: 'أحمد (كشاف)', isActive: true },
  { id: 'teacher_1', username: 'teacher_salman', password: 'password', role: 'TEACHER', name: 'أ. سلمان (معلم)', isActive: true },
  { id: 'parent_1', username: 'parent_ahmed', password: 'password', role: 'PARENT', linkedScoutIds: ['s1'], name: 'ولي أمر أحمد', isActive: true },
];

const MOCK_SCOUTS: ScoutProfile[] = [
  { id: 's1', name: 'أحمد محمد', troop: 'فرقة فتيان أحمد الفاتح', level: 'متقدم' }
];

const MOCK_TEACHERS: TeacherProfile[] = [
  { id: 't1', userId: 'teacher_1', name: 'أ. سلمان', subject: 'كشافة' }
];

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
            setSelectedLinkedScoutId(parsed.linkedScouts[0].id || '');
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
      const foundUser = MOCK_USERS.find(u => u.username === trimmedUser);

      if (!foundUser) {
        throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة');
      }

      if (!foundUser.isActive) {
        throw new Error('هذا الحساب معطل أو غير موجود');
      }

      let foundScoutProfile = null;
      if (foundUser.role === 'SCOUT' && foundUser.scoutId) {
        foundScoutProfile = MOCK_SCOUTS.find(s => s.id === foundUser.scoutId) || null;
      }

      let foundLinkedScouts: ScoutProfile[] = [];
      if (foundUser.role === 'PARENT' && foundUser.linkedScoutIds) {
        foundLinkedScouts = MOCK_SCOUTS.filter(s => foundUser.linkedScoutIds.includes(s.id));
      }

      let foundTeacherProfile = null;
      if (foundUser.role === 'TEACHER') {
        foundTeacherProfile = MOCK_TEACHERS.find(t => t.userId === foundUser.id) || null;
      }

      const sessionToken = `session_${foundUser.id}_${Date.now()}`;
      
      setUser(foundUser);
      setToken(sessionToken);
      setScoutProfile(foundScoutProfile);
      setLinkedScouts(foundLinkedScouts);
      if (foundLinkedScouts.length > 0) {
        setSelectedLinkedScoutId(foundLinkedScouts[0].id);
      }
      setTeacherProfile(foundTeacherProfile);

      localStorage.setItem('ahmed_alfateh_session', JSON.stringify({
        user: foundUser,
        token: sessionToken,
        scoutProfile: foundScoutProfile,
        linkedScouts: foundLinkedScouts,
        teacherProfile: foundTeacherProfile
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
