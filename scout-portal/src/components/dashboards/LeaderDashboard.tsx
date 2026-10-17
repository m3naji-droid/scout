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

  // Bulk Selection States for Deletion
  const [selectedScoutIds, setSelectedScoutIds] = useState<string[]>([]);
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<string[]>([]);

  // Search & Filters
  const [scoutSearch, setScoutSearch] = useState('');
  const [scoutGradeFilter, setScoutGradeFilter] = useState('');

  // Modals state
  const [showAddScoutModal, setShowAddScoutModal] = useState(false);
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  const [excelImportType, setExcelImportType] = useState<'scouts' | 'teachers' | null>(null);

  // Action forms state
  const [newScout, setNewScout] = useState({ fullName: '', nationalId: '', grade: 'الأول إعدادي', section: '1', patrolName: 'طليعة الفاتح', parentName: '', parentPhone: '' });
  const [newTeacher, setNewTeacher] = useState({ fullName: '', employeeId: '', subject: 'العلوم العامة', assignedClasses: ['الأول إعدادي - 1'] });
  const [newActivity, setNewActivity] = useState({ title: '', description: '', type: 'INTERNAL' as const, location: '', date: '', time: '08:00 صباحاً', targetGrades: ['الأول إعدادي', 'الثاني إعدادي'], requiresParentConsent: false });

  // Correction Form state
  const [correctingEval, setCorrectingEval] = useState<PointEvaluation | null>(null);
  const [correctionPoints, setCorrectionPoints] = useState<number>(3);
  const [correctionReason, setCorrectionReason] = useState<string>('');

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

  // Review Point Evaluation
  const handleReviewEval = async (id: string, decision: 'APPROVED' | 'REJECTED', reviewNotes?: string) => {
    if (!user) return;
    try {
      await api.reviewEvaluation(id, decision, reviewNotes || '', { id: user.id, name: user.fullName, role: user.role });
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

  // ==================== DELETION HANDLERS (حصرية للقائد) ====================
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
    if (!window.confirm(`هل أنت متأكد من حذف (${selectedScoutIds.length}) كشافاً المحددين نهائياً؟`)) return;
    try {
      await api.deleteMultipleScouts(selectedScoutIds, { id: user?.id, name: user?.fullName });
      setSelectedScoutIds([]);
      loadAllLeaderData();
    } catch (err: any) {
      alert(err.message || 'فشل الحذف الجماعي');
    }
  };

  const handleDeleteTeacher = async (id: string, name: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف المعلم "${name}" نهائياً؟`)) return;
    try {
      await api.deleteTeacher(id, { id: user?.id, name: user?.fullName });
      loadAllLeaderData();
    } catch (err: any) {
      alert(err.message || 'فشل الحذف');
    }
  };

  const handleBulkDeleteTeachers = async () => {
    if (selectedTeacherIds.length === 0) return;
    if (!window.confirm(`هل أنت متأكد من حذف (${selectedTeacherIds.length}) معلماً المحددين نهائياً؟`)) return;
    try {
      await api.deleteMultipleTeachers(selectedTeacherIds, { id: user?.id, name: user?.fullName });
      setSelectedTeacherIds([]);
      loadAllLeaderData();
    } catch (err: any) {
      alert(err.message || 'فشل الحذف الجماعي');
    }
  };

  const handleDeleteActivity = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الفعالية؟')) return;
    try {
      await api.deleteActivity(id, { id: user?.id, name: user?.fullName });
      loadAllLeaderData();
    } catch (err: any) {
      alert(err.message || 'فشل الحذف');
    }
  };

  const handleDeleteEvaluation = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف سجل التقييم هذا؟')) return;
    try {
      await api.deleteEvaluation(id, { id: user?.id, name: user?.fullName });
      loadAllLeaderData();
    } catch (err: any) {
      alert(err.message || 'فشل الحذف');
    }
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
            الإدارة الكاملة لشؤون الفرقة، اعتماد النقاط، البت في طلبات الحرمان، التنظيم، والصلاحيات الكاملة للحذف والإدارة
          </p>
        </div>

        {/* Quick Actions Header Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setExcelImportType('scouts')}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 border border-white/25 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>استيراد كشافين</span>
          </button>
          <button
            onClick={() => setExcelImportType('teachers')}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 border border-white/25 transition-all"
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
        </div>
      )}

      {/* TAB 2: SCOUTS MANAGEMENT (مع ميزات الحذف الفردي والجماعي) */}
      {activeTab === 'SCOUTS' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-bold text-lg text-slate-900">سجل الكشافين ({scouts.length})</h2>
              <button
                onClick={() => setShowAddScoutModal(true)}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة كشاف</span>
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
                    <th className="p-4 font-bold">الرقم الشخصي</th>
                    <th className="p-4 font-bold">الصف / الشعبة</th>
                    <th className="p-4 font-bold">الرصيد</th>
                    <th className="p-4 font-bold text-center">إجراءات القائد</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredScouts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">لا توجد نتائج مطابقة</td>
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
                        <td className="p-4 text-slate-600">{scout.grade} - شعبة {scout.section}</td>
                        <td className="p-4 font-black text-emerald-700">{scout.netBalance || 0} نقطة</td>
                        <td className="p-4 text-center">
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

      {/* TAB 3: TEACHERS MANAGEMENT (مع ميزات الحذف الفردي والجماعي) */}
      {activeTab === 'TEACHERS' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="font-bold text-lg text-slate-900">سجل المعلمين والمشرفين ({teachers.length})</h2>
              <button
                onClick={() => setShowAddTeacherModal(true)}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة معلم</span>
              </button>
              {selectedTeacherIds.length > 0 && (
                <button
                  onClick={handleBulkDeleteTeachers}
                  className="px-3.5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm animate-pulse"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف المحدد ({selectedTeacherIds.length})</span>
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
                            setSelectedTeacherIds(teachers.map(t => t.id));
                          } else {
                            setSelectedTeacherIds([]);
                          }
                        }}
                        checked={selectedTeacherIds.length === teachers.length && teachers.length > 0}
                        className="rounded accent-emerald-700"
                      />
                    </th>
                    <th className="p-4 font-bold">اسم المعلم</th>
                    <th className="p-4 font-bold">رقم الترتيب / الوظيفي</th>
                    <th className="p-4 font-bold">المادة</th>
                    <th className="p-4 font-bold text-center">إجراءات القائد</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {teachers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">لا يوجد معلمون مسجلون حالياً</td>
                    </tr>
                  ) : (
                    teachers.map(teacher => (
                      <tr key={teacher.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 text-center">
                          <input
                            type="checkbox"
                            checked={selectedTeacherIds.includes(teacher.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedTeacherIds([...selectedTeacherIds, teacher.id]);
                              } else {
                                setSelectedTeacherIds(selectedTeacherIds.filter(id => id !== teacher.id));
                              }
                            }}
                            className="rounded accent-emerald-700"
                          />
                        </td>
                        <td className="p-4 font-bold text-slate-900">{teacher.fullName}</td>
                        <td className="p-4 text-slate-600 font-mono">{teacher.employeeId}</td>
                        <td className="p-4 text-slate-600">{teacher.subject || 'العلوم العامة'}</td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleDeleteTeacher(teacher.id, teacher.fullName)}
                            className="p-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl transition-all"
                            title="حذف المعلم"
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

      {/* TAB 4: ACTIVITIES & EVENTS (مع ميزة الحذف) */}
      {activeTab === 'ACTIVITIES' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-slate-900">الفعاليات والأنشطة الكشفية الميدانية</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activities.length === 0 ? (
              <div className="col-span-full p-8 bg-white rounded-3xl text-center text-slate-400 text-xs border border-slate-200">
                لا توجد فعاليات مسجلة
              </div>
            ) : (
              activities.map(act => (
                <div key={act.id} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{act.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{act.description}</p>
                    <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md font-bold mt-2 inline-block">
                      {act.date || 'قريباً'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteActivity(act.id)}
                    className="p-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl transition-all shrink-0"
                    title="حذف الفعالية"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modals for Adding */}
      {showAddScoutModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-black text-lg text-slate-900">إضافة كشاف جديد</h3>
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
                <label className="text-xs font-bold text-slate-700 block mb-1">الرقم الشخصي</label>
                <input
                  type="text"
                  required
                  value={newScout.nationalId}
                  onChange={e => setNewScout({ ...newScout, nationalId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">الصف</label>
                <select
                  value={newScout.grade}
                  onChange={e => setNewScout({ ...newScout, grade: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                >
                  <option value="الأول إعدادي">الأول إعدادي</option>
                  <option value="الثاني إعدادي">الثاني إعدادي</option>
                  <option value="الثالث إعدادي">الثالث إعدادي</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold">إضافة الكشاف</button>
                <button type="button" onClick={() => setShowAddScoutModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                <label className="text-xs font-bold text-slate-700 block mb-1">رقم الترتيب / الرقم الوظيفي</label>
                <input
                  type="text"
                  required
                  value={newTeacher.employeeId}
                  onChange={e => setNewTeacher({ ...newTeacher, employeeId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold">إضافة المعلم</button>
                <button type="button" onClick={() => setShowAddTeacherModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
