import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { HeroSection } from './components/home/HeroSection';
import { DistinctionScreen } from './components/distinction/DistinctionScreen';
import { LoginModal } from './components/auth/LoginModal';
import { LeaderDashboard } from './components/dashboards/LeaderDashboard';
import { TeacherDashboard } from './components/dashboards/TeacherDashboard';
import { ScoutDashboard } from './components/dashboards/ScoutDashboard';
import { ParentDashboard } from './components/dashboards/ParentDashboard';
import { AdminDashboard } from './components/dashboards/AdminDashboard';
import { CertificatePrintModal } from './components/certificates/CertificatePrintModal';
import { PrivacyPolicyModal } from './components/modals/PrivacyPolicyModal';
import { Announcement, TroopActivity, Certificate } from './types';
import { api } from './lib/api';
import { Shield, Heart, Flag, Phone, Mail, MapPin } from 'lucide-react';

const MainApp: React.FC = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<'home' | 'distinction' | 'dashboard'>('home');
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [selectedRoleHint, setSelectedRoleHint] = useState<string>('');
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [activeCertificate, setActiveCertificate] = useState<Certificate | null>(null);

  // Public Home Data
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [upcomingActivities, setUpcomingActivities] = useState<Partial<TroopActivity>[]>([]);
  const [stats, setStats] = useState({ scoutsCount: 0, teachersCount: 0, activitiesCount: 0 });

  useEffect(() => {
    loadPublicData();
  }, []);

  const loadPublicData = async () => {
    try {
      const data = await api.getPublicInfo();
      setAnnouncements(data.announcements || []);
      setUpcomingActivities(data.upcomingActivities || []);
      setStats(data.stats || { scoutsCount: 4, teachersCount: 2, activitiesCount: 2 });
    } catch (err) {
      console.error('Failed loading public info:', err);
    }
  };

  const handleSelectRole = (role: string) => {
    if (user && user.role === role) {
      setCurrentView('dashboard');
    } else {
      setSelectedRoleHint(role);
      setLoginModalOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    setCurrentView('dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        onOpenLogin={() => {
          setSelectedRoleHint('');
          setLoginModalOpen(true);
        }}
        onNavigate={(view: any) => setCurrentView(view)}
        currentView={currentView}
      />

      {/* Main Body Content */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HeroSection
            onSelectRole={handleSelectRole}
            onNavigate={(view: any) => setCurrentView(view)}
            announcements={announcements}
            upcomingActivities={upcomingActivities}
            stats={stats}
          />
        )}

        {currentView === 'distinction' && (
          <DistinctionScreen
            onBack={() => setCurrentView('home')}
          />
        )}

        {currentView === 'dashboard' && (
          <>
            {!user ? (
              <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
                <Shield className="w-16 h-16 text-emerald-700 mx-auto" />
                <h2 className="text-xl font-bold text-slate-800">يرجى تسجيل الدخول أولاً</h2>
                <p className="text-xs text-slate-500">
                  لوحة التحكم مخصصة للمستخدمين المسجلين المصرح لهم بفرقة فتيان أحمد الفاتح الكشفية.
                </p>
                <button
                  onClick={() => setLoginModalOpen(true)}
                  className="px-6 py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-2xl text-sm shadow-md transition-all"
                >
                  تسجيل الدخول الآن
                </button>
              </div>
            ) : user.role === 'LEADER' ? (
              <LeaderDashboard
                onOpenCertificate={(c) => setActiveCertificate(c)}
                onNavigateDistinction={() => setCurrentView('distinction')}
              />
            ) : user.role === 'ADMIN' ? (
              <AdminDashboard />
            ) : user.role === 'TEACHER' ? (
              <TeacherDashboard />
            ) : user.role === 'SCOUT' ? (
              <ScoutDashboard
                onOpenCertificate={(c) => setActiveCertificate(c)}
              />
            ) : (
              <ParentDashboard
                onOpenCertificate={(c) => setActiveCertificate(c)}
              />
            )}
          </>
        )}
      </main>

      {/* Official Footer */}
      <footer className="bg-emerald-950 text-white border-t-4 border-amber-400 pt-12 pb-8 px-4 sm:px-6 lg:px-8 no-print">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-emerald-900">
          {/* Col 1: Identity */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold shadow-md">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">فرقة فتيان أحمد الفاتح الكشفية</h3>
                <span className="text-xs text-emerald-300">مملكة البحرين • وزارة التربية والتعليم</span>
              </div>
            </div>
            <p className="text-xs text-emerald-200/80 max-w-md leading-relaxed">
              منصة رقمية مدرسية كشفية رائدة تهدف إلى بناء شخصية الفتى الكشفي الصالح، وتعزيز قيم الانضباط والولاء وخدمة المجتمع تحت شعار «كُن مستعداً».
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs text-amber-300 uppercase tracking-wider">روابط سريعة</h4>
            <ul className="space-y-1.5 text-xs text-emerald-200">
              <li>
                <button onClick={() => setCurrentView('home')} className="hover:text-white transition-colors">الصفحة الرئيسية</button>
              </li>
              <li>
                <button onClick={() => setCurrentView('distinction')} className="hover:text-white transition-colors">شاشة التميز (نجوم الفرقة)</button>
              </li>
              <li>
                <button onClick={() => setPrivacyModalOpen(true)} className="hover:text-white transition-colors">سياسة الخصوصية وأمان الطلبة</button>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs text-amber-300 uppercase tracking-wider">التواصل المعتمد</h4>
            <ul className="space-y-2 text-xs text-emerald-200">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span>مدرسة أحمد الفاتح الإعدادية للبنين • مملكة البحرين</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span dir="ltr">+973 1700 0000</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>ahmedalfateh.scouts@moe.gov.bh</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-emerald-400 gap-2">
          <div>
            جميع الحقوق محفوظة © {new Date().getFullYear()} فرقة فتيان أحمد الفاتح الكشفية • مدرسة أحمد الفاتح الإعدادية للبنين • كشافة البحرين
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setPrivacyModalOpen(true)} className="hover:text-white underline">
              سياسة الخصوصية
            </button>
            <span>•</span>
            <span className="text-amber-300 font-semibold">«عزم، انضباط، وتميز»</span>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        initialRole={selectedRoleHint}
        onLoginSuccess={handleLoginSuccess}
      />

      <CertificatePrintModal
        certificate={activeCertificate}
        onClose={() => setActiveCertificate(null)}
      />

      <PrivacyPolicyModal
        isOpen={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
