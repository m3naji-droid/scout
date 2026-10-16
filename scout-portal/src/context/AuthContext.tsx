import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, ScoutProfile, TeacherProfile } from '../types';
import { db } from './firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

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

  // Restore session from localStorage if present
  useEffect(() => {
    try {
      const savedAuth = localStorage.getItem('ahmed_alfateh_session');
      if (savedAuth) {
        const parsed = JSON.parse(savedAuth);
        setUser(parsed.user);
        setToken(parsed.token);
        setScoutProfile(parsed.scoutProfile || null);
        setLinkedScouts(parsed.linkedScouts || []);
        if (parsed.linkedScouts && parsed.linkedScouts.length > 0) {
          setSelectedLinkedScoutId(parsed.linkedScouts[0].id);
        }
        setTeacherProfile(parsed.teacherProfile || null);
      }
    } catch (err) {
      console.error('Failed reading saved session:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', username.trim()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة');
      }

      let foundUser: any = null;
      querySnapshot.forEach((doc) => {
        foundUser = { id: doc.id, ...doc.data() };
      });

      if (!foundUser || !foundUser.isActive) {
        throw new Error('هذا الحساب معطل أو غير موجود');
      }

      let foundScoutProfile = null;
      if (foundUser.role === 'SCOUT' && foundUser.scoutId) {
        const scoutsRef = collection(db, 'scouts');
        const scoutSnap = await getDocs(scoutsRef);
        scoutSnap.forEach((d) => {
          if (d.id === foundUser.scoutId) {
            foundScoutProfile = { id: d.id, ...d.data() };
          }
        });
      }

      let foundLinkedScouts: ScoutProfile[] = [];
      if (foundUser.role === 'PARENT' && foundUser.linkedScoutIds) {
        const scoutsRef = collection(db, 'scouts');
        const scoutSnap = await getDocs(scoutsRef);
        scoutSnap.forEach((d) => {
          const sData = { id: d.id, ...d.data() } as ScoutProfile;
          if (foundUser.linkedScoutIds.includes(sData.id)) {
            foundLinkedScouts.push(sData);
          }
        });
      }

      let foundTeacherProfile = null;
      if (foundUser.role === 'TEACHER') {
        const teachersRef = collection(db, 'teachers');
        const tSnap = await getDocs(teachersRef);
        tSnap.forEach((d) => {
          const tData: any = d.data();
          if (tData.userId === foundUser.id) {
            foundTeacherProfile = { id: d.id, ...tData };
          }
        });
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
