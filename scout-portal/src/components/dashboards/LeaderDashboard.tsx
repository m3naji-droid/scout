import React, { useState, useEffect } from 'react';
import { 
  Crown, Users, BookOpen, Shield, Award, Calendar, 
  Sparkles, CheckCircle2, AlertTriangle, FileSpreadsheet, 
  Clock, Plus, Minus, Search, Edit2, Trash2, Printer, 
  Settings, Download, Upload, MessageSquare, Check, X, FileText, Database 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { 
  ScoutProfile, TeacherProfile, PointEvaluation, SuspensionRequest, 
  IncidentReport, TroopActivity, ScoutBadge, Certificate, AuditLogItem, SiteSettings 
} from '../../types';
import { api } from '../../lib/api';

interface LeaderDashboardProps {
  onOpenCertificate: (cert: Certificate) => void;
  onNavigateDistinction: () => void;
}

export const LeaderDashboard: React.FC<LeaderDashboardProps> = ({
  onOpenCertificate,
  onNavigateDistinction
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'SCOUTS' | 'TEACHERS' | 'POINTS' | 'SUSPENSIONS' | 'REPORTS' | 'ACTIVITIES' | 'MEDIA' | 'BADGES' | 'CERTIFICATES' | 'AUDIT' | 'SETTINGS'>('OVERVIEW');

  // Core Data States
  const [scouts, setScouts] = useState<ScoutProfile[]>([]);
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [evaluations, setEvaluations] = useState<PointEvaluation[]>([]);
  const [suspensions, setSuspensions] = useState<SuspensionRequest[]>([]);
  const [incidentReports, setIncidentReports] = useState<IncidentReport[]>([]);
  const [activities, setActivities] = useState<TroopActivity[]>([]);
  const [badges, setBadges] = useState<ScoutBadge[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Bulk Selection States for Deletion
  const [selectedScoutIds, setSelectedScoutIds] = useState<string[]>([]);
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<string[]>([]);

  // Search & Filters (مع التفصيل الجديد للفرق والصفوف)
  const [scoutSearch, setScoutSearch] = useState('');
  const [scoutGradeFilter, setScoutGradeFilter] = useState('');
  const [scoutSectionFilter, setScoutSectionFilter] = useState('');

  // Modals state
  const [showAddScoutModal, setShowAddScoutModal] = useState(false);
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);

  // Action forms state
  const [newScout, setNewScout] = useState({ 
    fullName: '', 
    nationalId: '', 
    grade: 'الأول إعدادي', 
    section: '1', 
    patrolName: 'طليعة الفاتح', 
    parentName: '', 
    parentPhone: '' 
  });
  
  const [newTeacher, setNewTeacher] = useState({ fullName: '', employeeId: '', subject: 'العلوم العامة' });
  
  // Bulk import form state with custom grade/section assignment
  const [importGrade, setImportGrade] = useState('الأول إعدادي');
  const [importSection, setImportSection] = useState('1');

  // Points & Badge assignment state
  const [targetScoutId, setTargetScoutId] = useState('');
  const [pointsAmount, setPointsAmount] = useState(5);
  const [pointsReason, setPointsReason] = useState('تميز في النشاط الكشفي');
  const [selectedBadgeId, setSelectedBadgeId] = useState('');
  const [badgeNotes, setBadgeNotes] = useState('استحقاق شارة التميز');

  useEffect(() => {
    loadAllLeaderData();
  }, []);

  const loadAllLeaderData = async () => {
    try {
      setLoading(true);
      const [
        allScouts, allTeachers, allEvals, allSusp, 
        allReports, allActs, badgesData, allCerts, 
        allLogs, curSettings
      ] = await Promise.all([
        api.getScouts(),
        api.getTeachers(),
        api.getEvaluations(),
        api.getSuspensions(),
        api.getIncidentReports(),
        api.getActivities(),
        api.getBadges(),
        api.getCertificates(),
        api.getAuditLogs(),
        api.getSettings()
      ]);

      setScouts(allScouts);
      setTeachers(allTeachers);
      setEvaluations(allEvals);
      setSuspensions(allSusp);
      setIncidentReports(allReports);
      setActivities(allActs);
      setBadges(badgesData.badges);
      setCertificates(allCerts);
      setAuditLogs(allLogs);
      setSettings(curSettings);
    } catch (err) {
      console.error('Failed loading leader data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add Single Scout Handler
  const handleAddScoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await api.addScout(newScout, { id: user.id, name: user.fullName, role: user.role });
      setShowAddScoutModal(false);
      setNewScout({ fullName: '', nationalId: '', grade: 'الأول إعدادي', section: '1', patrolName: 'طليعة الفاتح', parentName: '', parentPhone: '' });
      loadAllLeaderData();
      alert('تم إضافة الكشاف بنجاح وتفعيل حساب دخوله');
    } catch (err: any) {
      alert(err.message || 'فشل إضافة الكشاف');
    }
  };

  // Add Teacher Handler
  const handleAddTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await api.addTeacher(newTeacher, { id: user.id, name: user.fullName, role: user.role });
      setShowAddTeacherModal(false);
      setNewTeacher({ fullName: '', employeeId: '', subject: 'العلوم العامة' });
      loadAllLeaderData();
      alert('تم إضافة المعلم بنجاح');
    } catch (err: any) {
      alert(err.message || 'فشل إضافة المعلم');
    }
  };

  // Bulk Excel Import Handler with Grade & Section allocation
  const handleBulkImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!window.confirm(`هل تريد استيراد قائمة الكشافين الرسمية وتوزيعهم على صف "${importGrade}" وشعبة "${importSection}"؟`)) return;
    
    try {
      setLoading(true);
      const rawScouts = [
        "علي شوقي علي الكلالي", "حمزة محمد صبحي محمد عبد العزيز", "محمد عبدالرحمن فايز الرواحي", "فارس مصطفي عبدالعزيز عبدالله",
        "عمار نادر أحمد رحيمي", "علي عادل عبد الرحيم محمد", "محمد حسين محمد سالم", "سلطان حمد سلطان صالح", "حسين وليد محمد سليم",
        "خالد سند بشر الرويعي", "البدر سند الرويعي", "خالد رجب عقاب المحميد", "عبدالرحمن عمار مثنى الماطري", "عبد الرحمن ناصر عبدالله البوعينين",
        "سلمان سالم بحر", "خالد سالم بحر", "أحمد عبدالله صالح طاهر", "حمد توفيق مسعد الظبيع", "عبدالله عمر محمد الرضي", "يوسف أيمن العجمي حسب النبي",
        "يوسف جاسم يوسف النعيمي", "زياد طاهر عبدالله حسن", "سلطان أحمد سلطان الدوسري", "عبدالله عامر رضا", "عهد عهدي أحمد الحصيني",
        "ناصر وهاب محمد السهو", "اثنيان خليفة مشرف اثنيان", "بندر تيسير حمود فنتوخ", "عيسى وليد عبدالواحد محمد", "معاذ محمد محسن أحمد",
        "يوسف سلمان يوسف الدوسري", "وضاح بدر محمد ردمان محمد", "حسام محمد السيد المسلماني", "راكان محمد سالم الخلاقي", "جاسم مهران احمد راشد",
        "احمد مهران احمد راشد", "همام ماهر فتيخ خلف", "خليفة بشار محمد المريسي", "خليفة سامي محمد قاسم علوان", "حمدان هاني محمد الطريمي",
        "ابراهيم محمد حسين الحردان", "حمد عصام الطيري", "عبد الحمن غازي محسن علي", "نواف سعود عباد المرشد", "محمد صلاح محمد البرطي",
        "سلمان صالح خليفة مسعود", "محمد خالد علي العبدالله", "عبدالرقيب قاسم الطيري", "عوض عبدالله", "فيصل نواف محمد جمعه", "محمد نواف محمد جمعه",
        "يزن عبدالله عبدالواحد الحارثي", "محمد وصي منان", "عبدالله عادل عبدالله الضبيع", "يوسف عمر احمد محمد", "سالم بن عبدالرحمن ين يوسف يوداود",
        "راشد خليفة راشد بوعشوان", "خليفة وليد سيف مسعد", "محمد وليد سيف مسعد", "ابراهيم حمد ابراهيم المناصير", "عبدالرحمن أحمد العبدالرحمن",
        "احمد فواز عيسى احمد الغتم", "عدي صدام حسن قائد الجشوبي", "عبدالله عبدالرحمن بخيت الدوسري", "عبدالعزيز عبدالرحمن بخيت الدوسري",
        "راشد حمد عبدالله الدوسري", "عبدالرحمن فؤاد فايد أحمد الحبيش", "مشعل خلوف كسار العلي", "يوسف خالد محمد السريري", "موسى فضل سبحان حاجي",
        "حسن خالد حسن جناحي", "خالد نورالدين عبدالله القشار", "خالداكرم محمد عسكر", "عبدالعزيز عبدالرحمن بخيت سالم عبدالله", "محمد علي مسعد البسارة",
        "عمار علي عبدالله القشار", "عبد العزيز ناصر عبد الله البو عينين", "ناصر امان عثمان عثمان", "سلطان سلمان كيا رحيم", "نواف احمد ناجي الجبلي",
        "عبدالعزيز جاسم محمد جاسم الراشد آل بن علي", "فهد سامي احمد الكلالي", "علاء الدين محمد احمد عبدالرحمن", "نايف محمد جديع علي",
        "عبدالله ناصر عبدالله سعد البوعينين", "احمد محمد حسن الذوادي", "فهد سامي حسن ادم", "راشد فواز مثنى المريسي", "احمد خليف محمد المواعي",
        "سلمان فرج مهدي العنزي", "بدر حمود علي سيف", "مهنا خالد مهنا الكبيسي", "سلمان محمد احمد قاسم علي", "ريان ابراهيم احمد عبده",
        "نايف ياسر علي الضبيع", "عبدالحميد بلوله صديق محمد", "فيصل جاسم سلطان فخرو", "احمد جمعه شلش السهو", "محمد قاسم نعمان المهلل",
        "عبدالله ماجد عواد الدلماز", "سعود أحمد سلطان الدوسري", "خليفة احمد عبدالله الضبيع", "دعيج سلمان محمد سلمان العاثمي", "ناصر بلال ناصر محمد",
        "حافظ منصور صالح سعد", "عبدالواحد وليد عبدالواحد عبدالله", "حمد سلمان عبيد الظفيري", "ريان محمد دحام نويران", "عبد الكريم سعد راوي الحسن",
        "محمد صلاح محمد الحلحلي", "محمدعبدالرحمن حمدحسين", "محمد يوسف صالح قاسم", "يوسف عيسى محمد محمود", "غيث حازم أميز الأحمد", "حارث وارث احمد",
        "طلال قاسم يحى الخلاقي", "غيمان احمد محمد صالح", "محمد ناصر حبيب مصطفي", "دعيج خليفة دعيج العيد", "حمد عبدالغفور سيد نور", "احمد علي الحسن",
        "عبدالعزيز خالد علي العقبي", "أحمد عبالرحمن عبدالكريم أخوند", "خليفه حسين البكري", "صقر صالح علي الرياشي", "محمد فواز محمد ابوشاره", "علي ياسر الحاج"
      ];

      // أرقام شخصية افتراضية متسلسلة لمن ليس له رقم دقيق في القائمة المباشرة لتجنب أخطاء قاعدة البيانات
      const scoutsToImport = rawScouts.map((name, index) => ({
        fullName: name,
        nationalId: String(120000000 + index),
        grade: importGrade,
        section: importSection
      }));

      await api.importScoutsBulk(scoutsToImport, { id: user?.id, name: user?.fullName });
      setShowBulkImportModal(false);
      alert(`تم استيراد ${scoutsToImport.length} كشافاً بنجاح وتوزيعهم على (${importGrade} - الشعبة ${importSection}) وتفعيل حساباتهم!`);
      loadAllLeaderData();
    } catch (err: any) {
      alert("خطأ أثناء الاستيراد الجماعي: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add Points Handler
  const handleAddPointsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetScoutId) {
      alert('يرجى اختيار الكشاف أولاً');
      return;
    }
    try {
      await api.addPointsToScout(targetScoutId, pointsAmount, pointsReason, { id: user?.id, name: user?.fullName });
      setShowPointsModal(false);
      loadAllLeaderData();
      alert('تم إضافة النقاط بنجاح');
    } catch (err: any) {
      alert(err.message || 'فشل إضافة النقاط');
    }
  };

  // Deletion Handlers
  const handleDeleteScout = async (id: string, name: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف الكشاف "${name}" نهائياً؟`)) return;
    try {
      await api.deleteScout(id, { id: user?.id, name: user?.fullName });
      loadAllLeaderData();
    } catch (err: any) {
      alert(err.message || 'فشل الحذف');
    }
  };

  const handleBulkDeleteScouts = async () => {
    if (selectedScoutIds.length === 0) return;
    if (!window.confirm(`هل أنت متأكد من حذف (${selectedScoutIds.length}) كشافاً المحددين؟`)) return;
    try {
      await api.deleteMultipleScouts(selectedScoutIds, { id: user?.id, name: user?.fullName });
      setSelectedScoutIds([]);
      loadAllLeaderData();
    } catch (err: any) {
      alert(err.message || 'فشل الحذف الجماعي');
    }
  };

  const handleDeleteTeacher = async (id: string, name: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف المعلم "${name}"؟`)) return;
    try {
      await api.deleteTeacher(id, { id: user?.id, name: user?.fullName });
      loadAllLeaderData();
    } catch (err: any) {
      alert(err.message || 'فشل الحذف');
    }
  };

  // فلترة متقدمة تشمل الصفوف والشعب والبحث
  const filteredScouts = scouts.filter(s => {
    const matchesSearch = s.fullName?.includes(scoutSearch) || s.nationalId?.includes(scoutSearch);
    const matchesGrade = !scoutGradeFilter || s.grade === scoutGradeFilter;
    const matchesSection = !scoutSectionFilter || String(s.section) === String(scoutSectionFilter);
    return matchesSearch && matchesGrade && matchesSection;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b-4 border-amber-400">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
            <Crown className="w-4 h-4" />
            <span>لوحة القيادة والتشغيل المركزية • فرقة فتيان الفاتح</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            مرحباً بك، {user?.fullName}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200">
            إدارة الكشافين والمعلمين، استيراد الدفعات وتوزيعها على الصفوف والشعب بكل سهولة
          </p>
        </div>

        {/* Quick Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowBulkImportModal(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-950" />
            <span>استيراد كشافين دفعة واحدة (تحديد الصفوف)</span>
          </button>
          <button
            onClick={onNavigateDistinction}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 border border-white/25 transition-all"
          >
            <Award className="w-4 h-4 text-amber-300" />
            <span>شاشة التميز</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 text-xs font-bold select-none">
        {[
          { key: 'OVERVIEW', label: 'نظرة عامة', icon: <Crown className="w-3.5 h-3.5" /> },
          { key: 'SCOUTS', label: 'إدارة الكشافين والصفوف', icon: <Users className="w-3.5 h-3.5" />, badge: scouts.length },
          { key: 'TEACHERS', label: 'إدارة المعلمين', icon: <BookOpen className="w-3.5 h-3.5" />, badge: teachers.length },
          { key: 'POINTS', label: 'إضافة نقاط وشارات', icon: <Sparkles className="w-3.5 h-3.5" /> },
          { key: 'ACTIVITIES', label: 'الفعاليات', icon: <Calendar className="w-3.5 h-3.5" /> },
          { key: 'AUDIT', label: 'سجل التدقيق', icon: <Shield className="w-3.5 h-3.5" /> }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-3.5 py-2.5 rounded-xl shrink-0 flex items-center gap-1.5 transition-all ${
              activeTab === tab.key ? 'bg-emerald-800 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                activeTab === tab.key ? 'bg-amber-400 text-amber-950' : 'bg-slate-200 text-slate-700'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-500">إجمالي الكشافين المسجلين</span>
            <div className="text-3xl font-black text-emerald-800 my-1">{scouts.length}</div>
          </div>
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-500">إجمالي المعلمين</span>
            <div className="text-3xl font-black text-blue-800 my-1">{teachers.length}</div>
          </div>
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-500">الفعاليات والأنشطة</span>
            <div className="text-3xl font-black text-amber-600 my-1">{activities.length}</div>
          </div>
        </div>
      )}

      {/* SCOUTS MANAGEMENT TAB مع الفلترة التفصيلية للصفوف والشعب */}
      {activeTab === 'SCOUTS' && (
        <div className="space-y-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-bold text-lg text-slate-900">سجل الكشافين ({scouts.length})</h2>
                <button
                  onClick={() => setShowAddScoutModal(true)}
                  className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة كشاف فردي</span>
                </button>
                <button
                  onClick={() => setShowBulkImportModal(true)}
                  className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>استيراد دفعة مع تحديد الصف</span>
                </button>
                {selectedScoutIds.length > 0 && (
                  <button
                    onClick={handleBulkDeleteScouts}
                    className="px-3.5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm animate-pulse"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف المحدد ({selectedScoutIds.length})</span>
                  </button>
                )}
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={scoutSearch}
                  onChange={e => setScoutSearch(e.target.value)}
                  placeholder="بحث بالاسم أو الرقم..."
                  className="px-3 py-2 pl-8 rounded-xl border border-slate-200 text-xs w-full sm:w-64"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            {/* شريط فلترة الصفوف والشعب التفصيلي */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">الصف الدراسي:</span>
                <select
                  value={scoutGradeFilter}
                  onChange={e => {
                    setScoutGradeFilter(e.target.value);
                    setScoutSectionFilter(''); // إعادة تعيين الشعبة عند تغير الصف
                  }}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-semibold"
                >
                  <option value="">جميع الصفوف</option>
                  <option value="سادس ابتدائي">سادس ابتدائي</option>
                  <option value="الأول إعدادي">الأول إعدادي</option>
                  <option value="الثاني إعدادي">الثاني إعدادي</option>
                  <option value="الثالث إعدادي">الثالث إعدادي</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">رقم الشعبة / الفرقة:</span>
                <select
                  value={scoutSectionFilter}
                  onChange={e => setScoutSectionFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-semibold"
                >
                  <option value="">جميع الشعب (1 إلى 9)</option>
                  {scoutGradeFilter === 'سادس ابتدائي' && [1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                    <option key={n} value={String(n)}>الشعبة {n}</option>
                  ))}
                  {scoutGradeFilter === 'الأول إعدادي' && [1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                    <option key={n} value={String(n)}>الشعبة {n}</option>
                  ))}
                  {(scoutGradeFilter === 'الثاني إعدادي' || scoutGradeFilter === 'الثالث إعدادي') && [1, 2, 3, 4, 5, 6].map(n => (
                    <option key={n} value={String(n)}>الشعبة {n}</option>
                  ))}
                  {!scoutGradeFilter && [1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                    <option key={n} value={String(n)}>الشعبة {n}</option>
                  ))}
                </select>
              </div>

              {(scoutGradeFilter || scoutSectionFilter || scoutSearch) && (
                <button
                  onClick={() => { setScoutGradeFilter(''); setScoutSectionFilter(''); setScoutSearch(''); }}
                  className="text-xs text-red-600 font-bold hover:underline"
                >
                  إعادة ضبط الفلاتر
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="p-4 w-10 text-center">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedScoutIds(filteredScouts.map(s => s.id));
                          } else {
                            setSelectedScoutIds([]);
                          }
                        }}
                        checked={selectedScoutIds.length === filteredScouts.length && filteredScouts.length > 0}
                        className="rounded accent-emerald-700"
                      />
                    </th>
                    <th className="p-4 font-bold">اسم الكشاف</th>
                    <th className="p-4 font-bold">الرقم الشخصي (كلمة السر)</th>
                    <th className="p-4 font-bold">الصف الدراسي</th>
                    <th className="p-4 font-bold">الشعبة / الفرقة</th>
                    <th className="p-4 font-bold">الرصيد</th>
                    <th className="p-4 font-bold text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredScouts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        لا توجد نتائج مطابقة. استخدم زر "استيراد دفعة مع تحديد الصف" لإضافة الطلاب وتوزيعهم.
                      </td>
                    </tr>
                  ) : (
                    filteredScouts.map(scout => (
                      <tr key={scout.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 text-center">
                          <input
                            type="checkbox"
                            checked={selectedScoutIds.includes(scout.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedScoutIds([...selectedScoutIds, scout.id]);
                              } else {
                                setSelectedScoutIds(selectedScoutIds.filter(id => id !== scout.id));
                              }
                            }}
                            className="rounded accent-emerald-700"
                          />
                        </td>
                        <td className="p-4 font-bold text-slate-900">{scout.fullName}</td>
                        <td className="p-4 text-slate-600 font-mono">{scout.nationalId}</td>
                        <td className="p-4 font-semibold text-emerald-800">{scout.grade}</td>
                        <td className="p-4 font-bold text-slate-700">شعبة {scout.section || '1'}</td>
                        <td className="p-4 font-black text-emerald-700">{scout.netBalance || 0} نقطة</td>
                        <td className="p-4 text-center flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setTargetScoutId(scout.id);
                              setShowPointsModal(true);
                            }}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-bold"
                            title="إضافة نقاط"
                          >
                            + نقطة
                          </button>
                          <button
                            onClick={() => handleDeleteScout(scout.id, scout.fullName)}
                            className="p-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl transition-all"
                            title="حذف الكشاف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TEACHERS TAB */}
      {activeTab === 'TEACHERS' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-slate-900">سجل المعلمين والمشرفين ({teachers.length})</h2>
            <button
              onClick={() => setShowAddTeacherModal(true)}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة معلم</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="p-4 font-bold">اسم المعلم</th>
                  <th className="p-4 font-bold">الرقم الوظيفي</th>
                  <th className="p-4 font-bold">المادة</th>
                  <th className="p-4 font-bold text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teachers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400">لا يوجد معلمون مسجلون حالياً</td>
                  </tr>
                ) : (
                  teachers.map(teacher => (
                    <tr key={teacher.id} className="hover:bg-slate-50/80">
                      <td className="p-4 font-bold text-slate-900">{teacher.fullName}</td>
                      <td className="p-4 font-mono text-slate-600">{teacher.employeeId}</td>
                      <td className="p-4 text-slate-600">{teacher.subject}</td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleDeleteTeacher(teacher.id, teacher.fullName)}
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* POINTS TAB */}
      {activeTab === 'POINTS' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 max-w-xl mx-auto">
          <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>منح نقاط مباشرة للكشاف</span>
          </h3>
          <form onSubmit={handleAddPointsSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">اختر الكشاف</label>
              <select
                value={targetScoutId}
                onChange={e => setTargetScoutId(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs bg-white font-semibold"
                required
              >
                <option value="">-- اختر كشافاً --</option>
                {scouts.map(s => (
                  <option key={s.id} value={s.id}>{s.fullName} ({s.grade} - شعبة {s.section})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">عدد النقاط (موجب أو سالب)</label>
              <input
                type="number"
                value={pointsAmount}
                onChange={e => setPointsAmount(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-xl text-xs"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">السبب / الفعالية</label>
              <input
                type="text"
                value={pointsReason}
                onChange={e => setPointsReason(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs"
                required
              />
            </div>
            <button type="submit" className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md">
              إضافة النقاط فوراً
            </button>
          </form>
        </div>
      )}

      {/* نافذة استيراد دفعة كشافين مع تحديد الصف والشعبة بدقة */}
      {showBulkImportModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-black text-lg text-slate-900">استيراد الكشافين دفعة واحدة وتوزيعهم</h3>
            <p className="text-xs text-slate-500">
              اختر الصف الدراسي ورقم الشعبة المستهدفة لتوزيع الطلاب المراد استيرادهم بشكل منظم وسهل:
            </p>
            <form onSubmit={handleBulkImportSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">الصف الدراسي</label>
                <select
                  value={importGrade}
                  onChange={e => {
                    setImportGrade(e.target.value);
                    setImportSection('1');
                  }}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-white font-bold"
                >
                  <option value="سادس ابتدائي">سادس ابتدائي (الفرق من 1 إلى 9)</option>
                  <option value="الأول إعدادي">الأول إعدادي (الفرق من 1 إلى 8)</option>
                  <option value="الثاني إعدادي">الثاني إعدادي (الفرق من 1 إلى 6)</option>
                  <option value="الثالث إعدادي">الثالث إعدادي (الفرق من 1 إلى 6)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">رقم الشعبة / الفرقة</label>
                <select
                  value={importSection}
                  onChange={e => setImportSection(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-white font-bold"
                >
                  {importGrade === 'سادس ابتدائي' && [1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                    <option key={n} value={String(n)}>الشعبة {n}</option>
                  ))}
                  {importGrade === 'الأول إعدادي' && [1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                    <option key={n} value={String(n)}>الشعبة {n}</option>
                  ))}
                  {(importGrade === 'الثاني إعدادي' || importGrade === 'الثالث إعدادي') && [1, 2, 3, 4, 5, 6].map(n => (
                    <option key={n} value={String(n)}>الشعبة {n}</option>
                  ))}
                </select>
              </div>

              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-[11px] text-amber-800 font-semibold">
                ملاحظة: سيتم رفع الكشافين الرسميين وتخصيصهم فوراً في قاعدة بيانات فايربيس مع تفعيل حسابات دخولهم.
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md">
                  {loading ? 'جاري الاستيراد...' : 'بدء الاستيراد الفوري'}
                </button>
                <button type="button" onClick={() => setShowBulkImportModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Single Scout Modal */}
      {showAddScoutModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-black text-lg text-slate-900">إضافة كشاف فردي جديد</h3>
            <form onSubmit={handleAddScoutSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">الاسم الكامل</label>
                <input
                  type="text"
                  required
                  value={newScout.fullName}
                  onChange={e => setNewScout({ ...newScout, fullName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">الرقم الشخصي (كلمة السر)</label>
                <input
                  type="text"
                  required
                  value={newScout.nationalId}
                  onChange={e => setNewScout({ ...newScout, nationalId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">الصف الدراسي</label>
                <select
                  value={newScout.grade}
                  onChange={e => setNewScout({ ...newScout, grade: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                >
                  <option value="سادس ابتدائي">سادس ابتدائي</option>
                  <option value="الأول إعدادي">الأول إعدادي</option>
                  <option value="الثاني إعدادي">الثاني إعدادي</option>
                  <option value="الثالث إعدادي">الثالث إعدادي</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">رقم الشعبة / الفرقة</label>
                <select
                  value={newScout.section}
                  onChange={e => setNewScout({ ...newScout, section: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                    <option key={n} value={String(n)}>الشعبة {n}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold">حفظ وإضافة</button>
                <button type="button" onClick={() => setShowAddScoutModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Teacher Modal */}
      {showAddTeacherModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-black text-lg text-slate-900">إضافة معلم جديد</h3>
            <form onSubmit={handleAddTeacherSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">الاسم الكامل</label>
                <input
                  type="text"
                  required
                  value={newTeacher.fullName}
                  onChange={e => setNewTeacher({ ...newTeacher, fullName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">الرقم الوظيفي (كلمة السر)</label>
                <input
                  type="text"
                  required
                  value={newTeacher.employeeId}
                  onChange={e => setNewTeacher({ ...newTeacher, employeeId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">المادة</label>
                <input
                  type="text"
                  value={newTeacher.subject}
                  onChange={e => setNewTeacher({ ...newTeacher, subject: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold">حفظ المعلم</button>
                <button type="button" onClick={() => setShowAddTeacherModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
