import React, { useState } from 'react';
import { 
  X, Shield, Lock, User, Eye, EyeOff, 
  Crown, School, BookOpen, Sparkles, HeartHandshake, CheckCircle2 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: string;
  onLoginSuccess: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ 
  isOpen, 
  onClose, 
  initialRole, 
  onLoginSuccess 
}) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMsg('يرجى كتابة اسم المستخدم وكلمة المرور');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      await login(username, password);
      onLoginSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'فشل تسجيل الدخول. يرجى التحقق من صحة البيانات.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-emerald-900/10 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header with scout motif */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 text-white p-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-5 left-5 text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold">تسجيل الدخول إلى البوابة الكشفية</h2>
              <p className="text-xs text-emerald-200 mt-0.5">فرقة فتيان أحمد الفاتح الكشفية • مملكة البحرين</p>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick Demo Credentials Toolbar */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                بيانات الدخول السريعة للاختبار والتجربة:
              </span>
              <span className="text-[10px] text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                انقر للتعبئة الفورية
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickFill('المدير', '00973')}
                className="p-2 rounded-xl bg-white border border-emerald-200 hover:border-emerald-500 hover:bg-emerald-100/50 text-right transition-all group"
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-amber-900">
                  <School className="w-3 h-3 text-amber-700" />
                  <span>الإدارة (المدير)</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">الرمز: 00973</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('باسل', '001')}
                className="p-2 rounded-xl bg-white border border-emerald-200 hover:border-emerald-500 hover:bg-emerald-100/50 text-right transition-all group"
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-900">
                  <Crown className="w-3 h-3 text-emerald-700" />
                  <span>القائد باسل</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">الرمز: 001</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('محمد', '002')}
                className="p-2 rounded-xl bg-white border border-emerald-200 hover:border-emerald-500 hover:bg-emerald-100/50 text-right transition-all group"
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-900">
                  <Crown className="w-3 h-3 text-emerald-700" />
                  <span>القائد محمد</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">الرمز: 002</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('salman', '123456')}
                className="p-2 rounded-xl bg-white border border-emerald-200 hover:border-emerald-500 hover:bg-emerald-100/50 text-right transition-all group"
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-blue-900">
                  <BookOpen className="w-3 h-3 text-blue-700" />
                  <span>معلم (أ. سلمان)</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">الرمز: 123456</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('scout_ahmed', '123456')}
                className="p-2 rounded-xl bg-white border border-emerald-200 hover:border-emerald-500 hover:bg-emerald-100/50 text-right transition-all group"
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-purple-900">
                  <Sparkles className="w-3 h-3 text-purple-700" />
                  <span>كشاف (أحمد)</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">الرمز: 123456</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('parent_ahmed', '123456')}
                className="p-2 rounded-xl bg-white border border-emerald-200 hover:border-emerald-500 hover:bg-emerald-100/50 text-right transition-all group"
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-900">
                  <HeartHandshake className="w-3 h-3 text-indigo-700" />
                  <span>ولي الأمر</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">الرمز: 123456</div>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs font-bold text-red-700 animate-shake">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                اسم المستخدم أو المعرف الفريد
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="مثال: باسل أو المدير أو scout_ahmed"
                  required
                  className="w-full px-4 py-3 pl-11 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700 text-sm"
                />
                <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 pl-11 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-800 to-emerald-950 hover:from-emerald-900 hover:to-emerald-900 text-white font-bold rounded-2xl text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 border border-amber-400/20"
            >
              {loading ? (
                <span>جارٍ التحقق من الهوية...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>دخول إلى النظام</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-500">
              بيانات الدخول محمية ومطابقة لسياسات الخصوصية بمملكة البحرين. في حال فقدان بيانات الدخول، يرجى مراجعة قيادة الفرقة لإعادة تعيين كلمة المرور.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
