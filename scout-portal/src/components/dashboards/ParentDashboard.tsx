import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, Heart, Award, Calendar, Send, 
  Shield, CheckCircle2, MessageSquare, AlertCircle, FileText 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ScoutProfile, PointEvaluation, AwardedBadge, Certificate, TroopActivity } from '../../types';
import { api } from '../../lib/api';

const QUICK_ENCOURAGEMENTS = [
  'فخورون بك يا بطل! واصل التميز والاجتهاد.',
  'أحسنت يا بني، أخلاقك وسلوكك مصدر فخر واعتزاز لنا.',
  'استمر في التألق والانضباط الكشفي، ننتظر منك المزيد.',
  'بارك الله في جهودك يا بني، رفعت رؤوسنا جميعاً.'
];

interface ParentDashboardProps {
  onOpenCertificate: (cert: Certificate) => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({ onOpenCertificate }) => {
  const { user, linkedScouts, selectedLinkedScout, setSelectedLinkedScoutId } = useAuth();
  const [scoutDetails, setScoutDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Encouragement Messenger state
  const [encouragementText, setEncouragementText] = useState(QUICK_ENCOURAGEMENTS[0]);
  const [customText, setCustomText] = useState('');
  const [msgSuccess, setMsgSuccess] = useState<string | null>(null);

  // Private Message to Leader state
  const [showLeaderMsgModal, setShowLeaderMsgModal] = useState(false);
  const [leaderMsgTitle, setLeaderMsgTitle] = useState('');
  const [leaderMsgBody, setLeaderMsgBody] = useState('');
  const [leaderMsgSuccess, setLeaderMsgSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (selectedLinkedScout?.id) {
      loadSonDetails(selectedLinkedScout.id);
    }
  }, [selectedLinkedScout]);

  const loadSonDetails = async (id: string) => {
    try {
      setLoading(true);
      const data = await api.getScoutDetails(id);
      setScoutDetails(data || { evaluations: [], badges: [], certificates: [] });
    } catch (err) {
      console.error('Failed loading son details:', err);
      setScoutDetails({ evaluations: [], badges: [], certificates: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleSendEncouragement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedLinkedScout) return;
    const finalMsg = customText.trim() || encouragementText;
    try {
      await api.sendParentEncouragement(user.id, user.fullName || 'ولي الأمر', selectedLinkedScout.id, finalMsg);
      setMsgSuccess('تم إرسال رسالة التشجيع لابنك بنجاح وستظهر في حسابه!');
      setCustomText('');
      setTimeout(() => setMsgSuccess(null), 3500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendToLeader = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedLinkedScout) return;
    try {
      await api.submitIncidentReport(
        {
          title: `رسالة من ولي أمر الطالب: ${selectedLinkedScout?.fullName || 'طالب'}`,
          category: 'عام',
          severity: 'عادي',
          description: `${leaderMsgTitle}\n\n${leaderMsgBody}`,
          scoutId: selectedLinkedScout.id
        },
        { id: user.id, name: user.fullName || 'ولي الأمر', role: user.role }
      );
      setLeaderMsgSuccess('تم إرسال استفسارك إلى قيادة الفرقة بنجاح.');
      setLeaderMsgTitle('');
      setLeaderMsgBody('');
      setTimeout(() => {
        setShowLeaderMsgModal(false);
        setLeaderMsgSuccess(null);
      }, 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-purple-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold">
            <HeartHandshake className="w-4 h-4 text-amber-300" />
            <span>بوابة ولي الأمر لمتابعة السلوك والإنجاز الكشفي</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            أهلاً بك، {user?.fullName || 'ولي الأمر'}
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200">
            متابعة مستمرة ومباشرة لمسيرة ابنكم الكشفية والسلوكية بمدرسة أحمد الفاتح الإعدادية
          </p>
        </div>

        <button
          onClick={() => setShowLeaderMsgModal(true)}
          className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm flex items-center gap-2 border border-white/20 transition-all shrink-0"
        >
          <MessageSquare className="w-4 h-4 text-amber-300" />
          <span>إرسال استفسار خاص لقائد الفرقة</span>
        </button>
      </div>

      {/* Multiple Sons Switcher */}
      {linkedScouts && linkedScouts.length > 1 && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 flex items-center gap-3">
          <span className="text-xs font-bold text-slate-500">اختر الابن للمتابعة:</span>
          {linkedScouts.map(son => (
            <button
              key={son.id}
              onClick={() => setSelectedLinkedScoutId && setSelectedLinkedScoutId(son.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedLinkedScout?.id === son.id
                  ? 'bg-indigo-700 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {son.fullName || 'ابن'}
            </button>
          ))}
        </div>
      )}

      {selectedLinkedScout ? (
        <div className="space-y-8">
          {/* Son Profile Snapshot */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-center sm:text-right">
              <div className="w-20 h-20 rounded-2xl bg-emerald-50 border-2 border-emerald-300 overflow-hidden shrink-0 flex items-center justify-center">
                {selectedLinkedScout.avatarUrl && selectedLinkedScout.avatarStatus === 'APPROVED' ? (
                  <img src={selectedLinkedScout.avatarUrl} alt={selectedLinkedScout.fullName || 'كشاف'} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-2xl font-black text-emerald-800">
                    {selectedLinkedScout.fullName ? selectedLinkedScout.fullName.charAt(0) : 'ك'}
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">{selectedLinkedScout.fullName || 'الكشاف'}</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedLinkedScout.grade || 'الإعدادية'} • شعبة {selectedLinkedScout.section || '1'} • {selectedLinkedScout.patrolName || 'طليعة الفاتح'}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                    رصيد النقاط: {selectedLinkedScout.netBalance || 0} نقطة معتمدة
                  </span>
                  <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
                    الشارات: {selectedLinkedScout.badgeCount || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Send Quick Encouragement */}
            <form onSubmit={handleSendEncouragement} className="w-full md:w-96 space-y-2 bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100">
              <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-pink-600 fill-pink-600" />
                أرسل كلمة تشجيع لابنك تظهر في حسابه:
              </span>
              
              <select
                value={encouragementText}
                onChange={e => setEncouragementText(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-indigo-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 font-medium"
              >
                {QUICK_ENCOURAGEMENTS.map(q => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </select>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={customText}
                  onChange={e => setCustomText(e.target.value)}
                  placeholder="أو اكتب رسالة خاصة..."
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-indigo-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-colors shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>إرسال</span>
                </button>
              </div>

              {msgSuccess && (
                <div className="text-[11px] font-bold text-emerald-800 bg-emerald-100 p-2 rounded-xl text-center">
                  {msgSuccess}
                </div>
              )}
            </form>
          </div>

          {/* Behavior and Points Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Approved Evaluations Timeline */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                  <span>السجل السلوكي والانضباطي للابن</span>
                </h3>
                <span className="text-xs text-slate-400">التقييمات المعتمدة فقط</span>
              </div>

              <div className="space-y-3">
                {!scoutDetails?.evaluations || scoutDetails.evaluations.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">لا توجد تقييمات مسجلة بعد</div>
                ) : (
                  scoutDetails.evaluations
                    .filter((e: PointEvaluation) => e.status === 'APPROVED')
                    .map((ev: PointEvaluation) => (
                      <div
                        key={ev.id}
                        className={`p-3.5 rounded-2xl border ${
                          ev.type === 'POSITIVE' ? 'bg-emerald-50/50 border-emerald-100' : 'bg-red-50/50 border-red-100'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs text-slate-900">{ev.behaviorCategory}</span>
                          <span className={`text-xs font-black px-2 py-0.5 rounded-md ${
                            ev.type === 'POSITIVE' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                          }`}>
                            {ev.type === 'POSITIVE' ? `+${ev.points}` : `-${ev.points}`}
                          </span>
                        </div>
                        {ev.encouragementMessage && (
                          <p className="text-xs text-slate-600 mt-1">«{ev.encouragementMessage}»</p>
                        )}
                        <span className="text-[10px] text-slate-400 block mt-1.5">
                          بواسطة: {ev.evaluatorName || 'المعلم'} • {ev.createdAt ? new Date(ev.createdAt).toLocaleDateString('ar-BH') : ''}
                        </span>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* Badges & Certificates */}
            <div className="space-y-6">
              {/* Badges */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Award className="w-5 h-5 text-amber-600" />
                  <span>الشارات والأوسمة التقديرية</span>
                </h3>

                <div className="space-y-2">
                  {!scoutDetails?.badges || scoutDetails.badges.length === 0 ? (
                    <div className="py-6 text-center text-slate-400 text-xs">لا توجد شارات ممنوحة حتى الآن</div>
                  ) : (
                    scoutDetails.badges.map((b: AwardedBadge) => (
                      <div key={b.id} className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                          <Award className="w-5 h-5 fill-amber-200" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-amber-950">{b.badgeTitle}</h4>
                          <p className="text-[10px] text-amber-800">{b.notes || b.badgeCategory}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Certificates */}
              {scoutDetails?.certificates && scoutDetails.certificates.length > 0 && (
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                    <FileText className="w-5 h-5 text-emerald-700" />
                    <span>شهادات التكريم الصادرة</span>
                  </h3>
                  {scoutDetails.certificates.map((cert: Certificate) => (
                    <div key={cert.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">{cert.title}</h4>
                        <span className="text-[10px] text-slate-400">{cert.certificateNumber}</span>
                      </div>
                      <button
                        onClick={() => onOpenCertificate(cert)}
                        className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold"
                      >
                        معاينة
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h3 className="font-bold text-slate-800">لم يتم ربط أي كشاف بحسابك حتى الآن</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            يرجى التواصل مع قيادة فرقة فتيان أحمد الفاتح الكشفية لاعتماد ربط حسابك بملف ابنك المسجل.
          </p>
        </div>
      )}

      {/* PRIVATE MESSAGE TO LEADER MODAL */}
      {showLeaderMsgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-700" />
                إرسال استفسار خاص لقيادة الفرقة
              </h3>
              <button onClick={() => setShowLeaderMsgModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {leaderMsgSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold">
                {leaderMsgSuccess}
              </div>
            )}

            <form onSubmit={handleSendToLeader} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الموضوع</label>
                <input
                  type="text"
                  value={leaderMsgTitle}
                  onChange={e => setLeaderMsgTitle(e.target.value)}
                  required
                  placeholder="مثال: استفسار عن مواعيد المخيم الكشفي القادم"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الرسالة أو الملاحظة</label>
                <textarea
                  value={leaderMsgBody}
                  onChange={e => setLeaderMsgBody(e.target.value)}
                  rows={4}
                  required
                  placeholder="اكتب استفسارك أو ملاحظتك لقيادة الفرقة..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-700"
                ></textarea>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-indigo-700 hover:bg-indigo-800 text-white font-bold rounded-xl text-sm shadow-md transition-colors"
                >
                  إرسال الرسالة للقائد
                </button>
                <button
                  type="button"
                  onClick={() => setShowLeaderMsgModal(false)}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
