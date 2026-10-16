import React from 'react';
import { 
  Shield, School, Crown, BookOpen, Sparkles, HeartHandshake, 
  Calendar, Award, ArrowLeft, CheckCircle, ChevronLeft, MapPin, 
  Clock, Megaphone, Flag, Info
} from 'lucide-react';
import { Announcement, TroopActivity } from '../../types';

interface HeroSectionProps {
  onSelectRole: (role: string) => void;
  onNavigate: (view: string) => void;
  announcements: Announcement[];
  upcomingActivities: Partial<TroopActivity>[];
  stats: {
    scoutsCount: number;
    teachersCount: number;
    activitiesCount: number;
  };
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSelectRole,
  onNavigate,
  announcements,
  upcomingActivities,
  stats
}) => {
  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      {/* Official Emblems & Troop Identity Header Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8 border-b-4 border-amber-400">
        {/* Subtle geometric pattern background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#fbbf24_1px,transparent_1px)] [background-size:24px_24px]"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10 flex flex-col items-center">
          
          {/* 1. Official Ministry of Education Placeholder Emblem */}
          <div className="flex flex-col items-center mb-4">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-white/10 p-1 border-2 border-amber-400/60 shadow-xl flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-emerald-900 flex flex-col items-center justify-center text-center p-1 border border-white/20">
                <Flag className="w-6 h-6 text-red-500 fill-red-500" />
                <span className="text-[8px] font-bold text-amber-300 mt-0.5 leading-none">مملكة البحرين</span>
              </div>
            </div>
            <span className="text-xs sm:text-sm font-semibold text-emerald-200 mt-2">
              وزارة التربية والتعليم • قطاع التعليم
            </span>
          </div>

          {/* 2. Official Bahrain Scouts Placeholder Emblem */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-3xl bg-gradient-to-br from-amber-400 to-amber-600 p-1 shadow-2xl">
                <div className="w-full h-full bg-emerald-950 rounded-[22px] flex flex-col items-center justify-center border border-amber-300/40">
                  <Shield className="w-10 h-10 text-amber-400 fill-amber-400/20" />
                  <span className="text-[10px] font-black text-white mt-1 tracking-wider">كشافة البحرين</span>
                </div>
              </div>
              <div className="absolute -bottom-2 -left-2 bg-red-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full border-2 border-white shadow-md">
                فتيان
              </div>
            </div>
            <span className="text-xs text-amber-300 font-bold mt-2">
              المفوضية الكشفية • مدرسة أحمد الفاتح الإعدادية للبنين
            </span>
          </div>

          {/* 3. Troop Official Name */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl">
            فرقة فتيان أحمد الفاتح الكشفية
          </h1>

          {/* 4. Scout Motto & Vision */}
          <p className="text-amber-300 text-base sm:text-xl font-bold mt-3 max-w-2xl flex items-center justify-center gap-2">
            <span>«كُن مستعداً • انضباط، قيادة، وأخلاق رفيعة»</span>
          </p>

          <p className="text-emerald-200/90 text-sm sm:text-base mt-3 max-w-3xl leading-relaxed">
            المنصة الرقمية المتكاملة لمتابعة الأنشطة الكشفية الميدانية، وتقييم السلوك والانضباط، وتحفيز الفتيان عبر الشارات والأوسمة التقديرية بمملكة البحرين.
          </p>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3 sm:gap-6 mt-8 w-full max-w-xl">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
              <div className="text-2xl sm:text-3xl font-black text-amber-300">{stats.scoutsCount}</div>
              <div className="text-[11px] sm:text-xs text-emerald-200 mt-0.5">كشاف معتمد</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
              <div className="text-2xl sm:text-3xl font-black text-amber-300">{stats.teachersCount}</div>
              <div className="text-[11px] sm:text-xs text-emerald-200 mt-0.5">معلماً ومشرفاً</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
              <div className="text-2xl sm:text-3xl font-black text-amber-300">{stats.activitiesCount}</div>
              <div className="text-[11px] sm:text-xs text-emerald-200 mt-0.5">فعالية كشفية</div>
            </div>
          </div>

          {/* 5. The Five Main Portal Entry Buttons */}
          <div className="mt-10 w-full max-w-4xl">
            <div className="text-center mb-4">
              <span className="text-xs sm:text-sm font-bold text-amber-300 bg-amber-950/60 px-4 py-1.5 rounded-full border border-amber-400/40">
                بوابات الدخول للأنظمة الخمسة المعتمدة
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {/* Portal 1: Administration */}
              <button
                onClick={() => onSelectRole('ADMIN')}
                className="group flex flex-col items-center justify-center p-4 rounded-2xl bg-white/95 hover:bg-white text-slate-900 border-2 border-amber-400 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <School className="w-6 h-6" />
                </div>
                <span className="font-black text-sm text-amber-950">الإدارة</span>
                <span className="text-[10px] text-slate-500 mt-0.5">المتابعة الإشرافية</span>
              </button>

              {/* Portal 2: Leader */}
              <button
                onClick={() => onSelectRole('LEADER')}
                className="group flex flex-col items-center justify-center p-4 rounded-2xl bg-white/95 hover:bg-white text-slate-900 border-2 border-emerald-500 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Crown className="w-6 h-6" />
                </div>
                <span className="font-black text-sm text-emerald-950">القائد</span>
                <span className="text-[10px] text-slate-500 mt-0.5">إدارة الفرقة كاملة</span>
              </button>

              {/* Portal 3: Teacher */}
              <button
                onClick={() => onSelectRole('TEACHER')}
                className="group flex flex-col items-center justify-center p-4 rounded-2xl bg-white/95 hover:bg-white text-slate-900 border-2 border-blue-400 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6" />
                </div>
                <span className="font-black text-sm text-blue-950">المعلم</span>
                <span className="text-[10px] text-slate-500 mt-0.5">رصد النقاط والسلوك</span>
              </button>

              {/* Portal 4: Scout */}
              <button
                onClick={() => onSelectRole('SCOUT')}
                className="group flex flex-col items-center justify-center p-4 rounded-2xl bg-white/95 hover:bg-white text-slate-900 border-2 border-purple-400 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6" />
                </div>
                <span className="font-black text-sm text-purple-950">كشاف</span>
                <span className="text-[10px] text-slate-500 mt-0.5">الملف والشارات</span>
              </button>

              {/* Portal 5: Parent */}
              <button
                onClick={() => onSelectRole('PARENT')}
                className="group col-span-2 sm:col-span-1 flex flex-col items-center justify-center p-4 rounded-2xl bg-white/95 hover:bg-white text-slate-900 border-2 border-indigo-400 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <span className="font-black text-sm text-indigo-950">ولي أمر</span>
                <span className="text-[10px] text-slate-500 mt-0.5">متابعة وتشجيع الابن</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Spotlight Card: Distinction Screen "نجوم الفرقة" */}
        <section className="bg-gradient-to-br from-amber-500 via-amber-600 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-right">
              <div className="inline-flex items-center gap-1.5 bg-amber-900/60 text-amber-200 px-3 py-1 rounded-full text-xs font-bold border border-amber-300/40">
                <Award className="w-4 h-4 text-amber-300" />
                <span>شاشة التميز السنوية المعتمدة</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black">
                نجوم فرقة فتيان أحمد الفاتح الكشفية
              </h2>
              <p className="text-amber-100 text-xs sm:text-sm max-w-xl">
                يتم تتويج المراكز الثلاثة الأولى بناءً على مجموع النقاط الإيجابية المعتمدة بعد حسم المخالفات طوال العام الدراسي.
              </p>
            </div>

            <button
              onClick={() => onNavigate('distinction')}
              className="px-6 py-3.5 bg-white text-emerald-950 hover:bg-amber-100 font-bold rounded-2xl text-sm shadow-lg hover:shadow-xl transition-all flex items-center gap-2 shrink-0 border border-amber-300"
            >
              <Award className="w-5 h-5 text-amber-600" />
              <span>مشاهدة شاشة التميز والتكريم</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* 6. Troop Vision & Principles Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:border-emerald-300 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">رسالة الفرقة</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              إعداد فتيان مؤمنين بربهم، مخلصين لمملكة البحرين وقيادتها الرشيدة، يتمتعون بالسلوك القويم والاعتماد على النفس، وروح المبادرة والمواطنة الصالحة.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:border-emerald-300 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">منظومة الحوافز والشارات</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              تمنح الفرقة شارات سلوكية ومهارية وأوسمة قيادية تكافئ التميز في حسن الخلق، خدمة المجتمع، والانضباط الميداني تحت إشراف قادة مؤهلين.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:border-emerald-300 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4">
              <Info className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">الخصوصية والأمان المعتمد</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              بيانات الطلاب وصورهم وسجلاتهم السلوكية تخضع لضوابط خصوصية صارمة، ولا يتم نشرها للعامة، وفق أنظمة وزارة التربية والتعليم بمملكة البحرين.
            </p>
          </div>
        </section>

        {/* 7 & 8. News Announcements and Upcoming Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent News & Announcements */}
          <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-base sm:text-lg text-slate-900">
                  أحدث الأخبار والإعلانات المعتمدة
                </h3>
              </div>
              <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                فرقة الفاتح
              </span>
            </div>

            <div className="space-y-3">
              {announcements.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">لا توجد إعلانات حالياً</div>
              ) : (
                announcements.map(ann => (
                  <div key={ann.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-colors">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-bold text-sm text-slate-900">{ann.title}</span>
                      <span className="text-[10px] text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded-md font-semibold">
                        {ann.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{ann.content}</p>
                    <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
                      <span>الناشر: {ann.authorName}</span>
                      <span>{new Date(ann.createdAt).toLocaleDateString('ar-BH')}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Upcoming Activities Preview */}
          <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-base sm:text-lg text-slate-900">
                  الفعاليات الكشفية القادمة
                </h3>
              </div>
              <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full font-bold">
                جدول النشاط
              </span>
            </div>

            <div className="space-y-3">
              {upcomingActivities.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">لا توجد فعاليات مجدولة حالياً</div>
              ) : (
                upcomingActivities.map(act => (
                  <div key={act.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-amber-200 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="font-bold text-sm text-slate-900">{act.title}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        act.type === 'EXTERNAL' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {act.type === 'EXTERNAL' ? 'خارج المدرسة' : 'داخل المدرسة'}
                      </span>
                    </div>
                    
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                      {act.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-amber-600" />
                        <span>{act.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>{act.time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-600" />
                        <span>{act.location}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
