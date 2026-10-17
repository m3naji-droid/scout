import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, ScoutProfile, TeacherProfile } from '../types';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

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
      const trimmedPass = (password || '').trim();

      // 1. التحقق الاستثنائي من القادة الثابتين (باسل / محمد)
      if ((trimmedUser === 'باسل' && trimmedPass === '1234') || (trimmedUser === 'محمد' && trimmedPass === '5678')) {
        const leaderUser = {
          id: trimmedUser === 'باسل' ? 'leader_basel' : 'leader_mohammed',
          username: trimmedUser,
          fullName: trimmedUser === 'باسل' ? 'القائد باسل حسن' : 'القائد محمد علي',
          role: 'LEADER',
          isActive: true
        };
        const sessionToken = `session_${leaderUser.id}_${Date.now()}`;
        setUser(leaderUser);
        setToken(sessionToken);
        localStorage.setItem('ahmed_alfateh_session', JSON.stringify({ user: leaderUser, token: sessionToken }));
        return;
      }

      // 2. جلب كافة المستخدمين من قاعدة بيانات Firebase والبحث بمرونة تامة
      const usersSnap = await getDocs(collection(db, 'users'));
      let foundUser: any = null;

      usersSnap.forEach(docSnap => {
        const data = docSnap.data();
        const dbUsername = String(data.username || data.nationalId || data.employeeId || '').trim();
        
        // مقارنة اسم المستخدم أو الرقم الشخصي/الوظيفي بغض النظر عن المسافات البسيطة
        if (dbUsername === trimmedUser) {
          foundUser = { id: docSnap.id, ...data };
        }
      });

      if (!foundUser) {
        throw new Error('اسم المستخدم غير مسجل في النظام');
      }

      if (foundUser.isActive === false) {
        throw new Error('هذا الحساب معطل حالياً');
      }

      // التحقق من كلمة المرور إذا كانت مسجلة للحساب
      if (foundUser.passwordHash && foundUser.passwordHash !== trimmedPass) {
        throw new Error('كلمة المرور غير صحيحة');
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
