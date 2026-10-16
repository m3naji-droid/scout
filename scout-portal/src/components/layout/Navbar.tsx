import React, { useState, useEffect } from 'react';
import { 
  Shield, Bell, LogOut, Award, UserCheck, 
  Menu, X, Check, Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AppNotification } from '../../types';
import { api } from '../../lib/api';

interface NavbarProps {
  onOpenLogin: () => void;
  onNavigate: (view: string) => void;
  currentView: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenLogin, onNavigate, currentView }) => {
  const { user, logout, scoutProfile, selectedLinkedScout } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; error: boolean } | null>(null);

  useEffect(() => {
    if (user) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    try {
      const data = await api.getNotifications(user.id);
      setNotifications(data);
    } catch (err) {
      console.error('Failed loading notifications:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    await api.markAllNotificationsRead(user.id);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const res = await api.changePassword(user.id, currentPassword, newPassword);
      setPasswordMsg({ text: res.message || 'تم تحديث كلمة المرور بنجاح', error: false });
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setShowChangePassword(false), 2000);
    } catch (err: any) {
      setPasswordMsg({ text: err.message || 'فشل تحديث كلمة المرور', error: true });
    }
  };

  const getRoleArabicLabel = (role?: string) => {
    switch (role) {
      case 'ADMIN': return 'الإدارة المدرسية';
      case 'LEADER': return 'قائد الفرقة';
      case 'TEACHER': return 'المعلم';
      case 'SCOUT': return 'كشاف';
      case 'PARENT': return 'ولي أمر';
      case 'SUPERVISOR': return 'مشرف مفوض';
      default: return 'زائر';
    }
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'LEADER': return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'TEACHER': return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'SCOUT': return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'PARENT': return 'bg-indigo-100 text-indigo-900 border-indigo-300';
      default: return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-900/10 shadow-xs no-print">
        {/* Top Flag / Ministry Bar */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 text-white text-xs py-1.5 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
              <span className="font-medium">مملكة البحرين • وزارة التربية والتعليم • كشافة البحرين</span>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-emerald-200">
              <span>فرقة فتيان أحمد الفاتح الكشفية</span>
              <span>•</span>
              <span className="text-amber-300 font-semibold">«كُن مستعداً»</span>
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Brand Logo & Name */}
            <div 
              onClick={() => onNavigate('home')} 
              className="flex items-center gap-3 cursor-pointer group select-none"
            >
              {/* Bahrain Scout Emblem Placeholder with Authentic Heraldry */}
              <div className="relative w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-br from-emerald-700 to-emerald-950 p-0.5 shadow-md flex items-center justify-center group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-emerald-900 rounded-[14px] flex items-center justify-center border border-amber-400/40">
                  <Shield className="w-6 h-6 text-amber-400" />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-[10px] font-bold text-white flex items-center justify-center border-2 border-white">
                    BH
                  </div>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-xl font-bold text-emerald-950 tracking-tight leading-snug">
                  فرقة فتيان أحمد الفاتح الكشفية
                </span>
                <span className="text-xs text-emerald-700 font-medium hidden sm:inline">
                  مدرسة أحمد الفاتح الإعدادية للبنين • مملكة البحرين
                </span>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => onNavigate('home')}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  currentView === 'home'
                    ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200'
                    : 'text-slate-600 hover:text-emerald-900 hover:bg-slate-50'
                }`}
              >
                الرئيسية
              </button>

              <button
                onClick={() => onNavigate('distinction')}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                  currentView === 'distinction'
                    ? 'bg-amber-50 text-amber-900 font-bold border border-amber-300'
                    : 'text-slate-600 hover:text-amber-800 hover:bg-amber-50/50'
                }`}
              >
                <Award className="w-4 h-4 text-amber-600" />
                نجوم الفرقة
              </button>

              {user && (
                <button
                  onClick={() => onNavigate('dashboard')}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                    currentView === 'dashboard'
                      ? 'bg-emerald-700 text-white font-bold shadow-xs'
                      : 'text-emerald-800 hover:bg-emerald-50'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  لوحة التحكم ({getRoleArabicLabel(user.role)})
                </button>
              )}
            </nav>

            {/* User Controls & Notifications */}
            <div className="flex items-center gap-2 sm:gap-3">
              {user ? (
                <>
                  {/* Notifications Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setShowNotifMenu(!showNotifMenu)}
                      className="p-2 sm:p-2.5 text-slate-600 hover:text-emerald-900 hover:bg-emerald-50 rounded-xl relative transition-colors"
                      title="الإشعارات"
                    >
                      <Bell className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    {showNotifMenu && (
                      <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50">
                        <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                          <span className="font-bold text-slate-800 text-sm">الإشعارات والتنبيهات</span>
                          {unreadCount > 0 && (
                            <button
                              onClick={handleMarkAllRead}
                              className="text-xs text-emerald-700 hover:underline flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              تحديد الكل كمقروء
                            </button>
                          )}
                        </div>
                        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                          {notifications.length === 0 ? (
                            <div className="py-8 text-center text-slate-400 text-sm">
                              لا توجد إشعارات حالياً
                            </div>
                          ) : (
                            notifications.map(n => (
                              <div
                                key={n.id}
                                onClick={() => handleMarkAsRead(n.id)}
                                className={`p-3.5 cursor-pointer hover:bg-slate-50 transition-colors ${
                                  !n.isRead ? 'bg-emerald-50/50' : ''
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <span className={`text-xs font-bold ${!n.isRead ? 'text-emerald-900' : 'text-slate-700'}`}>
                                    {n.title}
                                  </span>
                                  {!n.isRead && (
                                    <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0 mt-1"></span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                  {n.message}
                                </p>
                                <span className="text-[10px] text-slate-400 mt-1 block">
                                  {new Date(n.createdAt).toLocaleDateString('ar-BH')}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User Profile Pill */}
                  <div className="hidden sm:flex items-center gap-2.5 pl-2">
                    <div className="text-left">
                      <div className="text-xs font-bold text-slate-900 truncate max-w-[150px]">
                        {user.role === 'SCOUT' && scoutProfile ? scoutProfile.fullName : user.fullName}
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${getRoleBadgeColor(user.role)}`}>
                        {getRoleArabicLabel(user.role)}
                      </span>
                    </div>

                    <div className="w-9 h-9 rounded-full bg-emerald-800 text-amber-300 font-bold flex items-center justify-center text-sm shadow-xs border border-amber-400/30 overflow-hidden">
                      {user.role === 'SCOUT' && scoutProfile?.avatarUrl && scoutProfile.avatarStatus === 'APPROVED' ? (
                        <img src={scoutProfile.avatarUrl} alt={scoutProfile.fullName} className="w-full h-full object-cover" />
                      ) : (
                        user.fullName.charAt(0)
                      )}
                    </div>
                  </div>

                  {/* Change Password trigger */}
                  <button
                    onClick={() => setShowChangePassword(true)}
                    className="p-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
                    title="تغيير كلمة المرور"
                  >
                    <Lock className="w-4 h-4" />
                  </button>

                  {/* Logout Button */}
                  <button
                    onClick={logout}
                    className="p-2 sm:px-3 sm:py-2 text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-colors"
                    title="تسجيل الخروج"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">خروج</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={onOpenLogin}
                  className="px-4 py-2 sm:px-5 sm:py-2.5 bg-gradient-to-r from-emerald-800 to-emerald-950 hover:from-emerald-900 hover:to-emerald-900 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 border border-amber-400/30"
                >
                  <Shield className="w-4 h-4 text-amber-400" />
                  تسجيل الدخول
                </button>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-2 pb-4 space-y-2">
            <button
              onClick={() => { onNavigate('home'); setShowMobileMenu(false); }}
              className="w-full text-right px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              الرئيسية
            </button>
            <button
              onClick={() => { onNavigate('distinction'); setShowMobileMenu(false); }}
              className="w-full text-right px-4 py-2.5 rounded-xl text-sm font-semibold text-amber-800 hover:bg-amber-50 flex items-center gap-2"
            >
              <Award className="w-4 h-4 text-amber-600" />
              نجوم الفرقة (شاشة التميز)
            </button>
            {user && (
              <button
                onClick={() => { onNavigate('dashboard'); setShowMobileMenu(false); }}
                className="w-full text-right px-4 py-2.5 rounded-xl text-sm font-semibold text-emerald-800 hover:bg-emerald-50 flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                لوحة التحكم ({getRoleArabicLabel(user.role)})
              </button>
            )}
          </div>
        )}
      </header>

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-700" />
                تغيير كلمة المرور
              </h3>
              <button 
                onClick={() => { setShowChangePassword(false); setPasswordMsg(null); }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4 mt-4">
              {passwordMsg && (
                <div className={`p-3 rounded-xl text-xs font-semibold ${passwordMsg.error ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'}`}>
                  {passwordMsg.text}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">كلمة المرور الحالية</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  placeholder="أدخل كلمة المرور الحالية"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">كلمة المرور الجديدة</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  minLength={4}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  placeholder="أدخل كلمة مرور قوية جديدة"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-sm shadow-md transition-colors"
                >
                  حفظ كلمة المرور
                </button>
                <button
                  type="button"
                  onClick={() => setShowChangePassword(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
