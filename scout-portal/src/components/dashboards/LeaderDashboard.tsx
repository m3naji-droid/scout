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
import { ExcelImportModal } from '../modals/ExcelImportModal';

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
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [scoutSearch, setScoutSearch] = useState('');
  const [scoutGradeFilter, setScoutGradeFilter] = useState('');

  // Modals state
  const [showAddScoutModal, setShowAddScoutModal] = useState(false);
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  const [showAwardBadgeModal, setShowAwardBadgeModal] = useState(false);
  const [showIssueCertModal, setShowIssueCertModal] = useState(false);
  const [excelImportType, setExcelImportType] = useState<'scouts' | 'teachers' | null>(null);

  // Action forms state
  const [newScout, setNewScout] = useState({ fullName: '', nationalId: '', grade: 'الأول إعدادي', section: '1', patrolName: 'طليعة الفاتح', parentName: '', parentPhone: '' });
  const [newTeacher, setNewTeacher] = useState({ fullName: '', employeeId: '', subject: 'العلوم العامة', assignedClasses: ['الأول إعدادي - 1'] });
  const [newActivity, setNewActivity] = useState({ title: '', description: '', type: 'INTERNAL' as const, location: '', date: '', time: '08:00 صباحاً', targetGrades: ['الأول إعدادي', 'الثاني إعدادي'], requiresParentConsent: false });
  const [selectedScoutForBadge, setSelectedScoutForBadge] = useState('');
  const [selectedBadgeId, setSelectedBadgeId] = useState('');
  const [badgeNotes, setBadgeNotes] = useState('');
  const [certForm, setCertForm] = useState({ scoutId: '', title: 'شهادة تميز وانضباط كشفي', reason: 'تقديراً للسلوك المثالي والالتزام بالأنشطة الكشفية الميدانية', achievementType: 'التميز السلوكي' });

  // Correction Form state
  const [correctingEval, setCorrectingEval] = useState<PointEvaluation | null>(null);
  const [correctionPoints, setCorrectionPoints] = useState<number>(3);
  const [correctionReason, setCorrectionReason] = useState<string>('');

  // Restore DB File State
  const [restoreMessage, setRestoreMessage] = useState<{ text: string; error: boolean } | null>(null);

  useEffect(() => {
    loadAllLeaderData();
  }, []);

  const loadAllLeaderData = async () => {
    try {
      setLoading(true);
      const [
        allScouts, allTeachers, allEvals, allSusp, 
        allReports, allActs, badgesData, allCerts, 
        allLogs, curSettings, sumData
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
        api.getSettings(),
        api.getReportsSummary()
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
      setSummary(sumData);
    } catch (err) {
      console.error('Failed loading leader data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Review Point Evaluation (Approve or Reject)
  const handleReviewEval = async (id: string, decision: 'APPROVED' | 'REJECTED', reviewNotes?: string) => {
    if (!user) return;
    try {
      await api.reviewEvaluation(id, decision, reviewNotes || '', { id: user.id, name: user.fullName, role: user.role });
      loadAllLeaderData();
    } catch (err) {
      console.error(err);
    }
  };

  // Documented Correction on Points
  const handleCorrectEval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctingEval || !user) return;
    try {
      await api.correctEvaluation(correctingEval.id, correctionPoints, correctionReason, { id: user.id, name: user.fullName, role: user.role });
      setCorrectingEval(null);
      loadAllLeaderData();
    } catch (err) {
      console.error(err);
    }
  };

  // Decide Suspension Request
  const handleDecideSuspension = async (id: string, decision: 'APPROVED' | 'REJECTED', approvedDuration?: string, notes?: string) => {
    if (!user) return;
    try {
      await api.decideSuspensionRequest(
        id, 
        decision, 
        notes || (decision === 'APPROVED' ? 'تم اعتماد قرار الحرمان المؤقت' : 'تم حفظ الطلب مع الاكتفاء بالتوجيه التربوي'), 
        approvedDuration || 'أسبوعان', 
        { id: user.id, name: user.fullName, role: user.role }
      );
      loadAllLeaderData();
    } catch (err) {
      console.error(err);
    }
  };

  // Review Scout Photo
  const handleReviewAvatar = async (scoutId: string, decision: 'APPROVED' | 'REJECTED', reason?: string) => {
    if (!user) return;
    try {
      await api.reviewScoutAvatar(scoutId, decision, reason || '', { id: user.id, name: user.fullName, role: user.role });
      loadAllLeaderData();
    } catch (err) {
      console.error(err);
    }
  };

  // Add Scout Handler
  const handleAddScoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await api.addScout(newScout, { id: user.id, name: user.fullName, role: user.role });
      setShowAddScoutModal(false);
      setNewScout({ fullName: '', nationalId: '', grade: 'الأول إعدادي', section: '1', patrolName: 'طليعة الفاتح', parentName: '', parentPhone: '' });
      loadAllLeaderData();
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
      setNewTeacher({ fullName: '', employeeId: '', subject: 'العلوم العامة', assignedClasses: ['الأول إعدادي - 1'] });
      loadAllLeaderData();
    } catch (err: any) {
      alert(err.message || 'فشل إضافة المعلم');
    }
  };

  // Create Activity Handler
  const handleCreateActivitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await api.createActivity(newActivity, { id: user.id, name: user.fullName, role: user.role });
      setShowAddActivityModal(false);
      setNewActivity({ title: '', description: '', type: 'INTERNAL', location: '', date: '', time: '08:00 صباحاً', targetGrades: ['الأول إعدادي', 'الثاني إعدادي'], requiresParentConsent: false });
      loadAllLeaderData();
    } catch (err: any) {
      alert(err.message || 'فشل إنشاء الفعالية');
    }
  };

  // Award Badge Handler
  const handleAwardBadgeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScoutForBadge || !selectedBadgeId || !user) return;
    try {
      await api.awardBadge(selectedBadgeId, selectedScoutForBadge, badgeNotes, { id: user.id, name: user.fullName, role: user.role });
      setShowAwardBadgeModal(false);
      setBadgeNotes('');
      loadAllLeaderData();
    } catch (err: any) {
      alert(err.message || 'فشل منح الشارة');
    }
  };

  // Issue Certificate Handler
  const handleIssueCertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certForm.scoutId || !user) return;
    try {
      const res = await api.issueCertificate(certForm, { id: user.id, name: user.fullName, role: user.role });
      setShowIssueCertModal(false);
      loadAllLeaderData();
      if (res.certificate) {
        onOpenCertificate(res.certificate);
      }
    } catch (err: any) {
      alert(err.message || 'فشل إصدار الشهادة');
    }
  };

  // Backup restore file reader
  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        const res = await api.restoreBackup(parsed, { id: user.id, name: user.fullName, role: user.role });
        setRestoreMessage({ text: res.message || 'تمت استعادة النسخة الاحتياطية بنجاح', error: false });
        loadAllLeaderData();
      } catch (err: any) {
        setRestoreMessage({ text: 'فشل استعادة الملف: ' + (err.message || ''), error: true });
      }
    };
    reader.readAsText(file);
  };

  const pendingEvaluations = evaluations.filter(e => e.status === 'PENDING');
  const pendingPhotos = scouts.filter(s => s.avatarStatus === 'PENDING' && s.avatarUrl);
  const newSuspensions = suspensions.filter(s => s.status === 'NEW');

  // Filtered scouts
  const filteredScouts = scouts.filter(s => {
    const matchesSearch = s.fullName.includes(scoutSearch) || s.nationalId.includes(scoutSearch);
    const matchesGrade = !scoutGradeFilter || s.grade === scoutGradeFilter;
    return matchesSearch && matchesGrade;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Leader Command Center Header */}
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
            الإدارة الكاملة لشؤون الفرقة، اعتماد النقاط، البت في طلبات الحرمان، تنظيم الفعاليات، وتكريم الفتيان
          </p>
        </div>

        {/* Quick Actions Header Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setExcelImportType('scouts')}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 border border-white/20 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>استيراد كشافين</span>
          </button>
          <button
            onClick={() => setExcelImportType('teachers')}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 border border-white/20 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-blue-400" />
            <span>استيراد معلمين</span>
          </button>
          <button
            onClick={onNavigateDistinction}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
          >
            <Award className="w-4 h-4" />
            <span>شاشة التميز</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 text-xs font-bold select-none">
        {[
          { key: 'OVERVIEW', label: 'نظرة عامة', icon: <Crown className="w-3.5 h-3.5" />, badge: null },
          { key: 'POINTS', label: 'اعتماد النقاط', icon: <Sparkles className="w-3.5 h-3.5" />, badge: pendingEvaluations.length || null },
          { key: 'SUSPENSIONS', label: 'طلبات الحرمان', icon: <AlertTriangle className="w-3.5 h-3.5" />, badge: newSuspensions.length || null },
          { key: 'MEDIA', label: 'مراجعة الصور', icon: <CheckCircle2 className="w-3.5 h-3.5" />, badge: pendingPhotos.length || null },
          { key: 'SCOUTS', label: 'إدارة الكشافين', icon: <Users className="w-3.5 h-3.5" />, badge: scouts.length },
          { key: 'TEACHERS', label: 'إدارة المعلمين', icon: <BookOpen className="w-3.5 h-3.5" />, badge: teachers.length },
          { key: 'ACTIVITIES', label: 'الفعاليات والحضور', icon: <Calendar className="w-3.5 h-3.5" />, badge: activities.length },
          { key: 'BADGES', label: 'الشارات والمكافآت', icon: <Award className="w-3.5 h-3.5" />, badge: badges.length },
          { key: 'CERTIFICATES', label: 'شهادات التقدير', icon: <FileText className="w-3.5 h-3.5" />, badge: certificates.length },
          { key: 'REPORTS', label: 'البلاغات والتقارير', icon: <MessageSquare className="w-3.5 h-3.5" />, badge: incidentReports.length },
          { key: 'AUDIT', label: 'سجل التدقيق', icon: <Shield className="w-3.5 h-3.5" />, badge: null },
          { key: 'SETTINGS', label: 'إعدادات ونسخ احتياطي', icon: <Settings className="w-3.5 h-3.5" />, badge: null }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-3.5 py-2.5 rounded-xl shrink-0 flex items-center gap-1.5 transition-all ${
              activeTab === tab.key
                ? 'bg-emerald-800 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== null && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                activeTab === tab.key ? 'bg-amber-400 text-amber-950' : 'bg-slate-200 text-slate-700'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-8">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500">إجمالي الكشافين</span>
              <div className="text-3xl font-black text-emerald-800 my-1">{scouts.length}</div>
              <span className="text-[10px] text-slate-400">{scouts.filter(s => s.status === 'ACTIVE').length} كشاف نشط</span>
            </div>
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500">تقييمات بانتظار الاعتماد</span>
              <div className="text-3xl font-black text-amber-600 my-1">{pendingEvaluations.length}</div>
              <span className="text-[10px] text-amber-700 font-bold">تتطلب قرار القائد</span>
            </div>
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500">طلبات حرمان جديدة</span>
              <div className="text-3xl font-black text-red-600 my-1">{newSuspensions.length}</div>
              <span className="text-[10px] text-red-600 font-bold">محولة من المعلمين</span>
            </div>
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500">صور شخصية للمراجعة</span>
              <div className="text-3xl font-black text-blue-700 my-1">{pendingPhotos.length}</div>
              <span className="text-[10px] text-blue-600 font-bold">تدقيق الزي الكشفي</span>
            </div>
          </div>

          {/* Pending Points Approvals Queue Section */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-base text-slate-900">
                  قائمة التقييمات المعلقة بانتظار المراجعة والاعتماد
                </h3>
              </div>
              <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full">
                {pendingEvaluations.length} تقييم معلق
              </span>
            </div>

            {pendingEvaluations.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                ممتاز! تم البت في جميع تقييمات النقاط ولا توجد طلبات معلقة حالياً.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingEvaluations.map(ev => (
                  <div key={ev.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                          ev.type === 'POSITIVE' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                        }`}>
                          {ev.type === 'POSITIVE' ? `+${ev.points}` : `-${ev.points}`}
                        </span>
                        <span className="font-bold text-sm text-slate-900">{ev.scoutName}</span>
                        <span className="text-xs text-slate-500">({ev.scoutGrade} - شعبة {ev.scoutSection})</span>
                      </div>
                      <p className="text-xs text-slate-700 font-semibold">{ev.behaviorCategory}</p>
                      {ev.notes && <p className="text-xs text-slate-500">{ev.notes}</p>}
                      <span className="text-[10px] text-slate-400 block">بواسطة المعلم: {ev.evaluatorName} • {new Date(ev.createdAt).toLocaleDateString('ar-BH')}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleReviewEval(ev.id, 'APPROVED')}
                        className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>اعتماد التقييم</span>
                      </button>
                      <button
                        onClick={() => handleReviewEval(ev.id, 'REJECTED', 'لم يستوفِ الشروط المعتمدة')}
                        className="px-3.5 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-xl text-xs font-bold flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>رفض</span>
                      </button>
                      <button
                        onClick={() => {
                          setCorrectingEval(ev);
                          setCorrectionPoints(ev.points);
                          setCorrectionReason('');
                        }}
                        className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold"
                      >
                        تصحيح
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: POINTS & EVALUATIONS */}
      {activeTab === 'POINTS' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-slate-900">سجل عمليات التقييم والنقاط الكامل</h2>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
            {evaluations.map(ev => (
              <div key={ev.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                      ev.type === 'POSITIVE' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                    }`}>
                      {ev.type === 'POSITIVE' ? `+${ev.points}` : `-${ev.points}`}
                    </span>
                    <span className="font-bold text-sm text-slate-900">{ev.scoutName}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      ev.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                      ev.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                      ev.status === 'CORRECTED' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {ev.status === 'APPROVED' ? 'معتمد' : ev.status === 'PENDING' ? 'معلق' : ev.status === 'CORRECTED' ? 'مصحح' : 'مرفوض'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{ev.behaviorCategory} {ev.correctionReason && `(تصحيح: ${ev.correctionReason})`}</p>
                </div>

                <div className="flex items-center gap-2">
                  {ev.status === 'PENDING' && (
                    <>
                      <button onClick={() => handleReviewEval(ev.id, 'APPROVED')} className="px-3 py-1.5 bg-emerald-700 text-white text-xs font-bold rounded-xl">اعتماد</button>
                      <button onClick={() => handleReviewEval(ev.id, 'REJECTED')} className="px-3 py-1.5 bg-red-100 text-red-800 text-xs font-bold rounded-xl">رفض</button>
                    </>
                  )}
                  {ev.status === 'APPROVED' && (
                    <button
                      onClick={() => {
                        setCorrectingEval(ev);
                        setCorrectionPoints(ev.points);
                        setCorrectionReason('');
                      }}
                      className="px-3 py-1.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-300"
                    >
                      تصحيح موثق
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SUSPENSIONS */}
      {activeTab === 'SUSPENSIONS' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span>طلبات الحرمان من الأنشطة الكشفية</span>
            </h2>
          </div>

          <div className="space-y-4">
            {suspensions.length === 0 ? (
              <div className="p-8 bg-white rounded-3xl text-center text-slate-400 text-xs border border-slate-200">
                لا توجد طلبات حرمان مسجلة
              </div>
            ) : (
              suspensions.map(req => (
                <div key={req.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-base text-slate-900">{req.scoutName}</span>
                        <span className="text-xs text-slate-500">({req.scoutGrade} - {req.scoutSection})</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          req.status === 'APPROVED' ? 'bg-red-100 text-red-800' :
                          req.status === 'NEW' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {req.status === 'APPROVED' ? 'حرمان معتمد' : req.status === 'NEW' ? 'طلب جديد قيد النظر' : 'مرفوض'}
                        </span>
                      </div>
                      <p className="text-xs text-red-700 font-bold mt-1">المخالفة: {req.violationType} (تكرار: {req.violationCount} مرات)</p>
                      <p className="text-xs text-slate-600 mt-1">{req.description}</p>
                      <p className="text-xs text-slate-500 mt-1">المدة المطلوبة: <strong>{req.requestedDuration}</strong> • الأنشطة: {req.targetActivities}</p>
                    </div>

                    {req.status === 'NEW' && (
                      <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleDecideSuspension(req.id, 'APPROVED', req.requestedDuration)}
                          className="w-full sm:w-auto px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold"
                        >
                          اعتماد الحرمان ({req.requestedDuration})
                        </button>
                        <button
                          onClick={() => handleDecideSuspension(req.id, 'REJECTED')}
                          className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold"
                        >
                          رفض الطلب
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: MEDIA & AVATAR APPROVALS */}
      {activeTab === 'MEDIA' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-slate-900">مراجعة وتدقيق الصور الشخصية للكشافين بالزي الرسمي</h2>
            <span className="text-xs text-slate-500">وفق متطلبات وزارة التربية والتعليم</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingPhotos.length === 0 ? (
              <div className="col-span-full py-12 bg-white rounded-3xl text-center text-slate-400 text-xs border border-slate-200">
                لا توجد صور بانتظار المراجعة والاعتماد
              </div>
            ) : (
              pendingPhotos.map(s => (
                <div key={s.id} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4 text-center">
                  <div className="w-32 h-32 rounded-3xl overflow-hidden mx-auto border-4 border-amber-400 shadow-md">
                    <img src={s.avatarUrl} alt={s.fullName} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{s.fullName}</h4>
                    <p className="text-xs text-slate-500">{s.grade} • شعبة {s.section}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReviewAvatar(s.id, 'APPROVED')}
                      className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold"
                    >
                      اعتماد الصورة
                    </button>
                    <button
                      onClick={() => handleReviewAvatar(s.id, 'REJECTED', 'الصورة ليست بالزي الكشفي المعتمد')}
                      className="flex-1 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold border border-red-200"
                    >
                      رفض مع السبب
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 5: SCOUTS MANAGEMENT */}
      {activeTab === 'SCOUTS' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h2 className="font-bold text-lg text-slate-900">سجل الكشافين ({scouts.length})</h2>
              <button
                onClick={() => setShowAddScoutModal(true)}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة كشاف</span>
              </button>
              <button
                onClick={() => setExcelImportType('scouts')}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                <span>استيراد Excel</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={scoutGradeFilter}
                onChange={e => setScoutGradeFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-semibold"
              >
                <option value="">جميع الصفوف</option>
                <option value="الأول إعدادي">الأول إعدادي</option>
                <option value="الثاني إعدادي">الثاني إعدادي</option>
                <option value="الثالث إعدادي">الثالث إعدادي</option>
              </select>

              <div className="relative">
                <input
                  type="text"
                  value={scoutSearch}
                  onChange={e => setScoutSearch(e.target.value)}
                  placeholder="بحث..."
                  className="px-3 py-2 pl-8 rounded-xl border border-slate-200 text-xs"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                  <tr>
                    <th className="p-4">الكشاف</th>
                    <th className="p-4">الرقم الشخصي</th>
                    <th className="p-4">الصف والشعبة</th>
                    <th className="p-4">الرصيد المعتمد</th>
                    <th className="p-4">الشارات</th>
                    <th className="p-4">الحالة</th>
                    <th className="p-4">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredScouts.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50/70">
                      <td className="p-4 font-bold text-slate-900 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">
                          {s.avatarStatus === 'APPROVED' && s.avatarUrl ? (
                            <img src={s.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : s.fullName.charAt(0)}
                        </div>
                        <span>{s.fullName}</span>
                      </td>
                      <td className="p-4 text-slate-600">{s.nationalId}</td>
                      <td className="p-4 text-slate-600">{s.grade} - {s.section}</td>
                      <td className="p-4 font-black text-emerald-800">+{s.netBalance}</td>
                      <td className="p-4 font-bold text-amber-600">{s.badgeCount}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          s.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {s.status === 'ACTIVE' ? 'نشط' : 'محروم'}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => {
                            setSelectedScoutForBadge(s.id);
                            setShowAwardBadgeModal(true);
                          }}
                          className="text-amber-700 hover:underline font-bold mr-2"
                        >
                          منح شارة
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: TEACHERS MANAGEMENT */}
      {activeTab === 'TEACHERS' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-slate-900">سجل المعلمين والمشرفين ({teachers.length})</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddTeacherModal(true)}
                className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة معلم</span>
              </button>
              <button
                onClick={() => setExcelImportType('teachers')}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-blue-700" />
                <span>استيراد Excel</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teachers.map(t => (
              <div key={t.id} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900">{t.fullName}</h3>
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">{t.employeeId}</span>
                </div>
                <p className="text-xs text-slate-500">{t.subject || 'معلم مواد دراسية'}</p>
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block mb-1">الصفوف المصرح بها:</span>
                  <div className="flex flex-wrap gap-1">
                    {t.assignedClasses.map(c => (
                      <span key={c} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: ACTIVITIES & ATTENDANCE */}
      {activeTab === 'ACTIVITIES' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-slate-900">الفعاليات الداخلية والخارجية والرحلات</h2>
            <button
              onClick={() => setShowAddActivityModal(true)}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة فعالية كشفية جديدة</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activities.map(act => (
              <div key={act.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      act.type === 'EXTERNAL' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {act.type === 'EXTERNAL' ? 'خارج المدرسة' : 'داخل المدرسة'}
                    </span>
                    <h3 className="font-bold text-base text-slate-900 mt-1">{act.title}</h3>
                  </div>
                  <span className="text-xs font-bold text-slate-500">{act.date}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{act.description}</p>
                <div className="p-3 bg-slate-50 rounded-2xl text-[11px] text-slate-600 space-y-1">
                  <div><strong>الموقع:</strong> {act.location}</div>
                  <div><strong>الوقت:</strong> {act.time}</div>
                  {act.requiredItems && <div><strong>المتطلبات:</strong> {act.requiredItems}</div>}
                  {act.emergencyContact && <div><strong>طوارئ:</strong> {act.emergencyContact}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: BADGES & REWARDS */}
      {activeTab === 'BADGES' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-slate-900">منظومة الشارات والأوسمة الكشفية</h2>
            <button
              onClick={() => {
                setSelectedScoutForBadge(scouts[0]?.id || '');
                setSelectedBadgeId(badges[0]?.id || '');
                setShowAwardBadgeModal(true);
              }}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
            >
              <Award className="w-3.5 h-3.5" />
              <span>منح شارة لكشاف</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map(b => (
              <div key={b.id} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold">
                    <Award className="w-6 h-6 fill-amber-200" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{b.title}</h3>
                    <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full font-bold">{b.category}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 mt-2">{b.description}</p>
                <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                  معيار الاستحقاق: {b.criteria}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 9: CERTIFICATES */}
      {activeTab === 'CERTIFICATES' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-slate-900">شهادات التقدير الصادرة</h2>
            <button
              onClick={() => {
                setCertForm({ ...certForm, scoutId: scouts[0]?.id || '' });
                setShowIssueCertModal(true);
              }}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إصدار شهادة تقدير جديدة</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certificates.map(cert => (
              <div key={cert.id} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{cert.scoutName}</h3>
                  <p className="text-xs text-slate-600">{cert.title}</p>
                  <span className="text-[10px] text-slate-400">{cert.certificateNumber} • {cert.date}</span>
                </div>
                <button
                  onClick={() => onOpenCertificate(cert)}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>معاينة وطباعة</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 10: REPORTS & INCIDENTS */}
      {activeTab === 'REPORTS' && (
        <div className="space-y-6">
          <h2 className="font-bold text-lg text-slate-900">البلاغات والملاحظات الواردة من المعلمين</h2>
          <div className="space-y-4">
            {incidentReports.map(rep => (
              <div key={rep.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{rep.title}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">{rep.category}</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full">{rep.status}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{rep.description}</p>
                <div className="text-[10px] text-slate-400">المرسل: {rep.senderName} • {new Date(rep.createdAt).toLocaleDateString('ar-BH')}</div>
                {rep.leaderResponse && (
                  <div className="p-3 bg-emerald-50 rounded-2xl text-xs text-emerald-950 border border-emerald-200">
                    <strong>رد القيادة:</strong> {rep.leaderResponse}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 11: AUDIT LOG */}
      {activeTab === 'AUDIT' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-slate-900">سجل التدقيق غير القابل للتعديل للعمليات الحساسة</h2>
            <span className="text-xs text-slate-400">توثيق أمني كامل</span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="divide-y divide-slate-100 text-xs">
              {auditLogs.map(log => (
                <div key={log.id} className="p-4 flex items-start justify-between gap-4">
                  <div>
                    <span className="font-bold text-slate-900">{log.action}</span>
                    <span className="text-slate-400 text-[10px] mr-2">[{log.targetResource}]</span>
                    <p className="text-slate-600 mt-1">{log.details}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">بواسطة: {log.actorName} ({log.actorRole})</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold shrink-0">
                    {new Date(log.timestamp).toLocaleString('ar-BH')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 12: SETTINGS & BACKUP */}
      {activeTab === 'SETTINGS' && (
        <div className="space-y-6">
          <h2 className="font-bold text-lg text-slate-900">إعدادات الموقع والنسخ الاحتياطي</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Backup & Restore */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-700" />
                <span>النسخ الاحتياطي واستعادة البيانات</span>
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed">
                يمكنك تنزيل نسخة احتياطية كاملة وموثقة لقاعدة بيانات الفرقة بصيغة JSON، أو استعادة نسخة سابقة في أي وقت.
              </p>

              <div className="space-y-3 pt-2">
                <a
                  href="/api/backup/export"
                  download
                  className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>تنزيل نسخة احتياطية فورية (JSON)</span>
                </a>

                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">استعادة من ملف نسخة احتياطية</label>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleRestoreFile}
                    className="w-full text-xs text-slate-500 file:mr-0 file:ml-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-200 file:text-slate-800 hover:file:bg-slate-300 cursor-pointer"
                  />
                </div>

                {restoreMessage && (
                  <div className={`p-3 rounded-xl text-xs font-bold ${
                    restoreMessage.error ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}>
                    {restoreMessage.text}
                  </div>
                )}
              </div>
            </div>

            {/* Troop Information & Academic Year */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-600" />
                <span>معلومات الفرقة والعام الدراسي</span>
              </h3>

              <div className="text-xs space-y-2 text-slate-700">
                <div><strong>اسم الفرقة:</strong> {settings?.troopName}</div>
                <div><strong>المدرسة:</strong> {settings?.schoolName}</div>
                <div><strong>العام الدراسي:</strong> {settings?.currentAcademicYear}</div>
                <div><strong>منافسة التميز:</strong> {settings?.competitionPeriod.name}</div>
                <div><strong>حدود النقاط الإيجابية:</strong> من 1 إلى 5 نقاط لكل تقييم</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD SCOUT MODAL */}
      {showAddScoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900">إضافة كشاف جديد يدويًا</h3>
            <form onSubmit={handleAddScoutSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الاسم الكامل</label>
                <input
                  type="text"
                  required
                  value={newScout.fullName}
                  onChange={e => setNewScout({ ...newScout, fullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الرقم الشخصي</label>
                  <input
                    type="text"
                    required
                    value={newScout.nationalId}
                    onChange={e => setNewScout({ ...newScout, nationalId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الصف</label>
                  <select
                    value={newScout.grade}
                    onChange={e => setNewScout({ ...newScout, grade: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  >
                    <option value="الأول إعدادي">الأول إعدادي</option>
                    <option value="الثاني إعدادي">الثاني إعدادي</option>
                    <option value="الثالث إعدادي">الثالث إعدادي</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الشعبة</label>
                  <input
                    type="text"
                    required
                    value={newScout.section}
                    onChange={e => setNewScout({ ...newScout, section: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اسم الطليعة</label>
                  <input
                    type="text"
                    value={newScout.patrolName}
                    onChange={e => setNewScout({ ...newScout, patrolName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 py-2.5 bg-emerald-700 text-white font-bold rounded-xl text-xs">إضافة الكشاف</button>
                <button type="button" onClick={() => setShowAddScoutModal(false)} className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD TEACHER MODAL */}
      {showAddTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900">إضافة معلم جديد</h3>
            <form onSubmit={handleAddTeacherSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الاسم الكامل</label>
                <input
                  type="text"
                  required
                  value={newTeacher.fullName}
                  onChange={e => setNewTeacher({ ...newTeacher, fullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الرقم الوظيفي</label>
                  <input
                    type="text"
                    required
                    value={newTeacher.employeeId}
                    onChange={e => setNewTeacher({ ...newTeacher, employeeId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المادة</label>
                  <input
                    type="text"
                    value={newTeacher.subject}
                    onChange={e => setNewTeacher({ ...newTeacher, subject: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 py-2.5 bg-blue-700 text-white font-bold rounded-xl text-xs">إضافة المعلم</button>
                <button type="button" onClick={() => setShowAddTeacherModal(false)} className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD ACTIVITY MODAL */}
      {showAddActivityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900">إضافة فعالية كشفية جديدة</h3>
            <form onSubmit={handleCreateActivitySubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">عنوان الفعالية</label>
                <input
                  type="text"
                  required
                  value={newActivity.title}
                  onChange={e => setNewActivity({ ...newActivity, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نوع الفعالية</label>
                  <select
                    value={newActivity.type}
                    onChange={e => setNewActivity({ ...newActivity, type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  >
                    <option value="INTERNAL">داخل المدرسة</option>
                    <option value="EXTERNAL">خارج المدرسة (رحلة / مخيم)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الموقع</label>
                  <input
                    type="text"
                    required
                    value={newActivity.location}
                    onChange={e => setNewActivity({ ...newActivity, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">التاريخ</label>
                  <input
                    type="date"
                    required
                    value={newActivity.date}
                    onChange={e => setNewActivity({ ...newActivity, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الوقت</label>
                  <input
                    type="text"
                    required
                    value={newActivity.time}
                    onChange={e => setNewActivity({ ...newActivity, time: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الوصف والتعليمات</label>
                <textarea
                  value={newActivity.description}
                  onChange={e => setNewActivity({ ...newActivity, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                ></textarea>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 py-2.5 bg-emerald-700 text-white font-bold rounded-xl text-xs">نشر الفعالية</button>
                <button type="button" onClick={() => setShowAddActivityModal(false)} className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AWARD BADGE MODAL */}
      {showAwardBadgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900">منح شارة كشفية</h3>
            <form onSubmit={handleAwardBadgeSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اختر الكشاف</label>
                <select
                  value={selectedScoutForBadge}
                  onChange={e => setSelectedScoutForBadge(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                >
                  {scouts.map(s => (
                    <option key={s.id} value={s.id}>{s.fullName} ({s.grade})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اختر الشارة</label>
                <select
                  value={selectedBadgeId}
                  onChange={e => setSelectedBadgeId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                >
                  {badges.map(b => (
                    <option key={b.id} value={b.id}>{b.title} ({b.category})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">سبب الاستحقاق والملاحظة</label>
                <input
                  type="text"
                  value={badgeNotes}
                  onChange={e => setBadgeNotes(e.target.value)}
                  placeholder="مثال: التميز في مخيم الصخير والانضباط التام"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs">منح الشارة رسمياً</button>
                <button type="button" onClick={() => setShowAwardBadgeModal(false)} className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ISSUE CERTIFICATE MODAL */}
      {showIssueCertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900">إصدار شهادة تقدير وانضباط كشفي</h3>
            <form onSubmit={handleIssueCertSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الكشاف المستحق</label>
                <select
                  value={certForm.scoutId}
                  onChange={e => setCertForm({ ...certForm, scoutId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                >
                  {scouts.map(s => (
                    <option key={s.id} value={s.id}>{s.fullName} ({s.grade})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">عنوان الشهادة</label>
                <input
                  type="text"
                  required
                  value={certForm.title}
                  onChange={e => setCertForm({ ...certForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">سبب التكريم</label>
                <textarea
                  required
                  value={certForm.reason}
                  onChange={e => setCertForm({ ...certForm, reason: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                ></textarea>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs">إصدار الشهادة والمعاينة</button>
                <button type="button" onClick={() => setShowIssueCertModal(false)} className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DOCUMENTED CORRECTION MODAL */}
      {correctingEval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900">تصحيح موثق للتقييم</h3>
            <p className="text-xs text-slate-500">الكشاف: {correctingEval.scoutName} • التقييم الحالي: {correctingEval.points} نقطة</p>
            <form onSubmit={handleCorrectEval} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">النقاط المصححة</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={correctionPoints}
                  onChange={e => setCorrectionPoints(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">سبب التصحيح الموثق</label>
                <input
                  type="text"
                  required
                  placeholder="بيان سبب تعديل النقاط في سجل التدقيق..."
                  value={correctionReason}
                  onChange={e => setCorrectionReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 py-2.5 bg-blue-700 text-white font-bold rounded-xl text-xs">حفظ التصحيح</button>
                <button type="button" onClick={() => setCorrectingEval(null)} className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EXCEL IMPORT MODAL */}
      {excelImportType && (
        <ExcelImportModal
          type={excelImportType}
          isOpen={!!excelImportType}
          onClose={() => setExcelImportType(null)}
          onSuccess={() => {
            setExcelImportType(null);
            loadAllLeaderData();
          }}
          actor={{ id: user?.id, name: user?.fullName, role: user?.role }}
        />
      )}
    </div>
  );
};
