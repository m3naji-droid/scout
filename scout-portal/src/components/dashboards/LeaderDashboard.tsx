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

  // Search & Filters
  const [scoutSearch, setScoutSearch] = useState('');
  const [scoutGradeFilter, setScoutGradeFilter] = useState('');

  // Modals state
  const [showAddScoutModal, setShowAddScoutModal] = useState(false);
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);

  // Action forms state
  const [newScout, setNewScout] = useState({ fullName: '', nationalId: '', grade: 'الأول إعدادي', section: '1', patrolName: 'طليعة الفاتح', parentName: '', parentPhone: '' });
  const [newTeacher, setNewTeacher] = useState({ fullName: '', employeeId: '', subject: 'العلوم العامة' });
  
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

  // Add Scout Handler
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

  // Direct Excel Bulk Import (الاستيراد المباشر الفوري للـ 127 كشافاً)
  const handleDirectExcelImport = async () => {
    if (!window.confirm("هل تريد استيراد قائمة الكشافين الرسمية بالكامل وتوزيعهم على الصفوف وتفعيل حسابات دخولهم فوراً؟")) return;
    
    try {
      setLoading(true);
      const scoutsToImport = [
        { fullName: "علي شوقي علي الكلالي", nationalId: "120407310", grade: "الأول إعدادي", section: "1" },
        { fullName: "حمزة محمد صبحي محمد عبد العزيز", nationalId: "130815780", grade: "الأول إعدادي", section: "1" },
        { fullName: "محمد عبدالرحمن فايز الرواحي", nationalId: "130912026", grade: "الأول إعدادي", section: "1" },
        { fullName: "فارس مصطفي عبدالعزيز عبدالله", nationalId: "130403679", grade: "الأول إعدادي", section: "1" },
        { fullName: "عمار نادر أحمد رحيمي", nationalId: "121224619", grade: "الأول إعدادي", section: "1" },
        { fullName: "علي عادل عبد الرحيم محمد", nationalId: "120612372", grade: "الأول إعدادي", section: "1" },
        { fullName: "محمد حسين محمد سالم", nationalId: "111127564", grade: "الأول إعدادي", section: "1" },
        { fullName: "سلطان حمد سلطان صالح", nationalId: "130705365", grade: "الأول إعدادي", section: "1" },
        { fullName: "حسين وليد محمد سليم", nationalId: "130517895", grade: "الأول إعدادي", section: "1" },
        { fullName: "خالد سند بشر الرويعي", nationalId: "130502758", grade: "الأول إعدادي", section: "1" },
        { fullName: "البدر سند الرويعي", nationalId: "140816666", grade: "الأول إعدادي", section: "1" },
        { fullName: "خالد رجب عقاب المحميد", nationalId: "120205149", grade: "الأول إعدادي", section: "1" },
        { fullName: "عبدالرحمن عمار مثنى الماطري", nationalId: "121100995", grade: "الأول إعدادي", section: "1" },
        { fullName: "عبد الرحمن ناصر عبدالله البوعينين", nationalId: "120710617", grade: "الأول إعدادي", section: "1" },
        { fullName: "سلمان سالم بحر", nationalId: "130105600", grade: "الأول إعدادي", section: "1" },
        { fullName: "خالد سالم بحر", nationalId: "130105597", grade: "الأول إعدادي", section: "1" },
        { fullName: "أحمد عبدالله صالح طاهر", nationalId: "121010864", grade: "الأول إعدادي", section: "1" },
        { fullName: "حمد توفيق مسعد الظبيع", nationalId: "121206793", grade: "الأول إعدادي", section: "1" },
        { fullName: "عبدالله عمر محمد الرضي", nationalId: "130706043", grade: "الأول إعدادي", section: "1" },
        { fullName: "يوسف أيمن العجمي حسب النبي", nationalId: "121227804", grade: "الأول إعدادي", section: "1" },
        { fullName: "يوسف جاسم يوسف النعيمي", nationalId: "120135337", grade: "الأول إعدادي", section: "1" },
        { fullName: "زياد طاهر عبدالله حسن", nationalId: "120318903", grade: "الأول إعدادي", section: "1" },
        { fullName: "سلطان أحمد سلطان الدوسري", nationalId: "١٣٠٦٠١٨٣٧", grade: "الأول إعدادي", section: "1" },
        { fullName: "عبدالله عامر رضا", nationalId: "١٣٠٣١٢٥٧٧", grade: "الأول إعدادي", section: "1" },
        { fullName: "عهد عهدي أحمد الحصيني", nationalId: "130622761", grade: "الأول إعدادي", section: "1" },
        { fullName: "ناصر وهاب محمد السهو", nationalId: "121016048", grade: "الأول إعدادي", section: "1" },
        { fullName: "اثنيان خليفة مشرف اثنيان", nationalId: "120709325", grade: "الأول إعدادي", section: "1" },
        { fullName: "بندر تيسير حمود فنتوخ", nationalId: "130903752", grade: "الأول إعدادي", section: "1" },
        { fullName: "عيسى وليد عبدالواحد محمد", nationalId: "130303542", grade: "الأول إعدادي", section: "1" },
        { fullName: "معاذ محمد محسن أحمد", nationalId: "120603063", grade: "الأول إعدادي", section: "1" },
        { fullName: "يوسف سلمان يوسف الدوسري", nationalId: "120903652", grade: "الأول إعدادي", section: "1" },
        { fullName: "وضاح بدر محمد ردمان محمد", nationalId: "130616150", grade: "الأول إعدادي", section: "1" },
        { fullName: "حسام محمد السيد المسلماني", nationalId: "130720909", grade: "الأول إعدادي", section: "1" },
        { fullName: "راكان محمد سالم الخلاقي", nationalId: "130524212", grade: "الأول إعدادي", section: "1" },
        { fullName: "جاسم مهران احمد راشد", nationalId: "130707813", grade: "الأول إعدادي", section: "1" },
        { fullName: "احمد مهران احمد راشد", nationalId: "130707791", grade: "الأول إعدادي", section: "1" },
        { fullName: "همام ماهر فتيخ خلف", nationalId: "130807923", grade: "الأول إعدادي", section: "1" },
        { fullName: "خليفة بشار محمد المريسي", nationalId: "120606488", grade: "الأول إعدادي", section: "1" },
        { fullName: "خليفة سامي محمد قاسم علوان", nationalId: "120203758", grade: "الأول إعدادي", section: "1" },
        { fullName: "حمدان هاني محمد الطريمي", nationalId: "120617870", grade: "الأول إعدادي", section: "1" },
        { fullName: "ابراهيم محمد حسين الحردان", nationalId: "130808652", grade: "الأول إعدادي", section: "1" },
        { fullName: "حمد عصام الطيري", nationalId: "110503783", grade: "الأول إعدادي", section: "1" },
        { fullName: "عبد الحمن غازي محسن علي", nationalId: "130402915", grade: "الأول إعدادي", section: "1" },
        { fullName: "نواف سعود عباد المرشد", nationalId: "١٢٠٦١٠٤٠٠", grade: "الأول إعدادي", section: "1" },
        { fullName: "محمد صلاح محمد البرطي", nationalId: "131011693", grade: "الأول إعدادي", section: "1" },
        { fullName: "سلمان صالح خليفة مسعود", nationalId: "150608969", grade: "الأول إعدادي", section: "1" },
        { fullName: "محمد خالد علي العبدالله", nationalId: "140209743", grade: "الأول إعدادي", section: "1" },
        { fullName: "عبدالرقيب قاسم الطيري", nationalId: "140107185", grade: "الأول إعدادي", section: "1" },
        { fullName: "عوض عبدالله", nationalId: "140120181", grade: "الأول إعدادي", section: "1" },
        { fullName: "فيصل نواف محمد جمعه", nationalId: "140309187", grade: "الأول إعدادي", section: "1" },
        { fullName: "محمد نواف محمد جمعه", nationalId: "150516975", grade: "الأول إعدادي", section: "1" },
        { fullName: "يزن عبدالله عبدالواحد الحارثي", nationalId: "131227440", grade: "الأول إعدادي", section: "1" },
        { fullName: "محمد وصي منان", nationalId: "131018701", grade: "الأول إعدادي", section: "1" },
        { fullName: "عبدالله عادل عبدالله الضبيع", nationalId: "140714375", grade: "الأول إعدادي", section: "1" },
        { fullName: "يوسف عمر احمد محمد", nationalId: "131125893", grade: "الأول إعدادي", section: "1" },
        { fullName: "سالم بن عبدالرحمن ين يوسف يوداود", nationalId: "131228439", grade: "الأول إعدادي", section: "1" },
        { fullName: "راشد خليفة راشد بوعشوان", nationalId: "140206060", grade: "الأول إعدادي", section: "1" },
        { fullName: "خليفة  وليد سيف مسعد", nationalId: "130513687", grade: "الأول إعدادي", section: "1" },
        { fullName: "محمد وليد سيف مسعد", nationalId: "141102470", grade: "الأول إعدادي", section: "1" },
        { fullName: "ابراهيم حمد ابراهيم المناصير", nationalId: "140612874", grade: "الأول إعدادي", section: "1" },
        { fullName: "عبدالرحمن أحمد العبدالرحمن", nationalId: "150510047", grade: "الأول إعدادي", section: "1" },
        { fullName: "احمد فواز عيسى احمد الغتم", nationalId: "120907658", grade: "الأول إعدادي", section: "1" },
        { fullName: "عدي صدام حسن قائد الجشوبي", nationalId: "130102377", grade: "الأول إعدادي", section: "1" },
        { fullName: "عبدالله عبدالرحمن بخيت الدوسري", nationalId: "111205824", grade: "الأول إعدادي", section: "1" },
        { fullName: "عبدالعزيز عبدالرحمن بخيت الدوسري", nationalId: "1140701613", grade: "الأول إعدادي", section: "1" },
        { fullName: "راشد حمد عبدالله الدوسري", nationalId: "150112254", grade: "الأول إعدادي", section: "1" },
        { fullName: "عبدالرحمن فؤاد فايد أحمد الحبيش", nationalId: "١٥٠٨٠٧٨٥٦", grade: "الأول إعدادي", section: "1" },
        { fullName: "مشعل خلوف كسار العلي", nationalId: "131004182", grade: "الأول إعدادي", section: "1" },
        { fullName: "يوسف خالد محمد السريري", nationalId: "140310550", grade: "الأول إعدادي", section: "1" },
        { fullName: "موسى فضل سبحان حاجي", nationalId: "131016393", grade: "الأول إعدادي", section: "1" },
        { fullName: "حسن خالد حسن جناحي", nationalId: "131215302", grade: "الأول إعدادي", section: "1" },
        { fullName: "خالد نورالدين عبدالله القشار", nationalId: "140315748", grade: "الأول إعدادي", section: "1" },
        { fullName: "خالداكرم محمد عسكر", nationalId: "١٤٠٤٠٨٤٥٢", grade: "الأول إعدادي", section: "1" },
        { fullName: "عبدالعزيز عبدالرحمن بخيت سالم عبدالله", nationalId: "١٤٠٧٠١٦١٣", grade: "الأول إعدادي", section: "1" },
        { fullName: "محمد علي مسعد البسارة", nationalId: "140501843", grade: "الأول إعدادي", section: "1" },
        { fullName: "عمار علي عبدالله القشار", nationalId: "140801677", grade: "الأول إعدادي", section: "1" },
        { fullName: "عبد العزيز ناصر عبد الله البو عينين", nationalId: "130905178", grade: "الأول إعدادي", section: "1" },
        { fullName: "ناصر امان عثمان عثمان", nationalId: "131020854", grade: "الأول إعدادي", section: "1" },
        { fullName: "سلطان سلمان كيا رحيم", nationalId: "140417087", grade: "الأول إعدادي", section: "1" },
        { fullName: "نواف احمد ناجي الجبلي", nationalId: "130904295", grade: "الأول إعدادي", section: "1" },
        { fullName: "عبدالعزيز جاسم محمد جاسم الراشد آل بن علي", nationalId: "141205091", grade: "الأول إعدادي", section: "1" },
        { fullName: "فهد سامي احمد الكلالي", nationalId: "131004573", grade: "الأول إعدادي", section: "1" },
        { fullName: "علاء الدين محمد احمد عبدالرحمن", nationalId: "١٤٠٥٠٨٩٤٥", grade: "الأول إعدادي", section: "1" },
        { fullName: "نايف محمد جديع علي", nationalId: "140201726", grade: "الأول إعدادي", section: "1" },
        { fullName: "عبدالله ناصر عبدالله سعد البوعينين", nationalId: "141022833", grade: "الأول إعدادي", section: "1" },
        { fullName: "احمد محمد حسن الذوادي", nationalId: "131130544", grade: "الأول إعدادي", section: "1" },
        { fullName: "فهد سامي حسن ادم", nationalId: "131212850", grade: "الأول إعدادي", section: "1" },
        { fullName: "راشد فواز مثنى المريسي", nationalId: "150405464", grade: "الأول إعدادي", section: "1" },
        { fullName: "احمد خليف محمد المواعي", nationalId: "131109375", grade: "الأول إعدادي", section: "1" },
        { fullName: "سلمان فرج مهدي العنزي", nationalId: "141018402", grade: "الأول إعدادي", section: "1" },
        { fullName: "بدر حمود علي سيف", nationalId: "120802783", grade: "الأول إعدادي", section: "1" },
        { fullName: "مهنا خالد مهنا الكبيسي", nationalId: "140908900", grade: "الأول إعدادي", section: "1" },
        { fullName: "سلمان محمد احمد قاسم علي", nationalId: "150523491", grade: "الأول إعدادي", section: "1" },
        { fullName: "ريان ابراهيم احمد عبده", nationalId: "130705918", grade: "الأول إعدادي", section: "1" },
        { fullName: "نايف ياسر علي الضبيع", nationalId: "150505027", grade: "الأول إعدادي", section: "1" },
        { fullName: "عبدالحميد بلوله صديق محمد", nationalId: "111168074", grade: "الأول إعدادي", section: "1" },
        { fullName: "فيصل جاسم سلطان فخرو", nationalId: "120915219", grade: "الأول إعدادي", section: "1" },
        { fullName: "احمد جمعه شلش السهو", nationalId: "١٢٠٣٠٧٠٩٠", grade: "الأول إعدادي", section: "1" },
        { fullName: "محمد قاسم نعمان المهلل", nationalId: "140411062", grade: "الأول إعدادي", section: "1" },
        { fullName: "عبدالله ماجد عواد الدلماز", nationalId: "121109267", grade: "الأول إعدادي", section: "1" },
        { fullName: "سعود أحمد سلطان الدوسري", nationalId: "140701281", grade: "الأول إعدادي", section: "1" },
        { fullName: "خليفة احمد عبدالله الضبيع", nationalId: "140522905", grade: "الأول إعدادي", section: "1" },
        { fullName: "دعيج سلمان محمد سلمان العاثمي", nationalId: "141004339", grade: "الأول إعدادي", section: "1" },
        { fullName: "ناصر بلال ناصر محمد", nationalId: "131009320", grade: "الأول إعدادي", section: "1" },
        { fullName: "حافظ منصور صالح سعد", nationalId: "140805982", grade: "الأول إعدادي", section: "1" },
        { fullName: "عبدالواحد وليد عبدالواحد عبدالله", nationalId: "111204453", grade: "الأول إعدادي", section: "1" },
        { fullName: "حمد سلمان عبيد الظفيري", nationalId: "150211007", grade: "الأول إعدادي", section: "1" },
        { fullName: "ريان محمد دحام نويران", nationalId: "141107782", grade: "الأول إعدادي", section: "1" },
        { fullName: "عبد الكريم سعد راوي الحسن", nationalId: "140604685", grade: "الأول إعدادي", section: "1" },
        { fullName: "محمد صلاح محمد الحلحلي", nationalId: "120818078", grade: "الأول إعدادي", section: "1" },
        { fullName: "محمدعبدالرحمن حمدحسين", nationalId: "140403744", grade: "الأول إعدادي", section: "1" },
        { fullName: "محمد يوسف صالح قاسم", nationalId: "140818561", grade: "الأول إعدادي", section: "1" },
        { fullName: "يوسف عيسى محمد محمود", nationalId: "120706148", grade: "الأول إعدادي", section: "1" },
        { fullName: "غيث حازم أميز الأحمد", nationalId: "140206450", grade: "الأول إعدادي", section: "1" },
        { fullName: "حارث وارث احمد", nationalId: "131139894", grade: "الأول إعدادي", section: "1" },
        { fullName: "طلال قاسم يحى الخلاقي", nationalId: "120204991", grade: "الأول إعدادي", section: "1" },
        { fullName: "غيمان احمد محمد صالح", nationalId: "140904687", grade: "الأول إعدادي", section: "1" },
        { fullName: "محمد ناصر حبيب مصطفي", nationalId: "140116133", grade: "الأول إعدادي", section: "1" },
        { fullName: "دعيج خليفة دعيج العيد", nationalId: "140711481", grade: "الأول إعدادي", section: "1" },
        { fullName: "حمد عبدالغفور سيد نور", nationalId: "140415912", grade: "الأول إعدادي", section: "1" },
        { fullName: "احمد علي الحسن", nationalId: "111051487", grade: "الأول إعدادي", section: "1" },
        { fullName: "عبدالعزيز خالد علي العقبي", nationalId: "130610585", grade: "الأول إعدادي", section: "1" },
        { fullName: "أحمد عبالرحمن عبدالكريم أخوند", nationalId: "120718014", grade: "الأول إعدادي", section: "1" },
        { fullName: "خليفه حسين البكري", nationalId: "140311076", grade: "الأول إعدادي", section: "1" },
        { fullName: "صقر صالح علي الرياشي", nationalId: "140803360", grade: "الأول إعدادي", section: "1" },
        { fullName: "محمد فواز محمد ابوشاره", nationalId: "140213376", grade: "الأول إعدادي", section: "1" },
        { fullName: "علي ياسر الحاج", nationalId: "150120982", grade: "الأول إعدادي", section: "1" }
      ];

      await api.importScoutsBulk(scoutsToImport, { id: user?.id, name: user?.fullName });
      alert("تم استيراد جميع الكشافين (127 كشافاً) بنجاح وتم تفعيل حساباتهم!");
      loadAllLeaderData();
    } catch (err: any) {
      alert("خطأ أثناء الاستيراد: " + err.message);
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

  // Award Badge Handler
  const handleAwardBadgeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetScoutId || !selectedBadgeId) {
      alert('يرجى اختيار الكشاف والشارة المطلوبة');
      return;
    }
    try {
      await api.awardBadgeToScout(targetScoutId, selectedBadgeId, badgeNotes, { id: user?.id, name: user?.fullName });
      setShowBadgeModal(false);
      loadAllLeaderData();
      alert('تم منح الشارة بنجاح');
    } catch (err: any) {
      alert(err.message || 'فشل منح الشارة');
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

  const filteredScouts = scouts.filter(s => {
    const matchesSearch = s.fullName?.includes(scoutSearch) || s.nationalId?.includes(scoutSearch);
    const matchesGrade = !scoutGradeFilter || s.grade === scoutGradeFilter;
    return matchesSearch && matchesGrade;
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
            الصلاحيات الإدارية الكاملة: إضافة الكشافين، الحذف، منح النقاط، والشارات بكفاءة تامة عبر فايربيس
          </p>
        </div>

        {/* Quick Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDirectExcelImport}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-950" />
            <span>استيراد 127 كشافاً (دفعة واحدة)</span>
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
          { key: 'SCOUTS', label: 'إدارة الكشافين', icon: <Users className="w-3.5 h-3.5" />, badge: scouts.length },
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

      {/* SCOUTS MANAGEMENT TAB */}
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
                <span>إضافة كشاف فردي</span>
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
                  placeholder="بحث بالاسم أو الرقم..."
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
                    <th className="p-4 font-bold">الرقم الشخصي (كلمة السر)</th>
                    <th className="p-4 font-bold">الصف / الشعبة</th>
                    <th className="p-4 font-bold">الرصيد</th>
                    <th className="p-4 font-bold text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredScouts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">لا توجد نتائج مسجلة. اضغط على "استيراد 127 كشافاً" لإضافتهم فوراً.</td>
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
                        <td className="p-4 text-slate-600">{scout.grade} - شعبة {scout.section || '1'}</td>
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

      {/* POINTS & BADGES ASSIGNMENT TAB */}
      {activeTab === 'POINTS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
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
                    <option key={s.id} value={s.id}>{s.fullName} ({s.grade})</option>
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

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span>منح شارة كشفية</span>
            </h3>
            <form onSubmit={handleAwardBadgeSubmit} className="space-y-3">
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
                    <option key={s.id} value={s.id}>{s.fullName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">اختر الشارة</label>
                <select
                  value={selectedBadgeId}
                  onChange={e => setSelectedBadgeId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-white font-semibold"
                  required
                >
                  <option value="">-- اختر الشارة --</option>
                  {badges.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">ملاحظات التكريم</label>
                <input
                  type="text"
                  value={badgeNotes}
                  onChange={e => setBadgeNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                />
              </div>
              <button type="submit" className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md">
                منح الشارة وتثبيتها
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Scout Modal */}
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
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">الشعبة</label>
                <input
                  type="text"
                  value={newScout.section}
                  onChange={e => setNewScout({ ...newScout, section: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                />
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
