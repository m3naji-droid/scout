import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Award, Calendar, CheckCircle2, AlertTriangle, 
  Upload, Clock, FileText, Heart, Shield, Printer, Check, Info 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ScoutProfile, PointEvaluation, AwardedBadge, Certificate, TroopActivity, ParentEncouragement } from '../../types';
import { api } from '../../lib/api';

interface ScoutDashboardProps {
  onOpenCertificate: (cert: Certificate) => void;
}

export const ScoutDashboard: React.FC<ScoutDashboardProps> = ({ onOpenCertificate }) => {
  const { user, scoutProfile, refreshUser } = useAuth();
  const [scout, setScout] = useState<ScoutProfile | null>(scoutProfile);
  const [evaluations, setEvaluations] = useState<PointEvaluation[]>([]);
  const [badges, setBadges] = useState<AwardedBadge[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [activities, setActivities] = useState<TroopActivity[]>([]);
  const [parentEncouragements, setParentEncouragements] = useState<ParentEncouragement[]>([]);
  const [loading, setLoading] = useState(true);

  // Photo Upload Modal state
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ text: string; error: boolean } | null>(null);

  useEffect(() => {
    if (scoutProfile?.id) {
      loadScoutDetails(scoutProfile.id);
    }
  }, [scoutProfile]);

  const loadScoutDetails = async (id: string) => {
    try {
      setLoading(true);
      const data = await api.getScoutDetails(id);
      if (data) {
        setScout(data.scout || null);
        setEvaluations(data.evaluations || []);
        setBadges(data.badges || []);
        setCertificates(data.certificates || []);
      }
      
      const allActs = await api.getActivities();
      setActivities(allActs || []);

      const parentMsgs = await api.getParentEncouragements(id);
      setParentEncouragements(parentMsgs || []);
    } catch (err) {
      console.error('Failed loading scout details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadMessage({ text: 'يرجى اختيار ملف صورة صالح (JPEG أو PNG)', error: true });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadMessage({ text: 'حجم الصورة يجب ألا يتجاوز 5 ميغابايت', error: true });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result as string);
      setUploadMessage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = async () => {
    if (!previewImage || !scout) return;
    try {
      setUploadLoading(true);
      const res = await api.uploadScoutAvatar(scout.id, previewImage);
      setUploadMessage({ text: res?.message || 'تم إرسال الصورة بنجاح وتنتظر اعتماد القائد', error: false });
      await refreshUser();
      if (scout) loadScoutDetails(scout.id);
      setTimeout(() => setShowPhotoModal(false), 2000);
    } catch (err: any) {
      setUploadMessage({ text: err.message || 'فشل رفع الصورة', error: true });
    } finally {
      setUploadLoading(false);
    }
  };

  const approvedEvals = evaluations.filter(e => e.status === 'APPROVED');
  const pendingEvals = evaluations.filter(e => e.status === 'PENDING');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Scout Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-right">
            {/* Scout Avatar with Review Status */}
            <div className="relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl border-4 border-amber-400/80 p-1 bg-white/10 overflow-hidden shadow-2xl flex items-center justify-center">
                {scout?.avatarUrl && scout.avatarStatus === 'APPROVED' ? (
                  <img src={scout.avatarUrl} alt={scout?.fullName || 'كشاف'} className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  <div className="text-3xl font-black text-amber-300">
                    {scout?.fullName ? scout.fullName.charAt(0) : 'ك'}
                  </div>
                )}
              </div>

              {/* Status Badge */}
              <div className="absolute -bottom-2 -right-2">
                {scout?.avatarStatus === 'APPROVED' ? (
                  <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white shadow-xs flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> معتمدة
                  </span>
                ) : scout?.avatarStatus === 'PENDING' ? (
                  <span className="bg-amber-500 text-amber-950 text-[10px] font-bold px-2 py-0.5 rounded-full border border-white shadow-xs flex items-center gap-0.5">
                    <Clock className="w-3 h-3" /> قيد المراجعة
                  </span>
                ) : (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white shadow-xs flex items-center gap-0.5">
                    مرفوضة
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-bold text-amber-300">
                <Shield className="w-4 h-4" />
                <span>{scout?.patrolName || 'طليعة الفاتح'} • {scout?.grade || 'الإعدادية'} ({scout?.section || 'متوسط'})</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black">{scout?.fullName || 'الكشاف'}</h1>
              <p className="text-xs text-emerald-200">
                الرقم الشخصي: {scout?.nationalId || 'غير متوفر'} • سنة التسجيل: {scout?.registrationYear || '2026'}
              </p>
            </div>
          </div>

          {/* Action to update photo */}
          <button
            onClick={() => {
              setPreviewImage(null);
              setUploadMessage(null);
              setShowPhotoModal(true);
            }}
            className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-500 text-emerald-950 font-bold text-xs sm:text-sm shadow-lg flex items-center gap-2 transition-all shrink-0"
          >
            <Upload className="w-4 h-4" />
            <span>رفع الصورة الشخصية الرسمية</span>
          </button>
        </div>

        {/* If Photo Rejected, show reason clearly */}
        {scout?.avatarStatus === 'REJECTED' && (
          <div className="mt-4 p-3 bg-red-900/80 border border-red-400/50 rounded-2xl text-xs text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-300 shrink-0" />
            <span>
              سبب رفض الصورة السابقة: {scout.avatarRejectionReason || 'يرجى ارتداء البدلة الكشفية الرسمية الكاملة وأن تكون الصورة واضحة'}. يمكنك رفع صورة جديدة الآن.
            </span>
          </div>
        )}
      </div>

      {/* Points & Stats Dashboard Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Balance Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-500">الرصيد النهائي المعتمد</span>
          <div className="text-3xl sm:text-4xl font-black text-emerald-800 my-2">
            {scout?.netBalance || 0}
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold">
            صافي النقاط بعد حسم الخصومات
          </span>
        </div>

        {/* Total Positive Points */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-500">النقاط الإيجابية المعتمدة</span>
          <div className="text-3xl sm:text-4xl font-black text-blue-700 my-2">
            +{scout?.totalPositivePoints || 0}
          </div>
          <span className="text-[10px] text-blue-600 font-semibold">
            {approvedEvals.filter(e => e.type === 'POSITIVE').length} تقييم إيجابي معتمد
          </span>
        </div>

        {/* Total Deductions */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-500">مجموع الخصومات المعتمدة</span>
          <div className="text-3xl sm:text-4xl font-black text-red-600 my-2">
            -{scout?.totalDeductions || 0}
          </div>
          <span className="text-[10px] text-red-600 font-semibold">
            {approvedEvals.filter(e => e.type === 'DEDUCTION').length} مخالفة معتمدة
          </span>
        </div>

        {/* Badges & Activities */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-500">الشارات والفعاليات</span>
          <div className="flex items-center gap-3 my-2">
            <div>
              <span className="text-3xl sm:text-4xl font-black text-amber-600">{badges.length}</span>
              <span className="text-[10px] text-slate-400 block font-bold">شارات</span>
            </div>
            <div className="h-8 w-px bg-slate-200"></div>
            <div>
              <span className="text-3xl sm:text-4xl font-black text-purple-700">{scout?.activitiesAttendedCount || 0}</span>
              <span className="text-[10px] text-slate-400 block font-bold">فعاليات</span>
            </div>
          </div>
          <span className="text-[10px] text-amber-700 font-semibold">
            إنجاز كشفي ميداني
          </span>
        </div>
      </div>

      {/* Main Grid: Left Timeline & Right Badges/Certs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Behavior & Feedback Timeline (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pending Reviews Notice if any */}
          {pendingEvals.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-700" />
                <span className="text-xs font-bold text-amber-900">
                  لديك ({pendingEvals.length}) تقييمات جديدة بانتظار مراجعة القائد (لا تؤثر بالرصيد إلا بعد الاعتماد).
                </span>
              </div>
            </div>
          )}

          {/* Parent Encouragement Section */}
          {parentEncouragements.length > 0 && (
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-purple-200 rounded-3xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-purple-900 font-bold text-sm">
                <Heart className="w-4 h-4 text-pink-600 fill-pink-500" />
                <span>رسائل تشجيع من ولي أمرك</span>
              </div>
              {parentEncouragements.map(msg => (
                <div key={msg.id} className="p-3 bg-white rounded-2xl border border-purple-100 text-xs text-purple-950 shadow-xs">
                  <p className="font-semibold text-slate-800">«{msg.message}»</p>
                  <span className="text-[10px] text-purple-600 mt-1 block">
                    — {msg.parentName} • {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString('ar-BH') : ''}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Behavior Evaluation History */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-bold text-base sm:text-lg text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-700" />
                <span>سجل النقاط والتقييمات المعتمدة</span>
              </h2>
              <span className="text-xs text-slate-400">مرتبة من الأحدث</span>
            </div>

            <div className="space-y-3">
              {evaluations.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  لم يتم رصد تقييمات حتى الآن
                </div>
              ) : (
                evaluations.map(ev => (
                  <div
                    key={ev.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      ev.status === 'PENDING'
                        ? 'bg-amber-50/50 border-amber-200'
                        : ev.type === 'POSITIVE'
                        ? 'bg-emerald-50/40 border-emerald-100'
                        : 'bg-red-50/40 border-red-100'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                            ev.type === 'POSITIVE' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                          }`}>
                            {ev.type === 'POSITIVE' ? `+${ev.points}` : `-${ev.points}`}
                          </span>
                          <span className="font-bold text-sm text-slate-900">{ev.behaviorCategory}</span>
                        </div>

                        {ev.notes && (
                          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                            {ev.notes}
                          </p>
                        )}

                        {ev.encouragementMessage && (
                          <p className="text-xs font-semibold text-emerald-800 mt-1.5 flex items-center gap-1">
                            <span>«{ev.encouragementMessage}»</span>
                          </p>
                        )}

                        <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-2">
                          <span>المقيم: {ev.evaluatorName}</span>
                          <span>•</span>
                          <span>{ev.createdAt ? new Date(ev.createdAt).toLocaleDateString('ar-BH') : ''}</span>
                        </div>
                      </div>

                      {/* Approval Status Badge */}
                      <div>
                        {ev.status === 'APPROVED' ? (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                            معتمد
                          </span>
                        ) : ev.status === 'PENDING' ? (
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                            قيد المراجعة
                          </span>
                        ) : ev.status === 'CORRECTED' ? (
                          <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
                            تم التصحيح
                          </span>
                        ) : (
                          <span className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-bold">
                            مرفوض
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Badges & Certificates */}
        <div className="space-y-6">
          {/* Earned Badges Showcase */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-600" />
                <span>الشارات والأوسمة المكتسبة</span>
              </h3>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                {badges.length}
              </span>
            </div>

            <div className="space-y-3">
              {badges.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs">
                  واصل التألق للحصول على أول شارة كشفية!
                </div>
              ) : (
                badges.map(b => (
                  <div key={b.id} className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                      <Award className="w-6 h-6 fill-amber-200" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-amber-950">{b.badgeTitle}</h4>
                      <p className="text-[10px] text-amber-800 line-clamp-1">{b.notes || b.badgeCategory}</p>
                      <span className="text-[9px] text-slate-400 block mt-0.5">
                        {b.awardedAt ? new Date(b.awardedAt).toLocaleDateString('ar-BH') : ''}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Certificates Showcase */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-700" />
                <span>شهادات التقدير المعتمدة</span>
              </h3>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                {certificates.length}
              </span>
            </div>

            <div className="space-y-2">
              {certificates.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs">
                  لا توجد شهادات مسجلة حالياً
                </div>
              ) : (
                certificates.map(cert => (
                  <div key={cert.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{cert.title}</h4>
                      <p className="text-[10px] text-slate-500">{cert.certificateNumber}</p>
                    </div>
                    <button
                      onClick={() => onOpenCertificate(cert)}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-[11px] font-bold flex items-center gap-1 shadow-xs transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>معاينة وطباعة</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PHOTO UPLOAD MODAL */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-700" />
                رفع الصورة الشخصية الرسمية للكشاف
              </h3>
              <button onClick={() => setShowPhotoModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="p-4 bg-emerald-50 border-r-4 border-emerald-600 rounded-2xl text-xs text-emerald-950 space-y-2 leading-relaxed">
              <p className="font-bold flex items-center gap-1.5 text-emerald-900">
                <Info className="w-4 h-4 text-emerald-700" />
                تعليمات رفع الصورة الشخصية المعتمدة:
              </p>
              <p className="font-semibold text-slate-800 bg-white p-3 rounded-xl border border-emerald-200">
                «يرجى رفع صورة شخصية واضحة وحديثة للكشاف مرتديًا بدلة الكشافة الرسمية المعتمدة. يجب أن تكون الصورة مناسبة للاستخدام المدرسي والكشفي. لن تظهر الصورة في الموقع قبل مراجعتها واعتمادها من القائد.»
              </p>
            </div>

            {uploadMessage && (
              <div className={`p-3 rounded-xl text-xs font-bold ${
                uploadMessage.error ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}>
                {uploadMessage.text}
              </div>
            )}

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">اختر صورة واضحة من جهازك</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-xs text-slate-500 file:mr-0 file:ml-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-700 file:text-white hover:file:bg-emerald-800 cursor-pointer"
              />

              {previewImage && (
                <div className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 mb-2 font-bold">معاينة الصورة قبل الإرسال:</span>
                  <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-md">
                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleUploadSubmit}
                disabled={!previewImage || uploadLoading}
                flex-1 py-3 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-md transition-colors
              >
                {uploadLoading ? 'جارٍ الرفع...' : 'إرسال الصورة للاعتماد'}
              </button>
              <button
                type="button"
                onClick={() => setShowPhotoModal(false)}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
