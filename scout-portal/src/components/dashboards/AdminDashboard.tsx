import React, { useState, useEffect } from 'react';
import { 
  School, Users, Award, Shield, AlertTriangle, 
  BarChart3, CheckCircle2, FileText, Send, Eye, Calendar, Sparkles 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [suspensions, setSuspensions] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Supervisory Note Form
  const [supervisoryNote, setSupervisoryNote] = useState('');
  const [noteSuccess, setNoteSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const sum = await api.getReportsSummary();
      setSummary(sum);

      const susp = await api.getSuspensions();
      setSuspensions(susp);

      const reps = await api.getIncidentReports();
      setReports(reps);

      const logs = await api.getAuditLogs();
      setAuditLogs(logs.slice(0, 8));
    } catch (err) {
      console.error('Failed loading admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendSupervisoryNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supervisoryNote.trim() || !user) return;
    try {
      await api.submitIncidentReport(
        {
          title: 'توجيه إشرافي من الإدارة المدرسية',
          category: 'عام',
          severity: 'عادي',
          description: supervisoryNote
        },
        { id: user.id, name: user.fullName, role: user.role }
      );
      setNoteSuccess(true);
      setSupervisoryNote('');
      loadData();
      setTimeout(() => setNoteSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Admin Supervisory Header */}
      <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
            <School className="w-4 h-4" />
            <span>لوحة الإدارة المدرسية الإشرافية</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            إدارة مدرسة أحمد الفاتح الإعدادية للبنين
          </h1>
          <p className="text-xs sm:text-sm text-amber-200">
            متابعة مؤشرات أداء الفرقة الكشفية، توزيع النقاط، ومعدلات الانضباط والسلوك الطلابي
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-xs font-bold text-amber-200">
          الصفة: متابعة إشرافية ورقابية
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500">إجمالي الكشافين النشطين</span>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 my-2">
            {summary?.activeScouts || 0}
          </div>
          <span className="text-[10px] text-slate-400 font-semibold">
            من إجمالي {summary?.totalScouts || 0} مسجل
          </span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500">النقاط الإيجابية المعتمدة</span>
          <div className="text-3xl sm:text-4xl font-black text-emerald-700 my-2">
            +{summary?.totalPositive || 0}
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold">
            سلوك إيجابي ومبادرات متميزة
          </span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500">الخصومات السلوكية</span>
          <div className="text-3xl sm:text-4xl font-black text-red-600 my-2">
            -{summary?.totalDeductions || 0}
          </div>
          <span className="text-[10px] text-red-600 font-semibold">
            مخالفات مسجلة ومعتمدة
          </span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500">الرصيد التراكمي العام</span>
          <div className="text-3xl sm:text-4xl font-black text-blue-700 my-2">
            {summary?.netBalanceAll || 0}
          </div>
          <span className="text-[10px] text-blue-600 font-semibold">
            صافي نقاط جميع الطليعات
          </span>
        </div>
      </div>

      {/* Grade Breakdown & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-base sm:text-lg text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-700" />
              <span>توزيع الأداء والنقاط حسب الصفوف الدراسية</span>
            </h3>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full">
              المرحلة الإعدادية
            </span>
          </div>

          <div className="space-y-4">
            {summary?.gradeBreakdown && Object.entries(summary.gradeBreakdown).map(([gradeName, data]: [string, any]) => (
              <div key={gradeName} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">{gradeName}</span>
                  <span className="text-xs font-semibold text-slate-500">{data.count} كشاف</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-200/60">
                  <div className="bg-white p-2 rounded-xl border border-slate-100">
                    <div className="text-xs text-slate-400 font-bold">النقاط الإيجابية</div>
                    <div className="text-sm font-black text-emerald-700">+{data.positive}</div>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-100">
                    <div className="text-xs text-slate-400 font-bold">الخصومات</div>
                    <div className="text-sm font-black text-red-600">-{data.deductions}</div>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-100">
                    <div className="text-xs text-slate-400 font-bold">الرصيد الصافي</div>
                    <div className="text-sm font-black text-blue-700">{data.totalPoints}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Top positive behaviors */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="font-bold text-xs text-slate-700 mb-3">أكثر السلوكيات الإيجابية تسجيلاً:</h4>
            <div className="flex flex-wrap gap-2">
              {summary?.topBehaviors?.map((b: any) => (
                <span key={b.name} className="px-3 py-1 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{b.name} ({b.count})</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Supervisory Feedback & Audit */}
        <div className="space-y-6">
          {/* Supervisory Note Form */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <FileText className="w-5 h-5 text-amber-700" />
              <h3 className="font-bold text-base text-slate-900">إضافة توجيه إشرافي للفرقة</h3>
            </div>

            <form onSubmit={handleSendSupervisoryNote} className="space-y-3">
              <textarea
                value={supervisoryNote}
                onChange={e => setSupervisoryNote(e.target.value)}
                rows={4}
                required
                placeholder="اكتب ملاحظة أو توجيه إداري لقادة الفرقة..."
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-600"
              ></textarea>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-800 hover:bg-amber-900 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>إرسال التوجيه الإشرافي</span>
              </button>

              {noteSuccess && (
                <div className="p-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-[11px] font-bold text-center">
                  تم إرسال التوجيه بنجاح لقيادة الفرقة.
                </div>
              )}
            </form>
          </div>

          {/* Audit Trail Snapshot */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-700" />
                <span>مقتطف من سجل التدقيق</span>
              </h3>
              <span className="text-[10px] text-slate-400">سجل غير قابل للتعديل</span>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {auditLogs.map(log => (
                <div key={log.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] space-y-0.5">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span>{log.action}</span>
                    <span className="text-[9px] text-slate-400">{new Date(log.timestamp).toLocaleTimeString('ar-BH')}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-1">{log.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
