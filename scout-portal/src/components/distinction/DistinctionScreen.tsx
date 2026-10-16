import React, { useEffect, useState } from 'react';
import { Award, Trophy, Medal, Star, Sparkles, Shield, ArrowRight, User } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../../lib/api';

interface DistinctionScreenProps {
  onBack: () => void;
}

export const DistinctionScreen: React.FC<DistinctionScreenProps> = ({ onBack }) => {
  const [data, setData] = useState<{ periodName: string; topScouts: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDistinctionData();
  }, []);

  const loadDistinctionData = async () => {
    try {
      setLoading(true);
      const res = await api.getTop3Distinction();
      setData(res);

      // Trigger celebratory confetti
      setTimeout(() => {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });
      }, 400);
    } catch (err) {
      console.error('Failed loading distinction data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          label: 'المركز الأول • وسام التميز الذهبي',
          bg: 'bg-gradient-to-r from-amber-400 to-amber-600 text-amber-950 border-amber-300',
          cardBorder: 'border-4 border-amber-400 shadow-2xl shadow-amber-500/20',
          icon: <Trophy className="w-8 h-8 text-amber-500 fill-amber-400 animate-bounce" />,
          podiumH: 'h-40 sm:h-48 bg-gradient-to-t from-amber-600 to-amber-400 text-amber-950'
        };
      case 2:
        return {
          label: 'المركز الثاني • وسام التميز الفضي',
          bg: 'bg-gradient-to-r from-slate-200 to-slate-400 text-slate-900 border-slate-300',
          cardBorder: 'border-2 border-slate-300 shadow-lg',
          icon: <Medal className="w-7 h-7 text-slate-400 fill-slate-300" />,
          podiumH: 'h-32 sm:h-36 bg-gradient-to-t from-slate-400 to-slate-300 text-slate-900'
        };
      case 3:
        return {
          label: 'المركز الثالث • وسام التميز البرونزي',
          bg: 'bg-gradient-to-r from-amber-700 to-amber-800 text-amber-100 border-amber-600',
          cardBorder: 'border-2 border-amber-700/50 shadow-md',
          icon: <Award className="w-6 h-6 text-amber-700 fill-amber-600" />,
          podiumH: 'h-24 sm:h-28 bg-gradient-to-t from-amber-800 to-amber-700 text-amber-100'
        };
      default:
        return {
          label: 'كشاف متميز',
          bg: 'bg-slate-100 text-slate-800',
          cardBorder: 'border border-slate-200',
          icon: <Star className="w-5 h-5 text-amber-500" />,
          podiumH: 'h-20 bg-slate-300'
        };
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-emerald-900 bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-xs hover:bg-slate-50 transition-colors self-start sm:self-auto"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة للرئيسية</span>
        </button>

        <div className="text-center sm:text-right">
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block mb-1">
            {data?.periodName || 'منافسة درع الفاتح السنوية'}
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900">
            نجوم فرقة فتيان أحمد الفاتح الكشفية
          </h1>
        </div>

        <button
          onClick={() => {
            confetti({ particleCount: 90, spread: 80, origin: { y: 0.5 } });
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>احتفال النجوم</span>
        </button>
      </div>

      {loading ? (
        <div className="py-24 text-center space-y-4">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-bold text-slate-600">جارٍ احتساب وترتيب نجوم الفرقة...</p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Top 3 Cards in Festive Podium Presentation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-6">
            {/* Rank 2 (Silver) - Rendered Left on desktop */}
            {data?.topScouts[1] && (
              <div className="order-2 md:order-1 flex flex-col items-center">
                <div className={`w-full bg-white rounded-3xl p-6 ${getRankBadge(2).cardBorder} flex flex-col items-center text-center space-y-4 relative`}>
                  <div className="absolute -top-4 bg-slate-200 text-slate-900 border border-slate-300 px-3 py-0.5 rounded-full text-xs font-black shadow-xs">
                    المركز الثاني #2
                  </div>

                  <div className="relative mt-2">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-slate-300 p-1 bg-slate-50 overflow-hidden shadow-md flex items-center justify-center">
                      {data.topScouts[1].avatarUrl ? (
                        <img 
                          src={data.topScouts[1].avatarUrl} 
                          alt={data.topScouts[1].fullName} 
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <User className="w-12 h-12 text-slate-400" />
                      )}
                    </div>
                    <div className="absolute -bottom-1 -left-1 p-1.5 bg-white rounded-full shadow-md">
                      {getRankBadge(2).icon}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{data.topScouts[1].fullName}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{data.topScouts[1].grade} • شعبة {data.topScouts[1].section}</p>
                    <span className="inline-block text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md mt-1">
                      {data.topScouts[1].patrolName}
                    </span>
                  </div>

                  <div className="w-full pt-3 border-t border-slate-100 flex justify-around text-center">
                    <div>
                      <div className="text-xl font-black text-emerald-800">{data.topScouts[1].netBalance}</div>
                      <div className="text-[10px] text-slate-400 font-bold">نقطة معتمدة</div>
                    </div>
                    <div>
                      <div className="text-xl font-black text-amber-600">{data.topScouts[1].badgeCount}</div>
                      <div className="text-[10px] text-slate-400 font-bold">شارات كشفية</div>
                    </div>
                  </div>
                </div>

                {/* Podium block */}
                <div className={`hidden md:flex w-full ${getRankBadge(2).podiumH} rounded-t-3xl items-center justify-center font-black text-2xl shadow-inner mt-4`}>
                  2
                </div>
              </div>
            )}

            {/* Rank 1 (Gold) - Center and Elevated */}
            {data?.topScouts[0] && (
              <div className="order-1 md:order-2 flex flex-col items-center">
                <div className={`w-full bg-gradient-to-b from-amber-50/50 to-white rounded-3xl p-7 ${getRankBadge(1).cardBorder} flex flex-col items-center text-center space-y-4 relative -translate-y-2`}>
                  <div className="absolute -top-5 bg-gradient-to-r from-amber-500 to-amber-600 text-white border-2 border-white px-4 py-1 rounded-full text-xs font-black shadow-lg flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 fill-amber-200" />
                    <span>فارس التميز الأول #1</span>
                  </div>

                  <div className="relative mt-3">
                    <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-amber-400 p-1 bg-amber-50 overflow-hidden shadow-xl ring-4 ring-amber-400/20 flex items-center justify-center">
                      {data.topScouts[0].avatarUrl ? (
                        <img 
                          src={data.topScouts[0].avatarUrl} 
                          alt={data.topScouts[0].fullName} 
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <User className="w-16 h-16 text-amber-600" />
                      )}
                    </div>
                    <div className="absolute -bottom-2 -left-2 p-2 bg-amber-400 text-white rounded-full shadow-lg border-2 border-white">
                      <Trophy className="w-6 h-6 fill-white" />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-black text-xl sm:text-2xl text-slate-900">{data.topScouts[0].fullName}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                      {data.topScouts[0].grade} • شعبة {data.topScouts[0].section}
                    </p>
                    <span className="inline-block text-xs font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-full mt-2 border border-amber-300">
                      {data.topScouts[0].patrolName}
                    </span>
                  </div>

                  <div className="w-full pt-4 border-t border-amber-100 flex justify-around text-center">
                    <div>
                      <div className="text-3xl font-black text-emerald-800">{data.topScouts[0].netBalance}</div>
                      <div className="text-[11px] text-slate-500 font-bold">نقطة معتمدة</div>
                    </div>
                    <div>
                      <div className="text-3xl font-black text-amber-600">{data.topScouts[0].badgeCount}</div>
                      <div className="text-[11px] text-slate-500 font-bold">شارات وأوسمة</div>
                    </div>
                    <div>
                      <div className="text-3xl font-black text-blue-700">{data.topScouts[0].activitiesAttendedCount}</div>
                      <div className="text-[11px] text-slate-500 font-bold">فعاليات ميدانية</div>
                    </div>
                  </div>
                </div>

                {/* Podium block */}
                <div className={`hidden md:flex w-full ${getRankBadge(1).podiumH} rounded-t-3xl items-center justify-center font-black text-4xl shadow-inner mt-4 border-t-4 border-amber-300`}>
                  1
                </div>
              </div>
            )}

            {/* Rank 3 (Bronze) - Right */}
            {data?.topScouts[2] && (
              <div className="order-3 flex flex-col items-center">
                <div className={`w-full bg-white rounded-3xl p-6 ${getRankBadge(3).cardBorder} flex flex-col items-center text-center space-y-4 relative`}>
                  <div className="absolute -top-4 bg-amber-800 text-amber-100 border border-amber-700 px-3 py-0.5 rounded-full text-xs font-black shadow-xs">
                    المركز الثالث #3
                  </div>

                  <div className="relative mt-2">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-amber-700/60 p-1 bg-amber-50 overflow-hidden shadow-md flex items-center justify-center">
                      {data.topScouts[2].avatarUrl ? (
                        <img 
                          src={data.topScouts[2].avatarUrl} 
                          alt={data.topScouts[2].fullName} 
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <User className="w-12 h-12 text-amber-800" />
                      )}
                    </div>
                    <div className="absolute -bottom-1 -left-1 p-1.5 bg-white rounded-full shadow-md">
                      {getRankBadge(3).icon}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{data.topScouts[2].fullName}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{data.topScouts[2].grade} • شعبة {data.topScouts[2].section}</p>
                    <span className="inline-block text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md mt-1">
                      {data.topScouts[2].patrolName}
                    </span>
                  </div>

                  <div className="w-full pt-3 border-t border-slate-100 flex justify-around text-center">
                    <div>
                      <div className="text-xl font-black text-emerald-800">{data.topScouts[2].netBalance}</div>
                      <div className="text-[10px] text-slate-400 font-bold">نقطة معتمدة</div>
                    </div>
                    <div>
                      <div className="text-xl font-black text-amber-600">{data.topScouts[2].badgeCount}</div>
                      <div className="text-[10px] text-slate-400 font-bold">شارات كشفية</div>
                    </div>
                  </div>
                </div>

                {/* Podium block */}
                <div className={`hidden md:flex w-full ${getRankBadge(3).podiumH} rounded-t-3xl items-center justify-center font-black text-2xl shadow-inner mt-4`}>
                  3
                </div>
              </div>
            )}
          </div>

          {/* Rules and Verification Note */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 text-xs text-slate-600 space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
              <Shield className="w-4 h-4 text-emerald-700" />
              ضوابط وقواعد شاشة التميز المعتمدة:
            </h4>
            <ul className="list-disc list-inside space-y-1 text-slate-600 leading-relaxed pr-2">
              <li>تُحتسب النقاط بعد المراجعة والاعتماد الرسمي من قادة الفرقة فقط (النقاط المعلقة أو المرفوضة لا تدخل في الرصيد).</li>
              <li>الرصيد النهائي = مجموع النقاط الإيجابية المعتمدة − مجموع الخصومات السلوكية المعتمدة.</li>
              <li>لا تُعرض الصور الشخصية إلا بعد مراجعتها واعتماد ارتدائها للبدلة الكشفية الرسمية المعتمدة وفق سياسة الخصوصية.</li>
              <li>الترتيب خاص بالعام الدراسي الحالي، ويتم تحديثه لحظياً مع اعتماد كل تقييم جديد.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
