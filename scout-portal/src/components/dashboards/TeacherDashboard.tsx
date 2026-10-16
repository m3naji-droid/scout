import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Plus, Minus, Search, Shield, AlertTriangle, 
  Send, CheckCircle, Clock, Sparkles, Filter, User, MessageSquare 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ScoutProfile, PointEvaluation } from '../../types';
import { api } from '../../lib/api';

const POSITIVE_BEHAVIORS = [
  'حسن الخلق والتعامل الراقي',
  'المشاركة الفعالة والتفاعل الصفي',
  'احترام المعلم والإنصات للشرح',
  'احترام الزملاء وروح الزمالة',
  'الاجتهاد والمثابرة في أداء المهام',
  'التعاون ومساعدة الآخرين في الصف',
  'الانضباط والالتزام بالتعليمات المدرسية',
  'المبادرة وتحمل المسؤولية الفردية',
  'الالتزام بالزي والسلوك الكشفي القويم',
  'المحافظة على ممتلكات الصف والمدرسة',
  'القيادة الإيجابية وتحفيز الأقران',
  'المشاركة المتميزة في الأنشطة والفعاليات'
];

const DEDUCTION_BEHAVIORS = [
  'التحدث أثناء الشرح دون إذن',
  'النوم أو التكاسل أثناء الحصة',
  'عدم الاستئذان عند الحركة',
  'عدم احترام المعلم أو عدم الإنصات',
  'المشاغبة ومضايقة الزملاء',
  'الإخلال بنظام الحصة أو الطابور',
  'عدم الالتزام بتعليمات المعلم',
  'إهمال الزي أو المظهر الكشفي',
  'سوء الخلق أو التلفظ بكلمات غير لائقة'
];

const ENCOURAGEMENT_MESSAGES = [
  'استمر يا بطل! نفتخر بجهودك.',
  'رائع، أحسنت! مشاركتك تصنع الفرق.',
  'وحش، إنجاز مميز! استمر في التألق والتميز.',
  'نفتخر بك وبأخلاقك الرفيعة يا كشاف الفاتح!',
  'أنت قدوة طيبة لزملائك، بارك الله فيك.',
  'مبادرة تستحق كل الإشادة والتقدير.'
];

const CORRECTION_MESSAGES = [
  'نتمنى أن تكون أفضل من ذلك في المرة القادمة.',
  'يرجى منك تصحيح السلوك، وأنت قادر على التحسن وننتظر منك الأفضل.',
  'تعلّم من الموقف وحاول مجددًا.',
  'الالتزام والاحترام من صفات الكشاف المتميز.'
];

export const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const [scouts, setScouts] = useState<ScoutProfile[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('الأول إعدادي - 1');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [recentEvaluations, setRecentEvaluations] = useState<PointEvaluation[]>([]);

  // Modals state
  const [activeModal, setActiveModal] = useState<'POSITIVE' | 'DEDUCTION' | 'SUSPENSION' | 'REPORT' | null>(null);
  const [selectedScout, setSelectedScout] = useState<ScoutProfile | null>(null);

  // Form states
  const [points, setPoints] = useState<number>(3);
  const [behaviorCategory, setBehaviorCategory] = useState<string>(POSITIVE_BEHAVIORS[0]);
  const [notes, setNotes] = useState<string>('');
  const [encouragementMessage, setEncouragementMessage] = useState<string>(ENCOURAGEMENT_MESSAGES[0]);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Suspension Request Form
  const [suspensionDuration, setSuspensionDuration] = useState<'أسبوعان' | 'شهر' | 'شهران' | 'فصل دراسي كامل' | 'فصلان دراسيان كاملان'>('أسبوعان');
  const [suspensionReason, setSuspensionReason] = useState<string>('');
  const [targetActivities, setTargetActivities] = useState<string>('الأنشطة الميدانية والرحلات الخارجية');

  // Incident Report Form
  const [reportTitle, setReportTitle] = useState('');
  const [reportCategory, setReportCategory] = useState<'سلوكي' | 'انضباطي' | 'فعالية' | 'اقتراح' | 'عام'>('سلوكي');
  const [reportSeverity, setReportSeverity] = useState<'عادي' | 'متوسط' | 'عاجل وهام'>('متوسط');
  const [reportDesc, setReportDesc] = useState('');

  const assignedClasses = user?.assignedClasses && user.assignedClasses.length > 0 
    ? user.assignedClasses 
    : ['الأول إعدادي - 1', 'الأول إعدادي - 2', 'الثاني إعدادي - 1', 'الثالث إعدادي - 1'];

  useEffect(() => {
    const saved = localStorage.getItem('ahmed_alfateh_teacher_last_class');
    if (saved && assignedClasses.includes(saved)) {
      setSelectedClass(saved);
    } else {
      setSelectedClass(assignedClasses[0]);
    }
    loadData();
  }, []);

  const handleClassChange = (newClass: string) => {
    setSelectedClass(newClass);
    localStorage.setItem('ahmed_alfateh_teacher_last_class', newClass);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const allScouts = await api.getScouts();
      setScouts(allScouts || []);
      const evals = await api.getEvaluations();
      setRecentEvaluations((evals || []).slice(0, 10));
    } catch (err) {
      console.error('Failed loading teacher data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter scouts by selected class & search safely
  const filteredScouts = (scouts || []).filter(s => {
    const classMatches = `${s.grade || ''} - ${s.section || ''}` === selectedClass || selectedClass.includes(s.grade || '');
    const searchMatches = (s.fullName || '').includes(searchTerm) || (s.nationalId || '').includes(searchTerm);
    return classMatches && searchMatches;
  });

  const openPositiveModal = (scout: ScoutProfile) => {
    setSelectedScout(scout);
    setPoints(3);
    setBehaviorCategory(POSITIVE_BEHAVIORS[0]);
    setEncouragementMessage(ENCOURAGEMENT_MESSAGES[0]);
    setNotes('');
    setActionSuccess(null);
    setActionError(null);
    setActiveModal('POSITIVE');
  };

  const openDeductionModal = (scout: ScoutProfile) => {
    setSelectedScout(scout);
    setPoints(2);
    setBehaviorCategory(DEDUCTION_BEHAVIORS[0]);
    setEncouragementMessage(CORRECTION_MESSAGES[0]);
    setNotes('');
    setActionSuccess(null);
    setActionError(null);
    setActiveModal('DEDUCTION');
  };

  const openSuspensionModal = (scout: ScoutProfile) => {
    setSelectedScout(scout);
    setSuspensionReason(`تكرار مخالفة: ${DEDUCTION_BEHAVIORS[0]}`);
    setSuspensionDuration('أسبوعان');
    setActionSuccess(null);
    setActionError(null);
    setActiveModal('SUSPENSION');
  };

  const handlePositiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScout || !user) return;
    try {
      await api.submitEvaluation(
        {
          scoutId: selectedScout.id,
          type: 'POSITIVE',
          points,
          behaviorCategory,
          notes,
          encouragementMessage
        },
        { id: user.id, name: user.fullName || 'معلم', role: user.role }
      );
      setActionSuccess(`تم تسجيل +${points} نقطة بنجاح للكشاف ${selectedScout.fullName}`);
      loadData();
      setTimeout(() => setActiveModal(null), 1500);
    } catch (err: any) {
      setActionError(err.message || 'فشل حفظ التقييم');
    }
  };

  const handleDeductionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScout || !user) return;
    try {
      await api.submitEvaluation(
        {
          scoutId: selectedScout.id,
          type: 'DEDUCTION',
          points,
          behaviorCategory,
          notes,
          encouragementMessage
        },
        { id: user.id, name: user.fullName || 'معلم', role: user.role }
      );
      setActionSuccess(`تم تسجيل طلب خصم -${points} نقاط وتنتظر اعتماد القائد.`);
      loadData();
      setTimeout(() => setActiveModal(null), 1500);
    } catch (err: any) {
      setActionError(err.message || 'فشل تسجيل الخصم');
    }
  };

  const handleSuspensionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScout || !user) return;
    try {
      await api.createSuspensionRequest(
        {
          scoutId: selectedScout.id,
          violationType: suspensionReason,
          violationCount: 3,
          description: notes || 'تكرار المخالفة السلوكية بعد التنبيه المسبق.',
          targetActivities,
          requestedDuration: suspensionDuration
        },
        { id: user.id, name: user.fullName || 'معلم', role: user.role }
      );
      setActionSuccess(`تم رفع طلب الحرمان للكشاف ${selectedScout.fullName} إلى القائد لمراجعته.`);
      loadData();
      setTimeout(() => setActiveModal(null), 1500);
    } catch (err: any) {
      setActionError(err.message || 'فشل إرسال طلب الحرمان');
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await api.submitIncidentReport(
        {
          title: reportTitle,
          category: reportCategory,
          severity: reportSeverity,
          description: reportDesc,
          targetClass: selectedClass,
          scoutId: selectedScout?.id
        },
        { id: user.id, name: user.fullName || 'معلم', role: user.role }
      );
      setActionSuccess('تم إرسال البلاغ لقيادة الفرقة بنجاح.');
      setReportTitle('');
      setReportDesc('');
      setTimeout(() => setActiveModal(null), 1500);
    } catch (err: any) {
      setActionError(err.message || 'فشل إرسال البلاغ');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Teacher Header Card */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-200 text-xs font-bold">
            <BookOpen className="w-4 h-4 text-amber-300" />
            <span>بوابة المعلم لرصد السلوك والتقييم اليومي</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            مرحباً بك، {user?.fullName || 'المعلم'}
          </h1>
          <p className="text-xs sm:text-sm text-blue-200">
            مدرسة أحمد الفاتح الإعدادية للبنين • تقييم سريع وسلس أثناء اليوم الدراسي
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setSelectedScout(null);
              setActiveModal('REPORT');
              setActionSuccess(null);
              setActionError(null);
            }}
            className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 border border-white/20 transition-all"
          >
            <MessageSquare className="w-4 h-4 text-amber-300" />
            <span>إرسال بلاغ أو ملاحظة للقائد</span>
          </button>
        </div>
      </div>

      {/* Class Selection & Search Toolbar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            <span className="text-xs font-bold text-slate-500 shrink-0 ml-1">الصفوف المصرح بها:</span>
            {assignedClasses.map(cls => (
              <button
                key={cls}
                onClick={() => handleClassChange(cls)}
                className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                  selectedClass === cls
                    ? 'bg-blue-800 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cls}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="ابحث بالاسم أو الرقم الشخصي..."
              className="w-full px-3.5 py-2 pl-9 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-700"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>
      </div>

      {/* Scouts Grid in this Class */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-700" />
            <span>كشافة الصف ({selectedClass})</span>
            <span className="text-xs font-normal text-slate-500">
              ({filteredScouts.length} كشاف مسجل)
            </span>
          </h2>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 text-sm">جارٍ جلب الكشافين...</div>
        ) : filteredScouts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
            <User className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700">لا يوجد كشافون مسجلون في هذا الصف حتى الآن</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              يمكنك اختيار صف آخر من القائمة العلوية أو مراجعة قائد الفرقة لاعتماد تسجيل كشافة هذا الصف.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredScouts.map(scout => (
              <div 
                key={scout.id} 
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 p-0.5 overflow-hidden shrink-0 flex items-center justify-center">
                    {scout.avatarStatus === 'APPROVED' && scout.avatarUrl ? (
                      <img src={scout.avatarUrl} alt={scout.fullName} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <div className="text-emerald-800 font-bold text-lg">
                        {scout.fullName ? scout.fullName.charAt(0) : 'ك'}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-slate-900 truncate">
                        {scout.fullName}
                      </h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        scout.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {scout.status === 'ACTIVE' ? 'نشط' : 'محروم'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 mt-0.5">
                      الرقم: {scout.nationalId} • {scout.patrolName || 'طليعة الفاتح'}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <div className="bg-emerald-50 text-emerald-900 font-black text-xs px-2.5 py-0.5 rounded-lg border border-emerald-200">
                        {scout.netBalance || 0} نقطة
                      </div>
                      <div className="bg-amber-50 text-amber-900 font-semibold text-[10px] px-2 py-0.5 rounded-lg border border-amber-200">
                        {scout.badgeCount || 0} شارات
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => openPositiveModal(scout)}
                    className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>تقييم إيجابي (1-5)</span>
                  </button>

                  <button
                    onClick={() => openDeductionModal(scout)}
                    className="py-2.5 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center gap-1.5 border border-red-200 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                    <span>تسجيل خصم</span>
                  </button>
                </div>

                <button
                  onClick={() => openSuspensionModal(scout)}
                  className="w-full py-1.5 text-center text-[10px] font-bold text-amber-800 hover:text-amber-900 hover:underline flex items-center justify-center gap-1"
                >
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                  <span>تكرار مخالفة؟ رفع طلب حرمان من الأنشطة</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* POSITIVE EVALUATION MODAL */}
      {activeModal === 'POSITIVE' && selectedScout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-emerald-950 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                منح نقاط إيجابية: {selectedScout.fullName}
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {actionSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold">
                {actionSuccess}
              </div>
            )}
            {actionError && (
              <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs font-bold">
                {actionError}
              </div>
            )}

            <form onSubmit={handlePositiveSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">عدد النقاط الممنوحة (من 1 إلى 5)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(pt => (
                    <button
                      key={pt}
                      type="button"
                      onClick={() => setPoints(pt)}
                      className={`flex-1 py-2.5 rounded-xl font-black text-sm transition-all ${
                        points === pt
                          ? 'bg-emerald-600 text-white shadow-md scale-105'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      +{pt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">نوع السلوك الإيجابي</label>
                <select
                  value={behaviorCategory}
                  onChange={e => setBehaviorCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-700"
                >
                  {POSITIVE_BEHAVIORS.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رسالة التعزيز والتشجيع</label>
                <select
                  value={encouragementMessage}
                  onChange={e => setEncouragementMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-700"
                >
                  {ENCOURAGEMENT_MESSAGES.map(msg => (
                    <option key={msg} value={msg}>{msg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظة إضافية (اختياري)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="مثال: تميز في حل النشاط الجماعي وأظهر تعاوناً رائعاً"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-sm shadow-md transition-colors"
                >
                  اعتماد وحفظ التقييم الإيجابي
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DEDUCTION EVALUATION MODAL */}
      {activeModal === 'DEDUCTION' && selectedScout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-red-950 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                تسجيل خصم نقاط سلوكي: {selectedScout.fullName}
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="p-3 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-xs">
              ملاحظة: طلبات الخصم تخضع لمراجعة واعتماد قائد الفرقة قبل التأثير في الرصيد النهائي لحماية الطلاب.
            </div>

            {actionSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold">
                {actionSuccess}
              </div>
            )}
            {actionError && (
              <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs font-bold">
                {actionError}
              </div>
            )}

            <form onSubmit={handleDeductionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">النقاط المقترح خصمها</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(pt => (
                    <button
                      key={pt}
                      type="button"
                      onClick={() => setPoints(pt)}
                      className={`flex-1 py-2.5 rounded-xl font-black text-sm transition-all ${
                        points === pt
                          ? 'bg-red-600 text-white shadow-md scale-105'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      -{pt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">نوع المخالفة السلوكية</label>
                <select
                  value={behaviorCategory}
                  onChange={e => setBehaviorCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  {DEDUCTION_BEHAVIORS.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رسالة التوجيه التربوي (للكشاف)</label>
                <select
                  value={encouragementMessage}
                  onChange={e => setEncouragementMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  {CORRECTION_MESSAGES.map(msg => (
                    <option key={msg} value={msg}>{msg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">تفاصيل الملاحظة للمعلم</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                  placeholder="وصف مختصر لما حدث أثناء الحصة..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-red-600"
                ></textarea>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-red-700 hover:bg-red-800 text-white font-bold rounded-xl text-sm shadow-md transition-colors"
                >
                  إرسال طلب الخصم للقائد
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUSPENSION REQUEST MODAL */}
      {activeModal === 'SUSPENSION' && selectedScout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                رفع طلب حرمان من الأنشطة الكشفية
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="p-3 bg-blue-50 text-blue-900 border border-blue-200 rounded-xl text-xs">
              الكشاف: <strong>{selectedScout.fullName}</strong> ({selectedScout.grade} - {selectedScout.section})
              <br />
              هذا الطلب ليس عقوبة فورية نافذة، بل يُرفع لقائد الفرقة للمراجعة والبت فيه.
            </div>

            {actionSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold">
                {actionSuccess}
              </div>
            )}
            {actionError && (
              <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs font-bold">
                {actionError}
              </div>
            )}

            <form onSubmit={handleSuspensionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المدة المقترحة للحرمان</label>
                <select
                  value={suspensionDuration}
                  onChange={e => setSuspensionDuration(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-600"
                >
                  <option value="أسبوعان">أسبوعان</option>
                  <option value="شهر">شهر</option>
                  <option value="شهران">شهران</option>
                  <option value="فصل دراسي كامل">فصل دراسي كامل</option>
                  <option value="فصلان دراسيان كاملان">فصلان دراسيان كاملان</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الأنشطة المطلوب الحرمان منها</label>
                <input
                  type="text"
                  value={targetActivities}
                  onChange={e => setTargetActivities(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">أسباب وتكرار المخالفة</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  required
                  placeholder="بيان سبب طلب الحرمان، وعدد مرات التنبيه المسبقة..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-600"
                ></textarea>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm shadow-md transition-colors"
                >
                  رفع طلب الحرمان للقائد
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INCIDENT REPORT MODAL */}
      {activeModal === 'REPORT' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                إرسال بلاغ أو ملاحظة لقائد الفرقة
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {actionSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold">
                {actionSuccess}
              </div>
            )}
            {actionError && (
              <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs font-bold">
                {actionError}
              </div>
            )}

            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">عنوان البلاغ أو الملاحظة</label>
                <input
                  type="text"
                  value={reportTitle}
                  onChange={e => setReportTitle(e.target.value)}
                  required
                  placeholder="مثال: ملاحظة حول سلوك الطليعة أثناء الطابور..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">التصنيف</label>
                  <select
                    value={reportCategory}
                    onChange={e => setReportCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-700"
                  >
                    <option value="سلوكي">سلوكي</option>
                    <option value="انضباطي">انضباطي</option>
                    <option value="فعالية">فعالية</option>
                    <option value="اقتراح">اقتراح</option>
                    <option value="عام">عام</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الأهمية</label>
                  <select
                    value={reportSeverity}
                    onChange={e => setReportSeverity(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-700"
                  >
                    <option value="عادي">عادي</option>
                    <option value="متوسط">متوسط</option>
                    <option value="عاجل وهام">عاجل وهام</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">تفاصيل البلاغ</label>
                <textarea
                  value={reportDesc}
                  onChange={e => setReportDesc(e.target.value)}
                  rows={3}
                  required
                  placeholder="اكتب تفاصيل البلاغ ليطلع عليه قائد الفرقة..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-700"
                ></textarea>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-sm shadow-md transition-colors"
                >
                  إرسال البلاغ للقائد
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
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
