import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, ScoutProfile, TeacherProfile } from '../types';
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

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

      // 1. التحقق الاستثنائي من القادة الثابتين (باسل / محمد) لضمان دخولهم دائماً
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

      // 2. البحث عن المستخدم في قاعدة بيانات Firebase (مجموعة users) للمعلمين والكشافين المضافين
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', trimmedUser));
      const querySnap = await getDocs(q);

      if (querySnap.empty) {
        throw new Error('اسم المستخدم غير مسجل في النظام');
      }

      let foundUser: any = null;
      querySnap.forEach(docSnap => {
        foundUser = { id: docSnap.id, ...docSnap.data() };
      });

      if (!foundUser || !foundUser.isActive) {
        throw new Error('هذا الحساب معطل أو غير موجود');
      }

      // بالنسبة للكشاف والمعلم، الرقم الشخصي أو رقم الترتيب هو اسم المستخدم
      // إذا كان الحساب يتطلب كلمة مرور مسجلة، نقوم بمقارنتها، أو نسمح بالدخول المباشر بالرقم إذا لم تكن مطلوبة
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
